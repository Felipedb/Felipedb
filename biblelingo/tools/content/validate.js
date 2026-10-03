#!/usr/bin/env node
// Validador do conteúdo das lições (v1 e v2) do BíbliaLearn. Fonte das regras: docs/CONTENT_SPEC_V2.md, seção 3.4
// (blocos A a E) e seção 7.3 (cenas e histórias). Resumo operacional em tools/content/SPEC.md.
//
// Uso (na pasta biblelingo):
//   node tools/content/validate.js content/u1.json                 valida uma unidade (detecta "v": 2; sem "v" aplica as regras v1)
//   node tools/content/validate.js --all                           valida as 8 unidades de course.json, o próprio course.json e os cruzamentos (bloco E)
//   node tools/content/validate.js content/examples/u1l1.v2.json --one   aceita um arquivo com uma unidade de 1 lição (lição isolada)
//   opções: --scenes (regras 7.3 em scenes.js e scenes2.js), --stories (stories.js), --write-icons (grava pares novos em icons.json),
//           --quiet (sem avisos)
//
// Saída: cada regra que BLOQUEIA vira uma linha "<lição>: <problema>"; cada regra que AVISA vira "aviso <lição>: ...".
// Sem problemas imprime "OK <arquivo>". Código de saída 1 quando há problemas (o merge.js usa isto para bloquear).
// Como módulo: require("./validate.js").validateCourse({ all: true }) devolve { problems, warnings }.
"use strict";
const fs = require("fs"), path = require("path"), vm = require("vm");

const ROOT = path.resolve(__dirname, "../..") + "/";
const CONTENT = ROOT + "content/";
const TOOLS = __dirname + "/";

// ------------------------------------------------------------------------------------------------
// Utilitários de texto
// ------------------------------------------------------------------------------------------------
const DASH = /—/; // travessão
const norm = (t) => String(t).toLowerCase().replace(/[’‘]/g, "'").replace(/[^a-z0-9' ]+/g, " ").replace(/\s+/g, " ").trim();
const tokens = (t) => norm(t).split(" ").map((w) => w.replace(/^'+|'+$/g, "")).filter(Boolean);
const nWords = (t) => tokens(t).length;
const deacc = (t) => String(t).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const uniq = (a) => [...new Set(a)];
const sentences = (t) => String(t).split(/[.!?]+(?:["”']|\s|$)/).map((s) => s.trim()).filter((s) => /[a-zA-Z]/.test(s)).length;
function editDistance(a, b) {
  const m = a.length, n = b.length, d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 1; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[m][n];
}
// percorre todas as strings de um objeto (para travessão)
function walkStrings(o, fn, p = "") {
  if (typeof o === "string") fn(o, p);
  else if (Array.isArray(o)) o.forEach((x, i) => walkStrings(x, fn, p + "[" + i + "]"));
  else if (o && typeof o === "object") Object.keys(o).forEach((k) => walkStrings(o[k], fn, p ? p + "." + k : k));
}

// Formas irregulares (passado/particípio -> base) e plurais irregulares
const IRR = { made: "make", said: "say", saw: "see", seen: "see", went: "go", gone: "go", came: "come", took: "take", taken: "take", gave: "give", given: "give", ate: "eat", eaten: "eat", built: "build", sent: "send", told: "tell", brought: "bring", left: "leave", fed: "feed", led: "lead", threw: "throw", thrown: "throw", wrote: "write", written: "write", sang: "sing", sung: "sing", slept: "sleep", stood: "stand", found: "find", heard: "hear", knew: "know", known: "know", spoke: "speak", spoken: "speak", ran: "run", sat: "sit", forgave: "forgive", forgiven: "forgive", rose: "rise", risen: "rise", fell: "fall", fallen: "fall", drank: "drink", drunk: "drink", began: "begin", begun: "begin", chose: "choose", chosen: "choose", kept: "keep", became: "become", grew: "grow", grown: "grow", forgot: "forget", forgotten: "forget", hid: "hide", hidden: "hide", fled: "flee", woke: "wake", shone: "shine", thought: "think", broke: "break", broken: "break", bought: "buy", caught: "catch", taught: "teach", fought: "fight", sought: "seek", meant: "mean", met: "meet", paid: "pay", laid: "lay", shook: "shake", shaken: "shake", struck: "strike", swam: "swim", wept: "weep", blew: "blow", flew: "fly", drew: "draw", bore: "bear", born: "bear", tore: "tear", wore: "wear", swore: "swear", sold: "sell", held: "hold", did: "do", done: "do", had: "have", has: "have", was: "be", were: "be", is: "be", are: "be", am: "be", been: "be", got: "get", put: "put", shut: "shut", cut: "cut", let: "let", set: "set", hurt: "hurt", cast: "cast", read: "read", lost: "lose", won: "win", understood: "understand", sank: "sink", sunk: "sink", lit: "light", bent: "bend", spent: "spend", felt: "feel", dreamed: "dream", dreamt: "dream", hung: "hang", dug: "dig", bit: "bite", rode: "ride", sewed: "sew", showed: "show", shown: "show", wound: "wind", lay: "lie", lain: "lie", bowed: "bow", mice: "mouse", men: "man", women: "woman", children: "child", feet: "foot", teeth: "tooth", loaves: "loaf", leaves: "leaf", wives: "wife", lives: "life", knives: "knife", wolves: "wolf", halves: "half", calves: "calf", thieves: "thief", oxen: "ox", people: "person" };
const IRR_V1 = { made: "make", said: "say", saw: "see", went: "go", came: "come", took: "take", gave: "give", ate: "eat", built: "build", sent: "send", told: "tell", brought: "bring", left: "leave", fed: "feed", led: "lead", threw: "throw", wrote: "write", sang: "sing", slept: "sleep", stood: "stand", found: "find", heard: "hear", knew: "know", spoke: "speak", ran: "run", sat: "sit", forgave: "forgive", rose: "rise", fell: "fall", drank: "drink", began: "begin", chose: "choose", kept: "keep", became: "become", grew: "grow", forgot: "forget", hid: "hide", fled: "flee", woke: "wake", shone: "shine", thought: "think", brake: "break", broke: "break", bought: "buy", caught: "catch", taught: "teach", fought: "fight", sought: "seek", meant: "mean", met: "meet", paid: "pay", lay: "lie", laid: "lay", shook: "shake", struck: "strike", swam: "swim", wept: "weep", blew: "blow", flew: "fly", drew: "draw", withdrew: "withdraw", bore: "bear", tore: "tear", wore: "wear", swore: "swear", sold: "sell", held: "hold", cast: "cast", did: "do", had: "have", was: "be", were: "be", is: "be", are: "be" };
const PLURAL = { man: "men", woman: "women", child: "children", foot: "feet", tooth: "teeth", mouse: "mice", loaf: "loaves", leaf: "leaves", wife: "wives", life: "lives", knife: "knives", wolf: "wolves", half: "halves", calf: "calves", thief: "thieves", ox: "oxen", fish: "fish", sheep: "sheep", deer: "deer" };
// Todas as formas plausíveis de um lema (uma palavra): plural, -ed, -ing, 3ª pessoa, comparativo, irregulares
function formsOf(lemma, extra = []) {
  const w = norm(lemma), set = new Set([w, ...extra.map(norm)]);
  if (!w || w.includes(" ")) return set;
  Object.keys(IRR).forEach((f) => { if (IRR[f] === w) set.add(f); });
  if (PLURAL[w]) set.add(PLURAL[w]);
  set.add(w + "s"); set.add(w + "es"); set.add(w + "ed"); set.add(w + "d"); set.add(w + "ing"); set.add(w + "er"); set.add(w + "est"); set.add(w + "ly");
  if (w.endsWith("e")) { set.add(w.slice(0, -1) + "ing"); set.add(w + "r"); set.add(w + "st"); }
  if (w.endsWith("y")) { const b = w.slice(0, -1); set.add(b + "ies"); set.add(b + "ied"); set.add(b + "ier"); set.add(b + "iest"); set.add(b + "ily"); }
  if (/[^aeiou][aeiou][^aeiouwxy]$/.test(w)) { const c = w.slice(-1); set.add(w + c + "ed"); set.add(w + c + "ing"); set.add(w + c + "er"); set.add(w + c + "est"); }
  return set;
}
// Raiz grosseira para "variantes morfológicas da mesma palavra" (put/puts/putting; walk/walked)
function rootOf(w) {
  let x = norm(w); x = IRR[x] || x;
  x = x.replace(/ies$/, "y").replace(/(ing|ed|es|er|est|ly|s|d)$/, "");
  if (/([^aeiou])\1$/.test(x)) x = x.slice(0, -1);
  return x.replace(/e$/, "");
}
// Regex que acha um lema (ou expressão) em texto normalizado, aceitando as formas flexionadas de cada palavra
function phraseRegex(lemma, extra = []) {
  const ws = norm(String(lemma).replace(/^to /i, "")).split(" ").filter(Boolean);
  if (!ws.length) return /$^/;
  const alts = ws.map((w) => "(?:" + [...formsOf(w)].map(esc).join("|") + ")");
  const extras = extra.map((e) => esc(norm(e))).filter(Boolean);
  const body = extras.length ? "(?:" + alts.join(" ") + "|" + extras.join("|") + ")" : alts.join(" ");
  return new RegExp("\\b" + body + "\\b", "g");
}
const countMatches = (re, text) => (norm(text).match(re) || []).length;
const lemmaOf = (en) => norm(String(en).replace(/^to /i, "").replace(/\s*\(.*?\)/g, "").replace(/\/.*$/, ""));

// Listas de regras linguísticas (CONTENT_SPEC_V2 3.4 e 5.2)
const ARCHAIC = /\b(thee|thou|thy|thine|ye|unto|hath|saith|doth|shalt|art|hast|whereon|standest|looketh|saveth|shewed|stedfast|brethren|lest|verily|midst|upon|purposed|trespass|void)\b/i;
const ARCHAIC_SOFT = /\b(behold|whom|shall|for ever)\b/i;
const BRITISH = { colour: "color", counsellor: "counselor", "for ever": "forever", kneeled: "knelt", shewed: "showed", stedfast: "steadfast", neighbour: "neighbor", saviour: "savior", honour: "honor", favour: "favor", centre: "center", grey: "gray", travelling: "traveling", realise: "realize" };
const TU_VOS = /\b(tu|te|ti|teu|teus|tua|tuas|vós|vos|vosso|vossos|vossa|vossas|contigo|convosco)\b/i;
const VOS_VERB = /\b([a-z]+(?:ais|eis))\b/gi;
const VOS_WHITE = new Set(["pais", "mais", "reis", "leis", "seis", "dezesseis", "jamais", "demais", "cais", "sais", "tais", "quais", "animais", "sinais", "canais", "reais", "iguais", "especiais", "naturais", "finais", "gerais", "locais", "totais", "legais", "sociais", "principais", "materiais", "ideais", "hospitais", "metais", "jornais", "cristais", "oficiais", "manuais", "anuais", "atuais", "casais", "rituais", "vitrais", "varais", "ancestrais", "funerais", "morais", "mortais", "imortais", "centrais", "mundiais", "nacionais", "regionais", "pessoais", "quintais", "pardais", "cereais"]);
const NEGATIVE = /\b(not|don't|doesn't|didn't|cannot|can't|never|no)\b/i;
const FIRST_PERSON = new Set(["i", "we", "my", "our", "me", "us", "i'm", "i'll", "i've", "we're", "we'll", "let's"]);
const EMOJI_13 = /[\u{1FA70}-\u{1FAFF}]/u;
const ABSTRACT_FIELDS = new Set(["feelings", "mind", "quality", "faith", "quantity", "speech"]);
const CONTENT_POS = new Set(["noun", "verb", "adj", "adv", "num"]);
const POS = new Set(["noun", "verb", "adj", "adv", "num", "chunk", "func"]);
const FIELDS = new Set(["creation", "nature", "animals", "people", "family", "food", "body", "feelings", "mind", "quality", "actions", "places", "time", "objects", "work", "faith", "speech", "quantity"]);
const KINDS = new Set(["statement", "question", "negative", "first-person", "quote"]);
const MOODS = new Set(["calmo", "animado", "surpreso", "assustado", "triste", "irônico", "bravo", "carinhoso", "urgente", "solene", "rindo", "sussurrando"]);
const SINGULAR_OK = new Set(["vegetables", "lips", "clothes", "news", "glasses", "scissors", "pants", "trousers", "shorts", "jeans", "thanks", "means", "series", "species", "jesus"]);
// Lista mínima de alta frequência (seção 4.1, regra E2)
const MINIMUM = ["i", "you", "he", "she", "we", "they", "it", "my", "your", "his", "her", "our", "their", "who", "what", "where", "when", "why", "how", "how many", "how much",
  "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "forty",
  "day", "night", "morning", "evening", "today", "now", "year", "father", "mother", "son", "daughter", "brother", "sister", "wife", "family", "friend",
  "bread", "water", "fish", "fruit", "wine", "food", "meat", "hand", "heart", "eye", "mouth", "foot", "head", "house", "city", "land", "sea", "river", "mountain", "garden", "road",
  "be", "have", "go", "come", "make", "see", "say", "give", "take", "eat", "drink", "sleep", "walk", "run", "open", "close", "send", "follow", "pray", "sing", "write", "read", "buy", "sell", "love", "help", "work", "wait", "ask", "answer", "know", "think", "want", "need", "find", "put", "bring", "call", "leave", "look"];

// ------------------------------------------------------------------------------------------------
// Carga de listas, elenco e conteúdo
// ------------------------------------------------------------------------------------------------
const readJson = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const optJson = (f, dflt) => (fs.existsSync(f) ? readJson(f) : dflt);

function loadLists() {
  const fw = optJson(TOOLS + "function-words.json", { words: {} }).words || {};
  const fwSet = new Set(Object.keys(fw).map(norm));
  const grammarSets = (optJson(TOOLS + "grammar-sets.json", { sets: [] }).sets || []).map((s) => new Set(s.map(norm)));
  const synonyms = optJson(TOOLS + "synonyms.json", { pairs: {} }).pairs || {};
  const icons = optJson(TOOLS + "icons.json", { icons: {}, legacy: {} });
  icons.icons = icons.icons || {}; icons.legacy = icons.legacy || {};
  const ngsl = new Set((optJson(TOOLS + "ngsl.json", { words: [] }).words || []).map(norm));
  return { fw, fwSet, grammarSets, synonyms, icons, ngsl };
}
const isSynonym = (lists, a, b) => {
  const x = lemmaOf(a), y = lemmaOf(b), p = lists.synonyms;
  return (p[x] || []).map(norm).includes(y) || (p[y] || []).map(norm).includes(x);
};
const inNgsl = (lists, en) => {
  const w = lemmaOf(en);
  if (!w || w.includes(" ")) return true; // expressões não são checadas
  if (lists.ngsl.has(w)) return true;
  return [rootOf(w), w.replace(/(est|er)$/, ""), w.replace(/(iest|ier)$/, "y")].some((r) => r && lists.ngsl.has(r));
};

// characters.js, scenes.js, scenes2.js e stories.js são scripts clássicos: carregamos num sandbox (como gen-audio.mjs)
function loadWorld() {
  const ctx = { window: {}, navigator: {}, document: {}, console };
  vm.createContext(ctx);
  for (const f of ["characters.js", "scenes.js", "scenes2.js", "stories.js"]) {
    const file = ROOT + f;
    if (!fs.existsSync(file)) continue;
    const src = fs.readFileSync(file, "utf8").replace(/^const (CHARACTERS|CHARACTER_ORDER|UNIT_CAST|CHARACTER_UNIT|SCENES|SCENE_EXTRAS|STORIES) =/gm, "var $1 =");
    vm.runInContext(src, ctx, { filename: f });
  }
  // vozes ElevenLabs por personagem (tools/gen-audio.mjs), só para checar duplicidade dentro de uma cena
  let voiceByChar = {};
  const ga = ROOT + "tools/gen-audio.mjs";
  if (fs.existsSync(ga)) {
    const m = /const VOICE_BY_CHAR = \{([\s\S]*?)\};/.exec(fs.readFileSync(ga, "utf8"));
    if (m) { const re = /(\w+):\s*"(\w+)"/g; let x; while ((x = re.exec(m[1]))) voiceByChar[x[1]] = x[2]; }
  }
  return { CHARACTERS: ctx.CHARACTERS || {}, SCENE_EXTRAS: ctx.SCENE_EXTRAS || {}, SCENES: ctx.SCENES || [], STORIES: ctx.STORIES || [], voiceByChar };
}
const knownSpeaker = (world, k) => !!(world.CHARACTERS[k] || world.SCENE_EXTRAS[k]);

function loadCourse() { return optJson(CONTENT + "course.json", null); }
function loadUnits(course) {
  const order = course ? course.order : ["u1", "u2", "u3", "u4", "u5", "u6", "u7", "u8"];
  const units = [];
  order.forEach((id) => {
    const f = CONTENT + id + ".json";
    if (!fs.existsSync(f)) return;
    const j = readJson(f);
    units.push({ id, file: path.relative(ROOT, f), v: j.v === 2 ? 2 : 1, data: j });
  });
  return units;
}

// Vocabulário de uma lição em forma de itens normalizados (v1 e v2)
function lessonVocab(l, v) {
  return (l.vocab || []).map((it) => {
    const lemma = lemmaOf(it.en || "");
    const extra = Array.isArray(it.forms) ? it.forms : [];
    const chunk = v === 2 ? it.pos === "chunk" : lemma.includes(" ");
    const forms = new Set();
    lemma.split(" ").forEach((w) => formsOf(w).forEach((f) => forms.add(f)));
    extra.forEach((e) => forms.add(norm(e)));
    return { ...it, lemma, chunk, forms, regex: phraseRegex(lemma, extra), v };
  });
}
// Lições em ordem de curso: [{ unitId, lesson, v, index }]
function allLessons(units) {
  const out = [];
  units.forEach((u) => (u.data.lessons || []).forEach((l) => out.push({ unitId: u.id, lesson: l, v: l.__v || u.v })));
  return out;
}
// Textos em inglês onde uma palavra pode "voltar" (regra E1)
function lessonEnglish(l, v) {
  const t = [];
  if (v === 2) {
    (l.beats || []).forEach((b) => t.push(b.en));
    if (l.reading) { t.push(l.reading.text); (l.reading.questions || []).forEach((q) => { t.push(q.q); (q.options || []).forEach((o) => t.push(o)); }); }
    (l.conversation && l.conversation.turns || []).forEach((tu) => { if (tu.en) t.push(tu.en); (tu.options || []).forEach((o) => t.push(o)); });
  } else {
    (l.sentences || []).forEach((s) => t.push(s.en));
    if (l.reading) t.push(l.reading.text);
    if (l.dialogue) { t.push(l.dialogue.line); (l.dialogue.options || []).forEach((o) => t.push(o)); }
  }
  return t.filter(Boolean).join(" \n ");
}

// ------------------------------------------------------------------------------------------------
// course.json
// ------------------------------------------------------------------------------------------------
function validateCourseFile(course, world, probs, warns) {
  const P = (m) => probs.push("course.json: " + m), W = (m) => warns.push("course.json: " + m);
  if (!course) { P("arquivo content/course.json não encontrado"); return; }
  if (course.v !== 2) P('falta "v": 2');
  if (!Array.isArray(course.order) || course.order.length !== 8) P("order deve listar as 8 unidades");
  const order = course.order || [];
  if (new Set(order).size !== order.length) P("order com unidade repetida");
  order.forEach((id) => { if (!/^u\d$/.test(id)) P("id de unidade inválido em order: " + id); if (!course.units || !course.units[id]) P("unidade sem cabeçalho em units: " + id); });
  Object.keys(course.units || {}).forEach((id) => {
    const u = course.units[id], Q = (m) => probs.push(`course.json ${id}: ${m}`), QW = (m) => warns.push(`course.json ${id}: ${m}`);
    if (!order.includes(id)) Q("unidade fora de order");
    ["title", "subtitle", "icon", "face", "color", "cast", "extras", "level"].forEach((k) => { if (u[k] === undefined) Q("falta " + k); });
    if (u.color && !/^#[0-9a-fA-F]{6}$/.test(u.color)) Q("color deve ser #rrggbb: " + u.color);
    if (u.icon && EMOJI_13.test(u.icon)) Q("ícone emoji 13+ (pode não aparecer): " + u.icon);
    if (u.level && !/^[AB][12]\.[12]$/.test(u.level)) QW("level fora do padrão A1.1..B2.2: " + u.level);
    if (u.face && !world.CHARACTERS[u.face]) Q("face não existe em CHARACTERS: " + u.face);
    (u.cast || []).forEach((k) => { if (!world.CHARACTERS[k]) Q("cast com personagem fora de CHARACTERS: " + k); });
    (u.extras || []).forEach((k) => { if (!world.SCENE_EXTRAS[k]) Q("extras com voz fora de SCENE_EXTRAS: " + k); });
    (u.gallery || []).forEach((k) => { if (!world.CHARACTERS[k]) Q("gallery com personagem fora de CHARACTERS: " + k); });
    if (u.cast && u.face && !u.cast.includes(u.face)) QW("face não está no cast: " + u.face);
    if (u.cast && (u.cast.includes("jesus") && id !== "u8")) QW("Jesus no elenco de uma unidade do Antigo Testamento (anacronismo, CB-11)");
    walkStrings(u, (s, p) => { if (DASH.test(s)) Q("travessão em " + p); });
  });
  // um personagem em dois elencos: CHARACTER_UNIT fica com o primeiro da ordem
  const seen = {};
  order.forEach((id) => { const u = course.units && course.units[id]; if (!u) return; [...(u.cast || []), ...(u.gallery || [])].forEach((k) => { if (seen[k] && seen[k] !== id) W(`personagem ${k} em ${seen[k]} e ${id}; CHARACTER_UNIT fica com ${seen[k]}`); else seen[k] = seen[k] || id; }); });
}

// ------------------------------------------------------------------------------------------------
// Regras v1 (arquivos sem "v": 2), mantidas da versão anterior; cruzamentos lidos de content/*.json
// ------------------------------------------------------------------------------------------------
function validateV1(unit, ctx, probs, warns) {
  const u = unit.data;
  const otherVocab = new Map();
  ctx.units.filter((x) => x.id !== unit.id).forEach((x) => x.data.lessons.forEach((l) => (l.vocab || []).forEach((v) => otherVocab.set(norm(v.en), x.id))));
  const seenEn = new Set();
  if (!/^u\d$/.test(u.id || "")) probs.push(`${unit.file}: id de unidade inválido`);
  if (!Array.isArray(u.lessons) || (u.lessons.length !== 3 && !ctx.opts.one)) probs.push(`${unit.file}: esperadas 3 lições`);
  (u.lessons || []).forEach((l) => {
    const P = (m) => probs.push(`${l.id}: ${m}`), W = (m) => warns.push(`${l.id}: ${m}`);
    if (!/^u\dl\d$/.test(l.id || "")) P("id inválido");
    ["title", "vocab", "sentences", "verse", "reading", "dialogue", "quiz"].forEach((k) => { if (!l[k]) P("falta " + k); });
    if (!l.vocab) return;
    if (l.vocab.length < 8 || l.vocab.length > 10) P(`vocab tem ${l.vocab.length} (esperado 8 a 10)`);
    const icons = new Set();
    l.vocab.forEach((v) => {
      if (!v.en || !v.pt || !v.icon) P("vocab incompleto " + JSON.stringify(v));
      if (icons.has(v.icon)) P("ícone repetido na lição: " + v.icon); icons.add(v.icon);
      if (seenEn.has(norm(v.en))) P("vocab repetido na unidade: " + v.en); seenEn.add(norm(v.en));
      if (otherVocab.has(norm(v.en))) W(`vocab "${v.en}" também está em ${otherVocab.get(norm(v.en))}; evite repetir entre unidades`);
      if (EMOJI_13.test(v.icon || "")) P("emoji recente (13+) pode não aparecer em celulares antigos: " + v.icon + " " + v.en);
    });
    // casamento frase x vocabulário exatamente como no validador v1 (radical de 4 letras; IRR antigo)
    const normV1 = (t) => String(t).toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();
    const stemV1 = (x) => (IRR_V1[x] || x).replace(/(ies|es|ed|ing|s|d)$/, "").replace(/e$/, "").slice(0, 4);
    const vocabWords = l.vocab.map((v) => normV1(String(v.en || "").replace(/^to /, "").replace(/\s*\(.*\)/, "")));
    if (!l.sentences) return;
    if (l.sentences.length < 8 || l.sentences.length > 12) P(`sentences tem ${l.sentences.length} (esperado 8 a 12)`);
    const starts = {};
    l.sentences.forEach((s) => {
      if (!s.en || !s.pt) P("frase incompleta " + JSON.stringify(s));
      const w = tokens(s.en || "");
      if (w.length > 12) P("frase longa (>12 palavras): " + s.en);
      if (!/^[A-Z"“]/.test(s.en || "")) P("frase sem maiúscula inicial: " + s.en);
      if (DASH.test((s.en || "") + (s.pt || ""))) P("travessão em: " + s.en);
      const k = w.slice(0, 2).join(" "); starts[k] = (starts[k] || 0) + 1;
      const n1 = normV1(s.en || ""), w1 = n1.split(" ");
      const hit = vocabWords.some((vw) => vw && ((" " + n1 + " ").includes(" " + vw + " ") || vw.split(" ").every((p) => w1.some((t) => stemV1(t) === stemV1(p) && stemV1(p).length >= 3))));
      if (!hit) P("frase sem palavra do vocabulário da lição: " + s.en);
    });
    Object.entries(starts).forEach(([k, c]) => { if (c > 2) P(`${c} frases começam com "${k}"`); });
    const v = l.verse;
    if (v) {
      const n = countMatches(new RegExp("\\b" + esc(norm(v.blank || "")) + "\\b", "g"), v.text || "");
      if (n !== 1) P(`lacuna "${v.blank}" aparece ${n}x no versículo`);
      if (!(v.options || []).includes(v.blank)) P("lacuna fora das opções");
      if (new Set(v.options || []).size !== (v.options || []).length) P("opções repetidas no versículo");
      if (!v.ref || !v.pt) P("versículo sem ref/pt");
    }
    [["reading", l.reading], ["quiz", l.quiz]].forEach(([k, q]) => { if (q && !(q.options || []).includes(q.answer)) P(`${k}: resposta fora das opções`); if (q && new Set(q.options || []).size !== (q.options || []).length) P(`${k}: opções repetidas`); });
    if (l.dialogue && !(l.dialogue.options || []).includes(l.dialogue.answer)) P("dialogue: resposta fora das opções");
    if (l.quiz && l.reading && norm(l.quiz.q || "") === norm(l.reading.q || "")) P("quiz e reading fazem a mesma pergunta");
    if (l.quiz && !l.quiz.explain) P("quiz sem explain");
  });
}

// ------------------------------------------------------------------------------------------------
// Regras v2 (blocos A a D) para uma unidade
// ------------------------------------------------------------------------------------------------
function validateV2(unit, ctx, probs, warns) {
  const { course, world, lists, opts } = ctx;
  const u = unit.data;
  const uid = u.id;
  const Pu = (m) => probs.push(`${unit.file}: ${m}`), Wu = (m) => warns.push(`${unit.file}: ${m}`);
  const order = course ? course.order : [];
  const header = course && course.units ? course.units[uid] : null;

  // ---- Bloco A: estrutura da unidade
  if (u.v !== 2) Pu('A1: "v" deve ser 2');
  if (!/^u\d$/.test(uid || "")) Pu("A1: id de unidade inválido");
  if (course && !order.includes(uid)) Pu(`A1: unidade ${uid} fora de course.json.order`);
  const lessons = Array.isArray(u.lessons) ? u.lessons : [];
  if (!Array.isArray(u.lessons)) Pu("A1: falta lessons");
  if (opts.one) { if (lessons.length < 1 || lessons.length > 3) Pu("A1: com --one aceitam-se 1 a 3 lições"); }
  else {
    const ids = lessons.map((l) => l.id);
    if (lessons.length !== 3 || [1, 2, 3].some((n) => !ids.includes(`${uid}l${n}`))) Pu(`A1: esperadas exatamente 3 lições ${uid}l1, ${uid}l2, ${uid}l3 (há: ${ids.join(", ")})`);
  }
  ["quiz", "dialogue", "sentences"].forEach((k) => { if (u[k]) Wu(`campo legado ${k} no nível da unidade é ignorado`); });

  // Lições anteriores e posteriores na ordem do curso (de todos os arquivos carregados, v1 ou v2)
  const all = allLessons(ctx.units);
  const idx = (lid) => all.findIndex((x) => x.lesson.id === lid);
  const otherV2Units = ctx.units.filter((x) => x.v === 2 && x.id !== uid);
  const otherV1Units = ctx.units.filter((x) => x.v === 1 && x.id !== uid);

  lessons.forEach((l, li) => {
    const lid = l.id || `${uid}l?`;
    const P = (m) => probs.push(`${lid}: ${m}`), W = (m) => warns.push(`${lid}: ${m}`);

    // A2: campos obrigatórios
    if (!new RegExp(`^${uid}l[1-3]$`).test(l.id || "")) P(`A1: id inválido (esperado ${uid}l1..3)`);
    ["title", "ref", "level", "narrator", "tips", "vocab", "beats", "contrast", "verse", "reading", "conversation", "fact"].forEach((k) => { if (l[k] === undefined || l[k] === null) P("A2: falta " + k); });
    if (header && l.level && header.level && l.level !== header.level) W(`A2: level ${l.level} difere do nível da unidade em course.json (${header.level})`);
    // D5: campos legados
    ["quiz", "dialogue", "sentences"].forEach((k) => { if (l[k]) W(`D5: campo legado ${k} será ignorado (o merge gera os legados a partir dos campos v2)`); });
    // C9: travessão em qualquer campo
    walkStrings(l, (s, p) => { if (DASH.test(s)) P("C9: travessão em " + p); });

    // A3: narrador e convidados
    const guests = Array.isArray(l.guests) ? l.guests : [];
    if (l.narrator) {
      if (!world.CHARACTERS[l.narrator]) P(`A3: narrator "${l.narrator}" não existe em CHARACTERS (characters.js)`);
      if (l.narrator === "jesus" || l.narrator === "voice") P("A3: o aluno fala pelo narrador; Jesus e a voz do Senhor não podem narrar (CS-21)");
      if (header && header.cast && !header.cast.includes(l.narrator)) P(`A3: narrator "${l.narrator}" não está no cast da unidade em course.json (${(header.cast || []).join(", ")})`);
    }
    guests.forEach((g) => {
      if (!knownSpeaker(world, g)) P(`A3: guest "${g}" não existe em CHARACTERS nem em SCENE_EXTRAS`);
      else if (header && ![...(header.cast || []), ...(header.extras || [])].includes(g)) W(`A3: guest "${g}" não está em cast/extras da unidade em course.json`);
    });
    if (!Array.isArray(l.names)) W("A2: sem names (card Quem é quem); nomes próprios dos beats precisarão estar em hints");
    const names = Array.isArray(l.names) ? l.names : [];
    names.forEach((n) => { if (!n.en || !n.pt) P("names: item sem en/pt " + JSON.stringify(n)); });
    const hints = l.hints && typeof l.hints === "object" ? l.hints : {};
    Object.entries(hints).forEach(([k, v]) => { if (typeof v !== "string" || !v) P(`hints: glosa vazia para "${k}"`); });

    // Tips
    const tips = Array.isArray(l.tips) ? l.tips : [];
    if (tips.length !== 2 || !tips.some((t) => t.part === 1) || !tips.some((t) => t.part === 2)) P(`A2: tips deve ter exatamente 2 dicas, uma com part 1 e outra com part 2 (há ${tips.length})`);
    tips.forEach((t) => {
      const tag = `tip P${t.part}`;
      ["id", "title", "body", "grammar", "examples", "contrast"].forEach((k) => { if (t[k] === undefined) P(`${tag}: falta ${k}`); });
      if (Array.isArray(t.examples)) { if (t.examples.length !== 2) P(`${tag}: examples deve ter 2 itens`); t.examples.forEach((e) => { if (!e.en || !e.pt) P(`${tag}: exemplo sem en/pt`); }); }
      if (t.contrast && (!t.contrast.a || !t.contrast.b || !t.contrast.note)) P(`${tag}: contrast precisa de a, b e note`);
    });
    const tipByPart = { 1: tips.find((t) => t.part === 1), 2: tips.find((t) => t.part === 2) };

    // ---- Bloco B: vocabulário
    const vocabRaw = Array.isArray(l.vocab) ? l.vocab : [];
    const vocab = lessonVocab(l, 2);
    if (vocabRaw.length !== 10) P(`B1: vocab tem ${vocabRaw.length} itens (esperados 10: 4 de conteúdo + 1 chunk por parte)`);
    [1, 2].forEach((p) => {
      const part = vocabRaw.filter((v) => v.part === p);
      const content = part.filter((v) => CONTENT_POS.has(v.pos)), chunks = part.filter((v) => v.pos === "chunk");
      if (content.length !== 4) P(`B1: parte ${p} tem ${content.length} itens de conteúdo (noun/verb/adj/adv/num); esperados 4`);
      if (chunks.length !== 1) P(`B1: parte ${p} tem ${chunks.length} chunk(s); esperado 1`);
    });
    const namesNorm = new Set(names.map((n) => lemmaOf(n.en)));
    const iconsInLesson = new Map();
    const beats = Array.isArray(l.beats) ? l.beats : [];
    const beatsOfPart = (p) => beats.filter((b) => (b.order <= 6 ? 1 : 2) === p);
    vocabRaw.forEach((v, i) => {
      const tag = `vocab "${v.en || "#" + (i + 1)}"`;
      // B2
      ["en", "pt", "pos", "field", "tier", "part", "icon", "example"].forEach((k) => { if (v[k] === undefined || v[k] === "") P(`B2: ${tag} sem ${k}`); });
      if (v.pos && !POS.has(v.pos)) P(`B2: ${tag} pos inválida "${v.pos}"`);
      if (v.field && !FIELDS.has(v.field)) P(`B2: ${tag} field inválido "${v.field}"`);
      if (v.tier && !["core", "bible"].includes(v.tier)) P(`B2: ${tag} tier inválido "${v.tier}" (core | bible)`);
      if (v.part !== 1 && v.part !== 2) P(`B2: ${tag} part deve ser 1 ou 2`);
      if (["noun", "verb"].includes(v.pos) && !ABSTRACT_FIELDS.has(v.field) && !v.image) W(`B2: ${tag} sem image (ilustração em app/public/img/vocab/); o card usará o emoji até a ilustração existir`);
      if (v.pos === "chunk" && v.tier === "bible") W(`B4: ${tag} chunk com tier bible`);
      if (!v.en) return;
      const en = String(v.en), pt = String(v.pt || "");
      // B3
      if (/[()\/]/.test(en)) P(`B3: ${tag} en com parênteses ou barra`);
      if (/[()\/]/.test(pt)) P(`B3: ${tag} pt com parênteses ou barra ("${pt}"); o complemento vai em note`);
      if (tokens(pt).length > 3 && v.pos !== "chunk") W(`B3: ${tag} glosa longa ("${pt}"); use 1 a 2 palavras`);
      if (v.pos === "noun" && /s$/i.test(lemmaOf(en)) && !SINGULAR_OK.has(lemmaOf(en)) && !/(ss|us|is)$/.test(lemmaOf(en))) P(`B3: ${tag} substantivo no plural; use o singular (plural irregular em "plural")`);
      if (v.pos === "verb" && !/^to /.test(en)) P(`B3: ${tag} verbo deve começar com "to "`);
      if (v.pos !== "verb" && /^to /.test(en)) P(`B3: ${tag} começa com "to " mas pos não é verb`);
      if (v.pos === "chunk" && tokens(en).length < 2) P(`B3: ${tag} chunk precisa de pelo menos 2 palavras`);
      // B5
      if (v.pos !== "chunk" && /^[A-Z]/.test(en.replace(/^to /, ""))) P(`B5: ${tag} parece nome próprio (maiúscula); nomes vão em names`);
      if (namesNorm.has(lemmaOf(en))) P(`B5: ${tag} está em names; nomes próprios não são vocabulário`);
      // B4 (lista)
      if (v.tier === "core" && v.pos !== "chunk" && !inNgsl(lists, en)) W(`B4: ${tag} marcado core mas fora da lista NGSL (tools/content/ngsl.json); confirme a frequência ou use tier bible`);
      // B9: ícones
      if (v.icon) {
        if (EMOJI_13.test(v.icon)) P(`B9: ${tag} emoji 13+ (${v.icon}) pode não aparecer; use emoji até 12.0`);
        if (iconsInLesson.has(v.icon) && iconsInLesson.get(v.icon) !== lemmaOf(en)) P(`B9: ícone ${v.icon} repetido na lição (${iconsInLesson.get(v.icon)} e ${en})`);
        iconsInLesson.set(v.icon, lemmaOf(en));
        const bound = lists.icons.icons[v.icon];
        if (bound && lemmaOf(bound) !== lemmaOf(en)) P(`B9: ícone ${v.icon} já representa "${bound}" em icons.json; um ícone = um conceito no curso`);
        const legacy = lists.icons.legacy[v.icon];
        if (legacy && !legacy.map(lemmaOf).includes(lemmaOf(en))) W(`B9: ícone ${v.icon} é usado no conteúdo v1 para ${legacy.join("/")}; confira a resolução da seção 4.8`);
      }
      // B7: ocorrências em beats da parte; B10: exemplo
      const item = vocab[i];
      const inPart = beatsOfPart(v.part).filter((b) => countMatches(item.regex, b.en || "") > 0);
      const need = v.pos === "chunk" ? 1 : 2;
      if (inPart.length < need) P(`B7: ${tag} aparece em ${inPart.length} beat(s) da parte ${v.part}; mínimo ${need} (declare forms: [...] para flexões não reconhecidas)`);
      const ex = beats.find((b) => b.order === v.example);
      if (!ex) P(`B10: ${tag} example ${v.example} não aponta para um beat`);
      else if ((ex.order <= 6 ? 1 : 2) !== v.part) P(`B10: ${tag} example ${v.example} está na outra parte`);
      else if (countMatches(item.regex, ex.en || "") === 0) P(`B10: ${tag} example ${v.example} não contém a palavra`);
    });
    // B4: proporção
    const content = vocabRaw.filter((v) => CONTENT_POS.has(v.pos));
    const core = content.filter((v) => v.tier === "core").length, bible = vocabRaw.filter((v) => v.tier === "bible").length;
    if (content.length && core < 6) P(`B4: só ${core} dos ${content.length} itens de conteúdo são tier core (mínimo 6, regra 70/30)`);
    if (bible > 2) P(`B4: ${bible} itens tier bible (máximo 2 por lição)`);
    // B6: repetição dentro da unidade e entre unidades
    const lemmas = vocabRaw.map((v) => lemmaOf(v.en || ""));
    lemmas.forEach((lm, i) => {
      if (!lm) return;
      if (lemmas.indexOf(lm) !== i) P(`B6: vocab "${vocabRaw[i].en}" repetido na lição`);
      lessons.forEach((o) => { if (o !== l && (o.vocab || []).some((x) => lemmaOf(x.en || "") === lm) && !vocabRaw[i].recycle) P(`B6: vocab "${vocabRaw[i].en}" também está em ${o.id} (mesma unidade)`); });
      const inV2 = otherV2Units.flatMap((x) => x.data.lessons.filter((o) => (o.vocab || []).some((y) => lemmaOf(y.en || "") === lm)).map((o) => o.id));
      const inV1 = otherV1Units.flatMap((x) => x.data.lessons.filter((o) => (o.vocab || []).some((y) => lemmaOf(y.en || "") === lm)).map((o) => o.id));
      if (inV2.length && !vocabRaw[i].recycle) P(`B6: vocab "${vocabRaw[i].en}" já é ensinado em ${inV2.join(", ")}; marque recycle: true ou troque a palavra (CL-32)`);
      else if (inV1.length && !vocabRaw[i].recycle) W(`B6: vocab "${vocabRaw[i].en}" também está no conteúdo v1 de ${inV1.join(", ")} (será reescrito)`);
      if (vocabRaw[i].recycle) {
        const before = all.slice(0, Math.max(0, idx(l.id))).some((x) => (x.lesson.vocab || []).some((y) => lemmaOf(y.en || "") === lm));
        if (!before) W(`B6: vocab "${vocabRaw[i].en}" tem recycle: true mas nenhuma lição anterior o ensina`);
      }
    });
    // B8: glosa básica repetida no curso
    vocabRaw.forEach((v) => {
      if (!v.pt || v.recycle || v.pos === "chunk") return;
      const g = deacc(v.pt);
      all.forEach((x) => (x.lesson.vocab || []).forEach((y) => {
        if (x.lesson.id === l.id || !y.pt) return;
        if (deacc(String(y.pt).replace(/\s*\(.*?\)/g, "")) === g && lemmaOf(y.en || "") !== lemmaOf(v.en)) W(`B8: glosa "${v.pt}" de "${v.en}" coincide com a de "${y.en}" em ${x.lesson.id} (CL-17); use glosas distintas`);
      }));
    });

    // Cobertura lexical (C5): vocabulário da lição + lições anteriores + funcionais + names + hints
    const accepted = new Set(lists.fwSet);
    const addItem = (it) => it.forms.forEach((f) => accepted.add(f));
    vocab.forEach(addItem);
    const myIdx = idx(l.id);
    const before = myIdx >= 0 ? all.slice(0, myIdx) : all.filter((x) => order.indexOf(x.unitId) < order.indexOf(uid) || (x.unitId === uid && x.lesson.id < l.id));
    const prevVocab = [];
    before.forEach((x) => lessonVocab(x.lesson, x.v).forEach((it) => { addItem(it); prevVocab.push(it); }));
    names.forEach((n) => tokens(n.en || "").forEach((t) => accepted.add(t)));
    const hintSet = new Set();
    Object.keys(hints).forEach((h) => { formsOf(h).forEach((f) => hintSet.add(f)); tokens(h).forEach((t) => hintSet.add(t)); });
    const isCovered = (t) => accepted.has(t) || hintSet.has(t) || /^\d+$/.test(t) || (t.endsWith("'s") && (accepted.has(t.slice(0, -2)) || hintSet.has(t.slice(0, -2))));
    const uncovered = (text) => uniq(tokens(text).filter((t) => !isCovered(t)));
    const hintsUsed = (text) => uniq(tokens(text).filter((t) => !accepted.has(t) && hintSet.has(t)));

    // ---- Bloco C: beats
    if (beats.length !== 12) P(`C1: ${beats.length} beats (esperados 12)`);
    const orders = beats.map((b) => b.order).sort((a, b) => a - b);
    if (beats.length === 12 && orders.some((o, i) => o !== i + 1)) P("C1: order deve ir de 1 a 12 sem buracos nem repetições");
    const starts1 = {}, starts2 = {};
    const beatEn = new Set();
    beats.forEach((b) => {
      const tag = `beat ${b.order}`;
      if (!b.en || !b.pt) { P(`${tag}: falta en ou pt`); return; }
      const prod = b.prod !== false, w = tokens(b.en);
      if (b.kind && !KINDS.has(b.kind)) P(`${tag}: kind inválido "${b.kind}"`);
      if (b.fact === undefined) W(`${tag}: sem fact (true = texto/paráfrase; false = frase livre)`);
      if (b.speaker && !knownSpeaker(world, b.speaker)) P(`${tag}: speaker "${b.speaker}" desconhecido`);
      else if (b.speaker && b.speaker !== l.narrator && !guests.includes(b.speaker)) W(`${tag}: speaker "${b.speaker}" não está em guests`);
      // C2
      if (prod && (w.length < 4 || w.length > 10)) P(`C2: ${tag} tem ${w.length} palavras (produção: 4 a 10): "${b.en}"`);
      if (!prod && w.length > 12) P(`C2: ${tag} tem ${w.length} palavras (máximo 12 com prod: false)`);
      if (!/^["“]?[A-Z]/.test(b.en)) P(`C2: ${tag} deve começar com maiúscula`);
      if (/[.]\s*["”]?$/.test(b.en)) W(`C2: ${tag} termina com ponto final (a interface põe a pontuação)`);
      if (prod) {
        const inner = b.en.replace(/\?\s*(Yes|No),/g, "? $1").replace(/[,:;]\s*$/, "");
        const hasQuote = /["“”]/.test(b.en);
        const punct = (inner.match(/[,:;]/g) || []).length - (hasQuote || b.iconic ? 1 : 0);
        if (punct > 0) W(`C2: ${tag} com pontuação interna (vírgula, dois-pontos ou ponto e vírgula): "${b.en}"`);
      }
      // C3, C4
      const arc = ARCHAIC.exec(b.en);
      if (arc) P(`C3: ${tag} com arcaísmo "${arc[1]}": "${b.en}"`);
      const soft = ARCHAIC_SOFT.exec(b.en);
      if (soft && prod) P(`C3: ${tag} com "${soft[1]}" em beat de produção; use prod: false ou reescreva`);
      Object.keys(BRITISH).forEach((k) => { if (new RegExp("\\b" + esc(k) + "\\b", "i").test(b.en)) P(`C4: ${tag} grafia britânica/KJV "${k}"; use "${BRITISH[k]}"`); });
      // C5
      if (prod) {
        const miss = uncovered(b.en);
        if (miss.length) P(`C5: ${tag} usa palavra(s) fora do vocabulário, dos funcionais, de names e de hints: ${miss.join(", ")} ("${b.en}")`);
        const hu = hintsUsed(b.en);
        if (hu.length > 1) W(`C5: ${tag} apoia-se em ${hu.length} glosas de hints (${hu.join(", ")}); ideal 1`);
      }
      // C8 (pt)
      const tv = TU_VOS.exec(b.pt);
      if (tv) P(`C8: ${tag} pt em tu/vós ("${tv[1]}"): "${b.pt}"; a forma Almeida vai em altPt`);
      let vv; VOS_VERB.lastIndex = 0;
      while ((vv = VOS_VERB.exec(deacc(b.pt)))) { if (!VOS_WHITE.has(vv[1])) W(`C8: ${tag} possível verbo na 2ª do plural ("${vv[1]}") em "${b.pt}"`); }
      // C7: lacuna
      if (b.gap) {
        const g = b.gap, gtag = `${tag} gap "${g.word}"`;
        if (!g.word || !Array.isArray(g.options) || !g.kind) P(`C7: ${gtag} precisa de word, kind e options`);
        else {
          const exact = (String(b.en).match(new RegExp("(^|[^A-Za-z0-9'])" + esc(String(g.word)) + "(?![A-Za-z0-9'])", "g")) || []).length;
          const occ = countMatches(new RegExp("\\b" + esc(norm(g.word)) + "\\b", "g"), b.en);
          if (exact !== 1) P(`C7: ${gtag} aparece ${exact}x no beat (esperado exatamente 1)`);
          else if (occ > 1) W(`C7: ${gtag} repete em outra caixa no beat; o motor deve abrir a lacuna na forma exata`);
          if (!g.options.includes(g.word)) P(`C7: ${gtag} fora das options`);
          if (new Set(g.options.map(norm)).size !== g.options.length) P(`C7: ${gtag} options repetidas`);
          if (g.options.length < 3 || g.options.length > 4) W(`C7: ${gtag} com ${g.options.length} options (ideal 3)`);
          const opts = g.options.map(norm);
          if (g.kind === "grammar") {
            const sameSet = lists.grammarSets.some((s) => opts.every((o) => s.has(o)));
            const sameRoot = new Set(opts.map(rootOf)).size === 1 && rootOf(opts[0]).length >= 2;
            if (!sameSet && !sameRoot) P(`C7: ${gtag} kind grammar exige variantes morfológicas da mesma palavra ou um conjunto de grammar-sets.json (${g.options.join(", ")})`);
            if (!b.grammar) W(`C7: ${gtag} kind grammar sem campo grammar ligando à Dica`);
          } else if (g.kind === "lexical") {
            const items = opts.map((o) => vocab.find((it) => it.lemma && it.forms.has(o)) || prevVocab.find((it) => it.lemma && it.forms.has(o)));
            items.forEach((it, k) => { if (!it) P(`C7: ${gtag} opção "${g.options[k]}" não está no vocabulário da lição`); });
            const posSet = new Set(items.filter(Boolean).map((it) => it.pos));
            if (posSet.size > 1) P(`C7: ${gtag} opções com pos diferentes (${[...posSet].join(", ")})`);
            for (let a = 0; a < opts.length; a++) for (let c = a + 1; c < opts.length; c++) {
              if (opts[a].length === opts[c].length && editDistance(opts[a], opts[c]) <= 2) P(`C7: ${gtag} opções vizinhas ortográficas ("${g.options[a]}" / "${g.options[c]}", CP-07)`);
            }
          } else P(`C7: ${gtag} kind deve ser grammar ou lexical`);
        }
      }
      if (b.grammar && !tips.some((t) => t.grammar === b.grammar)) P(`${tag}: grammar "${b.grammar}" não corresponde a nenhuma Dica`);
      // C10
      const st = w.slice(0, 2).join(" "); starts2[st] = (starts2[st] || 0) + 1; starts1[w[0]] = (starts1[w[0]] || 0) + 1;
      if (beatEn.has(norm(b.en))) P(`${tag}: en repetido na lição`); beatEn.add(norm(b.en));
    });
    Object.entries(starts2).forEach(([k, c]) => { if (c > 2) W(`C10: ${c} beats começam com "${k}"`); });
    Object.entries(starts1).forEach(([k, c]) => { if (c > 4) W(`C10: ${c} beats começam com "${k}"`); });
    // C6
    const nQ = beats.filter((b) => b.kind === "question" || /\?/.test(b.en || "")).length;
    const nNeg = beats.filter((b) => b.kind === "negative" || NEGATIVE.test(b.en || "")).length;
    const nFirst = beats.filter((b) => b.kind === "first-person" || tokens(b.en || "").some((t) => FIRST_PERSON.has(t))).length;
    if (nQ < 2) P(`C6: ${nQ} beat(s) com pergunta (mínimo 2)`);
    if (nNeg < 1) P("C6: nenhum beat negativo (not, never, no...)");
    if (nFirst < 1) P("C6: nenhum beat em 1ª pessoa (I, we, my, our...)");
    const contrast = Array.isArray(l.contrast) ? l.contrast : [];
    if (contrast.length !== 2) P(`C6: contrast deve ter 2 pares (há ${contrast.length})`);
    contrast.forEach((c, i) => {
      if (!c.a || !c.b || !c.note) { P(`C6: contrast #${i + 1} precisa de a, b e note`); return; }
      if (!beatEn.has(norm(c.a))) P(`C6: contrast #${i + 1}: "a" deve ser igual a um beat ("${c.a}")`);
      if (norm(c.a) === norm(c.b)) P(`C6: contrast #${i + 1}: a e b iguais`);
      const ar = ARCHAIC.exec(c.b); if (ar) P(`C3: contrast #${i + 1} com arcaísmo "${ar[1]}"`);
    });
    // C11
    [1, 2].forEach((p) => {
      const tip = tipByPart[p]; if (!tip) return;
      const ok = beatsOfPart(p).some((b) => b.gap && b.gap.kind === "grammar" && b.grammar === tip.grammar);
      if (!ok) P(`C11: parte ${p} sem beat com gap.kind grammar ligado à Dica "${tip.grammar}"`);
    });
    // C3/C8 em tips
    tips.forEach((t) => {
      [t.title, t.body, ...(t.examples || []).map((e) => e.pt), t.contrast && t.contrast.note].filter(Boolean).forEach((s) => { const m = TU_VOS.exec(s); if (m) P(`C8: tip P${t.part} em tu/vós ("${m[1]}"): "${s}"`); });
      [...(t.examples || []).map((e) => e.en), t.contrast && t.contrast.a, t.contrast && t.contrast.b].filter(Boolean).forEach((s) => { const m = ARCHAIC.exec(s); if (m) P(`C3: tip P${t.part} com arcaísmo "${m[1]}": "${s}"`); });
    });
    // C8 em vocab e names
    vocabRaw.forEach((v) => { const m = TU_VOS.exec(v.pt || ""); if (m) P(`C8: vocab "${v.en}" pt em tu/vós ("${m[1]}")`); const a = ARCHAIC.exec(v.en || ""); if (a) P(`C3: vocab "${v.en}" com arcaísmo`); Object.keys(BRITISH).forEach((k) => { if (new RegExp("\\b" + esc(k) + "\\b", "i").test(v.en || "")) P(`C4: vocab "${v.en}" grafia britânica; use "${BRITISH[k]}"`); }); });

    // ---- Bloco D: versículo
    const vs = l.verse;
    if (vs) {
      ["text", "classic", "pt", "classicPt", "ref"].forEach((k) => { if (!vs[k]) P(`D1: verse sem ${k}`); });
      if (vs.text) {
        const nw = nWords(vs.text);
        if (nw > 18) P(`D1: verse.text com ${nw} palavras (máximo 18)`);
        const a = ARCHAIC.exec(vs.text); if (a) W(`D1: verse.text com "${a[1]}" (confira se a WEB traz essa forma)`);
        const tv = TU_VOS.exec(vs.pt || ""); if (tv) P(`C8: verse.pt (versão livre) em tu/vós ("${tv[1]}"); a Almeida vai em classicPt`);
        const blanks = Array.isArray(vs.blanks) ? vs.blanks : [];
        if (blanks.length < 2 || blanks.length > 3) P(`D1: verse.blanks com ${blanks.length} lacunas (esperadas 2 ou 3)`);
        blanks.forEach((bl, i) => {
          const tag = `D1: lacuna #${i + 1} "${bl.word}"`;
          if (!bl.word || !Array.isArray(bl.options)) { P(`${tag} precisa de word e options`); return; }
          const occ = countMatches(new RegExp("\\b" + esc(norm(bl.word)) + "\\b", "g"), vs.text);
          if (occ !== 1) P(`${tag} aparece ${occ}x no versículo (esperado 1)`);
          if (!bl.options.includes(bl.word)) P(`${tag} fora das options`);
          if (bl.options.length !== 4 || new Set(bl.options.map(norm)).size !== 4) P(`${tag} precisa de 4 opções únicas`);
          bl.options.forEach((o) => {
            if (norm(o) === norm(bl.word)) return;
            if (countMatches(new RegExp("\\b" + esc(norm(o)) + "\\b", "g"), vs.text) > 0) P(`${tag}: a opção "${o}" aparece no versículo (CB-23)`);
            if (isSynonym(lists, o, bl.word)) P(`${tag}: a opção "${o}" é sinônimo da resposta (synonyms.json)`);
            const ar = ARCHAIC.exec(o); if (ar) P(`${tag}: opção com arcaísmo "${o}"`);
          });
        });
        if (blanks.length >= 2 && blanks.map((b) => norm(b.word)).some((w, i, arr) => arr.indexOf(w) !== i)) P("D1: lacunas repetidas");
      }
      if (vs.blank || vs.options) W("D5: verse.blank/options legados serão derivados de blanks[0]");
    }
    // ---- Leitura
    const rd = l.reading;
    if (rd) {
      if (!rd.text || !rd.pt) P("D2: reading precisa de text e pt");
      if (rd.text) {
        const ns = sentences(rd.text);
        if (ns < 3 || ns > 5) P(`D2: reading.text com ${ns} frases (esperadas 3 a 5)`);
        const a = ARCHAIC.exec(rd.text); if (a) P(`D2: reading.text com arcaísmo "${a[1]}"`);
        const soft = ARCHAIC_SOFT.exec(rd.text); if (soft) W(`D2: reading.text com "${soft[1]}"`);
        if (/\b(said|asked|answered|cried|called|replied)\s*:/i.test(rd.text)) P("D2: discurso direto em inglês usa vírgula e aspas (said, \"...\"), não dois-pontos");
        const miss = uncovered(rd.text);
        if (miss.length) P(`D2: reading.text usa palavra(s) não ensinadas nem glosadas em hints: ${miss.join(", ")}`);
        const hu = hintsUsed(rd.text);
        if (hu.length > 1) W(`D2: reading.text apoia-se em ${hu.length} glosas de hints (${hu.join(", ")}); ideal 1`);
        Object.keys(BRITISH).forEach((k) => { if (new RegExp("\\b" + esc(k) + "\\b", "i").test(rd.text)) P(`C4: reading com grafia britânica "${k}"`); });
      }
      if (rd.pt) { const tv = TU_VOS.exec(rd.pt); if (tv) P(`C8: reading.pt em tu/vós ("${tv[1]}")`); }
      const qs = Array.isArray(rd.questions) ? rd.questions : [];
      if (qs.length !== 2) P(`D2: reading.questions deve ter exatamente 2 perguntas (há ${qs.length})`);
      const kinds = qs.map((q) => q.kind);
      if (qs.length === 2 && (kinds[0] !== "literal" || kinds[1] !== "inference")) P(`D2: as perguntas devem ser kind literal e depois inference (há: ${kinds.join(", ")})`);
      const normText = norm(rd.text || "");
      qs.forEach((q, i) => {
        const tag = `D2: pergunta #${i + 1}`;
        ["q", "qPt", "options", "answer"].forEach((k) => { if (!q[k]) P(`${tag} sem ${k}`); });
        if (q.kind === "inference" && !q.explain) W(`${tag} de inferência sem explain (em português, com a referência)`);
        if (q.explain && !/\d/.test(q.explain)) W(`${tag} explain sem referência bíblica`);
        if (Array.isArray(q.options)) {
          if (q.options.length !== 3 || new Set(q.options.map(norm)).size !== q.options.length) P(`${tag} precisa de 3 opções únicas`);
          if (!q.options.includes(q.answer)) P(`${tag} resposta fora das opções`);
          q.options.forEach((o) => {
            const ow = tokens(o);
            for (let k = 0; k + 4 <= ow.length; k++) { if (normText.includes(ow.slice(k, k + 4).join(" "))) { P(`${tag}: a opção "${o}" copia 4+ palavras do texto (CP-09); parafraseie`); break; } }
            const a = ARCHAIC.exec(o); if (a) P(`${tag}: opção com arcaísmo "${a[1]}"`);
          });
        }
        if (q.qPt) { const tv = TU_VOS.exec(q.qPt); if (tv) P(`C8: ${tag} qPt em tu/vós`); }
        if (q.q && ARCHAIC.test(q.q)) P(`${tag} pergunta com arcaísmo`);
      });
      if (qs.length === 2 && qs[0].q && qs[1].q && norm(qs[0].q) === norm(qs[1].q)) P("D2: as duas perguntas são iguais");
      if (rd.q || rd.options) W("D5: reading.q/options/answer legados serão derivados de questions[0]");
    }
    // ---- Conversa
    const cv = l.conversation;
    if (cv) {
      if (!cv.with) P("D3: conversation sem with");
      else if (!knownSpeaker(world, cv.with)) P(`D3: conversation.with "${cv.with}" não existe em CHARACTERS nem em SCENE_EXTRAS`);
      else { if (cv.with === l.narrator) W("D3: o interlocutor é o próprio narrador (o aluno fala pelo narrador)"); if (!guests.includes(cv.with)) W(`D3: conversation.with "${cv.with}" não está em guests`); }
      const turns = Array.isArray(cv.turns) ? cv.turns : [];
      if (turns.length < 3 || turns.length > 4) P(`D3: conversation com ${turns.length} turnos (esperados 3 a 4)`);
      const you = turns.filter((t) => t.who === "you");
      if (you.length !== 2) P(`D3: ${you.length} turno(s) do aluno (who: you); esperados 2`);
      // vocabulário de unidades posteriores e nomes de outras unidades
      const laterV2 = new Set(), laterV1 = new Set(), otherNames = new Set();
      const myPos = order.indexOf(uid);
      ctx.units.forEach((x) => {
        if (x.id === uid) return;
        const later = order.indexOf(x.id) > myPos;
        x.data.lessons.forEach((o) => {
          if (later) lessonVocab(o, x.v).forEach((it) => { if (!it.lemma || accepted.has(it.lemma) || hintSet.has(it.lemma) || it.chunk) return; it.forms.forEach((f) => { if (!accepted.has(f) && !hintSet.has(f) && !lists.fwSet.has(f)) (x.v === 2 ? laterV2 : laterV1).add(f); }); });
          if (x.v === 2) (o.names || []).forEach((n) => tokens(n.en || "").forEach((t) => { if (!accepted.has(t) && !hintSet.has(t)) otherNames.add(t); }));
        });
      });
      turns.forEach((t, i) => {
        const tag = `D3: turno #${i + 1}`;
        if (t.who === "you") {
          if (!Array.isArray(t.options) || t.options.length !== 3 || new Set(t.options.map(norm)).size !== 3) P(`${tag} precisa de 3 opções únicas`);
          if (t.options && !t.options.includes(t.answer)) P(`${tag} resposta fora das opções`);
          if (!t.pt) P(`${tag} sem pt da resposta`);
          if (!t.intent) W(`${tag} sem intent (intenção curta em português mostrada no lugar da tradução, CS-03)`);
          if (t.pt) { const tv = TU_VOS.exec(t.pt); if (tv) P(`C8: ${tag} pt em tu/vós ("${tv[1]}")`); }
          if (t.intent) { const tv = TU_VOS.exec(t.intent); if (tv) P(`C8: ${tag} intent em tu/vós`); }
          (t.options || []).forEach((o) => {
            const a = ARCHAIC.exec(o); if (a) P(`${tag}: opção com arcaísmo "${a[1]}": "${o}"`);
            const ow = tokens(o);
            const v2hit = ow.filter((w) => laterV2.has(w)), v1hit = ow.filter((w) => laterV1.has(w) && !laterV2.has(w));
            if (v2hit.length) P(`${tag}: opção "${o}" usa vocabulário de unidade posterior ainda não ensinado (${uniq(v2hit).join(", ")}, CP-08)`);
            else if (v1hit.length) W(`${tag}: opção "${o}" usa palavra que hoje é vocabulário de unidade posterior (${uniq(v1hit).join(", ")}, conteúdo v1)`);
            const nh = ow.filter((w) => otherNames.has(w) && /^[A-Z]/.test(o.split(/\s+/).find((x) => norm(x) === w) || ""));
            if (nh.length) P(`${tag}: opção "${o}" cita nome de outra unidade (${uniq(nh).join(", ")}, CL-09)`);
          });
          if (Array.isArray(t.options) && t.options.length === 3) {
            const ns = t.options.map(sentences), nw = t.options.map(nWords);
            if (Math.max(...ns) - Math.min(...ns) > 1) P(`${tag}: as opções devem ter o mesmo número de frases (±1): ${ns.join("/")}`);
            if (Math.max(...nw) - Math.min(...nw) > 4) P(`${tag}: as opções devem ter tamanho parecido (±4 palavras): ${nw.join("/")}`);
          }
        } else {
          if (!t.who) P(`${tag} sem who`);
          else if (!knownSpeaker(world, t.who)) P(`${tag}: who "${t.who}" desconhecido`);
          else if (t.who !== cv.with && t.who !== l.narrator && !guests.includes(t.who)) W(`${tag}: who "${t.who}" não está em guests`);
          if (t.who === l.narrator) W(`${tag}: o narrador fala por si (o aluno responde pelo narrador)`);
          if (!t.en || !t.pt) P(`${tag} precisa de en e pt`);
          if (!t.mood) W(`${tag} sem mood`); else if (!MOODS.has(t.mood)) P(`${tag} mood "${t.mood}" fora da lista fechada (${[...MOODS].join(", ")})`);
          if (t.en) { const a = ARCHAIC.exec(t.en); if (a) P(`${tag} com arcaísmo "${a[1]}"`); }
          if (t.pt) { const tv = TU_VOS.exec(t.pt); if (tv) P(`C8: ${tag} pt em tu/vós ("${tv[1]}")`); }
        }
      });
      if (turns.length && turns[0].who === "you") P("D3: o primeiro turno é do interlocutor, não do aluno");
      const chunks = vocabRaw.filter((v) => v.pos === "chunk").map((v) => norm(v.en));
      if (chunks.length && !you.some((t) => t.answer && chunks.some((c) => norm(t.answer).includes(c)))) W("D3: nenhuma resposta correta usa um chunk da lição (regra 4.5)");
    }
    // ---- Fato
    if (l.fact) {
      if (!l.fact.pt) P("D4: fact sem pt");
      if (!l.fact.ref) P("D4: fact sem ref");
      if (l.fact.pt) { const tv = TU_VOS.exec(l.fact.pt); if (tv) P(`C8: fact.pt em tu/vós ("${tv[1]}")`); }
    }
    // Título
    if (l.title) { const tv = TU_VOS.exec(l.title); if (tv) P(`C8: title em tu/vós`); }
    void li;
  });
}

// ------------------------------------------------------------------------------------------------
// Bloco E: cruzamentos de curso (--all)
// ------------------------------------------------------------------------------------------------
function validateCross(ctx, probs, warns) {
  const all = allLessons(ctx.units);
  const v2 = all.filter((x) => x.v === 2);
  // E1: cada palavra nova volta em >= 3 lições posteriores (aviso)
  v2.forEach((x, i) => {
    const later = all.slice(i + 1).map((y) => lessonEnglish(y.lesson, y.v));
    const weak = [];
    lessonVocab(x.lesson, 2).forEach((it) => {
      if (it.recycle || !it.lemma) return;
      const n = later.filter((t) => countMatches(it.regex, t) > 0).length;
      if (n < 3) weak.push(`${it.en} (${n})`);
    });
    if (weak.length) warns.push(`${x.lesson.id}: E1: palavras que voltam em menos de 3 lições posteriores: ${weak.join(", ")}`);
  });
  // E2: lista mínima de alta frequência
  if (v2.length) {
    const taught = new Set(ctx.lists.fwSet);
    v2.forEach((x) => lessonVocab(x.lesson, 2).forEach((it) => { taught.add(it.lemma); it.forms.forEach((f) => taught.add(f)); }));
    const missing = MINIMUM.filter((w) => !taught.has(w) && !(w.includes(" ") && w.split(" ").every((p) => taught.has(p))));
    if (missing.length) warns.push(`curso: E2: ${missing.length} palavra(s) da lista mínima (seção 4.1) ainda sem lição v2: ${missing.join(", ")}`);
  }
  // E3: frase repetida entre lições
  const seen = new Map();
  all.forEach((x) => {
    const list = x.v === 2 ? (x.lesson.beats || []).map((b) => b.en) : (x.lesson.sentences || []).map((s) => s.en);
    list.filter(Boolean).forEach((en) => { const k = norm(en); if (seen.has(k) && seen.get(k) !== x.lesson.id) warns.push(`${x.lesson.id}: E3: frase repetida "${en}" (também em ${seen.get(k)})`); else seen.set(k, x.lesson.id); });
  });
}

// ------------------------------------------------------------------------------------------------
// Cenas e histórias (seção 7.3). Cenas sem o formato v2 (sem hero/mood) recebem só avisos, porque a reescrita
// fica para a fase do motor; cenas v2 (campo hero ou v: 2) bloqueiam.
// ------------------------------------------------------------------------------------------------
function validateScenes(ctx, probs, warns) {
  const { world, lists, course } = ctx;
  const all = allLessons(ctx.units);
  const order = course ? course.order : [];
  const vocabSeen = new Map();
  all.forEach((x) => lessonVocab(x.lesson, x.v).forEach((it) => { if (it.lemma && !vocabSeen.has(it.lemma)) vocabSeen.set(it.lemma, x.lesson.id); }));
  world.SCENES.forEach((sc) => {
    const isV2 = sc.v === 2 || !!sc.hero;
    const P = (m) => (isV2 ? probs : warns).push(`${sc.id}: ${m}`), W = (m) => warns.push(`${sc.id}: ${m}`);
    const hero = sc.hero || sc.char;
    const lines = sc.lines || [];
    const heroLines = lines.filter((x) => x.who === hero);
    if (lines.length < 10 || lines.length > 12) P(`7.3.1: ${lines.length} falas (esperadas 10 a 12)`);
    if (heroLines.length < 5 || heroLines.length > 6) P(`7.3.1: herói com ${heroLines.length} falas (esperadas 5 ou 6)`);
    lines.forEach((x, i) => {
      const n = nWords(x.en || "");
      if (x.who === hero && n > 10) P(`7.3.1: fala ${i + 1} do herói com ${n} palavras (máximo 10)`);
      if (x.who !== hero && n > 12) P(`7.3.1: fala ${i + 1} com ${n} palavras (máximo 12)`);
      const a = ARCHAIC.exec(x.en || ""); if (a) P(`7.3.5: fala ${i + 1} com arcaísmo "${a[1]}"`);
      const tv = TU_VOS.exec(x.pt || ""); if (tv) P(`7.3.5: fala ${i + 1} pt em tu/vós ("${tv[1]}")`);
      Object.keys(BRITISH).forEach((k) => { if (new RegExp("\\b" + esc(k) + "\\b", "i").test(x.en || "")) P(`7.3.5: fala ${i + 1} grafia britânica "${k}"`); });
      if (DASH.test((x.en || "") + (x.pt || ""))) P(`7.3.5: travessão na fala ${i + 1}`);
      if (isV2) {
        if (!x.mood) P(`7.3.4: fala ${i + 1} sem mood`); else if (!MOODS.has(x.mood)) P(`7.3.4: fala ${i + 1} mood "${x.mood}" fora da lista`);
        if (x.fact === undefined) P(`7.3.4: fala ${i + 1} sem fact`);
        if (x.who === hero && (!Array.isArray(x.alt) || x.alt.length !== 2)) P(`7.3.4: fala ${i + 1} do herói precisa de alt com exatamente 2 itens`);
      }
      if (x.who && !knownSpeaker(world, x.who)) P(`7.3.6: falante "${x.who}" sem retrato (CHARACTERS/SCENE_EXTRAS)`);
    });
    // 7.3.2: expressões do vocab nas falas
    const vocab = sc.vocab || [];
    if (vocab.length !== 5) P(`7.3.2: ${vocab.length} expressões no vocab (esperadas 5)`);
    let inHero = 0;
    vocab.forEach((v) => {
      if (/[()\/]/.test(v.en || "")) P(`7.3.2: expressão "${v.en}" com parênteses ou barra`);
      const re = phraseRegex(v.en || "");
      const hit = lines.filter((x) => countMatches(re, x.en || "") > 0);
      if (!hit.length) P(`7.3.2: expressão "${v.en}" não aparece em nenhuma fala`);
      if (hit.some((x) => x.who === hero)) inHero++;
      if (EMOJI_13.test(v.icon || "")) P(`7.3.5: emoji 13+ em "${v.en}" (${v.icon})`);
      const lm = lemmaOf(v.en || "");
      if (vocabSeen.has(lm) && !v.recycle) W(`7.3.7: expressão "${v.en}" já é vocabulário em ${vocabSeen.get(lm)}; marque recycle: true`);
    });
    if (vocab.length && inHero < 3) P(`7.3.2: só ${inHero} expressões em falas do herói (mínimo 3)`);
    // 7.3.3: tokens fora do vocabulário acumulado
    const accepted = new Set(lists.fwSet);
    const upTo = order.indexOf(sc.unit);
    all.forEach((x) => { if (order.indexOf(x.unitId) <= upTo || upTo < 0) lessonVocab(x.lesson, x.v).forEach((it) => it.forms.forEach((f) => accepted.add(f))); });
    vocab.forEach((v) => tokens(v.en || "").forEach((t) => formsOf(t).forEach((f) => accepted.add(f))));
    let total = 0, out = [];
    lines.forEach((x) => {
      const raw = String(x.en || "").split(/\s+/);
      raw.forEach((rw) => { const t = tokens(rw)[0]; if (!t) return; total++; if (/^[A-Z]/.test(rw.replace(/^["“']/, "")) && raw.indexOf(rw) > 0) return; if (!accepted.has(t) && !(t.endsWith("'s") && accepted.has(t.slice(0, -2)))) out.push(t); });
    });
    if (total && out.length / total > 0.1) P(`7.3.3: ${out.length} de ${total} tokens (${Math.round((100 * out.length) / total)}%) fora do vocabulário acumulado: ${uniq(out).slice(0, 12).join(", ")}${out.length > 12 ? "..." : ""}`);
    // 7.3.6: vozes únicas na cena
    const speakers = uniq([...(sc.cast || []), ...lines.map((x) => x.who)].filter(Boolean));
    const voiceOf = (k) => (world.SCENE_EXTRAS[k] ? world.SCENE_EXTRAS[k].voice : world.voiceByChar[k]) || null;
    const byVoice = {};
    speakers.forEach((k) => { const v = voiceOf(k); if (!v) return; (byVoice[v] = byVoice[v] || []).push(k); });
    Object.entries(byVoice).forEach(([v, ks]) => { if (ks.length > 1) P(`7.3.6: ${ks.join(" e ")} partilham a voz "${v}" na mesma cena (CS-18)`); });
    // 7.3.8: ancoragem e papel do aluno
    if (hero === "jesus" || hero === "voice") P("7.3.8: o aluno nunca fala por Jesus nem pela voz do Senhor (CS-21)");
    const header = course && course.units ? course.units[sc.unit] : null;
    if (header && hero && !(header.cast || []).includes(hero)) P(`7.3.8: herói "${hero}" não está no cast da unidade ${sc.unit}`);
    // 7.3.10: truth
    if (isV2) {
      const tr = sc.truth || {};
      if (!Array.isArray(tr.bible) || tr.bible.length < 2 || tr.bible.some((b) => !/\d/.test(b))) P("7.3.10: truth.bible precisa de 2 marcadores com referência");
      if (lines.some((x) => x.fact === false) && !tr.imagined) P("7.3.10: truth.imagined obrigatório quando alguma fala tem fact: false");
    }
    walkStrings(sc, (s, p) => { if (DASH.test(s)) P("travessão em " + p); });
  });
}
function validateStories(ctx, probs, warns) {
  const { world } = ctx;
  world.STORIES.forEach((st) => {
    const isV2 = st.v === 2 || (st.beats || []).some((b) => b.type);
    const P = (m) => (isV2 ? probs : warns).push(`${st.id}: ${m}`);
    const beats = st.beats || [];
    const said = beats.filter((b) => b.en);
    const words = said.reduce((n, b) => n + nWords(b.en), 0);
    if (beats.length < 12 || beats.length > 18) P(`7.3.9: ${beats.length} beats (esperados 12 a 18)`);
    if (words < 120 || words > 200) P(`7.3.9: ${words} palavras (esperadas 120 a 200)`);
    const inter = beats.filter((b) => b.type || b.q || b.gap);
    const types = new Set(inter.map((b) => b.type || (b.q ? "meaning" : "fill")));
    if (inter.length < 5 || types.size < 3) P(`7.3.9: ${inter.length} interações de ${types.size} tipo(s) (mínimo 5 de 3 tipos)`);
    beats.forEach((b, i) => {
      if (b.en) {
        const a = ARCHAIC.exec(b.en); if (a) P(`7.3.5: beat ${i + 1} com arcaísmo "${a[1]}"`);
        if (/\b(said|asked)\s*:/i.test(b.en)) P(`7.3.9: beat ${i + 1} discurso direto com dois-pontos; use vírgula e aspas`);
      }
      const tv = TU_VOS.exec(b.pt || ""); if (tv) P(`7.3.5: beat ${i + 1} pt em tu/vós ("${tv[1]}")`);
      if (b.who && !knownSpeaker(world, b.who)) P(`beat ${i + 1}: falante "${b.who}" sem retrato`);
      const ans = b.answer;
      if (ans && (b.type !== "what-next") && !/^[a-z]+$/.test(String(ans)) && !["who-said", "meaning"].includes(b.type)) {
        const prev = beats.slice(0, i).filter((x) => x.en).map((x) => norm(x.en)).join(" \n ");
        if (!prev.includes(norm(ans))) P(`7.3.9: resposta "${ans}" do beat ${i + 1} não aparece verbatim em beat anterior (CS-12)`);
      }
    });
    walkStrings(st, (s, p) => { if (DASH.test(s)) P("travessão em " + p); });
  });
}

// ------------------------------------------------------------------------------------------------
// icons.json (--write-icons): "icons" = pares confirmados pelo conteúdo v2 (bloqueiam); "legacy" = usos do v1 (avisam)
// ------------------------------------------------------------------------------------------------
function writeIcons(ctx, units, probs) {
  const file = TOOLS + "icons.json";
  const cur = optJson(file, { icons: {}, legacy: {} });
  cur.icons = cur.icons || {}; cur.legacy = cur.legacy || {};
  let added = 0, legacy = 0;
  units.forEach((u) => {
    const broken = new Set(probs.filter((p) => p.startsWith(u.id)).map((p) => p.split(":")[0]));
    u.data.lessons.forEach((l) => (l.vocab || []).forEach((v) => {
      if (!v.icon || !v.en) return;
      if (u.v === 2) {
        if (broken.has(l.id)) return; // só lições sem problemas
        if (!cur.icons[v.icon]) { cur.icons[v.icon] = v.en; added++; }
      } else {
        const list = cur.legacy[v.icon] || [];
        if (!list.includes(v.en)) { list.push(v.en); cur.legacy[v.icon] = list; legacy++; }
      }
    }));
  });
  const out = {
    _comment: cur._comment || "Ícone -> conceito (regra B9 da CONTENT_SPEC_V2). icons: pares confirmados por lições v2 validadas e pela resolução da seção 4.8 (um ícone = um conceito; o validador BLOQUEIA outro en com o mesmo ícone). legacy: usos do conteúdo v1 (icon -> lista de en), só para AVISO durante a migração. Atualize com: node tools/content/validate.js --all --write-icons",
    icons: Object.fromEntries(Object.entries(cur.icons).sort((a, b) => a[1].localeCompare(b[1]))),
    legacy: Object.fromEntries(Object.entries(cur.legacy).sort((a, b) => a[0].localeCompare(b[0]))),
  };
  fs.writeFileSync(file, JSON.stringify(out, null, 2) + "\n");
  console.log(`icons.json: ${added} par(es) novo(s) em icons, ${legacy} em legacy (${Object.keys(out.icons).length} ícones confirmados)`);
}

// ------------------------------------------------------------------------------------------------
// Orquestração
// ------------------------------------------------------------------------------------------------
function buildCtx(opts) {
  const lists = loadLists(), world = loadWorld(), course = loadCourse();
  const units = loadUnits(course);
  return { lists, world, course, units, opts };
}
// Valida um arquivo (v1 ou v2) ou o curso inteiro. Devolve { problems, warnings, files }.
function validateCourse(opts = {}) {
  const ctx = buildCtx(opts);
  const probs = [], warns = [];
  let targets = [];
  if (opts.all) {
    validateCourseFile(ctx.course, ctx.world, probs, warns);
    if (ctx.course) ctx.course.order.forEach((id) => { if (!ctx.units.find((u) => u.id === id)) probs.push(`content/${id}.json: arquivo da unidade não encontrado`); });
    targets = ctx.units;
  } else if (opts.file) {
    const f = path.resolve(opts.file);
    const j = readJson(f);
    const unit = { id: j.id, file: path.relative(ROOT, f), v: j.v === 2 ? 2 : 1, data: j };
    // Rascunho fora de content/ (lição isolada com --one, por exemplo): as lições do arquivo substituem as homônimas da
    // unidade carregada de content/; as demais lições da unidade ficam no contexto (vocabulário anterior, regra C5-b),
    // cada uma com a sua versão.
    const loaded = ctx.units.find((u) => u.id === unit.id);
    if (loaded && path.resolve(ROOT, loaded.file) !== f) {
      const mine = new Set((j.lessons || []).map((l) => l.id));
      const merged = { ...loaded, data: { ...loaded.data, lessons: [] } };
      const rest = (loaded.data.lessons || []).filter((l) => !mine.has(l.id)).map((l) => { const c = { ...l }; Object.defineProperty(c, "__v", { value: loaded.v }); return c; });
      merged.data.lessons = [...rest, ...(j.lessons || [])].sort((a, b) => String(a.id).localeCompare(String(b.id)));
      merged.v = unit.v; merged.file = unit.file;
      // a unidade validada é a do arquivo; o contexto cruzado vê a união das lições
      ctx.units = ctx.units.map((u) => (u === loaded ? merged : u));
      unit.context = merged;
    } else if (!loaded) {
      const pos = ctx.course ? ctx.course.order.indexOf(unit.id) : -1;
      const at = ctx.units.findIndex((u) => (ctx.course ? ctx.course.order.indexOf(u.id) : 0) > pos);
      if (at < 0) ctx.units.push(unit); else ctx.units.splice(at, 0, unit);
    } else { ctx.units = ctx.units.map((u) => (u === loaded ? unit : u)); }
    targets = [unit];
  }
  targets.forEach((u) => (u.v === 2 ? validateV2(u, ctx, probs, warns) : validateV1(u, ctx, probs, warns)));
  if (opts.all) validateCross(ctx, probs, warns);
  if (opts.scenes) validateScenes(ctx, probs, warns);
  if (opts.stories) validateStories(ctx, probs, warns);
  if (opts.writeIcons) writeIcons(ctx, targets, probs);
  return { problems: probs, warnings: warns, files: targets.map((u) => u.file) };
}

function main() {
  const args = process.argv.slice(2);
  const opts = { all: args.includes("--all"), one: args.includes("--one"), scenes: args.includes("--scenes"), stories: args.includes("--stories"), writeIcons: args.includes("--write-icons"), quiet: args.includes("--quiet") };
  const files = args.filter((a) => !a.startsWith("--"));
  if (!opts.all && !files.length) {
    console.error("Uso: node tools/content/validate.js content/uX.json [--one] | --all  [--scenes] [--stories] [--write-icons] [--quiet]");
    process.exit(2);
  }
  let problems = 0;
  const runs = opts.all ? [{ ...opts }] : files.map((f) => ({ ...opts, file: f, all: false }));
  runs.forEach((o, i) => {
    // cenas/histórias/ícones só uma vez
    if (i > 0) { o.scenes = false; o.stories = false; o.writeIcons = false; }
    const r = validateCourse(o);
    if (!o.quiet) r.warnings.forEach((w) => console.log("aviso " + w));
    if (r.problems.length) { console.log(r.problems.join("\n")); problems += r.problems.length; }
    else console.log("OK " + (o.all ? `${r.files.length} unidades + course.json` : o.file) + (o.scenes ? " + cenas" : "") + (o.stories ? " + histórias" : ""));
  });
  if (problems) { console.log(`${problems} problema(s)`); process.exitCode = 1; }
}

module.exports = { validateCourse, norm, tokens, lemmaOf, formsOf, phraseRegex, loadLists, loadWorld, loadCourse, loadUnits };
if (require.main === module) main();
