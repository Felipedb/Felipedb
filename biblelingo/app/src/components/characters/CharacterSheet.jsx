// Ficha do personagem (VISUAL_SPEC 6.7): Sheet com alça, hero 4:3 com nome sobre o degradê, botão de áudio azul 3D,
// abas Sobre / Lições / Versículos com indicador deslizante e CTA "INICIAR LIÇÕES" fixo no rodapé. Sem botão "Fechar".
// Props: charKey, open, onClose (o pai mantém o componente montado para a saída animar).
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { CHARACTERS, CHARACTER_UNIT, COURSE, unitSteps, unitDone, castChar } from "../../core/content.js";
import { startLesson, startLevelUp, startQuickPractice } from "../../core/session.js";
import { state } from "../../core/store.js";
import { speak } from "../../core/audio.js";
import { SPRING } from "../../core/motion.js";
import { unitVars } from "../../core/palette.js";
import { useIsDark } from "../shell/useIsDark.js";
import Icon from "../Icon.jsx";
import { Sheet, Button3D, Avatar, useAsset, charAsset } from "../ui/index.js";

const TABS = [["about", "Sobre"], ["lessons", "Lições"], ["verses", "Versículos"]];
// Quadrados das lições-chave: ciclo verde, azul, roxo, laranja com ícones do conjunto SVG
const LESSON_STYLE = [
  { bg: "var(--color-green)", icon: "lightbulb" },
  { bg: "var(--color-blue)", icon: "cross-dove" },
  { bg: "var(--color-purple)", icon: "heart" },
  { bg: "var(--color-orange)", icon: "book" },
];

function Hero({ ch, subtitle, onSpeak, onClose }) {
  const hero = useAsset(charAsset(ch, "hero.webp"));
  const src = hero ? charAsset(ch, "hero.webp") : ch.img;
  return (
    <div className="relative -mx-4 -mt-2 aspect-[4/3] overflow-hidden bg-parchment">
      {src ? (
        <img src={src} alt="" draggable="false" decoding="async" className="h-full w-full object-cover" style={{ objectPosition: hero ? "top" : "center 22%" }} />
      ) : (
        <div className="flex h-full w-full items-center justify-center"><Avatar ch={ch} size={120} /></div>
      )}
      <span aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(transparent 45%, rgba(0,0,0,.55))" }} />
      <button type="button" onClick={onClose} aria-label="Fechar" className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white">
        <Icon name="close" size={20} />
      </button>
      <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-display text-white" style={{ textShadow: "0 1px 2px rgba(0,0,0,.4)" }}>{ch.name.split(" (")[0]}</h2>
          {subtitle && <p className="text-secondary text-white/85">{subtitle}</p>}
        </div>
        <motion.button type="button" onClick={onSpeak} aria-label="Ouvir o nome"
          className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-accent text-accent-text"
          style={{ boxShadow: "0 4px 0 var(--color-accent-shadow)" }} whileTap={{ y: 4, boxShadow: "0 0 0 var(--color-accent-shadow)" }} transition={SPRING.snap}>
          <Icon name="speaker" size={28} tone="mono" />
        </motion.button>
      </div>
    </div>
  );
}

function Tabs({ tab, setTab }) {
  return (
    <div className="-mx-4 flex border-b-2 border-line px-4" role="tablist" aria-label="Seções da ficha">
      {TABS.map(([id, label]) => {
        const on = tab === id;
        return (
          <button key={id} type="button" role="tab" aria-selected={on} onClick={() => setTab(id)}
            className={`relative flex h-12 flex-1 items-center justify-center text-label uppercase tracking-[1px] ${on ? "text-unit-text" : "text-ink-soft"}`}>
            {label}
            {on && <motion.span layoutId="char-tab" aria-hidden className="absolute inset-x-2 -bottom-[2px] h-[3px] rounded-full bg-unit" transition={SPRING.settle} />}
          </button>
        );
      })}
    </div>
  );
}

export default function CharacterSheet({ charKey, open = true, onClose }) {
  const dark = useIsDark();
  const [tab, setTab] = useState("about");
  useEffect(() => { if (open) setTab("about"); }, [open, charKey]);
  const ch = CHARACTERS[charKey];
  if (!ch) return <Sheet open={false} onClose={onClose} />;
  const unitId = CHARACTER_UNIT[charKey];
  const unit = unitId ? COURSE.find((u) => u.id === unitId) : null;
  const firstName = ch.name.split(" (")[0].split(" ")[0];
  const verses = unit ? unit.lessons.filter((l) => l.verse && l.verse.text).map((l) => l.verse) : [];
  const voice = { key: charKey, ...ch };

  const start = () => {
    onClose();
    if (!unit) { startQuickPractice("review", castChar(charKey)); return; }
    const steps = unitSteps(unit);
    const next = steps.find((l) => !state.completed[l.id]) || steps[steps.length - 1];
    if (unitDone(unit)) startLevelUp(unit); else startLesson(next.id);
  };
  const practice = () => { onClose(); startQuickPractice("review", castChar(charKey)); };

  const footer = (
    <div className="flex flex-col items-center gap-1">
      <Button3D variant="primary" block onClick={start}>{unit ? "Iniciar lições" : `Praticar com ${firstName}`}</Button3D>
      {unit && <Button3D variant="ghost" tone="blue" onClick={practice}>Praticar com {firstName}</Button3D>}
    </div>
  );

  return (
    <Sheet open={open} onClose={onClose} label={ch.name} footer={footer}>
      <div style={unitVars(unitId || "u1", dark)}>
        <Hero ch={voice} subtitle={ch.title} onClose={onClose} onSpeak={() => speak(ch.name.split(" (")[0], { char: voice })} />
        <Tabs tab={tab} setTab={setTab} />

        {tab === "about" && (
          <motion.div key="about" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={SPRING.settle} className="py-4">
            <div className="flex flex-wrap items-center gap-2">
              {ch.virtue && (
                <span className="inline-flex h-9 items-center gap-1.5 rounded-pill bg-unit-soft px-3 text-caption uppercase tracking-[.8px] text-unit-text">
                  <Icon name="sparkle" size={18} />{ch.virtue}
                </span>
              )}
              {ch.ref && <span className="inline-flex h-9 items-center rounded-pill border-2 border-line px-3 text-caption uppercase tracking-[.8px] text-ink-soft">{ch.ref}</span>}
            </div>
            <p className="mt-4 text-body text-ink">{ch.desc || ""}</p>
            {unit && <p className="mt-3 text-secondary text-ink-soft">Capítulo {COURSE.indexOf(unit) + 1}: {unit.title}</p>}
          </motion.div>
        )}

        {tab === "lessons" && (
          <motion.div key="lessons" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={SPRING.settle} className="py-4">
            <h4 className="text-heading text-ink">Lições-chave</h4>
            <ul className="mt-3 flex flex-col gap-3">
              {(ch.lessons || []).map((l, i) => {
                const s = LESSON_STYLE[i % LESSON_STYLE.length];
                return (
                  <li key={i} className="flex items-center gap-3 text-body text-ink">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] text-white" style={{ background: s.bg }}>
                      <Icon name={s.icon} size={18} tone="mono" />
                    </span>
                    {l}
                  </li>
                );
              })}
              {!(ch.lessons || []).length && <li className="text-secondary text-ink-soft">As lições deste personagem chegam em breve.</li>}
            </ul>
          </motion.div>
        )}

        {tab === "verses" && (
          <motion.div key="verses" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={SPRING.settle} className="flex flex-col gap-3 py-4">
            {verses.map((v, i) => (
              <div key={i} className="parchment p-4">
                <div className="flex items-start gap-3">
                  <p className="min-w-0 flex-1 text-body text-ink">“{v.text}”</p>
                  <motion.button type="button" onClick={() => speak(v.text, { char: voice })} aria-label="Ouvir o versículo"
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-accent text-accent-text"
                    style={{ boxShadow: "0 4px 0 var(--color-accent-shadow)" }} whileTap={{ y: 4, boxShadow: "0 0 0 var(--color-accent-shadow)" }} transition={SPRING.snap}>
                    <Icon name="speaker" size={24} tone="mono" />
                  </motion.button>
                </div>
                {v.pt && <p className="mt-2 text-secondary text-ink-soft">{v.pt}</p>}
                <p className="mt-2 text-caption uppercase tracking-[.8px] text-parchment-text">{v.ref}</p>
              </div>
            ))}
            {!verses.length && <p className="text-secondary text-ink-soft">Os versículos deste personagem chegam com as próximas lições.</p>}
          </motion.div>
        )}
      </div>
    </Sheet>
  );
}
