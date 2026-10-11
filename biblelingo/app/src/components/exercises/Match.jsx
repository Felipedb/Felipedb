// "match" e "listen-match" (VISUAL_SPEC 5.15 e 6.3): combine os pares em células 166x87 (áudio 166x69).
// Par certo: as duas acendem verde 300 ms com pop e depois desbotam; par errado: vermelho + tremor, conta
// como erro leve sem perder coração. Ao fechar todos, confere sozinho (o rodapé mostra "Fez bonito!").
import { useEffect, useMemo, useRef, useState } from "react";
import { session, setAnswer, check, registerMistakeSoft } from "../../core/session.js";
import { useSessionVersion } from "../../core/useSession.js";
import { shuffle } from "../../core/util.js";
import { speak, clipDuration } from "../../core/audio.js";
import { feel } from "../../core/sfx.js";
import MatchCell, { MatchGrid } from "../ui/MatchCell.jsx";
import { useExerciseChar } from "./CharacterBubble.jsx";
import { TITLES, Title } from "./shared.jsx";

export default function Match({ ex }) {
  useSessionVersion();
  const audioLeft = ex.type === "listen-match";
  const ch = useExerciseChar();
  const cols = useMemo(() => [
    shuffle(ex.pairs.map((p) => ({ key: p.en, side: "en", label: p.en }))),
    shuffle(ex.pairs.map((p) => ({ key: p.en, side: "pt", label: p.pt }))),
  ], [ex]);
  const [selected, setSelected] = useState(null); // { key, side, id }
  const [matched, setMatched] = useState([]);     // chaves fechadas
  const [wrong, setWrong] = useState([]);         // ids em erro (tremor)
  const [flash, setFlash] = useState([]);         // chaves recém-fechadas (verde antes de desbotar)
  const [playing, setPlaying] = useState(null);   // id da célula de áudio tocando
  const timers = useRef([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));

  const play = (item, id) => {
    speak(item.label, { char: ch });
    if (!audioLeft) return;
    setPlaying(id);
    const d = clipDuration(item.label, ch && ch.key) || Math.min(3, 0.4 + item.label.length * 0.06);
    later(() => setPlaying((p) => (p === id ? null : p)), d * 1000);
  };

  const onCell = (item, id) => {
    if (session.checked || matched.includes(item.key)) return;
    if (item.side === "en") play(item, id);
    // Um som por toque (SFX_SPEC 2.2): select ao marcar, deselect na mesma célula, pair(i) no par certo, pair-wrong no errado;
    // o último par fecha o exercício e o acerto da sessão (correct) é o som desse toque
    if (!selected) { feel("select"); setSelected({ ...item, id }); return; }
    if (selected.id === id) { feel("deselect"); setSelected(null); return; }
    if (selected.side === item.side) { feel("select"); setSelected({ ...item, id }); return; }
    if (selected.key === item.key) {
      const m = [...matched, item.key];
      setMatched(m);
      setSelected(null);
      setFlash((f) => [...f, item.key]);
      later(() => setFlash((f) => f.filter((k) => k !== item.key)), 300);
      if (m.length < ex.pairs.length) feel("pair", m.length - 1);
      if (m.length === ex.pairs.length) {
        setAnswer("__matched__");
        check();
      }
    } else {
      setWrong([selected.id, id]);
      setSelected(null);
      feel("pair-wrong");
      registerMistakeSoft();
      later(() => setWrong([]), 400);
    }
  };

  const stateOf = (item, id) => matched.includes(item.key) ? (flash.includes(item.key) ? "correct" : "done")
    : wrong.includes(id) ? "wrong"
    : selected && selected.id === id ? "selected"
    : "idle";

  // Linhas: célula em inglês (ou áudio) à esquerda, português à direita
  const cells = cols[0].flatMap((item, r) => [[item, `en:${r}`, r], [cols[1][r], `pt:${r}`, r]]);

  return (
    <div>
      <Title>{TITLES[ex.type]}</Title>
      <MatchGrid className="items-center">
        {cells.map(([item, id, r]) => (
          <MatchCell key={id} side={item.side} keyId={item.key} label={item.label} index={r}
            audio={audioLeft && item.side === "en"} playing={playing === id}
            state={stateOf(item, id)} onClick={() => onCell(item, id)} />
        ))}
      </MatchGrid>
    </div>
  );
}
