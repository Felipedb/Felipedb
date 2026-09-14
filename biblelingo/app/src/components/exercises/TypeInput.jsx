// Formatos de digitação: "type" (palavra pt -> en), "listen-type" (ouça e digite)
// e "complete-translation" (input dentro da lacuna da frase em inglês).
import { useEffect, useRef } from "react";
import { session, setAnswer, check } from "../../core/session.js";
import { useSessionVersion } from "../../core/useSession.js";
import { blankRegex } from "../../core/util.js";
import { speak } from "../../core/audio.js";
import { AudioPair } from "./AudioButton.jsx";
import CharacterBubble from "./CharacterBubble.jsx";
import { Sayable } from "./Sayable.jsx";
import Icon from "../Icon.jsx";

export default function TypeInput({ ex }) {
  useSessionVersion();
  const t = ex.type;
  const ref = useRef(null);

  useEffect(() => {
    if (t === "listen-type") speak(ex.sentence.en);
    const id = setTimeout(() => ref.current && ref.current.focus(), 50);
    return () => clearTimeout(id);
  }, []); // eslint-disable-line

  const checked = session.checked;
  const ok = session.feedback && session.feedback.ok;
  const stateCls = checked
    ? ok ? "border-ok-line bg-ok-bg text-brand" : "border-bad-line bg-bad-bg text-bad-fg"
    : "border-line bg-card focus:border-sky-line";

  const inputProps = {
    ref,
    type: "text",
    autoComplete: "off",
    autoCapitalize: "off",
    spellCheck: false,
    disabled: checked,
    value: session.answer || "",
    onChange: (e) => setAnswer(e.target.value),
    onKeyDown: (e) => {
      if (e.key === "Enter" && !session.checked && String(session.answer || "").trim() !== "") check();
    },
  };

  if (t === "complete-translation") {
    const m = blankRegex(ex.blank).exec(ex.sentence.en);
    const before = m ? ex.sentence.en.slice(0, m.index) : "";
    const after = m ? ex.sentence.en.slice(m.index + m[0].length) : "";
    return (
      <div>
        <h2 className="font-display mb-3 text-lg font-extrabold">Complete a tradução:</h2>
        <CharacterBubble big><span className="text-lg font-bold">{ex.sentence.pt}</span></CharacterBubble>
        {m ? (
          <div className="card p-4 text-lg leading-loose">
            <Sayable text={before} />
            <input {...inputProps} aria-label="Palavra que falta"
              style={{ width: `${Math.max(5, ex.blank.length + 2)}ch` }}
              className={`mx-1 inline-block rounded-lg border-b-4 px-2 text-center font-bold outline-none transition-colors ${stateCls}`} />
            <Sayable text={after} />
          </div>
        ) : (
          <input {...inputProps} placeholder="Digite a palavra que falta..."
            className={`w-full rounded-2xl border-2 border-b-4 p-3.5 text-lg font-bold outline-none transition-colors ${stateCls}`} />
        )}
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-display mb-3 flex items-center gap-2 text-lg font-extrabold">
        {t === "listen-type" && <Icon name="speaker" className="text-sky" />}
        {t === "listen-type" ? "Digite o que você ouviu:" : "Digite em inglês:"}
      </h2>
      {t === "listen-type" ? (
        <CharacterBubble big>
          <AudioPair text={ex.sentence.en} />
          <span className="text-ink-soft">Toque para ouvir</span>
        </CharacterBubble>
      ) : (
        <CharacterBubble big>
          <span className="text-xl font-bold">{ex.word.icon || ""} {ex.word.pt}</span>
        </CharacterBubble>
      )}
      <input {...inputProps} placeholder={t === "listen-type" ? "Digite em inglês..." : "Escreva em inglês..."}
        className={`w-full rounded-2xl border-2 border-b-4 p-3.5 text-lg font-bold outline-none transition-colors ${stateCls}`} />
    </div>
  );
}
