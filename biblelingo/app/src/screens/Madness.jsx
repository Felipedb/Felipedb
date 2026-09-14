// Match Madness — porta fiel de hub.js (startMatchMadness/madnessRound/endMatchMadness).
// 60 s, rodadas de 5 pares en|pt; acerto +1, erro -2 s; XP = min(15, score/2).
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { state, save } from "../core/store.js";
import { recordLesson, learnedVocab } from "../core/session.js";
import { speak, stopClip } from "../core/audio.js";
import { shuffle, buzz } from "../core/util.js";
import { sfx } from "../core/events.js";

export default function Madness({ onExit }) {
  const wordsRef = useRef(null);
  if (!wordsRef.current) wordsRef.current = shuffle(learnedVocab());
  const [game, setGame] = useState(0);      // reinícios ("Jogar de novo")
  const [round, setRound] = useState(0);
  const [matched, setMatched] = useState(() => new Set());
  const [selected, setSelected] = useState(null);
  const [wrongPair, setWrongPair] = useState([]);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [end, setEnd] = useState(null);     // { gained, record, score, misses }
  const scoreRef = useRef(0);
  const missesRef = useRef(0);
  const endedRef = useRef(false);

  // Rodada: 5 pares em duas colunas (en | pt), como madnessRound()
  const { left, right, cells } = useMemo(() => {
    const words = wordsRef.current;
    const start = (round * 5) % words.length;
    let pairs = words.slice(start, start + 5);
    if (pairs.length < 5) pairs = pairs.concat(words.slice(0, 5 - pairs.length));
    const left = shuffle(pairs.map((p) => ({ id: "en:" + p.en, key: p.en, side: "en", label: p.en })));
    const right = shuffle(pairs.map((p) => ({ id: "pt:" + p.en, key: p.en, side: "pt", label: p.pt })));
    return { left, right, cells: [...left, ...right] };
  }, [round, game]);

  // Cronômetro
  useEffect(() => {
    if (end) return;
    const t = setInterval(() => setTimeLeft((v) => v - 1), 1000);
    return () => clearInterval(t);
  }, [end, game]);
  useEffect(() => {
    if (timeLeft > 0 || endedRef.current) return;
    endedRef.current = true;
    const gained = Math.min(15, Math.floor(scoreRef.current / 2));
    state.xp += gained;
    state.best = state.best || {};
    const record = scoreRef.current > (state.best.madness || 0);
    if (record) state.best.madness = scoreRef.current;
    recordLesson({ gained, perfect: scoreRef.current > 0 && missesRef.current === 0, bestCombo: 0 });
    save();
    sfx("finish");
    setEnd({ gained, record, score: scoreRef.current, misses: missesRef.current });
  }, [timeLeft]);
  useEffect(() => () => stopClip(), []);

  const exit = () => { stopClip(); onExit(); };

  const click = (cell) => {
    if (end || endedRef.current || matched.has(cell.id)) return;
    if (cell.side === "en") speak(cell.label);
    if (!selected) { setSelected(cell.id); return; }
    if (selected === cell.id) { setSelected(null); return; }
    const sel = cells.find((c) => c.id === selected);
    if (sel.side === cell.side) { setSelected(cell.id); return; }
    if (sel.key === cell.key) {
      const m = new Set(matched); m.add(sel.id); m.add(cell.id);
      setMatched(m);
      const ns = scoreRef.current + 1;
      scoreRef.current = ns; setScore(ns);
      sfx("pop", ns % 8);
      if (m.size === cells.length) setTimeout(() => {
        if (endedRef.current) return;
        setMatched(new Set()); setRound((r) => r + 1);
      }, 250);
    } else {
      setWrongPair([sel.id, cell.id]);
      setTimeout(() => setWrongPair([]), 400);
      missesRef.current++; setMisses(missesRef.current);
      setTimeLeft((t) => Math.max(1, t - 2));
      buzz(50);
    }
    setSelected(null);
  };

  const again = () => {
    wordsRef.current = shuffle(learnedVocab());
    endedRef.current = false;
    scoreRef.current = 0; missesRef.current = 0;
    setScore(0); setMisses(0); setTimeLeft(60);
    setMatched(new Set()); setSelected(null); setWrongPair([]);
    setRound(0); setEnd(null); setGame((g) => g + 1);
  };

  const urgent = !end && timeLeft <= 10;
  const cellBtn = (cell) => {
    const isMatched = matched.has(cell.id);
    const isSel = selected === cell.id;
    const isWrong = wrongPair.includes(cell.id);
    return (
      <motion.button key={cell.id} data-md-cell data-side={cell.side} onClick={() => click(cell)}
        animate={isWrong ? { x: [0, -6, 6, -4, 4, 0] } : isMatched ? { scale: [1, 1.08, 1] } : { x: 0, scale: 1 }}
        transition={{ duration: 0.3 }}
        className={`rounded-2xl border-2 border-b-4 px-3.5 py-3 text-left font-bold transition-colors ${
          isMatched ? "pointer-events-none border-ok-line bg-card opacity-35" :
          isWrong ? "border-bad-line bg-bad-bg text-bad-fg" :
          isSel ? "border-sky-line bg-sky-soft text-sky-fg" :
          "border-line bg-card hover:bg-hover"}`}>
        {cell.label}
      </motion.button>
    );
  };

  return (
    <div className="mx-auto max-w-xl px-4 pt-2" data-screen="madness">
      {/* Topo: voltar + placar + tempo */}
      <div className="sticky top-0 z-30 -mx-4 flex items-center gap-3 border-b-2 border-line bg-page/95 px-4 py-2 backdrop-blur lg:mx-0 lg:rounded-2xl lg:border-2">
        <button onClick={exit} aria-label="Sair" data-md-back
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xl font-bold text-ink-soft transition-colors hover:bg-hover">←</button>
        <span className="font-display text-lg font-black text-gold-fg">⚡ <b data-md-score>{score}</b></span>
        <motion.span data-md-time animate={urgent ? { scale: [1, 1.12, 1] } : { scale: 1 }}
          transition={urgent ? { repeat: Infinity, duration: 0.5 } : { duration: 0.15 }}
          className={`ml-auto rounded-xl border-2 bg-card px-3 py-0.5 font-display text-lg font-black tabular-nums ${urgent ? "border-bad-line text-danger" : "border-line"}`}>
          {timeLeft}
        </motion.span>
      </div>

      {end ? (
        <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
          className="py-8 text-center" data-md-end>
          <div className="text-6xl">{end.record ? "🏆" : "⏱️"}</div>
          <h3 className="font-display mt-2 text-2xl font-extrabold text-gold-fg">{end.record ? "Novo recorde!" : "Tempo esgotado!"}</h3>
          <p className="mt-1 font-bold"><b>{end.score}</b> pares · {end.misses} erros · <b className="text-brand">+{end.gained} XP</b></p>
          <p className="mt-1 text-sm font-bold text-ink-soft">Recorde: {(state.best && state.best.madness) || 0} pares</p>
          <div className="mx-auto mt-5 flex max-w-xs flex-col gap-2.5">
            <button onClick={again} data-md-again className="btn-3d bg-brand-bright px-5 py-3 text-white">Jogar de novo</button>
            <button onClick={exit} data-md-exit className="rounded-2xl border-2 border-line bg-card px-5 py-3 font-display font-bold text-ink-soft transition-colors hover:bg-hover">Voltar</button>
          </div>
        </motion.div>
      ) : (
        <>
          <h2 className="font-display mb-3 mt-4 text-lg font-extrabold">Toque nos pares</h2>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="flex flex-col gap-2.5">{left.map(cellBtn)}</div>
            <div className="flex flex-col gap-2.5">{right.map(cellBtn)}</div>
          </div>
        </>
      )}
    </div>
  );
}
