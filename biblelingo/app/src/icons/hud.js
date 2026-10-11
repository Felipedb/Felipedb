// Ícones do HUD e do cabeçalho da lição (VISUAL_SPEC 4.2): chama, raio, coração, infinito, gema.
// Cada ícone é um mapa de partes na grade 24x24; `hl` marca o brilho (some no modo mono),
// `knockout` marca recortes que no modo mono viram a cor da página.
const FLAME_BODY = "M12 2.5c.6 3.2 2.7 4.8 4.3 7 1.2 1.7 1.7 3 1.7 4.6A6 6 0 0 1 6 14c0-2.3 1-4 2.6-5.4.3 1.4 1 2.4 2.1 3C10.3 8.8 10.8 5.5 12 2.5z";
const FLAME_SIDE = "M12 2.5c.6 3.2 2.7 4.8 4.3 7 1.2 1.7 1.7 3 1.7 4.6A6 6 0 0 1 12 20z";
const FLAME_CORE = "M12.2 11c.6 1.6 2.4 2.6 2.4 4.6a2.8 2.8 0 0 1-5.6 0c0-1.2.5-2.1 1.3-2.9.3.6.7 1 1.2 1.3-.1-1.1.2-2.1.7-3z";
const HEART = "M12 20.5s-7.6-4.5-9.4-9.2C1.3 7.9 3.4 4.5 7 4.5c2 0 3.7 1.1 5 2.9 1.3-1.8 3-2.9 5-2.9 3.6 0 5.7 3.4 4.4 6.8-1.8 4.7-9.4 9.2-9.4 9.2z";
const HEART_SHADE = "M3.3 12.5c2.4 3.6 6.1 6.3 8.7 7.9 2.6-1.6 6.3-4.3 8.7-7.9-1.8 4.3-8.7 8-8.7 8s-6.9-3.7-8.7-8z";

export const HUD_ICONS = {
  flame: {
    parts: [
      { d: FLAME_BODY, fill: "#ff9600" },
      { d: FLAME_SIDE, fill: "#e68a00", opacity: 0.55 },
      { d: FLAME_CORE, fill: "#ffc800" },
      { el: "circle", cx: 9.4, cy: 11.4, r: 0.9, fill: "#ffffff", opacity: 0.6, hl: true },
    ],
  },
  "flame-off": {
    parts: [
      { d: FLAME_BODY, fill: "var(--color-disabled)" },
      { d: FLAME_SIDE, fill: "var(--color-icon-dim)", opacity: 0.35 },
      { d: FLAME_CORE, fill: "var(--color-line)" },
    ],
  },
  bolt: {
    parts: [
      { d: "M13.5 2 5 13.5h6.3L10 22l9-11.5h-6.3z", fill: "#ffc800" },
      { d: "M12.5 10.5H19L10 22l1.7-7.5.8-4z", fill: "#e5a600", opacity: 0.9 },
      { el: "ellipse", cx: 10.6, cy: 8.6, rx: 0.8, ry: 1.6, fill: "#ffffff", opacity: 0.55, hl: true, transform: "rotate(30 10.6 8.6)" },
    ],
  },
  heart: {
    parts: [
      { d: HEART, fill: "#ff4b4b" },
      { d: HEART_SHADE, fill: "#d33131" },
      { el: "ellipse", cx: 7.6, cy: 8, rx: 1.6, ry: 1, fill: "#ff8a8a", opacity: 0.9, hl: true, transform: "rotate(-30 7.6 8)" },
    ],
  },
  "heart-empty": {
    parts: [{ d: HEART, fill: "var(--color-heart-empty)" }],
  },
  // Duas metades em <g> separados (.half-l / .half-r) para a animação de quebra (x ±6, rotate ±8)
  "heart-broken": {
    parts: [
      { el: "g", className: "half-l", parts: [
        { d: "M12 7.4C10.7 5.6 9 4.5 7 4.5 3.4 4.5 1.3 7.9 2.6 11.3 4.4 16 12 20.5 12 20.5l1-4.9-2.2-2.4 2.4-2.4z", fill: "#ff4b4b" },
        { d: "M3.3 12.5c2.4 3.6 6.1 6.3 8.7 7.9l-.6-2.9c-3-1.6-5.9-3.8-8.1-5z", fill: "#d33131" },
        { el: "ellipse", cx: 7.6, cy: 8, rx: 1.6, ry: 1, fill: "#ff8a8a", opacity: 0.9, hl: true, transform: "rotate(-30 7.6 8)" },
      ] },
      { el: "g", className: "half-r", parts: [
        { d: "M12 7.4c1.3-1.8 3-2.9 5-2.9 3.6 0 5.7 3.4 4.4 6.8C19.6 16 12 20.5 12 20.5l1-4.9-2.2-2.4 2.4-2.4z", fill: "#ff4b4b" },
        { d: "M20.7 12.5c-2.4 3.6-6.1 6.3-8.7 7.9l.6-2.9c3-1.6 5.9-3.8 8.1-5z", fill: "#d33131" },
      ] },
    ],
  },
  infinity: {
    parts: [
      { d: "M12 13.2c-1.5-2.5-3-4-5-4a4 4 0 0 0 0 8c2 0 3.5-1.5 5-4 1.5-2.5 3-4 5-4a4 4 0 0 1 0 8c-2 0-3.5-1.5-5-4z", fill: "none", stroke: "#1899d6", strokeWidth: 3, strokeLinecap: "round" },
      { d: "M12 12c-1.5-2.5-3-4-5-4a4 4 0 0 0 0 8c2 0 3.5-1.5 5-4 1.5-2.5 3-4 5-4a4 4 0 0 1 0 8c-2 0-3.5-1.5-5-4z", fill: "none", stroke: "#1cb0f6", strokeWidth: 3, strokeLinecap: "round" },
    ],
  },
  gem: {
    parts: [
      { d: "M7.5 3h9l4.5 6-9 12L3 9z", fill: "#1cb0f6" },
      { d: "M12 21l9-12h-6z", fill: "#1899d6" },
      { d: "M7.5 3h9l4.5 6H3z", fill: "#84d8ff", opacity: 0.55 },
      { d: "M7.5 3 3 9h4.5z", fill: "#ffffff", opacity: 0.35, hl: true },
    ],
  },
};
