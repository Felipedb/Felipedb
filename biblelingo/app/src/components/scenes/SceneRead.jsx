// Batida da conversa: uma ou duas falas lidas com áudio, tocadas em sequência
// com quem fala em destaque. Porta fiel de renderSceneRead (scene-engine.js).
import { useEffect, useState } from "react";
import { session } from "../../core/session.js";
import { useSessionVersion } from "../../core/useSession.js";
import { castChar, sceneNameOf } from "../../core/content.js";
import AudioButton from "../exercises/AudioButton.jsx";
import { Sayable } from "../exercises/Sayable.jsx";
import { SceneChat, SceneHeader, SceneMsg, Who, Pt, sceneOf, useSilentCard, useSpeakChain } from "./shared.jsx";

export default function SceneRead({ ex }) {
  useSessionVersion();
  const sc = sceneOf(ex);
  const lis = ex.lis;
  const first = sc.lines[lis[0]];
  session.voiceChar = castChar(first.who);
  useSilentCard(ex, "Continuar");
  const [nowLi, setNowLi] = useState(lis[0]);
  const play = useSpeakChain(ex);

  useEffect(() => {
    play(lis.map((li) => sc.lines[li]), { onStep: (_line, k) => setNowLi(lis[k]) });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <SceneHeader sc={sc} title={lis[0] === 0 ? "A conversa começa:" : "A conversa continua:"} />
      <SceneChat sc={sc} upto={lis[0]}>
        {lis.map((li) => {
          const line = sc.lines[li];
          return (
            <SceneMsg key={li} sc={sc} line={line} now={li === nowLi}>
              <Who>
                {sceneNameOf(line.who)}
                {line.who === sc.char ? " (você)" : ""}
              </Who>
              <div className="flex flex-wrap items-center gap-2">
                <AudioButton text={line.en} char={castChar(line.who)} />
                <Sayable text={line.en} className="text-[17px] font-extrabold leading-snug" />
              </div>
              <Pt>{line.pt}</Pt>
            </SceneMsg>
          );
        })}
      </SceneChat>
    </div>
  );
}
