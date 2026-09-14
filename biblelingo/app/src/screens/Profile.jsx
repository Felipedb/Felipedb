// Perfil: avatar, estatísticas, conquistas e capítulos concluídos
// Porta fiel de renderProfile + ACHIEVEMENTS (screens.js); configurações em ConfigModal.
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useAppState } from "../core/useStore.js";
import { state, save } from "../core/store.js";
import { CHARACTERS, COURSE, unitDone } from "../core/content.js";
import { today } from "../core/util.js";
import { sfx } from "../core/events.js";
import CharFace from "../components/CharFace.jsx";
import Icon from "../components/Icon.jsx";
import ConfigModal from "../components/profile/ConfigModal.jsx";

// Lista exata de conquistas do app clássico (screens.js)
const ACHIEVEMENTS = [
  { id: "steps", icon: "📖", title: "Primeiros passos", desc: "Etapas concluídas", tiers: [1, 5, 15, 32], value: () => Object.keys(state.completed || {}).length },
  { id: "flame", icon: "🔥", title: "Chama da fé", desc: "Dias seguidos", tiers: [3, 7, 14, 30], value: () => state.streak || 0 },
  { id: "wise", icon: "⚡", title: "Sábio", desc: "XP acumulado", tiers: [100, 500, 1000, 5000], value: () => state.xp || 0 },
  { id: "perfect", icon: "🌟", title: "Perfeccionista", desc: "Etapas sem erros", tiers: [1, 5, 10, 20], value: () => Object.values(state.stars || {}).filter((s) => s === 3).length },
  { id: "stories", icon: "📚", title: "Contador de histórias", desc: "Histórias lidas", tiers: [1, 4, 8], value: () => Object.keys(state.stories || {}).length },
  { id: "crowns", icon: "👑", title: "Coroado", desc: "Coroas conquistadas", tiers: [1, 5, 15, 40], value: () => Object.values(state.crowns || {}).reduce((s, c) => s + c, 0) },
];

const BADGES = [
  { icon: "📖", color: "#58a700", unit: "u1" }, { icon: "🚢", color: "#7e57c2", unit: "u2" }, { icon: "🔥", color: "#e05d2f", unit: "u3" },
  { icon: "👑", color: "#e6a817", unit: "u4" }, { icon: "📜", color: "#1cb0f6", unit: "u5" }, { icon: "🌾", color: "#2e9d8a", unit: "u6" },
  { icon: "🦁", color: "#c0392b", unit: "u7" }, { icon: "🐟", color: "#3f7fd6", unit: "u8" },
];

const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

function Achievement({ a, index }) {
  const v = a.value();
  let lvl = a.tiers.findIndex((t) => v < t);
  if (lvl < 0) lvl = a.tiers.length;
  const target = a.tiers[Math.min(lvl, a.tiers.length - 1)];
  const maxed = lvl >= a.tiers.length;
  const pct = maxed ? 100 : Math.min(100, Math.round((v / target) * 100));
  const earned = lvl > 0;
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: 0.05 * index, ease: "easeOut" }}
      className="card flex items-center gap-3 p-3">
      <span className={`flex h-[58px] w-[58px] flex-none flex-col items-center justify-center rounded-2xl ${
        earned ? "bg-gradient-to-b from-[#ffd166] to-gold shadow-[0_3px_0_#c9920c]" : "bg-track"}`}>
        <i className="text-2xl not-italic leading-none">{a.icon}</i>
        <b className={`mt-0.5 text-[9px] font-black uppercase ${earned ? "text-[#7a5300]" : "text-ink-soft"}`}>
          {maxed ? "MAX" : earned ? `Nível ${lvl}` : ""}
        </b>
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <b className="font-display font-extrabold">{a.title}</b>
          <small className="text-xs font-bold text-ink-soft">{maxed ? v : `${v}/${target}`}</small>
        </div>
        <div className="text-[13px] font-bold text-ink-soft">{a.desc}</div>
        <div className="mt-1 h-2 overflow-hidden rounded-md bg-track">
          <div className="h-full rounded-md bg-gradient-to-b from-[#ffd166] to-gold transition-[width] duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </motion.div>
  );
}

export default function Profile() {
  const app = useAppState();
  const [configOpen, setConfigOpen] = useState(false);

  // Primeira visita: registra o mês de entrada (como renderProfile)
  useEffect(() => {
    if (!state.joined) { state.joined = today(); save(); }
  }, []);

  const [y, m] = String(app.joined || today()).split("-");
  const crowns = Object.values(app.crowns || {}).reduce((s, c) => s + c, 0);
  const stars = Object.values(app.stars || {}).reduce((s, x) => s + Math.min(3, Number(x) || 0), 0);
  const tiles = [
    ["🔥", app.streak, "Dias seguidos"], ["⚡", app.xp, "XP total"], ["👑", crowns, "Coroas"], ["⭐", stars, "Estrelas"],
  ];

  return (
    <div className="mx-auto flex w-full max-w-[560px] flex-col gap-3 px-4 pb-6 pt-4">
      {/* Cabeçalho */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: "easeOut" }}
        className="flex items-center gap-3.5 py-1.5">
        <CharFace ch={CHARACTERS.jesus} className="h-[84px] w-[84px] flex-none border-4 border-brand-bright text-5xl shadow-[0_4px_0_var(--color-brand-shadow)]" />
        <div className="min-w-0 flex-1">
          <h2 id="prof-name" className="truncate font-display text-2xl font-extrabold">{app.name || "Discípulo"}</h2>
          <p className="text-[13px] font-bold text-ink-soft">Membro desde {MESES[+m - 1]} de {y}</p>
        </div>
        <button onClick={() => { sfx("tap"); setConfigOpen(true); }} aria-label="Configurações"
          className="flex h-[42px] w-[42px] flex-none items-center justify-center rounded-xl border-2 border-line bg-card text-ink-soft">
          <Icon name="gear" className="text-2xl" />
        </button>
      </motion.div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 gap-2.5">
        {tiles.map(([i, v, l], k) => (
          <motion.div key={l} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: 0.04 * k, ease: "easeOut" }}
            className="card flex items-center gap-2.5 px-3.5 py-3">
            <span className="text-2xl">{i}</span>
            <span><b className="block text-xl leading-tight">{v}</b>
            <small className="text-xs font-bold text-ink-soft">{l}</small></span>
          </motion.div>
        ))}
      </div>

      {/* Conquistas */}
      <h3 className="mt-2 font-display text-[19px] font-extrabold">🏆 Conquistas</h3>
      <div className="flex flex-col gap-2.5">
        {ACHIEVEMENTS.map((a, i) => <Achievement key={a.id} a={a} index={i} />)}
      </div>

      {/* Capítulos concluídos */}
      <h3 className="mt-2 font-display text-[19px] font-extrabold">📚 Capítulos concluídos</h3>
      <div className="flex flex-wrap gap-2.5">
        {BADGES.map((b) => {
          const u = COURSE.find((x) => x.id === b.unit);
          const done = u && unitDone(u);
          return (
            <span key={b.unit} title={u ? u.title : ""}
              className={`flex h-12 w-11 items-center justify-center text-xl text-white ${done ? "" : "grayscale opacity-70 dark:brightness-75"}`}
              style={{
                background: done ? b.color : "var(--color-locked)",
                clipPath: "polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)",
              }}>
              {b.icon}
            </span>
          );
        })}
      </div>

      {configOpen && <ConfigModal onClose={() => setConfigOpen(false)} />}
    </div>
  );
}
