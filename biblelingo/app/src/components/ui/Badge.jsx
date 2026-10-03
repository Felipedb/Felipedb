// Badge, Pill e Chip (VISUAL_SPEC 5.26).
// Badge de estado (acima do título do exercício): ícone circular 24 + caption 13/800; entra x -8 -> 0 + fade 180 ms.
//   kind: "review" (refresh laranja, "CORRIJA O ERRO DE ANTES") | "new-word" (sparkle, fundo --color-purple-soft, "PALAVRA NOVA")
//         | "legendary" (#ffc800 com #5b4400) | "timer" (--color-teal, "60 s") | "custom" (icon + children + className)
// Pill de contagem: 18 px, raio 9, #ff4b4b texto #ffffff 11/800 (erros no Hub e na aba Praticar). Props: count, max (padrão 99)
// Chip de vocabulário: 44 px, raio 12, borda 2 + 4, ícone 24 + EN 17/700 + PT caption 13/500 --color-ink-soft; toque fala; whileTap y 2.
//   Props: en, pt, icon (emoji de conteúdo em span.emoji ou nome de ícone com svgIcon), onClick, char, selected
// Exemplo: <Badge kind="review" />   <Pill count={3} />   <Chip en="ark" pt="arca" icon="🚢" onClick={() => speak("ark", { char })} />
import { motion } from "motion/react";
import { SPRING } from "../../core/motion.js";
import Icon from "../Icon.jsx";

const KINDS = {
  review: { icon: "refresh", text: "Corrija o erro de antes", cls: "text-orange-text" },
  "new-word": { icon: "sparkle", text: "Palavra nova", cls: "rounded-pill bg-purple-soft px-3 py-1 text-purple-text" },
  legendary: { icon: "crown", text: "Lendário", cls: "rounded-pill bg-yellow px-3 py-1 text-gold-ink" },
  timer: { icon: "timer", text: "60 s", cls: "rounded-pill bg-teal-soft px-3 py-1 text-teal-text" },
};

export default function Badge({ kind = "custom", icon, className = "", children, ...rest }) {
  const k = KINDS[kind];
  return (
    <motion.span className={`inline-flex items-center gap-2 text-caption uppercase tracking-[.8px] ${k ? k.cls : ""} ${className}`}
      initial={{ x: -8, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.18 }} {...rest}>
      <Icon name={icon || (k && k.icon)} size={24} />
      <span>{children || (k && k.text)}</span>
    </motion.span>
  );
}

export function Pill({ count = 0, max = 99, className = "", ...rest }) {
  if (!count) return null;
  return (
    <span className={`inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-[9px] bg-red px-1 text-[11px] font-extrabold leading-none text-white ${className}`} {...rest}>
      {count > max ? `${max}+` : count}
    </span>
  );
}

export function Chip({ en, pt, icon, svgIcon, onClick, selected = false, className = "", ...rest }) {
  return (
    <motion.button type="button" onClick={onClick} aria-label={pt ? `${en}: ${pt}` : en}
      className={`inline-flex h-11 items-center gap-2 rounded-md border-2 border-b-4 px-3 text-left ${selected ? "border-blue-line bg-blue-soft dark:bg-raised" : "border-line bg-page hover:bg-raised"} ${className}`}
      whileTap={{ y: 2, borderBottomWidth: 2 }} transition={SPRING.snap} {...rest}>
      {svgIcon ? <Icon name={svgIcon} size={24} /> : icon ? <span className="emoji text-[22px]" aria-hidden>{icon}</span> : null}
      <span className="flex flex-col leading-none">
        <span className="text-body font-bold text-ink">{en}</span>
        {pt && <span className="mt-0.5 text-caption font-medium normal-case tracking-normal text-ink-soft">{pt}</span>}
      </span>
    </motion.button>
  );
}
