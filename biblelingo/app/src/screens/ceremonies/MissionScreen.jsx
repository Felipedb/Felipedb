// MissionScreen (VISUAL_SPEC 5.24 e 6.4): uma por item de session.pendingCelebrations. Chest 96 aberto, heading "Missão concluída",
// body com a missão ("Complete 2 lições"), pílula "+5 XP" com CountUp, sfx sparkle + haptic, CTA. Substitui o toast
// "Missão concluída" que antes aparecia durante a lição.
import { useEffect } from "react";
import { motion } from "motion/react";
import Ceremony from "./Ceremony.jsx";
import { Chest, CountUp } from "../../components/ui/index.js";
import Icon from "../../components/Icon.jsx";
import { SPRING } from "../../core/motion.js";
import { sfx } from "../../core/sfx.js";
import { haptic } from "../../core/haptics.js";

const QUEST_ICON = { xp: "bolt", lessons: "book", perfect: "star", combo: "flame" };

export default function MissionScreen({ id, label = "Missão", reward = 5, onContinue }) {
  useEffect(() => {
    sfx("mission");
    haptic("mission");
  }, []);
  return (
    <Ceremony kind="mission" label="Missão concluída" marks={[300, 700]} ctaAt={1200} onContinue={onContinue}>
      {(at) => (
        <div className="flex w-full flex-col items-center">
          <motion.div initial={{ scale: 0.6, y: 24, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} transition={SPRING.bounce}>
            <Chest size={96} state="opened" reward={reward} label="" />
          </motion.div>
          <motion.h1 className="mt-5 text-heading text-ink" initial={{ y: 12, opacity: 0 }} animate={at(300) ? { y: 0, opacity: 1 } : { y: 12, opacity: 0 }} transition={SPRING.settle}>
            Missão concluída
          </motion.h1>
          <motion.p className="mt-1 flex items-center gap-2 text-body text-ink-soft" initial={{ opacity: 0 }} animate={at(300) ? { opacity: 1 } : { opacity: 0 }}>
            <Icon name={QUEST_ICON[id] || "target"} size={20} />
            {label}
          </motion.p>
          {at(700) && (
            <motion.span className="mt-5 inline-flex items-center gap-1.5 rounded-pill bg-yellow px-4 py-1.5 text-label uppercase tracking-[1px] text-gold-ink"
              initial={{ scale: 0.6, y: 10, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} transition={SPRING.pop}>
              <Icon name="bolt" size={20} tone="#5b4400" />
              <CountUp to={reward} duration={0.5} format={(v) => `+${v} XP`} />
            </motion.span>
          )}
        </div>
      )}
    </Ceremony>
  );
}
