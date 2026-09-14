// Montador das cenas do dia a dia — porta fiel de scene-engine.js.
import { state } from "./store.js";
import { shuffle, normalize, cleanWord, wordCount } from "./util.js";
import { SCENES, SCENE_BY_ID, flatLessons } from "./content.js";
import { weakestWords } from "./sr.js";
import { EX_MAKE, exNearWords, capOf, listenMuted, speakMutedNow, setDistractUnit } from "./builder.js";
import { SPEECH_OK } from "./audio.js";

export function sceneOfStep(step) { return SCENE_BY_ID[step.sceneId || step.id]; }

// Palavra da lacuna: um item do vocabulário que aparece na fala; senão, a palavra mais longa
export function sceneGapWord(en, vocab, allowPhrase) {
  const tokens = en.split(" ").map(cleanWord).filter(Boolean);
  const single = vocab.map((v) => v.en.replace(/^to /, "")).filter((v) => !v.includes(" "));
  const hit = tokens.find((t) => single.some((v) => normalize(v) === normalize(t)));
  if (hit) return hit;
  if (allowPhrase) {
    const clean = en.split(" ").map(cleanWord).join(" ");
    const esc = (v) => v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const phrase = vocab.map((v) => v.en.replace(/^to /, "")).filter((v) => v.includes(" ")).find((v) => new RegExp("(^|\\s)" + esc(v) + "(\\s|$)", "i").test(clean));
    if (phrase) { const m = new RegExp("(^|\\s)(" + esc(phrase) + ")(\\s|$)", "i").exec(clean); return m ? m[2] : phrase; }
  }
  const cands = tokens.filter((t) => /^[a-z]+$/i.test(t) && t.length >= 4 && !/^[A-Z]/.test(t));
  if (!cands.length) return null;
  return cands.sort((a, b) => b.length - a.length)[0];
}

export function sceneBank(line, scene) {
  const words = line.en.split(" ");
  const pool = scene.lines.filter((l) => l !== line).flatMap((l) => l.en.split(" ").map(cleanWord))
    .filter((w) => w && !words.map(cleanWord).map(normalize).includes(normalize(w)));
  const extra = [];
  shuffle([...new Set(pool)]).forEach((w) => { if (extra.length < 2) extra.push(w); });
  return shuffle([...words, ...extra]);
}

// Distratores para "escolha a fala": falas do herói em OUTRAS cenas, de tamanho parecido
export function sceneReplyOptions(line, scene) {
  const same = SCENES.filter((s) => s !== scene && s.char === scene.char).flatMap((s) => s.lines.filter((l) => l.who === s.char).map((l) => l.en));
  const any = SCENES.filter((s) => s !== scene).flatMap((s) => s.lines.filter((l) => l.who === s.char).map((l) => l.en));
  const sameSet = new Set(same);
  const pool = [...new Set([...same, ...any])].filter((e) => e !== line.en && !scene.lines.some((l) => l.en === e));
  const kind = (t) => /\?\s*$/.test(t) ? "?" : ".";
  const near = pool.map((e) => ({ e, d: Math.abs(e.length - line.en.length) + (sameSet.has(e) ? 0 : 25) + (kind(e) === kind(line.en) ? 0 : 15) + Math.random() * 8 }))
    .sort((x, y) => x.d - y.d).slice(0, 4).map((x) => x.e);
  return shuffle([line.en, ...shuffle(near).slice(0, 2)]);
}

// Distratores para "o que ele disse?": traduções de falas de outras cenas
export function sceneListenOptions(line, scene) {
  const pool = [...new Set(SCENES.filter((s) => s !== scene).flatMap((s) => s.lines.map((l) => l.pt)))].filter((p) => p !== line.pt);
  const kind = (t) => /\?\s*$/.test(t) ? "?" : ".";
  const near = pool.map((p) => ({ p, d: Math.abs(p.length - line.pt.length) + (kind(p) === kind(line.pt) ? 0 : 15) + Math.random() * 8 })).sort((x, y) => x.d - y.d).slice(0, 4).map((x) => x.p);
  return shuffle([line.pt, ...shuffle(near).slice(0, 2)]);
}

export function buildSceneExercises(step) {
  const sc = sceneOfStep(step);
  setDistractUnit(step.unit);
  const id = sc.id;
  const firstTime = !state.completed[id];
  const canSpeak = SPEECH_OK && !speakMutedNow();
  const noListen = listenMuted();
  const isHero = (l) => l.who === sc.char;
  const count = {};
  const ex = [];
  const take = (e, phase) => { e.phase = phase; count[e.type] = (count[e.type] || 0) + 1; ex.push(e); return e; };
  const under = (t) => (count[t] || 0) < capOf(t);
  const lineBase = (li) => ({ sceneId: id, li, sentence: { en: sc.lines[li].en, pt: sc.lines[li].pt }, audioText: sc.lines[li].en });

  take({ type: "scene-intro", sceneId: id, silent: true }, "intro");

  // 2) vocabulário receptivo; na 1ª visita toda expressão nova é apresentada com significado
  const vocab = shuffle(sc.vocab.slice());
  const introTypes = (firstTime || noListen) ? ["image-choice", "choice-en-pt"] : ["image-choice", "choice-en-pt", "listen"];
  vocab.slice(0, 3).forEach((w, i) => take({ ...EX_MAKE[introTypes[i % introTypes.length]](w), newWord: firstTime }, "vocab"));

  // 3) batidas da conversa
  const beats = [];
  let cur = [];
  sc.lines.forEach((l, li) => { cur.push(li); if (isHero(l) || cur.length === 2) { beats.push(cur); cur = []; } });
  if (cur.length) beats.push(cur);
  let checkTurn = SCENES.indexOf(sc) % 2;
  beats.forEach((beat, k) => {
    const last = sc.lines[beat[beat.length - 1]];
    const heroLast = isHero(last) && beat.length >= 1;
    if (k > 0 && heroLast && k % 2 === 1 && under("scene-reply")) {
      take({ ...lineBase(beat[beat.length - 1]), type: "scene-reply", shown: beat.slice(0, -1), options: sceneReplyOptions(last, sc) }, "read");
      return;
    }
    take({ type: "scene-read", sceneId: id, lis: beat, silent: true }, "read");
    if (k === 0) return;
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

  // 4) produção sobre falas do herói já vistas
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
