// Option, OptionGroup e ImageCard (VISUAL_SPEC 5.14).
// Option: altura mínima 56 (52 + 4), raio 12, borda 2 + 4 --color-line, padding 0 16, text-sentence 19/500 à esquerda.
//   Props: index (0-based: data-opt={index+1}), value (data-value), state "idle" | "selected" | "correct" | "wrong" | "disabled",
//          onSelect(value), shortcut (mostra o número 1 a 4 em caixa 24x24 à direita), cols (1 ou 2: em 2 colunas a desabilitada fica a 70%),
//          children (rótulo) · role="radio" aria-checked; toque: afunda 2 px, sfx("select"), haptic("select"); wrong: SHAKE; correct: PULSE
// OptionGroup: role="radiogroup", 1 coluna (358) para frases, 2 colunas (174) para palavras soltas, gap 10, cascata STAGGER.options.
// ImageCard: 174x140, raio 16, ilustração 64 a 80 (emoji de conteúdo em span.emoji até haver arte), legenda text-body 17/500.
// Exemplo: <OptionGroup cols={1}>{opts.map((o, i) => <Option key={o.value} index={i} value={o.value} state={...} onSelect={pick}>{o.label}</Option>)}</OptionGroup>
import { motion } from "motion/react";
import { SPRING, STAGGER, SHAKE, PULSE, list, item } from "../../core/motion.js";
import { sfx } from "../../core/sfx.js";
import { haptic } from "../../core/haptics.js";

const STATE = {
  idle: "border-line bg-page text-ink hover:bg-raised",
  selected: "border-blue-line bg-blue-soft text-blue-text dark:bg-raised",
  correct: "border-green-line bg-green-soft text-green-text dark:bg-raised",
  wrong: "border-red-line bg-red-soft text-red-text dark:bg-raised",
  disabled: "border-line bg-page text-ink",
};

function animFor(state) {
  if (state === "wrong") return { x: SHAKE.x, y: 0 };
  if (state === "correct") return { scale: PULSE.scale, y: 0 };
  return { x: 0, scale: 1, y: 0 };
}
function transFor(state) {
  if (state === "wrong") return { ...SHAKE.transition, y: SPRING.snap };
  if (state === "correct") return { ...PULSE.transition, y: SPRING.snap };
  return SPRING.snap;
}

export default function Option({ index = 0, value, state = "idle", onSelect, shortcut = false, cols = 1, className = "", children, ...rest }) {
  const interactive = state === "idle" || state === "selected";
  const click = () => {
    if (!interactive) return;
    sfx("select");
    haptic("select");
    onSelect && onSelect(value);
  };
  return (
    <motion.button type="button" role="radio" aria-checked={state === "selected" || state === "correct"} aria-disabled={!interactive || undefined}
      data-opt={index + 1} data-value={value} onClick={click} variants={item(SPRING.settle, 10)}
      className={`flex min-h-14 w-full items-center gap-3 rounded-md border-2 border-b-4 px-4 py-2 text-left text-sentence ${STATE[state] || STATE.idle} ${state === "disabled" && cols === 2 ? "opacity-70" : ""} ${className}`}
      animate={animFor(state)} transition={transFor(state)} whileTap={interactive ? { y: 2, borderBottomWidth: 2 } : undefined} {...rest}>
      <span className="min-w-0 flex-1">{children}</span>
      {shortcut && (
        <span aria-hidden className="hidden h-6 w-6 shrink-0 items-center justify-center rounded-[6px] border-2 border-line text-caption text-disabled lg:inline-flex">{index + 1}</span>
      )}
    </motion.button>
  );
}

export function OptionGroup({ cols = 1, label, className = "", children, ...rest }) {
  return (
    <motion.div role="radiogroup" aria-label={label} className={`grid gap-2.5 ${cols === 2 ? "grid-cols-2" : "grid-cols-1"} ${className}`}
      variants={list(STAGGER.options)} initial="hidden" animate="show" {...rest}>
      {children}
    </motion.div>
  );
}

export function ImageCard({ index = 0, value, icon, image, state = "idle", onSelect, className = "", children, ...rest }) {
  const interactive = state === "idle" || state === "selected";
  const click = () => { if (!interactive) return; sfx("select"); haptic("select"); onSelect && onSelect(value); };
  return (
    <motion.button type="button" role="radio" aria-checked={state === "selected" || state === "correct"} aria-disabled={!interactive || undefined}
      data-opt={index + 1} data-value={value} onClick={click} variants={item(SPRING.settle, 10)}
      className={`relative flex h-[140px] w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-b-4 px-3 text-body ${STATE[state] || STATE.idle} ${state === "disabled" ? "opacity-70" : ""} ${className}`}
      animate={animFor(state)} transition={transFor(state)} whileTap={interactive ? { y: 2, borderBottomWidth: 2 } : undefined} {...rest}>
      <span aria-hidden className="absolute right-2 top-2 hidden h-6 w-6 items-center justify-center rounded-[6px] border-2 border-line text-caption text-disabled lg:inline-flex">{index + 1}</span>
      {image ? <img src={image} alt="" className="h-16 w-16 object-contain" draggable="false" /> : icon ? <span className="emoji text-[56px] leading-none" aria-hidden>{icon}</span> : null}
      <span className="truncate">{children}</span>
    </motion.button>
  );
}
