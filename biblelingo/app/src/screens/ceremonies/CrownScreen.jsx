// CrownScreen (VISUAL_SPEC 6.4 e 7.3 "Coroa"): crown 160 caindo (y -120 -> 0, SPRING.bounce) com raios girando atrás
// (rotate 360, 6 s em loop, opacidade .35), sfx levelup + haptic (0 ms), número da coroa contando (500 ms), confete dourado
// (900 ms), "Coroa 2 de 5" e o nome do capítulo em --unit-text, CTA (1500 ms). Aparece só em lição de subir de nível.
import { useEffect } from "react";
import { motion, useReducedMotion } from "motion/react";
import confettiFx from "canvas-confetti";
import Ceremony from "./Ceremony.jsx";
import { CountUp } from "../../components/ui/index.js";
import Icon from "../../components/Icon.jsx";
import { SPRING } from "../../core/motion.js";
import { unitVars, isDarkTheme } from "../../core/palette.js";
import { sfx } from "../../core/sfx.js";
import { haptic } from "../../core/haptics.js";

export default function CrownScreen({ n = 1, max = 5, legendary = false, unitId = "u1", unitTitle = "", onContinue }) {
  const reduce = useReducedMotion();
  useEffect(() => {
    sfx("levelup");
    haptic("levelup");
    if (reduce) return;
    const t = setTimeout(() => {
      try { confettiFx({ particleCount: 80, spread: 80, startVelocity: 38, origin: { y: 0.45 }, colors: ["#ffc800", "#ffe066", "#ffffff"], ticks: 200 }); } catch (e) { /* sem confete */ }
    }, 900);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line
  return (
    <Ceremony kind="crown" label="Coroa conquistada" marks={[500, 900]} ctaAt={1500} onContinue={onContinue}>
      {(at) => (
        <div className="flex w-full flex-col items-center" style={unitVars(unitId, isDarkTheme())}>
          <div className="relative flex h-[220px] w-[220px] items-center justify-center">
            {!reduce && (
              <motion.span aria-hidden className="absolute inset-0 rounded-full"
                style={{
                  background: "repeating-conic-gradient(from 0deg, rgba(255,200,0,.55) 0 9deg, rgba(255,200,0,0) 9deg 24deg)",
                  maskImage: "radial-gradient(circle, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 72%)", WebkitMaskImage: "radial-gradient(circle, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 72%)",
                }}
                initial={{ opacity: 0, rotate: 0 }} animate={{ opacity: 0.35, rotate: 360 }}
                transition={{ opacity: { duration: 0.6 }, rotate: { duration: 6, repeat: Infinity, ease: "linear" } }} />
            )}
            <motion.span className="relative" initial={{ y: -120, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={SPRING.bounce}>
              <Icon name="crown" size={160} />
            </motion.span>
          </div>
          <h1 className="mt-4 text-title text-ink">
            {legendary ? "Nível Lendário!" : (
              <>Coroa <span className="tabular-nums">{at(500) ? <CountUp to={n} duration={0.5} /> : 0}</span> de {max}</>
            )}
          </h1>
          <motion.p className="mt-1 text-heading text-unit-text" initial={{ opacity: 0, y: 8 }} animate={at(500) ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }} transition={SPRING.settle}>
            {unitTitle}
          </motion.p>
          <motion.p className="mt-3 text-secondary text-ink-soft" initial={{ opacity: 0 }} animate={at(900) ? { opacity: 1 } : { opacity: 0 }}>
            {legendary ? "Você dominou este capítulo." : n >= max ? "Capítulo no nível máximo." : "Continue praticando para a próxima coroa."}
          </motion.p>
        </div>
      )}
    </Ceremony>
  );
}
