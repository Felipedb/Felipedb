import { useSyncExternalStore } from "react";
import { subscribeSession, sessionVersion } from "./session.js";
export function useSessionVersion() {
  return useSyncExternalStore(subscribeSession, sessionVersion);
}
