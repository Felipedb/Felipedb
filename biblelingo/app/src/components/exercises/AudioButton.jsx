// Compatibilidade: os botões de áudio vivem em ui/AudioButton.jsx (VISUAL_SPEC 5.16). Este módulo mantém a
// API antiga usada pelas cenas (AudioButton, WaveButton, SlowButton, AudioPair) sobre os componentes novos:
// alto-falante inline de 26 px sem caixa, onda de 18 barras e "DEVAGAR" como texto.
import UiAudioButton, { SlowLink } from "../ui/AudioButton.jsx";

export default function AudioButton({ text, slow = false, big = false, char, className = "" }) {
  return <UiAudioButton text={text} char={char} variant={big ? "boxed" : slow ? "slow" : "inline"} className={className} />;
}

export function WaveButton({ text, char, className = "" }) {
  return <UiAudioButton variant="wave" text={text} char={char} className={className} />;
}

export function SlowButton({ text, char, className = "" }) {
  return <SlowLink text={text} char={char} className={className} />;
}

export function AudioPair({ text, char }) {
  return (
    <span className="inline-flex items-center gap-3">
      <UiAudioButton text={text} char={char} />
      <SlowLink text={text} char={char} />
    </span>
  );
}
