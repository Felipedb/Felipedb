// Quadro da lição: progresso, corações, exercício atual e rodapé de feedback.
// Os componentes de exercício ficam em ../components/exercises (lições) e ../components/scenes (cenas).
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useAppState } from "../core/useStore.js";
import { useSessionVersion } from "../core/useSession.js";
import { session, check, quitLesson, skipListening, unitCrowns } from "../core/session.js";
import { LISTEN_TYPES } from "../core/builder.js";
import { diffWords } from "../core/checker.js";
import { stopClip } from "../core/audio.js";
import { toast } from "../core/events.js";
import Result from "./Result.jsx";
import ExerciseView from "../components/exercises/index.jsx";
import CharFace from "../components/CharFace.jsx";
import Icon from "../components/Icon.jsx";

function FlagButton() {
  return (
    <button aria-label="Reportar este exercício" title="Reportar"
      onClick={() => toast("🚩 Obrigado! Vamos revisar este exercício.")}
      className="shrink-0 self-start p-1 text-xl text-locked transition-colors hover:text-ink-soft">
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
        <path d="M6 3a1 1 0 0 0-1 1v17a1 1 0 1 0 2 0v-6h11.3a1 1 0 0 0 .8-1.6L16.5 10l2.6-3.4A1 1 0 0 0 18.3 5H7V4a1 1 0 0 0-1-1z" />
      </svg>
    </button>
  );
}

export default function Lesson() {
  useSessionVersion();
  const app = useAppState();
  const [introSeen, setIntroSeen] = useState(null); // sessão cuja revisão de erros já foi apresentada
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
  const ok = fb && fb.ok;
  const progress = (session.index / session.exercises.length) * 100;
  const canCheck = ex.silent || session.answer != null && String(session.answer) !== "";
  const combo = session.combo >= 2 && !fb;

  // Interstício antes do primeiro erro revisitado: "vamos corrigir o que você errou"
  const firstReviewIdx = session.exercises.findIndex((e) => e.isReview);
  const showReviewIntro = !!session.reviewing && firstReviewIdx === session.index && !session.checked && introSeen !== session;

  // Tradução mostrada no acerto, como no alvo visual (sem repetir o próprio enunciado)
  const subtitle = ok && ex.type !== "translate-en-pt" && ex.sentence && ex.sentence.pt ? ex.sentence.pt : null;

  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col px-4">
      {/* Topo */}
      <header className="pt-2">
        <div className="h-6 text-center">
          {combo && (
            <motion.span key={session.combo} initial={{ scale: 1.25 }} animate={{ scale: 1 }}
              className="text-sm font-extrabold uppercase tracking-[0.08em] text-gold-fg dark:text-gold">
              Combo x{session.combo}
            </motion.span>
          )}
        </div>
        <div className="flex items-center gap-3 pb-3">
          <button onClick={quitLesson} aria-label="Sair da etapa" className="p-1 text-xl text-locked transition-colors hover:text-ink-soft">
            <Icon name="close" />
          </button>
          <div className="h-4 flex-1 rounded-full bg-track">
            <motion.div layout className={`h-full overflow-hidden rounded-full ${combo ? "bg-gold" : "bg-brand-bright"}`}
              animate={{ width: `${Math.max(progress, 4)}%` }} transition={{ type: "spring", stiffness: 160, damping: 26 }}>
              <div className="mx-2.5 pt-1"><div className="h-1.5 rounded-full bg-white/30" /></div>
            </motion.div>
          </div>
          {session.levelUp && <span className="rounded-full bg-gold-soft px-2 py-0.5 text-xs font-extrabold text-gold-fg dark:text-gold">👑 {session.legendary ? "Lendária" : `Nível ${unitCrowns(session.lesson.unit.id) + 1}`}</span>}
          <span className="font-display text-lg font-extrabold text-danger">{session.practice ? "💪" : <>❤️ {app.hearts}</>}</span>
        </div>
      </header>

      {/* Exercício */}
      <div className="flex flex-1 flex-col pb-44">
        {showReviewIntro ? (
          <div data-interstitial className="relative flex flex-1 items-center">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="relative mr-24 flex-1">
              <div className="relative rounded-2xl border-2 border-line bg-card px-5 py-4 text-lg font-bold leading-snug">
                Vamos corrigir os exercícios que você errou!
                <span aria-hidden className="absolute -right-[9px] top-1/2 h-3.5 w-3.5 -translate-y-1/2 rotate-45 border-r-2 border-t-2 border-line bg-card" />
              </div>
            </motion.div>
            <motion.div initial={{ x: 90 }} animate={{ x: 0 }} transition={{ type: "spring", stiffness: 160, damping: 18 }}
              className="absolute -right-10 top-1/2 -translate-y-1/2 rotate-[-14deg]">
              <CharFace ch={session.narrator} className="h-32 w-32 border-2 border-line text-6xl" />
            </motion.div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={session.index + ":" + ex.type}
              initial={{ opacity: 0, x: 32 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.18, ease: "easeOut" }}>
              {ex.isReview ? (
                <div className="mb-3 flex items-center gap-2 text-[13px] font-extrabold uppercase tracking-[0.1em] text-[#ff9600]">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#ff9600] text-sm font-black text-white">↻</span>
                  Corrija o erro de antes
                </div>
              ) : ex.newWord ? (
                <div className="mb-3 flex items-center gap-2 text-[13px] font-extrabold uppercase tracking-[0.1em] text-sky">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky text-sm font-black text-white">✦</span>
                  Nova palavra
                </div>
              ) : null}
              <ExerciseView ex={ex} />
              {LISTEN_TYPES.includes(ex.type) && !session.checked && (
                <div className="mt-10 text-center">
                  <button onClick={skipListening} className="text-sm font-extrabold uppercase tracking-[0.14em] text-locked transition-colors hover:text-ink-soft">
                    Não posso ouvir agora
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Rodapé */}
      <footer className={`fixed inset-x-0 bottom-0 z-40 border-t-2 px-4 pb-[calc(16px+env(safe-area-inset-bottom))] pt-4 ${
        fb ? "border-transparent bg-card-2 shadow-[0_-6px_24px_rgba(0,0,0,0.18)]" : "border-line bg-page"}`}>
        <div className="mx-auto max-w-2xl">
          {fb && (
            <div className="mb-4 flex items-start gap-3.5">
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-2xl text-white ${ok ? "bg-brand-bright" : "bg-danger"}`}>
                <Icon name={ok ? "check" : "close"} />
              </span>
              <div className="min-w-0 flex-1">
                {ok ? (
                  <>
                    <div className="font-display text-2xl font-extrabold leading-tight text-brand">{fb.praise}</div>
                    {subtitle && <div className="mt-1 text-[15px] font-bold text-brand/80">{subtitle}</div>}
                    {fb.comboPill && <div className="mt-1.5 inline-block rounded-full bg-gold px-2.5 py-0.5 text-xs font-extrabold text-[#5b4400]">{fb.comboPill}</div>}
                    {fb.typo && <div className="mt-1 text-sm text-ink-soft">Atenção à ortografia: <b>{ex.correctLabel || ex.correct}</b></div>}
                  </>
                ) : (
                  <>
                    <div className="font-display text-2xl font-extrabold leading-tight text-danger dark:text-bad-fg">Incorreto</div>
                    {ex.correct !== "__matched__" && (
                      <>
                        <div className="mt-1 text-[13px] font-extrabold uppercase tracking-wide text-bad-fg/80">Resposta correta:</div>
                        <div className="text-[15px] font-bold text-ink">
                          {diffWords(String(ex.correctLabel || ex.correct), String(session.answer || "")).map((p, i) => (
                            <span key={i} className={p.miss ? "font-extrabold text-bad-fg" : ""}>{p.w} </span>
                          ))}
                        </div>
                      </>
                    )}
                  </>
                )}
                {ex.explain && session.checked && <div className="mt-1 text-xs text-ink-soft">{ex.explain}</div>}
              </div>
              <FlagButton />
            </div>
          )}
          <motion.button whileTap={{ y: 3 }}
            onClick={() => (showReviewIntro ? setIntroSeen(session) : check())}
            disabled={!showReviewIntro && !canCheck && !session.checked}
            className={`btn-3d btn-cta w-full text-white ${fb && !ok ? "bg-danger" : "bg-brand-bright"} disabled:bg-track disabled:text-locked`}
            style={fb && !ok ? { "--btn-shadow": "#a32222" } : undefined}>
            {showReviewIntro ? "Continuar"
              : session.checked ? (fb && !ok ? "Entendi" : "Continuar")
              : ex.silent ? (ex.continueLabel || "Continuar") : "Verificar"}
          </motion.button>
        </div>
      </footer>
    </div>
  );
}
