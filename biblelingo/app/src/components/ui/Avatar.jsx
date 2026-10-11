// Avatar e CharFace (IDENTITY_V3): retrato REDONDO para avatares pequenos (lista, chat, HUD, fichas, perfil).
// Círculo com fundo --unit-soft e o busto recortado chars/v2/<key>/bust.webp ampliado no rosto; personagens de
// chars/v2/fallback.json (e qualquer busto que falhe ao carregar) usam o JPG chars/<key>.jpg (center 22%); sem imagem,
// iniciais em Nunito 800 sobre --unit-soft; extras com emoji em ilustração 3D (Illo). O busto grande sem moldura é o CharacterStage.
// Props:
//   ch        personagem { key, name, img, emoji, svg } · size: 24 | 40 | 56 | 72 | 96 ou número
//   ring      cor CSS do anel (3 px até 56, 4 px acima); true usa --unit-color · badge: "check" (check-circle 20 no canto) | "lock" | null
//   locked    círculo --color-line com cadeado, sem retrato · talking: boolean ou "auto" (assina onSpeak filtrando por ch.key)
//   reaction  "reaction-happy" | "reaction-sad" | null (badge SVG 28 px com SPRING.pop) · alt (padrão ch.name)
// Exemplo: <Avatar ch={ch} size={56} ring badge="check" />   <CharFace ch={ch} size={72} reaction={reaction} talking="auto" />
// useTalking(charKey): true enquanto a fala desse personagem (ou qualquer, sem charKey) está tocando.
// usesBust(ch): true quando o personagem tem busto recortado bom (tem img e não está em fallback.json).
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { onSpeak } from "../../core/audio.js";
import { SPRING } from "../../core/motion.js";
import Icon from "../Icon.jsx";
import Illo from "./Illo.jsx";
import FALLBACK from "../../../../chars/v2/fallback.json";

const FALLBACK_KEYS = new Set(FALLBACK.keys || []);
export const usesBust = (ch) => !!(ch && ch.key && ch.img && !FALLBACK_KEYS.has(ch.key));

const probes = new Map(); // url -> true | false | Promise

// Testa uma vez se um ativo existe (cache por URL); devolve true só quando carregou.
export function useAsset(url) {
  const [ok, setOk] = useState(() => probes.get(url) === true);
  useEffect(() => {
    if (!url) { setOk(false); return; }
    const cur = probes.get(url);
    if (cur === true) { setOk(true); return; }
    if (cur === false) { setOk(false); return; }
    let alive = true;
    const p = cur || new Promise((res) => { const im = new Image(); im.onload = () => res(true); im.onerror = () => res(false); im.src = url; });
    probes.set(url, p);
    p.then((r) => { probes.set(url, r); if (alive) setOk(r); });
    return () => { alive = false; };
  }, [url]);
  return ok;
}

export const charAsset = (ch, file) => (ch && ch.key ? `chars/v2/${ch.key}/${file}` : null);

export function useTalking(charKey) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    let t = 0;
    const off = onSpeak(({ durationMs, char }) => {
      if (charKey && char && char !== charKey) return;
      setOn(true);
      clearTimeout(t);
      t = setTimeout(() => setOn(false), Math.max(200, durationMs || 800));
    });
    return () => { off(); clearTimeout(t); };
  }, [charKey]);
  return on;
}

const initials = (name = "") => name.split(" (")[0].split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

export default function Avatar({ ch, size = 56, ring, badge = null, locked = false, talking = false, reaction = null, alt, className = "", ...rest }) {
  const [failed, setFailed] = useState(null); // chave cujo busto falhou ao carregar
  const bust = usesBust(ch) && failed !== ch.key;
  const auto = useTalking(talking === "auto" ? (ch && ch.key) : "__none__");
  const isTalking = talking === "auto" ? auto : !!talking;
  const ringW = size > 56 ? 4 : 3;
  const ringColor = ring === true ? "var(--unit-color, #58cc02)" : ring;
  const fontSize = Math.max(11, Math.round(size * 0.36));
  const badgeSize = size >= 56 ? 20 : 14;

  return (
    <span className={`relative inline-block shrink-0 ${className}`} style={{ width: size, height: size }} {...rest}>
      <motion.span className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-unit-soft"
        style={ringColor ? { boxShadow: `0 0 0 ${ringW}px ${ringColor}` } : undefined}
        animate={isTalking ? { y: [0, -2, 0], scale: [1, 1.04, 1] } : { y: 0, scale: 1 }}
        transition={isTalking ? { duration: 0.5, repeat: Infinity } : SPRING.snap}>
        {locked ? (
          // Bloqueado: cadeado em currentColor (--color-disabled no claro, --color-ink-soft no escuro) sobre --color-line
          <span className="flex h-full w-full items-center justify-center bg-line text-disabled dark:text-ink-soft"><Icon name="lock" size={Math.round(size * 0.43)} tone="mono" /></span>
        ) : bust ? (
          // Busto (512x512, figura encostada na base) ampliado 1,5x para o rosto ocupar o círculo
          <img src={charAsset(ch, "bust.webp")} alt={alt != null ? alt : ch.name} draggable="false" loading="lazy" decoding="async" onError={() => setFailed(ch.key)}
            className="pointer-events-none absolute max-w-none select-none" style={{ width: "150%", height: "150%", left: "-25%", top: "2%" }} />
        ) : ch && ch.img ? (
          <img src={ch.img} alt={alt != null ? alt : ch.name} draggable="false" loading="lazy" decoding="async"
            className="h-full w-full object-cover" style={{ objectPosition: "center 22%" }} />
        ) : ch && ch.emoji ? (
          <Illo e={ch.emoji} size={Math.round(size * 0.66)} alt={alt != null ? alt : ch.name} />
        ) : ch && ch.svg ? (
          <span className="[&>svg]:h-full [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: ch.svg }} />
        ) : (
          <span className="font-extrabold text-unit-text" style={{ fontSize }} aria-label={alt != null ? alt : (ch && ch.name)}>{ch ? initials(ch.name) : "?"}</span>
        )}
      </motion.span>
      {badge === "check" && !locked && (
        <span className="absolute -bottom-0.5 -right-0.5 rounded-full bg-page p-[2px]"><Icon name="check-circle" size={badgeSize} /></span>
      )}
      {badge === "lock" && (
        <span className="absolute -bottom-0.5 -right-0.5 rounded-full bg-page p-[2px]"><Icon name="lock" size={badgeSize} /></span>
      )}
      <AnimatePresence>
        {reaction && (
          <motion.span key={reaction} className="absolute -right-2 -top-2" initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, opacity: 0, transition: { duration: 0.12 } }} transition={SPRING.pop}>
            <Icon name={reaction} size={28} />
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

// CharFace: Avatar com reação e boca (nome mantido para a migração das telas)
export const CharFace = Avatar;
