// Máquina de estados da lição — porta fiel do fluxo de app.js (checkAnswer, adaptNext,
// finishLesson, retomada, práticas). A UI (React) só lê `session` e chama as ações.
import { state, save, ensureDay } from "./store.js";
import { shuffle, buzz, MAX_HEARTS, XP_PER_LESSON, XP_PERFECT_BONUS, today, daysBetween, PRAISES } from "./util.js";
import { flatLessons, lessonUnlocked, SCENE_BY_ID, castChar, pickCharacter, buildCast, sentenceVocab, allVocab, SCENES, COURSE, unitVocab } from "./content.js";
import { recordWord, weakestWords } from "./sr.js";
import { EX_MAKE, exKey, capOf, buildExercises, spreadNeighbors, listenMuted, LISTEN_TYPES, exNearWords, EX_RANK, setDistractUnit } from "./builder.js";
import { buildSceneExercises, sceneReplyOptions, sceneBank } from "./sceneBuilder.js";
import { prepareExercise, evaluate } from "./checker.js";
import { stopClip } from "./audio.js";
import { toast, sfx, confetti, ui } from "./events.js";

export let session = null;

let version = 0;
const listeners = new Set();
export function subscribeSession(fn) { listeners.add(fn); return () => listeners.delete(fn); }
export const sessionVersion = () => version;
function notify() { version++; listeners.forEach((fn) => fn()); }

// ---------- Missões e ofensiva (features.js) ----------
export const DAILY_GOALS = [10, 20, 30, 50];
export const QUESTS = [
  { id: "xp", label: "Ganhe XP", key: "xp", target: (g) => g, reward: 5, icon: "⚡" },
  { id: "lessons", label: "Complete 2 lições", key: "lessons", target: () => 2, reward: 5, icon: "📖" },
  { id: "perfect", label: "Faça 1 lição perfeita", key: "perfect", target: () => 1, reward: 10, icon: "🌟" },
  { id: "combo", label: "Acerte 5 seguidas", key: "combo", target: () => 5, reward: 5, icon: "🔥" },
];
export function ensureDaily() {
  const t = today();
  if (!state.daily || state.daily.date !== t) {
    state.daily = { date: t, xp: 0, lessons: 0, perfect: 0, combo: 0, claimed: [] };
  }
  const d0 = state.daily;
  if (!Array.isArray(d0.claimed)) d0.claimed = [];
  ["xp", "lessons", "perfect", "combo"].forEach((k) => { if (typeof d0[k] !== "number") d0[k] = 0; });
  if (!state.dailyGoal) state.dailyGoal = 20;
  return state.daily;
}
export function recordLesson({ gained, perfect, bestCombo }) {
  const d = ensureDaily();
  state.days = state.days || {};
  state.days[today()] = (state.days[today()] || 0) + gained;
  const t = today();
  if (gained > 0 && state.lastStudy !== t) {
    state.streak = state.lastStudy && daysBetween(state.lastStudy, t) === 1 ? state.streak + 1 : 1;
    state.lastStudy = t;
  }
  d.xp += gained;
  if (gained > 0) d.lessons += 1;
  if (perfect) d.perfect += 1;
  d.combo = Math.max(d.combo, bestCombo || 0);
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

// ---------- Coroas ----------
export const MAX_CROWN = 5;
export function unitCrowns(unitId) {
  return (state.crowns && state.crowns[unitId]) || 0;
}

// ---------- Retomada ----------
const RESUME_TTL = 3 * 864e5;
export function saveResume() {
  if (!session || session.practice || session.levelUp || !session.lesson || !session.lesson.unit || session.lesson.practiceErrors || String(session.lesson.id).startsWith("quick")) return;
  if (session.index >= session.exercises.length) return;
  try {
    const strip = (list) => JSON.parse(JSON.stringify(list, (k, v) => (k === "unit" ? undefined : v)));
    state.resume = {
      lessonId: session.lesson.id, index: session.index, mistakes: session.mistakes, firstMistakes: session.firstMistakes || 0, combo: session.combo, bestCombo: session.bestCombo,
      bonus: session.bonus, startedAt: session.startedAt, reviewing: session.reviewing, hardAdded: session.hardAdded,
      narratorKey: session.narrator && session.narrator.key, fixedNarrator: !!session.fixedNarrator,
      exercises: strip(session.exercises), hard: strip(session.hard || []),
      reviewQueue: strip(session.reviewQueue || []), log: session.log || [], savedAt: Date.now(),
    };
    save();
  } catch (e) { /* exercício não serializável: segue sem retomar */ }
}
const SCENE_TYPES = ["scene-intro", "scene-read", "scene-missing", "scene-listen", "scene-reply", "scene-build", "scene-gap", "scene-speak", "scene-truth"];
export function resumable() {
  const r = state.resume;
  if (!r || Date.now() - r.savedAt > RESUME_TTL) return null;
  const known = (t) => t in EX_RANK || SCENE_TYPES.includes(t) || ["read", "verse", "dialogue", "quiz", "match", "listen-match", "speak"].includes(t);
  const sane = Array.isArray(r.exercises) && r.exercises.length && Number.isInteger(r.index) && r.index >= 0 && r.index < r.exercises.length
    && r.exercises.every((e) => e && typeof e === "object" && known(e.type) && (!("word" in e) || (e.word && e.word.en)) && (!("sentence" in e) || (e.sentence && e.sentence.en)));
  if (!sane) { state.resume = null; save(); return null; }
  const lesson = flatLessons().find((l) => l.id === r.lessonId);
  if (!lesson) { state.resume = null; save(); return null; }
  return { ...r, lesson };
}

// ---------- Ciclo da sessão ----------
function baseSession(lesson, exercises, opts = {}) {
  return {
    lesson,
    exercises,
    index: 0,
    mistakes: 0,
    firstMistakes: 0,
    combo: 0,
    bestCombo: 0,
    bonus: 0,
    practice: false,
    checked: false,
    answer: null,
    startedAt: Date.now(),
    reviewQueue: [],
    reviewing: false,
    hardAdded: false,
    log: [],
    hard: exercises.hard || [],
    phase: "exercise", // "exercise" | "result"
    feedback: null,    // { ok, typo, praise } após checar
    result: null,
    ...opts,
  };
}

function begin(next) {
  dropSession(false);
  session = next;
  prepareCurrent();
  ui("navigate", { screen: "lesson" });
  sfx("start");
  saveResume();
  notify();
}

function prepareCurrent() {
  const ex = session.exercises[session.index];
  session.checked = false;
  session.answer = null;
  session.feedback = null;
  if (ex) prepareExercise(ex);
}

export function startLesson(lessonId, narrator) {
  if (state.hearts <= 0 && !state.completed[lessonId]) {
    ui("hearts-modal", {});
    return;
  }
  const list = flatLessons();
  const lesson = list.find((l) => l.id === lessonId);
  if (!lesson) return;
  if (!lessonUnlocked(lessonId)) { toast("🔒 Conclua a etapa anterior primeiro"); return; }
  ensureDay();
  const r = resumable();
  if (r && r.lessonId === lessonId && !narrator && resumeLesson()) return;

  const heroKey = lesson.scene && SCENE_BY_ID[lesson.sceneId] && SCENE_BY_ID[lesson.sceneId].char;
  if (heroKey) narrator = castChar(heroKey);
  const exercises = lesson.scene ? buildSceneExercises(lesson) : buildExercises(lesson, lesson.unit);
  const s = baseSession(lesson, exercises, {
    practice: !!state.completed[lessonId],
    narrator: narrator || pickCharacter(lesson.unit.id),
    fixedNarrator: !!narrator || !!heroKey,
  });
  s.cast = buildCast(lesson.unit.id, s.narrator);
  s.cast.forEach((c) => { if (c.img) { const im = new Image(); im.src = c.img; } });
  begin(s);
}

export function resumeLesson() {
  const r = resumable();
  if (!r) return false;
  const lesson = r.lesson;
  setDistractUnit(lesson.unit);
  const narrator = r.narratorKey ? castChar(r.narratorKey) : pickCharacter(lesson.unit.id);
  const exercises = r.exercises;
  exercises.hard = r.hard;
  const s = baseSession(lesson, exercises, {
    index: r.index, mistakes: r.mistakes, firstMistakes: r.firstMistakes || 0, combo: r.combo, bestCombo: r.bestCombo, bonus: r.bonus,
    startedAt: Date.now() - (r.savedAt - r.startedAt),
    narrator, fixedNarrator: r.fixedNarrator, reviewQueue: r.reviewQueue, reviewing: r.reviewing, hardAdded: r.hardAdded, log: r.log || [],
  });
  s.hard = r.hard;
  s.cast = buildCast(lesson.unit.id, narrator);
  begin(s);
  return true;
}

export function setAnswer(v) {
  if (!session || session.checked) return;
  session.answer = v;
  notify();
}

export function registerMistakeSoft() {
  session.mistakes++;
  if (!session.reviewing) session.firstMistakes = (session.firstMistakes || 0) + 1;
  session.combo = 0;
  notify();
}

function cloneExercise(ex) {
  const c = { ...ex };
  delete c.correct; delete c.explain; delete c.accept; delete c.audioText; delete c.audioAfter; delete c.skipped; delete c.newWord; delete c.typo;
  if (Array.isArray(ex.options)) c.options = shuffle(ex.options);
  if (Array.isArray(ex.bank)) c.bank = shuffle(ex.bank);
  c.isReview = true;
  return c;
}

// "Não posso ouvir agora": troca os exercícios de escuta que ainda vêm
export function skipListening() {
  const ex = session.exercises[session.index];
  if (session.checked) return;
  state.listenMutedUntil = Date.now() + 15 * 60 * 1000; save();
  const map = { "listen": (e) => EX_MAKE["choice-pt-en"](e.word), "listen-choice": (e) => EX_MAKE["translate-en-pt"](e.sentence), "listen-build": (e) => EX_MAKE.build(e.sentence), "listen-type": (e) => EX_MAKE.build(e.sentence), "listen-match": (e) => EX_MAKE.match(e.pairs),
    "scene-listen": (e) => ({ type: "scene-read", sceneId: e.sceneId, lis: [e.li], silent: true }) };
  session.exercises = session.exercises.map((e, i) => (i > session.index && map[e.type]) ? Object.assign(map[e.type](e), { isReview: e.isReview }) : e);
  session.reviewQueue = (session.reviewQueue || []).map((e) => map[e.type] ? Object.assign(map[e.type](e), { isReview: true }) : e);
  session.hard = session.hard.filter((e) => !LISTEN_TYPES.includes(e.type));
  ex.skipped = true;
  session.answer = ex.type === "listen-match" ? "__matched__" : (ex.correct || (ex.accept && ex.accept[0]) || "");
  if (ex.type === "listen-match") ex.correct = "__matched__";
  toast("🔇 Exercícios de escuta pausados por 15 min");
  check();
}

// "Não posso falar agora"
export function skipSpeaking() {
  const ex = session.exercises[session.index];
  if (session.checked) return;
  state.speakMutedUntil = Date.now() + 15 * 60 * 1000;
  save();
  session.exercises = session.exercises.filter((e, i) => i <= session.index || (e.type !== "speak" && e.type !== "scene-speak"));
  session.hard = session.hard.filter((e) => e.type !== "speak");
  toast("🔇 Exercícios de fala pausados por 15 min");
  ex.skipped = true;
  session.answer = ex.correct || (ex.sentence && ex.sentence.en);
  check();
}

export function check() {
  if (!session || session.locked) return;
  const ex = session.exercises[session.index];

  if (ex.silent && !session.checked) session.checked = true;

  if (!session.checked) {
    session.checked = true;
    const { ok, typo } = evaluate(ex, session.answer);
    ex.typo = typo;
    if (ex.correct !== "__matched__" && !ex.skipped) {
      (session.log = session.log || []).push({ q: exLogText(ex), a: String(session.answer || ""), c: String(ex.correctLabel || ex.correct), ok, review: !!session.reviewing });
    }
    if (!ex.skipped) {
      if (ex.word) recordWord(ex.word.en, ok);
      else if (ex.sentence) recordSentence(ex.sentence, ok);
    }
    session.feedback = {
      ok,
      typo,
      skipped: !!ex.skipped,
      praise: ex.skipped ? "Tudo bem, seguimos!" : PRAISES[Math.floor(Math.random() * PRAISES.length)],
    };
    if (typeof ex.onChecked === "function") { try { ex.onChecked(ok); } catch (e) { /* ignora */ } }

    if (ok) {
      if (ex.word && state.errors[ex.word.en] && session.lesson.practiceErrors) {
        state.errors[ex.word.en] = Math.max(0, state.errors[ex.word.en] - 1);
        if (!state.errors[ex.word.en]) delete state.errors[ex.word.en];
        save();
      }
      if (!ex.skipped) {
        session.combo++;
        session.bestCombo = Math.max(session.bestCombo, session.combo);
        if (session.combo >= 3) {
          if (session.bonus < 5) session.bonus++;
          if (session.combo % 5 === 0) {
            sfx("combo");
            session.feedback.comboPill = `🔥 ${session.combo} seguidas · +${session.bonus} XP de bônus`;
          } else sfx("correct");
        } else sfx("correct");
        buzz(25);
      }
    } else {
      session.mistakes++;
      if (!session.reviewing) session.firstMistakes = (session.firstMistakes || 0) + 1;
      session.combo = 0;
      if (!session.reviewing) session.reviewQueue.push(cloneExercise(ex));
      saveResume();
      if (ex.word) { state.errors = state.errors || {}; state.errors[ex.word.en] = (state.errors[ex.word.en] || 0) + 1; }
      sfx("wrong");
      buzz([60, 40, 60]);
      if (!session.practice) {
        state.hearts = Math.max(0, state.hearts - 1);
        save();
      }
      if (!session.practice && state.hearts <= 0) {
        session.locked = true;
        const s0 = session;
        s0.heartsTimer = setTimeout(() => {
          if (session !== s0) return;
          ui("hearts-modal", {});
          ui("navigate", { screen: "home" });
          dropSession(false);
          notify();
        }, 1200);
      }
    }
    notify();
    return;
  }

  // Avança
  session.index++;
  adaptNext();
  const atEnd = session.index >= session.exercises.length;
  const closing = !atEnd && session.index === session.exercises.length - 1 && session.exercises[session.index].type === "scene-truth";
  if (atEnd || closing) {
    const at = closing ? session.index : session.exercises.length;
    if (!session.hardAdded && session.mistakes === 0 && session.hard.length) {
      session.hardAdded = true;
      const last = session.exercises[at - 1];
      const fresh = session.hard.filter((h) => !last || exKey(h) !== exKey(last)).slice(0, 2);
      if (fresh.length) {
        session.exercises.splice(at, 0, ...fresh);
        toast("💪 Mandou bem! Um desafio extra");
        prepareCurrent(); saveResume(); notify();
        return;
      }
    }
    if (!session.reviewing && session.reviewQueue.length) {
      session.reviewing = true;
      session.exercises.splice(at, 0, ...session.reviewQueue);
      session.reviewQueue = [];
      toast("🔁 Vamos revisar seus erros");
      prepareCurrent(); saveResume(); notify();
      return;
    }
    if (atEnd) { finishLesson(); return; }
  }
  prepareCurrent();
  saveResume();
  notify();
}

function exLogText(ex) {
  return ex.audioText || (ex.sentence && ex.sentence.en) || (ex.word && ex.word.en) || (ex.verse && ex.verse.text) || (ex.quiz && ex.quiz.q) || (ex.reading && ex.reading.q) || (ex.dialogue && ex.dialogue.line) || ex.type;
}

function recordSentence(sentence, ok) {
  sentenceVocab(sentence).forEach((w) => recordWord(w.en, ok));
}

function adaptNext() {
  const nxt = session.exercises[session.index];
  if (!nxt || nxt.isReview || nxt.newWord || session.reviewing || session.lesson.practiceErrors) return;
  const prev = session.exercises[session.index - 1];
  const after = session.exercises[session.index + 1];
  const sameNeighbor = (e) => [prev, after].some((n) => n && (e.type === n.type || exKey(e) === exKey(n)));
  let swap = null;
  if (nxt.sceneId) {
    const sc = SCENE_BY_ID[nxt.sceneId], line = sc && sc.lines[nxt.li];
    if (line && session.mistakes >= 2 && nxt.type === "scene-build") swap = { ...nxt, type: "scene-reply", options: sceneReplyOptions(line, sc), bank: undefined };
    else if (line && session.mistakes >= 2 && nxt.type === "scene-gap") swap = { ...nxt, type: "scene-missing", options: shuffle([nxt.blank, ...exNearWords(nxt.blank, 2)]) };
    else if (line && session.combo >= 3 && nxt.type === "scene-missing") swap = { ...nxt, type: "scene-gap", options: undefined };
    const usedSc = swap ? session.exercises.filter((e) => e.type === swap.type).length : 0;
    if (swap && !sameNeighbor(swap) && usedSc < capOf(swap.type)) { swap.adapted = true; session.exercises[session.index] = swap; }
    return;
  }
  if (session.combo >= 3 && nxt.word && (nxt.type === "listen" || nxt.type === "choice-pt-en")) {
    swap = EX_MAKE.type(nxt.word);
  } else if (session.mistakes >= 2 && nxt.word && nxt.type === "type") {
    swap = EX_MAKE["choice-pt-en"](nxt.word);
  } else if (!listenMuted() && session.mistakes >= 2 && nxt.sentence && (nxt.type === "listen-type" || nxt.type === "build")) {
    swap = EX_MAKE["listen-choice"](nxt.sentence, session.lesson.unit.id);
  }
  const used = swap ? session.exercises.filter((e) => e.type === swap.type).length : 0;
  if (swap && !sameNeighbor(swap) && used < capOf(swap.type)) { swap.adapted = true; session.exercises[session.index] = swap; }
}

function finishLesson() {
  if (state.resume && state.resume.lessonId === session.lesson.id) state.resume = null;
  const perfect = session.mistakes === 0;
  const first = !state.completed[session.lesson.id] && !session.lesson.practiceErrors && !String(session.lesson.id).startsWith("quick");
  let gained = session.practice ? 5 : XP_PER_LESSON;
  if (perfect) gained += XP_PERFECT_BONUS;
  gained += session.bonus;

  state.xp += gained;
  if (!session.lesson.practiceErrors && !session.levelUp) state.completed[session.lesson.id] = true;
  if (session.levelUp) {
    const uid = session.lesson.unit.id;
    state.crowns[uid] = Math.min(MAX_CROWN, unitCrowns(uid) + 1);
  }
  const earned = perfect ? 3 : (session.firstMistakes || 0) <= 2 ? 2 : 1;
  if (!session.lesson.practiceErrors && !session.levelUp) state.stars[session.lesson.id] = Math.max(state.stars[session.lesson.id] || 0, earned);
  if (session.practice && state.hearts < MAX_HEARTS) state.hearts++;
  save();

  const ch = session.lesson.scene && session.narrator ? session.narrator : pickCharacter(session.lesson.unit.id);
  sfx("finish");
  buzz([40, 30, 40, 30, 80]);
  confetti({ particleCount: 90, spread: 75, origin: { y: 0.35 }, ticks: 180 });
  if (perfect) setTimeout(() => confetti({ particleCount: 60, spread: 100, origin: { y: 0.3 } }), 350);

  const secs = Math.round((Date.now() - session.startedAt) / 1000);
  recordLesson({ gained, perfect, bestCombo: session.bestCombo });
  const firstPass = session.exercises.filter((e) => !e.isReview && !e.silent).length;
  const blessings = [
    { t: "I can do all things through Christ which strengtheneth me.", r: "Filipenses 4:13" },
    { t: "The joy of the LORD is your strength.", r: "Neemias 8:10" },
    { t: "Be strong and of a good courage.", r: "Josué 1:9" },
    { t: "Thy word is a lamp unto my feet.", r: "Salmos 119:105" },
  ];
  session.phase = "result";
  session.result = {
    perfect, first, gained, earned, secs, chest: false,
    char: ch,
    title: session.levelUp
      ? (session.legendary ? "Nível Lendário!" : `Coroa ${unitCrowns(session.lesson.unit.id)} conquistada!`)
      : session.lesson.scene ? (perfect ? "Cena perfeita!" : "Cena concluída!") : perfect ? "Lição perfeita!" : "Lição concluída!",
    accuracy: Math.max(0, Math.round((1 - (session.firstMistakes || 0) / Math.max(1, firstPass)) * 100)),
    blessing: blessings[Math.floor(Math.random() * blessings.length)],
    log: session.log || [],
    bonus: session.bonus,
    streak: state.streak,
  };
  notify();
}

export function openChest() {
  if (!session || !session.result || session.result.chest) return;
  const bonus = [1, 2, 3, 5][Math.floor(Math.random() * 4)];
  state.xp += bonus;
  save();
  session.result.chest = bonus;
  session.result.gained += bonus;
  sfx("sparkle");
  confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
  notify();
}

export function quitLesson() {
  save();
  dropSession();
  ui("navigate", { screen: "home" });
  notify();
}

export function finishToHome() {
  const wasHub = session && session.fromHub;
  dropSession(false);
  ui("navigate", { screen: wasHub ? "hub" : "home" });
  notify();
}

export function dropSession(clearAudio = true) {
  if (clearAudio) stopClip();
  if (session) {
    if (session.recognizer) { try { session.recognizer.abort(); } catch (e) { /* já parou */ } }
    if (session.practiceRec) { try { session.practiceRec.abort(); } catch (e) { /* já parou */ } }
    if (session.heartsTimer) clearTimeout(session.heartsTimer);
    session = null;
  }
}

// ---------- Práticas do hub ----------
export function learnedOnly() {
  const done = new Set(Object.keys(state.completed || {}));
  const seen = new Set(), words = [];
  COURSE.forEach((u) => u.lessons.forEach((l) => { if (done.has(l.id) && l.vocab) l.vocab.forEach((v) => { if (!seen.has(v.en)) { seen.add(v.en); words.push(v); } }); }));
  return words;
}
export function learnedVocab() {
  const words = learnedOnly();
  return words.length >= 8 ? words : allVocab().slice(0, 16);
}

export function startQuickPractice(kind, narrator) {
  const pool = allVocab();
  const learned = learnedVocab();
  const words = shuffle(weakestWords(learned, 8));
  const distract = (v, key) => shuffle(pool.filter((p) => p[key] !== v[key] && p.icon !== v.icon)).slice(0, 3);
  const ex = [];
  words.forEach((v, i) => {
    if (kind === "listen") {
      ex.push({ type: "listen", word: v, options: shuffle([v.en, ...distract(v, "en").map((p) => p.en)]) });
    } else {
      const k = i % 4;
      if (k === 0) ex.push({ type: "image-choice", word: v, options: shuffle([v, ...distract(v, "en")]) });
      else if (k === 1) ex.push({ type: "choice-en-pt", word: v, options: shuffle([v.pt, ...distract(v, "pt").map((p) => p.pt)]) });
      else if (k === 2) ex.push({ type: "listen", word: v, options: shuffle([v.en, ...distract(v, "en").map((p) => p.en)]) });
      else ex.push({ type: "type", word: v });
    }
  });
  if (kind !== "listen" && words.length >= 4) ex.push({ type: "match", pairs: words.slice(0, 4) });
  const list = spreadNeighbors(kind === "listen" ? ex : shuffle(ex).slice(0, 10));
  list.hard = [];
  const unit = COURSE[0];
  const s = baseSession({ id: "quick-" + kind, title: kind === "listen" ? "Escuta rápida" : "Revisão rápida", unit, practiceErrors: true }, list, {
    practice: true, narrator: narrator || pickCharacter(unit.id), fixedNarrator: !!narrator, hardAdded: true, fromHub: true,
  });
  s.cast = buildCast(unit.id, s.narrator);
  begin(s);
}

export function startErrorPractice() {
  const words = Object.keys(state.errors || {});
  if (!words.length) return;
  const seen = new Set();
  const pool = [...allVocab(), ...SCENES.flatMap((s) => s.vocab)].filter((p) => !seen.has(p.en) && seen.add(p.en));
  const vocab = shuffle(pool.filter((p) => words.includes(p.en))).slice(0, 6);
  if (!vocab.length) {
    state.errors = {}; save();
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
  const s = baseSession(lesson, ex, { practice: true, narrator: pickCharacter(unit.id), hardAdded: true, fromHub: true });
  s.cast = buildCast(unit.id, s.narrator);
  begin(s);
}

export function startLevelUp(unit) {
  if (state.hearts <= 0) { ui("hearts-modal", {}); return; }
  const crowns = unitCrowns(unit.id);
  const legendary = crowns >= MAX_CROWN - 1;
  const review = unit.lessons.find((l) => l.review) || unit.lessons[0];
  const lesson = { ...review, id: review.id, unit, levelUp: true, legendary, title: legendary ? "Lendária" : `Nível ${crowns + 1}` };
  let exercises = buildExercises({ ...lesson, review: true }, unit);
  const heavy = new Set(["build", "translate-en-pt", "listen-build", "listen-type", "complete-translation", "type", "speak", "verse", "read"]);
  const light = exercises.filter((e) => !heavy.has(e.type));
  const prod = exercises.filter((e) => heavy.has(e.type));
  const keepLight = Math.max(2, 6 - crowns);
  exercises = spreadNeighbors(shuffle(light).slice(0, keepLight).concat(prod));
  exercises.hard = [];
  const s = baseSession(lesson, exercises, {
    narrator: pickCharacter(unit.id), hardAdded: true, levelUp: true, legendary,
  });
  s.hard = [];
  s.cast = buildCast(unit.id, s.narrator);
  begin(s);
}
