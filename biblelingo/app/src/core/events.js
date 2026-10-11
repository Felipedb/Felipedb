// Eventos de interface disparados pela lógica (toast, som, confete, navegação)
const listeners = new Set();
export function onUI(fn) { listeners.add(fn); return () => listeners.delete(fn); }
export function ui(type, payload) { listeners.forEach((fn) => fn({ type, ...payload })); }
export const toast = (text, cls) => ui("toast", { text, cls });
export const sfx = (name, arg) => ui("sfx", { name, arg });
// Som + haptic do mesmo evento (o App chama feel() de core/sfx.js): acerto, erro, combo, coração
export const feel = (name, arg) => ui("sfx", { name, arg, haptic: true });
export const confetti = (opts) => ui("confetti", { opts });
