// Formatos de escolha (imagem, significado, escuta, versículo, leitura, diálogo, quiz, lacuna).
// Um único componente cobre todos: o que muda é o enunciado, a mídia e o formato das opções.
import { useEffect } from "react";
import { motion } from "motion/react";
import { session, setAnswer, check } from "../../core/session.js";
import { useSessionVersion } from "../../core/useSession.js";
import { normalize, blankRegex } from "../../core/util.js";
import { speak } from "../../core/audio.js";
import AudioButton, { AudioPair } from "./AudioButton.jsx";
import CharacterBubble from "./CharacterBubble.jsx";
import { Sayable } from "./Sayable.jsx";

const TITLES = {
  "image-choice": "Selecione a palavra correta:",
  "choice-en-pt": "O que significa esta palavra?",
  "choice-pt-en": null,
  "listen": "Ouça e escolha a resposta certa:",
  "listen-choice": "Ouça e escolha a tradução:",
  "read": "Leia e responda:",
  "dialogue": "Complete a conversa:",
  "quiz": "Responda sobre a história:",
  "verse": "Complete o versículo:",
  "missing-word": "Selecione a palavra que falta:",
};

function gapParts(text, blank) {
  const m = blankRegex(blank).exec(text);
  if (!m) return null;
  return [text.slice(0, m.index), text.slice(m.index + m[0].length)];
}

export default function ChoiceExercise({ ex }) {
  useSessionVersion();
  const t = ex.type;
  const autoplayText = t === "listen" ? ex.word.en : ["listen-choice"].includes(t) ? ex.sentence.en : t === "dialogue" ? ex.dialogue.line : t === "quiz" ? ex.quiz.q : null;
  useEffect(() => { if (autoplayText) speak(autoplayText); }, []); // eslint-disable-line

  const cols = ["choice-en-pt", "listen-choice", "read", "dialogue", "quiz"].includes(t) ? 1 : 2;
  const opts = ex.options.map((o) => (typeof o === "string" ? { value: o, label: o } : { value: o.pt, label: o.pt, icon: o.icon }));
  const gap = t === "verse" ? gapParts(ex.verse.text, ex.verse.blank) : t === "missing-word" ? gapParts(ex.sentence.en, ex.blank) : null;
  const chosen = session.answer;
  const checked = session.checked;

  return (
    <div>
      <h2 className="font-display mb-3 text-lg font-extrabold">
        {t === "choice-pt-en" ? <>Qual destas significa “{ex.word.pt}”?</> : TITLES[t]}
      </h2>

      {/* Enunciado / mídia */}
      {(t === "image-choice" || t === "choice-en-pt") && (
        <CharacterBubble big>
          <AudioButton text={ex.word.en} />
          <Sayable text={ex.word.en} className="text-xl font-bold" />
        </CharacterBubble>
      )}
      {t === "choice-pt-en" && (
        <CharacterBubble big><span className="text-xl font-bold">{ex.word.icon || ""} {ex.word.pt}</span></CharacterBubble>
      )}
      {(t === "listen" || t === "listen-choice") && (
        <CharacterBubble big>
          <AudioPair text={t === "listen" ? ex.word.en : ex.sentence.en} />
          <span className="text-ink-soft">Toque para ouvir</span>
        </CharacterBubble>
      )}
      {t === "read" && (
        <div className="card mb-3 p-4">
          <div className="text-lg leading-relaxed"><Sayable text={ex.reading.text} /></div>
          <ReadingPt pt={ex.reading.pt} />
          <div className="mt-3 border-t-2 border-line pt-3 font-bold"><Sayable text={ex.reading.q} /></div>
        </div>
      )}
      {t === "dialogue" && (
        <CharacterBubble big>
          <div>
            <div className="flex items-center gap-2"><AudioButton text={ex.dialogue.line} /><Sayable text={ex.dialogue.line} className="text-lg font-bold" /></div>
            <div className="mt-1 text-sm text-ink-soft">{ex.dialogue.pt}</div>
          </div>
        </CharacterBubble>
      )}
      {t === "quiz" && (
        <CharacterBubble big>
          <div className="flex items-center gap-2"><AudioButton text={ex.quiz.q} /><Sayable text={ex.quiz.q} className="text-lg font-bold" /></div>
        </CharacterBubble>
      )}
      {(t === "verse" || t === "missing-word") && gap && (
        <div className="card mb-1 p-4 text-lg leading-relaxed">
          <Sayable text={gap[0]} />
          <span className="mx-1 inline-block min-w-16 rounded-lg border-b-4 border-line bg-cream px-2 text-center font-bold text-sky-fg">
            {checked || chosen ? chosen : " "}
          </span>
          <Sayable text={gap[1]} />
        </div>
      )}
      {t === "verse" && <div className="mb-3 text-sm italic text-ink-soft">{ex.verse.ref} — “{ex.verse.pt}”</div>}
      {t === "missing-word" && <div className="mb-3 text-sm italic text-ink-soft">{ex.sentence.pt}</div>}

      {/* Opções */}
      <div className={`grid gap-2.5 ${cols === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
        {opts.map((o, i) => {
          const isChosen = chosen === o.value;
          const isCorrect = checked && normalize(o.value) === normalize(String(ex.correct));
          const isWrong = checked && isChosen && !isCorrect;
          return (
            <motion.button key={o.value + i} whileTap={{ scale: 0.97 }} data-opt={i + 1}
              onClick={() => {
                if (session.checked) return;
                setAnswer(o.value);
                if (t === "verse" || t === "missing-word" || t === "read" || t === "dialogue" || t === "quiz" || t === "choice-pt-en" || t === "listen") speak(o.value);
              }}
              className={`rounded-2xl border-2 border-b-4 px-4 py-3 text-left font-bold transition-colors ${
                isCorrect ? "border-ok-line bg-ok-bg text-brand" :
                isWrong ? "animate-[shake_0.3s] border-bad-line bg-bad-bg text-bad-fg" :
                isChosen ? "border-sky-line bg-sky-soft text-sky-fg" :
                checked ? "border-line bg-card opacity-50" : "border-line bg-card hover:bg-hover"}`}>
              {o.icon && <span className="mb-1 block text-3xl">{o.icon}</span>}
              {o.label}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function ReadingPt({ pt }) {
  return (
    <details className="mt-2 text-sm text-ink-soft">
      <summary className="cursor-pointer font-bold">Ver em português</summary>
      <p className="mt-1">{pt}</p>
    </details>
  );
}
