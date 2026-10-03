// Driver compartilhado dos testes de ponta a ponta: lê a sessão exposta em DEV (window.__session)
// e responde o exercício atual (certo ou, de propósito, errado). Usado por e2e-course.mjs e shots-all.mjs.
export const LAUNCH_ARGS = ["--no-sandbox", "--autoplay-policy=no-user-gesture-required", "--mute-audio"];
export const PHONE = { width: 390, height: 844 };

export async function readState(page) {
  return page.evaluate(() => {
    const s = window.__session;
    if (!s) return { gone: true };
    if (s.phase === "result") return { result: { title: s.result.title, gained: s.result.gained } };
    const ex = s.exercises[s.index];
    return {
      index: s.index, total: s.exercises.length, checked: s.checked, type: ex.type, silent: !!ex.silent,
      correct: ex.correct, ok: s.feedback && s.feedback.ok, isReview: !!ex.isReview, newWord: !!ex.newWord,
      pairs: ex.pairs ? ex.pairs.map((p) => p.en) : null,
      interstitial: !!document.querySelector("[data-interstitial]"),
    };
  });
}

export const clickFooter = (page) => page.click("footer button.btn-3d");

const CHOICE_FALLBACK = true;

// Responde o exercício atual. wrong=true tenta errar (quando o formato permite); devolve o que fez.
export async function answer(page, st, { wrong = false } = {}) {
  if (st.type === "match" || st.type === "listen-match") {
    await page.waitForSelector('[data-side="en"]', { timeout: 5000 });
    for (const key of st.pairs) {
      await page.click(`[data-side="en"][data-key="${key}"]`);
      await page.click(`[data-side="pt"][data-key="${key}"]`);
      await page.waitForTimeout(50);
    }
    await page.waitForTimeout(250);
    return "match";
  }
  if (st.type === "speak" || st.type === "scene-speak") {
    await page.getByText("Não posso falar agora").click();
    await page.waitForTimeout(250);
    return "skip-speak";
  }
  if (["type", "listen-type", "complete-translation", "scene-gap"].includes(st.type)) {
    await page.waitForSelector('input[type="text"]:not([disabled])', { timeout: 5000 });
    await page.fill('input[type="text"]', wrong ? "zzz" : String(st.correct));
    await clickFooter(page);
    await page.waitForTimeout(150);
    return wrong ? "typed-wrong" : "typed";
  }
  if (["build", "listen-build", "translate-en-pt", "scene-build"].includes(st.type)) {
    const words = String(st.correct).split(" ");
    const plan = wrong ? [...words].reverse() : words;
    for (const w of plan) {
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
      if (!clicked) throw new Error(`peça "${w}" ausente (${st.type})`);
      await page.waitForTimeout(40);
    }
    await clickFooter(page);
    await page.waitForTimeout(150);
    return wrong && words.length > 1 ? "built-wrong" : "built";
  }
  // Escolha (lições e cenas)
  let picked = false;
  for (let tries = 0; tries < 25 && !picked; tries++) {
    picked = await page.evaluate(({ correct, index, wrong }) => {
      if (!window.__session || window.__session.index !== index) return false;
      const nrm = (s) => String(s).toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
      const opts = [...document.querySelectorAll("[data-opt]")];
      const c = nrm(correct);
      const match = (b) => (b.dataset.value != null ? nrm(b.dataset.value) === c : (nrm(b.textContent) === c || nrm(b.textContent).endsWith(" " + c)));
      const hit = wrong ? opts.find((b) => !match(b)) : opts.find(match);
      if (hit) hit.click();
      return !!hit;
    }, { correct: st.correct, index: st.index, wrong });
    if (!picked) await page.waitForTimeout(150);
  }
  if (!picked) {
    if (!CHOICE_FALLBACK) throw new Error(`opção "${st.correct}" ausente (${st.type})`);
    throw new Error(`opção "${st.correct}" ausente (${st.type})`);
  }
  await page.waitForTimeout(60);
  await clickFooter(page);
  await page.waitForTimeout(150);
  return wrong ? "chose-wrong" : "chose";
}

// Joga a etapa aberta até o resultado. hooks: onState(st) antes de responder, onChecked(st) após conferir,
// shouldMiss(st) decide se erra de propósito. Devolve { types, result }.
export async function playToResult(page, { onState, onChecked, shouldMiss, onResult } = {}) {
  const types = new Set();
  let expectWrong = false;
  for (let step = 0; step < 220; step++) {
    const st = await readState(page);
    if (st.gone) throw new Error("sessão sumiu");
    if (st.result) { if (onResult) await onResult(st); return { types: [...types], result: st.result }; }
    types.add(st.type);
    if (st.interstitial) { if (onState) await onState({ ...st, type: "interstitial" }); await clickFooter(page); await page.waitForTimeout(400); continue; }
    if (st.checked) {
      if (onChecked) await onChecked(st);
      if (!st.ok && !expectWrong) throw new Error(`resposta errada em ${st.type} #${st.index}`);
      expectWrong = false;
      await clickFooter(page);
      await page.waitForTimeout(420);
      continue;
    }
    if (onState) await onState(st);
    if (st.silent) { await clickFooter(page); await page.waitForTimeout(420); continue; }
    const miss = !!(shouldMiss && shouldMiss(st));
    const did = await answer(page, st, { wrong: miss });
    expectWrong = did.endsWith("-wrong");
  }
  throw new Error("etapa não terminou em 220 passos");
}
