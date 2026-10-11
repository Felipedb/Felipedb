// Haptics do React (SFX_SPEC 2 e 6.2; VISUAL_SPEC 8): um evento, um padrão.
// O mapa vem do catálogo sonoro (tools/sfx/sounds.json via core/sfxCatalog.js): cada som com `haptic` vira uma entrada,
// então som e vibração nunca divergem. Acompanhamentos (sheet-open, sheet-close, swoosh) e sons sem toque (start, coin,
// stat, bless, newword, bubble) não vibram. Nomes legados e aliases do catálogo continuam aceitos.
// Preferência própria `state.haptics` (ligada por padrão), independente de reduced motion.
// No-op seguro onde navigator.vibrate não existe (iOS Safari): o visual nunca depende do haptic.
// Para tocar som e haptic juntos use feel(name, arg) de core/sfx.js.
import { state } from "./store.js";
import { SFX_SOUNDS, SFX_ALIASES } from "./sfxCatalog.js";

const FROM_CATALOG = Object.fromEntries(
  Object.entries(SFX_SOUNDS).filter(([, s]) => s.haptic != null).map(([name, s]) => [name, s.haptic])
);

export const HAPTICS = {
  ...FROM_CATALOG,
  toggle: 8,    // legado: toggle sem direção (o catálogo tem toggle-on / toggle-off)
};

export function hapticsEnabled() {
  return state.haptics !== false;
}

// Padrão de um nome (aceita aliases do catálogo: heart-lost-all, pop, sparkle...); undefined quando o evento não vibra
export function hapticPattern(name) {
  if (Array.isArray(name) || typeof name === "number") return name;
  if (Object.prototype.hasOwnProperty.call(HAPTICS, name)) return HAPTICS[name];
  const alias = SFX_ALIASES[name];
  return alias != null ? HAPTICS[alias] : undefined;
}

// haptic("correct") · haptic([10, 20]) também é aceito para padrões pontuais
export function haptic(name) {
  if (!hapticsEnabled()) return false;
  const pattern = hapticPattern(name);
  if (pattern == null) return false;
  try {
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") return navigator.vibrate(pattern);
  } catch (e) { /* sem vibração */ }
  return false;
}
