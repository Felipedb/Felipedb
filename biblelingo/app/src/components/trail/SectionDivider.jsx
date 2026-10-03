// SectionDivider (VISUAL_SPEC 5.6): banner 358x120, raio 16, degradê 160° (verde no Antigo Testamento, azul-real no Novo),
// ilustração scroll ou cross-dove 96 px a 30% à direita, "SEÇÃO N" (13/800, branco 80%), título 22/800 branco e
// botão "VER DETALHES" (secondary branco) que abre um resumo da seção: capítulos, referências e etapas concluídas.
// Props: n (número da seção), name, units ([{ u, ui, done, total }]), onOpenChapter(u, ui)
import { useState } from "react";
import { SECTION_GRADIENT, unitPalette } from "../../core/palette.js";
import Icon from "../Icon.jsx";
import { Button3D, Sheet } from "../ui/index.js";

export default function SectionDivider({ n = 1, name = "Antigo Testamento", units = [], onOpenChapter }) {
  const [open, setOpen] = useState(false);
  const old = name === "Antigo Testamento";
  const doneUnits = units.filter((x) => x.done === x.total).length;
  return (
    <>
      <div className="relative my-8 overflow-hidden rounded-lg p-4 text-white" style={{ background: SECTION_GRADIENT[name] || SECTION_GRADIENT["Antigo Testamento"], minHeight: 120 }}
        role="region" aria-label={`Seção ${n}: ${name}`}>
        <Icon name={old ? "scroll" : "cross-dove"} size={96} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 opacity-30" />
        <div className="relative">
          <div className="text-caption uppercase tracking-[.8px] text-white/80">Seção {n}</div>
          <h2 className="mt-0.5 text-[22px] font-extrabold leading-7">{name}</h2>
          <Button3D variant="secondary" tone="white" size="sm" className="mt-2.5" onClick={() => setOpen(true)}>Ver detalhes</Button3D>
        </div>
      </div>
      <Sheet open={open} onClose={() => setOpen(false)} title={`Seção ${n} · ${name}`}>
        <p className="mb-4 text-secondary text-ink-soft">{units.length} capítulos · {doneUnits} {doneUnits === 1 ? "concluído" : "concluídos"}</p>
        <ul className="flex flex-col gap-2">
          {units.map(({ u, ui, done, total }) => {
            const p = unitPalette(u.id);
            const complete = done === total;
            return (
              <li key={u.id}>
                <button type="button" onClick={() => { setOpen(false); onOpenChapter && onOpenChapter(u, ui); }}
                  className="card-interactive flex w-full items-center gap-3 p-3 text-left hover:bg-raised">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white" style={{ background: p.base, boxShadow: `0 3px 0 ${p.shadow}` }}>
                    <Icon name={complete ? "check" : "star"} size={22} tone="mono" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-caption uppercase tracking-[.8px] text-ink-soft">Capítulo {ui + 1} · {u.subtitle}</span>
                    <span className="block truncate text-body font-bold text-ink">{u.title}</span>
                  </span>
                  <span className="shrink-0 text-secondary font-bold tabular-nums text-ink-soft">{done}/{total}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </Sheet>
    </>
  );
}
