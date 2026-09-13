// Empacota os clipes de audio/ em poucos "sprites" MP3 com mapa de offsets.
// Uso: node tools/build-sprites.mjs   (requer ffmpeg no PATH)
// Sai: audio/sprites/s<N>.mp3 e audio/sprites.json { "<arquivo>.mp3": ["s0.mp3", inicio, duracao] }
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const AUDIO_DIR = path.join(ROOT, "audio");
const OUT_DIR = path.join(AUDIO_DIR, "sprites");
const RATE = 44100; // s16le mono
const GAP = Math.round(0.12 * RATE) * 2; // 120 ms de silêncio entre clipes (bytes)
const PER_SPRITE = 64; // clipes por sprite

const manifest = JSON.parse(fs.readFileSync(path.join(AUDIO_DIR, "manifest.json"), "utf8"));
const files = [...new Set(Object.values(manifest).flatMap((e) => Object.values(e)))].sort();
fs.rmSync(OUT_DIR, { recursive: true, force: true });
fs.mkdirSync(OUT_DIR, { recursive: true });

const map = {};
let spriteIdx = 0;
for (let i = 0; i < files.length; i += PER_SPRITE) {
  const group = files.slice(i, i + PER_SPRITE);
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
  const out = path.join(OUT_DIR, `s${spriteIdx}.mp3`);
  execFileSync("ffmpeg", ["-v", "error", "-f", "s16le", "-ac", "1", "-ar", String(RATE), "-i", "-", "-codec:a", "libmp3lame", "-b:a", "64k", "-y", out], { input: raw, maxBuffer: 1 << 28 });
  spriteIdx++;
}
fs.writeFileSync(path.join(AUDIO_DIR, "sprites.json"), JSON.stringify(map));
const size = fs.readdirSync(OUT_DIR).reduce((n, f) => n + fs.statSync(path.join(OUT_DIR, f)).size, 0);
console.log(`Sprites: ${spriteIdx} · clipes: ${files.length} · ${(size / 1048576).toFixed(1)} MB`);
