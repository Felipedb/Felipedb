// Chest (VISUAL_SPEC 5.22): baú SVG em partes (.chest-body, .chest-lid com transform-origin na dobradiça, .chest-lock,
// 8 .coin ocultas): 56 na trilha, 40 nas missões, 96 no Result.
// Estados: "locked" (cinzas) | "ready" (idle: rotate [0,-6,6,-4,4,0] 600 ms, repeatDelay 1.6, brilho pulsante #fff3bf)
//          | "opening" (sequência: squash 80 ms, tampa salta, moedas voam até targetRef em 420 ms EASE.out) | "opened" (tampa aberta, rótulo "+N XP")
// Props:
//   size, state, reward (XP), onOpen(reward) chamado ao fim da sequência, targetRef (ref do StatCard XP para as moedas),
//   label (texto sob o baú, padrão "+N XP" quando aberto), className · Som sparkle + coin; haptic("chest"); confete pequeno no centro do baú.
// Exemplo: <Chest size={96} state={r.chest ? "opened" : "ready"} reward={5} onOpen={openChest} targetRef={xpRef} />
import { useState } from "react";
import { motion, useAnimate, stagger, useReducedMotion } from "motion/react";
import confettiFx from "canvas-confetti";
import { DUR, EASE } from "../../core/motion.js";
import { sfx } from "../../core/sfx.js";
import { haptic } from "../../core/haptics.js";
import { chestParts } from "../../icons/index.js";
import { renderParts } from "../Icon.jsx";

export default function Chest({ size = 56, state = "ready", reward = 0, onOpen, targetRef, label, className = "", ...rest }) {
  const reduce = useReducedMotion();
  const [scope, animate] = useAnimate();
  const [busy, setBusy] = useState(false);
  const opened = state === "opened";
  const locked = state === "locked";
  const ready = state === "ready" && !busy;

  async function open() {
    if (!ready || busy) return;
    setBusy(true);
    haptic("chest");
    const el = scope.current;
    const rect = el ? el.getBoundingClientRect() : null;
    if (!reduce) await animate(el, { scaleY: 0.85 }, { duration: DUR.micro });
    animate(el, { scaleY: 1 }, { type: "spring", stiffness: 400, damping: 18 });
    animate(".chest-lid", { y: -size * 0.12, rotate: -14 }, { type: "spring", stiffness: 400, damping: 18 });
    animate(".chest-lock", { opacity: 0 }, { duration: 0.12 });
    sfx("sparkle");
    if (!reduce && rect) {
      try {
        confettiFx({ particleCount: 30, spread: 60, startVelocity: 25, scalar: 0.8, ticks: 120, origin: { x: (rect.left + rect.width / 2) / window.innerWidth, y: (rect.top + rect.height / 2) / window.innerHeight } });
      } catch (e) { /* sem confete */ }
    }
    // Moedas voam até o card de XP (ou sobem e somem sem alvo)
    let dx = 0, dy = -60;
    if (targetRef && targetRef.current && rect) {
      const t = targetRef.current.getBoundingClientRect();
      dx = (t.left + t.width / 2 - (rect.left + rect.width / 2)) / (size / 24);
      dy = (t.top + t.height / 2 - (rect.top + rect.height / 2)) / (size / 24);
    }
    [0, 1, 2].forEach((i) => setTimeout(() => sfx("coin", i), 150 + i * 120));
    if (!reduce) await animate(".coin", { x: dx, y: dy, opacity: [0, 1, 1, 0], scale: [0.6, 1, 1, 0.8] }, { duration: 0.42, delay: stagger(0.04), ease: EASE.out });
    setBusy(false);
    onOpen && onOpen(reward);
  }

  const parts = chestParts({ open: opened, locked });
  const text = label != null ? label : opened && reward ? `+${reward} XP` : null;

  return (
    <div className={`relative inline-flex flex-col items-center ${className}`} {...rest}>
      {ready && !reduce && (
        <motion.span aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ width: size * 1.6, height: size * 1.6, background: "radial-gradient(closest-side, #fff3bf, rgba(255,243,191,0))" }}
          animate={{ opacity: [0.4, 0.9, 0.4] }} transition={{ duration: 1.6, repeat: Infinity }} />
      )}
      <motion.button type="button" ref={scope} onClick={open} disabled={!ready} aria-label={locked ? "Baú bloqueado" : opened ? `Baú aberto: ${reward} XP` : "Abrir baú"}
        className="relative block" style={{ width: size, height: size, transformOrigin: "50% 100%" }}
        animate={ready && !reduce ? { rotate: [0, -6, 6, -4, 4, 0] } : { rotate: 0 }}
        transition={ready && !reduce ? { duration: 0.6, repeat: Infinity, repeatDelay: 1.6 } : { duration: 0.2 }}>
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false" style={{ overflow: "visible" }}>
          <g className="chest-body">{renderParts(parts, false)}</g>
          {Array.from({ length: 8 }, (_, i) => (
            <circle key={i} className="coin" cx={12} cy={11} r={1.6} fill="#ffc800" stroke="#e5a600" strokeWidth={0.6} opacity={0} />
          ))}
        </svg>
        <span className="absolute -inset-3" aria-hidden />
      </motion.button>
      {text && <span className="mt-1 text-caption uppercase tracking-[.8px] text-yellow-text">{text}</span>}
    </div>
  );
}
