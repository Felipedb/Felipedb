// Card (VISUAL_SPEC 5.9): fundo --color-page, borda 2 px --color-line, raio 16, sem sombra.
// Props:
//   variant  "static" (.card) | "interactive" (.card-interactive: borda inferior 4, afunda 2 px, sfx tap)
//            | "parchment" (motivo Pergaminho, no máximo um por tela) | "unit" (fundo --unit-soft, borda --unit-color a 40%)
//            | "hero" (imagem com gradiente inferior para a página)
//   padding  "md" (16) | "lg" (24) | "none"   · stripe: faixa esquerda de 8 px na cor do capítulo (variant unit)
//   image / imageAlt / ratio ("16/9" | "1/1")  só em hero
//   as       elemento (padrão div; interactive vira button)
// Exemplo: <Card variant="interactive" onClick={open}>...</Card>
//          <CardList><CardItem>...</CardItem></CardList>  (cascata com STAGGER.cards)
import { motion } from "motion/react";
import { SPRING, STAGGER, list, item } from "../../core/motion.js";
import { sfx } from "../../core/sfx.js";

const PAD = { md: "p-4 lg:p-6", lg: "p-6", none: "" };

export default function Card({ variant = "static", padding = "md", stripe = false, image, imageAlt = "", ratio = "16/9", as, className = "", children, onClick, ...rest }) {
  const pad = PAD[padding] || PAD.md;
  if (variant === "interactive") {
    const Tag = motion[as || "button"];
    return (
      <Tag type={!as || as === "button" ? "button" : undefined} onClick={(e) => { sfx("tap"); onClick && onClick(e); }}
        className={`card-interactive text-left hover:bg-raised ${pad} ${className}`}
        whileTap={{ y: 2, borderBottomWidth: 2 }} transition={SPRING.snap} {...rest}>
        {children}
      </Tag>
    );
  }
  const Tag = as || "div";
  if (variant === "parchment") return <Tag className={`parchment ${pad} ${className}`} onClick={onClick} {...rest}>{children}</Tag>;
  if (variant === "unit") {
    return (
      <Tag className={`relative overflow-hidden rounded-lg border-2 bg-unit-soft ${pad} ${className}`}
        style={{ borderColor: "color-mix(in oklab, var(--color-unit) 40%, transparent)" }} onClick={onClick} {...rest}>
        {stripe && <span aria-hidden className="absolute inset-y-0 left-0 w-2 bg-unit" />}
        {children}
      </Tag>
    );
  }
  if (variant === "hero") {
    return (
      <Tag className={`card overflow-hidden ${className}`} onClick={onClick} {...rest}>
        {image && (
          <div className="relative" style={{ aspectRatio: ratio }}>
            <img src={image} alt={imageAlt} className="h-full w-full object-cover" loading="lazy" decoding="async" draggable="false" />
            <span aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(transparent 55%, var(--color-page))" }} />
          </div>
        )}
        <div className={pad}>{children}</div>
      </Tag>
    );
  }
  return <Tag className={`card ${pad} ${className}`} onClick={onClick} {...rest}>{children}</Tag>;
}

// Lista em cascata: cada CardItem entra de baixo (y 16 -> 0) com STAGGER.cards
export function CardList({ stagger = STAGGER.cards, delay = 0, className = "", children, ...rest }) {
  return (
    <motion.div variants={list(stagger, delay)} initial="hidden" animate="show" className={className} {...rest}>
      {children}
    </motion.div>
  );
}
export function CardItem({ spring = SPRING.settle, y = 16, className = "", children, ...rest }) {
  return <motion.div variants={item(spring, y)} className={className} {...rest}>{children}</motion.div>;
}
