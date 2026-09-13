// BíbliaLearn — recursos de engajamento e infraestrutura
// (áudio gravado com fallback, coroas e nível lendário, meta diária e missões, offline)
// Carregado antes de app.js: só define funções e dados; nada executa no carregamento.

// ---------- 2.2 Áudio gravado com fallback para a síntese do navegador ----------
// audio/manifest.json: { "<texto normalizado>": { "default": "arquivo.mp3", "<personagem>": "arquivo.mp3" } }
const AUDIO = { manifest: null, sprites: null, cache: {}, buffers: {}, order: [], ctx: null, curSrc: null, playToken: 0, stopTimer: 0, base: "audio/" };

function audioCtx() {
  AUDIO.ctx = AUDIO.ctx || new (window.AudioContext || window.webkitAudioContext)();
  return AUDIO.ctx;
}

// Baixa e decodifica um sprite uma única vez (cache limitado aos 6 mais recentes)
async function spriteBuffer(name) {
  if (AUDIO.buffers[name]) return AUDIO.buffers[name];
  const ab = await (await fetch(AUDIO.base + "sprites/" + name)).arrayBuffer();
  const buf = await audioCtx().decodeAudioData(ab);
  AUDIO.buffers[name] = buf;
  AUDIO.order.push(name);
  if (AUDIO.order.length > 6) delete AUDIO.buffers[AUDIO.order.shift()];
  return buf;
}

function audioKey(text) {
  return String(text).toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();
}

async function loadAudioManifest() {
  try {
    const r = await fetch(AUDIO.base + "manifest.json", { cache: "no-cache" });
    AUDIO.manifest = r.ok ? await r.json() : {};
  } catch (e) {
    AUDIO.manifest = {};
  }
  // Mapa de sprites (poucos MP3 grandes com offsets) quando publicado
  try {
    const r = await fetch(AUDIO.base + "sprites.json", { cache: "no-cache" });
    AUDIO.sprites = r.ok ? await r.json() : null;
  } catch (e) {
    AUDIO.sprites = null;
  }
}

// Duração do clipe gravado (segundos); 0 quando não há clipe
function clipDuration(text, charKey) {
  if (!AUDIO.manifest || !AUDIO.sprites) return 0;
  const entry = AUDIO.manifest[audioKey(text)];
  if (!entry) return 0;
  const file = (charKey && entry[charKey]) || entry.default;
  const s = file && AUDIO.sprites[file];
  return s ? s[2] : 0;
}

// Toca o clipe gravado se existir; devolve true quando tocou
function playClip(text, charKey, slow) {
  if (!AUDIO.manifest) return false;
  const entry = AUDIO.manifest[audioKey(text)];
  if (!entry) return false;
  const file = (charKey && entry[charKey]) || entry.default;
  if (!file) return false;
  try {
    const rate = slow ? 0.65 : 1;
    clearTimeout(AUDIO.stopTimer);
    if (AUDIO.curSrc) { try { AUDIO.curSrc.stop(); } catch (e) {} AUDIO.curSrc = null; }
    Object.values(AUDIO.cache).forEach((a) => a.pause());
    const sprite = AUDIO.sprites && AUDIO.sprites[file];
    if (sprite && window.AudioContext) {
      // WebAudio: toca o trecho exato do sprite (seek confiável em qualquer hospedagem)
      const token = ++AUDIO.playToken;
      spriteBuffer(sprite[0]).then((buf) => {
        if (token !== AUDIO.playToken) return;
        const ctx = audioCtx();
        if (ctx.state === "suspended") ctx.resume();
        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.playbackRate.value = rate;
        src.connect(ctx.destination);
        src.start(0, sprite[1], sprite[2]);
        AUDIO.curSrc = src;
      }).catch(() => {});
      return true;
    }
    let el = AUDIO.cache[file];
    if (!el) {
      el = new Audio(AUDIO.base + file);
      el.preload = "auto";
      AUDIO.cache[file] = el;
    }
    el.currentTime = 0;
    el.playbackRate = rate;
    el.play().catch(() => {});
    return true;
  } catch (e) {
    return false;
  }
}

// ---------- Repetição espaçada por palavra ----------
// Cada acerto sobe um nível (intervalo maior até a próxima revisão); cada erro desce dois.
const SR_INTERVALS = [0, 1, 2, 4, 7, 15, 30]; // dias até vencer, por nível
function wordStat(en) {
  state.words = state.words || {};
  return state.words[en] || (state.words[en] = { lvl: 0, ok: 0, bad: 0, last: 0 });
}
function recordWord(en, ok) {
  const w = wordStat(en);
  w.last = Date.now();
  if (ok) { w.ok++; w.lvl = Math.min(SR_INTERVALS.length - 1, w.lvl + 1); }
  else { w.bad++; w.lvl = Math.max(0, w.lvl - 2); }
}
// Urgência de revisão: dias além do vencimento, mais peso para palavras com histórico de erro
function wordUrgency(en) {
  const w = state.words && state.words[en];
  if (!w) return 0.5; // nunca praticada fora da lição: revisar cedo
  const overdue = (Date.now() - (w.last + SR_INTERVALS[w.lvl] * 864e5)) / 864e5;
  return overdue + w.bad * 0.6 - w.ok * 0.3;
}
function weakestWords(list, n) {
  return [...list].sort((a, b) => wordUrgency(b.en) - wordUrgency(a.en)).slice(0, n);
}
function dueWords(list) {
  return list.filter((w) => state.words && state.words[w.en] && wordUrgency(w.en) >= 0);
}
// Palavras do vocabulário presentes numa frase (para creditar acertos de frase)
function sentenceVocab(sentence) {
  const toks = new Set(normalize(sentence.en).split(" "));
  return allVocab().filter((w) => normalize(w.en.replace(/^to /, "")).split(" ").every((t) => toks.has(t)));
}

// ---------- Retomar a lição no ponto ----------
const RESUME_TTL = 3 * 864e5;
function saveResume() {
  if (!session || session.practice || session.levelUp || !session.lesson || !session.lesson.unit || session.lesson.practiceErrors || String(session.lesson.id).startsWith("quick")) return;
  if (session.index >= session.exercises.length) return;
  try {
    state.resume = {
      lessonId: session.lesson.id, index: session.index, mistakes: session.mistakes, combo: session.combo, bestCombo: session.bestCombo,
      bonus: session.bonus, startedAt: session.startedAt, reviewing: session.reviewing, hardAdded: session.hardAdded,
      narratorKey: session.narrator && session.narrator.key, fixedNarrator: !!session.fixedNarrator,
      exercises: JSON.parse(JSON.stringify(session.exercises)), hard: JSON.parse(JSON.stringify(session.hard || [])),
      reviewQueue: JSON.parse(JSON.stringify(session.reviewQueue || [])), log: session.log || [], savedAt: Date.now(),
    };
    save();
  } catch (e) { /* exercício não serializável: segue sem retomar */ }
}
function resumable() {
  const r = state.resume;
  if (!r || Date.now() - r.savedAt > RESUME_TTL) return null;
  const lesson = flatLessons().find((l) => l.id === r.lessonId);
  return lesson ? { ...r, lesson } : null;
}
function resumeLesson() {
  const r = resumable();
  if (!r) return false;
  const lesson = r.lesson;
  _distractUnit = lesson.unit;
  const narrator = r.narratorKey && CHARACTERS[r.narratorKey] ? { key: r.narratorKey, ...CHARACTERS[r.narratorKey] } : pickCharacter(lesson.unit.id);
  const exercises = r.exercises;
  exercises.hard = r.hard;
  session = {
    lesson, exercises, index: r.index, mistakes: r.mistakes, combo: r.combo, bestCombo: r.bestCombo, bonus: r.bonus,
    practice: false, checked: false, answer: null, startedAt: Date.now() - (r.savedAt - r.startedAt),
    narrator, fixedNarrator: r.fixedNarrator, reviewQueue: r.reviewQueue, reviewing: r.reviewing, hardAdded: r.hardAdded,
    hard: r.hard, log: r.log || [],
  };
  session.cast = buildCast(lesson.unit.id, narrator);
  showScreen("lesson");
  SFX.start();
  renderExercise();
  return true;
}

// ---------- 3.3 Coroas por unidade e nível lendário ----------
const MAX_CROWN = 5;

function unitCrowns(unitId) {
  return (state.crowns && state.crowns[unitId]) || 0;
}

// Lição de "subir de nível": mistura mais exigente do conteúdo da unidade
function startLevelUp(unit) {
  if (state.hearts <= 0) { $("#modal-hearts").classList.add("open"); return; }
  const crowns = unitCrowns(unit.id);
  const legendary = crowns >= MAX_CROWN - 1;
  const review = unit.lessons.find((l) => l.review) || unit.lessons[0];
  const lesson = { ...review, id: review.id, unit, levelUp: true, legendary, title: legendary ? "Lendária" : `Nível ${crowns + 1}` };
  let exercises = buildExercises({ ...lesson, review: true }, unit);
  // Quanto maior a coroa, mais produção (montar, digitar, falar) e menos reconhecimento
  const heavy = new Set(["build", "translate-en-pt", "listen-build", "listen-type", "complete-translation", "type", "speak", "verse", "read"]);
  const light = exercises.filter((e) => !heavy.has(e.type));
  const prod = exercises.filter((e) => heavy.has(e.type));
  const keepLight = Math.max(2, 6 - crowns);
  exercises = shuffle(light).slice(0, keepLight).concat(prod);
  exercises.hard = [];
  session = {
    lesson, exercises, index: 0, mistakes: 0, combo: 0, bestCombo: 0, bonus: 0,
    practice: false, checked: false, answer: null, startedAt: Date.now(),
    narrator: pickCharacter(unit.id), reviewQueue: [], reviewing: false, hardAdded: true, hard: [],
    levelUp: true, legendary,
  };
  showScreen("lesson");
  renderExercise();
}

function crownBadge(unit, done) {
  const c = unitCrowns(unit.id);
  if (!done) return "";
  if (c >= MAX_CROWN) return `<span class="crown legendary" title="Lendária">👑</span>`;
  return `<span class="crown" title="${c} de ${MAX_CROWN} coroas">👑 ${c}</span>`;
}

// ---------- 4.2 Meta diária e missões (local) ----------
const DAILY_GOALS = [10, 20, 30, 50];
const QUESTS = [
  { id: "xp", label: "Ganhe XP", key: "xp", target: (g) => g, reward: 5, icon: "⚡" },
  { id: "lessons", label: "Complete 2 lições", key: "lessons", target: () => 2, reward: 5, icon: "📖" },
  { id: "perfect", label: "Faça 1 lição perfeita", key: "perfect", target: () => 1, reward: 10, icon: "🌟" },
  { id: "combo", label: "Acerte 5 seguidas", key: "combo", target: () => 5, reward: 5, icon: "🔥" },
];

function ensureDaily() {
  const t = today();
  if (!state.daily || state.daily.date !== t) {
    state.daily = { date: t, xp: 0, lessons: 0, perfect: 0, combo: 0, claimed: [] };
  }
  if (!state.dailyGoal) state.dailyGoal = 20;
  return state.daily;
}

function recordLesson({ gained, perfect, bestCombo }) {
  const d = ensureDaily();
  // Dia marcado na meta semanal de fidelidade
  state.days = state.days || {};
  state.days[today()] = (state.days[today()] || 0) + gained;
  d.xp += gained;
  d.lessons += 1;
  if (perfect) d.perfect += 1;
  d.combo = Math.max(d.combo, bestCombo || 0);
  // Missões concluídas rendem XP extra
  let extra = 0;
  QUESTS.forEach((q) => {
    const target = q.target(state.dailyGoal);
    if (d[q.key] >= target && !d.claimed.includes(q.id)) {
      d.claimed.push(q.id);
      extra += q.reward;
    }
  });
  if (extra) {
    state.xp += extra;
    d.xp += extra;
    setTimeout(() => toast(`🎯 Missão concluída! +${extra} XP`, "combo"), 900);
  }
  save();
  return extra;
}

function renderDailyCard() {
  const d = ensureDaily();
  const goal = state.dailyGoal;
  const pct = Math.min(100, Math.round((d.xp / goal) * 100));
  const card = $("#card-daily");
  if (!card) return;
  const done = d.xp >= goal;
  card.innerHTML = `
    <h3>🎯 Meta diária <span class="chev" id="daily-edit" title="Alterar meta">⚙️</span></h3>
    <div class="goal-row">
      <div class="goal-ring" style="--p:${pct}"><span>${done ? "✓" : pct + "%"}</span></div>
      <div>
        <p class="goal-main"><b>${d.xp}</b> / ${goal} XP hoje</p>
        <p class="muted">${done ? "Meta batida! Continue firme." : `Faltam ${goal - d.xp} XP`}</p>
      </div>
    </div>
    <div class="quests">
      ${QUESTS.map((q) => {
        const target = q.target(goal);
        const val = Math.min(d[q.key], target);
        const ok = d.claimed.includes(q.id);
        return `<div class="quest${ok ? " ok" : ""}">
          <span class="q-icon">${q.icon}</span>
          <div class="q-body"><div class="q-label">${q.label === "Ganhe XP" ? `Ganhe ${goal} XP` : q.label}</div>
          <div class="q-bar"><div class="q-fill" style="width:${Math.round((val / target) * 100)}%"></div></div></div>
          <span class="q-reward">${ok ? "✓" : `+${q.reward}`}</span>
        </div>`;
      }).join("")}
    </div>`;
  $("#daily-edit").addEventListener("click", () => {
    const i = DAILY_GOALS.indexOf(goal);
    state.dailyGoal = DAILY_GOALS[(i + 1) % DAILY_GOALS.length];
    save();
    renderDailyCard();
    toast(`🎯 Meta diária: ${state.dailyGoal} XP`);
  });
}

// ---------- 4.5 Offline (service worker) ----------
function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  if (!/^https?:$/.test(location.protocol)) return;
  navigator.serviceWorker.register("sw.js").catch(() => {});
}


// ---------- 2.3 Galeria de personagens e ficha ----------
function renderCharacterStrip() {
  const wrap = $("#char-strip");
  if (!wrap) return;
  wrap.innerHTML = `
    <div class="strip-head">
      <div><h2>Personagens bíblicos</h2><p>Conheça pessoas incríveis e suas histórias</p></div>
      <span class="strip-tag">Histórias diferentes. O mesmo Deus fiel.</span>
    </div>
    <div class="strip-row">
      ${CHARACTER_ORDER.filter((k) => CHARACTERS[k]).map((k) => `
        <button class="strip-item" data-char="${k}">
          <span class="strip-face">${charFace(CHARACTERS[k])}</span>
          <span class="strip-name">${CHARACTERS[k].name.split(" (")[0]}</span>
        </button>`).join("")}
    </div>`;
  wrap.querySelectorAll(".strip-item").forEach((b) => b.addEventListener("click", () => openCharacter(b.dataset.char)));
}

function openCharacter(key) {
  const ch = CHARACTERS[key];
  if (!ch) return;
  const unit = CHARACTER_UNIT[key] ? COURSE.find((u) => u.id === CHARACTER_UNIT[key]) : null;
  const icons = ["🕊️", "🛡️", "🙏", "🌟", "❤️", "📖"];
  $("#char-sheet").innerHTML = `
    <div class="cs-hero">${charFace(ch)}</div>
    <div class="cs-body">
      <h3>${ch.name}</h3>
      <p class="cs-title">${ch.title || ""}</p>
      <div class="cs-tags"><span class="cs-virtue">✦ ${ch.virtue || ""}</span><span class="cs-ref">${ch.ref || ""}</span></div>
      <p class="cs-desc">${ch.desc || ""}</p>
      ${ch.lessons ? `<div class="cs-lessons"><h4>Lições-chave</h4>${ch.lessons.map((l, i) => `<div class="cs-lesson"><span>${icons[i % icons.length]}</span>${l}</div>`).join("")}</div>` : ""}
      <div class="cs-actions">
        <button class="btn-audio" id="cs-say" title="Ouvir nome">🔊</button>
        ${unit ? `<button class="btn-main" id="cs-start">Iniciar lições</button>` : `<button class="btn-main blue" id="cs-practice">Praticar com ${ch.name.split(" ")[0]}</button>`}
      </div>
      <button class="btn-ghost modal-close">Fechar</button>
    </div>`;
  const modal = $("#modal-char");
  modal.classList.add("open");
  $("#cs-say").addEventListener("click", () => speak(ch.name.split(" (")[0], { char: ch }));
  modal.querySelector(".modal-close").addEventListener("click", () => modal.classList.remove("open"));
  const start = $("#cs-start");
  if (start) start.addEventListener("click", () => {
    modal.classList.remove("open");
    const next = unit.lessons.find((l) => !state.completed[l.id]) || unit.lessons[unit.lessons.length - 1];
    if (unit.lessons.every((l) => state.completed[l.id])) startLevelUp(unit); else startLesson(next.id);
  });
  const prac = $("#cs-practice");
  if (prac) prac.addEventListener("click", () => {
    modal.classList.remove("open");
    const u = COURSE[Math.floor(Math.random() * COURSE.length)];
    const review = u.lessons.find((l) => l.review);
    startLesson(review.id, ch);
  });
}
