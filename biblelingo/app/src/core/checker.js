// Preparação e checagem de respostas — porta fiel das atribuições feitas nos renderers
// do app clássico (ex.correct / accept / explain / audioText) e do checkAnswer.
import { normalize, editDistance, typeAccepts, blankRegex } from "./util.js";
import { corpusWords, SCENE_BY_ID, sceneNameOf } from "./content.js";

// Define correct/accept/explain/audioText/audioAfter do exercício, como o renderer clássico fazia.
export function prepareExercise(ex) {
  const s = ex.sentence, w = ex.word;
  switch (ex.type) {
    case "image-choice":
    case "choice-en-pt":
      ex.correct = w.pt; ex.explain = `${w.en} = ${w.pt}`; ex.audioText = w.en; break;
    case "choice-pt-en":
      ex.correct = w.en; ex.explain = `${w.pt} = ${w.en}`; ex.audioText = w.en; break;
    case "listen":
      ex.correct = w.en; ex.explain = `${w.en} = ${w.pt}`; ex.audioText = w.en; break;
    case "type":
      ex.correct = w.en; ex.accept = typeAccepts(w.en); ex.explain = `${w.pt} = ${w.en}`; ex.audioText = w.en; break;
    case "build":
    case "listen-build":
      ex.correct = s.en; ex.explain = `"${s.en}" = "${s.pt}"`; ex.audioText = s.en; break;
    case "translate-en-pt":
      ex.correct = s.pt; ex.accept = [s.pt]; ex.explain = `"${s.en}" = "${s.pt}"`; ex.audioText = s.en; break;
    case "listen-type":
      ex.correct = s.en; ex.fuzzy = true; ex.explain = `"${s.en}" — ${s.pt}`; ex.audioText = s.en; break;
    case "listen-choice":
      ex.correct = s.pt; ex.explain = `"${s.en}" = "${s.pt}"`; ex.audioText = s.en; break;
    case "missing-word":
      ex.correct = ex.blank; ex.explain = `"${s.en}"`; ex.audioText = s.en.replace(ex.blank, "blank"); ex.audioAfter = s.en; break;
    case "complete-translation":
      ex.correct = ex.blank; ex.fuzzy = true; ex.explain = `"${s.en}"`; ex.audioText = s.en.replace(ex.blank, "blank"); ex.audioAfter = s.en; break;
    case "verse": {
      const v = ex.verse;
      ex.correct = v.blank; ex.explain = `"${v.text}" — ${v.ref}`; ex.audioText = v.text.replace(blankRegex(v.blank), "blank"); ex.audioAfter = v.text; break;
    }
    case "read": {
      const r = ex.reading;
      ex.correct = r.answer; ex.explain = r.q + " → " + r.answer; ex.audioText = r.text; break;
    }
    case "dialogue": {
      const d = ex.dialogue;
      ex.correct = d.answer; ex.explain = `${d.answer} = ${d.answerPt}`; ex.audioText = d.line; ex.audioAfter = d.answer; break;
    }
    case "quiz": {
      const q = ex.quiz;
      ex.correct = q.answer; ex.explain = q.explain; ex.audioText = q.q; ex.audioAfter = q.answer; break;
    }
    case "speak":
      ex.correct = s.en; ex.explain = `"${s.en}" — ${s.pt}`; break;
    case "match":
    case "listen-match":
      ex.correct = "__matched__"; ex.explain = "Pares corretos!"; ex.audioText = ex.pairs.map((p) => p.en).join(", "); break;
    // Cenas
    case "scene-intro":
      ex.correct = "__intro__"; break;
    case "scene-read":
      ex.correct = "__read__"; break;
    case "scene-truth":
      ex.correct = "__truth__"; break;
    case "scene-reply": {
      const sc = SCENE_BY_ID[ex.sceneId], line = sc.lines[ex.li];
      ex.correct = line.en; ex.explain = `${sceneNameOf(sc.char)}: "${line.en}" = "${line.pt}"`; ex.audioText = line.en; break;
    }
    case "scene-listen": {
      const sc = SCENE_BY_ID[ex.sceneId], line = sc.lines[ex.li];
      ex.correct = line.pt; ex.explain = `"${line.en}" = "${line.pt}"`; ex.audioText = line.en; break;
    }
    case "scene-missing": {
      const sc = SCENE_BY_ID[ex.sceneId], line = sc.lines[ex.li];
      ex.correct = ex.blank; ex.explain = `"${line.en}" = "${line.pt}"`; ex.audioText = line.en; break;
    }
    case "scene-gap": {
      const sc = SCENE_BY_ID[ex.sceneId], line = sc.lines[ex.li];
      ex.correct = ex.blank; ex.fuzzy = true; ex.explain = `"${line.en}"`; ex.audioText = line.en; ex.audioAfter = line.en; break;
    }
    case "scene-build": {
      const sc = SCENE_BY_ID[ex.sceneId], line = sc.lines[ex.li];
      ex.correct = line.en; ex.explain = `"${line.en}" = "${line.pt}"`; ex.audioText = line.en; break;
    }
    case "scene-speak": {
      const sc = SCENE_BY_ID[ex.sceneId], line = sc.lines[ex.li];
      ex.correct = line.en; ex.explain = `"${line.en}" = "${line.pt}"`; break;
    }
    default: break;
  }
  return ex;
}

export function altsOf(ex) {
  if (ex.type === "translate-en-pt") return (ex.sentence && ex.sentence.altPt) || [];
  if (["build", "listen-build", "listen-type"].includes(ex.type)) return (ex.sentence && ex.sentence.alt) || [];
  if (ex.type === "type") return (ex.word && ex.word.alt) || [];
  return [];
}

export function fuzzyEqual(answer, target) {
  const a = normalize(answer).split(" "), t = normalize(target).split(" ");
  if (a.length !== t.length) return false;
  return t.every((w, i) => a[i] === w || (w.length >= 4 && editDistance(a[i], w) <= 1 && !corpusWords().has(a[i])));
}

// Avalia a resposta; devolve { ok, typo }
export function evaluate(ex, answer) {
  const accepts = [...(ex.accept || [ex.correct]), ...altsOf(ex)];
  const exact = accepts.some((c) => normalize(answer) === normalize(c));
  const ok = exact
    || (ex.type === "translate-en-pt" && accepts.some((c) => normalize(answer, true) === normalize(c, true)))
    || ((ex.fuzzy || ex.type === "build" || ex.type === "listen-build") && accepts.some((c) => fuzzyEqual(answer, c)));
  return { ok, typo: ok && !exact };
}

// Resposta correta com as palavras que o aluno errou marcadas (para o React renderizar)
export function diffWords(correct, given) {
  const have = new Set(normalize(given).split(" "));
  return correct.split(" ").map((w) => ({ w, miss: !have.has(normalize(w)) }));
}
