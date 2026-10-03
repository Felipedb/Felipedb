import React from "react";
import { createRoot } from "react-dom/client";
import { MotionConfig } from "motion/react";
// Fontes servidas pelo próprio app (funcionam offline e sem Google Fonts).
// Nunito variável é a única família da interface (VISUAL_SPEC 3.1); Baloo 2 800 sobrevive só no wordmark.
import "@fontsource-variable/nunito";
import "@fontsource/baloo-2/800.css";
import "./index.css";
import App from "./App.jsx";
import { SPRING } from "./core/motion.js";
import { loadAudioManifest } from "./core/audio.js";
import { state, save } from "./core/store.js";
import { today } from "./core/util.js";

loadAudioManifest();
if (!state.joined) { state.joined = today(); save(); }

// MotionConfig na raiz (7.1 e 9.1): respeita prefers-reduced-motion e dá a mola padrão a toda animação sem transition.
// Pacote completo do Motion: layoutId e drag exigem domMax, por isso nada de LazyMotion aqui.
createRoot(document.getElementById("root")).render(
  <MotionConfig reducedMotion="user" transition={SPRING.settle}>
    <App />
  </MotionConfig>
);

// Offline: só no build publicado (o dev server não precisa)
if (import.meta.env.PROD && "serviceWorker" in navigator && /^https?:$/.test(location.protocol)) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
