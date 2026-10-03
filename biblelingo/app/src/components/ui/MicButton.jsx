// MicButton e SpeakPrompt (VISUAL_SPEC 5.17).
// MicButton: 186x80 centralizado, raio 16, fundo --color-accent, sombra 0 7px 0 #1899d6, ícone mic 34 em --color-accent-text;
//   press y 7. Gravando: a face vira --color-line, o ícone some e 10 pontos de 10 px pulsam em onda.
//   Props: recording, onClick, disabled, error (faixa de 32 px abaixo, text-secondary --color-ink-soft), className
// SpeakPrompt: único componente para "speak" e "scene-speak": Bubble bubble-bottom (speaker inline + frase 19/500) acima do
//   CharacterStage center 220x300, MicButton e, no slot do rodapé, Button3D ghost "Não posso falar agora" (texto DOM em caixa normal).
//   Props: text, pt (tradução), char, recording, onMic, disabled, missed (palavras não reconhecidas, em laranja), onSkip, error, children
// Exemplo: <SpeakPrompt text={ex.sentence.en} char={who} recording={listening} onMic={onMic} onSkip={skipSpeaking} />
import { motion, AnimatePresence } from "motion/react";
import { SPRING } from "../../core/motion.js";
import { normalize } from "../../core/util.js";
import Icon from "../Icon.jsx";
import Bubble from "./Bubble.jsx";
import Button3D from "./Button3D.jsx";
import CharacterStage from "./CharacterStage.jsx";

export function MicButton({ recording = false, onClick, disabled = false, error, className = "" }) {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <motion.button type="button" onClick={onClick} disabled={disabled} aria-label={recording ? "Gravando. Toque para parar" : "Toque para falar"} aria-pressed={recording}
        className={`flex h-20 w-[186px] items-center justify-center rounded-lg ${recording ? "bg-line text-ink-soft" : "bg-accent text-accent-text"} ${disabled ? "opacity-50" : ""}`}
        style={{ boxShadow: recording ? "0 7px 0 var(--color-disabled)" : "0 7px 0 var(--color-accent-shadow)" }}
        whileTap={disabled ? undefined : { y: 7, boxShadow: "0 0 0 var(--color-accent-shadow)" }} transition={SPRING.snap}>
        {recording ? (
          <span className="flex items-center gap-1.5" aria-hidden>
            {Array.from({ length: 10 }, (_, i) => (
              <motion.span key={i} className="h-2.5 w-2.5 rounded-full bg-accent" animate={{ scale: [1, 1.6, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.06 }} />
            ))}
          </span>
        ) : <Icon name="mic" size={34} tone="mono" />}
      </motion.button>
      <AnimatePresence>
        {error && (
          <motion.div key="err" className="mt-3 flex h-8 items-center text-secondary text-ink-soft" role="status"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, transition: { duration: 0.12 } }}>
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SpeakPrompt({ text, pt, char, recording = false, onMic, disabled = false, missed = [], onSkip, error, className = "", children }) {
  const miss = new Set((missed || []).map((w) => normalize(w)));
  const words = String(text || "").split(" ");
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <Bubble variant="bottom" audio={text} char={char} maxWidth="min(100%, 320px)">
        <span>
          {words.map((w, i) => (
            <span key={i} className={miss.has(normalize(w)) ? "text-orange" : ""}>{w}{i < words.length - 1 ? " " : ""}</span>
          ))}
        </span>
      </Bubble>
      <CharacterStage ch={char} variant="center" talking="auto" className="mt-5" />
      <MicButton recording={recording} onClick={onMic} disabled={disabled} error={error} className="mt-6" />
      {pt && <p className="sr-only">{pt}</p>}
      {children}
      {onSkip && (
        <Button3D variant="ghost" tone="muted" size="md" onClick={onSkip} className="mt-6" sound={false}>Não posso falar agora</Button3D>
      )}
    </div>
  );
}
