// HintTooltip (VISUAL_SPEC 5.25): palavra com dica (.hint, sublinhado pontilhado sem mudar o peso) que abre uma
// tooltip 8 px acima: fundo --color-ink, texto --color-page, raio 8, padding 6 10, text-secondary 700 (tradução) +
// 13/500 opcional (classe gramatical), seta 8 px; entra SPRING.pop; fecha ao tocar fora ou após 2,5 s; uma por vez;
// fala a palavra ao abrir (onOpen).
// Props: word (texto exibido), hint (tradução), sub (classe gramatical), onOpen(word) (ex.: speak), className
// Exemplo: <HintTooltip word="céu" hint="heaven" onOpen={() => speak("heaven")} />
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SPRING } from "../../core/motion.js";

let closeCurrent = null;

export default function HintTooltip({ word, hint, sub, onOpen, className = "" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    closeCurrent = close;
    const t = setTimeout(close, 2500);
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) close(); };
    document.addEventListener("pointerdown", onDoc, true);
    return () => { clearTimeout(t); document.removeEventListener("pointerdown", onDoc, true); if (closeCurrent === close) closeCurrent = null; };
  }, [open]);
  const toggle = () => {
    if (open) { setOpen(false); return; }
    if (closeCurrent) closeCurrent();
    setOpen(true);
    onOpen && onOpen(word);
  };
  return (
    <span ref={ref} className={`relative inline-block ${className}`}>
      <button type="button" className="hint cursor-help rounded-sm" onClick={toggle} aria-expanded={open} aria-label={`${word}: ${hint}`}>{word}</button>
      <AnimatePresence>
        {open && (
          <motion.span role="tooltip" className="absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-sm bg-ink px-2.5 py-1.5 text-center text-secondary font-bold text-page"
            style={{ transformOrigin: "50% 100%" }} initial={{ scale: 0.8, opacity: 0, x: "-50%" }} animate={{ scale: 1, opacity: 1, x: "-50%" }} exit={{ scale: 0.9, opacity: 0, x: "-50%", transition: { duration: 0.12 } }} transition={SPRING.pop}>
            {hint}
            {sub && <span className="block text-caption font-medium normal-case tracking-normal opacity-80">{sub}</span>}
            <span aria-hidden className="absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-ink" />
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
