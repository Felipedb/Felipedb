// Formatos de escolha (VISUAL_SPEC 6.3): image-choice, choice-en-pt, choice-pt-en, listen, listen-choice, read,
// dialogue, quiz, verse e missing-word. Um só componente: muda o enunciado, a mídia e o formato das opções.
// O estado da sessão chega por props (answer, checked, fb) para o exercício que sai na transição ficar congelado.
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { session, setAnswer } from "../../core/session.js";
import { useSessionVersion } from "../../core/useSession.js";
import { blankRegex } from "../../core/util.js";
import { speak } from "../../core/audio.js";
import { SPRING, SHAKE, PULSE } from "../../core/motion.js";
import { sfx } from "../../core/sfx.js";
import { haptic } from "../../core/haptics.js";
import Option, { OptionGroup, ImageCard } from "../ui/Option.jsx";
import Card from "../ui/Card.jsx";
import { Gap } from "../ui/TextCard.jsx";
import Button3D from "../ui/Button3D.jsx";
import CharacterBubble, { useExerciseChar } from "./CharacterBubble.jsx";
import { Sayable } from "./Sayable.jsx";
import { TITLES, Title, useAutoplay, optionState } from "./shared.jsx";

// Formatos em que tocar a opção (em inglês) a fala
const SPEAK_OPTION = ["choice-pt-en", "listen", "verse", "missing-word", "read", "dialogue", "quiz"];
// Uma coluna (358) para frases e opções longas; duas (174) para palavras soltas
const ONE_COL = ["choice-en-pt", "listen-choice", "read", "dialogue", "quiz", "missing-word"];

function gapParts(text, blank) {
  const m = blankRegex(blank).exec(text);
  if (!m) return null;
  return [text.slice(0, m.index).trim(), text.slice(m.index + m[0].length).trim()];
}

// Frase com lacuna: Sayable antes e depois, Gap no meio (preenchida pela opção escolhida)
function GapSentence({ parts, value, blank, state, chosen, ch }) {
  return (
    <p className="text-sentence text-ink">
      {parts[0] && <><Sayable text={parts[0]} char={ch} />{" "}</>}
      <Gap value={value} blank={blank} display state={state} className={state === "idle" && chosen ? "border-blue-line text-blue-text" : ""} />
      {parts[1] && <>{" "}<Sayable text={parts[1]} char={ch} /></>}
    </p>
  );
}

// Leitura: texto em inglês com dicas, tradução sob demanda, linha e pergunta
function Reading({ r, ch }) {
  const [pt, setPt] = useState(false);
  return (
    <Card className="mb-6">
      <p className="text-sentence text-ink"><Sayable text={r.text} char={ch} hints /></p>
      <AnimatePresence initial={false}>
        {pt && (
          <motion.p key="pt" className="mt-2 text-secondary text-ink-soft" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0, transition: { duration: 0.15 } }}>
            {r.pt}
          </motion.p>
        )}
      </AnimatePresence>
      <div className="-ml-3 mt-1">
        <Button3D variant="ghost" tone="blue" size="sm" onClick={() => setPt((v) => !v)} sound={false} aria-expanded={pt}>
          {pt ? "Ocultar tradução" : "Ver em português"}
        </Button3D>
      </div>
      <p className="mt-3 border-t-2 border-line pt-3 text-heading text-ink"><Sayable text={r.q} char={ch} /></p>
    </Card>
  );
}

// Chip de palavra do versículo (44 px, borda 2 + 4), com os mesmos contratos de uma opção
const CHIP = {
  idle: "border-line bg-page text-ink hover:bg-raised",
  selected: "border-blue-line bg-blue-soft text-blue-text dark:bg-raised",
  correct: "border-green-line bg-green-soft text-green-text dark:bg-raised",
  wrong: "border-red-line bg-red-soft text-red-text dark:bg-raised",
  disabled: "border-line bg-page text-ink opacity-70",
};
function WordChip({ index, value, state, onSelect, children }) {
  const interactive = state === "idle" || state === "selected";
  return (
    <motion.button type="button" role="radio" aria-checked={state === "selected" || state === "correct"} aria-disabled={!interactive || undefined}
      data-opt={index + 1} data-value={value}
      onClick={() => { if (!interactive) return; sfx("select"); haptic("select"); onSelect(value); }}
      className={`inline-flex h-11 items-center rounded-md border-2 border-b-4 px-4 text-body font-bold ${CHIP[state] || CHIP.idle}`}
      animate={state === "wrong" ? { x: SHAKE.x } : state === "correct" ? { scale: PULSE.scale } : { x: 0, scale: 1 }}
      transition={state === "wrong" ? SHAKE.transition : state === "correct" ? PULSE.transition : SPRING.snap}
      whileTap={interactive ? { y: 2, borderBottomWidth: 2 } : undefined}>
      {children}
    </motion.button>
  );
}

export default function ChoiceExercise({ ex, answer = null, checked = false, fb = null }) {
  useSessionVersion();
  const t = ex.type;
  const ok = !!(fb && fb.ok);
  const ch = useExerciseChar();
  const autoplay = t === "listen" ? ex.word.en
    : t === "listen-choice" ? ex.sentence.en
    : t === "dialogue" ? ex.dialogue.line
    : t === "quiz" ? ex.quiz.q
    : (t === "image-choice" || t === "choice-en-pt") ? ex.word.en
    : null;
  useAutoplay(autoplay, ch);
  // Ao acertar diálogo ou quiz, a resposta é falada pela voz do personagem (6.3 #18)
  if (t === "dialogue" || t === "quiz") {
    ex.onChecked = (good) => { if (good && ex.audioAfter) setTimeout(() => speak(ex.audioAfter, { char: ch }), 350); };
  }

  const opts = useMemo(() => ex.options.map((o) => (typeof o === "string" ? { value: o, label: o } : { value: o.pt, label: o.pt, icon: o.icon })), [ex]);
  const parts = t === "verse" ? gapParts(ex.verse.text, ex.verse.blank) : t === "missing-word" ? gapParts(ex.sentence.en, ex.blank) : null;
  const gapState = checked ? (ok ? "ok" : "bad") : "idle";
  const pick = (value) => {
    if (session.checked) return;
    setAnswer(value);
    if (SPEAK_OPTION.includes(t)) speak(value, { char: ch });
  };
  const stateOf = (o) => optionState(o.value, { answer, checked, correct: ex.correct });
  const cols = ONE_COL.includes(t) ? 1 : 2;

  return (
    <div>
      <Title>{TITLES[t]}</Title>

      {/* Enunciado e mídia */}
      {(t === "image-choice" || t === "choice-en-pt") && (
        <CharacterBubble ch={ch} audio={ex.word.en} checked={checked} ok={ok}><Sayable text={ex.word.en} char={ch} /></CharacterBubble>
      )}
      {t === "choice-pt-en" && (
        <CharacterBubble ch={ch} checked={checked} ok={ok}>
          <span className="inline-flex items-center gap-2">
            {ex.word.icon && <span className="emoji text-2xl" aria-hidden>{ex.word.icon}</span>}
            <span>{ex.word.pt}</span>
          </span>
        </CharacterBubble>
      )}
      {(t === "listen" || t === "listen-choice") && (
        <CharacterBubble ch={ch} wave slow audio={t === "listen" ? ex.word.en : ex.sentence.en} checked={checked} ok={ok} />
      )}
      {t === "read" && <Reading r={ex.reading} ch={ch} />}
      {t === "dialogue" && (
        <CharacterBubble ch={ch} audio={ex.dialogue.line} checked={checked} ok={ok}>
          <Sayable text={ex.dialogue.line} char={ch} hints />
          <span className="mt-1 block text-secondary text-ink-soft">{ex.dialogue.pt}</span>
        </CharacterBubble>
      )}
      {t === "quiz" && (
        <CharacterBubble ch={ch} audio={ex.quiz.q} checked={checked} ok={ok}><Sayable text={ex.quiz.q} char={ch} hints /></CharacterBubble>
      )}
      {t === "missing-word" && (
        <>
          <CharacterBubble ch={ch} checked={checked} ok={ok}><span>{ex.sentence.pt}</span></CharacterBubble>
          {parts && (
            <Card className="mb-6 min-h-[134px]">
              <GapSentence parts={parts} value={answer == null ? "" : String(answer)} blank={ex.blank} state={gapState} chosen={answer != null} ch={ch} />
            </Card>
          )}
        </>
      )}
      {t === "verse" && parts && (
        <Card variant="parchment" className="mb-6">
          <GapSentence parts={parts} value={answer == null ? "" : String(answer)} blank={ex.verse.blank} state={gapState} chosen={answer != null} ch={ch} />
          <p className="mt-2 text-secondary text-parchment-text">{ex.verse.ref}</p>
        </Card>
      )}

      {/* Opções */}
      {t === "image-choice" ? (
        <OptionGroup cols={2} label="Opções">
          {opts.map((o, i) => (
            <ImageCard key={o.value + i} index={i} value={o.value} icon={o.icon} state={stateOf(o)} onSelect={pick}>{o.label}</ImageCard>
          ))}
        </OptionGroup>
      ) : t === "verse" ? (
        <div role="radiogroup" aria-label="Opções" className="flex flex-wrap gap-2.5">
          {opts.map((o, i) => (
            <WordChip key={o.value + i} index={i} value={o.value} state={stateOf(o)} onSelect={pick}>{o.label}</WordChip>
          ))}
        </div>
      ) : (
        <OptionGroup cols={cols} label="Opções">
          {opts.map((o, i) => (
            <Option key={o.value + i} index={i} value={o.value} state={stateOf(o)} onSelect={pick} cols={cols} shortcut>
              {o.icon && <span className="emoji mr-2 text-2xl" aria-hidden>{o.icon}</span>}
              {o.label}
            </Option>
          ))}
        </OptionGroup>
      )}
    </div>
  );
}
