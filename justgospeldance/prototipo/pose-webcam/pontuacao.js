// Pontuação de pose: funções puras, sem DOM, para o protótipo e para o jogo.
// Trabalha sobre os worldLandmarks do MediaPipe (33 pontos em metros, origem no
// centro do quadril, x cresce para a direita da imagem, y cresce para baixo).

// Direções de membros usadas na comparação: [pontoA, pontoB, peso].
// Índices: 11/12 ombros, 13/14 cotovelos, 15/16 pulsos, 23/24 quadris,
// 25/26 joelhos, 27/28 tornozelos (E = ímpar, D = par, do ponto de vista da pessoa).
export const MEMBROS = [
  [11, 13, 1.5], [13, 15, 1.5], [12, 14, 1.5], [14, 16, 1.5],
  [23, 25, 1.0], [25, 27, 1.0], [24, 26, 1.0], [26, 28, 1.0],
];
export const PESO_TRONCO = 0.5;
export const LIMIAR_VIS = 0.5;
export const MIN_MEMBROS = 3;
export const CLASSES = [["PERFECT", 0.90], ["GOOD", 0.80], ["OK", 0.65], ["MISS", -1]];

const sub = (a, b) => [a.x - b.x, a.y - b.y, a.z - b.z];
const norma = (v) => Math.hypot(v[0], v[1], v[2]);
const unit = (v) => { const n = norma(v) || 1; return [v[0] / n, v[1] / n, v[2] / n]; };
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const vis = (p) => p.visibility ?? 1;
const mid = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, z: (a.z + b.z) / 2, visibility: Math.min(vis(a), vis(b)) });

/** Direções unitárias dos membros (e do tronco) de um conjunto de worldLandmarks. */
export function vetoresMembros(w) {
  const membros = MEMBROS.map(([a, b, peso]) => ({
    v: unit(sub(w[b], w[a])), w: peso, vis: Math.min(vis(w[a]), vis(w[b])),
  }));
  const quadril = mid(w[23], w[24]);
  const ombros = mid(w[11], w[12]);
  membros.push({ v: unit(sub(ombros, quadril)), w: PESO_TRONCO, vis: Math.min(quadril.visibility, ombros.visibility) });
  return { membros };
}

/** Pose em T: braços abertos na horizontal, pernas retas, tronco em pé. */
export const REF_T = {
  membros: [
    { v: [1, 0, 0], w: 1.5, vis: 1 }, { v: [1, 0, 0], w: 1.5, vis: 1 },
    { v: [-1, 0, 0], w: 1.5, vis: 1 }, { v: [-1, 0, 0], w: 1.5, vis: 1 },
    { v: [0, 1, 0], w: 1.0, vis: 1 }, { v: [0, 1, 0], w: 1.0, vis: 1 },
    { v: [0, 1, 0], w: 1.0, vis: 1 }, { v: [0, 1, 0], w: 1.0, vis: 1 },
    { v: [0, -1, 0], w: PESO_TRONCO, vis: 1 },
  ],
};

/**
 * Similaridade entre jogador e referência: média ponderada de (1 + cos θ) / 2
 * sobre os membros visíveis nos dois lados. Com menos de MIN_MEMBROS visíveis a
 * nota é null (movimento não pontuável).
 */
export function similaridade(jog, ref) {
  let soma = 0, pesos = 0, visiveis = 0;
  for (let i = 0; i < jog.membros.length; i++) {
    const a = jog.membros[i], b = ref.membros[i];
    if (a.vis < LIMIAR_VIS || b.vis < LIMIAR_VIS) continue;
    soma += ((1 + dot(a.v, b.v)) / 2) * a.w;
    pesos += a.w;
    visiveis++;
  }
  if (visiveis < MIN_MEMBROS) return { nota: null, visiveis };
  return { nota: soma / pesos, visiveis };
}

/** Classe (PERFECT, GOOD, OK, MISS) de uma nota; vazio para nota null. */
export function classe(nota) {
  if (nota == null) return "";
  return CLASSES.find(([, min]) => nota >= min)[0];
}

/** Ângulo em graus na articulação B formada por A-B-C. */
export function angulo(w, a, b, c) {
  const u = unit(sub(w[a], w[b])), v = unit(sub(w[c], w[b]));
  return Math.round(Math.acos(Math.max(-1, Math.min(1, dot(u, v)))) * 180 / Math.PI);
}
