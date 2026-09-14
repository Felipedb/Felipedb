// Personagens: galeria agrupada por capítulo (porta de renderCharacters, screens.js)
import { useState } from "react";
import { motion } from "motion/react";
import { useAppState } from "../core/useStore.js";
import { CHARACTERS, CHARACTER_UNIT, COURSE } from "../core/content.js";
import { CHARACTER_ORDER } from "../content/index.js";
import { sfx } from "../core/events.js";
import CharFace from "../components/CharFace.jsx";
import CharacterSheet from "../components/characters/CharacterSheet.jsx";

function buildGroups() {
  const groups = COURSE.map((u, i) => ({
    title: `Capítulo ${i + 1} · ${u.title}`,
    color: u.color,
    keys: CHARACTER_ORDER.filter((k) => CHARACTERS[k] && CHARACTER_UNIT[k] === u.id),
  }));
  const placed = new Set(groups.flatMap((g) => g.keys));
  const rest = CHARACTER_ORDER.filter((k) => CHARACTERS[k] && !placed.has(k));
  if (rest.length) groups.push({ title: "Outros personagens", color: "#7e57c2", keys: rest });
  return groups.filter((g) => g.keys.length);
}

export default function Characters() {
  useAppState();
  const [openKey, setOpenKey] = useState(null);
  const groups = buildGroups();

  return (
    <div className="mx-auto flex w-full max-w-[560px] flex-col gap-3 px-4 pb-6 pt-4">
      <h2 className="mt-1.5 font-display text-[26px] font-extrabold">Personagens</h2>
      <p className="-mt-2.5 text-sm font-bold text-ink-soft">Histórias diferentes. O mesmo Deus fiel.</p>

      {groups.map((g, gi) => (
        <motion.section key={g.title} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: Math.min(gi * 0.05, 0.3), ease: "easeOut" }}>
          <h3 className="mb-2 mt-2 border-l-4 pl-2.5 font-display text-lg font-extrabold" style={{ borderColor: g.color }}>
            {g.title}
          </h3>
          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
            {g.keys.map((k) => {
              const ch = CHARACTERS[k];
              return (
                <button key={k} data-char={k} onClick={() => { sfx("tap"); setOpenKey(k); }}
                  className="flex flex-col items-center gap-1.5 rounded-2xl border-2 border-b-4 border-line bg-card px-1.5 py-2.5 transition-transform active:translate-y-0.5 active:border-b-2 active:mb-0.5">
                  <CharFace ch={ch} className="h-16 w-16 text-4xl" />
                  <span className="max-w-full truncate text-[13px] font-extrabold">{ch.name.split(" (")[0]}</span>
                  {ch.virtue && <span className="max-w-full truncate text-[11px] font-bold text-[#7e57c2] dark:text-[#c4a8ef]">✦ {ch.virtue}</span>}
                </button>
              );
            })}
          </div>
        </motion.section>
      ))}

      {openKey && <CharacterSheet charKey={openKey} onClose={() => setOpenKey(null)} />}
    </div>
  );
}
