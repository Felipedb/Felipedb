import { state } from "../core/store.js";
import { flatLessons } from "../core/content.js";
import { startLesson, startQuickPractice } from "../core/session.js";
import { motion } from "motion/react";
import { SPRING } from "../core/motion.js";

export default function HeartsModal({ onClose }) {
  const practice = () => {
    onClose();
    const doneIds = flatLessons().filter((l) => state.completed[l.id]).map((l) => l.id);
    if (doneIds.length) startLesson(doneIds[doneIds.length - 1]); else startQuickPractice("review");
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-6" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="card w-full max-w-sm p-6 text-center" onClick={(e) => e.stopPropagation()}>
        <div className="text-5xl">💔</div>
        <h3 className="font-display mt-2 text-xl font-extrabold">Você ficou sem corações</h3>
        <p className="mt-1 text-ink-soft">Pratique uma etapa já concluída para recuperar 1 coração, ou volte amanhã.</p>
        <motion.button onClick={practice} whileTap={{ y: 4, boxShadow: "0 0 0 var(--btn-shadow)" }} transition={SPRING.snap}
          className="btn-3d mt-4 w-full bg-primary px-4 py-3 text-primary-text" style={{ "--btn-shadow": "var(--color-primary-shadow)" }}>Praticar e recuperar 1 coração</motion.button>
        <button onClick={onClose} className="mt-2 w-full rounded-xl px-4 py-3 font-bold text-ink-soft hover:bg-hover">Fechar</button>
      </div>
    </div>
  );
}
