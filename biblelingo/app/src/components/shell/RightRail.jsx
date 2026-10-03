// RightRail (VISUAL_SPEC 6.1 e 6.12, lg): coluna de 368 px, sticky top-6, com a linha do HUD (sem sticky próprio),
// card "Missões do dia" (3 QuestRow + VER TODAS), card Pergaminho "Versículo do dia" (único Pergaminho da tela) e card "Ofensiva".
// Props: onGo(id)
import { useMemo } from "react";
import { useAppState } from "../../core/useStore.js";
import { state } from "../../core/store.js";
import { ensureDaily, QUESTS } from "../../core/session.js";
import { verseOfDay, castChar } from "../../core/content.js";
import { today } from "../../core/util.js";
import Icon from "../Icon.jsx";
import { Card, QuestRow, Button3D, AudioButton, StreakWeek } from "../ui/index.js";
import Hud from "./Hud.jsx";

const QUEST_ICON = { xp: "bolt", lessons: "book", perfect: "star", combo: "flame" };

export default function RightRail({ onGo }) {
  const app = useAppState();
  const d = ensureDaily();
  const goal = state.dailyGoal || 20;
  const vd = useMemo(() => verseOfDay(), []);
  const jesus = useMemo(() => castChar("jesus"), []);
  const lit = ((app.days || {})[today()] || 0) > 0;

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-6 flex flex-col gap-4">
        <Card padding="none" className="px-2"><Hud inline /></Card>

        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-heading text-ink">Missões do dia</h3>
            <Button3D variant="ghost" tone="blue" size="sm" onClick={() => onGo && onGo("quests")}>Ver todas</Button3D>
          </div>
          <div className="flex flex-col gap-2">
            {QUESTS.slice(0, 3).map((q, i) => {
              const target = q.target(goal);
              const claimed = (d.claimed || []).includes(q.id);
              return (
                <QuestRow key={q.id} icon={QUEST_ICON[q.id] || "bolt"} title={q.label === "Ganhe XP" ? `Ganhe ${goal} XP` : q.label}
                  value={Math.min(d[q.key] || 0, target)} target={target} reward={q.reward} state={claimed ? "claimed" : "progress"} delay={i * 0.08} />
              );
            })}
          </div>
        </Card>

        <Card variant="parchment">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-caption uppercase tracking-[.8px]" style={{ color: "var(--color-parchment-text)" }}>Versículo do dia</h3>
            <AudioButton text={vd.text} char={jesus} />
          </div>
          <p className="text-body italic text-ink">“{vd.text}”</p>
          <p className="mt-2 text-secondary font-bold" style={{ color: "var(--color-parchment-text)" }}>{vd.ref}</p>
        </Card>

        <Card>
          <div className="mb-3 flex items-center gap-3">
            <Icon name={lit ? "flame" : "flame-off"} size={32} />
            <div>
              <h3 className="text-heading text-ink">Ofensiva</h3>
              <p className="text-secondary text-ink-soft">
                <b className={`font-extrabold tabular-nums ${lit ? "text-orange-text" : "text-disabled"}`}>{app.streak}</b> {app.streak === 1 ? "dia" : "dias"}{lit ? "" : " · pratique hoje para manter"}
              </p>
            </div>
          </div>
          <StreakWeek days={app.days || {}} animate={false} />
        </Card>
      </div>
    </aside>
  );
}
