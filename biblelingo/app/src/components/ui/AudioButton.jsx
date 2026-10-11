// AudioButton (VISUAL_SPEC 5.16): nenhum som de interface ao tocar, só a fala.
// Props:
//   text, char, slow   o que falar (speak de core/audio.js), com que voz e se devagar (0,75x ou variante lenta)
//   variant  "inline" (32x32 sem caixa, glifo speaker 26 em --color-accent; arcos acendem em sequência enquanto toca)
//            | "boxed" (64x64 raio 16, fundo --color-accent, sombra 0 4px 0 #1899d6, glifo 32; só card de palavra nova, guia e versículo)
//            | "slow" (44x44 raio 12, fundo #ffc800, sombra #e5a600, tartaruga 24 em #5b4400)
//            | "wave" (speaker 26 + 18 barras dançando; aria-label "Ouvir")
//   onPlay   callback ao tocar · className
// Exemplo: <AudioButton text={ex.word.en} />   <AudioButton variant="boxed" text={w.en} char={ch} />
// usePlaying(text, char, slow) -> [playing, start]: estado "tocando" pela duração real do clipe (clipDuration).
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { speak, clipDuration } from "../../core/audio.js";
import { SPRING } from "../../core/motion.js";
import Icon from "../Icon.jsx";

export function usePlaying(text, char, slow = false) {
  const [playing, setPlaying] = useState(false);
  const timer = useRef(0);
  useEffect(() => () => clearTimeout(timer.current), []);
  const start = () => {
    clearTimeout(timer.current);
    setPlaying(true);
    const base = clipDuration(text, char && char.key, slow) || Math.min(4, 0.5 + String(text).length * 0.055) / (slow ? 0.75 : 1);
    timer.current = setTimeout(() => setPlaying(false), base * 1000);
  };
  return [playing, start];
}

// Alturas das 18 barras (6 a 28), padrão orgânico como na referência 568c98d4
export const WAVE_BARS = [6, 10, 16, 22, 14, 20, 28, 18, 24, 12, 19, 26, 15, 9, 21, 13, 17, 8];

export function WaveBars({ playing = false, className = "" }) {
  return (
    <span className={`flex h-8 items-center gap-[3px] text-accent ${playing ? "wave-playing" : ""} ${className}`} aria-hidden="true">
      {WAVE_BARS.map((h, i) => (
        <span key={i} className="wave-bar w-1 rounded-[2px] bg-current" style={{ height: h, animationDelay: `${i * 50}ms` }} />
      ))}
    </span>
  );
}

export default function AudioButton({ text, char, slow = false, variant = "inline", onPlay, className = "", ...rest }) {
  const [playing, start] = usePlaying(text, char, slow || variant === "slow");
  const play = () => { speak(text, { slow: slow || variant === "slow", char }); start(); onPlay && onPlay(); };
  const label = slow || variant === "slow" ? "Ouvir devagar" : "Ouvir";

  if (variant === "boxed") {
    return (
      <motion.button type="button" onClick={play} aria-label={label} className={`inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-text ${playing ? "speaker-playing" : ""} ${className}`}
        style={{ boxShadow: "0 4px 0 var(--color-accent-shadow)" }} whileTap={{ y: 4, boxShadow: "0 0 0 var(--color-accent-shadow)" }} transition={SPRING.snap} {...rest}>
        <Icon name="speaker" size={32} tone="mono" />
      </motion.button>
    );
  }
  if (variant === "slow") {
    return (
      <motion.button type="button" onClick={play} aria-label={label} className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-yellow ${className}`}
        style={{ boxShadow: "0 4px 0 #e5a600" }} whileTap={{ y: 4, boxShadow: "0 0 0 #e5a600" }} transition={SPRING.snap} {...rest}>
        <Icon name="turtle" size={24} tone="#5b4400" />
      </motion.button>
    );
  }
  if (variant === "wave") {
    return (
      <button type="button" onClick={play} aria-label="Ouvir" className={`flex min-h-10 items-center gap-3 text-accent ${playing ? "speaker-playing" : ""} ${className}`} {...rest}>
        <Icon name="speaker" size={26} />
        <WaveBars playing={playing} />
      </button>
    );
  }
  return (
    <motion.button type="button" onClick={play} aria-label={label} className={`inline-flex h-8 w-8 shrink-0 items-center justify-center text-accent ${playing ? "speaker-playing" : ""} ${className}`}
      whileTap={{ scale: 0.9 }} transition={SPRING.snap} {...rest}>
      <Icon name="speaker" size={26} />
    </motion.button>
  );
}

// "DEVAGAR" como texto (balões): caption 13/800 em --color-blue-text, toca a 0,75x
export function SlowLink({ text, char, className = "" }) {
  const [playing, start] = usePlaying(text, char, true);
  return (
    <button type="button" onClick={() => { speak(text, { slow: true, char }); start(); }} aria-label="Ouvir devagar"
      className={`text-caption uppercase tracking-[.8px] text-blue-text ${playing ? "opacity-70" : ""} ${className}`}>
      Devagar
    </button>
  );
}
