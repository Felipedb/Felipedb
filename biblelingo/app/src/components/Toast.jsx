// Snackbar do app (VISUAL_SPEC 5.24 e 11.9): fila de avisos acima da tab bar, por mola, uma por vez, e NUNCA dentro da lição.
// Delega ao Snackbar base (components/ui/Snackbar.jsx); aqui mora a regra de contexto: enquanto uma lição está em andamento
// (session.phase === "exercise"), os avisos são descartados (os leves viram LessonBanner no cabeçalho da lição; os grandes,
// como missão concluída, entram em session.pendingCelebrations e aparecem como MissionScreen depois do resultado).
// Uso novo (App): <Snackbar queue={toasts} onDone={(id) => ...} />
// Uso antigo mantido: <Toast toasts={[{ id, text, cls }]} /> (sem onDone, cada item fica o tempo padrão e some sozinho)
import { useEffect, useState } from "react";
import { Snackbar as BaseSnackbar } from "./ui/index.js";
import { session } from "../core/session.js";
import { useSessionVersion } from "../core/useSession.js";

// Avisos da lógica ainda chegam com um emoji na frente: vira ícone SVG do Snackbar
const EMOJI_ICON = {
  "🔒": "lock", "🎯": "target", "🚩": "flag", "🔇": "ear-off", "✨": "sparkle", "🔥": "flame", "⚡": "bolt",
  "❤️": "heart", "💔": "heart-broken", "📖": "book", "⭐": "star", "🌟": "star", "👑": "crown", "🏆": "trophy", "🎁": "chest", "✅": "check-circle", "💪": "dumbbell",
};
export function toSnack(text, cls) {
  const m = /^(\p{Extended_Pictographic}(?:️)?)\s*/u.exec(text || "");
  const fallback = cls === "combo" ? "sparkle" : null;
  return { text: m ? String(text).slice(m[0].length) : text, icon: m ? EMOJI_ICON[m[1]] || fallback || "check-circle" : fallback };
}

export function Snackbar({ queue = [], onDone }) {
  useSessionVersion();
  const inLesson = !!session && session.phase !== "result";
  // Dentro da lição nada aparece: os itens são devolvidos ao pai como "feitos" para a fila não acumular até o resultado
  useEffect(() => {
    if (inLesson && queue.length && onDone) queue.forEach((t) => onDone(t.id));
  }, [inLesson, queue, onDone]);
  return <BaseSnackbar queue={inLesson ? [] : queue} onDone={onDone} />;
}

export default function Toast({ toasts = [], queue, onDone }) {
  const [seen, setSeen] = useState([]);
  const items = (queue || toasts).filter((t) => !seen.includes(t.id)).map((t) => (t.icon !== undefined ? t : { id: t.id, ...toSnack(t.text, t.cls) }));
  const done = (id) => { setSeen((s) => [...s.slice(-20), id]); onDone && onDone(id); };
  return <Snackbar queue={items} onDone={done} />;
}
