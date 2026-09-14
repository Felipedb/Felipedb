// "speak": repita a frase em voz alta (reconhecimento de voz do navegador).
// O resultado responde o exercício; "Não posso falar agora" pula por 15 min.
import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { session, setAnswer, check, skipSpeaking } from "../../core/session.js";
import { useSessionVersion } from "../../core/useSession.js";
import { speak, recognizeOnce } from "../../core/audio.js";
import { AudioPair } from "./AudioButton.jsx";
import CharacterBubble, { currentChar } from "./CharacterBubble.jsx";
import { Sayable } from "./Sayable.jsx";
import Icon from "../Icon.jsx";

export default function Speak({ ex }) {
  useSessionVersion();
  const who = useMemo(() => currentChar(), []);
  const [listening, setListening] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => { speak(ex.sentence.en); }, []); // eslint-disable-line

  const onMic = () => {
    if (session.checked) return;
    if (session.recognizer) { try { session.recognizer.stop(); } catch (e) { /* já parou */ } return; }
    const s0 = session;
    session.recognizer = recognizeOnce(ex.sentence.en, {
      onStart: () => { setListening(true); setStatus("Ouvindo..."); },
      onResult: (r) => {
        if (session !== s0) return;
        setStatus(`Você disse: "${r.text}"`);
        setAnswer(r.ok ? ex.sentence.en : r.text);
        check();
      },
      onError: (err) => {
        setStatus(err === "unsupported" ? "Reconhecimento de voz indisponível neste navegador."
          : err === "not-allowed" ? "Permita o uso do microfone ou pule este exercício."
          : "Não consegui ouvir. Tente de novo ou pule.");
      },
      onEnd: () => { s0.recognizer = null; setListening(false); },
    });
  };

  return (
    <div>
      <h2 className="font-display mb-3 text-lg font-extrabold">
        Repita o que {who ? who.name.split(" (")[0] : "o personagem"} disse:
      </h2>
      <CharacterBubble big>
        <div>
          <div className="flex items-center gap-2">
            <AudioPair text={ex.sentence.en} />
            <Sayable text={ex.sentence.en} className="text-lg font-bold" />
          </div>
          <div className="mt-1 text-sm text-ink-soft">{ex.sentence.pt}</div>
        </div>
      </CharacterBubble>

      <motion.button whileTap={{ scale: 0.93 }} onClick={onMic} disabled={session.checked}
        aria-label="Toque para falar"
        className={`mx-auto mt-6 flex h-24 w-24 items-center justify-center rounded-full border-b-8 text-4xl text-white transition-colors disabled:opacity-50 ${
          listening ? "animate-pulse border-sky-fg bg-sky" : "border-brand-shadow bg-brand-bright"}`}>
        <Icon name="mic" />
      </motion.button>
      <div className="mt-3 min-h-6 text-center text-sm font-bold text-ink-soft" aria-live="polite">
        {status || (listening ? "Ouvindo..." : "Toque no microfone e fale a frase")}
      </div>
      {!session.checked && (
        <div className="text-center">
          <button onClick={skipSpeaking} className="mt-3 text-sm font-bold text-ink-soft underline-offset-2 hover:underline">
            Não posso falar agora
          </button>
        </div>
      )}
    </div>
  );
}
