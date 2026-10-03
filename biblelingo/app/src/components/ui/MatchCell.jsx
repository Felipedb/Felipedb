// MatchCell e MatchGrid (VISUAL_SPEC 5.15): célula 166x87 (texto) ou 166x69 (áudio: speaker 24 + 12 barras),
// raio 16, borda 2 + 4, text-sentence centralizado; grade 2 colunas gap-x-6 gap-y-5. data-side e data-key preservados.
// Props:
//   side ("en" | "pt"), keyId (data-key), label, audio (célula de áudio), playing,
//   state "idle" | "selected" | "correct" (verde 300 ms + scale 1.08) | "wrong" (vermelho + SHAKE) | "done" (desbotada, sem toque) | "gone" (Madness: afunda e some)
//   onClick, index (pitch do pop), className; Madness passa data-md-cell nos ...rest
// Exemplo: <MatchGrid>{cells.map((c) => <MatchCell key={c.id} side={c.side} keyId={c.key} label={c.label} state={stateOf(c)} onClick={() => tap(c)} />)}</MatchGrid>
import { motion } from "motion/react";
import { SPRING, SHAKE } from "../../core/motion.js";
import Icon from "../Icon.jsx";

const STATE = {
  idle: "border-line bg-page text-ink hover:bg-raised",
  selected: "border-blue-line bg-blue-soft text-blue-text dark:bg-raised",
  correct: "border-green-line bg-green-soft text-green-text dark:bg-raised",
  wrong: "border-red-line bg-red-soft text-red-text dark:bg-raised",
  done: "border-line bg-page text-disabled pointer-events-none",
  gone: "border-line bg-page text-disabled pointer-events-none",
};

const BARS = [8, 14, 20, 12, 18, 24, 16, 22, 10, 19, 15, 9];

export default function MatchCell({ side, keyId, label, audio = false, playing = false, state = "idle", onClick, index = 0, className = "", ...rest }) {
  const interactive = state === "idle" || state === "selected";
  const anim = state === "wrong" ? { x: SHAKE.x, scale: 1, opacity: 1 }
    : state === "correct" ? { scale: [1, 1.08, 1], x: 0, opacity: 1 }
    : state === "gone" ? { scale: 0.9, opacity: 0, x: 0 }
    : { x: 0, scale: 1, opacity: 1 };
  const trans = state === "wrong" ? SHAKE.transition : state === "correct" ? { duration: 0.3 } : state === "gone" ? { duration: 0.2 } : SPRING.snap;
  return (
    <motion.button type="button" data-side={side} data-key={keyId} onClick={interactive ? onClick : undefined} aria-disabled={!interactive || undefined}
      aria-label={audio ? "Ouvir" : label}
      className={`flex w-full items-center justify-center rounded-lg border-2 border-b-4 px-3 text-center text-sentence ${audio ? "h-[69px] gap-3" : "h-[87px]"} ${STATE[state] || STATE.idle} ${className}`}
      animate={anim} transition={trans} whileTap={interactive ? { y: 2, borderBottomWidth: 2 } : undefined} {...rest}>
      {audio ? (
        <span className={`flex items-center gap-2 text-accent ${playing ? "speaker-playing wave-playing" : ""}`}>
          <Icon name="speaker" size={24} />
          <span className="flex h-7 items-center gap-[3px]" aria-hidden>
            {BARS.map((h, i) => <span key={i} className="wave-bar w-[3px] rounded-[2px] bg-current" style={{ height: h, animationDelay: `${i * 60}ms` }} />)}
          </span>
        </span>
      ) : <span className="line-clamp-2">{label}</span>}
    </motion.button>
  );
}

export function MatchGrid({ className = "", children, ...rest }) {
  return <div className={`grid grid-cols-2 gap-x-6 gap-y-5 ${className}`} {...rest}>{children}</div>;
}
