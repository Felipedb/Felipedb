// HeartsSheet (VISUAL_SPEC 6.11 e 11.9): Sheet com alça, coração partido SVG de 96 px (duas metades que se separam x ±6, rotate ±8),
// título 22/800 "Você ficou sem corações", cinco heart-empty de 28, e três ações em lista: praticar para recuperar 1 coração,
// esperar (contador até a meia-noite, quando os corações renovam em store.js) e "Não, obrigado". haptic("heart-lost-all") ao abrir.
// O pai deve manter o componente montado e controlar `open` para a saída animar (hoje o App monta sob condição; ver relatório).
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { state } from "../core/store.js";
import { flatLessons } from "../core/content.js";
import { startLesson, startQuickPractice } from "../core/session.js";
import { SPRING } from "../core/motion.js";
import { sfx } from "../core/sfx.js";
import { haptic } from "../core/haptics.js";
import { Sheet, Button3D } from "./ui/index.js";
import Icon from "./Icon.jsx";

// Tempo até a meia-noite local (HH:MM): os corações renovam na virada do dia
function untilMidnight() {
  const now = new Date();
  const mid = new Date(now); mid.setHours(24, 0, 0, 0);
  const s = Math.max(0, Math.floor((mid - now) / 1000));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function BrokenHeart({ size = 96 }) {
  const half = (side) => (
    <motion.span aria-hidden className="absolute inset-0" style={{ clipPath: side === "l" ? "inset(0 50% 0 0)" : "inset(0 0 0 50%)", transformOrigin: "50% 100%" }}
      initial={{ x: 0, rotate: 0 }} animate={{ x: side === "l" ? -6 : 6, rotate: side === "l" ? -8 : 8 }} transition={{ ...SPRING.pop, delay: 0.25 }}>
      <Icon name="heart-broken" size={size} />
    </motion.span>
  );
  return (
    <motion.span className="relative inline-block" style={{ width: size, height: size }} role="img" aria-label="Coração partido"
      initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={SPRING.pop}>
      {half("l")}{half("r")}
    </motion.span>
  );
}

export default function HeartsModal({ open = true, onClose }) {
  const [left, setLeft] = useState(untilMidnight);
  useEffect(() => {
    if (!open) return;
    haptic("heart-lost-all");
    sfx("heart-lost");
    const t = setInterval(() => setLeft(untilMidnight()), 1000);
    return () => clearInterval(t);
  }, [open]);

  const practice = () => {
    onClose && onClose();
    const doneIds = flatLessons().filter((l) => state.completed[l.id]).map((l) => l.id);
    if (doneIds.length) startLesson(doneIds[doneIds.length - 1]); else startQuickPractice("review");
  };

  return (
    <Sheet open={open} onClose={onClose} label="Você ficou sem corações" className="hearts-sheet"
      footer={
        <div className="flex flex-col gap-2.5">
          <Button3D variant="primary" block onClick={practice} data-autofocus className="h-auto! min-h-12 whitespace-normal! py-3 leading-5">
            Praticar para recuperar 1 coração
          </Button3D>
          <div className="flex min-h-10 items-center justify-center gap-2 text-secondary text-ink-soft">
            <Icon name="clock" size={20} />
            <span>Esperar: próximo coração em <b className="tabular-nums text-ink">{left}</b></span>
          </div>
          <Button3D variant="neutral" block onClick={onClose}>Não, obrigado</Button3D>
        </div>
      }>
      <div className="flex flex-col items-center pb-2 text-center">
        <BrokenHeart size={96} />
        <h2 className="mt-3 text-[22px] font-extrabold leading-7 text-ink" style={{ textWrap: "balance" }}>Você ficou sem corações</h2>
        <div className="mt-4 flex items-center gap-2" aria-label="0 de 5 corações">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ ...SPRING.pop, delay: 0.1 + i * 0.05 }}>
              <Icon name="heart-empty" size={28} />
            </motion.span>
          ))}
        </div>
        <p className="mt-4 max-w-[320px] text-secondary text-ink-soft">
          Pratique uma etapa já concluída para recuperar um coração, ou espere até amanhã.
        </p>
      </div>
    </Sheet>
  );
}
