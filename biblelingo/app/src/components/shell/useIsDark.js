// Tema atual (claro ou escuro) e ponto de quebra desktop, reativos. O App aplica a classe .dark no <html>;
// estes hooks leem a mesma regra (state.theme + prefers-color-scheme) para o JS que precisa da paleta (unitVars).
import { useEffect, useState } from "react";
import { useAppState } from "../../core/useStore.js";

export function useMedia(query) {
  const [on, setOn] = useState(() => typeof matchMedia === "function" && matchMedia(query).matches);
  useEffect(() => {
    if (typeof matchMedia !== "function") return undefined;
    const mq = matchMedia(query);
    const fn = () => setOn(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, [query]);
  return on;
}

export function useIsDark() {
  const app = useAppState();
  const sys = useMedia("(prefers-color-scheme: dark)");
  return app.theme === "dark" || (app.theme !== "light" && sys);
}

export function useIsLarge() {
  return useMedia("(min-width: 1024px)");
}
