// Áudio e fala (VISUAL_SPEC 4.2 e 5.16): alto-falante com dois arcos separados (.arc-1, .arc-2),
// tartaruga do DEVAGAR, microfone (currentColor), orelha riscada, fone.
export const COMM_ICONS = {
  speaker: {
    parts: [
      { d: "M3.5 9.4v5.2a1 1 0 0 0 1 1h2.9l4.7 3.8a.8.8 0 0 0 1.3-.6V5.2a.8.8 0 0 0-1.3-.6L7.4 8.4H4.5a1 1 0 0 0-1 1z", fill: "var(--color-accent)" },
      { d: "M16.4 9.2a4.3 4.3 0 0 1 0 5.6", className: "arc arc-1", fill: "none", stroke: "var(--color-accent)", strokeWidth: 2.2, strokeLinecap: "round" },
      { d: "M19.2 6.4a8.2 8.2 0 0 1 0 11.2", className: "arc arc-2", fill: "none", stroke: "var(--color-accent)", strokeWidth: 2.2, strokeLinecap: "round" },
    ],
  },
  turtle: {
    parts: [
      { d: "M4.5 14.8l-2 .9 2 .9z", fill: "#46a302" },
      { el: "ellipse", cx: 20.2, cy: 13.6, rx: 2.3, ry: 1.9, fill: "#46a302" },
      { el: "rect", x: 6, y: 16, width: 3, height: 2.6, rx: 1.2, fill: "#46a302" },
      { el: "rect", x: 14.5, y: 16, width: 3, height: 2.6, rx: 1.2, fill: "#46a302" },
      { d: "M4.5 14.5a7.5 6 0 0 1 15 0v.8a1 1 0 0 1-1 1h-13a1 1 0 0 1-1-1z", fill: "#58cc02" },
      { d: "M12 8.5a7.5 6 0 0 1 7.5 6v.8a1 1 0 0 1-1 1H12z", fill: "#46a302", opacity: 0.35 },
      { d: "M8.2 10.8l2.6-2.2 3 .3 2.4 2.4-1.2 3.2H9.4z", fill: "#3f7d12", opacity: 0.6 },
      { el: "circle", cx: 20.9, cy: 13.1, r: 0.5, fill: "#131f24", knockout: true },
      { el: "circle", cx: 8.4, cy: 11.6, r: 0.8, fill: "#ffffff", opacity: 0.5, hl: true },
    ],
  },
  // Microfone sempre em currentColor (branco sobre azul no claro, #131f24 no escuro)
  mic: {
    parts: [
      { el: "rect", x: 8.8, y: 2.5, width: 6.4, height: 11.5, rx: 3.2, fill: "currentColor" },
      { d: "M5.5 11.2a6.5 6.5 0 0 0 13 0", fill: "none", stroke: "currentColor", strokeWidth: 2.6, strokeLinecap: "round" },
      { d: "M12 17.7v3.3M8.7 21h6.6", fill: "none", stroke: "currentColor", strokeWidth: 2.6, strokeLinecap: "round" },
    ],
  },
  "ear-off": {
    parts: [
      { d: "M8 11a4.5 4.5 0 1 1 9 0c0 2.4-1.8 3.4-2.6 5-.5 1-.9 2.5-2.6 2.5-1.2 0-1.9-.7-2.1-1.6", fill: "none", stroke: "var(--color-disabled)", strokeWidth: 2.4, strokeLinecap: "round" },
      { d: "M11 11a1.5 1.5 0 0 1 3 0c0 1-1 1.3-1.3 2.3", fill: "none", stroke: "var(--color-disabled)", strokeWidth: 2, strokeLinecap: "round" },
      { d: "M4 20 20 4", fill: "none", stroke: "var(--color-disabled)", strokeWidth: 2.4, strokeLinecap: "round" },
    ],
  },
  headphones: {
    parts: [
      { d: "M4.5 15V12a7.5 7.5 0 0 1 15 0v3", fill: "none", stroke: "#1cb0f6", strokeWidth: 2.6, strokeLinecap: "round" },
      { el: "rect", x: 2.5, y: 13, width: 5, height: 7.5, rx: 2, fill: "#1cb0f6" },
      { el: "rect", x: 16.5, y: 13, width: 5, height: 7.5, rx: 2, fill: "#1cb0f6" },
      { el: "rect", x: 5, y: 14.5, width: 2.5, height: 4.5, rx: 1, fill: "#1899d6" },
      { el: "rect", x: 16.5, y: 14.5, width: 2.5, height: 4.5, rx: 1, fill: "#1899d6" },
      { el: "circle", cx: 4, cy: 14.6, r: 0.6, fill: "#ffffff", opacity: 0.6, hl: true },
    ],
  },
};
