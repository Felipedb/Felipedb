// Despacho dos formatos de exercício. Cada componente vive em seu arquivo.
// Contrato: recebe { ex } (já passado por prepareExercise); lê/muta a sessão via
// setAnswer/check/registerMistakeSoft; `session.checked` diz se já foi conferido.
import Placeholder from "./Placeholder.jsx";
import { REGISTRY } from "./registry.js";
import { SCENE_REGISTRY } from "../scenes/registry.js";
import PracticeBar, { showPracticeBar } from "./PracticeBar.jsx";

// Formatos que já exibem botão de áudio próprio: a barra de prática mostra só o microfone
const HAS_AUDIO_BTN = ["build", "translate-en-pt", "listen-type", "listen-build", "dialogue", "quiz", "listen-choice"];

export default function ExerciseView({ ex }) {
  const C = REGISTRY[ex.type] || SCENE_REGISTRY[ex.type] || Placeholder;
  return (
    <>
      <C ex={ex} />
      {showPracticeBar(ex) && <PracticeBar ex={ex} micOnly={HAS_AUDIO_BTN.includes(ex.type)} />}
    </>
  );
}
