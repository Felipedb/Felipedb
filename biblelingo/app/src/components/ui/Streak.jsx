// Flame e StreakWeek (VISUAL_SPEC 5.29).
// Flame: chama de 48 a 160 px; com glow pulsante (--glow-gold + box-shadow 0 0 32px 8px rgba(255,150,0,.35), 1,6 s) quando
//   a ofensiva aumentou hoje; `lit` false mostra a chama apagada (--color-streak-off); count opcional em display-lg.
//   Props: size, lit, glow, count, className
// StreakWeek: 7 colunas (S T Q Q S S D, segunda a domingo), rótulos caption 13/800; dia estudado = flame 20 em círculo 32
//   --color-orange-soft; hoje não estudado = anel pontilhado 2 px #ff9600; passado não estudado = círculo --color-line;
//   futuro = --color-line a 55%. Dias preenchem em cascata de 80 ms ao montar.
//   Props: days ({ "AAAA-MM-DD": xp }), today (chave do dia), animate, className
// Exemplo: <Flame size={160} glow count={state.streak} />   <StreakWeek days={state.days} />
import { motion, useReducedMotion } from "motion/react";
import { SPRING, STAGGER, list, item } from "../../core/motion.js";
import { dateKey, today as todayKey } from "../../core/util.js";
import Icon from "../Icon.jsx";

export function Flame({ size = 48, lit = true, glow = false, count, className = "" }) {
  const reduce = useReducedMotion();
  return (
    <span className={`relative inline-flex flex-col items-center ${className}`}>
      {glow && lit && !reduce && (
        <motion.span aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ width: size * 1.6, height: size * 1.6, background: "var(--glow-gold)", boxShadow: "0 0 32px 8px rgba(255,150,0,.35)" }}
          animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.08, 1] }} transition={{ duration: 1.6, repeat: Infinity }} />
      )}
      <motion.span className="relative" initial={glow && !reduce ? { scale: 0 } : false} animate={{ scale: 1 }} transition={SPRING.bounce}>
        <Icon name={lit ? "flame" : "flame-off"} size={size} />
      </motion.span>
      {count != null && <span className={`relative text-display-lg tabular-nums ${lit ? "text-orange-text" : "text-disabled"}`}>{count}</span>}
    </span>
  );
}

const LABELS = ["S", "T", "Q", "Q", "S", "S", "D"];

export function weekOf(todayStr) {
  const t = new Date(todayStr + "T12:00:00");
  const dow = (t.getDay() + 6) % 7; // segunda = 0
  return LABELS.map((label, i) => {
    const d = new Date(t);
    d.setDate(t.getDate() - dow + i);
    return { label, key: dateKey(d), offset: i - dow };
  });
}

export default function StreakWeek({ days = {}, today = todayKey(), animate = true, className = "" }) {
  const week = weekOf(today);
  return (
    <motion.div className={`grid grid-cols-7 gap-1 ${className}`} variants={list(STAGGER.week)} initial={animate ? "hidden" : false} animate="show" role="list" aria-label="Semana de estudo">
      {week.map((d) => {
        const studied = (days[d.key] || 0) > 0;
        const isToday = d.offset === 0;
        const future = d.offset > 0;
        const cls = studied ? "bg-orange-soft" : isToday ? "border-2 border-dotted border-orange" : `bg-line ${future ? "opacity-55" : ""}`;
        return (
          <motion.div key={d.key} variants={item(SPRING.pop, 6)} className="flex flex-col items-center gap-1.5" role="listitem"
            aria-label={`${d.label}${studied ? ": estudou" : isToday ? ": hoje" : future ? ": em breve" : ": sem estudo"}`}>
            <span className="text-caption text-ink-soft">{d.label}</span>
            <span className={`flex h-8 w-8 items-center justify-center rounded-full ${cls}`}>
              {studied && <Icon name="flame" size={20} />}
            </span>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
