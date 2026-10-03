// Batida da conversa (VISUAL_SPEC 6.3 #22 scene-read): as falas da batida entram no chat e são tocadas em
// sequência com karaokê (palavras acendem em --color-accent conforme a duração do clipe); a tradução aparece ao
// tocar no balão (que também repete a fala). As falas antigas ficam acima, com rolagem natural.
import { useEffect, useState } from "react";
import { session } from "../../core/session.js";
import { useSessionVersion } from "../../core/useSession.js";
import { castChar } from "../../core/content.js";
import { speak } from "../../core/audio.js";
import { SceneTitle, SceneChat, ChatMsg, nameChanges, sceneOf, useSilentCard, useSpeakChain } from "./shared.jsx";

export default function SceneRead({ ex }) {
  useSessionVersion();
  const sc = sceneOf(ex);
  const lis = ex.lis;
  const first = sc.lines[lis[0]];
  session.voiceChar = castChar(first.who);
  useSilentCard(ex, "Continuar");
  const [nowLi, setNowLi] = useState(null);   // fala tocando agora
  const [doneLis, setDoneLis] = useState([]); // falas já tocadas (karaokê completo)
  const [shownLis, setShownLis] = useState([lis[0]]); // falas já exibidas (as próximas entram quando chega a vez)
  const [ptOpen, setPtOpen] = useState({});   // li -> tradução revelada
  const play = useSpeakChain(ex);

  useEffect(() => {
    play(lis.map((li) => sc.lines[li]), {
      delayMs: 250,
      onStep: (_line, k) => {
        const li = lis[k];
        setShownLis((s) => (s.includes(li) ? s : [...s, li]));
        setNowLi(li);
        if (k > 0) setDoneLis((d) => [...d, lis[k - 1]]);
      },
      onDone: () => {
        setNowLi(null);
        setDoneLis(lis.slice());
        setShownLis(lis.slice());
      },
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const tap = (li) => (line) => {
    speak(line.en, { char: castChar(line.who) });
    setPtOpen((p) => ({ ...p, [li]: true }));
  };

  return (
    <div>
      <SceneTitle>{lis[0] === 0 ? "A conversa começa:" : "A conversa continua:"}</SceneTitle>
      <SceneChat sc={sc} upto={lis[0]}>
        {lis.filter((li) => shownLis.includes(li)).map((li) => {
          const line = sc.lines[li];
          return (
            <ChatMsg key={li} sc={sc} line={line} now={li === nowLi} showName={nameChanges(sc, li)}
              karaoke={{ active: li === nowLi, done: doneLis.includes(li) }} revealPt={!!ptOpen[li]} onTap={tap(li)} />
          );
        })}
      </SceneChat>
      <p className="text-center text-secondary text-ink-soft" aria-live="polite">
        {nowLi != null ? "Ouvindo a conversa..." : "Toque em um balão para ouvir de novo e ver a tradução"}
      </p>
    </div>
  );
}
