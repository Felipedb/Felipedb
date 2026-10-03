// StatCard e CountUp (VISUAL_SPEC 5.21).
// StatCard: 110x92 (3 em linha com gap 14 no Result) ou 171x84 (grid 2x2 no Perfil); raio 16; borda 2 px na cor do
//   cabeçalho; cabeçalho 24 px na cor com caption 13/800 (#131f24 sobre amarelo, branco sobre azul, verde e laranja);
//   corpo --color-page com ícone 20 + numeral 20/800 --color-ink via CountUp.
//   Props: label ("XP", "TEMPO", "PRECISÃO"), value (número), format (fn, ex.: (v) => `+${v}`), text (texto fixo no lugar do CountUp),
//          icon (nome), color "yellow" | "blue" | "green" | "orange", size "result" | "profile", delay, duration (s), className
// CountUp: conta de 0 ao valor em `duration` s com easeOut; em reduced motion pula ao final.
// Exemplo: <StatCard label="XP" value={15} format={(v) => `+${v}`} icon="bolt" color="yellow" delay={0.7} />
import { useEffect } from "react";
import { motion, useMotionValue, useTransform, animate, useReducedMotion } from "motion/react";
import Icon from "../Icon.jsx";

const COLORS = {
  yellow: { bg: "#ffc800", text: "#131f24" },
  blue: { bg: "#1cb0f6", text: "#ffffff" },
  green: { bg: "#58cc02", text: "#ffffff" },
  orange: { bg: "#ff9600", text: "#ffffff" },
  purple: { bg: "#ce82ff", text: "#ffffff" },
};

export function CountUp({ to = 0, duration = 0.8, delay = 0, format = (v) => v, className = "" }) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(reduce ? to : 0);
  const text = useTransform(mv, (v) => format(Math.round(v)));
  useEffect(() => {
    if (reduce) { mv.set(to); return; }
    const c = animate(mv, to, { duration, delay, ease: "easeOut" });
    return () => c.stop();
  }, [to]); // eslint-disable-line
  return <motion.span className={`tabular-nums ${className}`}>{text}</motion.span>;
}

export default function StatCard({ label, value = 0, format = (v) => v, text, icon, color = "yellow", size = "result", delay = 0, duration = 0.8, className = "", ...rest }) {
  const c = COLORS[color] || COLORS.yellow;
  const dims = size === "profile" ? "h-[84px] w-full" : "h-[92px] w-[110px]";
  return (
    <div className={`flex flex-col overflow-hidden rounded-lg border-2 bg-page ${dims} ${className}`} style={{ borderColor: c.bg }} {...rest}>
      <div className="flex h-6 shrink-0 items-center justify-center text-caption uppercase tracking-[.8px]" style={{ background: c.bg, color: c.text }}>{label}</div>
      <div className="flex flex-1 items-center justify-center gap-1.5 text-numeral text-ink">
        {icon && <Icon name={icon} size={20} />}
        {text != null ? <span className="tabular-nums">{text}</span> : <CountUp to={value} format={format} delay={delay} duration={duration} />}
      </div>
    </div>
  );
}
