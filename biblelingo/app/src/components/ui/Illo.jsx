// Illo: ilustração 3D do app (Microsoft Fluent Emoji 3D, MIT), o sistema de ilustração de conteúdo e de estatísticas.
// Os arquivos ficam em img/fx/<codepoints>.webp (160x160, fundo transparente), gerados por tools/fx-assets.mjs, que
// também grava img/fx/index.json { emoji normalizado: arquivo }. Nunca use emoji do sistema como ícone: passe-o aqui.
// Props:
//   e         emoji de conteúdo ("🌍", "❤️") ou nome de estatística/ícone ("flame", "bolt", "heart", "gem", "crown"...: ILLO_NAMES)
//   size      px (padrão 64; 24 a 28 no HUD, 48 nas missões, 64 a 80 nos cartões de imagem, 120 em estados vazios)
//   alt       texto alternativo; vazio (padrão) deixa a imagem decorativa (aria-hidden)
//   muted     cinza apagado (ofensiva apagada, coração vazio, bloqueado); os nomes "*-off"/"*-empty" já vêm apagados
//   animate   "none" (padrão) | "pop" (entra com SPRING.pop) | "float" (flutua 4 px em 3 s) | "bounce" (pulinho a cada troca de `bump`)
//   bump      contador que, ao mudar (e diferente de 0), dispara o pulinho (animate "bounce")
//   delay     atraso da entrada pop (s) · lazy: carrega só perto da tela (listas longas); padrão false (arquivos de ~5 KB)
// Sem arquivo para o emoji (ou se a imagem falhar), mostra o emoji em texto (span.emoji) como reserva.
// Exemplo: <Illo e="🌍" size={72} />   <Illo e="flame" size={26} muted={!lit} />   <Illo e="⭐" animate="pop" delay={0.2} />
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { SPRING } from "../../core/motion.js";
import FX from "../../../../img/fx/index.json";

// Nomes de estatística e de ícones ilustrados (mesmos nomes do conjunto SVG) para o emoji 3D correspondente
export const ILLO_NAMES = {
  flame: "🔥", "flame-off": "🔥", streak: "🔥",
  bolt: "⚡", xp: "⚡",
  heart: "❤️", "heart-empty": "❤️", "heart-broken": "💔", hearts: "❤️",
  gem: "💎", gems: "💎",
  crown: "👑", crowns: "👑",
  star: "⭐", "star-empty": "⭐", stars: "⭐",
  trophy: "🏆", medal: "🏅", target: "🎯", sparkle: "✨", gift: "🎁", party: "🎉",
  timer: "⏱️", clock: "⏱️", calendar: "📅", alarm: "⏰",
  book: "📖", "open-book-leaf": "📖", books: "📚", scroll: "📜",
  lock: "🔒", key: "🗝️", coin: "🪙", money: "💰", chest: "🎁",
  lightbulb: "💡", bulb: "💡", check: "✅", "check-circle": "✅", wrong: "❌", "close-circle": "❌",
  turtle: "🐢", headphones: "🎧", mic: "🎤", puzzle: "🧩", pray: "🙏", church: "⛪", sunrise: "🌅",
  compass: "🧭", dove: "🕊️", "cross-dove": "🕊️", globe: "🌍", ark: "🚢", wheat: "🌾", lion: "🦁", harp: "🎵",
  "fish-net": "🐟", muscle: "💪", rocket: "🚀", map: "🗺️", people: "👥", wave: "👋", graduation: "🎓", bell: "🔔",
};
const MUTED_NAMES = new Set(["flame-off", "heart-empty", "star-empty"]);

// Mesma normalização de tools/fx-assets.mjs: sem seletores de variação e sem tom de pele
const normalize = (s) => String(s).replace(/[︎️]/g, "").replace(/\p{EMod}/gu, "");

// Emoji (ou nome) -> { emoji, file, muted }; file null quando não há ilustração 3D para ele
export function illoOf(e) {
  if (e == null || e === "") return { emoji: "", file: null, muted: false };
  const emoji = ILLO_NAMES[e] || e;
  const file = FX[normalize(emoji)] || null;
  return { emoji, file, muted: MUTED_NAMES.has(e) };
}

// true quando existe ilustração 3D para o emoji ou nome
export const hasIllo = (e) => !!illoOf(e).file;

const MUTED_STYLE = { filter: "grayscale(1) brightness(1.08) contrast(.85)", opacity: 0.5 };

export default function Illo({ e, size = 64, alt = "", muted, animate = "none", bump, delay = 0, lazy = false, className = "", style, ...rest }) {
  const reduce = useReducedMotion();
  const { emoji, file, muted: mutedByName } = illoOf(e);
  const [failed, setFailed] = useState(null); // arquivo que falhou ao carregar
  const isMuted = muted != null ? muted : mutedByName;
  const deco = !alt;
  const box = { width: size, height: size, ...(isMuted ? MUTED_STYLE : null), ...style };

  let initial = false, anim = undefined, trans = undefined;
  if (!reduce) {
    if (animate === "pop") { initial = { scale: 0, rotate: -12 }; anim = { scale: 1, rotate: 0 }; trans = { ...SPRING.pop, delay }; }
    else if (animate === "float") { anim = { y: [0, -4, 0] }; trans = { duration: 3, repeat: Infinity, ease: "easeInOut", delay }; }
    else if (animate === "bounce" && bump) { initial = undefined; anim = { scale: [1, 1.25, 1], y: [0, -3, 0] }; trans = { duration: 0.35 }; }
  }

  const content = file && failed !== file ? (
    <img src={`img/fx/${file}`} width={size} height={size} alt={alt} aria-hidden={deco || undefined} loading={lazy ? "lazy" : "eager"} decoding="async"
      draggable="false" className="pointer-events-none block h-full w-full select-none object-contain" onError={() => setFailed(file)} />
  ) : (
    <span className="emoji" role={deco ? undefined : "img"} aria-label={deco ? undefined : alt} aria-hidden={deco || undefined}
      style={{ fontSize: Math.round(size * 0.82), lineHeight: 1 }}>{emoji}</span>
  );

  return (
    <motion.span key={animate === "bounce" ? bump : undefined} className={`inline-flex shrink-0 items-center justify-center align-middle leading-none ${className}`}
      style={box} data-illo={emoji} initial={initial} animate={anim} transition={trans} {...rest}>
      {content}
    </motion.span>
  );
}

// Estatística no estilo do HUD do Duolingo: ilustração 3D pequena (24 a 28) + número em negrito na cor do ícone.
// O ícone dá um pulinho quando o valor muda (nunca ao montar).
// Props: e (emoji ou nome), value, color (classe de texto, ex.: "text-orange-text"), size (padrão 26), muted, numberClass
// Exemplo: <IlloStat e="flame" value={3} color="text-orange-text" muted={!lit} />
export function IlloStat({ e, value, color = "text-ink", size = 26, muted, numberClass = "", className = "", children }) {
  const { muted: mutedByName } = illoOf(e);
  const off = muted != null ? muted : mutedByName;
  const prev = useRef(value);
  const [bump, setBump] = useState(0);
  useEffect(() => {
    if (prev.current !== value) setBump((b) => b + 1);
    prev.current = value;
  }, [value]);
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <Illo e={e} size={size} muted={off} animate="bounce" bump={bump} />
      {value != null && <span className={`text-[17px] font-extrabold leading-6 tabular-nums ${off ? "text-disabled" : color} ${numberClass}`}>{value}</span>}
      {children}
    </span>
  );
}
