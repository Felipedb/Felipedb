// Snackbar e LessonBanner (VISUAL_SPEC 5.24).
// Snackbar: fixed bottom calc(80px + safe area), centrado, largura máx. 360, raio 12, fundo --color-ink texto --color-page
//   (claro #4b4b4b/#fff, escuro #f1f7fb/#131f24), padding 12 16, ícone SVG 20 + text-secondary 700; entra y 16 -> 0 + scale .9 -> 1
//   (SPRING.footer), fica 1600 + 40 ms por caractere (máx. 3200), sai y 8 + fade 150 ms; uma visível por vez (fila); haptic("toast").
//   Props: queue [{ id, text, icon }], onDone(id) chamado quando o item sai (o pai remove da fila)
// LessonBanner: faixa de 32 px abaixo do cabeçalho da lição (fundo --color-raised, caption 13/800, 1,6 s, sem emoji).
//   Props: text, icon, onDone, duration (ms)
// Exemplo: <Snackbar queue={toasts} onDone={(id) => setToasts((t) => t.filter((x) => x.id !== id))} />
import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SPRING } from "../../core/motion.js";
import { haptic } from "../../core/haptics.js";
import Icon from "../Icon.jsx";

const ttl = (text) => Math.min(3200, 1600 + 40 * String(text || "").length);

export default function Snackbar({ queue = [], onDone }) {
  const cur = queue[0] || null;
  useEffect(() => {
    if (!cur) return;
    haptic("toast");
    const t = setTimeout(() => onDone && onDone(cur.id), ttl(cur.text));
    return () => clearTimeout(t);
  }, [cur && cur.id]); // eslint-disable-line
  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-[calc(80px+env(safe-area-inset-bottom))] z-50 flex justify-center" aria-live="polite" aria-atomic="true">
      <AnimatePresence mode="wait">
        {cur && (
          <motion.div key={cur.id} className="pointer-events-auto flex max-w-[360px] items-center gap-2.5 rounded-md bg-ink px-4 py-3 text-secondary font-bold text-page"
            initial={{ y: 16, scale: 0.9, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={{ y: 8, opacity: 0, transition: { duration: 0.15 } }} transition={SPRING.footer}
            onClick={() => onDone && onDone(cur.id)}>
            {cur.icon && <Icon name={cur.icon} size={20} />}
            <span>{cur.text}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function LessonBanner({ text, icon, onDone, duration = 1600, className = "" }) {
  useEffect(() => {
    if (!text) return;
    const t = setTimeout(() => onDone && onDone(), duration);
    return () => clearTimeout(t);
  }, [text]); // eslint-disable-line
  return (
    <AnimatePresence>
      {text && (
        <motion.div key={text} className={`flex h-8 items-center justify-center gap-2 overflow-hidden rounded-sm bg-raised text-caption uppercase tracking-[.8px] text-ink-soft ${className}`}
          role="status" initial={{ height: 0, opacity: 0 }} animate={{ height: 32, opacity: 1 }} exit={{ height: 0, opacity: 0, transition: { duration: 0.15 } }} transition={SPRING.settle}>
          {icon && <Icon name={icon} size={16} />}
          <span>{text}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
