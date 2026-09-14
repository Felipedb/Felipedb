import { useSyncExternalStore } from "react";
import { state, subscribe, storeVersion } from "./store.js";

// Re-renderiza quando qualquer save() acontece; o componente lê `state` direto.
export function useAppState() {
  useSyncExternalStore(subscribe, storeVersion);
  return state;
}
