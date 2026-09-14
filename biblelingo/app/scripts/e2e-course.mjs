// Percorre a trilha inteira (80 etapas: lições, cenas e revisões) respondendo certo.
// Uso: node scripts/e2e-course.mjs [urlDev]  (precisa do servidor dev: window.__session)
import { chromium } from "playwright";

const URL = process.argv[2] || "http://localhost:5179/";
const browser = await chromium.launch({ args: ["--no-sandbox", "--autoplay-policy=no-user-gesture-required", "--mute-audio"] });
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));

await page.goto(URL);
await page.waitForSelector("[data-node]");
const ids = await page.evaluate(() => [...document.querySelectorAll("[data-node]")]
  .sort((a, b) => (+a.dataset.order) - (+b.dataset.order))
  .map((n) => n.dataset.node));
console.log("etapas:", ids.length);
const typesSeen = new Set();

async function clickFooter() {
  await page.click("footer button.btn-3d");
}

for (const id of ids) {
  // volta para a home e abre a etapa
  await page.waitForSelector(`[data-node="${id}"] button`, { timeout: 10000 });
  await page.click(`[data-node="${id}"] button`);
  await page.waitForFunction(() => window.__session && window.__session.exercises, null, { timeout: 10000 });

  let wrongOnce = false;
  for (let step = 0; step < 160; step++) {
    const st = await page.evaluate(() => {
      const s = window.__session;
      if (!s) return { gone: true };
      if (s.phase === "result") return { result: { title: s.result.title, gained: s.result.gained } };
      const ex = s.exercises[s.index];
      return {
        index: s.index, total: s.exercises.length, checked: s.checked, type: ex.type, silent: !!ex.silent,
        correct: ex.correct, ok: s.feedback && s.feedback.ok,
        pairs: ex.pairs ? ex.pairs.map((p) => p.en) : null,
      };
    });
    if (st.gone) throw new Error(`${id}: sessão sumiu`);
    if (st.result) { console.log(`${id}: ${st.result.title} +${st.result.gained}`); break; }
    typesSeen.add(st.type);

    if (st.checked) {
      if (!st.ok && !wrongOnce) throw new Error(`${id}: resposta errada em ${st.type} #${st.index}`);
      wrongOnce = false;
      await clickFooter();
      await page.waitForTimeout(420);
      continue;
    }
    if (st.silent) { await clickFooter(); await page.waitForTimeout(420); continue; }

    if (st.type === "match" || st.type === "listen-match") {
      await page.waitForSelector('[data-side="en"]', { timeout: 5000 });
      for (const key of st.pairs) {
        await page.click(`[data-side="en"][data-key="${key}"]`);
        await page.click(`[data-side="pt"][data-key="${key}"]`);
        await page.waitForTimeout(50);
      }
      await page.waitForTimeout(250);
      continue;
    }
    if (st.type === "speak" || st.type === "scene-speak") {
      await page.getByText("Não posso falar agora").click();
      await page.waitForTimeout(250);
      continue;
    }
    if (["type", "listen-type", "complete-translation", "scene-gap"].includes(st.type)) {
      await page.waitForSelector('input[type="text"]:not([disabled])', { timeout: 5000 });
      await page.fill('input[type="text"]', String(st.correct));
      await clickFooter();
      await page.waitForTimeout(150);
      continue;
    }
    if (["build", "listen-build", "translate-en-pt", "scene-build"].includes(st.type)) {
      for (const w of String(st.correct).split(" ")) {
        let clicked = false;
        for (let tries = 0; tries < 20 && !clicked; tries++) {
          clicked = await page.evaluate(({ word, index }) => {
            const s = window.__session;
            if (!s || s.index !== index) return false;
            const bank = s.exercises[index].bank || [];
            const tiles = [...document.querySelectorAll("button[data-tile]")];
            if (!tiles.length || !tiles.every((b) => bank.includes(b.dataset.tile))) return false;
            const tile = tiles.find((b) => b.dataset.tile === word);
            if (tile) tile.click();
            return !!tile;
          }, { word: w, index: st.index });
          if (!clicked) await page.waitForTimeout(150);
        }
        if (!clicked) throw new Error(`${id}: peça "${w}" ausente (${st.type})`);
        await page.waitForTimeout(40);
      }
      await clickFooter();
      await page.waitForTimeout(150);
      continue;
    }
    // Escolha (lições e cenas)
    let picked = false;
    for (let tries = 0; tries < 25 && !picked; tries++) {
      picked = await page.evaluate(({ correct, index }) => {
        if (!window.__session || window.__session.index !== index) return false;
        const nrm = (s) => String(s).toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
        const opts = [...document.querySelectorAll("[data-opt]")];
        const c = nrm(correct);
        const hit = opts.find((b) => b.dataset.value != null ? nrm(b.dataset.value) === c : (nrm(b.textContent) === c || nrm(b.textContent).endsWith(" " + c)));
        if (hit) hit.click();
        return !!hit;
      }, { correct: st.correct, index: st.index });
      if (!picked) await page.waitForTimeout(150);
    }
    if (!picked) throw new Error(`${id}: opção "${st.correct}" ausente (${st.type})`);
    await page.waitForTimeout(60);
    await clickFooter();
    await page.waitForTimeout(150);
  }
  // resultado → continuar
  await page.getByRole("button", { name: "Continuar" }).last().click();
  await page.waitForSelector("[data-node]", { timeout: 10000 });
}

console.log("tipos:", [...typesSeen].sort().join(", "));
console.log("erros JS:", errors.length ? errors.slice(0, 5) : "nenhum");
if (errors.length) process.exit(1);
console.log("CURSO COMPLETO OK");
await browser.close();
