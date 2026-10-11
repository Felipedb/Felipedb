// CharacterStage (IDENTITY_V3, personagem como ator): o busto recortado chars/v2/<key>/bust.webp GRANDE, sem moldura nem
// círculo, encostado numa elipse de sombra, respirando devagar (scale 1 a 1.02 em 3 s) e reagindo ao feedback.
// Personagens de chars/v2/fallback.json (arte em outro estilo ou recorte ruim) e os sem busto usam o retrato redondo
// (JPG em círculo com anel na cor do capítulo). Nunca a legenda com o nome.
// Altura do busto por variante (px): side (lição, ao lado do balão) 150 · center (fala) 220 · result 200 · trail 120 ·
//   header (cabeçalhos, estados vazios) 96 · peek (interstício, entra pela direita) 180 · interstitial 180.
//   As dimensões vêm só da variante: width/height em `style` são ignorados (compatibilidade com o palco antigo).
// Props:
//   ch        personagem { key, name, img, emoji } · variant (acima) · size: altura do busto em px (sobrepõe a variante)
//   pose      "neutral" | "happy" | "sad" (sem arte de pose: vira a reação do corpo)
//   state     "idle" (respiração) | "happy" (pulinho y -8 e rotate 3) | "sad" (inclina e dessatura) | "celebrate" (entra com SPRING.bounce)
//   talking   boolean ou "auto" (useTalking(ch.key)): balanço leve enquanto a voz toca
//   reaction  "reaction-happy" | "reaction-sad" | null (badge 28 px no canto) · glow: força o --glow-gold atrás (padrão no result)
// Exemplo: <CharacterStage ch={ch} variant="side" state={ok ? "happy" : "idle"} reaction={reaction} talking="auto" />
// useStageArt(ch): true quando o personagem tem busto grande utilizável (não está em fallback.json e tem img).
import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { SPRING } from "../../core/motion.js";
import Icon from "../Icon.jsx";
import { useTalking, charAsset, usesBust } from "./Avatar.jsx";
import Illo from "./Illo.jsx";

// Altura do busto por variante; o palco tem a largura do busto e +10% de altura para a sombra e o pulinho
const BUST = { side: 150, center: 220, result: 200, trail: 120, header: 96, peek: 180, interstitial: 180 };

export { usesBust };

// O corte reto do busto some num esfumado curto sobre a elipse de sombra (sem cara de foto recortada)
const BASE_FADE = "linear-gradient(to bottom, #000 0%, #000 90%, transparent 100%)";
export const useStageArt = (ch) => usesBust(ch);

// Entrada do "peek" (x 120 -> 0, rotate -10 -> -4) com mola própria, separada da respiração em loop
const PEEK_SPRING = { type: "spring", stiffness: 220, damping: 14 };

function bodyMotion({ reduce, state, talking }) {
  if (reduce) return { anim: { y: 0, x: 0, scale: 1, rotate: 0, filter: state === "sad" ? "saturate(.7)" : "saturate(1)" }, trans: { duration: 0.2 } };
  if (state === "happy") return { anim: { y: [0, -8, 0, -3, 0], rotate: [0, 3, 0], scale: 1, filter: "saturate(1)" }, trans: { duration: 0.55, ease: "easeOut" } };
  if (state === "sad") return { anim: { rotate: -4, x: [0, -3, 3, -2, 0], y: 2, scale: 0.98, filter: "saturate(.6)" }, trans: { duration: 0.45, ease: "easeOut" } };
  if (state === "celebrate") return { anim: { y: 0, rotate: 0, scale: 1, filter: "saturate(1)" }, trans: SPRING.bounce };
  if (talking) return { anim: { y: [0, -3, 0], rotate: [0, 1.2, 0], scale: [1, 1.015, 1], filter: "saturate(1)" }, trans: { duration: 0.5, repeat: Infinity, ease: "easeInOut" } };
  return { anim: { scale: [1, 1.02, 1], y: 0, rotate: 0, filter: "saturate(1)" }, trans: { duration: 3, repeat: Infinity, ease: "easeInOut" } };
}

export default function CharacterStage({ ch, variant = "side", size, pose = "neutral", state = "idle", talking = false, reaction = null, glow, className = "", style, ...rest }) {
  const reduce = useReducedMotion();
  const [failed, setFailed] = useState(null); // chave cujo busto falhou ao carregar
  const H = size || BUST[variant] || BUST.side;
  const auto = useTalking(talking === "auto" ? (ch && ch.key) : "__none__");
  const isTalking = talking === "auto" ? auto : !!talking;
  const bust = usesBust(ch) && failed !== ch.key;
  // A pose (sem arte própria) vira o estado do corpo quando o estado é neutro
  const effState = state !== "idle" ? state : pose === "sad" ? "sad" : "idle";
  const showGlow = glow != null ? glow : variant === "result";
  const { anim, trans } = bodyMotion({ reduce, state: effState, talking: isTalking });

  // Retrato redondo (reserva): círculo de até 120 px com anel de 4 px na cor do capítulo
  const circle = Math.min(120, Math.round(H * 0.8));
  const W = bust ? H : Math.max(circle + 8, Math.round(H * 0.8));
  const stageH = bust ? Math.round(H * 1.06) : circle + 14;
  const shadowW = Math.round((bust ? H : circle) * 0.68);
  const shadowH = Math.max(8, Math.round((bust ? H : circle) * 0.09));

  const initial = state === "celebrate" && !reduce ? { y: -16, rotate: -8, scale: 0.9 } : (variant === "peek" || variant === "interstitial") && !reduce ? { x: 120, rotate: -10 } : false;
  const peekAnim = (variant === "peek" || variant === "interstitial") && !reduce ? { x: 0, rotate: effState === "idle" ? -4 : anim.rotate } : {};
  const { width: _w, height: _h, ...restStyle } = style || {};

  return (
    <div className={`relative shrink-0 ${className}`} style={{ ...restStyle, width: W, height: stageH }} data-char-stage={ch ? ch.key : undefined} aria-hidden={ch ? undefined : true} {...rest}>
      {showGlow && !reduce && (
        <motion.span aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ width: H * 1.6, height: H * 1.6, background: "var(--glow-gold)" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} />
      )}
      {/* Elipse de sombra sob a base: o busto pisa nela */}
      <span aria-hidden className="absolute left-1/2 -translate-x-1/2 rounded-[50%] bg-line opacity-80"
        style={{ width: shadowW, height: shadowH, bottom: 0 }} />
      <motion.div className="absolute inset-x-0 flex items-end justify-center" style={{ transformOrigin: "50% 100%", bottom: Math.round(shadowH / 2) }}
        initial={initial} animate={{ ...anim, ...peekAnim }}
        transition={variant === "peek" || variant === "interstitial" ? { ...trans, x: PEEK_SPRING, rotate: PEEK_SPRING } : trans}>
        {bust ? (
          <img src={charAsset(ch, "bust.webp")} alt={ch.name} draggable="false" decoding="async" onError={() => setFailed(ch.key)}
            className="pointer-events-none block select-none object-contain object-bottom" style={{ width: H, height: H, WebkitMaskImage: BASE_FADE, maskImage: BASE_FADE }} />
        ) : ch && ch.img ? (
          <span className="flex items-center justify-center overflow-hidden rounded-full bg-unit-soft"
            style={{ width: circle, height: circle, boxShadow: "0 0 0 4px var(--unit-color, #58cc02), 0 6px 0 4px var(--unit-shadow, #46a302)" }}>
            <img src={ch.img} alt={ch.name} draggable="false" decoding="async" className="h-full w-full object-cover" style={{ objectPosition: "center 22%" }} />
          </span>
        ) : ch && ch.emoji ? (
          <Illo e={ch.emoji} size={Math.min(120, Math.round(H * 0.7))} alt={ch.name} />
        ) : (
          <span className="flex items-center justify-center rounded-full bg-line" style={{ width: circle, height: circle }}>
            <Icon name="avatar" size={Math.round(circle * 0.6)} />
          </span>
        )}
      </motion.div>
      <AnimatePresence>
        {reaction && (
          <motion.span key={reaction} className="absolute right-0 top-1" initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, opacity: 0, transition: { duration: 0.12 } }} transition={SPRING.pop}>
            <Icon name={reaction} size={28} />
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
