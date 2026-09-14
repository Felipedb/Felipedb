// Aba Praticar — porta fiel de hub.js (renderHub) + Situações (renderSituations, scene-engine.js).
// História e Match Madness são visões locais desta tela (o App só conhece "hub").
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useAppState } from "../core/useStore.js";
import { state } from "../core/store.js";
import { startQuickPractice, startErrorPractice, startLesson, learnedOnly } from "../core/session.js";
import { STORIES, SCENES, COURSE, castChar, CHARACTERS, lessonUnlocked } from "../core/content.js";
import { XP_PER_LESSON } from "../core/util.js";
import CharFace from "../components/CharFace.jsx";
import Story from "./Story.jsx";
import Madness from "./Madness.jsx";

function HubCard({ icon, title, sub, disabled, onClick, testId }) {
  return (
    <motion.button whileTap={disabled ? undefined : { scale: 0.97 }} onClick={onClick} disabled={disabled} data-hub={testId}
      className={`flex flex-col items-start gap-1 rounded-2xl border-2 border-b-4 border-line bg-card p-4 text-left transition-colors ${disabled ? "opacity-55" : "hover:bg-hover"}`}>
      <span className="text-3xl">{icon}</span>
      <b className="font-display text-base">{title}</b>
      <small className="text-[12.5px] font-bold text-ink-soft">{sub}</small>
    </motion.button>
  );
}

function Situations() {
  const groups = [];
  SCENES.forEach((s) => {
    let g = groups.find((x) => x.char === s.char);
    if (!g) { g = { char: s.char, items: [] }; groups.push(g); }
    g.items.push(s);
  });
  return (
    <div className="flex flex-col gap-3.5">
      {groups.map((g) => {
        const ch = castChar(g.char);
        const done = g.items.filter((s) => state.completed[s.id]).length;
        return (
          <div key={g.char} className="rounded-2xl border-2 border-line bg-card-2 p-2.5">
            <div className="flex items-center gap-2.5 px-1 pb-2.5 pt-1">
              <CharFace ch={ch} className="h-10 w-10 border-2 border-line text-2xl" />
              <b className="font-display">{ch.name.split(" (")[0]}</b>
              <small className="ml-auto text-xs font-extrabold text-ink-soft">{done}/{g.items.length} cenas</small>
            </div>
            <div className="flex flex-col gap-2">
              {g.items.map((s) => {
                const unlocked = lessonUnlocked(s.id);
                const isDone = !!state.completed[s.id];
                return (
                  <button key={s.id} data-scene={s.id} onClick={() => startLesson(s.id)}
                    className={`flex items-center gap-2.5 rounded-xl border-2 border-b-4 border-line bg-card px-3 py-2 text-left transition-colors ${unlocked || isDone ? "hover:bg-hover" : "opacity-55"}`}>
                    <span className="text-xl">{isDone ? "✅" : unlocked ? "💬" : "🔒"}</span>
                    <span className="min-w-0 flex-1">
                      <b className="block text-[15px]">{s.title}</b>
                      <small className="block text-xs font-bold text-ink-soft">{s.func}</small>
                    </span>
                    <span className="text-xs font-black text-gold-fg">{isDone ? "+5 XP" : `+${XP_PER_LESSON} XP`}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StoryList({ onOpen }) {
  return (
    <div className="flex flex-col gap-2.5">
      {STORIES.map((s) => {
        const unit = COURSE.find((u) => u.id === s.unit);
        const unlocked = unit && state.completed[unit.lessons[0].id];
        const done = state.stories && state.stories[s.id];
        const cover = CHARACTERS[s.cover] ? { key: s.cover, ...CHARACTERS[s.cover] } : null;
        return (
          <button key={s.id} data-story={s.id} disabled={!unlocked} onClick={() => onOpen(s.id)}
            className={`flex items-center gap-3 rounded-2xl border-2 border-b-4 border-line bg-card px-3 py-2.5 text-left transition-colors ${unlocked ? "hover:bg-hover" : "opacity-60"}`}>
            <CharFace ch={cover} className="h-[52px] w-[52px] shrink-0 border-[3px] border-line text-3xl" />
            <span className="min-w-0 flex-1">
              <b className="block text-[15.5px]">{s.title}</b>
              <small className="block text-[12.5px] font-bold text-ink-soft">
                {s.subtitle}{done ? " · ✓ lida" : unlocked ? "" : " · 🔒 conclua a 1ª etapa do capítulo"}
              </small>
            </span>
            <span className="text-[12.5px] font-black text-gold-fg">+{s.xp} XP</span>
          </button>
        );
      })}
    </div>
  );
}

export default function Hub() {
  useAppState();
  const [view, setView] = useState("hub"); // "hub" | "madness" | { story: id }
  const nErr = Object.keys(state.errors || {}).length;
  const learned = learnedOnly().length;

  return (
    <AnimatePresence mode="wait" initial={false}>
      {view === "madness" ? (
        <motion.div key="madness" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
          <Madness onExit={() => setView("hub")} />
        </motion.div>
      ) : typeof view === "object" && view.story ? (
        <motion.div key={"story-" + view.story} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
          <Story id={view.story} onExit={() => setView("hub")} />
        </motion.div>
      ) : (
        <motion.div key="hub" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
          className="mx-auto max-w-xl px-4 pb-8 pt-4" data-screen="hub">
          <h2 className="font-display text-[26px] font-extrabold">Praticar</h2>
          <p className="mb-4 text-sm font-bold text-ink-soft">{learned} palavras aprendidas · {nErr} para revisar</p>

          <div className="grid grid-cols-2 gap-3">
            <HubCard testId="madness" icon="⚡" title="Match Madness" sub="Pares contra o relógio · 60 s" onClick={() => setView("madness")} />
            <HubCard testId="review" icon="🔁" title="Revisão rápida" sub="9 exercícios das palavras que mais precisam de revisão" onClick={() => startQuickPractice("review")} />
            <HubCard testId="listen" icon="🎧" title="Escuta rápida" sub="8 exercícios de escuta" onClick={() => startQuickPractice("listen")} />
            <HubCard testId="errors" icon="🩹" title="Praticar erros" disabled={!nErr}
              sub={nErr ? `${nErr} palavra(s) para acertar` : "Nenhum erro pendente"} onClick={() => startErrorPractice()} />
          </div>

          <h3 className="font-display mb-1 mt-6 text-xl font-extrabold">💬 Situações do dia a dia</h3>
          <p className="mb-3 text-sm font-bold text-ink-soft">Conversas reais da Bíblia vividas como situações de hoje: apresentar-se, comprar, pedir ajuda, falar do tempo...</p>
          <Situations />

          <h3 className="font-display mb-3 mt-6 text-xl font-extrabold">📚 Histórias</h3>
          <StoryList onOpen={(id) => setView({ story: id })} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
