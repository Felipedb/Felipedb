// Fim e começo da trilha (VISUAL_SPEC 5.6 adaptado à trilha que sobe, decisão do dono):
// TrailEnd: card 358x160 Pergaminho no topo com o personagem Pedro (CharacterStage header) e "Mais capítulos em breve".
// TrailStart: pé da trilha, "Comece aqui e suba" com bandeira SVG sobre disco verde (sem caixa tracejada, sem emoji).
import { castChar } from "../../core/content.js";
import Icon from "../Icon.jsx";
import { CharacterStage } from "../ui/index.js";

export default function TrailEnd() {
  const pedro = castChar("pedro");
  return (
    <div className="parchment mb-8 flex h-40 items-center gap-3 overflow-hidden px-4" role="note" aria-label="Mais capítulos em breve">
      <div className="min-w-0 flex-1">
        <h2 className="text-heading text-ink">Mais capítulos em breve</h2>
        <p className="mt-1 text-secondary text-ink-soft">Novos capítulos a caminho. Enquanto isso, suba de nível nos capítulos concluídos.</p>
      </div>
      <div className="flex h-full shrink-0 items-end">
        <CharacterStage ch={pedro} variant="header" className="origin-bottom scale-[.82]" />
      </div>
    </div>
  );
}

export function TrailStart({ title }) {
  return (
    <div className="mt-6 flex flex-col items-center gap-3 pb-6 text-center" aria-label="Começo da trilha">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-text" style={{ boxShadow: "0 6px 0 var(--color-primary-shadow)" }}>
        <Icon name="flag" size={32} tone="mono" />
      </span>
      <div>
        <div className="text-heading text-ink">Comece aqui e suba</div>
        {title && <div className="text-secondary text-ink-soft">Capítulo 1 · {title}</div>}
      </div>
    </div>
  );
}
