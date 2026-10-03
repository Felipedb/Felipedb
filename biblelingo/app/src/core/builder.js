// Montador de lição — porta fiel de app.js (session generator estilo Duolingo).
import { state } from "./store.js";
import { shuffle, normalize, editDistance } from "./util.js";
import { allVocab, allSentences, unitVocab, flatLessons } from "./content.js";
import { weakestWords } from "./sr.js";
import { SPEECH_OK } from "./audio.js";

export const EX_RANK = { "image-choice": 0, "choice-en-pt": 1, "choice-pt-en": 2, "match": 2, "listen-match": 3, "listen": 3, "listen-choice": 4, "listen-build": 4, "missing-word": 5, "verse": 5, "translate-en-pt": 6, "build": 6, "complete-translation": 7, "listen-type": 7, "type": 7, "speak": 8, "read": 9, "dialogue": 9, "quiz": 10 };
export const LESSON_SIZE = 15;
export const MAX_PER_TYPE = 2;
const TYPE_CAP = { "image-choice": 3, "choice-en-pt": 3 };
export const capOf = (t) => TYPE_CAP[t] || MAX_PER_TYPE;

export function exKey(e) {
  return e.word ? "w:" + e.word.en : e.sentence ? "s:" + e.sentence.en : e.type;
}

let _distractUnit = null;
export function setDistractUnit(u) { _distractUnit = u; }
export const exDistract = (v, key, n = 3) => {
  const pool = allVocab().filter((p) => p[key] !== v[key] && p.icon !== v.icon && p.pt !== v.pt);
  const unitWords = _distractUnit ? shuffle(unitVocab(_distractUnit).filter((p) => pool.includes(p))) : [];
  const rest = shuffle(pool.filter((p) => !unitWords.includes(p)));
  return [...unitWords, ...rest].slice(0, n);
};
export const exNearWords = (target, n = 2) => {
  const words = [...new Set(allVocab().map((p) => p.en.replace(/^to /, "")))].filter((w) => normalize(w) !== normalize(target));
  const ranked = words.map((w) => ({ w, d: editDistance(w.toLowerCase(), target.toLowerCase()) + Math.random() * 1.5 })).sort((a, b) => a.d - b.d);
  return ranked.slice(0, n).map((x) => x.w);
};
export const exBank = (s, lang = "en") => {
  const words = s[lang].split(" ");
  const have = new Set(words.map((w) => normalize(w)));
  const extra = shuffle(allVocab().map((p) => p[lang].replace(/^to /, "").replace(/\s*\([^)]*\)/g, ""))).filter((w) => !have.has(normalize(w))).slice(0, 2);
  return shuffle([...words, ...extra]);
};
export const exBlankOf = (s) => {
  const pool = allVocab();
  const words = s.en.split(" ");
  const cands = words.filter((w) => pool.some((p) => normalize(p.en.replace(/^to /, "")) === normalize(w)) && w.length > 2 && words.filter((x) => normalize(x) === normalize(w)).length === 1);
  return cands.length ? cands[Math.floor(Math.random() * cands.length)] : null;
};
export const exPtDistractors = (s, unitId) =>
  shuffle(allSentences().filter((o) => o.pt !== s.pt)).sort((a, b) => (b.unit === unitId) - (a.unit === unitId)).slice(0, 2).map((o) => o.pt);

export const EX_MAKE = {
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

export const LISTEN_TYPES = ["listen", "listen-choice", "listen-build", "listen-type", "listen-match", "scene-listen"];
export const listenMuted = () => state.listenMutedUntil && Date.now() < state.listenMutedUntil;
export const speakMutedNow = () => state.speakMutedUntil && Date.now() < state.speakMutedUntil;

// Reordena uma lista pronta para nunca repetir formato nem item em sequência
export function spreadNeighbors(list) {
  const rest = list.slice(), out = [];
  while (rest.length) {
    const prev = out[out.length - 1];
    let j = rest.findIndex((e) => !prev || (e.type !== prev.type && exKey(e) !== exKey(prev)));
    if (j < 0) j = 0;
    out.push(rest.splice(j, 1)[0]);
  }
  out.hard = list.hard || [];
  return out;
}

export function buildExercises(lesson, unit) {
  _distractUnit = unit;
  const lessons = lesson.review ? unit.lessons.filter((l) => !l.review) : [lesson];
  const canSpeak = SPEECH_OK && !speakMutedNow();
  const firstTime = !state.completed[lesson.id];

  const vocab = lesson.review ? weakestWords(unitVocab(unit), 4)
    : firstTime ? (lesson.vocab || []).slice(0, 4) : shuffle(lesson.vocab || []).slice(0, 4);
  const sentences = lesson.review
    ? shuffle(lessons.flatMap((l) => l.sentences || [])).slice(0, 4)
    : shuffle(lesson.sentences || []).slice(0, 4);
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

  const noListen = (arr) => listenMuted() ? arr.filter((t) => !LISTEN_TYPES.includes(t)) : arr;
  const introTypes = noListen(firstTime ? ["image-choice", "choice-en-pt"] : ["image-choice", "choice-en-pt", "listen", "choice-pt-en"]);
  vocab.forEach((w, i) => {
    const rot = introTypes.slice(i % introTypes.length).concat(introTypes.slice(0, i % introTypes.length));
    pick(rot.concat(["listen", "choice-pt-en"]), w);
  });
  const sentTypes = noListen(firstTime
    ? ["build", "listen-choice", "listen-build", "translate-en-pt", "listen-type"]
    : ["listen-type", "translate-en-pt", "listen-build", "build", "listen-choice"]);
  sentences.forEach((s, i) => {
    const rot = sentTypes.slice(i % sentTypes.length).concat(sentTypes.slice(0, i % sentTypes.length));
    pick(rot, s, unit.id);
  });
  if (vocab.length >= 4) take(EX_MAKE[(firstTime || listenMuted() || Math.random() < 0.5) ? "match" : "listen-match"](shuffle(vocab).slice(0, 4)));
  verses.forEach((v) => take({ type: "verse", verse: v, options: shuffle(v.options) }));

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
  const earlier = flatLessons().filter((l) => !l.review && !l.scene && state.completed[l.id] && l.id !== lesson.id).flatMap((l) => l.vocab || []);
  if (earlier.length && !lesson.review) {
    const w = weakestWords(earlier, 3)[Math.floor(Math.random() * Math.min(3, earlier.length))];
    const rt = noListen(["listen", "choice-pt-en"]);
    optional.push({ pri: 1.5, mk: () => ({ ...make[rt[Math.floor(Math.random() * rt.length)]](w), isReview: true }), type: "review" });
  }
  const target = LESSON_SIZE + 1;
  shuffle(optional).sort((a, b) => a.pri - b.pri).forEach((o) => {
    if (chosen.length >= target) return;
    if (o.type !== "review" && (count[o.type] || 0) >= capOf(o.type)) return;
    take(o.mk());
  });

  const hard = [];
  const reserve = (t) => { const j = chosen.findIndex((e) => e.type === t); if (j >= 0) hard.push(...chosen.splice(j, 1)); };
  reserve("listen-type");
  if (!hard.length) reserve("type");

  const isIntro = (e) => e.type === "image-choice" || e.type === "choice-en-pt";
  const cands = chosen.map((e) => ({ e, k: isIntro(e) ? Math.random() * 420 : EX_RANK[e.type] * 100 + Math.random() * 160 })).sort((x, y) => x.k - y.k).map((x) => x.e);
  const introOf = {};
  cands.forEach((e) => { if (e.word && (introOf[e.word.en] == null || (!isIntro(introOf[e.word.en]) && isIntro(e)))) introOf[e.word.en] = e; });
  const placed = new Set();
  const ordered = [];
  while (cands.length) {
    const prev = ordered[ordered.length - 1];
    const ok = (e) => (!e.word || introOf[e.word.en] === e || placed.has(introOf[e.word.en]));
    const differs = (a, b) => !a || !b || (a.type !== b.type && exKey(a) !== exKey(b));
    let j = cands.findIndex((e) => ok(e) && differs(e, prev));
    if (j >= 0) { const e = cands.splice(j, 1)[0]; placed.add(e); ordered.push(e); continue; }
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
  if (firstTime && !lesson.review) {
    const seen = new Set();
    ordered.forEach((e) => { if (e.word && !e.isReview && !seen.has(e.word.en)) { seen.add(e.word.en); e.newWord = true; } });
  }
  ordered.hard = hard;
  return ordered;
}
