// Empacota os clipes de audio/ em poucos "sprites" MP3 com mapa de offsets.
// Uso: node tools/build-sprites.mjs   (requer ffmpeg no PATH; AUDIO_DIR=/pasta muda a pasta de áudio)
// Sai: audio/sprites/s<N>-<hash>.mp3 e audio/sprites.json { "<arquivo>.mp3": ["s0-xxxx.mp3", inicio, duracao] }
// Entram os clipes normais, as variantes lentas ("~slow" do manifesto) e os recortes de palavra (words.json).
import fs from "node:fs";
import path from "node:path";
import { execFile, execFileSync } from "node:child_process";
import { promisify } from "node:util";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const run = promisify(execFile);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const AUDIO_DIR = process.env.AUDIO_DIR ? path.resolve(process.env.AUDIO_DIR) : path.join(ROOT, "audio");
const OUT_DIR = path.join(AUDIO_DIR, "sprites");
const RATE = 44100; // s16le mono
const GAP = Math.round(0.12 * RATE) * 2; // 120 ms de silêncio entre clipes (bytes)
const BUCKETS = 100; // partição estável: bucket = hash do nome; sprite só muda quando um clipe dele muda
// loudnorm por clipe ao decodificar: volume uniforme entre vozes (cada voz pré-definida sai num nível diferente)
const LOUDNORM = "loudnorm=I=-16:TP=-1.5:LRA=11";
const CONCURRENCY = 4;

const manifest = JSON.parse(fs.readFileSync(path.join(AUDIO_DIR, "manifest.json"), "utf8"));
// Clipes normais e lentos: valores string são arquivos; "~slow" é um objeto { personagem: arquivo, default }
const clipFiles = Object.values(manifest).flatMap((e) => Object.values(e).flatMap((v) => (typeof v === "string" ? [v] : Object.values(v))));
// Cortes de palavras (audio/words.json, de tools/cut-words.mjs) entram nos mesmos sprites
const wordsPath = path.join(AUDIO_DIR, "words.json");
const words = fs.existsSync(wordsPath) ? JSON.parse(fs.readFileSync(wordsPath, "utf8")) : {};
const wordFiles = Object.values(words).flatMap((e) => Object.keys(e).filter((c) => c !== "default").map((c) => e[c].f));
const files = [...new Set([...clipFiles, ...wordFiles])].filter((f) => fs.existsSync(path.join(AUDIO_DIR, f))).sort();
fs.rmSync(OUT_DIR, { recursive: true, force: true });
fs.mkdirSync(OUT_DIR, { recursive: true });

// Decodifica para PCM já normalizado (loudnorm sobe para 192 kHz internamente; -ar traz de volta a 44,1 kHz)
const decode = async (f) => (await run("ffmpeg", ["-v", "error", "-i", path.join(AUDIO_DIR, f), "-af", LOUDNORM, "-f", "s16le", "-ac", "1", "-ar", String(RATE), "-"], { encoding: "buffer", maxBuffer: 1 << 28 })).stdout;
async function pool(items, fn) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(Array.from({ length: CONCURRENCY }, async () => { while (i < items.length) { const k = i++; out[k] = await fn(items[k]); } }));
  return out;
}

const map = {};
let spriteIdx = 0;
const buckets = Array.from({ length: BUCKETS }, () => []);
files.forEach((f) => buckets[parseInt(crypto.createHash("sha1").update(f).digest("hex").slice(0, 6), 16) % BUCKETS].push(f));
for (const group of buckets.filter((g) => g.length)) {
  const pcms = await pool(group, decode);
  const chunks = [];
  let offset = 0; // bytes
  group.forEach((f, i) => {
    const pcm = pcms[i];
    const start = offset / (RATE * 2);
    const dur = pcm.length / (RATE * 2);
    map[f] = [`s${spriteIdx}.mp3`, Math.round(start * 1000) / 1000, Math.round(dur * 1000) / 1000];
    chunks.push(pcm, Buffer.alloc(GAP));
    offset += pcm.length + GAP;
  });
  const raw = Buffer.concat(chunks);
  // Nome com hash do conteúdo: o service worker pode guardar o sprite para sempre sem servir bytes velhos
  const name = `s${spriteIdx}-${crypto.createHash("sha1").update(raw).digest("hex").slice(0, 8)}.mp3`;
  group.forEach((f) => { map[f][0] = name; });
  const out = path.join(OUT_DIR, name);
  // 96 kbps mono: transparente para voz a 44,1 kHz; 64k (versão anterior, fonte de 22 kHz) perdia brilho nas sibilantes
  execFileSync("ffmpeg", ["-v", "error", "-f", "s16le", "-ac", "1", "-ar", String(RATE), "-i", "-", "-codec:a", "libmp3lame", "-b:a", "96k", "-y", out], { input: raw, maxBuffer: 1 << 28 });
  spriteIdx++;
}
fs.writeFileSync(path.join(AUDIO_DIR, "sprites.json"), JSON.stringify(map));
const size = fs.readdirSync(OUT_DIR).reduce((n, f) => n + fs.statSync(path.join(OUT_DIR, f)).size, 0);
console.log(`Sprites: ${spriteIdx} · clipes: ${files.length} · ${(size / 1048576).toFixed(1)} MB`);
