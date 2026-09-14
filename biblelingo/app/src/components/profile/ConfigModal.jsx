// Configurações: porta de openConfig + modal-config (index.html/app.js)
// Tema e som gravam direto no state; o App aplica o tema ao salvar.
import { useEffect } from "react";
import { motion } from "motion/react";
import { state, save } from "../../core/store.js";
import { sfx } from "../../core/events.js";
import { useAppState } from "../../core/useStore.js";
import Icon from "../Icon.jsx";

const THEMES = [
  { id: "light", icon: "sun", label: "Claro" },
  { id: "dark", icon: "moon", label: "Escuro" },
  { id: "auto", icon: "auto", label: "Automático" },
];

export default function ConfigModal({ onClose }) {
  const app = useAppState();

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  const setTheme = (id) => { state.theme = id; save(); sfx("tap"); };
  const setSound = (checked) => { state.sound = checked; save(); if (checked) sfx("correct"); };
  const setName = (v) => { state.name = v.trim().slice(0, 18); save(); };
  const reset = () => {
    if (!confirm("Apagar todo o progresso deste aparelho?")) return;
    try { localStorage.removeItem("biblelingo"); } catch (e) { /* segue */ }
    location.reload();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog" aria-modal="true" aria-label="Configurações"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="max-h-[90dvh] w-full max-w-sm overflow-y-auto rounded-3xl bg-card p-5 text-center">
        <div className="text-5xl">⚙️</div>
        <h3 className="mt-1 font-display text-xl font-extrabold">Configurações</h3>
        <p className="mt-1 text-sm font-bold text-ink-soft">Seu progresso fica salvo neste aparelho.</p>

        <div className="mt-4 grid grid-cols-3 gap-2" role="group" aria-label="Tema">
          {THEMES.map((t) => (
            <button key={t.id} data-theme-opt={t.id} aria-pressed={app.theme === t.id} onClick={() => setTheme(t.id)}
              className={`flex flex-col items-center gap-1 rounded-2xl border-2 px-2 py-3 text-[13px] font-extrabold ${
                app.theme === t.id ? "border-sky bg-sky-soft text-sky-fg" : "border-line bg-cream text-ink-soft"}`}>
              <Icon name={t.icon} className="text-2xl" /><span>{t.label}</span>
            </button>
          ))}
        </div>

        <label className="mt-3.5 flex items-center justify-between gap-3 rounded-2xl border-2 border-line bg-cream px-3.5 py-3 text-[15px] font-extrabold">
          <span className="flex-none">🙋 Seu nome</span>
          <input type="text" maxLength={18} placeholder="Qual é o seu nome?" value={app.name || ""}
            onChange={(e) => setName(e.target.value)} aria-label="Seu nome"
            className="min-w-0 flex-1 rounded-lg border-2 border-line bg-card px-2.5 py-1.5 text-right text-sm font-bold outline-none focus:border-sky" />
        </label>

        <label className="mt-3.5 flex items-center justify-between gap-3 rounded-2xl border-2 border-line bg-cream px-3.5 py-3 text-[15px] font-extrabold">
          <span>🔊 Efeitos sonoros</span>
          <input type="checkbox" checked={app.sound !== false} onChange={(e) => setSound(e.target.checked)}
            className="h-6 w-11 accent-brand-bright" />
        </label>

        <button onClick={reset} className="btn-3d mt-4 w-full bg-danger py-3 text-white" style={{ "--btn-shadow": "var(--color-danger-dark)" }}>
          Apagar todo o progresso
        </button>
        <button onClick={() => { sfx("tap"); onClose(); }} className="mt-3 w-full rounded-2xl py-2.5 font-display font-bold text-ink-soft hover:bg-hover">
          Fechar
        </button>
      </motion.div>
    </div>
  );
}
