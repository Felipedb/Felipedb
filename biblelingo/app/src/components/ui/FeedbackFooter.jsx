// FeedbackFooter (VISUAL_SPEC 5.19): rodapé fixo da lição. Sem feedback: fundo --color-page, slot de 36 px para o link
// ghost 24 px acima do CTA. Com feedback: fundo --color-green-soft / --color-red-soft (escuro --color-raised), sem borda nem
// sombra, padding 16, altura 158 (1 botão) ou 214 (2 botões) + safe area. Linha 1: check-circle / close-circle 26 + elogio
// text-title na cor + share e flag à direita. Linha 2: uma única frase text-sentence na mesma cor.
// Mede a própria altura com ResizeObserver e publica --footer-h no <html>; o contêiner do exercício usa
// style={{ paddingBottom: "calc(var(--footer-h) + 16px)" }}. Entrada y 28 -> 0 (SPRING.footer); erro com x [0,-4,4,0].
// Contratos (10.1): o CTA é o PRIMEIRO button.btn-3d dentro de <footer>; o secundário usa .btn-outline; texto do CTA em caixa normal.
// Props:
//   fb        null | { ok, praise, line, lineNode?, explain? } · line: tradução (acerto) ou frase correta (erro); lineNode sobrepõe line
//   cta       { label, onClick, disabled, loading }   (label "Verificar" | "Continuar" | "Entendi" em caixa normal; uppercase por CSS)
//   secondary { label, onClick, icon }  botão outline 8 px acima do CTA (EXPLIQUE MINHA RESPOSTA, PRATICAR PRONÚNCIA)
//   ghost     { label, onClick }        link ghost no slot de 36 px (NÃO POSSO OUVIR AGORA), só sem feedback
//   share     { text, pt } ou função   compartilha pela Web Share API; onFlag: reportar exercício
//   maxWidth  classe do contêiner interno (padrão "max-w-2xl") · children: conteúdo extra acima dos botões
// Exemplo: <FeedbackFooter fb={fb} cta={{ label: checked ? "Continuar" : "Verificar", onClick: check, disabled: !canCheck }} ghost={listen ? { label: "Não posso ouvir agora", onClick: skipListening } : null} />
import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SPRING } from "../../core/motion.js";
import Icon from "../Icon.jsx";
import Button3D from "./Button3D.jsx";

export function useFooterHeight(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const set = (h) => document.documentElement.style.setProperty("--footer-h", `${Math.ceil(h)}px`);
    set(el.getBoundingClientRect().height);
    const ro = new ResizeObserver(([e]) => set(e.contentRect.height + 32));
    ro.observe(el);
    return () => { ro.disconnect(); document.documentElement.style.removeProperty("--footer-h"); };
  }, []); // eslint-disable-line
}

async function doShare(share, fb) {
  try {
    const payload = typeof share === "function" ? null : share;
    if (typeof share === "function") return share(fb);
    if (navigator.share) await navigator.share({ title: "BíbliaLearn", text: [payload.text, payload.pt].filter(Boolean).join("\n") });
  } catch (e) { /* cancelado */ }
}

export default function FeedbackFooter({ fb = null, cta, secondary = null, ghost = null, share, onFlag, maxWidth = "max-w-2xl", className = "", children }) {
  const ref = useRef(null);
  useFooterHeight(ref);
  const ok = !!(fb && fb.ok);
  const tone = fb ? (ok ? "text-green-text" : "text-red-text") : "";
  const bg = fb ? (ok ? "bg-green-soft dark:bg-raised" : "bg-red-soft dark:bg-raised") : "bg-page";

  return (
    <footer ref={ref} className={`fixed inset-x-0 bottom-0 z-40 px-4 pb-[calc(16px+env(safe-area-inset-bottom))] pt-4 ${bg} ${className}`}>
      <div className={`mx-auto ${maxWidth}`}>
        <AnimatePresence initial={false}>
          {fb ? (
            <motion.div key="fb" className={`mb-4 ${tone}`}
              initial={{ y: 28, opacity: 0 }} animate={{ y: 0, opacity: 1, x: ok ? 0 : [0, -4, 4, 0] }}
              exit={{ y: 20, opacity: 0, transition: { duration: 0.15 } }} transition={{ ...SPRING.footer, x: { duration: 0.25 } }}>
              <div className="flex items-center gap-3">
                <motion.span className="shrink-0" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ ...SPRING.pop, delay: 0.06 }}>
                  <Icon name={ok ? "check-circle" : "close-circle"} size={26} />
                </motion.span>
                <motion.h2 className="min-w-0 flex-1 text-title" style={{ textWrap: "balance" }} initial={{ x: -8, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
                  {fb.praise || (ok ? "Muito bem!" : "Incorreto")}
                </motion.h2>
                <div className="flex shrink-0 items-center gap-1">
                  {share && (
                    <button type="button" aria-label="Compartilhar frase" onClick={() => doShare(share, fb)} className="flex h-11 w-11 items-center justify-center rounded-md hover:bg-black/5">
                      <Icon name="share" size={24} />
                    </button>
                  )}
                  {onFlag && (
                    <button type="button" aria-label="Reportar este exercício" onClick={onFlag} className="flex h-11 w-11 items-center justify-center rounded-md hover:bg-black/5">
                      <Icon name="flag" size={24} />
                    </button>
                  )}
                </div>
              </div>
              {(fb.lineNode || fb.line) && (
                <motion.p className="mt-2 text-sentence" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.14 }}>
                  {fb.lineNode || fb.line}
                </motion.p>
              )}
            </motion.div>
          ) : ghost ? (
            <motion.div key="ghost" className="mb-6 flex h-9 items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.12 } }}>
              <Button3D variant="ghost" tone="muted" size="md" onClick={ghost.onClick} sound={false}>{ghost.label}</Button3D>
            </motion.div>
          ) : null}
        </AnimatePresence>
        {children}
        {fb && secondary && (
          <Button3D variant="secondary" tone={ok ? "green" : "red"} size="cta" block icon={secondary.icon} onClick={secondary.onClick} className="mb-2">
            {secondary.label}
          </Button3D>
        )}
        {cta && (
          <Button3D variant={fb && !ok ? "danger" : "primary"} size="cta" block onClick={cta.onClick} disabled={cta.disabled} loading={cta.loading} sound={false}>
            {cta.label}
          </Button3D>
        )}
      </div>
    </footer>
  );
}
