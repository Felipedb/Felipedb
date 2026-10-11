// Estado persistente + assinatura para o React (useSyncExternalStore).
// A lógica portada muta `state` livremente e chama save(), como no app clássico;
// save() persiste e avisa os componentes.
import { MAX_HEARTS, today, daysBetween } from "./util.js";

export const state = load();

function load() {
  const base = {
    xp: 0,
    streak: 0,
    lastStudy: null,
    hearts: MAX_HEARTS,
    heartsDay: today(),
    completed: {},
    stars: {},
    errors: {},
    speakMutedUntil: 0,
    listenMutedUntil: 0,
    sound: true,
    crowns: {},
    daily: null,
    dailyGoal: 20,
    theme: "auto",
    name: "",
    days: {},
    chests: {},
    words: {},
    resume: null,
    joined: null,
  };
  try {
    const raw = localStorage.getItem("biblelingo");
    if (raw) Object.assign(base, JSON.parse(raw));
  } catch (e) { /* armazenamento indisponível: segue em memória */ }
  // Armazenamento corrompido (tipo errado) não pode derrubar o app
  const isObj = (x) => x && typeof x === "object" && !Array.isArray(x);
  ["completed", "stars", "errors", "crowns", "days", "chests", "words"].forEach((k) => { if (!isObj(base[k])) base[k] = {}; });
  ["xp", "hearts", "streak", "dailyGoal"].forEach((k) => { if (k in base && !Number.isFinite(Number(base[k]))) base[k] = k === "hearts" ? MAX_HEARTS : k === "dailyGoal" ? 20 : 0; else if (k in base) base[k] = Number(base[k]); });
  if (base.hearts != null) base.hearts = Math.max(0, Math.min(MAX_HEARTS, base.hearts));
  if (base.resume != null && !isObj(base.resume)) base.resume = null;
  if (base.daily != null && !isObj(base.daily)) base.daily = null;
  if (base.joined != null && typeof base.joined !== "string") base.joined = null;
  if (base.name != null && typeof base.name !== "string") base.name = "";
  ensureDay(base);
  return base;
}

// Virada do dia com o app aberto: corações renovam e a ofensiva quebra sem recarregar
export function ensureDay(st) {
  const s = st || state;
  if (s.heartsDay !== today()) {
    s.hearts = MAX_HEARTS;
    s.heartsDay = today();
  }
  if (s.lastStudy && daysBetween(s.lastStudy, today()) > 1) s.streak = 0;
}

let version = 0;
const listeners = new Set();
export function save() {
  try { localStorage.setItem("biblelingo", JSON.stringify(state)); } catch (e) { /* segue em memória */ }
  version++;
  listeners.forEach((fn) => fn());
}
export const storeVersion = () => version;
export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
