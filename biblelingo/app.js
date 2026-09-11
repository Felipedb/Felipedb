// BibleLingo — lógica do app (trilha, exercícios, corações, XP, ofensiva)

const MAX_HEARTS = 5;
const XP_PER_LESSON = 10;
const XP_PERFECT_BONUS = 5;

// ---------- Estado persistente ----------
const state = load();

function load() {
  const base = {
    xp: 0,
    streak: 0,
    lastStudy: null, // "YYYY-MM-DD" do último dia com lição concluída
    hearts: MAX_HEARTS,
    heartsDay: today(),
    completed: {}, // lessonId -> true
    stars: {}, // lessonId -> 1..3 (melhor resultado)
  };
  try {
    const raw = localStorage.getItem("biblelingo");
    if (raw) Object.assign(base, JSON.parse(raw));
  } catch (e) { /* armazenamento indisponível: segue em memória */ }
  if (!base.stars) base.stars = {};
  // Corações renovam a cada novo dia
  if (base.heartsDay !== today()) {
    base.hearts = MAX_HEARTS;
    base.heartsDay = today();
  }
  // Ofensiva quebra se ficou mais de um dia sem estudar
  if (base.lastStudy && daysBetween(base.lastStudy, today()) > 1) base.streak = 0;
  return base;
}

function save() {
  try { localStorage.setItem("biblelingo", JSON.stringify(state)); } catch (e) {}
}

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function daysBetween(a, b) {
  return Math.round((new Date(b) - new Date(a)) / 86400000);
}

// ---------- Utilidades ----------
const $ = (sel) => document.querySelector(sel);

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---------- Vozes por personagem ----------
// Cada personagem tem um perfil (gênero, tom, velocidade). A voz base vem
// das vozes en-* instaladas no aparelho; tom e velocidade caracterizam
// o personagem mesmo quando só há uma voz disponível.
const FEMALE_HINTS = /female|samantha|victoria|karen|moira|tessa|zira|jenny|aria|serena|allison|ava|susan|catherine|joana|luciana/i;
const MALE_HINTS = /male|daniel|alex\b|fred|david|mark|guy|arthur|oliver|thomas|james|george|rishi/i;

let _voices = { all: [], male: null, female: null, any: null };
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
if ("speechSynthesis" in window) {
  refreshVoices();
  speechSynthesis.onvoiceschanged = refreshVoices;
}

function speak(text, opts = {}) {
  if (!("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const profile = opts.char && opts.char.voice ? opts.char.voice
    : (session && session.voiceChar && session.voiceChar.voice) || null;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = (profile ? profile.rate : 0.95) * (opts.slow ? 0.6 : 1);
  u.pitch = profile ? profile.pitch : 1;
  const voice = profile
    ? (_voices[profile.gender] || _voices.any)
    : _voices.any;
  if (voice) u.voice = voice;
  speechSynthesis.speak(u);
}

function allVocab() {
  return COURSE.flatMap((u) => u.lessons.flatMap((l) => l.vocab || []));
}

function unitVocab(unit) {
  return unit.lessons.flatMap((l) => l.vocab || []);
}

// ---------- Trilha ----------
function flatLessons() {
  return COURSE.flatMap((u) => u.lessons.map((l) => ({ ...l, unit: u })));
}

function lessonUnlocked(lessonId) {
  const list = flatLessons();
  const idx = list.findIndex((l) => l.id === lessonId);
  if (idx === 0) return true;
  return !!state.completed[list[idx - 1].id];
}

function currentLessonId() {
  const list = flatLessons();
  const next = list.find((l) => !state.completed[l.id]);
  return next ? next.id : null;
}

function charFace(ch) {
  return ch.img ? `<img src="${ch.img}" alt="${ch.name}">` : ch.svg;
}

function starsHTML(n, cls = "stars") {
  let s = "";
  for (let i = 1; i <= 3; i++) s += `<span class="${i <= n ? "on" : "off"}">★</span>`;
  return `<span class="${cls}">${s}</span>`;
}

function verseOfDay() {
  const verses = COURSE.flatMap((u) => u.lessons.filter((l) => l.verse).map((l) => l.verse));
  const day = Math.floor(Date.now() / 86400000);
  return verses[day % verses.length];
}

function renderHome() {
  $("#stat-streak").textContent = state.streak;
  $("#streak-days").textContent = state.streak;
  $("#stat-xp").textContent = state.xp;
  $("#stat-hearts").textContent = state.hearts;

  // Avatar e promo
  $("#avatar").innerHTML = charFace(CHARACTERS.jesus);
  $("#promo-char").innerHTML = '<img src="chars/promo.jpg" alt="">';

  // Versículo do dia
  const v = verseOfDay();
  $("#vd-text").textContent = `"${v.text}"`;
  $("#vd-ref").textContent = `${v.ref} — ${v.pt}`;

  // Progresso: unidades totalmente concluídas
  const unitDone = (u) => u.lessons.every((l) => state.completed[l.id]);
  const doneUnits = COURSE.filter(unitDone).length;
  $("#pbar-fill").style.width = `${(doneUnits / COURSE.length) * 100}%`;
  $("#progress-label").textContent = `${doneUnits} de ${COURSE.length} lições concluídas`;

  // Conquistas
  const badgeDefs = [
    { icon: "📖", color: "#58a700", unit: "u1" },
    { icon: "🚢", color: "#7e57c2", unit: "u2" },
    { icon: "👑", color: "#e6a817", unit: "u4" },
    { icon: "📜", color: "#1cb0f6", unit: "u5" },
  ];
  $("#badges").innerHTML = badgeDefs.map((b) => {
    const done = unitDone(COURSE.find((u) => u.id === b.unit));
    return `<span class="badge-hex${done ? "" : " locked"}" style="background:${b.color}">${b.icon}</span>`;
  }).join("");

  // Trilha: um nó por grande lição (unidade), como na referência
  const trail = $("#trail");
  trail.innerHTML = "";
  const currentId = currentLessonId();
  const indents = ["", "indent-1", "indent-2", "indent-1", ""];
  const nodes = document.createElement("div");
  nodes.className = "nodes";

  COURSE.forEach((unit, i) => {
    const row = document.createElement("div");
    row.className = `lesson-row ${indents[i % indents.length]}`;

    const doneCount = unit.lessons.filter((l) => state.completed[l.id]).length;
    const total = unit.lessons.length;
    const done = doneCount === total;
    const hasCurrent = unit.lessons.some((l) => l.id === currentId);
    const unlocked = lessonUnlocked(unit.lessons[0].id);

    // Estrelas da unidade: média das estrelas das lições concluídas
    const starVals = unit.lessons.filter((l) => !l.review).map((l) => state.stars[l.id] || 0);
    const unitStars = done ? Math.round(starVals.reduce((s, x) => s + x, 0) / starVals.length) : (doneCount ? Math.max(1, Math.min(...starVals.filter(Boolean))) : 0);

    const btn = document.createElement("button");
    btn.className = "portrait" + (unlocked ? "" : " locked");
    btn.style.setProperty("--pc", unit.color);
    const face = unit.face === "book"
      ? `<span class="picon">📖</span>`
      : charFace(CHARACTERS[unit.face]);
    const badge = done
      ? `<span class="badge">✓</span>`
      : unlocked ? "" : `<span class="badge lock">🔒</span>`;
    const tip = hasCurrent ? '<span class="start-tip">COMEÇAR</span>' : "";
    btn.innerHTML = `${hasCurrent ? '<span class="pulse"></span>' : ""}${tip}<span class="face">${face}</span>${badge}`;
    btn.addEventListener("click", () => {
      const next = unit.lessons.find((l) => !state.completed[l.id]) || unit.lessons[unit.lessons.length - 1];
      startLesson(next.id);
    });

    const info = document.createElement("div");
    info.className = "lesson-info";
    info.innerHTML = `<h3>${i + 1}. ${unit.title}</h3>
      <div class="lref">${unit.subtitle}${doneCount && !done ? ` · ${doneCount}/${total} etapas` : ""}</div>
      ${starsHTML(unitStars)}`;

    row.appendChild(btn);
    row.appendChild(info);
    nodes.appendChild(row);
  });

  trail.appendChild(nodes);
  drawTrailPath(nodes, "#9db97a");
}

// Desenha o caminho tracejado ligando os nós de uma unidade
function drawTrailPath(nodesEl, color) {
  requestAnimationFrame(() => {
    const old = nodesEl.querySelector(".trail-path");
    if (old) old.remove();
    const nodes = [...nodesEl.querySelectorAll(".portrait")];
    if (nodes.length < 2) return;
    const box = nodesEl.getBoundingClientRect();
    if (!box.height) return;
    const centers = nodes.map((n) => {
      const r = n.getBoundingClientRect();
      return { x: r.left - box.left + r.width / 2, y: r.top - box.top + r.height / 2 };
    });
    let d = `M ${centers[0].x} ${centers[0].y}`;
    for (let i = 1; i < centers.length; i++) {
      const a = centers[i - 1], b = centers[i];
      const my = (a.y + b.y) / 2;
      d += ` C ${a.x} ${my}, ${b.x} ${my}, ${b.x} ${b.y}`;
    }
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "trail-path");
    svg.setAttribute("viewBox", `0 0 ${box.width} ${box.height}`);
    svg.setAttribute("preserveAspectRatio", "none");
    svg.innerHTML = `<path d="${d}" fill="none" stroke="${color}" stroke-opacity="0.25" stroke-width="12" stroke-linecap="round" stroke-dasharray="0.1 22"/>`;
    nodesEl.prepend(svg);
  });
}

// ---------- Efeitos sonoros e feedback tátil ----------
let _audioCtx = null;
function tone(freq, dur, type = "sine", when = 0, gain = 0.16) {
  try {
    _audioCtx = _audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const ctx = _audioCtx;
    if (ctx.state === "suspended") ctx.resume();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    const t0 = ctx.currentTime + when;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(ctx.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.05);
  } catch (e) { /* sem áudio: segue silencioso */ }
}
const SFX = {
  tap: () => tone(620, 0.05, "triangle", 0, 0.05),
  // "tok" de acerto: dois toques curtos ascendentes
  correct: () => { tone(880, 0.09, "triangle", 0, 0.14); tone(1318, 0.16, "triangle", 0.09, 0.14); },
  wrong: () => { tone(196, 0.16, "square", 0, 0.07); tone(147, 0.26, "square", 0.14, 0.06); },
  combo: () => { tone(880, 0.08, "triangle", 0, 0.12); tone(1108, 0.08, "triangle", 0.08, 0.12); tone(1318, 0.18, "triangle", 0.16, 0.12); },
  finish: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.22, "sine", i * 0.12)),
};
function buzz(pattern) {
  try { if (navigator.vibrate) navigator.vibrate(pattern); } catch (e) {}
}

function toast(text, cls = "") {
  let el = $("#toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast";
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = text;
  el.className = `toast show ${cls}`;
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove("show"), 1400);
}

// ---------- Geração de exercícios ----------
const SPEECH_OK = "SpeechRecognition" in window || "webkitSpeechRecognition" in window;

function buildExercises(lesson, unit) {
  const ex = [];
  const pool = allVocab();
  const lessons = lesson.review ? unit.lessons.filter((l) => !l.review) : [lesson];

  const vocab = lesson.review ? shuffle(unitVocab(unit)).slice(0, 6) : lesson.vocab;
  const sentences = lesson.review
    ? shuffle(lessons.flatMap((l) => l.sentences || [])).slice(0, 2)
    : lesson.sentences || [];
  const verses = lesson.review ? lessons.map((l) => l.verse).filter(Boolean) : lesson.verse ? [lesson.verse] : [];
  const dialogues = lesson.review
    ? shuffle(lessons.map((l) => l.dialogue).filter(Boolean)).slice(0, 2)
    : lesson.dialogue ? [lesson.dialogue] : [];
  const quizzes = lesson.review
    ? shuffle(lessons.map((l) => l.quiz).filter(Boolean)).slice(0, 2)
    : lesson.quiz ? [lesson.quiz] : [];

  const distract = (v, key, n = 3) =>
    shuffle(pool.filter((p) => p[key] !== v[key] && p.icon !== v.icon)).slice(0, n);

  vocab.forEach((v, i) => {
    const kind = i % 4;
    if (kind === 0) ex.push({ type: "image-choice", word: v, options: shuffle([v, ...distract(v, "en")]) });
    else if (kind === 1) ex.push({ type: "choice-en-pt", word: v, options: shuffle([v.pt, ...distract(v, "pt").map((p) => p.pt)]) });
    else if (kind === 2) ex.push({ type: "listen", word: v, options: shuffle([v.en, ...distract(v, "en").map((p) => p.en)]) });
    else ex.push({ type: "type", word: v });
  });

  if (vocab.length >= 4) ex.push({ type: "match", pairs: shuffle(vocab).slice(0, 4) });

  const makeBank = (s) => {
    const words = s.en.split(" ");
    const extra = shuffle(pool.map((p) => p.en.replace("to ", "")))
      .filter((w) => !words.includes(w))
      .slice(0, 2);
    return shuffle([...words, ...extra]);
  };
  sentences.forEach((s, i) => {
    ex.push({ type: i === 0 ? "build" : "listen-build", sentence: s, bank: makeBank(s) });
  });
  if (sentences.length === 1) ex.push({ type: "listen-build", sentence: sentences[0], bank: makeBank(sentences[0]) });
  if (SPEECH_OK && sentences.length) ex.push({ type: "speak", sentence: sentences[0] });

  verses.forEach((v) => ex.push({ type: "verse", verse: v, options: shuffle(v.options) }));
  dialogues.forEach((d) => ex.push({ type: "dialogue", dialogue: d, options: shuffle(d.options) }));
  quizzes.forEach((q) => ex.push({ type: "quiz", quiz: q, options: shuffle(q.options) }));

  // Embaralha, mas nunca começa a lição por fala ou digitação
  let list = shuffle(ex);
  const first = list.findIndex((e) => e.type !== "speak" && e.type !== "type");
  if (first > 0) [list[0], list[first]] = [list[first], list[0]];
  return list;
}

// ---------- Fluxo da lição ----------
let session = null;

function startLesson(lessonId) {
  if (state.hearts <= 0) {
    const isRedo = !!state.completed[lessonId];
    if (!isRedo) {
      $("#modal-hearts").classList.add("open");
      return;
    }
  }
  const list = flatLessons();
  const lesson = list.find((l) => l.id === lessonId);
  if (!lesson) return;

  session = {
    lesson,
    exercises: buildExercises(lesson, lesson.unit),
    index: 0,
    mistakes: 0,
    combo: 0,
    bestCombo: 0,
    bonus: 0,
    practice: !!state.completed[lessonId], // refazer lição não perde coração e recupera 1
    checked: false,
    answer: null,
    startedAt: Date.now(),
    narrator: pickCharacter(lesson.unit.id),
  };
  showScreen("lesson");
  renderExercise();
}

function showScreen(name) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  $(`#screen-${name}`).classList.add("active");
  if (name === "home") renderHome();
}

function renderExercise() {
  const ex = session.exercises[session.index];
  session.checked = false;
  session.answer = null;
  session.voiceChar = null;
  session.recognizer = null;

  const fill = $("#progress-fill");
  fill.style.width = `${(session.index / session.exercises.length) * 100}%`;
  fill.classList.remove("shine");
  void fill.offsetWidth;
  fill.classList.add("shine");
  $("#lesson-hearts").textContent = session.practice ? "💪 prática" : `❤️ ${state.hearts}`;

  const footer = $("#footer");
  footer.className = "footer";
  const btn = $("#btn-check");
  btn.textContent = "Verificar";
  btn.disabled = true;
  btn.classList.remove("red", "blue");

  const box = $("#exercise-body");
  box.innerHTML = "";
  box.classList.remove("slide-in");
  void box.offsetWidth;
  box.classList.add("slide-in");
  updateCombo();

  const render = {
    "image-choice": renderImageChoice,
    "choice-en-pt": renderChoiceEnPt,
    "listen": renderListen,
    "type": renderType,
    "match": renderMatch,
    "build": renderBuild,
    "listen-build": renderListenBuild,
    "speak": renderSpeak,
    "verse": renderVerse,
    "dialogue": renderDialogue,
    "quiz": renderQuiz,
  }[ex.type];
  render(ex, box);
  session.practiceRec = null;
  if (ex.type !== "speak" && ex.audioText) box.appendChild(practiceBar(ex));
}

// Opções: string ou { value, html }
function makeOptions(box, options, cols, onSelect) {
  const wrap = document.createElement("div");
  wrap.className = "options" + (cols === 2 ? " grid2" : "");
  options.forEach((opt) => {
    const b = document.createElement("button");
    b.className = "opt";
    if (typeof opt === "string") {
      b.textContent = opt;
      b.dataset.value = opt;
    } else {
      b.innerHTML = opt.html;
      b.dataset.value = opt.value;
      if (opt.cls) b.classList.add(opt.cls);
    }
    b.addEventListener("click", () => {
      if (session.checked) return;
      SFX.tap();
      wrap.querySelectorAll(".opt").forEach((o) => o.classList.remove("selected"));
      b.classList.add("selected");
      session.answer = b.dataset.value;
      $("#btn-check").disabled = false;
      if (onSelect) onSelect(b.dataset.value);
    });
    wrap.appendChild(b);
  });
  box.appendChild(wrap);
  return wrap;
}

// Personagem com balão de fala (estilo Duolingo)
function characterRow(bubbleContent, charKey) {
  const ch = charKey ? { key: charKey, ...CHARACTERS[charKey] } : session.narrator;
  session.voiceChar = ch;
  const row = document.createElement("div");
  row.className = "char-row";
  const fig = document.createElement("div");
  fig.className = "char-fig";
  fig.innerHTML = `${charFace(ch)}<span class="react"></span><span class="char-name">${ch.name}</span>`;
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  if (typeof bubbleContent === "string") bubble.innerHTML = bubbleContent;
  else bubble.appendChild(bubbleContent);
  row.appendChild(fig);
  row.appendChild(bubble);
  return row;
}

function updateCombo() {
  const chip = $("#combo-chip");
  if (chip) {
    chip.textContent = `🔥 ${session.combo}`;
    chip.classList.toggle("show", session.combo >= 3);
  }
  $("#progress-fill").classList.toggle("hot", session.combo >= 5);
}

const PRAISES = ["Excelente!", "Muito bem!", "Incrível!", "Perfeito!", "Isso aí!", "Boa!", "Amém!"];

function reactCharacter(ok) {
  const fig = document.querySelector(".char-fig");
  if (!fig) return;
  const badge = fig.querySelector(".react");
  if (badge) badge.textContent = ok ? ["😊", "🙌", "👏", "✨"][Math.floor(Math.random() * 4)] : "😕";
  fig.classList.remove("happy", "sad");
  void fig.offsetWidth;
  fig.classList.add(ok ? "happy" : "sad");
}

function audioButton(text, opts = {}) {
  const b = document.createElement("button");
  b.className = "btn-audio" + (opts.big ? " big" : "") + (opts.slow ? " slow" : "");
  b.textContent = opts.slow ? "🐢" : "🔊";
  b.title = opts.slow ? "Ouvir devagar" : "Ouvir";
  b.addEventListener("click", () => speak(text, opts.slow ? { slow: true } : {}));
  return b;
}

function audioPair(text) {
  const wrap = document.createElement("div");
  wrap.className = "audio-pair";
  wrap.appendChild(audioButton(text));
  wrap.appendChild(audioButton(text, { slow: true }));
  return wrap;
}

// Dicas: toque numa palavra em português para ver o inglês
const HINTS = (() => {
  const m = {};
  allVocab().forEach((v) => { m[normalize(v.pt)] = v.en; });
  return m;
})();
function sayable(en) {
  return en.split(" ").map((w) => `<span class="say-word">${w}</span>`).join(" ");
}

function hintedText(pt) {
  return pt.split(" ").map((w) => {
    const key = normalize(w);
    return HINTS[key] ? `<span class="hint-word" data-hint="${HINTS[key]}">${w}</span>` : w;
  }).join(" ");
}
document.addEventListener("click", (e) => {
  document.querySelectorAll(".hint-pop").forEach((p) => p.remove());
  const sw = e.target.closest(".say-word");
  if (sw) { speak(sw.textContent.replace(/[.,;:!?'"]/g, "")); return; }
  const w = e.target.closest(".hint-word");
  if (!w) return;
  const pop = document.createElement("span");
  pop.className = "hint-pop";
  pop.textContent = w.dataset.hint;
  w.appendChild(pop);
  speak(w.dataset.hint);
});


// ---------- Prática de pronúncia (reutilizável) ----------
function recognizeOnce(target, { onStart, onEnd, onResult, onError } = {}) {
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

function practiceBar(ex) {
  const bar = document.createElement("div");
  bar.className = "practice-bar";
  const getTarget = () => (session.checked && ex.audioAfter) ? ex.audioAfter : ex.audioText;

  const listen = document.createElement("button");
  listen.className = "pbtn";
  listen.innerHTML = "🔊 <span>Ouvir</span>";
  listen.addEventListener("click", () => speak(getTarget()));

  const slow = document.createElement("button");
  slow.className = "pbtn";
  slow.innerHTML = "🐢";
  slow.title = "Ouvir devagar";
  slow.addEventListener("click", () => speak(getTarget(), { slow: true }));

  const mic = document.createElement("button");
  mic.className = "pbtn mic";
  mic.innerHTML = "🎤 <span>Falar</span>";
  const status = document.createElement("div");
  status.className = "practice-status";
  mic.addEventListener("click", () => {
    if (session.practiceRec) { try { session.practiceRec.stop(); } catch (e) {} return; }
    const target = getTarget();
    session.practiceRec = recognizeOnce(target, {
      onStart: () => { mic.classList.add("listening"); mic.innerHTML = "🎙️ <span>Ouvindo...</span>"; status.textContent = `Diga: "${target}"`; },
      onResult: (r) => {
        if (r.ok) { SFX.correct(); buzz(25); status.textContent = `✅ Boa pronúncia! (${Math.round(r.score * 100)}%)`; }
        else { buzz(60); status.textContent = `🙂 Quase. Você disse: "${r.text}". Tente de novo!`; }
      },
      onError: (err) => {
        status.textContent = err === "unsupported"
          ? "Reconhecimento de voz indisponível neste navegador."
          : err === "not-allowed" ? "Permita o uso do microfone para praticar." : "Não consegui ouvir. Tente de novo.";
      },
      onEnd: () => { session.practiceRec = null; mic.classList.remove("listening"); mic.innerHTML = "🎤 <span>Falar</span>"; },
    });
  });

  bar.appendChild(listen);
  bar.appendChild(slow);
  bar.appendChild(mic);
  const wrap = document.createElement("div");
  wrap.className = "practice-wrap";
  wrap.appendChild(bar);
  wrap.appendChild(status);
  return wrap;
}

// ---------- Renderizadores ----------
function renderImageChoice(ex, box) {
  box.innerHTML = `<div class="ex-title">Selecione a palavra correta</div>`;
  const bubble = document.createElement("div");
  bubble.className = "bubble-inner";
  bubble.appendChild(audioButton(ex.word.en));
  bubble.insertAdjacentHTML("beforeend", `<span class="ex-word">${sayable(ex.word.en)}</span>`);
  box.appendChild(characterRow(bubble));
  makeOptions(box, ex.options.map((o) => ({
    value: o.pt,
    cls: "img-opt",
    html: `<span class="opt-icon">${o.icon}</span><span>${o.pt}</span>`,
  })), 2);
  ex.correct = ex.word.pt;
  ex.explain = `${ex.word.en} = ${ex.word.pt}`;
  ex.audioText = ex.word.en;
}

function renderChoiceEnPt(ex, box) {
  box.innerHTML = `<div class="ex-title">O que significa esta palavra?</div>`;
  const bubble = document.createElement("div");
  bubble.className = "bubble-inner";
  bubble.appendChild(audioButton(ex.word.en));
  bubble.insertAdjacentHTML("beforeend", `<span class="ex-word">${sayable(ex.word.en)}</span>`);
  box.appendChild(characterRow(bubble));
  makeOptions(box, ex.options, 1);
  ex.correct = ex.word.pt;
  ex.explain = `${ex.word.en} = ${ex.word.pt}`;
  ex.audioText = ex.word.en;
}

function bigAudio(text) {
  const wrap = document.createElement("div");
  wrap.className = "big-audio";
  wrap.appendChild(audioButton(text, { big: true }));
  wrap.appendChild(audioButton(text, { slow: true }));
  return wrap;
}

function renderListen(ex, box) {
  box.innerHTML = `<div class="ex-title">Toque no que você ouviu</div>`;
  box.appendChild(bigAudio(ex.word.en));
  makeOptions(box, ex.options, 2, (opt) => speak(opt));
  speak(ex.word.en);
  ex.correct = ex.word.en;
  ex.explain = `${ex.word.en} = ${ex.word.pt}`;
  ex.audioText = ex.word.en;
}

function textInput(placeholder) {
  const inp = document.createElement("input");
  inp.type = "text";
  inp.className = "type-input";
  inp.placeholder = placeholder;
  inp.autocomplete = "off";
  inp.autocapitalize = "off";
  inp.spellcheck = false;
  inp.id = "answer-input";
  inp.addEventListener("input", () => {
    session.answer = inp.value;
    $("#btn-check").disabled = inp.value.trim() === "";
  });
  inp.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !$("#btn-check").disabled) checkAnswer();
  });
  return inp;
}

function renderType(ex, box) {
  box.innerHTML = `<div class="ex-title">Digite em inglês</div>`;
  box.appendChild(characterRow(`<span class="ex-word">${ex.word.icon || ""} ${ex.word.pt}</span>`));
  const inp = textInput("Escreva em inglês...");
  box.appendChild(inp);
  setTimeout(() => inp.focus(), 50);
  ex.correct = ex.word.en;
  ex.accept = [ex.word.en, ex.word.en.replace(/^to /, "")];
  ex.explain = `${ex.word.pt} = ${ex.word.en}`;
  ex.audioText = ex.word.en;
}

function renderVerse(ex, box) {
  const v = ex.verse;
  const gapped = sayable(v.text).replace(`<span class="say-word">${v.blank}</span>`, `<span class="gap" id="verse-gap">&nbsp;</span>`)
    .replace(new RegExp(`<span class="say-word">${v.blank}([.,;:!?])</span>`), `<span class="gap" id="verse-gap">&nbsp;</span>$1`);
  box.innerHTML = `<div class="ex-title">Complete o versículo</div>
    <div class="verse-box">${gapped}</div>
    <div class="verse-ref">${v.ref} — "${v.pt}"</div>`;
  makeOptions(box, ex.options, 2, (opt) => {
    $("#verse-gap").textContent = opt;
    speak(opt);
  });
  ex.correct = v.blank;
  ex.explain = `"${v.text}" — ${v.ref}`;
  ex.audioText = v.text.replace(v.blank, "blank");
  ex.audioAfter = v.text;
}

function renderDialogue(ex, box) {
  const d = ex.dialogue;
  box.innerHTML = `<div class="ex-title">Complete a conversa</div>`;
  const bubble = document.createElement("div");
  bubble.className = "bubble-inner bubble-col";
  const top = document.createElement("div");
  top.className = "bubble-inner";
  top.appendChild(audioButton(d.line));
  top.insertAdjacentHTML("beforeend", `<span class="ex-word">${sayable(d.line)}</span>`);
  bubble.appendChild(top);
  bubble.insertAdjacentHTML("beforeend", `<span class="ex-muted dialog-pt">${d.pt}</span>`);
  box.appendChild(characterRow(bubble));
  box.insertAdjacentHTML("beforeend", `<div class="reply-label">Sua resposta:</div>`);
  makeOptions(box, ex.options, 1, (opt) => speak(opt));
  speak(d.line);
  ex.correct = d.answer;
  ex.explain = `${d.answer} = ${d.answerPt}`;
  ex.audioText = d.line;
  ex.audioAfter = d.answer;
}

function renderQuiz(ex, box) {
  const q = ex.quiz;
  box.innerHTML = `<div class="ex-title">Responda sobre a história</div>`;
  const bubble = document.createElement("div");
  bubble.className = "bubble-inner";
  bubble.appendChild(audioButton(q.q));
  bubble.insertAdjacentHTML("beforeend", `<span class="ex-word ex-q">${sayable(q.q)}</span>`);
  box.appendChild(characterRow(bubble));
  makeOptions(box, ex.options, 1, (opt) => speak(opt));
  speak(q.q);
  ex.correct = q.answer;
  ex.explain = q.explain;
  ex.audioText = q.q;
  ex.audioAfter = q.answer;
}

// Banco de palavras com animação, dicas e teclado
function wordBankUI(ex, box, correctSentence) {
  const zone = document.createElement("div");
  zone.className = "answer-zone";
  const bank = document.createElement("div");
  bank.className = "word-bank";
  const toggle = document.createElement("button");
  toggle.className = "btn-link";
  toggle.textContent = "⌨️ Usar teclado";
  box.appendChild(zone);
  box.appendChild(bank);
  box.appendChild(toggle);

  const chosen = [];
  let keyboard = false;
  function sync() {
    if (keyboard) return;
    session.answer = chosen.map((c) => c.word).join(" ");
    $("#btn-check").disabled = chosen.length === 0;
  }

  ex.bank.forEach((word, i) => {
    const t = document.createElement("button");
    t.className = "tile";
    t.textContent = word;
    t.dataset.i = i;
    t.addEventListener("click", () => {
      if (session.checked) return;
      SFX.tap();
      speak(word);
      const from = t.getBoundingClientRect();
      t.classList.add("ghost");
      const placed = document.createElement("button");
      placed.className = "tile";
      placed.textContent = word;
      const entry = { word, el: placed };
      chosen.push(entry);
      placed.addEventListener("click", () => {
        if (session.checked) return;
        SFX.tap();
        speak(word);
        chosen.splice(chosen.indexOf(entry), 1);
        placed.remove();
        t.classList.remove("ghost");
        sync();
      });
      zone.appendChild(placed);
      // Animação FLIP: a peça "voa" do banco para a resposta
      const to = placed.getBoundingClientRect();
      placed.style.transition = "none";
      placed.style.transform = `translate(${from.left - to.left}px, ${from.top - to.top}px)`;
      requestAnimationFrame(() => {
        placed.style.transition = "transform 0.22s ease";
        placed.style.transform = "";
      });
      sync();
    });
    bank.appendChild(t);
  });

  toggle.addEventListener("click", () => {
    keyboard = !keyboard;
    if (keyboard) {
      zone.hidden = true;
      bank.hidden = true;
      const inp = textInput("Digite a frase em inglês...");
      inp.value = chosen.map((c) => c.word).join(" ");
      session.answer = inp.value;
      $("#btn-check").disabled = inp.value.trim() === "";
      toggle.before(inp);
      inp.focus();
      toggle.textContent = "🧩 Usar banco de palavras";
    } else {
      const inp = $("#answer-input");
      if (inp) inp.remove();
      zone.hidden = false;
      bank.hidden = false;
      toggle.textContent = "⌨️ Usar teclado";
      sync();
    }
  });

  ex.correct = correctSentence;
  ex.explain = `Resposta: "${correctSentence}"`;
  ex.audioText = correctSentence;
}

function renderBuild(ex, box) {
  box.innerHTML = `<div class="ex-title">Escreva em inglês</div>`;
  const bubble = document.createElement("div");
  bubble.className = "bubble-inner";
  bubble.appendChild(audioButton(ex.sentence.en));
  bubble.insertAdjacentHTML("beforeend", `<span class="ex-word">${hintedText(ex.sentence.pt)}</span>`);
  box.appendChild(characterRow(bubble));
  box.insertAdjacentHTML("beforeend", `<div class="tip-line">Toque numa palavra sublinhada para ver a dica</div>`);
  wordBankUI(ex, box, ex.sentence.en);
}

function renderListenBuild(ex, box) {
  box.innerHTML = `<div class="ex-title">Toque no que você ouviu</div>`;
  box.appendChild(bigAudio(ex.sentence.en));
  wordBankUI(ex, box, ex.sentence.en);
  speak(ex.sentence.en);
}

// Fale a frase (reconhecimento de voz do navegador)
function renderSpeak(ex, box) {
  box.innerHTML = `<div class="ex-title">Fale esta frase</div>`;
  const bubble = document.createElement("div");
  bubble.className = "bubble-inner bubble-col";
  const top = document.createElement("div");
  top.className = "bubble-inner";
  top.appendChild(audioPair(ex.sentence.en));
  top.insertAdjacentHTML("beforeend", `<span class="ex-word">${sayable(ex.sentence.en)}</span>`);
  bubble.appendChild(top);
  bubble.insertAdjacentHTML("beforeend", `<span class="ex-muted dialog-pt">${ex.sentence.pt}</span>`);
  box.appendChild(characterRow(bubble));

  const mic = document.createElement("button");
  mic.className = "mic-btn";
  mic.innerHTML = `🎤<span>Toque para falar</span>`;
  const status = document.createElement("div");
  status.className = "mic-status";
  const skip = document.createElement("button");
  skip.className = "btn-link";
  skip.textContent = "Não posso falar agora";
  box.appendChild(mic);
  box.appendChild(status);
  box.appendChild(skip);
  speak(ex.sentence.en);

  mic.addEventListener("click", () => {
    if (session.checked) return;
    if (session.recognizer) { try { session.recognizer.stop(); } catch (e) {} return; }
    session.recognizer = recognizeOnce(ex.sentence.en, {
      onStart: () => { mic.classList.add("listening"); mic.innerHTML = `🎙️<span>Ouvindo...</span>`; status.textContent = ""; },
      onResult: (r) => {
        status.textContent = `Você disse: "${r.text}"`;
        session.answer = r.ok ? ex.sentence.en : r.text;
        $("#btn-check").disabled = false;
        checkAnswer();
      },
      onError: (err) => {
        status.textContent = err === "unsupported" ? "Reconhecimento de voz indisponível neste navegador."
          : err === "not-allowed" ? "Permita o uso do microfone ou pule este exercício." : "Não consegui ouvir. Tente de novo ou pule.";
      },
      onEnd: () => { session.recognizer = null; mic.classList.remove("listening"); mic.innerHTML = `🎤<span>Toque para falar</span>`; },
    });
  });

  skip.addEventListener("click", () => {
    if (session.checked) return;
    ex.skipped = true;
    session.answer = ex.sentence.en;
    $("#btn-check").disabled = false;
    checkAnswer();
  });

  ex.correct = ex.sentence.en;
  ex.explain = `"${ex.sentence.en}" — ${ex.sentence.pt}`;
}

function renderMatch(ex, box) {
  box.innerHTML = `<div class="ex-title">Toque nos pares correspondentes</div>`;
  const grid = document.createElement("div");
  grid.className = "match-cols";
  box.appendChild(grid);

  const left = shuffle(ex.pairs.map((p) => ({ key: p.en, side: "en", label: p.en })));
  const right = shuffle(ex.pairs.map((p) => ({ key: p.en, side: "pt", label: p.pt })));
  let selected = null;
  let matched = 0;

  function cell(item) {
    const b = document.createElement("button");
    b.className = "opt";
    b.textContent = item.label;
    b.addEventListener("click", () => {
      if (b.classList.contains("matched")) return;
      SFX.tap();
      if (item.side === "en") speak(item.label);
      if (!selected) {
        selected = { item, el: b };
        b.classList.add("selected");
        return;
      }
      if (selected.el === b) {
        b.classList.remove("selected");
        selected = null;
        return;
      }
      if (selected.item.key === item.key && selected.item.side !== item.side) {
        [selected.el, b].forEach((el) => { el.classList.remove("selected"); el.classList.add("matched", "pop"); });
        matched++;
        tone(720 + matched * 80, 0.1, "sine", 0, 0.08);
        if (matched === ex.pairs.length) {
          session.answer = "__matched__";
          $("#btn-check").disabled = false;
          checkAnswer();
        }
      } else {
        [selected.el, b].forEach((el) => el.classList.add("wrong"));
        const els = [selected.el, b];
        setTimeout(() => els.forEach((el) => el.classList.remove("wrong", "selected")), 600);
        buzz(60);
        registerMistakeSoft();
      }
      selected = null;
    });
    return b;
  }

  const colA = document.createElement("div");
  const colB = document.createElement("div");
  colA.className = colB.className = "match-col";
  left.forEach((i) => colA.appendChild(cell(i)));
  right.forEach((i) => colB.appendChild(cell(i)));
  grid.appendChild(colA);
  grid.appendChild(colB);

  ex.correct = "__matched__";
  ex.explain = "Pares corretos!";
  ex.audioText = ex.pairs.map((p) => p.en).join(", ");
}

// Erro em pareamento não trava o exercício, mas conta para o bônus perfeito
function registerMistakeSoft() {
  session.mistakes++;
  session.combo = 0;
}

// ---------- Checagem ----------
function normalize(s) {
  return String(s).toLowerCase().replace(/[.,;:!?'"]/g, "").replace(/\s+/g, " ").trim();
}

function checkAnswer() {
  const ex = session.exercises[session.index];
  const btn = $("#btn-check");

  if (!session.checked) {
    session.checked = true;
    if (session.recognizer) { try { session.recognizer.abort(); } catch (e) {} }
    if (session.practiceRec) { try { session.practiceRec.abort(); } catch (e) {} }
    const accepts = ex.accept || [ex.correct];
    const ok = accepts.some((a) => normalize(session.answer) === normalize(a));
    const footer = $("#footer");
    footer.classList.add(ok ? "correct" : "wrong", "up");
    if (ok) {
      $("#fb-ok-title").textContent = ex.skipped ? "Tudo bem, seguimos!" : PRAISES[Math.floor(Math.random() * PRAISES.length)];
      $("#fb-ok-detail").textContent = ex.explain ? `Significado: ${ex.explain}` : "";
    } else {
      $("#fb-bad-title").textContent = "Resposta correta:";
      $("#fb-bad-detail").textContent = ex.correct === "__matched__" ? "" : (ex.correctLabel || ex.correct);
      $("#fb-bad-extra").textContent = ex.explain && ex.explain !== ex.correct ? ex.explain : "";
    }

    // Destaca opções
    document.querySelectorAll(".opt").forEach((o) => {
      const val = o.dataset.value != null ? o.dataset.value : o.textContent;
      if (normalize(val) === normalize(String(ex.correct))) o.classList.add("correct");
      else if (o.classList.contains("selected") && !ok) o.classList.add("wrong");
      else o.classList.add("faded");
    });
    const inp = $("#answer-input");
    if (inp) { inp.disabled = true; inp.classList.add(ok ? "ok" : "bad"); inp.blur(); }

    reactCharacter(ok);

    if (ok) {
      if (ex.skipped) {
        btn.textContent = "Continuar";
      } else {
        session.combo++;
        session.bestCombo = Math.max(session.bestCombo, session.combo);
        updateCombo();
        if (session.combo >= 3) {
          SFX.combo();
          if (session.bonus < 5) session.bonus++;
          toast(`🔥 ${session.combo} seguidas! +1 XP`, "combo");
        } else {
          SFX.correct();
        }
        buzz(25);
        btn.textContent = "Continuar";
      }
    } else {
      session.mistakes++;
      session.combo = 0;
      updateCombo();
      SFX.wrong();
      buzz([60, 40, 60]);
      if (!session.practice) {
        state.hearts = Math.max(0, state.hearts - 1);
        save();
        $("#lesson-hearts").textContent = `❤️ ${state.hearts}`;
      }
      btn.textContent = "Continuar";
      btn.classList.add("red");
      if (!session.practice && state.hearts <= 0) {
        setTimeout(() => {
          $("#modal-hearts").classList.add("open");
          showScreen("home");
        }, 1200);
        return;
      }
    }
    return;
  }

  // Avança
  session.index++;
  if (session.index >= session.exercises.length) {
    finishLesson();
  } else {
    renderExercise();
  }
}

function finishLesson() {
  const perfect = session.mistakes === 0;
  const first = !state.completed[session.lesson.id];
  let gained = session.practice ? 5 : XP_PER_LESSON;
  if (perfect) gained += XP_PERFECT_BONUS;
  gained += session.bonus;

  state.xp += gained;
  state.completed[session.lesson.id] = true;

  // Estrelas: 3 = perfeita, 2 = até 2 erros, 1 = concluída
  const earned = perfect ? 3 : session.mistakes <= 2 ? 2 : 1;
  state.stars[session.lesson.id] = Math.max(state.stars[session.lesson.id] || 0, earned);

  // Prática recupera 1 coração
  if (session.practice && state.hearts < MAX_HEARTS) state.hearts++;

  // Ofensiva
  const t = today();
  if (state.lastStudy !== t) {
    state.streak = state.lastStudy && daysBetween(state.lastStudy, t) === 1 ? state.streak + 1 : 1;
    state.lastStudy = t;
  }
  save();

  // Personagem comemorando + confete
  const ch = pickCharacter(session.lesson.unit.id);
  $("#result-char").innerHTML = charFace(ch);
  $("#result-emoji").style.display = "none";
  SFX.finish();
  buzz([40, 30, 40, 30, 80]);
  if (typeof confetti === "function") {
    confetti({ particleCount: 90, spread: 75, origin: { y: 0.35 }, ticks: 180 });
    if (perfect) setTimeout(() => confetti({ particleCount: 60, spread: 100, origin: { y: 0.3 } }), 350);
  }

  const secs = Math.round((Date.now() - session.startedAt) / 1000);
  const mm = Math.floor(secs / 60), ss = String(secs % 60).padStart(2, "0");
  $("#result-stars").innerHTML = starsHTML(earned, "");
  $("#result-emoji").textContent = perfect ? "🌟" : "🎉";
  $("#result-title").textContent = perfect ? "Lição perfeita!" : "Lição concluída!";
  $("#result-sub").textContent = (first ? "Você avançou na trilha." : "Ótima prática!")
    + ` ⏱️ ${mm}:${ss}` + (session.bonus ? ` · 🔥 combo +${session.bonus} XP` : "");
  $("#result-xp").textContent = `+${gained}`;
  $("#result-streak").textContent = state.streak;
  $("#result-acc").textContent = `${Math.max(0, Math.round((1 - session.mistakes / Math.max(1, session.exercises.length)) * 100))}%`;

  const blessings = [
    { t: "I can do all things through Christ which strengtheneth me.", r: "Filipenses 4:13" },
    { t: "The joy of the LORD is your strength.", r: "Neemias 8:10" },
    { t: "Be strong and of a good courage.", r: "Josué 1:9" },
    { t: "Thy word is a lamp unto my feet.", r: "Salmos 119:105" },
  ];
  const b = blessings[Math.floor(Math.random() * blessings.length)];
  $("#result-verse").innerHTML = `"${b.t}"<br><b>${b.r}</b>`;

  $("#progress-fill").style.width = "100%";
  showScreen("result");
}

// ---------- Eventos globais ----------
$("#btn-check").addEventListener("click", checkAnswer);
$("#btn-quit").addEventListener("click", () => {
  speechSynthesis && speechSynthesis.cancel();
  showScreen("home");
});
$("#btn-result-continue").addEventListener("click", () => showScreen("home"));
$("#btn-modal-close").addEventListener("click", () => $("#modal-hearts").classList.remove("open"));
$("#btn-modal-practice").addEventListener("click", () => {
  $("#modal-hearts").classList.remove("open");
  // Abre a última lição concluída como prática para recuperar coração
  const doneIds = flatLessons().filter((l) => state.completed[l.id]).map((l) => l.id);
  if (doneIds.length) startLesson(doneIds[doneIds.length - 1]);
});

// Atalhos de teclado na lição (desktop)
document.addEventListener("keydown", (e) => {
  if (!session || !$("#screen-lesson").classList.contains("active")) return;
  const inInput = e.target && e.target.tagName === "INPUT";
  if ((e.key === "Enter" || (e.key === " " && session.checked)) && !inInput && !$("#btn-check").disabled) { e.preventDefault(); checkAnswer(); return; }
  if (!inInput && !session.checked && /^[1-9]$/.test(e.key)) {
    const opts = document.querySelectorAll(".options .opt");
    const o = opts[Number(e.key) - 1];
    if (o) o.click();
  }
});

// Navegação (sidebar/rodapé)
function setNav(name) {
  document.querySelectorAll(".nav-item").forEach((b) => b.classList.toggle("active", b.dataset.nav === name));
}
document.querySelectorAll(".nav-item").forEach((b) => {
  b.addEventListener("click", () => {
    const nav = b.dataset.nav;
    setNav(nav === "estatisticas" || nav === "config" ? "inicio" : nav);
    if (nav === "inicio") window.scrollTo({ top: 0, behavior: "smooth" });
    if (nav === "licoes") $("#trail").scrollIntoView({ behavior: "smooth", block: "start" });
    if (nav === "conquistas") $("#card-conquistas").scrollIntoView({ behavior: "smooth", block: "center" });
    if (nav === "estatisticas") {
      const totalStars = Object.values(state.stars).reduce((s, x) => s + x, 0);
      const doneLessons = Object.keys(state.completed).length;
      $("#stats-body").innerHTML = `
        <p>⚡ <b>${state.xp}</b> XP acumulado</p>
        <p>🔥 <b>${state.streak}</b> dias de sequência</p>
        <p>✅ <b>${doneLessons}</b> etapas concluídas</p>
        <p>⭐ <b>${totalStars}</b> estrelas conquistadas</p>
        <p>❤️ <b>${state.hearts}</b> corações hoje</p>`;
      $("#modal-stats").classList.add("open");
    }
    if (nav === "config") $("#modal-config").classList.add("open");
  });
});
document.querySelectorAll(".modal-close").forEach((b) =>
  b.addEventListener("click", () => b.closest(".modal-backdrop").classList.remove("open")));
$("#btn-reset").addEventListener("click", () => {
  if (!confirm("Apagar todo o progresso deste aparelho?")) return;
  try { localStorage.removeItem("biblelingo"); } catch (e) {}
  location.reload();
});
$("#card-verse").addEventListener("click", () => {
  const v = verseOfDay();
  speak(v.text, { char: CHARACTERS.jesus });
});

renderHome();
showScreen("home");
// Redesenha o caminho quando fontes carregam ou a janela muda de tamanho
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => renderHome());
let _rz;
window.addEventListener("resize", () => {
  clearTimeout(_rz);
  _rz = setTimeout(() => { if ($("#screen-home").classList.contains("active")) renderHome(); }, 200);
});
