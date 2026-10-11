// Única fonte de molas, curvas, durações e cadências (VISUAL_SPEC 7.1).
// Nenhum outro arquivo declara stiffness/damping: importe daqui.
export const SPRING = {
  snap:   { type: "spring", stiffness: 700, damping: 40 }, // soltar botão e peça (~120 ms, sem overshoot)
  pop:    { type: "spring", stiffness: 500, damping: 18 }, // ícones, badges, estrelas, popover (overshoot ~12%)
  bounce: { type: "spring", stiffness: 300, damping: 12 }, // personagem, troféu, coroa, chama (overshoot ~25%)
  settle: { type: "spring", stiffness: 260, damping: 30 }, // troca de exercício, cards, cabeçalho, aba ativa (sem overshoot)
  soft:   { type: "spring", stiffness: 160, damping: 26 }, // barras e anéis
  layout: { type: "spring", stiffness: 500, damping: 35 }, // layoutId: peças, caixa da aba, moedas
  sheet:  { type: "spring", stiffness: 320, damping: 28 }, // bottom sheets e modais (~250 ms)
  footer: { type: "spring", stiffness: 420, damping: 32 }, // rodapé de feedback e snackbar
  screen: { type: "spring", stiffness: 300, damping: 30 }, // tela da lição subindo (~320 ms)
};

export const EASE = { out: [0.22, 1, 0.36, 1], pop: [0.34, 1.56, 0.64, 1], in: [0.4, 0, 1, 1] };

// Durações em segundos (o Motion trabalha em s; o CSS espelha em ms em index.css)
export const DUR = { micro: 0.08, state: 0.18, panel: 0.25, screen: 0.32, complete: 0.4, celebrate: 0.9, bounce: 1.2 };

export const STAGGER = { options: 0.04, tiles: 0.025, cards: 0.12, stars: 0.18, week: 0.08 };

// Tremor de erro (opção errada, personagem triste). Interrompível: é `animate`, não classe CSS.
export const SHAKE = { x: [0, -6, 6, -4, 4, 0], transition: { duration: 0.32 } };

// Pulso de acerto (opção ou peças certas)
export const PULSE = { scale: [1, 1.04, 1], transition: { duration: 0.25 } };

// Cascata de filhos: <motion.div variants={list()} initial="hidden" animate="show">
export const list = (stagger = STAGGER.cards, delay = 0) => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren: delay } },
});

// Item da cascata: entra de baixo (y) com a mola dada
export const item = (spring = SPRING.settle, y = 16) => ({
  hidden: { y, opacity: 0 },
  show: { y: 0, opacity: 1, transition: spring },
});

// Saída padrão: tween curto com EASE.out (tudo que some usa isto)
export const exitFade = (d = DUR.state) => ({ opacity: 0, transition: { duration: d, ease: EASE.out } });
