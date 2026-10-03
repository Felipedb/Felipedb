// Paleta dos capítulos (VISUAL_SPEC 2.3), resolvida no app por u.id.
// data.js mantém o campo `color` só para o app clássico; nenhum capítulo é amarelo (amarelo é recompensa).
export const FAMILIES = {
  green:  { base: "#58cc02", shadow: "#46a302", soft: "#d7ffb8", softDark: "#1d3a17", text: "#3f7d12", textDark: "#93d333", ink: "#ffffff" },
  blue:   { base: "#1cb0f6", shadow: "#1899d6", soft: "#ddf4ff", softDark: "#14313f", text: "#0f6f9f", textDark: "#49c0f8", ink: "#ffffff" },
  orange: { base: "#ff9600", shadow: "#e68a00", soft: "#ffe0b3", softDark: "#3a2a10", text: "#8a4f00", textDark: "#ff9600", ink: "#ffffff" },
  purple: { base: "#ce82ff", shadow: "#a560e8", soft: "#f3e0ff", softDark: "#2c2140", text: "#7b3fd1", textDark: "#c4a8ef", ink: "#ffffff" },
  teal:   { base: "#2bb5a3", shadow: "#1f8f80", soft: "#d6f5f0", softDark: "#143431", text: "#14665b", textDark: "#5fd3c2", ink: "#ffffff" },
  pink:   { base: "#ff86d0", shadow: "#e86cb7", soft: "#ffe3f3", softDark: "#3b1f31", text: "#b8307f", textDark: "#ff86d0", ink: "#ffffff" },
  red:    { base: "#ff4b4b", shadow: "#d33131", soft: "#ffdfe0", softDark: "#40191c", text: "#b32a2a", textDark: "#ff7b7b", ink: "#ffffff" },
  royal:  { base: "#2f7bf6", shadow: "#1f5fd0", soft: "#dbe8ff", softDark: "#16264a", text: "#215fcf", textDark: "#6fa5ff", ink: "#ffffff" },
};

// u1 a u8 nesta ordem; capítulos futuros (u9+) repetem o ciclo a partir de u1
const CYCLE = ["green", "blue", "orange", "purple", "teal", "pink", "red", "royal"];

// Motivo da medalha de cada família (ícones de app/src/icons)
export const MEDAL_MOTIF = {
  green: "open-book-leaf", blue: "ark", orange: "bush", purple: "harp",
  teal: "scroll", pink: "wheat", red: "lion", royal: "fish-net",
};

export function unitFamily(unitId) {
  const n = parseInt(String(unitId).replace(/\D/g, ""), 10) || 1;
  return CYCLE[(n - 1) % CYCLE.length];
}

export function unitPalette(unitId) { return FAMILIES[unitFamily(unitId)]; }

export function unitMotif(unitId) { return MEDAL_MOTIF[unitFamily(unitId)]; }

// Variáveis injetadas no <section> do capítulo (Home.jsx) e em qualquer bloco "do capítulo":
// <section style={unitVars(u.id, isDark)}> libera bg-unit, text-unit-text, border-unit, shadow-node.
export function unitVars(unitId, dark) {
  const p = unitPalette(unitId);
  return {
    "--unit-color": p.base,
    "--unit-shadow": p.shadow,
    "--unit-soft": dark ? p.softDark : p.soft,
    "--unit-text": dark ? p.textDark : p.text,
    "--unit-ink": p.ink,
  };
}

// Tema atual lido do <html> (o App aplica a classe .dark)
export function isDarkTheme() {
  return typeof document !== "undefined" && document.documentElement.classList.contains("dark");
}

// Degradê dos divisores de seção (5.6): Antigo Testamento em verde, Novo Testamento em azul-real
export const SECTION_GRADIENT = {
  "Antigo Testamento": "linear-gradient(160deg, #58cc02, #3f7d12)",
  "Novo Testamento": "linear-gradient(160deg, #2f7bf6, #1f5fd0)",
};
