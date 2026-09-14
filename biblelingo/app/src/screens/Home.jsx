// Trilha que sobe: capítulos de baixo para cima (Capítulo 1 no pé, atual centralizado), CTA fixo de continuar
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
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

// Caminho tracejado ligando os nós (porta de drawTrailPath do app clássico)
function TrailNodes({ color, children }) {
  const ref = useRef(null);
  const [d, setD] = useState("");
  const [size, setSize] = useState([0, 0]);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const draw = () => {
      const nodes = [...el.querySelectorAll("[data-node] button")];
      const box = el.getBoundingClientRect();
      if (nodes.length < 2 || !box.height) return;
      const cs = nodes.map((n) => {
        const r = n.getBoundingClientRect();
        return { x: r.left - box.left + r.width / 2, y: r.top - box.top + r.height / 2 };
      });
      let path = `M ${cs[0].x} ${cs[0].y}`;
      for (let i = 1; i < cs.length; i++) {
        const a = cs[i - 1], b = cs[i];
        const my = (a.y + b.y) / 2;
        path += ` C ${a.x} ${my}, ${b.x} ${my}, ${b.x} ${b.y}`;
      }
      setD(path);
      setSize([box.width, box.height]);
    };
    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={ref} className="relative mx-auto flex max-w-sm flex-col items-center gap-4">
      {d && (
        <svg className="pointer-events-none absolute inset-0" viewBox={`0 0 ${size[0]} ${size[1]}`} preserveAspectRatio="none" aria-hidden="true">
          <path d={d} fill="none" stroke={color} strokeOpacity="0.25" strokeWidth="12" strokeLinecap="round" strokeDasharray="0.1 22" />
        </svg>
      )}
      {children}
    </div>
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

// Um capítulo desenhado de baixo para cima: coroa no cume, lições invertidas, banner na base
function UnitBlock({ u, ui, currentId, orderOf }) {
  const steps = unitSteps(u);
  const done = unitDone(u);
  const doneCount = steps.filter((s) => state.completed[s.id]).length;
  const starsGot = steps.reduce((s, l) => s + (state.stars[l.id] || 0), 0);

  // índice verdadeiro preservado; renderiza a última etapa em cima e a primeira embaixo
  const rows = steps.map((step, i) => ({ step, i })).reverse();

  return (
    <section className="mb-8">
      {/* Cume do capítulo: recompensa ao concluir */}
      {done && (
        <div className="mb-2 flex justify-center">
          <button onClick={() => startLevelUp(u)} className="btn-3d bg-gold px-5 py-2.5 text-gold-fg" style={{ "--btn-shadow": "#c79104" }}>
            👑 {unitCrowns(u.id) >= MAX_CROWN ? "Lendária" : `Subir de nível (${unitCrowns(u.id)}/${MAX_CROWN})`}
          </button>
        </div>
      )}

      <TrailNodes color={u.color}>
        {rows.map(({ step, i }) => {
          const prevId = i === 0 ? (ui === 0 ? null : unitSteps(COURSE[ui - 1]).slice(-1)[0].id) : steps[i - 1].id;
          const unlocked = !prevId || !!state.completed[prevId];
          const doneStep = !!state.completed[step.id];
          const isCurrent = step.id === currentId;
          const x = Math.round(Math.sin(i * 1.15) * 64);
          return (
            <motion.div key={step.id} className="relative z-[1]" style={{ x }} data-node={step.id} data-order={orderOf[step.id]} data-current={isCurrent || undefined}
              initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }}
              transition={{ type: "spring", stiffness: 220, damping: 24 }}>
              {isCurrent && (
                <span className="absolute -top-9 left-1/2 -translate-x-1/2 animate-bounce whitespace-nowrap rounded-xl border-2 border-line bg-card px-3 py-1 text-xs font-extrabold uppercase text-brand shadow-sm">
                  {resumable() && resumable().lesson && resumable().lesson.id === step.id ? "Retomar" : "Começar"}
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
            </motion.div>
          );
        })}
      </TrailNodes>

      {/* Banner na base: porta de entrada do capítulo, já que se sobe */}
      <div className="mt-4 rounded-2xl p-4 text-white shadow-md" style={{ background: u.color }}>
        <div className="text-xs font-bold uppercase tracking-wide opacity-90">
          Capítulo {ui + 1} · {doneCount}/{steps.length} etapas{done ? " · concluído" : ""}
        </div>
        <h2 className="font-display text-xl font-extrabold">{u.icon} {u.title}</h2>
        <div className="text-sm opacity-90">{u.subtitle} · ⭐ {starsGot}/{steps.length * 3}</div>
      </div>
    </section>
  );
}

export default function Home() {
  const app = useAppState();
  const currentId = currentLessonId();
  const r = resumable();
  const vd = useMemo(() => verseOfDay(), []);
  const doneUnits = COURSE.filter(unitDone).length;
  const ctaLesson = r ? r.lesson : flatLessons().find((l) => l.id === currentId);
  const colRef = useRef(null);
  // Índice verdadeiro (ordem do curso) de cada etapa, para navegação/testes independente da direção visual
  const orderOf = useMemo(() => {
    const m = {}; let n = 0;
    COURSE.forEach((u) => unitSteps(u).forEach((s) => { m[s.id] = n++; }));
    return m;
  }, []);

  // Abre no ponto em que você parou, como o Duolingo
  useEffect(() => {
    const el = colRef.current && colRef.current.querySelector("[data-current]");
    if (el) requestAnimationFrame(() => el.scrollIntoView({ block: "center" }));
  }, [currentId]);

  // Capítulos de cima para baixo na tela = do mais avançado ao Capítulo 1 (a trilha sobe)
  const unitsRev = COURSE.map((u, ui) => ({ u, ui })).reverse();

  return (
    <div className="lg:flex lg:gap-6">
      <div ref={colRef} className="min-w-0 flex-1 px-4 pt-2 lg:px-0">
        {/* HUD */}
        <header className="sticky top-0 z-30 -mx-4 mb-3 flex items-center justify-between gap-3 border-b-2 border-line bg-page/95 px-4 py-2 backdrop-blur lg:mx-0 lg:rounded-2xl lg:border-2">
          <span className="font-display text-lg font-extrabold text-brand lg:hidden">BíbliaLearn</span>
          <div className="flex items-center gap-3 font-display font-bold">
            <span title="Ofensiva">🔥 {app.streak}</span>
            <span className="text-gold-fg" title="XP">⚡ {app.xp}</span>
            <span className="text-danger" title="Corações">❤️ {app.hearts}</span>
          </div>
        </header>

        {/* Topo da trilha: o que ainda vem pela frente */}
        <div className="mb-6 rounded-2xl border-2 border-dashed border-line py-5 text-center">
          <div className="text-2xl">🏁</div>
          <div className="font-display font-extrabold">Continua em breve</div>
          <div className="text-sm text-ink-soft">Novos capítulos a caminho</div>
        </div>

        {unitsRev.map(({ u, ui }, k) => {
          const next = unitsRev[k + 1];
          const t = testamentOf(u, ui);
          const showSep = !next || testamentOf(next.u, next.ui) !== t;
          return (
            <div key={u.id}>
              <UnitBlock u={u} ui={ui} currentId={currentId} orderOf={orderOf} />
              {showSep && (
                <div className="my-6 flex items-center gap-3 text-ink-soft">
                  <span className="h-0.5 flex-1 bg-line" />
                  <span className="font-display text-sm font-extrabold uppercase tracking-wide">{t}</span>
                  <span className="h-0.5 flex-1 bg-line" />
                </div>
              )}
            </div>
          );
        })}

        {/* Pé da trilha: onde a jornada começa */}
        <div className="mb-2 flex flex-col items-center gap-1 pb-24 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-b-4 border-brand-shadow bg-brand-bright text-3xl shadow-md">🚩</div>
          <div className="font-display font-extrabold">Comece aqui e suba</div>
        </div>
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
