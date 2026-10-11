// Gera os clipes de áudio do BíbliaLearn com o ElevenLabs (v2: timestamps, variante lenta nativa,
// dicionário de pronúncia, casting em tools/voices.json, lint do elenco, QA por clipe, audição)
// e atualiza audio/manifest.json.
// Uso: ELEVENLABS_API_KEY=... node tools/gen-audio.mjs [--dry] [--lint] [--limit=N] [--only=names|audition] [--audition] [--mock]
//   --dry      só roda o lint, lista as vozes e estima créditos (sem chave, sem rede)
//   --lint     só o lint do elenco (colisões de voz por cena, história, unidade e lição v2); sai com 1 se houver
//   --only=names     só o nome de cada personagem na própria voz (amostra barata)
//   --only=audition  (ou --audition) gera a audição do elenco em audio/audition/ (fora do manifesto e dos sprites)
//   --mock     gera MP3 e alinhamento sintéticos com ffmpeg, sem API (exige AUDIO_DIR fora do repositório)
//   AUDIO_DIR=/pasta  destino dos clipes (padrão: biblelingo/audio)
//   ELEVENLABS_MODEL  modelo (padrão: eleven_multilingual_v2)
// Idempotente: clipe já presente com o nome esperado (hash de texto, voz, modelo, formato, settings, seed e versão
// do dicionário quando o texto tem um nome) não é gerado de novo. Saída por clipe: audio/<hash>.mp3 (mp3_44100_128)
// e audio/align/<hash>.json (timestamps por caractere, usados por tools/cut-words.mjs para recortar as palavras).
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import crypto from "node:crypto";
import { execFile, execFileSync } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const run = promisify(execFile);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const AUDIO_DIR = process.env.AUDIO_DIR ? path.resolve(process.env.AUDIO_DIR) : path.join(ROOT, "audio");
const ALIGN_DIR = path.join(AUDIO_DIR, "align");
const AUDITION_DIR = path.join(AUDIO_DIR, "audition"); // fora do manifesto, dos sprites e da limpeza de órfãos
const MANIFEST = path.join(AUDIO_DIR, "manifest.json");
const QA_REPORT = path.join(AUDIO_DIR, "qa-report.json");
const API = "https://api.elevenlabs.io/v1";
const MODEL = process.env.ELEVENLABS_MODEL || "eleven_multilingual_v2";
// mp3_44100_128: melhor custo/qualidade para voz sem exigir plano acima do Pro; PCM/WAV ficaria enorme no git
const OUTPUT_FORMAT = "mp3_44100_128";
const SLOW_SPEED = 0.8; // variante "devagar" nativa (o tom não muda, ao contrário do playbackRate 0,75 do app)
const CONCURRENCY = 4; // o plano Pro permite 10 pedidos simultâneos; 4 deixa folga para o 429
const KEY = process.env.ELEVENLABS_API_KEY;
const DRY = process.argv.includes("--dry");
const LINT_ONLY = process.argv.includes("--lint");
const MOCK = process.argv.includes("--mock");
const LIMIT = Number((process.argv.find((a) => a.startsWith("--limit=")) || "").split("=")[1] || 0);
const ONLY = (process.argv.find((a) => a.startsWith("--only=")) || "").split("=")[1] || "";
const AUDITION = ONLY === "audition" || process.argv.includes("--audition");
// Valor desconhecido em --only (um erro de digitação no workflow) não pode virar uma geração completa paga
if (ONLY && !["names", "audition"].includes(ONLY)) { console.error(`--only=${ONLY} desconhecido (valores: names, audition)`); process.exit(1); }

if (MOCK && AUDIO_DIR === path.join(ROOT, "audio")) {
  console.error("Modo --mock exige AUDIO_DIR apontando para uma pasta fora do repositório (a limpeza de órfãos apagaria os clipes reais).");
  process.exit(1);
}

// Carrega os dados do app num sandbox
const ctx = { window: {}, navigator: {}, document: {}, console };
vm.createContext(ctx);
for (const f of ["characters.js", "data.js", "stories.js", "scenes.js", "scenes2.js"]) {
  const src = fs.readFileSync(path.join(ROOT, f), "utf8").replace(/^const (CHARACTERS|COURSE|STORIES|UNIT_CAST|CHARACTER_UNIT|CHARACTER_ORDER|SCENES|SCENE_EXTRAS) =/gm, "var $1 =");
  vm.runInContext(src, ctx);
}
const { CHARACTERS, COURSE, STORIES, UNIT_CAST, SCENES, SCENE_EXTRAS } = ctx;
const readJson = (f, fallback) => { try { return JSON.parse(fs.readFileSync(f, "utf8")); } catch (e) { return fallback; } };

// ---------- Casting: tools/voices.json ----------
// voices: apelido -> { id, gender, accent, age, notes }; cast: personagem -> apelido; exclusive: papéis de voz exclusiva;
// divine: papéis com o perfil "divine"; pools: grupos de vozes (usados na troca de voz indisponível).
// Extras de scenes.js/scenes2.js sem entrada em cast usam SCENE_EXTRAS[*].voice.
const VOICES_FILE = path.join(ROOT, "tools", "voices.json");
const V = readJson(VOICES_FILE, null);
if (!V || !V.voices || !V.cast) { console.error(`tools/voices.json ausente ou inválido (${VOICES_FILE})`); process.exit(1); }
const VOICES = V.voices;
const EXCLUSIVE = new Set(V.exclusive || []);
const DIVINE = new Set(V.divine || ["voice", "anjo"]);
const ACCENT = V.accent || "american";
const ALLOW_ACCENT = new Set(V.allowAccent || []);

// Dicionário de pronúncia (regras "alias" = respelling em inglês, sem espaços; "phoneme" não vale no multilingual_v2).
// Seção 7 da spec mesclada com a lista anterior: só nomes presentes no conteúdo atual ou previstos no CONTENT SPEC V2.
// Só é pedido nos textos que contêm um destes nomes; PRON_VER entra no hash desses textos (os demais não mudam).
const PRON_VER = 1;
const PRONUNCIATIONS = {
  Joseph: "JOE-zef", Noah: "NO-uh", Moses: "MO-ziz", Jesus: "JEE-zus", Isaiah: "eye-ZAY-uh", Immanuel: "Im-MAN-you-el",
  Samuel: "SAM-you-el", Goliath: "guh-LY-uth", Saul: "SAWL", Jesse: "JESS-ee", Potiphar: "POT-ih-far", Egyptians: "ee-JIP-shunz",
  Darius: "duh-RY-us", Zebedee: "ZEB-uh-dee", Ararat: "AIR-uh-rat", Gath: "GATH", Ahaz: "AY-haz", Ishmaelites: "ISH-mee-uh-lites",
  Belteshazzar: "bel-tuh-SHAZZ-er", Nebuchadnezzar: "neb-yuh-kud-NEZZ-er", Shadrach: "SHAD-rak", Meshach: "MEE-shak",
  Abednego: "uh-BED-nih-go", Mene: "MEE-nee", Tekel: "TEK-el", Parsin: "par-SEEN", Aaron: "AIR-un", Miriam: "MEER-ee-um",
  Uzziah: "uh-ZY-uh", Seraphim: "SAIR-uh-fim", Medes: "MEEDZ", Zacchaeus: "za-KEE-us", Bartimaeus: "bar-tih-MAY-us",
  Mephibosheth: "muh-FIB-oh-sheth", Goshen: "GO-shen", Chaldeans: "kal-DEE-unz", Elijah: "ee-LY-juh", Elisha: "ee-LY-shuh",
  Jeremiah: "jair-uh-MY-uh", Galilean: "gal-ih-LEE-un", Galilee: "GAL-ih-lee", Nazareth: "NAZ-uh-reth", Capernaum: "kuh-PER-nee-um",
  Gethsemane: "geth-SEM-uh-nee", Magdalene: "MAG-duh-lun", Pharaoh: "FAIR-oh", Philistine: "FIL-ih-steen", Philistines: "FIL-ih-steenz",
  Judah: "JOO-duh", Sinai: "SY-ny", Canaan: "KAY-nun", Jericho: "JAIR-ih-ko", Hezekiah: "hez-uh-KY-uh", Nehemiah: "nee-uh-MY-uh",
  Ezekiel: "ee-ZEE-kee-ul", Nineveh: "NIN-uh-vuh", Tarshish: "TAR-shish", Joppa: "JOP-uh", Naomi: "nay-OH-mee", Boaz: "BO-az",
  Rebekah: "rih-BEK-uh", Mordecai: "MOR-duh-ky", Haman: "HAY-mun", Deborah: "DEB-er-uh", Barak: "BAIR-ak", Gideon: "GID-ee-un",
  Samson: "SAM-sun", Caleb: "KAY-lub", Joshua: "JOSH-oo-uh", Solomon: "SOL-uh-mun", Abraham: "AY-bruh-ham", Isaac: "EYE-zuk",
  Barnabas: "BAR-nuh-bus", Nathanael: "nuh-THAN-yul", Philippi: "fih-LIP-eye", Zarephath: "ZAIR-uh-fath", Samaria: "suh-MAIR-ee-uh",
  Nabal: "NAY-bul", Naamah: "NAY-uh-muh", Zabad: "ZAY-bad", Rhoda: "RO-duh", Aspenaz: "ASS-puh-naz", Belshazzar: "bel-SHAZZ-er",
  Jonah: "JO-nuh", Jonas: "JO-nuh", Yahweh: "the-LORD",
};
const PRON_RULES = Object.entries(PRONUNCIATIONS).map(([w, alias]) => ({ type: "alias", string_to_replace: w, alias, case_sensitive: false, word_boundaries: true }));
const PRON_RE = new RegExp("\\b(" + Object.keys(PRONUNCIATIONS).join("|") + ")\\b", "i");
const PRON_CACHE = path.join(ROOT, "tools", ".pron-dict.json");

const audioKey = (t) => String(t).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();
const wordCount = (t) => String(t).trim().split(/\s+/).filter(Boolean).length;
const uniq = (xs) => [...new Set(xs)];
// crc32 (sem zlib.crc32, que só existe a partir do Node 22): seed fixa por personagem
const CRC_TABLE = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc32 = (s) => { let c = 0xffffffff; for (const b of Buffer.from(String(s), "utf8")) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const seedFor = (char) => ((V.seeds && V.seeds[char]) ?? crc32(char)) % 4294967295;

// ---------- Coleta de textos: { key, text, char, kind, prev, next } ----------
// kind (perfil de settings da seção 3.2 da spec): "word" (vocabulário, peça do banco de palavras, opção de 1 palavra),
// "name" (nome do personagem), "sentence" (frase de lição), "line" (fala de diálogo ou cena), "story" (beat de história,
// leitura), "verse" (versículo), "question" (pergunta de quiz/leitura/história e opções com 2+ palavras)
const jobs = new Map(); // key|char -> job
const add = (text, char, kind = "sentence", ctx = {}) => {
  if (!text) return;
  const k = audioKey(text);
  if (!k) return;
  const id = `${k}|${char}`;
  if (!jobs.has(id)) jobs.set(id, { key: k, text, char, kind, prev: ctx.prev || "", next: ctx.next || "" });
};
const optKind = (t) => (wordCount(t) >= 2 ? "question" : "word");
// O personagem "dono" de cada texto: mesmo cálculo do app (currentChar),
// para que quem aparece na cena seja sempre quem gravou o áudio
const castHash = (key) => { let h = 0; for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0; return h; };
const castCharFor = (unitId, text) => {
  const cast = UNIT_CAST[unitId] || ["narrator"];
  const key = audioKey(text);
  return cast[castHash(key) % cast.length] || cast[0];
};
COURSE.forEach((u) => {
  const own = (t) => castCharFor(u.id, t);
  u.lessons.forEach((l) => {
    (l.vocab || []).forEach((v) => add(v.en, own(v.en), "word"));
    (l.sentences || []).forEach((s) => add(s.en, own(s.en), "sentence"));
    if (l.verse) {
      const c = own(l.verse.text);
      add(l.verse.text, c, "verse");
      add(l.verse.text.replace(new RegExp("\\b" + l.verse.blank.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b"), "blank"), c, "verse");
      l.verse.options.forEach((o) => add(o, c, optKind(o)));
    }
    if (l.dialogue) {
      // A fala e as respostas são um diálogo: o contexto em inglês ajuda a prosódia
      const c = own(l.dialogue.line);
      add(l.dialogue.line, c, "line", { next: l.dialogue.answer });
      l.dialogue.options.forEach((o) => add(o, c, "line", { prev: l.dialogue.line }));
    }
    if (l.quiz) { const c = own(l.quiz.q); add(l.quiz.q, c, "question"); l.quiz.options.forEach((o) => add(o, c, optKind(o), { prev: l.quiz.q })); }
    if (l.reading) {
      const c = own(l.reading.q);
      add(l.reading.text, c, "story");
      add(l.reading.q, c, "question", { prev: l.reading.text });
      l.reading.options.forEach((o) => add(o, c, optKind(o), { prev: l.reading.q }));
    }
  });
});
STORIES.forEach((s) => {
  const spoken = s.beats.filter((b) => b.en);
  spoken.forEach((b, i) => add(b.en, b.who || "narrator", "story", { prev: spoken[i - 1]?.en, next: spoken[i + 1]?.en }));
  s.beats.forEach((b) => {
    if (b.q) { add(b.q, "narrator", "question"); b.options.forEach((o) => add(o, "narrator", optKind(o), { prev: b.q })); }
    if (b.gap) b.options.forEach((o) => add(o, "narrator", optKind(o)));
  });
});
const displayName = (c) => (CHARACTERS[c]?.name || SCENE_EXTRAS[c]?.name || (c === "narrator" ? "Narrador" : c)).split(" (")[0];
Object.keys(CHARACTERS).forEach((k) => add(displayName(k), k, "name"));
// Cenas do dia a dia: cada fala na voz de quem fala (galeria ou extras), com a fala anterior e a seguinte
// como contexto; vocabulário na voz do herói
SCENES.forEach((s) => {
  s.lines.forEach((l, i) => add(l.en, l.who, "line", { prev: s.lines[i - 1]?.en, next: s.lines[i + 1]?.en }));
  s.vocab.forEach((v) => add(v.en, s.char, "word"));
});
// Palavras isoladas de todas as frases (peças do banco de palavras) e "blank"
const words = new Set();
COURSE.forEach((u) => u.lessons.forEach((l) => (l.sentences || []).forEach((s) => s.en.split(" ").forEach((w) => words.add(w.replace(/[.,;:!?'"]/g, ""))))));
SCENES.forEach((s) => s.lines.filter((l) => l.who === s.char).forEach((l) => l.en.split(" ").forEach((w) => words.add(w.replace(/[.,;:!?"]/g, "")))));
// Palavra que já tem recorte de frase (tools/cut-words.mjs) não precisa de síntese isolada, que sai com artefatos
const wordsJson = path.join(AUDIO_DIR, "words.json");
const cuts = fs.existsSync(wordsJson) ? JSON.parse(fs.readFileSync(wordsJson, "utf8")) : {};
words.forEach((w) => { if (!cuts[audioKey(w)]) add(w, "narrator", "word"); });

const allJobs = [...jobs.values()];
let list = allJobs;
// --only=names: só o nome de cada personagem na própria voz (amostra barata para ouvir todas)
if (ONLY === "names") {
  const names = new Set(Object.keys(CHARACTERS).map((k) => `${audioKey(displayName(k))}|${k}`));
  list = list.filter((j) => names.has(`${j.key}|${j.char}`));
}
if (LIMIT) list = list.slice(0, LIMIT);

// ---------- voice_settings por tipo de texto (seção 3.2 da spec) ----------
// Palavra/nome: muito estáveis (uma palavra solta não precisa de emoção, e sem estabilidade sai com artefatos).
// Frase: meio-termo. Fala de cena/diálogo: mais estilo, para soar como conversa. História e leitura: narrativa, um pouco
// mais lenta. Versículo: solene. Pergunta e opção: narrador neutro, sem variante lenta. "divine" (voz do Senhor e anjo):
// estável, pausado. A variante lenta usa speed 0,8 em todos os perfis que a têm.
const PROFILES = {
  word: { stability: 0.75, style: 0.0, speed: 1.0, slow: false },
  name: { stability: 0.75, style: 0.0, speed: 1.0, slow: false },
  sentence: { stability: 0.6, style: 0.1, speed: 1.0, slow: true },
  line: { stability: 0.5, style: 0.2, speed: 1.0, slow: true },
  story: { stability: 0.55, style: 0.15, speed: 0.95, slow: true },
  verse: { stability: 0.7, style: 0.05, speed: 0.92, slow: true },
  question: { stability: 0.6, style: 0.05, speed: 1.0, slow: false },
  divine: { stability: 0.65, style: 0.1, speed: 0.9, slow: true },
};
const profileFor = (char, kind) => (DIVINE.has(char) && kind !== "word" && kind !== "name" ? "divine" : PROFILES[kind] ? kind : "sentence");
export function settingsFor(char, kind, slow) {
  const p = PROFILES[profileFor(char, kind)];
  return { stability: p.stability, similarity_boost: 0.85, style: p.style, use_speaker_boost: true, speed: slow ? SLOW_SPEED : p.speed };
}
const settingsSig = (s) => [s.stability, s.similarity_boost, s.style, s.use_speaker_boost ? 1 : 0, s.speed].join(",");
// Variante lenta: perfis com slow e texto com 2+ palavras (frases, falas, histórias, leituras, versículos)
const hasSlow = (j) => PROFILES[profileFor(j.char, j.kind)].slow && wordCount(j.text) >= 2;

const totalChars = list.reduce((n, j) => n + j.text.length, 0);
const slowChars = list.filter(hasSlow).reduce((n, j) => n + j.text.length, 0);
console.log(`Textos: ${list.length} · caracteres: ${totalChars} (+${slowChars} nas variantes lentas) · modelo: ${MODEL} · formato: ${OUTPUT_FORMAT}${MOCK ? " · MOCK" : ""}`);

const manifest = fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, "utf8")) : {};

// ---------- Vozes ----------
if (!DRY && !LINT_ONLY && !MOCK && !KEY) { console.error("Defina ELEVENLABS_API_KEY"); process.exit(1); }
const assigned = {};
Object.keys(SCENE_EXTRAS).forEach((k) => { if (SCENE_EXTRAS[k].voice) assigned[k] = SCENE_EXTRAS[k].voice; });
Object.assign(assigned, V.cast);
const gender = (char) => {
  const g = CHARACTERS[char]?.voice?.gender || SCENE_EXTRAS[char]?.gender;
  return g ? (g === "female" ? "f" : "m") : VOICES[assigned[char]]?.gender || "m";
};
const voiceFor = (char) => {
  const name = assigned[char] && VOICES[assigned[char]] ? assigned[char] : "brian";
  return { name, voice_id: VOICES[name].id };
};

// ---------- cast-lint (seção 2.5 da spec) ----------
// Conjuntos de falantes que se ouvem juntos: cena (char, with, who das falas, extras), história (who dos beats),
// lição v2 (narrator, guests, conversation.with, speaker dos beats, who dos turnos) e unidade (UNIT_CAST de
// characters.js + cast/extras de content/course.json). Dois papéis do mesmo conjunto nunca podem resolver para o
// mesmo voice_id. Lê o estado atual dos arquivos em tempo de execução (o conteúdo muda em paralelo).
function collectSets() {
  const sets = [];
  SCENES.forEach((s) => sets.push({ id: `cena ${s.id}`, kind: "cena", who: uniq([s.char, s.with, ...s.lines.map((l) => l.who), ...(s.extras || [])].filter(Boolean)) }));
  STORIES.forEach((s) => sets.push({ id: `história ${s.id}`, kind: "história", who: uniq(s.beats.filter((b) => b.en).map((b) => b.who || "narrator")) }));
  const lessonSet = (l) => uniq([l.narrator, ...(l.guests || []), l.conversation?.with, ...(l.beats || []).map((b) => b.speaker), ...(l.conversation?.turns || []).map((t) => t.who)].filter((w) => w && w !== "you"));
  const v2Lessons = [];
  COURSE.forEach((u) => u.lessons.forEach((l) => { if (l.narrator || l.guests) v2Lessons.push(l); }));
  const course = readJson(path.join(ROOT, "content", "course.json"), null);
  const unitIds = uniq([...Object.keys(UNIT_CAST || {}), ...Object.keys(course?.units || {})]);
  unitIds.forEach((id) => {
    const cu = course?.units?.[id] || {};
    sets.push({ id: `unidade ${id}`, kind: "unidade", who: uniq([...(UNIT_CAST?.[id] || []), ...(cu.cast || []), ...(cu.extras || [])]) });
    const uj = readJson(path.join(ROOT, "content", `${id}.json`), null);
    if (uj?.v === 2) (uj.lessons || []).forEach((l) => { if (l.narrator || l.guests) v2Lessons.push(l); });
  });
  const seen = new Set();
  v2Lessons.forEach((l) => { if (!seen.has(l.id)) { seen.add(l.id); sets.push({ id: `lição ${l.id}`, kind: "lição v2", who: lessonSet(l) }); } });
  return sets;
}
function castLint(assign) {
  const errors = [], warnings = [];
  const sets = collectSets();
  const roles = uniq([...Object.keys(CHARACTERS), "narrator", ...Object.keys(SCENE_EXTRAS), ...sets.flatMap((s) => s.who)]);
  roles.forEach((r) => { if (!assign[r]) errors.push(`sem voz: ${r}`); else if (!VOICES[assign[r]]) errors.push(`voz desconhecida: ${r} -> ${assign[r]} (não está em tools/voices.json)`); });
  const byVoice = {};
  Object.entries(assign).forEach(([c, v]) => (byVoice[v] = byVoice[v] || []).push(c));
  EXCLUSIVE.forEach((c) => { const v = assign[c]; if (v && byVoice[v].length > 1) errors.push(`voz exclusiva partilhada: ${v} (${c}) também em ${byVoice[v].filter((x) => x !== c).join(", ")}`); });
  sets.forEach((s) => {
    const g = {};
    s.who.forEach((c) => { const v = assign[c]; if (v && VOICES[v]) (g[VOICES[v].id] = g[VOICES[v].id] || []).push(`${c} (${v})`); });
    Object.values(g).forEach((cs) => { if (cs.length > 1) errors.push(`${s.id}: ${cs.join(" e ")} dividem a mesma voz`); });
  });
  Object.entries(assign).forEach(([c, v]) => { const acc = VOICES[v]?.accent; if (acc && acc !== ACCENT && !ALLOW_ACCENT.has(c)) warnings.push(`${c}: voz ${v} com sotaque ${acc} (padrão ${ACCENT})`); });
  return { errors, warnings, sets };
}
const printLint = (lint, label = "Lint do elenco") => {
  const count = (k) => lint.sets.filter((s) => s.kind === k).length;
  console.log(`${label}: ${count("cena")} cenas + ${count("história")} histórias + ${count("unidade")} unidades + ${count("lição v2")} lições v2 = ${lint.sets.length} conjuntos · ${Object.keys(V.cast).length} papéis em voices.json · colisões/erros: ${lint.errors.length} · avisos: ${lint.warnings.length}`);
  lint.errors.forEach((e) => console.log(`  ERRO: ${e}`));
  lint.warnings.forEach((w) => console.log(`  aviso: ${w}`));
};
let lint = castLint(assigned);
printLint(lint);
if (LINT_ONLY) process.exit(lint.errors.length ? 1 : 0);

// Valida cada voz com um clipe mínimo (custa ~1 crédito por voz). Voz indisponível
// nesta conta é trocada por outra livre do mesmo gênero (sem colidir com quem contracena com o papel
// e sem tocar nas vozes exclusivas), nunca pela voz de todo mundo.
// Em --dry e --mock usa só o cache de validação (tools/.voices-ok.json), sem chamar a API.
{
  const cache = path.join(ROOT, "tools", ".voices-ok.json");
  const ok = fs.existsSync(cache) ? JSON.parse(fs.readFileSync(cache, "utf8")) : {};
  // Só 400/404 marcam a voz como indisponível; 429/5xx/rede são transitórios e nunca entram no cache
  // (uma falha passageira trocaria a voz do personagem e regeraria todos os clipes dele, pagos)
  const probe = async (name) => {
    if (name in ok) return ok[name];
    if (DRY || MOCK) return true;
    for (let attempt = 1; attempt <= 3; attempt++) {
      const res = await fetch(`${API}/text-to-speech/${VOICES[name].id}?output_format=mp3_22050_32`, {
        method: "POST", headers: { "xi-api-key": KEY, "content-type": "application/json" },
        body: JSON.stringify({ text: "Hi.", model_id: MODEL }),
      });
      if (res.ok) { ok[name] = true; return true; }
      if (res.status === 400 || res.status === 404) { ok[name] = false; console.log(`Voz indisponível: ${name} (${res.status})`); return false; }
      console.log(`Probe de ${name}: ${res.status}, tentando de novo`);
      await new Promise((r) => setTimeout(r, 1500 * attempt));
    }
    return true; // indisponibilidade transitória: mantém a voz (a geração tentará de novo)
  };
  // Atribuições de reserva já resolvidas em execuções anteriores (evita trocar voz ao mudar o catálogo)
  const assignedCache = path.join(ROOT, "tools", ".voices-assigned.json");
  const saved = fs.existsSync(assignedCache) ? JSON.parse(fs.readFileSync(assignedCache, "utf8")) : {};
  Object.keys(saved).forEach((c) => { if (assigned[c] && VOICES[saved[c]] && ok[assigned[c]] === false) assigned[c] = saved[c]; });
  const exclusiveVoices = new Set([...EXCLUSIVE].map((c) => assigned[c]).filter(Boolean));
  // Quem contracena com o papel (mesma cena, história, unidade ou lição): as vozes deles ficam proibidas
  const peers = (char) => uniq(lint.sets.filter((s) => s.who.includes(char)).flatMap((s) => s.who).filter((c) => c !== char));
  const poolOf = (name) => Object.values(V.pools || {}).find((p) => p.includes(name)) || [];
  const inUse = new Set(Object.values(assigned));
  let changed = false;
  for (const char of Object.keys(assigned)) {
    if (!VOICES[assigned[char]] || (await probe(assigned[char]))) continue;
    const g = gender(char);
    const forbidden = new Set([...exclusiveVoices, ...peers(char).map((c) => assigned[c])]);
    const candidates = (pred) => Object.keys(VOICES).filter((n) => VOICES[n].gender === g && !forbidden.has(n) && pred(n));
    // Ordem: mesma pool e livre, GA livre, GA já usada por outro papel (fora dos conjuntos deste), sotaque diferente (com aviso)
    const order = [
      ...candidates((n) => poolOf(assigned[char]).includes(n) && !inUse.has(n)),
      ...candidates((n) => VOICES[n].accent === ACCENT && !inUse.has(n)),
      ...candidates((n) => VOICES[n].accent === ACCENT),
      ...candidates(() => true),
    ];
    let picked = null;
    for (const n of uniq(order)) { if (await probe(n)) { picked = n; break; } }
    if (!picked) {
      const counts = {};
      Object.entries(assigned).forEach(([c, n]) => { if (gender(c) === g && ok[n]) counts[n] = (counts[n] || 0) + 1; });
      picked = Object.keys(counts).sort((a, b) => counts[a] - counts[b])[0] || "brian";
    }
    console.log(`  ${char}: ${assigned[char]} → ${picked}`);
    assigned[char] = picked;
    inUse.add(picked);
    saved[char] = picked;
    changed = true;
  }
  if (!DRY && !MOCK) { fs.writeFileSync(cache, JSON.stringify(ok, null, 1)); fs.writeFileSync(assignedCache, JSON.stringify(saved, null, 1)); }
  if (changed) { lint = castLint(assigned); printLint(lint, "Lint após as trocas de voz"); }
}

// Resumo das vozes resolvidas para todo o conteúdo (não só o subconjunto de --limit/--only):
// se tudo cair numa voz só, algo está errado
{
  const used = new Map();
  const chars = new Set(allJobs.map((j) => j.char));
  chars.forEach((c) => {
    const v = voiceFor(c);
    used.set(v.name, (used.get(v.name) || []).concat(c));
  });
  const inList = new Set(list.map((j) => j.char));
  console.log(`Vozes distintas: ${used.size} para ${chars.size} personagens${inList.size !== chars.size ? ` (${inList.size} personagens neste subconjunto)` : ""}`);
  used.forEach((cs, name) => console.log(`  ${name.padEnd(9)} ← ${cs.join(", ")}`));
  if (used.size < 3) { console.error("ERRO: menos de 3 vozes distintas resolvidas; abortando para não gastar créditos."); process.exit(1); }
}

// Um clipe só vale se o arquivo no manifesto corresponder a texto, voz, modelo, formato, settings, seed
// e (quando o texto tem um nome do dicionário) versão do dicionário
const clipHash = (key, char, kind, slow) => {
  const sig = settingsSig(settingsFor(char, kind, slow));
  const dict = PRON_RE.test(key) ? `|d${PRON_VER}` : "";
  return crypto.createHash("sha1").update(`${key}|${voiceFor(char).voice_id}|${MODEL}|${OUTPUT_FORMAT}|${sig}|${seedFor(char)}${dict}`).digest("hex").slice(0, 16);
};
const expectedFile = (j, slow) => clipHash(j.key, j.char, j.kind, slow) + ".mp3";
const alignPath = (file) => path.join(ALIGN_DIR, file.replace(/\.mp3$/, ".json"));
const have = (file) => fs.existsSync(path.join(AUDIO_DIR, file)) && fs.existsSync(alignPath(file));
const current = (j, slow) => (slow ? manifest[j.key]?.["~slow"]?.[j.char] : manifest[j.key]?.[j.char]);
// Fila: cada variante (normal/lenta) é um pedido; pendente = manifesto desatualizado ou arquivo ausente
const pending = [];
list.forEach((j) => {
  if (current(j, false) !== expectedFile(j, false) || !have(expectedFile(j, false))) pending.push({ ...j, slow: false });
  if (hasSlow(j) && (current(j, true) !== expectedFile(j, true) || !have(expectedFile(j, true)))) pending.push({ ...j, slow: true });
});
const sum = (xs) => xs.reduce((n, j) => n + j.text.length, 0);
const pendingChars = sum(pending.filter((p) => !p.slow));
const pendingSlowChars = sum(pending.filter((p) => p.slow));
const perChar = /flash|turbo/.test(MODEL) ? 0.5 : 1;
const total = list.length + list.filter(hasSlow).length;

// ---------- Audição do elenco (seção 2.1, item 6 da spec) ----------
// Por voz usada no casting: o nome do personagem principal que a usa, 2 frases do repertório desse personagem
// (data.js, scenes.js, stories.js) e 1 frase com nomes bíblicos difíceis. Sai em audio/audition/<voz>-<n>.mp3 e
// audio/audition/index.html; nunca entra no manifesto nem nos sprites.
const NAMES_SENTENCE = "Nebuchadnezzar, Belshazzar and Mephibosheth met Zacchaeus, Bartimaeus and Isaiah in Capernaum, near Nineveh and Gethsemane.";
const GENERIC_SENTENCES = ["In the beginning God created the heaven and the earth.", "The Lord is my shepherd; I shall not want."];
const AUDITION_INDEX = path.join(AUDITION_DIR, "index.json");
function auditionPlan() {
  const byChar = {};
  allJobs.forEach((j) => (byChar[j.char] = byChar[j.char] || []).push(j));
  const byVoice = new Map();
  Object.keys(byChar).forEach((c) => { const v = voiceFor(c).name; byVoice.set(v, (byVoice.get(v) || []).concat(c)); });
  const spoken = (c) => (byChar[c] || []).filter((j) => ["line", "sentence", "story", "verse"].includes(j.kind) && wordCount(j.text) >= 4 && !/\bblank\b/.test(j.key));
  const score = (c) => (EXCLUSIVE.has(c) ? 1e6 : 0) + spoken(c).length;
  // Frases de tamanho médio (25 a 110 caracteres), falas de cena antes de frases de lição, histórias e versículos;
  // a primeira e a do meio da lista, para ouvir dois registros do mesmo personagem
  const RANK = { line: 0, sentence: 1, story: 2, verse: 3 };
  const repertoire = (c) => {
    const all = spoken(c);
    const mid = all.filter((j) => j.text.length >= 25 && j.text.length <= 110);
    return (mid.length >= 2 ? mid : all).sort((a, b) => RANK[a.kind] - RANK[b.kind] || b.text.length - a.text.length);
  };
  const plan = [];
  [...byVoice.keys()].sort().forEach((voice) => {
    const chars = byVoice.get(voice).sort((a, b) => score(b) - score(a) || a.localeCompare(b));
    const main = chars[0];
    let rep = [];
    for (const c of chars) { rep = rep.concat(repertoire(c)); if (rep.length >= 2) break; }
    if (rep.length < 2) rep = rep.concat(GENERIC_SENTENCES.map((t) => ({ text: t, kind: "sentence" })));
    const picks = [rep[0], rep[Math.floor(rep.length / 2)]];
    const texts = [{ text: displayName(main), kind: "name" }, ...picks.map((p) => ({ text: p.text, kind: p.kind })), { text: NAMES_SENTENCE, kind: "sentence" }];
    texts.forEach((t, i) => plan.push({ file: `${voice}-${i + 1}.mp3`, voice, char: main, chars, text: t.text, key: audioKey(t.text), kind: t.kind, slow: false, hash: clipHash(audioKey(t.text), main, t.kind, false) }));
  });
  return plan;
}
const auditionIndex = readJson(AUDITION_INDEX, {});
const plan = auditionPlan();
const auditionPending = plan.filter((p) => auditionIndex[p.file]?.hash !== p.hash || !fs.existsSync(path.join(AUDITION_DIR, p.file)));

console.log(`Clipes: ${total} (${list.length} normais + ${list.filter(hasSlow).length} lentos) · já corretos: ${total - pending.length} · a gerar: ${pending.length}`);
console.log(`Estimativa (a gerar): ${pendingChars} caracteres normais + ${pendingSlowChars} lentos ≈ ${Math.ceil((pendingChars + pendingSlowChars) * perChar)} créditos (${perChar} por caractere)`);
console.log(`Estimativa (regeneração completa do zero): ${totalChars} normais + ${slowChars} lentos ≈ ${Math.ceil((totalChars + slowChars) * perChar)} créditos`);
console.log(`Audição: ${new Set(plan.map((p) => p.voice)).size} vozes · ${plan.length} clipes · ${sum(plan)} caracteres ≈ ${Math.ceil(sum(plan) * perChar)} créditos (a gerar: ${auditionPending.length} clipes, ${sum(auditionPending)} caracteres)`);
if (DRY) process.exit(lint.errors.length ? 1 : 0);
if (lint.errors.length) { console.error("ERRO: o lint do elenco encontrou colisões; corrija tools/voices.json antes de gerar (nenhum crédito gasto)."); process.exit(1); }
if (!MOCK) {
  try {
    const sub = await (await fetch(`${API}/user/subscription`, { headers: { "xi-api-key": KEY } })).json();
    console.log(`Créditos: ${sub.character_count}/${sub.character_limit} usados no ciclo (plano ${sub.tier})`);
  } catch (e) { /* informativo apenas */ }
}

// ---------- Dicionário de pronúncia ----------
// Criado uma vez e cacheado em tools/.pron-dict.json { id, version_id, hash }; recriado se as regras mudarem.
// Se a API recusar (403/4xx), segue sem dicionário: o clipe sai com a pronúncia padrão.
async function ensureDictionary() {
  if (MOCK) return null;
  const hash = crypto.createHash("sha1").update(JSON.stringify(PRON_RULES)).digest("hex").slice(0, 16);
  try {
    const cached = fs.existsSync(PRON_CACHE) ? JSON.parse(fs.readFileSync(PRON_CACHE, "utf8")) : null;
    if (cached && cached.hash === hash && cached.id && cached.version_id) return cached;
  } catch (e) { /* cache inválido: recria */ }
  try {
    const res = await fetch(`${API}/pronunciation-dictionaries/add-from-rules`, {
      method: "POST", headers: { "xi-api-key": KEY, "content-type": "application/json" },
      body: JSON.stringify({ name: `biblialearn-${hash}`, description: "Nomes bíblicos (respelling)", rules: PRON_RULES }),
    });
    if (!res.ok) { console.log(`Dicionário de pronúncia indisponível (${res.status}): seguindo sem ele`); return null; }
    const data = await res.json();
    const dict = { id: data.id, version_id: data.version_id, hash };
    fs.writeFileSync(PRON_CACHE, JSON.stringify(dict, null, 1));
    console.log(`Dicionário de pronúncia: ${dict.id} (${PRON_RULES.length} regras)`);
    return dict;
  } catch (e) { console.log(`Dicionário de pronúncia falhou (${e.message}): seguindo sem ele`); return null; }
}
const dict = await ensureDictionary();

// ---------- Geração ----------
const round3 = (x) => Math.round(x * 1000) / 1000;
// Guarda só o necessário para o recorte e a auditoria: texto enviado, origem do alinhamento, caracteres e tempos
// (3 casas), seed usada, request-id e o resultado do QA
const saveAlign = (alignOut, text, source, al, extra) => fs.writeFileSync(alignOut, JSON.stringify({
  text, source, characters: al?.characters || [], start: (al?.character_start_times_seconds || []).map(round3), end: (al?.character_end_times_seconds || []).map(round3), ...extra,
}));
async function duration(file) {
  const { stdout } = await run("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file]);
  return parseFloat(stdout.trim()) || 0;
}

// QA por clipe (seção 6.5 da spec, simplificada): rejeita e repete uma vez com outra seed quando o áudio dura menos de
// 0,25 s, mais de 2,5 x (0,075 s por caractere + 0,4 s) (alucinação, texto repetido) ou quando o alinhamento vem vazio.
// Na segunda reprovação o clipe fica (já foi pago) e entra em audio/qa-report.json para o ouvido decidir.
const QA_MIN = 0.25;
const qaMax = (text) => 2.5 * (0.075 * text.length + 0.4);
function qaCheck(text, dur, al) {
  if (!al || !Array.isArray(al.characters) || !al.characters.length) return "alinhamento vazio";
  if (dur < QA_MIN) return `duração ${dur.toFixed(2)} s < ${QA_MIN} s`;
  if (dur > qaMax(text)) return `duração ${dur.toFixed(2)} s > ${qaMax(text).toFixed(2)} s (2,5 x o esperado)`;
  return null;
}
const qaFailed = [];
let qaRetried = 0;

// Mock: tom de 440 Hz com ≈ 0,06 s por caractere + 0,3 s e alinhamento uniforme (só para testar o fluxo).
// MOCK_QA_FAIL=1 faz a primeira tentativa de 1 em 10 clipes sair curta demais, para exercitar o QA.
function mockClip(job, out, attempt) {
  const fail = process.env.MOCK_QA_FAIL && attempt === 0 && crc32(job.key) % 10 === 0;
  const dur = fail ? 0.1 : (0.06 * job.text.length + 0.3) / (job.slow ? SLOW_SPEED : 1);
  execFileSync("ffmpeg", ["-v", "error", "-y", "-f", "lavfi", "-i", `sine=frequency=440:duration=${dur.toFixed(3)}`, "-ac", "1", "-ar", "44100", "-codec:a", "libmp3lame", "-b:a", "128k", out]);
  const chars = [...job.text];
  const step = dur / chars.length;
  return { characters: chars, character_start_times_seconds: chars.map((_, i) => i * step), character_end_times_seconds: chars.map((_, i) => (i + 1) * step) };
}

async function request(job, seed) {
  const voice = voiceFor(job.char);
  const body = { text: job.text, model_id: MODEL, voice_settings: settingsFor(job.char, job.kind, job.slow), seed, apply_text_normalization: "auto" };
  if (job.prev) body.previous_text = job.prev;
  if (job.next) body.next_text = job.next;
  if (dict && PRON_RE.test(job.text)) body.pronunciation_dictionary_locators = [{ pronunciation_dictionary_id: dict.id, version_id: dict.version_id }];
  for (let attempt = 1; attempt <= 5; attempt++) {
    const res = await fetch(`${API}/text-to-speech/${voice.voice_id}/with-timestamps?output_format=${OUTPUT_FORMAT}`, {
      method: "POST", headers: { "xi-api-key": KEY, "content-type": "application/json" }, body: JSON.stringify(body),
    });
    if (res.ok) { const data = await res.json(); data.requestId = res.headers.get("request-id") || undefined; return data; }
    const text = await res.text();
    // 429/5xx: honra retry-after; senão espera crescente com um pouco de aleatoriedade para os workers não baterem juntos
    if (res.status === 429 || res.status >= 500) {
      const ra = Number(res.headers.get("retry-after")) || 0;
      await new Promise((r) => setTimeout(r, ra ? Math.min(60000, ra * 1000) : 1500 * attempt + Math.random() * 500));
      continue;
    }
    // Dicionário apagado na conta (cache velho): tenta uma vez sem ele em vez de perder o clipe
    if (body.pronunciation_dictionary_locators && res.status < 500 && /dictionar/i.test(text)) {
      console.log(`Dicionário recusado (${res.status}) em "${job.text}": repetindo sem ele`);
      delete body.pronunciation_dictionary_locators;
      continue;
    }
    throw new Error(`${res.status} ${text.slice(0, 200)}`);
  }
  throw new Error("sem resposta após 5 tentativas");
}

// Sintetiza um clipe em `out` (com o alinhamento em `alignOut`, caminho absoluto) aplicando o QA; devolve o resultado do QA
async function synth(job, out, alignOut) {
  const base = seedFor(job.char);
  let last = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    const seed = (base + attempt) % 4294967295;
    let source = "alignment", al, requestId;
    if (MOCK) {
      al = mockClip(job, out, attempt);
    } else {
      const data = await request(job, seed);
      if (!data.audio_base64) throw new Error("resposta sem audio_base64");
      requestId = data.requestId;
      // Com alias do dicionário, "alignment" (texto original) é o preferido; se não reconstruir o texto
      // enviado, fica "normalized_alignment" e o recorte faz o mapeamento aproximado
      al = data.alignment;
      if (!al || !Array.isArray(al.characters) || al.characters.join("") !== job.text) {
        if (data.normalized_alignment?.characters) { source = "normalized"; al = data.normalized_alignment; }
        else if (al?.characters) source = "alignment-divergente";
        else { source = "nenhum"; al = null; }
      }
      fs.writeFileSync(out, Buffer.from(data.audio_base64, "base64"));
    }
    const dur = await duration(out);
    const reason = qaCheck(job.text, dur, al);
    const qa = { dur: round3(dur), attempts: attempt + 1, ok: !reason, ...(reason ? { reason } : {}) };
    saveAlign(alignOut, job.text, source, al, { seed, ...(requestId ? { requestId } : {}), qa });
    if (!reason) { if (attempt) qaRetried++; return qa; }
    console.log(`QA: "${job.text}"${job.slow ? " (lento)" : ""}: ${reason}; ${attempt === 0 ? "repetindo com outra seed" : "mantendo o clipe e marcando no relatório"}`);
    last = qa;
  }
  qaFailed.push({ file: path.basename(out), text: job.text, char: job.char, slow: job.slow, ...last });
  return last;
}

async function pool(items, fn) {
  const queue = [...items];
  await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length) await fn(queue.shift());
  }));
}
const writeQaReport = (extra) => fs.writeFileSync(QA_REPORT, JSON.stringify({
  built: new Date().toISOString(), model: MODEL, format: OUTPUT_FORMAT, ...extra, qaRetried, qaFailed,
}, null, 1));

// ---------- Audição ----------
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
function writeAuditionHtml() {
  const byVoice = new Map();
  plan.forEach((p) => byVoice.set(p.voice, (byVoice.get(p.voice) || []).concat(p)));
  const blocks = [...byVoice.entries()].map(([voice, ps]) => {
    const v = VOICES[voice];
    const chars = ps[0].chars.map((c) => `${displayName(c)} (${c})`).join(", ");
    const clips = ps.map((p) => {
      const meta = auditionIndex[p.file];
      const qa = meta?.qa ? (meta.qa.ok ? `${meta.qa.dur} s` : `QA: ${meta.qa.reason}`) : "ainda não gerado";
      return `<li><audio controls preload="none" src="${esc(p.file)}"></audio><span class="t">${esc(p.text)}</span><span class="m">${esc(p.kind)} · ${esc(qa)}</span></li>`;
    }).join("\n");
    return `<section id="${esc(voice)}"><h2>${esc(voice)} <small>${esc(v.id)} · ${esc(v.gender === "f" ? "feminina" : "masculina")} · ${esc(v.accent)} · ${esc(v.age)}</small></h2>
<p class="chars"><b>Personagens:</b> ${esc(chars)}</p>${v.notes ? `<p class="notes">${esc(v.notes)}</p>` : ""}
<ol>${clips}</ol>
<label>Notas <textarea data-voice="${esc(voice)}" rows="2" placeholder="aprovada, trocar por..., muito jovem, etc."></textarea></label></section>`;
  }).join("\n");
  const html = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Audição do elenco</title>
<style>
body{font:16px/1.45 system-ui,sans-serif;margin:0 auto;max-width:860px;padding:16px;color:#1b1b1b;background:#fafafa}
h1{font-size:1.5rem}h2{font-size:1.15rem;margin:0 0 4px}h2 small{font-weight:400;color:#666;font-size:.8rem}
section{background:#fff;border:1px solid #ddd;border-radius:10px;padding:12px 16px;margin:12px 0}
ol{padding-left:20px}li{display:grid;grid-template-columns:260px 1fr;gap:4px 12px;align-items:center;margin:6px 0}
li .t{font-weight:500}li .m{grid-column:2;color:#666;font-size:.8rem}audio{width:250px}
.chars{margin:4px 0}.notes{color:#555;font-size:.9rem;margin:4px 0}
label{display:block;margin-top:8px;font-size:.9rem;color:#444}textarea{display:block;width:100%;box-sizing:border-box;margin-top:4px;font:inherit}
nav a{margin-right:8px}button{font:inherit;padding:6px 12px}
@media (max-width:600px){li{grid-template-columns:1fr}li .m{grid-column:1}audio{width:100%}}
</style></head><body>
<h1>Audição do elenco (${byVoice.size} vozes, ${plan.length} clipes)</h1>
<p>Por voz: o nome do personagem principal, duas frases do repertório dele e uma frase com nomes bíblicos difíceis.
Modelo ${esc(MODEL)}, formato ${esc(OUTPUT_FORMAT)}, gerado em ${esc(new Date().toISOString().slice(0, 16).replace("T", " "))} UTC.
As notas ficam guardadas neste navegador; use "Exportar notas" para gerar um JSON e colar em tools/voices.json.</p>
<p><button id="export">Exportar notas</button> <button id="clear">Limpar notas</button></p>
<nav>${[...byVoice.keys()].map((v) => `<a href="#${esc(v)}">${esc(v)}</a>`).join(" ")}</nav>
${blocks}
<script>
const areas=[...document.querySelectorAll("textarea[data-voice]")];
areas.forEach(a=>{try{a.value=localStorage.getItem("audition:"+a.dataset.voice)||""}catch(e){}a.addEventListener("input",()=>{try{localStorage.setItem("audition:"+a.dataset.voice,a.value)}catch(e){}})});
document.getElementById("export").onclick=()=>{const o={};areas.forEach(a=>{if(a.value.trim())o[a.dataset.voice]=a.value.trim()});const b=new Blob([JSON.stringify(o,null,2)],{type:"application/json"});const u=URL.createObjectURL(b);const l=document.createElement("a");l.href=u;l.download="audition-notes.json";l.click();URL.revokeObjectURL(u)};
document.getElementById("clear").onclick=()=>{if(!confirm("Apagar todas as notas?"))return;areas.forEach(a=>{a.value="";try{localStorage.removeItem("audition:"+a.dataset.voice)}catch(e){}})};
</script></body></html>
`;
  fs.writeFileSync(path.join(AUDITION_DIR, "index.html"), html);
}
if (AUDITION) {
  fs.mkdirSync(AUDITION_DIR, { recursive: true });
  let done = 0, failed = 0;
  await pool(auditionPending, async (p) => {
    const out = path.join(AUDITION_DIR, p.file);
    try {
      const qa = await synth({ ...p, prev: "", next: "" }, out, out.replace(/\.mp3$/, ".json"));
      auditionIndex[p.file] = { voice: p.voice, voice_id: VOICES[p.voice].id, char: p.char, text: p.text, kind: p.kind, hash: p.hash, qa };
      done++;
    } catch (e) { failed++; console.error("Falhou:", p.voice, p.text, "-", e.message); }
  });
  // Entradas de vozes que saíram do casting e arquivos que ninguém cita
  const live = new Set(plan.map((p) => p.file));
  Object.keys(auditionIndex).forEach((f) => { if (!live.has(f)) delete auditionIndex[f]; });
  for (const f of fs.readdirSync(AUDITION_DIR)) if (/\.(mp3|json)$/.test(f) && f !== "index.json" && !live.has(f) && !live.has(f.replace(/\.json$/, ".mp3"))) fs.unlinkSync(path.join(AUDITION_DIR, f));
  fs.writeFileSync(AUDITION_INDEX, JSON.stringify(auditionIndex, null, 1));
  writeAuditionHtml();
  const rel = path.relative(ROOT, AUDITION_DIR);
  console.log(`Audição concluída: ${done} gerados, ${failed} falhas, ${qaRetried} repetidos pelo QA, ${qaFailed.length} reprovados · ${rel.startsWith("..") ? AUDITION_DIR : rel}/index.html`);
  if (qaFailed.length) qaFailed.forEach((q) => console.log(`  reprovado: ${q.file} "${q.text}" (${q.reason})`));
  process.exit(failed ? 2 : 0);
}

fs.mkdirSync(ALIGN_DIR, { recursive: true });
let done = 0, failed = 0;
async function gen(job) {
  const file = expectedFile(job, job.slow);
  const out = path.join(AUDIO_DIR, file);
  if (!have(file)) await synth(job, out, alignPath(file));
  const entry = (manifest[job.key] = manifest[job.key] || {});
  if (job.slow) { entry["~slow"] = entry["~slow"] || {}; entry["~slow"][job.char] = file; }
  else entry[job.char] = file;
  done++;
  if (done % 25 === 0) { fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 1)); console.log(`${done}/${pending.length}`); }
}
await pool(pending, async (job) => {
  try { await gen(job); } catch (e) { failed++; console.error("Falhou:", job.text, job.slow ? "(lento)" : "", "-", e.message); }
});

// Remove entradas que não correspondem mais a nenhum texto/personagem do conteúdo,
// refaz o "default" de cada texto (voz do narrador quando houver) e limpa arquivos órfãos
const wanted = new Set(list.map((j) => `${j.key}|${j.char}`));
const wantedSlow = new Set(list.filter(hasSlow).map((j) => `${j.key}|${j.char}`));
const full = !LIMIT && !ONLY;
for (const key of Object.keys(manifest)) {
  const entry = manifest[key];
  if (full) {
    for (const c of Object.keys(entry)) if (c !== "default" && c !== "~slow" && !wanted.has(`${key}|${c}`)) delete entry[c];
    if (entry["~slow"]) for (const c of Object.keys(entry["~slow"])) if (c !== "default" && !wantedSlow.has(`${key}|${c}`)) delete entry["~slow"][c];
  }
  const files = Object.keys(entry).filter((c) => c !== "default" && c !== "~slow").map((c) => entry[c]);
  if (!files.length) { delete manifest[key]; continue; }
  entry.default = entry.narrator || files[0];
  const slow = entry["~slow"];
  if (slow) {
    const sfiles = Object.keys(slow).filter((c) => c !== "default").map((c) => slow[c]);
    if (!sfiles.length) delete entry["~slow"];
    else slow.default = slow.narrator || sfiles[0];
  }
}
const referenced = new Set();
Object.values(manifest).forEach((e) => Object.values(e).forEach((v) => {
  if (typeof v === "string") referenced.add(v); else Object.values(v).forEach((f) => referenced.add(f));
}));
let removed = 0;
if (full) {
  // Clipes e alinhamentos que nenhum texto cita (inclui os MP3 antigos de 22 kHz após a migração);
  // só arquivos soltos em audio/: as pastas audition/, words/ e sprites/ não são tocadas
  // (os recortes em audio/words/ são cuidados por tools/cut-words.mjs)
  for (const f of fs.readdirSync(AUDIO_DIR)) {
    if (f.endsWith(".mp3") && !referenced.has(f)) { fs.unlinkSync(path.join(AUDIO_DIR, f)); removed++; }
  }
  for (const f of fs.readdirSync(ALIGN_DIR)) {
    if (f.endsWith(".json") && !referenced.has(f.replace(/\.json$/, ".mp3"))) { fs.unlinkSync(path.join(ALIGN_DIR, f)); removed++; }
  }
}
fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 1));
writeQaReport({ generated: done, failed, pending: pending.length });
console.log(`Concluído: ${done} gerados, ${failed} falhas, ${qaRetried} repetidos pelo QA, ${qaFailed.length} reprovados no QA, ${removed} órfãos removidos, manifesto com ${Object.keys(manifest).length} textos.`);
if (qaFailed.length) qaFailed.forEach((q) => console.log(`  reprovado: ${q.file} "${q.text}"${q.slow ? " (lento)" : ""} (${q.reason})`));
if (failed) process.exit(2);
