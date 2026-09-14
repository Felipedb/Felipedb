// Áudio gravado (sprites WebAudio) com reserva na síntese do navegador — porta fiel de features.js.
import { audioKey, normalize } from "./util.js";

export const AUDIO = { manifest: null, sprites: null, cache: {}, buffers: {}, order: [], ctx: null, curSrc: null, playToken: 0, base: "audio/" };

// Aviso simples para a UI ("boca mexendo" enquanto fala)
const speakListeners = new Set();
export function onSpeak(fn) { speakListeners.add(fn); return () => speakListeners.delete(fn); }
function emitSpeak(text, durationMs) { speakListeners.forEach((fn) => fn({ text, durationMs })); }

function audioCtx() {
  AUDIO.ctx = AUDIO.ctx || new (window.AudioContext || window.webkitAudioContext)();
  return AUDIO.ctx;
}

function spriteBuffer(name) {
  if (AUDIO.buffers[name]) {
    AUDIO.order = AUDIO.order.filter((n) => n !== name).concat(name);
    return AUDIO.buffers[name];
  }
  const p = fetch(AUDIO.base + "sprites/" + name)
    .then((r) => { if (!r.ok) throw new Error("sprite " + r.status); return r.arrayBuffer(); })
    .then((ab) => audioCtx().decodeAudioData(ab))
    .catch((e) => { delete AUDIO.buffers[name]; AUDIO.order = AUDIO.order.filter((n) => n !== name); throw e; });
  AUDIO.buffers[name] = p;
  AUDIO.order.push(name);
  while (AUDIO.order.length > 4) delete AUDIO.buffers[AUDIO.order.shift()];
  return p;
}

export async function loadAudioManifest() {
  try {
    const r = await fetch(AUDIO.base + "manifest.json", { cache: "no-cache" });
    AUDIO.manifest = r.ok ? await r.json() : {};
  } catch (e) { AUDIO.manifest = {}; }
  try {
    const r = await fetch(AUDIO.base + "words.json", { cache: "no-cache" });
    const words = r.ok ? await r.json() : {};
    Object.keys(words).forEach((w) => {
      const cut = words[w];
      const entry = (AUDIO.manifest[w] = AUDIO.manifest[w] || {});
      Object.keys(cut).forEach((c) => { if (c !== "default") entry[c] = cut[c].f; });
      if (cut.default) entry.default = cut.default;
    });
  } catch (e) { /* sem cortes */ }
  try {
    const r = await fetch(AUDIO.base + "sprites.json", { cache: "no-cache" });
    AUDIO.sprites = r.ok ? await r.json() : null;
  } catch (e) { AUDIO.sprites = null; }
  if (AUDIO.sprites && "caches" in window) {
    try {
      const live = new Set(Object.values(AUDIO.sprites).map((s) => s[0]));
      const keys = await caches.keys();
      for (const k of keys) {
        const c = await caches.open(k);
        for (const req of await c.keys()) {
          const m = req.url.match(/\/audio\/sprites\/([^/?]+)$/);
          if (m && !live.has(m[1])) c.delete(req);
        }
      }
    } catch (e) { /* sem acesso ao cache */ }
  }
}

export function clipDuration(text, charKey) {
  if (!AUDIO.manifest || !AUDIO.sprites) return 0;
  const entry = AUDIO.manifest[audioKey(text)];
  if (!entry) return 0;
  const file = (charKey && entry[charKey]) || entry.default;
  const s = file && AUDIO.sprites[file];
  return s ? s[2] : 0;
}

export function stopClip() {
  AUDIO.playToken++;
  if (AUDIO.curSrc) { try { AUDIO.curSrc.stop(); } catch (e) { /* já parou */ } AUDIO.curSrc = null; }
  Object.values(AUDIO.cache).forEach((a) => a.pause());
  if ("speechSynthesis" in window) speechSynthesis.cancel();
}

export function playClip(text, charKey, slow, onFail) {
  if (!AUDIO.manifest) return false;
  const entry = AUDIO.manifest[audioKey(text)];
  if (!entry) return false;
  const file = (charKey && entry[charKey]) || entry.default;
  if (!file) return false;
  const fail = () => { if (typeof onFail === "function") onFail(); };
  try {
    const rate = slow ? 0.75 : 1;
    stopClip();
    const token = AUDIO.playToken;
    const playFile = () => {
      let el = AUDIO.cache[file];
      if (!el) {
        el = new Audio(AUDIO.base + file);
        el.preload = "auto";
        AUDIO.cache[file] = el;
      }
      el.currentTime = 0;
      el.playbackRate = rate;
      let failed = false;
      const failOnce = () => { if (failed) return; failed = true; if (token === AUDIO.playToken) fail(); };
      el.onerror = () => { delete AUDIO.cache[file]; failOnce(); };
      el.play().catch(failOnce);
    };
    const sprite = AUDIO.sprites && AUDIO.sprites[file];
    if (sprite && window.AudioContext) {
      const ctx = audioCtx();
      if (ctx.state !== "running") { try { ctx.resume(); } catch (e) { /* segue */ } }
      spriteBuffer(sprite[0]).then((buf) => {
        if (token !== AUDIO.playToken) return;
        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.playbackRate.value = rate;
        src.connect(ctx.destination);
        src.start(0, sprite[1], sprite[2]);
        AUDIO.curSrc = src;
      }).catch(() => { if (token === AUDIO.playToken) playFile(); });
      return true;
    }
    if (AUDIO.sprites && !sprite) return false;
    playFile();
    return true;
  } catch (e) {
    return false;
  }
}

// ---------- Síntese do navegador (reserva) ----------
const FEMALE_HINTS = /female|samantha|victoria|karen|moira|tessa|zira|jenny|aria|serena|allison|ava|susan|catherine|joana|luciana/i;
const MALE_HINTS = /male|daniel|alex\b|fred|david|mark|guy|arthur|oliver|thomas|james|george|rishi/i;
const _voices = { all: [], male: null, female: null, any: null };
function refreshVoices() {
  if (!("speechSynthesis" in window)) return;
  const en = speechSynthesis.getVoices().filter((v) => v.lang && v.lang.toLowerCase().startsWith("en"));
  if (!en.length) return;
  _voices.all = en;
  const prefer = (list) => list.find((v) => v.lang.toLowerCase().startsWith("en-us")) || list[0] || null;
  _voices.female = prefer(en.filter((v) => FEMALE_HINTS.test(v.name)));
  _voices.male = prefer(en.filter((v) => MALE_HINTS.test(v.name) && !FEMALE_HINTS.test(v.name)));
  _voices.any = prefer(en);
}
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  refreshVoices();
  speechSynthesis.onvoiceschanged = refreshVoices;
}

function speakTTS(text, ch, opts = {}) {
  if (!("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const profile = ch && ch.voice ? ch.voice : null;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = (profile ? profile.rate : 0.95) * (opts.slow ? 0.6 : 1);
  u.pitch = profile ? profile.pitch : 1;
  const voice = profile ? (_voices[profile.gender] || _voices.any) : _voices.any;
  if (voice) u.voice = voice;
  speechSynthesis.speak(u);
}

// speak(text, { char, slow }): clipe gravado primeiro; senão síntese
export function speak(text, opts = {}) {
  const ch = opts.char || null;
  const dur = (clipDuration(text, ch && ch.key) || Math.min(4, 0.5 + String(text).length * 0.055)) * 1000;
  if (playClip(text, ch && ch.key, opts.slow, () => speakTTS(text, ch, opts))) {
    if ("speechSynthesis" in window) speechSynthesis.cancel();
    emitSpeak(text, Math.min(4000, 400 + text.length * 70));
    return;
  }
  speakTTS(text, ch, opts);
  emitSpeak(text, dur);
}

// ---------- Reconhecimento de voz ----------
export const SPEECH_OK = typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

export function recognizeOnce(target, { onStart, onEnd, onResult, onError } = {}) {
  const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Rec) { onError && onError("unsupported"); return null; }
  let rec;
  try { rec = new Rec(); } catch (e) { onError && onError("unsupported"); return null; }
  rec.lang = "en-US";
  rec.interimResults = false;
  rec.maxAlternatives = 3;
  const targetWords = normalize(target).split(" ");
  rec.onstart = () => onStart && onStart();
  rec.onresult = (e) => {
    const alts = [...e.results[0]].map((r) => r.transcript);
    let best = 0, bestText = alts[0] || "";
    alts.forEach((t) => {
      const words = normalize(t).split(" ");
      const hit = targetWords.filter((w) => words.includes(w)).length / targetWords.length;
      if (hit > best) { best = hit; bestText = t; }
    });
    onResult && onResult({ score: best, text: bestText, ok: best >= 0.6 });
  };
  rec.onerror = (e) => onError && onError(e.error || "error");
  rec.onend = () => onEnd && onEnd();
  rec.start();
  return rec;
}
