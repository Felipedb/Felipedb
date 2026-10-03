// CharacterStage (VISUAL_SPEC 5.20): personagem como ator, em pé ao lado do balão ou centralizado, sobre uma
// elipse de sombra desenhada pelo app (--color-line, 85x24, 6 px sobrepostos aos pés). Ativos chars/v2/<key>/full.webp
// (+ full-happy, full-sad, mouth-open); sem full.webp usa bust.webp em círculo de 96 com borda 2 px; sem bust, o JPG atual
// com object-position center 22% e anel de 3 px. Nunca a legenda com o nome.
// Props:
//   ch        personagem { key, name, img } · variant: "side" (110x180) | "center" (220x300) | "peek" (160x260 à direita, 40% fora) |
//             "result" (180x300, pose happy, --glow-gold atrás) | "header" (96x160) | "trail" (140, lado oposto ao deslocamento)
//   pose      "neutral" | "happy" | "sad" · state: "idle" (respiração 3 s) | "happy" (y -10, 380 ms) | "sad" (SHAKE) | "celebrate" (SPRING.bounce)
//   talking   boolean ou "auto" (useTalking(ch.key)): alterna mouth-open a 8 fps; sem o ativo, y [0,-2,0] + scale [1,1.04,1] a cada 500 ms
//   reaction  "reaction-happy" | "reaction-sad" | null (badge 28 px fora do recorte) · glow: força o --glow-gold (320 px)
// Exemplo: <CharacterStage ch={ch} variant="side" state={ok ? "happy" : "idle"} reaction={reaction} talking="auto" />
import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { SPRING, SHAKE } from "../../core/motion.js";
import Icon from "../Icon.jsx";
import { useAsset, useTalking, charAsset } from "./Avatar.jsx";

const SIZE = {
  side: { w: 110, h: 180, img: 174, shadow: [85, 24] },
  center: { w: 220, h: 300, img: 290, shadow: [170, 40] },
  peek: { w: 160, h: 260, img: 250, shadow: [0, 0] },
  result: { w: 180, h: 300, img: 290, shadow: [120, 30] },
  header: { w: 96, h: 160, img: 154, shadow: [70, 20] },
  trail: { w: 140, h: 140, img: 134, shadow: [80, 20] },
};

function useMouth(ch, talking) {
  const has = useAsset(charAsset(ch, "mouth-open.webp"));
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!talking || !has) { setOpen(false); return; }
    const id = setInterval(() => setOpen((o) => !o), 125);
    return () => clearInterval(id);
  }, [talking, has]);
  return has && open;
}

export default function CharacterStage({ ch, variant = "side", pose = "neutral", state = "idle", talking = false, reaction = null, glow, className = "", ...rest }) {
  const reduce = useReducedMotion();
  const dims = SIZE[variant] || SIZE.side;
  const effPose = variant === "result" && pose === "neutral" ? "happy" : pose;
  const fullFile = effPose === "happy" ? "full-happy.webp" : effPose === "sad" ? "full-sad.webp" : "full.webp";
  const hasPose = useAsset(charAsset(ch, fullFile));
  const hasFull = useAsset(charAsset(ch, "full.webp"));
  const hasBust = useAsset(charAsset(ch, "bust.webp"));
  const auto = useTalking(talking === "auto" ? (ch && ch.key) : "__none__");
  const isTalking = talking === "auto" ? auto : !!talking;
  const mouthOpen = useMouth(ch, isTalking);
  const showGlow = glow != null ? glow : variant === "result";

  const full = hasPose ? charAsset(ch, fullFile) : hasFull ? charAsset(ch, "full.webp") : null;
  const src = mouthOpen ? charAsset(ch, "mouth-open.webp") : full;

  // Movimento do corpo: estado + respiração; a fala sem ativo de boca vira um leve balanço
  let anim = { y: 0, x: 0, scale: 1, rotate: 0 }, trans = SPRING.settle;
  if (reduce) { anim = { y: 0, x: 0, scale: 1, rotate: 0 }; }
  else if (state === "celebrate") { anim = { y: 0, rotate: 0, scale: 1 }; trans = SPRING.bounce; }
  else if (state === "happy") { anim = { y: [0, -10, 0] }; trans = { duration: 0.38 }; }
  else if (state === "sad") { anim = { x: SHAKE.x }; trans = SHAKE.transition; }
  else if (isTalking && !mouthOpen) { anim = { y: [0, -2, 0], scale: [1, 1.04, 1] }; trans = { duration: 0.5, repeat: Infinity }; }
  else { anim = { scale: [1, 1.015, 1] }; trans = { duration: 3, repeat: Infinity, ease: "easeInOut" }; }
  const initial = state === "celebrate" && !reduce ? { y: -16, rotate: -8 } : variant === "peek" && !reduce ? { x: 120, rotate: -10 } : false;
  const peekAnim = variant === "peek" && !reduce ? { x: 0, rotate: -4 } : {};

  return (
    <div className={`relative shrink-0 ${className}`} style={{ width: dims.w, height: dims.h }} aria-hidden={ch ? undefined : true} {...rest}>
      {showGlow && !reduce && (
        <motion.span aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ width: 320, height: 320, background: "var(--glow-gold)" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} />
      )}
      {dims.shadow[0] > 0 && (
        <span aria-hidden className="absolute left-1/2 -translate-x-1/2 rounded-full bg-line" style={{ width: dims.shadow[0], height: dims.shadow[1], bottom: 0 }} />
      )}
      <motion.div className="absolute inset-x-0 bottom-[6px] flex items-end justify-center" style={{ transformOrigin: "50% 100%" }}
        initial={initial} animate={{ ...anim, ...peekAnim }} transition={trans}>
        {src ? (
          <img src={src} alt={ch ? ch.name : ""} draggable="false" decoding="async" className="object-contain object-bottom" style={{ maxHeight: dims.img, maxWidth: dims.w }} />
        ) : ch && (hasBust || ch.img) ? (
          <span className={`flex items-center justify-center overflow-hidden rounded-full ${hasBust ? "border-2 border-line" : "ring-[3px] ring-line"} bg-unit-soft`}
            style={{ width: Math.min(96, dims.w - 8), height: Math.min(96, dims.w - 8) }}>
            <img src={hasBust ? charAsset(ch, "bust.webp") : ch.img} alt={ch.name} draggable="false" decoding="async" className="h-full w-full object-cover" style={{ objectPosition: hasBust ? "center 40%" : "center 22%" }} />
          </span>
        ) : ch && ch.emoji ? (
          <span className="emoji" role="img" aria-label={ch.name} style={{ fontSize: Math.min(72, dims.w * 0.6) }}>{ch.emoji}</span>
        ) : (
          <span className="flex items-center justify-center rounded-full bg-line" style={{ width: Math.min(96, dims.w - 8), height: Math.min(96, dims.w - 8) }}>
            <Icon name="avatar" size={Math.min(64, dims.w * 0.5)} />
          </span>
        )}
      </motion.div>
      <AnimatePresence>
        {reaction && (
          <motion.span key={reaction} className="absolute right-0 top-2" initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, opacity: 0, transition: { duration: 0.12 } }} transition={SPRING.pop}>
            <Icon name={reaction} size={28} />
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
