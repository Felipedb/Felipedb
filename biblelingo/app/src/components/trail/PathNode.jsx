// PathNode (VISUAL_SPEC 5.2): botão circular de 70 px, face --unit-color, sombra dura 0 8px 0 --unit-shadow, ícone SVG 32 em
// --unit-ink; área de toque 86x86. Estados: locked (cinza, cadeado, popover cinza) | available (atual: anel segmentado, halo
// e balão) | done (check) | scene-done (retrato 62 com anel do capítulo e badge check). Press: afunda 8 px, sfx tap, haptic select.
// O wrapper mantém data-node / data-order / data-current e o primeiro <button> do wrapper é o nó (contrato 10.1). No nó
// bloqueado o botão visual fica disabled (os drivers o ignoram) e um segundo botão transparente abre o popover cinza.
// TrophyNode: nó dourado do fim do capítulo (anel de 5 coroas; 5/5 vira coroa com --glow-ring e selo "Lendário").
// TrailChest e TrailCharacter: baú (56 sobre elipse 48x12) e personagem (CharacterStage trail) ao lado do caminho.
// Props do PathNode: step, order, status, isCurrent, x, icon, ch, label, balloon (texto ou null), balloonHidden,
//   ringSegments, ringValue, celebrate (nó recém-concluído: pulo + estrelas), delayed (nó atual novo: anel e balão
//   entram depois da comemoração do anterior), stars, onOpen(anchorEl)
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { SPRING } from "../../core/motion.js";
import { sfx } from "../../core/sfx.js";
import { haptic } from "../../core/haptics.js";
import Icon from "../Icon.jsx";
import { SegmentRing, Avatar, Chest, CharacterStage } from "../ui/index.js";
import NodeBalloon from "./NodeBalloon.jsx";

const NODE = "relative flex h-[70px] w-[70px] items-center justify-center rounded-full before:absolute before:-inset-2 before:rounded-full before:content-['']";
const ENTER = { initial: { opacity: 0, y: 12 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-10px" }, transition: SPRING.settle };

// Estrelas em cascata acima do nó recém-concluído (100 ms entre elas, scale 0 -> 1.3 -> 1, somem após 1,2 s)
function CelebrationStars({ n }) {
  const [show, setShow] = useState(true);
  useEffect(() => {
    const ts = [0, 1, 2].map((i) => setTimeout(() => sfx("pop", i), 300 + i * 100));
    const t = setTimeout(() => setShow(false), 1700);
    return () => { clearTimeout(t); ts.forEach(clearTimeout); };
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.span className="pointer-events-none absolute -top-8 left-1/2 z-[2] flex gap-1" style={{ x: "-50%" }}
          exit={{ opacity: 0, y: -6, transition: { duration: 0.3 } }} aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: [0, 1.3, 1] }} transition={{ delay: 0.3 + i * 0.1, duration: 0.35 }}>
              <Icon name={i < n ? "star" : "star-empty"} size={20} />
            </motion.span>
          ))}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

export default function PathNode({
  step, order, status = "locked", isCurrent = false, x = 0, icon = "star", ch = null, label, balloon = null, balloonHidden = false,
  ringSegments = 3, ringValue = 0, celebrate = false, delayed = false, stars = 0, onOpen,
}) {
  const reduce = useReducedMotion();
  const btnRef = useRef(null);
  const locked = status === "locked";
  const sceneDone = status === "scene-done";
  const open = () => {
    sfx("tap");
    haptic("select");
    onOpen && onOpen(btnRef.current);
  };
  const pop = celebrate && !reduce ? { scale: [0.6, 1.15, 1] } : { scale: 1 };

  return (
    <motion.div className={`relative shrink-0 ${isCurrent ? "z-[2]" : "z-[1]"}`} style={{ x }}
      data-node={step.id} data-order={order} data-current={isCurrent || undefined} {...ENTER}>
      <AnimatePresence>{balloon && !balloonHidden && <NodeBalloon key="balloon" label={balloon} delay={delayed ? 1.1 : 0.4} />}</AnimatePresence>
      {isCurrent && (
        <motion.span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: delayed ? 0.6 : 0.3, duration: 0.2 }}>
          <SegmentRing size={94} stroke={6} segments={ringSegments} value={ringValue} label={`Progresso da etapa: ${Math.round(ringValue * 100)}%`} />
        </motion.span>
      )}
      {celebrate && <CelebrationStars n={stars} />}
      <motion.span className="relative block" animate={pop} transition={{ type: "spring", stiffness: 350, damping: 14, delay: 0.2 }}>
        {locked ? (
          <>
            <button type="button" disabled tabIndex={-1} aria-hidden="true" className={`${NODE} bg-line`}
              style={{ boxShadow: "0 8px 0 var(--node-locked-shadow, var(--color-disabled))" }}>
              <Icon name="lock" size={32} />
            </button>
            <button ref={btnRef} type="button" aria-label={label} aria-haspopup="dialog" className="absolute -inset-2 rounded-full" onClick={open} />
          </>
        ) : (
          <motion.button ref={btnRef} type="button" aria-label={label} aria-haspopup="dialog" data-popover-anchor
            className={`${NODE} bg-unit ${isCurrent ? "node-halo" : ""}`}
            style={{ boxShadow: "0 8px 0 var(--unit-shadow)" }}
            whileTap={{ y: 8, boxShadow: "0 0 0 var(--unit-shadow)" }} transition={SPRING.snap} onClick={open}>
            {sceneDone ? (
              <Avatar ch={ch} size={62} alt="" />
            ) : (
              <Icon name={status === "done" ? "check" : icon} size={32} tone="mono" className="text-unit-ink" />
            )}
            {sceneDone && (
              <span className="absolute -bottom-0.5 -right-0.5 rounded-full bg-page p-[2px]"><Icon name="check-circle" size={20} /></span>
            )}
          </motion.button>
        )}
      </motion.span>
    </motion.div>
  );
}

export function TrophyNode({ x = 0, done = false, crowns = 0, max = 5, label, onOpen }) {
  const btnRef = useRef(null);
  const legendary = done && crowns >= max;
  const open = () => {
    sfx("tap");
    haptic("select");
    onOpen && onOpen(btnRef.current);
  };
  return (
    <motion.div className="relative z-[1] flex shrink-0 flex-col items-center" style={{ x }} data-trophy {...ENTER}>
      <span className="relative block">
        {done && (
          <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <SegmentRing size={94} stroke={6} segments={max} value={crowns / max} color="#ffc800" label={`${crowns} de ${max} coroas`} />
          </span>
        )}
        {legendary && <span aria-hidden className="pointer-events-none absolute inset-0 rounded-full" style={{ boxShadow: "var(--glow-ring)" }} />}
        <motion.button ref={btnRef} type="button" aria-label={label} aria-haspopup="dialog"
          className={`${NODE} ${done ? "bg-yellow" : "bg-line"}`}
          style={{ boxShadow: done ? "0 8px 0 #e5a600" : "0 8px 0 var(--node-locked-shadow, var(--color-disabled))" }}
          whileTap={{ y: 8, boxShadow: done ? "0 0 0 #e5a600" : "0 0 0 var(--node-locked-shadow, var(--color-disabled))" }}
          transition={SPRING.snap} onClick={open}>
          <Icon name={legendary ? "crown" : "trophy"} size={32} tone={done ? "#5b4400" : "var(--color-disabled)"} />
        </motion.button>
      </span>
      {legendary && <span className="mt-4 text-caption uppercase tracking-[.8px] text-yellow-text">Lendário</span>}
    </motion.div>
  );
}

// Baú ao lado do caminho: 56 px sobre elipse de sombra 48x12 (--color-line); balança quando alcançável
export function TrailChest({ status = "locked", side = "right", onOpen }) {
  return (
    <div className={`absolute top-1/2 z-[1] -translate-y-1/2 ${side === "left" ? "left-7" : "right-7"}`}>
      <span aria-hidden className="absolute bottom-[-2px] left-1/2 h-3 w-12 -translate-x-1/2 rounded-full bg-line" />
      <Chest size={56} state={status} reward={5} onOpen={onOpen} label={status === "opened" ? "+5 XP" : ""} />
    </div>
  );
}

// Personagem ilustrado ao lado do caminho (CharacterStage trail, 140 px), entra uma vez com fade + y 12
export function TrailCharacter({ ch, side = "left" }) {
  if (!ch) return null;
  return (
    <motion.div className={`pointer-events-none absolute top-1/2 -translate-y-1/2 ${side === "left" ? "left-0" : "right-0"}`}
      initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-20px" }} transition={SPRING.settle}>
      <CharacterStage ch={ch} variant="trail" />
    </motion.div>
  );
}
