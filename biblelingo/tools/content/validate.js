// node tools/content/validate.js content/uX.json  → lista problemas ("OK" = nada a corrigir)
const fs = require("fs"), vm = require("vm");
const file = process.argv[2];
const u = JSON.parse(fs.readFileSync(file, "utf8"));
const ctx = {}; vm.createContext(ctx);
const root = require("path").resolve(__dirname, "../..") + "/";
vm.runInContext(fs.readFileSync(root + "data.js", "utf8"), ctx);
const COURSE = vm.runInContext("COURSE", ctx);
const norm = (t) => t.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();
const probs = [];
const otherVocab = new Map();
COURSE.filter((x) => x.id !== u.id).forEach((x) => x.lessons.forEach((l) => (l.vocab || []).forEach((v) => otherVocab.set(norm(v.en), x.id))));
const seenEn = new Set();
u.lessons.forEach((l) => {
  const P = (m) => probs.push(`${l.id}: ${m}`);
  if (!/^u\dl\d$/.test(l.id)) P("id inválido");
  ["title", "vocab", "sentences", "verse", "reading", "dialogue", "quiz"].forEach((k) => { if (!l[k]) P("falta " + k); });
  if (!l.vocab) return;
  if (l.vocab.length < 8 || l.vocab.length > 10) P(`vocab tem ${l.vocab.length} (esperado 8 a 10)`);
  const icons = new Set();
  l.vocab.forEach((v) => {
    if (!v.en || !v.pt || !v.icon) P("vocab incompleto " + JSON.stringify(v));
    if (icons.has(v.icon)) P("ícone repetido na lição: " + v.icon); icons.add(v.icon);
    if (seenEn.has(norm(v.en))) P("vocab repetido na unidade: " + v.en); seenEn.add(norm(v.en));
    if (otherVocab.has(norm(v.en))) console.log(`aviso ${l.id}: vocab "${v.en}" também está em ${otherVocab.get(norm(v.en))} (data.js atual); evite repetir entre unidades`);
    if (/[\u{1FA70}-\u{1FAFF}]/u.test(v.icon)) P("emoji recente (13+) pode não aparecer em celulares antigos: " + v.icon + " " + v.en);
  });
  const vocabWords = l.vocab.map((v) => norm(v.en.replace(/^to /, "").replace(/\s*\(.*\)/, "")));
  if (!l.sentences) return;
  if (l.sentences.length < 8 || l.sentences.length > 12) P(`sentences tem ${l.sentences.length} (esperado 8 a 12)`);
  const starts = {};
  l.sentences.forEach((s) => {
    if (!s.en || !s.pt) P("frase incompleta " + JSON.stringify(s));
    const n = norm(s.en), w = n.split(" ");
    if (w.length > 12) P("frase longa (>12 palavras): " + s.en);
    if (!/^[A-Z]/.test(s.en)) P("frase sem maiúscula inicial: " + s.en);
    if (/[—]/.test(s.en + s.pt)) P("travessão em: " + s.en);
    const k = w.slice(0, 2).join(" "); starts[k] = (starts[k] || 0) + 1;
    const IRR = { made: "make", said: "say", saw: "see", went: "go", came: "come", took: "take", gave: "give", ate: "eat", built: "build", sent: "send", told: "tell", brought: "bring", left: "leave", fed: "feed", led: "lead", threw: "throw", wrote: "write", sang: "sing", slept: "sleep", stood: "stand", found: "find", heard: "hear", knew: "know", spoke: "speak", ran: "run", sat: "sit", forgave: "forgive", rose: "rise", fell: "fall", drank: "drink", began: "begin", chose: "choose", kept: "keep", became: "become", grew: "grow", forgot: "forget", hid: "hide", fled: "flee", woke: "wake", shone: "shine", thought: "think", brake: "break", broke: "break", bought: "buy", caught: "catch", taught: "teach", fought: "fight", sought: "seek", meant: "mean", met: "meet", paid: "pay", lay: "lie", laid: "lay", shook: "shake", struck: "strike", swam: "swim", wept: "weep", blew: "blow", flew: "fly", drew: "draw", withdrew: "withdraw", bore: "bear", tore: "tear", wore: "wear", swore: "swear", sold: "sell", held: "hold", cast: "cast", did: "do", had: "have", was: "be", were: "be", is: "be", are: "be" };
    const stem = (x) => (IRR[x] || x).replace(/(ies|es|ed|ing|s|d)$/, "").replace(/e$/, "").slice(0, 4);
    const hit = vocabWords.some((vw) => vw && ((" " + n + " ").includes(" " + vw + " ") || vw.split(" ").every((p) => w.some((t) => stem(t) === stem(p) && stem(p).length >= 3))));
    if (!hit) P("frase sem palavra do vocabulário da lição: " + s.en);
  });
  Object.entries(starts).forEach(([k, c]) => { if (c > 2) P(`${c} frases começam com "${k}"`); });
  const v = l.verse;
  if (v) {
    const re = new RegExp("\\b" + v.blank.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "g");
    const n = (v.text.match(re) || []).length;
    if (n !== 1) P(`lacuna "${v.blank}" aparece ${n}x no versículo`);
    if (!v.options.includes(v.blank)) P("lacuna fora das opções");
    if (new Set(v.options).size !== v.options.length) P("opções repetidas no versículo");
    if (!v.ref || !v.pt) P("versículo sem ref/pt");
  }
  [["reading", l.reading], ["quiz", l.quiz]].forEach(([k, q]) => { if (q && !q.options.includes(q.answer)) P(`${k}: resposta fora das opções`); if (q && new Set(q.options).size !== q.options.length) P(`${k}: opções repetidas`); });
  if (l.dialogue && !l.dialogue.options.includes(l.dialogue.answer)) P("dialogue: resposta fora das opções");
  if (l.quiz && l.reading && norm(l.quiz.q) === norm(l.reading.q)) P("quiz e reading fazem a mesma pergunta");
  if (l.quiz && !l.quiz.explain) P("quiz sem explain");
});
console.log(probs.length ? probs.join("\n") : "OK " + file);
