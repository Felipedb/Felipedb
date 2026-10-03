// Sheet, Modal e ConfirmSheet (VISUAL_SPEC 5.23). Os pais devem montar sempre (open controla), para a saída animar.
// Sheet (mobile): overlay --color-overlay (fade 150 ms); painel embaixo, raio superior 24, fundo --color-page, alça 36x4,
//   padding 24 16 calc(16px + safe area), max-height 92dvh com rolagem; entra y 48 -> 0 (SPRING.sheet), sai y 32 + fade 160 ms;
//   drag="y" fecha além de 120 px ou com velocidade > 600; Escape fecha; role="dialog" aria-modal; foco no painel; CTA fixo no rodapé.
//   Em lg (>= 1024) vira Modal centralizado 480, raio 24, scale .88 -> 1 + y 24 -> 0 (SPRING 320/24), saída 120 ms.
// Props: open, onClose, title (text-title), children, footer (slot fixo), label (aria-label), closeButton (X 36 no canto), className
// ConfirmSheet: title, text, confirmLabel, cancelLabel, onConfirm, onCancel, danger (CTA vermelho).
// Exemplo: <Sheet open={open} onClose={close} title="Você ficou sem corações" footer={<Button3D block>...</Button3D>}>...</Sheet>
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SPRING } from "../../core/motion.js";
import { sfx } from "../../core/sfx.js";
import { haptic } from "../../core/haptics.js";
import Icon from "../Icon.jsx";
import Button3D from "./Button3D.jsx";

function useLarge() {
  const [lg, setLg] = useState(() => typeof matchMedia === "function" && matchMedia("(min-width: 1024px)").matches);
  useEffect(() => {
    if (typeof matchMedia !== "function") return;
    const mq = matchMedia("(min-width: 1024px)");
    const fn = () => setLg(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);
  return lg;
}

function useDialog(open, onClose, panelRef) {
  useEffect(() => {
    if (!open) return;
    sfx("tap");
    haptic("tap");
    const prevFocus = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") { e.stopPropagation(); onClose && onClose(); }
      if (e.key === "Tab" && panelRef.current) {
        const f = panelRef.current.querySelectorAll('button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])');
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    const t = setTimeout(() => { const el = panelRef.current; if (el) { const b = el.querySelector("[data-autofocus], button"); (b || el).focus({ preventScroll: true }); } }, 60);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      clearTimeout(t);
      if (prevFocus && prevFocus.focus) prevFocus.focus({ preventScroll: true });
    };
  }, [open]); // eslint-disable-line
}

export default function Sheet({ open, onClose, title, children, footer, label, closeButton = false, className = "" }) {
  const lg = useLarge();
  const panelRef = useRef(null);
  useDialog(open, onClose, panelRef);
  const Panel = lg ? Modal : BottomSheet;
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-60 flex items-end justify-center lg:items-center" role="presentation">
          <motion.div className="absolute inset-0 bg-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.15 } }} transition={{ duration: 0.15 }} onClick={onClose} />
          <Panel panelRef={panelRef} onClose={onClose} title={title} footer={footer} label={label} closeButton={closeButton} className={className}>{children}</Panel>
        </div>
      )}
    </AnimatePresence>
  );
}

function Header({ title, closeButton, onClose }) {
  if (!title && !closeButton) return null;
  return (
    <div className="mb-4 flex items-start gap-3">
      {title && <h2 className="min-w-0 flex-1 text-title text-ink" style={{ textWrap: "balance" }}>{title}</h2>}
      {closeButton && (
        <button type="button" onClick={onClose} aria-label="Fechar" className="-mr-2 -mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/40 text-white">
          <Icon name="close" size={20} />
        </button>
      )}
    </div>
  );
}

function BottomSheet({ panelRef, onClose, title, footer, label, closeButton, className, children }) {
  return (
    <motion.div ref={panelRef} role="dialog" aria-modal="true" aria-label={label || title} tabIndex={-1}
      className={`relative flex max-h-[92dvh] w-full max-w-[600px] flex-col rounded-t-xl bg-page pt-2 outline-none ${className}`}
      initial={{ y: 48, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 32, opacity: 0, transition: { duration: 0.16 } }} transition={SPRING.sheet}
      drag="y" dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0, bottom: 0.6 }}
      onDragEnd={(e, info) => { if (info.offset.y > 120 || info.velocity.y > 600) onClose && onClose(); }}>
      <span aria-hidden className="mx-auto mb-4 block h-1 w-9 rounded-[2px] bg-line dark:bg-disabled" />
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-2">
        <Header title={title} closeButton={closeButton} onClose={onClose} />
        {children}
        {!footer && <div className="h-[calc(16px+env(safe-area-inset-bottom))]" />}
      </div>
      {footer && <div className="shrink-0 border-t-2 border-line px-4 pb-[calc(16px+env(safe-area-inset-bottom))] pt-4">{footer}</div>}
    </motion.div>
  );
}

export function Modal({ panelRef, onClose, title, footer, label, closeButton, className, children }) {
  return (
    <motion.div ref={panelRef} role="dialog" aria-modal="true" aria-label={label || title} tabIndex={-1}
      className={`relative flex max-h-[88dvh] w-[480px] max-w-[calc(100vw-32px)] flex-col rounded-xl bg-page outline-none ${className}`}
      initial={{ scale: 0.88, y: 24, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, opacity: 0, transition: { duration: 0.12 } }}
      transition={{ type: "spring", stiffness: 320, damping: 24 }}>
      <div className="min-h-0 flex-1 overflow-y-auto p-6">
        <Header title={title} closeButton={closeButton} onClose={onClose} />
        {children}
      </div>
      {footer && <div className="shrink-0 border-t-2 border-line p-6 pt-4">{footer}</div>}
    </motion.div>
  );
}

export function ConfirmSheet({ open, title, text, confirmLabel = "Confirmar", cancelLabel = "Cancelar", onConfirm, onCancel, danger = false }) {
  return (
    <Sheet open={open} onClose={onCancel} title={title}
      footer={
        <div className="flex flex-col gap-2">
          <Button3D variant={danger ? "danger" : "primary"} block onClick={onConfirm} data-autofocus>{confirmLabel}</Button3D>
          <Button3D variant="neutral" block onClick={onCancel}>{cancelLabel}</Button3D>
        </div>
      }>
      {text && <p className="text-body text-ink-soft">{text}</p>}
    </Sheet>
  );
}
