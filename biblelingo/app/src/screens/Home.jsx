// Trilha: capítulos com nós (lições, cenas, revisão) e CTA fixo de continuar
import { useMemo } from "react";
import { useAppState } from "../core/useStore.js";
import { COURSE, unitSteps, unitDone, currentLessonId, CHARACTERS, castChar, testamentOf, verseOfDay, SCENE_BY_ID, flatLessons } from "../core/content.js";
import { startLesson, startLevelUp, resumable, unitCrowns, MAX_CROWN } from "../core/session.js";
import { state } from "../core/store.js";
import { speak } from "../core/audio.js";
import CharFace from "../components/CharFace.jsx";
import Icon from "../components/Icon.jsx";

function StarRow({ n }) {
  return (
    <span className="rounded-full border border-line bg-card px-1 text-sm leading-none shadow-sm">
      {[1, 2, 3].map((i) => (
        <span key={i} className={i <= n ? "text-gold" : "text-locked"}>★</span>
      ))}
    </span>
  );
}

function nodeFace(step, { doneStep, unlocked, isCurrent }) {
  if (step.scene) {
    const sc = SCENE_BY_ID[step.sceneId || step.id];
    const ch = sc ? castChar(sc.char) : null;
    return <CharFace ch={ch} className={`h-full w-full text-3xl ${!unlocked && !doneStep ? "opacity-40 grayscale" : ""}`} />;
  }
  if (step.review) return "🏆";
  if (doneStep) return "⭐";
  if (unlocked || isCurrent) return "📖";
  return "🔒";
}

export default function Home() {
  const app = useAppState();
  const currentId = currentLessonId();
  const r = resumable();
  const vd = useMemo(() => verseOfDay(), []);
  const doneUnits = COURSE.filter(unitDone).length;
  const ctaLesson = r ? r.lesson : flatLessons().find((l) => l.id === currentId);

  return (
    <div className="lg:flex lg:gap-6">
      <div className="min-w-0 flex-1 px-4 pt-2 lg:px-0">
        {/* HUD */}
        <header className="sticky top-0 z-30 -mx-4 mb-3 flex items-center justify-between gap-3 border-b-2 border-line bg-page/95 px-4 py-2 backdrop-blur lg:mx-0 lg:rounded-2xl lg:border-2">
          <span className="font-display text-lg font-extrabold text-brand lg:hidden">BíbliaLearn</span>
          <div className="flex items-center gap-3 font-display font-bold">
            <span title="Ofensiva">🔥 {app.streak}</span>
            <span className="text-gold-fg" title="XP">⚡ {app.xp}</span>
            <span className="text-danger" title="Corações">❤️ {app.hearts}</span>
          </div>
        </header>

        {COURSE.map((u, ui) => {
          const steps = unitSteps(u);
          const done = unitDone(u);
          return (
            <section key={u.id} className="mb-10">
              <div className="rounded-2xl p-4 text-white shadow-md" style={{ background: u.color }}>
                <div className="text-xs font-bold uppercase tracking-wide opacity-90">{testamentOf(u, ui)} · Capítulo {ui + 1}</div>
                <h2 className="font-display text-xl font-extrabold">{u.icon} {u.title}</h2>
                <div className="text-sm opacity-90">{u.subtitle}</div>
              </div>

              <div className="mx-auto mt-5 flex max-w-sm flex-col items-center gap-4">
                {steps.map((step, i) => {
                  const prevId = i === 0 ? (ui === 0 ? null : unitSteps(COURSE[ui - 1]).slice(-1)[0].id) : steps[i - 1].id;
                  const unlocked = !prevId || !!state.completed[prevId];
                  const doneStep = !!state.completed[step.id];
                  const isCurrent = step.id === currentId;
                  const x = Math.round(Math.sin(i * 1.15) * 64);
                  return (
                    <div key={step.id} className="relative" style={{ transform: `translateX(${x}px)` }} data-node={step.id} data-current={isCurrent || undefined}>
                      {isCurrent && (
                        <span className="absolute -top-9 left-1/2 -translate-x-1/2 animate-bounce whitespace-nowrap rounded-xl border-2 border-line bg-card px-3 py-1 text-xs font-extrabold uppercase text-brand shadow-sm">
                          Começar
                        </span>
                      )}
                      <button onClick={() => startLesson(step.id)} disabled={!unlocked && !doneStep} aria-label={step.title} title={step.title}
                        className={`flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-full border-b-4 text-3xl transition-transform active:translate-y-0.5 active:scale-95 ${
                          doneStep ? "border-gold-fg/40 bg-gold" : isCurrent ? "border-brand-shadow bg-brand-bright ring-4 ring-brand-soft" : unlocked ? "border-line bg-card" : "border-line bg-track text-locked"
                        }`}>
                        {nodeFace(step, { doneStep, unlocked, isCurrent })}
                      </button>
                      {step.scene && <span className="absolute -right-1 -top-1 rounded-full bg-sky px-1.5 text-xs text-white shadow">💬</span>}
                      {doneStep && !step.scene && !step.review && (
                        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2"><StarRow n={state.stars[step.id] || 0} /></span>
                      )}
                    </div>
                  );
                })}
                {done && (
                  <button onClick={() => startLevelUp(u)} className="btn-3d mt-1 bg-gold px-5 py-2.5 text-gold-fg" style={{ "--btn-shadow": "#c79104" }}>
                    👑 {unitCrowns(u.id) >= MAX_CROWN ? "Lendária" : `Subir de nível (${unitCrowns(u.id)}/${MAX_CROWN})`}
                  </button>
                )}
              </div>
            </section>
          );
        })}
        <div className="h-24" />
      </div>

      {/* Rail direito (desktop) */}
      <aside className="hidden w-72 shrink-0 pt-2 lg:block">
        <div className="card p-4">
          <h3 className="font-display font-extrabold">📈 Progresso</h3>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-track">
            <div className="h-full rounded-full bg-brand-bright transition-all" style={{ width: `${(doneUnits / COURSE.length) * 100}%` }} />
          </div>
          <p className="mt-1 text-sm text-ink-soft">{doneUnits} de {COURSE.length} capítulos concluídos</p>
        </div>
        <div className="card mt-4 p-4">
          <h3 className="font-display font-extrabold">📖 Versículo do dia</h3>
          <button className="mt-2 text-left text-sm italic text-ink-soft transition-colors hover:text-ink" onClick={() => speak(vd.text, { char: CHARACTERS.jesus })}>
            “{vd.text}” <b className="not-italic">— {vd.ref}</b> <Icon name="speaker" />
          </button>
        </div>
      </aside>

      {ctaLesson && (
        <button onClick={() => startLesson(ctaLesson.id)}
          className="btn-3d fixed inset-x-4 bottom-[calc(76px+env(safe-area-inset-bottom))] z-40 mx-auto max-w-md bg-brand-bright px-5 py-3.5 text-white lg:bottom-5">
          {r
            ? `▶ Retomar: ${ctaLesson.title} (${Math.min(r.index + 1, r.exercises.length)}/${r.exercises.length})`
            : `▶ ${ctaLesson.scene ? "Cena" : "Continuar"}: ${ctaLesson.title} (+10 XP)`}
        </button>
      )}
    </div>
  );
}
