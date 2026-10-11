// Verificação automática de contraste (VISUAL_SPEC 2.11): lê o @theme e o .dark de src/index.css, aplica os pares
// de scripts/contrast-pairs.json nos dois temas (fórmula WCAG 2.x) e falha abaixo de 4,5:1 (3:1 quando large: true).
// Pares com "warn": true (exceções declaradas, como o CTA claro) só avisam. "themes": ["dark"] restringe o par a um tema.
// Uso: node scripts/contrast-check.mjs [--json]   (também em npm run check)
import fs from "node:fs";
import path from "node:path";

const here = path.dirname(new URL(import.meta.url).pathname);
const css = fs.readFileSync(path.join(here, "..", "src", "index.css"), "utf8");
const pairs = JSON.parse(fs.readFileSync(path.join(here, "contrast-pairs.json"), "utf8"));

// Extrai o conteúdo de um bloco { ... } a partir de um cabeçalho (com chaves aninhadas, ex.: @keyframes dentro do @theme)
function block(src, header) {
  const i = src.indexOf(header);
  if (i < 0) throw new Error(`bloco não encontrado: ${header}`);
  let j = src.indexOf("{", i), depth = 0, k = j;
  for (; k < src.length; k++) {
    if (src[k] === "{") depth++;
    else if (src[k] === "}") { depth--; if (depth === 0) break; }
  }
  return src.slice(j + 1, k);
}
function vars(src) {
  const out = {};
  for (const m of src.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)) out[m[1]] = m[2].trim();
  return out;
}
const light = vars(block(css, "@theme"));
const dark = { ...light, ...vars(block(css, "\n.dark")) };

// Resolve var() recursivamente (com fallback) até chegar a uma cor literal
function resolve(theme, value, depth = 0) {
  if (depth > 12) return value;
  const m = /^var\((--[a-z0-9-]+)(?:\s*,\s*(.+))?\)$/.exec(value.trim());
  if (!m) return value.trim();
  const v = theme[m[1]];
  if (v != null) return resolve(theme, v, depth + 1);
  return m[2] ? resolve(theme, m[2], depth + 1) : value;
}
function rgb(hex) {
  const h = hex.replace("#", "");
  const f = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return [0, 2, 4].map((i) => parseInt(f.slice(i, i + 2), 16) / 255);
}
function lum(hex) {
  const [r, g, b] = rgb(hex).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export function contrast(a, b) {
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}
const color = (theme, name) => {
  const v = resolve(theme, theme[`--color-${name}`] || name);
  if (!/^#[0-9a-f]{3,6}$/i.test(v)) throw new Error(`token sem cor literal: ${name} -> ${v}`);
  return v.toLowerCase();
};

const rows = [];
let fails = 0, warns = 0;
for (const p of pairs) {
  for (const t of p.themes || ["light", "dark"]) {
    const theme = t === "dark" ? dark : light;
    const fg = color(theme, p.fg), bg = color(theme, p.bg);
    const ratio = contrast(fg, bg);
    const min = p.min != null ? p.min : p.large ? 3 : 4.5;
    const ok = ratio >= min;
    if (!ok) { if (p.warn) warns++; else fails++; }
    rows.push({ theme: t, fg: p.fg, bg: p.bg, fgHex: fg, bgHex: bg, ratio: Math.round(ratio * 100) / 100, min, ok, warn: !!p.warn, note: p.note || "" });
  }
}

if (process.argv.includes("--json")) {
  console.log(JSON.stringify({ rows, fails, warns }, null, 1));
} else {
  for (const r of rows) {
    const mark = r.ok ? "ok  " : r.warn ? "warn" : "FAIL";
    console.log(`${mark} ${r.theme.padEnd(5)} ${r.fg.padEnd(16)} sobre ${r.bg.padEnd(16)} ${String(r.ratio.toFixed(2)).padStart(6)}:1 (mín. ${r.min})${r.note ? "  " + r.note : ""}`);
  }
  console.log(`\n${rows.length} pares · ${fails} falhas · ${warns} exceções declaradas`);
}
if (fails) { console.error("CONTRASTE: falhou"); process.exit(1); }
console.log("CONTRASTE OK");
