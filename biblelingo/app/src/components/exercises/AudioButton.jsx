import { useRef, useState } from "react";
import { speak, clipDuration } from "../../core/audio.js";
import Icon from "../Icon.jsx";

// Duração estimada da fala, para animar o estado "tocando"
function usePlaying(text, char, slow = false) {
  const [playing, setPlaying] = useState(false);
  const timer = useRef(0);
  const start = () => {
    clearTimeout(timer.current);
    setPlaying(true);
    const base = clipDuration(text, char && char.key) || Math.min(4, 0.5 + String(text).length * 0.055);
    timer.current = setTimeout(() => setPlaying(false), (base / (slow ? 0.75 : 1)) * 1000);
  };
  return [playing, start];
}

export default function AudioButton({ text, slow = false, big = false, char }) {
  const [playing, start] = usePlaying(text, char, slow);
  const onClick = () => { speak(text, { slow, char }); start(); };
  return (
    <button onClick={onClick} title={slow ? "Ouvir devagar" : "Ouvir"} aria-label={slow ? "Ouvir devagar" : "Ouvir"}
      className={`inline-flex shrink-0 items-center justify-center rounded-xl border-2 border-b-4 border-sky-line bg-sky-soft text-sky-fg transition-transform active:translate-y-0.5 ${big ? "h-14 w-14 text-2xl" : "h-10 w-10"} ${playing ? "animate-pulse" : ""}`}>
      <Icon name={slow ? "turtle" : "speaker"} />
    </button>
  );
}

// Alturas fixas das barras (padrão orgânico, como no alvo visual)
const BARS = [8, 13, 18, 24, 15, 21, 28, 17, 23, 12, 19, 26, 14, 9];

// Balão de escuta: alto-falante + onda sonora que dança enquanto toca
export function WaveButton({ text, char }) {
  const [playing, start] = usePlaying(text, char);
  const onClick = () => { speak(text, { char }); start(); };
  return (
    <button onClick={onClick} aria-label="Ouvir" title="Ouvir"
      className={`flex min-h-16 w-full items-center gap-3 py-1 text-sky ${playing ? "wave-playing" : ""}`}>
      <Icon name="speaker" className="shrink-0 text-4xl" />
      <span className="flex h-9 flex-1 items-center gap-[3px]">
        {BARS.map((h, i) => (
          <span key={i} className="wave-bar w-[4px] bg-sky" style={{ height: h, animationDelay: `${i * 60}ms` }} />
        ))}
      </span>
    </button>
  );
}

// "Devagar": fala lenta, alinhado sob o balão como no alvo visual
export function SlowButton({ text, char }) {
  const [playing, start] = usePlaying(text, char, true);
  const onClick = () => { speak(text, { slow: true, char }); start(); };
  return (
    <button onClick={onClick} aria-label="Ouvir devagar"
      className={`text-sm font-extrabold uppercase tracking-[0.14em] text-sky ${playing ? "animate-pulse" : ""}`}>
      Devagar
    </button>
  );
}

export function AudioPair({ text, char }) {
  return (
    <span className="inline-flex items-center gap-2">
      <AudioButton text={text} big char={char} />
      <AudioButton text={text} slow char={char} />
    </span>
  );
}
