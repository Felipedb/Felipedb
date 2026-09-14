// Barra de prática "Ouvir / Devagar / Falar" — treino de pronúncia que não
// responde o exercício (paridade com practiceBar do app clássico, app.js ~901).
import { useState } from "react";
import { session } from "../../core/session.js";
import { useSessionVersion } from "../../core/useSession.js";
import { speak, recognizeOnce } from "../../core/audio.js";
import { sfx } from "../../core/events.js";
import { buzz } from "../../core/util.js";
import Icon from "../Icon.jsx";

export const BAR_TYPES = ["build", "translate-en-pt", "type", "missing-word", "complete-translation", "verse", "read", "dialogue", "quiz", "listen-build", "listen-type", "listen-choice"];
export const showPracticeBar = (ex) =>
  BAR_TYPES.includes(ex.type) && ex.audioText && ex.audioText.trim().split(/\s+/).length >= 3;

const PBTN = "inline-flex items-center gap-1.5 rounded-full border-2 border-b-4 border-line bg-card px-3.5 py-1.5 text-sm font-bold text-ink-soft transition-colors hover:bg-hover active:translate-y-0.5";

export default function PracticeBar({ ex, micOnly = false }) {
  useSessionVersion();
  const [listening, setListening] = useState(false);
  const [status, setStatus] = useState("");
  const target = () => (session.checked && ex.audioAfter ? ex.audioAfter : ex.audioText);

  const onMic = () => {
    if (session.practiceRec) { try { session.practiceRec.stop(); } catch (e) { /* já parou */ } return; }
    const s0 = session;
    session.practiceRec = recognizeOnce(target(), {
      onStart: () => { setListening(true); setStatus(`Diga: "${target()}"`); },
      onResult: (r) => {
        if (session !== s0) return;
        if (r.ok) { sfx("correct"); buzz(25); setStatus(`✅ Boa pronúncia! (${Math.round(r.score * 100)}%)`); }
        else { buzz(60); setStatus(`🙂 Quase. Você disse: "${r.text}". Tente de novo!`); }
      },
      onError: (err) => {
        setStatus(err === "unsupported" ? "Reconhecimento de voz indisponível neste navegador."
          : err === "not-allowed" ? "Permita o uso do microfone para praticar."
          : "Não consegui ouvir. Tente de novo.");
      },
      onEnd: () => { s0.practiceRec = null; setListening(false); },
    });
  };

  return (
    <div className="mt-5">
      <div className="flex flex-wrap items-center gap-2">
        {!micOnly && (
          <>
            <button className={PBTN} onClick={() => speak(target())}>
              <Icon name="speaker" /><span>Ouvir</span>
            </button>
            <button className={PBTN} title="Ouvir devagar" aria-label="Ouvir devagar" onClick={() => speak(target(), { slow: true })}>
              <Icon name="turtle" />
            </button>
          </>
        )}
        <button className={`${PBTN} ${listening ? "border-sky-line bg-sky-soft text-sky-fg" : ""}`} onClick={onMic}>
          <Icon name="mic" /><span>{listening ? "Ouvindo..." : "Falar"}</span>
        </button>
      </div>
      {status && <div className="mt-2 text-sm font-bold text-ink-soft" aria-live="polite">{status}</div>}
    </div>
  );
}
