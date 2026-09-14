// Empacota os clipes de audio/ em poucos "sprites" MP3 com mapa de offsets.
// Uso: node tools/build-sprites.mjs   (requer ffmpeg no PATH)
// Sai: audio/sprites/s<N>.mp3 e audio/sprites.json { "<arquivo>.mp3": ["s0.mp3", inicio, duracao] }
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const AUDIO_DIR = path.join(ROOT, "audio");
const OUT_DIR = path.join(AUDIO_DIR, "sprites");
const RATE = 44100; // s16le mono
const GAP = Math.round(0.12 * RATE) * 2; // 120 ms de silêncio entre clipes (bytes)
const BUCKETS = 100; // partição estável: bucket = hash do nome; sprite só muda quando um clipe dele muda

const manifest = JSON.parse(fs.readFileSync(path.join(AUDIO_DIR, "manifest.json"), "utf8"));
// Cortes de palavras (audio/words.json, de tools/align-words.py) entram nos mesmos sprites
const wordsPath = path.join(AUDIO_DIR, "words.json");
const words = fs.existsSync(wordsPath) ? JSON.parse(fs.readFileSync(wordsPath, "utf8")) : {};
const wordFiles = Object.values(words).flatMap((e) => Object.keys(e).filter((c) => c !== "default").map((c) => e[c].f));
const files = [...new Set([...Object.values(manifest).flatMap((e) => Object.values(e)), ...wordFiles])].filter((f) => fs.existsSync(path.join(AUDIO_DIR, f))).sort();
fs.rmSync(OUT_DIR, { recursive: true, force: true });
fs.mkdirSync(OUT_DIR, { recursive: true });

const map = {};
let spriteIdx = 0;
const buckets = Array.from({ length: BUCKETS }, () => []);
files.forEach((f) => buckets[parseInt(crypto.createHash("sha1").update(f).digest("hex").slice(0, 6), 16) % BUCKETS].push(f));
for (const group of buckets.filter((g) => g.length)) {
  const chunks = [];
  let offset = 0; // bytes
  for (const f of group) {
    const pcm = execFileSync("ffmpeg", ["-v", "error", "-i", path.join(AUDIO_DIR, f), "-f", "s16le", "-ac", "1", "-ar", String(RATE), "-"], { maxBuffer: 1 << 28 });
    const start = offset / (RATE * 2);
    const dur = pcm.length / (RATE * 2);
    map[f] = [`s${spriteIdx}.mp3`, Math.round(start * 1000) / 1000, Math.round(dur * 1000) / 1000];
    chunks.push(pcm, Buffer.alloc(GAP));
    offset += pcm.length + GAP;
  }
  const raw = Buffer.concat(chunks);
  // Nome com hash do conteúdo: o service worker pode guardar o sprite para sempre sem servir bytes velhos
  const name = `s${spriteIdx}-${crypto.createHash("sha1").update(raw).digest("hex").slice(0, 8)}.mp3`;
  group.forEach((f) => { map[f][0] = name; });
  const out = path.join(OUT_DIR, name);
  execFileSync("ffmpeg", ["-v", "error", "-f", "s16le", "-ac", "1", "-ar", String(RATE), "-i", "-", "-codec:a", "libmp3lame", "-b:a", "64k", "-y", out], { input: raw, maxBuffer: 1 << 28 });
  spriteIdx++;
}
fs.writeFileSync(path.join(AUDIO_DIR, "sprites.json"), JSON.stringify(map));
const size = fs.readdirSync(OUT_DIR).reduce((n, f) => n + fs.statSync(path.join(OUT_DIR, f)).size, 0);
console.log(`Sprites: ${spriteIdx} · clipes: ${files.length} · ${(size / 1048576).toFixed(1)} MB`);
