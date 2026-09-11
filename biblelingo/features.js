// BíbliaLearn — recursos de engajamento e infraestrutura
// (áudio gravado com fallback, coroas e nível lendário, meta diária e missões, offline)
// Carregado antes de app.js: só define funções e dados; nada executa no carregamento.

// ---------- 2.2 Áudio gravado com fallback para a síntese do navegador ----------
// audio/manifest.json: { "<texto normalizado>": { "default": "arquivo.mp3", "<personagem>": "arquivo.mp3" } }
const AUDIO = { manifest: null, cache: {}, base: "audio/" };

function audioKey(text) {
  return String(text).toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();
}

async function loadAudioManifest() {
  try {
    const r = await fetch(AUDIO.base + "manifest.json", { cache: "no-cache" });
    AUDIO.manifest = r.ok ? await r.json() : {};
  } catch (e) {
    AUDIO.manifest = {};
  }
}

// Toca o clipe gravado se existir; devolve true quando tocou
function playClip(text, charKey, slow) {
  if (!AUDIO.manifest) return false;
  const entry = AUDIO.manifest[audioKey(text)];
  if (!entry) return false;
  const file = (charKey && entry[charKey]) || entry.default;
  if (!file) return false;
  try {
    let el = AUDIO.cache[file];
    if (!el) {
      el = new Audio(AUDIO.base + file);
      el.preload = "auto";
      AUDIO.cache[file] = el;
    }
    el.pause();
    el.currentTime = 0;
    el.playbackRate = slow ? 0.65 : 1;
    el.play().catch(() => {});
    return true;
  } catch (e) {
    return false;
  }
}

// ---------- 3.3 Coroas por unidade e nível lendário ----------
const MAX_CROWN = 5;

function unitCrowns(unitId) {
  return (state.crowns && state.crowns[unitId]) || 0;
}

// Lição de "subir de nível": mistura mais exigente do conteúdo da unidade
function startLevelUp(unit) {
  if (state.hearts <= 0) { $("#modal-hearts").classList.add("open"); return; }
  const crowns = unitCrowns(unit.id);
  const legendary = crowns >= MAX_CROWN - 1;
  const review = unit.lessons.find((l) => l.review) || unit.lessons[0];
  const lesson = { ...review, id: review.id, unit, levelUp: true, legendary, title: legendary ? "Lendária" : `Nível ${crowns + 1}` };
  let exercises = buildExercises({ ...lesson, review: true }, unit);
  // Quanto maior a coroa, mais produção (montar, digitar, falar) e menos reconhecimento
  const heavy = new Set(["build", "translate-en-pt", "listen-build", "listen-type", "complete-translation", "type", "speak", "verse", "read"]);
  const light = exercises.filter((e) => !heavy.has(e.type));
  const prod = exercises.filter((e) => heavy.has(e.type));
  const keepLight = Math.max(2, 6 - crowns);
  exercises = shuffle(light).slice(0, keepLight).concat(prod);
  exercises.hard = [];
  session = {
    lesson, exercises, index: 0, mistakes: 0, combo: 0, bestCombo: 0, bonus: 0,
    practice: false, checked: false, answer: null, startedAt: Date.now(),
    narrator: pickCharacter(unit.id), reviewQueue: [], reviewing: false, hardAdded: true, hard: [],
    levelUp: true, legendary,
  };
  showScreen("lesson");
  renderExercise();
}

function crownBadge(unit, done) {
  const c = unitCrowns(unit.id);
  if (!done) return "";
  if (c >= MAX_CROWN) return `<span class="crown legendary" title="Lendária">👑</span>`;
  return `<span class="crown" title="${c} de ${MAX_CROWN} coroas">👑 ${c}</span>`;
}

// ---------- 4.2 Meta diária e missões (local) ----------
const DAILY_GOALS = [10, 20, 30, 50];
const QUESTS = [
  { id: "xp", label: "Ganhe XP", key: "xp", target: (g) => g, reward: 5, icon: "⚡" },
  { id: "lessons", label: "Complete 2 lições", key: "lessons", target: () => 2, reward: 5, icon: "📖" },
  { id: "perfect", label: "Faça 1 lição perfeita", key: "perfect", target: () => 1, reward: 10, icon: "🌟" },
  { id: "combo", label: "Acerte 5 seguidas", key: "combo", target: () => 5, reward: 5, icon: "🔥" },
];

function ensureDaily() {
  const t = today();
  if (!state.daily || state.daily.date !== t) {
    state.daily = { date: t, xp: 0, lessons: 0, perfect: 0, combo: 0, claimed: [] };
  }
  if (!state.dailyGoal) state.dailyGoal = 20;
  return state.daily;
}

function recordLesson({ gained, perfect, bestCombo }) {
  const d = ensureDaily();
  d.xp += gained;
  d.lessons += 1;
  if (perfect) d.perfect += 1;
  d.combo = Math.max(d.combo, bestCombo || 0);
  // Missões concluídas rendem XP extra
  let extra = 0;
  QUESTS.forEach((q) => {
    const target = q.target(state.dailyGoal);
    if (d[q.key] >= target && !d.claimed.includes(q.id)) {
      d.claimed.push(q.id);
      extra += q.reward;
    }
  });
  if (extra) {
    state.xp += extra;
    d.xp += extra;
    setTimeout(() => toast(`🎯 Missão concluída! +${extra} XP`, "combo"), 900);
  }
  save();
  return extra;
}

function renderDailyCard() {
  const d = ensureDaily();
  const goal = state.dailyGoal;
  const pct = Math.min(100, Math.round((d.xp / goal) * 100));
  const card = $("#card-daily");
  if (!card) return;
  const done = d.xp >= goal;
  card.innerHTML = `
    <h3>🎯 Meta diária <span class="chev" id="daily-edit" title="Alterar meta">⚙️</span></h3>
    <div class="goal-row">
      <div class="goal-ring" style="--p:${pct}"><span>${done ? "✓" : pct + "%"}</span></div>
      <div>
        <p class="goal-main"><b>${d.xp}</b> / ${goal} XP hoje</p>
        <p class="muted">${done ? "Meta batida! Continue firme." : `Faltam ${goal - d.xp} XP`}</p>
      </div>
    </div>
    <div class="quests">
      ${QUESTS.map((q) => {
        const target = q.target(goal);
        const val = Math.min(d[q.key], target);
        const ok = d.claimed.includes(q.id);
        return `<div class="quest${ok ? " ok" : ""}">
          <span class="q-icon">${q.icon}</span>
          <div class="q-body"><div class="q-label">${q.label === "Ganhe XP" ? `Ganhe ${goal} XP` : q.label}</div>
          <div class="q-bar"><div class="q-fill" style="width:${Math.round((val / target) * 100)}%"></div></div></div>
          <span class="q-reward">${ok ? "✓" : `+${q.reward}`}</span>
        </div>`;
      }).join("")}
    </div>`;
  $("#daily-edit").addEventListener("click", () => {
    const i = DAILY_GOALS.indexOf(goal);
    state.dailyGoal = DAILY_GOALS[(i + 1) % DAILY_GOALS.length];
    save();
    renderDailyCard();
    toast(`🎯 Meta diária: ${state.dailyGoal} XP`);
  });
}

// ---------- 4.5 Offline (service worker) ----------
function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  if (!/^https?:$/.test(location.protocol)) return;
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
