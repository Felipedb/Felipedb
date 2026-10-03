// Peças compartilhadas das cenas do dia a dia (VISUAL_SPEC 5.12, 5.20 e 6.3 #22): chat progressivo com
// avatares de 40 px e balões com rabinho (herói em verde à direita, o outro em cinza à esquerda), nome só na
// troca de falante, karaokê opcional, opções no padrão Option, chips de vocabulário e a cadeia de reprodução
// com guarda de sessão e exercício. Nada aqui edita componentes de ui/: tudo é composição.
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { session, setAnswer } from "../../core/session.js";
import { SCENE_BY_ID, castChar, sceneNameOf } from "../../core/content.js";
import { speak, clipDuration } from "../../core/audio.js";
import { normalize, blankRegex } from "../../core/util.js";
import { SPRING } from "../../core/motion.js";
import Avatar from "../ui/Avatar.jsx";
import Option, { OptionGroup } from "../ui/Option.jsx";
import { Chip } from "../ui/Badge.jsx";
import { optionState } from "../exercises/shared.jsx";

export const sceneOf = (ex) => SCENE_BY_ID[ex.sceneId];

// Interlocutor da cena: o campo `with` ou, na falta dele, o primeiro falante que não é o herói
export function sceneOther(sc) {
  if (sc.with && sc.with !== sc.char) return castChar(sc.with);
  const l = sc.lines.find((x) => x.who !== sc.char);
  return castChar(l ? l.who : sc.with);
}

// Depuração apenas em DEV: exercício atual visível no console (nunca em produção)
if (import.meta.env.DEV && typeof window !== "undefined") {
  Object.defineProperty(window, "__ex", {
    get: () => session && session.exercises[session.index],
    configurable: true,
  });
}

// Título do exercício da cena: text-title 24/800, como nos demais formatos
export function SceneTitle({ children }) {
  return <h2 className="mb-5 text-title text-ink">{children}</h2>;
}

// Rótulo de seção (caption 13/800 em caixa alta, --color-ink-soft)
export const SceneLabel = ({ children, className = "" }) => (
  <div className={`mb-2.5 text-caption uppercase tracking-[.8px] text-ink-soft ${className}`}>{children}</div>
);

// Anéis do avatar por lado: herói em verde, o outro em azul; apagado quando a fala é antiga
const RING = { hero: "var(--color-green)", other: "var(--color-blue)" };

// Rabinho do balão desenhado com um quadrado girado (mesma técnica de .bubble::before), sem CSS global novo
function Tail({ side, hot }) {
  const border = hot ? (side === "hero" ? "var(--color-green-line)" : "var(--color-blue-line)") : (side === "hero" ? "var(--color-green-line)" : "var(--color-line)");
  const bg = side === "hero" ? "var(--color-green-soft)" : "var(--color-page)";
  const style = side === "hero"
    ? { right: -7, bottom: 10, transform: "rotate(45deg)", background: bg, borderRight: `2px solid ${border}`, borderTop: `2px solid ${border}` }
    : { left: -7, bottom: 10, transform: "rotate(45deg)", background: bg, borderLeft: `2px solid ${border}`, borderBottom: `2px solid ${border}` };
  return <span aria-hidden className="absolute h-3 w-3" style={style} />;
}

// Balão do chat: herói (fundo --color-green-soft, borda --color-green-line, canto inferior direito 6) ou outro
// (fundo --color-page, borda --color-line, canto inferior esquerdo 6). `hot` acende a borda enquanto fala.
export function ChatBubble({ side = "other", hot = false, onClick, label, animate = true, className = "", children }) {
  const base = side === "hero"
    ? `rounded-lg rounded-br-[6px] bg-green-soft ${hot ? "border-green-line" : "border-green-line/80"}`
    : `rounded-lg rounded-bl-[6px] bg-page ${hot ? "border-blue-line" : "border-line"}`;
  const tap = typeof onClick === "function";
  return (
    <motion.div
      role={tap ? "button" : undefined}
      tabIndex={tap ? 0 : undefined}
      aria-label={tap ? label || "Ouvir" : undefined}
      onClick={onClick}
      onKeyDown={tap ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(e); } } : undefined}
      className={`relative max-w-full border-2 px-4 py-3 text-sentence text-ink ${tap ? "cursor-pointer" : ""} ${base} ${className}`}
      style={{ transformOrigin: side === "hero" ? "100% 100%" : "0% 100%" }}
      initial={animate ? { scale: 0.9, opacity: 0 } : false}
      animate={{ scale: 1, opacity: 1 }}
      transition={SPRING.pop}
      whileTap={tap ? { scale: 0.98 } : undefined}
    >
      <Tail side={side} hot={hot} />
      {children}
    </motion.div>
  );
}

// Tradução em 15/500 --color-ink-soft dentro do balão
export const Pt = ({ children, className = "" }) => (
  <div className={`mt-1 text-secondary text-ink-soft ${className}`}>{children}</div>
);

// Nome do falante (caption 13 --color-ink-soft), mostrado só na troca de falante
export const Who = ({ children, side = "other" }) => (
  <div className={`mb-1 text-caption uppercase tracking-[.8px] text-ink-soft ${side === "hero" ? "text-right" : ""}`}>{children}</div>
);

// Karaokê: quantas palavras já foram "cantadas" enquanto o clipe toca. Distribui a duração real do clipe
// (clipDuration, ou uma estimativa) proporcionalmente ao tamanho das palavras. `active` liga; `done` acende tudo.
export function useKaraoke(text, charKey, active, done = false) {
  const words = String(text || "").split(" ").filter(Boolean);
  const [lit, setLit] = useState(done ? words.length : 0);
  const timers = useRef([]);
  useEffect(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (done) { setLit(words.length); return undefined; }
    if (!active) { setLit(0); return undefined; }
    const total = (clipDuration(text, charKey) || Math.min(5, 0.6 + String(text).length * 0.06)) * 1000;
    const weights = words.map((w) => w.length + 1);
    const sum = weights.reduce((a, b) => a + b, 0);
    let acc = 0;
    setLit(0);
    words.forEach((w, i) => {
      acc += weights[i];
      timers.current.push(setTimeout(() => setLit(i + 1), Math.round((acc / sum) * total * 0.92)));
    });
    return () => { timers.current.forEach(clearTimeout); timers.current = []; };
  }, [active, done, text]); // eslint-disable-line react-hooks/exhaustive-deps
  return lit;
}

// Frase com as palavras já faladas em --color-accent (karaokê); sem karaokê, texto simples
export function KaraokeText({ text, lit }) {
  const words = String(text || "").split(" ").filter(Boolean);
  return (
    <span>
      {words.map((w, i) => (
        <span key={i} className={i < lit ? "text-accent transition-colors duration-150" : ""}>{w}{i < words.length - 1 ? " " : ""}</span>
      ))}
    </span>
  );
}

// Uma mensagem do chat: avatar 40 (anel na cor do lado quando fala) + balão. Sem children, mostra a fala
// EN e a tradução PT (toque fala a frase). Com children, o corpo é do exercício em andamento.
// Props: sc, line, now (fala atual: anel aceso), showName (nome acima, só na troca de falante),
//        karaoke { active, done } (opcional), revealPt (mostra a tradução), onTap (sobrepõe o toque padrão)
export function ChatMsg({ sc, line, now = false, showName = true, karaoke = null, revealPt = true, onTap, animate = true, children }) {
  const ch = castChar(line.who);
  const me = line.who === sc.char;
  const side = me ? "hero" : "other";
  const [flash, setFlash] = useState(false);
  const timer = useRef(0);
  useEffect(() => () => clearTimeout(timer.current), []);
  const hot = now || flash;
  const lit = useKaraoke(line.en, ch.key, !!(karaoke && karaoke.active), !!(karaoke && karaoke.done));
  const tap = children ? undefined : () => {
    if (onTap) { onTap(line); return; }
    speak(line.en, { char: ch });
    setFlash(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setFlash(false), 1500);
  };
  const name = sceneNameOf(line.who) + (me ? " (você)" : "");
  return (
    <div className={`flex max-w-full items-end gap-2.5 ${me ? "flex-row-reverse" : ""}`}>
      <Avatar ch={ch} size={40} ring={hot ? RING[side] : "var(--color-line)"} talking="auto" className="mb-0.5" />
      <div className={`flex min-w-0 max-w-[82%] flex-col ${me ? "items-end" : "items-start"}`}>
        {showName && <Who side={side}>{name}</Who>}
        <ChatBubble side={side} hot={hot} onClick={tap} label={`Ouvir: ${line.en}`} animate={animate}>
          {children || (
            <>
              {karaoke ? <KaraokeText text={line.en} lit={lit} /> : <span>{line.en}</span>}
              {revealPt && <Pt>{line.pt}</Pt>}
            </>
          )}
        </ChatBubble>
      </div>
    </div>
  );
}

// Conversa até a fala `upto` (exclusiva): as falas antigas ficam acima, com rolagem natural da página
// (sem colapsar); o nome aparece só quando o falante muda. `children` é a fala em andamento.
export function SceneChat({ sc, upto, children, className = "" }) {
  const prev = sc.lines.slice(0, upto);
  return (
    <div className={`mb-5 flex flex-col gap-3 ${className}`}>
      {prev.map((line, i) => (
        <ChatMsg key={i} sc={sc} line={line} showName={i === 0 || prev[i - 1].who !== line.who} animate={false} />
      ))}
      {children}
    </div>
  );
}

// Nome a mostrar acima da fala em andamento: só quando o falante anterior é outro
export const nameChanges = (sc, li) => li <= 0 || sc.lines[li - 1].who !== sc.lines[li].who;

// Corpo da bolha do herói antes da resposta: instrução em azul + tradução (o que ele quer dizer)
export function HeroPrompt({ line, hint, children }) {
  return (
    <>
      <div className="text-caption uppercase tracking-[.8px] text-blue-text">{hint}</div>
      {children || <div className="mt-1 text-sentence text-ink">{line.pt}</div>}
    </>
  );
}

// Corpo da bolha depois de checar: a fala revelada em inglês + tradução
export function HeroReveal({ line }) {
  return (
    <>
      <span>{line.en}</span>
      <Pt>{line.pt}</Pt>
    </>
  );
}

// Opções (Option 56 px, 1 coluna): data-opt={i+1} e data-value={texto}; a correta acende ao checar
export function SceneOptions({ ex, cols = 1, onSelect, label = "Opções" }) {
  const answer = session.answer;
  const checked = session.checked;
  return (
    <OptionGroup cols={cols} label={label}>
      {ex.options.map((o, i) => (
        <Option key={o + i} index={i} value={o} cols={cols} shortcut
          state={optionState(o, { answer, checked, correct: ex.correct })}
          onSelect={(v) => {
            if (session.checked) return;
            setAnswer(v);
            if (onSelect) onSelect(v);
          }}>
          {o}
        </Option>
      ))}
    </OptionGroup>
  );
}

// Chips de vocabulário (intro e "Você praticou"): toque fala com a voz do herói
export function VocabChips({ vocab, char }) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {vocab.map((v) => (
        <Chip key={v.en} en={v.en} pt={v.pt} icon={v.icon} onClick={() => speak(v.en, { char })} />
      ))}
    </div>
  );
}

// Cartão silencioso: rótulo do botão do rodapé + resposta simbólica
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
  return (lines, { gapMs = 350, delayMs = 0, onStep, onDone } = {}) => {
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
    clearTimeout(timer.current);
    if (delayMs > 0) timer.current = setTimeout(next, delayMs);
    else next();
  };
}

// Mantém a área de interação (opções, banco, lacuna) visível acima do rodapé fixo: nas conversas longas o chat
// empurra as opções para baixo da dobra. Rola na montagem (depois da transição de entrada) e de novo ao checar,
// descontando a altura do rodapé (--footer-h) que o scrollIntoView nativo ignora.
// keepTop=false rola até a base do elemento (banco de palavras abaixo de um chat longo).
export function useRevealBelow(ref, checked = false, { delay = 420, afterCheck = 400, keepTop = true } = {}) {
  useEffect(() => {
    const t = setTimeout(() => {
      const el = ref.current;
      if (!el) return;
      const footer = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--footer-h"), 10) || 140;
      const rect = el.getBoundingClientRect();
      const limit = window.innerHeight - footer - 16;
      if (rect.bottom > limit) {
        const delta = keepTop ? Math.min(rect.bottom - limit, Math.max(0, rect.top - 72)) : rect.bottom - limit;
        if (delta > 4) window.scrollBy({ top: delta, behavior: "smooth" });
      }
    }, checked ? afterCheck : delay);
    return () => clearTimeout(t);
  }, [checked]); // eslint-disable-line react-hooks/exhaustive-deps
}

// Frase com lacuna: partes antes/depois da palavra (lacuna como palavra inteira)
export function gapParts(en, blank) {
  const m = blankRegex(blank).exec(en);
  if (!m) return [en, ""];
  return [en.slice(0, m.index), en.slice(m.index + m[0].length)];
}

export { normalize, sceneNameOf, castChar };
