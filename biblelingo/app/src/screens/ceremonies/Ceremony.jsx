// Casca comum das cerimônias pós-lição (VISUAL_SPEC 6.4): tela cheia (portal no body) com data-ceremony="streak|goal|crown|mission",
// CTA Button3D primary com texto DOM "Continuar" (caixa alta por CSS), um toque em qualquer lugar pula a animação para o estado
// final (e, já no estado final, fecha). Nenhuma cerimônia dura mais de 2,5 s sem interação: o CTA aparece até 1,5 s.
// Uso: <Ceremony kind="streak" marks={[100, 400, 700]} ctaAt={1500} onContinue={next}>{(at) => at(100) && <Flame />}</Ceremony>
//   at(ms) é verdadeiro quando o relógio da cerimônia passou daquele instante (ou após o toque que pula a animação).
import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "motion/react";
import { Button3D } from "../../components/ui/index.js";
import { SPRING } from "../../core/motion.js";

export function useCeremonyClock(marks = [], ctaAt = 1500) {
  const reduce = useReducedMotion();
  const [now, setNow] = useState(() => (reduce ? Infinity : 0));
  const all = useMemo(() => Array.from(new Set([...marks, ctaAt])).sort((a, b) => a - b), []); // eslint-disable-line
  useEffect(() => {
    if (reduce) { setNow(Infinity); return; }
    const timers = all.map((ms) => setTimeout(() => setNow((n) => Math.max(n, ms)), ms));
    return () => timers.forEach(clearTimeout);
  }, [reduce]); // eslint-disable-line
  const at = useCallback((ms) => now >= ms, [now]);
  const skip = useCallback(() => setNow(Infinity), []);
  return { at, skip, done: now === Infinity || now >= all[all.length - 1] };
}

export default function Ceremony({ kind, label, marks = [], ctaAt = 1500, onContinue, className = "", style, children }) {
  const { at, skip, done } = useCeremonyClock(marks, ctaAt);
  const tap = () => { if (done) onContinue && onContinue(); else skip(); };
  const node = (
    <motion.div data-ceremony={kind} role="dialog" aria-modal="true" aria-label={label}
      className={`fixed inset-0 z-50 flex flex-col items-center overflow-y-auto bg-page text-center ${className}`} style={style}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.15 } }} transition={{ duration: 0.2 }}
      onClick={tap}>
      <div className="flex w-full max-w-md flex-1 flex-col items-center justify-center px-4 pt-10">
        {typeof children === "function" ? children(at) : children}
      </div>
      <motion.div className="w-full max-w-md px-4 pb-[calc(16px+env(safe-area-inset-bottom))] pt-4"
        initial={{ opacity: 0, y: 12 }} animate={at(ctaAt) ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }} transition={SPRING.settle}>
        <Button3D variant="primary" size="cta" block onClick={(e) => { e.stopPropagation(); onContinue && onContinue(); }}>Continuar</Button3D>
      </motion.div>
    </motion.div>
  );
  return typeof document !== "undefined" ? createPortal(node, document.body) : node;
}
