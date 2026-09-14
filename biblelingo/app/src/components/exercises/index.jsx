// Despacho dos formatos de exercício. Cada componente vive em seu arquivo.
// Contrato: recebe { ex } (já passado por prepareExercise); lê/muta a sessão via
// setAnswer/check/registerMistakeSoft; `session.checked` diz se já foi conferido.
import Placeholder from "./Placeholder.jsx";
import { REGISTRY } from "./registry.js";

export default function ExerciseView({ ex }) {
  const C = REGISTRY[ex.type] || Placeholder;
  return <C ex={ex} />;
}
