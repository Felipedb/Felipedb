// "match" e "listen-match": combine os pares (en | pt). Par certo faz "pop" com
// sfx; par errado treme e conta como erro leve. Trocar a seleção no mesmo lado
// não é erro. Quando todos fecham, confere automaticamente.
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { session, setAnswer, check, registerMistakeSoft } from "../../core/session.js";
import { useSessionVersion } from "../../core/useSession.js";
import { shuffle, buzz } from "../../core/util.js";
import { speak } from "../../core/audio.js";
import { sfx } from "../../core/events.js";
import Icon from "../Icon.jsx";

export default function Match({ ex }) {
  useSessionVersion();
  const audioLeft = ex.type === "listen-match";
  const cols = useMemo(() => [
    shuffle(ex.pairs.map((p) => ({ key: p.en, side: "en", label: p.en }))),
    shuffle(ex.pairs.map((p) => ({ key: p.en, side: "pt", label: p.pt }))),
  ], [ex]);
  const [selected, setSelected] = useState(null); // { key, side, id }
  const [matched, setMatched] = useState([]);     // chaves fechadas
  const [wrong, setWrong] = useState([]);         // ids em erro (shake)

  const onCell = (item, id) => {
    if (session.checked || matched.includes(item.key)) return;
    if (item.side === "en") speak(item.label);
    if (!selected) { setSelected({ ...item, id }); return; }
    if (selected.id === id) { setSelected(null); return; }
    if (selected.side === item.side) { setSelected({ ...item, id }); return; }
    if (selected.key === item.key) {
      const m = [...matched, item.key];
      setMatched(m);
      setSelected(null);
      sfx("pop", m.length);
      if (m.length === ex.pairs.length) {
        setAnswer("__matched__");
        check();
      }
    } else {
      setWrong([selected.id, id]);
      setSelected(null);
      buzz(60);
      registerMistakeSoft();
      setTimeout(() => setWrong([]), 600);
    }
  };

  const cell = (item, id) => {
    const isMatched = matched.includes(item.key);
    const isSel = selected && selected.id === id;
    const isWrong = wrong.includes(id);
    return (
      <motion.button key={id} data-side={item.side} data-key={item.key}
        onClick={() => onCell(item, id)}
        variants={{ idle: { scale: 1 }, matched: { scale: [1, 1.18, 1] } }}
        animate={isMatched ? "matched" : "idle"}
        transition={{ duration: 0.3 }}
        aria-label={audioLeft && item.side === "en" ? "Ouvir" : item.label}
        className={`${audioLeft && item.side === "en" ? "flex items-center justify-center text-xl text-sky-fg " : ""}rounded-2xl border-2 border-b-4 px-4 py-3 text-left font-bold transition-colors ${
          isMatched ? "border-ok-line bg-ok-bg text-brand" :
          isWrong ? "animate-[shake_0.3s] border-bad-line bg-bad-bg text-bad-fg" :
          isSel ? "border-sky-line bg-sky-soft text-sky-fg" :
          "border-line bg-card hover:bg-hover"}`}>
        {audioLeft && item.side === "en" ? <Icon name="speaker" /> : item.label}
      </motion.button>
    );
  };

  return (
    <div>
      <h2 className="font-display mb-3 text-lg font-extrabold">
        {audioLeft ? "Toque no que você ouviu e no par:" : "Combine os pares:"}
      </h2>
      <div className="grid grid-cols-2 gap-2.5">
        {cols.map((col, c) => (
          <div key={c} className="flex flex-col gap-2.5">
            {col.map((item, r) => cell(item, `${item.side}:${r}`))}
          </div>
        ))}
      </div>
    </div>
  );
}
