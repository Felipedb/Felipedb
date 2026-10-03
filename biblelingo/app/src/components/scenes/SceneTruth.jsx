// Fechamento da cena (VISUAL_SPEC 6.3 #22 scene-truth): card Pergaminho "O que aconteceu de verdade" com texto e
// referência, chips praticados, Button3D secondary "Ouvir a conversa inteira" (a fala atual aparece abaixo
// enquanto toca) e CTA "Concluir cena" no rodapé.
import { useState } from "react";
import { motion } from "motion/react";
import { session } from "../../core/session.js";
import { useSessionVersion } from "../../core/useSession.js";
import { castChar, sceneNameOf } from "../../core/content.js";
import { SPRING, STAGGER, list, item } from "../../core/motion.js";
import Card from "../ui/Card.jsx";
import Button3D from "../ui/Button3D.jsx";
import Avatar from "../ui/Avatar.jsx";
import { SceneTitle, SceneLabel, VocabChips, sceneOf, useSilentCard, useSpeakChain } from "./shared.jsx";

export default function SceneTruth({ ex }) {
  useSessionVersion();
  const sc = sceneOf(ex);
  const hero = castChar(sc.char);
  session.voiceChar = hero;
  useSilentCard(ex, "Concluir cena");
  const [playing, setPlaying] = useState(false);
  const [now, setNow] = useState(null); // fala sendo tocada
  const play = useSpeakChain(ex);

  const replay = () => {
    if (playing) return;
    setPlaying(true);
    play(sc.lines, {
      gapMs: 500,
      onStep: (l) => setNow(l),
      onDone: () => { setPlaying(false); setNow(null); },
    });
  };

  return (
    <motion.div variants={list(STAGGER.cards, 0.05)} initial="hidden" animate="show">
      <SceneTitle>Cena completa!</SceneTitle>
      <motion.div variants={item(SPRING.settle, 14)}>
        <Card variant="parchment" className="mb-5">
          <div className="text-caption uppercase tracking-[.8px] text-blue-text">O que aconteceu de verdade</div>
          <p className="mt-2 text-body text-ink">{sc.truth}</p>
          <div className="mt-2 text-secondary text-parchment-text">{sc.ref}</div>
        </Card>
      </motion.div>

      <motion.div variants={item(SPRING.settle, 14)}>
        <SceneLabel>Você praticou</SceneLabel>
        <VocabChips vocab={sc.vocab} char={hero} />
      </motion.div>

      <motion.div variants={item(SPRING.settle, 14)} className="mt-6">
        <Button3D variant="secondary" tone="blue" block icon="speaker" onClick={replay} disabled={playing} aria-live="polite">
          Ouvir a conversa inteira
        </Button3D>
        <div className="mt-3 flex min-h-10 items-center justify-center gap-2.5 text-secondary text-ink-soft" aria-live="polite">
          {now && (
            <>
              <Avatar ch={castChar(now.who)} size={24} ring={now.who === sc.char ? "var(--color-green)" : "var(--color-blue)"} talking="auto" />
              <span className="min-w-0 truncate"><b className="font-bold text-ink">{sceneNameOf(now.who)}:</b> {now.en}</span>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
