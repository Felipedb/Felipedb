// Conteúdo derivado: trilha, elenco, vocabulário agregado — porta fiel de app.js/scene-engine.js.
import { COURSE, CHARACTERS, UNIT_CAST, CHARACTER_UNIT, SCENES, SCENE_EXTRAS, STORIES } from "../content/index.js";
import { state } from "./store.js";
import { normalize, shuffle, castHash, audioKey } from "./util.js";

export { COURSE, CHARACTERS, UNIT_CAST, CHARACTER_UNIT, SCENES, SCENE_EXTRAS, STORIES };

export const SCENE_BY_ID = {};
SCENES.forEach((s) => { SCENE_BY_ID[s.id] = s; });

// Personagem de uma fala: da galeria ou dos extras da cena (rosto em emoji)
export function castChar(key) {
  if (CHARACTERS[key]) return { key, ...CHARACTERS[key] };
  const e = SCENE_EXTRAS[key];
  if (e) return { key, name: e.name, emoji: e.emoji, voice: { gender: e.gender, pitch: 1, rate: 1 } };
  return { key: "narrator", name: "Narrador", emoji: "📖", voice: { gender: "male", pitch: 1, rate: 1 } };
}
export function sceneNameOf(key) { return castChar(key).name.split(" (")[0]; }

// Uma cena vira uma "etapa" da trilha com a mesma forma de uma lição
export function sceneStep(scene, unit) {
  return { id: scene.id, title: scene.title, unit, scene: true, sceneId: scene.id, vocab: scene.vocab };
}

// Ordem das etapas do capítulo: L1, C1, C2, L2, C3, C4, L3, C5, C6, Revisão
export function unitSteps(unit) {
  const lessons = unit.lessons.map((l) => ({ ...l, unit }));
  const scenes = SCENES.filter((s) => s.unit === unit.id).map((s) => sceneStep(s, unit));
  if (!scenes.length) return lessons;
  const core = lessons.filter((l) => !l.review), review = lessons.filter((l) => l.review);
  const out = [];
  let si = 0;
  core.forEach((l, i) => {
    out.push(l);
    const n = i === core.length - 1 ? scenes.length - si : 2;
    out.push(...scenes.slice(si, si + n));
    si += n;
  });
  out.push(...scenes.slice(si), ...review);
  return out;
}

export function flatLessons() {
  return COURSE.flatMap((u) => unitSteps(u));
}
export function unitDone(unit) {
  return unitSteps(unit).every((l) => state.completed[l.id]);
}
export function lessonUnlocked(lessonId) {
  const list = flatLessons();
  const idx = list.findIndex((l) => l.id === lessonId);
  if (idx === 0) return true;
  return !!state.completed[list[idx - 1].id];
}
export function currentLessonId() {
  const next = flatLessons().find((l) => !state.completed[l.id]);
  return next ? next.id : null;
}

export function allVocab() {
  return COURSE.flatMap((u) => u.lessons.flatMap((l) => l.vocab || []));
}
export function unitVocab(unit) {
  return unit.lessons.flatMap((l) => l.vocab || []);
}
export function allSentences() {
  return COURSE.flatMap((u) => u.lessons.flatMap((l) => (l.sentences || []).map((s) => ({ ...s, unit: u.id }))));
}
// Palavras do vocabulário presentes numa frase (para creditar acertos de frase)
export function sentenceVocab(sentence) {
  const toks = new Set(normalize(sentence.en).split(" "));
  return allVocab().filter((w) => normalize(w.en.replace(/^to /, "")).split(" ").every((t) => toks.has(t)));
}

export function verseOfDay() {
  const verses = COURSE.flatMap((u) => u.lessons.filter((l) => l.verse).map((l) => l.verse));
  const day = Math.floor(Date.now() / 86400000);
  return verses[day % verses.length];
}

export function testamentOf(unit, idx) {
  return idx < 7 ? "Antigo Testamento" : "Novo Testamento";
}

export function pickCharacter(unitId) {
  const cast = UNIT_CAST[unitId] || Object.keys(CHARACTERS);
  const key = cast[Math.floor(Math.random() * cast.length)];
  return { key, ...CHARACTERS[key] };
}
export function buildCast(unitId, narrator) {
  const keys = (UNIT_CAST[unitId] || Object.keys(CHARACTERS)).filter((k) => CHARACTERS[k]);
  const order = shuffle(keys.filter((k) => k !== narrator.key));
  return [narrator, ...order.map((k) => ({ key: k, ...CHARACTERS[k] }))];
}

// Dicas: português -> inglês por palavra (banco de palavras)
export const HINTS = (() => {
  const m = {};
  allVocab().forEach((v) => { m[normalize(v.pt)] = v.en; });
  return m;
})();

let _corpusWords = null;
export function corpusWords() {
  if (_corpusWords) return _corpusWords;
  const set = new Set();
  const addText = (t) => normalize(t).split(" ").forEach((w) => { if (w) set.add(w); });
  allVocab().forEach((w) => addText(w.en));
  allSentences().forEach((s) => addText(s.en));
  SCENES.forEach((sc) => { sc.lines.forEach((l) => addText(l.en)); sc.vocab.forEach((v) => addText(v.en)); });
  return (_corpusWords = set);
}

// Texto principal do exercício (o mesmo usado para escolher a voz na geração de áudio)
export function exKeyText(ex) {
  if (!ex) return "";
  return ex.audioText || (ex.sentence && ex.sentence.en) || (ex.word && ex.word.en) || (ex.verse && ex.verse.text) || (ex.quiz && ex.quiz.q) || (ex.reading && ex.reading.q) || (ex.dialogue && ex.dialogue.line) || "";
}
export { castHash, audioKey };
