#!/usr/bin/env node
// Ilustrações 3D do app (Microsoft Fluent Emoji 3D, licença MIT, pacote @lobehub/fluent-emoji-3d).
// Varre os emojis usados no conteúdo e no código do app, resolve o arquivo 3D de cada um e grava
// img/fx/<codepoints>.webp (160x160) mais img/fx/index.json { "emoji normalizado": "arquivo.webp" }.
// O componente app/src/components/ui/Illo.jsx lê esse índice; o app não importa o pacote em tempo de execução.
//
// Uso: node tools/fx-assets.mjs            (a partir de biblelingo/)
// Requer: app/node_modules/@lobehub/fluent-emoji-3d (npm i na pasta app) e python3 com Pillow.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = path.resolve(import.meta.dirname, "..");
const PKG = path.join(ROOT, "app", "node_modules", "@lobehub", "fluent-emoji-3d", "assets");
const OUT = path.join(ROOT, "img", "fx");
const SIZE = 160;

if (!fs.existsSync(PKG)) {
  console.error("Pacote não encontrado em " + PKG + ". Rode: cd app && npm i");
  process.exit(1);
}

// Ícones de interface sempre presentes (HUD, missões, conquistas, cerimônias)
const FIXED = "🔥 💎 ⚡ ❤️ 👑 ⭐ 🏆 🎯 📖 📜 🕊️ ✨ 🎁 🔒 🎉 🙏 ⛪ 🌅 🧭 🗝️ 🪙 💰 📅 ⏱️ 🎧 🎤 🧩 ✅ ❌ 🐢 🌍 📚 🗺️ 🏅 🥇 💪 🎓 💡 👋 😊 🚀 🌟 ⏰ 📈 🔔 🛡️ 👥 👤 🏠 🎵 💬 🔊 📝 🧠 🌱 ⛰️ 🌊 🌈 🦁 🐑 🍞 🍇 🕯️ 🪔 ⚓ 🚢 🌳 🍎 🐍 ✝️ 💧 🌙 ☀️ 🏛️ 🧱 🎺 🗡️ 🐟 👣".split(/\s+/).filter(Boolean);

// Arquivos varridos
function walk(dir, exts, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const name of fs.readdirSync(dir)) {
    if (name === "node_modules" || name === "dist" || name.startsWith(".")) continue;
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, exts, acc);
    else if (exts.includes(path.extname(name))) acc.push(p);
  }
  return acc;
}
const sources = [
  ...["data.js", "scenes.js", "scenes2.js", "stories.js", "icons.js", "characters.js"].map((f) => path.join(ROOT, f)),
  ...walk(path.join(ROOT, "content"), [".json"]),
  path.join(ROOT, "tools", "content", "icons.json"),
  ...walk(path.join(ROOT, "app", "src"), [".js", ".jsx"]),
].filter((f) => fs.existsSync(f));

// Sequência de emoji: bandeiras, keycaps e pictográficos com seletor, tom de pele e ZWJ
const RE = /\p{RI}\p{RI}|[#*0-9]️?⃣|\p{Extended_Pictographic}[︎️]?\p{EMod}?(?:‍\p{Extended_Pictographic}[︎️]?\p{EMod}?)*/gu;
// Símbolos de texto que aparecem em prosa e não são ilustração (sem o seletor FE0F explícito)
const TEXTY = new Set(["©", "®", "™", "‼", "⁉", "↔", "↕", "↖", "↗", "↘", "↙", "↩", "↪", "▪", "▫", "▶", "◀", "◻", "◼", "◽", "◾", "☑", "✔", "✖", "〰", "〽", "㊗", "㊙", "Ⓜ", "ℹ", "⌨", "⏏", "⏭", "⏮", "⏯", "⏸", "⏹", "⏺", "▸", "✓"]);

// Normalização usada também por Illo.jsx: sem seletores de variação e sem tom de pele
const normalize = (s) => s.replace(/[︎️]/g, "").replace(/\p{EMod}/gu, "");

const found = new Map(); // emoji normalizado -> forma original
for (const e of FIXED) found.set(normalize(e), e);
for (const f of sources) {
  const txt = fs.readFileSync(f, "utf8");
  for (const m of txt.matchAll(RE)) {
    const e = m[0];
    if (TEXTY.has(e)) continue;
    const n = normalize(e);
    if (!n) continue;
    if (!found.has(n)) found.set(n, e);
  }
}

const files = new Set(fs.readdirSync(PKG).filter((f) => f.endsWith(".webp")));
const cps = (s) => [...s].map((c) => c.codePointAt(0).toString(16));

// Tenta: forma normalizada, com fe0f após cada pictográfico de apresentação texto, e por fim com tom de pele médio
function resolve(n) {
  const base = cps(n);
  const tries = [];
  tries.push(base.join("-"));
  // fe0f depois de cada elemento (exceto ZWJ e keycap)
  const withFe = [];
  for (let i = 0; i < base.length; i++) {
    withFe.push(base[i]);
    if (base[i] !== "200d" && base[i] !== "20e3" && base[i + 1] !== "20e3") withFe.push("fe0f");
  }
  tries.push(withFe.join("-"));
  // fe0f só no último elemento, só no primeiro
  tries.push([...base, "fe0f"].join("-"));
  if (base.length > 1) tries.push([base[0], "fe0f", ...base.slice(1)].join("-"));
  // keycap: 0023-fe0f-20e3
  if (base[base.length - 1] === "20e3") tries.push(base.map((c) => (c.length < 4 ? c.padStart(4, "0") : c)).join("-").replace(/-20e3$/, "-fe0f-20e3"));
  // Sem variante padrão (ex.: 🙏 só existe com tom de pele): usa o tom médio 1f3fd depois do primeiro elemento
  for (const t of [...tries]) {
    const parts = t.split("-");
    tries.push([parts[0], "1f3fd", ...parts.slice(1)].join("-"));
  }
  // Variantes com sufixo -fe0f no fim de sequências ZWJ (ex.: 1f9d4-200d-2642-fe0f)
  for (const t of [...tries]) tries.push(t + "-fe0f");
  for (const t of tries) if (files.has(t + ".webp")) return t + ".webp";
  return null;
}

fs.mkdirSync(OUT, { recursive: true });
const index = {};
const missing = [];
const jobs = [];
for (const [n, orig] of [...found.entries()].sort()) {
  const file = resolve(n);
  if (!file) { missing.push(orig); continue; }
  index[n] = file;
  jobs.push([path.join(PKG, file), path.join(OUT, file)]);
}

// Redimensiona em lote com Pillow (somente os que mudaram ou faltam)
const todo = jobs.filter(([src, dst]) => !fs.existsSync(dst) || fs.statSync(dst).mtimeMs < fs.statSync(src).mtimeMs);
if (todo.length) {
  const py = `
import sys, json
from PIL import Image
for src, dst in json.loads(sys.stdin.read()):
    im = Image.open(src).convert("RGBA")
    im = im.resize((${SIZE}, ${SIZE}), Image.LANCZOS)
    im.save(dst, "WEBP", quality=88, method=6)
`;
  execFileSync("python3", ["-I", "-c", py], { input: JSON.stringify(todo), stdio: ["pipe", "inherit", "inherit"] });
}
// Remove arquivos que não estão mais no índice
const keep = new Set(Object.values(index));
for (const f of fs.readdirSync(OUT)) if (f.endsWith(".webp") && !keep.has(f)) fs.unlinkSync(path.join(OUT, f));

const sorted = Object.fromEntries(Object.entries(index).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
fs.writeFileSync(path.join(OUT, "index.json"), JSON.stringify(sorted, null, 0).replace(/,"/g, ',\n"') + "\n");

const bytes = [...keep].reduce((s, f) => s + fs.statSync(path.join(OUT, f)).size, 0);
console.log(`fontes varridas: ${sources.length}`);
console.log(`emojis encontrados: ${found.size} · resolvidos: ${Object.keys(index).length} (${todo.length} gravados agora, ${(bytes / 1024).toFixed(0)} KB) · ausentes: ${missing.length}`);
if (missing.length) console.log("ausentes: " + missing.map((e) => `${e} (${cps(e).join("-")})`).join(" "));
