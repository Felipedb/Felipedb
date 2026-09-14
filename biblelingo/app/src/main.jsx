import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { loadAudioManifest } from "./core/audio.js";
import { state, save } from "./core/store.js";
import { today } from "./core/util.js";

loadAudioManifest();
if (!state.joined) { state.joined = today(); save(); }

createRoot(document.getElementById("root")).render(<App />);
