// Fala do outro personagem em segredo: ouvir e escolher a tradução; ao checar, revela.
// Porta fiel de renderSceneListen (scene-engine.js).
import { useEffect } from "react";
import { session } from "../../core/session.js";
import { useSessionVersion } from "../../core/useSession.js";
import { castChar, sceneNameOf } from "../../core/content.js";
import { speak } from "../../core/audio.js";
import { AudioPair } from "../exercises/AudioButton.jsx";
import { SceneChat, SceneHeader, SceneMsg, SceneOptions, ReplyLabel, Who, En, Pt, sceneOf } from "./shared.jsx";

export default function SceneListen({ ex }) {
  useSessionVersion();
  const sc = sceneOf(ex);
  const line = sc.lines[ex.li];
  const ch = castChar(line.who);
  session.voiceChar = ch;
  useEffect(() => {
    speak(line.en, { char: ch });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const checked = session.checked;

  return (
    <div>
      <SceneHeader sc={sc} title={`🎧 O que ${sceneNameOf(line.who)} disse?`} />
      <SceneChat sc={sc} upto={ex.li}>
        <SceneMsg sc={sc} line={line} now>
          <Who>{sceneNameOf(line.who)}</Who>
          <div className="flex flex-wrap items-center gap-2">
            <AudioPair text={line.en} char={ch} />
            {checked ? (
              <En>{line.en}</En>
            ) : (
              <span className="select-none text-[17px] font-extrabold tracking-widest text-ink-soft" aria-hidden>
                ···
              </span>
            )}
          </div>
          {checked && <Pt>{line.pt}</Pt>}
        </SceneMsg>
      </SceneChat>
      <ReplyLabel>Em português, {sceneNameOf(line.who)} disse:</ReplyLabel>
      <SceneOptions ex={ex} cols={1} />
    </div>
  );
}
