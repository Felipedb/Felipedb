// Monte a fala do herói (VISUAL_SPEC 6.3 #22 scene-build): WordBankCore (peças de 44 px sobre as linhas de
// resposta, voo por layoutId) com o chat e o balão do herói como prompt; "Usar teclado" troca o banco por um
// TextCard. Um só banco e uma só zona de resposta.
import { useRef, useState } from "react";
import { session, setAnswer, check } from "../../core/session.js";
import { useSessionVersion } from "../../core/useSession.js";
import { castChar, sceneNameOf } from "../../core/content.js";
import { speak } from "../../core/audio.js";
import WordBankCore from "../ui/WordBankCore.jsx";
import TextCard from "../ui/TextCard.jsx";
import Button3D from "../ui/Button3D.jsx";
import { HintedText } from "../exercises/Sayable.jsx";
import { inputState } from "../exercises/shared.jsx";
import { SceneTitle, SceneChat, ChatMsg, HeroPrompt, HeroReveal, nameChanges, sceneOf, useRevealBelow } from "./shared.jsx";

export default function SceneBuild({ ex, checked = false, fb = null }) {
  useSessionVersion();
  const sc = sceneOf(ex);
  const line = sc.lines[ex.li];
  const hero = castChar(sc.char);
  session.voiceChar = hero;
  ex.onChecked = (ok) => {
    if (ok) speak(line.en, { char: hero });
  };
  const [chosen, setChosen] = useState([]); // índices do banco, na ordem escolhida
  const [keyboard, setKeyboard] = useState(false);
  const [typed, setTyped] = useState("");
  const ok = !!(fb && fb.ok);
  const zone = useRef(null);
  useRevealBelow(zone, checked, { keepTop: false });

  const commit = (list) => {
    setChosen(list);
    setAnswer(list.map((i) => ex.bank[i]).join(" "));
  };
  const toggle = () => {
    if (session.checked) return;
    if (keyboard) {
      setKeyboard(false);
      commit(chosen);
    } else {
      const t = chosen.map((i) => ex.bank[i]).join(" ");
      setTyped(t);
      setAnswer(t);
      setKeyboard(true);
    }
  };

  const prompt = (
    <SceneChat sc={sc} upto={ex.li} className="mb-6">
      <ChatMsg sc={sc} line={line} now showName={nameChanges(sc, ex.li)}>
        {checked && ok ? (
          <HeroReveal line={line} />
        ) : (
          <HeroPrompt line={line} hint="Escreva em inglês">
            <div className="mt-1 text-sentence text-ink"><HintedText pt={line.pt} char={hero} /></div>
          </HeroPrompt>
        )}
      </ChatMsg>
    </SceneChat>
  );

  const switcher = (
    <Button3D variant="ghost" tone="blue" size="sm" icon={keyboard ? "puzzle" : "keyboard"} onClick={toggle} disabled={checked}>
      {keyboard ? "Usar banco de palavras" : "Usar teclado"}
    </Button3D>
  );

  return (
    <div>
      <SceneTitle>Monte a fala de {sceneNameOf(sc.char)}:</SceneTitle>
      {keyboard ? (
        <div ref={zone}>
          {prompt}
          <TextCard value={typed} disabled={checked} state={inputState(checked, ok)} placeholder="Digite a fala em inglês"
            onChange={(v) => { setTyped(v); setAnswer(v); }}
            onSubmit={() => { if (session.answer && String(session.answer).trim()) check(); }} />
          <div className="mt-4 flex justify-center">{switcher}</div>
        </div>
      ) : (
        <div ref={zone}>
          <WordBankCore bank={ex.bank} chosen={chosen} onChange={commit} checked={checked} ok={ok} prompt={prompt}
            onPick={(w) => speak(w, { char: hero })} footer={switcher} />
        </div>
      )}
    </div>
  );
}
