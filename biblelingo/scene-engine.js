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
function sceneGapWord(en, vocab, allowPhrase) {
  const tokens = en.split(" ").map(cleanWord).filter(Boolean);
  const single = vocab.map((v) => v.en.replace(/^to /, "")).filter((v) => !v.includes(" "));
  const hit = tokens.find((t) => single.some((v) => normalize(v) === normalize(t)));
  if (hit) return hit;
  if (allowPhrase) {
    // expressão de várias palavras ("Good morning") vira uma lacuna só, quando aparece inteira na fala
    const clean = en.split(" ").map(cleanWord).join(" ");
    const phrase = vocab.map((v) => v.en.replace(/^to /, "")).filter((v) => v.includes(" ")).find((v) => new RegExp("(^|\\s)" + v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(\\s|$)", "i").test(clean));
    if (phrase) { const m = new RegExp("(^|\\s)(" + phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")(\\s|$)", "i").exec(clean); return m ? m[2] : phrase; }
  }
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

// Distratores para "escolha a fala": falas do herói em OUTRAS cenas (nunca desta cena, que já está
// visível no transcript), de tamanho parecido, para exigir compreensão e não eliminação
function sceneReplyOptions(line, scene) {
  const same = SCENES.filter((s) => s !== scene && s.char === scene.char).flatMap((s) => s.lines.filter((l) => l.who === s.char).map((l) => l.en));
  const any = SCENES.filter((s) => s !== scene).flatMap((s) => s.lines.filter((l) => l.who === s.char).map((l) => l.en));
  const sameSet = new Set(same);
  const pool = [...new Set([...same, ...any])].filter((e) => e !== line.en && !scene.lines.some((l) => l.en === e));
  // mesmo personagem, mesmo tipo de frase (pergunta ou afirmação) e tamanho parecido primeiro
  const kind = (t) => /\?\s*$/.test(t) ? "?" : "."; 
  const near = pool.map((e) => ({ e, d: Math.abs(e.length - line.en.length) + (sameSet.has(e) ? 0 : 25) + (kind(e) === kind(line.en) ? 0 : 15) + Math.random() * 8 }))
    .sort((x, y) => x.d - y.d).slice(0, 4).map((x) => x.e);
  return shuffle([line.en, ...shuffle(near).slice(0, 2)]);
}

// Distratores para "o que ele disse?": traduções de falas de outras cenas, de tamanho parecido
function sceneListenOptions(line, scene) {
  const pool = [...new Set(SCENES.filter((s) => s !== scene).flatMap((s) => s.lines.map((l) => l.pt)))].filter((p) => p !== line.pt);
  const kind = (t) => /\?\s*$/.test(t) ? "?" : ".";
  const near = pool.map((p) => ({ p, d: Math.abs(p.length - line.pt.length) + (kind(p) === kind(line.pt) ? 0 : 15) + Math.random() * 8 })).sort((x, y) => x.d - y.d).slice(0, 4).map((x) => x.p);
  return shuffle([line.pt, ...shuffle(near).slice(0, 2)]);
}

// Montador da cena, com as mesmas regras do montador de lição (análise forense, 16 práticas):
// receptivo antes de produtivo (i+1), teto por formato, rampa, regra de vizinhança, revisão de
// conteúdo anterior, desafio reservado ao fim, adaptação durante a cena (adaptNext).
//  1) introdução da situação
//  2) 3 expressões apresentadas de forma receptiva (imagem, significado, escuta)
//  3) leitura da conversa em "batidas" (fala do outro + resposta do herói): a batida é lida com
//     áudio ou o aprendiz escolhe a resposta do herói; cada batida lida tem uma checagem
//     (o que ele disse? / palavra que falta)
//  4) produção sobre falas já vistas: lacuna digitada, montar a frase, falar
//  5) recordação das outras 2 expressões e 1 exercício de revisão de lição anterior
//  6) o que aconteceu de verdade
function buildSceneExercises(step) {
  const sc = sceneOfStep(step);
  _distractUnit = step.unit;
  const id = sc.id;
  const firstTime = !state.completed[id];
  const canSpeak = SPEECH_OK && !(state.speakMutedUntil && Date.now() < state.speakMutedUntil);
  const noListen = listenMuted();
  const isHero = (l) => l.who === sc.char;
  const count = {};
  const ex = [];
  const take = (e, phase) => { e.phase = phase; count[e.type] = (count[e.type] || 0) + 1; ex.push(e); return e; };
  const under = (t) => (count[t] || 0) < capOf(t);
  const lineBase = (li) => ({ sceneId: id, li, sentence: { en: sc.lines[li].en, pt: sc.lines[li].pt }, audioText: sc.lines[li].en });

  take({ type: "scene-intro", sceneId: id, silent: true }, "intro");

  // 2) vocabulário receptivo, formatos rotacionados; as 2 expressões restantes voltam como recordação
  const vocab = shuffle(sc.vocab.slice());
  // na 1ª visita toda expressão nova é apresentada com significado (imagem/tradução), nunca só pelo som
  const introTypes = (firstTime || noListen) ? ["image-choice", "choice-en-pt"] : ["image-choice", "choice-en-pt", "listen"];
  vocab.slice(0, 3).forEach((w, i) => take({ ...EX_MAKE[introTypes[i % introTypes.length]](w), newWord: firstTime }, "vocab"));

  // 3) batidas da conversa
  const beats = [];
  let cur = [];
  sc.lines.forEach((l, li) => { cur.push(li); if (isHero(l) || cur.length === 2) { beats.push(cur); cur = []; } });
  if (cur.length) beats.push(cur);
  let checkTurn = SCENES.indexOf(sc) % 2; // metade das cenas começa pela lacuna, metade pela escuta
  beats.forEach((beat, k) => {
    const last = sc.lines[beat[beat.length - 1]];
    const heroLast = isHero(last) && beat.length >= 1;
    if (k > 0 && heroLast && k % 2 === 1 && under("scene-reply")) {
      // o aprendiz escolhe a resposta do herói (a fala do outro desta batida já aparece no transcript)
      take({ ...lineBase(beat[beat.length - 1]), type: "scene-reply", shown: beat.slice(0, -1), options: sceneReplyOptions(last, sc) }, "read");
      return;
    }
    take({ type: "scene-read", sceneId: id, lis: beat, silent: true }, "read");
    if (k === 0) return; // a primeira batida é só contexto
    // checagem de compreensão sobre uma fala da batida
    const other = beat.map((li) => sc.lines[li]).find((l) => !isHero(l));
    const heroL = beat.map((li) => sc.lines[li]).find(isHero);
    const wantListen = checkTurn % 2 === 0;
    checkTurn++;
    if (wantListen && other && !noListen && under("scene-listen")) {
      take({ ...lineBase(sc.lines.indexOf(other)), type: "scene-listen", options: sceneListenOptions(other, sc) }, "read");
    } else if (heroL && under("scene-missing")) {
      const blank = sceneGapWord(heroL.en, sc.vocab);
      if (blank) take({ ...lineBase(sc.lines.indexOf(heroL)), type: "scene-missing", blank, options: shuffle([blank, ...exNearWords(blank, 2)]) }, "read");
    } else if (other && !noListen && under("scene-listen")) {
      take({ ...lineBase(sc.lines.indexOf(other)), type: "scene-listen", options: sceneListenOptions(other, sc) }, "read");
    }
  });

  // 4) produção sobre falas do herói já vistas, cada formato numa fala diferente
  const heroLis = sc.lines.map((l, li) => li).filter((li) => isHero(sc.lines[li]));
  const used = new Set();
  const pickLine = (pred) => { const li = shuffle(heroLis.filter((x) => !used.has(x))).find((x) => pred(sc.lines[x])); if (li != null) used.add(li); return li; };
  const prod = [];
  const gapLi = pickLine((l) => !!sceneGapWord(l.en, sc.vocab, true));
  if (gapLi != null) prod.push({ ...lineBase(gapLi), type: "scene-gap", blank: sceneGapWord(sc.lines[gapLi].en, sc.vocab, true) });
  const buildLi = pickLine((l) => { const n = wordCount(l.en); return n >= 3 && n <= 12; });
  if (buildLi != null) prod.push({ ...lineBase(buildLi), type: "scene-build", bank: sceneBank(sc.lines[buildLi], sc) });
  const speakLi = pickLine((l) => wordCount(l.en) <= 12);
  if (speakLi != null) prod.push(canSpeak ? { ...lineBase(speakLi), type: "scene-speak" } : { ...lineBase(speakLi), type: "scene-build", bank: sceneBank(sc.lines[speakLi], sc) });

  // 5) recordação das expressões restantes + revisão de lição anterior
  const recall = [];
  if (vocab[3]) recall.push({ ...EX_MAKE[firstTime ? "image-choice" : noListen ? "choice-pt-en" : "listen"](vocab[3]), newWord: firstTime });
  if (vocab[4]) recall.push(firstTime ? { ...EX_MAKE["choice-en-pt"](vocab[4]), newWord: true } : EX_MAKE.type(vocab[4]));
  const earlier = flatLessons().filter((l) => !l.review && !l.scene && state.completed[l.id]).flatMap((l) => l.vocab || []);
  if (earlier.length) {
    const w = weakestWords(earlier, 3)[Math.floor(Math.random() * Math.min(3, earlier.length))];
    recall.push({ ...EX_MAKE[noListen ? "choice-pt-en" : "listen"](w), isReview: true });
  }
  // intercala produção e recordação: nunca dois do mesmo formato em sequência
  const fam = (t) => /listen/.test(t) ? "listen" : t.replace(/^scene-/, "");
  const differs = (e, prev) => !prev || (fam(e.type) !== fam(prev.type) && (e.li == null || prev.li == null || e.li !== prev.li));
  const tail = [];
  while (prod.length || recall.length) {
    const prev = tail[tail.length - 1] || ex[ex.length - 1];
    let src = (tail.length % 2 === 1 && recall.length) || !prod.length ? recall : prod;
    let j = src.findIndex((e) => differs(e, prev));
    if (j < 0) { const alt = src === prod ? recall : prod; const k = alt.findIndex((e) => differs(e, prev)); if (k >= 0) { src = alt; j = k; } else j = 0; }
    tail.push(src.splice(j, 1)[0]);
  }
  tail.forEach((e) => take(e, "prod"));

  // desafio reservado: digite o que ouviu (uma fala do herói), liberado só sem erros
  const hard = [];
  const hardLi = heroLis.find((li) => !used.has(li) && wordCount(sc.lines[li].en) <= 10) ?? heroLis[0];
  if (hardLi != null && !noListen) hard.push({ ...EX_MAKE["listen-type"]({ en: sc.lines[hardLi].en, pt: sc.lines[hardLi].pt }), sceneId: id, li: hardLi });

  take({ type: "scene-truth", sceneId: id, silent: true }, "end");
  ex.hard = hard;
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

// Batida da conversa: uma ou duas falas lidas com áudio (a do outro e a resposta do herói)
function renderSceneRead(ex, box) {
  const sc = SCENE_BY_ID[ex.sceneId];
  const lis = ex.lis;
  const first = sc.lines[lis[0]];
  session.voiceChar = castChar(first.who);
  sceneHeader(box, sc, lis[0] === 0 ? "A conversa começa:" : "A conversa continua:");
  const chat = sceneTranscript(sc, lis[0], box, null);
  const rows = lis.map((li) => {
    const line = sc.lines[li];
    const body = document.createElement("div");
    body.innerHTML = `<div class="sc-who">${sceneNameOf(line.who)}${line.who === sc.char ? " (você)" : ""}</div>`;
    const row = document.createElement("div");
    row.className = "sc-en-row";
    row.appendChild(audioButton(line.en));
    row.insertAdjacentHTML("beforeend", `<span class="sc-en">${sayable(line.en)}</span>`);
    body.appendChild(row);
    body.insertAdjacentHTML("beforeend", `<div class="sc-pt">${line.pt}</div>`);
    const msg = sceneMsg(sc, line, { body, now: li === lis[0] });
    chat.appendChild(msg);
    return { msg, line };
  });
  // toca as falas em sequência, destacando quem fala
  let i = 0;
  const playNext = () => {
    if (i >= rows.length || !$("#screen-lesson").classList.contains("active") || session.exercises[session.index] !== ex) return;
    rows.forEach((r) => r.msg.classList.remove("now"));
    const { msg, line } = rows[i++];
    msg.classList.add("now");
    speak(line.en, { char: castChar(line.who) });
    const d = (typeof clipDuration === "function" && clipDuration(line.en, line.who)) || Math.min(5, 0.6 + line.en.length * 0.06);
    setTimeout(playNext, d * 1000 + 350);
  };
  playNext();
  ex.correct = "__read__";
  session.answer = "__read__";
  setContinue("Continuar");
}

// Fala do herói com uma palavra faltando e 3 opções (como "selecione a palavra que falta")
function renderSceneMissing(ex, box) {
  const sc = SCENE_BY_ID[ex.sceneId];
  const line = sc.lines[ex.li];
  const hero = castChar(sc.char);
  session.voiceChar = hero;
  sceneHeader(box, sc, `Selecione a palavra que falta:`);
  const body = document.createElement("div");
  body.innerHTML = `<div class="sc-who">${sceneNameOf(sc.char)} (você)</div><div class="sc-en gap-box">${gappedSentence(line.en, ex.blank)}</div><div class="sc-pt">${line.pt}</div>`;
  sceneTranscript(sc, ex.li, box, sceneMsg(sc, line, { body, now: true }));
  makeOptions(box, ex.options, 2, (opt) => { const g = box.querySelector("#sent-gap"); if (g) g.textContent = opt; speak(opt); });
  ex.correct = ex.blank;
  ex.explain = `"${line.en}" = "${line.pt}"`;
  ex.audioText = line.en;
  ex.onChecked = (ok) => { revealHero(box, line); if (ok) speak(line.en, { char: hero }); };
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
  box.insertAdjacentHTML("beforeend", `<div class="reply-label">Em português, ${sceneNameOf(line.who)} disse:</div>`);
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
  sceneHeader(box, sc, `Sua vez: o que ${sceneNameOf(sc.char)} responde?`);
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
    const s0 = session;
    session.recognizer = recognizeOnce(line.en, {
      onStart: () => { mic.classList.add("listening"); mic.innerHTML = `${ICONS.mic}<span>Ouvindo...</span>`; status.textContent = ""; },
      onResult: (r) => {
        if (session !== s0) return;
        status.textContent = `Você disse: "${r.text}"`;
        session.answer = r.ok ? line.en : r.text;
        $("#btn-check").disabled = false;
        checkAnswer();
      },
      onError: (err) => {
        status.textContent = err === "unsupported" ? "Reconhecimento de voz indisponível neste navegador."
          : err === "not-allowed" ? "Permita o uso do microfone ou pule este exercício." : "Não consegui ouvir. Tente de novo ou pule.";
      },
      onEnd: () => { s0.recognizer = null; mic.classList.remove("listening"); mic.innerHTML = `${ICONS.mic}<span>Toque para falar</span>`; },
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
      if (i >= sc.lines.length || !$("#screen-lesson").classList.contains("active") || !session || session.exercises[session.index] !== ex) { replay.disabled = false; return; }
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
  "scene-read": renderSceneRead,
  "scene-missing": renderSceneMissing,
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
