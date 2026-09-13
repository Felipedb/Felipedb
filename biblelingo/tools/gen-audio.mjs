// Gera os clipes de áudio do BíbliaLearn com o ElevenLabs e atualiza audio/manifest.json.
// Uso: ELEVENLABS_API_KEY=... node tools/gen-audio.mjs [--dry] [--limit N]
// Idempotente: clipes já presentes no manifesto não são gerados de novo.
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const AUDIO_DIR = path.join(ROOT, "audio");
const MANIFEST = path.join(AUDIO_DIR, "manifest.json");
const API = "https://api.elevenlabs.io/v1";
const MODEL = process.env.ELEVENLABS_MODEL || "eleven_flash_v2_5";
const KEY = process.env.ELEVENLABS_API_KEY;
const DRY = process.argv.includes("--dry");
const LIMIT = Number((process.argv.find((a) => a.startsWith("--limit=")) || "").split("=")[1] || 0);

// Carrega os dados do app num sandbox
const ctx = { window: {}, navigator: {}, document: {}, console };
vm.createContext(ctx);
for (const f of ["characters.js", "data.js", "stories.js"]) {
  const src = fs.readFileSync(path.join(ROOT, f), "utf8").replace(/^const (CHARACTERS|COURSE|STORIES|UNIT_CAST|CHARACTER_UNIT|CHARACTER_ORDER) =/gm, "var $1 =");
  vm.runInContext(src, ctx);
}
const { CHARACTERS, COURSE, STORIES, UNIT_CAST } = ctx;

// Voz do ElevenLabs por personagem (nomes das vozes pré-definidas; casadas pela lista /v1/voices)
const VOICE_BY_CHAR = {
  narrator: "Brian", jesus: "George", moises: "Bill", noe: "Bill", abraao: "Bill", isaias: "Daniel", elias: "Daniel", eliseu: "Daniel",
  ezequiel: "Daniel", arao: "Brian", josue: "Callum", calebe: "Callum", gideao: "Chris", sansao: "Callum", samuel: "Chris", davi: "Liam",
  jose: "Chris", salomao: "Brian", daniel: "Chris", jonas: "Eric", neemias: "Brian", pedro: "Callum", paulo: "Brian", barnabe: "Eric",
  timoteo: "Liam", filipe: "Chris", natanael: "Eric", tome: "Callum", zaqueu: "Eric", bartimeu: "Daniel", joaobatista: "Daniel",
  josepai: "Brian", adao: "Chris", isaac: "Liam", jaco: "Eric",
  eva: "Alice", sara: "Matilda", rebeca: "Lily", debora: "Matilda", rute: "Lily", ester: "Sarah", maria: "Lily", marta: "Matilda",
  lidia: "Alice", madalena: "Sarah",
};

// IDs públicos das vozes pré-definidas da ElevenLabs (valem para qualquer conta,
// mesmo quando /v1/voices não as lista pelo nome)
const VOICE_IDS = {
  brian: "nPczCjzI2devNBz1zQrb", george: "JBFqnCBsd6RMkjVDRZzb", bill: "pqHfZKP75CvOlQylNhV4",
  daniel: "onwK4e9ZLuTAKqWW03F9", callum: "N2lVS1w4EtoT3dr4eOWO", chris: "iP95p4xoKVk53GoZ742B",
  liam: "TX3LPaxmHKxFdv7VOQHJ", eric: "cjVigY5qzO86Huf0OWal", alice: "Xb7hH8MSUJpSbSDYk0k2",
  matilda: "XrExE9yKIg1WjnnlVkGX", lily: "pFZP5JQG7iQjIQuC4Bku", sarah: "EXAVITQu4vr4xnSDxMaL",
};

const audioKey = (t) => String(t).toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();

// ---------- Coleta de textos: { text, char } ----------
const jobs = new Map(); // key|char -> { text, char }
const add = (text, char) => {
  if (!text) return;
  const k = audioKey(text);
  if (!k) return;
  const id = `${k}|${char}`;
  if (!jobs.has(id)) jobs.set(id, { key: k, text, char });
};
COURSE.forEach((u) => {
  const narrator = (UNIT_CAST[u.id] || ["narrator"])[0];
  u.lessons.forEach((l) => {
    (l.vocab || []).forEach((v) => add(v.en, narrator));
    (l.sentences || []).forEach((s) => add(s.en, narrator));
    if (l.verse) { add(l.verse.text, narrator); add(l.verse.text.replace(l.verse.blank, "blank"), narrator); l.verse.options.forEach((o) => add(o, narrator)); }
    if (l.dialogue) { add(l.dialogue.line, narrator); l.dialogue.options.forEach((o) => add(o, narrator)); }
    if (l.quiz) { add(l.quiz.q, narrator); l.quiz.options.forEach((o) => add(o, narrator)); }
    if (l.reading) { add(l.reading.text, narrator); add(l.reading.q, narrator); l.reading.options.forEach((o) => add(o, narrator)); }
  });
});
STORIES.forEach((s) => s.beats.forEach((b) => {
  const who = b.who || "narrator";
  if (b.en) add(b.en, who);
  if (b.q) { add(b.q, "narrator"); b.options.forEach((o) => add(o, "narrator")); }
  if (b.gap) b.options.forEach((o) => add(o, "narrator"));
}));
Object.keys(CHARACTERS).forEach((k) => add(CHARACTERS[k].name.split(" (")[0], k));
// Palavras isoladas de todas as frases (peças do banco de palavras) e "blank"
const words = new Set();
COURSE.forEach((u) => u.lessons.forEach((l) => (l.sentences || []).forEach((s) => s.en.split(" ").forEach((w) => words.add(w.replace(/[.,;:!?'"]/g, ""))))));
words.forEach((w) => add(w, "narrator"));

let list = [...jobs.values()];
if (LIMIT) list = list.slice(0, LIMIT);
const totalChars = list.reduce((n, j) => n + j.text.length, 0);
console.log(`Textos: ${list.length} · caracteres: ${totalChars} · modelo: ${MODEL}`);

const manifest = fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, "utf8")) : {};

// ---------- Vozes ----------
// No modo --dry não há chave: resolve só pelos IDs fixos
let voices = [];
if (!DRY) {
  if (!KEY) { console.error("Defina ELEVENLABS_API_KEY"); process.exit(1); }
  const voicesRes = await fetch(`${API}/voices`, { headers: { "xi-api-key": KEY } });
  if (!voicesRes.ok) { console.error("Falha ao listar vozes:", voicesRes.status, await voicesRes.text()); process.exit(1); }
  voices = (await voicesRes.json()).voices || [];
}
const byName = (name) => voices.find((v) => v.name.toLowerCase() === name.toLowerCase());
const voiceFor = (char) => {
  const wanted = (VOICE_BY_CHAR[char] || "Brian").toLowerCase();
  const v = byName(wanted);
  if (v) return v;
  if (VOICE_IDS[wanted]) return { name: wanted, voice_id: VOICE_IDS[wanted] };
  return { name: "brian", voice_id: VOICE_IDS.brian };
};

// Resumo das vozes resolvidas: se tudo cair numa voz só, algo está errado
{
  const used = new Map();
  new Set(list.map((j) => j.char)).forEach((c) => {
    const v = voiceFor(c);
    used.set(v.voice_id, (used.get(v.voice_id) || []).concat(c));
  });
  console.log(`Vozes distintas: ${used.size}`);
  used.forEach((cs, id) => console.log(`  ${id.slice(0, 6)}… ← ${cs.slice(0, 8).join(", ")}${cs.length > 8 ? "…" : ""}`));
  if (used.size < 3) { console.error("ERRO: menos de 3 vozes distintas resolvidas; abortando para não gastar créditos."); process.exit(1); }
}
if (!DRY) {
  try {
    const sub = await (await fetch(`${API}/user/subscription`, { headers: { "xi-api-key": KEY } })).json();
    console.log(`Créditos: ${sub.character_count}/${sub.character_limit} usados no ciclo (plano ${sub.tier})`);
  } catch (e) { /* informativo apenas */ }
}

// Um clipe só vale se o arquivo no manifesto corresponder à voz correta do personagem
const expectedFile = (j) => crypto.createHash("sha1").update(`${j.key}|${voiceFor(j.char).voice_id}`).digest("hex").slice(0, 16) + ".mp3";
const pending = list.filter((j) => (manifest[j.key] && manifest[j.key][j.char]) !== expectedFile(j));
const pendingChars = pending.reduce((n, j) => n + j.text.length, 0);
console.log(`Já corretos: ${list.length - pending.length} · a gerar: ${pending.length} (${pendingChars} caracteres ≈ ${Math.ceil(pendingChars / 2)} créditos no flash)`);
if (DRY) process.exit(0);

// ---------- Geração ----------
fs.mkdirSync(AUDIO_DIR, { recursive: true });
const settings = (char) => {
  const p = CHARACTERS[char]?.voice || {};
  // Estabilidade maior para vozes "idosas" (tom baixo), mais expressividade para jovens
  return { stability: p.pitch && p.pitch < 0.85 ? 0.6 : 0.45, similarity_boost: 0.8, style: 0.2, use_speaker_boost: true };
};
let done = 0, failed = 0;
async function gen(job) {
  const voice = voiceFor(job.char);
  const file = expectedFile(job);
  const out = path.join(AUDIO_DIR, file);
  if (!fs.existsSync(out)) {
    for (let attempt = 1; attempt <= 4; attempt++) {
      const res = await fetch(`${API}/text-to-speech/${voice.voice_id}?output_format=mp3_22050_32`, {
        method: "POST",
        headers: { "xi-api-key": KEY, "content-type": "application/json" },
        body: JSON.stringify({ text: job.text, model_id: MODEL, voice_settings: settings(job.char) }),
      });
      if (res.ok) { fs.writeFileSync(out, Buffer.from(await res.arrayBuffer())); break; }
      const body = await res.text();
      if (res.status === 429 || res.status >= 500) { await new Promise((r) => setTimeout(r, 1500 * attempt)); continue; }
      throw new Error(`${res.status} ${body.slice(0, 200)}`);
    }
    if (!fs.existsSync(out)) throw new Error("sem resposta após tentativas");
  }
  manifest[job.key] = manifest[job.key] || {};
  manifest[job.key][job.char] = file;
  done++;
  if (done % 25 === 0) { fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 1)); console.log(`${done}/${pending.length}`); }
}
const queue = [...pending];
await Promise.all(Array.from({ length: 3 }, async () => {
  while (queue.length) {
    const job = queue.shift();
    try { await gen(job); } catch (e) { failed++; console.error("Falhou:", job.text, "-", e.message); }
  }
}));
// Refaz o "default" de cada texto (voz do narrador quando houver) e limpa arquivos órfãos
for (const key of Object.keys(manifest)) {
  const entry = manifest[key];
  const files = Object.keys(entry).filter((c) => c !== "default").map((c) => entry[c]);
  if (!files.length) { delete manifest[key]; continue; }
  entry.default = entry.narrator || files[0];
}
const referenced = new Set(Object.values(manifest).flatMap((e) => Object.values(e)));
let removed = 0;
for (const f of fs.readdirSync(AUDIO_DIR)) {
  if (f.endsWith(".mp3") && !referenced.has(f)) { fs.unlinkSync(path.join(AUDIO_DIR, f)); removed++; }
}
fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 1));
console.log(`Concluído: ${done} gerados, ${failed} falhas, ${removed} órfãos removidos, manifesto com ${Object.keys(manifest).length} textos.`);
if (failed) process.exit(2);
