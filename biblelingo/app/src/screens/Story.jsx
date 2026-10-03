// História interativa (VISUAL_SPEC 6.9, 7.3 "História", 11.8). Porta de hub.js (startStory/renderBeat/storyOptions/nextBeat/finishStory).
// Beats sequenciais: fala (en/pt + who), pergunta (q/options/answer) e lacuna (gap/options/answer).
// Cabeçalho 56 px (arrow-left 44, ProgressBar story, título 15/700). Fala: Avatar 40 falando (ou book-open em Pergaminho para o
// narrador), nome só na troca de falante, Bubble crescendo do rabinho com texto revelado por palavra sincronizado ao clipe
// (clipDuration ou 60 ms por palavra) e tradução 200 ms depois; falas anteriores ficam empilhadas acima. CONTINUAR só ao fim do áudio.
// Pergunta: Option em cascata (data-opt com o texto como valor); lacuna: card com Gap + 3 Chip. Fim: StatCard XP, personagem pulando, confete.
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import confettiFx from "canvas-confetti";
import { state, save } from "../core/store.js";
import { recordLesson } from "../core/session.js";
import { STORIES, CHARACTERS, castChar } from "../core/content.js";
import { speak, stopClip, clipDuration } from "../core/audio.js";
import { shuffle } from "../core/util.js";
import { SPRING, SHAKE, EASE } from "../core/motion.js";
import { sfx } from "../core/sfx.js";
import { haptic } from "../core/haptics.js";
import { Button3D, ProgressBar, Avatar, Bubble, Option, OptionGroup, Chip, Gap, StatCard, CharacterStage } from "../components/ui/index.js";
import Icon from "../components/Icon.jsx";
import { Sayable } from "../components/exercises/Sayable.jsx";
import { cleanWord } from "../components/exercises/shared.jsx";

const words = (t) => String(t || "").split(" ").filter(Boolean);

// Texto revelado palavra a palavra: a palavra que acaba de aparecer fica em --color-accent; cada palavra fala ao toque
function RevealText({ text, char, durationMs, instant = false, onDone }) {
  const reduce = useReducedMotion();
  const list = words(text);
  const [n, setN] = useState(instant || reduce ? list.length : 0);
  useEffect(() => {
    if (instant || reduce) { setN(list.length); onDone && onDone(); return; }
    setN(0);
    const step = Math.max(45, Math.min(220, durationMs / Math.max(1, list.length)));
    let k = 0;
    const id = setInterval(() => {
      k++;
      setN(k);
      if (k >= list.length) { clearInterval(id); onDone && onDone(); }
    }, step);
    return () => clearInterval(id);
  }, [text]); // eslint-disable-line
  return (
    <span>
      {list.map((w, i) => (
        <span key={i}>
          <motion.button type="button" className={`rounded-sm ${i === n - 1 && n < list.length ? "text-accent" : "text-ink"}`}
            onClick={() => speak(cleanWord(w), { char })}
            initial={false} animate={{ opacity: i < n ? 1 : 0.18, y: i < n ? 0 : 3 }} transition={{ duration: 0.16, ease: EASE.out }}>
            {w}
          </motion.button>
          {i < list.length - 1 ? " " : ""}
        </span>
      ))}
    </span>
  );
}

function SpeechBeat({ beat, ch, hero, showName, current, onRevealed }) {
  const [revealed, setRevealed] = useState(!current);
  const dur = useMemo(() => {
    const clip = clipDuration(beat.en, ch && ch.key);
    return clip ? clip * 1000 : 60 * words(beat.en).length;
  }, [beat.en]); // eslint-disable-line
  const name = ch ? ch.name.split(" (")[0] : "Narrador";
  return (
    <div className={`flex items-start gap-3 ${current ? "" : "opacity-80"}`} data-story-beat>
      <div className="mt-5 w-10 shrink-0">
        {ch ? (
          <Avatar ch={ch} size={40} talking={current ? "auto" : false} />
        ) : (
          <span className="parchment flex h-10 w-10 items-center justify-center rounded-full!" aria-label="Narrador"><Icon name="book-open" size={24} /></span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="h-5">{showName && <span className="text-caption uppercase tracking-[.8px] text-ink-soft">{name}</span>}</div>
        <Bubble variant={hero ? "hero" : "other"} full>
          <div className="text-sentence">
            <RevealText text={beat.en} char={ch} durationMs={dur} instant={!current} onDone={() => { setRevealed(true); onRevealed && onRevealed(); }} />
          </div>
          <motion.div className="mt-1 text-secondary text-ink-soft" initial={false} animate={{ opacity: revealed ? 1 : 0 }} transition={{ duration: 0.25, delay: revealed && current ? 0.2 : 0 }}>
            {beat.pt}
          </motion.div>
        </Bubble>
      </div>
    </div>
  );
}

export default function Story({ id, onExit }) {
  const reduce = useReducedMotion();
  const s = useMemo(() => STORIES.find((x) => x.id === id), [id]);
  const [i, setI] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [picked, setPicked] = useState(null);
  const [revealed, setRevealed] = useState(false); // fala atual terminou de aparecer
  const [praise, setPraise] = useState(false);     // faixa "Isso!" por 1 s
  const [finish, setFinish] = useState(null);      // { gained }
  const endRef = useRef(null);

  const beat = s && s.beats[i];
  const answered = !!finish || (beat && (beat.en ? revealed : picked != null));
  const options = useMemo(() => (beat && beat.options ? shuffle(beat.options) : null), [s, i]); // eslint-disable-line react-hooks/exhaustive-deps
  const cover = s && CHARACTERS[s.cover] ? { key: s.cover, ...CHARACTERS[s.cover] } : null;

  // Fala: narração automática ao entrar no beat; o texto se revela no ritmo do clipe
  useEffect(() => {
    setRevealed(false);
    if (beat && beat.en) {
      const ch = beat.who ? castChar(beat.who) : null;
      speak(beat.en, ch ? { char: ch } : {});
    }
  }, [s, i]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => stopClip(), []);
  // Falas empilham: rola até a fala nova
  useEffect(() => {
    const t = setTimeout(() => { if (endRef.current) endRef.current.scrollIntoView({ block: "end", behavior: reduce ? "auto" : "smooth" }); }, 80);
    return () => clearTimeout(t);
  }, [i, finish]); // eslint-disable-line
  // Fim: confete pelo componente visível
  useEffect(() => {
    if (!finish) return;
    sfx("finish");
    haptic("finish");
    if (reduce) return;
    const t = setTimeout(() => { try { confettiFx({ particleCount: 70, spread: 70, origin: { y: 0.4 }, ticks: 200 }); } catch (e) { /* sem confete */ } }, 250);
    return () => clearTimeout(t);
  }, [finish]); // eslint-disable-line

  if (!s) return null;

  const exit = () => { stopClip(); onExit(); };

  const pick = (opt) => {
    if (picked != null) return;
    setPicked(opt);
    const ok = opt === beat.answer;
    if (ok) { sfx("correct"); haptic("correct"); setPraise(true); setTimeout(() => setPraise(false), 1000); }
    else { sfx("wrong"); haptic("wrong"); setMistakes((m) => m + 1); }
    speak(beat.answer);
  };

  const finishStory = () => {
    const first = !(state.stories && state.stories[s.id]);
    state.stories = state.stories || {};
    state.stories[s.id] = true;
    const gained = first ? s.xp : Math.ceil(s.xp / 2);
    state.xp += gained;
    recordLesson({ gained, perfect: mistakes === 0, bestCombo: 0 });
    save();
    setFinish({ gained });
  };

  const next = () => {
    if (finish) { exit(); return; }
    if (!answered) return;
    if (i + 1 >= s.beats.length) { finishStory(); return; }
    setPicked(null);
    setI(i + 1);
  };

  // Falas até o beat atual (a pergunta aparece abaixo da pilha de falas)
  const speeches = [];
  let prevWho;
  s.beats.slice(0, i + 1).forEach((b, k) => {
    if (!b.en) return;
    const ch = b.who ? castChar(b.who) : null;
    speeches.push({ b, k, ch, showName: speeches.length === 0 || prevWho !== (b.who || null), hero: !!b.who && b.who === s.cover });
    prevWho = b.who || null;
  });
  const gapParts = beat && beat.gap ? beat.gap.split("___") : null;
  const optState = (opt) => (picked == null ? "idle" : opt === beat.answer ? "correct" : opt === picked ? "wrong" : "disabled");
  const progress = finish ? 1 : i / s.beats.length;

  return (
    <div className="mx-auto max-w-xl px-4" data-screen="story">
      {/* Cabeçalho 56 px: voltar, progresso, título */}
      <div className="sticky top-0 z-30 -mx-4 flex h-14 items-center gap-3 bg-page/95 px-3 backdrop-blur lg:mx-0">
        <button type="button" onClick={exit} aria-label="Sair da história" data-story-back
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-ink-soft hover:bg-raised">
          <Icon name="arrow-left" size={24} />
        </button>
        <ProgressBar variant="story" value={progress} ariaLabel="Progresso da história" />
        <span className="max-w-[40%] truncate text-[15px] font-bold text-ink">{s.title}</span>
      </div>

      <div className="flex flex-col gap-4 pt-4 pb-40">
        {!finish && speeches.map((sp) => (
          <SpeechBeat key={sp.k} beat={sp.b} ch={sp.ch} hero={sp.hero} showName={sp.showName} current={sp.k === i} onRevealed={() => setRevealed(true)} />
        ))}

        <AnimatePresence mode="wait" initial={false}>
          {finish ? (
            <motion.div key="end" className="flex flex-col items-center py-4 text-center" data-story-end
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={SPRING.settle}>
              <motion.div animate={reduce ? undefined : { y: [0, -14, 0] }} transition={{ duration: 0.6, repeat: 2, repeatDelay: 0.4, ease: "easeInOut", delay: 0.2 }}>
                <CharacterStage ch={cover} variant="header" pose="happy" state="celebrate" glow />
              </motion.div>
              <h2 className="mt-2 text-title text-yellow-text">História concluída!</h2>
              <p className="mt-1 text-secondary text-ink-soft">{mistakes === 0 ? "Sem nenhum erro." : `${mistakes} ${mistakes === 1 ? "erro" : "erros"} no caminho.`}</p>
              <motion.div className="mt-5" initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ ...SPRING.settle, delay: 0.3 }}>
                <StatCard label="XP" value={finish.gained} format={(v) => `+${v}`} icon="bolt" color="yellow" delay={0.4} />
              </motion.div>
            </motion.div>
          ) : beat.q ? (
            <motion.div key={`q${i}`} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24, transition: { duration: 0.15 } }} transition={SPRING.settle}>
              <h2 className="mb-4 mt-2 text-title text-ink"><Sayable text={beat.q} /></h2>
              <OptionGroup cols={1} label="Opções">
                {options.map((opt, k) => (
                  <Option key={opt} index={k} value={opt} state={optState(opt)} onSelect={pick} data-opt={opt}>{opt}</Option>
                ))}
              </OptionGroup>
            </motion.div>
          ) : beat.gap ? (
            <motion.div key={`g${i}`} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24, transition: { duration: 0.15 } }} transition={SPRING.settle}>
              <h2 className="mb-3 mt-2 text-title text-ink">Complete a frase</h2>
              <div className="card px-4 py-4 text-sentence text-ink">
                <Sayable text={gapParts[0]} />
                <Gap display value={picked || ""} blank={beat.answer} state={picked == null ? "idle" : picked === beat.answer ? "ok" : "bad"} />
                <Sayable text={gapParts[1] || ""} />
              </div>
              <div className="mb-4 mt-2 text-secondary italic text-ink-soft">{beat.pt}</div>
              <div className="flex flex-wrap gap-2.5" role="group" aria-label="Opções">
                {options.map((opt) => {
                  const st = optState(opt);
                  return (
                    <motion.span key={opt} className="inline-flex" animate={st === "wrong" ? { x: SHAKE.x } : st === "correct" ? { scale: [1, 1.06, 1, 1.06, 1] } : { x: 0, scale: 1 }}
                      transition={st === "wrong" ? SHAKE.transition : { duration: 0.6 }}>
                      <Chip en={opt} onClick={() => pick(opt)} selected={st === "correct"} data-opt={opt} aria-disabled={picked != null || undefined}
                        className={st === "correct" ? "border-green-line! bg-green-soft! dark:bg-raised!" : st === "wrong" ? "border-red-line! bg-red-soft! dark:bg-raised!" : st === "disabled" ? "opacity-60" : ""} />
                    </motion.span>
                  );
                })}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
        <div ref={endRef} />
      </div>

      {/* Faixa curta de acerto */}
      <AnimatePresence>
        {praise && (
          <motion.div key="praise" className="pointer-events-none fixed inset-x-4 bottom-[calc(140px+env(safe-area-inset-bottom))] z-30 mx-auto flex max-w-md items-center justify-center gap-2 rounded-md bg-green px-4 py-2 text-label uppercase tracking-[1px] text-white lg:bottom-20"
            initial={{ y: 16, opacity: 0, scale: 0.9 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 8, opacity: 0, transition: { duration: 0.15 } }} transition={SPRING.footer} role="status">
            <Icon name="check-circle" size={22} tone="mono" /> Isso!
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed inset-x-4 bottom-[calc(76px+env(safe-area-inset-bottom))] z-30 mx-auto max-w-md lg:bottom-5">
        <Button3D variant="primary" size="cta" block disabled={!answered} onClick={next} data-story-next>Continuar</Button3D>
      </div>
    </div>
  );
}
