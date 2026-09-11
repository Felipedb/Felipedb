// BibleLingo — lógica do app (trilha, exercícios, corações, XP, ofensiva)

const MAX_HEARTS = 5;
const XP_PER_LESSON = 10;
const XP_PERFECT_BONUS = 5;

// ---------- Estado persistente ----------
const state = load();

function load() {
  const base = {
    xp: 0,
    streak: 0,
    lastStudy: null, // "YYYY-MM-DD" do último dia com lição concluída
    hearts: MAX_HEARTS,
    heartsDay: today(),
    completed: {}, // lessonId -> true
  };
  try {
    const raw = localStorage.getItem("biblelingo");
    if (raw) Object.assign(base, JSON.parse(raw));
  } catch (e) { /* armazenamento indisponível: segue em memória */ }
  // Corações renovam a cada novo dia
  if (base.heartsDay !== today()) {
    base.hearts = MAX_HEARTS;
    base.heartsDay = today();
  }
  // Ofensiva quebra se ficou mais de um dia sem estudar
  if (base.lastStudy && daysBetween(base.lastStudy, today()) > 1) base.streak = 0;
  return base;
}

function save() {
  try { localStorage.setItem("biblelingo", JSON.stringify(state)); } catch (e) {}
}

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function daysBetween(a, b) {
  return Math.round((new Date(b) - new Date(a)) / 86400000);
}

// ---------- Utilidades ----------
const $ = (sel) => document.querySelector(sel);

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function speak(text, rate = 0.95) {
  if (!("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = rate;
  const voice = speechSynthesis.getVoices().find((v) => v.lang.startsWith("en"));
  if (voice) u.voice = voice;
  speechSynthesis.speak(u);
}
if ("speechSynthesis" in window) speechSynthesis.getVoices();

function allVocab() {
  return COURSE.flatMap((u) => u.lessons.flatMap((l) => l.vocab || []));
}

function unitVocab(unit) {
  return unit.lessons.flatMap((l) => l.vocab || []);
}

// ---------- Trilha ----------
function flatLessons() {
  return COURSE.flatMap((u) => u.lessons.map((l) => ({ ...l, unit: u })));
}

function lessonUnlocked(lessonId) {
  const list = flatLessons();
  const idx = list.findIndex((l) => l.id === lessonId);
  if (idx === 0) return true;
  return !!state.completed[list[idx - 1].id];
}

function currentLessonId() {
  const list = flatLessons();
  const next = list.find((l) => !state.completed[l.id]);
  return next ? next.id : null;
}

function renderHome() {
  $("#stat-streak").textContent = state.streak;
  $("#stat-xp").textContent = state.xp;
  $("#stat-hearts").textContent = state.hearts;

  const trail = $("#trail");
  trail.innerHTML = "";
  const currentId = currentLessonId();
  const offsets = ["", "offset-l", "", "offset-r", ""];

  COURSE.forEach((unit) => {
    const header = document.createElement("div");
    header.className = "unit-header";
    header.style.setProperty("--uc", unit.color);
    header.innerHTML = `<h2>${unit.icon} ${unit.title}</h2><p>${unit.subtitle}</p><span class="watermark">${unit.icon}</span>`;
    trail.appendChild(header);

    const nodes = document.createElement("div");
    nodes.className = "nodes";
    unit.lessons.forEach((lesson, i) => {
      const row = document.createElement("div");
      row.className = `node-row ${offsets[i % offsets.length]}`;
      const done = !!state.completed[lesson.id];
      const isCurrent = lesson.id === currentId;
      const unlocked = lessonUnlocked(lesson.id);

      const btn = document.createElement("button");
      btn.className = "node" + (done ? " done" : isCurrent ? " current" : unlocked ? "" : " locked");
      const icon = done ? "✓" : lesson.review ? "🏆" : unlocked ? "★" : "🔒";
      const tip = isCurrent ? '<span class="start-tip">COMEÇAR</span>' : "";
      btn.innerHTML = `${isCurrent ? '<span class="pulse"></span>' : ""}${tip}${icon}<span class="label">${lesson.title}</span>`;
      btn.addEventListener("click", () => startLesson(lesson.id));
      row.appendChild(btn);
      nodes.appendChild(row);
    });
    trail.appendChild(nodes);
    drawTrailPath(nodes, unit.color);
  });
}

// Desenha o caminho tracejado ligando os nós de uma unidade
function drawTrailPath(nodesEl, color) {
  requestAnimationFrame(() => {
    const old = nodesEl.querySelector(".trail-path");
    if (old) old.remove();
    const nodes = [...nodesEl.querySelectorAll(".node")];
    if (nodes.length < 2) return;
    const box = nodesEl.getBoundingClientRect();
    if (!box.height) return;
    const centers = nodes.map((n) => {
      const r = n.getBoundingClientRect();
      return { x: r.left - box.left + r.width / 2, y: r.top - box.top + r.height / 2 };
    });
    let d = `M ${centers[0].x} ${centers[0].y}`;
    for (let i = 1; i < centers.length; i++) {
      const a = centers[i - 1], b = centers[i];
      const my = (a.y + b.y) / 2;
      d += ` C ${a.x} ${my}, ${b.x} ${my}, ${b.x} ${b.y}`;
    }
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "trail-path");
    svg.setAttribute("viewBox", `0 0 ${box.width} ${box.height}`);
    svg.setAttribute("preserveAspectRatio", "none");
    svg.innerHTML = `<path d="${d}" fill="none" stroke="${color}" stroke-opacity="0.25" stroke-width="12" stroke-linecap="round" stroke-dasharray="0.1 22"/>`;
    nodesEl.prepend(svg);
  });
}

// ---------- Geração de exercícios ----------
function buildExercises(lesson, unit) {
  const ex = [];
  const pool = allVocab();

  const vocab = lesson.review ? shuffle(unitVocab(unit)).slice(0, 6) : lesson.vocab;
  const sentences = lesson.review
    ? shuffle(unit.lessons.flatMap((l) => l.sentences || [])).slice(0, 2)
    : lesson.sentences || [];
  const verses = lesson.review
    ? unit.lessons.filter((l) => l.verse).map((l) => l.verse)
    : lesson.verse ? [lesson.verse] : [];

  vocab.forEach((v, i) => {
    const distract = (key) =>
      shuffle(pool.filter((p) => p[key] !== v[key])).slice(0, 3).map((p) => p[key]);
    if (i % 3 === 0) {
      ex.push({ type: "choice-en-pt", word: v, options: shuffle([v.pt, ...distract("pt")]) });
    } else if (i % 3 === 1) {
      ex.push({ type: "choice-pt-en", word: v, options: shuffle([v.en, ...distract("en")]) });
    } else {
      ex.push({ type: "listen", word: v, options: shuffle([v.en, ...distract("en")]) });
    }
  });

  // Pareamento com o vocabulário da lição
  if (vocab.length >= 4) {
    ex.push({ type: "match", pairs: shuffle(vocab).slice(0, 4) });
  }

  sentences.forEach((s) => {
    const words = s.en.split(" ");
    const extra = shuffle(pool.map((p) => p.en.replace("to ", "")))
      .filter((w) => !words.includes(w))
      .slice(0, 2);
    ex.push({ type: "build", sentence: s, bank: shuffle([...words, ...extra]) });
  });

  verses.forEach((v) => {
    ex.push({ type: "verse", verse: v, options: shuffle(v.options) });
  });

  return shuffle(ex);
}

// ---------- Fluxo da lição ----------
let session = null;

function startLesson(lessonId) {
  if (state.hearts <= 0) {
    const isRedo = !!state.completed[lessonId];
    if (!isRedo) {
      $("#modal-hearts").classList.add("open");
      return;
    }
  }
  const list = flatLessons();
  const lesson = list.find((l) => l.id === lessonId);
  if (!lesson) return;

  session = {
    lesson,
    exercises: buildExercises(lesson, lesson.unit),
    index: 0,
    mistakes: 0,
    practice: !!state.completed[lessonId], // refazer lição não perde coração e recupera 1
    checked: false,
    answer: null,
  };
  showScreen("lesson");
  renderExercise();
}

function showScreen(name) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  $(`#screen-${name}`).classList.add("active");
  if (name === "home") renderHome();
}

function renderExercise() {
  const ex = session.exercises[session.index];
  session.checked = false;
  session.answer = null;

  $("#progress-fill").style.width = `${(session.index / session.exercises.length) * 100}%`;
  $("#lesson-hearts").textContent = session.practice ? "💪 prática" : `❤️ ${state.hearts}`;

  const footer = $("#footer");
  footer.className = "footer";
  const btn = $("#btn-check");
  btn.textContent = "Verificar";
  btn.disabled = true;
  btn.classList.remove("red", "blue");

  const box = $("#exercise-body");
  box.innerHTML = "";

  const render = {
    "choice-en-pt": renderChoiceEnPt,
    "choice-pt-en": renderChoicePtEn,
    "listen": renderListen,
    "match": renderMatch,
    "build": renderBuild,
    "verse": renderVerse,
  }[ex.type];
  render(ex, box);
}

function makeOptions(box, options, cols, onSelect) {
  const wrap = document.createElement("div");
  wrap.className = "options" + (cols === 2 ? " grid2" : "");
  options.forEach((opt) => {
    const b = document.createElement("button");
    b.className = "opt";
    b.textContent = opt;
    b.addEventListener("click", () => {
      if (session.checked) return;
      wrap.querySelectorAll(".opt").forEach((o) => o.classList.remove("selected"));
      b.classList.add("selected");
      session.answer = opt;
      $("#btn-check").disabled = false;
      if (onSelect) onSelect(opt);
    });
    wrap.appendChild(b);
  });
  box.appendChild(wrap);
  return wrap;
}

// Personagem com balão de fala (estilo Duolingo)
function characterRow(bubbleContent) {
  const ch = pickCharacter(session.lesson.unit.id);
  const row = document.createElement("div");
  row.className = "char-row";
  const fig = document.createElement("div");
  fig.className = "char-fig";
  fig.innerHTML = `${ch.svg}<span class="char-name">${ch.name}</span>`;
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  if (typeof bubbleContent === "string") bubble.innerHTML = bubbleContent;
  else bubble.appendChild(bubbleContent);
  row.appendChild(fig);
  row.appendChild(bubble);
  return row;
}

function audioButton(text, big = false) {
  const b = document.createElement("button");
  b.className = "btn-audio" + (big ? " big" : "");
  b.textContent = "🔊";
  b.addEventListener("click", () => speak(text));
  return b;
}

function renderChoiceEnPt(ex, box) {
  box.innerHTML = `<div class="ex-title">O que significa esta palavra?</div>`;
  const bubble = document.createElement("div");
  bubble.className = "bubble-inner";
  bubble.appendChild(audioButton(ex.word.en));
  bubble.insertAdjacentHTML("beforeend", `<span class="ex-word">${ex.word.en}</span>`);
  box.appendChild(characterRow(bubble));
  makeOptions(box, ex.options, 1);
  speak(ex.word.en);
  ex.correct = ex.word.pt;
  ex.explain = `${ex.word.en} = ${ex.word.pt}`;
}

function renderChoicePtEn(ex, box) {
  box.innerHTML = `<div class="ex-title">Como se diz em inglês?</div>`;
  box.appendChild(characterRow(`<span class="ex-word">${ex.word.pt}</span>`));
  makeOptions(box, ex.options, 1, (opt) => speak(opt));
  ex.correct = ex.word.en;
  ex.explain = `${ex.word.pt} = ${ex.word.en}`;
}

function renderListen(ex, box) {
  box.innerHTML = `<div class="ex-title">O que você ouviu?</div>`;
  const bubble = document.createElement("div");
  bubble.className = "bubble-inner";
  bubble.appendChild(audioButton(ex.word.en));
  bubble.insertAdjacentHTML("beforeend", `<span class="ex-word ex-muted">Toque para ouvir</span>`);
  box.appendChild(characterRow(bubble));
  makeOptions(box, ex.options, 2);
  speak(ex.word.en);
  ex.correct = ex.word.en;
  ex.explain = `Você ouviu: ${ex.word.en} (${ex.word.pt})`;
}

function renderVerse(ex, box) {
  const v = ex.verse;
  const gapped = v.text.replace(v.blank, `<span class="gap" id="verse-gap">&nbsp;</span>`);
  box.innerHTML = `<div class="ex-title">Complete o versículo</div>
    <div class="verse-box">${gapped}</div>
    <div class="verse-ref">${v.ref} — "${v.pt}"</div>`;
  makeOptions(box, ex.options, 2, (opt) => {
    $("#verse-gap").textContent = opt;
    speak(opt);
  });
  ex.correct = v.blank;
  ex.explain = `"${v.text}" — ${v.ref}`;
}

function renderBuild(ex, box) {
  box.innerHTML = `<div class="ex-title">Escreva em inglês</div>`;
  const bubble = document.createElement("div");
  bubble.className = "bubble-inner";
  bubble.appendChild(audioButton(ex.sentence.en));
  bubble.insertAdjacentHTML("beforeend", `<span class="ex-word">${ex.sentence.pt}</span>`);
  box.appendChild(characterRow(bubble));

  const zone = document.createElement("div");
  zone.className = "answer-zone";
  const bank = document.createElement("div");
  bank.className = "word-bank";
  box.appendChild(zone);
  box.appendChild(bank);

  const chosen = [];
  function sync() {
    session.answer = chosen.map((c) => c.word).join(" ");
    $("#btn-check").disabled = chosen.length === 0;
  }

  ex.bank.forEach((word, i) => {
    const t = document.createElement("button");
    t.className = "tile";
    t.textContent = word;
    t.dataset.i = i;
    t.addEventListener("click", () => {
      if (session.checked) return;
      speak(word);
      t.classList.add("ghost");
      const placed = document.createElement("button");
      placed.className = "tile";
      placed.textContent = word;
      const entry = { word, el: placed };
      chosen.push(entry);
      placed.addEventListener("click", () => {
        if (session.checked) return;
        chosen.splice(chosen.indexOf(entry), 1);
        placed.remove();
        t.classList.remove("ghost");
        sync();
      });
      zone.appendChild(placed);
      sync();
    });
    bank.appendChild(t);
  });

  ex.correct = ex.sentence.en;
  ex.explain = `Resposta: "${ex.sentence.en}"`;
}

function renderMatch(ex, box) {
  box.innerHTML = `<div class="ex-title">Toque nos pares correspondentes</div>`;
  const grid = document.createElement("div");
  grid.className = "match-cols";
  box.appendChild(grid);

  const left = shuffle(ex.pairs.map((p) => ({ key: p.en, side: "en", label: p.en })));
  const right = shuffle(ex.pairs.map((p) => ({ key: p.en, side: "pt", label: p.pt })));
  let selected = null;
  let matched = 0;

  function cell(item) {
    const b = document.createElement("button");
    b.className = "opt";
    b.textContent = item.label;
    b.addEventListener("click", () => {
      if (b.classList.contains("matched")) return;
      if (item.side === "en") speak(item.label);
      if (!selected) {
        selected = { item, el: b };
        b.classList.add("selected");
        return;
      }
      if (selected.el === b) {
        b.classList.remove("selected");
        selected = null;
        return;
      }
      if (selected.item.key === item.key && selected.item.side !== item.side) {
        [selected.el, b].forEach((el) => { el.classList.remove("selected"); el.classList.add("matched"); });
        matched++;
        if (matched === ex.pairs.length) {
          session.answer = "__matched__";
          $("#btn-check").disabled = false;
          checkAnswer();
        }
      } else {
        [selected.el, b].forEach((el) => el.classList.add("wrong"));
        const els = [selected.el, b];
        setTimeout(() => els.forEach((el) => el.classList.remove("wrong", "selected")), 600);
        registerMistakeSoft();
      }
      selected = null;
    });
    return b;
  }

  const colA = document.createElement("div");
  const colB = document.createElement("div");
  colA.style.display = colB.style.display = "flex";
  colA.style.flexDirection = colB.style.flexDirection = "column";
  colA.style.gap = colB.style.gap = "10px";
  left.forEach((i) => colA.appendChild(cell(i)));
  right.forEach((i) => colB.appendChild(cell(i)));
  grid.appendChild(colA);
  grid.appendChild(colB);

  ex.correct = "__matched__";
  ex.explain = "Pares corretos!";
}

// Erro em pareamento não trava o exercício, mas conta para o bônus perfeito
function registerMistakeSoft() {
  session.mistakes++;
}

// ---------- Checagem ----------
function normalize(s) {
  return s.toLowerCase().replace(/[.,;:!?]/g, "").replace(/\s+/g, " ").trim();
}

function checkAnswer() {
  const ex = session.exercises[session.index];
  const btn = $("#btn-check");

  if (!session.checked) {
    session.checked = true;
    const ok = normalize(String(session.answer)) === normalize(String(ex.correct));
    const footer = $("#footer");
    footer.classList.add(ok ? "correct" : "wrong");
    $("#fb-ok-detail").textContent = ex.explain || "";
    $("#fb-bad-detail").textContent = ex.explain || "";

    // Destaca opções
    document.querySelectorAll(".opt").forEach((o) => {
      if (normalize(o.textContent) === normalize(String(ex.correct))) o.classList.add("correct");
      else if (o.classList.contains("selected") && !ok) o.classList.add("wrong");
      else o.classList.add("faded");
    });

    if (ok) {
      speak(typeof ex.correct === "string" && ex.correct !== "__matched__" ? ex.correct : "Great job");
      btn.textContent = "Continuar";
    } else {
      session.mistakes++;
      if (!session.practice) {
        state.hearts = Math.max(0, state.hearts - 1);
        save();
        $("#lesson-hearts").textContent = `❤️ ${state.hearts}`;
      }
      btn.textContent = "Entendi";
      btn.classList.add("red");
      if (!session.practice && state.hearts <= 0) {
        setTimeout(() => {
          $("#modal-hearts").classList.add("open");
          showScreen("home");
        }, 1200);
        return;
      }
    }
    return;
  }

  // Avança
  session.index++;
  if (session.index >= session.exercises.length) {
    finishLesson();
  } else {
    renderExercise();
  }
}

function finishLesson() {
  const perfect = session.mistakes === 0;
  const first = !state.completed[session.lesson.id];
  let gained = session.practice ? 5 : XP_PER_LESSON;
  if (perfect) gained += XP_PERFECT_BONUS;

  state.xp += gained;
  state.completed[session.lesson.id] = true;

  // Prática recupera 1 coração
  if (session.practice && state.hearts < MAX_HEARTS) state.hearts++;

  // Ofensiva
  const t = today();
  if (state.lastStudy !== t) {
    state.streak = state.lastStudy && daysBetween(state.lastStudy, t) === 1 ? state.streak + 1 : Math.max(1, state.lastStudy ? 1 : 1);
    state.lastStudy = t;
  }
  save();

  // Personagem comemorando + confete
  const ch = pickCharacter(session.lesson.unit.id);
  $("#result-char").innerHTML = ch.svg;
  $("#result-emoji").style.display = "none";
  if (typeof confetti === "function") {
    confetti({ particleCount: 90, spread: 75, origin: { y: 0.35 }, ticks: 180 });
    if (perfect) setTimeout(() => confetti({ particleCount: 60, spread: 100, origin: { y: 0.3 } }), 350);
  }

  $("#result-emoji").textContent = perfect ? "🌟" : "🎉";
  $("#result-title").textContent = perfect ? "Lição perfeita!" : "Lição concluída!";
  $("#result-sub").textContent = first ? "Você avançou na trilha." : "Ótima prática!";
  $("#result-xp").textContent = `+${gained}`;
  $("#result-streak").textContent = state.streak;
  $("#result-acc").textContent = `${Math.max(0, Math.round((1 - session.mistakes / Math.max(1, session.exercises.length)) * 100))}%`;

  const blessings = [
    { t: "I can do all things through Christ which strengtheneth me.", r: "Filipenses 4:13" },
    { t: "The joy of the LORD is your strength.", r: "Neemias 8:10" },
    { t: "Be strong and of a good courage.", r: "Josué 1:9" },
    { t: "Thy word is a lamp unto my feet.", r: "Salmos 119:105" },
  ];
  const b = blessings[Math.floor(Math.random() * blessings.length)];
  $("#result-verse").innerHTML = `"${b.t}"<br><b>${b.r}</b>`;

  $("#progress-fill").style.width = "100%";
  showScreen("result");
}

// ---------- Eventos globais ----------
$("#btn-check").addEventListener("click", checkAnswer);
$("#btn-quit").addEventListener("click", () => {
  speechSynthesis && speechSynthesis.cancel();
  showScreen("home");
});
$("#btn-result-continue").addEventListener("click", () => showScreen("home"));
$("#btn-modal-close").addEventListener("click", () => $("#modal-hearts").classList.remove("open"));
$("#btn-modal-practice").addEventListener("click", () => {
  $("#modal-hearts").classList.remove("open");
  // Abre a última lição concluída como prática para recuperar coração
  const doneIds = flatLessons().filter((l) => state.completed[l.id]).map((l) => l.id);
  if (doneIds.length) startLesson(doneIds[doneIds.length - 1]);
});

renderHome();
showScreen("home");
