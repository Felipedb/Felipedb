// Ícone SVG do conjunto do app (app/src/icons). API: <Icon name size tone className />
//   name   nome da seção 4.2 (ou alias antigo: home, practice, quest, people, user, close, check, speaker...)
//   size   px (16, 20, 24, 32, 48, 64, 96, 120). Sem size, herda da fonte (1.15em), como o Icon antigo.
//   tone   "mono" desenha o ícone ilustrado em currentColor (ex.: branco sobre o nó); uma cor CSS
//          ("#afafaf", "var(--color-disabled)") faz o mesmo e pinta o wrapper com ela.
// Sempre aria-hidden: o significado vai em texto sr-only ou aria-label no elemento pai.
import { resolveIcon } from "../icons/index.js";

const MONO_ATTRS = ["fill", "stroke"];

function renderParts(parts, mono, prefix = "p") {
  return parts.map((part, i) => {
    const { el: El = "path", hl, knockout, parts: children, ...attrs } = part;
    if (mono && hl) return null;
    if (mono) {
      delete attrs.opacity;
      MONO_ATTRS.forEach((k) => {
        if (attrs[k] != null && attrs[k] !== "none") attrs[k] = knockout ? "var(--color-page)" : "currentColor";
      });
    }
    const key = `${prefix}${i}`;
    if (El === "g") return <g key={key} {...attrs}>{renderParts(children || [], mono, key)}</g>;
    return <El key={key} {...attrs} />;
  });
}

export default function Icon({ name, size, tone, className = "", style, ...rest }) {
  const def = resolveIcon(name);
  const mono = tone != null && tone !== "color";
  const color = mono && tone !== "mono" ? tone : undefined;
  const dim = size == null ? "1.15em" : size;
  const wrapStyle = color ? { color, ...style } : style;
  return (
    <span className={`inline-flex shrink-0 items-center justify-center align-middle leading-none ${className}`} style={wrapStyle} data-icon={name} {...rest}>
      <svg width={dim} height={dim} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        {def ? renderParts(def.parts, mono) : null}
      </svg>
    </span>
  );
}

export { renderParts };
