// Button3D (VISUAL_SPEC 5.1): face colorida + sombra dura 0 4px 0, raio 16. Afunda 4 px no toque
// com whileTap (sem :active no CSS) e volta com SPRING.snap. Sem scale em botão 3D.
// Props:
//   variant  "primary" | "danger" | "accent" | "on-unit" | "secondary" | "neutral" | "ghost" | "icon"   (padrão "primary")
//   tone     cor do contexto em secondary/ghost/icon: "green" | "red" | "blue" | "muted" | "white" | "accent"
//   size     "cta" (face 44, classe .btn-cta) | "lg" (48) | "md" (40) | "sm" (36)   (padrão "lg")
//   icon     nome de ícone (24) à esquerda do texto, gap 8 · iconOnly: só o ícone, 48x48 ou 40x40, raio 12
//   block    largura 100% · loading: três pontos de 6 px pulsando · disabled: face --color-line, texto --color-disabled, sem sombra
//   sound    toca sfx("tap") ao clicar (padrão: só secondary, neutral, ghost e icon; VERIFICAR/CONTINUAR nunca tocam)
//   as       "button" (padrão) | "a"; demais props vão para o elemento (onClick, aria-label, data-popover-start...)
// Exemplo: <Button3D variant="primary" size="cta" block onClick={check}>Verificar</Button3D>
//          <Button3D variant="secondary" tone="green" block>Explique minha resposta</Button3D>
import { motion } from "motion/react";
import { SPRING } from "../../core/motion.js";
import { sfx } from "../../core/sfx.js";
import Icon from "../Icon.jsx";

const RAISED = {
  primary: { face: "bg-primary text-primary-text", shadow: "var(--color-primary-shadow)" },
  danger: { face: "bg-danger text-danger-text", shadow: "var(--color-danger-shadow)" },
  accent: { face: "bg-accent text-accent-text", shadow: "var(--color-accent-shadow)" },
  "on-unit": { face: "bg-white", shadow: "rgba(0,0,0,.18)", style: { color: "var(--unit-text-light, var(--color-unit-text))" } },
};
const TONE_TEXT = { green: "text-green-text", red: "text-red-text", blue: "text-blue-text", muted: "text-muted", white: "text-white", accent: "text-accent" };
const TONE_BORDER = { green: "border-green-text", red: "border-red-text", blue: "border-blue-text", muted: "border-line", white: "border-white/35", accent: "border-accent" };
const SIZE = {
  cta: "btn-cta",
  lg: "h-12 px-6 text-label uppercase tracking-[1px]",
  md: "h-10 px-5 text-label uppercase tracking-[1px]",
  sm: "h-9 px-4 text-caption uppercase tracking-[.8px]",
};
const DEFAULT_TONE = { secondary: "green", neutral: "blue", ghost: "muted", icon: "accent" };

function Dots() {
  return (
    <span className="inline-flex items-center gap-1.5" aria-label="Carregando">
      {[0, 1, 2].map((i) => (
        <motion.span key={i} className="h-1.5 w-1.5 rounded-full bg-current"
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }} transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }} />
      ))}
    </span>
  );
}

export default function Button3D({
  variant = "primary", tone, size = "lg", icon, iconOnly = false, block = false, loading = false, disabled = false,
  sound, as = "button", className = "", style, children, onClick, ...rest
}) {
  const t = tone || DEFAULT_TONE[variant] || "green";
  const raised = RAISED[variant] || (variant === "icon" ? (t === "white" ? null : RAISED.accent) : null);
  const outline = variant === "secondary" || variant === "neutral";
  const ghost = variant === "ghost";
  const squareSize = size === "md" || size === "sm" ? "h-10 w-10" : "h-12 w-12";
  const playTap = sound != null ? sound : (outline || ghost || variant === "icon");
  const Tag = motion[as] || motion.button;
  const off = disabled || loading;

  let cls, press, styles = { ...style };
  if (raised) {
    cls = `btn-3d ${iconOnly ? `${squareSize} rounded-md` : SIZE[size]} ${off ? "bg-line text-disabled" : `${raised.face} hover:brightness-[.96]`}`;
    styles = { "--btn-shadow": raised.shadow, boxShadow: off ? "none" : "0 4px 0 var(--btn-shadow)", ...(raised.style || {}), ...styles };
    if (off) delete styles.color;
    press = { y: 4, boxShadow: "0 0 0 var(--btn-shadow)" };
  } else if (variant === "icon" && t === "white") {
    // botão guia do capítulo: caixa translúcida sobre a face colorida
    cls = `${squareSize} rounded-md border-2 border-white/35 bg-white/12 text-white`;
    press = { y: 2 };
  } else if (outline) {
    cls = `btn-outline ${iconOnly ? `${squareSize} rounded-md` : SIZE[size]} ${variant === "neutral" ? "border-line bg-page text-blue-text" : `${TONE_BORDER[t]} ${TONE_TEXT[t]}`} ${off ? "opacity-60" : "hover:bg-raised"}`;
    press = { y: 2, borderBottomWidth: 2 };
  } else {
    cls = `rounded-md ${size === "sm" || size === "cta" ? "h-9 px-3 text-caption tracking-[.8px]" : "h-10 px-3 text-label tracking-[1px]"} uppercase ${TONE_TEXT[t]} ${off ? "opacity-60" : "hover:text-ink"}`;
    press = { scale: 0.97 };
  }

  const handleClick = (e) => {
    if (off) return;
    if (playTap) sfx("tap");
    if (onClick) onClick(e);
  };

  return (
    <Tag type={as === "button" ? "button" : undefined} disabled={off || undefined} aria-busy={loading || undefined}
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap font-sans ${block ? "w-full" : ""} ${cls} ${className}`}
      style={styles} whileTap={off ? undefined : press} transition={SPRING.snap} onClick={handleClick} {...rest}>
      {loading ? <Dots /> : (
        <>
          {icon && <Icon name={icon} size={24} />}
          {!iconOnly && children}
        </>
      )}
    </Tag>
  );
}
