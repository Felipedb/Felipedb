#!/usr/bin/env node
// Sintetizador offline dos efeitos sonoros v2 do BíbliaLearn (docs/SFX_SPEC.md).
//
// Lê tools/sfx/sounds.json (fonte da verdade das receitas), renderiza cada variante a 44 100 Hz em
// float32 (osciladores, FM, ruído filtrado, envelopes ADSR, glide, biquads, delay, reverb, soft clip),
// pós-processa com ffmpeg (corte de silêncio a -60 dB com rampas de 2 ms, ganho medido por ebur128 até
// o alvo de loudness de cada som, pico real limitado a -1 dBTP) e grava audio/sfx/src/<variante>.wav
// (PCM 16 bits mono). Node puro, sem dependências; só precisa de ffmpeg no PATH. Saída determinística.
//
// Uso (a partir de biblelingo/):
//   node tools/gen-sfx.mjs                     todos os sons
//   node tools/gen-sfx.mjs --only=tap,correct  só esses (nome base ou nome da variante)
//   node tools/gen-sfx.mjs --out=/tmp/sfx      outra pasta de saída (padrão audio/sfx/src)
//   node tools/gen-sfx.mjs --pics=/tmp/pics    também grava espectrograma e forma de onda de cada som
//   node tools/gen-sfx.mjs --raw               só a síntese (float32 sem pós-processamento, numa pasta temporária)
//   node tools/gen-sfx.mjs --sprite            em seguida monta o sprite (tools/build-sfx-sprite.mjs)
//
// Relatório de métricas (duração, LUFS, pico real, DC) em audio/sfx/report.json.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(HERE, "..");
export const SOUNDS_JSON = path.join(ROOT, "tools/sfx/sounds.json");
export const SFX_DIR = path.join(ROOT, "audio/sfx");
export const SRC_DIR = path.join(SFX_DIR, "src");
export const REPORT_JSON = path.join(SFX_DIR, "report.json");

export const SR = 44100;
const TAU = Math.PI * 2;
const EDGE_DB = -60;          // limiar do corte de silêncio nas pontas (dBFS)
const EDGE_FADE_S = 0.002;    // rampa nas bordas depois do corte
const TP_MAX = -1.0;          // pico real máximo (dBTP)
const MAX_LIMIT_DB = 3;       // quanto o limitador pode segurar, no máximo, para chegar ao alvo

// ---------------------------------------------------------------------------------------------
// Notas e utilidades
// ---------------------------------------------------------------------------------------------

const PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

/** Frequência de uma nota em notação científica (A4 = 440 Hz, C4 = 261,63 Hz). */
export function noteHz(name) {
  const m = /^([A-G])([#b]?)(-?\d+)$/.exec(String(name).trim());
  if (!m) throw new Error(`nota inválida: ${name}`);
  const pc = PC[m[1]] + (m[2] === "#" ? 1 : m[2] === "b" ? -1 : 0);
  const midi = 12 * (Number(m[3]) + 1) + pc;
  return 440 * Math.pow(2, (midi - 69) / 12);
}

const dbToLin = (db) => Math.pow(10, db / 20);
const linToDb = (x) => (x > 0 ? 20 * Math.log10(x) : -Infinity);
const msToS = (ms) => Math.max(0, Math.round((ms || 0) * SR / 1000));

/** Gerador xorshift32 determinístico em [-1, 1). */
function rng(seed) {
  let x = (Math.imul((seed | 0) + 0x9e3779b9, 2654435761) >>> 0) || 1;
  for (let i = 0; i < 8; i++) { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; }
  return () => {
    x ^= x << 13; x >>>= 0;
    x ^= x >>> 17;
    x ^= x << 5; x >>>= 0;
    return (x / 4294967296) * 2 - 1;
  };
}

// ---------------------------------------------------------------------------------------------
// Filtros
// ---------------------------------------------------------------------------------------------

/** Coeficientes RBJ (cookbook) normalizados por a0. bandpass com ganho de pico 0 dB. */
function biquadCoefs(type, fc, q) {
  const f = Math.min(Math.max(fc, 10), SR * 0.45);
  const w = TAU * f / SR;
  const cw = Math.cos(w), sw = Math.sin(w);
  const alpha = sw / (2 * Math.max(q || 0.7071, 0.05));
  let b0, b1, b2;
  const a0 = 1 + alpha, a1 = -2 * cw, a2 = 1 - alpha;
  if (type === "lowpass") { b0 = (1 - cw) / 2; b1 = 1 - cw; b2 = (1 - cw) / 2; }
  else if (type === "highpass") { b0 = (1 + cw) / 2; b1 = -(1 + cw); b2 = (1 + cw) / 2; }
  else if (type === "bandpass") { b0 = alpha; b1 = 0; b2 = -alpha; }
  else throw new Error(`filtro desconhecido: ${type}`);
  return [b0 / a0, b1 / a0, b2 / a0, a1 / a0, a2 / a0];
}

/** Biquad em forma direta transposta II, no lugar; varredura exponencial opcional do corte. */
function applyBiquad(buf, { type, cutoff, q = 0.7071, sweepTo, sweepMs }) {
  let c = biquadCoefs(type, cutoff, q);
  let z1 = 0, z2 = 0;
  const sweepN = sweepTo && sweepMs ? msToS(sweepMs) : 0;
  for (let n = 0; n < buf.length; n++) {
    if (sweepN && (n & 7) === 0 && n <= sweepN + 8) {
      const t = Math.min(n / sweepN, 1);
      c = biquadCoefs(type, cutoff * Math.pow(sweepTo / cutoff, t), q);
    }
    const x = buf[n];
    const y = c[0] * x + z1;
    z1 = c[1] * x - c[3] * y + z2;
    z2 = c[2] * x - c[4] * y;
    buf[n] = y;
  }
  return buf;
}

/** Delay com realimentação: saída = seco + mix x ecos (o primeiro eco tem ganho 1, depois feedback^k). */
function applyDelay(buf, { ms, feedback = 0.3, mix = 0.3 }) {
  const D = Math.max(1, msToS(ms));
  const y = new Float32Array(buf.length);
  for (let n = 0; n < buf.length; n++) y[n] = buf[n] + (n >= D ? feedback * y[n - D] : 0);
  const out = new Float32Array(buf.length);
  for (let n = 0; n < buf.length; n++) out[n] = buf[n] + (n >= D ? mix * y[n - D] : 0);
  return out;
}

/** Reverb curto de Schroeder (estilo Freeverb, mono): 4 combs com amortecimento + 2 all-pass. */
function applyReverb(buf, { ms = 350, mix = 0.12 }) {
  const combs = [1116, 1188, 1277, 1356];
  const allps = [556, 441];
  const damp = 0.3;
  const wet = new Float32Array(buf.length);
  for (const D of combs) {
    const g = Math.pow(10, (-3 * D) / (SR * ms / 1000)); // RT60 = ms
    const line = new Float32Array(D);
    let idx = 0, lp = 0;
    for (let n = 0; n < buf.length; n++) {
      const out = line[idx];
      lp = out * (1 - damp) + lp * damp;
      line[idx] = buf[n] + lp * g;
      idx = (idx + 1) % D;
      wet[n] += out * 0.25;
    }
  }
  for (const D of allps) {
    const line = new Float32Array(D);
    let idx = 0;
    for (let n = 0; n < buf.length; n++) {
      const bo = line[idx];
      const x = wet[n];
      line[idx] = x + bo * 0.5;
      wet[n] = bo - x * 0.5;
      idx = (idx + 1) % D;
    }
  }
  const out = new Float32Array(buf.length);
  for (let n = 0; n < buf.length; n++) out[n] = buf[n] + mix * wet[n];
  return out;
}

// ---------------------------------------------------------------------------------------------
// Envelope
// ---------------------------------------------------------------------------------------------

const DECAY_FLOOR = 0.03; // o decaimento chega a -30 dB do pico no fim de `d` (curva exponencial natural)
const REL_K = 3;          // a liberação faz 3 constantes de tempo e chega a zero exato no fim de `r`

/**
 * ADSR em ms: ataque linear até 1; decaimento exponencial em direção a `s` (fica a -30 dB do caminho no
 * fim de `d` e continua durante `hold`); liberação exponencial que termina em zero exato no fim de `r`.
 * Duração total = a + d + hold + r.
 */
function envelope({ a = 1, d = 50, s = 0, r = 10, hold = 0 }) {
  const A = msToS(a), Dn = msToS(d), H = msToS(hold), R = msToS(r);
  const N = A + Dn + H + R;
  const env = new Float32Array(N);
  const kd = Math.log(1 / DECAY_FLOOR) / Math.max(Dn, 1);
  for (let n = 0; n < A; n++) env[n] = (n + 1) / A;
  let level = 1;
  for (let n = 0; n < Dn + H; n++) {
    level = s + (1 - s) * Math.exp(-kd * n);
    env[A + n] = level;
  }
  const L = Dn + H > 0 ? level : 1;
  const e1 = Math.exp(-REL_K);
  for (let n = 0; n < R; n++) {
    const t = (n + 1) / R;
    env[A + Dn + H + n] = L * (Math.exp(-REL_K * t) - e1) / (1 - e1);
  }
  return env;
}

// ---------------------------------------------------------------------------------------------
// Osciladores
// ---------------------------------------------------------------------------------------------

const AA_FULL = 11000;  // parciais até aqui com amplitude cheia
const AA_STOP = 15000;  // e nenhum acima daqui (nada de aliasing acima de 16 kHz)

/** Soma aditiva de parciais com limite de banda: saw, square e triangle sem aliasing. */
function bandlimited(type, theta, f) {
  const kmax = Math.floor(AA_STOP / Math.max(f, 1));
  if (kmax < 1) return 0;
  const c2 = 2 * Math.cos(theta);
  let sPrev = 0, s = Math.sin(theta); // sin(0), sin(theta)
  let acc = 0;
  for (let k = 1; k <= kmax; k++) {
    const fk = k * f;
    let w = 1;
    if (fk > AA_FULL) { const u = (fk - AA_FULL) / (AA_STOP - AA_FULL); w = Math.cos(u * Math.PI / 2) ** 2; }
    if (type === "saw") acc += (k & 1 ? 1 : -1) * w * s / k;
    else if (k & 1) {
      if (type === "square") acc += w * s / k;
      else acc += (((k - 1) >> 1) & 1 ? -1 : 1) * w * s / (k * k); // triangle
    }
    const sNext = c2 * s - sPrev;
    sPrev = s; s = sNext;
  }
  if (type === "saw") return acc * (2 / Math.PI);
  if (type === "square") return acc * (4 / Math.PI);
  return acc * (8 / (Math.PI * Math.PI));
}

/** Curva de frequência por amostra (Hz) com glide exponencial ou linear. */
function freqCurve(N, f0, f1, glideN, curve) {
  const fr = new Float64Array(N);
  for (let n = 0; n < N; n++) {
    if (!glideN || f1 == null || n >= glideN) fr[n] = glideN && f1 != null ? f1 : f0;
    else {
      const t = n / glideN;
      fr[n] = curve === "lin" ? f0 + (f1 - f0) * t : f0 * Math.pow(f1 / f0, t);
    }
  }
  return fr;
}

function layerFreqs(layer, mul) {
  const ratio = layer.ratio ?? 1;
  const det = Math.pow(2, (layer.detune || 0) / 1200);
  const base = layer.note != null ? noteHz(layer.note) : layer.freqHz;
  if (base == null) throw new Error("camada tonal sem note nem freqHz");
  const f0 = base * ratio * det * mul;
  let f1 = null;
  if (layer.glide) {
    const g = layer.glide;
    const to = g.to != null ? noteHz(g.to) : g.toHz;
    if (to != null) f1 = to * ratio * det * mul;
  }
  return { f0, f1 };
}

function oscillate(type, fr, phase0 = 0, fmCfg = null) {
  const N = fr.length;
  const out = new Float32Array(N);
  let ph = phase0;
  if (type === "fm") {
    let pm = 0;
    const kI = fmCfg.indexDecayMs ? 1 / msToS(fmCfg.indexDecayMs) : 0;
    for (let n = 0; n < N; n++) {
      const I = fmCfg.index * Math.exp(-kI * n);
      out[n] = Math.sin(TAU * ph + I * Math.sin(TAU * pm));
      ph += fr[n] / SR; ph -= Math.floor(ph);
      pm += (fr[n] * fmCfg.ratio) / SR; pm -= Math.floor(pm);
    }
    return out;
  }
  for (let n = 0; n < N; n++) {
    const th = TAU * ph;
    if (type === "sine") out[n] = Math.sin(th);
    else out[n] = bandlimited(type, th, fr[n]);
    ph += fr[n] / SR; ph -= Math.floor(ph);
  }
  return out;
}

function noiseSource(N, { color = "white", seed = 1 }) {
  const rnd = rng(seed);
  const out = new Float32Array(N);
  if (color === "white") { for (let n = 0; n < N; n++) out[n] = rnd(); return out; }
  if (color === "pink") {
    // Paul Kellet (versão refinada), ganho aproximado para pico perto de 1
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let n = 0; n < N; n++) {
      const w = rnd();
      b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759;
      b2 = 0.969 * b2 + w * 0.153852; b3 = 0.8665 * b3 + w * 0.3104856;
      b4 = 0.55 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.016898;
      out[n] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
      b6 = w * 0.115926;
    }
    return out;
  }
  if (color === "brown") {
    let b = 0;
    for (let n = 0; n < N; n++) { b = (b + 0.02 * rnd()) / 1.02; out[n] = b * 3.5; }
    return out;
  }
  throw new Error(`cor de ruído desconhecida: ${color}`);
}

// ---------------------------------------------------------------------------------------------
// Camadas e som completo
// ---------------------------------------------------------------------------------------------

/** Renderiza uma camada: oscilador ou ruído, envelope, soft clip, filtro, delay e ganho. */
function renderLayer(layer, { mul = 1, seedOffset = 0 }) {
  const env = envelope(layer.adsr || {});
  const N = env.length;
  const delayTail = layer.delay
    ? msToS(layer.delay.ms) * Math.ceil(Math.log(0.001 / Math.max(layer.delay.mix, 1e-3)) / Math.log(Math.max(layer.delay.feedback, 0.01)) + 1)
    : 0;
  const tail = msToS(layer.filter ? 25 : 0) + delayTail;
  let buf = new Float32Array(N + tail);

  if (layer.type === "noise") {
    const src = noiseSource(N, { ...(layer.noise || {}), seed: ((layer.noise && layer.noise.seed) || 1) + seedOffset });
    for (let n = 0; n < N; n++) buf[n] = src[n] * env[n];
  } else {
    const { f0, f1 } = layerFreqs(layer, mul);
    const glideN = layer.glide ? msToS(layer.glide.ms) : 0;
    const curve = layer.glide && layer.glide.curve;
    const voices = layer.unison && layer.unison.voices > 1 ? layer.unison.voices : 1;
    const spread = layer.unison ? layer.unison.cents || 0 : 0;
    for (let v = 0; v < voices; v++) {
      const cents = voices > 1 ? -spread / 2 + (spread * v) / (voices - 1) : 0;
      const m = Math.pow(2, cents / 1200);
      const fr = freqCurve(N, f0 * m, f1 != null ? f1 * m : null, glideN, curve);
      const ph0 = voices > 1 ? (v / voices) * 0.37 : 0; // fases diferentes evitam o pico de vozes alinhadas
      const osc = oscillate(layer.type, fr, ph0, layer.fm);
      const vg = 1 / Math.sqrt(voices);
      for (let n = 0; n < N; n++) buf[n] += osc[n] * env[n] * vg;
    }
  }

  if (layer.softClip) {
    const k = 1 + 4 * layer.softClip, nk = Math.tanh(k);
    for (let n = 0; n < N; n++) buf[n] = Math.tanh(buf[n] * k) / nk;
  }
  if (layer.filter) applyBiquad(buf, layer.filter);
  if (layer.delay) buf = applyDelay(buf, layer.delay);
  const g = layer.gain ?? 1;
  if (g !== 1) for (let n = 0; n < buf.length; n++) buf[n] *= g;
  return { offset: msToS(layer.at || 0), data: buf };
}

/** Índice de uma variante e seu fator de frequência. */
function variantParams(sound, variantName) {
  const idx = sound.variants.findIndex((v) => v.name === variantName);
  if (idx < 0) throw new Error(`variante ${variantName} não existe em ${sound.name}`);
  const t = sound.variants[idx].transpose || 0;
  return { idx, mul: Math.pow(2, t / 12) };
}

/**
 * Renderiza uma variante: soma das camadas, master (passa-altas, passa-baixas, reverb), corte do
 * silêncio abaixo de -70 dB do pico, rampa de saída `fadeOutMs` e normalização de pico a -3 dBFS
 * (o loudness final é aplicado depois, no pós-processamento).
 */
export function renderVariant(sound, variantName) {
  const { idx, mul } = variantParams(sound, variantName);
  const rendered = sound.recipe.layers.map((l) => renderLayer(l, { mul, seedOffset: idx }));
  const master = sound.recipe.master || {};
  const revTail = master.reverb ? msToS(master.reverb.ms * 1.3 + 50) : 0;
  const N = Math.max(...rendered.map((r) => r.offset + r.data.length)) + revTail + msToS(10);
  let mix = new Float32Array(N);
  for (const r of rendered) for (let n = 0; n < r.data.length; n++) mix[r.offset + n] += r.data[n];

  if (master.reverb) mix = applyReverb(mix, master.reverb);
  if (master.highpassHz) applyBiquad(mix, { type: "highpass", cutoff: master.highpassHz, q: 0.7071 });
  if (master.lowpassHz) applyBiquad(mix, { type: "lowpass", cutoff: master.lowpassHz, q: 0.7071 });

  // Corte relativo ao pico (o corte absoluto de -60 dBFS vem depois, já no nível final)
  let peak = 0;
  for (let n = 0; n < N; n++) peak = Math.max(peak, Math.abs(mix[n]));
  if (!(peak > 0)) throw new Error(`${variantName}: silêncio`);
  const thr = peak * dbToLin(-70);
  let start = 0, end = N - 1;
  while (start < N && Math.abs(mix[start]) < thr) start++;
  while (end > start && Math.abs(mix[end]) < thr) end--;
  const out = mix.slice(start, end + 1);
  // Rampa de saída (cosseno) que termina no ponto de corte: nunca corta em borda
  const F = Math.min(msToS(Math.max(master.fadeOutMs || 5, 5)), out.length >> 1);
  for (let i = 0; i < F; i++) out[out.length - F + i] *= 0.5 * (1 + Math.cos((Math.PI * (i + 1)) / F));
  const g = dbToLin(-3) / peak;
  for (let n = 0; n < out.length; n++) out[n] *= g;
  return out;
}

// ---------------------------------------------------------------------------------------------
// WAV
// ---------------------------------------------------------------------------------------------

/**
 * Grava WAV mono: float32 (formato 3) ou PCM 16 bits (formato 1, escala 32768 igual à de readWav, sem dither:
 * use para conteúdo que já é 16 bits, como a concatenação do sprite, que assim fica bit a bit idêntica).
 */
export function writeWav(file, samples, { sampleRate = SR, float = false } = {}) {
  const bps = float ? 4 : 2;
  const dataLen = samples.length * bps;
  const b = Buffer.alloc(44 + dataLen);
  b.write("RIFF", 0); b.writeUInt32LE(36 + dataLen, 4); b.write("WAVE", 8);
  b.write("fmt ", 12); b.writeUInt32LE(16, 16); b.writeUInt16LE(float ? 3 : 1, 20); b.writeUInt16LE(1, 22);
  b.writeUInt32LE(sampleRate, 24); b.writeUInt32LE(sampleRate * bps, 28); b.writeUInt16LE(bps, 32); b.writeUInt16LE(bps * 8, 34);
  b.write("data", 36); b.writeUInt32LE(dataLen, 40);
  for (let i = 0; i < samples.length; i++) {
    if (float) b.writeFloatLE(samples[i], 44 + i * 4);
    else b.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(samples[i] * 32768))), 44 + i * 2);
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, b);
}

/** Lê WAV mono ou estéreo (PCM 16 bits ou float32); devolve { sampleRate, data: Float32Array do canal 1 }. */
export function readWav(file) {
  const b = fs.readFileSync(file);
  if (b.toString("ascii", 0, 4) !== "RIFF" || b.toString("ascii", 8, 12) !== "WAVE") throw new Error(`${file}: não é WAV`);
  let off = 12, fmt = null, data = null;
  while (off + 8 <= b.length) {
    const id = b.toString("ascii", off, off + 4), len = b.readUInt32LE(off + 4);
    if (id === "fmt ") fmt = { format: b.readUInt16LE(off + 8), channels: b.readUInt16LE(off + 10), sampleRate: b.readUInt32LE(off + 12), bits: b.readUInt16LE(off + 22) };
    if (id === "data") { data = b.subarray(off + 8, off + 8 + len); break; }
    off += 8 + len + (len & 1);
  }
  if (!fmt || !data) throw new Error(`${file}: WAV sem fmt/data`);
  let format = fmt.format;
  if (format === 0xfffe) format = fmt.bits === 32 ? 3 : 1; // WAVE_FORMAT_EXTENSIBLE
  const bps = fmt.bits / 8, frame = bps * fmt.channels, n = Math.floor(data.length / frame);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const p = i * frame;
    out[i] = format === 3 ? data.readFloatLE(p) : fmt.bits === 16 ? data.readInt16LE(p) / 32768 : data.readInt32LE(p) / 2147483648;
  }
  return { sampleRate: fmt.sampleRate, channels: fmt.channels, data: out };
}

// ---------------------------------------------------------------------------------------------
// ffmpeg: medição, pós-processamento e figuras
// ---------------------------------------------------------------------------------------------

export function ffmpeg(args, { allowFail = false } = {}) {
  const r = spawnSync("ffmpeg", ["-hide_banner", "-nostdin", ...args], { encoding: "utf8", maxBuffer: 64 << 20 });
  if (r.error) throw new Error(`ffmpeg não encontrado: ${r.error.message}`);
  if (r.status !== 0 && !allowFail) throw new Error(`ffmpeg falhou (${args.join(" ")}):\n${(r.stderr || "").slice(-2000)}`);
  return r.stderr || "";
}

/**
 * Loudness pelo ebur128 do ffmpeg: máximo momentâneo (janela de 400 ms), máximo de curto prazo (3 s),
 * integrado (BS.1770 com gating) e pico real. O arquivo é completado com silêncio até 4 s para as
 * janelas fecharem.
 */
export function measureLoudness(file) {
  const err = ffmpeg(["-nostats", "-i", file, "-af", "apad=whole_dur=4,ebur128=peak=true+sample:framelog=info", "-f", "null", "-"]);
  const val = (s) => (s === "-inf" || s === "nan" ? NaN : Number(s));
  let mMax = -Infinity, sMax = -Infinity;
  for (const m of err.matchAll(/M:\s*(-?[\d.]+|-inf|nan)\s+S:\s*(-?[\d.]+|-inf|nan)/g)) {
    const M = val(m[1]), S = val(m[2]);
    if (Number.isFinite(M)) mMax = Math.max(mMax, M);
    if (Number.isFinite(S)) sMax = Math.max(sMax, S);
  }
  const summary = err.slice(err.lastIndexOf("Summary:"));
  const num = (re) => { const m = re.exec(summary); return m ? (m[1] === "-inf" ? -Infinity : Number(m[1])) : NaN; };
  return {
    mMax, sMax,
    integrated: num(/I:\s*(-?[\d.]+|-inf) LUFS/),
    samplePeak: num(/Sample peak:\s*\n\s*Peak:\s*(-?[\d.]+|-inf)/),
    truePeak: num(/True peak:\s*\n\s*Peak:\s*(-?[\d.]+|-inf)/),
  };
}

/**
 * Valor comparável ao alvo `lufsShort`. Janela M: máximo momentâneo (400 ms), para sons de até 1 s.
 * Janela S (os longos): loudness integrado do próprio som, sem deixar o máximo momentâneo passar
 * 3 LU acima do alvo (o golpe do gongo não pode soar 7 dB acima do acerto só porque a cauda é longa).
 * A janela S de 3 s do ebur128 diluiria sons de 0,5 a 1,5 s em 3 a 8 dB e o alvo só seria alcançado
 * esmagando o pico; o valor S de 3 s continua no relatório como `lufsS`, só para referência.
 */
export const S_MOMENTARY_CAP = 3;
export const loudnessValue = (m, window) => (window === "S" ? Math.max(m.integrated, m.mMax - S_MOMENTARY_CAP) : m.mMax);

/** astats global: DC, pico, RMS, flat factor e contagem de picos. */
export function measureStats(file) {
  const err = ffmpeg(["-nostats", "-i", file, "-af", "astats=measure_perchannel=none:measure_overall=DC_offset+Peak_level+RMS_level+Flat_factor+Peak_count+Number_of_samples", "-f", "null", "-"]);
  const ov = err.slice(err.lastIndexOf("Overall"));
  const get = (k) => { const m = new RegExp(k + ":\\s*(-?[\\d.e+-]+|-inf|inf)").exec(ov); return m ? Number(m[1].replace(/^-inf$/, "-Infinity").replace(/^inf$/, "Infinity")) : NaN; };
  return { dc: get("DC offset"), peakDb: get("Peak level dB"), rmsDb: get("RMS level dB"), flat: get("Flat factor"), peakCount: get("Peak count"), samples: get("Number of samples") };
}

// Interpolador 4x (sinc com janela de Hann, 8 amostras de cada lado) para estimar o pico real
const TP_TAPS = 8;
const TP_KERNEL = [0.25, 0.5, 0.75].map((frac) => {
  const k = [];
  for (let j = -TP_TAPS + 1; j <= TP_TAPS; j++) {
    const t = j - frac;
    const sinc = t === 0 ? 1 : Math.sin(Math.PI * t) / (Math.PI * t);
    const w = 0.5 * (1 + Math.cos((Math.PI * t) / TP_TAPS));
    k.push(sinc * w);
  }
  return k;
});

/** Envelope de pico real: para cada amostra, o maior módulo entre ela e os 3 pontos interpolados seguintes. */
function truePeakEnv(x) {
  const N = x.length;
  const out = new Float32Array(N);
  for (let n = 0; n < N; n++) {
    let p = Math.abs(x[n]);
    for (const k of TP_KERNEL) {
      let acc = 0;
      for (let j = -TP_TAPS + 1, i = 0; j <= TP_TAPS; j++, i++) {
        const idx = n + j;
        if (idx >= 0 && idx < N) acc += x[idx] * k[i];
      }
      p = Math.max(p, Math.abs(acc));
    }
    out[n] = p;
  }
  return out;
}

/**
 * Limitador offline com antecipação (sem clipping): calcula o ganho necessário em cada amostra a partir
 * do pico real, desce em rampa de 1,5 ms antes do pico e volta com liberação exponencial de 40 ms.
 * Devolve a redução máxima em dB (0 quando nada passou do teto).
 */
export function limitInPlace(y, ceilLin) {
  const N = y.length, L = msToS(1.5), rc = 1 - Math.exp(-1 / msToS(40));
  const pk = truePeakEnv(y);
  const req = new Float32Array(N);
  let any = false;
  for (let n = 0; n < N; n++) { req[n] = pk[n] > ceilLin ? ceilLin / pk[n] : 1; if (req[n] < 1) any = true; }
  if (!any) return 0;
  const g1 = new Float32Array(N); // mínimo olhando adiante em [n, n + L]
  for (let n = 0; n < N; n++) { let m = 1; for (let k = n; k <= Math.min(N - 1, n + L); k++) if (req[k] < m) m = req[k]; g1[n] = m; }
  // Média móvel de g1 em [n - L, n] (antes do início vale g1[0]): rampa de descida que termina no pico
  const win = L + 1;
  let g = 1, gMin = 1, sum = win * g1[0];
  for (let n = 0; n < N; n++) {
    sum += g1[n] - g1[Math.max(n - win, 0)];
    const target = Math.min(1, sum / win);
    g = target < g ? target : g + (target - g) * rc;
    y[n] *= g;
    if (g < gMin) gMin = g;
  }
  return -linToDb(gMin);
}

const TRIM_CHAIN = [
  `silenceremove=start_periods=1:start_threshold=${EDGE_DB}dB:start_silence=0:detection=peak:window=0`,
  "areverse",
  `silenceremove=start_periods=1:start_threshold=${EDGE_DB}dB:start_silence=0:detection=peak:window=0`,
  `afade=t=in:d=${EDGE_FADE_S}`,
  "areverse",
  `afade=t=in:d=${EDGE_FADE_S}`,
  "aresample=osf=s16:dither_method=triangular",
].join(",");

/** Corte de silêncio nas pontas (-60 dBFS), rampas de 2 ms e PCM 16 bits com dither, tudo no ffmpeg. */
export function trimTo16(inFile, out) {
  ffmpeg(["-y", "-i", inFile, "-af", TRIM_CHAIN, "-ac", "1", "-ar", String(SR), "-c:a", "pcm_s16le", "-map_metadata", "-1", "-fflags", "+bitexact", "-flags:a", "+bitexact", out]);
}

/**
 * Pós-processamento de um WAV bruto até o arquivo final: mede o loudness com ebur128, aplica o ganho até
 * o alvo e, se o pico real passar de -1 dBTP, o limitador segura o pico (no máximo 3 dB de redução; acima
 * disso o som fica abaixo do alvo, o que é registrado no relatório). Depois corta as pontas abaixo de
 * -60 dBFS com rampas de 2 ms e grava PCM 16 bits com dither triangular. Itera até o pico real medido
 * ficar abaixo do teto e o loudness a 0,25 dB do alvo (ou no limite permitido).
 */
export function postProcess(raw, out, { lufs, window = "M", tpMax = TP_MAX, tmpDir = path.dirname(out) }) {
  const { data: x } = readWav(raw);
  const m0 = measureLoudness(raw);
  let gain = lufs - loudnessValue(m0, window);
  let ceiling = tpMax - 0.4;
  let m = null, red = 0;
  const tmp = path.join(tmpDir, `.${path.basename(out, ".wav")}.lim.wav`);
  for (let it = 0; it < 10; it++) {
    const g = dbToLin(gain);
    const y = new Float32Array(x.length);
    for (let n = 0; n < x.length; n++) y[n] = x[n] * g;
    red = limitInPlace(y, dbToLin(ceiling));
    writeWav(tmp, y, { float: true });
    trimTo16(tmp, out);
    m = measureLoudness(out);
    if (m.truePeak > tpMax) { ceiling -= m.truePeak - tpMax + 0.05; continue; }
    const miss = lufs - loudnessValue(m, window);
    if (Math.abs(miss) <= 0.25) break;
    if (miss < 0) { gain += miss; continue; }
    const inc = Math.min(miss, MAX_LIMIT_DB - red);
    if (inc < 0.05) break;
    gain += inc;
  }
  fs.rmSync(tmp, { force: true });
  return { gain, limitDb: Math.round(red * 100) / 100, loudness: m };
}

/** Espectrograma e forma de onda (PNG 600x200) de um WAV. */
export function makePics(wav, dir, name) {
  fs.mkdirSync(dir, { recursive: true });
  ffmpeg(["-y", "-i", wav, "-lavfi", "showspectrumpic=s=600x200:legend=1:color=intensity:scale=log:fscale=lin:drange=90", path.join(dir, `${name}.spec.png`)]);
  ffmpeg(["-y", "-i", wav, "-lavfi", "showwavespic=s=600x200:colors=0x58cc02:scale=lin", "-frames:v", "1", path.join(dir, `${name}.wave.png`)]);
}

/** Métricas de verificação de um arquivo final (seção 9 da SFX_SPEC). */
export function verify(file, sound) {
  const { data } = readWav(file);
  const lo = measureLoudness(file);
  const st = measureStats(file);
  const ms1 = msToS(1);
  let first1 = 0, last1 = 0, fullScale = 0;
  for (let i = 0; i < Math.min(ms1, data.length); i++) first1 = Math.max(first1, Math.abs(data[i]));
  for (let i = Math.max(0, data.length - ms1); i < data.length; i++) last1 = Math.max(last1, Math.abs(data[i]));
  for (let i = 0; i < data.length; i++) if (Math.abs(data[i]) >= 32767 / 32768) fullScale++;
  const durMs = (data.length / SR) * 1000;
  const L = sound.loudness || {};
  const value = loudnessValue(lo, L.window || "M");
  const tol = durMs < 60 ? 2 : 1;
  const maxRatio = ["gong", "bless"].includes(sound.name) ? 1.3 : 1.2;
  const problems = [];
  if (!(lo.truePeak <= TP_MAX + 1e-9)) problems.push(`pico real ${lo.truePeak} dBTP`);
  if (Math.abs(value - L.lufsShort) > tol) problems.push(`loudness ${value} (alvo ${L.lufsShort})`);
  if (Math.abs(data[0]) >= 0.001 || Math.abs(data[data.length - 1]) >= 0.001) problems.push("borda com amostra alta");
  if (linToDb(last1) > EDGE_DB + 10) problems.push(`último ms a ${linToDb(last1).toFixed(1)} dBFS`);
  if (Math.abs(st.dc) >= 0.005) problems.push(`DC ${st.dc}`);
  if (fullScale > 0 || st.flat > 0.5) problems.push(`clipping (${fullScale} amostras no fundo de escala, flat ${st.flat})`);
  // A duração do catálogo é o fim da camada mais longa; a cauda abaixo de -60 dBFS sai no corte. Só observação.
  const notes = [];
  const ratio = durMs / sound.durationMs;
  if (ratio < 0.8 || ratio > maxRatio) notes.push(`duração ${durMs.toFixed(0)} ms, catálogo ${sound.durationMs} ms`);
  return {
    durationMs: Math.round(durMs * 10) / 10,
    targetLufs: L.lufsShort, window: L.window || "M",
    lufsM: lo.mMax, lufsS: lo.sMax, lufs: value, integrated: lo.integrated,
    truePeak: lo.truePeak, samplePeak: lo.samplePeak,
    dc: st.dc, flatFactor: st.flat, peakCount: st.peakCount, fullScaleSamples: fullScale,
    firstSample: Math.abs(data[0]), lastSample: Math.abs(data[data.length - 1]),
    first1msDb: Math.round(linToDb(first1) * 10) / 10, last1msDb: Math.round(linToDb(last1) * 10) / 10,
    problems, notes,
  };
}

// ---------------------------------------------------------------------------------------------
// Catálogo
// ---------------------------------------------------------------------------------------------

export function loadCatalog(file = SOUNDS_JSON) {
  const j = JSON.parse(fs.readFileSync(file, "utf8"));
  if (!Array.isArray(j.sounds)) throw new Error("sounds.json sem a lista sounds");
  return j;
}

/** Lista [som, variante] na ordem do catálogo, filtrada por nome base ou de variante. */
export function listVariants(catalog, only = null) {
  const out = [];
  for (const s of catalog.sounds) {
    for (const v of s.variants) {
      if (only && !only.has(s.name) && !only.has(v.name)) continue;
      out.push([s, v.name]);
    }
  }
  return out;
}

// ---------------------------------------------------------------------------------------------
// Principal
// ---------------------------------------------------------------------------------------------

function parseArgs(argv) {
  const o = {};
  for (const a of argv) {
    const m = /^--([^=]+)(?:=(.*))?$/.exec(a);
    if (m) o[m[1]] = m[2] ?? true;
  }
  return o;
}

const fmt = (x, d = 1) => (Number.isFinite(x) ? x.toFixed(d) : String(x));

function main() {
  const args = parseArgs(process.argv.slice(2));
  const only = args.only ? new Set(String(args.only).split(",").map((s) => s.trim()).filter(Boolean)) : null;
  // --raw sem --out vai para uma pasta temporária: arquivos de depuração nunca caem em audio/sfx/src
  const outDir = path.resolve(args.out ? String(args.out) : args.raw ? path.join(os.tmpdir(), "gen-sfx-raw") : SRC_DIR);
  const catalog = loadCatalog();
  const jobs = listVariants(catalog, only);
  if (!jobs.length) { console.error("nenhum som corresponde a --only"); process.exit(1); }

  fs.mkdirSync(outDir, { recursive: true });
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "gen-sfx-"));
  const report = {};
  let bad = 0;
  console.log(`Sintetizando ${jobs.length} arquivos em ${path.relative(process.cwd(), outDir) || "."}`);
  console.log("nome".padEnd(15) + "dur(ms)".padStart(8) + "  alvo  LUFS-M  LUFS-I  pico(dBTP)  ganho   lim");
  for (const [sound, vname] of jobs) {
    const pcm = renderVariant(sound, vname);
    const rawPath = path.join(args.raw ? outDir : tmp, args.raw ? `${vname}.raw.wav` : `${vname}.wav`);
    writeWav(rawPath, pcm, { float: true });
    if (args.raw) { console.log(vname.padEnd(15) + fmt((pcm.length / SR) * 1000, 0).padStart(8)); continue; }
    const out = path.join(outDir, `${vname}.wav`);
    const L = sound.loudness || { lufsShort: -20, window: "M" };
    const pp = postProcess(rawPath, out, { lufs: L.lufsShort, window: L.window || "M", tpMax: L.truePeakMax ?? TP_MAX, tmpDir: tmp });
    const v = verify(out, sound);
    report[vname] = { sound: sound.name, role: sound.role, source: "synth", gainDb: Math.round(pp.gain * 100) / 100, limiterDb: pp.limitDb, ...v };
    if (v.problems.length) bad++;
    console.log(
      vname.padEnd(15) + fmt(v.durationMs, 0).padStart(8) + String(L.lufsShort).padStart(6) +
      fmt(v.lufsM).padStart(8) + fmt(v.integrated).padStart(8) + fmt(v.truePeak).padStart(12) +
      fmt(pp.gain).padStart(7) + fmt(pp.limitDb).padStart(6) +
      (v.problems.length ? "  ! " + v.problems.join("; ") : "") + (v.notes.length ? "  (" + v.notes.join("; ") + ")" : "")
    );
    if (args.pics) makePics(out, path.resolve(String(args.pics)), vname);
  }
  fs.rmSync(tmp, { recursive: true, force: true });

  if (!args.raw && outDir === path.resolve(SRC_DIR)) {
    let prev = {};
    try { prev = JSON.parse(fs.readFileSync(REPORT_JSON, "utf8")).files || {}; } catch (e) { /* primeiro relatório */ }
    const files = only ? { ...prev, ...report } : report;
    const ordered = {};
    for (const [s, v] of listVariants(catalog)) if (files[v]) ordered[v] = files[v];
    fs.writeFileSync(REPORT_JSON, JSON.stringify({ generated: "tools/gen-sfx.mjs", sampleRate: SR, files: ordered }, null, 1) + "\n");
  }
  console.log(bad ? `\n${bad} arquivo(s) com observações (ver acima)` : "\nTodos os arquivos passaram nas verificações.");

  if (args.sprite) {
    const r = spawnSync(process.execPath, [path.join(HERE, "build-sfx-sprite.mjs")], { stdio: "inherit" });
    process.exit(r.status ?? 1);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main();
