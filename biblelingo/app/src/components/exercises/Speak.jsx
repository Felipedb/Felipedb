// "speak" (VISUAL_SPEC 5.17 e 6.3 #13): repita a frase. Balão "bubble-bottom" (alto-falante inline + frase 19/500,
// palavras não reconhecidas em laranja) acima do personagem centralizado (220x300 com corpo inteiro; enquanto só
// há o retrato, o palco encolhe para não deixar 200 px de ar), microfone azul 186x80 e, no rodapé da lição, o link
// "Não posso falar agora" (slot ghost) sem CTA até o aluno falar. O resultado do reconhecimento responde o exercício.
// Variante local do SpeakPrompt de ui/MicButton.jsx: mesma composição, com o palco ciente do ativo disponível.
import { useState } from "react";
import { session, setAnswer, check } from "../../core/session.js";
import { useSessionVersion } from "../../core/useSession.js";
import { recognizeOnce } from "../../core/audio.js";
import { normalize } from "../../core/util.js";
import { MicButton } from "../ui/MicButton.jsx";
import Bubble from "../ui/Bubble.jsx";
import CharacterStage from "../ui/CharacterStage.jsx";
import { useExerciseChar, useHasFull, useReaction, stageProps } from "./CharacterBubble.jsx";
import { Title, useAutoplay } from "./shared.jsx";

export default function Speak({ ex, checked = false, fb = null }) {
  useSessionVersion();
  const ch = useExerciseChar();
  const hasFull = useHasFull(ch);
  const ok = !!(fb && fb.ok);
  const { reaction, stageState, pose } = useReaction(checked && !(fb && fb.skipped), ok);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState("");
  const [missed, setMissed] = useState([]);
  useAutoplay(ex.sentence.en, ch);
  const name = ch ? ch.name.split(" (")[0] : "o personagem";
  const miss = new Set(checked ? missed.map((w) => normalize(w)) : []);
  const words = String(ex.sentence.en || "").split(" ");

  const onMic = () => {
    if (session.checked) return;
    if (session.recognizer) { try { session.recognizer.stop(); } catch (e) { /* já parou */ } return; }
    const s0 = session;
    setError("");
    session.recognizer = recognizeOnce(ex.sentence.en, {
      onStart: () => setListening(true),
      onResult: (r) => {
        if (session !== s0) return;
        const said = normalize(r.text).split(" ");
        setMissed(normalize(ex.sentence.en).split(" ").filter((w) => !said.includes(w)));
        setAnswer(r.ok ? ex.sentence.en : r.text);
        check();
      },
      onError: (err) => {
        setError(err === "unsupported" ? "Reconhecimento de voz indisponível neste navegador."
          : err === "not-allowed" ? "Permita o uso do microfone ou pule este exercício."
          : "Não consegui ouvir. Tente de novo ou pule.");
      },
      onEnd: () => { s0.recognizer = null; setListening(false); },
    });
  };

  return (
    <div>
      <Title>Repita o que {name} disse:</Title>
      <div className="flex flex-col items-center">
        <Bubble variant="bottom" audio={ex.sentence.en} char={ch} maxWidth="min(100%, 320px)">
          <span>
            {words.map((w, i) => (
              <span key={i} className={miss.has(normalize(w)) ? "text-orange" : ""}>{w}{i < words.length - 1 ? " " : ""}</span>
            ))}
          </span>
        </Bubble>
        <CharacterStage ch={ch} variant={hasFull ? "center" : "header"} pose={pose} state={stageState} reaction={reaction} talking="auto"
          className="mt-5" {...(hasFull ? {} : { style: { width: 220, height: 120 } })} />
        <MicButton recording={listening} onClick={onMic} disabled={checked} error={error} className="mt-6" />
        <p className="sr-only">{ex.sentence.pt}</p>
      </div>
    </div>
  );
}
