// Banco de palavras: "build" (pt -> en com dicas), "listen-build" (ouça e monte)
// e "translate-en-pt" (en -> pt com banco em português). As peças "voam" do banco
// para a zona de resposta via layoutId do Motion; a peça original vira "fantasma".
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { session, setAnswer, check } from "../../core/session.js";
import { useSessionVersion } from "../../core/useSession.js";
import { speak } from "../../core/audio.js";
import AudioButton, { WaveButton, SlowButton } from "./AudioButton.jsx";
import CharacterBubble from "./CharacterBubble.jsx";
import { Sayable, HintedText } from "./Sayable.jsx";

let seq = 0;
const TILE = "rounded-xl border-2 border-b-4 px-3.5 py-2 font-bold";

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
          <h2 className="font-display mb-4 text-2xl font-extrabold">Escreva em inglês:</h2>
          <CharacterBubble big>
            <AudioButton text={ex.sentence.en} />
            <HintedText pt={ex.sentence.pt} className="text-lg" />
          </CharacterBubble>
        </>
      )}
      {t === "listen-build" && (
        <>
          <h2 className="font-display mb-4 text-2xl font-extrabold">Toque no que escutar:</h2>
          <CharacterBubble big under={<SlowButton text={ex.sentence.en} />}>
            <WaveButton text={ex.sentence.en} />
          </CharacterBubble>
        </>
      )}
      {t === "translate-en-pt" && (
        <>
          <h2 className="font-display mb-4 text-2xl font-extrabold">Traduza para o português:</h2>
          <CharacterBubble big>
            <AudioButton text={ex.sentence.en} />
            <Sayable text={ex.sentence.en} className="text-lg font-bold" />
          </CharacterBubble>
        </>
      )}

      {!keyboard && (
        <>
          {/* Zona de resposta: fichas assentam sobre linhas, como no alvo visual */}
          <div className="relative mb-8 min-h-[118px]">
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-[52px] border-t-2 border-track" />
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-[110px] border-t-2 border-track" />
            <div className="flex flex-wrap content-start items-start gap-x-1.5 gap-y-3">
              {chosen.map((i) => (
                <motion.button key={i} layoutId={`wb${uid}-${i}`} whileTap={{ scale: 0.95 }}
                  onClick={() => unpick(i)} disabled={checked}
                  className={`${TILE} border-line bg-card text-ink`}>
                  {words[i]}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Banco de peças */}
          <div className="flex flex-wrap justify-center gap-2">
            {words.map((w, i) => (
              <span key={i} className="relative inline-block">
                {/* fantasma: encaixe rebaixado no lugar da peça escolhida */}
                <span aria-hidden className={`${TILE} inline-block border-track bg-track text-transparent select-none ${chosen.includes(i) ? "" : "opacity-0"}`}>{w}</span>
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
