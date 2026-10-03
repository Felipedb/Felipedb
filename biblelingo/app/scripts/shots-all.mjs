// Captura todas as telas e formatos de exercício em 390x844 (tema escuro e claro) para revisão visual.
// Uso: node scripts/shots-all.mjs [urlDev] [outDir] [dark|light|both]   (precisa do servidor dev: window.__session)
// Saída: <outDir>/<tema>/<nome>.png e <outDir>/index.json com a lista.
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { LAUNCH_ARGS, PHONE, playToResult, clickFooter } from "./lib/driver.mjs";

const URL = process.argv[2] || "http://localhost:5179/";
const OUT = process.argv[3] || "/tmp/shots-all";
const THEMES = (process.argv[4] || "both") === "both" ? ["dark", "light"] : [process.argv[4]];

const browser = await chromium.launch({ args: LAUNCH_ARGS });
const index = {};
const errors = [];

for (const theme of THEMES) {
  const dir = `${OUT}/${theme}`;
  mkdirSync(dir, { recursive: true });
  const ctx = await browser.newContext({ viewport: PHONE, colorScheme: theme });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(`${theme}: ${e.message}`));
  const taken = new Set();
  const shot = async (name, wait = 450) => {
    if (taken.has(name)) return;
    taken.add(name);
    await page.waitForTimeout(wait);
    await page.screenshot({ path: `${dir}/${name}.png` });
    (index[theme] = index[theme] || []).push(name);
  };
  const tab = async (label) => { await page.click(`nav button[aria-label="${label}"]`); await page.waitForTimeout(500); };

  await page.goto(URL);
  await page.waitForSelector("[data-node]");
  await shot("home-current", 900);
  await page.evaluate(() => window.scrollTo(0, 0));
  await shot("home-top");
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await shot("home-bottom");

  await tab("Praticar"); await shot("hub");
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await shot("hub-bottom");
  await tab("Missões"); await shot("quests");
  await tab("Personagens"); await shot("characters");
  const card = page.locator("main .grid button").first();
  if (await card.count()) { await card.click(); await shot("character-sheet", 700); await page.keyboard.press("Escape"); }
  await tab("Perfil"); await shot("profile");
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await shot("profile-bottom");

  // Lição 1: cada formato uma vez (antes de responder), acerto, erro, palavra nova, resultado
  await tab("Aprender");
  await page.waitForSelector('[data-node="u1l1"] button');
  await page.click('[data-node="u1l1"] button');
  await page.waitForFunction(() => window.__session && window.__session.exercises, null, { timeout: 10000 });
  let missed = false, okShot = false, wrongShot = false;
  try {
    await playToResult(page, {
      onState: async (st) => {
        if (st.type === "interstitial") return shot("lesson-interstitial");
        if (st.newWord) await shot("lesson-new-word");
        await shot(`ex-${st.type}`);
      },
      shouldMiss: (st) => {
        if (missed || st.silent) return false;
        if (!["choice-en-pt", "choice-pt-en", "image-choice", "listen", "listen-choice", "verse", "quiz", "dialogue", "read", "missing-word"].includes(st.type)) return false;
        missed = true;
        return true;
      },
      onChecked: async (st) => {
        if (st.ok && !okShot) { okShot = true; await shot("lesson-feedback-ok"); }
        if (!st.ok && !wrongShot) { wrongShot = true; await shot("lesson-feedback-wrong"); }
      },
      onResult: async () => { await shot("result", 1200); },
    });
  } catch (e) { errors.push(`${theme} lição: ${e.message}`); }
  await page.getByRole("button", { name: "Continuar" }).last().click().catch(() => {});
  await page.waitForSelector("[data-node]", { timeout: 10000 }).catch(() => {});

  // Cena (nó com balão 💬)
  try {
    const scene = page.locator("[data-node]").filter({ hasText: "💬" }).filter({ has: page.locator("button:not([disabled])") }).last();
    if (await scene.count()) {
      await scene.locator("button").click();
      await page.waitForFunction(() => window.__session && window.__session.exercises, null, { timeout: 10000 });
      await playToResult(page, {
        onState: async (st) => { if (st.type !== "interstitial") await shot(`ex-${st.type}`); },
        onResult: async () => { await shot("scene-result", 900); },
      });
      await page.getByRole("button", { name: "Continuar" }).last().click().catch(() => {});
      await page.waitForSelector("[data-node]", { timeout: 10000 }).catch(() => {});
    }
  } catch (e) { errors.push(`${theme} cena: ${e.message}`); }

  // História e Match Madness (hub)
  try {
    await tab("Praticar");
    const story = page.locator('button[data-story="s1"]');
    if (await story.count() && await story.isEnabled()) {
      await story.click(); await shot("story-beat", 800);
      const btn = page.locator("button", { hasText: "Continuar" }).first();
      for (let k = 0; k < 4; k++) { if (await btn.count()) { await btn.click().catch(() => {}); await page.waitForTimeout(350); } if (await page.locator("[data-opt]").count()) { await shot("story-question"); break; } }
    }
    await tab("Aprender"); await tab("Praticar");
    await page.click('[data-hub="madness"]'); await shot("madness", 700);
  } catch (e) { errors.push(`${theme} hub: ${e.message}`); }

  // Modal de corações (sem corações)
  try {
    await page.evaluate(() => { const k = Object.keys(localStorage).find((x) => /bibl/i.test(x)); if (k) { const s = JSON.parse(localStorage[k]); s.hearts = 0; localStorage[k] = JSON.stringify(s); } });
    await page.reload(); await page.waitForSelector("[data-node]");
    await page.click('[data-node="u1l1"] button'); await shot("hearts-modal", 700);
  } catch (e) { errors.push(`${theme} corações: ${e.message}`); }

  await ctx.close();
}

writeFileSync(`${OUT}/index.json`, JSON.stringify({ index, errors }, null, 1));
console.log(JSON.stringify(index, null, 1));
console.log("erros:", errors.length ? errors : "nenhum");
await browser.close();
