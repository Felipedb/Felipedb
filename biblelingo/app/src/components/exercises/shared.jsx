// Peças comuns dos formatos de exercício: títulos (VISUAL_SPEC 3.2 e 6.3), autoplay da fala 200 ms após a
// entrada (7.3) e os estados visuais de opções e campos. Nada aqui toca a sessão.
import { useEffect } from "react";
import { speak } from "../../core/audio.js";
import { normalize } from "../../core/util.js";

export const TITLES = {
  "image-choice": "Selecione a imagem:",
  "choice-en-pt": "O que significa?",
  "choice-pt-en": "Qual destas significa?",
  "listen": "Toque no que escutar:",
  "listen-choice": "Ouça e escolha a tradução:",
  "read": "Leia e responda:",
  "dialogue": "Complete a conversa:",
  "quiz": "Responda sobre a história:",
  "verse": "Complete o versículo:",
  "missing-word": "Complete a frase:",
  "type": "Digite em inglês:",
  "listen-type": "Digite o que ouviu:",
  "complete-translation": "Complete a tradução:",
  "build": "Escreva em inglês:",
  "listen-build": "Toque no que escutar:",
  "translate-en-pt": "Traduza esta frase:",
  "match": "Combine os pares:",
  "listen-match": "Toque no que ouviu e no par:",
};

// Título do exercício: text-title 24/800 em uma linha, 24 px acima do conteúdo
export function Title({ children, className = "" }) {
  return <h2 className={`mb-6 text-title text-ink ${className}`}>{children}</h2>;
}

// Fala automática ao entrar (200 ms depois, para não brigar com a transição). Só uma vez por montagem.
export function useAutoplay(text, ch, delay = 200) {
  useEffect(() => {
    if (!text) return undefined;
    const t = setTimeout(() => speak(text, { char: ch || undefined }), delay);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}

// Estado visual de uma opção: idle | selected | correct | wrong | disabled.
// Ao checar, a correta acende verde mesmo quando não foi a escolhida (opção pedagógica, 5.14).
export function optionState(value, { answer, checked, correct }) {
  const chosen = answer != null && String(answer) === String(value);
  if (!checked) return chosen ? "selected" : "idle";
  if (normalize(String(value)) === normalize(String(correct))) return "correct";
  return chosen ? "wrong" : "disabled";
}

// Estado de um campo de texto ou lacuna após checar
export const inputState = (checked, ok) => (checked ? (ok ? "ok" : "bad") : "idle");

// Palavra limpa para a fala (sem pontuação)
export const cleanWord = (w) => String(w).replace(/[.,;:!?"]/g, "").replace(/^'|'$/g, "");
