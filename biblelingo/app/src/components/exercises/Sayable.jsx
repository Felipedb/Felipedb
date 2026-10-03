// Palavras clicáveis (toque para ouvir) e palavras com dica (VISUAL_SPEC 5.12 e 5.25): sublinhado pontilhado
// cinza no mesmo peso + tooltip com a tradução; a tooltip fala a palavra em inglês ao abrir.
import { speak } from "../../core/audio.js";
import { HINTS, allVocab } from "../../core/content.js";
import { normalize } from "../../core/util.js";
import HintTooltip from "../ui/HintTooltip.jsx";
import { cleanWord } from "./shared.jsx";

// Dicas en -> pt (inverso de HINTS), só para palavras soltas do vocabulário
let EN_HINTS = null;
function enHints() {
  if (EN_HINTS) return EN_HINTS;
  EN_HINTS = {};
  allVocab().forEach((v) => {
    const k = normalize(v.en);
    if (k && !k.includes(" ") && !EN_HINTS[k]) EN_HINTS[k] = v.pt;
  });
  return EN_HINTS;
}

const words = (text) => String(text == null ? "" : text).split(" ").filter(Boolean);

// Frase em inglês: cada palavra fala ao toque; com `hints`, as palavras do vocabulário mostram a tradução
export function Sayable({ text, char, hints = false, className = "" }) {
  const map = hints ? enHints() : null;
  const list = words(text);
  return (
    <span className={className}>
      {list.map((w, i) => {
        const clean = cleanWord(w);
        const hint = map ? map[normalize(clean)] : null;
        return (
          <span key={i}>
            {hint
              ? <HintTooltip word={w} hint={hint} onOpen={() => speak(clean, { char })} />
              : <button type="button" className="rounded-sm" onClick={() => speak(clean, { char })}>{w}</button>}
            {i < list.length - 1 ? " " : ""}
          </span>
        );
      })}
    </span>
  );
}

// Frase em português com dicas pt -> en (banco de palavras): a tooltip mostra e fala a palavra em inglês
export function HintedText({ pt, char, className = "" }) {
  const list = words(pt);
  return (
    <span className={className}>
      {list.map((w, i) => {
        const hint = HINTS[normalize(cleanWord(w))];
        return (
          <span key={i}>
            {hint ? <HintTooltip word={w} hint={hint} onOpen={() => speak(hint, { char })} /> : <span>{w}</span>}
            {i < list.length - 1 ? " " : ""}
          </span>
        );
      })}
    </span>
  );
}
