// Aba Praticar (VISUAL_SPEC 6.5): cabeçalho com o personagem do capítulo, cinco cards de prática de 80 px,
// Situações do dia a dia em carrosséis por personagem e Histórias em grade de duas colunas.
// História e Match Madness são visões locais desta tela (o App só conhece "hub").
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useAppState } from "../core/useStore.js";
import { state } from "../core/store.js";
import { startQuickPractice, startErrorPractice, startLesson, learnedOnly } from "../core/session.js";
import { STORIES, SCENES, COURSE, UNIT_CAST, CHARACTERS, castChar, lessonUnlocked, currentLessonId, unitSteps } from "../core/content.js";
import { XP_PER_LESSON } from "../core/util.js";
import { SPRING, STAGGER, list, item } from "../core/motion.js";
import { unitVars } from "../core/palette.js";
import { useIsDark } from "../components/shell/useIsDark.js";
import { sfx } from "../core/sfx.js";
import { haptic } from "../core/haptics.js";
import Icon from "../components/Icon.jsx";
import { Avatar, CharacterStage, Badge, Pill, useAsset, charAsset } from "../components/ui/index.js";
import Story from "./Story.jsx";
import Madness from "./Madness.jsx";

const VIEW_SPRING = { type: "spring", stiffness: 300, damping: 30 };

// Capítulo em andamento (o da próxima etapa não concluída) e um personagem dele para o cabeçalho
function currentUnit() {
  const cur = currentLessonId();
  return COURSE.find((u) => unitSteps(u).some((s) => s.id === cur)) || COURSE[COURSE.length - 1];
}
function unitHero(unit) {
  const cast = (UNIT_CAST[unit.id] || []).filter((k) => CHARACTERS[k]);
  const key = cast[0] || Object.keys(CHARACTERS)[0];
  return { key, ...CHARACTERS[key] };
}

// Card de prática de 80 px: ícone ilustrado 48, título 17/700, subtítulo 15/500, chevron à direita
function PracticeCard({ icon, title, sub, disabled, onClick, testId, badge, tone }) {
  const empty = tone === "success";
  return (
    <motion.button type="button" data-hub={testId} disabled={disabled} variants={item(SPRING.settle, 12)}
      onClick={() => { if (disabled) return; sfx("tap"); haptic("tap"); onClick(); }}
      className={`flex h-20 w-full items-center gap-4 rounded-lg border-2 border-b-4 px-4 text-left ${
        empty ? "border-green-line bg-green-soft" : "card-interactive hover:bg-raised"} ${disabled && !empty ? "opacity-60" : ""}`}
      whileTap={disabled ? undefined : { y: 2, borderBottomWidth: 2 }} transition={SPRING.snap}>
      <Icon name={icon} size={48} />
      <span className="min-w-0 flex-1">
        <b className={`block truncate text-body font-bold ${empty ? "text-green-text" : "text-ink"}`}>{title}</b>
        <small className={`line-clamp-2 text-secondary leading-5 ${empty ? "text-green-text" : "text-ink-soft"}`}>{sub}</small>
      </span>
      {badge}
      {!empty && !badge && <Icon name="chevron-right" size={24} tone="var(--color-disabled)" />}
    </motion.button>
  );
}

// Card de situação 140x180: avatar 72 com anel do capítulo, título em 2 linhas, "+10 XP"
function SceneCard({ scene, ch, unlocked, done }) {
  const open = unlocked || done;
  return (
    <motion.button type="button" data-scene={scene.id} aria-disabled={!open || undefined}
      onClick={() => { if (!open) return; sfx("tap"); haptic("tap"); startLesson(scene.id); }}
      className={`relative flex h-[180px] w-[140px] shrink-0 snap-start flex-col items-center rounded-lg border-2 border-b-4 border-line bg-page px-2.5 pt-4 text-center ${
        open ? "hover:bg-raised" : "opacity-60"}`}
      whileTap={open ? { y: 2, borderBottomWidth: 2 } : undefined} transition={SPRING.snap}>
      {done && <span className="absolute right-1.5 top-1.5"><Icon name="check-circle" size={24} /></span>}
      {!open && <span className="absolute right-1.5 top-1.5"><Icon name="lock" size={24} /></span>}
      <Avatar ch={ch} size={72} ring={open ? true : undefined} />
      <span className="mt-3 line-clamp-2 text-[15px] font-bold leading-5 text-ink">{scene.title}</span>
      <span className="mt-auto pb-3 text-caption uppercase tracking-[.8px] text-yellow-text">+{XP_PER_LESSON} XP</span>
    </motion.button>
  );
}

function Situations() {
  const dark = useIsDark();
  const groups = useMemo(() => {
    const g = [];
    SCENES.forEach((s) => {
      let x = g.find((y) => y.char === s.char);
      if (!x) { x = { char: s.char, unit: s.unit, items: [] }; g.push(x); }
      x.items.push(s);
    });
    return g;
  }, []);
  return (
    <div className="flex flex-col gap-5">
      {groups.map((g) => {
        const ch = castChar(g.char);
        const done = g.items.filter((s) => state.completed[s.id]).length;
        return (
          <section key={g.char} style={unitVars(g.unit, dark)} aria-label={`Situações com ${ch.name}`}>
            <div className="mb-3 flex items-center gap-3">
              <Avatar ch={ch} size={40} />
              <b className="text-body font-bold text-ink">{ch.name.split(" (")[0]}</b>
              <small className="ml-auto text-caption uppercase tracking-[.8px] text-ink-soft">{done}/{g.items.length}</small>
            </div>
            <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {g.items.map((s) => (
                <SceneCard key={s.id} scene={s} ch={ch} unlocked={lessonUnlocked(s.id)} done={!!state.completed[s.id]} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

// Capa 1:1 da história: hero.webp do personagem de capa (ou o retrato atual) com degradê Pergaminho no pé
function StoryCover({ ch, locked }) {
  const hero = useAsset(charAsset(ch, "hero.webp"));
  const src = hero ? charAsset(ch, "hero.webp") : ch && ch.img;
  return (
    <span className="relative block aspect-square w-full overflow-hidden rounded-md bg-parchment">
      {src ? (
        <img src={src} alt="" draggable="false" loading="lazy" decoding="async"
          className={`h-full w-full object-cover ${locked ? "grayscale" : ""}`} style={{ objectPosition: hero ? "top" : "center 22%" }} />
      ) : (
        <span className="flex h-full w-full items-center justify-center"><Icon name="book-open" size={64} /></span>
      )}
      <span aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(transparent 55%, var(--color-parchment))" }} />
    </span>
  );
}

function StoryGrid({ onOpen }) {
  return (
    <motion.div className="grid grid-cols-2 gap-4" variants={list(STAGGER.cards * 0.5)} initial="hidden" animate="show">
      {STORIES.map((s) => {
        const unit = COURSE.find((u) => u.id === s.unit);
        const unlocked = !!(unit && state.completed[unit.lessons[0].id]);
        const done = !!(state.stories && state.stories[s.id]);
        const cover = CHARACTERS[s.cover] ? { key: s.cover, ...CHARACTERS[s.cover] } : null;
        return (
          <motion.button key={s.id} type="button" data-story={s.id} disabled={!unlocked} variants={item(SPRING.settle, 12)}
            onClick={() => { sfx("tap"); haptic("tap"); onOpen(s.id); }}
            className={`relative flex min-h-[200px] flex-col rounded-lg border-2 border-b-4 border-line bg-page p-2 text-left ${unlocked ? "hover:bg-raised" : "opacity-60"}`}
            whileTap={unlocked ? { y: 2, borderBottomWidth: 2 } : undefined} transition={SPRING.snap}>
            <StoryCover ch={cover} locked={!unlocked} />
            {done && <span className="absolute right-3 top-3 rounded-full bg-page p-[2px]"><Icon name="check-circle" size={24} /></span>}
            {!unlocked && <span className="absolute right-3 top-3 rounded-full bg-page p-[2px]"><Icon name="lock" size={24} /></span>}
            <span className="mt-2 line-clamp-2 px-1 text-[15px] font-bold leading-5 text-ink">{s.title}</span>
            <span className="mt-auto px-1 pb-1 pt-1 text-caption uppercase tracking-[.8px] text-yellow-text">
              {unlocked ? `+${s.xp} XP` : <span className="normal-case tracking-normal text-ink-soft">Conclua a 1ª etapa do capítulo</span>}
            </span>
          </motion.button>
        );
      })}
    </motion.div>
  );
}

export default function Hub() {
  useAppState();
  const dark = useIsDark();
  const [view, setView] = useState("hub"); // "hub" | "madness" | { story: id }
  const nErr = Object.keys(state.errors || {}).length;
  const learned = learnedOnly().length;
  const unit = currentUnit();
  const hero = useMemo(() => unitHero(unit), [unit.id]);

  return (
    <AnimatePresence mode="wait" initial={false}>
      {view === "madness" ? (
        <motion.div key="madness" initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ opacity: 0, transition: { duration: 0.18 } }} transition={VIEW_SPRING}>
          <Madness onExit={() => setView("hub")} />
        </motion.div>
      ) : typeof view === "object" && view.story ? (
        <motion.div key={"story-" + view.story} initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ opacity: 0, transition: { duration: 0.18 } }} transition={VIEW_SPRING}>
          <Story id={view.story} onExit={() => setView("hub")} />
        </motion.div>
      ) : (
        <motion.div key="hub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.15 } }} transition={{ duration: 0.2 }}
          className="mx-auto max-w-xl px-4 pb-8 pt-4" data-screen="hub">
          {/* Cabeçalho: título e resumo à esquerda, personagem do capítulo à direita */}
          <div className="flex items-end justify-between gap-3" style={unitVars(unit.id, dark)}>
            <div className="min-w-0 pb-2">
              <h2 className="text-display text-ink">Praticar</h2>
              <p className="mt-1 text-secondary text-ink-soft">{learned} {learned === 1 ? "palavra aprendida" : "palavras aprendidas"} · {nErr} para revisar</p>
            </div>
            <CharacterStage ch={hero} variant="header" className="-mb-1" />
          </div>

          <motion.div className="mt-3 flex flex-col gap-3" variants={list(0.06)} initial="hidden" animate="show">
            {nErr ? (
              <PracticeCard testId="errors" icon="bandage" title="Erros" sub={`${nErr} ${nErr === 1 ? "palavra" : "palavras"} para acertar`}
                badge={<Pill count={nErr} />} onClick={() => startErrorPractice()} />
            ) : (
              <PracticeCard testId="errors" icon="bandage" title="Erros" sub="Nenhum erro pendente. Parabéns!" tone="success" disabled onClick={() => {}} />
            )}
            <PracticeCard testId="review" icon="book" title="Palavras" sub="Revisão rápida · 9 exercícios" onClick={() => startQuickPractice("review")} />
            <PracticeCard testId="listen" icon="headphones" title="Escuta" sub="8 exercícios" onClick={() => startQuickPractice("listen")} />
            <PracticeCard testId="speak" icon="mic" title="Fala" sub="Pronúncia das frases do capítulo" onClick={() => startQuickPractice("speak")} />
            <PracticeCard testId="madness" icon="bolt" title="Match Madness" sub="Pares contra o relógio"
              badge={<Badge kind="timer" className="shrink-0" />} onClick={() => setView("madness")} />
          </motion.div>

          <h3 className="mb-1 mt-8 text-heading text-ink">Situações do dia a dia</h3>
          <p className="mb-4 text-secondary text-ink-soft">Conversas reais da Bíblia vividas como situações de hoje.</p>
          <Situations />

          <h3 className="mb-4 mt-8 text-heading text-ink">Histórias</h3>
          <StoryGrid onOpen={(id) => setView({ story: id })} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
