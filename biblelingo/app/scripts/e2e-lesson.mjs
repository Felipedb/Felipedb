// Teste de ponta a ponta: joga a lição u1l1 inteira respondendo certo via DOM
// até a tela de resultado. Requer o servidor dev do Vite (window.__session só
// existe em DEV) e o Chromium do Playwright em /opt/pw-browsers.
// Uso: PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node scripts/e2e-lesson.mjs [url]
import { chromium } from "playwright";

const URL = process.argv[2] || "http://localhost:5177/";
const norm = (s) => String(s).toLowerCase().replace(/[.,;:!?'"]/g, "").replace(/\s+/g, " ").trim();

const browser = await chromium.launch({
  args: ["--no-sandbox", "--autoplay-policy=no-user-gesture-required", "--mute-audio"],
});
const page = await browser.newPage();
page.on("pageerror", (e) => console.log("PAGEERROR:", e.message));

await page.goto(URL);
await page.click('[data-node="u1l1"] button');
await page.waitForFunction(() => window.__session && window.__session.exercises);
console.log("Lição u1l1 iniciada");

const seen = new Set();
for (let step = 0; step < 120; step++) {
  const st = await page.evaluate(() => {
    const s = window.__session;
    if (!s) return { gone: true };
    if (s.phase === "result") return { result: { title: s.result.title, gained: s.result.gained, accuracy: s.result.accuracy, perfect: s.result.perfect } };
    const ex = s.exercises[s.index];
    return {
      index: s.index, total: s.exercises.length, checked: s.checked, type: ex.type,
      correct: ex.correct, ok: s.feedback && s.feedback.ok,
      pairs: ex.pairs ? ex.pairs.map((p) => p.en) : null,
    };
  });
  if (st.gone) throw new Error("sessão sumiu antes do resultado");
  if (st.result) {
    console.log(`RESULTADO: "${st.result.title}" · +${st.result.gained} XP · precisão ${st.result.accuracy}% · perfeita=${st.result.perfect}`);
    break;
  }

  if (st.checked) {
    if (!st.ok) throw new Error(`resposta errada no exercício ${st.index} (${st.type})`);
    await page.click("footer button.btn-3d"); // Continuar
    await page.waitForTimeout(500); // animação de saída/entrada do exercício
    continue;
  }

  seen.add(st.type);
  console.log(`#${st.index + 1}/${st.total} ${st.type}`);

  if (st.type === "match" || st.type === "listen-match") {
    await page.waitForSelector('[data-side="en"]', { timeout: 5000 });
    for (const key of st.pairs) {
      await page.click(`[data-side="en"][data-key="${key}"]`);
      await page.click(`[data-side="pt"][data-key="${key}"]`);
      await page.waitForTimeout(60);
    }
    await page.waitForTimeout(200); // check() automático ao fechar os pares
    continue;
  }
  if (st.type === "speak") {
    await page.getByText("Não posso falar agora").click(); // skipSpeaking + check()
    await page.waitForTimeout(200);
    continue;
  }
  if (["type", "listen-type", "complete-translation"].includes(st.type)) {
    await page.waitForSelector('input[type="text"]:not([disabled])', { timeout: 5000 });
    await page.fill('input[type="text"]', String(st.correct));
    await page.click("footer button.btn-3d"); // Verificar
    await page.waitForTimeout(120);
    continue;
  }
  if (["build", "listen-build", "translate-en-pt"].includes(st.type)) {
    for (const w of String(st.correct).split(" ")) {
      let clicked = false;
      for (let tries = 0; tries < 20 && !clicked; tries++) {
        clicked = await page.evaluate(({ word, index }) => {
          const s = window.__session;
          if (!s || s.index !== index) return false;
          const bank = s.exercises[index].bank || [];
          const tiles = [...document.querySelectorAll("button[data-tile]")];
          // Garante que as peças no DOM são as do exercício atual (não as da saída animada)
          if (!tiles.length || !tiles.every((b) => bank.includes(b.dataset.tile))) return false;
          const tile = tiles.find((b) => b.dataset.tile === word);
          if (tile) tile.click();
          return !!tile;
        }, { word: w, index: st.index });
        if (!clicked) await page.waitForTimeout(150);
      }
      if (!clicked) throw new Error(`peça "${w}" não encontrada no banco`);
      await page.waitForTimeout(60);
    }
    await page.click("footer button.btn-3d");
    await page.waitForTimeout(120);
    continue;
  }
  // Formatos de escolha: clica a opção cujo texto bate com a resposta correta
  // (com repetição: a troca de exercício tem animação de saída/entrada)
  let picked = false;
  for (let tries = 0; tries < 20 && !picked; tries++) {
    picked = await page.evaluate(({ correct, index }) => {
      if (!window.__session || window.__session.index !== index) return false;
      // Ignora ícones/emoji e pontuação: compara só letras e números
      const nrm = (s) => String(s).toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
      const opts = [...document.querySelectorAll("[data-opt]")];
      const hit = opts.find((b) => nrm(b.textContent) === nrm(correct));
      if (hit) hit.click();
      return !!hit;
    }, { correct: st.correct, index: st.index });
    if (!picked) await page.waitForTimeout(150);
  }
  if (!picked) throw new Error(`opção "${st.correct}" não encontrada (${st.type})`);
  await page.waitForTimeout(80);
  await page.click("footer button.btn-3d");
  await page.waitForTimeout(120);
}

const onResult = await page.evaluate(() => window.__session && window.__session.phase === "result" && !!document.body.innerText);
if (!onResult) throw new Error("não chegou à tela de resultado");
console.log("Formatos jogados:", [...seen].join(", "));
const need = ["type", "match"];
const built = ["build", "listen-build", "translate-en-pt"].some((t) => seen.has(t));
for (const t of need) if (!seen.has(t) && !(t === "type" && (seen.has("listen-type") || seen.has("complete-translation")))) console.log(`aviso: formato "${t}" não apareceu nesta rodada`);
console.log(built ? "cobertura: build OK" : "aviso: nenhum formato de banco apareceu nesta rodada");
console.log("TESTE OK: lição concluída até a tela de resultado");
await browser.close();
