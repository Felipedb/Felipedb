// BíbliaLearn — hub de prática (Match Madness, revisão rápida, escuta, erros, histórias)
// Carregado antes de app.js; só define funções.

function learnedVocab() {
  const done = new Set(Object.keys(state.completed || {}));
  const words = [];
  COURSE.forEach((u) => u.lessons.forEach((l) => { if (done.has(l.id) && l.vocab) words.push(...l.vocab); }));
  return words.length >= 8 ? words : allVocab().slice(0, 16);
}

function renderHub() {
  const hub = $("#hub-body");
  const nErr = Object.keys(state.errors || {}).length;
  const learned = learnedVocab().length;
  const stories = STORIES.map((s) => {
    const unit = COURSE.find((u) => u.id === s.unit);
    const unlocked = unit && state.completed[unit.lessons[0].id];
    const done = state.stories && state.stories[s.id];
    return `<button class="story-card${unlocked ? "" : " locked"}" data-story="${s.id}" ${unlocked ? "" : "disabled"}>
      <span class="story-face">${charFace(CHARACTERS[s.cover])}</span>
      <span class="story-info"><b>${s.title}</b><small>${s.subtitle}${done ? " · ✓ lida" : unlocked ? "" : " · 🔒 conclua a 1ª etapa da unidade"}</small></span>
      <span class="story-xp">+${s.xp} XP</span>
    </button>`;
  }).join("");
  hub.innerHTML = `
    <h2 class="hub-title">Praticar</h2>
    <p class="hub-sub">${learned} palavras aprendidas · ${nErr} para revisar</p>
    <div class="hub-grid">
      <button class="hub-card" data-hub="madness"><span class="hub-icon">⚡</span><b>Match Madness</b><small>Pares contra o relógio · 60 s</small></button>
      <button class="hub-card" data-hub="review"><span class="hub-icon">🔁</span><b>Revisão rápida</b><small>10 exercícios do que você já aprendeu</small></button>
      <button class="hub-card" data-hub="listen"><span class="hub-icon">🎧</span><b>Escuta rápida</b><small>8 exercícios de escuta</small></button>
      <button class="hub-card${nErr ? "" : " locked"}" data-hub="errors" ${nErr ? "" : "disabled"}><span class="hub-icon">🩹</span><b>Praticar erros</b><small>${nErr ? `${nErr} palavra(s) para acertar` : "Nenhum erro pendente"}</small></button>
    </div>
    <h3 class="hub-h3">📚 Histórias</h3>
    <div class="story-list">${stories}</div>`;
  hub.querySelectorAll(".hub-card").forEach((b) => b.addEventListener("click", () => {
    const k = b.dataset.hub;
    if (k === "madness") startMatchMadness();
    if (k === "review") startQuickPractice("review");
    if (k === "listen") startQuickPractice("listen");
    if (k === "errors") startErrorPractice();
  }));
  hub.querySelectorAll(".story-card").forEach((b) => b.addEventListener("click", () => startStory(b.dataset.story)));
}

// Revisão rápida / escuta rápida: lição de prática (sem perder corações)
function startQuickPractice(kind) {
  const pool = allVocab();
  const words = shuffle(learnedVocab()).slice(0, 8);
  const distract = (v, key) => shuffle(pool.filter((p) => p[key] !== v[key] && p.icon !== v.icon)).slice(0, 3);
  const ex = [];
  words.forEach((v, i) => {
    if (kind === "listen") {
      ex.push({ type: "listen", word: v, options: shuffle([v.en, ...distract(v, "en").map((p) => p.en)]) });
    } else {
      const k = i % 4;
      if (k === 0) ex.push({ type: "image-choice", word: v, options: shuffle([v, ...distract(v, "en")]) });
      else if (k === 1) ex.push({ type: "choice-en-pt", word: v, options: shuffle([v.pt, ...distract(v, "pt").map((p) => p.pt)]) });
      else if (k === 2) ex.push({ type: "listen", word: v, options: shuffle([v.en, ...distract(v, "en").map((p) => p.en)]) });
      else ex.push({ type: "type", word: v });
    }
  });
  if (kind !== "listen" && words.length >= 4) ex.push({ type: "match", pairs: words.slice(0, 4) });
  const list = kind === "listen" ? ex : shuffle(ex).slice(0, 10);
  list.hard = [];
  const unit = COURSE[0];
  session = {
    lesson: { id: "quick-" + kind, title: kind === "listen" ? "Escuta rápida" : "Revisão rápida", unit, practiceErrors: true },
    exercises: list, index: 0, mistakes: 0, combo: 0, bestCombo: 0, bonus: 0,
    practice: true, checked: false, answer: null, startedAt: Date.now(),
    narrator: pickCharacter(unit.id), reviewQueue: [], reviewing: false, hardAdded: true, hard: [],
  };
  showScreen("lesson");
  renderExercise();
}

// ---------- Match Madness (pares contra o relógio) ----------
let madness = null;
function startMatchMadness() {
  const words = shuffle(learnedVocab());
  madness = { words, score: 0, misses: 0, timeLeft: 60, selected: null, timer: null, round: 0 };
  showScreen("madness");
  madnessRound();
  $("#md-score").textContent = "0";
  clearInterval(madness.timer);
  madness.timer = setInterval(() => {
    madness.timeLeft--;
    $("#md-time").textContent = madness.timeLeft;
    $("#md-time").classList.toggle("urgent", madness.timeLeft <= 10);
    if (madness.timeLeft <= 0) endMatchMadness();
  }, 1000);
}

function madnessRound() {
  const start = (madness.round * 5) % madness.words.length;
  let pairs = madness.words.slice(start, start + 5);
  if (pairs.length < 5) pairs = pairs.concat(madness.words.slice(0, 5 - pairs.length));
  madness.round++;
  madness.pending = pairs.length;
  const grid = $("#md-grid");
  grid.innerHTML = "";
  const left = shuffle(pairs.map((p) => ({ key: p.en, side: "en", label: p.en })));
  const right = shuffle(pairs.map((p) => ({ key: p.en, side: "pt", label: p.pt })));
  const colA = document.createElement("div"); colA.className = "match-col";
  const colB = document.createElement("div"); colB.className = "match-col";
  const cell = (item) => {
    const b = document.createElement("button");
    b.className = "opt";
    b.textContent = item.label;
    b.addEventListener("click", () => {
      if (b.classList.contains("matched")) return;
      if (item.side === "en") speak(item.label);
      const sel = madness.selected;
      if (!sel) { madness.selected = { item, el: b }; b.classList.add("selected"); return; }
      if (sel.el === b) { b.classList.remove("selected"); madness.selected = null; return; }
      if (sel.item.key === item.key && sel.item.side !== item.side) {
        [sel.el, b].forEach((el) => { el.classList.remove("selected"); el.classList.add("matched", "pop"); });
        madness.score++;
        madness.pending--;
        $("#md-score").textContent = madness.score;
        SFX.pop(madness.score % 8);
        if (madness.pending === 0) setTimeout(madnessRound, 250);
      } else {
        [sel.el, b].forEach((el) => el.classList.add("wrong"));
        const els = [sel.el, b];
        setTimeout(() => els.forEach((el) => el.classList.remove("wrong", "selected")), 400);
        madness.misses++;
        madness.timeLeft = Math.max(1, madness.timeLeft - 2);
        $("#md-time").textContent = madness.timeLeft;
        buzz(50);
      }
      madness.selected = null;
    });
    return b;
  };
  left.forEach((i) => colA.appendChild(cell(i)));
  right.forEach((i) => colB.appendChild(cell(i)));
  grid.appendChild(colA);
  grid.appendChild(colB);
}

function endMatchMadness() {
  clearInterval(madness.timer);
  const gained = Math.min(15, Math.floor(madness.score / 2));
  state.xp += gained;
  state.best = state.best || {};
  const record = madness.score > (state.best.madness || 0);
  if (record) state.best.madness = madness.score;
  recordLesson({ gained, perfect: madness.misses === 0, bestCombo: 0 });
  save();
  SFX.finish();
  $("#md-grid").innerHTML = `<div class="md-end">
    <div class="big-emoji">${record ? "🏆" : "⏱️"}</div>
    <h3>${record ? "Novo recorde!" : "Tempo esgotado!"}</h3>
    <p><b>${madness.score}</b> pares · ${madness.misses} erros · <b>+${gained} XP</b></p>
    <p class="muted">Recorde: ${state.best.madness || 0} pares</p>
    <button class="btn-main" id="md-again">Jogar de novo</button>
    <button class="btn-ghost" id="md-exit">Voltar</button>
  </div>`;
  $("#md-again").addEventListener("click", startMatchMadness);
  $("#md-exit").addEventListener("click", () => showScreen("hub"));
}

// ---------- Histórias interativas ----------
let story = null;
function startStory(id) {
  const s = STORIES.find((x) => x.id === id);
  if (!s) return;
  story = { s, i: 0, mistakes: 0, answered: false };
  showScreen("story");
  $("#story-title").textContent = s.title;
  renderBeat();
}

function renderBeat() {
  const { s, i } = story;
  $("#story-fill").style.width = `${(i / s.beats.length) * 100}%`;
  const box = $("#story-body");
  const b = s.beats[i];
  const btn = $("#story-next");
  btn.textContent = "Continuar";
  btn.disabled = false;
  btn.classList.remove("red");
  story.answered = false;
  if (b.en) {
    const ch = b.who ? CHARACTERS[b.who] : null;
    box.innerHTML = `<div class="story-line ${ch ? "" : "narrator"}">
      ${ch ? `<div class="story-face">${charFace(ch)}<small>${ch.name.split(" (")[0]}</small></div>` : `<div class="story-face narr">📖<small>Narrador</small></div>`}
      <div class="story-bubble">${sayable(b.en)}<div class="story-pt">${b.pt}</div></div>
    </div>`;
    speak(b.en, ch ? { char: ch } : {});
    story.answered = true;
  } else if (b.q) {
    box.innerHTML = `<div class="story-q">${sayable(b.q)}</div>`;
    btn.disabled = true;
    storyOptions(box, b.options, b.answer);
  } else if (b.gap) {
    box.innerHTML = `<div class="story-q">Complete a frase</div><div class="verse-box">${b.gap.replace("___", '<span class="gap" id="story-gap">&nbsp;</span>')}</div><div class="verse-ref">${b.pt}</div>`;
    btn.disabled = true;
    storyOptions(box, b.options, b.answer, (opt) => { $("#story-gap").textContent = opt; });
  }
}

function storyOptions(box, options, answer, onPick) {
  const wrap = document.createElement("div");
  wrap.className = "options";
  shuffle(options).forEach((opt) => {
    const o = document.createElement("button");
    o.className = "opt";
    o.textContent = opt;
    o.addEventListener("click", () => {
      if (story.answered) return;
      story.answered = true;
      if (onPick) onPick(opt);
      const ok = opt === answer;
      wrap.querySelectorAll(".opt").forEach((x) => {
        if (x.textContent === answer) x.classList.add("correct");
        else if (x === o) x.classList.add("wrong");
        else x.classList.add("faded");
      });
      if (ok) { SFX.correct(); buzz(25); } else { SFX.wrong(); buzz([60, 40, 60]); story.mistakes++; }
      speak(answer);
      $("#story-next").disabled = false;
    });
    wrap.appendChild(o);
  });
  box.appendChild(wrap);
}

function nextBeat() {
  if (!story.answered) return;
  story.i++;
  if (story.i >= story.s.beats.length) return finishStory();
  renderBeat();
}

function finishStory() {
  const s = story.s;
  const first = !(state.stories && state.stories[s.id]);
  state.stories = state.stories || {};
  state.stories[s.id] = true;
  const gained = first ? s.xp : Math.ceil(s.xp / 2);
  state.xp += gained;
  recordLesson({ gained, perfect: story.mistakes === 0, bestCombo: 0 });
  save();
  SFX.finish();
  if (typeof confetti === "function") confetti({ particleCount: 70, spread: 70, origin: { y: 0.4 } });
  $("#story-fill").style.width = "100%";
  $("#story-body").innerHTML = `<div class="md-end">
    <div class="story-face big">${charFace(CHARACTERS[s.cover])}</div>
    <h3>História concluída!</h3>
    <p><b>+${gained} XP</b> · ${story.mistakes === 0 ? "sem erros 🌟" : `${story.mistakes} erro(s)`}</p>
  </div>`;
  const btn = $("#story-next");
  btn.textContent = "Voltar";
  btn.disabled = false;
  story.answered = true;
  story.done = true;
}
