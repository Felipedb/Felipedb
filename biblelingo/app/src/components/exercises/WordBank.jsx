// Banco de palavras (VISUAL_SPEC 5.13 e 6.3): "build" (pt -> en com dicas), "listen-build" (ouça e monte) e
// "translate-en-pt" (en -> pt). O núcleo visual (peças de 44 px, voo por layoutId, linhas de resposta) é o
// WordBankCore compartilhado; aqui fica só a integração com a sessão e o modo teclado (TextCard).
import { useState } from "react";
import { session, setAnswer, check } from "../../core/session.js";
import { useSessionVersion } from "../../core/useSession.js";
import { speak } from "../../core/audio.js";
import WordBankCore from "../ui/WordBankCore.jsx";
import TextCard from "../ui/TextCard.jsx";
import Button3D from "../ui/Button3D.jsx";
import CharacterBubble, { useExerciseChar } from "./CharacterBubble.jsx";
import { Sayable, HintedText } from "./Sayable.jsx";
import { TITLES, Title, useAutoplay, inputState } from "./shared.jsx";

export default function WordBank({ ex, answer = null, checked = false, fb = null }) {
  useSessionVersion();
  const t = ex.type;
  const lang = t === "translate-en-pt" ? "pt" : "en";
  const ok = !!(fb && fb.ok);
  const ch = useExerciseChar();
  const [chosen, setChosen] = useState([]); // índices do banco, na ordem escolhida
  const [keyboard, setKeyboard] = useState(false);
  useAutoplay(t === "listen-build" || t === "translate-en-pt" ? ex.sentence.en : null, ch);

  const joined = (list) => list.map((i) => ex.bank[i]).join(" ");
  const onChange = (next) => {
    if (session.checked) return;
    setChosen(next);
    setAnswer(joined(next));
  };
  const toggleKeyboard = () => {
    if (session.checked) return;
    setKeyboard((k) => !k);
    setAnswer(joined(chosen));
  };
  const submit = () => { if (!session.checked && String(session.answer || "").trim() !== "") check(); };
  const sayWord = (w) => { if (lang === "en") speak(w, { char: ch }); };

  const prompt = t === "build" ? (
    <CharacterBubble ch={ch} checked={checked} ok={ok}><HintedText pt={ex.sentence.pt} char={ch} /></CharacterBubble>
  ) : t === "listen-build" ? (
    <CharacterBubble ch={ch} wave slow audio={ex.sentence.en} checked={checked} ok={ok} />
  ) : (
    <CharacterBubble ch={ch} audio={ex.sentence.en} checked={checked} ok={ok}><Sayable text={ex.sentence.en} char={ch} hints /></CharacterBubble>
  );
  const footer = (
    <Button3D variant="ghost" tone="blue" size="sm" icon={keyboard ? "puzzle" : "keyboard"} onClick={toggleKeyboard} disabled={checked} sound={false}>
      {keyboard ? "Usar banco de palavras" : "Usar teclado"}
    </Button3D>
  );

  return (
    <div>
      <Title>{TITLES[t]}</Title>
      {keyboard ? (
        <>
          {prompt}
          <TextCard value={answer == null ? "" : String(answer)} onChange={setAnswer} onSubmit={submit} state={inputState(checked, ok)} disabled={checked}
            lang={lang} placeholder={lang === "en" ? "Digite em inglês" : "Digite em português"} />
          <div className="mt-4 flex justify-center">{footer}</div>
        </>
      ) : (
        <WordBankCore bank={ex.bank} chosen={chosen} onChange={onChange} checked={checked} ok={ok} prompt={prompt} footer={footer} onPick={sayWord} onUnpick={sayWord} />
      )}
    </div>
  );
}
