// Retrato do personagem atual com balão de fala (layout clássico do app)
import { useMemo } from "react";
import { session } from "../../core/session.js";
import { UNIT_CAST, CHARACTERS, exKeyText, castHash, audioKey } from "../../core/content.js";
import { AUDIO } from "../../core/audio.js";
import CharFace from "../CharFace.jsx";

export function currentChar() {
  if (!session) return null;
  if (session.fixedNarrator || !session.cast || !session.cast.length) return session.narrator;
  const cast = UNIT_CAST[session.lesson.unit.id];
  const key = audioKey(exKeyText(session.exercises[session.index]));
  if (cast && cast.length && key) {
    let k = cast[castHash(key) % cast.length];
    const entry = AUDIO.manifest && AUDIO.manifest[key];
    if (entry && !entry[k]) {
      const rec = Object.keys(entry).find((c) => c !== "default" && CHARACTERS[c]);
      if (rec) k = rec;
    }
    if (CHARACTERS[k]) return { key: k, ...CHARACTERS[k] };
  }
  return session.cast[session.index % session.cast.length];
}

export default function CharacterBubble({ children, big = false, under = null }) {
  const ch = useMemo(() => currentChar(), []);
  if (session) session.voiceChar = ch;
  const ok = session && session.feedback && session.feedback.ok;
  const reacted = session && session.checked && session.feedback;
  return (
    <div className="mb-5 flex items-end gap-3">
      <div className="flex shrink-0 flex-col items-center">
        <CharFace ch={ch} className={`${big ? "h-28 w-28 text-6xl" : "h-16 w-16 text-3xl"} border-2 border-line`} react={reacted ? (ok ? ["😊", "🙌", "👏", "✨"][Math.floor(Math.random() * 4)] : "😕") : ""} />
        <span className={`mt-1 truncate text-xs font-bold text-ink-soft ${big ? "max-w-28" : "max-w-24"}`}>{ch ? ch.name.split(" (")[0] : ""}</span>
      </div>
      <div className="min-w-0 flex-1 pb-4">
        <div className="bubble flex min-h-16 items-center gap-2 px-4 py-3">
          {children}
        </div>
        {under && <div className="mt-2 pr-2 text-right">{under}</div>}
      </div>
    </div>
  );
}
