#!/usr/bin/env node
// Gera biblelingo/data.js a partir de content/course.json (ordem e cabeçalhos) e content/u*.json (lições v1 ou v2),
// e regrava UNIT_CAST e CHARACTER_UNIT dentro de characters.js a partir de course.json (cast + gallery).
// Fonte das regras: docs/CONTENT_SPEC_V2.md, seção 3.5. Resumo operacional em tools/content/SPEC.md.
//
// Uso (na pasta biblelingo): node tools/content/merge.js [--force] [--no-validate] [--no-cast]
//   O merge roda o validador (--all) antes de gravar e aborta se houver problemas; --force grava mesmo assim.
//
// Lições v2 entram em data.js com os campos v2 integrais (tips, names, hints, vocab, beats, contrast, verse.blanks,
// reading.questions, conversation, fact) E com os campos legados derivados, para o motor atual continuar funcionando:
//   sentences = beats (en, pt, alt, altPt) · verse.blank/options = blanks[0] · reading.q/options/answer = questions[0]
//   dialogue = turnos 1 e 2 da conversa · quiz = questions[1] com explain (ou fact.pt)
// Lições v1 passam como hoje. A lição de revisão de cada unidade ganha checkpoint: true (seção 8.9).
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.resolve(__dirname, "../..") + "/";
const CONTENT = ROOT + "content/";
const args = process.argv.slice(2);
const FORCE = args.includes("--force"), NO_VALIDATE = args.includes("--no-validate"), NO_CAST = args.includes("--no-cast");

const readJson = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const pick = (o, keys) => { const r = {}; keys.forEach((k) => { if (o[k] !== undefined) r[k] = o[k]; }); return r; };

// 1) Validação (bloqueia o merge)
if (!NO_VALIDATE) {
  const { validateCourse } = require("./validate.js");
  const r = validateCourse({ all: true, quiet: true });
  if (r.problems.length) {
    console.error(r.problems.join("\n"));
    console.error(`${r.problems.length} problema(s) no conteúdo${FORCE ? " (gravando mesmo assim por --force)" : "; corrija ou use --force"}`);
    if (!FORCE) process.exit(1);
  }
}

// 2) course.json: ordem e cabeçalhos
const courseFile = CONTENT + "course.json";
if (!fs.existsSync(courseFile)) { console.error("falta content/course.json"); process.exit(1); }
const course = readJson(courseFile);
if (!Array.isArray(course.order) || !course.units) { console.error("course.json inválido (order/units)"); process.exit(1); }

// 3) Lição v2 -> objeto gravado em data.js (campos v2 + legados derivados)
function lessonV2(l) {
  const beats = [...(l.beats || [])].sort((a, b) => a.order - b.order);
  const sentences = beats.map((b) => pick(b, ["en", "pt", "alt", "altPt"]));
  const v = l.verse || {}, blanks = Array.isArray(v.blanks) ? v.blanks : [];
  const verse = { ...pick(v, ["text", "classic", "pt", "classicPt", "ref"]), ...(blanks[0] ? { blank: blanks[0].word, options: blanks[0].options } : {}), blanks };
  const rd = l.reading || {}, qs = Array.isArray(rd.questions) ? rd.questions : [];
  const reading = { ...pick(rd, ["text", "pt"]), ...(qs[0] ? { q: qs[0].q, options: qs[0].options, answer: qs[0].answer } : {}), questions: qs };
  const turns = (l.conversation && l.conversation.turns) || [];
  const dialogue = turns.length >= 2 && turns[1].who === "you"
    ? { line: turns[0].en, pt: turns[0].pt, options: turns[1].options, answer: turns[1].answer, answerPt: turns[1].pt }
    : undefined;
  const quiz = qs[1] ? { q: qs[1].q, options: qs[1].options, answer: qs[1].answer, explain: qs[1].explain || (l.fact && l.fact.pt) } : undefined;
  const out = { id: l.id, title: l.title, ref: l.ref, level: l.level, narrator: l.narrator, guests: l.guests, names: l.names, hints: l.hints, tips: l.tips,
    vocab: l.vocab, sentences, beats, contrast: l.contrast, verse, reading, dialogue, conversation: l.conversation, quiz, fact: l.fact, v: 2 };
  Object.keys(out).forEach((k) => { if (out[k] === undefined) delete out[k]; });
  return out;
}
// Lição v1 -> como hoje
const ORDER_V1 = ["id", "title", "vocab", "sentences", "verse", "reading", "dialogue", "quiz"];
const lessonV1 = (l) => pick(l, ORDER_V1);

// 4) Unidades na ordem de course.json
const stats = { units: 0, v2: 0, words: 0, core: 0, bible: 0, chunks: 0, beats: 0, tips: 0, v1words: 0, v1sentences: 0 };
const units = course.order.map((id) => {
  const h = course.units[id];
  if (!h) { console.error("course.json sem cabeçalho para " + id); process.exit(1); }
  const f = path.join(CONTENT, id + ".json");
  if (!fs.existsSync(f)) { console.error("falta " + f); process.exit(1); }
  const j = readJson(f);
  if (j.id !== id || !Array.isArray(j.lessons) || j.lessons.length !== 3) { console.error("unidade inválida " + f); process.exit(1); }
  const v2 = j.v === 2;
  const lessons = j.lessons.map((l) => (v2 ? lessonV2(l) : lessonV1(l)));
  lessons.push({ id: id + "r", title: "Revisão", review: true, checkpoint: true });
  stats.units++;
  if (v2) {
    stats.v2++;
    j.lessons.forEach((l) => {
      (l.vocab || []).forEach((w) => { if (w.pos === "chunk") stats.chunks++; else { stats.words++; if (w.tier === "bible") stats.bible++; else stats.core++; } });
      stats.beats += (l.beats || []).length; stats.tips += (l.tips || []).length;
    });
  } else j.lessons.forEach((l) => { stats.v1words += (l.vocab || []).length; stats.v1sentences += (l.sentences || []).length; });
  const unit = { id, title: h.title, subtitle: h.subtitle, icon: h.icon, face: h.face, color: h.color };
  if (h.level) unit.level = h.level;
  if (v2) unit.v = 2;
  unit.lessons = lessons;
  return unit;
});

// 5) Cruzamentos: vocabulário repetido entre unidades (aviso; v2 só sem recycle), frases repetidas (aviso)
const seen = new Map(), sent = new Map();
units.forEach((u) => u.lessons.forEach((l) => {
  (l.vocab || []).forEach((v) => { const k = String(v.en || "").toLowerCase(); if (!k) return; if (seen.has(k) && !v.recycle) console.log(`aviso: vocab "${v.en}" em ${seen.get(k)} e ${l.id}`); else if (!seen.has(k)) seen.set(k, l.id); });
  (l.sentences || []).forEach((s) => { const k = String(s.en || "").toLowerCase(); if (!k) return; if (sent.has(k)) console.log(`aviso: frase repetida "${s.en}" em ${sent.get(k)} e ${l.id}`); else sent.set(k, l.id); });
}));

// 6) data.js
const head = `// BíbliaLearn — conteúdo das unidades e lições (gerado de content/course.json + content/u*.json; edite os JSON e rode tools/content/merge.js)
// Ordem e cabeçalhos das unidades vêm de course.json. Lições v1: vocab (as 4 primeiras são as palavras-base da 1ª vez),
// sentences (arco da passagem), verse (KJV, domínio público, com lacuna), reading, dialogue e quiz.
// Lições v2 (campo v: 2): tips, names, hints, vocab (pos/field/tier/part/icon/example), beats (order 1..12, gap, grammar),
// contrast, verse (WEB em text, KJV em classic, blanks), reading (questions), conversation, fact; os campos legados
// (sentences, verse.blank/options, reading.q/options/answer, dialogue, quiz) são derivados para o motor atual.
// A lição "Revisão" de cada unidade é o checkpoint (checkpoint: true).

`;
fs.writeFileSync(ROOT + "data.js", head + "const COURSE = " + JSON.stringify(units, null, 2) + ";\n");

// 7) UNIT_CAST e CHARACTER_UNIT dentro de characters.js (decisão de orquestração: o app já importa de lá)
if (!NO_CAST) {
  const cf = ROOT + "characters.js";
  let src = fs.readFileSync(cf, "utf8");
  const unitCast = {}, charUnit = {};
  course.order.forEach((id) => {
    const h = course.units[id];
    unitCast[id] = [...(h.cast || [])];
    [...(h.cast || []), ...(h.gallery || [])].forEach((k) => { if (!charUnit[k]) charUnit[k] = id; });
  });
  const castSrc = "const UNIT_CAST = {\n" + course.order.map((id) => `  ${id}: [${unitCast[id].map((k) => JSON.stringify(k)).join(", ")}],`).join("\n") + "\n};";
  const entries = Object.entries(charUnit).map(([k, v]) => `${k}: "${v}"`);
  const lines = []; for (let i = 0; i < entries.length; i += 9) lines.push("  " + entries.slice(i, i + 9).join(", "));
  const unitSrc = "const CHARACTER_UNIT = {\n" + lines.join(",\n") + " };";
  const reCast = /const UNIT_CAST = \{[\s\S]*?\};/, reUnit = /const CHARACTER_UNIT = \{[\s\S]*?\};/;
  if (!reCast.test(src) || !reUnit.test(src)) { console.error("characters.js: blocos UNIT_CAST/CHARACTER_UNIT não encontrados"); process.exit(1); }
  const before = src;
  src = src.replace(reCast, castSrc).replace(reUnit, unitSrc);
  src = src.replace(/\/\/ Elenco por unidade: personagem principal \+ convidados\n/, "// Elenco por unidade (gerado de content/course.json pelo tools/content/merge.js; edite o course.json)\n");
  if (src !== before) fs.writeFileSync(cf, src);
  console.log(`characters.js: UNIT_CAST (${course.order.length} unidades) e CHARACTER_UNIT (${entries.length} personagens) ${src !== before ? "regravados" : "sem mudança"}`);
}

// 8) Resumo
const v1 = stats.units - stats.v2;
console.log(`data.js gerado: ${stats.units} unidades (${stats.v2} v2, ${v1} v1)` +
  (stats.v2 ? ` · v2: ${stats.words} palavras (${stats.core} core / ${stats.bible} bible) · ${stats.chunks} chunks · ${stats.beats} beats · ${stats.tips} dicas` : "") +
  (v1 ? ` · v1: ${stats.v1words} palavras · ${stats.v1sentences} frases` : ""));
