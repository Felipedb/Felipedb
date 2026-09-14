// Sua vez: escolher a fala certa do herói (3 opções em inglês); ao checar, a fala
// entra no transcript. Porta fiel de renderSceneReply (scene-engine.js).
import { session } from "../../core/session.js";
import { useSessionVersion } from "../../core/useSession.js";
import { castChar, sceneNameOf } from "../../core/content.js";
import { speak } from "../../core/audio.js";
import { SceneChat, SceneHeader, SceneMsg, SceneOptions, ReplyLabel, HeroPrompt, HeroReveal, sceneOf } from "./shared.jsx";

export default function SceneReply({ ex }) {
  useSessionVersion();
  const sc = sceneOf(ex);
  const line = sc.lines[ex.li];
  const hero = castChar(sc.char);
  session.voiceChar = hero;
  ex.onChecked = (ok) => {
    if (ok) speak(line.en, { char: hero });
  };
  const checked = session.checked;

  return (
    <div>
      <SceneHeader sc={sc} title={`Sua vez: o que ${sceneNameOf(sc.char)} responde?`} />
      <SceneChat sc={sc} upto={ex.li}>
        <SceneMsg sc={sc} line={line} now>
          {checked ? (
            <HeroReveal sc={sc} line={line} />
          ) : (
            <HeroPrompt sc={sc} line={line} hint="Escolha a fala em inglês que diz isto:" />
          )}
        </SceneMsg>
      </SceneChat>
      <ReplyLabel>Sua resposta:</ReplyLabel>
      <SceneOptions ex={ex} cols={1} onSelect={(opt) => speak(opt, { char: hero })} />
    </div>
  );
}
