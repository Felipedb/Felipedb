// Testes das funções de pontuação. Rodar com: node --test prototipo/pose-webcam/pontuacao.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { REF_T, vetoresMembros, similaridade, classe, angulo } from "./pontuacao.js";

// Monta 33 worldLandmarks (metros, origem no quadril) a partir de sobrescritas.
function corpo(sobrescritas) {
  const w = Array.from({ length: 33 }, () => ({ x: 0, y: 0, z: 0, visibility: 1 }));
  for (const [i, p] of Object.entries(sobrescritas)) w[i] = { x: 0, y: 0, z: 0, visibility: 1, ...p };
  return w;
}

const pernas = {
  23: { x: 0.1, y: 0 }, 24: { x: -0.1, y: 0 },
  25: { x: 0.1, y: 0.45 }, 26: { x: -0.1, y: 0.45 },
  27: { x: 0.1, y: 0.9 }, 28: { x: -0.1, y: 0.9 },
};
const ombros = { 11: { x: 0.2, y: -0.5 }, 12: { x: -0.2, y: -0.5 } };

const poseT = corpo({
  ...pernas, ...ombros,
  13: { x: 0.5, y: -0.5 }, 14: { x: -0.5, y: -0.5 },
  15: { x: 0.8, y: -0.5 }, 16: { x: -0.8, y: -0.5 },
});
const bracosBaixos = corpo({
  ...pernas, ...ombros,
  13: { x: 0.2, y: -0.2 }, 14: { x: -0.2, y: -0.2 },
  15: { x: 0.2, y: 0.1 }, 16: { x: -0.2, y: 0.1 },
});

test("pose em T contra a referência em T dá nota 1 e PERFECT", () => {
  const { nota, visiveis } = similaridade(vetoresMembros(poseT), REF_T);
  assert.equal(visiveis, 9);
  assert.ok(Math.abs(nota - 1) < 1e-9, `nota ${nota}`);
  assert.equal(classe(nota), "PERFECT");
});

test("braços para baixo contra a referência em T dá nota parcial (OK)", () => {
  // braços perpendiculares (cos 0 → 0,5) pesam 4 × 1,5; pernas e tronco iguais (1).
  // (4 × 1,5 × 0,5 + 4 × 1 + 0,5) / (6 + 4 + 0,5) = 7,5 / 10,5
  const { nota } = similaridade(vetoresMembros(bracosBaixos), REF_T);
  assert.ok(Math.abs(nota - 7.5 / 10.5) < 1e-9, `nota ${nota}`);
  assert.equal(classe(nota), "OK");
});

test("pose capturada contra ela mesma dá 1, independente da escala", () => {
  const ref = vetoresMembros(poseT);
  const maior = poseT.map((p) => ({ ...p, x: p.x * 2, y: p.y * 2, z: p.z * 2 }));
  const { nota } = similaridade(vetoresMembros(maior), ref);
  assert.ok(Math.abs(nota - 1) < 1e-9);
});

test("com menos de 3 membros visíveis o movimento não pontua", () => {
  const escondido = poseT.map((p, i) => (i >= 23 ? { ...p, visibility: 0.1 } : p));
  // pernas e tronco invisíveis: sobram 4 braços → pontua; escondendo os pulsos, sobram 2.
  const soBracos = similaridade(vetoresMembros(escondido), REF_T);
  assert.equal(soBracos.visiveis, 4);
  const semPulsos = escondido.map((p, i) => (i === 15 || i === 16 ? { ...p, visibility: 0.1 } : p));
  const r = similaridade(vetoresMembros(semPulsos), REF_T);
  assert.equal(r.visiveis, 2);
  assert.equal(r.nota, null);
  assert.equal(classe(r.nota), "");
});

test("classes seguem os limiares", () => {
  assert.equal(classe(0.95), "PERFECT");
  assert.equal(classe(0.90), "PERFECT");
  assert.equal(classe(0.85), "GOOD");
  assert.equal(classe(0.70), "OK");
  assert.equal(classe(0.60), "MISS");
});

test("ângulo do cotovelo: 180° em T, 90° com o antebraço dobrado", () => {
  assert.equal(angulo(poseT, 11, 13, 15), 180);
  const dobrado = corpo({ 11: { x: 0.2, y: -0.5 }, 13: { x: 0.5, y: -0.5 }, 15: { x: 0.5, y: -0.8 } });
  assert.equal(angulo(dobrado, 11, 13, 15), 90);
});
