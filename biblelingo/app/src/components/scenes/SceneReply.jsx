// Sua vez (VISUAL_SPEC 6.3 #22 scene-reply): o balão do herói diz em português o que ele quer falar; o aluno
// escolhe a fala em inglês entre 3 opções em 1 coluna. Ao acertar, a fala entra no balão e é tocada.
import { useRef } from "react";
import { session } from "../../core/session.js";
import { useSessionVersion } from "../../core/useSession.js";
import { castChar } from "../../core/content.js";
import { speak } from "../../core/audio.js";
import { SceneTitle, SceneChat, ChatMsg, SceneLabel, SceneOptions, HeroPrompt, HeroReveal, nameChanges, sceneOf, useRevealBelow } from "./shared.jsx";

export default function SceneReply({ ex, checked = false, fb = null }) {
  useSessionVersion();
  const sc = sceneOf(ex);
  const line = sc.lines[ex.li];
  const hero = castChar(sc.char);
  session.voiceChar = hero;
  ex.onChecked = (ok) => {
    if (ok) speak(line.en, { char: hero });
  };
  const ok = !!(fb && fb.ok);
  const zone = useRef(null);
  useRevealBelow(zone, checked);

  return (
    <div>
      <SceneTitle>Sua vez de responder:</SceneTitle>
      <SceneChat sc={sc} upto={ex.li}>
        <ChatMsg sc={sc} line={line} now showName={nameChanges(sc, ex.li)}>
          {checked && ok ? <HeroReveal line={line} /> : <HeroPrompt line={line} hint="Diga isto em inglês" />}
        </ChatMsg>
      </SceneChat>
      <div ref={zone}>
        <SceneLabel>Sua resposta:</SceneLabel>
        <SceneOptions ex={ex} cols={1} label="Fala em inglês" onSelect={(opt) => speak(opt, { char: hero })} />
      </div>
    </div>
  );
}
