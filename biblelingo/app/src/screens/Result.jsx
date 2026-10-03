// Resultado e pipeline pós-lição (VISUAL_SPEC 6.4, 7.3 "Concluir lição" e "Abrir baú", 11.3).
// Result -> StreakScreen (ofensiva aumentou nesta lição) -> DailyGoalScreen (meta batida nesta lição) -> CrownScreen (subiu de nível)
// -> MissionScreen (uma por item de session.pendingCelebrations, quando a meta não absorveu) -> trilha.
// Cada passo tem CTA com texto DOM "Continuar"; as cerimônias levam data-ceremony. window.__session.phase continua "result"
// até o último "Continuar" (finishToHome). Confete, som e haptic do fim de lição disparam aqui, ao montar, nunca na sessão;
// confettiFx.reset() ao desmontar impede o confete de vazar para a lição seguinte.
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import confettiFx from "canvas-confetti";
import { session, openChest, finishToHome } from "../core/session.js";
import { useSessionVersion } from "../core/useSession.js";
import { state } from "../core/store.js";
import { speak } from "../core/audio.js";
import { SPRING, STAGGER, EASE, list, item } from "../core/motion.js";
import { sfx } from "../core/sfx.js";
import { haptic } from "../core/haptics.js";
import { Button3D, StatCard, Chest, CharacterStage, AudioButton, useAsset, charAsset } from "../components/ui/index.js";
import Icon from "../components/Icon.jsx";
import StreakScreen from "./ceremonies/StreakScreen.jsx";
import DailyGoalScreen from "./ceremonies/DailyGoalScreen.jsx";
import CrownScreen from "./ceremonies/CrownScreen.jsx";
import MissionScreen from "./ceremonies/MissionScreen.jsx";

// Instantes da coreografia (ms): título, cards, baú, bênção, botões e revisão
const MARKS = [350, 700, 1500, 1900, 2200];
const STAR_AT = [450, 630, 810];
const fmtTime = (v) => `${Math.floor(v / 60)}:${String(v % 60).padStart(2, "0")}`;

// Cerimônias que esta lição disparou (telas repetidas no mesmo dia não reaparecem: os sinais vêm da própria lição)
function buildSteps(s) {
  const r = s.result;
  const missions = (s.pendingCelebrations || []).filter((c) => c.type === "mission");
  const steps = [];
  if (r.streakUp) steps.push({ kind: "streak" });
  if (r.goalHit) steps.push({ kind: "goal", missions });
  if (r.crown) steps.push({ kind: "crown" });
  if (!r.goalHit) missions.forEach((m) => steps.push({ kind: "mission", ...m }));
  return steps;
}

export default function Result() {
  useSessionVersion();
  const [step, setStep] = useState(0);
  const steps = useMemo(() => (session && session.result ? buildSteps(session) : []), []); // eslint-disable-line
  // Nenhum confete sobra para o primeiro exercício da lição seguinte
  useEffect(() => () => { try { confettiFx.reset(); } catch (e) { /* sem canvas */ } }, []);
  if (!session || !session.result) return null;
  const r = session.result;
  const next = () => { if (step >= steps.length) finishToHome(); else setStep(step + 1); };
  const cur = step > 0 ? steps[step - 1] : null;

  return (
    <AnimatePresence mode="wait">
      {!cur && <ResultView key="result" r={r} onContinue={next} />}
      {cur && cur.kind === "streak" && <StreakScreen key="streak" streak={r.streak} days={state.days || {}} onContinue={next} />}
      {cur && cur.kind === "goal" && <DailyGoalScreen key="goal" from={r.goalFrom} goal={r.goal} xp={r.goalXp} missions={cur.missions} onContinue={next} />}
      {cur && cur.kind === "crown" && <CrownScreen key="crown" {...r.crown} onContinue={next} />}
      {cur && cur.kind === "mission" && <MissionScreen key={`mission-${cur.id}-${step}`} id={cur.id} label={cur.label} reward={cur.reward} onContinue={next} />}
    </AnimatePresence>
  );
}

// Relógio da cascata: quantos instantes de MARKS já passaram (todos, em movimento reduzido)
function useStage(reduce) {
  const [stage, setStage] = useState(reduce ? MARKS.length : 0);
  useEffect(() => {
    if (reduce) { setStage(MARKS.length); return; }
    const ts = MARKS.map((ms, i) => setTimeout(() => setStage((s) => Math.max(s, i + 1)), ms));
    return () => ts.forEach(clearTimeout);
  }, [reduce]);
  return stage;
}

function ResultView({ r, onContinue }) {
  const reduce = useReducedMotion();
  const stage = useStage(reduce);
  const [showReview, setShowReview] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [chestReward] = useState(() => [1, 2, 3, 5][Math.floor(Math.random() * 4)]);
  const xpRef = useRef(null);
  const hasFull = useAsset(charAsset(r.char, "full.webp"));
  const wrong = r.log.filter((e) => !e.ok && !e.review);
  const right = r.log.filter((e) => e.ok).length;
  const glow = r.accuracy >= 80;

  // Coreografia: som e haptic (0), personagem (100), confete (250, dourado a 600 quando perfeito), estrelas (450/630/810), bênção falada (1900)
  useEffect(() => {
    sfx("finish");
    haptic("finish");
    const ts = [setTimeout(() => setCelebrate(true), reduce ? 0 : 100)];
    if (!reduce) {
      ts.push(setTimeout(() => {
        try {
          const side = (x, angle) => confettiFx({ particleCount: 60, angle, spread: 55, startVelocity: 45, origin: { x, y: 0.6 }, ticks: 200 });
          side(0.1, 60); side(0.9, 120);
          confettiFx({ particleCount: 70, spread: 160, startVelocity: 18, gravity: 0.9, ticks: 220, scalar: 1.1, origin: { x: 0.5, y: -0.05 } });
        } catch (e) { /* sem confete */ }
      }, 250));
      if (r.earned === 3) ts.push(setTimeout(() => { try { confettiFx({ particleCount: 80, spread: 90, startVelocity: 40, origin: { y: 0.4 }, colors: ["#ffc800", "#ffe066", "#ffffff"] }); } catch (e) { /* sem confete */ } }, 600));
      STAR_AT.forEach((ms, i) => { if (i < r.earned) ts.push(setTimeout(() => { sfx("star", i); haptic("star"); }, ms)); });
    }
    ts.push(setTimeout(() => speak(r.blessing.t, { char: r.char }), reduce ? 300 : 1900));
    return () => ts.forEach(clearTimeout);
  }, []); // eslint-disable-line

  const cards = [
    { key: "xp", label: "XP", value: r.gained, format: (v) => `+${v}`, icon: "bolt", color: "yellow", ref: xpRef },
    { key: "time", label: "Tempo", value: r.secs, format: fmtTime, icon: "clock", color: "blue" },
    { key: "acc", label: "Precisão", value: r.accuracy, format: (v) => `${v}%`, icon: "target", color: "green" },
  ];

  return (
    <motion.div className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center px-4 pt-4 text-center" data-screen="result"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.15 } }} transition={{ duration: 0.2 }}>
      {/* Personagem feliz com glow dourado (precisão >= 80%) falando a bênção */}
      <div className="relative flex justify-center">
        <CharacterStage ch={r.char} variant={hasFull ? "result" : "header"} pose="happy" state={celebrate ? "celebrate" : "idle"} glow={glow} talking="auto" />
      </div>

      <motion.h1 className={`mt-1 text-title ${r.earned === 3 ? "text-yellow-text" : "text-ink"}`} style={{ textWrap: "balance" }}
        initial={{ scale: 0.9, opacity: 0 }} animate={stage >= 1 ? { scale: 1, opacity: 1 } : { scale: 0.9, opacity: 0 }} transition={SPRING.pop}>
        {r.title}
      </motion.h1>

      {/* Três estrelas de 40 px: ganhas saltam com flash; não ganhas só apagam, sem girar */}
      <div className="relative mt-3 flex items-center gap-3" aria-label={`${r.earned} de 3 estrelas`} role="img">
        {r.earned === 3 && !reduce && (
          <motion.span aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ width: 200, height: 200, background: "var(--glow-gold)" }}
            initial={{ opacity: 0, rotate: 0, scale: 0.6 }} animate={{ opacity: [0, 1, 0], rotate: 180, scale: 1.2 }} transition={{ duration: 1, delay: 0.8 }} />
        )}
        {[0, 1, 2].map((i) => {
          const earned = i < r.earned;
          const delay = STAR_AT[i] / 1000;
          return (
            <motion.span key={i} className="relative inline-flex"
              initial={earned ? { scale: 0, opacity: 0 } : { opacity: 0 }}
              animate={earned ? { scale: 1, opacity: 1 } : { opacity: 0.45 }}
              transition={earned ? { duration: 0.45, ease: EASE.pop, delay } : { duration: 0.3, delay }}>
              {earned ? <Icon name="star" size={40} /> : <Icon name="star" size={40} tone="var(--color-disabled)" />}
              {earned && !reduce && (
                <motion.span aria-hidden className="absolute inset-0 rounded-full bg-white" initial={{ opacity: 0.8 }} animate={{ opacity: 0 }} transition={{ duration: 0.2, delay: delay + 0.1 }} />
              )}
            </motion.span>
          );
        })}
      </div>

      <AnimatePresence>
        {r.earned === 3 && stage >= 2 && (
          <motion.span className="relative mt-3 inline-flex overflow-hidden rounded-pill bg-yellow px-4 py-1 text-caption uppercase tracking-[.8px] text-gold-ink"
            initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={SPRING.pop}>
            Perfeito!
            {!reduce && <span aria-hidden className="absolute inset-0 animate-shimmer" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,.55) 50%, transparent)" }} />}
          </motion.span>
        )}
      </AnimatePresence>

      {/* StatCards em cascata com contagem: XP dourado, Tempo azul, Precisão verde */}
      <div className="mt-5 flex h-[92px] items-start justify-center gap-3.5">
        {stage >= 2 && (
          <motion.div className="flex gap-3.5" variants={list(STAGGER.cards)} initial="hidden" animate="show">
            {cards.map((c, i) => (
              <motion.div key={c.key} variants={item(SPRING.settle, 24)} onAnimationStart={() => sfx("pop", i)}>
                {/* O pulso do XP ao abrir o baú fica em um wrapper próprio, para não sobrepor a variante de entrada do card */}
                <motion.div animate={c.key === "xp" && r.chest ? { scale: [1, 1.15, 1] } : { scale: 1 }} transition={{ duration: 0.3 }}>
                  <StatCard ref={c.ref} label={c.label} value={c.value} format={c.format} icon={c.icon} color={c.color} duration={c.key === "xp" && r.chest ? 0.3 : 0.8} />
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Baú de recompensa: balança até abrir; a tampa salta e as moedas voam até o card de XP */}
      <div className="mt-6 w-full" style={{ minHeight: 80 }}>
        {stage >= 3 && (
          <motion.div className="relative flex h-[72px] w-full items-center rounded-lg border-2 border-b-4 border-yellow-line bg-yellow-soft pl-[112px] pr-4 text-left"
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={SPRING.settle}>
            <div className="absolute -top-5 left-3">
              <Chest size={96} state={r.chest ? "opened" : "ready"} reward={r.chest || chestReward} label="" targetRef={xpRef} onOpen={(bonus) => openChest(bonus)} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-body font-extrabold text-ink">{r.chest ? "Baú aberto" : "Baú de recompensa"}</div>
              <div className={`text-caption uppercase tracking-[.8px] ${r.chest ? "text-yellow-text" : "text-ink-soft"}`}>{r.chest ? `+${r.chest} XP de bônus` : "Toque para abrir"}</div>
            </div>
            {!r.chest && <Icon name="chevron-right" size={20} tone="var(--color-yellow-text)" />}
          </motion.div>
        )}
      </div>

      {/* Bênção em Pergaminho, com áudio */}
      <div className="mt-4 w-full" style={{ minHeight: 96 }}>
        {stage >= 4 && (
          <motion.blockquote className="parchment flex items-start gap-3 px-4 py-4 text-left" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={SPRING.settle}>
            <AudioButton text={r.blessing.t} char={r.char} className="mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="text-body italic text-ink">“{r.blessing.t}”</p>
              <footer className="mt-1 text-secondary font-bold not-italic" style={{ color: "var(--color-parchment-text)" }}>{r.blessing.r}</footer>
            </div>
          </motion.blockquote>
        )}
      </div>

      {/* Revisão da etapa: card interativo que expande a lista de erros */}
      {r.log.length > 0 && (
        <div className="mt-4 w-full text-left">
          {stage >= 5 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={SPRING.settle}>
              <motion.button type="button" onClick={() => { sfx("tap"); setShowReview(!showReview); }} aria-expanded={showReview}
                className="card-interactive flex w-full items-center gap-2 px-4 py-3 text-secondary font-bold text-ink hover:bg-raised"
                whileTap={{ y: 2, borderBottomWidth: 2 }} transition={SPRING.snap}>
                <Icon name="notebook" size={24} />
                <span className="whitespace-nowrap">Revisão da etapa</span>
                <b className="ml-auto whitespace-nowrap tabular-nums">{right} de {r.log.length} certas</b>
                <motion.span animate={{ rotate: showReview ? 180 : 0 }} transition={SPRING.snap}><Icon name="chevron-down" size={20} /></motion.span>
              </motion.button>
              <AnimatePresence initial={false}>
                {showReview && (
                  <motion.ul className="overflow-hidden" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0, transition: { duration: 0.15 } }} transition={SPRING.settle}>
                    {wrong.length ? wrong.map((e, i) => (
                      <li key={i} className="card mt-2 px-4 py-3">
                        <div className="text-body font-bold text-ink">{e.q}</div>
                        <div className="text-secondary text-red-text line-through">{e.a}</div>
                        <div className="text-secondary font-bold text-green-text">{e.c}</div>
                      </li>
                    )) : <li className="mt-2 text-secondary text-ink-soft">Nenhum erro na primeira passada. Excelente!</li>}
                  </motion.ul>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      )}

      {/* CTA fixo no pé: sempre no DOM (o teste clica "Continuar" assim que a fase vira result), aparece aos 2,2 s */}
      <div className="sticky bottom-0 mt-auto w-full bg-page pt-4 pb-[calc(16px+env(safe-area-inset-bottom))]">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={stage >= 5 ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }} transition={SPRING.settle}>
          <Button3D variant="primary" size="cta" block onClick={onContinue}>Continuar</Button3D>
        </motion.div>
      </div>
    </motion.div>
  );
}
