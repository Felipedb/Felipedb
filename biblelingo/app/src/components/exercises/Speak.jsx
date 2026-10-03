// "speak" (VISUAL_SPEC 5.17 e 6.3): repita a frase. SpeakPrompt (balão em cima, personagem 220x300, microfone
// azul 186x80) é o componente compartilhado; o link "Não posso falar agora" vive no slot do rodapé da lição.
// O resultado do reconhecimento responde o exercício; palavras não reconhecidas ficam em laranja no balão.
import { useState } from "react";
import { session, setAnswer, check } from "../../core/session.js";
import { useSessionVersion } from "../../core/useSession.js";
import { recognizeOnce } from "../../core/audio.js";
import { normalize } from "../../core/util.js";
import SpeakPrompt from "../ui/MicButton.jsx";
import { useExerciseChar } from "./CharacterBubble.jsx";
import { Title, useAutoplay } from "./shared.jsx";

export default function Speak({ ex, checked = false }) {
  useSessionVersion();
  const ch = useExerciseChar();
  const [listening, setListening] = useState(false);
  const [error, setError] = useState("");
  const [missed, setMissed] = useState([]);
  useAutoplay(ex.sentence.en, ch);
  const name = ch ? ch.name.split(" (")[0] : "o personagem";

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
      <SpeakPrompt text={ex.sentence.en} pt={ex.sentence.pt} char={ch} recording={listening} onMic={onMic} disabled={checked}
        missed={checked ? missed : []} error={error} />
    </div>
  );
}
