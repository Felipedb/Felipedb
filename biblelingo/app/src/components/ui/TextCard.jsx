// TextCard e Gap (VISUAL_SPEC 5.18). Todo campo de resposta leva data-answer-input (contrato de teste 10.1).
// TextCard: card 358x134, borda 2 px --color-line, raio 16, fundo --color-page (escuro --color-raised), padding 16;
//   <textarea rows={3}> text-sentence 19/500, placeholder "Digite em inglês" em --color-muted, foco automático, foco com
//   borda --color-blue-line, Enter verifica (Shift+Enter quebra linha). Após checar: borda e texto certo/errado no card inteiro.
//   Props: value, onChange(texto), onSubmit, state "idle" | "ok" | "bad", placeholder, disabled, autoFocus, lang ("en" | "pt"), ariaLabel
// Gap: lacuna inline <input type="text" data-answer-input> com border-b-2 --color-line, sem fundo, largura max(6ch, (blank.length + 2)ch),
//   text-sentence na cor do estado. Com display (sem onChange) vira um <span> só de leitura (lacuna preenchida pela opção escolhida).
//   Props: value, onChange, onSubmit, blank (palavra esperada, só para a largura), state, disabled, display, ariaLabel
// Exemplo: <TextCard value={answer} onChange={setAnswer} onSubmit={check} state={checked ? (ok ? "ok" : "bad") : "idle"} />
//          <Gap value={answer} onChange={setAnswer} blank={ex.blank} state="idle" />
import { useEffect, useRef } from "react";

const CARD_STATE = {
  idle: "border-line bg-page text-ink focus-within:border-blue-line dark:bg-raised",
  ok: "border-green-line bg-page text-green-text dark:bg-raised",
  bad: "border-red-line bg-page text-red-text dark:bg-raised",
};
const GAP_STATE = { idle: "border-line text-ink focus:border-blue-line", ok: "border-green-line text-green-text", bad: "border-red-line text-red-text" };

function useAutoFocus(ref, on) {
  useEffect(() => {
    if (!on || !ref.current) return;
    const id = setTimeout(() => {
      if (!ref.current) return;
      ref.current.focus({ preventScroll: true });
      try { ref.current.scrollIntoView({ block: "center", behavior: "smooth" }); } catch (e) { /* sem scroll */ }
    }, 50);
    return () => clearTimeout(id);
  }, [on]); // eslint-disable-line
}

export default function TextCard({ value = "", onChange, onSubmit, state = "idle", placeholder = "Digite em inglês", disabled = false, autoFocus = true, lang = "en", ariaLabel = "Sua resposta", className = "" }) {
  const ref = useRef(null);
  useAutoFocus(ref, autoFocus);
  return (
    <div className={`min-h-[134px] rounded-lg border-2 p-4 transition-colors ${CARD_STATE[state] || CARD_STATE.idle} ${className}`}>
      <textarea ref={ref} rows={3} data-answer-input value={value} disabled={disabled} aria-label={ariaLabel}
        lang={lang === "en" ? "en" : "pt-BR"} autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false} enterKeyHint="done"
        placeholder={placeholder} onChange={(e) => onChange && onChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (onSubmit && String(value).trim()) onSubmit(); } }}
        className="block w-full resize-none bg-transparent text-sentence text-current outline-none placeholder:text-muted disabled:opacity-100" />
    </div>
  );
}

export function Gap({ value = "", onChange, onSubmit, blank = "", state = "idle", disabled = false, display = false, autoFocus = false, ariaLabel = "Palavra que falta", className = "" }) {
  const ref = useRef(null);
  useAutoFocus(ref, autoFocus && !display);
  const width = `max(6ch, ${String(blank).length + 2}ch)`;
  const cls = `mx-1 inline-block border-b-2 bg-transparent text-center text-sentence outline-none ${GAP_STATE[state] || GAP_STATE.idle} ${className}`;
  if (display) return <span className={cls} style={{ minWidth: width }} aria-label={ariaLabel}>{value || " "}</span>;
  return (
    <input ref={ref} type="text" data-answer-input value={value} disabled={disabled} aria-label={ariaLabel}
      autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false} enterKeyHint="done" style={{ width }}
      onChange={(e) => onChange && onChange(e.target.value)}
      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (onSubmit && String(value).trim()) onSubmit(); } }}
      className={cls} />
  );
}
