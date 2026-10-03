// Complete a fala do herói (VISUAL_SPEC 6.3 #22 scene-gap): lacuna digitada (Gap, sublinhado simples, com
// data-answer-input) dentro do balão do herói, foco automático, Enter verifica; dica com o ícone lightbulb.
import { useRef } from "react";
import { session, setAnswer, check } from "../../core/session.js";
import { useSessionVersion } from "../../core/useSession.js";
import { castChar, sceneNameOf } from "../../core/content.js";
import { speak } from "../../core/audio.js";
import { normalize } from "../../core/util.js";
import { Gap } from "../ui/TextCard.jsx";
import Icon from "../Icon.jsx";
import { inputState } from "../exercises/shared.jsx";
import { SceneTitle, SceneChat, ChatMsg, HeroReveal, Pt, nameChanges, sceneOf, gapParts, useRevealBelow } from "./shared.jsx";

export default function SceneGap({ ex, checked = false, fb = null }) {
  useSessionVersion();
  const sc = sceneOf(ex);
  const line = sc.lines[ex.li];
  const hero = castChar(sc.char);
  session.voiceChar = hero;
  ex.onChecked = (ok) => {
    if (ok) speak(line.en, { char: hero });
  };
  const [before, after] = gapParts(line.en, ex.blank);
  const hint = sc.vocab.find((v) => normalize(v.en.replace(/^to /, "")) === normalize(ex.blank));
  const ok = !!(fb && fb.ok);
  const zone = useRef(null);
  useRevealBelow(zone, checked);

  return (
    <div>
      <SceneTitle>Complete a fala de {sceneNameOf(sc.char)}:</SceneTitle>
      <SceneChat sc={sc} upto={ex.li}>
        <ChatMsg sc={sc} line={line} now showName={nameChanges(sc, ex.li)}>
          {checked && ok ? (
            <HeroReveal line={line} />
          ) : (
            <>
              <span className="leading-[34px]">
                {before}
                <Gap value={session.answer || ""} blank={ex.blank} state={inputState(checked, ok)} disabled={checked} autoFocus
                  onChange={setAnswer} onSubmit={() => { if (session.answer && String(session.answer).trim()) check(); }} />
                {after}
              </span>
              <Pt>{line.pt}</Pt>
            </>
          )}
        </ChatMsg>
      </SceneChat>
      <div ref={zone} className="flex items-center gap-2 text-secondary text-ink-soft">
        <Icon name="lightbulb" size={20} />
        <span>{hint ? <>Dica: <b className="font-bold text-ink">{hint.pt}</b></> : "Dica: a palavra está no vocabulário da cena ou na tradução"}</span>
      </div>
    </div>
  );
}
