// Missões (VISUAL_SPEC 6.6): banner roxo com personagem e baú, missões diárias com "FALTAM N HORAS" e baús,
// missão mensal com medalha, card de ofensiva com a semana de chamas e versículo do dia em Pergaminho.
// A meta diária (anel + engrenagem) saiu daqui: vive em Configurações.
import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { useAppState } from "../core/useStore.js";
import { state, save } from "../core/store.js";
import { ensureDaily, QUESTS, startLesson } from "../core/session.js";
import { verseOfDay, COURSE, UNIT_CAST, CHARACTERS, currentLessonId, unitSteps } from "../core/content.js";
import { speak } from "../core/audio.js";
import { today } from "../core/util.js";
import { SPRING, STAGGER, list, item } from "../core/motion.js";
import { sfx } from "../core/sfx.js";
import { haptic } from "../core/haptics.js";
import Icon from "../components/Icon.jsx";
import { Card, CharacterStage, Chest, QuestRow, ProgressBar, Medal, Flame, StreakWeek, Sheet, EmptyState, Button3D } from "../components/ui/index.js";
import { StreakCalendar } from "./Profile.jsx";

const QUEST_ICON = { xp: "bolt", lessons: "book", perfect: "star", combo: "flame" };
const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const MONTHLY_XP = 300;

function currentUnit() {
  const cur = currentLessonId();
  return COURSE.find((u) => unitSteps(u).some((s) => s.id === cur)) || COURSE[COURSE.length - 1];
}

// Horas até a meia-noite local (as missões diárias renovam na virada do dia)
function hoursLeft() {
  const now = new Date();
  const mid = new Date(now);
  mid.setHours(24, 0, 0, 0);
  return Math.max(1, Math.ceil((mid - now) / 3600000));
}
function useHoursLeft() {
  const [h, setH] = useState(hoursLeft);
  useEffect(() => {
    const id = setInterval(() => setH(hoursLeft()), 60000);
    return () => clearInterval(id);
  }, []);
  return h;
}

function SectionTitle({ children, aside }) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-3">
      <h3 className="text-heading text-ink">{children}</h3>
      {aside && <span className="shrink-0 text-caption uppercase tracking-[.8px] text-ink-soft">{aside}</span>}
    </div>
  );
}

// ---------- Banner ----------
function Banner({ unit }) {
  const hero = useMemo(() => {
    const cast = (UNIT_CAST[unit.id] || []).filter((k) => CHARACTERS[k]);
    const key = cast.length ? cast[Math.floor(Math.random() * cast.length)] : Object.keys(CHARACTERS)[0];
    return { key, ...CHARACTERS[key] };
  }, [unit.id]);
  return (
    <motion.div variants={item(SPRING.settle, 12)} className="relative mt-9 h-[120px] w-full rounded-lg text-white"
      style={{ background: "linear-gradient(135deg, #ce82ff, #a560e8)" }}>
      <div className="absolute inset-y-0 left-4 right-[176px] flex flex-col justify-center">
        <h2 className="text-[22px] font-extrabold leading-7">Missões</h2>
        <p className="mt-1 text-secondary leading-5 text-white/85" style={{ textWrap: "balance" }}>Complete missões e ganhe recompensas</p>
      </div>
      <div className="absolute bottom-0 right-[72px]"><CharacterStage ch={hero} variant="header" /></div>
      <span className="pointer-events-none absolute bottom-3 right-3" aria-hidden><Chest size={56} state="ready" /></span>
    </motion.div>
  );
}

// ---------- Missões diárias ----------
function DailyCard() {
  const d = ensureDaily();
  const goal = state.dailyGoal;
  const hours = useHoursLeft();
  if (!Array.isArray(d.chests)) d.chests = [];
  const open = (q) => {
    d.chests.push(q.id);
    haptic("mission");
    save();
  };
  return (
    <motion.div variants={item(SPRING.settle, 12)}>
      <Card>
        <SectionTitle aside={`Faltam ${hours} ${hours === 1 ? "hora" : "horas"}`}>Missões diárias</SectionTitle>
        <div className="flex flex-col divide-y-2 divide-line">
          {QUESTS.map((q, i) => {
            const target = q.target(goal);
            const value = Math.min(d[q.key] || 0, target);
            const claimed = d.claimed.includes(q.id);
            const opened = d.chests.includes(q.id);
            const st = claimed ? (opened ? "claimed" : "ready") : "progress";
            return (
              <QuestRow key={q.id} icon={QUEST_ICON[q.id] || "bolt"} title={q.label === "Ganhe XP" ? `Ganhe ${goal} XP` : q.label}
                value={value} target={target} reward={q.reward} state={st} onClaim={() => open(q)} delay={i * STAGGER.week} className="py-1.5 first:pt-0 last:pb-0" />
            );
          })}
        </div>
      </Card>
    </motion.div>
  );
}

// ---------- Missão mensal ----------
function MonthlyCard({ unit }) {
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const xp = Object.entries(state.days || {}).filter(([k]) => k.startsWith(month)).reduce((s, [, v]) => s + (Number(v) || 0), 0);
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysLeft = last - now.getDate() + 1;
  const value = Math.min(xp, MONTHLY_XP);
  return (
    <motion.div variants={item(SPRING.settle, 12)}>
      <Card>
        <SectionTitle aside={`Faltam ${daysLeft} ${daysLeft === 1 ? "dia" : "dias"}`}>Missão mensal</SectionTitle>
        <div className="flex items-center gap-4">
          <Medal unitId={unit.id} size={64} />
          <div className="min-w-0 flex-1">
            <div className="mb-2 text-body font-bold text-ink">{MESES[now.getMonth()]}: ganhe {MONTHLY_XP} XP</div>
            <ProgressBar variant="labelled" value={value} max={MONTHLY_XP} label={`${value}/${MONTHLY_XP}`} done={xp >= MONTHLY_XP} delay={0.3} />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

// ---------- Ofensiva ----------
function StreakCard({ streak, onCalendar }) {
  const lit = streak > 0;
  const glow = lit && state.lastStudy === today();
  return (
    <motion.div variants={item(SPRING.settle, 12)}>
      <Card>
        <SectionTitle>Ofensiva</SectionTitle>
        <div className="flex items-center gap-3">
          <Flame size={48} lit={lit} glow={glow} />
          <span className={`text-display-lg tabular-nums ${lit ? "text-orange-text" : "text-disabled"}`}>{streak} {streak === 1 ? "dia" : "dias"}</span>
        </div>
        <StreakWeek days={state.days || {}} className="mt-4" />
        <button type="button" onClick={() => { sfx("tap"); onCalendar(); }}
          className="mt-4 text-caption uppercase tracking-[.8px] text-blue-text">Ver calendário</button>
      </Card>
    </motion.div>
  );
}

// ---------- Versículo do dia ----------
function VerseCard() {
  const [open, setOpen] = useState(false);
  const v = useMemo(() => verseOfDay(), []);
  return (
    <motion.div variants={item(SPRING.settle, 12)}>
      <Card variant="parchment">
        <div className="mb-2 flex items-center justify-between gap-3">
          <h3 className="text-heading text-parchment-text">Versículo do dia</h3>
          <motion.button type="button" onClick={() => speak(v.text)} aria-label="Ouvir em inglês"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-accent text-accent-text"
            style={{ boxShadow: "0 4px 0 var(--color-accent-shadow)" }} whileTap={{ y: 4, boxShadow: "0 0 0 var(--color-accent-shadow)" }} transition={SPRING.snap}>
            <Icon name="speaker" size={24} tone="mono" />
          </motion.button>
        </div>
        <p className="text-body text-ink">“{v.text}”</p>
        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="text-caption uppercase tracking-[.8px] text-parchment-text">{v.ref}</span>
          <button type="button" aria-expanded={open} onClick={() => { sfx("tap"); setOpen((o) => !o); }}
            className="text-caption uppercase tracking-[.8px] text-blue-text">{open ? "Ocultar tradução" : "Ver tradução"}</button>
        </div>
        {open && (
          <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-2 overflow-hidden text-secondary text-ink-soft">“{v.pt}”</motion.p>
        )}
      </Card>
    </motion.div>
  );
}

export default function Quests() {
  const app = useAppState();
  ensureDaily();
  const unit = currentUnit();
  const [calendar, setCalendar] = useState(false);
  const started = Object.keys(app.completed || {}).length > 0 || (app.xp || 0) > 0;
  const begin = () => { const id = currentLessonId(); if (id) startLesson(id); };

  return (
    <motion.div className="mx-auto flex w-full max-w-[560px] flex-col gap-4 px-4 pb-6 pt-4" variants={list(0.08)} initial="hidden" animate="show">
      <Banner unit={unit} />
      <DailyCard />
      <MonthlyCard unit={unit} />
      {started ? (
        <StreakCard streak={app.streak || 0} onCalendar={() => setCalendar(true)} />
      ) : (
        <motion.div variants={item(SPRING.settle, 12)}>
          <Card padding="none">
            <EmptyState icon="flame-off" title="Sua ofensiva começa hoje" text="Faça sua primeira lição para acender a chama" action={{ label: "Começar", onClick: begin }} />
          </Card>
        </motion.div>
      )}
      <VerseCard />

      <Sheet open={calendar} onClose={() => setCalendar(false)} title="Calendário da ofensiva" closeButton
        footer={<Button3D variant="primary" block onClick={() => setCalendar(false)}>Fechar</Button3D>}>
        <StreakCalendar />
      </Sheet>
    </motion.div>
  );
}
