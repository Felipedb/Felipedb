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
    errors: {}, // palavra EN -> vezes errada (para "Praticar erros")
    speakMutedUntil: 0,
    listenMutedUntil: 0,
    sound: true, // efeitos sonoros
    crowns: {}, // unitId -> 0..5
    daily: null, // meta diária e missões do dia
    dailyGoal: 20,
    theme: "auto", // "light" | "dark" | "auto"
    name: "", // como o app te chama na saudação
    days: {}, // "YYYY-MM-DD" -> XP do dia (meta semanal)
    chests: {}, // unitId -> true (baú da unidade aberto)
    words: {}, // palavra EN -> { lvl, ok, bad, last } (repetição espaçada)
    resume: null, // lição interrompida, para retomar no ponto
    joined: null, // "YYYY-MM-DD" do primeiro acesso (perfil)
  };
  try {
    const raw = localStorage.getItem("biblelingo");
    if (raw) Object.assign(base, JSON.parse(raw));
  } catch (e) { /* armazenamento indisponível: segue em memória */ }
  if (!base.stars) base.stars = {};
  if (!base.errors) base.errors = {};
  if (!base.crowns) base.crowns = {};
  if (!base.days) base.days = {};
  if (!base.chests) base.chests = {};
  ensureDay(base);
  return base;
}

// Virada do dia com o app aberto: corações renovam e a ofensiva quebra sem precisar recarregar
function ensureDay(st) {
  const s = st || state;
  if (!s) return;
  if (s.heartsDay !== today()) {
    s.hearts = MAX_HEARTS;
    s.heartsDay = today();
  }
  if (s.lastStudy && daysBetween(s.lastStudy, today()) > 1) s.streak = 0;
}

// ---------- Tema (claro / escuro / automático) ----------
const _darkQuery = window.matchMedia ? matchMedia("(prefers-color-scheme: dark)") : null;
function applyTheme() {
  const dark = state.theme === "dark" || (state.theme !== "light" && _darkQuery && _darkQuery.matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = dark ? "#17140f" : "#58a700";
  document.querySelectorAll("[data-theme-opt]").forEach((b) =>
    b.setAttribute("aria-pressed", b.dataset.themeOpt === (state.theme || "auto")));
}
if (_darkQuery) _darkQuery.addEventListener("change", () => { if (state.theme !== "light" && state.theme !== "dark") applyTheme(); });

function save() {
  try { localStorage.setItem("biblelingo", JSON.stringify(state)); } catch (e) {}
}

// Chave de dia no fuso local (AAAA-MM-DD); toda leitura e escrita de state.days usa esta forma
function dateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function today() {
  return dateKey(new Date());
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
  const ch = opts.char || (session && session.voiceChar) || null;
  if (playClip(text, ch && ch.key, opts.slow, () => speakTTS(text, ch, opts))) {
    if ("speechSynthesis" in window) speechSynthesis.cancel();
    const fig = document.querySelector(".sc-face.now, .scene-img, .char-card .char-fig");
    if (fig) { fig.classList.add("talking"); setTimeout(() => fig.classList.remove("talking"), Math.min(4000, 400 + text.length * 70)); }
    return;
  }
  speakTTS(text, ch, opts);
}

// Síntese do navegador (reserva quando não há clipe gravado ou ele falhou)
function speakTTS(text, ch, opts = {}) {
  if (!("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const profile = ch && ch.voice ? ch.voice : null;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = (profile ? profile.rate : 0.95) * (opts.slow ? 0.6 : 1);
  u.pitch = profile ? profile.pitch : 1;
  const voice = profile
    ? (_voices[profile.gender] || _voices.any)
    : _voices.any;
  if (voice) u.voice = voice;
  const fig = document.querySelector(".sc-face.now, .scene-img, .char-card .char-fig");
  if (fig) { u.onstart = () => fig.classList.add("talking"); u.onend = u.onerror = () => fig.classList.remove("talking"); }
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
  return COURSE.flatMap((u) => (typeof unitSteps === "function" ? unitSteps(u) : u.lessons.map((l) => ({ ...l, unit: u }))));
}

// Capítulo concluído: todas as etapas (lições e cenas)
function unitDone(unit) {
  const steps = typeof unitSteps === "function" ? unitSteps(unit) : unit.lessons;
  return steps.every((l) => state.completed[l.id]);
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
  return ch.img ? `<img src="${ch.img}" alt="${ch.name}">` : ch.emoji ? `<span class="emoji-face" role="img" aria-label="${ch.name}">${ch.emoji}</span>` : ch.svg;
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
  ensureDay();
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set("stat-streak", state.streak);
  set("stat-xp", state.xp);
  set("stat-hearts", state.hearts);
  set("hud-streak", state.streak);
  set("hud-xp", state.xp);
  set("hud-hearts", state.hearts);
  const av = $("#avatar"); if (av) av.innerHTML = charFace(CHARACTERS.jesus);
  const pc = $("#promo-char"); if (pc) pc.innerHTML = '<img src="chars/promo.jpg" alt="">';

  // Progresso: capítulos totalmente concluídos (rail do desktop)
  const doneUnits = COURSE.filter(unitDone).length;
  const pf = $("#pbar-fill"); if (pf) pf.style.width = `${(doneUnits / COURSE.length) * 100}%`;
  set("progress-label", `${doneUnits} de ${COURSE.length} capítulos concluídos`);
  const errBtn = $("#btn-practice-errors");
  const nErr = Object.keys(state.errors || {}).length;
  if (errBtn) { errBtn.hidden = nErr === 0; errBtn.textContent = `🔁 Praticar erros (${nErr})`; errBtn.onclick = startErrorPractice; }

  // Barra superior: testamento/capítulo da etapa atual
  const currentId = currentLessonId();
  const cur = flatLessons().find((l) => l.id === currentId);
  if (cur) set("tb-course-name", `${testamentOf(cur.unit, COURSE.indexOf(cur.unit))} · Cap. ${COURSE.indexOf(cur.unit) + 1}`);

  renderTrail(currentId);
  renderContinueCTA(currentId);
}

// Faixa dos 7 dias da semana (segunda a domingo), como a meta de fidelidade da referência
function renderWeek() {
  const strip = $("#week-strip");
  if (!strip) return;
  const labels = ["S", "T", "Q", "Q", "S", "S", "D"];
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  const hoje = today();
  let feitos = 0;
  strip.innerHTML = labels.map((lb, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const iso = dateKey(d);
    const studied = (state.days || {})[iso] > 0;
    if (studied) feitos++;
    const isToday = iso === hoje;
    const future = iso > hoje;
    const cls = studied ? "done" : isToday ? "today" : future ? "future" : "";
    const mark = studied ? "✓" : isToday ? "★" : future ? "🔒" : "·";
    return `<span class="week-day ${cls}"><i>${mark}</i><span>${lb}</span></span>`;
  }).join("");
  const wc = $("#week-count");
  if (wc) wc.textContent = `${feitos} de 7`;
}

// Botão fixo "Continuar" com a próxima etapa
function renderContinueCTA(currentId) {
  const cta = $("#cta-continue");
  if (!cta) return;
  const r = resumable();
  const lesson = r ? r.lesson : flatLessons().find((l) => l.id === currentId);
  if (!lesson) { cta.hidden = true; return; }
  cta.hidden = false;
  cta.innerHTML = r
    ? `${ICONS.play || ""}<span>Retomar: ${lesson.title} (${Math.min(r.index + 1, r.exercises.length)}/${r.exercises.length})</span>`
    : `${ICONS.play || ""}<span>${lesson.scene ? "Cena" : "Continuar"}: ${lesson.title} (+${XP_PER_LESSON} XP)</span>`;
  cta.style.bottom = matchMedia("(min-width: 980px)").matches ? "18px" : "calc(72px + env(safe-area-inset-bottom))";
  cta.onclick = () => startLesson(lesson.id);
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

// ---------- Feedback tátil (os efeitos sonoros estão em sfx.js) ----------
const REDUCED_MOTION = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
if (REDUCED_MOTION) window.confetti = () => {};
function buzz(pattern) {
  if (REDUCED_MOTION) return;
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

// Montador de lição inspirado no "session generator" do Duolingo:
// muitos candidatos por item -> seleção com cobertura + teto por tipo -> rampa de dificuldade -> sem repetição vizinha.
const EX_RANK = { "image-choice": 0, "choice-en-pt": 1, "choice-pt-en": 2, "match": 2, "listen-match": 3, "listen": 3, "listen-choice": 4, "listen-build": 4, "missing-word": 5, "verse": 5, "translate-en-pt": 6, "build": 6, "complete-translation": 7, "listen-type": 7, "type": 7, "speak": 8, "read": 9, "dialogue": 9, "quiz": 10 };
const LESSON_SIZE = 15;      // como no Duolingo (combo máximo 15)
const MAX_PER_TYPE = 2;      // nenhum formato domina a lição
const TYPE_CAP = { "image-choice": 3, "choice-en-pt": 3 }; // formatos de apresentação de palavra nova podem aparecer 3x
const capOf = (t) => TYPE_CAP[t] || MAX_PER_TYPE;

function allSentences() {
  return COURSE.flatMap((u) => u.lessons.flatMap((l) => (l.sentences || []).map((s) => ({ ...s, unit: u.id }))));
}
function exKey(e) {
  return e.word ? "w:" + e.word.en : e.sentence ? "s:" + e.sentence.en : e.type;
}

// Fábrica de exercícios por formato (usada pelo montador e pela adaptação durante a lição)
let _distractUnit = null; // unidade da lição em montagem (distratores da mesma unidade primeiro)
const exDistract = (v, key, n = 3) => {
  const pool = allVocab().filter((p) => p[key] !== v[key] && p.icon !== v.icon && p.pt !== v.pt);
  const unitWords = _distractUnit ? shuffle(unitVocab(_distractUnit).filter((p) => pool.includes(p))) : [];
  const rest = shuffle(pool.filter((p) => !unitWords.includes(p)));
  return [...unitWords, ...rest].slice(0, n);
};
// Palavras próximas (distância de edição) para lacunas: "heaven" ao lado de "seven", não de "fish"
const exNearWords = (target, n = 2) => {
  const words = [...new Set(allVocab().map((p) => p.en.replace(/^to /, "")))].filter((w) => normalize(w) !== normalize(target));
  const ranked = words.map((w) => ({ w, d: editDistance(w.toLowerCase(), target.toLowerCase()) + Math.random() * 1.5 })).sort((a, b) => a.d - b.d);
  return ranked.slice(0, n).map((x) => x.w);
};
const exBank = (s, lang = "en") => {
  const words = s[lang].split(" ");
  const extra = shuffle(allVocab().map((p) => p[lang].replace("to ", ""))).filter((w) => !words.includes(w)).slice(0, 2);
  return shuffle([...words, ...extra]);
};
const exBlankOf = (s) => {
  const pool = allVocab();
  const words = s.en.split(" ");
  const cands = words.filter((w) => pool.some((p) => normalize(p.en.replace(/^to /, "")) === normalize(w)) && w.length > 2);
  return cands.length ? cands[Math.floor(Math.random() * cands.length)] : null;
};
const exPtDistractors = (s, unitId) =>
  shuffle(allSentences().filter((o) => o.pt !== s.pt)).sort((a, b) => (b.unit === unitId) - (a.unit === unitId)).slice(0, 2).map((o) => o.pt);
const EX_MAKE = {
  "image-choice": (w) => ({ type: "image-choice", word: w, options: shuffle([w, ...exDistract(w, "en")]) }),
  "choice-en-pt": (w) => ({ type: "choice-en-pt", word: w, options: shuffle([w.pt, ...exDistract(w, "pt").map((p) => p.pt)]) }),
  "choice-pt-en": (w) => ({ type: "choice-pt-en", word: w, options: shuffle([w.en, ...exDistract(w, "en").map((p) => p.en)]) }),
  "listen": (w) => ({ type: "listen", word: w, options: shuffle([w.en, ...exDistract(w, "en").map((p) => p.en)]) }),
  "type": (w) => ({ type: "type", word: w }),
  "build": (s) => ({ type: "build", sentence: s, bank: exBank(s) }),
  "translate-en-pt": (s) => ({ type: "translate-en-pt", sentence: s, bank: exBank(s, "pt") }),
  "listen-build": (s) => ({ type: "listen-build", sentence: s, bank: exBank(s) }),
  "listen-type": (s) => ({ type: "listen-type", sentence: s }),
  "listen-choice": (s, unitId) => ({ type: "listen-choice", sentence: s, options: shuffle([s.pt, ...exPtDistractors(s, unitId)]) }),
  "missing-word": (s, blank) => ({ type: "missing-word", sentence: s, blank, options: shuffle([blank, ...exNearWords(blank, 2)]) }),
  "complete-translation": (s, blank) => ({ type: "complete-translation", sentence: s, blank }),
  "speak": (s) => ({ type: "speak", sentence: s }),
  "match": (pairs) => ({ type: "match", pairs }),
  "listen-match": (pairs) => ({ type: "listen-match", pairs }),
};
const LISTEN_TYPES = ["listen", "listen-choice", "listen-build", "listen-type", "listen-match", "scene-listen"];
const listenMuted = () => state.listenMutedUntil && Date.now() < state.listenMutedUntil;
// Troca os exercícios de escuta que ainda vêm por equivalentes sem áudio ("Não posso ouvir agora")
function replaceUpcomingListening() {
  const map = { "listen": (e) => EX_MAKE["choice-pt-en"](e.word), "listen-choice": (e) => EX_MAKE["translate-en-pt"](e.sentence), "listen-build": (e) => EX_MAKE.build(e.sentence), "listen-type": (e) => EX_MAKE.build(e.sentence), "listen-match": (e) => EX_MAKE.match(e.pairs),
    "scene-listen": (e) => ({ type: "scene-read", sceneId: e.sceneId, lis: [e.li], silent: true }) };
  session.exercises = session.exercises.map((e, i) => (i > session.index && map[e.type]) ? Object.assign(map[e.type](e), { isReview: e.isReview }) : e);
  session.hard = session.hard.filter((e) => !LISTEN_TYPES.includes(e.type));
}

function buildExercises(lesson, unit) {
  _distractUnit = unit;
  const lessons = lesson.review ? unit.lessons.filter((l) => !l.review) : [lesson];
  const speakMuted = state.speakMutedUntil && Date.now() < state.speakMutedUntil;
  const canSpeak = SPEECH_OK && !speakMuted;
  const firstTime = !state.completed[lesson.id];

  // 4 palavras por lição (como no Duolingo): na 1ª vez, as palavras-base; ao refazer, sorteia entre todas
  const vocab = lesson.review ? weakestWords(unitVocab(unit), 4)
    : firstTime ? (lesson.vocab || []).slice(0, 4) : shuffle(lesson.vocab || []).slice(0, 4);
  const sentences = lesson.review
    ? shuffle(lessons.flatMap((l) => l.sentences || [])).slice(0, 3)
    : shuffle(lesson.sentences || []).slice(0, 3);
  const verses = lesson.review ? shuffle(lessons.map((l) => l.verse).filter(Boolean)).slice(0, 1) : lesson.verse ? [lesson.verse] : [];
  const stories = shuffle([
    ...lessons.map((l) => l.reading && { type: "read", reading: l.reading, options: shuffle(l.reading.options) }),
    ...lessons.map((l) => l.dialogue && { type: "dialogue", dialogue: l.dialogue, options: shuffle(l.dialogue.options) }),
    ...lessons.map((l) => l.quiz && { type: "quiz", quiz: l.quiz, options: shuffle(l.quiz.options) }),
  ].filter(Boolean));

  const make = EX_MAKE;

  const count = {};
  const chosen = [];
  const take = (e) => { if (!e) return false; count[e.type] = (count[e.type] || 0) + 1; chosen.push(e); return true; };
  const pick = (types, item, extra) => {
    for (const t of types) if ((count[t] || 0) < capOf(t)) return take(make[t](item, extra));
    return false;
  };

  // 1) Cobertura obrigatória: cada palavra é apresentada de forma receptiva (com dica), alternando o formato
  const noListen = (arr) => listenMuted() ? arr.filter((t) => !LISTEN_TYPES.includes(t)) : arr;
  const introTypes = noListen(firstTime ? ["image-choice", "choice-en-pt"] : ["image-choice", "choice-en-pt", "listen", "choice-pt-en"]);
  vocab.forEach((w, i) => {
    const rot = introTypes.slice(i % introTypes.length).concat(introTypes.slice(0, i % introTypes.length));
    pick(rot.concat(["listen", "choice-pt-en"]), w);
  });
  // 2) Cada frase em um formato diferente (rotação), no máximo 2 do mesmo tipo
  const sentTypes = noListen(firstTime
    ? ["build", "listen-choice", "listen-build", "translate-en-pt", "listen-type"]
    : ["listen-type", "translate-en-pt", "listen-build", "build", "listen-choice"]);
  sentences.forEach((s, i) => {
    const rot = sentTypes.slice(i % sentTypes.length).concat(sentTypes.slice(0, i % sentTypes.length));
    pick(rot, s, unit.id);
  });
  if (vocab.length >= 4) take(EX_MAKE[(firstTime || listenMuted() || Math.random() < 0.5) ? "match" : "listen-match"](shuffle(vocab).slice(0, 4)));
  verses.forEach((v) => take({ type: "verse", verse: v, options: shuffle(v.options) }));

  // 3) Complementos até fechar o tamanho da lição: recordação da palavra (formato diferente), lacunas, história, fala
  const optional = [];
  vocab.forEach((w, i) => {
    const already = chosen.filter((e) => e.word === w).map((e) => e.type);
    const order = noListen(i % 2 === 0 ? ["listen", "type", "choice-pt-en", "choice-en-pt"] : ["type", "choice-pt-en", "listen", "image-choice"]);
    const t = order.find((x) => !already.includes(x));
    if (t) optional.push({ pri: 1, mk: () => make[t](w), type: t });
  });
  sentences.forEach((s, i) => {
    const blank = exBlankOf(s);
    if (blank) optional.push({ pri: 2, mk: () => make[i % 2 ? "complete-translation" : "missing-word"](s, blank), type: i % 2 ? "complete-translation" : "missing-word" });
  });
  stories.slice(0, lesson.review ? 2 : 1).forEach((st) => optional.push({ pri: 1, mk: () => st, type: st.type }));
  stories.slice(lesson.review ? 2 : 1, lesson.review ? 3 : 2).forEach((st) => optional.push({ pri: 3, mk: () => st, type: st.type }));
  if (canSpeak && sentences.length) optional.push({ pri: 1, mk: () => ({ type: "speak", sentence: sentences[0] }), type: "speak" });
  // Exercício de revisão de lição anterior (como o "review exercise" do Duolingo)
  const earlier = flatLessons().filter((l) => !l.review && !l.scene && state.completed[l.id] && l.id !== lesson.id).flatMap((l) => l.vocab || []);
  if (earlier.length && !lesson.review) {
    const w = weakestWords(earlier, 3)[Math.floor(Math.random() * Math.min(3, earlier.length))]; // entre as 3 mais urgentes
    optional.push({ pri: 2, mk: () => ({ ...make[Math.random() < 0.5 ? "listen" : "choice-pt-en"](w), isReview: true }), type: "review" });
  }
  const target = LESSON_SIZE + 1; // +1 reservado como desafio final
  shuffle(optional).sort((a, b) => a.pri - b.pri).forEach((o) => {
    if (chosen.length >= target) return;
    if (o.type !== "review" && (count[o.type] || 0) >= capOf(o.type)) return;
    take(o.mk());
  });

  // "Dificuldade desejável": 1 exercício mais difícil fica reservado para o fim, liberado se a lição estiver sem erros
  const hard = [];
  const reserve = (t) => { const j = chosen.findIndex((e) => e.type === t); if (j >= 0) hard.push(...chosen.splice(j, 1)); };
  reserve("listen-type");
  if (!hard.length) reserve("type");

  // 4) Rampa de dificuldade com variação + regras de vizinhança:
  //    nunca o mesmo formato nem o mesmo item em sequência; a apresentação da palavra vem antes da cobrança.
  const isIntro = (e) => e.type === "image-choice" || e.type === "choice-en-pt";
  const cands = chosen.map((e) => ({ e, k: isIntro(e) ? Math.random() * 420 : EX_RANK[e.type] * 100 + Math.random() * 160 })).sort((x, y) => x.k - y.k).map((x) => x.e);
  const introOf = {};
  cands.forEach((e) => { if (e.word && introOf[e.word.en] == null) introOf[e.word.en] = e; });
  const placed = new Set();
  const ordered = [];
  while (cands.length) {
    const prev = ordered[ordered.length - 1];
    const ok = (e) => (!e.word || introOf[e.word.en] === e || placed.has(introOf[e.word.en]));
    const differs = (a, b) => !a || !b || (a.type !== b.type && exKey(a) !== exKey(b));
    let j = cands.findIndex((e) => ok(e) && differs(e, prev));
    if (j >= 0) { const e = cands.splice(j, 1)[0]; placed.add(e); ordered.push(e); continue; }
    // Sobrou só candidato parecido com o anterior: encaixa mais cedo, onde não repete vizinho
    j = cands.findIndex(ok); if (j < 0) j = 0;
    const e = cands.splice(j, 1)[0];
    let p = ordered.length;
    for (let q = ordered.length - 1; q > 0; q--) {
      const introIdx = e.word && introOf[e.word.en] !== e ? ordered.indexOf(introOf[e.word.en]) : -1;
      if (q <= introIdx) break;
      if (differs(e, ordered[q - 1]) && differs(e, ordered[q])) { p = q; break; }
    }
    placed.add(e);
    ordered.splice(p, 0, e);
  }
  // Etiqueta "Nova palavra" na primeira cobrança de cada palavra
  if (firstTime && !lesson.review) {
    const seen = new Set();
    ordered.forEach((e) => { if (e.word && !e.isReview && !seen.has(e.word.en)) { seen.add(e.word.en); e.newWord = true; } });
  }
  ordered.hard = hard;
  return ordered;
}

// ---------- Fluxo da lição ----------
let session = null;

function startLesson(lessonId, narrator) {
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
  if (!lessonUnlocked(lessonId)) { toast("🔒 Conclua a etapa anterior primeiro"); return; }
  ensureDay();
  // Lição interrompida: retoma do ponto em vez de recomeçar
  const r = resumable();
  if (r && r.lessonId === lessonId && !narrator && resumeLesson()) return;

  const heroKey = lesson.scene && SCENE_BY_ID[lesson.sceneId] && SCENE_BY_ID[lesson.sceneId].char;
  if (heroKey) narrator = castChar(heroKey);
  session = {
    lesson,
    exercises: lesson.scene ? buildSceneExercises(lesson) : buildExercises(lesson, lesson.unit),
    index: 0,
    mistakes: 0,
    combo: 0,
    bestCombo: 0,
    bonus: 0,
    practice: !!state.completed[lessonId], // refazer lição não perde coração e recupera 1
    checked: false,
    answer: null,
    startedAt: Date.now(),
    narrator: narrator || pickCharacter(lesson.unit.id),
    fixedNarrator: !!narrator || !!heroKey,
    reviewQueue: [],
    reviewing: false,
    hardAdded: false,
    log: [],
  };
  session.hard = session.exercises.hard || [];
  session.cast = buildCast(lesson.unit.id, session.narrator);
  session.cast.forEach((c) => { if (c.img) { const im = new Image(); im.src = c.img; } }); // pré-carrega os retratos
  showScreen("lesson");
  SFX.start();
  renderExercise();
}

function showScreen(name) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  $(`#screen-${name}`).classList.add("active");
  document.body.classList.toggle("tabs", TAB_SCREENS.includes(name));
  const nav = Object.keys(NAV_TO_SCREEN).find((k) => NAV_TO_SCREEN[k] === name);
  if (nav) setNav(nav);
  if (name === "home") { renderHome(); scrollToCurrentNode(false); }
  else window.scrollTo(0, 0);
  if (name === "hub") renderHub();
  if (name === "quests") renderQuests();
  if (name === "characters") renderCharacters();
  if (name === "profile") renderProfile();
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
  const lvl = $("#level-chip");
  if (lvl) { lvl.hidden = !session.levelUp; lvl.textContent = session.legendary ? "👑 Lendária" : `👑 Nível ${unitCrowns(session.lesson.unit.id) + 1}`; }

  const footer = $("#footer");
  footer.className = "footer";
  const btn = $("#btn-check");
  btn.textContent = "Verificar";
  const exp0 = $("#btn-explain"); if (exp0) exp0.hidden = true;
  const expp = $("#fb-explain"); if (expp) { expp.hidden = true; expp.textContent = ""; }
  btn.disabled = true;
  btn.classList.remove("red", "blue");

  saveResume();
  const box = $("#exercise-body");
  box.innerHTML = "";
  box.classList.remove("slide-in");
  void box.offsetWidth;
  box.classList.add("slide-in");
  updateCombo();

  const render = {
    "image-choice": renderImageChoice,
    "translate-en-pt": renderTranslateEnPt,
    "listen-type": renderListenType,
    "missing-word": renderMissingWord,
    "complete-translation": renderCompleteTranslation,
    "read": renderRead,
    "choice-en-pt": renderChoiceEnPt,
    "listen": renderListen,
    "listen-choice": renderListenChoice,
    "choice-pt-en": renderChoicePtEn,
    "type": renderType,
    "match": renderMatch,
    "listen-match": renderMatch,
    "build": renderBuild,
    "listen-build": renderListenBuild,
    "speak": renderSpeak,
    "verse": renderVerse,
    "dialogue": renderDialogue,
    "quiz": renderQuiz,
  }[ex.type] || (typeof SCENE_RENDER !== "undefined" && SCENE_RENDER[ex.type]);
  render(ex, box);
  if (ex.isReview) {
    const t = box.querySelector(".ex-title");
    if (t) t.insertAdjacentHTML("afterbegin", '<span class="review-tag">Revisão</span> ');
  }
  if (ex.newWord) {
    const t = box.querySelector(".ex-title");
    if (t) t.insertAdjacentHTML("beforebegin", '<div class="new-word-tag"><span class="new-tag">✦ Nova palavra</span></div>');
  }
  if (LISTEN_TYPES.includes(ex.type)) {
    const sk = document.createElement("button");
    sk.className = "btn-link muted skip-listen";
    sk.textContent = "Não posso ouvir agora";
    sk.addEventListener("click", () => {
      if (session.checked) return;
      state.listenMutedUntil = Date.now() + 15 * 60 * 1000; save();
      replaceUpcomingListening();
      ex.skipped = true;
      session.answer = ex.type === "listen-match" ? "__matched__" : (ex.correct || (ex.accept && ex.accept[0]) || "");
      if (ex.type === "listen-match") ex.correct = "__matched__";
      toast("🔇 Exercícios de escuta pausados por 15 min");
      $("#btn-check").disabled = false;
      checkAnswer();
    });
    box.appendChild(sk);
  }
  session.practiceRec = null;
  const barTypes = ["build", "translate-en-pt", "type", "missing-word", "complete-translation", "verse", "read", "dialogue", "quiz", "listen-build", "listen-type", "listen-choice"];
  if (barTypes.includes(ex.type) && ex.audioText && ex.audioText.trim().split(/\s+/).length >= 3) box.appendChild(practiceBar(ex, !!box.querySelector(".btn-audio")));
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

// Personagem em card com balão embaixo (layout da referência: retrato + pergunta)
// Personagem do exercício atual: alterna entre o elenco da unidade (fixo quando o usuário escolheu "Praticar com")
// Texto principal do exercício (o mesmo usado para escolher a voz na geração)
function exKeyText(ex) {
  if (!ex) return "";
  return ex.audioText || (ex.sentence && ex.sentence.en) || (ex.word && ex.word.en) || (ex.verse && ex.verse.text) || (ex.quiz && ex.quiz.q) || (ex.reading && ex.reading.q) || (ex.dialogue && ex.dialogue.line) || "";
}
function castHash(key) {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return h;
}
function currentChar() {
  if (!session) return null;
  if (session.fixedNarrator || !session.cast || !session.cast.length) return session.narrator;
  // Determinístico pelo texto: o personagem exibido é o dono da voz gravada
  const cast = UNIT_CAST[session.lesson.unit.id];
  const key = audioKey(exKeyText(session.exercises[session.index]));
  if (cast && cast.length && key) {
    let k = cast[castHash(key) % cast.length];
    // Enquanto o clipe do dono não existe, mostra quem de fato gravou o áudio
    const entry = typeof AUDIO !== "undefined" && AUDIO.manifest && AUDIO.manifest[key];
    if (entry && !entry[k]) {
      const rec = Object.keys(entry).find((c) => c !== "default" && CHARACTERS[c]);
      if (rec) k = rec;
    }
    if (CHARACTERS[k]) return { key: k, ...CHARACTERS[k] };
  }
  return session.cast[session.index % session.cast.length];
}
function buildCast(unitId, narrator) {
  const keys = (UNIT_CAST[unitId] || Object.keys(CHARACTERS)).filter((k) => CHARACTERS[k]);
  const order = shuffle(keys.filter((k) => k !== narrator.key));
  const list = [narrator, ...order.map((k) => ({ key: k, ...CHARACTERS[k] }))];
  return list;
}

// Cena: retrato grande em cartão largo com o enunciado em caixa sobreposta
function characterScene(promptContent, charKey) {
  const ch = charKey ? { key: charKey, ...CHARACTERS[charKey] } : currentChar();
  session.voiceChar = ch;
  const wrap = document.createElement("div");
  wrap.className = "scene";
  const fig = document.createElement("div");
  fig.className = "char-fig scene-img";
  fig.innerHTML = `${charFace(ch)}<span class="react"></span>`;
  const box = document.createElement("div");
  box.className = "scene-prompt";
  if (typeof promptContent === "string") box.innerHTML = promptContent;
  else box.appendChild(promptContent);
  wrap.appendChild(fig);
  wrap.appendChild(box);
  return wrap;
}

function characterRow(bubbleContent, charKey) {
  const ch = charKey ? { key: charKey, ...CHARACTERS[charKey] } : currentChar();
  session.voiceChar = ch;
  const wrap = document.createElement("div");
  wrap.className = "char-card";
  const fig = document.createElement("div");
  fig.className = "char-fig";
  fig.innerHTML = `${charFace(ch)}<span class="react"></span><span class="char-name">${ch.name.split(" (")[0]}</span>`;
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  if (typeof bubbleContent === "string") bubble.innerHTML = bubbleContent;
  else bubble.appendChild(bubbleContent);
  wrap.appendChild(fig);
  wrap.appendChild(bubble);
  return wrap;
}

// Cabeçalho compacto com avatar para exercícios sem balão (pareamento, lacuna, leitura)
function charTitle(box, title) {
  const ch = currentChar();
  session.voiceChar = ch;
  const row = document.createElement("div");
  row.className = "ex-title with-avatar";
  row.innerHTML = `<span class="mini-avatar char-fig">${charFace(ch)}<span class="react"></span></span><span>${title}</span>`;
  box.appendChild(row);
}

function updateCombo() {
  const chip = $("#combo-chip");
  if (chip) {
    chip.textContent = `COMBO x${session.combo}`;
    chip.classList.toggle("show", session.combo >= 2);
  }
  $("#progress-fill").classList.toggle("hot", session.combo >= 5);
}

const PRAISES = ["Excelente!", "Muito bem!", "Incrível!", "Perfeito!", "Isso aí!", "Boa!", "Amém!"];

function reactCharacter(ok) {
  const fig = document.querySelector(".sc-face.now") || document.querySelector(".scene-img") || document.querySelector(".char-fig");
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
  b.innerHTML = opts.slow ? ICONS.turtle : ICONS.speaker;
  b.title = opts.slow ? "Ouvir devagar" : "Ouvir";
  b.setAttribute("aria-label", b.title);
  b.addEventListener("click", () => {
    speak(text, opts.slow ? { slow: true } : {});
    markPlaying(b, text, opts.slow);
  });
  return b;
}

// Ondas no botão de áudio enquanto o clipe toca, como no Duolingo
let _playingTimer = 0;
function markPlaying(btn, text, slow) {
  document.querySelectorAll(".btn-audio.playing, .title-ico.playing").forEach((el) => el.classList.remove("playing"));
  clearTimeout(_playingTimer);
  const who = session && session.voiceChar;
  const base = (typeof clipDuration === "function" && clipDuration(text, who && who.key)) || Math.min(4, 0.5 + String(text).length * 0.055);
  btn.classList.add("playing");
  _playingTimer = setTimeout(() => btn.classList.remove("playing"), (base / (slow ? 0.75 : 1)) * 1000);
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
    return HINTS[key] ? `<span class="hint-word" data-hint="${HINTS[key]}">${w}</span>` : `<span class="plain-word">${w}</span>`;
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

function practiceBar(ex, micOnly) {
  const bar = document.createElement("div");
  bar.className = "practice-bar";
  const getTarget = () => (session.checked && ex.audioAfter) ? ex.audioAfter : ex.audioText;

  const listen = document.createElement("button");
  listen.className = "pbtn";
  listen.innerHTML = `${ICONS.speaker}<span>Ouvir</span>`;
  listen.addEventListener("click", () => speak(getTarget()));

  const slow = document.createElement("button");
  slow.className = "pbtn";
  slow.innerHTML = ICONS.turtle;
  slow.title = "Ouvir devagar";
  slow.addEventListener("click", () => speak(getTarget(), { slow: true }));

  const mic = document.createElement("button");
  mic.className = "pbtn mic";
  mic.innerHTML = `${ICONS.mic}<span>Falar</span>`;
  const status = document.createElement("div");
  status.className = "practice-status";
  mic.addEventListener("click", () => {
    if (session.practiceRec) { try { session.practiceRec.stop(); } catch (e) {} return; }
    const target = getTarget();
    session.practiceRec = recognizeOnce(target, {
      onStart: () => { mic.classList.add("listening"); mic.innerHTML = `${ICONS.mic}<span>Ouvindo...</span>`; status.textContent = `Diga: "${target}"`; },
      onResult: (r) => {
        if (r.ok) { SFX.correct(); buzz(25); status.textContent = `✅ Boa pronúncia! (${Math.round(r.score * 100)}%)`; }
        else { buzz(60); status.textContent = `🙂 Quase. Você disse: "${r.text}". Tente de novo!`; }
      },
      onError: (err) => {
        status.textContent = err === "unsupported"
          ? "Reconhecimento de voz indisponível neste navegador."
          : err === "not-allowed" ? "Permita o uso do microfone para praticar." : "Não consegui ouvir. Tente de novo.";
      },
      onEnd: () => { session.practiceRec = null; mic.classList.remove("listening"); mic.innerHTML = `${ICONS.mic}<span>Falar</span>`; },
    });
  });

  if (!micOnly) { bar.appendChild(listen); bar.appendChild(slow); }
  bar.appendChild(mic);
  const wrap = document.createElement("div");
  wrap.className = "practice-wrap";
  wrap.appendChild(bar);
  wrap.appendChild(status);
  return wrap;
}


// 1.5 Traduzir EN -> PT com banco de palavras em português
function renderTranslateEnPt(ex, box) {
  box.innerHTML = `<div class="ex-title">Traduza para o português:</div>`;
  const bubble = document.createElement("div");
  bubble.className = "bubble-inner";
  bubble.appendChild(audioButton(ex.sentence.en));
  bubble.insertAdjacentHTML("beforeend", `<span class="ex-word">${sayable(ex.sentence.en)}</span>`);
  box.appendChild(characterRow(bubble));
  wordBankUI(ex, box, ex.sentence.pt, "pt");
  ex.accept = [ex.sentence.pt];
  ex.explain = `"${ex.sentence.en}" = "${ex.sentence.pt}"`;
  ex.audioText = ex.sentence.en;
  speak(ex.sentence.en);
}

// 1.5 Digite o que você ouviu
function renderListenType(ex, box) {
  box.innerHTML = `<div class="ex-title"><span class="title-ico">${ICONS.speaker}</span>Digite o que você ouviu:</div>`;
  const bubble = document.createElement("div");
  bubble.className = "bubble-inner";
  bubble.appendChild(audioPair(ex.sentence.en));
  bubble.insertAdjacentHTML("beforeend", `<span class="ex-word ex-muted">Toque para ouvir</span>`);
  box.appendChild(characterRow(bubble));
  const inp = textInput("Digite em inglês...");
  box.appendChild(inp);
  setTimeout(() => inp.focus(), 50);
  speak(ex.sentence.en);
  ex.correct = ex.sentence.en;
  ex.fuzzy = true;
  ex.explain = `"${ex.sentence.en}" — ${ex.sentence.pt}`;
  ex.audioText = ex.sentence.en;
}

function gappedSentence(en, blank) {
  const re = new RegExp(`(^|\\s)${blank.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?=\\s|$|[.,;:!?])`);
  return en.replace(re, `$1<span class="gap" id="sent-gap">&nbsp;</span>`);
}

// 1.5 Selecione a palavra que falta (frase com lacuna e 3 opções)
function renderMissingWord(ex, box) {
  box.innerHTML = "";
  charTitle(box, "Selecione a palavra que falta:");
  box.insertAdjacentHTML("beforeend", `<div class="verse-box">${gappedSentence(ex.sentence.en, ex.blank)}</div>
    <div class="verse-ref">${ex.sentence.pt}</div>`);
  makeOptions(box, ex.options, 2, (opt) => {
    const g = $("#sent-gap");
    if (g) g.textContent = opt;
    speak(opt);
  });
  ex.correct = ex.blank;
  ex.explain = `"${ex.sentence.en}"`;
  ex.audioText = ex.sentence.en.replace(ex.blank, "blank");
  ex.audioAfter = ex.sentence.en;
}

// 1.5 Complete a tradução (digite a palavra que falta)
function renderCompleteTranslation(ex, box) {
  box.innerHTML = `<div class="ex-title">Complete a tradução:</div>`;
  box.appendChild(characterRow(`<span class="ex-word">${ex.sentence.pt}</span>`));
  box.insertAdjacentHTML("beforeend", `<div class="verse-box gap-box">${gappedSentence(ex.sentence.en, ex.blank)}</div>`);
  const inp = textInput("");
  inp.classList.add("gap-input");
  inp.style.width = Math.max(5, ex.blank.length + 2) + "ch";
  $("#sent-gap").replaceWith(inp);
  setTimeout(() => inp.focus(), 50);
  ex.correct = ex.blank;
  ex.fuzzy = true;
  ex.explain = `"${ex.sentence.en}"`;
  ex.audioText = ex.sentence.en.replace(ex.blank, "blank");
  ex.audioAfter = ex.sentence.en;
}

// 1.5 Leia e responda
function renderRead(ex, box) {
  const r = ex.reading;
  box.innerHTML = "";
  charTitle(box, "Leia e responda:");
  box.insertAdjacentHTML("beforeend", `<div class="read-box">
      <div class="read-en">${sayable(r.text)}</div>
      <button class="btn-link read-toggle">Ver em português</button>
      <div class="read-pt" hidden>${r.pt}</div>
    </div>
    <div class="read-q">${sayable(r.q)}</div>`);
  box.querySelector(".read-toggle").addEventListener("click", (e) => {
    const pt = box.querySelector(".read-pt");
    pt.hidden = !pt.hidden;
    e.target.textContent = pt.hidden ? "Ver em português" : "Esconder português";
  });
  makeOptions(box, ex.options, 1, (opt) => speak(opt));
  ex.correct = r.answer;
  ex.explain = r.q + " → " + r.answer;
  ex.audioText = r.text;
}

function renderImageChoice(ex, box) {
  box.innerHTML = `<div class="ex-title">Selecione a palavra correta:</div>`;
  const bubble = document.createElement("div");
  bubble.className = "bubble-inner";
  bubble.appendChild(audioButton(ex.word.en));
  bubble.insertAdjacentHTML("beforeend", `<span class="ex-word">${sayable(ex.word.en)}</span>`);
  box.appendChild(characterScene(bubble));
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
  box.appendChild(characterScene(bubble));
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
  box.innerHTML = `<div class="ex-title"><span class="title-ico">${ICONS.speaker}</span>Ouça e escolha a resposta certa:</div>`;
  const bubble = document.createElement("div");
  bubble.className = "bubble-inner";
  bubble.appendChild(audioPair(ex.word.en));
  bubble.insertAdjacentHTML("beforeend", `<span class="ex-word ex-muted">Toque para ouvir</span>`);
  box.appendChild(characterScene(bubble));
  makeOptions(box, ex.options, 2, (opt) => speak(opt));
  speak(ex.word.en);
  ex.correct = ex.word.en;
  ex.explain = `${ex.word.en} = ${ex.word.pt}`;
  ex.audioText = ex.word.en;
}

// Ouça a frase e escolha a tradução (como "O que você ouviu?" com frases)
function renderListenChoice(ex, box) {
  box.innerHTML = `<div class="ex-title"><span class="title-ico">${ICONS.speaker}</span>Ouça e escolha a tradução:</div>`;
  const bubble = document.createElement("div");
  bubble.className = "bubble-inner";
  bubble.appendChild(audioPair(ex.sentence.en));
  bubble.insertAdjacentHTML("beforeend", `<span class="ex-word ex-muted">Toque para ouvir</span>`);
  box.appendChild(characterScene(bubble));
  makeOptions(box, ex.options, 1);
  speak(ex.sentence.en);
  ex.correct = ex.sentence.pt;
  ex.explain = `"${ex.sentence.en}" = "${ex.sentence.pt}"`;
  ex.audioText = ex.sentence.en;
}

// Português -> inglês por escolha (recordação sem digitar)
function renderChoicePtEn(ex, box) {
  box.innerHTML = `<div class="ex-title">Qual destas significa "${ex.word.pt}"?</div>`;
  box.appendChild(characterScene(`<span class="ex-word">${ex.word.icon || ""} ${ex.word.pt}</span>`));
  makeOptions(box, ex.options, 2, (opt) => speak(opt));
  ex.correct = ex.word.en;
  ex.explain = `${ex.word.pt} = ${ex.word.en}`;
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

// Formas aceitas ao digitar uma palavra: sem "to ", sem o parêntese explicativo, cada lado de "a / b"
function typeAccepts(en) {
  const base = en.replace(/\s*\([^)]*\)/g, "").trim();
  const parts = base.split(/\s*\/\s*/);
  const out = new Set([en, base]);
  parts.forEach((p) => { out.add(p); out.add(p.replace(/^to /, "")); });
  out.add(base.replace(/^to /, ""));
  return [...out].filter(Boolean);
}

function renderType(ex, box) {
  box.innerHTML = `<div class="ex-title">Digite em inglês:</div>`;
  box.appendChild(characterRow(`<span class="ex-word">${ex.word.icon || ""} ${ex.word.pt}</span>`));
  const inp = textInput("Escreva em inglês...");
  box.appendChild(inp);
  setTimeout(() => inp.focus(), 50);
  ex.correct = ex.word.en;
  ex.accept = typeAccepts(ex.word.en);
  ex.explain = `${ex.word.pt} = ${ex.word.en}`;
  ex.audioText = ex.word.en;
}

function renderVerse(ex, box) {
  const v = ex.verse;
  const gapped = sayable(v.text).replace(`<span class="say-word">${v.blank}</span>`, `<span class="gap" id="verse-gap">&nbsp;</span>`)
    .replace(new RegExp(`<span class="say-word">${v.blank}([.,;:!?])</span>`), `<span class="gap" id="verse-gap">&nbsp;</span>$1`);
  box.innerHTML = "";
  charTitle(box, "Complete o versículo:");
  box.insertAdjacentHTML("beforeend", `<div class="verse-box">${gapped}</div>
    <div class="verse-ref">${v.ref} — "${v.pt}"</div>`);
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
  box.innerHTML = `<div class="ex-title">Complete a conversa:</div>`;
  const bubble = document.createElement("div");
  bubble.className = "bubble-inner bubble-col";
  const top = document.createElement("div");
  top.className = "bubble-inner";
  top.appendChild(audioButton(d.line));
  top.insertAdjacentHTML("beforeend", `<span class="ex-word">${sayable(d.line)}</span>`);
  bubble.appendChild(top);
  bubble.insertAdjacentHTML("beforeend", `<span class="ex-muted dialog-pt">${d.pt}</span>`);
  box.appendChild(characterScene(bubble));
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
  box.innerHTML = `<div class="ex-title">Responda sobre a história:</div>`;
  const bubble = document.createElement("div");
  bubble.className = "bubble-inner";
  bubble.appendChild(audioButton(q.q));
  bubble.insertAdjacentHTML("beforeend", `<span class="ex-word ex-q">${sayable(q.q)}</span>`);
  box.appendChild(characterScene(bubble));
  makeOptions(box, ex.options, 1, (opt) => speak(opt));
  speak(q.q);
  ex.correct = q.answer;
  ex.explain = q.explain;
  ex.audioText = q.q;
  ex.audioAfter = q.answer;
}

// Banco de palavras com animação, dicas e teclado
function wordBankUI(ex, box, correctSentence, lang = "en") {
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
      if (lang === "en") speak(word);
      const from = t.getBoundingClientRect();
      t.classList.add("ghost");
      const placed = document.createElement("button");
      placed.className = "tile";
      placed.textContent = word;
      const entry = { word, el: placed };
      chosen.push(entry);
      placed.addEventListener("click", () => {
        if (session.checked) return;
        if (lang === "en") speak(word);
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
      const inp = textInput(lang === "en" ? "Digite a frase em inglês..." : "Digite a frase em português...");
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
  ex.explain = lang === "en" ? `"${ex.sentence.en}" = "${ex.sentence.pt}"` : `"${ex.sentence.pt}" = "${ex.sentence.en}"`;
  ex.audioText = correctSentence;
}

function renderBuild(ex, box) {
  box.innerHTML = `<div class="ex-title">Escreva em inglês:</div>`;
  const bubble = document.createElement("div");
  bubble.className = "bubble-inner";
  bubble.appendChild(audioButton(ex.sentence.en));
  bubble.insertAdjacentHTML("beforeend", `<span class="ex-word">${hintedText(ex.sentence.pt)}</span>`);
  box.appendChild(characterRow(bubble));
  box.insertAdjacentHTML("beforeend", `<div class="tip-line">Toque numa palavra sublinhada para ver a dica</div>`);
  wordBankUI(ex, box, ex.sentence.en);
}

function renderListenBuild(ex, box) {
  box.innerHTML = `<div class="ex-title"><span class="title-ico">${ICONS.speaker}</span>Toque no que você ouviu:</div>`;
  const bubble = document.createElement("div");
  bubble.className = "bubble-inner";
  bubble.appendChild(audioPair(ex.sentence.en));
  bubble.insertAdjacentHTML("beforeend", `<span class="ex-word ex-muted">Toque para ouvir</span>`);
  box.appendChild(characterRow(bubble));
  wordBankUI(ex, box, ex.sentence.en);
  speak(ex.sentence.en);
}

// Fale a frase (reconhecimento de voz do navegador)
function renderSpeak(ex, box) {
  const who = currentChar();
  box.innerHTML = `<div class="ex-title">Repita o que ${who ? who.name.split(" (")[0] : "o personagem"} disse:</div>`;
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
  mic.innerHTML = `${ICONS.mic}`;
  mic.setAttribute("aria-label", "Toque para falar");
  const status = document.createElement("div");
  status.className = "mic-status";
  const skip = document.createElement("button");
  skip.className = "btn-link muted";
  skip.textContent = "Não posso falar agora";
  box.appendChild(mic);
  box.appendChild(status);
  box.appendChild(skip);
  speak(ex.sentence.en);

  mic.addEventListener("click", () => {
    if (session.checked) return;
    if (session.recognizer) { try { session.recognizer.stop(); } catch (e) {} return; }
    session.recognizer = recognizeOnce(ex.sentence.en, {
      onStart: () => { mic.classList.add("listening"); mic.innerHTML = `${ICONS.mic}<span>Ouvindo...</span>`; status.textContent = ""; },
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
      onEnd: () => { session.recognizer = null; mic.classList.remove("listening"); mic.innerHTML = `${ICONS.mic}<span>Toque para falar</span>`; },
    });
  });

  skip.addEventListener("click", () => {
    if (session.checked) return;
    state.speakMutedUntil = Date.now() + 15 * 60 * 1000;
    save();
    session.exercises = session.exercises.filter((e, i) => i <= session.index || e.type !== "speak");
    session.hard = session.hard.filter((e) => e.type !== "speak");
    toast("🔇 Exercícios de fala pausados por 15 min");
    ex.skipped = true;
    session.answer = ex.sentence.en;
    $("#btn-check").disabled = false;
    checkAnswer();
  });

  ex.correct = ex.sentence.en;
  ex.explain = `"${ex.sentence.en}" — ${ex.sentence.pt}`;
}

function renderMatch(ex, box) {
  box.innerHTML = "";
  charTitle(box, ex.type === "listen-match" ? "Toque no que você ouviu e no par:" : "Combine os pares:");
  const grid = document.createElement("div");
  grid.className = "match-cols";
  box.appendChild(grid);

  const audioLeft = ex.type === "listen-match";
  const left = shuffle(ex.pairs.map((p) => ({ key: p.en, side: "en", label: p.en })));
  const right = shuffle(ex.pairs.map((p) => ({ key: p.en, side: "pt", label: p.pt })));
  let selected = null;
  let matched = 0;

  function cell(item) {
    const b = document.createElement("button");
    b.className = "opt" + (audioLeft && item.side === "en" ? " opt-audio" : "");
    b.dataset.key = item.key; b.dataset.side = item.side;
    if (audioLeft && item.side === "en") b.innerHTML = `${ICONS.speaker}<span class="wave">${"<i></i>".repeat(12)}</span>`;
    else b.textContent = item.label;
    b.addEventListener("click", () => {
      if (b.classList.contains("matched")) return;
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
        SFX.pop(matched);
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
// Contrações expandidas dos dois lados ("don't" = "do not"), para aceitar as duas formas
function normalize(s) {
  let t = String(s).toLowerCase().replace(/[\u2018\u2019]/g, "'");
  if (t.includes("'")) {
    t = t.replace(/\bi'm\b/g, "i am").replace(/\bcan't\b/g, "cannot").replace(/\bwon't\b/g, "will not").replace(/\blet's\b/g, "let us")
      .replace(/\b(\w+)n't\b/g, "$1 not").replace(/\b(\w+)'re\b/g, "$1 are").replace(/\b(it|he|she|that|there|what|who)'s\b/g, "$1 is")
      .replace(/\b(\w+)'ll\b/g, "$1 will").replace(/\b(\w+)'ve\b/g, "$1 have").replace(/\b(\w+)'d\b/g, "$1 would");
  }
  return t.replace(/[.,;:!?'"]/g, "").replace(/\s+/g, " ").trim();
}
// Respostas alternativas aceitas, definidas no conteúdo (alt para inglês, altPt para português)
function altsOf(ex) {
  if (ex.type === "translate-en-pt") return (ex.sentence && ex.sentence.altPt) || [];
  if (["build", "listen-build", "listen-type"].includes(ex.type)) return (ex.sentence && ex.sentence.alt) || [];
  if (ex.type === "type") return (ex.word && ex.word.alt) || [];
  return [];
}

// Resposta correta com as palavras que o aluno errou em destaque (como no Duolingo)
function highlightDiff(correct, given) {
  const have = new Set(normalize(given).split(" "));
  const esc = (t) => t.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  return correct.split(" ").map((w) => have.has(normalize(w)) ? esc(w) : `<b class="diff">${esc(w)}</b>`).join(" ");
}

function editDistance(x, y) {
  const m = x.length, n = y.length;
  if (!m) return n; if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (x[i - 1] === y[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[n];
}
function fuzzyEqual(answer, target) {
  const a = normalize(answer).split(" "), t = normalize(target).split(" ");
  if (a.length !== t.length) return false;
  return t.every((w, i) => a[i] === w || (w.length >= 4 && editDistance(a[i], w) <= 1));
}

function checkAnswer() {
  if (!session || session.locked) return;
  const ex = session.exercises[session.index];
  const btn = $("#btn-check");

  // Cartões sem resposta (introdução e falas lidas das cenas): só avançam, sem feedback
  if (ex.silent && !session.checked) session.checked = true;

  if (!session.checked) {
    session.checked = true;
    if (session.recognizer) { try { session.recognizer.abort(); } catch (e) {} }
    if (session.practiceRec) { try { session.practiceRec.abort(); } catch (e) {} }
    const accepts = [...(ex.accept || [ex.correct]), ...altsOf(ex)];
    const ok = accepts.some((c) => normalize(session.answer) === normalize(c))
      || ((ex.fuzzy || ex.type === "build" || ex.type === "listen-build") && accepts.some((c) => fuzzyEqual(session.answer, c)));
    if (ok && !accepts.some((c) => normalize(session.answer) === normalize(c))) ex.typo = true;
    // Placar da lição e força das palavras (repetição espaçada)
    if (ex.correct !== "__matched__" && !ex.skipped) {
      (session.log = session.log || []).push({ q: exKeyText(ex) || ex.type, a: String(session.answer || ""), c: String(ex.correctLabel || ex.correct), ok, review: !!session.reviewing });
    }
    if (!ex.skipped) {
      if (ex.word) recordWord(ex.word.en, ok);
      else if (ex.sentence) sentenceVocab(ex.sentence).forEach((w) => recordWord(w.en, ok));
    }
    const footer = $("#footer");
    footer.classList.add(ok ? "correct" : "wrong", "up");
    if (ok) {
      $("#fb-ok-title").textContent = ex.skipped ? "Tudo bem, seguimos!" : PRAISES[Math.floor(Math.random() * PRAISES.length)];
      $("#fb-ok-detail").textContent = ex.typo ? `Atenção à ortografia: ${ex.correctLabel || ex.correct}` : "";
    } else {
      $("#fb-bad-title").textContent = "Incorreto";
      $("#fb-bad-detail").innerHTML = ex.correct === "__matched__" ? "" : highlightDiff(String(ex.correctLabel || ex.correct), String(session.answer || ""));
      $("#fb-bad-extra").textContent = "";
    }
    const exp = $("#btn-explain");
    if (exp) {
      exp.hidden = !ex.explain;
      exp.textContent = ok ? "Explique minha resposta" : "Explique meu erro";
      exp.onclick = () => { const p = $("#fb-explain"); p.textContent = ex.explain; p.hidden = !p.hidden; };
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
    if (typeof ex.onChecked === "function") { try { ex.onChecked(ok); } catch (e) { /* ignora */ } }

    if (ok) {
      if (ex.word && state.errors[ex.word.en] && session.lesson.practiceErrors) {
        state.errors[ex.word.en] = Math.max(0, state.errors[ex.word.en] - 1);
        if (!state.errors[ex.word.en]) delete state.errors[ex.word.en];
        save();
      }
      if (ex.skipped) {
        btn.textContent = "Continuar";
      } else {
        session.combo++;
        session.bestCombo = Math.max(session.bestCombo, session.combo);
        updateCombo();
        if (session.combo >= 3) {
          if (session.bonus < 5) session.bonus++;
          if (session.combo % 5 === 0) {
            SFX.combo();
            $("#fb-ok-detail").insertAdjacentHTML("afterbegin", `<span class="combo-pill">🔥 ${session.combo} seguidas · +${Math.min(session.combo / 5, 5) | 0} XP</span> `);
          } else SFX.correct();
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
      if (!session.reviewing) session.reviewQueue.push(cloneExercise(ex));
      if (ex.word) { state.errors = state.errors || {}; state.errors[ex.word.en] = (state.errors[ex.word.en] || 0) + 1; }
      SFX.wrong();
      buzz([60, 40, 60]);
      document.querySelectorAll(".opt.wrong, .answer-zone, .gap-input, .type-input").forEach((el) => {
        el.classList.remove("shake");
        void el.offsetWidth;
        el.classList.add("shake");
      });
      if (!session.practice) {
        state.hearts = Math.max(0, state.hearts - 1);
        save();
        $("#lesson-hearts").textContent = `❤️ ${state.hearts}`;
      }
      btn.textContent = "OK!";
      btn.classList.add("red");
      if (!session.practice && state.hearts <= 0) {
        session.locked = true;
        btn.disabled = true;
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
  adaptNext();
  if (session.index >= session.exercises.length) {
    // Sem erros: libera os exercícios mais difíceis reservados
    if (!session.hardAdded && session.mistakes === 0 && session.hard.length) {
      session.hardAdded = true;
      session.exercises.push(...session.hard.slice(0, 2));
      toast("💪 Mandou bem! Um desafio extra");
      renderExercise();
      return;
    }
    // Com erros: revisa os erros no fim da lição
    if (!session.reviewing && session.reviewQueue.length) {
      session.reviewing = true;
      session.exercises.push(...session.reviewQueue);
      session.reviewQueue = [];
      toast("🔁 Vamos revisar seus erros");
      renderExercise();
      return;
    }
    finishLesson();
  } else {
    renderExercise();
  }
}

// Adaptação dentro da lição (versão simples do Birdbrain): indo bem, o próximo exercício de palavra
// sobe para produção; com erros acumulados, o próximo exercício de produção desce para reconhecimento.
function adaptNext() {
  const nxt = session.exercises[session.index];
  if (!nxt || nxt.isReview || nxt.newWord || session.reviewing || session.lesson.practiceErrors) return;
  const prev = session.exercises[session.index - 1];
  const sameNeighbor = (e) => prev && (e.type === prev.type || exKey(e) === exKey(prev));
  let swap = null;
  // Cenas: com erros, montar a frase vira escolher a fala e a lacuna digitada vira lacuna com opções;
  // indo bem, a lacuna com opções sobe para lacuna digitada
  if (nxt.sceneId && typeof SCENE_BY_ID !== "undefined") {
    const sc = SCENE_BY_ID[nxt.sceneId], line = sc && sc.lines[nxt.li];
    if (line && session.mistakes >= 2 && nxt.type === "scene-build") swap = { ...nxt, type: "scene-reply", options: sceneReplyOptions(line, sc), bank: undefined };
    else if (line && session.mistakes >= 2 && nxt.type === "scene-gap") swap = { ...nxt, type: "scene-missing", options: shuffle([nxt.blank, ...exNearWords(nxt.blank, 2)]) };
    else if (line && session.combo >= 3 && nxt.type === "scene-missing") swap = { ...nxt, type: "scene-gap", options: undefined };
    if (swap && !sameNeighbor(swap)) { swap.adapted = true; session.exercises[session.index] = swap; }
    return;
  }
  if (session.combo >= 3 && nxt.word && (nxt.type === "listen" || nxt.type === "choice-pt-en")) {
    swap = EX_MAKE.type(nxt.word);
  } else if (session.mistakes >= 2 && nxt.word && nxt.type === "type") {
    swap = EX_MAKE["choice-pt-en"](nxt.word);
  } else if (session.mistakes >= 2 && nxt.sentence && (nxt.type === "listen-type" || nxt.type === "build")) {
    swap = EX_MAKE["listen-choice"](nxt.sentence, session.lesson.unit.id);
  }
  const used = swap ? session.exercises.filter((e) => e.type === swap.type).length : 0;
  if (swap && !sameNeighbor(swap) && used < capOf(swap.type)) { swap.adapted = true; session.exercises[session.index] = swap; }
}

// Cópia limpa de um exercício para a revisão (novo embaralhamento das opções)
function cloneExercise(ex) {
  const c = { ...ex };
  delete c.correct; delete c.explain; delete c.accept; delete c.audioText; delete c.audioAfter; delete c.skipped;
  if (Array.isArray(ex.options)) c.options = shuffle(ex.options);
  if (Array.isArray(ex.bank)) c.bank = shuffle(ex.bank);
  c.isReview = true;
  return c;
}

function finishLesson() {
  if (state.resume && state.resume.lessonId === session.lesson.id) state.resume = null;
  const perfect = session.mistakes === 0;
  const first = !state.completed[session.lesson.id];
  let gained = session.practice ? 5 : XP_PER_LESSON;
  if (perfect) gained += XP_PERFECT_BONUS;
  gained += session.bonus;

  state.xp += gained;
  if (!session.lesson.practiceErrors && !session.levelUp) state.completed[session.lesson.id] = true;
  if (session.levelUp) {
    const uid = session.lesson.unit.id;
    state.crowns[uid] = Math.min(MAX_CROWN, unitCrowns(uid) + 1);
  }

  // Estrelas: 3 = perfeita, 2 = até 2 erros, 1 = concluída
  const earned = perfect ? 3 : session.mistakes <= 2 ? 2 : 1;
  if (!session.lesson.practiceErrors && !session.levelUp) state.stars[session.lesson.id] = Math.max(state.stars[session.lesson.id] || 0, earned);

  // Prática recupera 1 coração
  if (session.practice && state.hearts < MAX_HEARTS) state.hearts++;

  save();

  // Personagem comemorando + confete
  const ch = session.lesson.scene && session.narrator ? session.narrator : pickCharacter(session.lesson.unit.id);
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
  $("#result-title").textContent = session.levelUp
    ? (session.legendary ? "Nível Lendário!" : `Coroa ${unitCrowns(session.lesson.unit.id)} conquistada!`)
    : session.lesson.scene ? (perfect ? "Cena perfeita!" : "Cena concluída!") : perfect ? "Lição perfeita!" : "Lição concluída!";
  recordLesson({ gained, perfect, bestCombo: session.bestCombo });
  $("#result-sub").textContent = (first ? "Você avançou na trilha." : "Ótima prática!")
    + ` ⏱️ ${mm}:${ss}` + (session.bonus ? ` · 🔥 combo +${session.bonus} XP` : "");
  $("#result-xp").textContent = `+${gained}`;
  $("#result-streak").textContent = state.streak;
  const firstPass = session.exercises.filter((e) => !e.isReview).length;
  $("#result-acc").textContent = `${Math.max(0, Math.round((1 - session.mistakes / Math.max(1, firstPass)) * 100))}%`;

  const blessings = [
    { t: "I can do all things through Christ which strengtheneth me.", r: "Filipenses 4:13" },
    { t: "The joy of the LORD is your strength.", r: "Neemias 8:10" },
    { t: "Be strong and of a good courage.", r: "Josué 1:9" },
    { t: "Thy word is a lamp unto my feet.", r: "Salmos 119:105" },
  ];
  const b = blessings[Math.floor(Math.random() * blessings.length)];
  $("#result-verse").innerHTML = `"${b.t}"<br><b>${b.r}</b>`;
  renderResultReview();

  $("#progress-fill").style.width = "100%";
  const chest = $("#chest");
  chest.className = "chest";
  chest.disabled = false;
  chest.innerHTML = `🎁<span>Abrir baú</span>`;
  chest.onclick = () => {
    if (chest.classList.contains("open")) return;
    const bonus = [1, 2, 3, 5][Math.floor(Math.random() * 4)];
    state.xp += bonus;
    save();
    chest.classList.add("open");
    chest.innerHTML = `✨<span>+${bonus} XP</span>`;
    SFX.sparkle();
    if (typeof confetti === "function") confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
    $("#result-xp").textContent = `+${gained + bonus}`;
  };
  showScreen("result");
}

// Placar da lição: o que errou, o que respondeu e a resposta certa
function renderResultReview() {
  const box = $("#result-review");
  if (!box) return;
  const log = session.log || [];
  const wrong = log.filter((e) => !e.ok && !e.review);
  const esc = (t) => String(t).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  if (!log.length) { box.hidden = true; return; }
  box.hidden = false;
  const right = log.filter((e) => e.ok).length;
  box.innerHTML = `<button class="rr-toggle" aria-expanded="false"><span>📋 Revisão da lição</span><b>${right} de ${log.length} certas</b></button>
    <div class="rr-list" hidden>${wrong.length ? wrong.map((e) => `<div class="rr-item"><div class="rr-q">${esc(e.q)}</div><div class="rr-a"><s>${esc(e.a)}</s></div><div class="rr-c">${esc(e.c)}</div></div>`).join("") : `<p class="rr-empty">Nenhum erro na primeira passada. Excelente!</p>`}</div>`;
  const tg = box.querySelector(".rr-toggle"), list = box.querySelector(".rr-list");
  tg.onclick = () => { list.hidden = !list.hidden; tg.setAttribute("aria-expanded", String(!list.hidden)); SFX.tap(); };
}

// 1.8 Praticar erros: lição montada com as palavras erradas
function startErrorPractice() {
  const words = Object.keys(state.errors || {});
  if (!words.length) return;
  // Palavras de lição e das cenas (as cenas também alimentam state.errors)
  const seen = new Set();
  const pool = [...allVocab(), ...(typeof SCENES !== "undefined" ? SCENES.flatMap((s) => s.vocab) : [])].filter((p) => !seen.has(p.en) && seen.add(p.en));
  const vocab = shuffle(pool.filter((p) => words.includes(p.en))).slice(0, 6);
  if (!vocab.length) {
    // erros de palavras que não existem mais no conteúdo: descarta e segue
    state.errors = {}; save(); renderHome();
    toast("✅ Nenhum erro pendente");
    return;
  }
  const unit = COURSE[0];
  const lesson = { id: "practice-errors", title: "Praticar erros", vocab, sentences: [], unit, practiceErrors: true };
  const distract = (v, key) => shuffle(pool.filter((p) => p[key] !== v[key] && p.icon !== v.icon)).slice(0, 3);
  const ex = [];
  vocab.forEach((v, i) => {
    ex.push({ type: "image-choice", word: v, options: shuffle([v, ...distract(v, "en")]) });
    ex.push(i % 2 === 0 ? { type: "listen", word: v, options: shuffle([v.en, ...distract(v, "en").map((p) => p.en)]) } : { type: "type", word: v });
  });
  if (vocab.length >= 4) ex.push({ type: "match", pairs: vocab.slice(0, 4) });
  ex.hard = [];
  session = {
    lesson, exercises: ex, index: 0, mistakes: 0, combo: 0, bestCombo: 0, bonus: 0,
    practice: true, checked: false, answer: null, startedAt: Date.now(),
    narrator: pickCharacter(unit.id), reviewQueue: [], reviewing: false, hardAdded: true, hard: [],
  };
  showScreen("lesson");
  renderExercise();
}

// ---------- Eventos globais ----------
$("#btn-check").addEventListener("click", checkAnswer);
$("#btn-quit").addEventListener("click", () => {
  if ("speechSynthesis" in window) speechSynthesis.cancel();
  if (typeof stopClip === "function") stopClip();
  showScreen("home");
});
$("#btn-result-continue").addEventListener("click", () => showScreen("home"));
$("#btn-modal-close").addEventListener("click", () => $("#modal-hearts").classList.remove("open"));
$("#btn-modal-practice").addEventListener("click", () => {
  $("#modal-hearts").classList.remove("open");
  // Abre a última lição concluída como prática para recuperar coração
  const doneIds = flatLessons().filter((l) => state.completed[l.id]).map((l) => l.id);
  if (doneIds.length) startLesson(doneIds[doneIds.length - 1]); else startQuickPractice("review");
});

// Escape fecha o modal ou a folha aberta
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  const modal = document.querySelector(".modal-backdrop.open");
  if (modal) { modal.classList.remove("open"); return; }
  const closeBtn = document.querySelector(".sheet-backdrop.open [data-close], .sheet.open [data-close]");
  if (closeBtn) closeBtn.click();
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

document.querySelectorAll(".hub-back").forEach((b) => b.addEventListener("click", () => {
  if (typeof stopClip === "function") stopClip();
  if (typeof madness !== "undefined" && madness && madness.timer) clearInterval(madness.timer);
  if ("speechSynthesis" in window) speechSynthesis.cancel();
  showScreen($("#screen-hub").classList.contains("active") ? "home" : "hub");
}));
$("#story-next").addEventListener("click", () => { if (story && story.done) showScreen("hub"); else nextBeat(); });

// Navegação (sidebar/rodapé)
function setNav(name) {
  document.querySelectorAll(".nav-item").forEach((b) => b.classList.toggle("active", b.dataset.nav === name));
}
document.querySelectorAll(".nav-item").forEach((b) => {
  b.addEventListener("click", () => {
    const nav = b.dataset.nav;
    const screen = NAV_TO_SCREEN[nav];
    if (!screen) return;
    SFX.tap();
    if (screen === "home" && $("#screen-home").classList.contains("active")) { scrollToCurrentNode(true); return; }
    showScreen(screen);
  });
});
$("#prof-gear").addEventListener("click", openConfig);
document.querySelectorAll(".modal-close").forEach((b) =>
  b.addEventListener("click", () => b.closest(".modal-backdrop").classList.remove("open")));
$("#toggle-sound").addEventListener("change", (e) => {
  state.sound = e.target.checked;
  save();
  if (state.sound) SFX.correct();
});
document.querySelectorAll("[data-theme-opt]").forEach((b) => b.addEventListener("click", () => {
  state.theme = b.dataset.themeOpt;
  save();
  applyTheme();
  SFX.tap();
}));
$("#btn-reset").addEventListener("click", () => {
  if (!confirm("Apagar todo o progresso deste aparelho?")) return;
  try { localStorage.removeItem("biblelingo"); } catch (e) {}
  location.reload();
});
$("#vd-audio").addEventListener("click", (e) => {
  e.stopPropagation();
  const b = e.currentTarget;
  b.classList.add("playing");
  setTimeout(() => b.classList.remove("playing"), 1400);
  speak(verseOfDay().text, { char: CHARACTERS.jesus });
});
$("#vd-toggle").addEventListener("click", () => {
  const box = $("#vd-trans");
  const open = box.hidden;
  box.hidden = !open;
  $("#vd-toggle").textContent = open ? "Ocultar ▴" : "Ver tradução ▾";
  $("#vd-toggle").setAttribute("aria-expanded", String(open));
});
$("#input-name").addEventListener("input", (e) => {
  state.name = e.target.value.trim().slice(0, 18);
  save();
  const pn = $("#prof-name"); if (pn) pn.textContent = state.name || "Discípulo";
});
$("#tb-course").addEventListener("click", () => scrollToCurrentNode(true));

document.querySelectorAll("i.nav-ico[data-ico]").forEach((i) => { i.innerHTML = ICONS[i.dataset.ico] || ""; });
applyTheme();
loadAudioManifest();
registerServiceWorker();
if (!state.joined) { state.joined = today(); save(); }
showScreen("home");
// Redesenha o caminho quando fontes carregam ou a janela muda de tamanho
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if ($("#screen-home").classList.contains("active")) { renderHome(); scrollToCurrentNode(false); } });
let _rz;
window.addEventListener("resize", () => {
  clearTimeout(_rz);
  _rz = setTimeout(() => { if ($("#screen-home").classList.contains("active")) renderHome(); }, 200);
});
