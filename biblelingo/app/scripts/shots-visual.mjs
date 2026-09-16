// Joga u1l1 no tema escuro tirando screenshots dos estados visuais novos.
// Uso: node scripts/shots-visual.mjs [urlDev] [outDir]
import { chromium } from "playwright";

const URL = process.argv[2] || "http://localhost:5179/";
const OUT = process.argv[3] || "/tmp/shots";
import { mkdirSync } from "node:fs";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ args: ["--no-sandbox", "--autoplay-policy=no-user-gesture-required", "--mute-audio"] });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, colorScheme: "dark" });
const shots = new Set();
const shot = async (name) => {
  if (shots.has(name)) return;
  shots.add(name);
  await page.waitForTimeout(450);
  await page.screenshot({ path: `${OUT}/${name}.png` });
  console.log("shot:", name);
};

await page.goto(URL);
await page.waitForSelector('[data-node="u1l1"] button');
await page.click('[data-node="u1l1"] button');
await page.waitForFunction(() => window.__session && window.__session.exercises, null, { timeout: 10000 });

const clickFooter = () => page.click("footer button.btn-3d");
let wrongDone = false;

for (let step = 0; step < 200; step++) {
  const st = await page.evaluate(() => {
    const s = window.__session;
    if (!s) return { gone: true };
    if (s.phase === "result") return { result: true };
    const ex = s.exercises[s.index];
    return {
      index: s.index, checked: s.checked, type: ex.type, silent: !!ex.silent,
      correct: ex.correct, isReview: !!ex.isReview,
      pairs: ex.pairs ? ex.pairs.map((p) => p.en) : null,
    };
  });
  if (st.gone) throw new Error("sessão sumiu");
  if (st.result) { await shot("result"); break; }

  if (await page.$("[data-interstitial]")) {
    await shot("interstitial");
    await clickFooter();
    await page.waitForTimeout(400);
    continue;
  }
  if (st.isReview && !st.checked) await shot("review-badge");

  if (st.checked) {
    await clickFooter();
    await page.waitForTimeout(420);
    continue;
  }
  if (st.silent) { await shot(`type-${st.type}`); await clickFooter(); await page.waitForTimeout(420); continue; }

  await shot(`type-${st.type}`);

  if (st.type === "match" || st.type === "listen-match") {
    for (const key of st.pairs) {
      await page.click(`[data-side="en"][data-key="${key}"]`);
      await page.click(`[data-side="pt"][data-key="${key}"]`);
      await page.waitForTimeout(60);
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
    await page.fill('input[type="text"]', String(st.correct));
    await clickFooter();
    await shot("footer-ok");
    await page.waitForTimeout(150);
    continue;
  }
  if (["build", "listen-build", "translate-en-pt", "scene-build"].includes(st.type)) {
    const words = String(st.correct).split(" ");
    for (let wi = 0; wi < words.length; wi++) {
      await page.evaluate(({ word }) => {
        const tiles = [...document.querySelectorAll("button[data-tile]")];
        const tile = tiles.find((b) => b.dataset.tile === word);
        if (tile) tile.click();
      }, { word: words[wi] });
      if (wi === 1) await shot("bank-half");
      await page.waitForTimeout(60);
    }
    await clickFooter();
    await shot("footer-ok");
    await page.waitForTimeout(150);
    continue;
  }
  // Escolha: erra de propósito uma vez para capturar o rodapé vermelho e a revisão
  const picked = await page.evaluate(({ correct, wantWrong }) => {
    const nrm = (s) => String(s).toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
    const opts = [...document.querySelectorAll("[data-opt]")];
    const c = nrm(correct);
    const isRight = (b) => (b.dataset.value != null ? nrm(b.dataset.value) === c : (nrm(b.textContent) === c || nrm(b.textContent).endsWith(" " + c)));
    const hit = wantWrong ? opts.find((b) => !isRight(b)) : opts.find(isRight);
    if (hit) hit.click();
    return !!hit;
  }, { correct: st.correct, wantWrong: !wrongDone && !st.isReview });
  if (!picked) throw new Error(`opção ausente (${st.type})`);
  await page.waitForTimeout(80);
  await clickFooter();
  if (!wrongDone && !st.isReview) { wrongDone = true; await shot("footer-wrong"); }
  else await shot("footer-ok");
  await page.waitForTimeout(150);
}

console.log("VISUAL OK:", [...shots].join(", "));
await browser.close();
