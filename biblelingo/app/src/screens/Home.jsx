// Trilha (VISUAL_SPEC 6.1 adaptada à decisão do dono: a trilha SOBE). Capítulo 1 no pé, o caminho sobe até o card
// "Mais capítulos em breve"; o nó atual abre centralizado. data-order continua sendo a ordem verdadeira do curso.
// Cada capítulo é uma <section> com as variáveis da paleta (unitVars), UnitHeader sticky (mostra o capítulo em vista nos
// dois sentidos), nós em ciclo de 8 deslocamentos, baús e personagens ao lado do caminho e o troféu dourado no fim.
// Tocar um nó abre o NodePopover (o botão com data-popover-start inicia a etapa). Sem CTA fixo: só a pílula "Retomar",
// pequena, quando há lição em andamento e o nó atual saiu de vista.
import { Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAppState } from "../core/useStore.js";
import { state, save } from "../core/store.js";
import { COURSE, UNIT_CAST, unitSteps, unitDone, currentLessonId, castChar, testamentOf, SCENE_BY_ID } from "../core/content.js";
import { startLesson, startLevelUp, resumable, unitCrowns, MAX_CROWN } from "../core/session.js";
import { unitVars } from "../core/palette.js";
import { SPRING } from "../core/motion.js";
import { useIsDark } from "../components/shell/useIsDark.js";
import Hud from "../components/shell/Hud.jsx";
import PathNode, { TrophyNode, TrailChest, TrailCharacter } from "../components/trail/PathNode.jsx";
import NodePopover from "../components/trail/NodePopover.jsx";
import UnitHeader from "../components/trail/UnitHeader.jsx";
import SectionDivider from "../components/trail/SectionDivider.jsx";
import TrailEnd, { TrailStart } from "../components/trail/TrailEnd.jsx";
import UnitGuideSheet from "../components/trail/UnitGuideSheet.jsx";
import Icon from "../components/Icon.jsx";

// Deslocamento horizontal dos nós em ciclo de 8 posições, reiniciado a cada capítulo (5.2)
const OFFSETS = [0, 44, 70, 44, 0, -44, -70, -44];

// Variáveis do capítulo para o <section> e para o popover: as --unit-* da paleta, os espelhos --color-unit* (lidos pelos
// ícones notebook e book dentro do bloco) e os tons do nó bloqueado (face --color-line, sombra e glifo do cadeado)
function unitStyle(unitId, dark, over = {}) {
  const v = { ...unitVars(unitId, dark), ...over };
  return {
    ...v,
    "--color-unit": v["--unit-color"], "--color-unit-shadow": v["--unit-shadow"], "--color-unit-soft": v["--unit-soft"],
    "--color-unit-text": v["--unit-text"], "--color-unit-ink": v["--unit-ink"],
    "--node-locked-shadow": dark ? "#2b3940" : "#afafaf", "--node-locked-icon": dark ? "#8fa3ad" : "#afafaf",
  };
}
const sectionOf = (ui) => (ui < 7 ? 1 : 2);
// Quem era o nó atual quando a trilha saiu de cena: ao voltar, se mudou, esse nó acabou de ser concluído e comemora
let lastCurrentId = null;

// Decoração ao lado do caminho, no lado oposto ao deslocamento do nó: personagem nas posições 2 e 8, baú na 6 e junto ao troféu
function decorationFor(i, n, x) {
  if (i === 2 && n > 3) return { type: "char", k: 0, side: "left" };
  if (i === 6 && n > 7) return { type: "chest", side: "right" };
  if (i === 8 && n > 9) return { type: "char", k: 1, side: "left" };
  if (i === n) return { type: "chest", side: x >= 0 ? "left" : "right" };
  return null;
}

function UnitSection({ u, ui, dark, currentId, orderOf, resume, popKey, onOpenNode, onOpenTrophy, onGuide, justDone }) {
  const steps = unitSteps(u);
  const n = steps.length;
  const done = unitDone(u);
  const crowns = unitCrowns(u.id);
  const prevUnitLast = ui === 0 ? null : unitSteps(COURSE[ui - 1]).slice(-1)[0].id;
  const cast = (UNIT_CAST[u.id] || []).map((k) => castChar(k));
  const vars = unitStyle(u.id, dark);
  const rows = steps.map((step, i) => ({ step, i, x: OFFSETS[i % 8] }));
  rows.push({ trophy: true, i: n, x: OFFSETS[n % 8] });
  rows.reverse(); // a trilha sobe: a última etapa fica em cima e a primeira embaixo
  const celebrating = !!justDone && steps.some((s) => s.id === justDone);

  const chestStatus = (key, reached) => (state.chests && state.chests[key] ? "opened" : reached ? "ready" : "locked");
  const openChest = (key) => {
    state.chests = state.chests || {};
    if (state.chests[key]) return;
    state.chests[key] = 5;
    state.xp += 5;
    save();
  };

  return (
    <section data-unit={u.id} style={vars} className="relative mb-8">
      <UnitHeader section={sectionOf(ui)} chapter={ui + 1} title={u.title} done={done} onGuide={() => onGuide(u, ui)} />
      <div className="flex flex-col gap-8" data-trail-col>
        {rows.map((row) => {
          const deco = decorationFor(row.i, n, row.x);
          let decoEl = null;
          if (deco && deco.type === "char" && cast[deco.k]) decoEl = <TrailCharacter ch={cast[deco.k]} side={deco.side} />;
          if (deco && deco.type === "chest") {
            const key = `${u.id}:${row.i}`;
            const reached = row.trophy ? done : !!state.completed[steps[row.i].id];
            decoEl = <TrailChest status={chestStatus(key, reached)} side={deco.side} onOpen={() => openChest(key)} />;
          }
          if (row.trophy) {
            const label = done
              ? (crowns >= MAX_CROWN ? `Troféu lendário do capítulo ${ui + 1}` : `Troféu do capítulo ${ui + 1}: ${crowns} de ${MAX_CROWN} coroas`)
              : `Troféu do capítulo ${ui + 1}, bloqueado`;
            return (
              <div key="trophy" className="relative flex justify-center">
                {decoEl}
                <TrophyNode x={row.x} done={done} crowns={crowns} max={MAX_CROWN} label={label} onOpen={(el) => onOpenTrophy(el, u, ui)} />
              </div>
            );
          }
          const { step, i } = row;
          const doneStep = !!state.completed[step.id];
          const prevId = i === 0 ? prevUnitLast : steps[i - 1].id;
          const unlocked = !prevId || !!state.completed[prevId];
          const isCurrent = step.id === currentId;
          const status = doneStep ? (step.scene ? "scene-done" : "done") : (isCurrent || unlocked) ? "available" : "locked";
          const sc = step.scene ? SCENE_BY_ID[step.sceneId || step.id] : null;
          const ch = sc ? castChar(sc.char) : null;
          const icon = step.scene ? "speech" : step.review ? "book-open" : "star";
          const stars = state.stars[step.id] || 0;
          const isResume = !!(resume && resume.lesson.id === step.id);
          const kind = step.scene ? "Cena" : step.review ? "Revisão" : "Lição";
          const tail = doneStep ? `, concluída${step.scene ? "" : `, ${stars} de 3 estrelas`}` : isCurrent ? ", atual" : status === "locked" ? ", bloqueada" : "";
          return (
            <div key={step.id} className="relative flex justify-center">
              {decoEl}
              <PathNode step={step} order={orderOf[step.id]} status={status} isCurrent={isCurrent} x={row.x} icon={icon} ch={ch}
                label={`${kind} ${i + 1} de ${n}: ${step.title}${tail}`}
                balloon={isCurrent ? (isResume ? "Retomar" : "Começar") : null} balloonHidden={!!popKey}
                ringSegments={isResume ? Math.max(1, Math.ceil(resume.exercises.length / 5)) : step.scene ? 2 : 3}
                ringValue={isResume ? resume.index / resume.exercises.length : 0}
                celebrate={justDone === step.id} delayed={isCurrent && celebrating} stars={stars} cascade={n - i}
                onOpen={(el) => onOpenNode(el, { step, i, n, u, ui, status, stars, isResume })} />
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function Home() {
  useAppState();
  const dark = useIsDark();
  const currentId = currentLessonId();
  const resume = resumable();
  const colRef = useRef(null);
  const [pop, setPop] = useState(null);
  const [guide, setGuide] = useState({ open: false, u: null, ui: 0 });
  const [showResume, setShowResume] = useState(false);
  // Nó concluído desde a última visita (volta do Result): comemora uma vez
  const justDone = useMemo(() => (lastCurrentId && lastCurrentId !== currentId && state.completed[lastCurrentId] ? lastCurrentId : null), []); // eslint-disable-line
  useEffect(() => () => { lastCurrentId = currentLessonId(); }, []);

  // Ordem verdadeira do curso (data-order), independente da direção visual da trilha
  const orderOf = useMemo(() => {
    const m = {};
    let k = 0;
    COURSE.forEach((u) => unitSteps(u).forEach((s) => { m[s.id] = k++; }));
    return m;
  }, []);

  // Abre com o nó atual centralizado na tela (decisão do dono), sem animação; ao voltar do Result, rola suave (7.3)
  useLayoutEffect(() => {
    const el = colRef.current && colRef.current.querySelector("[data-current]");
    if (!el) return;
    const r = el.getBoundingClientRect();
    window.scrollTo({ top: Math.max(0, window.scrollY + r.top + r.height / 2 - window.innerHeight / 2), behavior: justDone ? "smooth" : "auto" });
  }, [currentId]); // eslint-disable-line

  // Pílula "Retomar": só com lição em andamento e com o nó atual fora da tela
  const resumeId = resume ? resume.lesson.id : null;
  useEffect(() => {
    if (!resumeId) { setShowResume(false); return undefined; }
    const el = colRef.current && colRef.current.querySelector("[data-current]");
    if (!el || typeof IntersectionObserver === "undefined") return undefined;
    const io = new IntersectionObserver(([e]) => setShowResume(!e.isIntersecting), { threshold: 0.1 });
    io.observe(el);
    return () => io.disconnect();
  }, [resumeId, currentId]);

  const openNode = (anchor, { step, u, status, stars, isResume }) => {
    const vars = unitStyle(u.id, dark);
    const key = step.id;
    const name = step.scene ? `Cena: ${step.title}` : step.title;
    if (status === "locked") {
      setPop({ key, anchor, variant: "locked", title: name, subtitle: "Conclua as etapas anteriores para desbloquear", vars });
      return;
    }
    const lessons = unitSteps(u).filter((s) => !s.scene);
    const li = lessons.findIndex((s) => s.id === step.id);
    const title = step.scene ? name : step.review ? `Revisão · ${u.title}` : `Lição ${li + 1} de ${lessons.length} · ${step.title}`;
    const done = status === "done" || status === "scene-done";
    const vocab = (step.vocab || []).slice(0, 5).map((v) => v.en).join(", ");
    const subtitle = done ? (step.scene ? "Cena concluída" : `${stars} de 3 estrelas`) : step.review ? "Revisão de todo o capítulo" : vocab ? `Vocabulário: ${vocab}` : u.subtitle;
    const cta = done ? "Praticar +5 XP" : isResume ? `Retomar ${Math.min(resume.index + 1, resume.exercises.length)}/${resume.exercises.length}` : "Começar +10 XP";
    setPop({ key, anchor, variant: "unit", title, subtitle, stars: done && !step.scene ? stars : null, cta, vars, onStart: () => { setPop(null); startLesson(step.id); } });
  };

  const openTrophy = (anchor, u, ui) => {
    const key = `${u.id}:trophy`;
    const vars = unitStyle(u.id, dark);
    if (!unitDone(u)) {
      setPop({ key, anchor, variant: "locked", title: `Troféu do capítulo ${ui + 1}`, subtitle: "Conclua todas as etapas do capítulo para desbloquear o troféu", vars });
      return;
    }
    const crowns = unitCrowns(u.id);
    const legendary = crowns >= MAX_CROWN;
    setPop({
      key, anchor, variant: "unit",
      title: legendary ? "Troféu lendário" : "Troféu do capítulo",
      subtitle: legendary ? `${u.title} · nível lendário alcançado` : `${u.title} · ${crowns} de ${MAX_CROWN} coroas`,
      cta: legendary ? "Praticar de novo" : `Subir de nível · ${crowns + 1}/${MAX_CROWN}`,
      vars: unitStyle(u.id, dark, { "--unit-color": "#ffc800", "--unit-shadow": "#e5a600", "--unit-ink": "#5b4400", "--unit-text-light": "#8a6200" }),
      onStart: () => { setPop(null); startLevelUp(u); },
    });
  };

  const closeGuide = () => setGuide((g) => ({ ...g, open: false }));
  const guideCta = useMemo(() => {
    const u = guide.u;
    if (!u) return null;
    const steps = unitSteps(u);
    const cur = steps.find((s) => s.id === currentId);
    if (cur) return { label: steps.some((s) => state.completed[s.id]) ? "Continuar capítulo" : "Começar capítulo", onClick: () => { closeGuide(); startLesson(cur.id); } };
    if (unitDone(u)) return { label: unitCrowns(u.id) >= MAX_CROWN ? "Praticar capítulo" : "Subir de nível", onClick: () => { closeGuide(); startLevelUp(u); } };
    return { label: "Capítulo bloqueado", disabled: true };
  }, [guide.u, currentId]); // eslint-disable-line

  const units = COURSE.map((u, ui) => ({ u, ui }));
  const rev = [...units].reverse();
  const sectionUnits = (sec) => units.filter(({ ui }) => sectionOf(ui) === sec).map(({ u, ui }) => {
    const st = unitSteps(u);
    return { u, ui, total: st.length, done: st.filter((s) => state.completed[s.id]).length };
  });
  const scrollToUnit = (u) => {
    const el = colRef.current && colRef.current.querySelector(`[data-unit="${u.id}"]`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div ref={colRef} className="relative mx-auto w-full max-w-[600px]">
      <Hud className="lg:hidden" />
      <div className="px-4 pt-4 lg:px-0 lg:pt-6">
        <TrailEnd />
        {rev.map(({ u, ui }, k) => {
          const below = rev[k + 1];
          const t = testamentOf(u, ui);
          const showDivider = !below || testamentOf(below.u, below.ui) !== t;
          return (
            <Fragment key={u.id}>
              <UnitSection u={u} ui={ui} dark={dark} currentId={currentId} orderOf={orderOf} resume={resume} popKey={pop ? pop.key : null}
                onOpenNode={openNode} onOpenTrophy={openTrophy} onGuide={(uu, uui) => setGuide({ open: true, u: uu, ui: uui })} justDone={justDone} />
              {showDivider && <SectionDivider n={sectionOf(ui)} name={t} units={sectionUnits(sectionOf(ui))} onOpenChapter={scrollToUnit} />}
            </Fragment>
          );
        })}
        <TrailStart title={COURSE[0] && COURSE[0].title} />
      </div>

      <NodePopover open={pop} onClose={() => setPop(null)} />
      <UnitGuideSheet open={guide.open} unit={guide.u} chapter={guide.ui + 1} section={sectionOf(guide.ui)} cta={guideCta} onClose={closeGuide} />

      <AnimatePresence>
        {showResume && resume && (
          <motion.button type="button" onClick={() => startLesson(resume.lesson.id)}
            className="fixed bottom-[calc(74px+env(safe-area-inset-bottom))] right-4 z-40 flex h-12 items-center gap-2 rounded-pill bg-primary pl-4 pr-5 text-label uppercase tracking-[1px] text-primary-text lg:bottom-6"
            style={{ boxShadow: "0 4px 0 var(--color-primary-shadow)" }}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8, transition: { duration: 0.15 } }}
            transition={SPRING.footer} whileTap={{ y: 4, boxShadow: "0 0 0 var(--color-primary-shadow)" }}
            aria-label={`Retomar ${resume.lesson.title}, exercício ${Math.min(resume.index + 1, resume.exercises.length)} de ${resume.exercises.length}`}>
            <Icon name="play" size={20} tone="mono" />
            Retomar · {Math.min(resume.index + 1, resume.exercises.length)}/{resume.exercises.length}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
