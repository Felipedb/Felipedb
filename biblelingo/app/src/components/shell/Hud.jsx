// Hud (VISUAL_SPEC 5.7): barra de 56 px + safe area, fundo --color-page, borda inferior 2 px --color-line, sticky top 0, z 30.
// Quatro itens de 44 px (curso, ofensiva, XP, corações), cada um com ícone SVG 32 + número 17/800 (tabular, contando ao mudar)
// e aria-label completo; tocar um item abre o HudPopover correspondente. Sem wordmark no mobile.
// Props: inline (linha do rail desktop: sem sticky nem borda), className
import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform, animate, useReducedMotion } from "motion/react";
import { useAppState } from "../../core/useStore.js";
import { state } from "../../core/store.js";
import { COURSE, flatLessons, currentLessonId, unitSteps } from "../../core/content.js";
import { ensureDaily, startLesson, startQuickPractice } from "../../core/session.js";
import { today, MAX_HEARTS } from "../../core/util.js";
import { sfx } from "../../core/sfx.js";
import { haptic } from "../../core/haptics.js";
import Icon from "../Icon.jsx";
import { Button3D, ProgressBar, StreakWeek } from "../ui/index.js";
import HudPopover from "./HudPopover.jsx";

// Número do HUD: conta do valor anterior ao novo em 400 ms quando muda (nunca de zero ao montar)
function HudNumber({ value, className = "" }) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(value);
  const text = useTransform(mv, (v) => String(Math.round(v)));
  useEffect(() => {
    if (reduce) { mv.set(value); return undefined; }
    const c = animate(mv, value, { duration: 0.4, ease: "easeOut" });
    return () => c.stop();
  }, [value]); // eslint-disable-line
  return <motion.span className={`text-[17px] font-extrabold leading-6 tabular-nums ${className}`} aria-hidden="true">{text}</motion.span>;
}

// Tempo até a meia-noite (os corações renovam na virada do dia, store.js ensureDay)
function untilMidnight() {
  const now = new Date();
  const mid = new Date(now);
  mid.setHours(24, 0, 0, 0);
  const min = Math.max(0, Math.round((mid - now) / 60000));
  return `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
}

function CoursePopover() {
  const all = flatLessons();
  const doneN = all.filter((l) => state.completed[l.id]).length;
  const cur = currentLessonId();
  let chapter = COURSE.length;
  COURSE.forEach((u, i) => { if (unitSteps(u).some((s) => s.id === cur)) chapter = i + 1; });
  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-[52px] items-center justify-center rounded-md bg-green"><Icon name="brand-mark" size={30} tone="mono" className="text-white" /></span>
        <div className="min-w-0">
          <div className="text-heading text-ink">Inglês com a Bíblia</div>
          <div className="text-secondary text-ink-soft">Capítulo {chapter} de {COURSE.length} · {doneN} de {all.length} etapas</div>
        </div>
      </div>
      <ProgressBar variant="story" value={doneN} max={all.length} className="mt-3" ariaLabel="Progresso do curso" />
    </div>
  );
}

function StreakPopover({ lit, streak }) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <Icon name={lit ? "flame" : "flame-off"} size={32} />
        <div>
          <div className="text-heading text-ink">{streak} {streak === 1 ? "dia" : "dias"} de ofensiva</div>
          <div className="text-secondary text-ink-soft">{lit ? "Ofensiva garantida por hoje. Volte amanhã!" : "Pratique hoje para manter a ofensiva"}</div>
        </div>
      </div>
      <StreakWeek days={state.days || {}} />
    </div>
  );
}

function XpPopover({ xp }) {
  const d = ensureDaily();
  const goal = state.dailyGoal || 20;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-heading text-ink">Hoje: {Math.min(d.xp, goal)} de {goal} XP</span>
        <Icon name="bolt" size={28} />
      </div>
      <ProgressBar variant="labelled" value={Math.min(d.xp, goal)} max={goal} label={`${Math.min(d.xp, goal)}/${goal}`} done={d.xp >= goal} />
      <div className="mt-3 text-secondary text-ink-soft">Total <b className="font-extrabold text-yellow-text tabular-nums">{xp} XP</b></div>
    </div>
  );
}

function HeartsPopover({ hearts, onClose }) {
  const [left, setLeft] = useState(untilMidnight);
  useEffect(() => { const id = setInterval(() => setLeft(untilMidnight()), 30000); return () => clearInterval(id); }, []);
  const practice = () => {
    onClose && onClose();
    const doneIds = flatLessons().filter((l) => state.completed[l.id]).map((l) => l.id);
    if (doneIds.length) startLesson(doneIds[doneIds.length - 1]); else startQuickPractice("review");
  };
  const full = hearts >= MAX_HEARTS;
  return (
    <div>
      <div className="flex justify-center gap-2" role="img" aria-label={`${hearts} de ${MAX_HEARTS} corações`}>
        {Array.from({ length: MAX_HEARTS }, (_, i) => <Icon key={i} name={i < hearts ? "heart" : "heart-empty"} size={28} />)}
      </div>
      <div className="mt-3 text-center text-secondary text-ink-soft">
        {full ? "Corações cheios. Cada erro na lição custa um." : <>Próximo coração em <span className="font-extrabold tabular-nums text-ink">{left}</span></>}
      </div>
      {!full && <Button3D variant="neutral" block className="mt-4" onClick={practice}>Praticar para recuperar</Button3D>}
    </div>
  );
}

export default function Hud({ inline = false, className = "" }) {
  const app = useAppState();
  const [open, setOpen] = useState(null);
  const [arrowX, setArrowX] = useState(0);
  const wrap = useRef(null);
  const refs = useRef({});
  const lit = ((app.days || {})[today()] || 0) > 0;
  const hearts = Math.max(0, app.hearts);
  const prevHearts = useRef(hearts);
  const [heartBump, setHeartBump] = useState(0);
  useEffect(() => {
    if (hearts < prevHearts.current) setHeartBump((b) => b + 1);
    prevHearts.current = hearts;
  }, [hearts]);

  const toggle = (id) => {
    sfx("tap");
    haptic("tap");
    if (open === id) { setOpen(null); return; }
    const el = refs.current[id], box = wrap.current;
    if (el && box) {
      const pw = Math.min(358, box.clientWidth, window.innerWidth - 32);
      const left = (box.clientWidth - pw) / 2;
      setArrowX(Math.max(16, Math.min(pw - 16, el.offsetLeft + el.offsetWidth / 2 - left)));
    }
    setOpen(id);
  };
  const close = () => setOpen(null);

  const items = [
    { id: "course", label: `Curso Inglês com a Bíblia`, title: "Curso",
      icon: <span className="flex h-[27px] w-9 items-center justify-center rounded-[6px] bg-green"><Icon name="brand-mark" size={22} tone="mono" className="text-white" /></span> },
    { id: "streak", label: `${app.streak} ${app.streak === 1 ? "dia" : "dias"} de ofensiva${lit ? "" : ", ainda não estudou hoje"}`, title: "Ofensiva",
      icon: <Icon name={lit ? "flame" : "flame-off"} size={32} />, value: app.streak, color: lit ? "text-orange-text" : "text-disabled" },
    { id: "xp", label: `${app.xp} XP`, title: "XP", icon: <Icon name="bolt" size={32} />, value: app.xp, color: "text-yellow-text" },
    { id: "hearts", label: `${hearts} ${hearts === 1 ? "coração" : "corações"}`, title: "Corações",
      icon: (
        <motion.span key={heartBump} className="inline-flex" initial={false}
          animate={heartBump ? { scale: [1, 1.35, 1], x: [0, -4, 4, -2, 0] } : { scale: 1, x: 0 }} transition={{ duration: 0.35 }}>
          <Icon name={hearts > 0 ? "heart" : "heart-empty"} size={32} />
        </motion.span>
      ), value: hearts, color: "text-red-text" },
  ];

  return (
    <header className={`${inline ? "relative" : "sticky top-0 z-30 border-b-2 border-line bg-page pt-[env(safe-area-inset-top)]"} ${className}`}>
      <div ref={wrap} className={`relative mx-auto flex h-14 w-full max-w-[600px] items-center justify-between ${inline ? "px-2" : "px-4 lg:px-0"}`}>
        {items.map((it) => (
          <button key={it.id} type="button" data-hud-item ref={(el) => { refs.current[it.id] = el; }}
            aria-label={it.label} aria-expanded={open === it.id} aria-haspopup="dialog" title={it.title}
            onClick={() => toggle(it.id)}
            className="flex h-11 min-w-11 items-center gap-1.5 rounded-md px-1.5 hover:bg-raised">
            {it.icon}
            {it.value != null && <HudNumber value={it.value} className={it.color} />}
          </button>
        ))}
        <HudPopover open={!!open} arrowX={arrowX} onClose={close} label={open === "course" ? "Curso" : open === "streak" ? "Ofensiva" : open === "xp" ? "XP" : "Corações"}>
          {open === "course" && <CoursePopover />}
          {open === "streak" && <StreakPopover lit={lit} streak={app.streak} />}
          {open === "xp" && <XpPopover xp={app.xp} />}
          {open === "hearts" && <HeartsPopover hearts={hearts} onClose={close} />}
        </HudPopover>
      </div>
    </header>
  );
}
