// Personagens (VISUAL_SPEC 6.7): lista agrupada por capítulo com faixa colorida e "N/M CONHECIDOS"; linhas de 72 px
// com avatar 56 (anel na cor do capítulo quando conhecido, cadeado quando não), nome, virtude completa e chevron.
// A ficha abre como Sheet (CharacterSheet), montada sempre para a saída animar.
import { useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { useAppState } from "../core/useStore.js";
import { CHARACTERS, CHARACTER_UNIT, COURSE } from "../core/content.js";
import { CHARACTER_ORDER } from "../content/index.js";
import { SPRING, list, item } from "../core/motion.js";
import { unitVars } from "../core/palette.js";
import { useIsDark } from "../components/shell/useIsDark.js";
import { sfx } from "../core/sfx.js";
import { haptic } from "../core/haptics.js";
import Icon from "../components/Icon.jsx";
import { Avatar } from "../components/ui/index.js";
import CharacterSheet from "../components/characters/CharacterSheet.jsx";
import { knownCharacters } from "../components/profile/ConfigModal.jsx";

function buildGroups() {
  const groups = COURSE.map((u, i) => ({
    id: u.id, n: i + 1, title: u.title,
    keys: CHARACTER_ORDER.filter((k) => CHARACTERS[k] && CHARACTER_UNIT[k] === u.id),
  }));
  const placed = new Set(groups.flatMap((g) => g.keys));
  const rest = CHARACTER_ORDER.filter((k) => CHARACTERS[k] && !placed.has(k));
  if (rest.length) groups.push({ id: "u4", n: 0, title: "Outros personagens", keys: rest });
  return groups.filter((g) => g.keys.length);
}

function CharRow({ k, known, onOpen }) {
  const ch = CHARACTERS[k];
  return (
    <motion.button type="button" data-char={k} variants={item(SPRING.settle, 10)} onClick={() => { sfx("tap"); haptic("tap"); onOpen(k); }}
      className="-mx-4 flex min-h-[72px] w-[calc(100%+32px)] items-center gap-3 px-4 text-left hover:bg-raised"
      whileTap={{ scale: 0.99 }} transition={SPRING.snap}>
      <Avatar ch={ch} size={56} ring={known ? true : undefined} locked={!known} />
      <span className="min-w-0 flex-1">
        <span className="block text-body font-bold text-ink">{ch.name.split(" (")[0]}</span>
        {ch.virtue && <span className="block text-secondary text-ink-soft">{ch.virtue}</span>}
      </span>
      <Icon name="chevron-right" size={24} tone="var(--color-disabled)" />
    </motion.button>
  );
}

export default function Characters() {
  useAppState();
  const dark = useIsDark();
  const [openKey, setOpenKey] = useState(null);
  const lastKey = useRef(null);
  if (openKey) lastKey.current = openKey;
  const groups = useMemo(buildGroups, []);
  const known = knownCharacters();
  const knownSet = new Set(known);

  return (
    <motion.div className="mx-auto flex w-full max-w-[560px] flex-col gap-2 px-4 pb-6 pt-4" variants={list(0.05)} initial="hidden" animate="show">
      <motion.div variants={item(SPRING.settle, 12)}>
        <h2 className="text-display text-ink">Personagens</h2>
        <p className="mt-1 text-secondary text-ink-soft">Histórias diferentes. O mesmo Deus fiel.</p>
      </motion.div>

      {known.length > 0 && (
        <motion.div variants={item(SPRING.settle, 12)} className="-mx-4 mt-2 flex gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="Personagens conhecidos">
          {known.map((k) => {
            const ch = { key: k, ...CHARACTERS[k] };
            return (
              <button key={k} type="button" onClick={() => { sfx("tap"); setOpenKey(k); }} aria-label={ch.name} className="flex shrink-0 flex-col items-center gap-1"
                style={unitVars(CHARACTER_UNIT[k] || "u1", dark)}>
                <Avatar ch={ch} size={56} ring />
                <span className="max-w-[64px] truncate text-caption uppercase tracking-[.8px] text-ink-soft">{ch.name.split(" (")[0].split(" ")[0]}</span>
              </button>
            );
          })}
        </motion.div>
      )}

      {groups.map((g) => {
        const n = g.keys.filter((k) => knownSet.has(k)).length;
        return (
          <motion.section key={g.id + g.title} variants={item(SPRING.settle, 12)} style={unitVars(g.id, dark)} className="mt-4">
            <div className="mb-1 flex items-center gap-3">
              <span aria-hidden className="h-10 w-2 shrink-0 rounded-[4px] bg-unit" />
              <h3 className="min-w-0 flex-1 text-heading text-ink">{g.n ? `${g.n}. ${g.title}` : g.title}</h3>
              <span className="shrink-0 text-caption uppercase tracking-[.8px] text-ink-soft">{n}/{g.keys.length} conhecidos</span>
            </div>
            <div className="divide-y-2 divide-line">
              {g.keys.map((k) => <CharRow key={k} k={k} known={knownSet.has(k)} onOpen={setOpenKey} />)}
            </div>
          </motion.section>
        );
      })}

      <CharacterSheet charKey={lastKey.current} open={!!openKey} onClose={() => setOpenKey(null)} />
    </motion.div>
  );
}
