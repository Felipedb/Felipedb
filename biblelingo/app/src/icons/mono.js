// Ícones mono (VISUAL_SPEC 4.1): currentColor, traço 3 px, para navegação e ações.
const stroke = (d, w = 3) => ({ d, fill: "none", stroke: "currentColor", strokeWidth: w, strokeLinecap: "round", strokeLinejoin: "round" });
const fill = (d) => ({ d, fill: "currentColor" });

export const MONO_ICONS = {
  close: { parts: [stroke("M6 6l12 12M18 6 6 18")] },
  check: { parts: [stroke("M5 12.5l5 5L19 7")] },
  "arrow-left": { parts: [stroke("M19 12H5m6-7-7 7 7 7")] },
  "arrow-right": { parts: [stroke("M5 12h14m-6-7 7 7-7 7")] },
  "arrow-up": { parts: [stroke("M12 19V5m-7 6 7-7 7 7")] },
  "chevron-right": { parts: [stroke("M9 5l7 7-7 7")] },
  "chevron-down": { parts: [stroke("M5 9l7 7 7-7")] },
  flag: { parts: [stroke("M6 21V4m0 0h11l-3 4 3 4H6", 2.6)] },
  share: { parts: [stroke("M12 3v12m-5-7 5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6", 2.6)] },
  keyboard: {
    parts: [
      { el: "rect", x: 2.5, y: 6.5, width: 19, height: 11, rx: 2.5, fill: "none", stroke: "currentColor", strokeWidth: 2.4 },
      stroke("M6.5 10.5h.01M10.2 10.5h.01M13.8 10.5h.01M17.5 10.5h.01M7.5 14h9", 2.4),
    ],
  },
  puzzle: {
    parts: [fill("M10 3a2 2 0 0 1 2 2v1h3a2 2 0 0 1 2 2v3h1a2 2 0 1 1 0 4h-1v3a2 2 0 0 1-2 2h-3v-1a2 2 0 1 0-4 0v1H5a2 2 0 0 1-2-2v-3h1a2 2 0 1 0 0-4H3V8a2 2 0 0 1 2-2h3V5a2 2 0 0 1 2-2z")],
  },
  eye: {
    parts: [
      stroke("M2.5 12s3.5-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.5 6.5-9.5 6.5S2.5 12 2.5 12z", 2.4),
      { el: "circle", cx: 12, cy: 12, r: 2.8, fill: "currentColor" },
    ],
  },
  sun: {
    parts: [
      { el: "circle", cx: 12, cy: 12, r: 4.2, fill: "currentColor" },
      stroke("M12 2.5v2.2M12 19.3v2.2M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6", 2.4),
    ],
  },
  moon: { parts: [fill("M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z")] },
  auto: {
    parts: [
      { el: "circle", cx: 12, cy: 12, r: 8.5, fill: "none", stroke: "currentColor", strokeWidth: 2.2 },
      fill("M12 3.5a8.5 8.5 0 0 1 0 17z"),
    ],
  },
  gear: {
    parts: [fill("M19.4 13a7.6 7.6 0 0 0 0-2l2-1.5-2-3.5-2.4 1a7.7 7.7 0 0 0-1.7-1L15 3.5H9l-.3 2.5a7.7 7.7 0 0 0-1.7 1l-2.4-1-2 3.5L4.6 11a7.6 7.6 0 0 0 0 2l-2 1.5 2 3.5 2.4-1a7.7 7.7 0 0 0 1.7 1l.3 2.5h6l.3-2.5a7.7 7.7 0 0 0 1.7-1l2.4 1 2-3.5zM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7z")],
  },
  play: { parts: [fill("M7 4.5v15l13-7.5z")] },
  chart: {
    parts: [
      { el: "rect", x: 3, y: 12, width: 4, height: 9, rx: 1, fill: "currentColor" },
      { el: "rect", x: 10, y: 7, width: 4, height: 14, rx: 1, fill: "currentColor" },
      { el: "rect", x: 17, y: 3, width: 4, height: 18, rx: 1, fill: "currentColor" },
    ],
  },
  plus: { parts: [stroke("M12 5v14M5 12h14")] },
  minus: { parts: [stroke("M5 12h14")] },
};
