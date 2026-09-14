// Fala do herói com uma palavra faltando e 3 opções.
// Porta fiel de renderSceneMissing (scene-engine.js).
import { session } from "../../core/session.js";
import { useSessionVersion } from "../../core/useSession.js";
import { castChar, sceneNameOf } from "../../core/content.js";
import { speak } from "../../core/audio.js";
import { SceneChat, SceneHeader, SceneMsg, SceneOptions, HeroReveal, Who, Pt, sceneOf, gapParts } from "./shared.jsx";

export default function SceneMissing({ ex }) {
  useSessionVersion();
  const sc = sceneOf(ex);
  const line = sc.lines[ex.li];
  const hero = castChar(sc.char);
  session.voiceChar = hero;
  ex.onChecked = (ok) => {
    if (ok) speak(line.en, { char: hero });
  };
  const [before, after] = gapParts(line.en, ex.blank);
  const checked = session.checked;

  return (
    <div>
      <SceneHeader sc={sc} title="Selecione a palavra que falta:" />
      <SceneChat sc={sc} upto={ex.li}>
        <SceneMsg sc={sc} line={line} now>
          {checked ? (
            <HeroReveal sc={sc} line={line} />
          ) : (
            <>
              <Who>{sceneNameOf(sc.char)} (você)</Who>
              <div className="text-[17px] font-extrabold leading-loose">
                {before}
                <span className="mx-1 inline-block min-w-16 rounded-lg border-b-4 border-line bg-cream px-2 text-center font-bold text-sky-fg">
                  {session.answer || " "}
                </span>
                {after}
              </div>
              <Pt>{line.pt}</Pt>
            </>
          )}
        </SceneMsg>
      </SceneChat>
      <SceneOptions ex={ex} cols={2} onSelect={(opt) => speak(opt)} />
    </div>
  );
}
