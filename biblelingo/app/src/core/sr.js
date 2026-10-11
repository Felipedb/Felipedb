// Repetição espaçada por palavra — porta fiel de features.js.
import { state } from "./store.js";
import { shuffle, today } from "./util.js";

export const SR_INTERVALS = [0, 1, 2, 4, 7, 15, 30];

export function wordStat(en) {
  state.words = state.words || {};
  return state.words[en] || (state.words[en] = { lvl: 0, ok: 0, bad: 0, last: 0 });
}
export function recordWord(en, ok) {
  const w = wordStat(en);
  w.last = Date.now();
  if (ok) {
    w.ok++;
    // Sobe no máximo um nível por dia
    const day = today();
    if (w.up !== day) { w.up = day; w.lvl = Math.min(SR_INTERVALS.length - 1, w.lvl + 1); }
  } else { w.bad++; w.lvl = Math.max(0, w.lvl - 2); }
}
export function wordUrgency(en) {
  const w = state.words && state.words[en];
  if (!w) return 0.5;
  const overdue = (Date.now() - (w.last + SR_INTERVALS[w.lvl] * 864e5)) / 864e5;
  return overdue + w.bad * 0.6 - Math.min(w.ok, 5) * 0.3;
}
export function weakestWords(list, n) {
  return shuffle([...list]).sort((a, b) => wordUrgency(b.en) - wordUrgency(a.en)).slice(0, n);
}
