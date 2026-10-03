// NodePopover (VISUAL_SPEC 5.4): ancorado 12 px abaixo do nó (acima quando faltam menos de 220 px até a tab bar), largura 358
// no centro da coluna, raio 16, padding 16, seta de 12 px apontando para o nó; role="dialog", foco no botão.
// Variante unit: fundo --unit-color, texto --unit-ink, título 19/800, subtítulo 15/500 a 85%, estrelas quando concluída e
// Button3D on-unit 48 com data-popover-start. Variante locked: fundo --color-line, texto --color-ink-soft, sem botão.
// Entra scale .9 -> 1 + fade (SPRING.pop), sai em 120 ms; fecha ao tocar fora, em Escape ou ao rolar 40 px; um aberto por vez.
// Renderizado em portal (document.body) para ficar acima das seções e dos cabeçalhos sticky; recebe as variáveis do capítulo em `vars`.
// Props: open ({ anchor, variant, title, subtitle, stars, cta, onStart, vars }) ou null, onClose
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { SPRING } from "../../core/motion.js";
import Icon from "../Icon.jsx";
import { Button3D } from "../ui/index.js";

const TABBAR = 58 + 24;

function Panel({ data, onClose }) {
  const ref = useRef(null);
  const [pos, setPos] = useState(null);

  const place = () => {
    const a = data.anchor;
    if (!a || !a.isConnected) { onClose(); return; }
    const r = a.getBoundingClientRect();
    const vw = window.innerWidth, vh = window.innerHeight;
    const col = a.closest("[data-trail-col]");
    const cr = col ? col.getBoundingClientRect() : { left: 16, width: vw - 32 };
    const w = Math.min(358, vw - 32, Math.max(240, cr.width));
    const left = Math.max(16, Math.min(vw - 16 - w, cr.left + (cr.width - w) / 2));
    const h = ref.current ? ref.current.offsetHeight : 180;
    const below = r.bottom + 12 + h + TABBAR <= vh || r.top - 12 - h < 8;
    const top = below ? r.bottom + 12 : r.top - 12 - h;
    setPos({ left, top, w, below, arrowX: Math.max(20, Math.min(w - 20, r.left + r.width / 2 - left)) });
  };

  useLayoutEffect(() => { place(); }, [data]); // eslint-disable-line
  useEffect(() => {
    const y0 = window.scrollY;
    const onScroll = () => { if (Math.abs(window.scrollY - y0) > 40) onClose(); else place(); };
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    const onDown = (e) => {
      const el = ref.current;
      if (!el || el.contains(e.target)) return;
      if (data.anchor && data.anchor.contains && data.anchor.contains(e.target)) return;
      onClose();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", place);
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown, true);
    const t = setTimeout(() => {
      const el = ref.current;
      if (!el) return;
      const b = el.querySelector("[data-popover-start]");
      (b || el).focus({ preventScroll: true });
    }, 80);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", place);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown, true);
      clearTimeout(t);
    };
  }, [data]); // eslint-disable-line

  const locked = data.variant === "locked";
  const p = pos || { left: 16, top: -9999, w: 358, below: true, arrowX: 179 };
  return (
    <motion.div ref={ref} role="dialog" aria-modal="false" aria-label={data.title} tabIndex={-1}
      className={`fixed z-45 rounded-lg p-4 outline-none ${locked ? "bg-line text-ink-soft" : "bg-unit text-unit-ink"}`}
      style={{ left: p.left, top: p.top, width: p.w, visibility: pos ? "visible" : "hidden", transformOrigin: `${p.arrowX}px ${p.below ? "0px" : "100%"}`, ...(data.vars || {}) }}
      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.12 } }} transition={SPRING.pop}>
      <span aria-hidden className={`absolute h-[18px] w-[18px] rotate-45 ${locked ? "bg-line" : "bg-unit"} ${p.below ? "-top-[8px]" : "-bottom-[8px]"}`} style={{ left: p.arrowX - 9 }} />
      <h3 className="relative text-heading">{data.title}</h3>
      {data.subtitle && <p className={`relative mt-1 text-secondary ${locked ? "" : "opacity-85"}`}>{data.subtitle}</p>}
      {data.stars != null && !locked && (
        <div className="relative mt-2 flex gap-1" role="img" aria-label={`${data.stars} de 3 estrelas`}>
          {[0, 1, 2].map((i) => <Icon key={i} name={i < data.stars ? "star" : "star-empty"} size={20} />)}
        </div>
      )}
      {!locked && data.cta && (
        <Button3D variant="on-unit" block className="relative mt-4" data-popover-start onClick={data.onStart}>{data.cta}</Button3D>
      )}
    </motion.div>
  );
}

export default function NodePopover({ open, onClose }) {
  if (typeof document === "undefined") return null;
  return createPortal(
    <AnimatePresence>{open && <Panel key={open.key || "popover"} data={open} onClose={onClose} />}</AnimatePresence>,
    document.body
  );
}
