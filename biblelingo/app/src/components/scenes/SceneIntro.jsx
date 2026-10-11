// Cartão de abertura da cena (VISUAL_SPEC 6.3 #22 scene-intro): situação em caption azul, título 24/800, elenco
// em Avatar 72 (herói com anel verde, o outro com anel azul) ligados por uma seta, contexto 17/500, referência
// 15/500 e chips de vocabulário falados com a voz do herói. CTA "Começar a cena" no rodapé.
import { motion } from "motion/react";
import { session } from "../../core/session.js";
import { useSessionVersion } from "../../core/useSession.js";
import { castChar } from "../../core/content.js";
import { SPRING, STAGGER, list, item } from "../../core/motion.js";
import Avatar from "../ui/Avatar.jsx";
import Card from "../ui/Card.jsx";
import Icon from "../Icon.jsx";
import { SceneLabel, VocabChips, sceneOf, sceneOther, useSilentCard } from "./shared.jsx";

function CastCard({ ch, ring, caption }) {
  return (
    <div className="flex w-[108px] flex-col items-center gap-1.5 text-center">
      <Avatar ch={ch} size={72} ring={ring} talking="auto" />
      <span className="text-body font-bold leading-tight text-ink">{ch.name.split(" (")[0]}</span>
      <span className="min-h-[18px] text-caption font-bold normal-case tracking-normal text-ink-soft">{caption}</span>
    </div>
  );
}

export default function SceneIntro({ ex }) {
  useSessionVersion();
  const sc = sceneOf(ex);
  const hero = castChar(sc.char);
  const other = sceneOther(sc);
  session.voiceChar = hero;
  useSilentCard(ex, "Começar a cena");

  return (
    <motion.div variants={list(STAGGER.cards, 0.05)} initial="hidden" animate="show">
      <motion.div variants={item(SPRING.settle, 14)}>
        <Card className="mb-4">
          <div className="text-caption uppercase tracking-[.8px] text-blue-text">Situação · {sc.func}</div>
          <h2 className="mt-1 text-title text-ink">{sc.title}</h2>

          <div className="my-5 flex items-start justify-center gap-2">
            <CastCard ch={hero} ring="var(--color-green)" caption="você fala por ele" />
            <span className="mt-6 inline-flex h-6 items-center text-ink-soft" aria-hidden>
              <Icon name="arrow-right" size={24} tone="mono" />
            </span>
            <CastCard ch={other} ring="var(--color-blue)" caption="responde" />
          </div>

          <p className="text-body text-ink">{sc.context}</p>
          <div className="mt-2 flex items-center gap-1.5 text-secondary text-ink-soft">
            <Icon name="book-open" size={18} tone="mono" />
            <span>{sc.ref}</span>
          </div>
        </Card>
      </motion.div>

      <motion.div variants={item(SPRING.settle, 14)}>
        <SceneLabel>
          Palavras da cena <span className="font-medium normal-case tracking-normal">(toque para ouvir)</span>
        </SceneLabel>
        <VocabChips vocab={sc.vocab} char={hero} />
      </motion.div>
    </motion.div>
  );
}
