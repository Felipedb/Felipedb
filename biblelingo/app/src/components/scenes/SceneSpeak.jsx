// Fale a fala do herói no microfone (reconhecimento de voz do navegador).
// Porta fiel de renderSceneSpeak; o "Não posso falar agora" usa skipSpeaking().
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { session, setAnswer, check, skipSpeaking } from "../../core/session.js";
import { useSessionVersion } from "../../core/useSession.js";
import { castChar, sceneNameOf } from "../../core/content.js";
import { speak, recognizeOnce } from "../../core/audio.js";
import { AudioPair } from "../exercises/AudioButton.jsx";
import { Sayable } from "../exercises/Sayable.jsx";
import Icon from "../Icon.jsx";
import { SceneChat, SceneHeader, SceneMsg, Who, Pt, sceneOf } from "./shared.jsx";

export default function SceneSpeak({ ex }) {
  useSessionVersion();
  const sc = sceneOf(ex);
  const line = sc.lines[ex.li];
  const hero = castChar(sc.char);
  session.voiceChar = hero;
  const [listening, setListening] = useState(false);
  const [status, setStatus] = useState("");
  useEffect(() => {
    speak(line.en, { char: hero });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onMic = () => {
    if (session.checked) return;
    if (session.recognizer) {
      try {
        session.recognizer.stop();
      } catch (e) {
        /* já parou */
      }
      return;
    }
    const s0 = session;
    session.recognizer = recognizeOnce(line.en, {
      onStart: () => {
        setListening(true);
        setStatus("");
      },
      onResult: (r) => {
        if (session !== s0) return;
        setStatus(`Você disse: "${r.text}"`);
        setAnswer(r.ok ? line.en : r.text);
        check();
      },
      onError: (err) => {
        setStatus(
          err === "unsupported"
            ? "Reconhecimento de voz indisponível neste navegador."
            : err === "not-allowed"
              ? "Permita o uso do microfone ou pule este exercício."
              : "Não consegui ouvir. Tente de novo ou pule."
        );
      },
      onEnd: () => {
        s0.recognizer = null;
        setListening(false);
      },
    });
  };

  return (
    <div>
      <SceneHeader sc={sc} title={`Fale como ${sceneNameOf(sc.char)}:`} />
      <SceneChat sc={sc} upto={ex.li}>
        <SceneMsg sc={sc} line={line} now>
          <Who>{sceneNameOf(sc.char)} (você)</Who>
          <div className="flex flex-wrap items-center gap-2">
            <AudioPair text={line.en} char={hero} />
            <Sayable text={line.en} className="text-[17px] font-extrabold leading-snug" />
          </div>
          <Pt>{line.pt}</Pt>
        </SceneMsg>
      </SceneChat>

      <div className="mt-5 flex flex-col items-center gap-3">
        <motion.button
          whileTap={{ y: 3 }}
          onClick={onMic}
          aria-label="Toque para falar"
          className={`btn-3d flex h-24 w-52 flex-col items-center justify-center gap-1 rounded-3xl text-white ${
            listening ? "animate-pulse bg-danger" : "bg-sky"
          }`}
          style={{ "--btn-shadow": listening ? "#d33131" : "#1899d6" }}
        >
          <Icon name="mic" className="text-3xl" />
          <span className="text-xs font-black tracking-wide">{listening ? "Ouvindo..." : "Toque para falar"}</span>
        </motion.button>
        <div className="min-h-5 text-center text-sm font-bold text-ink-soft">{status}</div>
        <button
          onClick={() => {
            if (!session.checked) skipSpeaking();
          }}
          className="text-[13px] font-extrabold uppercase tracking-wider text-ink-soft underline-offset-2 hover:underline"
        >
          Não posso falar agora
        </button>
      </div>
    </div>
  );
}
