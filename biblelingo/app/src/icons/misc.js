// Motivos bíblicos das medalhas (brancos, em currentColor), divisores, selo de tempo, calendário,
// curativo e badges de reação do personagem (VISUAL_SPEC 4.2 e 5.20).
const cc = "currentColor";

export const MISC_ICONS = {
  // Pergaminho: divisor do Antigo Testamento, versículo, medalha u5
  scroll: {
    parts: [
      { el: "rect", x: 5, y: 5, width: 14, height: 14, fill: "#fbf5e6" },
      { el: "rect", x: 8, y: 9, width: 8, height: 1.4, rx: 0.7, fill: "#ecdfbf" },
      { el: "rect", x: 8, y: 12, width: 8, height: 1.4, rx: 0.7, fill: "#ecdfbf" },
      { el: "rect", x: 8, y: 15, width: 5, height: 1.4, rx: 0.7, fill: "#ecdfbf" },
      { el: "rect", x: 3, y: 3, width: 18, height: 3.2, rx: 1.6, fill: "#8a6200" },
      { el: "rect", x: 3, y: 17.8, width: 18, height: 3.2, rx: 1.6, fill: "#8a6200" },
      { el: "rect", x: 3, y: 3, width: 18, height: 1.2, rx: 0.6, fill: "#ffffff", opacity: 0.25, hl: true },
    ],
  },
  // Cruz creme e pomba branca sobre o degradê do Novo Testamento
  "cross-dove": {
    parts: [
      { el: "rect", x: 7.6, y: 2, width: 2.8, height: 20, rx: 1.2, fill: "#fbf5e6" },
      { el: "rect", x: 3, y: 6.5, width: 12, height: 2.8, rx: 1.2, fill: "#fbf5e6" },
      { d: "M13.5 15c1.4-1.6 3.4-2.3 5.6-1.7-.8.9-1.8 1.5-3 1.8.7.8 1.7 1.3 2.9 1.4-1.6 1.2-3.6 1.3-5.3.2l-1.7 1.3.4-2c-.8-.4-1.4-1-1.6-1.8.9-.2 1.8 0 2.7.8z", fill: "#ffffff" },
      { el: "circle", cx: 17.6, cy: 13.8, r: 0.4, fill: "#1f5fd0", knockout: true },
    ],
  },
  // Motivos das medalhas: uma cor (currentColor), silhuetas simples
  "fish-net": {
    parts: [
      { d: "M4 4.5h16M4 19.5h16M4 4.5v15M20 4.5v15M4 12h16M12 4.5v15", fill: "none", stroke: cc, strokeWidth: 1.1, opacity: 0.4 },
      { d: "M2.8 12c2.5-3.5 6-5.2 9.4-5.2 2.2 0 4.3.6 6.3 1.9l2.7-2.6v11.8l-2.7-2.6a11.3 11.3 0 0 1-6.3 1.9c-3.4 0-6.9-1.7-9.4-5.2z", fill: cc },
      { el: "circle", cx: 7.3, cy: 11, r: 1, fill: "#000000", opacity: 0.3 },
    ],
  },
  ark: {
    parts: [
      { d: "M7 13.5V9.5l5-3.5 5 3.5v4z", fill: cc },
      { el: "rect", x: 10.8, y: 10.5, width: 2.4, height: 3, rx: 0.5, fill: "#000000", opacity: 0.3 },
      { d: "M2.5 13.5h19l-2.2 4.2a2 2 0 0 1-1.8 1.1H6.5a2 2 0 0 1-1.8-1.1z", fill: cc },
      { d: "M2 21c1.7-1.2 3.3-1.2 5 0s3.3 1.2 5 0 3.3-1.2 5 0 3.3 1.2 5 0", fill: "none", stroke: cc, strokeWidth: 1.6, strokeLinecap: "round", opacity: 0.7 },
    ],
  },
  bush: {
    parts: [
      { d: "M9 7.5c.6-1.6 0-2.8-.6-3.8 1.8.6 2.9 1.9 2.9 3.5 0 .9-.6 1.6-1.3 1.6S9 8.4 9 7.5z", fill: cc, opacity: 0.85 },
      { d: "M15 7.5c-.6-1.6 0-2.8.6-3.8-1.8.6-2.9 1.9-2.9 3.5 0 .9.6 1.6 1.3 1.6s1-.4 1-1.3z", fill: cc, opacity: 0.85 },
      { d: "M12 5.3c.7-1.9.2-3.3-.7-4.5 2.2.7 3.5 2.3 3.5 4.1 0 1.1-.8 2-1.7 2S12 6.3 12 5.3z", fill: cc, opacity: 0.85 },
      { el: "circle", cx: 8, cy: 13.5, r: 4.2, fill: cc },
      { el: "circle", cx: 16, cy: 13.5, r: 4.2, fill: cc },
      { el: "circle", cx: 12, cy: 10.5, r: 4.6, fill: cc },
      { el: "rect", x: 11, y: 15.5, width: 2, height: 6, rx: 1, fill: cc },
    ],
  },
  harp: {
    parts: [
      { d: "M6 21V6.5A3.5 3.5 0 0 1 9.5 3h.5v3H9a.5.5 0 0 0-.5.5V18H18V3h3v18z", fill: cc },
      { d: "M11 6v12M13.3 6v12M15.6 6v12", fill: "none", stroke: cc, strokeWidth: 1.2, opacity: 0.75 },
      { d: "M17.5 3l.7-2.2 1 1.3L20.5.5l1.3 1.6 1-1.3.7 2.2z", fill: cc },
    ],
  },
  wheat: {
    parts: [
      { d: "M12 22V7", fill: "none", stroke: cc, strokeWidth: 1.8, strokeLinecap: "round" },
      { el: "ellipse", cx: 12, cy: 4.5, rx: 1.5, ry: 2.4, fill: cc },
      { el: "ellipse", cx: 9.6, cy: 8, rx: 2.2, ry: 1.3, fill: cc, transform: "rotate(-35 9.6 8)" },
      { el: "ellipse", cx: 14.4, cy: 8, rx: 2.2, ry: 1.3, fill: cc, transform: "rotate(35 14.4 8)" },
      { el: "ellipse", cx: 9.6, cy: 11.5, rx: 2.2, ry: 1.3, fill: cc, transform: "rotate(-35 9.6 11.5)" },
      { el: "ellipse", cx: 14.4, cy: 11.5, rx: 2.2, ry: 1.3, fill: cc, transform: "rotate(35 14.4 11.5)" },
      { el: "ellipse", cx: 9.6, cy: 15, rx: 2.2, ry: 1.3, fill: cc, transform: "rotate(-35 9.6 15)" },
      { el: "ellipse", cx: 14.4, cy: 15, rx: 2.2, ry: 1.3, fill: cc, transform: "rotate(35 14.4 15)" },
    ],
  },
  lion: {
    parts: [
      { el: "circle", cx: 12, cy: 12.5, r: 9.5, fill: "none", stroke: cc, strokeWidth: 2.6 },
      { el: "circle", cx: 7.4, cy: 6.4, r: 1.9, fill: cc },
      { el: "circle", cx: 16.6, cy: 6.4, r: 1.9, fill: cc },
      { el: "circle", cx: 12, cy: 12.5, r: 5.6, fill: cc },
      { el: "circle", cx: 10.2, cy: 11.3, r: 0.8, fill: "#000000", opacity: 0.35 },
      { el: "circle", cx: 13.8, cy: 11.3, r: 0.8, fill: "#000000", opacity: 0.35 },
      { d: "M11 14.2h2l-1 1.2z", fill: "#000000", opacity: 0.35 },
    ],
  },
  "open-book-leaf": {
    parts: [
      { d: "M2.5 8c3-1.4 6-1.2 9.5.8v12.7c-3.5-2-6.5-2.2-9.5-.8z", fill: cc },
      { d: "M21.5 8c-3-1.4-6-1.2-9.5.8v12.7c3.5-2 6.5-2.2 9.5-.8z", fill: cc, opacity: 0.85 },
      { d: "M12.2 6.5c-.3-2.6.9-4.6 3.4-5.3.4 2.7-.8 4.7-3.4 5.3z", fill: cc },
      { d: "M12.2 6.5c.4-1.4 1.2-2.6 2.3-3.4", fill: "none", stroke: "#000000", strokeWidth: 0.8, strokeLinecap: "round", opacity: 0.3 },
    ],
  },
  timer: {
    parts: [
      { el: "rect", x: 10.3, y: 1.5, width: 3.4, height: 2.6, rx: 1, fill: "#777777" },
      { d: "M18 5.6l1.5-1.5", fill: "none", stroke: "#777777", strokeWidth: 2, strokeLinecap: "round" },
      { el: "circle", cx: 12, cy: 13, r: 8, fill: "none", stroke: "#777777", strokeWidth: 2.6 },
      { el: "circle", cx: 12, cy: 13, r: 6.6, fill: "#ffffff", knockout: true },
      { d: "M12 13V8.6M12 13l3 2", fill: "none", stroke: "#1cb0f6", strokeWidth: 2.2, strokeLinecap: "round" },
      { el: "circle", cx: 12, cy: 13, r: 1, fill: "#1cb0f6" },
    ],
  },
  calendar: {
    parts: [
      { el: "rect", x: 3, y: 5, width: 18, height: 16, rx: 2.5, fill: "#ffffff", stroke: "#e5e5e5", strokeWidth: 1.5 },
      { d: "M3 7.5A2.5 2.5 0 0 1 5.5 5h13A2.5 2.5 0 0 1 21 7.5V10H3z", fill: "#ff4b4b" },
      { el: "rect", x: 7, y: 3, width: 2, height: 4.5, rx: 1, fill: "#d33131" },
      { el: "rect", x: 15, y: 3, width: 2, height: 4.5, rx: 1, fill: "#d33131" },
      { el: "circle", cx: 8, cy: 14, r: 1, fill: "#e5e5e5", knockout: true },
      { el: "circle", cx: 12, cy: 14, r: 1, fill: "#e5e5e5", knockout: true },
      { el: "circle", cx: 16, cy: 14, r: 1, fill: "#e5e5e5", knockout: true },
      { el: "circle", cx: 8, cy: 18, r: 1, fill: "#e5e5e5", knockout: true },
      { el: "circle", cx: 12, cy: 18, r: 1, fill: "#e5e5e5", knockout: true },
      { el: "circle", cx: 16, cy: 18, r: 1.3, fill: "#1cb0f6", knockout: true },
    ],
  },
  bandage: {
    parts: [
      { el: "rect", x: 2.5, y: 8.8, width: 19, height: 6.4, rx: 3.2, fill: "#ff9600", transform: "rotate(-45 12 12)" },
      { el: "rect", x: 7.8, y: 9.3, width: 8.4, height: 5.4, rx: 1, fill: "#ffe0b3", transform: "rotate(-45 12 12)", knockout: true },
      { el: "circle", cx: 10.2, cy: 10.8, r: 0.6, fill: "#ffc27a", transform: "rotate(-45 12 12)", hl: true },
      { el: "circle", cx: 13.8, cy: 10.8, r: 0.6, fill: "#ffc27a", transform: "rotate(-45 12 12)", hl: true },
      { el: "circle", cx: 10.2, cy: 13.2, r: 0.6, fill: "#ffc27a", transform: "rotate(-45 12 12)", hl: true },
      { el: "circle", cx: 13.8, cy: 13.2, r: 0.6, fill: "#ffc27a", transform: "rotate(-45 12 12)", hl: true },
    ],
  },
  // Badges de reação do personagem (28 px, fora do recorte do retrato)
  "reaction-happy": {
    parts: [
      { el: "circle", cx: 12, cy: 12, r: 11, fill: "#ffc800" },
      { d: "M12 1a11 11 0 0 1 0 22z", fill: "#e5a600", opacity: 0.3 },
      { el: "circle", cx: 8.8, cy: 10, r: 1.5, fill: "#5b4400", knockout: true },
      { el: "circle", cx: 15.2, cy: 10, r: 1.5, fill: "#5b4400", knockout: true },
      { d: "M7.5 13.8c1.2 2.4 3 3.6 4.5 3.6s3.3-1.2 4.5-3.6", fill: "none", stroke: "#5b4400", strokeWidth: 2, strokeLinecap: "round", knockout: true },
      { el: "circle", cx: 6.3, cy: 13.6, r: 1.3, fill: "#ff9600", opacity: 0.6, hl: true },
      { el: "circle", cx: 17.7, cy: 13.6, r: 1.3, fill: "#ff9600", opacity: 0.6, hl: true },
    ],
  },
  "reaction-sad": {
    parts: [
      { el: "circle", cx: 12, cy: 12, r: 11, fill: "#ffc800" },
      { d: "M12 1a11 11 0 0 1 0 22z", fill: "#e5a600", opacity: 0.3 },
      { d: "M7 7.8l3.2 1.2M17 7.8l-3.2 1.2", fill: "none", stroke: "#5b4400", strokeWidth: 1.8, strokeLinecap: "round", knockout: true },
      { el: "circle", cx: 8.8, cy: 11, r: 1.5, fill: "#5b4400", knockout: true },
      { el: "circle", cx: 15.2, cy: 11, r: 1.5, fill: "#5b4400", knockout: true },
      { d: "M8 17.6c1.2-2.2 2.8-3.3 4-3.3s2.8 1.1 4 3.3", fill: "none", stroke: "#5b4400", strokeWidth: 2, strokeLinecap: "round", knockout: true },
      { d: "M16.8 12.8c1 1.5 1.5 2.5 1.5 3.3a1.5 1.5 0 0 1-3 0c0-.8.5-1.8 1.5-3.3z", fill: "#1cb0f6" },
    ],
  },
};
