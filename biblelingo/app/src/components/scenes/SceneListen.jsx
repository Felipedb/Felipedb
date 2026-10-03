// Fala do outro personagem em segredo (VISUAL_SPEC 6.3 #22 scene-listen): balão com alto-falante inline e "···";
// o aluno escolhe a tradução em 1 coluna; ao checar, a fala é revelada. Toca ao entrar e ao tocar no alto-falante.
import { useRef } from "react";
import { session } from "../../core/session.js";
import { useSessionVersion } from "../../core/useSession.js";
import { castChar, sceneNameOf } from "../../core/content.js";
import AudioButton from "../ui/AudioButton.jsx";
import { useAutoplay } from "../exercises/shared.jsx";
import { SceneTitle, SceneChat, ChatMsg, SceneLabel, SceneOptions, Pt, nameChanges, sceneOf, useRevealBelow } from "./shared.jsx";

export default function SceneListen({ ex, checked = false }) {
  useSessionVersion();
  const sc = sceneOf(ex);
  const line = sc.lines[ex.li];
  const ch = castChar(line.who);
  session.voiceChar = ch;
  useAutoplay(line.en, ch);
  const name = sceneNameOf(line.who);
  const zone = useRef(null);
  useRevealBelow(zone, checked);

  return (
    <div>
      <SceneTitle>O que {name} disse?</SceneTitle>
      <SceneChat sc={sc} upto={ex.li}>
        <ChatMsg sc={sc} line={line} now showName={nameChanges(sc, ex.li)}>
          <div className="flex items-start gap-2.5">
            <AudioButton text={line.en} char={ch} className="-ml-1 mt-[-1px]" />
            <div className="min-w-0">
              {checked ? (
                <span>{line.en}</span>
              ) : (
                <span className="select-none tracking-[.3em] text-ink-soft" aria-label="Fala escondida: ouça e escolha a tradução">···</span>
              )}
              {checked && <Pt>{line.pt}</Pt>}
            </div>
          </div>
        </ChatMsg>
      </SceneChat>
      <div ref={zone}>
        <SceneLabel>Em português, {name} disse:</SceneLabel>
        <SceneOptions ex={ex} cols={1} label="Tradução da fala" />
      </div>
    </div>
  );
}
