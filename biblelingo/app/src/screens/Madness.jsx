// Match Madness (VISUAL_SPEC 6.10, 7.3 "Match Madness", 11.8). Porta de hub.js (startMatchMadness/madnessRound/endMatchMadness).
// 60 s, rodadas de 5 pares en|pt; acerto +1, erro -2 s; XP = min(15, score/2), mínimo 1 quando score > 0.
// Cabeçalho: arrow-left 44, placar (bolt 24 + numeral pulsando a cada acerto), relógio 72x36 (vermelho pulsando com vinheta e tick
// nos 10 s finais). Grade 2 colunas de MatchCell 166x69 (data-md-cell, data-side e data-key preservados): par certo pisca verde,
// afunda e some; rodada nova em cascata de 40 ms; erro: flash vermelho de tela 120 ms + "-2 s" flutuando do relógio.
// Fim: troféu com SPRING.bounce (ou timer cinza), contagem com CountUp, confete se recorde, sfx gong.
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import confettiFx from "canvas-confetti";
import { state, save } from "../core/store.js";
import { recordLesson, learnedVocab } from "../core/session.js";
import { speak, stopClip } from "../core/audio.js";
import { shuffle } from "../core/util.js";
import { SPRING, list, item } from "../core/motion.js";
import { sfx } from "../core/sfx.js";
import { haptic } from "../core/haptics.js";
import { Button3D, MatchCell, CountUp } from "../components/ui/index.js";
import Icon from "../components/Icon.jsx";

const TOTAL = 60;

export default function Madness({ onExit }) {
  const reduce = useReducedMotion();
  const wordsRef = useRef(null);
  if (!wordsRef.current) wordsRef.current = shuffle(learnedVocab());
  const [game, setGame] = useState(0);      // reinícios ("Jogar de novo")
  const [round, setRound] = useState(0);
  const [matched, setMatched] = useState(() => new Set());
  const [fresh, setFresh] = useState(() => new Set()); // pares certos nos primeiros 300 ms (verde) antes de sumir
  const [selected, setSelected] = useState(null);
  const [wrongPair, setWrongPair] = useState([]);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TOTAL);
  const [flash, setFlash] = useState(false);
  const [penalties, setPenalties] = useState([]); // "-2 s" flutuando
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
  // Últimos 10 s: tick e haptic por segundo
  useEffect(() => {
    if (end || timeLeft > 10 || timeLeft <= 0) return;
    sfx("tick");
    haptic("tick");
  }, [timeLeft]); // eslint-disable-line
  useEffect(() => {
    if (timeLeft > 0 || endedRef.current) return;
    endedRef.current = true;
    const sc = scoreRef.current;
    const gained = sc > 0 ? Math.max(1, Math.min(15, Math.floor(sc / 2))) : 0;
    state.xp += gained;
    state.best = state.best || {};
    const record = sc > (state.best.madness || 0);
    if (record) state.best.madness = sc;
    recordLesson({ gained, perfect: sc > 0 && missesRef.current === 0, bestCombo: 0 });
    save();
    sfx("gong");
    haptic("gong");
    setEnd({ gained, record, score: sc, misses: missesRef.current });
  }, [timeLeft]); // eslint-disable-line
  useEffect(() => {
    if (!end || !end.record || reduce) return;
    const t = setTimeout(() => { try { confettiFx({ particleCount: 90, spread: 80, origin: { y: 0.4 }, ticks: 200 }); } catch (e) { /* sem confete */ } }, 300);
    return () => clearTimeout(t);
  }, [end]); // eslint-disable-line
  useEffect(() => () => stopClip(), []);

  const exit = () => { stopClip(); onExit(); };

  const click = (cell) => {
    if (end || endedRef.current || matched.has(cell.id)) return;
    sfx("select");
    haptic("select");
    if (cell.side === "en") speak(cell.label);
    if (!selected) { setSelected(cell.id); return; }
    if (selected === cell.id) { setSelected(null); return; }
    const sel = cells.find((c) => c.id === selected);
    if (sel.side === cell.side) { setSelected(cell.id); return; }
    if (sel.key === cell.key) {
      const m = new Set(matched); m.add(sel.id); m.add(cell.id);
      setMatched(m);
      setFresh((f) => { const n = new Set(f); n.add(sel.id); n.add(cell.id); return n; });
      setTimeout(() => setFresh((f) => { const n = new Set(f); n.delete(sel.id); n.delete(cell.id); return n; }), 300);
      const ns = scoreRef.current + 1;
      scoreRef.current = ns; setScore(ns);
      sfx("pop", ns % 8);
      haptic("pair");
      if (m.size === cells.length) setTimeout(() => {
        if (endedRef.current) return;
        setMatched(new Set()); setFresh(new Set()); setRound((r) => r + 1);
      }, 520);
    } else {
      setWrongPair([sel.id, cell.id]);
      setTimeout(() => setWrongPair([]), 400);
      missesRef.current++; setMisses(missesRef.current);
      setTimeLeft((t) => Math.max(1, t - 2));
      sfx("wrong");
      haptic("wrong");
      setFlash(true); setTimeout(() => setFlash(false), 120);
      const pid = Date.now() + Math.random();
      setPenalties((p) => [...p, pid]);
      setTimeout(() => setPenalties((p) => p.filter((x) => x !== pid)), 650);
    }
    setSelected(null);
  };

  const again = () => {
    wordsRef.current = shuffle(learnedVocab());
    endedRef.current = false;
    scoreRef.current = 0; missesRef.current = 0;
    setScore(0); setMisses(0); setTimeLeft(TOTAL);
    setMatched(new Set()); setFresh(new Set()); setSelected(null); setWrongPair([]);
    setRound(0); setEnd(null); setGame((g) => g + 1);
  };

  const urgent = !end && timeLeft <= 10;
  const stateOf = (cell) => {
    if (fresh.has(cell.id)) return "correct";
    if (matched.has(cell.id)) return "gone";
    if (wrongPair.includes(cell.id)) return "wrong";
    if (selected === cell.id) return "selected";
    return "idle";
  };
  const column = (col) => (
    <div className="flex flex-col gap-5">
      {col.map((cell, k) => (
        <motion.div key={cell.id} variants={item(SPRING.settle, 12)}>
          <MatchCell side={cell.side} keyId={cell.key} label={cell.label} state={stateOf(cell)} onClick={() => click(cell)} index={k} data-md-cell className="h-[69px]!" />
        </motion.div>
      ))}
    </div>
  );
  const best = (state.best && state.best.madness) || 0;

  return (
    <div className="mx-auto max-w-xl px-4" data-screen="madness">
      {/* Cabeçalho: voltar, placar, relógio */}
      <div className="sticky top-0 z-30 -mx-4 flex h-14 items-center gap-3 bg-page/95 px-3 backdrop-blur lg:mx-0">
        <button type="button" onClick={exit} aria-label="Sair do Match Madness" data-md-back
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-ink-soft hover:bg-raised">
          <Icon name="arrow-left" size={24} />
        </button>
        <span className="flex items-center gap-1 text-numeral text-yellow-text" aria-label={`${score} pares`}>
          <Icon name="bolt" size={24} />
          <motion.b key={score} data-md-score className="tabular-nums" initial={false} animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.25 }}>{score}</motion.b>
        </span>
        <span className="relative ml-auto">
          <motion.span data-md-time aria-label={`${timeLeft} segundos`}
            className={`flex h-9 w-[72px] items-center justify-center rounded-md border-2 bg-page text-numeral tabular-nums ${urgent ? "border-red-line text-red-text" : "border-line text-ink"}`}
            animate={urgent && !reduce ? { scale: [1, 1.12, 1] } : { scale: 1 }}
            transition={urgent && !reduce ? { duration: 0.5, repeat: Infinity, repeatDelay: 0.5 } : { duration: 0.15 }}>
            {end ? 0 : timeLeft}
          </motion.span>
          <AnimatePresence>
            {penalties.map((pid) => (
              <motion.span key={pid} aria-hidden className="pointer-events-none absolute left-1/2 -top-1 -translate-x-1/2 text-label text-red-text"
                initial={{ y: -16, opacity: 1 }} animate={{ y: -34, opacity: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}>
                -2 s
              </motion.span>
            ))}
          </AnimatePresence>
        </span>
      </div>

      {/* Vinheta vermelha pulsante nos 10 s finais e flash de erro */}
      <AnimatePresence>
        {urgent && !reduce && (
          <motion.div key="vignette" aria-hidden className="pointer-events-none fixed inset-0 z-20" style={{ boxShadow: "inset 0 0 60px rgba(255,75,75,.35)" }}
            initial={{ opacity: 0 }} animate={{ opacity: [0.4, 1, 0.4] }} exit={{ opacity: 0, transition: { duration: 0.2 } }} transition={{ duration: 1, repeat: Infinity }} />
        )}
        {flash && (
          <motion.div key="flash" aria-hidden className="pointer-events-none fixed inset-0 z-20" style={{ background: "rgba(255,75,75,.18)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.12 } }} transition={{ duration: 0.06 }} />
        )}
      </AnimatePresence>

      {end ? (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={SPRING.settle} className="flex flex-col items-center py-8 text-center" data-md-end>
          <motion.span initial={{ scale: 0, rotate: -12 }} animate={{ scale: 1, rotate: 0 }} transition={SPRING.bounce}>
            {end.record ? <Icon name="trophy" size={96} /> : <Icon name="timer" size={96} tone="var(--color-disabled)" />}
          </motion.span>
          <h2 className={`mt-3 text-title ${end.record ? "text-yellow-text" : "text-ink"}`}>{end.record ? "Novo recorde!" : "Tempo esgotado!"}</h2>
          <p className="mt-2 text-body text-ink">
            <b className="tabular-nums"><CountUp to={end.score} duration={0.6} delay={0.2} /></b> {end.score === 1 ? "par" : "pares"} · {end.misses} {end.misses === 1 ? "erro" : "erros"} · <b className="text-green-text"><CountUp to={end.gained} duration={0.6} delay={0.4} format={(v) => `+${v} XP`} /></b>
          </p>
          <p className="mt-1 text-secondary text-ink-soft">Recorde: {best} {best === 1 ? "par" : "pares"}</p>
          <div className="mt-6 flex w-full max-w-xs flex-col gap-2.5">
            <Button3D variant="primary" block onClick={again} data-md-again>Jogar de novo</Button3D>
            <Button3D variant="secondary" tone="muted" block onClick={exit} data-md-exit>Voltar</Button3D>
          </div>
        </motion.div>
      ) : (
        <>
          <h2 className="mb-4 mt-4 text-heading text-ink">Toque nos pares</h2>
          <motion.div key={`${game}:${round}`} className="grid grid-cols-2 gap-x-6" variants={list(0.04)} initial="hidden" animate="show">
            {column(left)}
            {column(right)}
          </motion.div>
        </>
      )}
    </div>
  );
}
