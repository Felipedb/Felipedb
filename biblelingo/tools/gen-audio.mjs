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
const pending = list.filter((j) => !(manifest[j.key] && manifest[j.key][j.char]));
console.log(`Já gerados: ${list.length - pending.length} · a gerar: ${pending.length}`);
if (DRY) process.exit(0);
if (!KEY) { console.error("Defina ELEVENLABS_API_KEY"); process.exit(1); }

// ---------- Vozes ----------
const voicesRes = await fetch(`${API}/voices`, { headers: { "xi-api-key": KEY } });
if (!voicesRes.ok) { console.error("Falha ao listar vozes:", voicesRes.status, await voicesRes.text()); process.exit(1); }
const voices = (await voicesRes.json()).voices || [];
const byName = (name) => voices.find((v) => v.name.toLowerCase() === name.toLowerCase());
const fallbackMale = voices.find((v) => /male/i.test(v.labels?.gender || "") && !/female/i.test(v.labels?.gender || "")) || voices[0];
const fallbackFemale = voices.find((v) => /female/i.test(v.labels?.gender || "")) || voices[0];
const voiceFor = (char) => {
  const wanted = VOICE_BY_CHAR[char] || "Brian";
  const v = byName(wanted);
  if (v) return v;
  const g = CHARACTERS[char]?.voice?.gender;
  return g === "female" ? fallbackFemale : fallbackMale;
};

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
  const file = crypto.createHash("sha1").update(`${job.key}|${voice.voice_id}`).digest("hex").slice(0, 16) + ".mp3";
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
  if (!manifest[job.key].default) manifest[job.key].default = file;
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
fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 1));
console.log(`Concluído: ${done} gerados, ${failed} falhas, manifesto com ${Object.keys(manifest).length} textos.`);
if (failed) process.exit(2);
