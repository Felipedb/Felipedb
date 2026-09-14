// Ficha do personagem: porta de openCharacter (features.js)
import { useEffect } from "react";
import { motion } from "motion/react";
import { CHARACTERS, CHARACTER_UNIT, COURSE, unitSteps, unitDone, castChar } from "../../core/content.js";
import { startLesson, startLevelUp, startQuickPractice } from "../../core/session.js";
import { state } from "../../core/store.js";
import { speak } from "../../core/audio.js";
import { sfx } from "../../core/events.js";
import CharFace from "../CharFace.jsx";
import Icon from "../Icon.jsx";

const LESSON_ICONS = ["🕊️", "🛡️", "🙏", "🌟", "❤️", "📖"];

export default function CharacterSheet({ charKey, onClose }) {
  const ch = CHARACTERS[charKey];
  const unit = CHARACTER_UNIT[charKey] ? COURSE.find((u) => u.id === CHARACTER_UNIT[charKey]) : null;

  // Escape fecha; trava o scroll do fundo enquanto a ficha está aberta
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  if (!ch) return null;
  const firstName = ch.name.split(" ")[0];

  const start = () => {
    onClose();
    const steps = unitSteps(unit);
    const next = steps.find((l) => !state.completed[l.id]) || steps[steps.length - 1];
    if (unitDone(unit)) startLevelUp(unit); else startLesson(next.id);
  };
  const practice = () => {
    onClose();
    startQuickPractice("review", castChar(charKey));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-6"
      role="dialog" aria-modal="true" aria-label={ch.name}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div initial={{ opacity: 0, y: 48 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: "easeOut" }}
        className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-card sm:rounded-3xl">
        {/* Retrato grande */}
        <div className="relative aspect-video w-full overflow-hidden bg-cream">
          <CharFace ch={ch} className="!rounded-none h-full w-full text-7xl [&>img]:object-[center_20%]" />
          <button onClick={onClose} aria-label="Fechar"
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white">
            <Icon name="close" />
          </button>
        </div>

        <div className="p-5">
          <h3 className="font-display text-2xl font-extrabold">{ch.name}</h3>
          <p className="mt-0.5 text-sm font-bold text-ink-soft">{ch.title || ""}</p>
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <span className="rounded-[10px] border-2 border-[#d9c8f0] bg-[#f4edfc] px-2.5 py-0.5 text-[12.5px] font-black text-[#7e57c2] dark:border-[#4a3a63] dark:bg-[#2c2140] dark:text-[#c4a8ef]">
              ✦ {ch.virtue || ""}
            </span>
            <span className="text-[12.5px] font-extrabold text-ink-soft">{ch.ref || ""}</span>
          </div>
          <p className="mt-3 text-[15px] leading-relaxed">{ch.desc || ""}</p>

          {ch.lessons && (
            <div className="mt-4 rounded-2xl border-2 border-line bg-card-2 p-3.5">
              <h4 className="font-display font-extrabold">Lições-chave</h4>
              <div className="mt-2 flex flex-col gap-1.5">
                {ch.lessons.map((l, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-sm font-bold">
                    <span className="text-lg">{LESSON_ICONS[i % LESSON_ICONS.length]}</span>{l}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 flex items-center gap-3">
            <button onClick={() => speak(ch.name.split(" (")[0], { char: ch })}
              title="Ouvir nome" aria-label="Ouvir nome"
              className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl border-2 border-line bg-card text-xl">
              🔊
            </button>
            {unit ? (
              <button onClick={start} className="btn-3d flex-1 bg-brand-bright py-3 text-white">Iniciar lições</button>
            ) : (
              <button onClick={practice} className="btn-3d flex-1 bg-sky py-3 text-white" style={{ "--btn-shadow": "#1899d6" }}>
                Praticar com {firstName}
              </button>
            )}
          </div>
          <button onClick={() => { sfx("tap"); onClose(); }} className="mt-3 w-full rounded-2xl py-2.5 font-display font-bold text-ink-soft hover:bg-hover">
            Fechar
          </button>
        </div>
      </motion.div>
    </div>
  );
}
