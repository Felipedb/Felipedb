// Perfil (VISUAL_SPEC 6.8): banner do capítulo com o avatar do usuário, visão geral em StatCards 2x2, conquistas como
// escudos, calendário mensal da ofensiva e capítulos concluídos como medalhas. Configurações é uma view interna
// (entra pela direita, com botão voltar e history.pushState para o voltar do Android).
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useAppState } from "../core/useStore.js";
import { state, save } from "../core/store.js";
import { CHARACTERS, COURSE, unitDone, currentLessonId, unitSteps } from "../core/content.js";
import { today, dateKey, normalize } from "../core/util.js";
import { SPRING, STAGGER, list, item } from "../core/motion.js";
import { unitVars, unitMotif } from "../core/palette.js";
import { useIsDark } from "../components/shell/useIsDark.js";
import { sfx } from "../core/sfx.js";
import { haptic } from "../core/haptics.js";
import Icon from "../components/Icon.jsx";
import { Card, StatCard, Shield, Medal, ProgressBar, Avatar } from "../components/ui/index.js";
import Settings, { AvatarPicker, knownCharacters } from "../components/profile/ConfigModal.jsx";

// Lista exata de conquistas do app clássico (screens.js), agora com escudos 1 a 6
const ACHIEVEMENTS = [
  { id: "steps", title: "Primeiros passos", desc: "Etapas concluídas", tiers: [1, 5, 15, 32], value: () => Object.keys(state.completed || {}).length },
  { id: "flame", title: "Chama da fé", desc: "Dias seguidos", tiers: [3, 7, 14, 30], value: () => state.streak || 0 },
  { id: "wise", title: "Sábio", desc: "XP acumulado", tiers: [100, 500, 1000, 5000], value: () => state.xp || 0 },
  { id: "perfect", title: "Perfeccionista", desc: "Etapas sem erros", tiers: [1, 5, 10, 20], value: () => Object.values(state.stars || {}).filter((s) => s === 3).length },
  { id: "stories", title: "Contador de histórias", desc: "Histórias lidas", tiers: [1, 4, 8], value: () => Object.keys(state.stories || {}).length },
  { id: "crowns", title: "Coroado", desc: "Coroas conquistadas", tiers: [1, 5, 15, 40], value: () => Object.values(state.crowns || {}).reduce((s, c) => s + c, 0) },
];

const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const WEEK = ["S", "T", "Q", "Q", "S", "S", "D"];

function currentUnit() {
  const cur = currentLessonId();
  return COURSE.find((u) => unitSteps(u).some((s) => s.id === cur)) || COURSE[COURSE.length - 1];
}

const initialsOf = (name = "") => name.trim().split(/\s+/).slice(0, 2).map((w) => w[0] || "").join("").toUpperCase() || "D";
const slugOf = (name = "") => "@" + (normalize(name).replace(/[^a-z0-9]/g, "") || "discipulo");

// Avatar do usuário: retrato de um personagem conhecido (state.avatar) ou iniciais sobre --color-accent. Nunca o retrato de Jesus por padrão.
export function UserAvatar({ size = 96, className = "" }) {
  const app = useAppState();
  const ch = app.avatar && CHARACTERS[app.avatar] ? { key: app.avatar, ...CHARACTERS[app.avatar] } : null;
  if (ch) return <Avatar ch={ch} size={size} className={className} alt="Seu avatar" />;
  return (
    <span className={`inline-flex shrink-0 items-center justify-center rounded-full bg-accent font-extrabold text-white ${className}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }} role="img" aria-label="Seu avatar">
      {initialsOf(app.name || "Discípulo")}
    </span>
  );
}

// ---------- Calendário mensal da ofensiva (7 colunas): chama nas datas estudadas, hoje com anel laranja ----------
export function StreakCalendar({ className = "" }) {
  const app = useAppState();
  const now = new Date();
  const [cursor, setCursor] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const hoje = today();
  const first = new Date(cursor.y, cursor.m, 1);
  const lead = (first.getDay() + 6) % 7; // segunda = 0
  const total = new Date(cursor.y, cursor.m + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= total; d++) cells.push(new Date(cursor.y, cursor.m, d));
  while (cells.length % 7) cells.push(null);
  const move = (dir) => { sfx("tap"); setCursor((c) => { const d = new Date(c.y, c.m + dir, 1); return { y: d.getFullYear(), m: d.getMonth() }; }); };
  const studiedInMonth = cells.filter((d) => d && (app.days || {})[dateKey(d)] > 0).length;

  return (
    <div className={className}>
      <div className="mb-3 flex items-center justify-between">
        <button type="button" onClick={() => move(-1)} aria-label="Mês anterior" className="flex h-11 w-11 items-center justify-center rounded-md text-ink-soft hover:bg-raised">
          <Icon name="arrow-left" size={24} />
        </button>
        <div className="text-center">
          <div className="text-body font-bold text-ink">{MESES[cursor.m][0].toUpperCase() + MESES[cursor.m].slice(1)} de {cursor.y}</div>
          <div className="text-caption uppercase tracking-[.8px] text-ink-soft">{studiedInMonth} {studiedInMonth === 1 ? "dia estudado" : "dias estudados"}</div>
        </div>
        <button type="button" onClick={() => move(1)} aria-label="Próximo mês" className="flex h-11 w-11 items-center justify-center rounded-md text-ink-soft hover:bg-raised">
          <Icon name="arrow-right" size={24} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center">
        {WEEK.map((w, i) => <span key={i} className="text-caption uppercase tracking-[.8px] text-ink-soft">{w}</span>)}
        {cells.map((d, i) => {
          if (!d) return <span key={i} />;
          const key = dateKey(d);
          const studied = (app.days || {})[key] > 0;
          const isToday = key === hoje;
          const future = key > hoje;
          return (
            <span key={i} className="flex justify-center py-0.5">
              <span className={`flex h-8 w-8 items-center justify-center rounded-full text-secondary font-bold tabular-nums ${
                studied ? "bg-orange-soft text-orange-text" : isToday ? "border-2 border-orange text-ink" : future ? "text-disabled" : "text-ink-soft"}`}
                aria-label={`${d.getDate()}${studied ? ": estudou" : isToday ? ": hoje" : ""}`}>
                {studied ? <Icon name="flame" size={20} /> : d.getDate()}
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

function Achievement({ a, n }) {
  const v = a.value();
  let lvl = a.tiers.findIndex((t) => v < t);
  if (lvl < 0) lvl = a.tiers.length;
  const target = a.tiers[Math.min(lvl, a.tiers.length - 1)];
  const maxed = lvl >= a.tiers.length;
  const shown = maxed ? target : Math.min(v, target);
  const level = maxed ? a.tiers.length : lvl + 1; // nível em andamento (1 enquanto a primeira meta não foi batida)
  return (
    <motion.div variants={item(SPRING.settle, 12)} className="flex min-h-24 items-center gap-4 py-2">
      <Shield n={n} level={level} label={`${a.title}, nível ${level}`} className={lvl === 0 ? "opacity-60 grayscale" : ""} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <b className="truncate text-body font-bold text-ink">{a.title}</b>
          <span className="shrink-0 text-secondary text-ink-soft">{maxed ? "Nível máximo" : `Nível ${level}`}</span>
        </div>
        <ProgressBar variant="labelled" value={shown} max={target} label={`${shown}/${target}`} done={maxed} delay={0.1 * n} className="mt-1.5" />
        <div className="mt-1.5 text-secondary text-ink-soft">{a.desc}</div>
      </div>
    </motion.div>
  );
}

function ProfileView({ onSettings }) {
  const app = useAppState();
  const dark = useIsDark();
  const unit = currentUnit();
  const [allAch, setAllAch] = useState(false);
  const [picker, setPicker] = useState(false);

  // Primeira visita: registra o mês de entrada (como renderProfile)
  useEffect(() => { if (!state.joined) { state.joined = today(); save(); } }, []);

  const [y, m] = String(app.joined || today()).split("-");
  const crowns = Object.values(app.crowns || {}).reduce((s, c) => s + c, 0);
  const stars = Object.values(app.stars || {}).reduce((s, x) => s + Math.min(3, Number(x) || 0), 0);
  const doneUnits = COURSE.filter((u) => unitDone(u)).length;
  const achievements = allAch ? ACHIEVEMENTS : ACHIEVEMENTS.slice(0, 3);
  const known = knownCharacters();

  return (
    <motion.div key="profile" className="mx-auto flex w-full max-w-[560px] flex-col gap-4 px-4 pb-6 pt-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.12 } }} transition={{ duration: 0.2 }}>
      {/* Banner do capítulo + avatar do usuário */}
      <div style={unitVars(unit.id, dark)}>
        <div className="relative h-[120px] overflow-hidden rounded-lg" style={{ background: "linear-gradient(135deg, var(--unit-color), var(--unit-shadow))" }}>
          <Icon name={unitMotif(unit.id)} size={120} tone="mono" className="absolute -bottom-4 right-16 text-white opacity-20" />
          <button type="button" onClick={() => { sfx("tap"); haptic("tap"); onSettings(); }} aria-label="Configurações"
            className="absolute right-1 top-1 flex h-11 w-11 items-center justify-center rounded-md text-white/80 hover:text-white">
            <Icon name="gear" size={24} />
          </button>
        </div>
        <div className="-mt-12 flex items-end gap-3 px-2">
          <button type="button" onClick={() => { sfx("tap"); setPicker(true); }} aria-label="Escolher avatar" className="rounded-full border-4 border-page bg-page">
            <UserAvatar size={96} />
          </button>
        </div>
      </div>
      <div className="-mt-2 px-2">
        <h2 className="truncate text-title text-ink">{app.name || "Discípulo"}</h2>
        <p className="mt-0.5 text-secondary text-ink-soft">{slugOf(app.name)} · Entrou em {MESES[+m - 1]} de {y}</p>
      </div>

      {/* Visão geral */}
      <section>
        <h3 className="mb-3 text-heading text-ink">Visão geral</h3>
        <div className="grid grid-cols-2 gap-3">
          <StatCard size="profile" label="Ofensiva" value={app.streak || 0} format={(v) => `${v} ${v === 1 ? "dia" : "dias"}`} icon="flame" color="orange" />
          <StatCard size="profile" label="XP total" value={app.xp || 0} format={(v) => `${v} XP`} icon="bolt" color="yellow" delay={0.1} />
          <StatCard size="profile" label="Coroas" value={crowns} icon="crown" color="yellow" delay={0.2} />
          <StatCard size="profile" label="Estrelas" value={stars} icon="star" color="green" delay={0.3} />
        </div>
      </section>

      {/* Conquistas */}
      <section>
        <div className="mb-1 flex items-baseline justify-between">
          <h3 className="text-heading text-ink">Conquistas</h3>
          <button type="button" onClick={() => { sfx("tap"); setAllAch((v) => !v); }} className="text-caption uppercase tracking-[.8px] text-blue-text">
            {allAch ? "Ver menos" : "Ver tudo"}
          </button>
        </div>
        <Card padding="none" className="px-4">
          <motion.div className="divide-y-2 divide-line" variants={list(STAGGER.cards * 0.5)} initial="hidden" animate="show">
            {achievements.map((a, i) => <Achievement key={a.id} a={a} n={ACHIEVEMENTS.indexOf(a) + 1} />)}
          </motion.div>
        </Card>
      </section>

      {/* Ofensiva: calendário do mês */}
      <section>
        <h3 className="mb-3 text-heading text-ink">Ofensiva</h3>
        <Card><StreakCalendar /></Card>
      </section>

      {/* Capítulos concluídos */}
      <section>
        <h3 className="mb-3 text-heading text-ink">Capítulos concluídos</h3>
        <Card>
          <div className="flex flex-wrap gap-3">
            {COURSE.map((u) => <Medal key={u.id} unitId={u.id} size={64} locked={!unitDone(u)} label={unitDone(u) ? `${u.title}: concluído` : `${u.title}: bloqueado`} />)}
          </div>
          {!doneUnits && <p className="mt-3 text-secondary text-ink-soft">Conclua o Capítulo 1 para ganhar sua primeira medalha</p>}
        </Card>
      </section>

      <AvatarPicker open={picker} onClose={() => setPicker(false)} known={known} />
    </motion.div>
  );
}

export default function Profile() {
  const [view, setView] = useState("profile"); // "profile" | "settings"

  // Voltar do Android: a view de Configurações entra no histórico e sai com popstate
  useEffect(() => {
    const onPop = () => setView("profile");
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  const openSettings = () => {
    try { history.pushState({ blSettings: true }, ""); } catch (e) { /* sem histórico */ }
    setView("settings");
  };
  const back = () => {
    if (typeof history !== "undefined" && history.state && history.state.blSettings) history.back();
    else setView("profile");
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      {view === "settings" ? (
        <motion.div key="settings" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%", transition: { duration: 0.2 } }} transition={SPRING.settle}>
          <Settings onBack={back} />
        </motion.div>
      ) : (
        <ProfileView key="profile" onSettings={openSettings} />
      )}
    </AnimatePresence>
  );
}
