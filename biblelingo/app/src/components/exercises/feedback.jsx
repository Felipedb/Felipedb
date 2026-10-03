// Conteúdo do rodapé de feedback (VISUAL_SPEC 5.19), por formato: elogio, UMA linha secundária (tradução no
// acerto, frase correta no erro), compartilhamento, explicação (só quiz) e prática de pronúncia.
// Puro: recebe o exercício e a sessão e devolve dados para o Lesson montar o FeedbackFooter.
import { diffWords } from "../../core/checker.js";
import { blankRegex } from "../../core/util.js";

// Enunciado em inglês: a linha do acerto é a tradução em português
const PROMPT_EN = ["image-choice", "choice-en-pt", "listen", "listen-choice", "listen-build", "listen-type", "translate-en-pt", "read", "dialogue", "quiz", "speak", "verse", "listen-match", "match"];
// Erro: palavras que faltaram em destaque (só onde o aluno escreveu a frase)
const DIFF_TYPES = ["build", "listen-build", "type", "listen-type"];
// Erro: frase inteira com a palavra da lacuna em destaque
const GAP_TYPES = ["missing-word", "complete-translation", "verse"];
// Botão secundário "Praticar pronúncia" após checar
const PRONOUNCE_TYPES = ["build", "translate-en-pt", "missing-word", "complete-translation", "verse"];

// Texto principal do exercício em inglês e sua tradução (compartilhar e linhas do rodapé)
export function textOf(ex) {
  if (ex.sentence) return { en: ex.sentence.en, pt: ex.sentence.pt };
  if (ex.word) return { en: ex.word.en, pt: ex.word.pt };
  if (ex.verse) return { en: ex.verse.text, pt: ex.verse.pt };
  if (ex.dialogue) return { en: ex.dialogue.line, pt: ex.dialogue.pt };
  if (ex.quiz) return { en: ex.quiz.q, pt: "" };
  if (ex.reading) return { en: ex.reading.q, pt: "" };
  return { en: "", pt: "" };
}

// Alvo da prática de pronúncia: a frase completa depois de checar
export const pronounceTarget = (ex) => ex.audioAfter || ex.audioText || (ex.sentence && ex.sentence.en) || (ex.word && ex.word.en) || "";

// Frase inteira com a palavra da lacuna em negrito sublinhado
function gapLine(text, blank) {
  const m = blankRegex(blank).exec(text);
  if (!m) return <span>{text}</span>;
  return (
    <span>
      {text.slice(0, m.index)}<span className="font-extrabold underline underline-offset-4">{m[0]}</span>{text.slice(m.index + m[0].length)}
    </span>
  );
}

// Linha do acerto: tradução quando o enunciado é em inglês, frase em inglês quando o enunciado é em português
function okLine(ex) {
  const t = ex.type;
  const { en, pt } = textOf(ex);
  if (t === "match" || t === "listen-match" || t === "quiz" || t === "read") return "";
  if (t === "dialogue") return ex.dialogue.answerPt || "";
  return PROMPT_EN.includes(t) ? pt : en;
}

// Linha do erro: a resposta correta inteira (texto ou nó com destaque)
function wrongLine(ex, answer) {
  const t = ex.type;
  const correct = String(ex.correctLabel || ex.correct || "");
  if (GAP_TYPES.includes(t)) {
    const text = t === "verse" ? ex.verse.text : ex.sentence.en;
    return { node: gapLine(text, String(ex.correct)) };
  }
  if (DIFF_TYPES.includes(t)) {
    return {
      node: (
        <span>
          {diffWords(correct, String(answer || "")).map((p, i) => (
            <span key={i} className={p.miss ? "font-extrabold" : ""}>{p.w}{" "}</span>
          ))}
        </span>
      ),
    };
  }
  if (ex.word && (t === "image-choice" || t === "choice-en-pt" || t === "choice-pt-en" || t === "listen")) return { text: `${ex.word.en} = ${ex.word.pt}` };
  if (t === "dialogue" && ex.dialogue.answerPt) return { text: `${correct} (${ex.dialogue.answerPt})` };
  return { text: correct };
}

// Devolve null sem feedback; senão { ok, praise, line, lineNode, share, explain, pronounce }
export function footerFeedback(ex, s) {
  const fb = s && s.feedback;
  if (!fb) return null;
  const ok = !!fb.ok;
  const { en, pt } = textOf(ex);
  let praise = fb.praise;
  if (!fb.skipped) {
    if (ex.type === "match" || ex.type === "listen-match") praise = "Fez bonito!";
    else if (ex.type === "speak" && ok) praise = "Você falou em inglês!";
    else if (ok && fb.typo) praise = "Você escreve tão bem!";
  }
  if (!ok) praise = "Incorreto";

  let line = "", lineNode = null;
  if (ok && fb.typo) line = `Atenção à ortografia: ${ex.correctLabel || ex.correct}`;
  else if (ok) line = okLine(ex);
  else {
    const w = wrongLine(ex, s.answer);
    line = w.text || "";
    lineNode = w.node || null;
  }
  return {
    ok,
    praise,
    line,
    lineNode,
    share: en ? { text: en, pt } : null,
    explain: ex.type === "quiz" && ex.explain && !fb.skipped ? ex.explain : null,
    pronounce: PRONOUNCE_TYPES.includes(ex.type) && !fb.skipped && !!pronounceTarget(ex),
  };
}
