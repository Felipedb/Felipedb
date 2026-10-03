// Haptics do React (VISUAL_SPEC 8.1 e 8.2): um evento, um padrão.
// Preferência própria `state.haptics` (ligada por padrão), independente de reduced motion.
// No-op seguro onde navigator.vibrate não existe (iOS Safari): o visual nunca depende do haptic.
import { state } from "./store.js";

export const HAPTICS = {
  tap: 8,                         // navegar aba, abrir card, popover, sheet, tocar nó
  select: 8,                      // selecionar opção, célula de pares
  tile: 8,                        // pegar ou devolver peça
  correct: 20,                    // verificar certo
  combo: [20, 30, 40],            // combo múltiplo de 5
  wrong: [50, 30, 50],            // verificar errado
  "heart-lost": [30, 20, 60],     // perder coração
  "heart-lost-all": [80, 40, 80], // sem corações (HeartsSheet)
  pair: 12,                       // par certo (match, madness)
  star: 15,                       // estrela do Result
  finish: [40, 30, 40, 30, 80],   // fim de lição
  chest: [30, 40, 60],            // baú / moeda
  streak: [40, 30, 40, 30, 120],  // ofensiva
  levelup: [40, 30, 40, 30, 120], // coroa / nível
  tick: 6,                        // últimos 10 s do Madness
  gong: [40, 30, 80],             // fim do Madness
  mission: 8,                     // missão concluída
  toast: 8,                       // snackbar
  toggle: 8,                      // toggle
};

export function hapticsEnabled() {
  return state.haptics !== false;
}

// haptic("correct") · haptic([10, 20]) também é aceito para padrões pontuais
export function haptic(name) {
  if (!hapticsEnabled()) return false;
  const pattern = Array.isArray(name) || typeof name === "number" ? name : HAPTICS[name];
  if (pattern == null) return false;
  try {
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") return navigator.vibrate(pattern);
  } catch (e) { /* sem vibração */ }
  return false;
}
