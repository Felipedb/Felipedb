// "word-card" (VISUAL_SPEC 6.3 #20): card de palavra nova, exercício silencioso (silent: true) que o montador pode
// inserir antes do primeiro teste de cada palavra. Badge roxo "PALAVRA NOVA" (a casca da lição o mostra por ex.newWord;
// aqui só quando o montador não marcar), card 358 raio 16 com a ilustração 120 (emoji do vocabulário em span.emoji até
// haver arte), EN 32/800, PT 18/500, linha pontilhada, frase de exemplo falável + tradução; abaixo do card o alto-falante
// boxed 64 + tartaruga 44 centralizados (gap 16). O áudio toca ao entrar; o CTA "CONTINUAR" fica no rodapé da lição.
// Formato do exercício: { type: "word-card", silent: true, word: { en, pt, icon }, sentence?: { en, pt } }
import { motion } from "motion/react";
import { SPRING } from "../../core/motion.js";
import AudioButton from "../ui/AudioButton.jsx";
import Badge from "../ui/Badge.jsx";
import Card from "../ui/Card.jsx";
import { useExerciseChar } from "./CharacterBubble.jsx";
import { Sayable } from "./Sayable.jsx";
import { useAutoplay } from "./shared.jsx";

export default function WordCard({ ex }) {
  const ch = useExerciseChar();
  const w = ex.word || {};
  const s = ex.sentence || null;
  useAutoplay(w.en, ch);

  return (
    <div>
      {!ex.newWord && <div className="mb-4"><Badge kind="new-word" /></div>}
      <motion.div initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={SPRING.settle}>
        <Card padding="lg" className="flex flex-col items-center text-center">
          <span className="flex h-[120px] w-[120px] items-center justify-center" aria-hidden>
            {w.image
              ? <img src={w.image} alt="" className="h-[120px] w-[120px] object-contain" draggable="false" />
              : <span className="emoji text-[96px] leading-none">{w.icon || ""}</span>}
          </span>
          <p className="mt-4 text-display-lg font-extrabold text-ink">{w.en}</p>
          <p className="mt-1 text-[18px] font-medium leading-6 text-ink-soft">{w.pt}</p>
          {s && (
            <>
              <span aria-hidden className="my-5 w-full border-t-2 border-dashed border-line" />
              <p className="text-sentence text-ink"><Sayable text={s.en} char={ch} /></p>
              {s.pt && <p className="mt-1.5 text-secondary text-ink-soft">{s.pt}</p>}
            </>
          )}
        </Card>
      </motion.div>
      <div className="mt-6 flex items-center justify-center gap-4">
        <AudioButton variant="boxed" text={w.en} char={ch} />
        <AudioButton variant="slow" text={w.en} char={ch} />
      </div>
    </div>
  );
}
