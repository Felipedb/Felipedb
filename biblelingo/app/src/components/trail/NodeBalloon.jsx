// NodeBalloon (VISUAL_SPEC 5.3): "COMEÇAR", "RETOMAR" ou "PRATICAR" 12 px acima do nó atual, centralizado; fundo --color-page,
// borda 2 px --color-line, raio 12, padding 8x14, texto 15/800 em --unit-text, seta de 8 px para baixo. Flutua com --animate-float
// (5 px em 1,4 s), entra com scale .8 -> 1 (SPRING.pop) depois do scroll inicial e some em 120 ms enquanto o popover está aberto.
// Props: label, delay (s)
import { motion } from "motion/react";
import { SPRING } from "../../core/motion.js";

export default function NodeBalloon({ label = "Começar", delay = 0.4 }) {
  return (
    <motion.span className="pointer-events-none absolute bottom-[calc(100%+12px)] left-1/2 z-[2] block" style={{ x: "-50%" }}
      initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.12 } }} transition={{ ...SPRING.pop, delay }} aria-hidden="true">
      <span className="relative block whitespace-nowrap rounded-md border-2 border-line bg-page px-3.5 py-2 text-label uppercase tracking-[1px] text-unit-text"
        style={{ animation: "var(--animate-float)" }}>
        {label}
        <span aria-hidden className="absolute -bottom-[8px] left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-line bg-page" />
      </span>
    </motion.span>
  );
}
