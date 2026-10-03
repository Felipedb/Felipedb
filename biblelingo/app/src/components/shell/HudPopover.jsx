// HudPopover (VISUAL_SPEC 5.7): painel de 358 sob o item do HUD, raio 16, borda 2 px --color-line, fundo --color-page,
// seta de 10 px sob o item, padding 16; entra com SPRING.pop (origem na seta), sai em 120 ms; fecha ao tocar fora ou com Escape.
// Props: open (bool), arrowX (px, centro do item em relação à borda esquerda do painel), onClose, label (aria-label), children
import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SPRING } from "../../core/motion.js";

export default function HudPopover({ open, arrowX = 0, onClose, label, children }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === "Escape") onClose && onClose(); };
    const onDown = (e) => {
      const el = ref.current;
      if (!el || el.contains(e.target)) return;
      if (e.target && e.target.closest && e.target.closest("[data-hud-item]")) return;
      onClose && onClose();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown, true);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown, true);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div ref={ref} role="dialog" aria-label={label}
          className="absolute left-1/2 top-[calc(100%+10px)] z-45 w-[358px] max-w-[calc(100vw-32px)] rounded-lg border-2 border-line bg-page p-4 text-ink"
          style={{ x: "-50%", transformOrigin: `${arrowX}px 0px` }}
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.12 } }} transition={SPRING.pop}>
          {children}
          {/* Seta de 10 px: quadrado rotacionado com as bordas superior e esquerda, por cima da borda do painel */}
          <span aria-hidden className="absolute -top-[9px] h-[16px] w-[16px] rotate-45 border-l-2 border-t-2 border-line bg-page" style={{ left: arrowX - 8 }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
