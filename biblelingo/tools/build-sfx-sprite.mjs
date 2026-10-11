#!/usr/bin/env node
// Monta o sprite de efeitos sonoros v2 do BíbliaLearn (docs/SFX_SPEC.md seção 5).
//
// Entrada: audio/sfx/src/<variante>.wav (gerados por tools/gen-sfx.mjs) e, se existir,
// tools/sfx/choices.json ({ "default": "synth", "<som>": "synth" | "eleven:<arquivo>" }) para trocar a
// fonte de um som por um candidato do ElevenLabs. Saída:
//   audio/sfx/sfx-v2.ogg   Vorbis q5, 44 100 Hz mono
//   audio/sfx/sfx-v2.m4a   AAC 128 kbps com +faststart (Safari)
//   audio/sfx/sfx-v2.json  { "<variante>": ["sfx-v2", início_s, duração_s] } (o app escolhe .ogg ou .m4a)
//   audio/sfx/sfx-v2.m4a.json  só se o AAC deslocar algum som mais de 3 ms (mapa corrigido)
//   biblelingo/sfx-data.js reserva embutida (WAV 22 050 Hz base64) com os sons essenciais
//   audio/sfx/report.json  métricas por arquivo (de gen-sfx) mais o bloco "sprite"
// Os sons ficam em sequência com 60 ms de silêncio antes de cada um; a ordem é a de tools/sfx/sounds.json.
//
// Uso (a partir de biblelingo/):  node tools/build-sfx-sprite.mjs [--no-reserve]

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import {
  ROOT, SFX_DIR, SRC_DIR, REPORT_JSON, SR,
  loadCatalog, listVariants, readWav, writeWav, ffmpeg, postProcess, verify,
} from "./gen-sfx.mjs";

const GAP_S = 0.06;
const SPRITE = "sfx-v2";
const CHOICES_JSON = path.join(ROOT, "tools/sfx/choices.json");
const ELEVEN_DIRS = [path.join(ROOT, "tools/sfx/chosen"), path.join(ROOT, "tools/sfx/candidates")];
const RESERVE_JS = path.join(ROOT, "sfx-data.js");
const RESERVE_OLD = path.join(SFX_DIR, "old/sfx-data.js");
const RESERVE_SR = 22050;
const RESERVE_MAX_BYTES = 150 * 1024;
const MAX_TRANSPOSE = 3; // candidatos do ElevenLabs viram variantes por rate só até ±3 semitons
const OFFSET_TOL_MS = 3;

// Reserva: chave em sfx-data.js -> variante do sprite. As 6 do pedido (tap, select, correct, wrong, pop,
// finish) mais a peça (tile), que a seção 5.2 da SFX_SPEC também pede.
const RESERVE = [
  ["tap", "tap"],
  ["select", "select"],
  ["tile", "tile-1"],
  ["pop", "pair-1"],
  ["correct", "correct-1"],
  ["wrong", "wrong"],
  ["finish", "finish"],
];
// Apelidos sem bytes extras: nomes da SFX_SPEC 5.2 e os que o app clássico (sfx.js) chama
const RESERVE_ALIASES = {
  "tile-1": "tile",
  "pair-1": "pop",
  "correct-1": "correct",
  combo: "correct",
  start: "correct",
  sparkle: "pop",
};

const args = Object.fromEntries(process.argv.slice(2).map((a) => { const m = /^--([^=]+)(?:=(.*))?$/.exec(a); return m ? [m[1], m[2] ?? true] : [a, true]; }));
const rel = (p) => path.relative(ROOT, p) || ".";

// ---------------------------------------------------------------------------------------------
// Fontes (sintetizado ou ElevenLabs)
// ---------------------------------------------------------------------------------------------

function loadChoices() {
  if (!fs.existsSync(CHOICES_JSON)) return { default: "synth" };
  const j = JSON.parse(fs.readFileSync(CHOICES_JSON, "utf8"));
  return { default: "synth", ...j };
}

function findEleven(sound, ref) {
  const file = /^\d+$/.test(ref) ? `${sound.name}-el-${ref}.mp3` : ref;
  const tries = path.isAbsolute(file) ? [file] : [...ELEVEN_DIRS.map((d) => path.join(d, file)), path.join(ROOT, file)];
  const hit = tries.find((p) => fs.existsSync(p));
  if (!hit) throw new Error(`choices.json: ${sound.name} -> eleven:${ref}, arquivo não encontrado (procurado em ${tries.map(rel).join(", ")})`);
  return hit;
}

/**
 * Candidato do ElevenLabs até um WAV final igual aos sintetizados: mono 44 100 Hz, silêncio inicial
 * cortado a -50 dB, duração limitada a 1,2 x durationMs com rampa de saída de 20 ms, passa-altas de 60 Hz,
 * transposição por rate (asetrate) para a variante e o mesmo loudness, limitador e corte de bordas.
 */
function processEleven(sound, variant, srcFile, tmp) {
  const t = variant.transpose || 0;
  const maxS = (sound.durationMs * 1.2) / 1000;
  const chain = [
    "aformat=channel_layouts=mono",
    `aresample=${SR}`,
    "silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0:detection=peak:window=0",
    "highpass=f=60",
  ];
  if (t) chain.push(`asetrate=${Math.round(SR * Math.pow(2, t / 12))}`, `aresample=${SR}`);
  chain.push(`atrim=end=${maxS.toFixed(3)}`, "areverse", "afade=t=in:d=0.02", "areverse");
  const raw = path.join(tmp, `${variant.name}.eleven.wav`);
  ffmpeg(["-y", "-i", srcFile, "-af", chain.join(","), "-ac", "1", "-ar", String(SR), "-c:a", "pcm_f32le", raw]);
  const out = path.join(tmp, `${variant.name}.wav`);
  const L = sound.loudness || { lufsShort: -20, window: "M" };
  const pp = postProcess(raw, out, { lufs: L.lufsShort, window: L.window || "M", tpMax: L.truePeakMax ?? -1, tmpDir: tmp });
  return { file: out, metrics: { gainDb: Math.round(pp.gain * 100) / 100, limiterDb: pp.limitDb, ...verify(out, sound) } };
}

// ---------------------------------------------------------------------------------------------
// Offsets: confere o início de cada som no arquivo codificado por correlação cruzada
// ---------------------------------------------------------------------------------------------

function decodePcm(file) {
  const r = spawnSync("ffmpeg", ["-hide_banner", "-nostdin", "-loglevel", "error", "-i", file, "-ac", "1", "-ar", String(SR), "-f", "f32le", "-"], { maxBuffer: 256 << 20 });
  if (r.status !== 0) throw new Error(`não decodificou ${file}: ${r.stderr}`);
  const b = r.stdout;
  const out = new Float32Array(b.length / 4);
  for (let i = 0; i < out.length; i++) out[i] = b.readFloatLE(i * 4);
  return out;
}

/**
 * Deslocamento (em amostras) de cada trecho no PCM decodificado em relação ao original: correlação
 * cruzada normalizada nos primeiros 60 ms do som, procurando até ±10 ms em volta do início esperado.
 */
function measureOffsets(orig, dec, segments) {
  const W = Math.round(0.06 * SR), R = Math.round(0.01 * SR);
  return segments.map(({ start, length }) => {
    const n = Math.min(W, length);
    let eo = 0;
    for (let k = 0; k < n; k++) eo += orig[start + k] * orig[start + k];
    let best = 0, bestV = -Infinity;
    for (let lag = -R; lag <= R; lag++) {
      let acc = 0, ed = 0;
      for (let k = 0; k < n; k++) {
        const j = start + lag + k;
        if (j < 0 || j >= dec.length) continue;
        acc += orig[start + k] * dec[j];
        ed += dec[j] * dec[j];
      }
      const v = ed > 0 && eo > 0 ? acc / Math.sqrt(eo * ed) : -Infinity;
      if (v > bestV) { bestV = v; best = lag; }
    }
    return best;
  });
}

// ---------------------------------------------------------------------------------------------
// Reserva embutida (sfx-data.js)
// ---------------------------------------------------------------------------------------------

function wavBase64At22k(srcWav, tmp, key, maxS = null) {
  const out = path.join(tmp, `reserve-${key}.wav`);
  const chain = [`aresample=${RESERVE_SR}:dither_method=triangular`];
  if (maxS) chain.push(`atrim=end=${maxS.toFixed(3)}`, "areverse", "afade=t=in:d=0.08", "areverse");
  ffmpeg(["-y", "-i", srcWav, "-af", chain.join(","), "-ac", "1", "-c:a", "pcm_s16le", "-map_metadata", "-1", "-fflags", "+bitexact", "-flags:a", "+bitexact", out]);
  return "data:audio/wav;base64," + fs.readFileSync(out).toString("base64");
}

function buildReserve(sources, tmp) {
  if (!fs.existsSync(RESERVE_OLD) && fs.existsSync(RESERVE_JS)) {
    fs.mkdirSync(path.dirname(RESERVE_OLD), { recursive: true });
    fs.copyFileSync(RESERVE_JS, RESERVE_OLD);
    console.log(`reserva antiga copiada para ${rel(RESERVE_OLD)}`);
  }
  const render = (finishMax) => {
    const data = {};
    for (const [key, variant] of RESERVE) data[key] = wavBase64At22k(sources[variant], tmp, key, key === "finish" ? finishMax : null);
    const lines = [
      "// BíbliaLearn: efeitos sonoros de reserva (WAV 22 050 Hz mono embutidos em base64).",
      "// Gerado por tools/build-sfx-sprite.mjs a partir de audio/sfx/src (sintetizador v2, docs/SFX_SPEC.md 5.2).",
      "// Não editar à mão. O app React toca o sprite audio/sfx/sfx-v2.* e usa estes só até ele carregar;",
      "// o app clássico (sfx.js) usa estes sempre. Os apelidos no fim reaproveitam os mesmos dados.",
      `const SFX_DATA = ${JSON.stringify(data)};`,
      ...Object.entries(RESERVE_ALIASES).map(([a, k]) => `SFX_DATA[${JSON.stringify(a)}] = SFX_DATA[${JSON.stringify(k)}];`),
      "",
    ];
    return lines.join("\n");
  };
  let finishMax = null;
  let js = render(finishMax);
  // Fora do orçamento: encurta a fanfarra (rampa de 80 ms) até caber, nunca abaixo de 0,6 s
  for (let i = 0; Buffer.byteLength(js) > RESERVE_MAX_BYTES && i < 12; i++) {
    const cur = finishMax ?? readWav(sources.finish).data.length / SR;
    finishMax = Math.max(0.6, cur - 0.1);
    js = render(finishMax);
  }
  if (Buffer.byteLength(js) > RESERVE_MAX_BYTES) throw new Error(`sfx-data.js passou de ${RESERVE_MAX_BYTES} bytes`);
  fs.writeFileSync(RESERVE_JS, js);
  return { bytes: Buffer.byteLength(js), keys: RESERVE.map(([k]) => k), aliases: Object.keys(RESERVE_ALIASES), finishTrimmedTo: finishMax };
}

/** Mapa com uma entrada por linha: { "tap": ["sfx-v2", 0.06, 0.0239], ... } */
function mapJson(map) {
  const rows = Object.entries(map).map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v).replace(/,/g, ", ")}`);
  return "{\n" + rows.join(",\n") + "\n}\n";
}

// ---------------------------------------------------------------------------------------------
// Principal
// ---------------------------------------------------------------------------------------------

function main() {
  const catalog = loadCatalog();
  const choices = loadChoices();
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "sfx-sprite-"));
  const jobs = listVariants(catalog);
  const sources = {};   // variante -> WAV final usado no sprite
  const origin = {};    // variante -> "synth" | "eleven:<arquivo>"
  const extraMetrics = {};

  for (const [sound, vname] of jobs) {
    const choice = String(choices[sound.name] ?? choices.default ?? "synth");
    const variant = sound.variants.find((v) => v.name === vname);
    if (choice.startsWith("eleven:")) {
      if (Math.abs(variant.transpose || 0) > MAX_TRANSPOSE) {
        console.warn(`aviso: ${vname} pede ${variant.transpose} semitons; acima de ±${MAX_TRANSPOSE} fica o sintetizado`);
      } else {
        const src = findEleven(sound, choice.slice(7));
        const r = processEleven(sound, variant, src, tmp);
        sources[vname] = r.file;
        origin[vname] = `eleven:${rel(src)}`;
        extraMetrics[vname] = { sound: sound.name, role: sound.role, source: origin[vname], ...r.metrics };
        continue;
      }
    } else if (choice !== "synth") {
      throw new Error(`choices.json: valor inválido para ${sound.name}: ${choice}`);
    }
    const f = path.join(SRC_DIR, `${vname}.wav`);
    if (!fs.existsSync(f)) throw new Error(`falta ${rel(f)}: rode node tools/gen-sfx.mjs`);
    sources[vname] = f;
    origin[vname] = "synth";
  }

  // Concatenação PCM 16 bits: 60 ms de silêncio antes de cada som
  const gap = Math.round(GAP_S * SR);
  const parts = [];
  const segments = [];
  let pos = 0;
  for (const [, vname] of jobs) {
    const { data, sampleRate } = readWav(sources[vname]);
    if (sampleRate !== SR) throw new Error(`${vname}: ${sampleRate} Hz (esperado ${SR})`);
    pos += gap;
    segments.push({ name: vname, start: pos, length: data.length });
    parts.push({ at: pos, data });
    pos += data.length;
  }
  pos += gap;
  const pcm = new Float32Array(pos);
  for (const p of parts) pcm.set(p.data, p.at);
  const master = path.join(tmp, `${SPRITE}.wav`);
  writeWav(master, pcm);

  // Codificação (flags bitexact: mesmo PCM, mesmos bytes)
  const ogg = path.join(SFX_DIR, `${SPRITE}.ogg`);
  const m4a = path.join(SFX_DIR, `${SPRITE}.m4a`);
  const common = ["-map_metadata", "-1", "-fflags", "+bitexact", "-flags:a", "+bitexact", "-ac", "1", "-ar", String(SR)];
  ffmpeg(["-y", "-i", master, ...common, "-c:a", "libvorbis", "-q:a", "5", ogg]);
  ffmpeg(["-y", "-i", master, ...common, "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", m4a]);

  // Mapa (segundos, 4 casas: 0,1 ms)
  const round4 = (x) => Math.round(x * 10000) / 10000;
  const map = {};
  for (const s of segments) map[s.name] = [SPRITE, round4(s.start / SR), round4(s.length / SR)];
  fs.writeFileSync(path.join(SFX_DIR, `${SPRITE}.json`), mapJson(map));

  // Conferência dos offsets depois da codificação
  const check = {};
  for (const [label, file] of [["ogg", ogg], ["m4a", m4a]]) {
    const dec = decodePcm(file);
    const lags = measureOffsets(pcm, dec, segments);
    const errs = lags.map((l) => (l / SR) * 1000);
    const maxAbs = Math.max(...errs.map(Math.abs));
    check[label] = { bytes: fs.statSync(file).size, decodedSeconds: round4(dec.length / SR), maxOffsetErrMs: Math.round(maxAbs * 100) / 100 };
    const off = segments.map((sg, i) => [sg.name, errs[i]]).filter(([, e]) => Math.abs(e) > 0.5);
    if (off.length) console.log(`  ${label}: deslocados > 0,5 ms: ${off.map(([n, e]) => `${n} ${e.toFixed(2)} ms`).join(", ")}`);
    if (label === "m4a") {
      const fixed = path.join(SFX_DIR, `${SPRITE}.m4a.json`);
      if (maxAbs > OFFSET_TOL_MS) {
        const m2 = {};
        segments.forEach((s, i) => { m2[s.name] = [SPRITE, round4((s.start + lags[i]) / SR), round4(s.length / SR)]; });
        fs.writeFileSync(fixed, mapJson(m2));
        check[label].correctedMap = rel(fixed);
      } else if (fs.existsSync(fixed)) fs.rmSync(fixed);
    }
  }

  const reserve = args["no-reserve"] ? null : buildReserve(sources, tmp);

  // Relatório: métricas por arquivo (de gen-sfx) + candidatos escolhidos + bloco do sprite
  let report = {};
  try { report = JSON.parse(fs.readFileSync(REPORT_JSON, "utf8")); } catch (e) { report = { files: {} }; }
  report.files = { ...(report.files || {}), ...extraMetrics };
  // Catálogo resumido para a página de audição (audio/sfx/index.html), que só lê arquivos de audio/sfx
  report.catalog = {
    masterGain: catalog.mix?.masterGain ?? 0.9,
    families: catalog.mix?.families ?? {},
    aliases: catalog.aliases ?? {},
    sounds: catalog.sounds.map((s) => ({
      name: s.name, role: s.role, companion: !!s.companion, haptic: s.haptic ?? null,
      description: s.description, durationMs: s.durationMs, loudness: s.loudness,
      variants: s.variants.map((v) => ({ name: v.name, transpose: v.transpose || 0 })),
      index: s.index ?? null,
    })),
  };
  report.sprite = {
    generated: "tools/build-sfx-sprite.mjs",
    files: segments.length,
    audioSeconds: round4(segments.reduce((a, s) => a + s.length, 0) / SR),
    totalSeconds: round4(pcm.length / SR),
    gapSeconds: GAP_S,
    sources: origin,
    ...check,
    reserve,
  };
  fs.writeFileSync(REPORT_JSON, JSON.stringify(report, null, 1) + "\n");
  fs.rmSync(tmp, { recursive: true, force: true });

  const kb = (b) => (b / 1024).toFixed(1) + " KB";
  console.log(`Sprite ${SPRITE}: ${segments.length} sons, ${report.sprite.audioSeconds} s de áudio, ${report.sprite.totalSeconds} s com os intervalos`);
  console.log(`  ${rel(ogg)}  ${kb(check.ogg.bytes)}  desvio máx. ${check.ogg.maxOffsetErrMs} ms`);
  console.log(`  ${rel(m4a)}  ${kb(check.m4a.bytes)}  desvio máx. ${check.m4a.maxOffsetErrMs} ms${check.m4a.correctedMap ? " (mapa corrigido em " + check.m4a.correctedMap + ")" : ""}`);
  console.log(`  ${rel(path.join(SFX_DIR, SPRITE + ".json"))}`);
  const eleven = Object.entries(origin).filter(([, o]) => o !== "synth");
  console.log(`  fontes: ${segments.length - eleven.length} sintetizadas${eleven.length ? ", " + eleven.length + " do ElevenLabs (" + eleven.map(([v]) => v).join(", ") + ")" : ""}`);
  if (reserve) console.log(`Reserva ${rel(RESERVE_JS)}: ${kb(reserve.bytes)} (${reserve.keys.join(", ")}; apelidos ${reserve.aliases.join(", ")})${reserve.finishTrimmedTo ? ", finish cortado em " + reserve.finishTrimmedTo.toFixed(2) + " s" : ""}`);
}

main();
