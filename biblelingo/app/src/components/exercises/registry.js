// Preenchido pelos componentes de exercício (lições e cenas)
import Choice from "./Choice.jsx";
import TypeInput from "./TypeInput.jsx";
import WordBank from "./WordBank.jsx";
import Match from "./Match.jsx";
import Speak from "./Speak.jsx";
export const REGISTRY = {
  "image-choice": Choice,
  "choice-en-pt": Choice,
  "choice-pt-en": Choice,
  "listen": Choice,
  "listen-choice": Choice,
  "read": Choice,
  "dialogue": Choice,
  "quiz": Choice,
  "verse": Choice,
  "missing-word": Choice,
  "type": TypeInput,
  "listen-type": TypeInput,
  "complete-translation": TypeInput,
  "build": WordBank,
  "listen-build": WordBank,
  "translate-en-pt": WordBank,
  "match": Match,
  "listen-match": Match,
  "speak": Speak,
};
