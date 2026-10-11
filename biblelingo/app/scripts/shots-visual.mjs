// Joga u1l1 no tema escuro tirando screenshots dos estados visuais novos.
// Uso: node scripts/shots-visual.mjs [urlDev] [outDir]
// Modo tolerante (VISUAL_SPEC 10.2): popover do nó, [data-answer-input] e cerimônias pós-lição são opcionais.
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { LAUNCH_ARGS, PHONE, openNode, fillAnswer } from "./lib/driver.mjs";

const URL = process.argv[2] || "http://localhost:5179/";
const OUT = process.argv[3] || "/tmp/shots";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ args: LAUNCH_ARGS });
const page = await browser.newPage({ viewport: PHONE, colorScheme: "dark" });
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
await openNode(page, "u1l1");

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
    await fillAnswer(page, String(st.correct));
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

// Cerimônias pós-lição (quando existirem): uma captura por tela
for (let i = 0; i < 6; i++) {
  await page.getByRole("button", { name: "Continuar" }).last().click().catch(() => {});
  await page.waitForSelector("[data-node], [data-ceremony]", { timeout: 10000 }).catch(() => {});
  const cer = await page.$("[data-ceremony]");
  if (!cer) break;
  await shot(`ceremony-${await cer.getAttribute("data-ceremony")}`);
}

console.log("VISUAL OK:", [...shots].join(", "));
await browser.close();
