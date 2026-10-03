// Camada sonora própria do React (VISUAL_SPEC 8.2 e 0.3). Não edita biblelingo/sfx.js.
// sfx(name, { rate, volume }) toca a partir do sprite audio/sfx/sfx-v2.ogg quando existir
// (mapa audio/sfx/sfx-v2.json no formato de audio/sprites.json: nome -> [arquivo, início, duração]);
// enquanto o sprite v2 não existe, o mapa provisório abaixo aponta para os 9 WAV embutidos
// (sfx-data.js) com variação de pitch. Respeita state.sound.
import { SFX_DATA } from "../../../sfx-data.js";
import { state } from "./store.js";

// Mapa provisório: nome do evento -> [som base, opções]. `rates` sorteia uma variação; `byIndex` sobe o pitch com i.
const MAP = {
  tap: ["tap", { volume: 0.7 }],
  select: ["select", { volume: 0.8 }],
  tile: ["select", { volume: 0.6, rate: 1.2, byIndex: 0.04 }],       // madeira: pitch sobe com a posição da peça
  start: ["start", { volume: 0.8 }],
  correct: ["correct", { rates: [0.96, 1.0, 1.06] }],                 // 3 variações contra o cansaço sonoro
  combo: ["combo", {}],
  wrong: ["wrong", { volume: 0.9 }],
  "heart-lost": ["wrong", { rate: 0.8, volume: 0.8 }],
  pop: ["pop", { byIndex: 0.06, maxIndex: 6 }],                        // pop(i): rate 1 + min(i, 6) * 0.06
  swoosh: ["start", { rate: 0.6, volume: 0.4 }],
  star: ["sparkle", { byIndex: 0.12 }],                                // sino curto com pitch crescente
  finish: ["finish", {}],
  sparkle: ["sparkle", {}],
  coin: ["pop", { rates: [1.1, 1.2, 1.3], volume: 0.7 }],
  streak: ["finish", {}],
  levelup: ["finish", { rate: 1.1 }],
  gong: ["finish", { rate: 0.7 }],
  tick: ["tap", { rate: 1.5, volume: 0.5 }],
  mission: ["sparkle", {}],
};

let ctx = null;
const buffers = {};          // nome base -> AudioBuffer (WAV embutidos)
const htmlPool = {};
let unlocked = false;
let decoding = null;
let sprite = null;           // { map: {nome: [arquivo, início, duração]}, buffers: {arquivo: AudioBuffer|Promise} } ou false
let spriteProbe = null;

export const soundEnabled = () => state.sound !== false;

function getCtx() {
  if (ctx) return ctx;
  try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ctx = null; }
  return ctx;
}

async function decodeBase() {
  const c = getCtx();
  if (!c) return;
  for (const name of Object.keys(SFX_DATA)) {
    if (buffers[name]) continue;
    try {
      const res = await fetch(SFX_DATA[name]);
      const arr = await res.arrayBuffer();
      buffers[name] = await new Promise((ok, err) => {
        const p = c.decodeAudioData(arr, ok, err);
        if (p && p.then) p.then(ok, err);
      });
    } catch (e) { /* fica no fallback <audio> */ }
  }
}

// Sprite v2 (opcional): tenta uma vez; sem o arquivo, segue no mapa provisório
function probeSprite() {
  if (spriteProbe) return spriteProbe;
  spriteProbe = fetch("audio/sfx/sfx-v2.json", { cache: "no-cache" })
    .then((r) => (r.ok ? r.json() : null))
    .then((map) => { sprite = map && typeof map === "object" ? { map, buffers: {} } : false; })
    .catch(() => { sprite = false; });
  return spriteProbe;
}

function spriteBuffer(file) {
  const c = getCtx();
  if (!c || !sprite) return null;
  if (sprite.buffers[file]) return sprite.buffers[file];
  const p = fetch("audio/sfx/" + file)
    .then((r) => { if (!r.ok) throw new Error("sprite " + r.status); return r.arrayBuffer(); })
    .then((ab) => c.decodeAudioData(ab))
    .then((buf) => { sprite.buffers[file] = buf; return buf; })
    .catch(() => { delete sprite.buffers[file]; return null; });
  sprite.buffers[file] = p;
  return p;
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

export function unlock() {
  if (unlocked) return;
  unlocked = true;
  const c = getCtx();
  if (c && c.state === "suspended") c.resume().catch(() => {});
  keepAlive();
  decoding = decoding || decodeBase();
  probeSprite();
}

// Destrava no primeiro gesto (exigência do iOS/Chrome). Em captura, marca o evento como tratado:
// o listener do app clássico (sfx.js compartilhado) deve retornar cedo enquanto o alias do Vite o carregar.
if (typeof document !== "undefined") {
  const onGesture = (e) => { e.__blSfxHandled = true; unlock(); };
  ["pointerdown", "touchend", "keydown"].forEach((ev) => document.addEventListener(ev, onGesture, { capture: true, passive: true }));
}

function playHtml(base, volume) {
  try {
    if (!SFX_DATA[base]) return;
    const pool = (htmlPool[base] = htmlPool[base] || []);
    let el = pool.find((a) => a.paused || a.ended);
    if (!el) {
      el = new Audio(SFX_DATA[base]);
      el.setAttribute("playsinline", "");
      pool.push(el);
    }
    el.volume = volume;
    el.currentTime = 0;
    el.play().catch(() => {});
  } catch (e) { /* sem som */ }
}

function playBuffer(buf, { rate = 1, volume = 1, offset = 0, duration } = {}) {
  const c = getCtx();
  if (!c || !buf) return false;
  try {
    const src = c.createBufferSource();
    src.buffer = buf;
    src.playbackRate.value = rate;
    const g = c.createGain();
    g.gain.value = volume;
    src.connect(g).connect(c.destination);
    if (duration != null) src.start(0, offset, duration); else src.start();
    return true;
  } catch (e) { return false; }
}

// Resolve rate e volume do evento. `arg` pode ser um número (índice: pop(i), tile(i), star(i)) ou { rate, volume, i }.
function resolve(name, arg) {
  const entry = MAP[name] || (SFX_DATA[name] ? [name, {}] : null);
  if (!entry) return null;
  const [base, opt] = entry;
  const o = typeof arg === "number" ? { i: arg } : (arg || {});
  let rate = opt.rate != null ? opt.rate : 1;
  if (opt.rates) rate = opt.rates[Math.floor(Math.random() * opt.rates.length)];
  if (opt.byIndex && o.i != null) rate *= 1 + Math.min(o.i, opt.maxIndex != null ? opt.maxIndex : 12) * opt.byIndex;
  if (o.rate != null) rate = o.rate;
  const volume = o.volume != null ? o.volume : (opt.volume != null ? opt.volume : 1);
  return { base, rate, volume };
}

// sfx("correct") · sfx("pop", 3) · sfx("tile", { rate: 1.08 })
export function sfx(name, arg) {
  if (!soundEnabled()) return false;
  const r = resolve(name, arg);
  if (!r) return false;
  const c = getCtx();
  if (c && c.state === "suspended") c.resume().catch(() => {});
  // Sprite v2 primeiro (quando existir e já estiver decodificado)
  if (sprite && sprite.map[name] && c && c.state === "running") {
    const [file, start, dur] = sprite.map[name];
    const buf = spriteBuffer(file);
    if (buf && !(buf.then)) return playBuffer(buf, { rate: r.rate, volume: r.volume, offset: start, duration: dur });
  }
  if (c && buffers[r.base] && c.state === "running") return playBuffer(buffers[r.base], { rate: r.rate, volume: r.volume });
  if (!decoding) decoding = decodeBase();
  playHtml(r.base, r.volume);
  return true;
}

// Compatibilidade com o objeto SFX antigo (SFX.tap(), SFX.pop(i)...)
export const SFX = new Proxy({ play: sfx, unlock }, {
  get(target, prop) {
    if (prop in target) return target[prop];
    if (typeof prop !== "string") return undefined;
    return (arg) => sfx(prop, arg);
  },
});

export default sfx;
