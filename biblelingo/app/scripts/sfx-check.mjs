// Teste de contagem da camada sonora v2 (SFX_SPEC 9.2; contrato window.__sfxLog de core/sfx.js, só em DEV).
// Joga u1l1 até o resultado sem errar e depois a etapa seguinte com um erro proposital, e confere:
//   (a) cada clique em botão produziu exatamente 1 som com ataque (acompanhamentos e cliques absorvidos não contam);
//   (b) cada VERIFICAR produziu a resposta (correct, combo ou wrong) e nenhum clique (tap, tap-soft);
//   (c) o erro proposital produziu wrong (e, fora da prática, heart-lost logo depois);
//   (d) o resultado da lição perfeita produziu finish, star x3 (star-1, star-2, star-3 em ordem) e stat x3;
//   (e) nenhum nome fora de tools/sfx/sounds.json foi tocado;
//   (f) botão de áudio (quando aparece) não produz som de efeito.
// Imprime "SONS OK" ou a lista de violações (sai com código 1).
// Uso: node scripts/sfx-check.mjs [urlDev] [--lesson=u1l1] [--sprite=pasta] [--verbose]
//   --sprite=pasta  serve audio/sfx/sfx-v2.{json,ogg,m4a} dessa pasta por interceptação de rede quando o sprite real
//                   ainda não existe (sprite provisório de teste; nada é gravado no repositório)
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import { LAUNCH_ARGS, PHONE, openNode, playToResult, finishResult } from "./lib/driver.mjs";

const ARGS = process.argv.slice(2);
const URL = ARGS.find((a) => !a.startsWith("--")) || "http://localhost:5179/";
const opt = (k) => { const a = ARGS.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : ""; };
const LESSON = opt("lesson") || "u1l1";
const SPRITE_DIR = opt("sprite");
const VERBOSE = ARGS.includes("--verbose");

const catalog = JSON.parse(fs.readFileSync(path.resolve(import.meta.dirname, "..", "..", "tools", "sfx", "sounds.json"), "utf8"));
const NAMES = new Set(catalog.sounds.map((s) => s.name));
const ANSWERS = new Set(["correct", "combo", "wrong"]);
const CLICK_SOUNDS = new Set(["tap", "tap-soft"]);

const violations = [];
const fail = (msg) => { violations.push(msg); if (VERBOSE) console.log("  VIOLAÇÃO:", msg); };

const browser = await chromium.launch({ args: LAUNCH_ARGS });
const page = await browser.newPage({ viewport: PHONE });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));

// Sprite real servido pelo servidor? (o fallback de SPA do Vite devolve index.html com 200: só vale se for JSON)
const real = await fetch(new globalThis.URL("audio/sfx/sfx-v2.json", URL)).then((r) => (r.ok ? r.json() : null)).then((j) => !!j, () => false);
// Sprite provisório: só quando o real não existe
let usingProvisional = false;
if (SPRITE_DIR && !real) {
  await page.route("**/audio/sfx/sfx-v2.*", async (route) => {
    const name = new globalThis.URL(route.request().url()).pathname.split("/").pop();
    const file = path.resolve(SPRITE_DIR, name);
    if (!fs.existsSync(file)) return route.fulfill({ status: 404, body: "" });
    usingProvisional = true;
    const type = name.endsWith(".json") ? "application/json" : name.endsWith(".ogg") ? "audio/ogg" : "audio/mp4";
    return route.fulfill({ status: 200, contentType: type, body: fs.readFileSync(file) });
  });
}

await page.goto(URL);
await page.waitForSelector("[data-node]");
const hasDev = await page.evaluate(() => Array.isArray(window.__sfxClicks));
if (!hasDev) { console.log("window.__sfxClicks ausente: o teste precisa do servidor de desenvolvimento (vite dev)"); process.exit(2); }

// Coleta o log de sons e os cliques numerados (esvazia os dois no navegador)
const all = { log: [], clicks: [] };
async function harvest() {
  const got = await page.evaluate(() => ({ log: (window.__sfxLog || []).splice(0), clicks: (window.__sfxClicks || []).splice(0) }));
  all.log.push(...got.log);
  all.clicks.push(...got.clicks);
  return got;
}
const transients = (entries) => entries.filter((e) => !e.companion && !e.absorbed && !e.unknown);

// Botão de áudio: um toque não pode produzir som de efeito (f)
let audioChecked = false;
async function checkAudioButton() {
  if (audioChecked) return;
  const btn = await page.$('main button[aria-label="Ouvir"], main button[aria-label^="Ouvir"], main button[aria-label*="devagar"]');
  if (!btn || !(await btn.isVisible()) || !(await btn.isEnabled())) return;
  await harvest();
  await btn.click();
  await page.waitForTimeout(120);
  const got = await harvest();
  const fx = got.log.filter((e) => got.clicks.some((c) => c.id === e.click));
  audioChecked = true;
  if (fx.length) fail(`botão de áudio "${got.clicks.map((c) => c.label).join(", ")}" tocou ${fx.map((e) => e.name).join(", ")}`);
}

// Joga uma etapa; miss = errar de propósito uma vez
async function play(id, { miss = false } = {}) {
  let missed = false;
  let wrongCheck = null;
  await openNode(page, id);
  const res = await playToResult(page, {
    onState: async (st) => { await harvest(); if (!st.silent && st.type !== "interstitial") await checkAudioButton(); },
    shouldMiss: (st) => {
      if (!miss || missed) return false;
      const ok = ["choice-pt-en", "choice-en-pt", "listen", "listen-choice", "translate-en-pt", "type", "listen-type", "complete-translation"].includes(st.type)
        || (st.type === "build" && String(st.correct).split(" ").length > 1);
      if (ok) missed = true;
      return ok;
    },
    onChecked: async (st) => {
      await page.waitForTimeout(260); // heart-lost chega 150 ms depois do erro
      await harvest();
      if (!st.ok && !wrongCheck) {
        const ver = [...all.clicks].reverse().find((c) => /^\s*verificar\s*$/i.test(c.label));
        wrongCheck = { click: ver ? ver.id : null, at: all.log.length };
      }
    },
  });
  // Resultado: finish no frame em que a tela entra, estrelas aos 450 / 630 / 810 ms
  await page.waitForTimeout(2600);
  await harvest();
  const resultFrom = all.log.findLastIndex((e) => e.name === "finish");
  const resultLog = resultFrom >= 0 ? all.log.slice(resultFrom) : [];
  await finishResult(page);
  await page.waitForTimeout(900);
  await harvest();
  return { res, missed, wrongCheck, resultLog };
}

const ids = await page.evaluate(() => [...document.querySelectorAll("[data-node]")].sort((a, b) => (+a.dataset.order) - (+b.dataset.order)).map((n) => n.dataset.node));
if (!ids.includes(LESSON)) { console.log(`etapa ${LESSON} não está na trilha`); process.exit(2); }

// 1) Lição perfeita
const run1 = await play(LESSON);
const stars = run1.resultLog.filter((e) => e.name === "star");
if (!run1.resultLog.some((e) => e.name === "finish")) fail("resultado sem finish");
if (stars.length !== 3) fail(`resultado com ${stars.length} star (esperado 3): ${run1.resultLog.map((e) => e.variant || e.name).join(" ")}`);
else if (stars.map((e) => e.variant).join(",") !== "star-1,star-2,star-3") fail(`estrelas fora de ordem: ${stars.map((e) => e.variant).join(",")}`);
const stats = run1.resultLog.filter((e) => e.name === "stat");
if (stats.length !== 3) fail(`resultado com ${stats.length} stat (esperado 3, um por card)`);

// 2) Etapa seguinte (a atual da trilha) com um erro proposital
const next = await page.evaluate(() => { const n = document.querySelector("[data-node][data-current]"); return n ? n.dataset.node : null; });
const second = next && next !== LESSON ? next : LESSON;
const run2 = await play(second, { miss: true });
if (!run2.missed) fail(`${second}: nenhum exercício permitiu o erro proposital`);
else if (!run2.wrongCheck || !run2.wrongCheck.click) fail(`${second}: o erro proposital não passou por VERIFICAR`);
else {
  const mine = all.log.filter((e) => e.click === run2.wrongCheck.click);
  if (!mine.some((e) => e.name === "wrong" && !e.absorbed)) fail(`${second}: o erro proposital tocou ${mine.map((e) => e.name).join(", ") || "nada"} (esperado wrong)`);
  const practice = second === LESSON;
  const after = all.log.slice(run2.wrongCheck.at - 6);
  if (!practice && !after.some((e) => e.name === "heart-lost")) fail(`${second}: perder coração não tocou heart-lost`);
}

// (a) e (b): um transiente por clique em botão; VERIFICAR sem clique
const byClick = new Map();
for (const e of all.log) if (e.click) { if (!byClick.has(e.click)) byClick.set(e.click, []); byClick.get(e.click).push(e); }
let buttonClicks = 0, verifies = 0;
for (const c of all.clicks) {
  if (!c.button) continue;
  const entries = byClick.get(c.id) || [];
  if (audioChecked && !entries.length && /ouvir|devagar/i.test(c.label)) continue; // (f), já conferido
  buttonClicks++;
  const tr = transients(entries);
  const desc = `clique ${c.id} "${c.label}"`;
  if (tr.length !== 1) fail(`${desc}: ${tr.length} sons com ataque (${entries.map((e) => `${e.name}${e.absorbed ? "~absorvido" : ""}${e.companion ? "~acomp" : ""}`).join(", ") || "nenhum"})`);
  if (/^\s*verificar\s*$/i.test(c.label)) {
    verifies++;
    if (entries.some((e) => CLICK_SOUNDS.has(e.name))) fail(`${desc}: VERIFICAR tocou clique (${entries.map((e) => e.name).join(", ")})`);
    if (!tr.length || !ANSWERS.has(tr[0].name)) fail(`${desc}: VERIFICAR sem som de resposta (${entries.map((e) => e.name).join(", ") || "nenhum"})`);
  }
}
const corrects = all.log.filter((e) => e.name === "correct" || e.name === "combo").length;
if (!corrects) fail("nenhum correct tocado");

// (e) nomes do catálogo
const unknown = [...new Set(all.log.filter((e) => e.unknown || !NAMES.has(e.name)).map((e) => e.req || e.name))];
if (unknown.length) fail(`sons fora de sounds.json: ${unknown.join(", ")}`);

const status = await page.evaluate(() => (window.__sfx ? window.__sfx.status() : null));
const srcs = all.log.reduce((m, e) => { m[e.src] = (m[e.src] || 0) + 1; return m; }, {});
const names = all.log.filter((e) => !e.absorbed).reduce((m, e) => { m[e.name] = (m[e.name] || 0) + 1; return m; }, {});
if ((real || usingProvisional) && status && status.sprite !== "ogg" && status.sprite !== "m4a") fail(`sprite v2 não carregou (estado: ${JSON.stringify(status)})`);
if (errors.length) fail(`erros JS: ${errors.slice(0, 3).join(" | ")}`);

console.log(`etapas: ${LESSON} (perfeita) e ${second} (com erro) · ${buttonClicks} cliques em botão, ${verifies} VERIFICAR, ${all.log.length} sons registrados`);
console.log("sprite:", real ? "real" : usingProvisional ? "provisório (interceptado)" : "ausente (reserva sfx-data.js)", "·", JSON.stringify(status));
console.log("fontes:", JSON.stringify(srcs));
console.log("sons:", Object.entries(names).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} x${v}`).join(", "));
console.log("botão de áudio conferido:", audioChecked ? "sim" : "não apareceu");
if (VERBOSE) {
  for (const c of all.clicks) {
    const entries = byClick.get(c.id) || [];
    console.log(`  #${c.id} ${c.button ? "botão" : "outro"} "${c.label}": ${entries.map((e) => `${e.variant || e.name}${e.absorbed ? "~abs" : ""}${e.companion ? "~acomp" : ""}[${e.src}]`).join(" ") || "-"}`);
  }
  const loose = all.log.filter((e) => !e.click);
  console.log("  sem clique:", loose.map((e) => `${e.variant || e.name}${e.absorbed ? "~abs" : ""}`).join(" "));
}
await browser.close();
if (violations.length) {
  console.log(`\n${violations.length} violações:`);
  violations.forEach((v) => console.log(" -", v));
  process.exit(1);
}
console.log("SONS OK");
