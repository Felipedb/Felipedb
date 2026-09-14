import { useRef, useState } from "react";
import { speak, clipDuration } from "../../core/audio.js";
import Icon from "../Icon.jsx";

export default function AudioButton({ text, slow = false, big = false, char }) {
  const [playing, setPlaying] = useState(false);
  const timer = useRef(0);
  const onClick = () => {
    speak(text, { slow, char });
    clearTimeout(timer.current);
    setPlaying(true);
    const base = clipDuration(text, char && char.key) || Math.min(4, 0.5 + String(text).length * 0.055);
    timer.current = setTimeout(() => setPlaying(false), (base / (slow ? 0.75 : 1)) * 1000);
  };
  return (
    <button onClick={onClick} title={slow ? "Ouvir devagar" : "Ouvir"} aria-label={slow ? "Ouvir devagar" : "Ouvir"}
      className={`inline-flex shrink-0 items-center justify-center rounded-xl border-2 border-b-4 border-sky-line bg-sky-soft text-sky-fg transition-transform active:translate-y-0.5 ${big ? "h-14 w-14 text-2xl" : "h-10 w-10"} ${playing ? "animate-pulse" : ""}`}>
      <Icon name={slow ? "turtle" : "speaker"} />
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
