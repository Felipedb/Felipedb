// Monte a fala do herói com o banco de palavras da cena (dica = tradução na bolha).
// Porta fiel de renderSceneBuild + wordBankUI (peça vai/volta com animação FLIP e
// teclado alternativo). TODO: unificar com src/components/exercises/WordBank.jsx
// quando o componente das lições existir (outro agente está criando).
import { useState } from "react";
import { motion } from "motion/react";
import { session, setAnswer, check } from "../../core/session.js";
import { useSessionVersion } from "../../core/useSession.js";
import { castChar, sceneNameOf } from "../../core/content.js";
import { speak } from "../../core/audio.js";
import { SceneChat, SceneHeader, SceneMsg, HeroPrompt, HeroReveal, sceneOf } from "./shared.jsx";

const TILE = "rounded-xl border-2 border-b-4 border-line bg-card px-3.5 py-2 font-bold";

export default function SceneBuild({ ex }) {
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
  const checked = session.checked;

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

  return (
    <div>
      <SceneHeader sc={sc} title={`Monte a fala de ${sceneNameOf(sc.char)}:`} />
      <SceneChat sc={sc} upto={ex.li}>
        <SceneMsg sc={sc} line={line} now>
          {checked ? <HeroReveal sc={sc} line={line} /> : <HeroPrompt sc={sc} line={line} hint="Escreva em inglês:" />}
        </SceneMsg>
      </SceneChat>

      {!keyboard ? (
        <>
          {/* Zona de resposta: toque devolve a peça ao banco */}
          <div className="mb-4 flex min-h-14 flex-wrap content-start items-start gap-2 border-b-2 border-line pb-2.5">
            {chosen.map((bi) => (
              <motion.button
                key={bi}
                layoutId={`sc-tile-${ex.li}-${bi}`}
                whileTap={{ scale: 0.94 }}
                onClick={() => {
                  if (session.checked) return;
                  speak(ex.bank[bi]);
                  commit(chosen.filter((x) => x !== bi));
                }}
                className={TILE}
              >
                {ex.bank[bi]}
              </motion.button>
            ))}
          </div>
          {/* Banco: a peça "voa" para a resposta */}
          <div className="flex flex-wrap justify-center gap-2">
            {ex.bank.map((w, i) =>
              chosen.includes(i) ? (
                <span key={i} aria-hidden className={`${TILE} select-none border-track bg-track text-transparent`}>
                  {w}
                </span>
              ) : (
                <motion.button
                  key={i}
                  data-tile={w}
                  layoutId={`sc-tile-${ex.li}-${i}`}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => {
                    if (session.checked) return;
                    speak(w);
                    commit([...chosen, i]);
                  }}
                  className={TILE}
                >
                  {w}
                </motion.button>
              )
            )}
          </div>
        </>
      ) : (
        <input
          type="text"
          value={typed}
          placeholder="Digite a frase em inglês..."
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          autoFocus
          onChange={(e) => {
            setTyped(e.target.value);
            setAnswer(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && session.answer && String(session.answer).trim() !== "") check();
          }}
          className="w-full rounded-2xl border-2 border-line bg-card px-4 py-3 font-bold outline-none focus:border-sky focus:shadow-[0_0_0_3px_rgba(28,176,246,0.15)]"
        />
      )}
      <button onClick={toggle} className="mx-auto mt-4 block text-sm font-extrabold text-sky-fg">
        {keyboard ? "🧩 Usar banco de palavras" : "⌨️ Usar teclado"}
      </button>
    </div>
  );
}
