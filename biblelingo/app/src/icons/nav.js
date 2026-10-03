// Abas ilustradas, marca e livros (VISUAL_SPEC 4.2): casa, haltere, pessoas, avatar, brand-mark,
// caderno do guia, livro do nó de história, livro aberto do narrador e balão da cena.
export const NAV_ICONS = {
  home: {
    parts: [
      { d: "M5 11v8.5A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V11z", fill: "#ffe0b3" },
      { d: "M12 11h7v8.5a1.5 1.5 0 0 1-1.5 1.5H12z", fill: "#ffc27a", opacity: 0.6 },
      { d: "M12 2.5 1.8 11.4a.8.8 0 0 0 .6 1.3h19.2a.8.8 0 0 0 .6-1.3z", fill: "#ff4b4b" },
      { d: "M12 2.5l10.2 8.9a.8.8 0 0 1-.6 1.3H12z", fill: "#d33131", opacity: 0.45 },
      { el: "rect", x: 10, y: 14, width: 4, height: 7, rx: 1, fill: "#1cb0f6" },
      { el: "rect", x: 15, y: 13.5, width: 3, height: 3, rx: 0.6, fill: "#ffc800" },
      { d: "M6.3 12.7h3", fill: "none", stroke: "#ffffff", strokeWidth: 1.2, strokeLinecap: "round", opacity: 0.6, hl: true },
    ],
  },
  dumbbell: {
    parts: [
      { el: "rect", x: 7, y: 10.6, width: 10, height: 2.8, rx: 1.4, fill: "#777777" },
      { el: "rect", x: 3, y: 6.5, width: 3.4, height: 11, rx: 1.5, fill: "#1cb0f6" },
      { el: "rect", x: 17.6, y: 6.5, width: 3.4, height: 11, rx: 1.5, fill: "#1cb0f6" },
      { d: "M3 12h3.4v4A1.5 1.5 0 0 1 4.9 17.5h-.4A1.5 1.5 0 0 1 3 16z", fill: "#1899d6", opacity: 0.6 },
      { d: "M17.6 12H21v4a1.5 1.5 0 0 1-1.5 1.5h-.4a1.5 1.5 0 0 1-1.5-1.5z", fill: "#1899d6", opacity: 0.6 },
      { el: "rect", x: 6, y: 8.5, width: 2, height: 7, rx: 1, fill: "#1899d6" },
      { el: "rect", x: 16, y: 8.5, width: 2, height: 7, rx: 1, fill: "#1899d6" },
      { el: "circle", cx: 4.3, cy: 8.2, r: 0.6, fill: "#ffffff", opacity: 0.6, hl: true },
    ],
  },
  people: {
    parts: [
      { el: "circle", cx: 16.8, cy: 9.3, r: 2.7, fill: "#ce82ff" },
      { d: "M13.6 20c.4-2.6 1.6-4.4 3.2-5.3 2.8-.2 5.2 2.3 5.2 5.3v.5h-8.4z", fill: "#ce82ff" },
      { d: "M17 14.6c2.6 0 5 2.4 5 5.4v.5h-5z", fill: "#a560e8", opacity: 0.4 },
      { el: "circle", cx: 9, cy: 8, r: 3.6, fill: "#ff9600" },
      { d: "M2.5 20c0-3.9 2.9-6.6 6.5-6.6s6.5 2.7 6.5 6.6v.5h-13z", fill: "#ff9600" },
      { d: "M9 13.4c3.6 0 6.5 2.7 6.5 6.6v.5H9z", fill: "#e68a00", opacity: 0.4 },
      { el: "circle", cx: 7.6, cy: 6.6, r: 0.8, fill: "#ffffff", opacity: 0.6, hl: true },
    ],
  },
  avatar: {
    parts: [
      { el: "circle", cx: 12, cy: 12, r: 11, fill: "#58cc02" },
      { d: "M12 1a11 11 0 0 1 0 22z", fill: "#46a302", opacity: 0.35 },
      { el: "circle", cx: 12, cy: 9.5, r: 3.7, fill: "#ffffff", knockout: true },
      { d: "M5.3 19.4c1.2-3.3 3.7-5 6.7-5s5.5 1.7 6.7 5A10.9 10.9 0 0 1 12 23a10.9 10.9 0 0 1-6.7-3.6z", fill: "#ffffff", knockout: true },
    ],
  },
  // Livro aberto verde com cruz branca e raio de luz dourado: splash, sidebar, item "curso" do HUD, PWA
  "brand-mark": {
    parts: [
      { d: "M3 5.5c3-1 5.8-.8 8.5.8v13.2C8.8 18 6 17.8 3 18.8z", fill: "#58cc02" },
      { d: "M21 5.5c-3-1-5.8-.8-8.5.8v13.2c2.7-1.5 5.5-1.7 8.5-.7z", fill: "#46a302" },
      { el: "rect", x: 11.5, y: 6.3, width: 1, height: 13.2, fill: "#3f7d12" },
      { el: "rect", x: 6.2, y: 8.8, width: 1.7, height: 6.4, rx: 0.85, fill: "#ffffff", knockout: true },
      { el: "rect", x: 4.4, y: 10.6, width: 5.3, height: 1.7, rx: 0.85, fill: "#ffffff", knockout: true },
      { d: "M16.8 7.2l1-3 1 3 3 1-3 1-1 3-1-3-3-1z", fill: "#ffc800" },
    ],
  },
  notebook: {
    parts: [
      { el: "rect", x: 5, y: 3, width: 14, height: 18, rx: 2, fill: "#ffffff", opacity: 0.9 },
      { d: "M7.2 3H6.5A1.5 1.5 0 0 0 5 4.5v15A1.5 1.5 0 0 0 6.5 21h.7z", fill: "var(--color-unit, #58cc02)", opacity: 0.4 },
      { el: "rect", x: 9.5, y: 8, width: 6.5, height: 1.6, rx: 0.8, fill: "var(--color-unit, #58cc02)", opacity: 0.55 },
      { el: "rect", x: 9.5, y: 11.5, width: 6.5, height: 1.6, rx: 0.8, fill: "var(--color-unit, #58cc02)", opacity: 0.55 },
      { el: "rect", x: 9.5, y: 15, width: 4, height: 1.6, rx: 0.8, fill: "var(--color-unit, #58cc02)", opacity: 0.55 },
    ],
  },
  // Capa na cor do contexto (--unit-color no capítulo, verde fora), páginas creme
  book: {
    parts: [
      { d: "M5 3.5h12.5A1.5 1.5 0 0 1 19 5v14.5a1.5 1.5 0 0 1-1.5 1.5H5z", fill: "var(--color-unit, #58cc02)" },
      { d: "M5 3.5h2.6V21H5z", fill: "var(--color-unit-shadow, #46a302)" },
      { el: "rect", x: 17.6, y: 5.6, width: 1.4, height: 13.3, fill: "#fff3bf", knockout: true },
      { el: "rect", x: 10, y: 7.6, width: 6, height: 1.6, rx: 0.8, fill: "#ffffff", opacity: 0.75, hl: true },
      { el: "rect", x: 10, y: 10.8, width: 4, height: 1.6, rx: 0.8, fill: "#ffffff", opacity: 0.75, hl: true },
    ],
  },
  "book-open": {
    parts: [
      { d: "M1.5 7v13.5c3.5-1.1 7-.8 10.5 1.2 3.5-2 7-2.3 10.5-1.2V7l-1.4.4v11.9c-3.2-.6-6.2-.1-9.1 1.5-2.9-1.6-5.9-2.1-9.1-1.5V7.4z", fill: "var(--color-unit, #58cc02)" },
      { d: "M2.5 5.5c3-1.2 6-1 9.5.8v13.4c-3.5-1.8-6.5-2-9.5-.9z", fill: "#fff3bf" },
      { d: "M21.5 5.5c-3-1.2-6-1-9.5.8v13.4c3.5-1.8 6.5-2 9.5-.9z", fill: "#fff3bf" },
      { d: "M21.5 5.5c-3-1.2-6-1-9.5.8v13.4c3.5-1.8 6.5-2 9.5-.9z", fill: "#ffe066", opacity: 0.35 },
      { d: "M5 9.5c1.6-.3 3.2-.2 4.8.4M5 12.5c1.6-.3 3.2-.2 4.8.4M14.2 9.9c1.6-.6 3.2-.7 4.8-.4M14.2 12.9c1.6-.6 3.2-.7 4.8-.4", fill: "none", stroke: "#e5a600", strokeWidth: 1.2, strokeLinecap: "round", opacity: 0.8, hl: true },
    ],
  },
  // Balão branco com rabinho; sombra cinza embaixo; três pontos no azul da fala
  speech: {
    parts: [
      { d: "M4 4.5h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-8.5L7 21v-3.5H4a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2z", fill: "#e5e5e5", transform: "translate(0 1.6)" },
      { d: "M4 4.5h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-8.5L7 21v-3.5H4a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2z", fill: "#ffffff" },
      { el: "circle", cx: 8, cy: 11, r: 1.4, fill: "#1cb0f6", knockout: true },
      { el: "circle", cx: 12, cy: 11, r: 1.4, fill: "#1cb0f6", knockout: true },
      { el: "circle", cx: 16, cy: 11, r: 1.4, fill: "#1cb0f6", knockout: true },
    ],
  },
};
