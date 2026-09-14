// Missões: meta diária (anel), missões do dia, semana de fidelidade e versículo bilíngue
// Porta de renderQuests/renderWeek (screens.js/app.js) + renderDailyCard (features.js).
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { useAppState } from "../core/useStore.js";
import { state, save } from "../core/store.js";
import { ensureDaily, QUESTS, DAILY_GOALS, startErrorPractice } from "../core/session.js";
import { verseOfDay, allVocab } from "../core/content.js";
import { speak } from "../core/audio.js";
import { today, dateKey, normalize } from "../core/util.js";
import { toast, sfx } from "../core/events.js";
import Icon from "../components/Icon.jsx";

const cardIn = (i) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, delay: i * 0.06, ease: "easeOut" },
});

// ---------- Meta diária + missões (renderDailyCard) ----------
function DailyCard() {
  const d = ensureDaily();
  const goal = state.dailyGoal;
  const pct = Math.min(100, Math.round((d.xp / goal) * 100));
  const done = d.xp >= goal;

  const cycleGoal = () => {
    const i = DAILY_GOALS.indexOf(state.dailyGoal);
    state.dailyGoal = DAILY_GOALS[(i + 1) % DAILY_GOALS.length];
    save();
    toast(`🎯 Meta diária: ${state.dailyGoal} XP`);
  };

  return (
    <motion.div className="card p-4" {...cardIn(0)}>
      <h3 className="flex items-center justify-between font-display text-lg font-extrabold">
        <span>🎯 Meta diária</span>
        <button onClick={cycleGoal} title="Alterar meta" aria-label="Alterar meta diária"
          className="rounded-lg px-1.5 py-0.5 text-base transition-transform hover:rotate-45">⚙️</button>
      </h3>
      <div className="mt-2 flex items-center gap-3.5">
        <div className="flex h-[58px] w-[58px] flex-none items-center justify-center rounded-full"
          style={{ background: `conic-gradient(var(--color-brand-bright) ${pct}%, var(--color-track) 0)` }}
          role="img" aria-label={`Progresso da meta: ${pct}%`}>
          <span className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-card text-[13px] font-black text-brand">
            {done ? "✓" : `${pct}%`}
          </span>
        </div>
        <div>
          <p className="font-bold"><b className="font-black">{d.xp}</b> / {goal} XP hoje</p>
          <p className="text-sm font-bold text-ink-soft">{done ? "Meta batida! Continue firme." : `Faltam ${goal - d.xp} XP`}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-2">
        {QUESTS.map((q) => {
          const target = q.target(goal);
          const val = Math.min(d[q.key] || 0, target);
          const ok = d.claimed.includes(q.id);
          return (
            <div key={q.id} className="flex items-center gap-2.5">
              <span className="w-[26px] flex-none text-center text-xl">{q.icon}</span>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-extrabold">{q.label === "Ganhe XP" ? `Ganhe ${goal} XP` : q.label}</div>
                <div className="mt-0.5 h-2 overflow-hidden rounded-md bg-track">
                  <div className={`h-full rounded-md transition-[width] duration-500 ${ok ? "bg-brand-bright" : "bg-gradient-to-b from-[#ffd166] to-gold"}`}
                    style={{ width: `${Math.round((val / target) * 100)}%` }} />
                </div>
              </div>
              <span className={`min-w-[26px] text-right text-xs font-black ${ok ? "text-brand" : "text-gold-fg"}`}>
                {ok ? "✓" : `+${q.reward}`}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ---------- Semana de fidelidade (renderWeek) ----------
function WeekCard({ streak }) {
  const labels = ["S", "T", "Q", "Q", "S", "S", "D"];
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  const hoje = today();
  let feitos = 0;
  const days = labels.map((lb, i) => {
    const dt = new Date(monday);
    dt.setDate(monday.getDate() + i);
    const iso = dateKey(dt);
    const studied = (state.days || {})[iso] > 0;
    if (studied) feitos++;
    const isToday = iso === hoje;
    const future = iso > hoje;
    return { lb, iso, studied, isToday, future, mark: studied ? "✓" : isToday ? "★" : future ? "🔒" : "·" };
  });

  return (
    <motion.div className="card p-4" {...cardIn(1)}>
      <h3 className="flex items-center justify-between font-display text-lg font-extrabold">
        <span>🔥 Meta semanal de fidelidade</span>
        <b className="text-sm text-ink-soft">{feitos} de 7</b>
      </h3>
      <div className="mt-3 flex justify-between">
        {days.map((d, i) => (
          <span key={i} className="flex flex-col items-center gap-1">
            <i className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-black not-italic ${
              d.studied ? "bg-brand-bright text-white shadow-[0_2px_0_var(--color-brand-shadow)]"
              : d.isToday ? "animate-pulse bg-gold text-white shadow-[0_2px_0_#c9920c]"
              : `bg-track text-ink-soft ${d.future ? "opacity-55" : ""}`}`}>
              {d.mark}
            </i>
            <span className={`text-[11px] font-black ${d.isToday ? "text-gold-fg" : "text-ink-soft"}`}>{d.lb}</span>
          </span>
        ))}
      </div>
      <p className="mt-2.5 text-sm font-bold text-ink-soft">{streak} dias de sequência. Continue firme!</p>
    </motion.div>
  );
}

// ---------- Versículo bilíngue do dia ----------
function VerseCard() {
  const [open, setOpen] = useState(false);
  const v = useMemo(() => verseOfDay(), []);
  const hints = useMemo(() => {
    const pool = allVocab();
    return v.text.replace(/[.,;:!?"']/g, "").split(" ")
      .map((w) => pool.find((p) => normalize(p.en.replace(/^to /, "")) === normalize(w)))
      .filter((p, i, arr) => p && arr.indexOf(p) === i).slice(0, 3);
  }, [v]);

  return (
    <motion.div className="card border-[#f3dc9a] bg-gold-soft p-4 shadow-[0_3px_0_#f3dc9a] dark:border-[#4a3c14] dark:shadow-[0_3px_0_#4a3c14]" {...cardIn(2)}>
      <h3 className="flex items-center justify-between gap-2 font-display text-lg font-extrabold text-gold-fg">
        <span>📖 Versículo bilíngue do dia</span>
        <button onClick={() => speak(v.text)} aria-label="Ouvir em inglês"
          className="flex h-9 w-9 flex-none items-center justify-center rounded-full border-2 border-[#f3dc9a] bg-card text-gold-fg dark:border-[#4a3c14]">
          <Icon name="speaker" />
        </button>
      </h3>
      <p className="mt-2 italic leading-relaxed">“{v.text}”</p>
      <div className="mt-1 flex items-center justify-between gap-2">
        <span className="text-[12.5px] font-extrabold text-gold-fg">{v.ref} (KJV)</span>
        <button className="text-[12.5px] font-black text-gold-fg" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          {open ? "Ocultar tradução ▴" : "Ver tradução ▾"}
        </button>
      </div>
      {open && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="overflow-hidden">
          <p className="mt-2 text-sm italic text-ink-soft">“{v.pt}”</p>
          {hints.length > 0 && (
            <p className="mt-1 text-[12.5px] font-bold text-ink-soft">
              Dica: {hints.map((p, i) => (
                <span key={p.en}>{i > 0 && " · "}<b>{p.en}</b> = {p.pt}</span>
              ))}
            </p>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

export default function Quests() {
  const app = useAppState();
  const d = ensureDaily();
  const nErr = Object.keys(app.errors || {}).length;

  return (
    <div className="mx-auto flex w-full max-w-[560px] flex-col gap-3 px-4 pb-6 pt-4">
      <h2 className="mt-1.5 font-display text-[26px] font-extrabold">Missões</h2>
      <p className="-mt-2.5 text-sm font-bold text-ink-soft">
        {d.xp >= app.dailyGoal ? "Meta de hoje batida. Que tal mais uma etapa?" : `${d.xp} de ${app.dailyGoal} XP hoje`}
      </p>
      <DailyCard />
      <WeekCard streak={app.streak} />
      <VerseCard />
      {nErr > 0 && (
        <motion.button {...cardIn(3)} onClick={() => { sfx("tap"); startErrorPractice(); }}
          className="card flex items-center gap-3 p-4 text-left transition-colors hover:bg-hover">
          <span className="text-3xl">🩹</span>
          <span><b className="block font-display font-extrabold">Praticar erros</b>
          <small className="text-sm font-bold text-ink-soft">{nErr} palavra(s) para acertar</small></span>
        </motion.button>
      )}
    </div>
  );
}
