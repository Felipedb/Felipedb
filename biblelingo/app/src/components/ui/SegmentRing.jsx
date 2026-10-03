// SegmentRing (VISUAL_SPEC 5.11): anel segmentado em SVG atrás do nó (94), na meta diária (96) ou na
// DailyGoalScreen (160). Traço 6 (10 na meta), strokeLinecap round, N segmentos; feitos em --unit-color
// (meta: #ffc800), restantes em --color-line. Anima o preenchimento do valor anterior ao novo via useMotionValue.
// Props:
//   size, stroke, segments (N; nó atual: Math.ceil(exercícios / 5)), value (0 a 1), from (valor inicial)
//   color, track, duration (s, padrão 0.9), gapArc (px entre segmentos, padrão 6 quando N > 1), children (centro: numeral ou check)
// Exemplo: <SegmentRing size={94} stroke={6} segments={3} value={index / total} />
import { useEffect } from "react";
import { motion, useMotionValue, useTransform, animate, useReducedMotion } from "motion/react";
import { EASE } from "../../core/motion.js";

function Segment({ i, mv, segLen, gapArc, circ, color, track, stroke, r, cx }) {
  const start = i * (segLen + gapArc);
  const dash = useTransform(mv, (v) => {
    const f = Math.max(0, Math.min(1, v - i));
    const len = f * segLen;
    return `${len} ${Math.max(0, circ - len)}`;
  });
  return (
    <>
      <circle cx={cx} cy={cx} r={r} fill="none" stroke={track} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={`${segLen} ${circ - segLen}`} strokeDashoffset={-start} />
      <motion.circle cx={cx} cy={cx} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
        style={{ strokeDasharray: dash }} strokeDashoffset={-start} />
    </>
  );
}

export default function SegmentRing({ size = 94, stroke = 6, segments = 1, value = 0, from, color = "var(--unit-color, #58cc02)", track = "var(--color-line)", duration = 0.9, gapArc, children, className = "", label }) {
  const reduce = useReducedMotion();
  const n = Math.max(1, Math.round(segments));
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const circ = 2 * Math.PI * r;
  const gap = n > 1 ? (gapArc != null ? gapArc : 6) : 0;
  const segLen = (circ - n * gap) / n;
  // valor em "segmentos preenchidos" (0..n), para cada segmento ler sua fração
  const mv = useMotionValue((reduce ? value : (from != null ? from : 0)) * n);
  useEffect(() => {
    if (reduce) { mv.set(value * n); return; }
    const c = animate(mv, value * n, { duration, ease: EASE.out });
    return () => c.stop();
  }, [value, n, duration, reduce]); // eslint-disable-line

  return (
    <span className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}
      role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(value * 100)} aria-label={label}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" focusable="false" style={{ transform: "rotate(-90deg)" }}>
        {Array.from({ length: n }, (_, i) => (
          <Segment key={i} i={i} mv={mv} segLen={segLen} gapArc={gap} circ={circ} color={color} track={track} stroke={stroke} r={r} cx={cx} />
        ))}
      </svg>
      {children && <span className="absolute inset-0 flex items-center justify-center">{children}</span>}
    </span>
  );
}
