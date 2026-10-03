// BíbliaLearn — telas: trilha (subindo), folha do nó, guia da unidade, Missões, Personagens, Perfil
// Carregado antes de app.js: só define funções; nada executa no carregamento.

const TAB_SCREENS = ["home", "hub", "quests", "characters", "profile"];
const NAV_TO_SCREEN = { inicio: "home", praticar: "hub", missoes: "quests", personagens: "characters", perfil: "profile" };
const UNIT_XP = 20; // baú do capítulo

function testamentOf(unit, index) {
  return unit.testament || (index < 7 ? "Antigo Testamento" : "Novo Testamento");
}

// ---------- Trilha: o início fica embaixo e o progresso sobe ----------
function renderTrail(currentId) {
  const trail = $("#trail");
  if (!trail) return;
  trail.innerHTML = "";
  // Serpentina: a posição horizontal de cada etapa segue uma onda (funciona para 4 ou 10 etapas)
  const xOf = (li) => Math.round(Math.sin(li * Math.PI / 3) * 1.4);

  const end = document.createElement("div");
  end.className = "trail-end";
  end.innerHTML = `<span class="te-flag">🏁</span><b>Continua em breve</b><small>Novos capítulos a caminho</small>`;
  trail.appendChild(end);

  const units = COURSE.map((u, i) => ({ u, i })).reverse();
  units.forEach(({ u: unit, i: ui }, k) => {
    const lessons = unitSteps(unit);
    const doneCount = lessons.filter((l) => state.completed[l.id]).length;
    const unitDoneAll = doneCount === lessons.length;
    const starsGot = lessons.reduce((s, l) => s + (state.stars[l.id] || 0), 0);
    const unlockedAny = lessonUnlocked(lessons[0].id);

    const block = document.createElement("section");
    block.className = "unit-block" + (unlockedAny ? "" : " locked");
    block.style.setProperty("--uc", unit.color);

    // Baú no topo do bloco: recompensa ao terminar as etapas
    const taken = !!(state.chests || {})[unit.id];
    const chest = document.createElement("button");
    chest.className = "chest-node" + (taken ? " taken" : unitDoneAll ? " ready" : " locked");
    chest.innerHTML = `<span class="cn-box">${taken ? "✅" : unitDoneAll ? "🎁" : "🔒"}</span><span class="lcap">${taken ? "Baú aberto" : unitDoneAll ? "Abrir baú +" + UNIT_XP + " XP" : "Baú do capítulo"}</span>`;
    chest.addEventListener("click", () => {
      if (taken || !unitDoneAll) { SFX.tap(); toast(taken ? "✅ Recompensa já recebida" : `🔒 Conclua as ${lessons.length} etapas`); return; }
      state.chests[unit.id] = true;
      state.xp += UNIT_XP;
      save();
      SFX.sparkle();
      if (window.confetti) confetti({ particleCount: 70, spread: 65, origin: { y: 0.6 } });
      toast(`🎁 Baú aberto! +${UNIT_XP} XP`, "combo");
      renderHome();
    });
    block.appendChild(chest);

    // Etapas: a última em cima, a primeira embaixo
    const nodes = document.createElement("div");
    nodes.className = "nodes";
    [...lessons].map((l, li) => ({ l, li })).reverse().forEach(({ l: lesson, li }) => {
      const done = !!state.completed[lesson.id];
      const unlocked = lessonUnlocked(lesson.id);
      const isCurrent = lesson.id === currentId;
      const stars = state.stars[lesson.id] || 0;
      const row = document.createElement("div");
      row.className = "lnode" + (isCurrent ? " current" : done ? " done" : unlocked ? "" : " locked");
      row.style.setProperty("--x", xOf(li));
      const btn = document.createElement("button");
      btn.className = "portrait" + (isCurrent ? "" : " sm") + (unlocked ? "" : " locked");
      btn.style.setProperty("--pc", unit.color);
      const hero = lesson.scene ? castChar(SCENE_BY_ID[lesson.sceneId].char) : null;
      const face = !unlocked ? '<span class="picon picon-lock">🔒</span>'
        : lesson.review ? '<span class="picon">🏅</span>'
        : charFace(hero || CHARACTERS[unit.face] || CHARACTERS.jesus);
      const badge = done ? '<span class="badge">✓</span>' : lesson.scene && unlocked ? '<span class="badge scene">💬</span>' : "";
      if (lesson.scene) row.classList.add("scene");
      const tip = isCurrent ? `<span class="start-tip">${resumable() && resumable().lessonId === lesson.id ? "RETOMAR" : "COMEÇAR"}</span>` : "";
      if (done && unitCrowns(unit.id) >= MAX_CROWN) btn.classList.add("legendary");
      btn.innerHTML = `${isCurrent ? '<span class="pulse"></span>' : ""}${tip}<span class="face">${face}</span>${badge}` +
        (li === lessons.length - 1 ? crownBadge(unit, unitDoneAll) : "") + starsHTML(stars, "node-stars");
      btn.setAttribute("aria-label", `${lesson.title}: ${isCurrent ? "em andamento" : done ? "concluída" : unlocked ? "disponível" : "bloqueada"}`);
      btn.addEventListener("click", () => openNodeSheet(unit, ui, lesson, li));
      const cap = document.createElement("span");
      cap.className = "lcap";
      cap.textContent = lesson.review ? "Revisão" : lesson.title;
      if (lesson.scene) cap.insertAdjacentHTML("afterbegin", '<span class="lcap-tag">Cena</span> ');
      row.appendChild(btn);
      row.appendChild(cap);
      nodes.appendChild(row);
    });
    block.appendChild(nodes);

    // Banner do capítulo na base do bloco: é a porta de entrada, já que se sobe
    const banner = document.createElement("div");
    banner.className = "unit-banner";
    banner.innerHTML = `<div class="ub-text">
        <span class="ub-eyebrow">Capítulo ${ui + 1} · ${doneCount}/${lessons.length} etapas${unitDoneAll ? " · concluído" : ""}</span>
        <h3>${unit.title}</h3>
        <small>${unit.subtitle || ""} · ⭐ ${starsGot}/${lessons.length * 3}</small>
      </div>
      <button class="ub-guide" aria-label="Guia do capítulo">📖<span>Guia</span></button>`;
    banner.querySelector(".ub-guide").addEventListener("click", () => openGuide(unit, ui));
    block.appendChild(banner);
    trail.appendChild(block);
    drawTrailPath(nodes, "#9db97a");

    // Divisor de testamento abaixo do primeiro capítulo de cada testamento
    const next = units[k + 1];
    const t = testamentOf(unit, ui);
    if (!next || testamentOf(next.u, next.i) !== t) {
      const sep = document.createElement("div");
      sep.className = "testament";
      sep.innerHTML = `<span>${t}</span>`;
      trail.appendChild(sep);
    }
  });

  // Origem da jornada, no pé da trilha
  const origin = document.createElement("div");
  origin.className = "trail-origin";
  origin.innerHTML = `<img src="chars/hero.jpg" alt="Seja bem-vindo! Vamos aprender juntos a Palavra de Deus?" /><span class="lcap">Comece aqui e suba</span>`;
  trail.appendChild(origin);
}

// Rola até o nó atual (como o Duolingo abre no ponto em que você parou)
function scrollToCurrentNode(smooth) {
  const cur = document.querySelector("#trail .lnode.current") || document.querySelector("#trail .trail-origin");
  if (!cur) return;
  requestAnimationFrame(() => cur.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "center" }));
}

// ---------- Folha do nó ----------
function openSheet(id, html) {
  const back = $("#" + id);
  const body = back.querySelector(".sheet");
  body.innerHTML = html;
  back.classList.add("open");
  document.body.classList.add("sheet-open");
  const close = () => { back.classList.remove("open"); document.body.classList.remove("sheet-open"); };
  back.onclick = (e) => { if (e.target === back) close(); };
  body.querySelectorAll("[data-close]").forEach((b) => b.addEventListener("click", close));
  return close;
}

function openNodeSheet(unit, ui, lesson, li) {
  if (lesson.scene) return openSceneSheet(unit, ui, lesson, li);
  const done = !!state.completed[lesson.id];
  const unlocked = lessonUnlocked(lesson.id);
  const unitDoneAll = unitDone(unit);
  const r = resumable();
  const resume = r && r.lessonId === lesson.id;
  const words = (lesson.vocab || []).slice(0, 4).map((w) => `<span class="ns-word">${w.en}</span>`).join("");
  const crowns = unitCrowns(unit.id);
  let action = "";
  if (!unlocked) action = `<p class="ns-locked">🔒 Conclua a etapa anterior para desbloquear</p><button class="btn-main" disabled>Bloqueada</button>`;
  else if (resume) action = `<button class="btn-main" id="ns-go">Retomar (${Math.min(r.index + 1, r.exercises.length)}/${r.exercises.length})</button>`;
  else if (!done) action = `<button class="btn-main" id="ns-go">Começar +${XP_PER_LESSON} XP</button>`;
  else if (unitDoneAll && crowns < MAX_CROWN) action = `<button class="btn-main" id="ns-level">${crowns >= MAX_CROWN - 1 ? "Lendária 👑" : `Subir de nível 👑 ${crowns + 1}`} +${XP_PER_LESSON} XP</button><button class="btn-ghost" id="ns-go">Praticar de novo +5 XP</button>`;
  else action = `<button class="btn-main blue" id="ns-go">Praticar +5 XP</button>`;
  const close = openSheet("node-sheet", `
    <div class="ns-head" style="--uc:${unit.color}">
      <span class="ns-face">${charFace(CHARACTERS[unit.face] || CHARACTERS.jesus)}</span>
      <div><span class="ns-eyebrow">Capítulo ${ui + 1} · Etapa ${li + 1} de ${unitSteps(unit).length}</span>
      <h3>${lesson.title}</h3></div>
      <button class="sheet-x" data-close aria-label="Fechar">${ICONS.close}</button>
    </div>
    <div class="ns-body">
      ${done ? starsHTML(state.stars[lesson.id] || 0, "ns-stars") : ""}
      <p class="ns-desc">${lesson.review ? "Revisão de tudo o que você viu neste capítulo, com as palavras que mais precisam de atenção." : words ? "Palavras desta etapa:" : unit.subtitle || ""}</p>
      ${words ? `<div class="ns-words">${words}</div>` : ""}
      ${action}
    </div>`);
  const go = $("#ns-go");
  if (go) go.addEventListener("click", () => { close(); startLesson(lesson.id); });
  const lvl = $("#ns-level");
  if (lvl) lvl.addEventListener("click", () => { close(); startLevelUp(unit); });
}

// Folha de uma cena do dia a dia: situação, personagens, contexto e vocabulário
function openSceneSheet(unit, ui, lesson, li) {
  const sc = SCENE_BY_ID[lesson.sceneId];
  const done = !!state.completed[lesson.id];
  const unlocked = lessonUnlocked(lesson.id);
  const r = resumable();
  const resume = r && r.lessonId === lesson.id;
  const hero = castChar(sc.char), other = castChar(sc.with);
  let action = "";
  if (!unlocked) action = `<p class="ns-locked">🔒 Conclua a etapa anterior para desbloquear</p><button class="btn-main" disabled>Bloqueada</button>`;
  else if (resume) action = `<button class="btn-main" id="ns-go">Retomar (${Math.min(r.index + 1, r.exercises.length)}/${r.exercises.length})</button>`;
  else if (!done) action = `<button class="btn-main" id="ns-go">Viver a cena +${XP_PER_LESSON} XP</button>`;
  else action = `<button class="btn-main blue" id="ns-go">Praticar de novo +5 XP</button>`;
  const close = openSheet("node-sheet", `
    <div class="ns-head" style="--uc:${unit.color}">
      <span class="ns-face">${charFace(hero)}</span>
      <div><span class="ns-eyebrow">Capítulo ${ui + 1} · Cena · Etapa ${li + 1} de ${unitSteps(unit).length}</span>
      <h3>${sc.title}</h3></div>
      <button class="sheet-x" data-close aria-label="Fechar">${ICONS.close}</button>
    </div>
    <div class="ns-body">
      ${done ? starsHTML(state.stars[lesson.id] || 0, "ns-stars") : ""}
      <div class="ns-func">💬 ${sc.func}</div>
      <p class="ns-desc">${sc.context}</p>
      <div class="ns-cast"><span>${sceneFaceHTML(hero, "me")} ${hero.name.split(" (")[0]}</span><span class="ns-vs">↔</span><span>${sceneFaceHTML(other, "them")} ${other.name.split(" (")[0]}</span></div>
      <div class="ns-ref">📖 ${sc.ref}</div>
      <div class="ns-words">${sc.vocab.map((w) => `<span class="ns-word">${w.icon || ""} ${w.en}</span>`).join("")}</div>
      ${action}
    </div>`);
  const go = $("#ns-go");
  if (go) go.addEventListener("click", () => { close(); startLesson(lesson.id); });
}

// ---------- Guia do capítulo (como o guidebook do Duolingo) ----------
function openGuide(unit, ui) {
  const vocab = unit.lessons.flatMap((l) => l.vocab || []);
  const verses = unit.lessons.map((l) => l.verse).filter(Boolean);
  const sentences = unit.lessons.flatMap((l) => (l.sentences || []).slice(0, 2));
  const html = `
    <div class="ns-head" style="--uc:${unit.color}">
      <span class="ns-face">${charFace(CHARACTERS[unit.face] || CHARACTERS.jesus)}</span>
      <div><span class="ns-eyebrow">Guia · Capítulo ${ui + 1}</span><h3>${unit.title}</h3></div>
      <button class="sheet-x" data-close aria-label="Fechar">${ICONS.close}</button>
    </div>
    <div class="ns-body guide">
      <h4>Palavras-chave</h4>
      <div class="g-words">${vocab.map((w) => `<button class="g-word" data-say="${w.en.replace(/"/g, "&quot;")}"><span class="g-ico">${w.icon || "📖"}</span><b>${w.en}</b><small>${w.pt}</small></button>`).join("")}</div>
      <h4>Frases</h4>
      <div class="g-sents">${sentences.map((s) => `<button class="g-sent" data-say="${s.en.replace(/"/g, "&quot;")}"><i class="nav-ico">${ICONS.speaker}</i><span><b>${s.en}</b><small>${s.pt}</small></span></button>`).join("")}</div>
      ${verses.length ? `<h4>Versículos</h4>${verses.map((v) => `<blockquote class="g-verse"><p>${v.text.replace(blankRegex(v.blank), `<b>${v.blank}</b>`)}</p><cite>${v.ref} (KJV)</cite></blockquote>`).join("")}` : ""}
    </div>`;
  openSheet("guide-sheet", html);
  document.querySelectorAll("#guide-sheet [data-say]").forEach((b) => b.addEventListener("click", () => speak(b.dataset.say, { char: castChar(CHARACTERS[unit.face] ? unit.face : (UNIT_CAST[unit.id] || [])[0]) })));
}

// ---------- Missões ----------
function renderQuests() {
  renderDailyCard();
  renderWeek();
  const sub = $("#quests-sub");
  const d = ensureDaily();
  if (sub) sub.textContent = d.xp >= state.dailyGoal ? "Meta de hoje batida. Que tal mais uma etapa?" : `${d.xp} de ${state.dailyGoal} XP hoje`;
  const sd = $("#streak-days");
  if (sd) sd.textContent = state.streak;
  // Versículo bilíngue do dia: inglês na frente, tradução e dicas sob demanda
  const v = verseOfDay();
  $("#vd-text").innerHTML = `“${sayable(v.text)}”`;
  $("#vd-ref").textContent = `${v.ref} (KJV)`;
  $("#vd-pt").textContent = `“${v.pt}”`;
  const pool = allVocab();
  const hints = v.text.replace(/[.,;:!?"']/g, "").split(" ")
    .map((w) => pool.find((p) => normalize(p.en.replace(/^to /, "")) === normalize(w)))
    .filter((p, i, arr) => p && arr.indexOf(p) === i).slice(0, 3);
  $("#vd-hints").innerHTML = hints.length ? "Dica: " + hints.map((p) => `<b>${p.en}</b> = ${p.pt}`).join(" · ") : "";
  const nErr = Object.keys(state.errors || {}).length;
  const eb = $("#btn-quests-errors");
  if (eb) { eb.hidden = nErr === 0; $("#quests-errors-sub").textContent = `${nErr} palavra(s) para acertar`; eb.onclick = startErrorPractice; }
}

// ---------- Personagens ----------
function renderCharacters() {
  const box = $("#char-groups");
  if (!box) return;
  const groups = [];
  COURSE.forEach((u, i) => groups.push({ title: `Capítulo ${i + 1} · ${u.title}`, color: u.color, keys: CHARACTER_ORDER.filter((k) => CHARACTERS[k] && CHARACTER_UNIT[k] === u.id) }));
  const placed = new Set(groups.flatMap((g) => g.keys));
  const rest = CHARACTER_ORDER.filter((k) => CHARACTERS[k] && !placed.has(k));
  if (rest.length) groups.push({ title: "Outros personagens", color: "#7e57c2", keys: rest });
  box.innerHTML = groups.filter((g) => g.keys.length).map((g) => `
    <div class="cg" style="--uc:${g.color}">
      <h3 class="cg-title">${g.title}</h3>
      <div class="cg-grid">${g.keys.map((k) => `
        <button class="cg-item" data-char="${k}">
          <span class="cg-face">${charFace(CHARACTERS[k])}</span>
          <span class="cg-name">${CHARACTERS[k].name.split(" (")[0]}</span>
        </button>`).join("")}</div>
    </div>`).join("");
  box.querySelectorAll(".cg-item").forEach((b) => b.addEventListener("click", () => openCharacter(b.dataset.char)));
}

// ---------- Perfil ----------
const ACHIEVEMENTS = [
  { id: "steps", icon: "📖", title: "Primeiros passos", desc: "Etapas concluídas", tiers: [1, 5, 15, 32], value: () => Object.keys(state.completed || {}).length },
  { id: "flame", icon: "🔥", title: "Chama da fé", desc: "Dias seguidos", tiers: [3, 7, 14, 30], value: () => state.streak || 0 },
  { id: "wise", icon: "⚡", title: "Sábio", desc: "XP acumulado", tiers: [100, 500, 1000, 5000], value: () => state.xp || 0 },
  { id: "perfect", icon: "🌟", title: "Perfeccionista", desc: "Etapas sem erros", tiers: [1, 5, 10, 20], value: () => Object.values(state.stars || {}).filter((s) => s === 3).length },
  { id: "stories", icon: "📚", title: "Contador de histórias", desc: "Histórias lidas", tiers: [1, 4, 8], value: () => Object.keys(state.stories || {}).length },
  { id: "crowns", icon: "👑", title: "Coroado", desc: "Coroas conquistadas", tiers: [1, 5, 15, 40], value: () => Object.values(state.crowns || {}).reduce((s, c) => s + c, 0) },
];

function renderProfile() {
  if (!state.joined) { state.joined = today(); save(); }
  $("#prof-avatar").innerHTML = charFace(CHARACTERS.jesus);
  $("#prof-name").textContent = state.name || "Discípulo";
  const [y, m] = String(state.joined || today()).split("-");
  const meses = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  $("#prof-since").textContent = `Membro desde ${meses[+m - 1]} de ${y}`;
  const crowns = Object.values(state.crowns || {}).reduce((s, c) => s + c, 0);
  const stars = Object.values(state.stars || {}).reduce((s, x) => s + Math.min(3, Number(x) || 0), 0);
  $("#prof-tiles").innerHTML = [
    ["🔥", state.streak, "Dias seguidos"], ["⚡", state.xp, "XP total"], ["👑", crowns, "Coroas"], ["⭐", stars, "Estrelas"],
  ].map(([i, v, l]) => `<div class="stat-tile"><span class="stat-ico">${i}</span><b>${v}</b><small>${l}</small></div>`).join("");
  $("#ach-list").innerHTML = ACHIEVEMENTS.map((a) => {
    const v = a.value();
    let lvl = a.tiers.findIndex((t) => v < t);
    if (lvl < 0) lvl = a.tiers.length;
    const target = a.tiers[Math.min(lvl, a.tiers.length - 1)];
    const maxed = lvl >= a.tiers.length;
    const pct = maxed ? 100 : Math.min(100, Math.round((v / target) * 100));
    return `<div class="ach${lvl ? " earned" : ""}">
      <span class="ach-ico"><i>${a.icon}</i><b>${maxed ? "MAX" : lvl ? "Nível " + lvl : ""}</b></span>
      <div class="ach-body">
        <div class="ach-top"><b>${a.title}</b><small>${maxed ? v : `${v}/${target}`}</small></div>
        <div class="ach-desc">${a.desc}</div>
        <div class="q-bar"><div class="q-fill" style="width:${pct}%"></div></div>
      </div>
    </div>`;
  }).join("");
  const badgeDefs = [
    { icon: "📖", color: "#58a700", unit: "u1" }, { icon: "🚢", color: "#7e57c2", unit: "u2" }, { icon: "🔥", color: "#e05d2f", unit: "u3" },
    { icon: "👑", color: "#e6a817", unit: "u4" }, { icon: "📜", color: "#1cb0f6", unit: "u5" }, { icon: "🌾", color: "#2e9d8a", unit: "u6" },
    { icon: "🦁", color: "#c0392b", unit: "u7" }, { icon: "🐟", color: "#3f7fd6", unit: "u8" },
  ];
  $("#badges").innerHTML = badgeDefs.map((b) => {
    const u = COURSE.find((x) => x.id === b.unit);
    const done = u && unitDone(u);
    return `<span class="badge-hex${done ? "" : " locked"}" style="background:${b.color}" title="${u ? u.title : ""}">${b.icon}</span>`;
  }).join("");
}

function openConfig() {
  const t = $("#toggle-sound");
  if (t) t.checked = state.sound !== false;
  const nm = $("#input-name");
  if (nm) nm.value = state.name || "";
  applyTheme();
  $("#modal-config").classList.add("open");
}
