// Despacho dos formatos de exercício (lições em ./registry.js, cenas em ../scenes/registry.js).
// Contrato: recebe { ex } já passado por prepareExercise, mais o estado da sessão por props (answer, checked, fb):
// assim o exercício que sai na transição (AnimatePresence popLayout) continua mostrando o que mostrava.
// Os componentes mutam a sessão via setAnswer/check/registerMistakeSoft.
import Placeholder from "./Placeholder.jsx";
import { REGISTRY } from "./registry.js";
import { SCENE_REGISTRY } from "../scenes/registry.js";

export default function ExerciseView({ ex, answer = null, checked = false, fb = null }) {
  const C = REGISTRY[ex.type] || SCENE_REGISTRY[ex.type] || Placeholder;
  return <C ex={ex} answer={answer} checked={checked} fb={fb} />;
}
