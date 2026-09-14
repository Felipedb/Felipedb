// Fechamento da cena: o que aconteceu de verdade, vocabulário praticado e a
// conversa inteira tocada em sequência. Porta fiel de renderSceneTruth.
import { useState } from "react";
import { motion } from "motion/react";
import { session } from "../../core/session.js";
import { useSessionVersion } from "../../core/useSession.js";
import { castChar, sceneNameOf } from "../../core/content.js";
import { VocabChips, sceneOf, useSilentCard, useSpeakChain } from "./shared.jsx";

export default function SceneTruth({ ex }) {
  useSessionVersion();
  const sc = sceneOf(ex);
  const hero = castChar(sc.char);
  session.voiceChar = hero;
  useSilentCard(ex, "Concluir cena");
  const [playing, setPlaying] = useState(false);
  const [label, setLabel] = useState(null);
  const play = useSpeakChain(ex);

  const replay = () => {
    if (playing) return;
    setPlaying(true);
    play(sc.lines, {
      gapMs: 500,
      onStep: (l) => setLabel(`${sceneNameOf(l.who)}: ${l.en}`),
      onDone: () => {
        setPlaying(false);
        setLabel(null);
      },
    });
  };

  return (
    <div>
      <h2 className="font-display mb-3 text-center text-xl font-extrabold">Cena completa! 🎉</h2>
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: "easeOut" }}
        className="card mb-3.5 rounded-[20px] p-4">
        <div className="text-xs font-black uppercase tracking-wide text-sky-fg">📖 O que aconteceu de verdade</div>
        <p className="my-2 text-[15px] font-bold leading-relaxed">{sc.truth}</p>
        <div className="text-[13px] font-extrabold text-ink-soft">{sc.ref}</div>
      </motion.div>
      <div className="mb-2 text-[13px] font-black uppercase tracking-wide text-ink-soft">Você praticou</div>
      <VocabChips vocab={sc.vocab} char={hero} />
      <button
        onClick={replay}
        disabled={playing}
        className="mx-auto mt-4 block max-w-full truncate rounded-2xl border-2 border-line bg-card px-4 py-2.5 font-display font-bold text-sky-fg transition-colors hover:bg-hover disabled:opacity-70"
      >
        {label || "▶ Ouvir a conversa inteira"}
      </button>
    </div>
  );
}
