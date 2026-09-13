// BíbliaLearn — Motor das cenas do dia a dia
// Uma cena é uma conversa real da Bíblia vivida como situação cotidiana. O aprendiz fala pelo
// protagonista: escolhe a fala, monta a frase, completa a lacuna ou fala no microfone; as falas
// do outro personagem aparecem (ou são ouvidas e traduzidas). A conversa vai se revelando em
// um transcript, como um chat. Fecha com "o que aconteceu de verdade" e a referência.

const SCENE_BY_ID = {};
SCENES.forEach((s) => { SCENE_BY_ID[s.id] = s; });

// Personagem de uma fala: da galeria ou dos extras da cena (rosto em emoji)
function castChar(key) {
  if (CHARACTERS[key]) return { key, ...CHARACTERS[key] };
  const e = SCENE_EXTRAS[key];
  if (e) return { key, name: e.name, emoji: e.emoji, voice: { gender: e.gender, pitch: 1, rate: 1 } };
  return { key: "narrator", name: "Narrador", emoji: "📖", voice: { gender: "male", pitch: 1, rate: 1 } };
}

// Uma cena vira uma "etapa" da trilha com a mesma forma de uma lição
function sceneStep(scene, unit) {
  return { id: scene.id, title: scene.title, unit, scene: true, sceneId: scene.id, vocab: scene.vocab };
}

// Ordem das etapas do capítulo: L1, C1, C2, L2, C3, C4, L3, C5, C6, Revisão
function unitSteps(unit) {
  const lessons = unit.lessons.map((l) => ({ ...l, unit }));
  const scenes = SCENES.filter((s) => s.unit === unit.id).map((s) => sceneStep(s, unit));
  if (!scenes.length) return lessons;
  const core = lessons.filter((l) => !l.review), review = lessons.filter((l) => l.review);
  const out = [];
  let si = 0;
  core.forEach((l, i) => {
    out.push(l);
    const n = i === core.length - 1 ? scenes.length - si : 2;
    out.push(...scenes.slice(si, si + n));
    si += n;
  });
  out.push(...scenes.slice(si), ...review);
  return out;
}

function sceneOfStep(step) { return SCENE_BY_ID[step.sceneId || step.id]; }
function sceneUnlocked(sceneId) { return lessonUnlocked(sceneId); }

const cleanWord = (w) => w.replace(/[.,;:!?"]/g, "").replace(/^'|'$/g, "");
const wordCount = (s) => s.trim().split(/\s+/).length;

// Palavra da lacuna: um item do vocabulário que aparece na fala; senão, a palavra mais longa
function sceneGapWord(en, vocab) {
  const tokens = en.split(" ").map(cleanWord).filter(Boolean);
  const single = vocab.map((v) => v.en.replace(/^to /, "")).filter((v) => !v.includes(" "));
  const hit = tokens.find((t) => single.some((v) => normalize(v) === normalize(t)));
  if (hit) return hit;
  const cands = tokens.filter((t) => /^[a-z]+$/i.test(t) && t.length >= 4 && !/^[A-Z]/.test(t));
  if (!cands.length) return null;
  return cands.sort((a, b) => b.length - a.length)[0];
}

function sceneBank(line, scene) {
  const words = line.en.split(" ");
  const pool = scene.lines.filter((l) => l !== line).flatMap((l) => l.en.split(" ").map(cleanWord))
    .filter((w) => w && !words.map(cleanWord).map(normalize).includes(normalize(w)));
  const extra = [];
  shuffle([...new Set(pool)]).forEach((w) => { if (extra.length < 2) extra.push(w); });
  return shuffle([...words, ...extra]);
}

// Distratores para "escolha a fala": outras falas do herói (da cena e, se faltar, das outras cenas dele)
function sceneReplyOptions(line, scene) {
  const own = scene.lines.filter((l) => l.who === scene.char && l.en !== line.en).map((l) => l.en);
  const others = SCENES.filter((s) => s.char === scene.char && s !== scene).flatMap((s) => s.lines.filter((l) => l.who === s.char).map((l) => l.en));
  const pool = [...new Set([...shuffle(own), ...shuffle(others)])].filter((e) => e !== line.en);
  // prefere falas de tamanho parecido, para não entregar a resposta pelo comprimento
  const near = pool.sort((a, b) => Math.abs(a.length - line.en.length) - Math.abs(b.length - line.en.length)).slice(0, 4);
  return shuffle([line.en, ...shuffle(near).slice(0, 2)]);
}

function sceneListenOptions(line, scene) {
  const pool = [...new Set(scene.lines.filter((l) => l !== line).map((l) => l.pt))];
  const near = shuffle(pool).sort((a, b) => Math.abs(a.length - line.pt.length) - Math.abs(b.length - line.pt.length)).slice(0, 4);
  return shuffle([line.pt, ...shuffle(near).slice(0, 2)]);
}

function buildSceneExercises(step) {
  const sc = sceneOfStep(step);
  const speakMuted = state.speakMutedUntil && Date.now() < state.speakMutedUntil;
  const canSpeak = SPEECH_OK && !speakMuted;
  const ex = [];
  const id = sc.id;
  ex.push({ type: "scene-intro", sceneId: id, silent: true });

  // Aquecimento: duas checagens do vocabulário da cena (uma EN→PT, uma PT→EN)
  const vocab = shuffle(sc.vocab.slice());
  vocab.slice(0, 2).forEach((w, i) => {
    const others = sc.vocab.filter((o) => o !== w);
    const dir = i === 0 ? "en-pt" : "pt-en";
    const key = dir === "en-pt" ? "pt" : "en";
    ex.push({ type: "scene-word", sceneId: id, dir, word: w, options: shuffle([w[key], ...shuffle(others).slice(0, 2).map((o) => o[key])]) });
  });

  // A conversa, fala por fala
  const cycle = ["reply", "build", "gap", "speak"];
  let hi = 0, pi = 0;
  sc.lines.forEach((line, li) => {
    const base = { sceneId: id, li, sentence: { en: line.en, pt: line.pt }, audioText: line.en };
    if (line.who === sc.char) {
      let kind = cycle[hi % cycle.length];
      hi++;
      const n = wordCount(line.en);
      if (kind === "speak" && !canSpeak) kind = "build";
      if (kind === "build" && n > 12) kind = "gap";
      if (kind === "gap" && !sceneGapWord(line.en, sc.vocab)) kind = "reply";
      if (kind === "build" && n < 3) kind = "reply";
      if (kind === "reply") ex.push({ ...base, type: "scene-reply", options: sceneReplyOptions(line, sc) });
      else if (kind === "build") ex.push({ ...base, type: "scene-build", bank: sceneBank(line, sc) });
      else if (kind === "gap") ex.push({ ...base, type: "scene-gap", blank: sceneGapWord(line.en, sc.vocab) });
      else ex.push({ ...base, type: "scene-speak" });
    } else {
      // A primeira fala do outro é sempre revelada (contexto); depois alterna: ouvir e traduzir / ler
      if (pi % 2 === 1 && !listenMuted()) ex.push({ ...base, type: "scene-listen", options: sceneListenOptions(line, sc) });
      else ex.push({ ...base, type: "scene-line", silent: true });
      pi++;
    }
  });
  ex.push({ type: "scene-truth", sceneId: id, silent: true });
  ex.hard = [];
  return ex;
}

// ---------- Renderização ----------
function sceneFaceHTML(ch, cls = "") {
  return `<span class="sc-face ${cls}" data-char="${ch.key}">${charFace(ch)}<span class="react"></span></span>`;
}

function sceneNameOf(key) { return castChar(key).name.split(" (")[0]; }

// Transcript da conversa até a fala atual (as anteriores; a atual entra em destaque)
function sceneTranscript(sc, upto, box, current) {
  const chat = document.createElement("div");
  chat.className = "sc-chat";
  const prev = sc.lines.slice(0, upto);
  const hidden = Math.max(0, prev.length - 2);
  if (hidden) {
    const more = document.createElement("button");
    more.className = "sc-more";
    more.textContent = `▲ ${hidden} fala${hidden > 1 ? "s" : ""} anterior${hidden > 1 ? "es" : ""}`;
    more.addEventListener("click", () => { chat.querySelectorAll(".sc-msg.folded").forEach((m) => m.classList.remove("folded")); more.remove(); });
    chat.appendChild(more);
  }
  prev.forEach((line, i) => chat.appendChild(sceneMsg(sc, line, { folded: i < hidden })));
  if (current) chat.appendChild(current);
  box.appendChild(chat);
  return chat;
}

function sceneMsg(sc, line, opts = {}) {
  const ch = castChar(line.who);
  const me = line.who === sc.char;
  const row = document.createElement("div");
  row.className = `sc-msg ${me ? "me" : "them"}${opts.folded ? " folded" : ""}${opts.now ? " now" : ""}`;
  const bubble = document.createElement("div");
  bubble.className = "sc-bubble";
  if (opts.body) bubble.appendChild(opts.body);
  else bubble.innerHTML = `<div class="sc-who">${sceneNameOf(line.who)}</div><div class="sc-en">${line.en}</div><div class="sc-pt">${line.pt}</div>`;
  if (!opts.body) {
    bubble.classList.add("tap");
    bubble.title = "Ouvir";
    bubble.addEventListener("click", () => { speak(line.en, { char: ch }); row.classList.add("now"); setTimeout(() => row.classList.remove("now"), 1500); });
  }
  row.insertAdjacentHTML("afterbegin", sceneFaceHTML(ch, (me ? "me" : "them") + (opts.now ? " now" : "")));
  row.appendChild(bubble);
  return row;
}

function sceneHeader(box, sc, title) {
  box.innerHTML = `<div class="sc-chipline"><span class="sc-chip">💬 ${sc.title}</span></div><div class="ex-title">${title}</div>`;
}

function setContinue(label) {
  const btn = $("#btn-check");
  btn.disabled = false;
  btn.textContent = label || "Continuar";
}

function renderSceneIntro(ex, box) {
  const sc = SCENE_BY_ID[ex.sceneId];
  const hero = castChar(sc.char), other = castChar(sc.with);
  session.voiceChar = hero;
  box.innerHTML = `<div class="ex-title sc-title">Nova cena</div>
    <div class="sc-intro">
      <div class="sc-eyebrow">Situação · ${sc.func}</div>
      <h2>${sc.title}</h2>
      <div class="sc-cast">
        <div class="sc-castcard">${sceneFaceHTML(hero, "me big")}<b>${hero.name.split(" (")[0]}</b><small>você fala por ele</small></div>
        <span class="sc-vs">↔</span>
        <div class="sc-castcard">${sceneFaceHTML(other, "them big")}<b>${other.name.split(" (")[0]}</b><small>${sc.with === sc.char ? "" : "responde"}</small></div>
      </div>
      <p class="sc-context">${sc.context}</p>
      <div class="sc-ref">📖 ${sc.ref}</div>
      <div class="sc-vocab-title">Palavras e expressões da cena <small>(toque para ouvir)</small></div>
      <div class="sc-vocab">${sc.vocab.map((v) => `<button class="sc-vchip" data-en="${v.en.replace(/"/g, "&quot;")}"><span class="sc-vico">${v.icon || "•"}</span><span><b>${v.en}</b><small>${v.pt}</small></span></button>`).join("")}</div>
    </div>`;
  box.querySelectorAll(".sc-vchip").forEach((b) => b.addEventListener("click", () => { speak(b.dataset.en, { char: hero }); b.classList.add("pop"); setTimeout(() => b.classList.remove("pop"), 300); }));
  ex.correct = "__intro__";
  session.answer = "__intro__";
  setContinue("Começar a cena");
}

function renderSceneWord(ex, box) {
  const sc = SCENE_BY_ID[ex.sceneId];
  const hero = castChar(sc.char);
  session.voiceChar = hero;
  const enFirst = ex.dir === "en-pt";
  box.innerHTML = `<div class="ex-title sc-title"><span class="sc-chip">💬 ${sc.title}</span>${enFirst ? "O que significa?" : "Como se diz em inglês?"}</div>`;
  const card = document.createElement("div");
  card.className = "sc-wordcard";
  card.innerHTML = `<span class="sc-vico big">${ex.word.icon || "•"}</span><span class="ex-word">${enFirst ? ex.word.en : ex.word.pt}</span>`;
  if (enFirst) { const a = audioButton(ex.word.en); card.prepend(a); }
  box.appendChild(card);
  makeOptions(box, ex.options, 1, (opt) => { if (!enFirst) speak(opt, { char: hero }); });
  if (enFirst) speak(ex.word.en, { char: hero });
  ex.correct = enFirst ? ex.word.pt : ex.word.en;
  ex.explain = `${ex.word.en} = ${ex.word.pt}`;
  ex.audioText = ex.word.en;
}

// Fala do outro personagem: só lê (com áudio), sem resposta
function renderSceneLine(ex, box) {
  const sc = SCENE_BY_ID[ex.sceneId];
  const line = sc.lines[ex.li];
  const ch = castChar(line.who);
  session.voiceChar = ch;
  sceneHeader(box, sc, `${sceneNameOf(line.who)} diz:`);
  const body = document.createElement("div");
  body.innerHTML = `<div class="sc-who">${sceneNameOf(line.who)}</div>`;
  const row = document.createElement("div");
  row.className = "sc-en-row";
  row.appendChild(audioButton(line.en));
  row.insertAdjacentHTML("beforeend", `<span class="sc-en">${sayable(line.en)}</span>`);
  body.appendChild(row);
  body.insertAdjacentHTML("beforeend", `<div class="sc-pt">${line.pt}</div>`);
  sceneTranscript(sc, ex.li, box, sceneMsg(sc, line, { body, now: true }));
  speak(line.en, { char: ch });
  ex.correct = "__line__";
  session.answer = "__line__";
  setContinue("Continuar");
}

// Fala do outro personagem: ouvir e escolher a tradução
function renderSceneListen(ex, box) {
  const sc = SCENE_BY_ID[ex.sceneId];
  const line = sc.lines[ex.li];
  const ch = castChar(line.who);
  session.voiceChar = ch;
  sceneHeader(box, sc, `🎧 O que ${sceneNameOf(line.who)} disse?`);
  const body = document.createElement("div");
  body.innerHTML = `<div class="sc-who">${sceneNameOf(line.who)}</div>`;
  const row = document.createElement("div");
  row.className = "sc-en-row";
  row.appendChild(audioButton(line.en));
  row.appendChild(audioButton(line.en, { slow: true }));
  row.insertAdjacentHTML("beforeend", `<span class="sc-en sc-secret">${line.en}</span>`);
  body.appendChild(row);
  sceneTranscript(sc, ex.li, box, sceneMsg(sc, line, { body, now: true }));
  box.insertAdjacentHTML("beforeend", `<div class="reply-label">Em português, ele disse:</div>`);
  makeOptions(box, ex.options, 1);
  speak(line.en, { char: ch });
  ex.correct = line.pt;
  ex.explain = `"${line.en}" = "${line.pt}"`;
  ex.onChecked = () => { const s = box.querySelector(".sc-secret"); if (s) s.classList.remove("sc-secret"); };
}

// Bolha do herói antes da resposta: mostra a dica em português
function heroPromptBody(sc, line, hint) {
  const body = document.createElement("div");
  body.innerHTML = `<div class="sc-who">${sceneNameOf(sc.char)} (você)</div><div class="sc-hint">${hint}</div><div class="sc-pt">${line.pt}</div>`;
  return body;
}
function revealHero(box, line) {
  const b = box.querySelector(".sc-msg.now .sc-bubble");
  if (!b) return;
  b.innerHTML = `<div class="sc-who">${b.querySelector(".sc-who").textContent}</div><div class="sc-en">${line.en}</div><div class="sc-pt">${line.pt}</div>`;
}

// Herói: escolha a fala certa (3 opções em inglês)
function renderSceneReply(ex, box) {
  const sc = SCENE_BY_ID[ex.sceneId];
  const line = sc.lines[ex.li];
  const hero = castChar(sc.char);
  session.voiceChar = hero;
  sceneHeader(box, sc, ex.li === 0 ? `Sua vez: fale por ${sceneNameOf(sc.char)}` : `Sua vez: o que ${sceneNameOf(sc.char)} responde?`);
  sceneTranscript(sc, ex.li, box, sceneMsg(sc, line, { body: heroPromptBody(sc, line, "Escolha a fala em inglês que diz isto:"), now: true }));
  box.insertAdjacentHTML("beforeend", `<div class="reply-label">Sua resposta:</div>`);
  makeOptions(box, ex.options, 1, (opt) => speak(opt, { char: hero }));
  ex.correct = line.en;
  ex.explain = `"${line.en}" = "${line.pt}"`;
  ex.onChecked = (ok) => { revealHero(box, line); if (ok) speak(line.en, { char: hero }); };
}

// Herói: monte a frase com o banco de palavras
function renderSceneBuild(ex, box) {
  const sc = SCENE_BY_ID[ex.sceneId];
  const line = sc.lines[ex.li];
  const hero = castChar(sc.char);
  session.voiceChar = hero;
  sceneHeader(box, sc, `Monte a fala de ${sceneNameOf(sc.char)}:`);
  sceneTranscript(sc, ex.li, box, sceneMsg(sc, line, { body: heroPromptBody(sc, line, "Escreva em inglês:"), now: true }));
  wordBankUI(ex, box, line.en);
  ex.onChecked = (ok) => { revealHero(box, line); if (ok) speak(line.en, { char: hero }); };
}

// Herói: complete a palavra que falta
function renderSceneGap(ex, box) {
  const sc = SCENE_BY_ID[ex.sceneId];
  const line = sc.lines[ex.li];
  const hero = castChar(sc.char);
  session.voiceChar = hero;
  sceneHeader(box, sc, `Complete a fala de ${sceneNameOf(sc.char)}:`);
  const body = document.createElement("div");
  body.innerHTML = `<div class="sc-who">${sceneNameOf(sc.char)} (você)</div><div class="sc-en gap-box">${gappedSentence(line.en, ex.blank)}</div><div class="sc-pt">${line.pt}</div>`;
  sceneTranscript(sc, ex.li, box, sceneMsg(sc, line, { body, now: true }));
  const inp = textInput("");
  inp.classList.add("gap-input");
  inp.style.width = Math.max(5, ex.blank.length + 2) + "ch";
  const gap = box.querySelector("#sent-gap");
  if (gap) gap.replaceWith(inp);
  const hint = sc.vocab.find((v) => normalize(v.en.replace(/^to /, "")) === normalize(ex.blank));
  box.insertAdjacentHTML("beforeend", `<div class="tip-line">${hint ? `Dica: ${hint.icon || ""} ${hint.pt}` : "Dica: a palavra está no vocabulário da cena ou na tradução"}</div>`);
  setTimeout(() => inp.focus(), 50);
  ex.correct = ex.blank;
  ex.fuzzy = true;
  ex.explain = `"${line.en}"`;
  ex.onChecked = (ok) => { revealHero(box, line); if (ok) speak(line.en, { char: hero }); };
}

// Herói: fale a frase no microfone
function renderSceneSpeak(ex, box) {
  const sc = SCENE_BY_ID[ex.sceneId];
  const line = sc.lines[ex.li];
  const hero = castChar(sc.char);
  session.voiceChar = hero;
  sceneHeader(box, sc, `Fale como ${sceneNameOf(sc.char)}:`);
  const body = document.createElement("div");
  body.innerHTML = `<div class="sc-who">${sceneNameOf(sc.char)} (você)</div>`;
  const row = document.createElement("div");
  row.className = "sc-en-row";
  row.appendChild(audioButton(line.en));
  row.appendChild(audioButton(line.en, { slow: true }));
  row.insertAdjacentHTML("beforeend", `<span class="sc-en">${sayable(line.en)}</span>`);
  body.appendChild(row);
  body.insertAdjacentHTML("beforeend", `<div class="sc-pt">${line.pt}</div>`);
  sceneTranscript(sc, ex.li, box, sceneMsg(sc, line, { body, now: true }));

  const mic = document.createElement("button");
  mic.className = "mic-btn";
  mic.innerHTML = `${ICONS.mic}<span>Toque para falar</span>`;
  mic.setAttribute("aria-label", "Toque para falar");
  const status = document.createElement("div");
  status.className = "mic-status";
  const skip = document.createElement("button");
  skip.className = "btn-link muted";
  skip.textContent = "Não posso falar agora";
  box.appendChild(mic);
  box.appendChild(status);
  box.appendChild(skip);
  speak(line.en, { char: hero });

  mic.addEventListener("click", () => {
    if (session.checked) return;
    if (session.recognizer) { try { session.recognizer.stop(); } catch (e) {} return; }
    session.recognizer = recognizeOnce(line.en, {
      onStart: () => { mic.classList.add("listening"); mic.innerHTML = `${ICONS.mic}<span>Ouvindo...</span>`; status.textContent = ""; },
      onResult: (r) => {
        status.textContent = `Você disse: "${r.text}"`;
        session.answer = r.ok ? line.en : r.text;
        $("#btn-check").disabled = false;
        checkAnswer();
      },
      onError: (err) => {
        status.textContent = err === "unsupported" ? "Reconhecimento de voz indisponível neste navegador."
          : err === "not-allowed" ? "Permita o uso do microfone ou pule este exercício." : "Não consegui ouvir. Tente de novo ou pule.";
      },
      onEnd: () => { session.recognizer = null; mic.classList.remove("listening"); mic.innerHTML = `${ICONS.mic}<span>Toque para falar</span>`; },
    });
  });
  skip.addEventListener("click", () => {
    if (session.checked) return;
    state.speakMutedUntil = Date.now() + 15 * 60 * 1000;
    save();
    // As próximas falas no microfone viram "monte a frase"
    session.exercises = session.exercises.map((e, i) => (i > session.index && e.type === "scene-speak")
      ? { ...e, type: "scene-build", bank: sceneBank(SCENE_BY_ID[e.sceneId].lines[e.li], SCENE_BY_ID[e.sceneId]) } : e);
    toast("🔇 Exercícios de fala pausados por 15 min");
    ex.skipped = true;
    session.answer = line.en;
    $("#btn-check").disabled = false;
    checkAnswer();
  });
  ex.correct = line.en;
  ex.explain = `"${line.en}" = "${line.pt}"`;
}

function renderSceneTruth(ex, box) {
  const sc = SCENE_BY_ID[ex.sceneId];
  const hero = castChar(sc.char);
  session.voiceChar = hero;
  box.innerHTML = `<div class="ex-title sc-title">Cena completa! 🎉</div>
    <div class="sc-truth">
      <div class="sc-eyebrow">📖 O que aconteceu de verdade</div>
      <p>${sc.truth}</p>
      <div class="sc-ref">${sc.ref}</div>
    </div>
    <div class="sc-vocab-title">Você praticou</div>
    <div class="sc-vocab">${sc.vocab.map((v) => `<button class="sc-vchip" data-en="${v.en.replace(/"/g, "&quot;")}"><span class="sc-vico">${v.icon || "•"}</span><span><b>${v.en}</b><small>${v.pt}</small></span></button>`).join("")}</div>
    <button class="btn-ghost sc-replay" id="sc-replay">▶ Ouvir a conversa inteira</button>`;
  box.querySelectorAll(".sc-vchip").forEach((b) => b.addEventListener("click", () => speak(b.dataset.en, { char: hero })));
  const replay = box.querySelector("#sc-replay");
  replay.addEventListener("click", () => {
    replay.disabled = true;
    let i = 0;
    const next = () => {
      if (i >= sc.lines.length || !$("#screen-lesson").classList.contains("active")) { replay.disabled = false; return; }
      const l = sc.lines[i++];
      replay.textContent = `${sceneNameOf(l.who)}: ${l.en}`;
      speak(l.en, { char: castChar(l.who) });
      const d = (typeof clipDuration === "function" && clipDuration(l.en, l.who)) || Math.min(5, 0.6 + l.en.length * 0.06);
      setTimeout(next, d * 1000 + 500);
    };
    next();
  });
  ex.correct = "__truth__";
  session.answer = "__truth__";
  setContinue("Concluir cena");
}

const SCENE_RENDER = {
  "scene-intro": renderSceneIntro,
  "scene-word": renderSceneWord,
  "scene-line": renderSceneLine,
  "scene-listen": renderSceneListen,
  "scene-reply": renderSceneReply,
  "scene-build": renderSceneBuild,
  "scene-gap": renderSceneGap,
  "scene-speak": renderSceneSpeak,
  "scene-truth": renderSceneTruth,
};

// ---------- Praticar: "Situações do dia a dia" ----------
function renderSituations() {
  const groups = [];
  SCENES.forEach((s) => {
    let g = groups.find((x) => x.char === s.char);
    if (!g) { g = { char: s.char, items: [] }; groups.push(g); }
    g.items.push(s);
  });
  return groups.map((g) => {
    const ch = castChar(g.char);
    return `<div class="sit-group">
      <div class="sit-head">${sceneFaceHTML(ch, "me")}<b>${ch.name.split(" (")[0]}</b><small>${g.items.filter((s) => state.completed[s.id]).length}/${g.items.length} cenas</small></div>
      <div class="sit-list">${g.items.map((s) => {
        const unlocked = sceneUnlocked(s.id), done = !!state.completed[s.id];
        return `<button class="sit-card${unlocked ? "" : " locked"}" data-scene="${s.id}" ${unlocked ? "" : "disabled"}>
          <span class="sit-ico">${done ? "✅" : unlocked ? "💬" : "🔒"}</span>
          <span class="sit-info"><b>${s.title}</b><small>${s.func}</small></span>
          <span class="sit-xp">${done ? "+5 XP" : "+" + XP_PER_LESSON + " XP"}</span>
        </button>`;
      }).join("")}</div>
    </div>`;
  }).join("");
}
