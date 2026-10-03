// Fale a fala do herói (VISUAL_SPEC 5.17 e 6.3 #22 scene-speak): a composição do SpeakPrompt com a bolha da
// cena (balão "bottom" com alto-falante + frase, palavras não reconhecidas em laranja) acima do personagem
// centralizado, microfone azul 186x80 e o link "Não posso falar agora" (texto DOM em caixa normal, único na tela).
// Variante local: o palco encolhe enquanto o personagem só tem o retrato redondo (sem corpo inteiro).
import { useState } from "react";
import { session, setAnswer, check, skipSpeaking } from "../../core/session.js";
import { useSessionVersion } from "../../core/useSession.js";
import { castChar, sceneNameOf } from "../../core/content.js";
import { recognizeOnce } from "../../core/audio.js";
import { normalize } from "../../core/util.js";
import { MicButton } from "../ui/MicButton.jsx";
import Bubble from "../ui/Bubble.jsx";
import Button3D from "../ui/Button3D.jsx";
import CharacterStage from "../ui/CharacterStage.jsx";
import { useHasFull, useReaction } from "../exercises/CharacterBubble.jsx";
import { useAutoplay } from "../exercises/shared.jsx";
import { SceneTitle, sceneOf } from "./shared.jsx";

export default function SceneSpeak({ ex, checked = false, fb = null }) {
  useSessionVersion();
  const sc = sceneOf(ex);
  const line = sc.lines[ex.li];
  const hero = castChar(sc.char);
  session.voiceChar = hero;
  const hasFull = useHasFull(hero);
  const ok = !!(fb && fb.ok);
  const { reaction, stageState, pose } = useReaction(checked && !(fb && fb.skipped), ok);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState("");
  const [missed, setMissed] = useState([]);
  useAutoplay(line.en, hero);
  const miss = new Set(checked ? missed.map((w) => normalize(w)) : []);
  const words = String(line.en || "").split(" ");

  const onMic = () => {
    if (session.checked) return;
    if (session.recognizer) { try { session.recognizer.stop(); } catch (e) { /* já parou */ } return; }
    const s0 = session;
    setError("");
    session.recognizer = recognizeOnce(line.en, {
      onStart: () => setListening(true),
      onResult: (r) => {
        if (session !== s0) return;
        const said = normalize(r.text).split(" ");
        setMissed(normalize(line.en).split(" ").filter((w) => !said.includes(w)));
        setAnswer(r.ok ? line.en : r.text);
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
      <SceneTitle>Fale como {sceneNameOf(sc.char)}:</SceneTitle>
      <div className="flex flex-col items-center">
        <Bubble variant="bottom" audio={line.en} char={hero} maxWidth="min(100%, 320px)">
          <span>
            {words.map((w, i) => (
              <span key={i} className={miss.has(normalize(w)) ? "text-orange" : ""}>{w}{i < words.length - 1 ? " " : ""}</span>
            ))}
          </span>
        </Bubble>
        <CharacterStage ch={hero} variant={hasFull ? "center" : "header"} pose={pose} state={stageState} reaction={reaction} talking="auto"
          className="mt-5" {...(hasFull ? {} : { style: { width: 220, height: 120 } })} />
        <MicButton recording={listening} onClick={onMic} disabled={checked} error={error} className="mt-6" />
        <p className="sr-only">{line.pt}</p>
        {!checked && (
          <Button3D variant="ghost" tone="muted" size="md" sound={false} className="mt-6" onClick={() => { if (!session.checked) skipSpeaking(); }}>
            Não posso falar agora
          </Button3D>
        )}
      </div>
    </div>
  );
}
