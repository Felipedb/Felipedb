// StreakScreen (VISUAL_SPEC 6.4 e 7.3 "Ofensiva"): fundo #131f24 sempre (tokens escuros via classe .dark) com vinheta laranja a 10%,
// Flame 160 acendendo com glow (100 ms), número contando (400 ms), StreakWeek preenchendo em cascata (700 ms),
// "N dias de ofensiva!" (1200 ms), "Pratique amanhã para manter" e CTA (1500 ms). Aparece só quando a ofensiva aumentou nesta lição.
import { useEffect } from "react";
import { motion } from "motion/react";
import Ceremony from "./Ceremony.jsx";
import { Flame, StreakWeek, CountUp } from "../../components/ui/index.js";
import { SPRING } from "../../core/motion.js";
import { sfx } from "../../core/sfx.js";
import { haptic } from "../../core/haptics.js";

export default function StreakScreen({ streak = 1, days = {}, onContinue }) {
  useEffect(() => {
    const t = setTimeout(() => { sfx("streak"); haptic("streak"); }, 100);
    return () => clearTimeout(t);
  }, []);
  return (
    <Ceremony kind="streak" label="Ofensiva" marks={[100, 400, 700, 1200]} ctaAt={1500} onContinue={onContinue}
      className="dark bg-[#131f24]! text-white"
      style={{ backgroundImage: "radial-gradient(ellipse 80% 55% at 50% 32%, rgba(255,150,0,.14), rgba(255,150,0,0) 70%)" }}>
      {(at) => (
        <div className="flex w-full flex-col items-center">
          <div className="relative flex h-[200px] items-end justify-center">
            {at(100) && <Flame size={160} lit glow />}
            {at(400) && (
              <motion.span className="absolute -bottom-3 text-[64px] font-black leading-none tabular-nums text-white"
                style={{ textShadow: "0 3px 0 #b85c00, 0 0 24px rgba(255,150,0,.6)" }}
                initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={SPRING.pop}>
                <CountUp to={streak} duration={0.6} />
              </motion.span>
            )}
          </div>
          <motion.h1 className="mt-6 text-title text-white" initial={{ y: 12, opacity: 0 }} animate={at(1200) ? { y: 0, opacity: 1 } : { y: 12, opacity: 0 }} transition={SPRING.settle}>
            {streak === 1 ? "dia de ofensiva!" : "dias de ofensiva!"}
          </motion.h1>
          <div className="mt-8 w-full rounded-lg border-2 border-[#37464f] bg-[#202f36] px-4 py-4">
            {at(700) ? <StreakWeek days={days} /> : <div className="h-[62px]" />}
          </div>
          <motion.p className="mt-5 text-secondary text-[#dce6ec]" initial={{ opacity: 0 }} animate={at(1200) ? { opacity: 1 } : { opacity: 0 }} transition={{ duration: 0.25 }}>
            Pratique amanhã para manter a chama acesa.
          </motion.p>
        </div>
      )}
    </Ceremony>
  );
}
