// BíbliaLearn — motor de efeitos sonoros
// Toca clipes WAV embutidos (sfx-data.js) via WebAudio com latência mínima; destrava o áudio
// no primeiro toque (exigência do iOS/Chrome) e mantém uma faixa silenciosa em loop para que o
// iPhone toque os efeitos mesmo com a chave de silencioso ligada. Fallback: elementos <audio>.

const SFX = (() => {
  let ctx = null;
  const buffers = {};
  const htmlPool = {};
  let unlocked = false;
  let silentEl = null;
  const enabled = () => { try { return typeof state === "undefined" || state.sound !== false; } catch (e) { return true; } };

  function getCtx() {
    if (ctx) return ctx;
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ctx = null; }
    return ctx;
  }

  async function decodeAll() {
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
      } catch (e) { /* fica no fallback */ }
    }
  }

  // Faixa silenciosa em loop: muda a sessão de áudio do iOS para "reprodução", liberando o WebAudio no modo silencioso
  function keepAlive() {
    if (silentEl) return;
    try {
      silentEl = new Audio("data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQQAAAAAAAA=");
      silentEl.loop = true;
      silentEl.volume = 0.01;
      silentEl.setAttribute("playsinline", "");
      silentEl.play().catch(() => {});
    } catch (e) {}
  }

  function unlock() {
    if (unlocked) return;
    unlocked = true;
    const c = getCtx();
    if (c && c.state === "suspended") c.resume().catch(() => {});
    keepAlive();
    decodeAll();
  }
  ["pointerdown", "touchend", "keydown"].forEach((ev) => document.addEventListener(ev, unlock, { capture: true, passive: true }));

  function playHtml(name, volume) {
    try {
      const pool = (htmlPool[name] = htmlPool[name] || []);
      let el = pool.find((a) => a.paused || a.ended);
      if (!el) {
        el = new Audio(SFX_DATA[name]);
        el.setAttribute("playsinline", "");
        pool.push(el);
      }
      el.volume = volume;
      el.currentTime = 0;
      el.play().catch(() => {});
    } catch (e) {}
  }

  function play(name, { volume = 1, rate = 1 } = {}) {
    if (!enabled() || !SFX_DATA[name]) return;
    const c = getCtx();
    if (c && buffers[name] && c.state === "running") {
      try {
        const src = c.createBufferSource();
        src.buffer = buffers[name];
        src.playbackRate.value = rate;
        const g = c.createGain();
        g.gain.value = volume;
        src.connect(g).connect(c.destination);
        src.start();
        return;
      } catch (e) { /* cai no fallback */ }
    }
    if (c && c.state === "suspended") c.resume().catch(() => {});
    playHtml(name, volume);
  }

  return {
    play,
    tap: () => play("tap", { volume: 0.7 }),
    select: () => play("select", { volume: 0.8 }),
    correct: () => play("correct"),
    wrong: () => play("wrong", { volume: 0.9 }),
    combo: () => play("combo"),
    pop: (i = 0) => play("pop", { rate: 1 + Math.min(i, 6) * 0.06 }),
    finish: () => play("finish"),
    sparkle: () => play("sparkle"),
    start: () => play("start", { volume: 0.8 }),
    unlock,
  };
})();

// Som de toque em todos os botões (opções e peças usam o "select"; Verificar toca só o resultado)
document.addEventListener("pointerdown", (e) => {
  const b = e.target.closest("button");
  if (!b || b.disabled) return;
  if (b.id === "btn-check" || b.classList.contains("btn-audio") || b.classList.contains("pbtn") || b.classList.contains("mic-btn")) return;
  if (b.classList.contains("opt") || b.classList.contains("tile")) SFX.select();
  else SFX.tap();
}, { capture: true, passive: true });
