// História interativa — porta fiel de hub.js (startStory/renderBeat/storyOptions/nextBeat/finishStory).
// Beats sequenciais: fala (en/pt + who), pergunta (q/options/answer) e lacuna (gap/options/answer).
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { state, save } from "../core/store.js";
import { recordLesson } from "../core/session.js";
import { STORIES, CHARACTERS, castChar } from "../core/content.js";
import { speak, stopClip } from "../core/audio.js";
import { shuffle, buzz } from "../core/util.js";
import { sfx, confetti } from "../core/events.js";
import CharFace from "../components/CharFace.jsx";
import { Sayable } from "../components/exercises/Sayable.jsx";

function StoryOptions({ options, answer, picked, onPick }) {
  return (
    <div className="flex flex-col gap-2.5">
      {options.map((opt) => {
        const isCorrect = picked != null && opt === answer;
        const isWrong = picked != null && opt === picked && opt !== answer;
        const isFaded = picked != null && !isCorrect && !isWrong;
        return (
          <motion.button key={opt} data-opt={opt} whileTap={picked == null ? { scale: 0.97 } : undefined}
            onClick={() => onPick(opt)}
            className={`rounded-2xl border-2 border-b-4 px-4 py-3 text-left font-bold transition-colors ${
              isCorrect ? "border-ok-line bg-ok-bg text-brand" :
              isWrong ? "animate-[shake_0.3s] border-bad-line bg-bad-bg text-bad-fg" :
              isFaded ? "pointer-events-none border-line bg-card opacity-40" :
              "border-line bg-card hover:bg-hover"}`}>
            {opt}
          </motion.button>
        );
      })}
    </div>
  );
}

export default function Story({ id, onExit }) {
  const s = useMemo(() => STORIES.find((x) => x.id === id), [id]);
  const [i, setI] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [picked, setPicked] = useState(null);
  const [finish, setFinish] = useState(null); // { gained }

  const beat = s && s.beats[i];
  // Como no clássico: fala já vem "respondida"; pergunta/lacuna esperam a escolha
  const answered = !!finish || (beat && (beat.en ? true : picked != null));
  const options = useMemo(() => (beat && beat.options ? shuffle(beat.options) : null), [s, i]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fala: narração automática ao entrar no beat
  useEffect(() => {
    if (beat && beat.en) {
      const ch = beat.who ? castChar(beat.who) : null;
      speak(beat.en, ch ? { char: ch } : {});
    }
  }, [s, i]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => stopClip(), []);

  if (!s) return null;

  const exit = () => { stopClip(); onExit(); };

  const pick = (opt) => {
    if (picked != null) return;
    setPicked(opt);
    const ok = opt === beat.answer;
    if (ok) { sfx("correct"); buzz(25); }
    else { sfx("wrong"); buzz([60, 40, 60]); setMistakes((m) => m + 1); }
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
    sfx("finish");
    confetti({ particleCount: 70, spread: 70, origin: { y: 0.4 } });
    setFinish({ gained });
  };

  const next = () => {
    if (finish) { exit(); return; }
    if (!answered) return;
    if (i + 1 >= s.beats.length) { finishStory(); return; }
    setPicked(null);
    setI(i + 1);
  };

  const ch = beat && beat.en && beat.who ? castChar(beat.who) : null;
  const gapParts = beat && beat.gap ? beat.gap.split("___") : null;

  return (
    <div className="mx-auto max-w-xl px-4 pt-2" data-screen="story">
      {/* Topo: voltar + progresso + título */}
      <div className="sticky top-0 z-30 -mx-4 flex items-center gap-3 border-b-2 border-line bg-page/95 px-4 py-2 backdrop-blur lg:mx-0 lg:rounded-2xl lg:border-2">
        <button onClick={exit} aria-label="Sair" data-story-back
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xl font-bold text-ink-soft transition-colors hover:bg-hover">←</button>
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-track">
          <motion.div className="h-full rounded-full bg-brand-bright"
            animate={{ width: `${finish ? 100 : (i / s.beats.length) * 100}%` }} transition={{ duration: 0.3 }} />
        </div>
        <span className="max-w-[40%] truncate font-display text-sm font-extrabold">{s.title}</span>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={finish ? "end" : i} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.18 }} className="pt-4 pb-36">
          {finish ? (
            <div className="py-6 text-center" data-story-end>
              <CharFace ch={CHARACTERS[s.cover] ? { key: s.cover, ...CHARACTERS[s.cover] } : null}
                className="mx-auto mb-3 h-[140px] w-[140px] border-4 border-line text-7xl" />
              <h3 className="font-display text-2xl font-extrabold text-gold-fg">História concluída!</h3>
              <p className="mt-1 font-bold">
                <b className="text-brand">+{finish.gained} XP</b> · {mistakes === 0 ? "sem erros 🌟" : `${mistakes} erro(s)`}
              </p>
            </div>
          ) : beat.en ? (
            <div className="mt-3 mb-8 flex items-end gap-3">
              <div className="relative flex shrink-0 flex-col items-center">
                {ch ? (
                  <CharFace ch={ch} className="h-[84px] w-[84px] border-[3px] border-line text-5xl" />
                ) : (
                  <span className="flex h-[84px] w-[84px] items-center justify-center rounded-full border-[3px] border-gold-soft bg-gold-soft text-4xl">📖</span>
                )}
                <small className="absolute -bottom-5 whitespace-nowrap text-[11px] font-extrabold text-ink-soft">
                  {ch ? ch.name.split(" (")[0] : "Narrador"}
                </small>
              </div>
              <div className="relative flex-1 rounded-2xl border-2 border-line bg-card px-4 py-3.5 shadow-sm">
                <Sayable text={beat.en} className="text-lg font-extrabold leading-snug" />
                <div className="mt-1.5 text-sm font-bold text-ink-soft">{beat.pt}</div>
              </div>
            </div>
          ) : beat.q ? (
            <>
              <h2 className="font-display mb-4 text-2xl font-extrabold"><Sayable text={beat.q} /></h2>
              <StoryOptions options={options} answer={beat.answer} picked={picked} onPick={pick} />
            </>
          ) : (
            <>
              <h2 className="font-display mb-3 text-2xl font-extrabold">Complete a frase</h2>
              <div className="card mb-1 p-4 text-lg font-bold leading-relaxed">
                <Sayable text={gapParts[0]} />
                <span className="mx-1 inline-block min-w-16 rounded-lg border-b-4 border-line bg-cream px-2 text-center font-bold text-sky-fg">
                  {picked ?? " "}
                </span>
                <Sayable text={gapParts[1] || ""} />
              </div>
              <div className="mb-4 text-sm italic text-ink-soft">{beat.pt}</div>
              <StoryOptions options={options} answer={beat.answer} picked={picked} onPick={pick} />
            </>
          )}
        </motion.div>
      </AnimatePresence>

      <button onClick={next} disabled={!answered} data-story-next
        className="btn-3d fixed inset-x-4 bottom-[calc(76px+env(safe-area-inset-bottom))] z-30 mx-auto max-w-md bg-brand-bright px-5 py-3.5 text-white disabled:bg-track disabled:text-locked disabled:shadow-none lg:bottom-5">
        {finish ? "Voltar" : "Continuar"}
      </button>
    </div>
  );
}
