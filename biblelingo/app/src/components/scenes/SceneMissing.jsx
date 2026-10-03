// Fala do herói com uma palavra faltando (VISUAL_SPEC 6.3 #22 scene-missing): balão do herói com a lacuna
// sublinhada (preenchida pela opção escolhida) e 3 opções em 1 coluna; ao acertar, a fala é revelada e tocada.
import { useRef } from "react";
import { session } from "../../core/session.js";
import { useSessionVersion } from "../../core/useSession.js";
import { castChar } from "../../core/content.js";
import { speak } from "../../core/audio.js";
import { Gap } from "../ui/TextCard.jsx";
import { inputState } from "../exercises/shared.jsx";
import { SceneTitle, SceneChat, ChatMsg, SceneOptions, HeroReveal, Pt, nameChanges, sceneOf, gapParts, useRevealBelow } from "./shared.jsx";

export default function SceneMissing({ ex, checked = false, fb = null }) {
  useSessionVersion();
  const sc = sceneOf(ex);
  const line = sc.lines[ex.li];
  const hero = castChar(sc.char);
  session.voiceChar = hero;
  ex.onChecked = (ok) => {
    if (ok) speak(line.en, { char: hero });
  };
  const [before, after] = gapParts(line.en, ex.blank);
  const ok = !!(fb && fb.ok);
  const zone = useRef(null);
  useRevealBelow(zone, checked);

  return (
    <div>
      <SceneTitle>Complete a fala:</SceneTitle>
      <SceneChat sc={sc} upto={ex.li}>
        <ChatMsg sc={sc} line={line} now showName={nameChanges(sc, ex.li)}>
          {checked && ok ? (
            <HeroReveal line={line} />
          ) : (
            <>
              <span className="leading-[34px]">
                {before}
                <Gap display value={session.answer || ""} blank={ex.blank} state={inputState(checked, ok)} />
                {after}
              </span>
              <Pt>{line.pt}</Pt>
            </>
          )}
        </ChatMsg>
      </SceneChat>
      <div ref={zone}>
        <SceneOptions ex={ex} cols={1} label="Palavra que falta" onSelect={(opt) => speak(opt, { char: hero })} />
      </div>
    </div>
  );
}
