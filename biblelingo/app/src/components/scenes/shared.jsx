// Peças compartilhadas das cenas: chat (transcript), bolhas, cabeçalho, opções,
// chips de vocabulário e a cadeia de reprodução com guarda de sessão/exercício.
// Porta fiel de sceneTranscript/sceneMsg/sceneHeader/makeOptions (scene-engine.js).
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { session, setAnswer } from "../../core/session.js";
import { SCENE_BY_ID, castChar, sceneNameOf } from "../../core/content.js";
import { speak, clipDuration } from "../../core/audio.js";
import { normalize, blankRegex } from "../../core/util.js";
import CharFace from "../CharFace.jsx";

export const sceneOf = (ex) => SCENE_BY_ID[ex.sceneId];

// Depuração apenas em DEV: exercício atual visível no console (nunca em produção)
if (import.meta.env.DEV && typeof window !== "undefined") {
  Object.defineProperty(window, "__ex", {
    get: () => session && session.exercises[session.index],
    configurable: true,
  });
}

// Retrato redondo de uma fala (herói destacado em verde, o outro em azul quando fala)
export function SceneFace({ ch, me = false, now = false, big = false, small = false }) {
  return (
    <CharFace
      ch={ch}
      className={`shrink-0 border-2 ${big ? "h-18 w-18 text-4xl" : small ? "h-9 w-9 text-xl" : "h-11 w-11 text-2xl"} ${
        now ? (me ? "border-brand-bright ring-[3px] ring-ok-soft" : "border-sky ring-[3px] ring-sky-soft") : "border-line"
      }`}
    />
  );
}

export const Who = ({ children }) => (
  <div className="mb-0.5 text-[11px] font-black uppercase tracking-wider text-ink-soft">{children}</div>
);
export const En = ({ children, className = "" }) => (
  <div className={`text-[17px] font-extrabold leading-snug ${className}`}>{children}</div>
);
export const Pt = ({ children, small = false }) => (
  <div className={`mt-0.5 font-bold text-ink-soft ${small ? "text-xs" : "text-[13px]"}`}>{children}</div>
);

// Uma mensagem do chat. Sem children mostra quem fala + en + pt e toque fala a frase;
// com children, o corpo é customizado (exercício em andamento).
export function SceneMsg({ sc, line, now = false, small = false, children }) {
  const ch = castChar(line.who);
  const me = line.who === sc.char;
  const [flash, setFlash] = useState(false);
  const timer = useRef(0);
  useEffect(() => () => clearTimeout(timer.current), []);
  const hot = now || flash;
  const tap = !children;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0, scale: hot ? [1, 1.03, 1] : 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`flex max-w-full items-end gap-2 ${me ? "flex-row-reverse" : ""}`}
    >
      <SceneFace ch={ch} me={me} now={hot} small={small && !hot} />
      <div
        role={tap ? "button" : undefined}
        tabIndex={tap ? 0 : undefined}
        title={tap ? "Ouvir" : undefined}
        onClick={
          tap
            ? () => {
                speak(line.en, { char: ch });
                setFlash(true);
                clearTimeout(timer.current);
                timer.current = setTimeout(() => setFlash(false), 1500);
              }
            : undefined
        }
        className={`relative max-w-[min(84%,520px)] rounded-2xl border-2 ${small && !hot ? "px-3 py-1.5" : "px-3.5 py-2.5"} ${
          me ? "rounded-br-md bg-ok-soft" : "rounded-bl-md bg-card"
        } ${
          hot
            ? me
              ? "border-brand-bright shadow-[0_6px_16px_rgba(88,204,2,0.16)]"
              : "border-sky shadow-[0_6px_16px_rgba(28,176,246,0.16)]"
            : me
              ? "border-ok-line shadow-[0_4px_12px_rgba(90,70,30,0.07)]"
              : "border-line shadow-[0_4px_12px_rgba(90,70,30,0.07)]"
        } ${tap ? "cursor-pointer transition-transform active:scale-[0.98]" : ""}`}
      >
        {children || (
          <>
            <Who>{sceneNameOf(line.who)}</Who>
            <En className={small && !hot ? "text-[15px]" : ""}>{line.en}</En>
            <Pt small={small && !hot}>{line.pt}</Pt>
          </>
        )}
      </div>
    </motion.div>
  );
}

// Transcript da conversa até a fala atual; as antigas ficam dobradas atrás do botão "▲ N falas"
export function SceneChat({ sc, upto, children }) {
  const [expanded, setExpanded] = useState(false);
  const prev = sc.lines.slice(0, upto);
  const hidden = expanded ? 0 : Math.max(0, prev.length - 2);
  return (
    <div className="mb-4 flex flex-col gap-2.5">
      {hidden > 0 && (
        <button
          onClick={() => setExpanded(true)}
          className="self-center rounded-full border-2 border-line bg-card-2 px-3.5 py-1.5 text-xs font-extrabold text-ink-soft transition-colors hover:bg-hover"
        >
          ▲ {hidden} fala{hidden > 1 ? "s" : ""} anterior{hidden > 1 ? "es" : ""}
        </button>
      )}
      {prev.slice(hidden).map((line, i) => (
        <SceneMsg key={hidden + i} sc={sc} line={line} small />
      ))}
      {children}
    </div>
  );
}

// Chip da cena + título do exercício (sceneHeader clássico)
export function SceneHeader({ sc, title }) {
  return (
    <>
      <div className="mb-2">
        <span className="inline-flex items-center whitespace-nowrap rounded-full border-2 border-sky-line bg-sky-soft px-2.5 py-0.5 text-xs font-black tracking-wide text-sky-fg">
          💬 {sc.title}
        </span>
      </div>
      <h2 className="font-display mb-3 text-lg font-extrabold">{title}</h2>
    </>
  );
}

// Bolha do herói antes da resposta: dica em azul + tradução (heroPromptBody clássico)
export function HeroPrompt({ sc, line, hint }) {
  return (
    <>
      <Who>{sceneNameOf(sc.char)} (você)</Who>
      <div className="text-[13px] font-extrabold text-sky-fg">{hint}</div>
      <Pt>{line.pt}</Pt>
    </>
  );
}

// Bolha do herói depois de checar: a fala revelada (revealHero clássico)
export function HeroReveal({ sc, line }) {
  return (
    <>
      <Who>{sceneNameOf(sc.char)} (você)</Who>
      <En>{line.en}</En>
      <Pt>{line.pt}</Pt>
    </>
  );
}

export const ReplyLabel = ({ children }) => (
  <div className="mb-2.5 text-[13px] font-extrabold uppercase tracking-wide text-ink-soft">{children}</div>
);

// Opções de escolha no padrão visual de Choice.jsx (correta verde ao checar, errada shake)
export function SceneOptions({ ex, cols = 1, onSelect }) {
  const chosen = session.answer;
  const checked = session.checked;
  return (
    <div className={`grid gap-2.5 ${cols === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
      {ex.options.map((o, i) => {
        const isChosen = chosen === o;
        const isCorrect = checked && normalize(o) === normalize(String(ex.correct));
        const isWrong = checked && isChosen && !isCorrect;
        return (
          <motion.button
            key={o + i}
            data-opt={o}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              if (session.checked) return;
              setAnswer(o);
              if (onSelect) onSelect(o);
            }}
            className={`rounded-2xl border-2 border-b-4 px-4 py-3 text-left font-bold transition-colors ${
              isCorrect
                ? "border-ok-line bg-ok-bg text-brand"
                : isWrong
                  ? "animate-[shake_0.3s] border-bad-line bg-bad-bg text-bad-fg"
                  : isChosen
                    ? "border-sky-line bg-sky-soft text-sky-fg"
                    : checked
                      ? "border-line bg-card opacity-50"
                      : "border-line bg-card hover:bg-hover"
            }`}
          >
            {o}
          </motion.button>
        );
      })}
    </div>
  );
}

// Chips de vocabulário (intro e "Você praticou"): toque fala com a voz do herói + pop
export function VocabChips({ vocab, char }) {
  return (
    <div className="flex flex-wrap gap-2">
      {vocab.map((v) => (
        <motion.button
          key={v.en}
          type="button"
          whileTap={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 500, damping: 15 }}
          onClick={() => speak(v.en, { char })}
          className="flex items-center gap-2 rounded-2xl border-2 border-b-4 border-line bg-card px-3 py-2 text-left hover:bg-hover"
        >
          <span className="text-2xl leading-none">{v.icon || "•"}</span>
          <span>
            <b className="block text-[15px] leading-tight">{v.en}</b>
            <small className="text-xs font-bold text-ink-soft">{v.pt}</small>
          </span>
        </motion.button>
      ))}
    </div>
  );
}

// Cartão silencioso: rótulo do botão do rodapé + resposta simbólica (como o clássico)
export function useSilentCard(ex, label) {
  ex.continueLabel = label;
  useEffect(() => {
    setAnswer(ex.correct);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}

// Toca falas em sequência; PARA se a sessão mudar, se o exercício atual mudar ou ao desmontar
export function useSpeakChain(ex) {
  const cancelled = useRef(false);
  const timer = useRef(0);
  useEffect(
    () => () => {
      cancelled.current = true;
      clearTimeout(timer.current);
    },
    []
  );
  return (lines, { gapMs = 350, onStep, onDone } = {}) => {
    const s0 = session;
    let i = 0;
    const next = () => {
      if (cancelled.current || !session || session !== s0 || session.exercises[session.index] !== ex || i >= lines.length) {
        if (!cancelled.current && onDone) onDone();
        return;
      }
      const line = lines[i++];
      if (onStep) onStep(line, i - 1);
      speak(line.en, { char: castChar(line.who) });
      const d = clipDuration(line.en, line.who) || Math.min(5, 0.6 + line.en.length * 0.06);
      timer.current = setTimeout(next, d * 1000 + gapMs);
    };
    next();
  };
}

// Frase com lacuna: partes antes/depois da palavra (lacuna como palavra inteira)
export function gapParts(en, blank) {
  const m = blankRegex(blank).exec(en);
  if (!m) return [en, ""];
  return [en.slice(0, m.index), en.slice(m.index + m[0].length)];
}
