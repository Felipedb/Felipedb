// Recorta cada palavra das frases gravadas a partir dos timestamps por caractere do ElevenLabs
// (audio/align/<hash>.json, gravados por tools/gen-audio.mjs). Substitui o alinhamento por whisper.
//
// Por que: a síntese de uma palavra isolada sai com artefatos. O Duolingo toca a palavra recortada da
// própria frase, na mesma voz. Para cada frase do manifesto (chave com espaço, variante normal) e cada
// personagem que a gravou, mapeia os caracteres em palavras e grava audio/words/<hash>.mp3 por palavra.
//
// Saída: audio/words.json  { "<palavra>": { "<personagem>": { f, p, d }, "default": "words/x.mp3" } }
//          p = 1 (alinhamento nativo), d = duração do recorte em segundos
//        audio/words-index.json  { "<frase>.mp3": { key, char, words, source, ver } } (idempotente)
// Uso:   node tools/cut-words.mjs [--mock]   (requer ffmpeg e ffprobe no PATH)
//        AUDIO_DIR=/pasta  pasta de áudio (padrão: biblelingo/audio); --mock exige uma pasta fora do repositório
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFile, execFileSync } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const run = promisify(execFile);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const AUDIO_DIR = process.env.AUDIO_DIR ? path.resolve(process.env.AUDIO_DIR) : path.join(ROOT, "audio");
const ALIGN_DIR = path.join(AUDIO_DIR, "align");
const WORDS_DIR = path.join(AUDIO_DIR, "words");
const MANIFEST = path.join(AUDIO_DIR, "manifest.json");
const OUT = path.join(AUDIO_DIR, "words.json");
const INDEX = path.join(AUDIO_DIR, "words-index.json");
const MOCK = process.argv.includes("--mock");
const ALIGN_VER = 5; // sobe quando o recorte muda: só então as frases já feitas voltam à fila
const PAD_BEFORE = 0.03, PAD_AFTER = 0.08; // margens: o ataque da consoante começa antes do timestamp; a sílaba final decai depois
const BLEED = 0.04; // a margem pode invadir no máximo 40 ms da palavra vizinha (o fade esconde o ataque dela)
const MIN_DUR = 0.12; // recorte mais curto que isto soa como um clique: expande simetricamente
const FADE_IN = 0.01, FADE_OUT = 0.035; // fades curtos: sem clique no início, sem "travar" a última sílaba
const LOUDNORM = "loudnorm=I=-16:TP=-1.5:LRA=11"; // volume uniforme entre vozes e entre palavra e frase
const CONCURRENCY = 4; // um ffmpeg por frase; 4 em paralelo ocupam bem um runner de 2 vCPUs

if (MOCK && AUDIO_DIR === path.join(ROOT, "audio")) {
  console.error("Modo --mock exige AUDIO_DIR apontando para uma pasta fora do repositório.");
  process.exit(1);
}
for (const bin of ["ffmpeg", "ffprobe"]) {
  try { execFileSync(bin, ["-version"], { stdio: "ignore" }); } catch (e) { console.error(`${bin} não encontrado no PATH.`); process.exit(1); }
}

const audioKey = (t) => String(t).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();
const wordName = (file, tok) => crypto.createHash("sha1").update(`${file}|${tok}`).digest("hex").slice(0, 16) + ".mp3";

// Palavras do texto original: [{ tok, i0, i1 }] com a chave normalizada e o intervalo de caracteres
// (sem a pontuação das pontas; apóstrofo interno fica: "God's"). Token só de pontuação é ignorado.
// Composta por hífen ("two-by-two") é uma palavra só, como no app.
function tokenize(text) {
  const out = [];
  const re = /\S+/g;
  let m;
  while ((m = re.exec(text))) {
    let i0 = m.index, i1 = m.index + m[0].length - 1;
    const isWordChar = (ch) => /[\p{L}\p{N}]/u.test(ch);
    while (i0 <= i1 && !isWordChar(text[i0])) i0++;
    while (i1 >= i0 && !isWordChar(text[i1])) i1--;
    if (i0 > i1) continue;
    const tok = audioKey(text.slice(i0, i1 + 1));
    if (tok) out.push({ tok, i0, i1 });
  }
  return out;
}

// Mapeamento aproximado texto → caracteres alinhados (quando o ElevenLabs devolveu o texto normalizado,
// por exemplo com o alias do dicionário): maior subsequência comum, sem diferenciar maiúsculas.
// Devolve map[i] = índice no alinhamento ou -1. Textos têm no máximo algumas centenas de caracteres.
function lcsMap(a, b) {
  const n = a.length, m = b.length;
  const eq = (i, j) => a[i].toLowerCase() === b[j].toLowerCase();
  const dp = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) dp[i][j] = eq(i, j) ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const map = new Array(n).fill(-1);
  for (let i = 0, j = 0; i < n && j < m;) {
    if (eq(i, j)) { map[i] = j; i++; j++; } else if (dp[i + 1][j] >= dp[i][j + 1]) i++; else j++;
  }
  return map;
}

// Início e fim (segundos) de cada palavra a partir do alinhamento por caractere
function wordTimes(align) {
  const text = align.text;
  const chars = align.characters;
  const direct = chars.join("") === text;
  const map = direct ? null : lcsMap([...text], chars);
  const words = tokenize(text);
  const toIdx = (i) => (direct ? i : map[i]);
  return words.map((w) => {
    let j0 = -1, j1 = -1;
    for (let i = w.i0; i <= w.i1 && j0 < 0; i++) j0 = toIdx(i);
    for (let i = w.i1; i >= w.i0 && j1 < 0; i--) j1 = toIdx(i);
    if (j0 < 0 || j1 < 0) {
      // Nenhum caractere casou (palavra totalmente reescrita): usa os vizinhos mapeados mais próximos
      let before = -1, after = chars.length;
      for (let i = w.i0 - 1; i >= 0; i--) if (toIdx(i) >= 0) { before = toIdx(i); break; }
      for (let i = w.i1 + 1; i < text.length; i++) if (toIdx(i) >= 0) { after = toIdx(i); break; }
      j0 = Math.min(before + 1, chars.length - 1); j1 = Math.max(j0, after - 1);
    }
    return { tok: w.tok, s: align.start[j0], e: align.end[j1] };
  }).filter((w) => Number.isFinite(w.s) && Number.isFinite(w.e) && w.e > w.s);
}

async function duration(file) {
  const { stdout } = await run("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file]);
  return parseFloat(stdout.trim()) || 0;
}

// Recorta todas as palavras escolhidas de uma frase num único ffmpeg (filter_complex com uma saída por palavra).
// -ss depois do -i: corte exato por amostra (antes do -i o MP3 seria cortado no quadro mais próximo, ~26 ms).
// loudnorm antes dos fades: assim as pontas terminam em silêncio de verdade, sem clique.
async function cutAll(src, cuts) {
  const filters = [`[0:a]asplit=${cuts.length}${cuts.map((_, i) => `[a${i}]`).join("")}`];
  const args = ["-v", "error", "-y", "-i", src];
  cuts.forEach((c, i) => {
    const d = c.ce - c.cs;
    filters.push(`[a${i}]atrim=start=${c.cs.toFixed(3)}:end=${c.ce.toFixed(3)},asetpts=PTS-STARTPTS,${LOUDNORM},afade=t=in:st=0:d=${FADE_IN},afade=t=out:st=${Math.max(0, d - FADE_OUT).toFixed(3)}:d=${FADE_OUT},aresample=44100[o${i}]`);
  });
  args.push("-filter_complex", filters.join(";"));
  // 96 kbps mono a 44,1 kHz: transparente para voz e metade do tamanho de 128k; 48k já deixava a voz "aquosa"
  cuts.forEach((c, i) => args.push("-map", `[o${i}]`, "-ac", "1", "-ar", "44100", "-codec:a", "libmp3lame", "-b:a", "96k", c.dst));
  await run("ffmpeg", args, { maxBuffer: 1 << 24 });
}

async function main() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
  const index = fs.existsSync(INDEX) ? JSON.parse(fs.readFileSync(INDEX, "utf8")) : {};
  const words = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, "utf8")) : {};
  fs.mkdirSync(WORDS_DIR, { recursive: true });
  // Frases: chave com espaço, variante normal apenas ("~slow" e "default" não são personagens)
  const sentences = [];
  for (const [key, entry] of Object.entries(manifest)) {
    if (!key.includes(" ")) continue;
    for (const [c, f] of Object.entries(entry)) if (c !== "default" && c !== "~slow" && typeof f === "string") sentences.push({ key, char: c, file: f });
  }
  const live = new Set(sentences.map((s) => s.file));
  // Sai da fila feita: versão antiga do recorte, frase que saiu do manifesto, ou palavra indexada sem recorte vivo
  for (const [f, meta] of Object.entries(index)) {
    const dead = meta.ver !== ALIGN_VER || !live.has(f) || (meta.words || []).some((w) => !words[w]?.[meta.char] || !fs.existsSync(path.join(AUDIO_DIR, words[w][meta.char].f)));
    if (dead) delete index[f];
  }
  const todo = sentences.filter((s) => !index[s.file]).sort((a, b) => a.file.localeCompare(b.file));
  // Recortes "vivos": de frases ainda indexadas (as desta execução entram conforme são feitas)
  const aliveNames = new Set();
  for (const f of live) if (index[f]) for (const w of index[f].words) aliveNames.add(wordName(f, w));
  console.log(`Frases gravadas: ${sentences.length} · a recortar: ${todo.length}${MOCK ? " · MOCK" : ""}`);

  let done = 0, failed = 0;
  const save = () => { fs.writeFileSync(OUT, JSON.stringify(words, null, 1)); fs.writeFileSync(INDEX, JSON.stringify(index, null, 1)); };
  async function one({ key, char, file }) {
    const src = path.join(AUDIO_DIR, file);
    const alignFile = path.join(ALIGN_DIR, file.replace(/\.mp3$/, ".json"));
    if (!fs.existsSync(src) || !fs.existsSync(alignFile)) { console.log(`sem clipe ou alinhamento: ${key} (${char})`); return; }
    const align = JSON.parse(fs.readFileSync(alignFile, "utf8"));
    const times = wordTimes(align);
    const expected = key.split(" ");
    if (times.map((t) => t.tok).join(" ") !== expected.join(" ")) console.log(`aviso: palavras do alinhamento diferem da chave em "${key}" (${char})`);
    const total = await duration(src);
    // Janela de cada palavra: margens limitadas pelos vizinhos (invasão máxima de BLEED), mínimo MIN_DUR
    const spans = times.map((w, i) => {
      const prevEnd = i > 0 ? times[i - 1].e : 0, nextStart = i < times.length - 1 ? times[i + 1].s : total;
      let cs = Math.max(0, w.s - PAD_BEFORE, prevEnd - BLEED);
      let ce = Math.min(total, w.e + PAD_AFTER, nextStart + BLEED);
      if (ce - cs < MIN_DUR) {
        const half = (MIN_DUR - (ce - cs)) / 2;
        cs = Math.max(0, cs - half); ce = Math.min(total, ce + half);
        if (ce - cs < MIN_DUR) { cs = Math.max(0, ce - MIN_DUR); ce = Math.min(total, cs + MIN_DUR); }
      }
      // Entre ocorrências da mesma palavra na frase vence a que tem mais pausa em volta (soa inteira)
      const score = Math.min(0.25, nextStart - w.e) + 0.5 * Math.min(0.2, w.s - prevEnd) + (i === times.length - 1 ? 0.25 : 0);
      return { tok: w.tok, cs, ce, score };
    });
    const best = new Map();
    spans.forEach((s) => { if (s.tok !== "blank" && (!best.has(s.tok) || s.score > best.get(s.tok).score)) best.set(s.tok, s); });
    const cuts = [...best.values()].map((s) => ({ ...s, dst: path.join(WORDS_DIR, wordName(file, s.tok)) }));
    if (!cuts.length) { index[file] = { key, char, words: [], source: align.source, ver: ALIGN_VER }; return; }
    await cutAll(src, cuts);
    const produced = [];
    for (const c of cuts) {
      if (!fs.existsSync(c.dst)) continue;
      const d = Math.round((c.ce - c.cs) * 1000) / 1000;
      const entry = (words[c.tok] = words[c.tok] || {});
      const prev = entry[char];
      // Entre frases do mesmo personagem fica o recorte mais longo: mais margem = mais pausa em volta.
      // Recorte de frase que saiu do índice (versão antiga) é sempre substituído.
      const prevAlive = prev && aliveNames.has(path.basename(prev.f)) && fs.existsSync(path.join(AUDIO_DIR, prev.f));
      if (!prev || !prevAlive || d > prev.d) entry[char] = { f: "words/" + path.basename(c.dst), p: 1, d };
      aliveNames.add(path.basename(c.dst));
      produced.push(c.tok);
    }
    index[file] = { key, char, words: produced, source: align.source, ver: ALIGN_VER };
  }
  const queue = [...todo];
  await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length) {
      const s = queue.shift();
      try { await one(s); done++; } catch (e) { failed++; console.error("Falhou:", s.key, `(${s.char})`, "-", e.message); }
      if (done % 50 === 0 && queue.length) { save(); console.log(`${done}/${todo.length}`); }
    }
  }));

  // Limpeza: entradas de frases mortas, recortes cujo arquivo sumiu, "default" de cada palavra e órfãos no disco
  const valid = new Set();
  for (const f of live) if (index[f]) for (const w of index[f].words) valid.add(wordName(f, w));
  const referenced = new Set();
  for (const [tok, entry] of Object.entries(words)) {
    for (const c of Object.keys(entry)) {
      if (c === "default") continue;
      const meta = entry[c];
      if (!meta || !fs.existsSync(path.join(AUDIO_DIR, meta.f)) || !valid.has(path.basename(meta.f))) delete entry[c];
    }
    const chars = Object.keys(entry).filter((c) => c !== "default");
    if (!chars.length) { delete words[tok]; continue; }
    // "default" = recorte do narrador quando houver, senão o primeiro
    entry.default = (entry.narrator || entry[chars[0]]).f;
    chars.forEach((c) => referenced.add(entry[c].f));
  }
  let removed = 0;
  for (const f of fs.readdirSync(WORDS_DIR)) {
    if (f.endsWith(".mp3") && !referenced.has("words/" + f)) { fs.unlinkSync(path.join(WORDS_DIR, f)); removed++; }
  }
  save();
  const nFiles = Object.values(words).reduce((n, e) => n + Object.keys(e).filter((c) => c !== "default").length, 0);
  console.log(`Concluído: ${done} frases recortadas, ${failed} falhas · ${Object.keys(words).length} palavras · ${nFiles} recortes · ${removed} órfãos removidos`);
  if (failed) process.exit(2);
}

main();
