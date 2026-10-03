// Gera os clipes de áudio do BíbliaLearn com o ElevenLabs (v2: timestamps, variante lenta nativa,
// dicionário de pronúncia) e atualiza audio/manifest.json.
// Uso: ELEVENLABS_API_KEY=... node tools/gen-audio.mjs [--dry] [--limit=N] [--only=names] [--mock]
//   --dry   só conta e estima créditos (sem chave, sem rede)
//   --mock  gera MP3 e alinhamento sintéticos com ffmpeg, sem API (exige AUDIO_DIR fora do repositório)
//   AUDIO_DIR=/pasta  destino dos clipes (padrão: biblelingo/audio)
//   ELEVENLABS_MODEL  modelo (padrão: eleven_multilingual_v2)
// Idempotente: clipe já presente com o nome esperado (hash de texto, voz, modelo, formato e settings) não é
// gerado de novo. Saída por clipe: audio/<hash>.mp3 (mp3_44100_128) e audio/align/<hash>.json (timestamps
// por caractere, usados por tools/cut-words.mjs para recortar as palavras).
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const AUDIO_DIR = process.env.AUDIO_DIR ? path.resolve(process.env.AUDIO_DIR) : path.join(ROOT, "audio");
const ALIGN_DIR = path.join(AUDIO_DIR, "align");
const MANIFEST = path.join(AUDIO_DIR, "manifest.json");
const API = "https://api.elevenlabs.io/v1";
const MODEL = process.env.ELEVENLABS_MODEL || "eleven_multilingual_v2";
// mp3_44100_128: melhor custo/qualidade para voz sem exigir plano acima do Pro; PCM/WAV ficaria enorme no git
const OUTPUT_FORMAT = "mp3_44100_128";
const SLOW_SPEED = 0.8; // variante "devagar" nativa (o tom não muda, ao contrário do playbackRate 0,75 do app)
const CONCURRENCY = 4; // o plano Pro permite 10 pedidos simultâneos; 4 deixa folga para o 429
const KEY = process.env.ELEVENLABS_API_KEY;
const DRY = process.argv.includes("--dry");
const MOCK = process.argv.includes("--mock");
const LIMIT = Number((process.argv.find((a) => a.startsWith("--limit=")) || "").split("=")[1] || 0);
const ONLY = (process.argv.find((a) => a.startsWith("--only=")) || "").split("=")[1] || "";

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

// Dicionário de pronúncia (regras "alias" = respelling em inglês; "phoneme" não vale no multilingual_v2).
// Só é pedido nos textos que contêm um destes nomes.
const PRONUNCIATIONS = {
  Potiphar: "Pot-ih-far", Goshen: "Go-shen", Elisha: "Ee-lye-sha", Isaiah: "Eye-zay-uh", Nehemiah: "Nee-uh-my-uh",
  Zacchaeus: "Za-kee-us", Bartimaeus: "Bar-tih-may-us", Mephibosheth: "Meh-fib-oh-sheth", Ahaz: "Ay-haz",
  Hezekiah: "Hez-uh-kye-uh", Nineveh: "Nin-uh-vuh", Jesse: "Jess-ee", Pharaoh: "Fair-oh", Ezekiel: "Ee-zee-kee-ul",
  Immanuel: "Ih-man-you-el", Gethsemane: "Geth-sem-uh-nee", Nazareth: "Naz-uh-reth", Galilee: "Gal-ih-lee",
  Capernaum: "Kuh-per-nay-um", Magdalene: "Mag-duh-leen",
};
const PRON_RULES = Object.entries(PRONUNCIATIONS).map(([w, alias]) => ({ type: "alias", string_to_replace: w, alias, case_sensitive: false, word_boundaries: true }));
const PRON_RE = new RegExp("\\b(" + Object.keys(PRONUNCIATIONS).join("|") + ")\\b", "i");
const PRON_CACHE = path.join(ROOT, "tools", ".pron-dict.json");

const audioKey = (t) => String(t).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();
const wordCount = (t) => String(t).trim().split(/\s+/).filter(Boolean).length;

// ---------- Coleta de textos: { key, text, char, kind, prev, next } ----------
// kind: "word" (vocabulário, peça do banco de palavras), "name" (nome do personagem),
//       "sentence" (frase de lição, versículo, narração, pergunta/opção), "line" (fala de diálogo, cena ou história)
const jobs = new Map(); // key|char -> job
const add = (text, char, kind = "sentence", ctx = {}) => {
  if (!text) return;
  const k = audioKey(text);
  if (!k) return;
  const id = `${k}|${char}`;
  if (!jobs.has(id)) jobs.set(id, { key: k, text, char, kind, prev: ctx.prev || "", next: ctx.next || "" });
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
    (l.vocab || []).forEach((v) => add(v.en, own(v.en), "word"));
    (l.sentences || []).forEach((s) => add(s.en, own(s.en), "sentence"));
    if (l.verse) {
      const c = own(l.verse.text);
      add(l.verse.text, c, "sentence");
      add(l.verse.text.replace(new RegExp("\\b" + l.verse.blank.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b"), "blank"), c, "sentence");
      l.verse.options.forEach((o) => add(o, c, "sentence"));
    }
    if (l.dialogue) {
      // A fala e as respostas são um diálogo: o contexto em inglês ajuda a prosódia
      const c = own(l.dialogue.line);
      add(l.dialogue.line, c, "line", { next: l.dialogue.answer });
      l.dialogue.options.forEach((o) => add(o, c, "line", { prev: l.dialogue.line }));
    }
    if (l.quiz) { const c = own(l.quiz.q); add(l.quiz.q, c, "sentence"); l.quiz.options.forEach((o) => add(o, c, "sentence", { prev: l.quiz.q })); }
    if (l.reading) {
      const c = own(l.reading.q);
      add(l.reading.text, c, "sentence");
      add(l.reading.q, c, "sentence", { prev: l.reading.text });
      l.reading.options.forEach((o) => add(o, c, "sentence", { prev: l.reading.q }));
    }
  });
});
STORIES.forEach((s) => {
  const spoken = s.beats.filter((b) => b.en);
  spoken.forEach((b, i) => {
    const who = b.who || "narrator";
    add(b.en, who, b.who ? "line" : "sentence", { prev: spoken[i - 1]?.en, next: spoken[i + 1]?.en });
  });
  s.beats.forEach((b) => {
    if (b.q) { add(b.q, "narrator", "sentence"); b.options.forEach((o) => add(o, "narrator", "sentence", { prev: b.q })); }
    if (b.gap) b.options.forEach((o) => add(o, "narrator", "sentence"));
  });
});
Object.keys(CHARACTERS).forEach((k) => add(CHARACTERS[k].name.split(" (")[0], k, "name"));
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

let list = [...jobs.values()];
// --only=names: só o nome de cada personagem na própria voz (amostra barata para ouvir todas)
if (ONLY === "names") {
  const names = new Set(Object.keys(CHARACTERS).map((k) => `${audioKey(CHARACTERS[k].name.split(" (")[0])}|${k}`));
  list = list.filter((j) => names.has(`${j.key}|${j.char}`));
}
if (LIMIT) list = list.slice(0, LIMIT);
// Variante lenta: todo texto com 2+ palavras, exceto nomes
const hasSlow = (j) => j.kind !== "name" && wordCount(j.text) >= 2;
const totalChars = list.reduce((n, j) => n + j.text.length, 0);
const slowChars = list.filter(hasSlow).reduce((n, j) => n + j.text.length, 0);
console.log(`Textos: ${list.length} · caracteres: ${totalChars} (+${slowChars} nas variantes lentas) · modelo: ${MODEL} · formato: ${OUTPUT_FORMAT}${MOCK ? " · MOCK" : ""}`);

const manifest = fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, "utf8")) : {};

// ---------- Vozes ----------
if (!DRY && !MOCK && !KEY) { console.error("Defina ELEVENLABS_API_KEY"); process.exit(1); }
const assigned = { ...VOICE_BY_CHAR };
Object.keys(SCENE_EXTRAS).forEach((k) => { if (!assigned[k]) assigned[k] = SCENE_EXTRAS[k].voice; });
const gender = (char) => ((CHARACTERS[char]?.voice?.gender || SCENE_EXTRAS[char]?.gender) === "female" ? "f" : "m");
const voiceFor = (char) => {
  const name = assigned[char] && VOICES[assigned[char]] ? assigned[char] : "brian";
  return { name, voice_id: VOICES[name][0] };
};

// Valida cada voz com um clipe mínimo (custa ~1 crédito por voz). Voz indisponível
// nesta conta é trocada por outra livre do mesmo gênero, nunca pela voz de todo mundo.
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
  if (!DRY && !MOCK) { fs.writeFileSync(cache, JSON.stringify(ok, null, 1)); fs.writeFileSync(assignedCache, JSON.stringify(saved, null, 1)); }
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
if (!DRY && !MOCK) {
  try {
    const sub = await (await fetch(`${API}/user/subscription`, { headers: { "xi-api-key": KEY } })).json();
    console.log(`Créditos: ${sub.character_count}/${sub.character_limit} usados no ciclo (plano ${sub.tier})`);
  } catch (e) { /* informativo apenas */ }
}

// ---------- voice_settings por tipo de texto ----------
// Derivado de characters.js: pitch < 0,85 = ancião (mais estável), > 1,02 = jovem (mais expressivo).
// Palavra/nome: muito estável (uma palavra solta não precisa de emoção, e sem estabilidade sai com artefatos).
// Frase/versículo/narração: meio-termo. Fala de diálogo/cena: mais estilo, para soar como conversa.
export function settingsFor(char, kind, slow) {
  const p = CHARACTERS[char]?.voice || {};
  const old = !!(p.pitch && p.pitch < 0.85), young = !!(p.pitch && p.pitch > 1.02);
  let stability = 0.5, style = 0.2;
  if (kind === "word" || kind === "name") { stability = 0.6; style = 0.1; }
  else if (kind === "line") { stability = 0.42; style = 0.35; }
  else { stability = old ? 0.6 : young ? 0.42 : 0.5; style = young ? 0.3 : 0.2; }
  return { stability, similarity_boost: 0.8, style, use_speaker_boost: true, speed: slow ? SLOW_SPEED : 1.0 };
}
const settingsSig = (s) => [s.stability, s.similarity_boost, s.style, s.use_speaker_boost ? 1 : 0, s.speed].join(",");

// Um clipe só vale se o arquivo no manifesto corresponder a texto, voz, modelo, formato e settings
const expectedFile = (j, slow) => {
  const sig = settingsSig(settingsFor(j.char, j.kind, slow));
  return crypto.createHash("sha1").update(`${j.key}|${voiceFor(j.char).voice_id}|${MODEL}|${OUTPUT_FORMAT}|${sig}`).digest("hex").slice(0, 16) + ".mp3";
};
const alignPath = (file) => path.join(ALIGN_DIR, file.replace(/\.mp3$/, ".json"));
const have = (file) => fs.existsSync(path.join(AUDIO_DIR, file)) && fs.existsSync(alignPath(file));
const current = (j, slow) => (slow ? manifest[j.key]?.["~slow"]?.[j.char] : manifest[j.key]?.[j.char]);
// Fila: cada variante (normal/lenta) é um pedido; pendente = manifesto desatualizado ou arquivo ausente
const pending = [];
list.forEach((j) => {
  if (current(j, false) !== expectedFile(j, false) || !have(expectedFile(j, false))) pending.push({ ...j, slow: false });
  if (hasSlow(j) && (current(j, true) !== expectedFile(j, true) || !have(expectedFile(j, true)))) pending.push({ ...j, slow: true });
});
const pendingChars = pending.filter((p) => !p.slow).reduce((n, j) => n + j.text.length, 0);
const pendingSlowChars = pending.filter((p) => p.slow).reduce((n, j) => n + j.text.length, 0);
const perChar = /flash|turbo/.test(MODEL) ? 0.5 : 1;
const total = list.length + list.filter(hasSlow).length;
console.log(`Clipes: ${total} (${list.length} normais + ${list.filter(hasSlow).length} lentos) · já corretos: ${total - pending.length} · a gerar: ${pending.length}`);
console.log(`Estimativa: ${pendingChars} caracteres normais + ${pendingSlowChars} lentos ≈ ${Math.ceil((pendingChars + pendingSlowChars) * perChar)} créditos (${perChar} por caractere)`);
if (DRY) process.exit(0);

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
fs.mkdirSync(ALIGN_DIR, { recursive: true });
const round3 = (xs) => xs.map((x) => Math.round(x * 1000) / 1000);
// Guarda só o necessário para o recorte: texto enviado, origem do alinhamento, caracteres e tempos (3 casas)
const saveAlign = (file, text, source, al) => fs.writeFileSync(alignPath(file), JSON.stringify({
  text, source, characters: al.characters, start: round3(al.character_start_times_seconds), end: round3(al.character_end_times_seconds),
}));

// Mock: tom de 440 Hz com ≈ 0,06 s por caractere + 0,3 s e alinhamento uniforme (só para testar o fluxo)
function mockClip(job, out) {
  const dur = (0.06 * job.text.length + 0.3) / (job.slow ? SLOW_SPEED : 1);
  execFileSync("ffmpeg", ["-v", "error", "-y", "-f", "lavfi", "-i", `sine=frequency=440:duration=${dur.toFixed(3)}`, "-ac", "1", "-ar", "44100", "-codec:a", "libmp3lame", "-b:a", "128k", out]);
  const chars = [...job.text];
  const step = dur / chars.length;
  return { characters: chars, character_start_times_seconds: chars.map((_, i) => i * step), character_end_times_seconds: chars.map((_, i) => (i + 1) * step) };
}

async function request(job) {
  const voice = voiceFor(job.char);
  const body = { text: job.text, model_id: MODEL, voice_settings: settingsFor(job.char, job.kind, job.slow), apply_text_normalization: "auto" };
  if (job.prev) body.previous_text = job.prev;
  if (job.next) body.next_text = job.next;
  if (dict && PRON_RE.test(job.text)) body.pronunciation_dictionary_locators = [{ pronunciation_dictionary_id: dict.id, version_id: dict.version_id }];
  for (let attempt = 1; attempt <= 5; attempt++) {
    const res = await fetch(`${API}/text-to-speech/${voice.voice_id}/with-timestamps?output_format=${OUTPUT_FORMAT}`, {
      method: "POST", headers: { "xi-api-key": KEY, "content-type": "application/json" }, body: JSON.stringify(body),
    });
    if (res.ok) return res.json();
    const text = await res.text();
    // 429/5xx: espera crescente com um pouco de aleatoriedade para os 4 workers não baterem juntos
    if (res.status === 429 || res.status >= 500) { await new Promise((r) => setTimeout(r, 1500 * attempt + Math.random() * 500)); continue; }
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

let done = 0, failed = 0;
async function gen(job) {
  const file = expectedFile(job, job.slow);
  const out = path.join(AUDIO_DIR, file);
  if (!have(file)) {
    if (MOCK) {
      saveAlign(file, job.text, "alignment", mockClip(job, out));
    } else {
      const data = await request(job);
      if (!data.audio_base64) throw new Error("resposta sem audio_base64");
      // Com alias do dicionário, "alignment" (texto original) é o preferido; se não reconstruir o texto
      // enviado, fica "normalized_alignment" e o recorte faz o mapeamento aproximado
      let source = "alignment", al = data.alignment;
      if (!al || !Array.isArray(al.characters) || al.characters.join("") !== job.text) {
        if (data.normalized_alignment?.characters) { source = "normalized"; al = data.normalized_alignment; }
        else if (al?.characters) source = "alignment-divergente";
        else throw new Error("resposta sem alinhamento");
      }
      fs.writeFileSync(out, Buffer.from(data.audio_base64, "base64"));
      saveAlign(file, job.text, source, al);
    }
  }
  const entry = (manifest[job.key] = manifest[job.key] || {});
  if (job.slow) { entry["~slow"] = entry["~slow"] || {}; entry["~slow"][job.char] = file; }
  else entry[job.char] = file;
  done++;
  if (done % 25 === 0) { fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 1)); console.log(`${done}/${pending.length}`); }
}
const queue = [...pending];
await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
  while (queue.length) {
    const job = queue.shift();
    try { await gen(job); } catch (e) { failed++; console.error("Falhou:", job.text, job.slow ? "(lento)" : "", "-", e.message); }
  }
}));

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
  // os recortes em audio/words/ são cuidados por tools/cut-words.mjs
  for (const f of fs.readdirSync(AUDIO_DIR)) {
    if (f.endsWith(".mp3") && !referenced.has(f)) { fs.unlinkSync(path.join(AUDIO_DIR, f)); removed++; }
  }
  for (const f of fs.readdirSync(ALIGN_DIR)) {
    if (f.endsWith(".json") && !referenced.has(f.replace(/\.json$/, ".mp3"))) { fs.unlinkSync(path.join(ALIGN_DIR, f)); removed++; }
  }
}
fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 1));
console.log(`Concluído: ${done} gerados, ${failed} falhas, ${removed} órfãos removidos, manifesto com ${Object.keys(manifest).length} textos.`);
if (failed) process.exit(2);
