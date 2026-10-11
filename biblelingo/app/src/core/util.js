// Utilidades puras portadas do app clássico (app.js) — mesma semântica, sem DOM.

export const MAX_HEARTS = 5;
export const XP_PER_LESSON = 10;
export const XP_PERFECT_BONUS = 5;

// Contrações escritas sem apóstrofo, aceitas como a forma com apóstrofo (normalize)
const NO_APOS = { dont: "do not", cant: "cannot", wont: "will not", isnt: "is not", arent: "are not", didnt: "did not", doesnt: "does not", wasnt: "was not", werent: "were not", hasnt: "has not", havent: "have not", im: "i am", lets: "let us", youre: "you are", theyre: "they are", ive: "i have", youve: "you have", thats: "that is", whats: "what is", heres: "here is", theres: "there is" };

export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Chave de dia no fuso local (AAAA-MM-DD)
export function dateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function today() {
  return dateKey(new Date());
}
export function daysBetween(a, b) {
  return Math.round((new Date(b) - new Date(a)) / 86400000);
}

// Contrações expandidas dos dois lados ("don't" = "do not"), para aceitar as duas formas
export function normalize(s, loose) {
  let t = String(s).toLowerCase().replace(/[\u2018\u2019]/g, "'").replace(/-/g, " ").replace(/\bcan not\b/g, "cannot");
  if (loose) t = t.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  t = t.replace(/\b([a-z]+)\b/g, (w) => NO_APOS[w] || w);
  if (t.includes("'")) {
    t = t.replace(/\bi'm\b/g, "i am").replace(/\bcan't\b/g, "cannot").replace(/\bwon't\b/g, "will not").replace(/\blet's\b/g, "let us")
      .replace(/\b(\w+)n't\b/g, "$1 not").replace(/\b(\w+)'re\b/g, "$1 are").replace(/\b(it|he|she|that|there|what|who)'s\b/g, "$1 is")
      .replace(/\b(\w+)'ll\b/g, "$1 will").replace(/\b(\w+)'ve\b/g, "$1 have").replace(/\b(\w+)'d\b/g, "$1 would");
  }
  return t.replace(/[.,;:!?'"]/g, "").replace(/\s+/g, " ").trim();
}

export function editDistance(x, y) {
  const m = x.length, n = y.length;
  if (!m) return n; if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (x[i - 1] === y[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[n];
}

// Troca a lacuna como palavra inteira ("dream" não pega o "dream" de "dreamed")
export function blankRegex(blank) { return new RegExp("\\b" + blank.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b"); }

// Formas aceitas ao digitar uma palavra: sem "to ", sem o parêntese explicativo, cada lado de "a / b"
export function typeAccepts(en) {
  const base = en.replace(/\s*\([^)]*\)/g, "").trim();
  const parts = base.split(/\s*\/\s*/);
  const out = new Set([en, base]);
  parts.forEach((p) => { out.add(p); out.add(p.replace(/^to /, "")); });
  out.add(base.replace(/^to /, ""));
  return [...out].filter(Boolean);
}

export function castHash(key) {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return h;
}

// Acentos viram a letra base: "Noé" -> "noe"
export function audioKey(text) {
  return String(text).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();
}

export const cleanWord = (w) => w.replace(/[.,;:!?"]/g, "").replace(/^'|'$/g, "");
export const wordCount = (s) => s.trim().split(/\s+/).length;

export const PRAISES = ["Excelente!", "Muito bem!", "Incrível!", "Perfeito!", "Isso aí!", "Boa!", "Amém!"];

export const REDUCED_MOTION = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
export function buzz(pattern) {
  if (REDUCED_MOTION) return;
  try { if (navigator.vibrate) navigator.vibrate(pattern); } catch (e) { /* sem vibração */ }
}
