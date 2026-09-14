// Complete a fala do herói: lacuna digitada dentro da frase, com dica do vocabulário.
// Porta fiel de renderSceneGap (scene-engine.js).
import { useEffect, useRef } from "react";
import { session, setAnswer, check } from "../../core/session.js";
import { useSessionVersion } from "../../core/useSession.js";
import { castChar, sceneNameOf } from "../../core/content.js";
import { speak } from "../../core/audio.js";
import { normalize } from "../../core/util.js";
import { SceneChat, SceneHeader, SceneMsg, HeroReveal, Who, Pt, sceneOf, gapParts } from "./shared.jsx";

export default function SceneGap({ ex }) {
  useSessionVersion();
  const sc = sceneOf(ex);
  const line = sc.lines[ex.li];
  const hero = castChar(sc.char);
  session.voiceChar = hero;
  ex.onChecked = (ok) => {
    if (ok) speak(line.en, { char: hero });
  };
  const inputRef = useRef(null);
  useEffect(() => {
    const t = setTimeout(() => inputRef.current && inputRef.current.focus(), 50);
    return () => clearTimeout(t);
  }, []);
  const [before, after] = gapParts(line.en, ex.blank);
  const hint = sc.vocab.find((v) => normalize(v.en.replace(/^to /, "")) === normalize(ex.blank));
  const checked = session.checked;

  return (
    <div>
      <SceneHeader sc={sc} title={`Complete a fala de ${sceneNameOf(sc.char)}:`} />
      <SceneChat sc={sc} upto={ex.li}>
        <SceneMsg sc={sc} line={line} now>
          {checked ? (
            <HeroReveal sc={sc} line={line} />
          ) : (
            <>
              <Who>{sceneNameOf(sc.char)} (você)</Who>
              <div className="text-[17px] font-extrabold leading-loose">
                {before}
                <input
                  ref={inputRef}
                  type="text"
                  value={session.answer || ""}
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  style={{ width: `${Math.max(5, ex.blank.length + 2)}ch` }}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && session.answer && String(session.answer).trim() !== "") check();
                  }}
                  className="mx-0.5 inline-block min-w-16 border-0 border-b-[3px] border-sky bg-transparent px-1.5 text-center font-extrabold text-ink outline-none"
                />
                {after}
              </div>
              <Pt>{line.pt}</Pt>
            </>
          )}
        </SceneMsg>
      </SceneChat>
      <div className="text-[12.5px] font-bold text-ink-soft">
        {hint ? `Dica: ${hint.icon || ""} ${hint.pt}` : "Dica: a palavra está no vocabulário da cena ou na tradução"}
      </div>
    </div>
  );
}
