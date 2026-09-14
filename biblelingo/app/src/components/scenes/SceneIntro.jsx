// Cartão de abertura da cena: situação, elenco, contexto, referência e vocabulário.
// Porta fiel de renderSceneIntro (scene-engine.js).
import { motion } from "motion/react";
import { session } from "../../core/session.js";
import { useSessionVersion } from "../../core/useSession.js";
import { castChar } from "../../core/content.js";
import { SceneFace, VocabChips, sceneOf, useSilentCard } from "./shared.jsx";

function CastCard({ ch, me, caption }) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <SceneFace ch={ch} me={me} big />
      <b className="text-sm">{ch.name.split(" (")[0]}</b>
      <small className="min-h-4 text-[11px] font-bold text-ink-soft">{caption}</small>
    </div>
  );
}

export default function SceneIntro({ ex }) {
  useSessionVersion();
  const sc = sceneOf(ex);
  const hero = castChar(sc.char);
  const other = castChar(sc.with);
  session.voiceChar = hero;
  useSilentCard(ex, "Começar a cena");

  return (
    <div>
      <h2 className="font-display mb-3 text-center text-xl font-extrabold">Nova cena</h2>
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: "easeOut" }}
        className="card mb-3.5 rounded-[20px] p-4">
        <div className="text-xs font-black uppercase tracking-wide text-sky-fg">Situação · {sc.func}</div>
        <h2 className="font-display mb-3 mt-0.5 text-2xl font-extrabold">{sc.title}</h2>
        <div className="my-3 flex items-center justify-center gap-3.5">
          <CastCard ch={hero} me caption="você fala por ele" />
          <span className="text-[22px] text-ink-soft">↔</span>
          <CastCard ch={other} caption={sc.with === sc.char ? "" : "responde"} />
        </div>
        <p className="mb-2 text-[15px] font-bold leading-relaxed">{sc.context}</p>
        <div className="text-[13px] font-extrabold text-ink-soft">📖 {sc.ref}</div>
        <div className="mb-2 mt-3.5 text-[13px] font-black uppercase tracking-wide text-ink-soft">
          Palavras e expressões da cena <small className="font-bold normal-case tracking-normal">(toque para ouvir)</small>
        </div>
        <VocabChips vocab={sc.vocab} char={hero} />
      </motion.div>
    </div>
  );
}
