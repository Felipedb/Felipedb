// ProgressBar (VISUAL_SPEC 5.10). Trilho --color-line, raio 8, mínimo visível 4%.
// Props:
//   value    0 a 1 (ou 0 a 100 quando max={100}) · max (padrão 1)
//   variant  "lesson" (16 px, preenchimento --color-primary com brilho de 3 px; avança com SPRING.soft e varredura)
//            | "labelled" (16 px, amarelo, rótulo "7/10" em duas camadas; monta de 0 em 600 ms EASE.out)
//            | "story" (12 px) | "compact" (8 px)
//   combo    número do combo atual (lesson): a partir de 5 a barra fica dourada com shimmer e 3 partículas de chama
//   label    texto do rótulo (labelled), ex.: "7/10" · done: preenchimento --color-primary + check
//   color    cor do preenchimento (sobrepõe a da variante) · delay: atraso da montagem em s · from: valor inicial da animação
// Exemplo: <ProgressBar variant="lesson" value={(index + (ok ? 1 : 0)) / total} combo={session.combo} />
//          <ProgressBar variant="labelled" value={7} max={10} label="7/10" delay={0.08} />
// ComboLabel: rótulo "COMBO x3" sobre a barra (verde de x2 a x4, dourado a partir de x5), key={combo} com pop.
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { SPRING, EASE } from "../../core/motion.js";
import Icon from "../Icon.jsx";

const H = { lesson: "h-4", labelled: "h-4", story: "h-3", compact: "h-2" };

export default function ProgressBar({ value = 0, max = 1, variant = "lesson", combo = 0, label, done = false, color, delay = 0, from, className = "", ariaLabel }) {
  const reduce = useReducedMotion();
  const pct = Math.max(0, Math.min(100, (value / (max || 1)) * 100));
  const shown = pct > 0 ? Math.max(pct, 4) : 0;
  const gold = variant === "lesson" && combo >= 5;
  const [mounted, setMounted] = useState(variant !== "labelled" || reduce);
  useEffect(() => { if (!mounted) { const t = setTimeout(() => setMounted(true), 20); return () => clearTimeout(t); } }, [mounted]);
  const prev = useRef(shown);
  const grew = shown > prev.current;
  useEffect(() => { prev.current = shown; }, [shown]);

  const fill = color || (done ? "var(--color-primary)" : variant === "labelled" ? "#ffc800" : gold ? "#ffc800" : "var(--color-primary)");
  const target = mounted ? shown : (from != null ? from : 0);
  const transition = variant === "labelled" ? { duration: 0.6, ease: EASE.out, delay } : SPRING.soft;

  return (
    <div className={`relative w-full overflow-hidden rounded-sm bg-line ${H[variant] || H.lesson} ${className}`}
      role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)} aria-label={ariaLabel || label}>
      <motion.div className="relative h-full overflow-hidden rounded-sm" style={{ background: fill }}
        initial={{ width: `${from != null ? from : 0}%` }} animate={{ width: `${target}%` }} transition={transition}>
        {gold && !reduce && (
          <span aria-hidden className="absolute inset-0 animate-shimmer" style={{ background: "linear-gradient(90deg, transparent, #ffd435 50%, transparent)", opacity: 0.8 }} />
        )}
        {(variant === "lesson" || variant === "story") && (
          <span aria-hidden className="absolute inset-x-[6px] top-[3px] h-[3px] rounded-full bg-white/25" />
        )}
        {/* Varredura de brilho no trecho novo (320 ms) */}
        {variant === "lesson" && grew && !reduce && (
          <motion.span key={shown} aria-hidden className="absolute inset-y-0 w-10" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,.45), transparent)" }}
            initial={{ left: "-40px" }} animate={{ left: "100%" }} transition={{ duration: 0.32, ease: "linear" }} />
        )}
      </motion.div>
      {/* Partículas de chama na ponta da barra dourada */}
      {gold && !reduce && (
        <span aria-hidden className="pointer-events-none absolute inset-y-0" style={{ left: `calc(${shown}% - 6px)` }}>
          {[0, 1, 2].map((i) => (
            <motion.span key={i} className="absolute top-1 h-1.5 w-1.5 rounded-full" style={{ background: i === 1 ? "#ff9600" : "#ffc800", left: i * 3 - 3 }}
              animate={{ y: [0, -12], opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.06 }} />
          ))}
        </span>
      )}
      {variant === "labelled" && label && (
        <>
          {/* Duas camadas: texto --color-ink sobre o trilho e cópia em #5b4400 recortada à largura do preenchimento */}
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-caption uppercase tracking-[.8px] text-ink">{done ? <Icon name="check" size={14} /> : label}</span>
          <motion.span aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center text-caption uppercase tracking-[.8px]"
            style={{ color: done ? "var(--color-primary-text)" : "#5b4400" }}
            initial={{ clipPath: `inset(0 ${100 - (from != null ? from : 0)}% 0 0)` }} animate={{ clipPath: `inset(0 ${100 - target}% 0 0)` }} transition={transition}>
            {done ? <Icon name="check" size={14} /> : label}
          </motion.span>
        </>
      )}
    </div>
  );
}

export function ComboLabel({ combo, className = "" }) {
  const show = combo >= 2;
  return (
    <AnimatePresence>
      {show && (
        <motion.span key={combo} className={`text-caption uppercase tracking-[.8px] ${combo >= 5 ? "text-yellow" : "text-green-text"} ${className}`}
          initial={{ scale: 1.5, y: -6, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0, transition: { duration: 0.2 } }}
          transition={{ type: "spring", stiffness: 600, damping: 20 }}>
          Combo <span className="normal-case">x</span>{combo}
        </motion.span>
      )}
    </AnimatePresence>
  );
}
