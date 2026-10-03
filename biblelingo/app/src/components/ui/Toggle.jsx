// Toggle (VISUAL_SPEC 5.27): 50x30, raio 15; trilho --color-line -> --color-primary; knob 26 px branco com sombra
// 0 2px 0 rgba(0,0,0,.15), deslocamento por layout com SPRING.snap; role="switch" aria-checked; sfx("tap") + haptic("select").
// Props: checked, onChange(bool), label (aria-label), disabled, className
// Exemplo: <Toggle checked={app.sound !== false} onChange={(v) => { state.sound = v; save(); }} label="Efeitos sonoros" />
import { motion } from "motion/react";
import { SPRING } from "../../core/motion.js";
import { sfx } from "../../core/sfx.js";
import { haptic } from "../../core/haptics.js";

export default function Toggle({ checked = false, onChange, label, disabled = false, className = "", ...rest }) {
  const flip = () => {
    if (disabled) return;
    sfx("tap");
    haptic("select");
    onChange && onChange(!checked);
  };
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} disabled={disabled} onClick={flip}
      className={`relative inline-flex h-[30px] w-[50px] shrink-0 items-center rounded-[15px] p-[2px] transition-colors duration-150 ${checked ? "bg-primary justify-end" : "bg-line justify-start"} ${disabled ? "opacity-50" : ""} ${className}`} {...rest}>
      <motion.span layout transition={SPRING.snap} className="block h-[26px] w-[26px] rounded-full bg-white" style={{ boxShadow: "0 2px 0 rgba(0,0,0,.15)" }} />
    </button>
  );
}
