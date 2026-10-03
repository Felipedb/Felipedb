// Casca comum da lição (VISUAL_SPEC 6.2): cabeçalho (X, barra de progresso com o rótulo de combo sobreposto,
// corações), área do exercício com troca sem frame vazio (AnimatePresence popLayout, min-height do exercício
// anterior), interstício de revisão e rodapé de feedback por mola (FeedbackFooter publicando --footer-h).
// Os formatos vivem em ../components/exercises (lições) e ../components/scenes (cenas).
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useAppState } from "../core/useStore.js";
import { useSessionVersion } from "../core/useSession.js";
import { session, check, quitLesson, skipListening, skipSpeaking, unitCrowns } from "../core/session.js";
import { LISTEN_TYPES } from "../core/builder.js";
import { stopClip, recognizeOnce } from "../core/audio.js";
import { SPRING, DUR, EASE } from "../core/motion.js";
import { sfx } from "../core/sfx.js";
import Result from "./Result.jsx";
import ExerciseView from "../components/exercises/index.jsx";
import { footerFeedback, pronounceTarget } from "../components/exercises/feedback.jsx";
import Icon from "../components/Icon.jsx";
import ProgressBar, { ComboLabel } from "../components/ui/ProgressBar.jsx";
import Badge from "../components/ui/Badge.jsx";
import Bubble from "../components/ui/Bubble.jsx";
import CharacterStage from "../components/ui/CharacterStage.jsx";
import FeedbackFooter from "../components/ui/FeedbackFooter.jsx";
import { LessonBanner } from "../components/ui/Snackbar.jsx";

// Corações do cabeçalho: ícone SVG + número. Ao perder um coração o ícone treme e um coração fantasma sobe;
// o número desliza. Na prática (corações infinitos) mostra o símbolo de infinito.
function Hearts({ hearts, practice, lost }) {
  const reduce = useReducedMotion();
  const broken = !practice && hearts <= 0 && lost != null;
  return (
    <div className="relative flex items-center gap-1.5 text-red-text" aria-label={practice ? "Corações ilimitados" : `${hearts} corações`}>
      <motion.span key={lost == null ? "idle" : `lost-${lost}`} className="inline-flex"
        animate={lost != null && !reduce ? { scale: [1, 1.35, 1], x: [0, -4, 4, -2, 0] } : { scale: 1, x: 0 }}
        transition={{ duration: 0.35, delay: 0.15 }}>
        <Icon name={practice ? "infinity" : broken ? "heart-broken" : "heart"} size={24} />
      </motion.span>
      {!practice && (
        <span className="relative inline-flex h-6 min-w-[1.25rem] items-center justify-center overflow-hidden">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span key={hearts} className="text-body font-extrabold tabular-nums leading-none"
              initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -8, opacity: 0, transition: { duration: 0.12 } }} transition={SPRING.snap}>
              {hearts}
            </motion.span>
          </AnimatePresence>
        </span>
      )}
      <AnimatePresence>
        {lost != null && !practice && !reduce && (
          <motion.span key={`ghost-${lost}`} aria-hidden className="pointer-events-none absolute left-0 top-0 inline-flex"
            initial={{ y: 0, opacity: 0.9 }} animate={{ y: -28, opacity: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, delay: 0.15 }}>
            <Icon name="heart" size={24} />
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

// Interstício de revisão (6.3 #21): tela vazia com o balão à esquerda e o narrador entrando inclinado pela
// borda direita, feliz e falando enquanto toca o som de início. O CTA "Continuar" fica no rodapé.
function ReviewInterstitial({ ch }) {
  const [talking, setTalking] = useState(false);
  useEffect(() => {
    sfx("start");
    setTalking(true);
    const t = setTimeout(() => setTalking(false), 900);
    return () => clearTimeout(t);
  }, []);
  return (
    <div data-interstitial className="relative flex min-h-[440px] items-center">
      <motion.div className="relative z-10" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ ...SPRING.pop, delay: 0.15 }} style={{ transformOrigin: "100% 60%" }}>
        <Bubble variant="right" maxWidth="220px">
          <span className="block text-sentence leading-7">Vamos corrigir os exercícios que você errou!</span>
        </Bubble>
      </motion.div>
      <div className="absolute -right-20 top-1/2 -translate-y-1/2">
        <CharacterStage ch={ch} variant="peek" pose="happy" talking={talking} />
      </div>
    </div>
  );
}

export default function Lesson() {
  useSessionVersion();
  const app = useAppState();
  const [introSeen, setIntroSeen] = useState(null); // sessão cuja revisão de erros já foi apresentada
  const [banner, setBanner] = useState("");
  const [explainOpen, setExplainOpen] = useState(false);
  const [pron, setPron] = useState(null); // prática de pronúncia: { text, busy }
  const [minH, setMinH] = useState(0);    // altura do exercício anterior durante a transição
  const measure = useRef(null);
  const lastH = useRef(0);
  const firstKey = useRef(true);
  useEffect(() => () => stopClip(), []);

  // Em desenvolvimento, expõe a sessão para os testes de ponta a ponta
  if (import.meta.env.DEV && typeof window !== "undefined") window.__session = session;

  const live = !!session && session.phase !== "result";
  const ex = live ? session.exercises[session.index] : null;
  const fb = live ? session.feedback : null;
  const ok = !!(fb && fb.ok);
  const checked = live ? session.checked : false;
  const firstReviewIdx = live ? session.exercises.findIndex((e) => e.isReview) : -1;
  const showReviewIntro = live && !!session.reviewing && firstReviewIdx === session.index && !checked && introSeen !== session;
  const exKey = !live ? "none" : showReviewIntro ? "interstitial" : `${session.index}:${ex.type}`;
  const canCheck = live && (ex.silent || (session.answer != null && String(session.answer) !== ""));

  // Troca de exercício: guarda a altura do anterior (min-height) e toca o swoosh; o rodapé volta a "Verificar"
  // com 120 ms de atraso para não piscar
  useLayoutEffect(() => { setMinH(lastH.current); }, [exKey]);
  useEffect(() => { if (measure.current) lastH.current = measure.current.offsetHeight; });
  useEffect(() => {
    setExplainOpen(false);
    setPron(null);
    if (firstKey.current) { firstKey.current = false; return; }
    sfx("swoosh");
    window.scrollTo({ top: 0 });
  }, [exKey]);

  // Após checar, o elemento respondido entra na área visível (nunca atrás do rodapé)
  useEffect(() => {
    if (!checked) return;
    const t = setTimeout(() => {
      const el = document.querySelector('[aria-checked="true"]') || document.querySelector("[data-answer-input]")
        || document.querySelector("[data-opt].border-sky-line, [data-opt].border-ok-line");
      if (el) { try { el.scrollIntoView({ block: ex && String(ex.type).startsWith("scene-") ? "end" : "nearest", behavior: "smooth" }); } catch (e) { /* sem scroll */ } }
    }, 80);
    return () => clearTimeout(t);
  }, [checked]); // eslint-disable-line react-hooks/exhaustive-deps

  const primary = () => { if (showReviewIntro) setIntroSeen(session); else check(); };

  // Atalhos de teclado: Enter/espaço verifica ou continua; 1 a 9 escolhe a opção
  const primaryRef = useRef(primary);
  primaryRef.current = primary;
  useEffect(() => {
    const onKey = (e) => {
      if (!session || session.phase === "result") return;
      const tag = e.target && e.target.tagName;
      const inInput = tag === "INPUT" || tag === "TEXTAREA";
      const cur = session.exercises[session.index];
      if (!cur) return;
      const has = cur.silent || (session.answer != null && String(session.answer) !== "");
      if ((e.key === "Enter" || (e.key === " " && session.checked)) && !inInput && (has || session.checked || document.querySelector("[data-interstitial]"))) {
        e.preventDefault();
        primaryRef.current();
        return;
      }
      if (!inInput && !session.checked && /^[1-9]$/.test(e.key)) {
        const o = document.querySelectorAll("[data-opt]")[Number(e.key) - 1];
        if (o) o.click();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Rótulo do CTA com o atraso de 120 ms ao voltar para "Verificar"
  const ctaLabel = !live ? "" : showReviewIntro ? "Continuar" : checked ? (ok ? "Continuar" : "Entendi") : ex.silent ? (ex.continueLabel || "Continuar") : "Verificar";
  const [shownLabel, setShownLabel] = useState(ctaLabel);
  useEffect(() => {
    if (shownLabel === ctaLabel) return undefined;
    if (checked || showReviewIntro) { setShownLabel(ctaLabel); return undefined; }
    const t = setTimeout(() => setShownLabel(ctaLabel), 120);
    return () => clearTimeout(t);
  }, [ctaLabel]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!session) return null;
  if (session.phase === "result") return <Result />;

  // Prática de pronúncia (botão secundário do rodapé): reconhece a frase completa e mostra o resultado na linha 2
  const practicePronunciation = () => {
    if (session.practiceRec) { try { session.practiceRec.stop(); } catch (e) { /* já parou */ } return; }
    const target = pronounceTarget(ex);
    const s0 = session;
    session.practiceRec = recognizeOnce(target, {
      onStart: () => setPron({ text: `Diga: "${target}"`, busy: true }),
      onResult: (r) => {
        if (session !== s0) return;
        if (r.ok) { sfx("correct"); setPron({ text: `Boa pronúncia! ${Math.round(r.score * 100)}% das palavras`, busy: false }); }
        else setPron({ text: `Quase. Você disse: "${r.text}". Tente de novo.`, busy: false });
      },
      onError: (err) => setPron({
        text: err === "unsupported" ? "Reconhecimento de voz indisponível neste navegador."
          : err === "not-allowed" ? "Permita o uso do microfone para praticar."
          : "Não consegui ouvir. Tente de novo.",
        busy: false,
      }),
      onEnd: () => { s0.practiceRec = null; setPron((p) => (p ? { ...p, busy: false } : p)); },
    });
  };

  const progress = (session.index + (checked && ok ? 1 : 0)) / Math.max(1, session.exercises.length);
  const lost = fb && !ok && !session.practice ? session.index : null;
  const data = footerFeedback(ex, session);
  const footerFb = fb && data ? {
    ok,
    praise: data.praise,
    line: pron ? pron.text : explainOpen && data.explain ? data.explain : data.line,
    lineNode: pron || explainOpen ? null : data.lineNode,
  } : null;
  const secondary = footerFb && !showReviewIntro
    ? data.explain ? { label: explainOpen ? "Ocultar explicação" : "Explique minha resposta", icon: "lightbulb", onClick: () => setExplainOpen((v) => !v) }
      : data.pronounce ? { label: pron && pron.busy ? "Ouvindo..." : "Praticar pronúncia", icon: "mic", onClick: practicePronunciation }
        : null
    : null;
  const ghost = !fb && !showReviewIntro
    ? LISTEN_TYPES.includes(ex.type) ? { label: "Não posso ouvir agora", onClick: skipListening }
      : ex.type === "speak" ? { label: "Não posso falar agora", onClick: skipSpeaking }
        : null
    : null;
  // Na fala não há CTA até o aluno falar (ou pular pelo link)
  const hideCta = ex.type === "speak" && !checked && !showReviewIntro;
  const cta = hideCta ? null : { label: shownLabel || ctaLabel, onClick: primary, disabled: !showReviewIntro && !canCheck && !checked };

  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col overflow-x-clip px-4">
      {/* Cabeçalho: X, barra (com COMBO sobreposto), corações */}
      <header className="pt-5">
        <div className="flex items-center gap-3 pb-3">
          <button type="button" onClick={quitLesson} aria-label="Sair da etapa"
            className="-ml-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-disabled transition-colors hover:text-ink-soft">
            <Icon name="close" size={24} tone="mono" />
          </button>
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-x-0 -top-5 flex justify-center leading-none">
              <ComboLabel combo={showReviewIntro ? 0 : session.combo} />
            </div>
            <ProgressBar variant="lesson" value={progress} combo={session.combo} ariaLabel="Progresso da lição" />
          </div>
          {session.levelUp && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-pill bg-yellow-soft px-2 py-0.5 text-caption uppercase tracking-[.8px] text-yellow-text">
              <Icon name="crown" size={16} />
              {session.legendary ? "Lendária" : `Nível ${unitCrowns(session.lesson.unit.id) + 1}`}
            </span>
          )}
          <Hearts hearts={app.hearts} practice={!!session.practice} lost={lost} />
        </div>
        <LessonBanner text={banner} icon="flag" onDone={() => setBanner("")} className="mb-2" />
      </header>

      {/* Exercício: o que sai desliza para a esquerda enquanto o novo entra pela direita (sem frame vazio) */}
      <div className="relative flex-1 pt-2" style={{ minHeight: minH ? `calc(${minH}px + var(--footer-h, 140px) + 24px)` : undefined, paddingBottom: "calc(var(--footer-h, 140px) + 16px)" }}>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div key={exKey} ref={measure} className="w-full"
            initial={{ x: 64, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
            exit={{ x: -48, opacity: 0, transition: { duration: DUR.state, ease: EASE.out } }}
            transition={SPRING.settle} onAnimationComplete={() => setMinH(0)}>
            {showReviewIntro ? (
              <ReviewInterstitial ch={session.narrator} />
            ) : (
              <>
                {ex.isReview ? <div className="mb-4"><Badge kind="review" /></div> : ex.newWord ? <div className="mb-4"><Badge kind="new-word" /></div> : null}
                <ExerciseView ex={ex} answer={session.answer} checked={checked} fb={fb} />
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Rodapé: VERIFICAR / CONTINUAR / ENTENDI, link ghost 24 px acima, feedback por mola */}
      <FeedbackFooter fb={footerFb} cta={cta} secondary={secondary} ghost={ghost}
        share={data && data.share} onFlag={() => setBanner("Obrigado! Vamos revisar este exercício")} />
    </div>
  );
}
