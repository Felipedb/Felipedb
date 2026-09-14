// Tela de resultado: estrelas, XP, precisão, baú, bênção e revisão da lição
import { useState } from "react";
import { motion } from "motion/react";
import { session, openChest, finishToHome } from "../core/session.js";
import { useSessionVersion } from "../core/useSession.js";
import CharFace from "../components/CharFace.jsx";

export default function Result() {
  useSessionVersion();
  const [showReview, setShowReview] = useState(false);
  if (!session || !session.result) return null;
  const r = session.result;
  const wrong = r.log.filter((e) => !e.ok && !e.review);
  const right = r.log.filter((e) => e.ok).length;
  const mm = Math.floor(r.secs / 60), ss = String(r.secs % 60).padStart(2, "0");

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center px-4 pb-8 pt-10 text-center">
      <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 260, damping: 18 }}>
        <CharFace ch={r.char} className="h-28 w-28 border-4 border-gold text-6xl" />
      </motion.div>
      <div className="mt-3 text-2xl">
        {[1, 2, 3].map((i) => (
          <motion.span key={i} initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.15 * i, type: "spring", stiffness: 300, damping: 14 }}
            className={`inline-block px-0.5 ${i <= r.earned ? "text-gold" : "text-locked"}`}>★</motion.span>
        ))}
      </div>
      <h1 className="font-display mt-1 text-2xl font-extrabold">{r.title}</h1>
      <p className="mt-1 text-ink-soft">
        {r.first ? "Você avançou na trilha." : "Ótima prática!"} ⏱️ {mm}:{ss}{r.bonus ? <> · 🔥 combo +{r.bonus} XP</> : null}
      </p>

      <div className="mt-4 grid w-full grid-cols-3 gap-2">
        <Stat label="XP" value={`+${r.gained}`} tone="text-gold-fg" />
        <Stat label="Precisão" value={`${r.accuracy}%`} tone="text-brand" />
        <Stat label="Ofensiva" value={`🔥 ${r.streak}`} tone="text-ink" />
      </div>

      <motion.button whileTap={{ scale: 0.95 }} onClick={openChest} disabled={!!r.chest}
        className={`mt-4 w-full rounded-2xl border-2 border-b-4 px-4 py-3 font-display font-extrabold ${r.chest ? "border-ok-line bg-ok-soft text-brand" : "border-gold bg-gold-soft text-gold-fg"}`}>
        {r.chest ? `✨ +${r.chest} XP` : "🎁 Abrir baú"}
      </motion.button>

      <blockquote className="mt-5 rounded-2xl bg-cream p-4 text-sm italic text-ink-soft">
        “{r.blessing.t}”<br /><b className="not-italic">{r.blessing.r}</b>
      </blockquote>

      {r.log.length > 0 && (
        <div className="mt-4 w-full text-left">
          <button onClick={() => setShowReview(!showReview)} aria-expanded={showReview}
            className="flex w-full items-center justify-between rounded-xl border-2 border-line bg-card px-4 py-2.5 font-bold">
            <span>📋 Revisão da etapa</span><b>{right} de {r.log.length} certas</b>
          </button>
          {showReview && (
            <div className="mt-2 flex flex-col gap-2">
              {wrong.length ? wrong.map((e, i) => (
                <div key={i} className="rounded-xl border-2 border-line bg-card p-3 text-sm">
                  <div className="font-bold">{e.q}</div>
                  <div className="text-bad-fg line-through">{e.a}</div>
                  <div className="text-brand">{e.c}</div>
                </div>
              )) : <p className="text-sm text-ink-soft">Nenhum erro na primeira passada. Excelente!</p>}
            </div>
          )}
        </div>
      )}

      <button onClick={finishToHome} className="btn-3d mt-6 w-full bg-brand-bright px-4 py-3.5 text-white">Continuar</button>
    </div>
  );
}

function Stat({ label, value, tone }) {
  return (
    <div className="card px-2 py-3">
      <div className={`font-display text-xl font-extrabold ${tone}`}>{value}</div>
      <div className="text-xs font-bold uppercase text-ink-soft">{label}</div>
    </div>
  );
}
