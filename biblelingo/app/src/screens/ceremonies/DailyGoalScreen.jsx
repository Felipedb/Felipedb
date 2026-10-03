// DailyGoalScreen (VISUAL_SPEC 6.4 e 7.3 "Meta diária"): SegmentRing 160 de 10 px #ffc800 indo do percentual anterior a 100%
// (0 a 900 ms), check pop + sfx sparkle (900 ms), "Meta diária batida!", "20 de 20 XP", missões concluídas nesta lição em lista
// com check pop e pílula "+5 XP" subindo (1000 ms+), CTA (1500 ms). Aparece só quando a meta foi batida nesta lição.
import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import Ceremony from "./Ceremony.jsx";
import { SegmentRing, CountUp } from "../../components/ui/index.js";
import Icon from "../../components/Icon.jsx";
import { SPRING, STAGGER, list, item } from "../../core/motion.js";
import { sfx } from "../../core/sfx.js";
import { haptic } from "../../core/haptics.js";

const QUEST_ICON = { xp: "bolt", lessons: "book", perfect: "star", combo: "flame" };

export default function DailyGoalScreen({ from = 0, goal = 20, xp = 20, missions = [], onContinue }) {
  useEffect(() => {
    const t = setTimeout(() => { sfx("sparkle"); haptic("mission"); }, 900);
    return () => clearTimeout(t);
  }, []);
  return (
    <Ceremony kind="goal" label="Meta diária" marks={[900, 1000]} ctaAt={1500} onContinue={onContinue}>
      {(at) => (
        <div className="flex w-full flex-col items-center">
          <motion.div animate={at(900) ? { scale: [1, 1.08, 1] } : { scale: 1 }} transition={{ duration: 0.3 }}>
            <SegmentRing size={160} stroke={10} segments={1} value={1} from={from} color="#ffc800" duration={0.9} label="Meta diária">
              <AnimatePresence mode="wait" initial={false}>
                {at(900) ? (
                  <motion.span key="check" className="text-yellow" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={SPRING.pop}>
                    <Icon name="check" size={72} tone="#ffc800" />
                  </motion.span>
                ) : (
                  <motion.span key="num" className="text-display tabular-nums text-ink" exit={{ scale: 0.6, opacity: 0, transition: { duration: 0.12 } }}>
                    <CountUp to={xp} duration={0.9} />
                  </motion.span>
                )}
              </AnimatePresence>
            </SegmentRing>
          </motion.div>
          <motion.h1 className="mt-6 text-title text-ink" initial={{ y: 12, opacity: 0 }} animate={at(900) ? { y: 0, opacity: 1 } : { y: 12, opacity: 0 }} transition={SPRING.settle}>
            Meta diária batida!
          </motion.h1>
          <motion.p className="mt-1 text-secondary text-ink-soft" initial={{ opacity: 0 }} animate={at(900) ? { opacity: 1 } : { opacity: 0 }}>
            {Math.min(xp, goal)} de {goal} XP
          </motion.p>
          {missions.length > 0 && at(1000) && (
            <motion.ul className="mt-6 flex w-full flex-col gap-2.5" variants={list(STAGGER.cards)} initial="hidden" animate="show" aria-label="Missões concluídas">
              {missions.map((m) => (
                <motion.li key={m.id} variants={item(SPRING.settle, 16)} className="card flex items-center gap-3 px-4 py-3 text-left">
                  <motion.span className="shrink-0" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ ...SPRING.pop, delay: 0.1 }}>
                    <Icon name="check-circle" size={28} />
                  </motion.span>
                  <span className="flex min-w-0 flex-1 items-center gap-2">
                    <Icon name={QUEST_ICON[m.id] || "target"} size={20} />
                    <span className="truncate text-body font-bold text-ink">{m.label}</span>
                  </span>
                  <motion.span className="shrink-0 rounded-pill bg-yellow px-2.5 py-0.5 text-caption text-gold-ink"
                    initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}>
                    +{m.reward} XP
                  </motion.span>
                </motion.li>
              ))}
            </motion.ul>
          )}
        </div>
      )}
    </Ceremony>
  );
}
