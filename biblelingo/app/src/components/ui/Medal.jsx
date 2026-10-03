// Medal, Shield e EmptyState (VISUAL_SPEC 5.30).
// Medal: 64 px hexagonal em --unit-color (ou cor dada) com o motivo branco 32 (livro, arca, sarça, harpa, pergaminho,
//   trigo, leão, peixe, resolvido por unitMotif); bloqueada --color-line com lock; pop SPRING.pop ao desbloquear.
//   Props: unitId, size, locked, color, motif (nome de ícone), pop (anima a entrada), label (aria)
// Shield: 72x80 (conquistas): escudo na cor própria (shield-1 a shield-6) com o número do nível em faixa inferior
//   15/800 branco sobre rgba(0,0,0,.25). Props: n (1 a 6), level, size (altura, padrão 80), label
// EmptyState: ilustração 120 (ícone da família ou personagem) + heading 19/800 + secondary 15/500 centralizados + CTA opcional.
//   Props: icon, iconSize, ch (personagem), title, text, action ({ label, onClick }), className
// Exemplo: <Medal unitId="u2" />   <Shield n={2} level={3} />   <EmptyState icon="flame-off" title="Sem missões ainda" text="Faça sua primeira lição para acender a chama" action={{ label: "Começar", onClick: start }} />
import { motion } from "motion/react";
import { SPRING } from "../../core/motion.js";
import { unitPalette, unitMotif } from "../../core/palette.js";
import Icon from "../Icon.jsx";
import Button3D from "./Button3D.jsx";
import CharacterStage from "./CharacterStage.jsx";

const HEX = "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)";

export default function Medal({ unitId = "u1", size = 64, locked = false, color, motif, pop = false, label, className = "", ...rest }) {
  const p = unitPalette(unitId);
  const bg = locked ? "var(--color-line)" : color || p.base;
  const name = motif || unitMotif(unitId);
  return (
    <motion.span className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }} role="img" aria-label={label || (locked ? "Capítulo bloqueado" : `Medalha do capítulo ${unitId}`)}
      initial={pop ? { scale: 0, rotate: -15 } : false} animate={{ scale: 1, rotate: 0 }} transition={SPRING.pop} {...rest}>
      <span aria-hidden className="absolute inset-0" style={{ clipPath: HEX, background: bg }} />
      <span aria-hidden className="absolute inset-0" style={{ clipPath: HEX, background: "linear-gradient(135deg, rgba(255,255,255,.18), transparent 55%)" }} />
      <span className="relative text-white"><Icon name={locked ? "lock" : name} size={Math.round(size / 2)} tone={locked ? undefined : "mono"} /></span>
    </motion.span>
  );
}

export function Shield({ n = 1, level = 1, size = 80, label, className = "", ...rest }) {
  const w = Math.round(size * 0.9);
  return (
    <span className={`relative inline-flex items-center justify-center ${className}`} style={{ width: w, height: size }} role="img" aria-label={label || `Conquista nível ${level}`} {...rest}>
      <Icon name={`shield-${Math.min(6, Math.max(1, n))}`} size={size} />
      <span className="absolute inset-x-0 flex justify-center text-label text-white" style={{ bottom: Math.round(size * 0.1) }}>{level}</span>
    </span>
  );
}

export function EmptyState({ icon, iconSize = 120, ch, title, text, action, className = "" }) {
  return (
    <div className={`flex flex-col items-center px-4 py-8 text-center ${className}`}>
      {ch ? <CharacterStage ch={ch} variant="header" pose="happy" /> : icon ? <Icon name={icon} size={iconSize} /> : null}
      {title && <h3 className="mt-4 text-heading text-ink" style={{ textWrap: "balance" }}>{title}</h3>}
      {text && <p className="mt-1 max-w-[300px] text-secondary text-ink-soft">{text}</p>}
      {action && <Button3D variant="primary" className="mt-5" onClick={action.onClick}>{action.label}</Button3D>}
    </div>
  );
}
