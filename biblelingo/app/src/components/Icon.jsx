import { ICONS } from "../../../icons.js";
// Ícone SVG da biblioteca do app (icons.js)
export default function Icon({ name, className = "" }) {
  const svg = ICONS[name] || "";
  return <i className={`inline-flex items-center justify-center [&>svg]:h-[1.15em] [&>svg]:w-[1.15em] ${className}`} dangerouslySetInnerHTML={{ __html: svg }} />;
}
export { ICONS };
