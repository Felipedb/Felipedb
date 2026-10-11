// Gera app/src/core/sfxCatalog.js a partir de tools/sfx/sounds.json (SFX_SPEC 6.1): só o que o runtime precisa
// (família, acompanhamento, variantes com transposição, regra de índice em semitons, haptic, aliases e mixagem),
// sem as receitas de síntese nem os prompts. O catálogo completo continua sendo a fonte da verdade.
// Uso: node scripts/gen-sfx-catalog.mjs          (grava)
//      node scripts/gen-sfx-catalog.mjs --check  (falha se o arquivo gerado estiver desatualizado)
import fs from "node:fs";
import path from "node:path";

const APP = path.resolve(import.meta.dirname, "..");
const SRC = path.resolve(APP, "..", "tools", "sfx", "sounds.json");
const OUT = path.join(APP, "src", "core", "sfxCatalog.js");

const PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
function midi(note) {
  const m = /^([A-G])(#|b)?(-?\d)$/.exec(String(note));
  if (!m) throw new Error(`nota inválida: ${note}`);
  return 12 * (Number(m[3]) + 1) + PC[m[1]] + (m[2] === "#" ? 1 : m[2] === "b" ? -1 : 0);
}

const cat = JSON.parse(fs.readFileSync(SRC, "utf8"));
const sounds = {};
for (const s of cat.sounds) {
  if (!s.variants || !s.variants.length) throw new Error(`${s.name}: sem variants`);
  const e = { role: s.role };
  if (s.companion) e.companion = true;
  e.variants = s.variants.map((v) => [v.name, v.transpose || 0]);
  if (s.index) {
    const base = midi(s.index.base);
    e.index = { steps: s.index.ladder.map((n) => midi(n) - base), pick: s.index.pick, max: s.index.maxSemitones };
  }
  e.haptic = s.haptic == null ? null : s.haptic;
  e.ms = s.durationMs;
  sounds[s.name] = e;
}
for (const [alias, target] of Object.entries(cat.aliases || {})) {
  if (!sounds[target]) throw new Error(`alias ${alias} aponta para ${target}, que não existe`);
}

const body = [
  "// GERADO por app/scripts/gen-sfx-catalog.mjs a partir de tools/sfx/sounds.json (não editar à mão; rode o script).",
  "// Catálogo de runtime da camada sonora v2 (SFX_SPEC 3 e 6.1): família de mixagem (role), acompanhamento (companion),",
  "// variantes [nome no sprite, transposição em semitons], regra de índice em semitons a partir da nota base",
  "// (steps; pick nearest-variant ou rate; max = correção máxima por playbackRate), haptic e duração do arquivo (ms).",
  `export const SFX_VERSION = ${JSON.stringify(String(cat.revision || cat.version))};`,
  `export const SFX_MIX = ${JSON.stringify(cat.mix ? { masterGain: cat.mix.masterGain, families: cat.mix.families } : { masterGain: 0.9, families: {} })};`,
  `export const SFX_ALIASES = ${JSON.stringify(cat.aliases || {})};`,
  "export const SFX_SOUNDS = {",
  ...Object.entries(sounds).map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)},`),
  "};",
  "",
].join("\n");

if (process.argv.includes("--check")) {
  const cur = fs.existsSync(OUT) ? fs.readFileSync(OUT, "utf8") : "";
  if (cur !== body) { console.error("sfxCatalog.js desatualizado: rode node scripts/gen-sfx-catalog.mjs"); process.exit(1); }
  console.log("sfxCatalog.js em dia:", Object.keys(sounds).length, "sons");
} else {
  fs.writeFileSync(OUT, body);
  console.log("sfxCatalog.js gravado:", Object.keys(sounds).length, "sons,", Object.values(sounds).reduce((n, s) => n + s.variants.length, 0), "variantes");
}
