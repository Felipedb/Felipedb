// Formatos de digitação (VISUAL_SPEC 5.18 e 6.3): "type" (palavra pt -> en), "listen-type" (ouça e digite) e
// "complete-translation" (Gap como input inline na frase em inglês). O TextCard é um <textarea data-answer-input>.
import { session, setAnswer, check } from "../../core/session.js";
import { useSessionVersion } from "../../core/useSession.js";
import { blankRegex } from "../../core/util.js";
import TextCard, { Gap } from "../ui/TextCard.jsx";
import Card from "../ui/Card.jsx";
import CharacterBubble, { useExerciseChar } from "./CharacterBubble.jsx";
import { Sayable, HintedText } from "./Sayable.jsx";
import { TITLES, Title, useAutoplay, inputState } from "./shared.jsx";

export default function TypeInput({ ex, answer = null, checked = false, fb = null }) {
  useSessionVersion();
  const t = ex.type;
  const ok = !!(fb && fb.ok);
  const ch = useExerciseChar();
  useAutoplay(t === "listen-type" ? ex.sentence.en : null, ch);
  const value = answer == null ? "" : String(answer);
  const state = inputState(checked, ok);
  const submit = () => { if (!session.checked && String(session.answer || "").trim() !== "") check(); };

  if (t === "complete-translation") {
    const m = blankRegex(ex.blank).exec(ex.sentence.en);
    const before = m ? ex.sentence.en.slice(0, m.index).trim() : "";
    const after = m ? ex.sentence.en.slice(m.index + m[0].length).trim() : "";
    return (
      <div>
        <Title>{TITLES[t]}</Title>
        <CharacterBubble ch={ch} checked={checked} ok={ok}><HintedText pt={ex.sentence.pt} char={ch} /></CharacterBubble>
        {m ? (
          <Card className="min-h-[134px]">
            <p className="text-sentence text-ink">
              {before && <><Sayable text={before} char={ch} />{" "}</>}
              <Gap value={value} onChange={setAnswer} onSubmit={submit} blank={ex.blank} state={state} disabled={checked} autoFocus />
              {after && <>{" "}<Sayable text={after} char={ch} /></>}
            </p>
          </Card>
        ) : (
          <TextCard value={value} onChange={setAnswer} onSubmit={submit} state={state} disabled={checked} placeholder="Digite a palavra que falta" />
        )}
      </div>
    );
  }

  return (
    <div>
      <Title>{TITLES[t]}</Title>
      {t === "listen-type" ? (
        <CharacterBubble ch={ch} wave slow audio={ex.sentence.en} checked={checked} ok={ok} />
      ) : (
        <CharacterBubble ch={ch} checked={checked} ok={ok}>
          <span className="inline-flex items-center gap-2">
            {ex.word.icon && <span className="emoji text-2xl" aria-hidden>{ex.word.icon}</span>}
            <span>{ex.word.pt}</span>
          </span>
        </CharacterBubble>
      )}
      <TextCard value={value} onChange={setAnswer} onSubmit={submit} state={state} disabled={checked} placeholder="Digite em inglês" />
    </div>
  );
}
