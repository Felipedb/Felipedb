// Recompensas e estados (VISUAL_SPEC 4.2): baú, troféu, coroa, estrela, cadeado, check/X circulares,
// brilho, lâmpada, alvo, escudos de conquista e moldura de medalha. Amarelo #ffc800 é só recompensa.

// Baú em partes nomeadas (.chest-lid, .chest-body, .chest-lock) para o componente Chest animar.
export function chestParts({ open = false, locked = false } = {}) {
  const wood = locked ? "#afafaf" : "#b8743b";
  const woodDark = locked ? "#777777" : "#8a5126";
  const lid = locked ? "#c4c4c4" : "#c9843f";
  const band = locked ? "#e5e5e5" : "#ffc800";
  const bandDark = locked ? "#afafaf" : "#e5a600";
  const lock = locked ? "#777777" : "#ffc800";
  const body = [
    { el: "rect", x: 3, y: 10.5, width: 18, height: 10.5, rx: 2, fill: wood },
    { d: "M3 17.5h18V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", fill: woodDark },
    { el: "rect", x: 6.5, y: 10.5, width: 2.4, height: 10.5, fill: band },
    { el: "rect", x: 15.1, y: 10.5, width: 2.4, height: 10.5, fill: band },
    { el: "rect", x: 8.1, y: 10.5, width: 0.8, height: 10.5, fill: bandDark },
    { el: "rect", x: 16.7, y: 10.5, width: 0.8, height: 10.5, fill: bandDark },
  ];
  const lidClosed = {
    el: "g", className: "chest-lid", parts: [
      { d: "M3 10.5V9a4.5 4.5 0 0 1 4.5-4.5h9A4.5 4.5 0 0 1 21 9v1.5z", fill: lid },
      { el: "rect", x: 6.5, y: 4.6, width: 2.4, height: 5.9, fill: band },
      { el: "rect", x: 15.1, y: 4.6, width: 2.4, height: 5.9, fill: band },
      { el: "rect", x: 8.1, y: 4.8, width: 0.8, height: 5.7, fill: bandDark },
      { el: "rect", x: 16.7, y: 4.8, width: 0.8, height: 5.7, fill: bandDark },
      { d: "M4.6 8.6a3.2 3.2 0 0 1 2.4-2.8", fill: "none", stroke: "#ffffff", strokeWidth: 1.2, strokeLinecap: "round", opacity: 0.4, hl: true },
    ],
  };
  const lidOpen = {
    el: "g", className: "chest-lid", parts: [
      { d: "M4 9.5 5.6 3.9a1.5 1.5 0 0 1 1.4-1.1h10a1.5 1.5 0 0 1 1.4 1.1L20 9.5z", fill: lid },
      { d: "M5.6 9.5 6.9 4.3h10.2l1.3 5.2z", fill: woodDark, opacity: 0.5 },
      { el: "rect", x: 6.8, y: 2.8, width: 2.4, height: 6.7, fill: band, opacity: 0.85 },
      { el: "rect", x: 14.8, y: 2.8, width: 2.4, height: 6.7, fill: band, opacity: 0.85 },
    ],
  };
  const lockClosed = {
    el: "g", className: "chest-lock", parts: [
      { el: "rect", x: 10.3, y: 9, width: 3.4, height: 4.4, rx: 1, fill: lock },
      { el: "circle", cx: 12, cy: 10.8, r: 0.7, fill: woodDark },
    ],
  };
  const lockOpen = {
    el: "g", className: "chest-lock", parts: [
      { el: "rect", x: 10.3, y: 10.5, width: 3.4, height: 3.6, rx: 1, fill: lock },
    ],
  };
  const sparkles = open && !locked ? [
    { d: "M12 .5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z", fill: "#ffe066", hl: true },
    { d: "M20.5 1.5l.5 1.2 1.2.5-1.2.5-.5 1.2-.5-1.2-1.2-.5 1.2-.5z", fill: "#ffe066", hl: true },
  ] : [];
  return [...body, open ? lidOpen : lidClosed, open ? lockOpen : lockClosed, ...sparkles];
}

const STAR = "M12 2.5l2.9 6.2 6.8.8-5 4.6 1.4 6.7L12 17.4l-6.1 3.4 1.4-6.7-5-4.6 6.8-.8z";
const SHIELD = "M12 2l8 3v6c0 5-3.4 9.2-8 11-4.6-1.8-8-6-8-11V5z";
const SHIELD_COLORS = ["#58cc02", "#ff9600", "#ffc800", "#1cb0f6", "#ce82ff", "#2bb5a3"];

function shield(color) {
  return {
    parts: [
      { d: SHIELD, fill: color },
      { d: "M12 2l8 3v6c0 5-3.4 9.2-8 11z", fill: "#000000", opacity: 0.12 },
      { d: "M4.6 14.5c1.1 3.6 3.9 6.4 7.4 7.5 3.5-1.1 6.3-3.9 7.4-7.5z", fill: "#000000", opacity: 0.25 },
      { d: "M12 2 4 5v6c0 .7.1 1.4.2 2L12 2z", fill: "#ffffff", opacity: 0.25, hl: true },
    ],
  };
}

export const REWARD_ICONS = {
  chest: { parts: chestParts() },
  "chest-open": { parts: chestParts({ open: true }) },
  "chest-locked": { parts: chestParts({ locked: true }) },
  "quest-chest": { parts: chestParts() },
  trophy: {
    parts: [
      { d: "M6.5 5H4.2v2.3A3.2 3.2 0 0 0 7.4 10.5M17.5 5h2.3v2.3a3.2 3.2 0 0 1-3.2 3.2", fill: "none", stroke: "#e5a600", strokeWidth: 1.8, strokeLinecap: "round" },
      { d: "M6.5 3h11v6.5a5.5 5.5 0 0 1-11 0z", fill: "#ffc800" },
      { d: "M12 3h5.5v6.5A5.5 5.5 0 0 1 12 15z", fill: "#e5a600", opacity: 0.5 },
      { el: "rect", x: 10.6, y: 14.6, width: 2.8, height: 3, fill: "#e5a600" },
      { d: "M7.5 17.5h9a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1v-1.5a1 1 0 0 1 1-1z", fill: "#8a6200" },
      { el: "ellipse", cx: 9, cy: 6.2, rx: 0.9, ry: 1.8, fill: "#ffffff", opacity: 0.5, hl: true },
    ],
  },
  crown: {
    parts: [
      { d: "M3.5 18.5 2.2 7.6l5.3 3.9L12 4.2l4.5 7.3 5.3-3.9-1.3 10.9z", fill: "#ffc800" },
      { d: "M12 4.2l4.5 7.3 5.3-3.9-1.3 10.9H12z", fill: "#e5a600", opacity: 0.35 },
      { d: "M3.5 18.5h17V20a1.2 1.2 0 0 1-1.2 1.2H4.7A1.2 1.2 0 0 1 3.5 20z", fill: "#e5a600" },
      { el: "circle", cx: 12, cy: 13.4, r: 1.7, fill: "#ff4b4b" },
      { el: "circle", cx: 7.3, cy: 14.6, r: 1.2, fill: "#1cb0f6" },
      { el: "circle", cx: 16.7, cy: 14.6, r: 1.2, fill: "#1cb0f6" },
      { el: "circle", cx: 6.2, cy: 10.6, r: 0.7, fill: "#ffffff", opacity: 0.6, hl: true },
    ],
  },
  star: {
    parts: [
      { d: STAR, fill: "#ffc800", stroke: "#e5a600", strokeWidth: 1.6, strokeLinejoin: "round" },
      { d: "M12 2.5l2.9 6.2 6.8.8-5 4.6 1.4 6.7L12 17.4z", fill: "#e5a600", opacity: 0.3 },
      { el: "circle", cx: 9.4, cy: 8.8, r: 0.8, fill: "#ffffff", opacity: 0.6, hl: true },
    ],
  },
  "star-empty": {
    parts: [{ d: STAR, fill: "var(--color-line)" }],
  },
  sparkle: {
    parts: [
      { d: "M12 2.5l2 6.6 6.5 2.9-6.5 2.9-2 6.6-2-6.6L3.5 12l6.5-2.9z", fill: "#ce82ff" },
      { d: "M12 2.5l2 6.6 6.5 2.9-6.5 2.9-2 6.6z", fill: "#a560e8", opacity: 0.35 },
      { d: "M18.5 2.5l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z", fill: "#e3bcff" },
      { d: "M5 17l.6 1.4 1.4.6-1.4.6L5 21l-.6-1.4-1.4-.6 1.4-.6z", fill: "#e3bcff", hl: true },
    ],
  },
  lock: {
    parts: [
      { d: "M8 10V7.5a4 4 0 0 1 8 0V10", fill: "none", stroke: "var(--color-icon-dim)", strokeWidth: 2.6, strokeLinecap: "round" },
      { el: "rect", x: 5, y: 10, width: 14, height: 11, rx: 2.5, fill: "var(--color-disabled)" },
      { d: "M5 18h14v.5a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 5 18.5z", fill: "var(--color-icon-dim)", opacity: 0.45 },
      { el: "circle", cx: 12, cy: 14.5, r: 1.6, fill: "var(--color-icon-dim)" },
      { el: "rect", x: 11.2, y: 15, width: 1.6, height: 3, rx: 0.8, fill: "var(--color-icon-dim)" },
    ],
  },
  "check-circle": {
    parts: [
      { el: "circle", cx: 12, cy: 12, r: 11, fill: "var(--color-ok-icon)" },
      { d: "M7 12.5l3.4 3.4L17 9.3", fill: "none", stroke: "var(--color-primary-text)", strokeWidth: 3, strokeLinecap: "round", strokeLinejoin: "round", knockout: true },
    ],
  },
  "close-circle": {
    parts: [
      { el: "circle", cx: 12, cy: 12, r: 11, fill: "var(--color-bad-icon)" },
      { d: "M8 8l8 8M16 8l-8 8", fill: "none", stroke: "var(--color-danger-text)", strokeWidth: 3, strokeLinecap: "round", knockout: true },
    ],
  },
  refresh: {
    parts: [
      { el: "circle", cx: 12, cy: 12, r: 11, fill: "#ff9600" },
      { d: "M12 1a11 11 0 0 1 0 22z", fill: "#e68a00", opacity: 0.35 },
      { d: "M8 12a4 4 0 0 1 7-2.6M16 12a4 4 0 0 1-7 2.6", fill: "none", stroke: "#ffffff", strokeWidth: 2.2, strokeLinecap: "round", knockout: true },
      { d: "M15 6.3v3.1h-3.1M9 17.7v-3.1h3.1", fill: "none", stroke: "#ffffff", strokeWidth: 2.2, strokeLinecap: "round", strokeLinejoin: "round", knockout: true },
    ],
  },
  lightbulb: {
    parts: [
      { d: "M3.5 9.5H2M22 9.5h-1.5M5.2 3.7l-1-1M18.8 3.7l1-1", fill: "none", stroke: "#ffe066", strokeWidth: 1.6, strokeLinecap: "round", hl: true },
      { el: "circle", cx: 12, cy: 9.5, r: 6, fill: "#ffc800" },
      { d: "M12 3.5a6 6 0 0 1 0 12z", fill: "#e5a600", opacity: 0.35 },
      { d: "M9.5 15.5h5v2.5a1.5 1.5 0 0 1-1.5 1.5h-2A1.5 1.5 0 0 1 9.5 18z", fill: "#e5a600" },
      { el: "rect", x: 10, y: 20, width: 4, height: 1.6, rx: 0.8, fill: "#8a6200" },
      { el: "circle", cx: 9.8, cy: 7.6, r: 1.2, fill: "#ffffff", opacity: 0.6, hl: true },
    ],
  },
  target: {
    parts: [
      { el: "circle", cx: 12, cy: 12, r: 11, fill: "#ff4b4b" },
      { el: "circle", cx: 12, cy: 12, r: 7.6, fill: "#ffffff", knockout: true },
      { el: "circle", cx: 12, cy: 12, r: 4.2, fill: "#ff4b4b" },
      { el: "circle", cx: 12, cy: 12, r: 1.3, fill: "#ffffff", knockout: true },
    ],
  },
  // Moldura hexagonal; o componente Medal dá a cor (currentColor) e desenha o motivo por cima
  medal: {
    parts: [
      { d: "M12 1.5l9.1 5.25v10.5L12 22.5l-9.1-5.25V6.75z", fill: "currentColor" },
      { d: "M12 1.5l9.1 5.25v10.5L12 22.5z", fill: "#000000", opacity: 0.12 },
    ],
  },
  "shield-1": shield(SHIELD_COLORS[0]),
  "shield-2": shield(SHIELD_COLORS[1]),
  "shield-3": shield(SHIELD_COLORS[2]),
  "shield-4": shield(SHIELD_COLORS[3]),
  "shield-5": shield(SHIELD_COLORS[4]),
  "shield-6": shield(SHIELD_COLORS[5]),
};

export { SHIELD_COLORS };
