// Tile, AnswerLines e WordBankCore (VISUAL_SPEC 5.13): núcleo visual do banco de palavras, usado por
// WordBank (lições) e SceneBuild (cenas). A integração com a sessão fica nos pais.
// Tile: peça 44 (40 + borda inferior 4), raio 12, text-sentence 19/500, data-tile preservado só no banco.
//   Props: word, state "idle" | "ok" | "bad" | "ghost", layoutId, index (pitch do som), dim (50% após checar), onClick, disabled, inBank
// AnswerLines: duas linhas de 2 px em top 44 e 98 (passo 54); as peças assentam a borda inferior sobre a linha.
//   Props: children, lines (padrão 2), live (texto do aria-live com a frase montada)
// WordBankCore: banco + zona de resposta com voo por layoutId (SPRING.layout) e pouso scale [1, 1.06, 1].
//   Props: bank (palavras), chosen (índices do banco na ordem escolhida), onChange(próximosÍndices), checked, ok,
//          prompt (slot acima da zona de resposta), footer (slot abaixo do banco: "USAR TECLADO"), onPick(word), onUnpick(word)
// Exemplo: <WordBankCore bank={ex.bank} chosen={chosen} onChange={setChosen} checked={checked} ok={ok} prompt={<Bubble .../>} />
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { SPRING } from "../../core/motion.js";
import { sfx } from "../../core/sfx.js";
import { haptic } from "../../core/haptics.js";

const TILE = "inline-flex h-11 items-center rounded-md border-2 border-b-4 px-4 text-sentence leading-none whitespace-nowrap";
const STATE = {
  idle: "border-line bg-page text-ink",
  ok: "border-green-line bg-page text-green-text",
  bad: "border-red-line bg-page text-red-text",
  ghost: "border-line bg-line text-transparent select-none",
};

export function Tile({ word, state = "idle", layoutId, index = 0, dim = false, onClick, disabled = false, inBank = false, className = "", ...rest }) {
  const [landed, setLanded] = useState(false);
  if (state === "ghost") return <span aria-hidden className={`${TILE} ${STATE.ghost} ${className}`}>{word}</span>;
  return (
    <motion.button type="button" layoutId={layoutId} onClick={onClick} disabled={disabled} aria-disabled={disabled || undefined}
      data-tile={inBank ? word : undefined}
      className={`${TILE} ${STATE[state] || STATE.idle} ${dim ? "opacity-50" : ""} ${disabled ? "" : "hover:bg-raised"} ${className}`}
      whileTap={disabled ? undefined : { y: 2, borderBottomWidth: 2 }}
      animate={landed ? { scale: [1, 1.06, 1] } : { scale: 1 }}
      transition={{ layout: SPRING.layout, scale: { duration: 0.18 }, y: SPRING.snap }}
      onLayoutAnimationComplete={() => { setLanded(true); setTimeout(() => setLanded(false), 200); }}
      {...rest}>
      {word}
    </motion.button>
  );
}

export function AnswerLines({ children, lines = 2, live = "", className = "" }) {
  const minH = 44 + (lines - 1) * 54 + 8;
  return (
    <div className={`relative ${className}`} style={{ minHeight: minH }}>
      {Array.from({ length: lines }, (_, i) => (
        <span key={i} aria-hidden className="pointer-events-none absolute inset-x-0 border-t-2 border-line" style={{ top: 44 + i * 54 }} />
      ))}
      <div className="flex flex-wrap content-start items-end gap-x-2 gap-y-2.5">{children}</div>
      <span className="sr-only" aria-live="polite">{live}</span>
    </div>
  );
}

let seq = 0;

export default function WordBankCore({ bank = [], chosen = [], onChange, checked = false, ok = false, prompt = null, footer = null, onPick, onUnpick, className = "" }) {
  const uid = useMemo(() => ++seq, []);
  const pick = (i) => {
    if (checked || chosen.includes(i)) return;
    sfx("tile", chosen.length);
    haptic("tile");
    onPick && onPick(bank[i]);
    onChange && onChange([...chosen, i]);
  };
  const unpick = (i) => {
    if (checked) return;
    sfx("tile", 0);
    haptic("tile");
    onUnpick && onUnpick(bank[i]);
    onChange && onChange(chosen.filter((j) => j !== i));
  };
  const answerState = checked ? (ok ? "ok" : "bad") : "idle";
  return (
    <div className={className}>
      {prompt}
      <AnswerLines className="mb-8" live={chosen.map((i) => bank[i]).join(" ")}>
        {chosen.map((i) => (
          <Tile key={i} layoutId={`tile-${uid}-${i}`} word={bank[i]} state={answerState} onClick={() => unpick(i)} disabled={checked} />
        ))}
      </AnswerLines>
      <div className="flex flex-wrap justify-center gap-x-2 gap-y-2.5">
        {bank.map((w, i) => (
          <span key={i} className="relative inline-block">
            <Tile word={w} state="ghost" className={chosen.includes(i) ? "" : "opacity-0"} />
            {!chosen.includes(i) && (
              <Tile layoutId={`tile-${uid}-${i}`} word={w} index={i} inBank onClick={() => pick(i)} disabled={checked} dim={checked} className="absolute inset-0" />
            )}
          </span>
        ))}
      </div>
      {footer && <div className="mt-4 flex justify-center">{footer}</div>}
    </div>
  );
}
