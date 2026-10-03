// QuestRow e QuestBar (VISUAL_SPEC 5.28): linha de 64 px com ícone ilustrado 48 (bolt, book, star, flame), título
// text-body 17/700, ProgressBar labelled 16 px "7/10" e Chest 40 no fim (cinza fechado; concluída e não resgatada:
// dourado balançando; toque abre com confete e "+N XP"; resgatada: check-circle verde).
// Props: icon, title, value, target, reward (XP), state "progress" | "ready" | "claimed", onClaim(reward), delay (s, cascata das barras)
// Exemplo: <QuestRow icon="bolt" title="Ganhe 20 XP" value={d.xp} target={20} reward={5} state={...} onClaim={claim} delay={i * 0.08} />
import ProgressBar from "./ProgressBar.jsx";
import Chest from "./Chest.jsx";
import Icon from "../Icon.jsx";

export function QuestBar({ value = 0, target = 1, done = false, delay = 0, className = "" }) {
  const v = Math.min(value, target);
  return <ProgressBar variant="labelled" value={v} max={target} label={`${v}/${target}`} done={done} delay={delay} className={className} />;
}

export default function QuestRow({ icon = "bolt", title, value = 0, target = 1, reward = 5, state = "progress", onClaim, delay = 0, className = "", ...rest }) {
  const done = state !== "progress";
  return (
    <div className={`flex min-h-16 items-center gap-3 ${className}`} {...rest}>
      <Icon name={icon} size={48} />
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 truncate text-body font-bold text-ink">{title}</div>
        <QuestBar value={value} target={target} done={done} delay={delay} />
      </div>
      <div className="flex w-10 shrink-0 items-center justify-center">
        {state === "claimed" ? (
          <Icon name="check-circle" size={28} />
        ) : (
          <Chest size={40} state={state === "ready" ? "ready" : "locked"} reward={reward} onOpen={onClaim} />
        )}
      </div>
    </div>
  );
}
