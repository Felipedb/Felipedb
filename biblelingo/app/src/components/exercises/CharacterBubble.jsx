// Personagem em pé ao lado do balão (VISUAL_SPEC 5.20 e 6.2): CharacterStage "side" (110x180, elipse de sombra,
// sem legenda) + Bubble com rabinho apontando para o rosto. O personagem fala (talking) quando a voz dele toca
// e reage no feedback: feliz 120 ms após o acerto, triste 150 ms após o erro, com o badge de reação fora do recorte.
// currentChar() escolhe quem fala neste exercício (mesma regra usada na geração de áudio).
import { useEffect, useMemo, useState } from "react";
import { session } from "../../core/session.js";
import { UNIT_CAST, CHARACTERS, exKeyText, castHash, audioKey } from "../../core/content.js";
import { AUDIO } from "../../core/audio.js";
import Bubble from "../ui/Bubble.jsx";
import CharacterStage from "../ui/CharacterStage.jsx";

export function currentChar() {
  if (!session) return null;
  if (session.fixedNarrator || !session.cast || !session.cast.length) return session.narrator;
  const cast = UNIT_CAST[session.lesson.unit.id];
  const key = audioKey(exKeyText(session.exercises[session.index]));
  if (cast && cast.length && key) {
    let k = cast[castHash(key) % cast.length];
    const entry = AUDIO.manifest && AUDIO.manifest[key];
    if (entry && !entry[k]) {
      const rec = Object.keys(entry).find((c) => c !== "default" && CHARACTERS[c]);
      if (rec) k = rec;
    }
    if (CHARACTERS[k]) return { key: k, ...CHARACTERS[k] };
  }
  return session.cast[session.index % session.cast.length];
}

// Personagem deste exercício (fixo por montagem) e voz usada pelos clipes
export function useExerciseChar(fixed) {
  const auto = useMemo(() => currentChar(), []);
  const ch = fixed || auto;
  if (session) session.voiceChar = ch;
  return ch;
}

// Props: ch (opcional), audio (texto do alto-falante inline), wave (balão de escuta com DEVAGAR quando slow),
// checked/ok (reação do personagem), children (conteúdo do balão em text-sentence)
export default function CharacterBubble({ ch: given, children, audio, wave = false, slow = false, checked = false, ok = false, className = "" }) {
  const ch = useExerciseChar(given);
  // Reação definida uma vez por checagem (nunca sorteada no JSX, regra 7.2.10)
  const reaction = useMemo(() => (checked ? (ok ? "reaction-happy" : "reaction-sad") : null), [checked, ok]);
  const [stageState, setStageState] = useState("idle");
  useEffect(() => {
    if (!checked) { setStageState("idle"); return undefined; }
    const t = setTimeout(() => setStageState(ok ? "happy" : "sad"), ok ? 120 : 150);
    return () => clearTimeout(t);
  }, [checked, ok]);

  return (
    <div className={`mb-6 flex items-center gap-6 ${className}`}>
      <CharacterStage ch={ch} variant="side" pose={checked ? (ok ? "happy" : "sad") : "neutral"} state={stageState} reaction={reaction} talking="auto" />
      <div className="min-w-0 flex-1">
        {wave
          ? <Bubble variant="wave" audio={audio} char={ch} slow={slow} />
          : <Bubble audio={audio} char={ch}>{children}</Bubble>}
      </div>
    </div>
  );
}
