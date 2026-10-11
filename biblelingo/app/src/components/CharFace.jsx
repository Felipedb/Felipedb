// Retrato de personagem: imagem da galeria, emoji dos extras ou SVG
export default function CharFace({ ch, className = "", talking = false, react = "" }) {
  if (!ch) return null;
  return (
    <span className={`char-face relative inline-flex items-center justify-center overflow-hidden rounded-full bg-cream ${talking ? "talking" : ""} ${className}`}>
      {ch.img ? (
        <img src={ch.img} alt={ch.name} className="h-full w-full object-cover" draggable="false" />
      ) : ch.emoji ? (
        <span role="img" aria-label={ch.name} className="emoji-face leading-none">{ch.emoji}</span>
      ) : (
        <span dangerouslySetInnerHTML={{ __html: ch.svg || "" }} />
      )}
      {react ? <span className="absolute -right-0.5 -top-0.5 text-lg drop-shadow">{react}</span> : null}
    </span>
  );
}
