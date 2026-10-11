// UnitHeader (VISUAL_SPEC 5.5): bloco 358x84 (lg 600x92), raio 16, fundo --unit-color, padding 16x20, sem sombra.
// Esquerda: "SEÇÃO 1 · CAPÍTULO 2" (13/800, branco 80%) e o título do capítulo (19/800, até 2 linhas).
// Direita: botão guia 48x48 (raio 12, borda branca 35%, fundo branco 12%, ícone notebook 24) que abre o UnitGuideSheet.
// Sticky dentro da <section> do capítulo (top = HUD + 8 px, z 20): mostra sempre o capítulo em vista, suba ou desça a trilha.
// Props: section, chapter, title, done, onGuide
import Icon from "../Icon.jsx";
import { Button3D } from "../ui/index.js";

export default function UnitHeader({ section = 1, chapter = 1, title, done = false, onGuide }) {
  return (
    <div className="sticky top-[calc(56px+env(safe-area-inset-top)+8px)] z-20 mb-6 lg:top-6">
      <div className="flex min-h-[84px] items-center justify-between gap-4 rounded-lg bg-unit px-5 py-4 text-unit-ink transition-colors duration-[250ms] lg:min-h-[92px]">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-caption uppercase tracking-[.8px] text-white/80">
            <span>Seção {section} · Capítulo {chapter}</span>
            {done && <Icon name="check" size={14} tone="mono" className="text-white" />}
          </div>
          <h2 className="mt-0.5 line-clamp-2 text-heading" title={title}>{title}</h2>
        </div>
        <Button3D variant="icon" tone="white" iconOnly icon="notebook" aria-label={`Guia do capítulo ${chapter}: ${title}`} onClick={onGuide} />
      </div>
    </div>
  );
}
