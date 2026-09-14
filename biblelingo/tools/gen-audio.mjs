// Gera os clipes de áudio do BíbliaLearn com o ElevenLabs e atualiza audio/manifest.json.
// Uso: ELEVENLABS_API_KEY=... node tools/gen-audio.mjs [--dry] [--limit=N] [--only=names]
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
const MODEL = process.env.ELEVENLABS_MODEL || "eleven_multilingual_v2";
const KEY = process.env.ELEVENLABS_API_KEY;
const DRY = process.argv.includes("--dry");
const LIMIT = Number((process.argv.find((a) => a.startsWith("--limit=")) || "").split("=")[1] || 0);

// Carrega os dados do app num sandbox
const ctx = { window: {}, navigator: {}, document: {}, console };
vm.createContext(ctx);
for (const f of ["characters.js", "data.js", "stories.js", "scenes.js", "scenes2.js"]) {
  const src = fs.readFileSync(path.join(ROOT, f), "utf8").replace(/^const (CHARACTERS|COURSE|STORIES|UNIT_CAST|CHARACTER_UNIT|CHARACTER_ORDER|SCENES|SCENE_EXTRAS) =/gm, "var $1 =");
  vm.runInContext(src, ctx);
}
const { CHARACTERS, COURSE, STORIES, UNIT_CAST, SCENES, SCENE_EXTRAS } = ctx;

// Catálogo de vozes pré-definidas da ElevenLabs (IDs públicos; valem para qualquer conta)
const VOICES = {
  brian: ["nPczCjzI2devNBz1zQrb", "m"], george: ["JBFqnCBsd6RMkjVDRZzb", "m"], bill: ["pqHfZKP75CvOlQylNhV4", "m"],
  daniel: ["onwK4e9ZLuTAKqWW03F9", "m"], callum: ["N2lVS1w4EtoT3dr4eOWO", "m"], chris: ["iP95p4xoKVk53GoZ742B", "m"],
  liam: ["TX3LPaxmHKxFdv7VOQHJ", "m"], eric: ["cjVigY5qzO86Huf0OWal", "m"], roger: ["CwhRBWXzGAHq8TQ4Fs17", "m"],
  charlie: ["IKne3meq5aSn9XLyUdCB", "m"], will: ["bIHbv24MyU3PgrIapyrn", "m"],
  adam: ["pNInz6obpgDQGcFmaJgB", "m"], antoni: ["ErXwobaYiN019PkySvjV", "m"], arnold: ["VR6AewLTigWG4xSOukaG", "m"],
  josh: ["TxGEqnHWrfWFTfGW9XjX", "m"], sam: ["yoZ06aMxZJJ28mfd3POQ", "m"], clyde: ["2EiwWnXFnvU5JabPnv8n", "m"],
  dave: ["CYw3kZ02Hs0563khs1Fj", "m"], fin: ["D38z5RcWu1voky8WS1ja", "m"], harry: ["SOYHLrjzK2X1ezoPC6cr", "m"],
  james: ["ZQe5CZNOzWyzPSCn5a3c", "m"], jeremy: ["bVMeCyTHy58xNoL34h3p", "m"], joseph: ["Zlb1dXrM653N07WRdFW3", "m"],
  matthew: ["Yko7PKHZNXotIFUBG7I9", "m"], michael: ["flq6f7yk4E4fJM5XTYuZ", "m"], paul: ["5Q0t7uMcjvnagumLfvZi", "m"],
  thomas: ["GBv7mTt0atIp3Br8iCZE", "m"], ethan: ["g5CIjZEefAph4nQFvHAz", "m"], giovanni: ["zcAOhNBS3c14rBihAFcm", "m"],
  patrick: ["ODq5zmih8GrVes37Dizd", "m"], drew: ["29vD33N1CtxCmqQRPOHJ", "m"],
  alice: ["Xb7hH8MSUJpSbSDYk0k2", "f"], matilda: ["XrExE9yKIg1WjnnlVkGX", "f"], lily: ["pFZP5JQG7iQjIQuC4Bku", "f"],
  sarah: ["EXAVITQu4vr4xnSDxMaL", "f"], laura: ["FGY2WhTYpPnrIDTdsKH5", "f"], charlotte: ["XB0fDUnXU5powFXDhCwa", "f"],
  jessica: ["cgSgspJ2msm6clMCkdW9", "f"], aria: ["9BWtsMINqrJLrRacOk9x", "f"],
  rachel: ["21m00Tcm4TlvDq8ikWAM", "f"], domi: ["AZnzlk1XvdvUeBnXmlld", "f"], elli: ["MF3mGyEYCl7XYWbV9V6O", "f"],
  dorothy: ["ThT5KcBeYPX3keUQqHPh", "f"], emily: ["LcfcDJNUP1GQjkzn1xUU", "f"], freya: ["jsCqWAovK2LkecY7zXl4", "f"],
  grace: ["oWAxZDx7w5VEj9dCyTzz", "f"], serena: ["pMsXgVXv3BLzUgSXRplE", "f"], nicole: ["piTKgcLEGmPE4e6mEKli", "f"],
  glinda: ["z9fAnlkpzviPz146aGWa", "f"], mimi: ["zrHiDhphv9ZnVXBqCLjz", "f"], gigi: ["jBpfuIE2acCO8z3wKNLl", "f"],
};

// Voz própria de cada personagem (uma voz por personagem; o narrador é Brian)
const VOICE_BY_CHAR = {
  narrator: "brian",
  jesus: "george", moises: "bill", noe: "daniel", abraao: "roger", isaias: "george", elias: "arnold", eliseu: "callum",
  ezequiel: "adam", arao: "chris", josue: "ethan", calebe: "eric", gideao: "josh", sansao: "clyde", samuel: "antoni",
  davi: "liam", jose: "harry", salomao: "james", daniel: "matthew", jonas: "fin", neemias: "thomas", pedro: "bill",
  paulo: "michael", barnabe: "paul", timoteo: "sam", filipe: "dave", natanael: "jeremy", tome: "joseph", zaqueu: "daniel",
  bartimeu: "patrick", joaobatista: "drew", josepai: "brian", adao: "josh", isaac: "jeremy", jaco: "eric",
  eva: "alice", sara: "matilda", rebeca: "lily", debora: "charlotte", rute: "laura", ester: "sarah", maria: "jessica",
  marta: "aria", lidia: "rachel", madalena: "domi",
};

const audioKey = (t) => String(t).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();

// ---------- Coleta de textos: { text, char } ----------
const jobs = new Map(); // key|char -> { text, char }
const add = (text, char) => {
  if (!text) return;
  const k = audioKey(text);
  if (!k) return;
  const id = `${k}|${char}`;
  if (!jobs.has(id)) jobs.set(id, { key: k, text, char });
};
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
    (l.vocab || []).forEach((v) => add(v.en, own(v.en)));
    (l.sentences || []).forEach((s) => add(s.en, own(s.en)));
    if (l.verse) { const c = own(l.verse.text); add(l.verse.text, c); add(l.verse.text.replace(new RegExp("\\b" + l.verse.blank.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b"), "blank"), c); l.verse.options.forEach((o) => add(o, c)); }
    if (l.dialogue) { const c = own(l.dialogue.line); add(l.dialogue.line, c); l.dialogue.options.forEach((o) => add(o, c)); }
    if (l.quiz) { const c = own(l.quiz.q); add(l.quiz.q, c); l.quiz.options.forEach((o) => add(o, c)); }
    if (l.reading) { const c = own(l.reading.q); add(l.reading.text, c); add(l.reading.q, c); l.reading.options.forEach((o) => add(o, c)); }
  });
});
STORIES.forEach((s) => s.beats.forEach((b) => {
  const who = b.who || "narrator";
  if (b.en) add(b.en, who);
  if (b.q) { add(b.q, "narrator"); b.options.forEach((o) => add(o, "narrator")); }
  if (b.gap) b.options.forEach((o) => add(o, "narrator"));
}));
Object.keys(CHARACTERS).forEach((k) => add(CHARACTERS[k].name.split(" (")[0], k));
// Cenas do dia a dia: cada fala na voz de quem fala (galeria ou extras), vocabulário na voz do herói
SCENES.forEach((s) => {
  s.lines.forEach((l) => add(l.en, l.who));
  s.vocab.forEach((v) => add(v.en, s.char));
});
// Palavras isoladas de todas as frases (peças do banco de palavras) e "blank"
const words = new Set();
COURSE.forEach((u) => u.lessons.forEach((l) => (l.sentences || []).forEach((s) => s.en.split(" ").forEach((w) => words.add(w.replace(/[.,;:!?'"]/g, ""))))));
SCENES.forEach((s) => s.lines.filter((l) => l.who === s.char).forEach((l) => l.en.split(" ").forEach((w) => words.add(w.replace(/[.,;:!?"]/g, "")))));
// Palavra que já tem recorte de frase (tools/align-words.py) não precisa de síntese isolada, que sai com artefatos
const wordsJson = path.join(AUDIO_DIR, "words.json");
const cuts = fs.existsSync(wordsJson) ? JSON.parse(fs.readFileSync(wordsJson, "utf8")) : {};
words.forEach((w) => { if (!cuts[audioKey(w)]) add(w, "narrator"); });

let list = [...jobs.values()];
// --only=names: só o nome de cada personagem na própria voz (amostra barata para ouvir todas)
const ONLY = (process.argv.find((a) => a.startsWith("--only=")) || "").split("=")[1] || "";
if (ONLY === "names") {
  const names = new Set(Object.keys(CHARACTERS).map((k) => `${audioKey(CHARACTERS[k].name.split(" (")[0])}|${k}`));
  list = list.filter((j) => names.has(`${j.key}|${j.char}`));
}
if (LIMIT) list = list.slice(0, LIMIT);
const totalChars = list.reduce((n, j) => n + j.text.length, 0);
console.log(`Textos: ${list.length} · caracteres: ${totalChars} · modelo: ${MODEL}`);

const manifest = fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, "utf8")) : {};

// ---------- Vozes ----------
if (!DRY && !KEY) { console.error("Defina ELEVENLABS_API_KEY"); process.exit(1); }
const assigned = { ...VOICE_BY_CHAR };
Object.keys(SCENE_EXTRAS).forEach((k) => { if (!assigned[k]) assigned[k] = SCENE_EXTRAS[k].voice; });
const gender = (char) => ((CHARACTERS[char]?.voice?.gender || SCENE_EXTRAS[char]?.gender) === "female" ? "f" : "m");
const voiceFor = (char) => {
  const name = assigned[char] && VOICES[assigned[char]] ? assigned[char] : "brian";
  return { name, voice_id: VOICES[name][0] };
};

// Valida cada voz com um clipe mínimo (custa ~1 crédito por voz). Voz indisponível
// nesta conta é trocada por outra livre do mesmo gênero, nunca pela voz de todo mundo.
// No modo --dry usa só o cache de validação (tools/.voices-ok.json), sem chamar a API.
{
  const cache = path.join(ROOT, "tools", ".voices-ok.json");
  const ok = fs.existsSync(cache) ? JSON.parse(fs.readFileSync(cache, "utf8")) : {};
  // Só 400/404 marcam a voz como indisponível; 429/5xx/rede são transitórios e nunca entram no cache
  // (uma falha passageira trocaria a voz do personagem e regeraria todos os clipes dele, pagos)
  const probe = async (name) => {
    if (name in ok) return ok[name];
    if (DRY) return true;
    for (let attempt = 1; attempt <= 3; attempt++) {
      const res = await fetch(`${API}/text-to-speech/${VOICES[name][0]}?output_format=mp3_22050_32`, {
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
  const inUse = new Set(Object.values(assigned));
  for (const char of Object.keys(assigned)) {
    if (await probe(assigned[char])) continue;
    const g = gender(char);
    const free = Object.keys(VOICES).filter((n) => VOICES[n][1] === g && !inUse.has(n));
    let picked = null;
    for (const n of free) { if (await probe(n)) { picked = n; break; } }
    if (!picked) {
      const counts = {};
      Object.entries(assigned).forEach(([c, n]) => { if (gender(c) === g && ok[n]) counts[n] = (counts[n] || 0) + 1; });
      picked = Object.keys(counts).sort((a, b) => counts[a] - counts[b])[0] || "brian";
    }
    console.log(`  ${char}: ${assigned[char]} → ${picked}`);
    assigned[char] = picked;
    inUse.add(picked);
    saved[char] = picked;
  }
  if (!DRY) { fs.writeFileSync(cache, JSON.stringify(ok, null, 1)); fs.writeFileSync(assignedCache, JSON.stringify(saved, null, 1)); }
}

// Resumo das vozes resolvidas: se tudo cair numa voz só, algo está errado
{
  const used = new Map();
  new Set(list.map((j) => j.char)).forEach((c) => {
    const v = voiceFor(c);
    used.set(v.name, (used.get(v.name) || []).concat(c));
  });
  console.log(`Vozes distintas: ${used.size} para ${new Set(list.map((j) => j.char)).size} personagens`);
  used.forEach((cs, name) => console.log(`  ${name.padEnd(9)} ← ${cs.join(", ")}`));
  if (used.size < 3) { console.error("ERRO: menos de 3 vozes distintas resolvidas; abortando para não gastar créditos."); process.exit(1); }
}
if (!DRY) {
  try {
    const sub = await (await fetch(`${API}/user/subscription`, { headers: { "xi-api-key": KEY } })).json();
    console.log(`Créditos: ${sub.character_count}/${sub.character_limit} usados no ciclo (plano ${sub.tier})`);
  } catch (e) { /* informativo apenas */ }
}

// Um clipe só vale se o arquivo no manifesto corresponder à voz e ao modelo corretos
const expectedFile = (j) => crypto.createHash("sha1").update(`${j.key}|${voiceFor(j.char).voice_id}|${MODEL}`).digest("hex").slice(0, 16) + ".mp3";
const pending = list.filter((j) => (manifest[j.key] && manifest[j.key][j.char]) !== expectedFile(j));
const pendingChars = pending.reduce((n, j) => n + j.text.length, 0);
const perChar = /flash|turbo/.test(MODEL) ? 0.5 : 1;
console.log(`Já corretos: ${list.length - pending.length} · a gerar: ${pending.length} (${pendingChars} caracteres ≈ ${Math.ceil(pendingChars * perChar)} créditos)`);
if (DRY) process.exit(0);

// ---------- Geração ----------
fs.mkdirSync(AUDIO_DIR, { recursive: true });
// Personalidade por voz: tom baixo (anciãos) mais estável e grave; jovens mais expressivos
const settings = (char) => {
  const p = CHARACTERS[char]?.voice || {};
  const old = p.pitch && p.pitch < 0.85, young = p.pitch && p.pitch > 1.02;
  return { stability: old ? 0.65 : young ? 0.4 : 0.5, similarity_boost: 0.8, style: young ? 0.35 : 0.2, use_speaker_boost: true };
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
// Remove entradas que não correspondem mais a nenhum texto/personagem do conteúdo,
// refaz o "default" de cada texto (voz do narrador quando houver) e limpa arquivos órfãos
const wanted = new Set(list.map((j) => `${j.key}|${j.char}`));
if (!LIMIT && !ONLY) {
  for (const key of Object.keys(manifest)) {
    for (const c of Object.keys(manifest[key])) if (c !== "default" && !wanted.has(`${key}|${c}`)) delete manifest[key][c];
  }
}
for (const key of Object.keys(manifest)) {
  const entry = manifest[key];
  const files = Object.keys(entry).filter((c) => c !== "default").map((c) => entry[c]);
  if (!files.length) { delete manifest[key]; continue; }
  entry.default = entry.narrator || files[0];
}
const referenced = new Set(Object.values(manifest).flatMap((e) => Object.values(e)));
let removed = 0;
if (!LIMIT && !ONLY) {
  for (const f of fs.readdirSync(AUDIO_DIR)) {
    if (f.endsWith(".mp3") && !referenced.has(f)) { fs.unlinkSync(path.join(AUDIO_DIR, f)); removed++; }
  }
}
fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 1));
console.log(`Concluído: ${done} gerados, ${failed} falhas, ${removed} órfãos removidos, manifesto com ${Object.keys(manifest).length} textos.`);
if (failed) process.exit(2);
