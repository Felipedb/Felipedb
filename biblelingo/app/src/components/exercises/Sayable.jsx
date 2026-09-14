// Palavras clicáveis: toque para ouvir (e dica pt->en nas frases em português)
import { speak } from "../../core/audio.js";
import { HINTS } from "../../core/content.js";
import { normalize } from "../../core/util.js";
import { useState } from "react";

export function Sayable({ text, className = "" }) {
  return (
    <span className={className}>
      {String(text).split(" ").map((w, i) => (
        <span key={i}>
          <button type="button" className="cursor-pointer rounded hover:bg-sky-soft" onClick={() => speak(w.replace(/[.,;:!?'"]/g, ""))}>{w}</button>{" "}
        </span>
      ))}
    </span>
  );
}

export function HintedText({ pt, className = "" }) {
  const [pop, setPop] = useState(null);
  return (
    <span className={className}>
      {pt.split(" ").map((w, i) => {
        const hint = HINTS[normalize(w)];
        return (
          <span key={i} className="relative">
            {hint ? (
              <button type="button"
                className="cursor-help border-b-2 border-dashed border-sky-line font-bold"
                onClick={() => { setPop(pop === i ? null : i); speak(hint); }}>
                {w}
                {pop === i && <span className="absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg bg-ink px-2 py-1 text-xs text-page">{hint}</span>}
              </button>
            ) : (
              <span>{w}</span>
            )}{" "}
          </span>
        );
      })}
    </span>
  );
}
