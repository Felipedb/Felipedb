// Camada sonora v2 do React (SFX_SPEC 6.1; VISUAL_SPEC 7.2 e 8). Não edita biblelingo/sfx.js.
// API: sfx(name, arg) toca um som do catálogo (tools/sfx/sounds.json, resumido em core/sfxCatalog.js);
//      feel(name, arg) toca o som e dispara o haptic do mesmo evento (um gesto, um transiente, um haptic);
//      unlock() destrava o áudio (chamado sozinho no primeiro gesto); preload() carrega o sprite v2; SFX é o proxy legado.
// `arg`: número = índice (tile(i), pair(i), star(i), stat(i), coin(i)) ou { i, volume, rate } (rate multiplica o pitch).
// Fontes, por prioridade: sprite audio/sfx/sfx-v2.{ogg,m4a} decodificado (mapa audio/sfx/sfx-v2.json, nome ->
// [arquivo, início s, duração s]; .m4a quando o navegador não toca Vorbis, com sfx-v2.m4a.json quando existir) >
// WAV de reserva embutidos (sfx-data.js) > <audio> HTML com o WAV (só sem WebAudio). Na reserva, cada som usa o
// essencial mais próximo (SFX_SPEC 5.2) e os acompanhamentos ficam mudos.
// Regras (SFX_SPEC 6.1): variante sorteada sem repetir a anterior; índice pela escada do catálogo (variante mais próxima +
// playbackRate limitado a maxSemitones); debounce de 30 ms por nome; ganho = mestre x família x volume; no máximo 8 vozes
// (a nona derruba a mais antiga da família ui); respeita state.sound; nada toca antes do primeiro gesto.
// Coalescência de um frame (regra 11): cliques (tap, tap-soft, tab, node, toggle-*, deselect) esperam o próximo frame;
// se nesse meio tempo chegar um som de resposta (correct, wrong, start, select, tile, pair...), o clique é descartado
// ("absorbed"). Acompanhamentos (sheet-open, sheet-close, swoosh) tocam na hora e não descartam nada.
// Em desenvolvimento, cada som aceito entra em window.__sfxLog = [{ name, req, variant, rate, t, companion, absorbed,
// src, click }] (máximo 200; contrato dos testes, scripts/sfx-check.mjs). `click` é o id do clique que causou o som
// (window.__sfxClicks), quando ele veio dentro do despacho do evento.
import { SFX_DATA } from "../../../sfx-data.js";
import { state } from "./store.js";
import { haptic } from "./haptics.js";
import { SFX_SOUNDS, SFX_ALIASES, SFX_MIX, SFX_VERSION } from "./sfxCatalog.js";

const DEV = !!import.meta.env.DEV;
const SPRITE_DIR = "audio/sfx/";
const SPRITE = "sfx-v2";
const DEBOUNCE_MS = 30;
const MAX_VOICES = 8;
const LOG_MAX = 200;
const CLICKS = new Set(["tap", "tap-soft", "tab", "node", "toggle-on", "toggle-off", "deselect"]);

// Reserva até o sprite decodificar (SFX_SPEC 5.2): som -> chaves de SFX_DATA em ordem de preferência. O sfx-data.js
// regenerado traz tap, select, tile-1, pair-1, correct-1 e wrong (mais os 9 nomes antigos como aliases); o antigo traz
// tap, select, correct, wrong, combo, pop, finish, sparkle e start. A cadeia serve aos dois.
const CORRECT = ["correct-1", "correct"];
const FALLBACK = {
  tap: ["tap"], "tap-soft": ["tap"], tab: ["tap"], node: ["tap"], "toggle-on": ["tap"], "toggle-off": ["tap"],
  select: ["select"], deselect: ["select"], stat: ["select"],
  tile: ["tile-1", "select"], "tile-return": ["tile-1", "select"],
  pair: ["pair-1", "pop"], coin: ["pair-1", "pop"], bubble: ["pair-1", "pop"],
  star: ["sparkle", "pair-1", "pop"], mission: ["sparkle", "pair-1", "pop"], toast: ["sparkle", "pair-1", "pop"],
  correct: CORRECT, combo: ["combo", ...CORRECT], start: ["start", ...CORRECT], finish: ["finish", ...CORRECT],
  levelup: ["finish", ...CORRECT], streak: ["finish", ...CORRECT], goal: CORRECT, chest: CORRECT, unlock: CORRECT,
  "madness-start": ["start", ...CORRECT], newword: CORRECT,
  wrong: ["wrong"], "heart-lost": ["wrong"], "heart-empty": ["wrong"], "pair-wrong": ["wrong"], gong: ["wrong"],
  // swoosh, sheet-open, sheet-close, bless e tick ficam mudos até o sprite
};

let ctx = null;
let master = null;
let unlocked = false;
let started = false;
let lastGesture = -1e9;
let wavBuffers = null;      // chave de SFX_DATA -> AudioBuffer
let wavDecoding = null;
let sprite = null;          // { ext, map: { variante: [arquivo, início, duração] }, buffers: { arquivo: AudioBuffer } }
let spriteLoading = null;
const lastAt = {};
const lastVariant = {};
const voices = [];
const htmlPool = {};
let pending = null;

export const soundEnabled = () => state.sound !== false;
export const sfxCatalog = { version: SFX_VERSION, sounds: SFX_SOUNDS, aliases: SFX_ALIASES, mix: SFX_MIX };

// Nome canônico do catálogo (resolve aliases legados: pop -> pair, sparkle -> mission...) ou null
export function canonical(name) {
  if (SFX_SOUNDS[name]) return name;
  const a = SFX_ALIASES[name];
  return a && SFX_SOUNDS[a] ? a : null;
}

const now = () => (typeof performance !== "undefined" ? performance.now() : Date.now());

function getCtx() {
  if (ctx) return ctx;
  if (!unlocked || typeof window === "undefined") return null;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = SFX_MIX.masterGain != null ? SFX_MIX.masterGain : 0.9;
    master.connect(ctx.destination);
  } catch (e) { ctx = null; master = null; }
  return ctx;
}

function decode(c, ab) {
  return new Promise((ok, err) => {
    try {
      const p = c.decodeAudioData(ab, ok, err);
      if (p && p.then) p.then(ok, err);
    } catch (e) { err(e); }
  });
}

function dataUriBytes(uri) {
  const b64 = String(uri).split(",")[1] || "";
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out.buffer;
}

// WAV de reserva: decodifica cada dado uma vez (o sfx-data.js novo repete o mesmo dado em vários aliases)
function decodeWav() {
  if (wavDecoding) return wavDecoding;
  const c = getCtx();
  if (!c) return Promise.resolve(null);
  const bufs = {};
  const byData = new Map();
  wavDecoding = Promise.all(Object.entries(SFX_DATA || {}).map(async ([key, uri]) => {
    try {
      if (!byData.has(uri)) byData.set(uri, decode(c, dataUriBytes(uri)));
      bufs[key] = await byData.get(uri);
    } catch (e) { /* esse fica sem reserva */ }
  })).then(() => { wavBuffers = bufs; return bufs; });
  return wavDecoding;
}

function spriteExt() {
  try {
    const a = document.createElement("audio");
    if (a.canPlayType && a.canPlayType('audio/ogg; codecs="vorbis"')) return "ogg";
  } catch (e) { /* segue com AAC */ }
  return "m4a";
}

async function fetchJson(url) {
  const r = await fetch(url, { cache: "no-cache" });
  if (!r.ok) throw new Error(`${url} ${r.status}`);
  return r.json();
}

const stem = (file) => String(file).replace(/\.(ogg|m4a|mp3|wav|webm)$/i, "");

async function loadSprite(ext) {
  const c = getCtx();
  if (!c) throw new Error("sem WebAudio");
  let raw = null;
  if (ext === "m4a") raw = await fetchJson(`${SPRITE_DIR}${SPRITE}.m4a.json`).catch(() => null);
  if (!raw) raw = await fetchJson(`${SPRITE_DIR}${SPRITE}.json`);
  const map = {};
  for (const [k, v] of Object.entries(raw || {})) {
    if (Array.isArray(v) && v.length >= 3 && Number.isFinite(+v[1]) && Number.isFinite(+v[2])) map[k] = [`${stem(v[0])}.${ext}`, +v[1], +v[2]];
  }
  if (!Object.keys(map).length) throw new Error("mapa do sprite vazio");
  const buffers = {};
  await Promise.all([...new Set(Object.values(map).map((v) => v[0]))].map(async (file) => {
    const r = await fetch(SPRITE_DIR + file);
    if (!r.ok) throw new Error(`${file} ${r.status}`);
    const ab = await r.arrayBuffer();
    try { buffers[file] = await decode(c, ab); } catch (e) { const err = new Error(`${file} não decodificou`); err.decode = true; throw err; }
  }));
  return { ext, map, buffers };
}

// Carrega e decodifica o sprite v2 uma vez (depois do primeiro gesto). Resolve true quando ele passa a ser a fonte.
export function preload() {
  if (spriteLoading) return spriteLoading;
  if (!getCtx()) return Promise.resolve(false);
  const ext = spriteExt();
  spriteLoading = loadSprite(ext)
    .catch((e) => (ext === "ogg" && e && e.decode ? loadSprite("m4a") : Promise.reject(e)))
    .then((s) => { sprite = s; return true; })
    .catch((e) => {
      if (DEV) console.info("[sfx] sprite v2 indisponível; usando a reserva embutida:", e && e.message);
      return false;
    });
  return spriteLoading;
}

// Faixa silenciosa em loop: muda a sessão de áudio do iOS para "reprodução" (toca com a chave de silencioso)
let silentEl = null;
function keepAlive() {
  if (silentEl) return;
  try {
    silentEl = new Audio("data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQQAAAAAAAA=");
    silentEl.loop = true;
    silentEl.volume = 0.01;
    silentEl.setAttribute("playsinline", "");
    silentEl.play().catch(() => {});
  } catch (e) { /* segue sem keep-alive */ }
}

// Destrava o áudio (exigência do iOS e do Chrome): cria e retoma o contexto, liga o keep-alive, decodifica a reserva
// e começa a carregar o sprite. Chamado no primeiro gesto; nos seguintes só retoma o contexto se ele parou.
export function unlock() {
  unlocked = true;
  lastGesture = now();
  const c = getCtx();
  if (c && c.state === "suspended") c.resume().catch(() => {});
  if (started) return;
  started = true;
  keepAlive();
  decodeWav();
  preload();
}

// Em captura, marca o evento como tratado: o listener do app clássico (sfx.js compartilhado) retorna cedo
if (typeof document !== "undefined") {
  const onGesture = (e) => { e.__blSfxHandled = true; unlock(); };
  const GESTURES = ["pointerdown", "touchend", "keydown", "click"];
  GESTURES.forEach((ev) => document.addEventListener(ev, onGesture, { capture: true, passive: true }));
  // O iOS suspende o contexto ao trocar de app: retoma ao voltar
  const onVisible = () => { if (document.visibilityState === "visible" && ctx && ctx.state !== "running") ctx.resume().catch(() => {}); };
  document.addEventListener("visibilitychange", onVisible);
  // Em desenvolvimento, o HMR pode reavaliar este módulo: solta os listeners e o contexto da instância antiga
  if (import.meta.hot) {
    import.meta.hot.dispose(() => {
      GESTURES.forEach((ev) => document.removeEventListener(ev, onGesture, { capture: true }));
      document.removeEventListener("visibilitychange", onVisible);
      try { if (silentEl) silentEl.pause(); if (ctx) ctx.close(); } catch (e) { /* já fechado */ }
    });
  }
}

// Variante e correção de pitch (semitons) para o pedido
function choose(name, snd, i) {
  const vs = snd.variants;
  if (snd.index) {
    const { steps, pick, max } = snd.index;
    const k = Math.max(0, Math.min(Number.isFinite(i) ? Math.floor(i) : 0, steps.length - 1));
    const target = steps[k];
    let v = vs[0];
    if (pick !== "rate") for (const c of vs) if (Math.abs(target - c[1]) < Math.abs(target - v[1])) v = c;
    const lim = Number.isFinite(max) ? max : 12;
    return { v, resid: Math.max(-lim, Math.min(lim, target - v[1])) };
  }
  if (vs.length === 1) return { v: vs[0], resid: 0 };
  // coin(i): em ordem, subindo; sem índice, sorteio sem repetir a última
  if (Number.isFinite(i)) return { v: vs[Math.abs(Math.floor(i)) % vs.length], resid: 0 };
  const pool = vs.filter((c) => c[0] !== lastVariant[name]);
  const v = pool[Math.floor(Math.random() * pool.length)] || vs[0];
  lastVariant[name] = v[0];
  return { v, resid: 0 };
}

function familyGain(role) {
  const db = (SFX_MIX.families && SFX_MIX.families[role]) || 0;
  return Math.pow(10, db / 20);
}

function startSource(c, buf, offset, dur, rate, gain, role) {
  try {
    const src = c.createBufferSource();
    src.buffer = buf;
    src.playbackRate.value = rate;
    const g = c.createGain();
    // Rampa de 2 ms na entrada: o Vorbis espalha um pré-eco de até -36 dBFS antes do ataque, e começar o trecho
    // num valor diferente de zero estala. currentTime é o início do próximo bloco renderizado, onde a fonte entra.
    const t0 = c.currentTime;
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + 0.002);
    src.connect(g);
    g.connect(master || c.destination);
    if (dur != null) src.start(0, offset, dur); else src.start();
    const voice = { src, role };
    voices.push(voice);
    src.onended = () => {
      const k = voices.indexOf(voice);
      if (k >= 0) voices.splice(k, 1);
      try { g.disconnect(); } catch (e) { /* já desligado */ }
    };
    if (voices.length > MAX_VOICES) {
      const k = voices.findIndex((x) => x.role === "ui");
      if (k >= 0) { const [old] = voices.splice(k, 1); try { old.src.stop(); } catch (e) { /* já parou */ } }
    }
    return true;
  } catch (e) { return false; }
}

function playHtml(chain, volume, rate) {
  try {
    const key = chain.find((k) => SFX_DATA && SFX_DATA[k]);
    if (!key) return false;
    const pool = (htmlPool[key] = htmlPool[key] || []);
    let el = pool.find((a) => a.paused || a.ended);
    if (!el) {
      el = new Audio(SFX_DATA[key]);
      el.setAttribute("playsinline", "");
      pool.push(el);
    }
    el.volume = Math.max(0, Math.min(1, volume));
    try { el.preservesPitch = false; el.playbackRate = rate; } catch (e) { /* sem pitch */ }
    el.currentTime = 0;
    el.play().catch(() => {});
    return true;
  } catch (e) { return false; }
}

// Toca de fato; devolve a fonte usada (sprite | wav | html | mute | suspended | locked | none)
function render(e) {
  if (!unlocked) return "locked";
  const c = getCtx();
  const gain = familyGain(e.role) * e.volume;
  const shift = e.transpose + e.resid; // semitons em relação à primeira variante
  if (!c) return playHtml(FALLBACK[e.name] || [], gain * (SFX_MIX.masterGain || 0.9), clampRate(Math.pow(2, shift / 12) * e.rateMul)) ? "html" : "none";
  if (c.state !== "running") { // suspended (antes do gesto, app em segundo plano) ou interrupted (iOS)
    c.resume().catch(() => {});
    if (now() - lastGesture > 1000) return "suspended"; // fora de um gesto o som chegaria atrasado: descarta
  }
  if (sprite) {
    let seg = sprite.map[e.variant];
    let semis = e.resid;
    if (!seg && sprite.map[e.name]) { seg = sprite.map[e.name]; semis = shift; }
    if (!seg) { const first = SFX_SOUNDS[e.name].variants[0][0]; if (sprite.map[first]) { seg = sprite.map[first]; semis = shift; } }
    const buf = seg && sprite.buffers[seg[0]];
    if (buf && startSource(c, buf, seg[1], seg[2], clampRate(Math.pow(2, semis / 12) * e.rateMul), gain, e.role)) return "sprite";
  }
  const chain = FALLBACK[e.name];
  if (!chain) return "mute";
  if (!wavBuffers) { decodeWav(); return playHtml(chain, gain * (SFX_MIX.masterGain || 0.9), clampRate(Math.pow(2, shift / 12) * e.rateMul)) ? "html" : "loading"; }
  const key = chain.find((k) => wavBuffers[k]);
  if (!key) return "none";
  return startSource(c, wavBuffers[key], 0, null, clampRate(Math.pow(2, shift / 12) * e.rateMul), gain, e.role) ? "wav" : "none";
}

const clampRate = (r) => Math.max(0.5, Math.min(2, r || 1));

// ---------- Log de testes (só em desenvolvimento) ----------
function currentClick() {
  if (!DEV || typeof window === "undefined") return null;
  const ev = window.event;
  return ev && ev.type === "click" && ev.__sfxClick ? ev.__sfxClick : null;
}
function log(e, src, extra) {
  if (!DEV || typeof window === "undefined") return;
  const L = (window.__sfxLog = window.__sfxLog || []);
  L.push({
    name: e.name, req: e.req, variant: e.variant, rate: +Math.pow(2, e.resid / 12).toFixed(4), t: Math.round(e.t),
    companion: e.companion || undefined, absorbed: (extra && extra.absorbed) || undefined, src, click: e.click || undefined,
    ...(extra && extra.unknown ? { unknown: true } : {}),
  });
  if (L.length > LOG_MAX) L.splice(0, L.length - LOG_MAX);
}
if (DEV && typeof document !== "undefined") {
  window.__sfxClicks = window.__sfxClicks || [];
  // Numera cada clique (antes dos handlers do React) para atribuir os sons ao gesto que os causou. O contador e o
  // listener vivem na janela, registrados uma vez só: um HMR que reavalie este módulo não repete ids.
  if (!window.__sfxClickHook) {
    window.__sfxClickHook = true;
    window.__sfxClickSeq = window.__sfxClickSeq || 0;
    document.addEventListener("click", (ev) => {
      const id = ++window.__sfxClickSeq;
      ev.__sfxClick = id;
      const t = ev.target && ev.target.closest ? ev.target.closest("button, a, [role=button], [role=radio], [role=switch]") : null;
      const C = (window.__sfxClicks = window.__sfxClicks || []);
      C.push({ id, t: Math.round(performance.now()), button: !!t, label: t ? (t.getAttribute("aria-label") || t.textContent || "").trim().slice(0, 48) : "" });
      if (C.length > LOG_MAX) C.splice(0, C.length - LOG_MAX);
    }, { capture: true });
  }
  window.__sfx = {
    status: () => ({ unlocked, ctx: ctx ? ctx.state : null, sprite: sprite ? sprite.ext : spriteLoading ? "loading" : "none", wav: !!wavBuffers, voices: voices.length }),
    preload,
  };
}

function absorb(e) { log(e, "absorbed", { absorbed: true }); }

function play(e) { log(e, render(e)); }

function flushLater(e) {
  const fire = () => {
    if (pending !== e) return;
    pending = null;
    if (soundEnabled()) play(e);
  };
  if (typeof requestAnimationFrame === "function") requestAnimationFrame(fire);
  setTimeout(fire, 34);
}

// Núcleo: devolve "played" | "queued" | "absorbed" | "debounced" | "off" | "unknown"
function trigger(req, arg) {
  if (!soundEnabled()) return "off";
  const name = canonical(req);
  const t = now();
  if (!name) {
    if (DEV) { console.warn(`[sfx] som desconhecido: ${req}`); log({ name: req, req, variant: null, resid: 0, t, click: currentClick() }, "none", { unknown: true }); }
    return "unknown";
  }
  if (t - (lastAt[name] != null ? lastAt[name] : -1e9) < DEBOUNCE_MS) return "debounced";
  lastAt[name] = t;
  const snd = SFX_SOUNDS[name];
  const o = typeof arg === "number" ? { i: arg } : (arg || {});
  const { v, resid } = choose(name, snd, o.i);
  const e = {
    req, name, role: snd.role, companion: !!snd.companion, variant: v[0], transpose: v[1], resid,
    rateMul: o.rate > 0 ? o.rate : 1, volume: o.volume != null ? o.volume : 1, t, click: currentClick(),
  };
  if (e.companion) { play(e); return "played"; }
  if (CLICKS.has(name)) {
    if (pending) { absorb(e); return "absorbed"; } // dois cliques no mesmo frame: só o primeiro
    pending = e;
    flushLater(e);
    return "queued";
  }
  if (pending) { const p = pending; pending = null; absorb(p); } // a resposta substitui o clique
  play(e);
  return "played";
}

// sfx("correct") · sfx("tile", 3) · sfx("sheet-open", { volume: 0.7 })
export function sfx(name, arg) {
  const st = trigger(name, arg);
  return st === "played" || st === "queued";
}

// feel("tap") = sfx + haptic do mesmo evento (o haptic segue state.haptics mesmo com o som desligado)
export function feel(name, arg) {
  const st = trigger(name, arg);
  if (st === "debounced") return false;
  haptic(canonical(name) || name);
  return st === "played" || st === "queued";
}

// Compatibilidade com o objeto SFX antigo (SFX.tap(), SFX.pop(i)...)
export const SFX = new Proxy({ play: sfx, feel, unlock, preload }, {
  get(target, prop) {
    if (prop in target) return target[prop];
    if (typeof prop !== "string") return undefined;
    return (arg) => sfx(prop, arg);
  },
});

export default sfx;
