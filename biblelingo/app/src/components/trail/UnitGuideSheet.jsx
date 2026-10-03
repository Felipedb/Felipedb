// UnitGuideSheet (VISUAL_SPEC 6.1): guia do capítulo aberto pelo botão do UnitHeader. Título e referência
// ("Noé e a arca · Gênesis 6 a 9"), "Vocabulário" (chips 44 px com áudio agrupados por lição), "Versículo do capítulo"
// (card Pergaminho com áudio), "Personagens" (avatares 56 com nome) e "Dicas" (3 itens); CTA "CONTINUAR CAPÍTULO".
// Props: open, unit, chapter, section, cta ({ label, onClick, disabled }), onClose
import { useMemo } from "react";
import { UNIT_CAST, castChar } from "../../core/content.js";
import { speak } from "../../core/audio.js";
import { unitVars } from "../../core/palette.js";
import { useIsDark } from "../shell/useIsDark.js";
import Icon from "../Icon.jsx";
import { Sheet, Button3D, Chip, Avatar, AudioButton } from "../ui/index.js";

const TIPS = [
  "Toque nas palavras sublinhadas para ver a tradução sem perder o fio.",
  "Use a tartaruga para ouvir devagar e repita em voz alta nas cenas.",
  "Errou? A etapa volta no fim da lição: é assim que a palavra fica.",
];

export default function UnitGuideSheet({ open, unit, chapter = 1, section = 1, cta, onClose }) {
  const dark = useIsDark();
  const cast = useMemo(() => (unit ? (UNIT_CAST[unit.id] || []).map((k) => castChar(k)) : []), [unit]);
  const hero = cast[0] || null;
  const verseLesson = unit ? unit.lessons.find((l) => l.verse) : null;
  const lessons = unit ? unit.lessons.filter((l) => l.vocab && l.vocab.length) : [];
  const vars = unit ? unitVars(unit.id, dark) : {};

  return (
    <Sheet open={open && !!unit} onClose={onClose} label={unit ? `Guia do capítulo ${chapter}: ${unit.title}` : "Guia do capítulo"}
      footer={cta ? <Button3D variant="primary" block disabled={cta.disabled} onClick={cta.onClick}>{cta.label}</Button3D> : null}>
      {unit && (
        <div style={vars}>
          <div className="mb-5 flex items-start gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-unit text-unit-ink" style={{ boxShadow: "0 4px 0 var(--unit-shadow)" }}>
              <Icon name="notebook" size={28} tone="mono" />
            </span>
            <div className="min-w-0">
              <div className="text-caption uppercase tracking-[.8px] text-ink-soft">Seção {section} · Capítulo {chapter}</div>
              <h2 className="text-title text-ink" style={{ textWrap: "balance" }}>{unit.title}</h2>
              <div className="text-secondary text-ink-soft">{unit.subtitle}</div>
            </div>
          </div>

          <h3 className="mb-2 text-heading text-ink">Vocabulário</h3>
          {lessons.length === 0 && <p className="text-secondary text-ink-soft">Este capítulo revisa o vocabulário dos anteriores.</p>}
          {lessons.map((l) => (
            <div key={l.id} className="mb-3">
              <div className="mb-1.5 text-caption uppercase tracking-[.8px] text-ink-soft">{l.title}</div>
              <div className="flex flex-wrap gap-2">
                {l.vocab.map((v) => (
                  <Chip key={v.en} en={v.en} pt={v.pt} icon={v.icon} onClick={() => speak(v.en, { char: hero })} />
                ))}
              </div>
            </div>
          ))}

          {verseLesson && (
            <>
              <h3 className="mb-2 mt-5 text-heading text-ink">Versículo do capítulo</h3>
              <div className="parchment p-4">
                <div className="flex items-start gap-3">
                  <p className="flex-1 text-body italic text-ink">“{verseLesson.verse.text}”</p>
                  <AudioButton text={verseLesson.verse.text} char={hero} />
                </div>
                {verseLesson.verse.pt && <p className="mt-2 text-secondary text-ink-soft">{verseLesson.verse.pt}</p>}
                <p className="mt-2 text-secondary font-bold" style={{ color: "var(--color-parchment-text)" }}>{verseLesson.verse.ref}</p>
              </div>
            </>
          )}

          {cast.length > 0 && (
            <>
              <h3 className="mb-2 mt-5 text-heading text-ink">Personagens</h3>
              <div className="flex flex-wrap gap-4">
                {cast.map((c) => (
                  <button key={c.key} type="button" onClick={() => speak(c.name.split(" (")[0], { char: c })} className="flex flex-col items-center gap-1.5" aria-label={`Ouvir ${c.name}`}>
                    <Avatar ch={c} size={56} ring />
                    <span className="text-secondary font-bold text-ink">{c.name.split(" (")[0]}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          <h3 className="mb-2 mt-5 text-heading text-ink">Dicas</h3>
          <ul className="mb-2 flex flex-col gap-2">
            {TIPS.map((t) => (
              <li key={t} className="flex items-start gap-2 text-body text-ink-soft">
                <Icon name="lightbulb" size={24} className="mt-0.5 shrink-0" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Sheet>
  );
}
