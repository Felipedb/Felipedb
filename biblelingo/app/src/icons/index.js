// Conjunto de ícones SVG do app React (VISUAL_SPEC seção 4). Estilo Duolingo: formas cheias,
// cantos arredondados, 2 ou 3 tons (base, sombra, brilho). Grade 24x24.
// Cada ícone é um mapa de partes { el, ...atributos SVG, hl, knockout, parts }:
//   hl       brilho branco: some no modo mono
//   knockout recorte: no modo mono vira a cor da página (check sobre círculo, porta do arca...)
//   parts    filhos de um <g> (grupos nomeados para animação: .chest-lid, .half-l, .arc-1...)
// icons.js (traço, app clássico) continua carregado pelo alias do Vite, mas o React não o usa mais.
import { HUD_ICONS } from "./hud.js";
import { REWARD_ICONS, chestParts, SHIELD_COLORS } from "./rewards.js";
import { NAV_ICONS } from "./nav.js";
import { COMM_ICONS } from "./comm.js";
import { MONO_ICONS } from "./mono.js";
import { MISC_ICONS } from "./misc.js";

export const ICONS = { ...HUD_ICONS, ...REWARD_ICONS, ...NAV_ICONS, ...COMM_ICONS, ...MONO_ICONS, ...MISC_ICONS };

// Nomes antigos (icons.js) e apelidos que continuam válidos
export const ICON_ALIASES = {
  practice: "dumbbell",
  quest: "quest-chest",
  user: "avatar",
  x: "close",
  "heart-lost": "heart-broken",
  bulb: "lightbulb",
  clock: "timer",
};

export function resolveIcon(name) {
  const key = ICON_ALIASES[name] || name;
  return ICONS[key] || null;
}

export const ICON_NAMES = Object.keys(ICONS).concat(Object.keys(ICON_ALIASES)).sort();

export { chestParts, SHIELD_COLORS };
