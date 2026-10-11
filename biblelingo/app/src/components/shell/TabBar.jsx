// TabBar (VISUAL_SPEC 5.8): <nav role="tablist"> fixo embaixo, 58 px + safe area, fundo --color-page, borda superior 2 px.
// Cinco abas com ícone ilustrado 32 (home, dumbbell, quest-chest, people, avatar), sem rótulo; a ativa ganha a caixa 56x44
// (raio 12, borda 2 px --color-blue-line, fundo --color-blue-soft; escuro: fundo --color-raised) que desliza por layoutId.
// Toque: ícone scale [0.9, 1.05, 1] em 200 ms (o som e o haptic ficam com o App). Badge Pill vermelho na aba Praticar.
// Props: screen (id ativo), onGo(id), badges ({ hub: 3 })
import { useState } from "react";
import { motion } from "motion/react";
import { SPRING } from "../../core/motion.js";
import Icon from "../Icon.jsx";
import { Pill } from "../ui/index.js";

export const NAV = [
  { id: "home", label: "Aprender", icon: "home" },
  { id: "hub", label: "Praticar", icon: "dumbbell" },
  { id: "quests", label: "Missões", icon: "quest-chest" },
  { id: "characters", label: "Personagens", icon: "people" },
  { id: "profile", label: "Perfil", icon: "avatar" },
];

export default function TabBar({ screen, onGo, badges = {} }) {
  const [bump, setBump] = useState({});
  return (
    <nav role="tablist" aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-line bg-page pb-[env(safe-area-inset-bottom)] lg:hidden">
      <div className="mx-auto flex h-[58px] max-w-[600px] items-stretch">
        {NAV.map((n) => {
          const active = screen === n.id;
          const k = bump[n.id] || 0;
          return (
            <button key={n.id} type="button" role="tab" aria-label={n.label} aria-selected={active} aria-current={active ? "page" : undefined}
              onClick={() => { setBump((b) => ({ ...b, [n.id]: (b[n.id] || 0) + 1 })); onGo(n.id); }}
              className="relative flex flex-1 items-center justify-center">
              {active && (
                <motion.span layoutId="tab-active" aria-hidden
                  className="absolute h-11 w-14 rounded-md border-2 border-blue-line bg-blue-soft dark:bg-raised" transition={SPRING.settle} />
              )}
              <motion.span key={k} className="relative inline-flex" initial={false}
                animate={k ? { scale: [0.9, 1.05, 1] } : { scale: 1 }} transition={{ duration: 0.2 }}>
                <Icon name={n.icon} size={32} />
                {badges[n.id] ? <Pill count={badges[n.id]} className="absolute -right-2 -top-1" /> : null}
              </motion.span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
