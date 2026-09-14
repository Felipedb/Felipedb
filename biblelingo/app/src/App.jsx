import { useEffect, useState, useCallback } from "react";
import confettiFx from "canvas-confetti";
import { useAppState } from "./core/useStore.js";
import { useSessionVersion } from "./core/useSession.js";
import { session } from "./core/session.js";
import { onUI } from "./core/events.js";
import { ensureDay, state, save } from "./core/store.js";
import { REDUCED_MOTION } from "./core/util.js";
import { SFX } from "../../sfx.js";
import Home from "./screens/Home.jsx";
import Lesson from "./screens/Lesson.jsx";
import Result from "./screens/Result.jsx";
import Hub from "./screens/Hub.jsx";
import Quests from "./screens/Quests.jsx";
import Characters from "./screens/Characters.jsx";
import Profile from "./screens/Profile.jsx";
import HeartsModal from "./components/HeartsModal.jsx";
import Toast from "./components/Toast.jsx";
import Icon from "./components/Icon.jsx";

const NAV = [
  { id: "home", label: "Aprender", icon: "home" },
  { id: "hub", label: "Praticar", icon: "practice" },
  { id: "quests", label: "Missões", icon: "quest" },
  { id: "characters", label: "Personagens", icon: "people" },
  { id: "profile", label: "Perfil", icon: "user" },
];

export default function App() {
  const app = useAppState();
  useSessionVersion();
  const [screen, setScreen] = useState("home");
  const [toasts, setToasts] = useState([]);
  const [heartsOpen, setHeartsOpen] = useState(false);

  // Tema claro/escuro/automático
  useEffect(() => {
    const apply = () => {
      const sysDark = matchMedia("(prefers-color-scheme: dark)").matches;
      const dark = app.theme === "dark" || (app.theme !== "light" && sysDark);
      document.documentElement.classList.toggle("dark", dark);
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.content = dark ? "#131f24" : "#58a700";
    };
    apply();
    const mq = matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [app.theme]);

  // Eventos da lógica: navegação, toast, sons, confete, modal de corações
  useEffect(() => onUI((ev) => {
    if (ev.type === "navigate") setScreen(ev.screen);
    if (ev.type === "toast") {
      const id = Math.random().toString(36).slice(2);
      setToasts((t) => [...t.slice(-2), { id, text: ev.text, cls: ev.cls }]);
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 1600);
    }
    if (ev.type === "sfx" && SFX[ev.name]) { try { SFX[ev.name](ev.arg); } catch (e) { /* sem som */ } }
    if (ev.type === "confetti" && !REDUCED_MOTION) confettiFx(ev.opts);
    if (ev.type === "hearts-modal") setHeartsOpen(true);
  }), []);

  useEffect(() => { ensureDay(); }, [screen]);
  useEffect(() => { if (screen !== "home") window.scrollTo(0, 0); }, [screen]);

  const inLesson = session && screen === "lesson";
  const showTabs = !inLesson && screen !== "lesson";

  const go = useCallback((id) => {
    SFX.tap && SFX.tap();
    setScreen(id);
  }, []);

  return (
    <div className="min-h-dvh lg:mx-auto lg:flex lg:max-w-6xl lg:gap-6 lg:px-6">
      {/* Sidebar (desktop) */}
      {showTabs && (
        <aside className="hidden lg:block lg:w-56 lg:shrink-0 lg:pt-6">
          <div className="font-display text-2xl font-extrabold text-brand">BíbliaLearn</div>
          <nav className="mt-6 flex flex-col gap-1">
            {NAV.map((n) => (
              <button key={n.id} onClick={() => go(n.id)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left font-bold transition-colors ${screen === n.id ? "bg-sky-soft text-sky-fg ring-2 ring-sky-line" : "text-ink-soft hover:bg-hover"}`}>
                <Icon name={n.icon} /> {n.label}
              </button>
            ))}
          </nav>
        </aside>
      )}

      <main className={`min-h-dvh flex-1 ${showTabs ? "pb-24 lg:pb-8" : ""}`}>
        {screen === "home" && <Home go={go} />}
        {screen === "lesson" && session && <Lesson />}
        {screen === "lesson" && !session && <Home go={go} />}
        {screen === "result" && <Result />}
        {screen === "hub" && <Hub go={go} />}
        {screen === "quests" && <Quests />}
        {screen === "characters" && <Characters />}
        {screen === "profile" && <Profile />}
      </main>

      {/* Navegação inferior (mobile) */}
      {showTabs && (
        <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t-2 border-line bg-card pb-[env(safe-area-inset-bottom)] lg:hidden">
          {NAV.map((n) => (
            <button key={n.id} onClick={() => go(n.id)} aria-label={n.label}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-bold ${screen === n.id ? "text-brand" : "text-ink-soft"}`}>
              <Icon name={n.icon} className="text-xl" /> {n.label}
            </button>
          ))}
        </nav>
      )}

      <Toast toasts={toasts} />
      {heartsOpen && <HeartsModal onClose={() => setHeartsOpen(false)} />}
    </div>
  );
}
