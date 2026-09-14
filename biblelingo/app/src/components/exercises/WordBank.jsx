// Banco de palavras: "build" (pt -> en com dicas), "listen-build" (ouça e monte)
// e "translate-en-pt" (en -> pt com banco em português). As peças "voam" do banco
// para a zona de resposta via layoutId do Motion; a peça original vira "fantasma".
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { session, setAnswer, check } from "../../core/session.js";
import { useSessionVersion } from "../../core/useSession.js";
import { speak } from "../../core/audio.js";
import AudioButton, { AudioPair } from "./AudioButton.jsx";
import CharacterBubble from "./CharacterBubble.jsx";
import { Sayable, HintedText } from "./Sayable.jsx";
import Icon from "../Icon.jsx";

let seq = 0;
const TILE = "rounded-xl border-2 border-b-4 px-3 py-1.5 font-bold";

export default function WordBank({ ex }) {
  useSessionVersion();
  const t = ex.type;
  const lang = t === "translate-en-pt" ? "pt" : "en";
  const words = ex.bank;
  const uid = useMemo(() => ++seq, []);
  const [chosen, setChosen] = useState([]); // índices do banco, na ordem escolhida
  const [keyboard, setKeyboard] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (t === "listen-build" || t === "translate-en-pt") speak(ex.sentence.en);
  }, []); // eslint-disable-line

  const joined = (list) => list.map((i) => words[i]).join(" ");
  const pick = (i) => {
    if (session.checked || chosen.includes(i)) return;
    if (lang === "en") speak(words[i]);
    const next = [...chosen, i];
    setChosen(next);
    setAnswer(joined(next));
  };
  const unpick = (i) => {
    if (session.checked) return;
    if (lang === "en") speak(words[i]);
    const next = chosen.filter((j) => j !== i);
    setChosen(next);
    setAnswer(joined(next));
  };
  const toggleKeyboard = () => {
    if (session.checked) return;
    if (!keyboard) {
      setKeyboard(true);
      setAnswer(joined(chosen));
      setTimeout(() => inputRef.current && inputRef.current.focus(), 50);
    } else {
      setKeyboard(false);
      setAnswer(joined(chosen));
    }
  };

  const checked = session.checked;
  const ok = session.feedback && session.feedback.ok;

  return (
    <div>
      {t === "build" && (
        <>
          <h2 className="font-display mb-3 text-lg font-extrabold">Escreva em inglês:</h2>
          <CharacterBubble big>
            <AudioButton text={ex.sentence.en} />
            <HintedText pt={ex.sentence.pt} className="text-lg" />
          </CharacterBubble>
          <div className="mb-3 -mt-2 text-xs text-ink-soft">Toque numa palavra sublinhada para ver a dica</div>
        </>
      )}
      {t === "listen-build" && (
        <>
          <h2 className="font-display mb-3 flex items-center gap-2 text-lg font-extrabold">
            <Icon name="speaker" className="text-sky" />Toque no que você ouviu:
          </h2>
          <CharacterBubble big>
            <AudioPair text={ex.sentence.en} />
            <span className="text-ink-soft">Toque para ouvir</span>
          </CharacterBubble>
        </>
      )}
      {t === "translate-en-pt" && (
        <>
          <h2 className="font-display mb-3 text-lg font-extrabold">Traduza para o português:</h2>
          <CharacterBubble big>
            <AudioButton text={ex.sentence.en} />
            <Sayable text={ex.sentence.en} className="text-lg font-bold" />
          </CharacterBubble>
        </>
      )}

      {!keyboard && (
        <>
          {/* Zona de resposta */}
          <div className={`mb-4 flex min-h-16 flex-wrap content-start items-start gap-2 rounded-2xl border-2 border-dashed p-2.5 ${
            checked ? (ok ? "border-ok-line bg-ok-soft" : "border-bad-line bg-bad-bg") : "border-line bg-cream"}`}>
            {chosen.map((i) => (
              <motion.button key={i} layoutId={`wb${uid}-${i}`} whileTap={{ scale: 0.95 }}
                onClick={() => unpick(i)} disabled={checked}
                className={`${TILE} border-sky-line bg-card text-ink`}>
                {words[i]}
              </motion.button>
            ))}
          </div>

          {/* Banco de peças */}
          <div className="flex flex-wrap justify-center gap-2">
            {words.map((w, i) => (
              <span key={i} className="relative inline-block">
                {/* fantasma: mantém o lugar da peça no banco */}
                <span aria-hidden className={`${TILE} inline-block border-line bg-track text-transparent select-none ${chosen.includes(i) ? "opacity-60" : "opacity-0"}`}>{w}</span>
                {!chosen.includes(i) && (
                  <motion.button layoutId={`wb${uid}-${i}`} whileTap={{ scale: 0.95 }}
                    onClick={() => pick(i)} disabled={checked} data-tile={w}
                    className={`${TILE} absolute inset-0 border-line bg-card hover:bg-hover ${checked ? "opacity-50" : ""}`}>
                    {w}
                  </motion.button>
                )}
              </span>
            ))}
          </div>
        </>
      )}

      {keyboard && (
        <input ref={inputRef} type="text" autoComplete="off" autoCapitalize="off" spellCheck={false}
          disabled={checked}
          placeholder={lang === "en" ? "Digite a frase em inglês..." : "Digite a frase em português..."}
          value={session.answer || ""}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !session.checked && String(session.answer || "").trim() !== "") check(); }}
          className={`w-full rounded-2xl border-2 border-b-4 p-3.5 text-lg font-bold outline-none transition-colors ${
            checked ? (ok ? "border-ok-line bg-ok-bg text-brand" : "border-bad-line bg-bad-bg text-bad-fg") : "border-line bg-card focus:border-sky-line"}`} />
      )}

      <div>
        <button onClick={toggleKeyboard} disabled={checked}
          className="mt-3 text-sm font-bold text-sky-fg underline-offset-2 hover:underline disabled:opacity-50">
          {keyboard ? "🧩 Usar banco de palavras" : "⌨️ Usar teclado"}
        </button>
      </div>
    </div>
  );
}
