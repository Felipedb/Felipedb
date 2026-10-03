// Driver compartilhado dos testes de ponta a ponta: lê a sessão exposta em DEV (window.__session)
// e responde o exercício atual (certo ou, de propósito, errado). Usado por e2e-course.mjs, e2e-lesson.mjs,
// shots-visual.mjs e shots-all.mjs.
// Modo tolerante (VISUAL_SPEC 10.2): abre o nó pelo popover se [data-popover-start] existir (senão direto);
// usa [data-answer-input] se existir (senão input[type="text"]); no resultado repete "Continuar" enquanto houver [data-ceremony].
export const LAUNCH_ARGS = ["--no-sandbox", "--autoplay-policy=no-user-gesture-required", "--mute-audio"];
export const PHONE = { width: 390, height: 844 };

export const sessionStarted = (page) => page.evaluate(() => !!(window.__session && window.__session.exercises));

// Abre uma etapa da trilha: clica [data-node="<id>"] button e, se aparecer o popover do nó, clica [data-popover-start].
// waitSession=false serve aos casos em que a etapa não abre (ex.: modal de corações).
export async function openNode(page, id, { timeout = 10000, waitSession = true } = {}) {
  await page.waitForSelector(`[data-node="${id}"] button`, { timeout });
  await page.click(`[data-node="${id}"] button`);
  for (let i = 0; i < 15; i++) {
    if (waitSession && await sessionStarted(page)) return "direct";
    const pop = await page.$("[data-popover-start]");
    if (pop) { await pop.click(); if (!waitSession) return "popover"; break; }
    if (!waitSession && i >= 6) return "direct";
    await page.waitForTimeout(100);
  }
  if (waitSession) await page.waitForFunction(() => window.__session && window.__session.exercises, null, { timeout });
  return "popover";
}

// Nós de cena (ids começam com "c-") cujo botão está habilitado, na ordem da trilha
export async function sceneNodeIds(page) {
  return page.evaluate(() => [...document.querySelectorAll('[data-node^="c-"]')]
    .filter((n) => { const b = n.querySelector("button"); return b && !b.disabled; })
    .sort((a, b) => (+a.dataset.order) - (+b.dataset.order))
    .map((n) => n.dataset.node));
}

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

// Campo de resposta: [data-answer-input] (textarea ou lacuna) com reserva em input[type="text"]
export const ANSWER_INPUT = '[data-answer-input]:not([disabled]), input[type="text"]:not([disabled])';
export async function fillAnswer(page, text, { timeout = 5000 } = {}) {
  await page.waitForSelector(ANSWER_INPUT, { timeout });
  const el = await page.$('[data-answer-input]:not([disabled])') || await page.$('input[type="text"]:not([disabled])');
  await el.fill(String(text));
}

// Resultado -> trilha: clica "Continuar" e repete enquanto houver uma cerimônia pós-lição ([data-ceremony])
export async function finishResult(page, { timeout = 10000, max = 8 } = {}) {
  for (let i = 0; i < max; i++) {
    await page.getByRole("button", { name: "Continuar" }).last().click();
    await page.waitForSelector("[data-node], [data-ceremony]", { timeout });
    await page.waitForTimeout(250);
    if (!(await page.$("[data-ceremony]"))) break;
  }
  await page.waitForSelector("[data-node]", { timeout });
}

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
    await fillAnswer(page, wrong ? "zzz" : String(st.correct));
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
  if (!picked) throw new Error(`opção "${st.correct}" ausente (${st.type})`);
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
