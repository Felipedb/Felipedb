// Quadro da lição: progresso, corações, exercício atual e rodapé de feedback.
// Os componentes de exercício ficam em ../components/exercises (lições) e ../components/scenes (cenas).
import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useAppState } from "../core/useStore.js";
import { useSessionVersion } from "../core/useSession.js";
import { session, check, quitLesson, skipListening, unitCrowns } from "../core/session.js";
import { LISTEN_TYPES } from "../core/builder.js";
import { diffWords } from "../core/checker.js";
import { stopClip } from "../core/audio.js";
import Result from "./Result.jsx";
import ExerciseView from "../components/exercises/index.jsx";

export default function Lesson() {
  useSessionVersion();
  const app = useAppState();
  useEffect(() => () => stopClip(), []);

  // Em desenvolvimento, expõe a sessão para os testes de ponta a ponta
  if (import.meta.env.DEV && typeof window !== "undefined") window.__session = session;

  // Atalhos de teclado: Enter/espaço verifica ou continua; 1-9 escolhe a opção
  useEffect(() => {
    const onKey = (e) => {
      if (!session || session.phase === "result") return;
      const tag = e.target && e.target.tagName;
      const inInput = tag === "INPUT" || tag === "TEXTAREA";
      const cur = session.exercises[session.index];
      if (!cur) return;
      const has = cur.silent || (session.answer != null && String(session.answer) !== "");
      if ((e.key === "Enter" || (e.key === " " && session.checked)) && !inInput && (has || session.checked)) {
        e.preventDefault();
        check();
        return;
      }
      if (!inInput && !session.checked && /^[1-9]$/.test(e.key)) {
        const opts = document.querySelectorAll("[data-opt]");
        const o = opts[Number(e.key) - 1];
        if (o) o.click();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  if (!session) return null;
  if (session.phase === "result") return <Result />;

  const ex = session.exercises[session.index];
  const fb = session.feedback;
  const progress = (session.index / session.exercises.length) * 100;
  const canCheck = ex.silent || session.answer != null && String(session.answer) !== "";

  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col px-4">
      {/* Topo */}
      <header className="flex items-center gap-3 py-3">
        <button onClick={quitLesson} aria-label="Sair da etapa" className="text-2xl text-ink-soft transition-colors hover:text-ink">✕</button>
        <div className="h-4 flex-1 overflow-hidden rounded-full bg-track">
          <motion.div layout className={`h-full rounded-full ${session.combo >= 5 ? "bg-gold" : "bg-brand-bright"}`}
            animate={{ width: `${progress}%` }} transition={{ type: "spring", stiffness: 160, damping: 26 }} />
        </div>
        {session.levelUp && <span className="rounded-full bg-gold-soft px-2 py-0.5 text-xs font-extrabold text-gold-fg">👑 {session.legendary ? "Lendária" : `Nível ${unitCrowns(session.lesson.unit.id) + 1}`}</span>}
        <span className="font-display font-bold">{session.practice ? "💪 prática" : `❤️ ${app.hearts}`}</span>
      </header>

      {session.combo >= 2 && !fb && (
        <div className="mb-1 self-center rounded-full bg-gold-soft px-3 py-0.5 text-xs font-extrabold text-gold-fg">COMBO x{session.combo}</div>
      )}

      {/* Exercício */}
      <div className="flex-1 pb-40">
        <AnimatePresence mode="wait">
          <motion.div key={session.index + ":" + ex.type}
            initial={{ opacity: 0, x: 32 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.18, ease: "easeOut" }}>
            {ex.newWord && <div className="mb-2"><span className="rounded-full bg-sky-soft px-2.5 py-1 text-xs font-extrabold text-sky-fg ring-1 ring-sky-line">✦ Nova palavra</span></div>}
            {ex.isReview && <div className="mb-2"><span className="rounded-full bg-gold-soft px-2.5 py-1 text-xs font-extrabold text-gold-fg">Revisão</span></div>}
            <ExerciseView ex={ex} />
            {LISTEN_TYPES.includes(ex.type) && !session.checked && (
              <button onClick={skipListening} className="mt-4 text-sm font-bold text-ink-soft underline-offset-2 hover:underline">Não posso ouvir agora</button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Rodapé */}
      <footer className={`fixed inset-x-0 bottom-0 z-40 border-t-2 px-4 pb-[calc(16px+env(safe-area-inset-bottom))] pt-4 ${
        fb ? (fb.ok ? "border-ok-line bg-ok-soft" : "border-bad-line bg-bad-bg") : "border-line bg-card"}`}>
        <div className="mx-auto flex max-w-2xl items-center gap-4">
          {fb && (
            <div className="min-w-0 flex-1">
              {fb.ok ? (
                <>
                  <div className="font-display text-lg font-extrabold text-brand">{fb.praise}</div>
                  {fb.comboPill && <div className="mt-0.5 inline-block rounded-full bg-gold px-2 py-0.5 text-xs font-extrabold text-gold-fg">{fb.comboPill}</div>}
                  {fb.typo && <div className="text-sm text-ink-soft">Atenção à ortografia: <b>{ex.correctLabel || ex.correct}</b></div>}
                </>
              ) : (
                <>
                  <div className="font-display text-lg font-extrabold text-bad-fg">Incorreto</div>
                  {ex.correct !== "__matched__" && (
                    <div className="truncate text-sm text-ink">
                      {diffWords(String(ex.correctLabel || ex.correct), String(session.answer || "")).map((p, i) => (
                        <span key={i} className={p.miss ? "font-extrabold text-bad-fg" : ""}>{p.w} </span>
                      ))}
                    </div>
                  )}
                </>
              )}
              {ex.explain && session.checked && <div className="mt-0.5 text-xs text-ink-soft">{ex.explain}</div>}
            </div>
          )}
          <motion.button whileTap={{ y: 3 }} onClick={check} disabled={!canCheck && !session.checked}
            className={`btn-3d ml-auto min-w-36 px-6 py-3.5 text-white disabled:opacity-40 ${
              fb && !fb.ok ? "bg-danger" : "bg-brand-bright"}`}
            style={fb && !fb.ok ? { "--btn-shadow": "#a32222" } : undefined}>
            {session.checked ? (fb && !fb.ok ? "OK!" : "Continuar") : ex.silent ? (ex.continueLabel || "Continuar") : "Verificar"}
          </motion.button>
        </div>
      </footer>
    </div>
  );
}
