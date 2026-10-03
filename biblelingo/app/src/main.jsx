import React from "react";
import { createRoot } from "react-dom/client";
// Fontes servidas pelo próprio app (funcionam offline e sem Google Fonts)
import "@fontsource-variable/nunito";
import "@fontsource/baloo-2/600.css";
import "@fontsource/baloo-2/700.css";
import "@fontsource/baloo-2/800.css";
import "./index.css";
import App from "./App.jsx";
import { loadAudioManifest } from "./core/audio.js";
import { state, save } from "./core/store.js";
import { today } from "./core/util.js";

loadAudioManifest();
if (!state.joined) { state.joined = today(); save(); }

createRoot(document.getElementById("root")).render(<App />);

// Offline: só no build publicado (o dev server não precisa)
if (import.meta.env.PROD && "serviceWorker" in navigator && /^https?:$/.test(location.protocol)) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
