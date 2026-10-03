// Casca do app (VISUAL_SPEC 5.7, 5.8 e 6.12): TabBar fixa no mobile; no desktop, grid de três colunas (Sidebar, centro, RightRail
// com HUD, missões, versículo e ofensiva). Lição e Result ocupam a tela inteira, sem abas. Toasts viram Snackbar acima da tab bar.
import { useEffect, useState, useCallback, lazy, Suspense } from "react";
import confettiFx from "canvas-confetti";
import { motion, useReducedMotion } from "motion/react";
import { useAppState } from "./core/useStore.js";
import { useSessionVersion } from "./core/useSession.js";
import { session, startLesson } from "./core/session.js";
import { onUI } from "./core/events.js";
import { ensureDay } from "./core/store.js";
import { sfx } from "./core/sfx.js";
import { haptic } from "./core/haptics.js";
import { SPRING } from "./core/motion.js";
import Home from "./screens/Home.jsx";
import Lesson from "./screens/Lesson.jsx";
import Result from "./screens/Result.jsx";
import Hub from "./screens/Hub.jsx";
import Quests from "./screens/Quests.jsx";
import Characters from "./screens/Characters.jsx";
import Profile from "./screens/Profile.jsx";
import HeartsModal from "./components/HeartsModal.jsx";
import { Snackbar } from "./components/ui/index.js";
import TabBar from "./components/shell/TabBar.jsx";
import Sidebar from "./components/shell/Sidebar.jsx";
import RightRail from "./components/shell/RightRail.jsx";
// Galeria dos componentes base, só em desenvolvimento (?gallery=1)
const Gallery = import.meta.env.DEV ? lazy(() => import("./dev/Gallery.jsx")) : null;
const SHOW_GALLERY = import.meta.env.DEV && typeof location !== "undefined" && /[?&]gallery/.test(location.search);

// Avisos da lógica ainda chegam com um emoji na frente: vira ícone SVG do Snackbar
const EMOJI_ICON = {
  "🔒": "lock", "🎯": "target", "🚩": "flag", "🔇": "ear-off", "✨": "sparkle", "🔥": "flame", "⚡": "bolt",
  "❤️": "heart", "💔": "heart-broken", "📖": "book", "⭐": "star", "🌟": "star", "👑": "crown", "🏆": "trophy", "🎁": "chest",
};
function toSnack(text, cls) {
  const m = /^(\p{Extended_Pictographic}(?:️)?)\s*/u.exec(text || "");
  const fallback = cls === "combo" ? "sparkle" : null;
  return { text: m ? String(text).slice(m[0].length) : text, icon: m ? EMOJI_ICON[m[1]] || fallback || "check-circle" : fallback };
}

export default function App() {
  const app = useAppState();
  useSessionVersion();
  const reduce = useReducedMotion();
  const [screen, setScreen] = useState("home");
  const [toasts, setToasts] = useState([]);
  const [heartsOpen, setHeartsOpen] = useState(false);

  // Tema claro/escuro/automático
  useEffect(() => {
    const apply = () => {
      const sysDark = matchMedia("(prefers-color-scheme: dark)").matches;
      const dark = app.theme === "dark" || (app.theme !== "light" && sysDark);
      document.documentElement.classList.toggle("dark", dark);
      // Preferência "Alto contraste" (state.highContrast): o CTA claro troca o branco por #131f24 (VISUAL_SPEC 2.9)
      if (app.highContrast) document.documentElement.dataset.contrast = "high"; else delete document.documentElement.dataset.contrast;
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.content = dark ? "#131f24" : "#ffffff";
    };
    apply();
    const mq = matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [app.theme, app.highContrast]);

  // Eventos da lógica: navegação, toast, sons, confete, modal de corações
  useEffect(() => onUI((ev) => {
    if (ev.type === "navigate") setScreen(ev.screen);
    if (ev.type === "toast") {
      const id = Math.random().toString(36).slice(2);
      setToasts((t) => [...t.slice(-3), { id, ...toSnack(ev.text, ev.cls) }]);
    }
    if (ev.type === "sfx") { try { sfx(ev.name, ev.arg); } catch (e) { /* sem som */ } }
    if (ev.type === "confetti" && !reduce) confettiFx(ev.opts);
    if (ev.type === "hearts-modal") setHeartsOpen(true);
  }), []); // eslint-disable-line

  useEffect(() => { ensureDay(); }, [screen]);
  useEffect(() => { if (screen !== "home") window.scrollTo(0, 0); }, [screen]);

  const inLesson = (screen === "lesson" && !!session) || screen === "result";
  const showTabs = !inLesson;

  const go = useCallback((id) => {
    sfx("tap");
    haptic("select");
    setScreen(id);
  }, []);

  // Em desenvolvimento, atalhos dos testes de ponta a ponta (VISUAL_SPEC 10.1): window.__session espelha a sessão viva
  // (null fora da lição, para o driver não ler a sessão encerrada) e window.__blOpenNode(id) abre uma etapa sem o popover do nó
  if (import.meta.env.DEV && typeof window !== "undefined") {
    window.__session = session || null;
    window.__blOpenNode = (id) => { startLesson(id); return !!session; };
  }

  const badges = { hub: Object.keys(app.errors || {}).length };
  let view = null;
  if (SHOW_GALLERY && Gallery) view = <Suspense fallback={null}><Gallery /></Suspense>;
  else if (screen === "home" || (screen === "lesson" && !session)) view = <Home go={go} />;
  else if (screen === "lesson") view = <Lesson />;
  else if (screen === "result") view = <Result />;
  else if (screen === "hub") view = <Hub go={go} />;
  else if (screen === "quests") view = <Quests />;
  else if (screen === "characters") view = <Characters />;
  else if (screen === "profile") view = <Profile />;

  return (
    <div className="min-h-dvh">
      {showTabs ? (
        <div className="mx-auto min-h-dvh lg:grid lg:max-w-[1320px] lg:grid-cols-[224px_minmax(0,1fr)_320px] lg:gap-6 lg:px-6 xl:grid-cols-[256px_minmax(0,600px)_368px]">
          <Sidebar screen={screen} onGo={go} badges={badges} />
          <main className="min-h-dvh min-w-0 pb-24 lg:pb-8">
            {/* Troca de aba: conteúdo entra com fade + y 8 em 160 ms (sem frame em branco) */}
            <motion.div key={screen} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.16 }}>
              {view}
            </motion.div>
          </main>
          <RightRail onGo={go} />
        </div>
      ) : (
        <main className="min-h-dvh">
          <motion.div key={screen} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={SPRING.screen}>
            {view}
          </motion.div>
        </main>
      )}

      {showTabs && <TabBar screen={screen} onGo={go} badges={badges} />}

      <Snackbar queue={toasts} onDone={(id) => setToasts((t) => t.filter((x) => x.id !== id))} />
      {heartsOpen && <HeartsModal open onClose={() => setHeartsOpen(false)} />}
    </div>
  );
}
