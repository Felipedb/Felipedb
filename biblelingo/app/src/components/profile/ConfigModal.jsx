// Configurações (VISUAL_SPEC 6.8): view interna do Perfil, não mais um modal. Seções em cards de lista:
// Preferências (toggles), Tema (check azul), Meta diária (rádio), Perfil (nome e avatar) e Zona de perigo
// (apagar com ConfirmSheet, sem confirm() nativo). Tema, som e demais preferências gravam direto no state.
import { useState } from "react";
import { motion } from "motion/react";
import { state, save } from "../../core/store.js";
import { DAILY_GOALS } from "../../core/session.js";
import { CHARACTERS, CHARACTER_UNIT, COURSE, currentLessonId, unitSteps } from "../../core/content.js";
import { CHARACTER_ORDER } from "../../content/index.js";
import { useAppState } from "../../core/useStore.js";
import { sfx } from "../../core/sfx.js";
import { haptic } from "../../core/haptics.js";
import { SPRING, list, item } from "../../core/motion.js";
import Icon from "../Icon.jsx";
import { Toggle, Button3D, ConfirmSheet, Sheet, Avatar } from "../ui/index.js";

const THEMES = [
  { id: "light", icon: "sun", label: "Claro" },
  { id: "dark", icon: "moon", label: "Escuro" },
  { id: "auto", icon: "auto", label: "Automático" },
];
const GOALS = [
  { xp: 10, label: "Casual", sub: "5 min por dia" },
  { xp: 20, label: "Regular", sub: "10 min por dia" },
  { xp: 30, label: "Sério", sub: "15 min por dia" },
  { xp: 50, label: "Intenso", sub: "20 min por dia" },
];
const FOREVER = 8.64e15; // maior data representável: "desligado até segunda ordem"

// Personagens conhecidos: os do capítulo em andamento e dos capítulos com alguma etapa concluída (ordem da galeria)
export function knownCharacters() {
  const cur = currentLessonId();
  const started = new Set();
  COURSE.forEach((u) => {
    const steps = unitSteps(u);
    if (steps.some((s) => state.completed[s.id] || s.id === cur)) started.add(u.id);
  });
  return CHARACTER_ORDER.filter((k) => CHARACTERS[k] && started.has(CHARACTER_UNIT[k]));
}

function Section({ title, children }) {
  return (
    <motion.section variants={item(SPRING.settle, 12)}>
      <h3 className="mb-2 px-1 text-caption uppercase tracking-[.8px] text-ink-soft">{title}</h3>
      <div className="card divide-y-2 divide-line px-4">{children}</div>
    </motion.section>
  );
}

function Row({ label, sub, right, onClick, ariaLabel, selected }) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag type={onClick ? "button" : undefined} onClick={onClick} aria-label={ariaLabel} aria-pressed={onClick && selected != null ? selected : undefined}
      className={`flex min-h-14 w-full items-center gap-3 py-2 text-left ${onClick ? "hover:bg-raised -mx-4 px-4" : ""}`}>
      <span className="min-w-0 flex-1">
        <span className="block text-body text-ink">{label}</span>
        {sub && <span className="block text-secondary text-ink-soft">{sub}</span>}
      </span>
      {right}
    </Tag>
  );
}

function Radio({ on }) {
  return (
    <span aria-hidden className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${on ? "border-accent" : "border-line"}`}>
      {on && <span className="h-3 w-3 rounded-full bg-accent" />}
    </span>
  );
}

// Galeria de avatares: iniciais ou o retrato de um personagem conhecido (persistido em state.avatar)
export function AvatarPicker({ open, onClose, known = [] }) {
  const app = useAppState();
  const choose = (key) => {
    state.avatar = key || null;
    save();
    haptic("select");
    onClose();
  };
  const initials = (app.name || "Discípulo").trim().split(/\s+/).slice(0, 2).map((w) => w[0] || "").join("").toUpperCase() || "D";
  return (
    <Sheet open={open} onClose={onClose} title="Escolha seu avatar" closeButton>
      <p className="-mt-2 mb-4 text-secondary text-ink-soft">Os personagens que você conheceu nas lições podem ser o seu retrato.</p>
      <div className="grid grid-cols-4 gap-3">
        <button type="button" onClick={() => choose(null)} aria-label="Usar minhas iniciais" aria-pressed={!app.avatar}
          className="flex flex-col items-center gap-1.5">
          <span className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-accent text-[26px] font-extrabold text-white"
            style={!app.avatar ? { boxShadow: "0 0 0 4px var(--color-page), 0 0 0 7px var(--color-primary)" } : undefined}>{initials}</span>
          <span className="text-caption uppercase tracking-[.8px] text-ink-soft">Iniciais</span>
        </button>
        {known.map((k) => {
          const ch = { key: k, ...CHARACTERS[k] };
          const sel = app.avatar === k;
          return (
            <button key={k} type="button" onClick={() => choose(k)} aria-label={ch.name} aria-pressed={sel} className="flex flex-col items-center gap-1.5">
              <Avatar ch={ch} size={72} ring={sel ? "var(--color-primary)" : undefined} badge={sel ? "check" : null} />
              <span className="max-w-full truncate text-caption uppercase tracking-[.8px] text-ink-soft">{ch.name.split(" (")[0].split(" ")[0]}</span>
            </button>
          );
        })}
      </div>
      {!known.length && <p className="mt-4 text-center text-secondary text-ink-soft">Conclua uma etapa para liberar os retratos dos personagens.</p>}
    </Sheet>
  );
}

export default function Settings({ onBack }) {
  const app = useAppState();
  const [confirm, setConfirm] = useState(false);
  const [picker, setPicker] = useState(false);
  const set = (k, v) => { state[k] = v; save(); };
  const setTheme = (id) => { sfx("tap"); set("theme", id); };
  const setGoal = (xp) => { sfx("tap"); haptic("select"); set("dailyGoal", xp); };
  const setName = (v) => set("name", v.slice(0, 18));
  const speakOn = !(app.speakMutedUntil && Date.now() < app.speakMutedUntil);
  const listenOn = !(app.listenMutedUntil && Date.now() < app.listenMutedUntil);
  const reset = () => {
    try { localStorage.removeItem("biblelingo"); } catch (e) { /* segue */ }
    location.reload();
  };
  const avatarCh = app.avatar && CHARACTERS[app.avatar] ? { key: app.avatar, ...CHARACTERS[app.avatar] } : null;

  return (
    <div className="mx-auto w-full max-w-[560px] px-4 pb-8 pt-2" data-screen="settings">
      <div className="mb-4 flex items-center gap-2">
        <button type="button" onClick={() => { sfx("tap"); onBack(); }} aria-label="Voltar"
          className="-ml-2 flex h-11 w-11 items-center justify-center rounded-md text-ink-soft hover:bg-raised">
          <Icon name="arrow-left" size={24} />
        </button>
        <h2 className="text-title text-ink">Configurações</h2>
      </div>

      <motion.div className="flex flex-col gap-6" variants={list(0.05)} initial="hidden" animate="show">
        <Section title="Preferências">
          <Row label="Efeitos sonoros" right={<Toggle checked={app.sound !== false} onChange={(v) => { set("sound", v); if (v) sfx("correct"); }} label="Efeitos sonoros" />} />
          <Row label="Vibração" right={<Toggle checked={app.haptics !== false} onChange={(v) => { set("haptics", v); if (v) haptic("correct"); }} label="Vibração" />} />
          <Row label="Animações" sub="Movimento dos personagens e das recompensas" right={<Toggle checked={app.animations !== false} onChange={(v) => set("animations", v)} label="Animações" />} />
          <Row label="Alto contraste" right={<Toggle checked={!!app.highContrast} onChange={(v) => set("highContrast", v)} label="Alto contraste" />} />
          <Row label="Exercícios de fala" sub="Praticar pronúncia com o microfone" right={<Toggle checked={speakOn} onChange={(v) => set("speakMutedUntil", v ? 0 : FOREVER)} label="Exercícios de fala" />} />
          <Row label="Exercícios de escuta" sub="Ouvir e escolher o que foi dito" right={<Toggle checked={listenOn} onChange={(v) => set("listenMutedUntil", v ? 0 : FOREVER)} label="Exercícios de escuta" />} />
        </Section>

        <Section title="Tema">
          {THEMES.map((t) => {
            const on = (app.theme || "auto") === t.id;
            return (
              <Row key={t.id} onClick={() => setTheme(t.id)} selected={on} ariaLabel={`Tema ${t.label}`}
                label={<span className="flex items-center gap-3"><Icon name={t.icon} size={24} className="text-ink-soft" />{t.label}</span>}
                right={on ? <Icon name="check" size={24} tone="var(--color-accent)" /> : null} />
            );
          })}
        </Section>

        <Section title="Meta diária">
          {GOALS.filter((g) => DAILY_GOALS.includes(g.xp)).map((g) => {
            const on = app.dailyGoal === g.xp;
            return (
              <Row key={g.xp} onClick={() => setGoal(g.xp)} selected={on} ariaLabel={`Meta ${g.label}, ${g.xp} XP por dia`}
                label={<span className="flex items-center gap-2"><span className="font-bold">{g.label}</span><span className="text-secondary text-yellow-text">{g.xp} XP</span></span>}
                sub={g.sub} right={<Radio on={on} />} />
            );
          })}
        </Section>

        <Section title="Perfil">
          <label className="flex min-h-14 items-center gap-3 py-2">
            <span className="w-24 shrink-0 text-body text-ink">Nome</span>
            <input type="text" maxLength={18} placeholder="Como quer ser chamado?" value={app.name || ""} onChange={(e) => setName(e.target.value)}
              className="h-12 min-w-0 flex-1 rounded-md border-2 border-line bg-page px-3 text-body text-ink outline-none placeholder:text-disabled focus:border-accent" />
          </label>
          <Row label="Avatar" sub={avatarCh ? avatarCh.name.split(" (")[0] : "Suas iniciais"} onClick={() => { sfx("tap"); setPicker(true); }} ariaLabel="Escolher avatar"
            right={<span className="flex items-center gap-2">
              {avatarCh ? <Avatar ch={avatarCh} size={40} /> : <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-[15px] font-extrabold text-white">{(app.name || "D").trim()[0].toUpperCase()}</span>}
              <Icon name="chevron-right" size={24} tone="var(--color-disabled)" />
            </span>} />
        </Section>

        <motion.section variants={item(SPRING.settle, 12)}>
          <h3 className="mb-2 px-1 text-caption uppercase tracking-[.8px] text-red-text">Zona de perigo</h3>
          <Button3D variant="danger" block onClick={() => setConfirm(true)}>Apagar todo o progresso</Button3D>
          <p className="mt-2 px-1 text-secondary text-ink-soft">Seu progresso fica salvo só neste aparelho.</p>
        </motion.section>
      </motion.div>

      <ConfirmSheet open={confirm} title="Apagar todo o progresso?" text="Isso apaga lições, estrelas e ofensiva deste aparelho."
        confirmLabel="Apagar" cancelLabel="Cancelar" danger onConfirm={reset} onCancel={() => setConfirm(false)} />
      <AvatarPicker open={picker} onClose={() => setPicker(false)} known={knownCharacters()} />
    </div>
  );
}
