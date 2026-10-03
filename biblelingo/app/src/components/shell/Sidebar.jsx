// Sidebar (VISUAL_SPEC 5.8, lg): 256 px, marca (brand-mark 28 + wordmark) e itens de 48 px com ícone ilustrado 32 e rótulo
// 15/700 em caixa alta (tracking 0,8 px) em --color-ink-soft; o ativo recebe a mesma caixa azul da tab bar e texto --color-blue-text.
// Props: screen, onGo(id), badges
import { motion } from "motion/react";
import { SPRING } from "../../core/motion.js";
import Icon from "../Icon.jsx";
import { Pill } from "../ui/index.js";
import { NAV } from "./TabBar.jsx";

export default function Sidebar({ screen, onGo, badges = {} }) {
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-6 flex flex-col">
        <div className="flex items-center gap-2 px-3 py-2" aria-label="BíbliaLearn">
          <Icon name="brand-mark" size={28} />
          <span className="font-logo text-[22px] font-extrabold leading-none"><span className="text-ink">Bíblia</span><span className="text-green">Learn</span></span>
        </div>
        <nav className="mt-5 flex flex-col gap-1" aria-label="Navegação principal">
          {NAV.map((n) => {
            const active = screen === n.id;
            return (
              <button key={n.id} type="button" aria-current={active ? "page" : undefined} onClick={() => onGo(n.id)}
                className={`relative flex h-12 items-center gap-3 rounded-md px-3 text-left text-secondary font-bold uppercase tracking-[.8px] ${active ? "text-blue-text" : "text-ink-soft hover:bg-raised"}`}>
                {active && (
                  <motion.span layoutId="side-active" aria-hidden
                    className="absolute inset-0 rounded-md border-2 border-blue-line bg-blue-soft dark:bg-raised" transition={SPRING.settle} />
                )}
                <span className="relative inline-flex">
                  <Icon name={n.icon} size={32} />
                  {badges[n.id] ? <Pill count={badges[n.id]} className="absolute -right-2 -top-1" /> : null}
                </span>
                <span className="relative">{n.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
