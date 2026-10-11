// Bubble (VISUAL_SPEC 5.12): balão de fala que abraça o conteúdo (width fit-content), borda 2 px --color-line,
// raio 16, padding 14x16, rabinho de 12 px. Entra com scale .9 -> 1 a partir do rabinho (SPRING 400/26).
// Props:
//   variant  "side" (rabinho à esquerda a 60%: ao lado do personagem) | "bottom" (rabinho centralizado embaixo: fala, interstício)
//            | "right" (rabinho à direita) | "hero" (cena: fundo --color-green-soft, canto inferior direito 6)
//            | "other" (cena: fundo --color-page, canto inferior esquerdo 6) | "wave" (speaker + 18 barras + DEVAGAR)
//   audio    texto a falar: mostra AudioButton inline alinhado à primeira linha, gap 10 · char: voz · slow: mostra "DEVAGAR" abaixo
//   full     ocupa 100% (sem personagem ou na onda) · maxWidth (padrão "60%" ao lado do personagem)
//   children conteúdo (Sayable/HintedText em text-sentence 19/500)
// Exemplo: <Bubble audio={ex.sentence.en} char={ch}><Sayable text={ex.sentence.en} /></Bubble>
//          <Bubble variant="wave" audio={ex.sentence.en} slow />
import { motion } from "motion/react";
import AudioButton, { SlowLink } from "./AudioButton.jsx";

const ORIGIN = { side: "0% 60%", bottom: "50% 100%", right: "100% 60%", hero: "100% 100%", other: "0% 100%", wave: "0% 60%" };

export default function Bubble({ variant = "side", audio, char, slow = false, full = false, maxWidth, className = "", children, ...rest }) {
  const spring = { type: "spring", stiffness: 400, damping: 26 };
  const base = variant === "hero"
    ? "relative rounded-lg rounded-br-[6px] border-2 border-green-line bg-green-soft px-4 py-3.5"
    : variant === "other"
      ? "relative rounded-lg rounded-bl-[6px] border-2 border-line bg-page px-4 py-3.5"
      : `bubble ${variant === "bottom" ? "bubble-bottom" : variant === "right" ? "bubble-right" : ""}`;
  const style = { transformOrigin: ORIGIN[variant] || ORIGIN.side, ...(full ? { width: "100%" } : maxWidth ? { maxWidth } : {}) };

  if (variant === "wave") {
    return (
      <div className={`flex flex-col items-end ${full ? "w-full" : ""} ${className}`}>
        <motion.div className="bubble" style={{ ...style, width: full ? "100%" : undefined }} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={spring} {...rest}>
          <AudioButton variant="wave" text={audio} char={char} />
        </motion.div>
        {slow && audio && <SlowLink text={audio} char={char} className="mt-3 mr-1" />}
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${variant === "right" || variant === "hero" ? "items-end" : "items-start"} ${full ? "w-full" : "min-w-0"} ${className}`}>
      <motion.div className={base} style={style} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={spring} {...rest}>
        <div className="flex items-start gap-2.5 text-sentence text-ink">
          {audio && <AudioButton text={audio} char={char} className="-ml-1 mt-[-1px]" />}
          <div className="min-w-0">{children}</div>
        </div>
      </motion.div>
      {slow && audio && <SlowLink text={audio} char={char} className="mt-3 mr-1 self-end" />}
    </div>
  );
}
