# BíbliaLearn: especificação visual e de movimento (VISUAL_SPEC)

Versão 1.0 · 3 de outubro de 2026 · Fonte da verdade para a reformulação visual do app React (`biblelingo/app`).

Este documento sintetiza a proposta vencedora da rodada de design ("Motion-first", dinâmico) com os enxertos escolhidos pelos juízes a partir das propostas "fiel" (fidelidade máxima ao Duolingo) e "bíblico" (identidade Oliva, Céu e Ouro), e incorpora todos os achados críticos e altos das três auditorias de interface (casca e trilha, lição, dinâmica). Toda medida está em px CSS para a viewport de referência de 390x844 (iPhone); "lg" significa largura igual ou maior que 1024 px. Toda cor está em hex, com a variante clara e a escura quando diferem. As referências visuais citadas (por exemplo `af04a0f5`, `568c98d4`, `bed6c88f`, `da162265`) vivem em `scratchpad/refs/` e foram medidas pixel a pixel pelas auditorias.

Stack alvo: React 19 + Vite + Tailwind v4 (`@theme` em `app/src/index.css`) + `motion/react` (pacote completo, como o código já importa) + `canvas-confetti`. Nada aqui exige mudar `session.js`, `builder.js`, `checker.js` ou `sceneBuilder.js`, exceto os pontos de contato citados explicitamente (eventos `onSpeak`, `pendingCelebrations`, `ex.silent` do `word-card`).

Convenções de escrita: português do Brasil, sem travessão; valores exatos (hex, px, ms); arquivos e linhas citados contra o estado atual do repositório.

---

## Sumário

0. Resumo executivo e decisões de síntese
1. Princípios
2. Tokens completos (`@theme` e `.dark`)
3. Tipografia e escala
4. Conjunto de ícones SVG
5. Especificação de componentes
6. Blueprint de cada tela e de cada formato de exercício e cena
7. Sistema de movimento
8. Sons e haptics
9. Acessibilidade e tema claro/escuro
10. Contratos de teste que não podem quebrar
11. Checklist de aceitação visual por tela
Apêndice A. Rastreabilidade dos achados das auditorias
Apêndice B. Riscos e mitigações
Apêndice C. Ordem de entrega e critério de pronto

---

## 0. Resumo executivo e decisões de síntese

### 0.1 Diagnóstico em uma frase

A arquitetura do BíbliaLearn já é a do Duolingo (5 abas, trilha, HUD, lição com rodapé de feedback, banco de palavras com `layoutId`, resultado com estrelas e baú, 9 efeitos sonoros), mas quase tudo acontece em um único frame e quase tudo que deveria ser ilustrado é emoji ou retrato JPG de 360x249 recortado em círculo. O que separa o app atual de "lindo e dinâmico" não é estrutura: são (a) uma base visual neutra e consistente, (b) um vocabulário único de movimento aplicado em todos os componentes e (c) personagens que reagem.

Evidências medidas: `mode="wait"` em `app/src/screens/Lesson.jsx:122` deixa 100 a 180 ms de tela vazia a cada troca de exercício; o rodapé de feedback aparece completo aos 80 a 94 ms sem deslizar (`Lesson.jsx:154`); o Result mostra "+15 / 93% / 1" no frame 0 (`Result.jsx:32-36`); a reação do personagem é recortada pelo `overflow-hidden` de `CharFace.jsx:5`; `onSpeak` (`core/audio.js:8`) não tem assinante; o `pb-44` de `Lesson.jsx:107` reserva 176 px para um rodapé que mede 193 a 230 px; 51 linhas de emoji em 8 arquivos fazem papel de ícone; o tema claro é creme (`index.css:24-33`: `#faf6ec`, `#4a4034`, `#eae2cf`); `--color-gold-fg #7d5c05` sem override no `.dark` (`index.css:21`) dá 2,73:1 sobre `#131f24`; os nós da trilha são discos planos de 72 px com emoji (`Home.jsx:113-118`), a trilha sobe de baixo para cima (`Home.jsx:84`, `:162`) e um CTA fixo de 358x76 cobre o nó u2l1 (`Home.jsx:226-233`).

### 0.2 O que vem de cada proposta

| Origem | O que entra neste documento |
|---|---|
| Dinâmico (vencedora) | `core/motion.js` com SPRING, EASE, DUR, STAGGER, SHAKE, PULSE e variants `list`/`item`; `AnimatePresence mode="popLayout"` com contêiner `relative` e `min-height`; `session.pendingCelebrations` + `MissionScreen` no pipeline pós-lição; halo do nó por `transform` em pseudo-elemento (não `box-shadow` animado); paleta dos capítulos resolvida no app (sem mexer no merge de conteúdo); sprite sonoro `sfx-v2` no formato de `audio/sprites`; aviso de que `layoutId` e `drag` exigem o pacote completo do Motion (sem `LazyMotion domAnimation` na raiz); toggle "Alto contraste"; prioridades P0/P1/P2 amarradas aos IDs das auditorias. |
| Bíblico (enxertos) | Famílias de cor com apelido bíblico (Oliva, Céu, Ouro, Chama, Rubi, Púrpura, Nilo, Rosa, Galileia) e quatro tons cada (base, sombra, suave, texto) com valores medidos (`#3f7d12`, `#0f6f9f`, `#8a6200`, `#6f6f6f`, `#d9c89a` sobre `#1e2a2c`); esqueleto `@theme` com mapa de migração e aliases por um sprint; `tools/contrast-check.mjs` + `contrast-pairs.json` no CI; motivo Pergaminho (classe `.parchment` restrita a cinco lugares, sem textura `feTurbulence`); motivo Luz (`--glow-gold` e `--glow-ring` só em Result, ofensiva e troféu lendário); oito medalhas com motivo bíblico; `brand-mark` (livro verde com cruz e raio dourado) para splash, sidebar e PWA; fallback métrico de fonte (`Nunito Fallback` com `size-adjust`) mantendo o `@fontsource` já existente; Nunito 500 para frases, opções e peças; `FeedbackFooter` publicando `--footer-h` via `ResizeObserver`; `HeartsSheet` com contador tabular; `Toggle` com `layout` + `SPRING.snap`. Rejeitado: economia de gemas (`state.gems`), renomear tokens para português, alterar `data.js`. |
| Fiel (enxertos) | Amarelo `#ffc800` reservado a recompensas: nenhum capítulo é amarelo (u6 José vira rosa `#ff86d0`, u5 Profetas vira teal `#2bb5a3`); anel segmentado do nó atual em `ceil(exercícios/5)` segmentos de 6 px com gap de 4 px; formato `word-card` detalhado a partir da referência `51a0685b`; `UnitGuideSheet` por capítulo; fluxo completo das cenas (intro com avatares ligados por seta, read com karaokê por `audio/words.json`, truth com "OUVIR A CONVERSA INTEIRA"); Configurações como view interna do Perfil com `history.pushState`; toast dentro da lição virando faixa de 32 px; `[data-popover-start]` e atualização dos drivers e2e ANTES de inverter a trilha; riscos de teclado iOS (`100dvh`, `visualViewport.resize`, Enter como VERIFICAR); preload do woff2 e pré-cache do shell no `sw.js`; `core/palette.js` indexado pelo id da unidade; lista completa de ícones; elipse de sombra desenhada pelo app; fallback do `CharacterStage` para o busto em círculo; blueprints com medidas fechadas (NodePopover 358, UnitHeader 358x84, StatCard 110x92 e 171x84, caixa da aba 56x44, Sheet raio 24 com alça 36x4) e os 22 formatos descritos um a um. |

### 0.3 Correções técnicas aplicadas à síntese

1. O listener global de `pointerdown` que toca "tap" em todo botão vive em `biblelingo/sfx.js:108-113`, arquivo compartilhado com o app clássico e injetado no React pelo alias de `app/vite.config.mjs:27-28`. Não editar esse arquivo: criar `app/src/core/sfx.js` próprio do React (exporta `sfx(name, { rate, volume })`) e `app/src/core/haptics.js` (exporta `haptic(name)`), e o `App.jsx` deixa de importar `SFX` do arquivo compartilhado. O listener compartilhado fica inerte no React porque nenhum botão novo usa `.opt`, `.tile`, `#btn-check`; ainda assim, o `sfx.js` do React deve registrar `document.addEventListener("pointerdown", stop, { capture: true })` que marca `e.__blSfxHandled` para que o listener clássico (que segue carregado pelo alias) retorne cedo, até o alias ser removido.
2. A raiz continua com `import { motion, AnimatePresence, MotionConfig } from "motion/react"` (pacote completo). Nenhuma proposta de `LazyMotion features={domAnimation} strict`: `layoutId` (`WordBank.jsx:97`, `SceneBuild.jsx:62`) e `drag` dos sheets exigem `domMax` ou o pacote completo, e `strict` lança erro em todo `motion.*`.
3. `core/palette.js` é a fonte da paleta dos capítulos, indexada por `u.id`; `data.js` mantém `color` para o app clássico e não passa pelo merge de conteúdo por causa deste documento.
4. Os drivers `app/scripts/e2e-course.mjs`, `e2e-lesson.mjs` e `shots-visual.mjs` são atualizados antes de qualquer mudança que altere o fluxo (popover do nó, textarea de digitação, cerimônias pós-lição). Ver seção 10.

### 0.4 Ordem de ataque

- P0 (semana 1): tokens, tipografia e aliases; `core/motion.js`, `core/sfx.js`, `core/haptics.js`; ícones SVG e remoção dos emojis da casca; `FeedbackFooter` por mola com `--footer-h`; troca de exercício sem vazio; `CharacterStage` com reação visível e `useTalking`; Result em cascata com `CountUp` e baú vivo; Snackbar e `HeartsSheet` por mola; `Button3D` unificado; drivers e2e atualizados.
- P1 (semana 2): trilha de cima para baixo com `PathNode` 3D, `UnitHeader` sticky, `NodePopover`, baús e personagens laterais; HUD interativo; `TabBar` com caixa deslizante; combo com shimmer; banco de palavras com pouso e som; `word-card`; Match Madness e História com game feel; Missões, Hub, Perfil e Personagens novos.
- P2 (semana 3): cerimônias de ofensiva, meta diária, coroa e missão; `UnitGuideSheet`; Configurações como view; ativos de personagem em alta resolução; sprite sonoro `sfx-v2`; reduced motion e haptics como preferências; desktop em 3 colunas.

---

## 1. Princípios

1. Página neutra, cor concentrada. Fundo de página sempre `#ffffff` (claro) ou `#131f24` (escuro). Cor saturada aparece só em botões, nós, ícones, barras, cabeçalhos de capítulo e feedback. O creme (`#fbf5e6`) é acento, nunca fundo de página.
2. Profundidade por sombra dura. Botões `0 4px 0`, nós `0 8px 0`, microfone `0 7px 0`, cards clicáveis com borda inferior de 4 px. Zero `box-shadow` difuso, zero gradiente de vidro, zero `blur` decorativo. Exceções nomeadas: scrim de modal, glow de celebração (seção 2.5) e os dois banners de seção.
3. Um evento, um som, um haptic, um movimento. Nunca "tap" + "correct" no mesmo toque; nunca duas coisas grandes se movendo ao mesmo tempo.
4. Entradas por mola, saídas por tween curto. O que aparece usa mola (overshoot visível em ícones e personagens, nenhum em painéis); o que some usa 120 a 180 ms com `EASE.out`. Nada abaixo de 60 ms nem acima de 350 ms fora das celebrações.
5. Personagens como atores, não como medalhões. Ilustração em pé ao lado do balão (110x180) ou centralizada (220x300), sem círculo e sem legenda na lição; círculo apenas na trilha (cena concluída), no chat das cenas, nas listas e no perfil. O personagem fala (boca ou respiração), comemora e se entristece.
6. Uma família tipográfica, pesos de verdade. Nunito variável (já servida por `@fontsource-variable/nunito`, `main.jsx:4`): 500 para frases, opções e peças; 700 para rótulos de linha; 800 para títulos, CTA e números. Baloo 2 sai de toda a interface; sobrevive apenas no wordmark (e pode ser substituída por um SVG). Nada abaixo de 13 px.
7. Ícones SVG próprios em 2 ou 3 tons. Emoji é proibido em JSX por lint; permanece apenas como dado de conteúdo (`o.icon` do vocabulário, `ch.emoji` dos extras) até existirem ilustrações.
8. Amarelo é recompensa. `#ffc800` só em XP, estrelas, troféu, baú, coroa, combo a partir de x5 e barras de missão. Nenhum capítulo é amarelo.
9. Cerimônias no lugar de toasts. Missão concluída, ofensiva, meta diária, coroa e baú viram telas ou sheets coreografados depois do Result; toast fica para avisos leves e nunca aparece dentro da lição.
10. Piso de acessibilidade. Todo par texto/fundo com 4,5:1 (ou 3:1 para texto de 19 px/700 ou maior, ou 24 px ou maior); toque mínimo 44 px; `role`/`aria` em abas, rádios, barras e diálogos; texto `sr-only` para os números do HUD; `MotionConfig reducedMotion="user"` na raiz; haptics como preferência própria, desacoplados de reduced motion.
11. Implementável sem reescrever a lógica. Tokens novos com aliases dos antigos por um sprint; componentes novos em `app/src/components/ui/` consumidos pelas telas existentes; contratos de teste da seção 10 preservados.

---

## 2. Tokens completos (`@theme` e `.dark`)

Todos os tokens vivem em `app/src/index.css` dentro de `@theme` e são sobrescritos no `.dark` (o `@custom-variant dark (&:where(.dark, .dark *))` de `index.css:51` permanece). Os nomes das famílias são em inglês para não quebrar as classes já geradas pelo Tailwind; o apelido bíblico é só documentação e nome de design.

### 2.1 Neutros

| Token | Claro | Escuro | Uso |
|---|---|---|---|
| `--color-page` | `#ffffff` | `#131f24` | fundo da página, HUD, tab bar, balão de fala, face de cards |
| `--color-raised` | `#f7f7f7` | `#202f36` | rodapé de feedback (escuro), card de digitação (escuro), painel de gravação, aba ativa (escuro), hover de cards |
| `--color-line` | `#e5e5e5` | `#37464f` | bordas de 2 px, trilhos de barras, linhas da zona de resposta, fantasma de peça, nó bloqueado |
| `--color-ink` | `#4b4b4b` | `#f1f7fb` | texto principal |
| `--color-ink-soft` | `#6f6f6f` | `#dce6ec` | texto secundário (o `#777777` do Duolingo dá 4,48:1 e por isso usamos `#6f6f6f`, 5,02:1) |
| `--color-muted` | `#6f6f6f` | `#8fa3ad` | links em caixa alta ("NÃO POSSO OUVIR AGORA", "USAR TECLADO"), placeholders |
| `--color-disabled` | `#afafaf` | `#52656d` | texto de CTA desabilitado, ícone de cadeado, X do cabeçalho, estrelas vazias (nunca texto informativo) |
| `--color-overlay` | `rgba(0,0,0,.5)` | `rgba(0,0,0,.6)` | scrim de sheets e modais |
| `--color-parchment` | `#fbf5e6` | `#1e2a2c` | fundo do motivo Pergaminho (seção 2.5) |
| `--color-parchment-line` | `#ecdfbf` | `#3a4a4c` | borda do Pergaminho |
| `--color-parchment-text` | `#7a5a16` | `#d9c89a` | referência bíblica e texto de destaque no Pergaminho |

### 2.2 Famílias semânticas (base, sombra, suave, linha, texto)

Cada família tem: `base` (face de botão, nó, ícone), `shadow` (sombra dura 3D, 12 a 15% mais escura), `soft` (fundo de estado selecionado ou de feedback), `line` (borda sobre o fundo suave) e `text` (tom que passa 4,5:1 sobre a página e sobre o suave). Branco sobre `base` é decorativo (ícones com `aria-hidden`).

| Família (apelido) | base | shadow | soft claro / escuro | line claro / escuro | text claro / escuro | Papel |
|---|---|---|---|---|---|---|
| `green` (Oliva) | `#58cc02` | `#46a302` | `#d7ffb8` / `#1d3a17` | `#a5ed6e` / `#5f8428` | `#3f7d12` / `#93d333` | ação, acerto, u1, logotipo |
| `blue` (Céu) | `#1cb0f6` | `#1899d6` | `#ddf4ff` / `#14313f` | `#84d8ff` / `#3f85a7` | `#0f6f9f` / `#49c0f8` | seleção, áudio, aba ativa, microfone, links, u2 |
| `yellow` (Ouro) | `#ffc800` | `#e5a600` | `#fff3bf` / `#33290f` | `#ffe066` / `#4a3c14` | `#8a6200` / `#ffc800` | XP, estrelas, troféu, baú, coroa, combo x5+, barras de missão (reservado a recompensa) |
| `orange` (Chama) | `#ff9600` | `#e68a00` | `#ffe0b3` / `#3a2a10` | `#ffc27a` / `#6b4a12` | `#8a4f00` / `#ff9600` | ofensiva, badge de revisão, u3 |
| `red` (Rubi) | `#ff4b4b` | `#d33131` | `#ffdfe0` / `#40191c` | `#ffb3b3` / `#5f2429` | `#b32a2a` / `#ff7b7b` | erro, corações, apagar progresso, u7 |
| `purple` (Púrpura) | `#ce82ff` | `#a560e8` | `#f3e0ff` / `#2c2140` | `#e3bcff` / `#5b3f80` | `#7b3fd1` / `#c4a8ef` | palavra nova, banner de Missões, u4 |
| `teal` (Nilo) | `#2bb5a3` | `#1f8f80` | `#d6f5f0` / `#143431` | `#9fe3d8` / `#1f5f56` | `#14665b` / `#5fd3c2` | u5, selo de tempo |
| `pink` (Rosa) | `#ff86d0` | `#e86cb7` | `#ffe3f3` / `#3b1f31` | `#ffb8e4` / `#6b3a58` | `#b8307f` / `#ff86d0` | u6 |
| `royal` (Galileia) | `#2f7bf6` | `#1f5fd0` | `#dbe8ff` / `#16264a` | `#9cc0f0` / `#2d4a80` | `#215fcf` / `#6fa5ff` | u8, divisor do Novo Testamento |

Derivados fixos (tokens próprios, não aliases):

| Token | Claro | Escuro | Uso |
|---|---|---|---|
| `--color-primary` | `#58cc02` | `#93d333` | face do botão primário (VERIFICAR, CONTINUAR, COMEÇAR) |
| `--color-primary-shadow` | `#46a302` | `#79b933` | sombra do botão primário |
| `--color-primary-text` | `#ffffff` (exceção de marca, 2,09:1; com "Alto contraste" ligado: `#131f24`, 8,05:1) | `#131f24` (9,29:1) | texto do botão primário |
| `--color-danger` | `#ff4b4b` | `#ee5555` | face do botão de erro (ENTENDI) e do botão "Apagar progresso" |
| `--color-danger-shadow` | `#d33131` | `#c93a3a` | sombra do botão de erro |
| `--color-danger-text` | `#ffffff` (3,30:1, caixa alta 15/800, mesma exceção) | `#131f24` (4,86:1) | texto do botão de erro |
| `--color-accent` | `#1cb0f6` | `#49c0f8` | botão azul (microfone, áudio em caixa) e foco visível |
| `--color-accent-shadow` | `#1899d6` | `#1899d6` | sombra do botão azul |
| `--color-accent-text` | `#ffffff` | `#131f24` | ícone sobre o botão azul |
| `--color-gold-ink` | `#5b4400` | `#5b4400` | texto ou ícone sobre fundo `#ffc800` (5,95:1); branco sobre amarelo é proibido (1,55:1) |
| `--color-streak-off` | `#afafaf` | `#52656d` | chama apagada (ainda não estudou hoje) |
| `--color-heart` | `#ff4b4b` | `#ff4b4b` | coração do HUD (número em `red-text`) |
| `--color-heart-empty` | `#e5e5e5` | `#37464f` | coração vazio |

### 2.3 Paleta dos capítulos (`app/src/core/palette.js`)

Nenhum capítulo é amarelo (amarelo é recompensa). As cores são resolvidas no app por `u.id`; `data.js` mantém o campo `color` atual (`#58a700`, `#7e57c2`, `#e6a817`, `#6a4fb3`, `#8a8a6d`, `#2e9d8a`, `#c0392b`, `#3f7fd6`) apenas para o app clássico. Isso corrige u5 em cinza-oliva `#8a8a6d`, u2 e u4 quase iguais (`#7e57c2` e `#6a4fb3`) e u3 amarelo.

| Capítulo | Família | `--unit-color` | `--unit-shadow` | `--unit-soft` claro / escuro | `--unit-text` claro / escuro | `--unit-ink` | Motivo da medalha |
|---|---|---|---|---|---|---|---|
| u1 A Palavra de Deus (Gênesis 1 a 3) | green | `#58cc02` | `#46a302` | `#d7ffb8` / `#1d3a17` | `#3f7d12` / `#93d333` | `#ffffff` | livro aberto com folha |
| u2 Noé e a arca (Gênesis 6 a 9) | blue | `#1cb0f6` | `#1899d6` | `#ddf4ff` / `#14313f` | `#0f6f9f` / `#49c0f8` | `#ffffff` | arca sobre onda |
| u3 Moisés e o Êxodo (Êxodo 1 a 15) | orange | `#ff9600` | `#e68a00` | `#ffe0b3` / `#3a2a10` | `#8a4f00` / `#ff9600` | `#ffffff` | sarça em chamas |
| u4 Davi (1 Samuel 16 a 2 Samuel 22) | purple | `#ce82ff` | `#a560e8` | `#f3e0ff` / `#2c2140` | `#7b3fd1` / `#c4a8ef` | `#ffffff` | harpa com coroa |
| u5 Os Profetas (Isaías 1 a 12) | teal | `#2bb5a3` | `#1f8f80` | `#d6f5f0` / `#143431` | `#14665b` / `#5fd3c2` | `#ffffff` | rolo de pergaminho |
| u6 José no Egito (Gênesis 37 a 50) | pink | `#ff86d0` | `#e86cb7` | `#ffe3f3` / `#3b1f31` | `#b8307f` / `#ff86d0` | `#ffffff` | espiga de trigo |
| u7 Daniel (Daniel 1 a 6) | red | `#ff4b4b` | `#d33131` | `#ffdfe0` / `#40191c` | `#b32a2a` / `#ff7b7b` | `#ffffff` | leão |
| u8 Jesus e os discípulos (Mateus 4 a 14) | royal | `#2f7bf6` | `#1f5fd0` | `#dbe8ff` / `#16264a` | `#215fcf` / `#6fa5ff` | `#ffffff` | peixe e rede |

Capítulos futuros (u9+) repetem o ciclo a partir de u1. Seções: "Antigo Testamento" (u1 a u7) usa o banner degradê `#58cc02` para `#3f7d12` com ilustração de pergaminho; "Novo Testamento" (u8) usa `#2f7bf6` para `#1f5fd0` com ilustração de rede e peixes (`content.js` já tem `testamentOf`).

```js
// app/src/core/palette.js
export const FAMILIES = {
  green:  { base: "#58cc02", shadow: "#46a302", soft: "#d7ffb8", softDark: "#1d3a17", text: "#3f7d12", textDark: "#93d333", ink: "#ffffff" },
  blue:   { base: "#1cb0f6", shadow: "#1899d6", soft: "#ddf4ff", softDark: "#14313f", text: "#0f6f9f", textDark: "#49c0f8", ink: "#ffffff" },
  orange: { base: "#ff9600", shadow: "#e68a00", soft: "#ffe0b3", softDark: "#3a2a10", text: "#8a4f00", textDark: "#ff9600", ink: "#ffffff" },
  purple: { base: "#ce82ff", shadow: "#a560e8", soft: "#f3e0ff", softDark: "#2c2140", text: "#7b3fd1", textDark: "#c4a8ef", ink: "#ffffff" },
  teal:   { base: "#2bb5a3", shadow: "#1f8f80", soft: "#d6f5f0", softDark: "#143431", text: "#14665b", textDark: "#5fd3c2", ink: "#ffffff" },
  pink:   { base: "#ff86d0", shadow: "#e86cb7", soft: "#ffe3f3", softDark: "#3b1f31", text: "#b8307f", textDark: "#ff86d0", ink: "#ffffff" },
  red:    { base: "#ff4b4b", shadow: "#d33131", soft: "#ffdfe0", softDark: "#40191c", text: "#b32a2a", textDark: "#ff7b7b", ink: "#ffffff" },
  royal:  { base: "#2f7bf6", shadow: "#1f5fd0", soft: "#dbe8ff", softDark: "#16264a", text: "#215fcf", textDark: "#6fa5ff", ink: "#ffffff" },
};
const CYCLE = ["green", "blue", "orange", "purple", "teal", "pink", "red", "royal"];
export function unitFamily(unitId) {
  const n = parseInt(String(unitId).replace(/\D/g, ""), 10) || 1;
  return CYCLE[(n - 1) % CYCLE.length];
}
export function unitPalette(unitId) { return FAMILIES[unitFamily(unitId)]; }
// Variáveis injetadas no <section> do capítulo (Home.jsx) e em qualquer bloco "do capítulo"
export function unitVars(unitId, dark) {
  const p = unitPalette(unitId);
  return { "--unit-color": p.base, "--unit-shadow": p.shadow, "--unit-soft": dark ? p.softDark : p.soft, "--unit-text": dark ? p.textDark : p.text, "--unit-ink": p.ink };
}
```

No `@theme`: `--color-unit: var(--unit-color, #58cc02)`, `--color-unit-shadow: var(--unit-shadow, #46a302)`, `--color-unit-soft: var(--unit-soft, #d7ffb8)`, `--color-unit-text: var(--unit-text, #3f7d12)`, `--color-unit-ink: var(--unit-ink, #ffffff)`. Isso libera `bg-unit`, `text-unit-text`, `border-unit`, `shadow-[0_8px_0_var(--unit-shadow)]`.

### 2.4 Cores do feedback da lição

| Estado | Claro | Escuro |
|---|---|---|
| Painel de acerto | fundo `#d7ffb8`; ícone circular `#58cc02` com check `#ffffff`; título e linha secundária `#3f7d12` (4,55:1) | fundo `#202f36`; ícone `#79b933` com check `#131f24`; título `#79b933` (5,78:1); linha `#93d333` (7,63:1) |
| Painel de erro | fundo `#ffdfe0`; ícone `#ff4b4b` com X `#ffffff`; título e linha `#b32a2a` (5,15:1) | fundo `#202f36`; ícone `#ee5555` com X `#131f24`; título `#ff7b7b` (5,50:1); linha `#ff7b7b` |
| Opção ou peça selecionada | borda `#84d8ff`, fundo `#ddf4ff`, texto `#0f6f9f` | borda `#3f85a7`, fundo `#202f36`, texto `#49c0f8` |
| Opção ou peça certa | borda `#a5ed6e`, fundo `#d7ffb8` (opção) ou `#ffffff` (peça), texto `#3f7d12` | borda `#5f8428`, fundo `#202f36` (opção) ou `#131f24` (peça), texto `#93d333` |
| Opção ou peça errada | borda `#ffb3b3`, fundo `#ffdfe0`, texto `#b32a2a` | borda `#5f2429`, fundo `#202f36`, texto `#ff7b7b` |
| Barra de progresso | trilho `#e5e5e5`; preenchimento `#58cc02`; brilho `rgba(255,255,255,.25)` | trilho `#37464f`; preenchimento `#93d333`; combo x5+: `#ffc800` com faixa `#ffd435` |
| Card de digitação após checar | borda e texto nas cores de certo/errado acima, card inteiro | idem |

### 2.5 Motivos de identidade: Pergaminho e Luz

Pergaminho (`.parchment`): fundo `--color-parchment`, borda 2 px `--color-parchment-line`, raio 16, sombra `0 2px 0 var(--color-parchment-line)` (única sombra permitida em card estático). Sem textura (o `feTurbulence` foi descartado por custo em celulares baixos). Permitido em exatamente cinco lugares, no máximo um por tela: card do versículo (Missões, guia do capítulo, rail desktop), divisor de seção da trilha (ilustração), bênção do Result, capa de história no Hub e hero da ficha de personagem (gradiente inferior para `--color-parchment`).

Luz: `--glow-gold: radial-gradient(closest-side, rgba(255,200,0,.35), rgba(255,200,0,0))` atrás do personagem no Result (320 px, só com precisão igual ou maior que 80%), atrás da chama na StreakScreen e no troféu lendário 5/5; `--glow-ring: 0 0 0 8px rgba(255,200,0,.18), 0 0 32px rgba(255,200,0,.35)` no troféu lendário e na coroa. Duração máxima de 3 s por celebração; no nó lendário é permanente, mas limitado a um nó por trilha.

### 2.6 Raios, bordas e sombras

| Token | Valor | Onde |
|---|---|---|
| `--radius-sm` | 8 px | barras de progresso, lacuna, tooltip, chips pequenos |
| `--radius-md` | 12 px | peças, opções, badge, botão guia, caixa da aba ativa, balão COMEÇAR, toast |
| `--radius-lg` | 16 px | cards, botões 3D, balão de fala, popover, card de digitação, cabeçalho do capítulo, stat cards |
| `--radius-xl` | 24 px | topo de bottom sheets, hero da ficha |
| `--radius-pill` | 999 px | nós, pílulas, avatares, anel |
| borda padrão | 2 px `--color-line` | cards estáticos, balão, opções, peças, campo |
| borda interativa | 2 px + `border-bottom: 4px` | cards clicáveis, opções, peças, células: pressionado vira `border-bottom: 2px` + `translateY(2px)` |
| `--shadow-3d` | `0 4px 0 var(--btn-shadow)` | botões 3D (face 44 ou 48) |
| `--shadow-3d-lg` | `0 7px 0 #1899d6` | botão de microfone 186x80 |
| `--shadow-node` | `0 8px 0 var(--unit-shadow)` | nós da trilha (70 px) |
| `--shadow-parchment` | `0 2px 0 var(--color-parchment-line)` | card Pergaminho |
| sombra difusa | proibida (`shadow-md`, `shadow-lg`, `rgba` difusa) | exceções: scrim, glow de celebração |

Foco visível: `outline: 3px solid var(--color-accent); outline-offset: 2px` (já existe em `index.css:138`; trocar `--color-sky` por `--color-accent`).

### 2.7 Espaçamento e tamanhos fixos

- Grade de 4 px. Gutter de página 16 px (lg 24). Largura de conteúdo 358 px em 390; máximo 600 px centralizado (lição 640); desktop 1152 px em três colunas 256 / 600 / 368 com gap 24.
- Pilha: 8 / 12 / 16 / 24 / 32. Entre seções 24. Entre cards de lista 12. Padding de card 16 (lg 24). Gap entre opções 10; entre peças 8 (x) e 10 (y); entre nós da trilha 24 (lg 28).
- Alvos de toque: mínimo 44 px, preferido 48.
- Alturas fixas: HUD 56 + `env(safe-area-inset-top)`; tab bar 58 + `env(safe-area-inset-bottom)`; cabeçalho do capítulo 84; nó 70 (lg 76) + 8 de sombra; CTA 44 de face + 4 de sombra (lg 46 + 4); rodapé sem feedback 16 + 48 + 16 + safe area; rodapé com feedback 158 (1 botão) ou 214 (2 botões) + safe area; peça 44; opção mínima 56; card de imagem 174x140; célula de pares 166x87 (áudio 166x69); microfone 186x80; stat card 110x92 (Result) e 171x84 (Perfil); avatar 40 / 56 / 72 / 96; ícone 16 / 20 / 24 / 32 / 48 / 64 / 96.
- Z-index: conteúdo 0, cabeçalho do capítulo sticky 20, HUD sticky 30, rodapé da lição 40, tab bar 40, popover 45, toast 50, sheet e modal 60.

### 2.8 Tokens de movimento em CSS (espelho de `core/motion.js`)

```css
--ease-out: cubic-bezier(.22, 1, .36, 1);
--ease-pop: cubic-bezier(.34, 1.56, .64, 1);
--ease-in: cubic-bezier(.4, 0, 1, 1);
--dur-micro: 80ms; --dur-state: 180ms; --dur-panel: 250ms; --dur-screen: 320ms; --dur-complete: 400ms; --dur-celebrate: 900ms; --dur-bounce: 1200ms;
--animate-float: float 1.4s ease-in-out infinite;      /* balão COMEÇAR: y 0 -> -5 -> 0 */
--animate-halo: halo 1.6s ease-in-out infinite;        /* nó atual: pseudo-elemento scale 1 -> 1.18, opacity .45 -> 0 */
--animate-shimmer: shimmer 1.2s linear infinite;       /* barra dourada e faixa Perfeito */
--animate-wave: wavebar .9s ease-in-out infinite;      /* já existe em index.css:123-128 */
```

### 2.9 `index.css` completo (esqueleto Tailwind v4)

```css
@import "tailwindcss";

@theme {
  /* Tipografia */
  --font-sans: "Nunito Variable", "Nunito", "Nunito Fallback", ui-rounded, system-ui, sans-serif;
  --font-logo: "Baloo 2", var(--font-sans);                       /* apenas no wordmark */
  --text-display-lg: 32px; --text-display-lg--line-height: 38px; --text-display-lg--font-weight: 900;
  --text-display: 28px;    --text-display--line-height: 34px;    --text-display--font-weight: 800;
  --text-title: 24px;      --text-title--line-height: 30px;      --text-title--font-weight: 800;
  --text-heading: 19px;    --text-heading--line-height: 26px;    --text-heading--font-weight: 800;
  --text-sentence: 19px;   --text-sentence--line-height: 30px;   --text-sentence--font-weight: 500;
  --text-body: 17px;       --text-body--line-height: 24px;       --text-body--font-weight: 500;
  --text-secondary: 15px;  --text-secondary--line-height: 22px;  --text-secondary--font-weight: 500;
  --text-label: 15px;      --text-label--line-height: 20px;      --text-label--font-weight: 800;   /* caixa alta, tracking 1px */
  --text-caption: 13px;    --text-caption--line-height: 18px;    --text-caption--font-weight: 800; /* caixa alta, tracking .8px */
  --text-numeral: 20px;    --text-numeral--line-height: 24px;    --text-numeral--font-weight: 800;

  /* Neutros */
  --color-page: #ffffff; --color-raised: #f7f7f7; --color-line: #e5e5e5;
  --color-ink: #4b4b4b; --color-ink-soft: #6f6f6f; --color-muted: #6f6f6f; --color-disabled: #afafaf;
  --color-overlay: rgba(0,0,0,.5);
  --color-parchment: #fbf5e6; --color-parchment-line: #ecdfbf; --color-parchment-text: #7a5a16;

  /* Famílias (base, shadow, soft, line, text) */
  --color-green: #58cc02;  --color-green-shadow: #46a302;  --color-green-soft: #d7ffb8;  --color-green-line: #a5ed6e;  --color-green-text: #3f7d12;
  --color-blue: #1cb0f6;   --color-blue-shadow: #1899d6;   --color-blue-soft: #ddf4ff;   --color-blue-line: #84d8ff;   --color-blue-text: #0f6f9f;
  --color-yellow: #ffc800; --color-yellow-shadow: #e5a600; --color-yellow-soft: #fff3bf; --color-yellow-line: #ffe066; --color-yellow-text: #8a6200;
  --color-orange: #ff9600; --color-orange-shadow: #e68a00; --color-orange-soft: #ffe0b3; --color-orange-line: #ffc27a; --color-orange-text: #8a4f00;
  --color-red: #ff4b4b;    --color-red-shadow: #d33131;    --color-red-soft: #ffdfe0;    --color-red-line: #ffb3b3;    --color-red-text: #b32a2a;
  --color-purple: #ce82ff; --color-purple-shadow: #a560e8; --color-purple-soft: #f3e0ff; --color-purple-line: #e3bcff; --color-purple-text: #7b3fd1;
  --color-teal: #2bb5a3;   --color-teal-shadow: #1f8f80;   --color-teal-soft: #d6f5f0;   --color-teal-line: #9fe3d8;   --color-teal-text: #14665b;
  --color-pink: #ff86d0;   --color-pink-shadow: #e86cb7;   --color-pink-soft: #ffe3f3;   --color-pink-line: #ffb8e4;   --color-pink-text: #b8307f;
  --color-royal: #2f7bf6;  --color-royal-shadow: #1f5fd0;  --color-royal-soft: #dbe8ff;  --color-royal-line: #9cc0f0;  --color-royal-text: #215fcf;

  /* Derivados */
  --color-primary: #58cc02; --color-primary-shadow: #46a302; --color-primary-text: #ffffff;
  --color-danger: #ff4b4b;  --color-danger-shadow: #d33131;  --color-danger-text: #ffffff;
  --color-accent: #1cb0f6;  --color-accent-shadow: #1899d6;  --color-accent-text: #ffffff;
  --color-gold-ink: #5b4400; --color-streak-off: #afafaf; --color-heart: #ff4b4b; --color-heart-empty: #e5e5e5;

  /* Capítulo (injetado por style no bloco do capítulo) */
  --color-unit: var(--unit-color, #58cc02); --color-unit-shadow: var(--unit-shadow, #46a302);
  --color-unit-soft: var(--unit-soft, #d7ffb8); --color-unit-text: var(--unit-text, #3f7d12); --color-unit-ink: var(--unit-ink, #ffffff);

  /* Aliases dos tokens antigos (remover no sprint seguinte à migração) */
  --color-brand: var(--color-green-text); --color-brand-bright: var(--color-primary); --color-brand-dark: var(--color-green-shadow);
  --color-brand-shadow: var(--color-primary-shadow); --color-brand-soft: var(--color-green-soft);
  --color-danger-dark: var(--color-danger-shadow);
  --color-sky: var(--color-accent); --color-sky-fg: var(--color-blue-text); --color-sky-soft: var(--color-blue-soft); --color-sky-line: var(--color-blue-line);
  --color-gold: var(--color-yellow); --color-gold-fg: var(--color-yellow-text); --color-gold-soft: var(--color-yellow-soft);
  --color-card: var(--color-page); --color-card-2: var(--color-raised); --color-cream: var(--color-parchment);
  --color-locked: var(--color-disabled); --color-track: var(--color-line); --color-hover: var(--color-raised);
  --color-ok-bg: var(--color-green-soft); --color-ok-soft: var(--color-green-soft); --color-ok-line: var(--color-green-line);
  --color-bad-bg: var(--color-red-soft); --color-bad-line: var(--color-red-line); --color-bad-fg: var(--color-red-text);

  /* Raios, sombras, movimento */
  --radius-sm: 8px; --radius-md: 12px; --radius-lg: 16px; --radius-xl: 24px; --radius-pill: 999px; --radius-card: 16px;
  --shadow-3d: 0 4px 0 var(--btn-shadow, var(--color-primary-shadow));
  --shadow-3d-lg: 0 7px 0 var(--color-accent-shadow);
  --shadow-node: 0 8px 0 var(--unit-shadow, #46a302);
  --shadow-parchment: 0 2px 0 var(--color-parchment-line);
  --shadow-card: none; --shadow-btn: var(--shadow-3d);
  --ease-out: cubic-bezier(.22, 1, .36, 1); --ease-pop: cubic-bezier(.34, 1.56, .64, 1); --ease-in: cubic-bezier(.4, 0, 1, 1);
  --animate-float: float 1.4s ease-in-out infinite;
  --animate-halo: halo 1.6s ease-in-out infinite;
  --animate-shimmer: shimmer 1.2s linear infinite;
  @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
  @keyframes halo { 0% { transform: scale(1); opacity: .45; } 100% { transform: scale(1.18); opacity: 0; } }
  @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
}

@custom-variant dark (&:where(.dark, .dark *));
.dark {
  --color-page: #131f24; --color-raised: #202f36; --color-line: #37464f;
  --color-ink: #f1f7fb; --color-ink-soft: #dce6ec; --color-muted: #8fa3ad; --color-disabled: #52656d;
  --color-overlay: rgba(0,0,0,.6);
  --color-parchment: #1e2a2c; --color-parchment-line: #3a4a4c; --color-parchment-text: #d9c89a;
  --color-green-soft: #1d3a17;  --color-green-line: #5f8428;  --color-green-text: #93d333;
  --color-blue-soft: #14313f;   --color-blue-line: #3f85a7;   --color-blue-text: #49c0f8;
  --color-yellow-soft: #33290f; --color-yellow-line: #4a3c14; --color-yellow-text: #ffc800;
  --color-orange-soft: #3a2a10; --color-orange-line: #6b4a12; --color-orange-text: #ff9600;
  --color-red-soft: #40191c;    --color-red-line: #5f2429;    --color-red-text: #ff7b7b;
  --color-purple-soft: #2c2140; --color-purple-line: #5b3f80; --color-purple-text: #c4a8ef;
  --color-teal-soft: #143431;   --color-teal-line: #1f5f56;   --color-teal-text: #5fd3c2;
  --color-pink-soft: #3b1f31;   --color-pink-line: #6b3a58;   --color-pink-text: #ff86d0;
  --color-royal-soft: #16264a;  --color-royal-line: #2d4a80;  --color-royal-text: #6fa5ff;
  --color-primary: #93d333; --color-primary-shadow: #79b933; --color-primary-text: #131f24;
  --color-danger: #ee5555;  --color-danger-shadow: #c93a3a;  --color-danger-text: #131f24;
  --color-accent: #49c0f8;  --color-accent-text: #131f24;
  --color-streak-off: #52656d; --color-heart-empty: #37464f;
}
/* Preferência "Alto contraste" (state.highContrast): o CTA claro deixa de usar branco */
:root[data-contrast="high"]:not(.dark) { --color-primary-text: #131f24; --color-danger-text: #131f24; --color-ink-soft: #4b4b4b; }

@layer base {
  html { -webkit-tap-highlight-color: transparent; }
  body { @apply bg-page text-ink font-sans antialiased; overscroll-behavior-y: none; }
  button { @apply cursor-pointer select-none; touch-action: manipulation; }
  :focus-visible { outline: 3px solid var(--color-accent); outline-offset: 2px; border-radius: 8px; }
  button:focus:not(:focus-visible) { outline: none; }
  @font-face { font-family: "Nunito Fallback"; src: local("Arial"); size-adjust: 104%; ascent-override: 101%; descent-override: 35%; line-gap-override: 0%; }
}

@layer components {
  .btn-3d { @apply relative rounded-lg font-sans; box-shadow: var(--shadow-3d); }      /* sem :active: o afundamento é do Motion (whileTap) */
  .btn-3d:disabled { @apply cursor-default; box-shadow: none; }
  .btn-cta { @apply h-11 px-6 text-label uppercase tracking-[1px]; }                     /* face 44 + sombra 4 */
  .card { @apply bg-page rounded-lg border-2 border-line; }
  .card-interactive { @apply card border-b-4; }
  .parchment { @apply relative rounded-lg border-2; background: var(--color-parchment); border-color: var(--color-parchment-line); box-shadow: var(--shadow-parchment); }
  .bubble { @apply relative rounded-lg border-2 border-line bg-page; width: fit-content; max-width: 100%; padding: 14px 16px; }
  .bubble::before { content: ""; position: absolute; left: -8px; top: 60%; width: 12px; height: 12px; transform: translateY(-50%) rotate(45deg); background: var(--color-page); border-left: 2px solid var(--color-line); border-bottom: 2px solid var(--color-line); }
  .bubble-bottom::before { left: 50%; top: auto; bottom: -8px; transform: translateX(-50%) rotate(-45deg); border-left: 0; border-top: 0; border-right: 2px solid var(--color-line); border-bottom: 2px solid var(--color-line); }
  .hint { text-decoration: underline dotted 2px var(--color-line); text-underline-offset: 6px; }
  .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; }
}

@keyframes wavebar { 0%, 100% { transform: scaleY(.45); } 50% { transform: scaleY(1); } }
.wave-bar { transform-origin: center; border-radius: 999px; }
.wave-playing .wave-bar { animation: wavebar .9s ease-in-out infinite; }
```

Observações de Tailwind v4: tokens `--text-*` geram utilitários `text-sentence`, `text-caption` etc.; por isso nenhum token de cor usa esses sufixos. `--animate-*` exige os `@keyframes` dentro do `@theme`. Os aliases usam `var()` sem `@theme inline`, para que os overrides do `.dark` continuem valendo em tempo de execução. O `@media (prefers-reduced-motion)` de `index.css:87-88` sai: reduced motion passa a ser tratado por `MotionConfig` e `useReducedMotion()` (seção 7 e 9).

### 2.10 Mapa de migração dos tokens atuais

| Classe/token antigo (`index.css:9-45`) | Novo | Observação |
|---|---|---|
| `brand` (`#58a700`) | `green-text` | texto verde informativo (`#3f7d12`, 5,06:1); `#58a700` só em ícones ou texto de 19 px/700 ou mais |
| `brand-bright` (`#58cc02`) | `primary` | face do CTA; no escuro vira `#93d333` |
| `brand-dark`, `brand-shadow` (`#46a302`, `#3d8c02`) | `green-shadow`, `primary-shadow` | |
| `brand-soft` (`#e7f3d9`) | `green-soft` | |
| `sky`, `sky-fg`, `sky-soft`, `sky-line` | `accent`, `blue-text`, `blue-soft`, `blue-line` | |
| `gold` (`#f5b915`), `gold-fg` (`#7d5c05`), `gold-soft` | `yellow`, `yellow-text`, `yellow-soft` | corrige o 2,73:1 do HUD e o 2,32:1 do título do versículo |
| `danger`, `danger-dark` | `danger`, `danger-shadow` (CTA) ou `red`, `red-shadow` (ícones) | |
| `page` (`#faf6ec`), `card`, `card-2`, `cream` | `page`, `page`, `raised`, `parchment` | o creme só sobrevive como `parchment` |
| `ink` (`#4a4034`), `ink-soft` (`#7a6e58`) | `ink`, `ink-soft` | |
| `line` (`#eae2cf`), `track`, `locked`, `hover` | `line`, `line`, `disabled`, `raised` | |
| `ok-bg`, `ok-soft`, `ok-line`, `bad-bg`, `bad-line`, `bad-fg` | `green-soft`, `green-soft`, `green-line`, `red-soft`, `red-line`, `red-text` | |
| `font-display` (Baloo 2) | `font-sans` (Nunito) | `font-logo` só no wordmark; remover `@fontsource/baloo-2/600.css` e `700.css` de `main.jsx:5-6` |

Procedimento: fase 1 adiciona os tokens novos e os aliases (nenhuma classe quebra); fase 2 troca as classes por codemod (`bg-brand-bright` para `bg-primary`, `text-gold-fg` para `text-yellow-text`, etc.) e remove hex hard-coded em JSX (`#ff9600` em `Lesson.jsx:127-128`, `#5b4400` em `Lesson.jsx:164`, `#a32222` em `Lesson.jsx:191`, `#ffd166` em `Profile.jsx:44`); fase 3 remove os aliases. Regra de lint: proibir `text-[#...]`, `bg-[#...]`, `border-[#...]` fora de `app/src/components/ui/` e `app/src/icons/`.

### 2.11 Contraste medido e verificação automática

Pares aprovados AA (4,5:1 ou mais), medidos com `scratchpad/visual-spec/contrast.py` (fórmula WCAG 2.x):

| Par | Razão | Par | Razão |
|---|---|---|---|
| `#4b4b4b` sobre `#ffffff` | 8,72 | `#f1f7fb` sobre `#131f24` | 15,56 |
| `#6f6f6f` sobre `#ffffff` | 5,02 | `#dce6ec` sobre `#131f24` | 13,27 |
| `#3f7d12` sobre `#ffffff` | 5,06 | `#8fa3ad` sobre `#131f24` | 6,41 |
| `#3f7d12` sobre `#d7ffb8` | 4,55 | `#93d333` sobre `#131f24` | 9,29 |
| `#0f6f9f` sobre `#ffffff` | 5,53 | `#49c0f8` sobre `#131f24` | 8,15 |
| `#0f6f9f` sobre `#ddf4ff` | 4,86 | `#ffc800` sobre `#131f24` | 10,82 |
| `#8a6200` sobre `#ffffff` | 5,49 | `#ff9600` sobre `#131f24` | 7,70 |
| `#8a6200` sobre `#fff3bf` | 4,92 | `#ff7b7b` sobre `#131f24` | 6,70 |
| `#8a4f00` sobre `#ffe0b3` | 5,18 | `#c4a8ef` sobre `#131f24` | 8,16 |
| `#b32a2a` sobre `#ffdfe0` | 5,15 | `#5fd3c2` sobre `#131f24` | 9,27 |
| `#7b3fd1` sobre `#f3e0ff` | 4,87 | `#ff86d0` sobre `#131f24` | 7,66 |
| `#14665b` sobre `#d6f5f0` | 5,90 | `#6fa5ff` sobre `#131f24` | 6,81 |
| `#b8307f` sobre `#ffe3f3` | 4,65 | `#d9c89a` sobre `#1e2a2c` | 8,91 |
| `#215fcf` sobre `#dbe8ff` | 4,72 | `#79b933` sobre `#202f36` | 5,78 |
| `#7a5a16` sobre `#fbf5e6` | 5,85 | `#ff7b7b` sobre `#202f36` | 5,50 |
| `#5b4400` sobre `#ffc800` | 5,95 | `#131f24` sobre `#93d333` | 9,29 |
| `#131f24` sobre `#ee5555` | 4,86 | `#131f24` sobre `#49c0f8` | 8,15 |

Permitidos apenas em texto de 19 px/700 ou maior, 24 px ou maior, ou ícones (3:1 ou mais): `#58a700` sobre `#ffffff` 3,02; `#ea2b2b` sobre `#ffdfe0` 3,46; `#ffffff` sobre `#ff4b4b` 3,30; `#ffffff` sobre `#2f7bf6` 3,97; `#afafaf` sobre `#37464f` 4,45.

Exceções declaradas (decorativo ou marca): `#ffffff` sobre `#58cc02` 2,09 (CTA claro, caixa alta 15/800; a preferência "Alto contraste" troca o texto por `#131f24`, 8,05:1); `#ffffff` sobre `#1cb0f6` 2,44, sobre `#ff9600` 2,18, sobre `#ce82ff` 2,54, sobre `#2bb5a3` 2,55, sobre `#ff86d0` 2,19 (ícones de 32 px sobre nós e títulos de 19 px/800 nos cabeçalhos de capítulo, nunca texto de 13 a 17 px; o estado é sempre dito pelo `aria-label`). `#52656d` sobre `#131f24` 2,75 e `#afafaf` sobre `#ffffff` 2,19 só em texto desabilitado e ícones.

Ferramenta de CI: `app/tools/contrast-check.mjs` lê o `@theme` e o `.dark` de `index.css`, aplica os pares de `app/tools/contrast-pairs.json` (`{ "fg": "ink", "bg": "page" }`, `{ "fg": "green-text", "bg": "green-soft" }`, `{ "fg": "primary-text", "bg": "primary", "large": true }`, ...) nos dois temas e falha abaixo de 4,5:1 (3:1 quando `large: true`). Roda em `npm run check` junto com `tools/content/validate.js`.

---

## 3. Tipografia e escala

### 3.1 Família e entrega

- Família única: Nunito variável, já servida pelo próprio app via `@fontsource-variable/nunito` (`main.jsx:4`), eixo `wght` 200 a 1000, subset latin (cobre o português). É o equivalente livre do DIN Round Pro do Duolingo.
- `app/index.html`: acrescentar `<link rel="preload" as="font" type="font/woff2" crossorigin href="...nunito-latin-wght-normal.woff2">` apontando para o arquivo copiado pelo build (gerar o caminho em `scripts/copy-assets.mjs`), com `font-display: swap`.
- Fallback métrico (evita salto de layout enquanto a fonte carrega): `@font-face { font-family: "Nunito Fallback"; src: local("Arial"); size-adjust: 104%; ascent-override: 101%; descent-override: 35%; line-gap-override: 0%; }` (já no esqueleto da seção 2.9).
- `app/public/sw.js`: a regex de mídia (`sw.js:13`, `/\/(chars|audio|icons)\//`) passa a incluir `fonts` e `assets`, e o `install` pré-cacheia o shell (`index.html`, o woff2 da Nunito e os assets listados em um `precache-manifest.json` gerado no build). Versão do cache: `biblialearn-react-v2`.
- Baloo 2 sai de toda a interface: remover `@fontsource/baloo-2/600.css` e `700.css` de `main.jsx:5-6`; manter apenas `800.css` enquanto o wordmark "BíbliaLearn" for texto. Entrega preferida: wordmark em SVG (`app/src/icons/wordmark.svg`, "Bíblia" em `--color-ink`, "Learn" em `#58cc02`), o que dispensa a Baloo 2 por completo.

### 3.2 Escala

| Token | Tamanho / entrelinha | Peso | Extras | Onde |
|---|---|---|---|---|
| `display-lg` | 32 / 38 | 900 | `tabular-nums` | número do XP no Result, "5" dias de ofensiva, relógio do Madness |
| `display` | 28 / 34 | 800 | | título de aba ("Praticar", "Missões", "Personagens"), nome na ficha e no Perfil |
| `title` | 24 / 30 | 800 | 1 linha, `text-wrap: balance` | título do exercício ("Traduza esta frase:"), elogio do rodapé, título do Result e de sheets |
| `heading` | 19 / 26 | 800 | | título de card ("Missões diárias"), título do capítulo no cabeçalho, pergunta de leitura |
| `sentence` | 19 / 30 | 500 | | frases nos balões, opções, peças, card de digitação, linha secundária do rodapé, texto de leitura |
| `body` | 17 / 24 | 500 (700 em título de linha) | | descrições, títulos de linha (missão, personagem, história), legenda de card de imagem |
| `secondary` | 15 / 22 | 500 (700 quando é metadado forte) | | subtítulos, "@usuario", tradução oculta, referência bíblica |
| `label` | 15 / 20 | 800 | caixa alta, tracking 1 px | CTA, "DEVAGAR", "NÃO POSSO OUVIR AGORA", abas da ficha, balão COMEÇAR |
| `caption` | 13 / 18 | 800 | caixa alta, tracking 0,8 px | "SEÇÃO 1 · CAPÍTULO 2", "FALTAM 11 HORAS", "COMBO x2" (o x em `normal-case`), "PALAVRA NOVA", "USAR TECLADO" |
| `numeral` | 20 / 24 | 800 | `tabular-nums` | HUD, placar, stat cards, contadores |
| pílula de contagem | 11 / 14 | 800 | única exceção abaixo de 13 px, por ser numeral em badge de 18 px | badge vermelho da aba Praticar |

Regras: nada abaixo de 13 px (exceto a pílula); negrito (700 ou mais) só em título, CTA, rótulos em caixa alta, número e palavra-alvo; frases, opções, peças e traduções sempre 500 (o 400 da Nunito fica fino demais em 19 px no escuro quando comparado ao DIN Round de `af04a0f5`); `letter-spacing` só nos rótulos em caixa alta; palavras com dica recebem `.hint` (sublinhado pontilhado 2 px `--color-line` a 6 px da linha de base) sem mudar o peso. Títulos sem emoji. Proibido `text-[9px]` (`Profile.jsx:47`), `text-[11px]` (`App.jsx:108`), `text-xs` em rótulos.

Títulos curtos de exercício (1 linha de 24 px): "Selecione a imagem:", "O que significa?", "Qual destas significa?", "Toque no que escutar:", "Escolha a tradução:", "Digite em inglês:", "Digite o que ouviu:", "Escreva em inglês:", "Traduza esta frase:", "Complete a frase:", "Complete a tradução:", "Repita o que Noé disse:", "Combine os pares:", "Toque no que ouviu e no par:", "Leia e responda:", "Complete a conversa:", "Responda sobre a história:", "Complete o versículo:".

---

## 4. Conjunto de ícones SVG

### 4.1 Estilo e regras

- Arquivo: `app/src/icons/<nome>.jsx` (um componente por ícone) e `app/src/components/Icon.jsx` que mapeia `name` para o componente, mantendo a API `<Icon name size tone className />` usada hoje. `icons.js` (19 ícones de traço) continua carregado pelo alias do Vite para o app clássico, mas o React deixa de usá-lo.
- Grade 24x24, formas preenchidas (sem traço externo), cantos arredondados de 2 px, `stroke-linejoin: round` onde houver traço interno.
- Dois ou três tons por ícone: tom base; tom sombra (15% mais escuro, na metade inferior e direita); brilho (branco a 60% em um único ponto no canto superior esquerdo). Sem gradiente. Variante `mono` (`currentColor`, traço 3 px) para navegação e ações: X, check, setas, bandeira, compartilhar, engrenagem, teclado, olho.
- Tamanhos: 16 (inline em caption), 20 (inline), 24 (HUD, listas, rodapé), 32 (nós, abas), 48 (missões, cards do Hub), 64 (medalhas, empty states), 96 (ilustração de sheet), 120 (empty state grande).
- Acessibilidade: sempre `aria-hidden="true"` e `focusable="false"`; o significado vai em texto `sr-only` ou `aria-label` no elemento pai.
- Lint: regra ESLint local `tools/eslint/no-emoji-jsx.js` falha em qualquer `JSXText`, `Literal` em atributo JSX (`title`, `aria-label`, `placeholder`) ou template literal em JSX que case com `/\p{Extended_Pictographic}/u`. Valores vindos de dados (`o.icon`, `ch.emoji`, `q.icon` em `session.js:24-27`) não são literais JSX e não são bloqueados, mas devem ser renderizados dentro de `<span className="emoji" aria-hidden>` com `font-family: "Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji"` até serem substituídos por ilustrações de 64 a 80 px. O `icon` das `QUESTS` passa a ser um nome de ícone SVG (`bolt`, `book`, `star`, `flame`).

### 4.2 Lista (nome, descrição e tons, onde usar)

| Nome | Descrição e tons | Onde usar |
|---|---|---|
| `flame` | chama: corpo `#ff9600`, miolo `#ffc800`, base `#e68a00`, ponta branca 60% | HUD, Missões (card Ofensiva, missão "Acerte 5 seguidas"), Perfil, StreakWeek, StreakScreen |
| `flame-off` | chama apagada: `#afafaf` e `#e5e5e5` (escuro `#52656d` e `#37464f`) | HUD quando ainda não estudou hoje; empty state de Missões |
| `bolt` | raio: `#ffc800` face, `#e5a600` lateral | XP no HUD, stat card XP, missão "Ganhe XP", placar do Madness |
| `heart`, `heart-empty`, `heart-broken` | coração `#ff4b4b` face, `#d33131` sombra, brilho `#ff8a8a`; vazio contorno `#e5e5e5` (escuro `#37464f`); partido = duas metades em `<g>` separados | HUD, cabeçalho da lição, HeartsSheet (partido 96 px) |
| `infinity` | `#1cb0f6` / `#1899d6` | corações ilimitados na prática |
| `gem` | gema `#1cb0f6`, `#1899d6`, brilho `#84d8ff` | reservado (sem economia de gemas hoje); usado só como moeda voadora opcional do baú |
| `chest`, `chest-open`, `chest-locked` | baú: madeira `#b8743b`, madeira escura `#8a5126`, tampa `#c9843f`, faixas `#ffc800` com `#e5a600`, fecho `#ffc800`; bloqueado em `#afafaf`, `#777777`, `#e5e5e5`; componente `Chest` separa `.lid`, `.body`, `.coin` | trilha (56 px), Missões (40 px), Result (96 px), aba Missões (32 px) |
| `trophy` | troféu `#ffc800`, `#e5a600`, base `#8a6200` | nó de fim de capítulo, fim do Madness, recorde |
| `crown` | coroa `#ffc800`, `#e5a600`, joias `#ff4b4b` e `#1cb0f6` | nível lendário, CrownScreen, Perfil ("3 coroas") |
| `star`, `star-empty` | estrela `#ffc800` com borda `#e5a600`; vazia `#e5e5e5` (escuro `#37464f`) | nó a fazer, Result, popover do nó, Perfil, missão "lição perfeita" |
| `lock` | cadeado `#afafaf` corpo, `#8a8a8a` arco (escuro `#52656d`, `#37464f`) | nó bloqueado, história e cena bloqueadas, personagem não iniciado |
| `check`, `check-circle` | check traço 3 px `currentColor`; círculo `#58cc02` com check `#ffffff` (escuro `#79b933` com `#131f24`) | nó concluído (check branco 32), rodapé de acerto (26), missão resgatada, cena concluída (badge 20) |
| `close`, `close-circle` | X traço 3 px `currentColor`; círculo `#ff4b4b` com X `#ffffff` (escuro `#ee5555` com `#131f24`) | X do cabeçalho (24, `--color-disabled`), rodapé de erro (26), fechar sheet |
| `book`, `book-open` | livro: capa na cor do contexto (`--unit-color` no nó, `#58cc02` fora), páginas `#fff3bf`, lombada mais escura | nó de história, item "curso" do HUD, missão "Complete 2 lições", Hub "Palavras", narrador das histórias |
| `notebook` | caderno branco 90% sobre a face do capítulo | botão guia do `UnitHeader` |
| `speech` | balão de fala branco com rabinho, sombra `#e5e5e5` | nó de cena a fazer, "Situações" no Hub |
| `speaker` | alto-falante `#1cb0f6` (escuro `#49c0f8`), dois arcos como `<path>` separados (acendem em sequência) | balões, células de pares, card de palavra nova, versículo |
| `turtle` | tartaruga `#58cc02`, `#46a302`, casco `#3f7d12` | botão DEVAGAR em caixa (card de palavra nova, guia) |
| `mic` | microfone `#131f24` sobre azul (escuro) ou `#ffffff` (claro) | MicButton, card "Fala" do Hub (azul) |
| `ear-off` | orelha riscada `#afafaf` | sem uso visual direto; reservado para a faixa "escuta pausada" |
| `flag` | bandeira `mono` | reportar exercício (rodapé) |
| `share` | compartilhar `mono` | compartilhar frase (rodapé, `navigator.share`) |
| `arrow-left`, `arrow-right`, `arrow-up`, `chevron-right`, `chevron-down` | setas `mono` traço 3 px | voltar, listas, popover, expandir "Revisão da etapa" |
| `refresh` | círculo `#ff9600` com setas brancas | badge "CORRIJA O ERRO DE ANTES" |
| `sparkle` | brilho de 4 pontas `#ce82ff` com `#e3bcff` | badge "PALAVRA NOVA", baú aberto, missão concluída |
| `home` | casa: telhado `#ff4b4b`, parede `#ffe0b3`, porta `#1cb0f6`, janela `#ffc800` | aba Aprender, sidebar |
| `dumbbell` | haltere: barra `#777777`, discos `#1cb0f6` e `#1899d6` | aba Praticar, sidebar |
| `quest-chest` | o `chest` em 32 px | aba Missões, sidebar |
| `people` | dois bustos `#ff9600` e `#ce82ff` | aba Personagens, sidebar |
| `avatar` | círculo com busto `#58cc02` ou retrato do usuário | aba Perfil, sidebar |
| `gear` | engrenagem `mono` (`#afafaf`) | configurações no Perfil |
| `scroll` | pergaminho `#fbf5e6`, `#ecdfbf`, bastões `#8a6200` | divisor do Antigo Testamento, versículo, medalha u5 |
| `cross-dove` | cruz `#fbf5e6` e pomba branca sobre o degradê | divisor do Novo Testamento |
| `fish-net` | peixe e rede branco | medalha u8 |
| `ark`, `bush`, `harp`, `wheat`, `lion`, `open-book-leaf` | motivos brancos das medalhas u2, u3, u4, u6, u7, u1 | `Medal` 64 px no Perfil e no cabeçalho do capítulo concluído |
| `brand-mark` | livro aberto verde `#58cc02` / `#46a302` com cruz branca e raio de luz `#ffc800` (como nas referências `006a1702` e `2bf4fe01`) | splash, sidebar (28 px), item "curso" do HUD (36x27 em caixa raio 6), ícone PWA |
| `target` | alvo `#ff4b4b` e `#ffffff` | meta diária (Configurações, DailyGoalScreen) |
| `bandage` | curativo `#ffe0b3` com `#ff9600` | Hub "Erros" |
| `headphones` | fone `#1cb0f6` / `#1899d6` | Hub "Escuta" |
| `timer` | relógio `#777777` com ponteiro `#1cb0f6` | selo "60 s" do Madness, "FALTAM 11 HORAS" |
| `calendar` | calendário topo `#ff4b4b`, corpo branco | "VER CALENDÁRIO", Perfil |
| `shield-1` a `shield-6` | escudos de conquista: `#58cc02`, `#ff9600`, `#ffc800`, `#1cb0f6`, `#ce82ff`, `#2bb5a3`, faixa inferior `rgba(0,0,0,.25)` com número | Perfil "Conquistas" (72x80) |
| `medal` | moldura hexagonal na cor do capítulo com motivo branco 32 px; bloqueada `#e5e5e5` com `lock` | Perfil "Capítulos concluídos" |
| `lightbulb` | lâmpada `#ffc800` / `#e5a600` | dica nas cenas (`SceneGap`), guia do capítulo |
| `keyboard`, `puzzle` | `mono` | "USAR TECLADO" / "USAR BANCO DE PALAVRAS" |
| `eye` | `mono` | "VER EM PORTUGUÊS", "VER TRADUÇÃO" |
| `sun`, `moon`, `auto` | `mono` | seletor de tema em Configurações |

Exemplo do estilo (chama, 24x24):

```jsx
export function IconFlame({ size = 24, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={className}>
      <path fill="#ff9600" d="M12 2c1 4 5 6 5 11a5 5 0 0 1-10 0c0-2 .6-3.4 1.6-4.6.4 1.2 1.2 2 2.4 2.4C10.4 8 11.4 5 12 2z" />
      <path fill="#e68a00" d="M12 18a5 5 0 0 0 5-5c0-1.2-.3-2.2-.7-3.1A5 5 0 0 1 12 18z" opacity=".55" />
      <path fill="#ffc800" d="M12 10c.8 2 2.6 3 2.6 5.2a2.6 2.6 0 0 1-5.2 0c0-1.4.8-2.4 1.6-3.2.3.6.7 1 1 1.2z" />
      <circle cx="10.2" cy="14.6" r=".9" fill="#ffffff" opacity=".6" />
    </svg>
  );
}
```

Substituições obrigatórias de emoji na casca (51 linhas em 8 arquivos): `Home.jsx:64-74` (🏆 ⭐ 📖 🔒 nos nós), `Home.jsx:171-173` (🔥 ⚡ ❤️ no HUD), `Home.jsx:119` (💬), `Home.jsx:89-95` (👑), `Home.jsx:178-206` (🏁 🚩), `Lesson.jsx:102` (❤️ 💪), `Lesson.jsx:101` (👑), `Lesson.jsx:128` (↻) e `:133` (✦), `Result.jsx:29-52` (⏱️ 🔥 ✨ 🎁 📋), `Hub.jsx:14-23` e `:117-121`, `Quests.jsx:38-119`, `Profile.jsx:44-130`, `ConfigModal.jsx:42`, `HeartsModal.jsx:14`, `CharacterSheet.jsx:12`, `:72` e `:83`, `Characters.jsx:47`, `WordBank.jsx:137-140` (⌨️ 🧩), `SceneGap.jsx:62-64` (👌), `Toast` e `session.js:231/243` (🔇 🎯 🚩), `CharacterBubble.jsx:33` (😊 🙌 👏 ✨ 😕 viram badges SVG `reaction-happy` e `reaction-sad`).

---

## 5. Especificação de componentes

Todos vivem em `app/src/components/ui/` e importam `SPRING`, `EASE`, `DUR`, `STAGGER`, `SHAKE`, `PULSE` de `app/src/core/motion.js` e `sfx`/`haptic` de `app/src/core/sfx.js` e `app/src/core/haptics.js`. Todo componente interativo expõe os `data-*` da seção 10. Estados listados na ordem repouso, hover (desktop), pressionado, selecionado, certo, errado, desabilitado. Medidas em px para 390 de largura; desktop entre parênteses quando muda.

### 5.1 `Button3D`

Anatomia: face colorida + sombra dura `0 4px 0`. Raio 16. Face 44 (CTA da lição, `.btn-cta`) ou 48 (CTA de tela); largura 100% do contêiner ou conteúdo + 48 de padding. Texto `label` (15/800, caixa alta, tracking 1 px). Ícone opcional 24 à esquerda com gap 8.

| Variante | Face claro / escuro | Texto | Sombra | Uso |
|---|---|---|---|---|
| `primary` | `#58cc02` / `#93d333` | `#ffffff` / `#131f24` | `#46a302` / `#79b933` | VERIFICAR, CONTINUAR, COMEÇAR, INICIAR LIÇÕES |
| `danger` | `#ff4b4b` / `#ee5555` | `#ffffff` / `#131f24` | `#d33131` / `#c93a3a` | ENTENDI após erro, APAGAR |
| `accent` | `#1cb0f6` / `#49c0f8` | `#ffffff` / `#131f24` | `#1899d6` | microfone (186x80, sombra 7), áudio em caixa |
| `on-unit` | `#ffffff` | `--unit-text` (claro) / `--unit-color` (escuro, sobre face branca usar `--unit-text` claro) | `rgba(0,0,0,.18)` | "COMEÇAR +10 XP" dentro do popover colorido |
| `secondary` (outline) | transparente | cor do contexto (`green-text`, `red-text` ou `blue-text`) | borda 2 px na cor + `border-bottom: 4px` na mesma cor | EXPLIQUE MINHA RESPOSTA, PRATICAR PRONÚNCIA, OUVIR A CONVERSA INTEIRA, VER DETALHES, VOLTAR |
| `neutral` | `--color-page` | `--color-blue-text` | borda 2 px + 4 px `--color-line` | "NÃO, OBRIGADO", CANCELAR, ações de card |
| `ghost` | transparente | `--color-muted`, caption 13/800 ou label 15/800 | nenhuma | "NÃO POSSO OUVIR AGORA", "USAR TECLADO", "VER TUDO" |
| `disabled` | `#e5e5e5` / `#37464f` | `#afafaf` / `#52656d` | nenhuma | VERIFICAR sem resposta |
| `icon` | 48x48 ou 40x40, raio 12 | ícone 24 | igual à variante | botão guia do capítulo, áudio da ficha |

Estados: hover (desktop) escurece a face 4% (`brightness(.96)`); pressionado `whileTap={{ y: 4 }}` com `boxShadow` animado para `0 0 0` em 60 ms; soltar com `SPRING.snap`. O `.btn-3d:active` de `index.css:98` é removido (hoje duplica com `whileTap={{ y: 3 }}` de `Lesson.jsx:187`). Sem `scale` em botões 3D. Loading: três pontos de 6 px pulsando. Som: `tap` apenas nas variantes de navegação e modais; VERIFICAR, CONTINUAR, áudio e microfone não tocam nada.

```jsx
<motion.button
  className="btn-3d btn-cta w-full bg-primary text-primary-text disabled:bg-line disabled:text-disabled disabled:shadow-none"
  style={{ "--btn-shadow": "var(--color-primary-shadow)" }}
  whileTap={{ y: 4, boxShadow: "0 0 0 var(--btn-shadow)" }} transition={SPRING.snap} />
```

### 5.2 `PathNode` (nó da trilha)

Botão circular 70 (lg 76), face `--unit-color`, `box-shadow: 0 8px 0 var(--unit-shadow)`, ícone SVG 32 centralizado em `--unit-ink`; área de toque 86x86 (padding transparente). O wrapper mantém `data-node`, `data-order`, `data-current`; o botão é o primeiro `<button>` dentro do wrapper.

| Estado | Face claro / escuro | Sombra | Ícone | Extras |
|---|---|---|---|---|
| `locked` | `#e5e5e5` / `#37464f` | `#afafaf` / `#2b3940` | `lock` `#afafaf` / `#52656d` | sem retrato, sem balão; popover cinza |
| `available` (atual) | `--unit-color` | `--unit-shadow` | `star` (lição), `book` (história), `speech` (cena), `trophy` (fim) | `SegmentRing` + halo + `NodeBalloon` |
| `done` | `--unit-color` | `--unit-shadow` | `check` 32 | estrelas só no popover |
| `scene-done` | retrato `bust` 62 dentro do nó com anel 4 px `--unit-color` | `--unit-shadow` | badge `check-circle` 20 no canto inferior direito | |
| `trophy` (fim do capítulo) | `#ffc800` | `#e5a600` | `trophy` em `#5b4400` | anel de 5 segmentos para as coroas (`unitCrowns`); 5/5: `crown`, `--glow-ring`, selo caption "LENDÁRIO" abaixo |
| `chest` | `Chest` 56 sem círculo, sobre elipse de sombra 48x12 `--color-line` | | | balança a cada 1,6 s quando alcançável |

Halo do nó atual: pseudo-elemento `::after` circular de 86 px atrás do nó, `background: var(--unit-color)`, `--animate-halo` (scale 1 a 1,18, opacity .45 a 0). Nunca `box-shadow` animado.

Press: `whileTap={{ y: 8 }}` + sombra para 0 em 80 ms + `sfx("tap")` + `haptic("select")`. Toque abre o `NodePopover` (não inicia a lição direto como hoje em `Home.jsx:113`). Deslocamento horizontal em ciclo de 8 posições `[0, 44, 70, 44, 0, -44, -70, -44]` reiniciado por capítulo (substitui `Math.sin(i*1.15)*64` de `Home.jsx:103`). `aria-label` = "Lição 2 de 4: Quarenta dias, concluída, 3 de 3 estrelas".

```jsx
<div className="relative z-[1]" style={{ x }} data-node={step.id} data-order={order} data-current={isCurrent || undefined}>
  {isCurrent && <NodeBalloon label={balloonLabel} />}
  {isCurrent && <SegmentRing size={94} stroke={6} gap={4} segments={Math.ceil(total / 5)} value={done / total} />}
  <motion.button data-popover-anchor className={`relative flex h-[70px] w-[70px] items-center justify-center rounded-full ${locked ? "bg-line" : "bg-unit"}`}
    style={{ boxShadow: locked ? "0 8px 0 var(--color-disabled)" : "0 8px 0 var(--unit-shadow)" }}
    whileTap={{ y: 8, boxShadow: "0 0 0 var(--unit-shadow)" }} transition={SPRING.snap} aria-label={label} onClick={openPopover}>
    <Icon name={icon} size={32} className={locked ? "text-disabled" : "text-unit-ink"} />
  </motion.button>
</div>
```

### 5.3 `NodeBalloon` ("COMEÇAR", "RETOMAR", "PRATICAR")

12 px acima do nó, centralizado; fundo `--color-page`, borda 2 px `--color-line`, raio 12, padding 8x14, texto `label` 15/800 em `--unit-text`; seta de 8 px para baixo (quadrado 12 px rotacionado 45° com bordas inferior e direita). Flutua com `--animate-float` (5 px em 1,4 s), nunca `animate-bounce` (`Home.jsx:109` desloca 25% da altura e colide com o nó de cima, medido em `measure.mjs`: `balloonOverlapsAbove = true`). Entra com `scale .8 → 1` `SPRING.pop` 400 ms depois do scroll inicial. Texto: "COMEÇAR", "RETOMAR" (sessão salva em `state.resume`) ou "PRATICAR" (lição concluída). Some (fade 120 ms) enquanto o popover está aberto.

### 5.4 `NodePopover`

Ancorado 12 px abaixo do nó (acima quando faltam menos de 220 px até a tab bar); largura 358 (centro da coluna); raio 16; padding 16; seta de 12 px apontando para o nó; `role="dialog"`, foco no botão. Variante `unit`: fundo `--unit-color`, texto `--unit-ink`, título `heading` 19/800 ("Lição 2 de 4 · Quarenta dias", "Cena: Vem, segue-me", "Troféu do capítulo"), subtítulo `secondary` 15/500 a 85% ("Vocabulário: flood, forty, water, window, rain"; concluída: "3 de 3 estrelas · 93%"), linha de 3 `star` 20 px quando concluída, `Button3D on-unit` 48 px com `data-popover-start`: "COMEÇAR +10 XP", "RETOMAR 4/12" ou "PRATICAR +5 XP". Variante `locked`: fundo `#e5e5e5` / `#37464f`, texto `#6f6f6f` / `#dce6ec`, "Complete os níveis acima para desbloquear", sem botão. Entrada `scale .9 → 1` + fade com `SPRING.pop` (180 ms); saída 120 ms; fecha ao tocar fora, em Escape ou ao rolar 40 px; um aberto por vez; `sfx("tap")` ao abrir.

### 5.5 `UnitHeader` (cabeçalho do capítulo)

Bloco 358x84 (lg 600x92), raio 16, fundo `--unit-color`, padding 16x20, margem lateral 16, sem sombra. Esquerda: linha 1 `caption` 13/800 em `rgba(255,255,255,.8)` "SEÇÃO 1 · CAPÍTULO 2"; linha 2 `heading` 19/800 `--unit-ink` "Noé e a arca" (máximo 2 linhas, `title` no hover). Direita: `Button3D icon` 48x48, raio 12, borda 2 px `rgba(255,255,255,.35)`, fundo `rgba(255,255,255,.12)`, ícone `notebook` 24; abre o `UnitGuideSheet`. `position: sticky; top: calc(56px + env(safe-area-inset-top) + 8px); z-index: 20` dentro do `<section>` do capítulo (o header some com o fim da seção e o próximo entra por baixo); troca de cor por `transition: background-color 250ms`. Substitui o banner de `Home.jsx:129-135` (que fica na base, tem `shadow-md` e emoji).

### 5.6 `SectionDivider` (testamentos) e fim da trilha

Banner 358x120, raio 16, degradê linear 160° (`#58cc02` para `#3f7d12` no Antigo Testamento; `#2f7bf6` para `#1f5fd0` no Novo), ilustração `scroll` ou `cross-dove` 96 px a 30% de opacidade à direita, caption 13/800 branco 80% "SEÇÃO 2", `title` 22/800 branco "Novo Testamento", `Button3D secondary` branco "VER DETALHES" (abre resumo da seção). Fim da trilha: card 358x160 (`.parchment`) com `CharacterStage header` de Pedro e `heading` "Mais capítulos em breve" + `secondary` "Novos capítulos a caminho". Sem caixa tracejada "Continua em breve" (`Home.jsx:178-182`), sem "Comece aqui e suba" (`Home.jsx:203-206`), sem separador em linha de texto (`Home.jsx:191-197`).

### 5.7 `Hud` e `HudPopover`

Barra 56 + safe area, fundo `--color-page`, borda inferior 2 px `--color-line`, `position: sticky; top: 0; z-index: 30`. Sem wordmark no mobile (sai o "BíbliaLearn" 18 px de `Home.jsx:169`). Quatro `HudItem` (botões de 44 px, `justify-between` em 358), cada um com ícone 32 + número `numeral` 17/800 (gap 6) e `aria-label` completo:

| Item | Ícone | Número | Popover |
|---|---|---|---|
| Curso | `brand-mark` 36x27 em caixa raio 6 verde | | "Inglês com a Bíblia · Capítulo 2 de 8" + barra de progresso do curso |
| Ofensiva | `flame` (ou `flame-off` se `state.days[hoje]` for 0) | dias em `--color-orange-text` (escuro `#ff9600`); cinza `--color-disabled` quando apagada | `StreakWeek` + "Pratique hoje para manter a ofensiva" |
| XP | `bolt` | XP em `--color-yellow-text` (`#8a6200` claro, `#ffc800` escuro; corrige o `#7d5c05` de `index.css:21`) | "Hoje: 15 de 20 XP" com barra 16 px + "Total 340 XP" |
| Corações | `heart` (ou `heart-empty` em 0; `infinity` na prática) | em `--color-red-text` | 5 corações 28 px em linha + "Próximo coração em 04:59" (`tabular-nums`) + `Button3D neutral` "Praticar para recuperar" |

`HudPopover`: largura 358, raio 16, borda 2 px `--color-line`, fundo `--color-page`, seta 10 px sob o item, padding 16; entrada `SPRING.pop`. Números com `CountUp` (400 ms) quando mudam; coração do HUD treme ao perder (seção 7). Desktop: o HUD vira a primeira linha do rail direito (sem sticky próprio), corrigindo a caixa colada ao topo de `Home.jsx:168` (`desktop-dark-home-current.png`).

### 5.8 `TabBar` e `Sidebar`

`<nav role="tablist">` fixo embaixo, 58 + safe area, fundo `--color-page`, borda superior 2 px `--color-line`. Cinco `<button role="tab" aria-current="page">` com ícone ilustrado 32 (`home`, `dumbbell`, `quest-chest`, `people`, `avatar`) e `aria-label`; sem rótulo (rótulo 10/700 opcional atrás de preferência). Ativo: caixa 56x44, raio 12, borda 2 px `#84d8ff`, fundo `#ddf4ff` (escuro borda `#3f85a7`, fundo `#202f36`), movida entre abas por `layoutId="tab-active"` com `SPRING.settle`. Inativo: ícone em cores plenas (o estado é dado pela caixa). Toque: ícone `scale [0.9, 1.05, 1]` 200 ms + `sfx("tap")` + `haptic("select")`. Badge `Pill` vermelho 18 px com a contagem de erros pendentes no canto superior direito do ícone Praticar. Substitui `App.jsx:104-112` (rótulos de 11 px, ícones de 20 px, sem `role`).

Sidebar (lg): 256 px, `brand-mark` 28 + wordmark SVG; itens 48 px com ícone 32 + rótulo `secondary` 700 caixa alta tracking 0,8 px em `--color-ink-soft`; ativo com a mesma caixa azul e texto `--color-blue-text`.

### 5.9 `Card`

- `.card`: fundo `--color-page`, borda 2 px `--color-line`, raio 16, padding 16 (lg 24), sem sombra.
- `.card-interactive`: + `border-bottom: 4px`; hover `bg-raised`; `whileTap={{ y: 2 }}` com a borda inferior indo a 2 px; `sfx("tap")`.
- `.parchment`: seção 2.5.
- `card-unit`: fundo `--unit-soft`, borda 2 px `--unit-color` a 40%, faixa esquerda opcional de 8 px.
- `card-hero`: imagem 16:9 ou 1:1 com gradiente inferior `linear-gradient(transparent, var(--color-page))`.
- Entrada em listas: variants `item` (y 16 → 0) com `staggerChildren: STAGGER.cards`.

### 5.10 `ProgressBar`

- Lição: altura 16, raio 8, trilho `--color-line`; preenchimento `--color-primary` com brilho `absolute top-[3px] inset-x-[6px] h-[3px] rounded-full bg-white/25` (substitui o `h-1.5 bg-white/30` de `Lesson.jsx:98`); mínimo visível 4%; largura de x=64 a x=306. Avança no acerto: `progress = (index + (fb && fb.ok ? 1 : 0)) / total` (hoje só avança no Continuar, `Lesson.jsx:68`) com `SPRING.soft` e brilho varrendo o trecho novo (gradiente 40 px, 320 ms). Combo x5 ou mais: preenchimento `#ffc800` com faixa `#ffd435`, `--animate-shimmer` e 3 partículas de chama na ponta (`motion.span` 6 px, y -12, opacity 0, 500 ms, stagger 60). Rótulo `ComboLabel` caption 13/800 sobreposto 4 px acima da barra, centralizado sobre o trecho preenchido, `<span className="normal-case">x</span>`: verde `--color-green-text` de x2 a x4, dourado `#ffc800` a partir de x5 (alinhado ao bônus de `session.js:284`); `key={combo}` com `initial={{ scale: 1.5, y: -6 }}` `SPRING 600/20`. O slot `h-6` de `Lesson.jsx:83` sai.
- Missão e conquista (`labelled`): altura 16, raio 8, trilho `--color-line`, preenchimento `#ffc800`; rótulo "7/10" caption 13/800 centralizado em duas camadas (texto `--color-ink` sobre o trilho e cópia em `#5b4400` recortada à largura do preenchimento); concluída: preenchimento `--color-primary` + `check`. Monta de `width: 0` ao valor em 600 ms `EASE.out`, stagger 80 entre linhas.
- Histórias: 12 px; listas compactas: 8 px.

### 5.11 `SegmentRing`

SVG 94x94 atrás do nó (ou 96 na meta diária, 160 na DailyGoalScreen), traço 6 px (10 na meta), gap 4 px entre a face e o anel, `strokeLinecap="round"`, N segmentos com `stroke-dasharray`; feitos em `--unit-color` (meta: `#ffc800`), restantes em `--color-line`. Nó atual: `segments = Math.ceil(session.exercises.length / 5)` (15 exercícios geram 3 segmentos), preenchido com `index/total` quando há sessão retomável, senão 0. Troféu: 5 segmentos (coroas). Anima `stroke-dashoffset` (ou `pathLength`) de 0 (ou do valor anterior) ao novo em 600 a 900 ms `EASE.out` via `useMotionValue`. Centro opcional com `numeral` ou `check` 32.

### 5.12 `Bubble` (balão de fala)

`.bubble`: `width: fit-content; max-width: 60%` ao lado do personagem (100% quando não há personagem ou na onda), borda 2 px `--color-line`, raio 16, fundo `--color-page`, padding 14x16; rabinho de 12 px à esquerda a 60% da altura apontando para a cabeça (substitui o `bottom: 18px` e o `flex-1` de `index.css:111-112` e `CharacterBubble.jsx:36-40`); variante `.bubble-bottom` (fala, interstício) com rabinho centralizado embaixo. Conteúdo: `AudioButton inline` 26 alinhado à primeira linha com gap 10 + `Sayable` `sentence` 19/500 entrelinha 30; palavras com dica em `.hint` (sublinhado pontilhado cinza, peso igual; substitui o `font-bold border-dashed border-sky-line` de `Sayable.jsx:19-41`), tooltip ao tocar (5.25) e fala da palavra. Variantes de cena: `hero` (fundo `--color-green-soft`, borda `--color-green-line`, raio 16 com canto inferior direito 6) e `other` (fundo `--color-page`, canto inferior esquerdo 6). Variante `wave`: `speaker` 26 + 18 barras de 4 px (gap 3, alturas 6 a 28, raio 2, `#49c0f8` / `#1cb0f6`) com `.wave-playing` enquanto toca; "DEVAGAR" caption 13/800 `--color-blue-text` alinhado à direita 12 px abaixo (toca a 0,75x). Entrada: `scale .9 → 1` com `transformOrigin` no rabinho e `SPRING 400/26`.

### 5.13 `Tile`, `AnswerLines` e `WordBankCore`

Peça: altura 44 (40 + borda inferior 4), raio 12, padding 0 16, `sentence` 19/500 `--color-ink`, borda 2 px `--color-line`, fundo `--color-page`; gap 8 entre peças e 10 entre linhas; banco centralizado (substitui `TILE` de `WordBank.jsx:14` e a cópia em `SceneBuild.jsx:13`: 16/700 e 46 px). `data-tile={w}` preservado. Fantasma: mesma caixa com fundo e borda `--color-line` sólidos, texto transparente, fade 120 ms. Press: `y: 2` + borda inferior 2 px; `sfx("tile", { rate: 1 + 0.04 * posição })`; `haptic("tile")`. Voo: `layoutId` com `transition={{ layout: SPRING.layout }}` (~250 ms); pouso `scale [1, 1.06, 1]` 180 ms. Após checar: peças da resposta `ok` (`border-green-line text-green-text`) ou `bad` (`border-red-line text-red-text`), corrigindo `WordBank.jsx:97-101` que hoje mantém `border-line text-ink`; peças restantes no banco a 50%; `aria-disabled`. `AnswerLines`: duas linhas de 2 px `--color-line` em `top: 44px` e `top: 98px` (passo 54), peças com `items-end` e `gap-y-2.5` assentando a borda inferior sobre a linha (corrige os 6 px de flutuação de `WordBank.jsx:92-104`); `aria-live="polite"` com a frase montada. "USAR TECLADO" / "USAR BANCO DE PALAVRAS" como `Button3D ghost` caption 13/800 com ícone `keyboard`/`puzzle` 16, centralizado 16 px abaixo do banco (sem ⌨️ 🧩 de `WordBank.jsx:137-140`). Um único `WordBankCore` (`bank`, `chosen`, `onChange`, `checked`, `ok`, `prompt` como slot) usado por `WordBank` e `SceneBuild` (resolve o TODO de `SceneBuild.jsx:3-4`).

```jsx
<motion.button layoutId={`tile-${w}-${i}`} data-tile={w} onClick={() => pick(i)} disabled={checked} aria-disabled={checked}
  className={`h-11 rounded-md border-2 border-b-4 px-4 text-sentence ${state === "ok" ? "border-green-line text-green-text" : state === "bad" ? "border-red-line text-red-text" : "border-line text-ink"} bg-page`}
  whileTap={{ y: 2 }} transition={{ layout: SPRING.layout }} onLayoutAnimationComplete={landSquash} />
```

### 5.14 `Option` e `ImageCard`

Opção: altura mínima 56 (52 + 4), raio 12, borda 2 px + 4 px `--color-line`, padding 0 16, `sentence` 19/500 à esquerda; 1 coluna (358) para frases, 2 colunas (174) para palavras soltas; gap 10. `data-opt={i+1}` e `data-value={o.value}` preservados (`Choice.jsx:104`; cenas `shared.jsx:176`). `role="radio" aria-checked` dentro de `role="radiogroup"`. Número de atalho 1 a 4 em caixa 24x24 raio 6 borda 2 px `--color-line` caption 13/800 `--color-disabled` à direita (desktop e cards de imagem; o atalho de teclado já existe em `Lesson.jsx:49-53`).

| Estado | Claro | Escuro |
|---|---|---|
| selected | borda `#84d8ff`, fundo `#ddf4ff`, texto `#0f6f9f` | borda `#3f85a7`, fundo `#202f36`, texto `#49c0f8` |
| correct | borda `#a5ed6e`, fundo `#d7ffb8`, texto `#3f7d12` | borda `#5f8428`, fundo `#202f36`, texto `#93d333` |
| wrong | borda `#ffb3b3`, fundo `#ffdfe0`, texto `#b32a2a` + `SHAKE` | borda `#5f2429`, fundo `#202f36`, texto `#ff7b7b` + `SHAKE` |
| disabled (após checar, não escolhida) | inalterada, `aria-disabled`; em 2 colunas `opacity-70` (não mais `opacity-50`, `Choice.jsx:112-115`) | idem |

Toque: afunda 2 px em 60 ms, volta com `SPRING.snap`, `sfx("select")`, `haptic("select")`; entrada em cascata `STAGGER.options` (y 10 → 0). `ImageCard`: 174x140, raio 16, ilustração 64 a 80 (emoji de conteúdo em `span.emoji` até haver arte), legenda `body` 17/500, número de atalho no canto superior direito (substitui `text-5xl` + legenda 16/700 de `Choice.jsx:110-117`).

### 5.15 `MatchCell`

166x87 (texto) ou 166x69 (áudio: `speaker` 24 + 12 barras de 3 px), raio 16, borda 2 + 4, `sentence` 19/500 centralizado, grid 2 colunas `gap-x-6 gap-y-5` (substitui `min-h-[72px] font-bold gap-3` de `Match.jsx:57-71`). `data-side` e `data-key` preservados. Selecionada: azul como `Option`. Par certo: ambas verdes 300 ms com `scale 1.08` + `sfx("pop", i)` + `haptic("pair")`, depois texto `--color-disabled`, borda `--color-line`, `pointer-events: none`. Par errado: ambas vermelhas + `SHAKE` + `haptic("wrong")`, sem perder coração. No Madness, após o flash, as duas afundam e somem (`scale .9, opacity 0`, 200 ms). 5 pares quando o vocabulário permitir (4 no mínimo); sem botão Verificar funcional: ao fechar todos, rodapé "Fez bonito!" + CONTINUAR; o `explain` "Pares corretos!" de `checker.js:52` é removido.

### 5.16 `AudioButton`

- `inline` (padrão nos balões): 32x32 sem borda nem fundo, glifo `speaker` 26 `--color-accent`, `active:scale-90`; tocando: os dois arcos acendem em sequência (opacity 0 → 1 a cada 180 ms, loop) pelo tempo de `clipDuration`; nunca `animate-pulse` (`AudioButton.jsx:23`, `:55`). Substitui a caixa `rounded-xl border-2 border-b-4 bg-sky-soft` 40/56 px de `AudioButton.jsx:18-27`.
- `boxed`: 64x64 raio 16, fundo `--color-accent`, sombra `0 4px 0 #1899d6`, glifo 32 em `--color-accent-text`; `whileTap y 4`. Só no card de palavra nova, no guia e no versículo.
- `slow`: 44x44 raio 12, fundo `#ffc800`, sombra `#e5a600`, `turtle` 24 `#5b4400` (card de palavra nova); nos balões o DEVAGAR é só texto (5.12).
- `wave`: ver `Bubble wave`; `aria-label="Ouvir"`.
- Nenhum som de interface ao tocar (só a fala).

### 5.17 `MicButton` e `SpeakPrompt`

`MicButton`: 186x80 centralizado, raio 16, fundo `--color-accent`, sombra `0 7px 0 #1899d6`, ícone `mic` 25x35 em `--color-accent-text`; press `y: 7`. Gravando: a face vira `--color-raised` (`#e5e5e5` claro / `#37464f` escuro), o ícone some e 10 pontos de 10 px pulsam em onda (`scale [1, 1.6, 1]`, 600 ms, stagger 60). Sem texto de status antes de gravar (sai "Toque no microfone e fale a frase" de `Speak.jsx:64`). Erro de permissão: faixa de 32 px abaixo do botão, `secondary` `--color-ink-soft`. `SpeakPrompt` (único componente para `speak` e `scene-speak`, substituindo os dois layouts de `Speak.jsx:47-71` e `SceneSpeak.jsx:79-99`): `Bubble bubble-bottom` 240x55 centralizada (speaker inline + frase 19/500 com dicas) acima do `CharacterStage center` 220x300; `MicButton`; sem CTA até falar; `Button3D ghost` "Não posso falar agora" (texto DOM em caixa normal, `uppercase` por CSS) no slot do rodapé 24 px acima da área do CTA; resultado no rodapé "Você falou em inglês!" + tradução 19/500; palavras não reconhecidas em `#ff9600` no balão; tolerância 60% das palavras.

### 5.18 `TextCard` e `Gap`

Card 358x134, borda 2 px `--color-line`, raio 16, fundo `--color-page` (escuro `--color-raised`), padding 16; `<textarea rows={3} data-answer-input>` `sentence` 19/500 sem borda inferior grossa, placeholder "Digite em inglês" em `--color-muted`, foco automático, foco com borda `--color-blue-line`, Enter verifica (substitui o input de 1 linha 358x62 em 18/700 de `TypeInput.jsx:50-63`). Após checar: borda e texto certo/errado no card inteiro. `Gap` (lacuna inline de `missing-word`, `complete-translation`, `verse`, `scene-gap`): `<input type="text" data-answer-input>` com `border-b-2 border-line` sem fundo, largura `max(6ch, (blank.length + 2)ch)`, texto `sentence` na cor do estado (substitui o chip `rounded-lg border-b-4 bg-cream` de `Choice.jsx:85-93` e `SceneMissing.jsx:31-37`); no erro o rodapé mostra a frase completa com a palavra faltante em `font-extrabold underline`. Teclado iOS: usar `100dvh`, `scrollIntoView` no foco e esconder o rodapé `fixed` enquanto `visualViewport.height` for menor que 70% da janela, mostrando VERIFICAR como botão do teclado (`enterKeyHint="done"`).

### 5.19 `FeedbackFooter`

`position: fixed; bottom: 0`, fundo `--color-raised` (escuro) ou `--color-green-soft` / `--color-red-soft` (claro), sem borda nem sombra (sai o `shadow-[0_-6px_24px...]` de `Lesson.jsx:152`), padding 16, altura 158 (1 botão) ou 214 (2 botões) + safe area. Linha 1: `check-circle` / `close-circle` 26 + elogio `title` 24/800 na cor (`#3f7d12` / `#79b933`, `#b32a2a` / `#ff7b7b`) + `share` e `flag` 24 na mesma cor à direita (`share` usa `navigator.share` com frase e tradução; substitui a `FlagButton` cinza de `Lesson.jsx:17-28`). Linha 2: uma única frase `sentence` 19/500 na mesma cor: tradução PT quando o prompt é EN, frase EN quando o prompt é PT; no erro, a frase correta inteira, com a palavra faltante em `font-extrabold underline` nos formatos de lacuna; `diffWords` só em `build`, `listen-build`, `type`, `listen-type` (corrige `Lesson.jsx:173-176`); nunca o rótulo "RESPOSTA CORRETA:"; nunca três linhas repetidas (sai o subtítulo 15/700 + explain 12 px de `Lesson.jsx:162-165` e `:182`); `explain` apenas em `quiz` e `verse` e nunca quando `fb.skipped`; aviso de ortografia como linha 2 ("Atenção à ortografia: created"). Botão `secondary` opcional ("EXPLIQUE MINHA RESPOSTA" quando houver `explain`, "PRATICAR PRONÚNCIA" em build, translate, missing-word, complete-translation e verse) 8 px acima do CTA; CTA "CONTINUAR" (acerto) ou "ENTENDI" `danger` (erro). Elogios de até 22 caracteres (`PRAISES` de `util.js:84` + "Fez bonito!", "Você escreve tão bem!", "Sem comentários, só elogios!" como exceção de 2 linhas). Mede a própria altura com `ResizeObserver` e publica `--footer-h` no `<main>`; o contêiner do exercício usa `style={{ paddingBottom: "calc(var(--footer-h) + 16px)" }}` (substitui o `pb-44` de `Lesson.jsx:107`, que reserva 176 px para um rodapé de 193 a 230 px). Ao checar, `scrollIntoView({ block: "nearest" })` no elemento respondido (nas cenas `block: "end"`). Entrada `y 28 → 0` `SPRING.footer`; erro com `x [0,-4,4,0]` 250 ms (seção 7).

### 5.20 `CharacterStage`, `CharFace` e `Avatar`

Ativos novos em `chars/v2/<key>/`: `bust.webp` (512x512, fundo transparente, busto com ombros, olhos a 40% da altura, 8% de folga acima da cabeça), `full.webp` (600x1000, corpo inteiro ou 3/4 em pé, pés na base), `full-happy.webp`, `full-sad.webp`, `mouth-open.webp` (mesmo quadro de `full` com a boca aberta), `hero.webp` (1200x900, 4:3, com cenário). Estilo: o cartoon pintado dos 47 JPG atuais (`chars/*.jpg`, 360x249, referência `006a1702`), com paleta de roupa alinhada à família do capítulo (Noé em azuis, Moisés em terracota, Davi em roxo e dourado, José em rosa e ocre, Daniel em vermelho escuro, Jesus em branco com faixa `#c62828`), iluminação do alto à esquerda, sem fundo, sem texto. Prioridade: os 22 personagens de `UNIT_CAST` (`characters.js:295-304`) e os 4 narradores mais usados; extras das cenas (`SCENE_EXTRAS`, hoje em emoji) recebem busto genérico por função antes de arte individual. Um script de validação mede a caixa de alfa e a linha dos olhos.

`CharacterStage` posiciona `full.webp` e uma elipse de sombra desenhada pelo app (`--color-line`, 85x24, 6 px sobrepostos aos pés):

| Variante | Tamanho | Uso |
|---|---|---|
| `side` | 110x180 à esquerda (x = 16), imagem ~92x174 ancorada na base; balão a partir de x = 150 | lição (formatos com frase) |
| `center` | 220x300 centralizado, elipse 170x40; balão `bubble-bottom` acima | fala |
| `peek` | 160x260 ancorado à direita com 40% fora da tela, `rotate -10 → -4` | interstício de revisão |
| `result` | 180x300 centralizado, pose `happy`, `--glow-gold` atrás | Result, fim de história |
| `header` | 96x160 à direita do título | Hub, guia do capítulo, fim da trilha |
| `trail` | 140 px encostado ao lado oposto do deslocamento | trilha, a cada 4 ou 5 nós |

Props: `pose` (`neutral` / `happy` / `sad`), `talking` (alterna `mouth-open` a 8 fps; sem o ativo, anima `y [0,-2,0]` + `scale [1,1.04,1]` a cada 500 ms), `reaction` (badge SVG 28 px `reaction-happy`/`reaction-sad` fora do recorte, `SPRING.pop`). Estados: `idle` (respiração `scale [1,1.015,1]` 3 s), `happy` (`y [0,-10,0]` 380 ms), `sad` (`SHAKE`), `celebrate` (`SPRING.bounce`, `rotate -8 → 0`, `y -16 → 0`). Fallback automático: sem `full.webp`, usa `bust.webp` em círculo de 96 com borda 2 px `--color-line`; sem `bust.webp`, usa o JPG atual com `object-position: center 22%` e anel de 3 px. Nunca a legenda com o nome (o título já nomeia; sai `CharacterBubble.jsx:34`).

`CharFace`/`Avatar` (círculo): 24 (inline), 40 (chat das cenas, História), 56 (listas), 72 (elenco da cena), 96 (Perfil, fallback), com `object-cover` e `object-position: center 40%`; anel opcional 3 ou 4 px em `--unit-color` (conhecido) e badge `check-circle` 20 no canto inferior direito; bloqueado: círculo `--color-line` com `lock` (sem `grayscale` de retrato, `Home.jsx:68`). O badge de reação fica em um wrapper externo `relative`, fora do `overflow-hidden rounded-full` de `CharFace.jsx:5`. Iniciais em Nunito 800 sobre `--unit-soft` quando não há imagem.

### 5.21 `StatCard` e `CountUp`

110x92 (3 em linha com gap 14 no Result) ou 171x84 (grid 2x2 no Perfil); raio 16; borda 2 px na cor do cabeçalho; cabeçalho 24 px na cor com caption 13/800 (`#131f24` sobre amarelo, branco sobre azul e verde): "XP", "TEMPO", "PRECISÃO" (ou "ÓTIMO"/"BOM"); corpo fundo `--color-page` com ícone 20 + número `numeral` 20/800 `--color-ink` via `CountUp`. Cores: XP `#ffc800`, tempo `#1cb0f6`, precisão `#58cc02`, ofensiva `#ff9600`, coroas `#ffc800`, estrelas `#ffc800`. Entrada em cascata `STAGGER.cards` com `SPRING.pop` e `sfx("pop", i)` no início de cada.

```jsx
export function CountUp({ to, duration = 0.8, delay = 0, format = (v) => v }) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(reduce ? to : 0);
  const text = useTransform(mv, (v) => format(Math.round(v)));
  useEffect(() => { if (reduce) { mv.set(to); return; } const c = animate(mv, to, { duration, delay, ease: "easeOut" }); return () => c.stop(); }, [to]);
  return <motion.span className="tabular-nums">{text}</motion.span>;
}
```

### 5.22 `Chest`

SVG em partes (`.body`, `.lid` com `transform-origin` na dobradiça, `.lock`, 8 `.coin` ocultas): 56 na trilha, 40 nas missões, 96 no Result. Estados: `locked` (cinzas), `ready` (idle `rotate [0,-6,6,-4,4,0]` 600 ms com `repeatDelay 1.6` + brilho pulsante `#fff3bf`), `opening` (sequência da seção 7), `opened` (tampa aberta, rótulo "+N XP"). Recompensa mínima 2 XP (sessão) ou 5 XP (trilha), persistida em `state.chests[id]` (`store.js:27`). Som `sparkle` + `coin`; `haptic("chest")`; confete pequeno com `origin` no centro do baú (`getBoundingClientRect`). Substitui o botão de texto "🎁 Abrir baú" de `Result.jsx:39-41`.

### 5.23 `Sheet` e `Modal`

Sheet (padrão mobile): overlay `--color-overlay` (fade 150 ms); painel ancorado embaixo, raio superior 24, fundo `--color-page`, alça 36x4 raio 2 `--color-line` (escuro `#52656d`) a 8 px do topo, padding 24 16 `calc(16px + env(safe-area-inset-bottom))`, `max-height: 92dvh` com rolagem interna; entra `y 48 → 0` `SPRING.sheet` (250 ms); sai `y 32` + fade 160 ms; `drag="y" dragConstraints={{ top: 0 }}` e fecha ao arrastar mais de 120 px ou com velocidade maior que 600; Escape fecha; `role="dialog" aria-modal="true"`; foco preso; CTA fixo no rodapé do sheet quando houver. Em lg vira `Modal` centralizado 480, raio 24, `scale .88 → 1` + `y 24 → 0` `SPRING 320/24`, saída 120 ms. Usado por `HeartsSheet`, `CharacterSheet`, `UnitGuideSheet`, `ConfirmSheet`, baú das missões, calendário da ofensiva. Os pais usam `AnimatePresence` (hoje `Characters.jsx` e `Profile.jsx` não usam, `CharacterSheet.jsx:44` e `ConfigModal.jsx:39` só têm entrada).

### 5.24 `Snackbar` e `LessonBanner`

Snackbar: `position: fixed; bottom: calc(80px + env(safe-area-inset-bottom))`, centrado, largura máx. 360, raio 12, fundo `#4b4b4b` texto `#ffffff` (escuro fundo `#f1f7fb` texto `#131f24`), padding 12 16, ícone SVG 20 + texto `secondary` 700; entra `y 16 → 0` + `scale .9 → 1` `SPRING.footer`; fica 1600 + 40 ms por caractere (máx. 3200); sai `y 8` + fade 150 ms; uma visível por vez (fila); `haptic("toast")`. Substitui o `fixed top-4` com `shadow-lg` de `Toast.jsx:3-5` e o timer fixo de `App.jsx:56-57`. Dentro da lição não aparece: avisos leves ("Exercícios de escuta pausados por 15 min") viram `LessonBanner`, faixa de 32 px abaixo do cabeçalho (fundo `--color-raised`, caption 13/800, 1,6 s, sem emoji); eventos grandes disparados durante a lição (missão concluída, `session.js:64`) entram em `session.pendingCelebrations` e aparecem como `MissionScreen` no pipeline pós-lição.

### 5.25 `HintTooltip`

Ancorado 8 px acima da palavra, fundo `#4b4b4b` texto `#ffffff` (escuro `#f1f7fb` / `#131f24`), raio 8, padding 6 10, `secondary` 15/700 (tradução) + 13/500 opcional (classe gramatical), seta 8 px; entra `SPRING.pop`; fecha ao tocar fora ou após 2,5 s; um por vez; fala a palavra ao abrir.

### 5.26 `Badge`, `Pill` e `Chip`

- `Badge` de estado (acima do título do exercício, 16 px abaixo da barra, empurra o título 36 px): ícone circular 24 + caption 13/800; `review`: `refresh` `#ff9600` + texto `--color-orange-text` "CORRIJA O ERRO DE ANTES"; `new-word`: `sparkle` + fundo `--color-purple-soft`, texto `--color-purple-text` "PALAVRA NOVA"; `legendary`: `#ffc800` com `#5b4400`; `timer`: `--color-teal` "60 s"; entrada `x -8 → 0` + fade 180 ms.
- `Pill` de contagem: 18 px, raio 9, `#ff4b4b` texto `#ffffff` 11/800 (erros no Hub e na aba Praticar).
- `Chip` de vocabulário (cenas, guia, versículo): 44 px, raio 12, borda 2 + 4, ícone 24 + EN `body` 17/700 + PT caption 13/500 `--color-ink-soft`; toque fala com a voz do herói; `whileTap y 2`.

### 5.27 `Toggle`

50x30, raio 15; trilho `--color-line` → `--color-primary`; knob 26 px branco com sombra `0 2px 0 rgba(0,0,0,.15)`, deslocamento por `layout` com `SPRING.snap`; `role="switch" aria-checked`; `sfx("tap")` + `haptic("select")`. Substitui o `<input type="checkbox" className="h-6 w-11 accent-brand-bright">` de `ConfigModal.jsx:65`.

### 5.28 `QuestRow` e `QuestBar`

Linha 64 px: ícone ilustrado 48 (`bolt`, `book`, `star`, `flame`), título `body` 17/700, `ProgressBar labelled` 16 px "7/10", `Chest` 40 no fim (cinza fechado; concluída e não resgatada: dourado balançando; toque abre com confete e "+5 XP" subindo; resgatada: `check-circle` verde). Substitui as barras `h-2` sem número e o texto "+5" de `Quests.jsx:56-71`.

### 5.29 `StreakWeek` e `Flame`

`Flame` 48 a 160 px com glow pulsante (`--glow-gold` + `box-shadow 0 0 32px 8px rgba(255,150,0,.35)`, 1,6 s) quando a ofensiva aumentou hoje; número `display-lg`. `StreakWeek`: 7 colunas, rótulos caption 13/800 (S T Q Q S S D); dia estudado = `flame` 20 em círculo 32 `--color-orange-soft`; hoje não estudado = anel pontilhado 2 px `#ff9600`; passado não estudado = círculo `--color-line`; futuro = `--color-line` a 55%. Dias preenchem em cascata de 80 ms ao montar. Substitui as marcas "✓ ★ 🔒 ·" e o `animate-pulse bg-gold` de `Quests.jsx:97-111`.

### 5.30 `Medal`, `Shield` e `EmptyState`

`Medal` 64 px hexagonal (`clip-path` já usado em `Profile.jsx:123-130`) em `--unit-color` com motivo branco 32 (livro, arca, sarça, harpa, pergaminho, trigo, leão, peixe); bloqueada `--color-line` com `lock`; pop `SPRING.pop` ao desbloquear. `Shield` 72x80 (conquistas): escudo na cor própria, número do nível em faixa inferior 20 px `#ffffff` sobre `rgba(0,0,0,.25)` 15/800 (substitui o quadrado dourado com "NÍVEL 2" em 9 px de `Profile.jsx:44-49`). `EmptyState`: ilustração 120 (personagem `bust` feliz ou ícone 96 da família), `heading` 19/800, `secondary` 15/500 `--color-ink-soft` centralizados, `Button3D primary` opcional. Textos: Missões zero "Faça sua primeira lição para acender a chama"; Hub sem erros, card verde "Nenhum erro pendente. Parabéns!"; Perfil novo "Conclua o Capítulo 1 para ganhar sua primeira medalha".

---

## 6. Blueprint de cada tela e de cada formato de exercício e cena

### 6.1 Home: trilha (`screens/Home.jsx`)

Ordem, de cima para baixo (inverte `rows.reverse()` de `Home.jsx:84` e `unitsRev` de `Home.jsx:162`): `Hud` sticky → `SectionDivider` "SEÇÃO 1 · Antigo Testamento" → Capítulo 1 (`UnitHeader` sticky + nós) → ... → Capítulo 7 → `SectionDivider` "SEÇÃO 2 · Novo Testamento" → Capítulo 8 → card "Mais capítulos em breve" → espaço de 96 px para a tab bar. Removidos: CTA fixo (`Home.jsx:226-233`), caixa tracejada "Continua em breve" (`:178-182`), "Comece aqui e suba" (`:203-206`), SVG de caminho `TrailNodes` (`:23-62`, opacidade 0,25), pílula "👑 Subir de nível" (`:89-95`), chip 💬 (`:119`) e `StarRow` sob os nós (`:120-122`).

Capítulo: `<section style={unitVars(u.id, isDark)} className="[content-visibility:auto] [contain-intrinsic-size:0_1100px]">` com `UnitHeader` 84 px (margem 16) e coluna de `PathNode` com gap 24 e deslocamento em ciclo de 8; os 4 nós de lição (3 lições + Revisão) e as 6 cenas do capítulo seguem a ordem de `unitSteps(u)`; a cada 3 ou 4 nós um `Chest` 56 no lado oposto ao deslocamento (+5 XP, `state.chests[u.id + ":" + idx]`); a cada 4 ou 5 nós um personagem de `UNIT_CAST[u.id]` como `CharacterStage trail` 140 px no lado oposto (`whileInView` fade + y 12, `once: true`); o último nó é o `PathNode trophy`. Capítulos fora da viewport renderizam só o cabeçalho e um placeholder de altura `nós × 94` até entrarem (`IntersectionObserver`), para manter 60 fps nos 80 nós (hoje 8734 px de altura).

Hierarquia: o nó atual é o único elemento com cor saturada + anel + halo + balão; concluídos têm a cor do capítulo com check; bloqueados são cinza. Cenas se diferenciam pelo ícone `speech` (a fazer) ou pelo retrato com anel (concluída). Estrelas e precisão só no popover e no guia.

Comportamento: ao montar, `scrollTo` sem animação até o nó atual ficar a 35% da altura da viewport (`el.getBoundingClientRect().top - window.innerHeight * 0.35`, não `block: "center"` de `Home.jsx:158`); ao voltar do Result, `behavior: "smooth"`. Toque no nó abre `NodePopover`; o botão do popover (`[data-popover-start]`) chama `startLesson`. Atalho opcional: pílula 48 px à direita "Retomar · 4/12" que aparece só quando o nó atual não está visível (`IntersectionObserver`). Pós-lição: seção 7.3 ("Trilha").

`UnitGuideSheet` (botão guia): título do capítulo e referência ("Noé e a arca · Gênesis 6 a 9"), "Vocabulário" (chips 44 px com áudio agrupados por lição: ark, wood, animals, door...), "Versículo do capítulo" (card `.parchment` com áudio), "Personagens" (avatares 56 com nome), "Dicas" (3 bullets); CTA "CONTINUAR CAPÍTULO".

Desktop (lg): grid 1152 em 3 colunas: `Sidebar` 256, centro 600 (mesma trilha, headers sticky, nós 76), rail 368 `sticky top-6` com linha HUD, card "Missões do dia" (3 `QuestRow` compactos + "VER TODAS"), card `.parchment` "Versículo do dia" (17/500 itálico + referência 15/700 + áudio) e card "Ofensiva" (`StreakWeek`). Corrige o rail não sticky de `Home.jsx:210` e a caixa do HUD colada ao topo (`Home.jsx:168`).

### 6.2 Lição: casca comum (`screens/Lesson.jsx`)

Cabeçalho (`pt-2`, sem slot de combo): X `close` 24 traço 3 `--color-disabled` em área 44x44 (`-ml-2`, substitui `p-1 text-xl` de `Lesson.jsx:92`), `ProgressBar` 16 px de x=64 a x=306, `heart` 24 + número 17/800 `--color-red-text` (ou `infinity`; pílula "Nível 3" caption em `yellow-soft` quando `levelUp`). `ComboLabel` sobreposto. `Badge review` ou `new-word` 16 px abaixo da barra quando houver. Título `title` 24/800 em 1 linha, 20 px abaixo (textos da seção 3.2).

Área do exercício: `<div className="relative" style={{ paddingBottom: "calc(var(--footer-h) + 16px)" }}>`; `AnimatePresence mode="popLayout" initial={false}` com `key={session.index + ":" + ex.type}` (seção 7.5); cabeçalho e rodapé fora da animação; rodapé volta a "VERIFICAR" com 120 ms de atraso. `CharacterStage side` + `Bubble` nos formatos com frase; o personagem fala (`talking`) 200 ms após a entrada e reage no feedback. `PracticeBar` (`PracticeBar.jsx`, pills "Ouvir / 🐢 / Falar" em 12 formatos) sai do fluxo: "Ouvir/Devagar" vivem no prompt e "Falar" vira `Button3D secondary` "PRATICAR PRONÚNCIA" no rodapé pós-checagem.

Rodapé sem feedback: fundo `--color-page`, sem borda; slot de 36 px para o link ghost ("NÃO POSSO OUVIR AGORA" em `listen*`, "NÃO POSSO FALAR AGORA" em `speak`) centralizado 24 px acima do CTA (sai o `mt-10` abaixo das opções de `Lesson.jsx:139-143`); CTA 44 + 4 (`disabled` cinza); margem inferior 16 + safe area. Rodapé com feedback: `FeedbackFooter` (5.19).

### 6.3 Formatos de exercício (22)

1. `image-choice` ("Selecione a imagem:"): balão com a palavra EN 19/500 + `AudioButton inline` (toca ao entrar); grade 2x2 de `ImageCard` 174x140; ao checar, só a escolhida muda (correta acende verde como opção pedagógica mantida).
2. `choice-en-pt` ("O que significa?"): balão com a palavra EN + áudio; `Option` 1 coluna 358x56; tocar opção EN fala.
3. `choice-pt-en` ("Qual destas significa?"): balão com a palavra PT + ícone 24 (sem áudio); `Option` 1 coluna.
4. `listen` ("Toque no que escutar:", palavra): `Bubble wave` + "DEVAGAR"; autoplay; `Option` em 2 colunas 174x56; link ghost no rodapé.
5. `listen-choice` (frase): igual, `Option` em 1 coluna.
6. `type` ("Digite em inglês:"): balão PT + ícone; `TextCard` 358x134 com foco automático; Enter verifica; aviso de ortografia como linha 2 do rodapé.
7. `listen-type` ("Digite o que ouviu:"): `Bubble wave` + DEVAGAR; `TextCard`; sem ícone duplicado no título (`TypeInput.jsx:71`).
8. `build` ("Escreva em inglês:"): `CharacterStage side` + `Bubble` com a frase PT (dicas pontilhadas); `AnswerLines` 24 px abaixo do balão; banco de `Tile` centralizado; "USAR TECLADO" 16 px abaixo do banco. Exemplo real: "Deus criou o céu e a terra" → `God created the heaven and the earth` (u1l1).
9. `translate-en-pt` ("Traduza esta frase:"): igual ao `build` com a frase EN no balão (áudio inline) e peças em PT.
10. `listen-build` ("Toque no que escutar:"): igual ao `build` com `Bubble wave` + DEVAGAR e link ghost no rodapé.
11. `missing-word` ("Complete a frase:"): `CharacterStage side` + balão PT; card 358x134 com a frase EN e `Gap` sublinhado (6 a 10 ch); 3 `Option` 56 px em 1 coluna (a escolhida preenche a lacuna).
12. `complete-translation` ("Complete a tradução:"): igual com `Gap` como input inline (foco ao entrar). Referência `bed6c88f`: "I am camp____ with my family."
13. `speak` ("Repita o que Noé disse:"): `SpeakPrompt` (5.17).
14. `match` ("Combine os pares:"): 5 pares (4 se o vocabulário for menor), `MatchCell` 166x87, gaps 24/20; auto-check ao fechar todos com "Fez bonito!".
15. `listen-match` ("Toque no que ouviu e no par:"): células de áudio 166x69 com `speaker` + 12 barras à esquerda, texto à direita.
16. `verse` ("Complete o versículo:"): card `.parchment` 358 com o versículo 19/500 entrelinha 30 e `Gap` sublinhado; referência 15/500 `--color-parchment-text` abaixo ("Gênesis 7:12"); 4 `Chip` 44 px em linha (quebra em 2 linhas). Exemplo: "And the ____ was upon the earth forty days and forty nights." com `rain`, `sun`, `wind`, `fire`.
17. `read` ("Leia e responda:"): card 358 com texto EN 19/500 (dicas), link caption "VER EM PORTUGUÊS" (expande), linha de 2 px, pergunta `heading` 19/800; `Option` 1 coluna.
18. `dialogue` ("Complete a conversa:"): `CharacterStage side` + balão (áudio automático) e 3 `Option`; ao acertar, a opção é falada pela voz do personagem.
19. `quiz` ("Responda sobre a história:"): igual ao `dialogue` com `explain` permitido no rodapé.
20. `word-card` (novo, `silent: true`, gerado pelo `builder.js` antes do primeiro teste de cada `newWord`; referência `51a0685b`): `Badge new-word`; card 358 raio 16 com ilustração 120 (emoji do vocabulário em `span.emoji` 96 até haver arte), EN 32/800 (`earth`), PT 18/500 (`terra`), linha pontilhada `--color-line`, frase de exemplo `Sayable` 19/500 (`God created the heaven and the earth`) + tradução 15/500; abaixo do card `AudioButton boxed` 64 + `slow` 44 centralizados com gap 16; áudio toca ao entrar; CTA "CONTINUAR". O badge "NOVA PALAVRA" de `Lesson.jsx:131-136` permanece no primeiro teste.
21. Interstício de revisão (`[data-interstitial]`): tela vazia com `Bubble` 220 px (19/500, entrelinha 28, padding 20, rabinho à direita) "Vamos corrigir os exercícios que você errou!" aparecendo 150 ms depois do personagem; `CharacterStage peek` do narrador entrando pela borda direita (`x 120 → 0`, `rotate -10 → -4`, `SPRING 220/14`), pose `happy`, `talking` enquanto toca `sfx("start")`; rótulo de combo escondido; CTA "CONTINUAR". Substitui o círculo de 128 px rotacionado e cortado de `Lesson.jsx:109-120`.
22. Cenas (`scene-*`, modelo Stories):
    - `scene-intro`: card com título 24/800 ("Vem, segue-me"), situação caption `--color-blue-text` ("SITUAÇÃO · Convidar alguém e responder ao convite"), elenco em `Avatar` 72 (herói com anel verde, outro com anel azul) ligados por `arrow-right` 24 `--color-ink-soft`, contexto 17/500, referência 15/500, `Chip`s de vocabulário (voz do herói); CTA "COMEÇAR A CENA".
    - `scene-read`: chat com `Avatar` 40, nome caption 13 `--color-ink-soft` só na troca de falante, fala 19/500 com karaokê (tokens ficam `--color-accent` conforme `clipDuration` proporcional ao tamanho das palavras, ou os cortes de `audio/words.json` quando houver), tradução 15/500 revelada ao tocar; falas antigas ficam acima com rolagem (sem colapsar em "▲ 2 falas anteriores"); CONTINUAR habilita só ao fim do áudio (toque no balão repete). Corrige `SceneRead.jsx:19-45` (500 px vazios, CTA antes do áudio).
    - `scene-missing`, `scene-listen`, `scene-reply`: `Bubble hero` com lacuna sublinhada ou "···"; `Option` 1 coluna 56; ao acertar, a fala é revelada e tocada; ao checar, `scrollIntoView({ block: "end" })` da opção escolhida (corrige a opção escondida atrás do rodapé em `scene-reply-ok.png`).
    - `scene-build`, `scene-gap`: `WordBankCore` e `TextCard`/`Gap` com a `Bubble hero` como prompt (um só banco, uma só zona de resposta); dica com `lightbulb` em vez de "👌".
    - `scene-speak`: `SpeakPrompt` com a bolha da cena.
    - `scene-truth`: card `.parchment` "O QUE ACONTECEU DE VERDADE" caption `--color-blue-text` + texto 17/500 + referência; chips praticados; `Button3D secondary` "OUVIR A CONVERSA INTEIRA"; CTA "CONCLUIR CENA".

### 6.4 Resultado e cerimônias pós-lição (`screens/Result.jsx` + telas novas)

Pipeline em `App.jsx` com `AnimatePresence mode="wait"` por `step`: Result → `StreakScreen` (se a ofensiva aumentou nesta lição) → `DailyGoalScreen` (se bateu a meta nesta lição) → `CrownScreen` (se `levelUp`) → `MissionScreen` (uma por item de `session.pendingCelebrations`) → Home. Cada tela tem CTA `Button3D primary` com texto DOM "Continuar", atributo `data-ceremony="streak|goal|crown|mission"`, fecha com um toque em qualquer lugar (pula a animação para o estado final) e nunca dura mais de 2,5 s sem interação; telas repetidas no mesmo dia (meta já batida) não reaparecem.

Result: fundo `--color-page`; `CharacterStage result` 180x300 em `celebrate` + `talking` enquanto fala a bênção, `--glow-gold` 320 px atrás (precisão igual ou maior que 80%); título `title` 24/800 ("Lição concluída!", "Lição perfeita!", "Cena perfeita!", "Coroa 2 conquistada!"); 3 `star` 40 px (ganhas `#ffc800`, não ganhas `--color-line` a 35%); 3 `StatCard` 110x92 em linha (XP dourado `+15` com `CountUp`, Tempo azul `1:42`, Precisão verde `93%`); faixa "PERFEITO!" com `--animate-shimmer` dourado quando 3/3; `Chest` 96 em card 358x72 (`border-yellow-line bg-yellow-soft`, borda 2 + 4) que balança; card `.parchment` com a bênção (17/500 itálico + referência 15/700 `--color-parchment-text` + `AudioButton inline`); cards "Missão concluída · +5 XP" só quando não houver `MissionScreen`; "Revisão da etapa · 13 de 17 certas" como `.card-interactive` com `<span>` + `<b className="ml-auto">` + `chevron-down` (corrige o texto colado de `Result.jsx:52`), expandindo a lista de erros (pergunta 17/700, resposta errada riscada `--color-red-text`, correta `--color-green-text`); CTA `btn-cta` "CONTINUAR" (caixa alta como na lição, `Result.jsx:68`). Confete disparado no `useEffect` do Result a 250 ms (seção 7.3), nunca em `finishLesson` (`session.js:408-411`); `confettiFx.reset()` em `begin()` para não vazar para a lição seguinte.

`StreakScreen`: fundo `#131f24` sempre (com vinheta `#ff9600` a 10%), `Flame` 160 acendendo com glow, número `display-lg` contando (`5`), `title` "dias de ofensiva!", `StreakWeek` preenchendo em cascata, `secondary` "Pratique amanhã para manter", CTA. `DailyGoalScreen`: `SegmentRing` 160 de 10 px `#ffc800` indo do percentual anterior a 100%, `check` pop, `title` "Meta diária batida!", `secondary` "20 de 20 XP", missões concluídas em lista com `check` pop e pílula "+5 XP" subindo, CTA. `CrownScreen`: `crown` 160 caindo com raios girando atrás, `title` "Coroa 2 de 5", `secondary` "Noé e a arca" em `--unit-text`, confete dourado, CTA. `MissionScreen`: `Chest` 96 aberto, `heading` "Missão concluída", `body` "Complete 2 lições", pílula "+5 XP" com `CountUp`, CTA.

### 6.5 Praticar: Hub (`screens/Hub.jsx`)

Cabeçalho: `display` 28/800 "Praticar" + `secondary` "18 palavras aprendidas · 3 para revisar" à esquerda; `CharacterStage header` do personagem do capítulo atual à direita. Lista de `.card-interactive` 80 px (ícone ilustrado 48 à esquerda, título 17/700, subtítulo 15/500 `--color-ink-soft`, `chevron-right` 24 `--color-disabled`): "Erros" (`bandage`; `Pill` vermelha com a contagem; estado vazio em card verde), "Palavras" (`book`; "Revisão rápida · 9 exercícios"), "Escuta" (`headphones`; "8 exercícios"), "Fala" (`mic` azul; "Pronúncia das frases do capítulo"), "Match Madness" (`bolt`; `Badge timer` "60 s"). Substitui `HubCard` com `text-3xl` emoji (`Hub.jsx:14-23`). "Situações do dia a dia": por personagem, cabeçalho com `Avatar` 40 + nome 17/700 + "6/6" caption à direita; carrossel horizontal (`scroll-snap-type: x mandatory`, padding 16, gap 12) de cards 140x180 raio 16 borda 2 + 4: `Avatar` 72 com anel na cor do capítulo no topo, título 15/700 em 2 linhas ("Instruções para a arca"), "+10 XP" caption `--color-yellow-text`; concluída: `check-circle` 24 verde no canto; bloqueada: `lock` 24 e card a 60% (substitui a lista plana das 48 cenas com "✅ 💬 🔒" de `Hub.jsx:25-66`). "Histórias": grid 2 colunas de cards 171x200: capa 1:1 (`hero.webp` do `cover` com gradiente inferior `.parchment`) raio 12, título 15/700 ("A arca de Noé"), "+10 XP"; lida: `check-circle`; bloqueada: `lock` + caption "Conclua a 1ª etapa do capítulo". Views locais (Story, Madness) entram com `y 100% → 0` `SPRING 300/30` e saem com fade.

### 6.6 Missões (`screens/Quests.jsx`)

Banner 358x120 roxo (`#ce82ff` para `#a560e8`) com `CharacterStage header` (personagem aleatório do capítulo) e `Chest` 56 à direita, `title` 22/800 branco "Missões" e `secondary` branco 85% "Complete missões e ganhe recompensas". Card "Missões diárias": cabeçalho `heading` 19/800 + caption "FALTAM 11 HORAS" `--color-ink-soft` à direita (atualiza a cada minuto até a meia-noite local); 4 `QuestRow` (as `QUESTS` de `session.js:23-28`: Ganhe 20 XP = `bolt`; Complete 2 lições = `book`; Faça 1 lição perfeita = `star`; Acerte 5 seguidas = `flame`). Card "Missão mensal": `Medal` 64 do capítulo em andamento, "Outubro: complete 30 lições" 17/700, `ProgressBar labelled` "12/30", caption "FALTAM 18 DIAS". Card "Ofensiva": `Flame` 48 + "5 dias" `display-lg`; `StreakWeek`; link caption `--color-blue-text` "VER CALENDÁRIO" (abre `Sheet` com o mês). Card `.parchment` "Versículo do dia" (texto EN 17/500 + `AudioButton boxed` 44 + "VER TRADUÇÃO" caption). Removidos: o anel + engrenagem `⚙️` de meta (`Quests.jsx:38-39`, vai para Configurações) e o card "Praticar erros" (está no Hub). Estado zero: `EmptyState` com `flame-off` 120 e `Button3D primary` "COMEÇAR". Barras montam de 0 com stagger 80.

### 6.7 Personagens (`screens/Characters.jsx`, `components/characters/CharacterSheet.jsx`)

Topo: `display` 28/800 "Personagens" + `secondary` "Histórias diferentes. O mesmo Deus fiel." Carrossel horizontal opcional de `Avatar` 56 dos personagens conhecidos (referência `2bf4fe01`). Lista agrupada por capítulo: cabeçalho com faixa 8x40 raio 4 `--unit-color` + `heading` 19/800 "Noé e a arca" + caption "2/3 CONHECIDOS" à direita; linhas de 72 px (`[data-char]` preservado, separador 2 px `--color-line`): `Avatar` 56 (anel 3 px `--unit-color` se o capítulo foi iniciado em `state.completed`; cinza com `lock` se não), nome 17/700, virtude 15/500 `--color-ink-soft` completa ("Perseverança", "Companheirismo", sem `truncate` de `Characters.jsx:46-47`), `chevron-right`.

Ficha (`Sheet` com alça): hero 4:3 (`hero.webp`, `object-position: top`; fallback JPG atual com `object-position: center 22%`) com gradiente inferior `rgba(0,0,0,.55)` e nome `display` 28/800 branco + subtítulo 15/500 branco 85% sobre o hero (corrige a cabeça cortada do `aspect-video object-[center_20%]` de `CharacterSheet.jsx:47-48`); X 36 px no canto superior direito (fundo `rgba(0,0,0,.4)`); abas "SOBRE · LIÇÕES · VERSÍCULOS" `label` 15/800 com indicador 3 px `--unit-color` deslizando (`layoutId`); Sobre: chips de virtude (ícone + texto) e referência, descrição 17/500; Lições: 4 lições-chave com quadrados 28 px coloridos (ciclo green/blue/purple/orange) e ícones SVG (`lightbulb`, `shield`, `heart`, `book`; sai `LESSON_ICONS` emoji de `CharacterSheet.jsx:12` e `:72`); Versículos: cards `.parchment` com áudio; `Button3D accent icon` 48 ao lado do nome ("Ouvir o nome", sai o 🔊 de `:83`); CTA fixo no rodapé do sheet "INICIAR LIÇÕES" (`CHARACTER_UNIT`) + `secondary` "Praticar com Noé"; fecha pelo X ou arrasto; sem botão "Fechar" (`:94`).

### 6.8 Perfil e Configurações (`screens/Profile.jsx`, `components/profile/ConfigModal.jsx`)

Cabeçalho: banner 358x120 raio 16 em degradê `--unit-color` para `--unit-shadow` do capítulo atual com o motivo da medalha a 20%; `gear` 24 `#ffffff` 80% no canto; `Avatar` 96 do usuário (galeria de `bust` dos personagens conhecidos ou iniciais sobre `--color-accent`; escolhido ao tocar; persistido em `state.avatar`) sobreposto 48 px abaixo do banner com borda 4 px `--color-page`; nome `title` 24/800; "@discipulo" (slug do nome) + "Entrou em agosto de 2026" `secondary` `--color-ink-soft`. Nunca o retrato de Jesus como avatar padrão (`Profile.jsx:86`). "Visão geral": grid 2x2 de `StatCard` 171x84 (`flame` "5 dias de ofensiva", `bolt` "340 XP total", `crown` "3 coroas", `star` "27 estrelas") com `CountUp`. "Conquistas" com link caption "VER TUDO": linhas de 96 px com `Shield` 72x80 (Primeiros passos `shield-1` verde, Chama da fé `shield-2` laranja, Sábio `shield-3` amarelo, Perfeccionista `shield-4` azul, Contador de histórias `shield-5` roxo, Coroado `shield-6` teal), título 17/700, "Nível 2" 15/500, `ProgressBar labelled` "13/15", descrição 15/500. "Ofensiva": calendário mensal 7x5 com `flame` 20 nas datas estudadas, hoje com anel `#ff9600`, cabeçalho do mês e setas. "Capítulos concluídos": fileira de `Medal` 64 (bloqueados cinza com `lock`).

Configurações como view interna do Perfil (`view: "settings"`, entra com `x 100% → 0` `SPRING.settle`, botão voltar 44 px, `history.pushState` para o voltar do Android; substitui o `ConfigModal`): seções com título caption 13/800 `--color-ink-soft` e cards de lista: Preferências (`Toggle`: Efeitos sonoros, Vibração, Animações, Alto contraste, Exercícios de fala, Exercícios de escuta); Tema (Claro / Escuro / Automático com `check` azul 24 no selecionado e ícones `sun`/`moon`/`auto`); Meta diária (Casual 10 XP "5 min por dia", Regular 20 XP "10 min", Sério 30 XP "15 min", Intenso 50 XP "20 min" com rádio azul; `DAILY_GOALS` de `session.js:22`); Perfil (Nome com campo 48 px, Avatar com galeria); Zona de perigo: `Button3D danger` "APAGAR TODO O PROGRESSO" abrindo `ConfirmSheet` ("Isso apaga lições, estrelas e ofensiva deste aparelho." + `danger` "APAGAR" + `neutral` "CANCELAR"), sem `confirm()` nativo (`ConfigModal.jsx:30`).

### 6.9 História (`screens/Story.jsx`)

Cabeçalho 56 px: `arrow-left` 44, `ProgressBar` 12 px, título 15/700 truncado. Beat de fala: `Avatar` 40 à esquerda com `talking` (ou `book-open` 40 em `.parchment` para o narrador, `who: null`), nome caption 13 só na troca de falante, `Bubble other` (ou `hero` para o personagem de capa) com texto 19/500 revelado palavra a palavra em `--color-accent` sincronizado ao clipe (`clipDuration` ou 60 ms por palavra), tradução 15/500 200 ms depois; falas anteriores empilhadas acima com rolagem. Pergunta: `title` 24/800 (`Sayable`) + `Option` 1 coluna em cascata (`data-opt` preservado, `Story.jsx:22`); lacuna: card 358 com frase e `Gap` + 3 `Chip` 44. Feedback: acerto pop na opção + faixa verde curta "Isso!" (1 s) + `haptic("correct")`; erro `SHAKE` + correta pulsando 2x. Fim: `StatCard` XP com `CountUp`, `CharacterStage result` do `cover` pulando (`y [0,-14,0]`), confete, CTA `btn-cta`.

### 6.10 Match Madness (`screens/Madness.jsx`)

Cabeçalho: `arrow-left` 44, placar à esquerda (`bolt` 24 + número `numeral` 20/800 `--color-yellow-text` com `key={score}` `scale [1,1.3,1]` 250 ms), relógio à direita (caixa 72x36 raio 12 borda 2 px, `numeral` 20/800 `tabular-nums`; 10 s ou menos: borda `--color-red-line`, texto `--color-red-text` pulsando `scale 1.12` + vinheta `inset 0 0 60px rgba(255,75,75,.35)` pulsando + `tick`/haptic por segundo). Grade 2 colunas de `MatchCell` 166x69 (`data-md-cell`, `data-side` preservados) gap 24/20; par certo afunda e some, nova rodada em cascata (40 ms, y 12 → 0); erro: flash vermelho de tela 120 ms (overlay `rgba(255,75,75,.18)`) + "-2 s" flutuando do relógio (y -18, opacity 0, 600 ms). Fim: `trophy` 96 com `SPRING.bounce` (ou `timer` cinza), `title` "Novo recorde!" / "Tempo esgotado!", "14 pares · 2 erros · +7 XP" com `CountUp`, `secondary` "Recorde: 14 pares", `Button3D primary` "JOGAR DE NOVO" + `secondary` "VOLTAR"; XP mínimo 1 quando score > 0 (hoje "+0 XP" com 1 par).

### 6.11 `HeartsSheet` (`components/HeartsModal.jsx`)

`Sheet`: ilustração `heart-broken` 96 (duas metades que se separam `x ±6`, `rotate ±8`) com `heart-lost`; `title` 22/800 "Você ficou sem corações"; linha de 5 `heart-empty` 28; lista: `Button3D primary` "PRATICAR PARA RECUPERAR 1 CORAÇÃO", linha `secondary` "Esperar: próximo coração em 04:59" (contador `tabular-nums`; como os corações renovam à meia-noite em `store.js:52-55`, o texto mostra o tempo até lá), `Button3D neutral` "NÃO, OBRIGADO". `haptic("heart-lost-all")` `[80,40,80]` ao abrir. Substitui a caixa central estática com 💔 de 48 px de `HeartsModal.jsx:12-14`.

### 6.12 Desktop (`App.jsx`)

Grid 1152 centralizado: `Sidebar` 256 (sticky), centro 600, rail 368 (`sticky top-6`). O HUD do centro some (vai para o rail). Lição em tela cheia centralizada em 600 (lição 640) com cabeçalho e rodapé fixos à largura do centro. Sheets viram modais 480. Sem CTA fixo sobre o banner (`Home.jsx:228 lg:bottom-5`). Sidebar com ícones ilustrados 32 e rótulos caixa alta 15/700 (substitui os ícones cinza de 16 px de `App.jsx:79-89`).

---

## 7. Sistema de movimento

### 7.1 Tokens (`app/src/core/motion.js`)

```js
// Única fonte de molas, curvas, durações e cadências. Nenhum outro arquivo declara stiffness/damping.
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
export const DUR = { micro: 0.08, state: 0.18, panel: 0.25, screen: 0.32, complete: 0.4, celebrate: 0.9, bounce: 1.2 };
export const STAGGER = { options: 0.04, tiles: 0.025, cards: 0.12, stars: 0.18, week: 0.08 };
export const SHAKE = { x: [0, -6, 6, -4, 4, 0], transition: { duration: 0.32 } };
export const PULSE = { scale: [1, 1.04, 1], transition: { duration: 0.25 } };
export const list = (stagger = STAGGER.cards, delay = 0) => ({ hidden: {}, show: { transition: { staggerChildren: stagger, delayChildren: delay } } });
export const item = (spring = SPRING.settle, y = 16) => ({ hidden: { y, opacity: 0 }, show: { y: 0, opacity: 1, transition: spring } });
export const exitFade = (d = DUR.state) => ({ opacity: 0, transition: { duration: d, ease: EASE.out } });
```

Raiz (`main.jsx`): `<MotionConfig reducedMotion="user" transition={SPRING.settle}><App /></MotionConfig>`. Continuar importando de `"motion/react"` (pacote completo): `layoutId` e `drag` não funcionam com `LazyMotion features={domAnimation}`, e `strict` lançaria erro em todo `motion.*`.

### 7.2 Regras

1. Tudo que entra usa mola; tudo que sai usa tween curto (120 a 180 ms, `EASE.out`).
2. Nada abaixo de 60 ms nem acima de 350 ms fora das celebrações (até 900 ms por elemento, 3 s por cerimônia).
3. Só uma coisa grande se move por vez; o resto acompanha em cascata (`staggerChildren`).
4. Som e haptic disparam no frame em que o movimento começa, nunca no fim.
5. `whileTap` em botão 3D é sempre `y` (afundar), nunca `scale`: botões 4 px, opções, peças, células e cards clicáveis 2 px, nós 8 px, microfone 7 px.
6. Keyframes de shake e flash são `animate` do Motion (interrompíveis), não classes Tailwind (`animate-bounce`, `animate-pulse` proibidos).
7. `AnimatePresence` em todo elemento condicional (painéis, badges, toasts, modais, popovers, sheets).
8. `layoutId` só no que de fato se desloca (peças, caixa da aba, moedas, indicador da ficha).
9. Confete sempre disparado pelo componente visível em `useEffect`, com `useReducedMotion()`, nunca pela lógica de sessão.
10. `Math.random()` nunca dentro do JSX: a reação do personagem é sorteada uma vez por checagem (`useMemo` em `session.checked`), corrigindo `CharacterBubble.jsx:33`.
11. Em `prefers-reduced-motion` ou `state.animations === false`: molas viram fades de até 150 ms, confete, chamas, shimmer e partículas desligam, karaokê vira destaque por frase, `CountUp` pula ao valor final; barras e anéis mantêm a transição (são informação). Haptics seguem `state.haptics`, não a preferência de movimento (corrige `util.js:86-89`).
12. Cada coreografia é verificada com rajadas de 80 ms (`scratchpad/ui-dynamics/capture.mjs`) antes de fechar o item.

### 7.3 Coreografias por evento (t em ms a partir do gatilho)

Abrir o app / trilha
- 0: HUD e tab bar já visíveis (sem animação); 0 a 300: capítulos entram por `whileInView` (opacity 0 → 1, y 12 → 0, `SPRING.settle`), nós em cascata de 40 ms dentro do capítulo visível; scroll instantâneo ao nó atual a 35% da viewport.
- 300: `SegmentRing` do nó atual anima de 0 ao valor (600 ms `EASE.out`); 400: `NodeBalloon` aparece (`scale .8 → 1`, `SPRING.pop`) e começa `--animate-float`; halo começa.
- Personagens laterais: fade + y 12 ao entrar na viewport, uma vez. HUD: XP e ofensiva contam do valor anterior ao novo (400 ms) quando mudam.

Tocar um nó
- 0: afunda 8 px (sombra 0) em 80 ms; `sfx("tap")`; `haptic("select")`.
- 80: solta com `SPRING.snap`; `NodePopover` entra (`scale .9 → 1` + fade, `SPRING.pop`, ~180 ms) com a seta alinhada; o balão COMEÇAR esconde (fade 120 ms).
- Botão do popover: afunda 4 px; `sfx("start")`; 120: a tela da lição sobe (`y 100% → 0`, `SPRING.screen`) sobre a trilha.

Entrar no exercício / Continuar
- 0: conteúdo antigo sai (`x -48, opacity 0`, 180 ms `EASE.out`, `position: absolute` via `popLayout`) e o novo entra (`x 64 → 0`, opacity 0 → 1, `SPRING.settle`) ao mesmo tempo. Corrige o vazio de 100 a 180 ms do `mode="wait"` de `Lesson.jsx:122`.
- 60: título e balão (`y 8 → 0`); 120 a 280: opções ou peças em cascata (`STAGGER.options` / `STAGGER.tiles`, `y 10 → 0`).
- 120: rodapé volta a "VERIFICAR" (atraso para não piscar); barra avança com `SPRING.soft` se ainda não avançou.
- 200: autoplay da fala; `CharacterStage` em `talking` até o fim de `durationMs`.
- Som: `swoosh` (novo, 180 ms). Sem haptic. Sem `tap`.

Selecionar opção / pegar peça / tocar célula
- 0: afunda 2 px (borda inferior 4 → 2 + `translateY(2px)`) em 60 ms; `sfx("select")` (opção, célula) ou `sfx("tile", { rate: 1 + 0.04 * i })` (peça); `haptic("select")`.
- 60: volta com `SPRING.snap`; borda e fundo azuis em 100 ms.
- Peça: voa (`layoutId`, `SPRING.layout`, ~250 ms), pousa com `scale [1, 1.06, 1]` 180 ms; fantasma aparece com fade 120 ms; devolver é o inverso.

Verificar: acerto
- 0: `sfx("correct")` (1 de 3 variações, pitch 0,96 a 1,06); `haptic("correct")` 20; opção ou peças certas `PULSE` e trocam para verde em 150 ms.
- 0: `FeedbackFooter` sobe (`y 28 → 0`, opacity 0 → 1, `SPRING.footer`); 60: `check-circle` pop (`scale 0 → 1`, `SPRING.pop`); 100: elogio `x -8 → 0`; 140: linha secundária fade.
- 80: barra avança (`SPRING.soft`) com brilho varrendo o trecho novo (320 ms); combo: rótulo `key={combo}` entra (`scale 1.5 → 1`, `y -6 → 0`, `SPRING 600/20`); em múltiplos de 5: `sfx("combo")`, `haptic("combo")` `[20,30,40]`, barra vira dourada com shimmer e 3 partículas de chama na ponta (y -12, opacity 0, 500 ms, stagger 60).
- 120: personagem `happy` (`y [0,-10,0]` 380 ms) + badge `reaction-happy` (`SPRING.pop`); `talking` se houver fala pós-acerto.
- CTA: `layout` + transição de cor 150 ms para "CONTINUAR".

Verificar: erro
- 0: `sfx("wrong")`; `haptic("wrong")` `[50,30,50]`; opção errada `SHAKE` e fica vermelha; correta acende verde (opção pedagógica mantida).
- 0: painel vermelho sobe com `x [0,-4,4,0]` 250 ms; 60: `close-circle` pop.
- 150: coração do cabeçalho `scale [1,1.35,1]` + `x [0,-4,4,-2,0]` 350 ms e um coração fantasma sobe e some (`y -28`, opacity 0, 500 ms); número desliza (`key={hearts}`, `y 8 → 0`).
- 150: personagem `sad` (`SHAKE`) + badge `reaction-sad`; combo quebra: flash vermelho 150 ms na barra, rótulo cai (`y 10`, opacity 0, 200 ms).
- Sem corações: 400: último coração vira `heart-broken` (metades `x ±6`, `rotate ±8`), `sfx("heart-lost")`, `haptic("heart-lost")`; 1200 (o `setTimeout` de `session.js:308`): `HeartsSheet` (overlay 150 ms, painel `SPRING.sheet`), `haptic("heart-lost-all")`.

Concluir lição (Result)
- 0: tela entra (fade 200 ms); `sfx("finish")`; `haptic("finish")` `[40,30,40,30,80]`.
- 100: `CharacterStage result` em `celebrate` (`SPRING.bounce`, `y -16 → 0`, `rotate -8 → 0`) + `--glow-gold` opacity 0 → 1 em 600 ms + `talking` enquanto fala a bênção.
- 250: confete: dois canhões laterais (`origin {x: .1, y: .6}` e `{x: .9, y: .6}`, `angle` 60/120, `spread` 55, `startVelocity` 45, 60 partículas cada) + chuva (`gravity` .9, `ticks` 220, `scalar` 1.1). Perfeito: terceiro tiro dourado (`colors ["#ffc800", "#ffe066", "#ffffff"]`) em 600 ms.
- 350: título `scale .9 → 1` `SPRING.pop`.
- 450 / 630 / 810: estrelas ganhas `scale [0, 1.35, 1]` `SPRING 400/12` + flash branco (opacity .8 → 0, 200 ms) + `sfx("star")` com pitch crescente + `haptic("star")` 15; não ganhas só fade para .35, sem rotação (corrige a terceira estrela cinza girando de `Result.jsx:24`); 3 estrelas: brilho dourado girando atrás por 1 s.
- 700 / 820 / 940: `StatCard` XP, Tempo, Precisão em cascata (`y 24 → 0`, `SPRING 300/22`) com `CountUp` 0 → N em 800 ms e `sfx("pop", i)`.
- 1500: `Chest` entra (`y 20 → 0`) e começa o idle. 1900: bênção fade-in. 2200: botões e "Revisão da etapa".

Abrir baú
- 0: squash `scaleY .85` 80 ms; `haptic("chest")` `[30,40,60]`.
- 80: tampa `rotateX -70` `SPRING 400/18`; `sfx("sparkle")`; confete pequeno (30 partículas) com `origin` no centro do baú.
- 150 a 570: 8 moedas voam até o `StatCard` XP (420 ms, `EASE.out`, `stagger(0.04)`, `sfx("coin")` em 3 variações).
- 570: card XP conta +bônus (300 ms) e pulsa `scale [1, 1.15, 1]`; rótulo do baú vira "+N XP".

Ofensiva (`StreakScreen`)
- 0: fundo escurece 150 ms. 100: `Flame` `scale 0 → 1.2 → 1` `SPRING.bounce` + glow pulsante (1,6 s loop); `sfx("streak")`; `haptic("streak")` `[40,30,40,30,120]`.
- 400: número conta 0 → N (600 ms). 700: `StreakWeek` preenche em cascata (`STAGGER.week`), hoje com pop. 1200: texto "N dias de ofensiva!" (`y 12 → 0`). 1500: CTA.

Meta diária (`DailyGoalScreen`)
- 0 a 900: `SegmentRing` de pct anterior → 100% (`useMotionValue` + `useTransform` gerando `stroke-dashoffset`, `EASE.out`); 900: pop + `check` + `sfx("sparkle")`; 1000+: missões concluídas em lista com `check` pop (`SPRING 500/16`) e pílula "+5 XP" subindo (`y -20`, 600 ms).

Coroa (`CrownScreen`)
- 0: `crown` cai (`y -120 → 0`, `SPRING.bounce`) com raios girando atrás (`rotate 360`, 6 s loop, opacity .35); `sfx("levelup")`; `haptic("levelup")`. 500: número da coroa conta. 900: confete dourado (80 partículas).

Voltar à trilha após o resultado
- 0: fade 200 ms da trilha; scroll suave até o nó concluído.
- 200: nó concluído `scale [0.6, 1.15, 1]` `SPRING 350/14`, ícone vira `check` com crossfade de 150 ms, estrelas 20 px em cascata acima do nó (100 ms, `scale 0 → 1.3 → 1`, `sfx("pop", i)`) e somem após 1,2 s.
- 600: próximo nó troca de `locked` para `available` (face em 150 ms, brilho branco 200 ms), `SegmentRing` aparece; 1100: `NodeBalloon` entra (`SPRING.pop`) e começa `--animate-float`; halo começa; `UnitHeader` atualiza. Capítulo completo: troféu reluz (`--glow-ring` 0 → 1 em 600 ms) + confete leve.

Match Madness
- Par certo: flash verde 300 ms + `scale 1.12` + `sfx("pop", i)` + `haptic("pair")` 12; 300: as duas células afundam e somem (`scale .9`, opacity 0, 200 ms); rodada nova em cascata (40 ms, `y 12 → 0`); placar `key={score}` `scale [1, 1.3, 1]` 250 ms.
- Erro: `SHAKE` + flash vermelho de tela 120 ms + "-2 s" flutuando do relógio (`y -18`, opacity 0, 600 ms) + `haptic("wrong")`.
- Últimos 10 s: por segundo `sfx("tick")` + `haptic("tick")` 6, número vermelho pulsando (`scale 1.12`), vinheta pulsando.
- Fim: troféu `SPRING.bounce`, contagem de pares com `CountUp`, confete se recorde, `sfx("gong")`.

História
- Beat de fala: balão cresce do rabinho (`transformOrigin` no rabinho, `scale .9 → 1`, `SPRING 400/26`); texto revelado por palavra sincronizado com `clipDuration` (ou 60 ms por palavra); retrato em `talking`; tradução 200 ms depois.
- Pergunta: opções em cascata; acerto: pop + faixa verde curta "Isso!" (1 s) + `haptic("correct")`; erro: `SHAKE` + correta pulsando 2x.
- Fim: `StatCard` XP com `CountUp`, personagem de capa pulando (`y [0,-14,0]`), confete.

Toast, popover, sheet, abas e telas
- Snackbar: `y 16 → 0` + `scale .9 → 1` (`SPRING.footer`), fica 1600 + 40 ms por caractere, sai `y 8` + fade 150 ms.
- Popover: `scale .9 → 1` + fade (`SPRING.pop`); saída 120 ms.
- Sheet: overlay 150 ms; painel `y 48 → 0` (`SPRING.sheet`); saída `y 32` + fade 160 ms; arrasto segue o dedo e fecha além de 120 px.
- Modal (lg): `scale .88 → 1` + `y 24 → 0` `SPRING 320/24`; saída 120 ms.
- Abas: conteúdo fade + `y 8` em 160 ms; caixa ativa desliza (`layoutId="tab-active"`, `SPRING.settle`); ícone tocado `scale [0.9, 1.05, 1]` 200 ms. Corrige o frame em branco de `App.jsx:93-100` na troca de aba.
- Entrar na lição: tela sobe (`y 100% → 0`, `SPRING.screen`) depois do pop do nó; sair: desce 250 ms. Result → Home: fade 200 ms.
- Configurações: `x 100% → 0` `SPRING.settle`; voltar `x 100%` 200 ms.

### 7.4 Microinterações (checklist de implementação, por prioridade)

P0
1. Rodapé de feedback por mola com ícone pop e shake no erro (DYN-03).
2. Troca de exercício sem tela vazia (`popLayout`) com cascata de opções e peças (DYN-04, F07).
3. Reação do personagem visível fora do `overflow-hidden`, `useTalking` assinando `onSpeak` com filtro por personagem, reação sorteada uma vez por checagem (DYN-05, DYN-06, DYN-07, F21).
4. Camada sonora: `select`/`tile` tocam, `tap` sai de VERIFICAR, áudio e microfone (DYN-08).
5. Result em sequência com `CountUp`, estrelas com som, baú vivo, confete no `useEffect` (DYN-01, DYN-02, DYN-17, DYN-18).
6. Snackbar e `HeartsSheet` por mola; coração do cabeçalho tremendo e quebrando (DYN-09, DYN-10, DYN-11).
7. `Button3D` unificado (`whileTap y` + `boxShadow`, sem `:active`); opções, peças e células afundando 2 px (DYN-22).
8. Rodapé medido por `ResizeObserver` publicando `--footer-h` (F01).

P1
9. Combo: rótulo pop, barra dourada com shimmer e chamas; barra avança no acerto com brilho (DYN-12, DYN-13, F10, F11).
10. Trilha: nó concluído comemorando, próximo desbloqueando com brilho, halo por transform, balão com float próprio, popover por mola, baú balançando (DYN-15, UI-26).
11. Transições de tela e caixa da aba com `layoutId`; entrada da lição subindo (DYN-14).
12. Banco de palavras: pouso com squash, som com pitch, cascata na montagem, fantasma com fade (DYN-24).
13. Match Madness com game feel; História com karaokê e balão crescendo; interstício com pose entrando inclinada (DYN-19, DYN-20, DYN-21).
14. HUD com `CountUp` e popovers; `UnitHeader` trocando de cor no scroll (UI-07, UI-06).

P2
15. Cerimônias de ofensiva, meta diária, coroa e missão; Missões com anel e barras animadas, baú das missões (DYN-16, DYN-26).
16. Botão de áudio com arcos acendendo; onda de 18 barras dançando; karaokê nas cenas (DYN-25, F29).
17. Sheets com arrastar para fechar; toggles com mola; medalhas e escudos com pop ao desbloquear (DYN-27).
18. Reduced motion e haptics como preferências próprias; sprite sonoro v2 completo (DYN-23, DYN-28, DYN-29).

### 7.5 Padrões de código (motion/react)

```jsx
// Troca de exercício sem vazio (Lesson.jsx). O contêiner é relative e guarda a altura do exercício
// anterior durante a transição (min-height) para o rodapé fixo não pular.
<div className="relative" style={{ minHeight: prevHeight, paddingBottom: "calc(var(--footer-h) + 16px)" }}>
  <AnimatePresence mode="popLayout" initial={false}>
    <motion.div key={`${session.index}:${ex.type}`} ref={measureRef}
      initial={{ x: 64, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
      exit={{ x: -48, opacity: 0, transition: { duration: DUR.state, ease: EASE.out } }}
      transition={SPRING.settle}>
      <ExerciseView ex={ex} />
    </motion.div>
  </AnimatePresence>
</div>

// Rodapé de feedback medido
const footerRef = useRef(null);
useEffect(() => {
  const el = footerRef.current; if (!el) return;
  const ro = new ResizeObserver(([e]) => document.documentElement.style.setProperty("--footer-h", `${Math.ceil(e.contentRect.height)}px`));
  ro.observe(el); return () => ro.disconnect();
}, []);
<footer ref={footerRef} className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[calc(16px+env(safe-area-inset-bottom))] pt-4">
  <AnimatePresence>{fb && (
    <motion.div key="fb" initial={{ y: 28, opacity: 0 }} animate={{ y: 0, opacity: 1, x: fb.ok ? 0 : [0, -4, 4, 0] }}
      exit={{ y: 20, opacity: 0, transition: { duration: 0.15 } }} transition={SPRING.footer}>
      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ ...SPRING.pop, delay: 0.06 }}><Icon name={fb.ok ? "check-circle" : "close-circle"} size={26} /></motion.span>
      <motion.h2 initial={{ x: -8, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-title">{fb.praise}</motion.h2>
    </motion.div>
  )}</AnimatePresence>
  <Button3D variant={fb && !fb.ok ? "danger" : "primary"} className="btn-cta w-full">{label}</Button3D>
</footer>

// Boca mexendo (audio.js: emitSpeak passa a incluir { text, durationMs, char: ch && ch.key })
export function useTalking(charKey) {
  const [on, setOn] = useState(false);
  useEffect(() => onSpeak(({ durationMs, char }) => {
    if (charKey && char && char !== charKey) return;
    setOn(true); const t = setTimeout(() => setOn(false), durationMs); return () => clearTimeout(t);
  }), [charKey]);
  return on;
}

// Reação sorteada uma vez por checagem
const reaction = useMemo(() => (session.checked ? (ok ? "reaction-happy" : "reaction-sad") : null), [session.checked, ok]);

// Cascata de cards (Result)
<motion.div variants={list(STAGGER.cards, 0.7)} initial="hidden" animate="show" className="grid grid-cols-3 gap-3.5">
  {cards.map((c, i) => <motion.div key={c.key} variants={item(SPRING.pop, 24)} onAnimationStart={() => sfx("pop", i)}><StatCard {...c} /></motion.div>)}
</motion.div>

// Sequência do baú com useAnimate
const [scope, animate] = useAnimate();
async function open() {
  haptic("chest");
  await animate(scope.current, { scaleY: 0.85 }, { duration: DUR.micro });
  animate(".lid", { rotateX: -70 }, { type: "spring", stiffness: 400, damping: 18 }); sfx("sparkle");
  const { dx, dy } = vectorTo(xpCardRef.current, scope.current);
  await animate(".coin", { x: dx, y: dy, opacity: [1, 1, 0] }, { duration: 0.42, delay: stagger(0.04), ease: EASE.out });
  onReward();
}

// Anel por motion value
const mv = useMotionValue(prevPct);
const dash = useTransform(mv, (v) => circumference * (1 - v / 100));
useEffect(() => { const c = animate(mv, pct, { duration: 0.9, ease: "easeOut" }); return () => c.stop(); }, [pct]);
<motion.circle style={{ strokeDashoffset: dash }} strokeDasharray={circumference} />

// Confete no componente visível
useEffect(() => {
  if (reduce) return;
  const t = setTimeout(() => { fire({ origin: { x: 0.1, y: 0.6 }, angle: 60 }); fire({ origin: { x: 0.9, y: 0.6 }, angle: 120 }); rain(); }, 250);
  return () => clearTimeout(t);
}, []);
```

### 7.6 Verificação

Cada coreografia é validada com `scratchpad/ui-dynamics/capture.mjs` (Playwright, rajadas de 80 ms, viewport 390x844, `colorScheme` dark e light). Critérios de aceite: nenhum frame vazio na troca de exercício; rodapé de feedback visível em movimento em pelo menos 3 frames intermediários; `CountUp` com pelo menos 4 valores distintos nos frames; um único buffer de som por toque no log (`capture-log.txt`); reação do personagem visível em pelo menos 2 frames após a checagem; estrelas do Result entrando em frames distintos.

---

## 8. Sons e haptics

### 8.1 Mapa (um evento, um som, um haptic)

| Evento | Som (existente / novo) | Haptic (ms) |
|---|---|---|
| Navegar aba, abrir card, popover, sheet, tocar nó | `tap` | 8 |
| Selecionar opção, célula de pares | `select` (hoje nunca toca no React) | 8 |
| Pegar ou devolver peça | `tile` (novo, madeira 60 ms, 3 pitches) | 8 |
| Iniciar lição pelo popover, interstício | `start` | nenhum |
| Verificar certo | `correct` (3 variações, pitch 0,96 a 1,06) | 20 |
| Combo múltiplo de 5 | `combo` | `[20,30,40]` |
| Verificar errado | `wrong` | `[50,30,50]` |
| Perder coração / sem corações | `heart-lost` (novo, grave 250 ms) | `[30,20,60]` / `[80,40,80]` |
| Par certo (match, madness) | `pop(i)` | 12 |
| Troca de exercício | `swoosh` (novo, 180 ms) | nenhum |
| Estrela do Result | `star` (novo, sino curto) | 15 |
| Fim de lição | `finish` | `[40,30,40,30,80]` |
| Baú / moeda | `sparkle` + `coin` (novo, 3 variações) | `[30,40,60]` |
| Ofensiva | `streak` (novo, fogo + sino 700 ms) | `[40,30,40,30,120]` |
| Coroa / nível | `levelup` (novo, fanfarra 900 ms) | `[40,30,40,30,120]` |
| Tick (últimos 10 s do Madness) | `tick` (novo, 40 ms) | 6 |
| Fim do Madness | `gong` (novo) | `[40,30,80]` |
| Missão concluída | `sparkle` | 8 |
| Toast | nenhum | 8 |
| Toggle | `tap` | 8 |
| VERIFICAR, CONTINUAR, botões de áudio, microfone | nenhum | nenhum |

### 8.2 Implementação

- `app/src/core/sfx.js` (novo, próprio do React): `export function sfx(name, { rate = 1, volume = 1 } = {})` toca a partir do sprite `audio/sfx/sfx-v2.ogg` (+ `.m4a` para Safari) decodificado uma vez no WebAudio pelo mesmo `spriteBuffer` de `audio.js:16-30`, com mapa `audio/sfx/sfx-v2.json` no formato de `audio/sprites.json` (`nome: [arquivo, início, duração]`); variações (`correct-1..3`, `coin-1..3`, `tile-1..3`) sorteadas pelo nome base; `pop(i)` mantém `rate 1 + min(i, 6) * 0.06`. Enquanto o sprite v2 não existe, o mapa aponta para os 9 sons atuais com variação de pitch: `tile` → `select` a 1,2; `tick` → `tap` a 1,5; `coin` → `pop`; `star` → `sparkle`; `swoosh` → `start` a 0,6 e volume 0,4; `heart-lost` → `wrong` a 0,8; `streak`/`levelup`/`gong` → `finish`. Respeita `state.sound`.
- `app/src/core/haptics.js` (novo): `export function haptic(name)` com o mapa acima e a preferência `state.haptics` (ligada por padrão, independente de reduced motion); no-op seguro onde `navigator.vibrate` não existe (iOS Safari), e o visual nunca depende do haptic.
- Não editar `biblelingo/sfx.js`: o listener global de `pointerdown` (`sfx.js:108-113`) filtra classes do app clássico (`#btn-check`, `.opt`, `.tile`) e por isso toca `tap` em todo botão do React e nunca toca `select`. O React para de importar `SFX` do arquivo compartilhado; o `sfx.js` próprio registra um listener `pointerdown` em captura que marca o evento como tratado para o listener clássico ignorar enquanto o alias do Vite ainda o carregar.
- Novos sons gerados por `tools/gen-sfx` (síntese local) ou ElevenLabs Sound Effects (créditos Pro), normalizados a -14 LUFS, silêncio cortado, servidos como um único sprite versionado no `sw.js`; o WAV base64 de `sfx-data.js` (132 KB) fica como reserva até o sprite carregar.
- Risco de cansaço sonoro: `correct` em 3 variações, `tile` a volume 0,6, `tick` só nos últimos 10 s.

---

## 9. Acessibilidade e tema claro/escuro

### 9.1 Acessibilidade

- Contraste: 4,5:1 para texto normal, 3:1 para texto de 19 px/700 ou maior, 24 px ou maior, e para ícones informativos; pares verificados no CI (seção 2.11); exceções declaradas restritas a ícones decorativos e ao CTA claro, com a preferência "Alto contraste" (`state.highContrast`, `data-contrast="high"` no `<html>`).
- Toque: alvos de 44 px no mínimo (X do cabeçalho 44x44, HUD 44, nós 86 de área, chips 44).
- Semântica: `nav role="tablist"` + `role="tab"` + `aria-current="page"` nas abas; `role="radiogroup"` e `role="radio" aria-checked` nas opções; `aria-live="polite"` na zona de resposta do banco; `role="dialog" aria-modal` com foco preso em sheets e popovers; `role="switch"` nos toggles; `role="progressbar"` com `aria-valuenow` nas barras e anéis; estrelas como SVG com `aria-label="3 de 3 estrelas"`; números do HUD com texto `sr-only` ("5 dias de ofensiva", "340 XP", "4 corações"); ícones sempre `aria-hidden`.
- Teclado: foco visível `outline 3px --color-accent`; atalhos 1 a 4 nas opções (já em `Lesson.jsx:49-53`); Enter verifica no campo de digitação; Escape fecha popover e sheet.
- Movimento: `MotionConfig reducedMotion="user"` + `useReducedMotion()` em confete, chamas, shimmer, karaokê e `CountUp`; preferência própria `state.animations`; haptics em `state.haptics`.
- Leitura de tela: sem emoji lido como "fogo", "alta tensão", "coração vermelho" (UI-29); nomes dos personagens só no título do exercício e em `alt`.
- Conteúdo: tradução sempre disponível por toque (tooltip e "VER EM PORTUGUÊS"); "NÃO POSSO OUVIR/FALAR AGORA" sempre visível nos formatos de escuta e fala; troca automática de fala por leitura quando `SpeechRecognition` não existe.

### 9.2 Tema claro e escuro

- Claro: escala neutra branca (`#ffffff`, `#e5e5e5`, `#4b4b4b`, `#6f6f6f`, `#afafaf`), CTA `#58cc02` com texto branco (ou `#131f24` em alto contraste), painéis de feedback em `#d7ffb8` / `#ffdfe0`. O creme só em `.parchment`.
- Escuro: `#131f24`, `#202f36`, `#37464f`, `#f1f7fb`, `#dce6ec`; CTA `#93d333` com texto `#131f24` e sombra `#79b933`; erro `#ee5555` com `#131f24`; painéis de feedback sempre `#202f36`; XP e texto dourado `#ffc800`; azul `#49c0f8`; ícones `check-circle`/`close-circle` com glifo `#131f24`.
- Troca: `state.theme` em `auto` / `light` / `dark` (já existe) aplicando a classe `.dark` no `<html>`; `meta name="theme-color"` troca entre `#ffffff` e `#131f24`; `color-scheme: light dark` no `:root` para controles nativos.
- Todas as capturas de aceitação (seção 11) são tiradas nos dois temas; nenhum componente pode ter cor hard-coded que não exista nas duas colunas das tabelas da seção 2.

---

## 10. Contratos de teste que não podem quebrar

Os drivers `app/scripts/e2e-course.mjs`, `app/scripts/e2e-lesson.mjs` e `app/scripts/shots-visual.mjs` (Playwright, `--no-sandbox --autoplay-policy=no-user-gesture-required --mute-audio`, viewport 390x844) são o teste de regressão do curso inteiro. Tudo abaixo é obrigatório.

### 10.1 Atributos e seletores preservados

| Contrato | Onde é usado | Regra |
|---|---|---|
| `[data-node="<id>"]`, `[data-order]`, `[data-current]` no wrapper de cada etapa da trilha | `e2e-course.mjs:16-19, 44-45, 143`; `shots-visual.mjs:22`; `Home.jsx:31, 158` | o wrapper envolve o `PathNode`; `data-order` continua a ordem global da trilha (agora crescente de cima para baixo, o driver ordena por número); o primeiro `<button>` dentro do wrapper é o nó |
| `[data-node="<id>"] button` abre a etapa | `e2e-course.mjs:45`, `e2e-lesson.mjs:17`, `shots-visual.mjs:23` | como o toque passa a abrir o popover, o botão do popover recebe `data-popover-start`; os drivers são atualizados ANTES da mudança para: clicar `[data-node="<id>"] button`, esperar `[data-popover-start]`, clicar nele. Em DEV, `window.__blOpenNode(id)` continua disponível como atalho |
| `window.__session` em DEV (`Lesson.jsx:36`) | todos os drivers | manter `exercises`, `index`, `checked`, `feedback.ok`, `phase === "result"`, `result.title`, `result.gained`, `exercises[i].type`, `.silent`, `.correct`, `.pairs[].en`, `.bank`, `.isReview`, `.correctLabel` |
| `[data-opt]` e `[data-value]` nas opções | `e2e-course.mjs:128-131`, `Lesson.jsx:53` | `Option` e `ImageCard` mantêm `data-opt={i+1}` e `data-value={o.value}`; cenas e História mantêm `data-opt` com o texto como valor |
| `button[data-tile="<palavra>"]` no banco | `e2e-course.mjs:107-109` | só as peças do banco (não as da resposta) levam `data-tile`; o driver exige que todas as peças visíveis estejam em `ex.bank` |
| `[data-side="en|pt"][data-key]` nas células de pares | `e2e-course.mjs:78-81` | `MatchCell` preserva; Madness mantém `data-md-cell` e `data-side` |
| `footer button.btn-3d` é o CTA | `e2e-course.mjs:38-40`, `shots-visual.mjs:26` | o rodapé da lição continua `<footer>` e o CTA continua com a classe `.btn-3d`; botões secundários do rodapé não podem vir antes do CTA no DOM (o driver clica o primeiro `button.btn-3d` dentro de `footer`); o botão secundário usa a classe `.btn-outline`, não `.btn-3d` |
| `getByText("Não posso falar agora")` | `e2e-course.mjs:88`, `shots-visual.mjs:71` | texto DOM em caixa normal; caixa alta só por CSS `uppercase`; único elemento com esse texto na tela |
| `[data-interstitial]` | `e2e-course.mjs:66`, `shots-visual.mjs:44` | o interstício de revisão mantém o atributo no contêiner |
| `input[type="text"]` nos formatos de digitação | `e2e-course.mjs:93-94`, `shots-visual.mjs:76` | o `TextCard` vira `<textarea>`, então todo campo de resposta (textarea e `Gap` input) recebe `data-answer-input`, e os drivers passam a usar `'[data-answer-input]'` com fallback `'input[type="text"]'` antes da troca |
| `getByRole("button", { name: "Continuar" }).last()` no Result | `e2e-course.mjs:141` | o CTA do Result e de cada cerimônia tem o texto DOM "Continuar"; o driver passa a repetir o clique enquanto `[data-ceremony]` existir e só então espera `[data-node]` |
| `[data-char]` na lista de personagens | `Characters.jsx:43` | preservado nas linhas novas |
| `ex.silent` | `e2e-course.mjs:75`, `shots-visual.mjs:57` | o `word-card` é `silent: true` (o driver só clica o rodapé) |

### 10.2 Ordem obrigatória de mudanças

1. Atualizar os três drivers com os seletores novos em modo tolerante (`[data-popover-start]` se existir, senão iniciar direto; `[data-answer-input]` se existir, senão `input[type="text"]`; loop de "Continuar" enquanto `[data-ceremony]`).
2. Rodar `node scripts/e2e-course.mjs` no app atual (deve passar sem mudanças visuais).
3. Só então inverter a trilha, adicionar o popover, trocar o campo por textarea e inserir as cerimônias.
4. `node scripts/e2e-course.mjs` e `node scripts/shots-visual.mjs` passam a fazer parte do critério de pronto de cada marco (Apêndice C), com saída "CURSO COMPLETO OK" e zero erros JS.

---

## 11. Checklist de aceitação visual por tela (para juízes de screenshot)

Capturas em 390x844, temas escuro e claro, com os drivers acima. Cada item é binário.

### 11.1 Trilha (Home)
- [ ] Capítulo 1 no topo; o nó atual está a cerca de 35% da altura com o cabeçalho do capítulo colado sob o HUD.
- [ ] Nenhum CTA fixo; nenhuma caixa tracejada; nenhum SVG de caminho; nenhum chip 💬; nenhuma fileira de estrelas sob nós.
- [ ] Nós de 70 px com sombra dura de 8 px na cor escura do capítulo; ícones SVG brancos (estrela, check, livro, balão, troféu, cadeado); nenhum emoji.
- [ ] Balão "COMEÇAR" 12 px acima do nó atual, com seta, sem colidir com o nó anterior (gap de 24 px entre nós).
- [ ] Anel segmentado de 6 px ao redor do nó atual; halo pulsante presente em uma rajada.
- [ ] Cabeçalho do capítulo 358x84 na cor do capítulo, "SEÇÃO 1 · CAPÍTULO 2" + título + botão guia 48x48; nenhuma sombra difusa.
- [ ] Baú e personagem ilustrado ao lado do caminho dentro de cada capítulo; troféu dourado no fim do capítulo.
- [ ] HUD de 56 px com quatro itens (livro, chama, raio, coração) em SVG, números legíveis (XP em `#ffc800` no escuro); tocar um item abre popover.
- [ ] Tab bar de 58 px com cinco ícones ilustrados de 32 px, caixa azul 56x44 na aba ativa, sem rótulos de 11 px.
- [ ] Divisores de testamento como banner degradê com ilustração; fim da trilha como card com personagem.
- [ ] Tocar um nó abre o popover na cor do capítulo com "COMEÇAR +10 XP"; nós bloqueados abrem popover cinza.
- [ ] Tema claro branco (sem creme no fundo); tema escuro `#131f24`.

### 11.2 Lição (todos os formatos)
- [ ] Cabeçalho: X de 24 px em área 44, barra de 16 px com brilho de 3 px, coração SVG + número; sem slot vazio de 24 px acima da barra.
- [ ] Título em 1 linha de 24 px/800.
- [ ] Personagem ilustrado em pé (110x180) ao lado do balão, com elipse de sombra, sem círculo e sem legenda; balão abraça o conteúdo com rabinho a 60% da altura apontando para o rosto.
- [ ] Alto-falante inline azul de 26 px sem caixa; palavras com dica em sublinhado pontilhado cinza no mesmo peso.
- [ ] Frases, opções e peças em 19 px/500; negrito só no título, CTA e rótulos.
- [ ] Peças de 44 px assentadas sobre linhas de 2 px distantes 54 px; peças da resposta verdes no acerto e vermelhas no erro.
- [ ] Opções de 56 px (1 coluna para frases); selecionada azul; sem `opacity-50` nas demais em 1 coluna.
- [ ] Rodapé de feedback de 158 ou 214 px: ícone circular 26 + elogio 24/800 + share e flag coloridos; uma única linha secundária de 19 px na cor do feedback; sem "RESPOSTA CORRETA:"; nenhum conteúdo escondido atrás do rodapé (inclusive a opção escolhida nas cenas e os links do banco).
- [ ] CTA escuro `#93d333` com texto `#131f24`; erro `#ee5555`; secundário outline 8 px acima do CTA.
- [ ] "COMBO x2" verde sobre a barra sem deslocar nada; dourado só a partir de x5.
- [ ] "NÃO POSSO OUVIR/FALAR AGORA" ancorado 24 px acima do CTA, não colado às opções.
- [ ] Exercício de fala: balão 240x55 acima do personagem 220x300, microfone azul 186x80 com sombra de 7 px, frase em 1 ou 2 linhas (não 4).
- [ ] Digitação: card 358x134 com textarea de 19 px; lacunas como sublinhado simples, sem chip com fundo.
- [ ] Pares: 5 pares, células 166x87 (áudio 69 com alto-falante + 12 barras), gaps 24/20; resolvidas desbotam.
- [ ] Card de palavra nova antes do primeiro teste: badge roxo, ilustração 120, EN 32/800, exemplo e tradução, áudio 64 + tartaruga 44.
- [ ] Interstício: balão 220 px com texto 19 px/500 e personagem entrando inclinado pela direita, sem círculo.
- [ ] Nenhum emoji em links, badges, dicas ou toasts; nenhum toast sobre o cabeçalho da lição.
- [ ] Rajada de 80 ms na troca de exercício: nenhum frame vazio; rajada no VERIFICAR: rodapé em movimento em 3 frames ou mais; reação do personagem visível.

### 11.3 Resultado e cerimônias
- [ ] Personagem grande em pose feliz com glow dourado; título 24/800; 3 estrelas de 40 px (não ganhas apenas apagadas).
- [ ] Três StatCards 110x92 com cabeçalhos coloridos (XP dourado, Tempo azul, Precisão verde) e números contando em rajada.
- [ ] Baú SVG de 96 px balançando; ao abrir, tampa salta e moedas voam para o card de XP.
- [ ] Bênção em card Pergaminho com áudio; "Revisão da etapa" com espaço entre os textos; CTA em caixa alta.
- [ ] Confete só depois da tela montar; nenhum confete no primeiro exercício da lição seguinte.
- [ ] StreakScreen, DailyGoalScreen, CrownScreen e MissionScreen aparecem só quando o evento aconteceu, com CTA "Continuar" e `data-ceremony`.

### 11.4 Praticar (Hub)
- [ ] Cabeçalho "Praticar" 28/800 com personagem ilustrado à direita.
- [ ] Cinco cards de 80 px com ícones ilustrados de 48 px (curativo, livro, fone, microfone, raio), badge vermelho de erros, selo "60 s".
- [ ] "Situações" em carrosséis por personagem (cards 140x180 com avatar 72); "Histórias" em grid 2 colunas com capa 1:1; nenhuma lista plana de 48 itens.

### 11.5 Missões
- [ ] Banner roxo com personagem e baú; card "Missões diárias" com "FALTAM N HORAS", 4 linhas com ícone 48, barra 16 px com "7/10" e baú de 40 px no fim.
- [ ] Card "Missão mensal" com medalha e "FALTAM N DIAS"; card "Ofensiva" com chama 48, "N dias" grande e semana com chamas (sem "✓ ★ 🔒 ·").
- [ ] Sem anel de meta com engrenagem; versículo em card Pergaminho; estado zero com ilustração e CTA.

### 11.6 Personagens e ficha
- [ ] Lista agrupada por capítulo com faixa colorida e "2/3 CONHECIDOS"; linhas de 72 px com avatar 56 (anel ou cadeado), nome e virtude completa (sem reticências).
- [ ] Ficha como sheet com alça 36x4, hero 4:3 com a cabeça inteira, nome sobre o hero, abas Sobre/Lições/Versículos, lições-chave com ícones SVG, botão de áudio azul 3D, CTA "INICIAR LIÇÕES" fixo, sem botão "Fechar".

### 11.7 Perfil e Configurações
- [ ] Banner colorido de 120 px, avatar do usuário de 96 px (não o retrato de Jesus), nome 24/800, "@usuario" e data de entrada.
- [ ] Grid 2x2 de StatCards com ícones SVG; conquistas como escudos 72x80 com faixa de nível (nada em 9 px); barras de 16 px com "13/15".
- [ ] Calendário de ofensiva com chamas; capítulos como medalhas hexagonais de 64 px com motivo.
- [ ] Configurações como tela própria com toggles 50x30 verdes, tema com check azul, meta diária em lista, "APAGAR" com sheet de confirmação (sem `confirm()` nativo).

### 11.8 História e Match Madness
- [ ] História: avatar 40 falando, balão crescendo do rabinho, texto revelado por palavra, tradução revelada depois; CONTINUAR só ao fim do áudio; fim com XP contando e personagem pulando.
- [ ] Madness: placar com raio pulsando a cada acerto, relógio vermelho pulsando com vinheta nos últimos 10 s, "-2 s" flutuando no erro, troféu com bounce no fim, XP mínimo 1.

### 11.9 Modal de corações, toast e desktop
- [ ] Corações: sheet com alça, coração partido SVG de 96 px, cinco corações vazios, três ações em lista; abre e fecha por mola.
- [ ] Snackbar acima da tab bar com ícone SVG, entrando e saindo por mola; nunca dentro da lição.
- [ ] Desktop 1152: sidebar 256 com ícones ilustrados e caixa azul na ativa; centro 600 com cabeçalho sticky; rail 368 sticky com HUD, Missões do dia, Versículo e Ofensiva; sem CTA fixo.

---

## Apêndice A. Rastreabilidade dos achados das auditorias

| Achado | Severidade | Onde está resolvido neste documento |
|---|---|---|
| UI-01 nós planos com emoji | crítico | 5.2 PathNode, 6.1 |
| UI-02 CTA fixo cobrindo a trilha | crítico | 6.1 (removido; pílula "Retomar" opcional) |
| UI-03 balão COMEÇAR colidindo | crítico | 5.3 NodeBalloon (12 px acima, gap 24, float próprio) |
| UI-04 emojis como ícones em 8 arquivos | crítico | 4 (lista e lint), 4.2 (substituições) |
| UI-05 trilha invertida e 8734 px | crítico | 6.1 (cima para baixo, placeholder por capítulo) |
| UI-06 banner do capítulo na base, sem guia | alto | 5.5 UnitHeader, 6.1 UnitGuideSheet |
| UI-07 HUD de texto com emoji, XP ilegível | crítico | 5.7 Hud, 2.2 (`yellow-text`) |
| UI-08 tab bar monocromática de 11 px | alto | 5.8 TabBar |
| UI-09 sem baús, troféu e personagens na trilha | alto | 5.2, 5.22, 6.1 |
| UI-10 retratos 360x249 cortando a cabeça | alto | 5.20 (ativos v2 e fallbacks) |
| UI-11 escuro sem gold-fg e CTA branco sobre verde | alto | 2.2, 2.9 `.dark`, 2.11 |
| UI-12 tema claro creme | alto | 2.1, 2.10 |
| UI-13 missões sem baú, temporizador e número | alto | 5.28, 6.6 |
| UI-14 semana com marcas de texto | médio | 5.29 StreakWeek |
| UI-15 perfil com retrato de Jesus e "NÍVEL 2" em 9 px | alto | 6.8, 5.30 |
| UI-16 Hub com emoji e lista plana | alto | 6.5 |
| UI-17 grid de personagens truncado | médio | 6.7 |
| UI-18 ficha cortando a cabeça, sem abas | alto | 6.7 |
| UI-19 modal de corações estático | alto | 6.11, 5.23 |
| UI-20 configurações em modal com checkbox e confirm() | médio | 6.8, 5.27 |
| UI-21 toast cobrindo o título | médio | 5.24 |
| UI-22 desktop com HUD colado e rail não sticky | alto | 6.12, 6.1 |
| UI-23 fontes só do Google Fonts | alto | 3.1 (fontsource já local, preload, fallback métrico, SW) |
| UI-24 caminho tracejado e gap de 16 px | médio | 5.2, 6.1 |
| UI-25 separadores de texto e extremidades | médio | 5.6 |
| UI-26 microinterações ausentes na casca | alto | 7.3, 7.4 |
| UI-27 sem escala tipográfica, 9 e 11 px | médio | 3.2 |
| UI-28 estados vazios | baixo | 5.30 |
| UI-29 acessibilidade da navegação | baixo | 9.1 |
| UI-30 paleta de capítulos sem derivadas | médio | 2.3 |
| UI-31 pílula "Subir de nível" | médio | 5.2 (nó troféu) |
| UI-32 chips 💬 e estrelas nos nós | médio | 6.1 |
| F01 rodapé cobre o conteúdo | crítico | 5.19 (`--footer-h`), 7.5 |
| F02 personagem em círculo de 112 px | crítico | 5.20 CharacterStage |
| F03 fala com 4 linhas e dois microfones | alto | 5.17 SpeakPrompt |
| F04 peças 16/700 de 46 px | alto | 5.13 Tile |
| F05 peças não mudam de cor | alto | 5.13 |
| F06 falta o card de palavra nova | alto | 6.3 formato 20 |
| F07 transição com tela vazia | alto | 7.3, 7.5 |
| F08 rodapé com hierarquia errada | alto | 5.19 |
| F09 opção escondida nas cenas | alto | 5.19 (`scrollIntoView`), 6.3 formato 22 |
| F10 combo dourado em x2 e "X" | médio | 5.10 |
| F11 slot de 24 px do combo | médio | 5.10, 6.2 |
| F12 corações como emoji | médio | 6.2 |
| F13 link de pular colado às opções | médio | 6.2 |
| F14 opções 16/700 | médio | 5.14 |
| F15 botão de áudio em caixa | médio | 5.16 |
| F16 balão de largura total | médio | 5.12 |
| F17 pares de 72 px em negrito | médio | 5.15 |
| F18 input de 1 linha e chips de lacuna | médio | 5.18 |
| F19 pesos misturados nas dicas | médio | 5.12, 3.2 |
| F20 tudo em 700/800 | médio | 3.2 |
| F21 personagem não reage nem fala | médio | 5.20, 7.5 `useTalking` |
| F22 PracticeBar em 12 formatos | médio | 6.2 |
| F23 CTA escuro branco sobre verde | médio | 2.2, 5.1 |
| F24 emojis em links, dicas e toasts | médio | 5.13, 5.24, 6.3 |
| F25 interstício pequeno | médio | 6.3 formato 21 |
| F26 ícone duplicado no título | médio | 6.3 formato 7 |
| F27 diff por palavra nas escolhas | médio | 5.19 |
| F28 feedback em três linhas | médio | 5.19 |
| F29 leitura de cena sem karaokê | médio | 6.3 formato 22 |
| F30 banco das cenas divergente | médio | 5.13 WordBankCore |
| F31 toasts na lição | médio | 5.24 |
| F32 peças flutuando 6 px | baixo | 5.13 AnswerLines |
| F33 brilho e cor da barra | baixo | 5.10 |
| F34 X de 20 px | baixo | 6.2 |
| F35 confete vazando | baixo | 6.4 |
| F36 "Revisão da etapa" colado | baixo | 6.4 |
| F37 CTA do Result em caixa baixa | baixo | 6.4 |
| F38 explain em exercício pulado | baixo | 5.19 |
| F39 só bandeira no rodapé | baixo | 5.19 |
| F40 cards de imagem | baixo | 5.14 |
| F41 chat das cenas denso | baixo | 6.3 formato 22 |
| F42 semântica de rádio e aria-live | baixo | 5.13, 5.14, 9.1 |
| F43 opção correta também verde | baixo | 5.14 |
| F44 títulos em duas linhas | baixo | 3.2 |
| DYN-01 Result estático | crítico | 6.4, 7.3 |
| DYN-02 baú sem vida | alto | 5.22, 7.3 |
| DYN-03 painel de feedback em 1 frame | alto | 5.19, 7.3, 7.5 |
| DYN-04 troca de exercício vazia | alto | 7.3, 7.5 |
| DYN-05 reação recortada | alto | 5.20 |
| DYN-06 onSpeak sem assinante | alto | 7.5 `useTalking` |
| DYN-07 Math.random no JSX | alto | 7.2 regra 10, 7.5 |
| DYN-08 tap em todo botão, select nunca | alto | 8.2, 0.3 |
| DYN-09 toast sem animação | alto | 5.24 |
| DYN-10 modal de corações instantâneo | alto | 6.11, 5.23 |
| DYN-11 perder coração sem animação | médio | 7.3 |
| DYN-12 combo sem fogo | médio | 5.10, 7.3 |
| DYN-13 barra só avança no Continuar | médio | 5.10 |
| DYN-14 sem transição de telas | médio | 7.3 |
| DYN-15 nó não comemora | médio | 7.3 |
| DYN-16 sem cerimônias | médio | 6.4 |
| DYN-17 confete fora de hora | médio | 6.4, 7.5 |
| DYN-18 estrelas sem som | médio | 7.3 |
| DYN-19 Madness sem game feel | médio | 6.10, 7.3 |
| DYN-20 História sem vida | médio | 6.9, 7.3 |
| DYN-21 interstício | médio | 6.3 formato 21 |
| DYN-22 afundamento duplicado | médio | 5.1 |
| DYN-23 reduced motion incompleto | médio | 7.2 regra 11, 9.1 |
| DYN-24 peça sem pouso e som | baixo | 5.13 |
| DYN-25 animate-pulse no áudio | baixo | 5.16 |
| DYN-26 anel e barras de Missões | baixo | 5.10, 5.11, 6.6 |
| DYN-27 sheets sem saída | baixo | 5.23 |
| DYN-28 haptics sem mapa | baixo | 8.1 |
| DYN-29 paleta sonora curta | médio | 8.2 |

## Apêndice B. Riscos e mitigações

1. Contraste do CTA claro (branco sobre `#58cc02`, 2,09:1). Assinatura visual do Duolingo que falha AA. Mitigação: exceção declarada + preferência "Alto contraste" (`#131f24`, 8,05:1); todo texto informativo usa as cores `text`; rodar `contrast-check.mjs` no CI.
2. Ativos de personagem são a entrega mais cara (22 do `UNIT_CAST` x 6 arquivos em P0). Mitigação: `CharacterStage` degrada para `bust` em círculo e depois para o JPG atual; prompt mestre fixo (mesmo estilo pintado, luz do alto à esquerda, fundo transparente, olhos a 40%), folha de contato para aprovação, `full` + `mouth-open` primeiro.
3. Paleta nova muda u2 (roxo para azul), u3 (amarelo para laranja), u5 (oliva para teal), u6 (teal para rosa), u8 (azul para azul-real): medalhas do Perfil e banner mudam para usuários atuais. Mitigação: comunicar como parte da reformulação; `core/palette.js` indexado por id, sem tocar `data.js` nem o app clássico.
4. Migração de tokens em dezenas de arquivos. Mitigação: aliases em `@theme` por um sprint, codemod, lint contra hex hard-coded fora de `ui/` e `icons/`.
5. Desempenho da trilha (80 nós, molas, personagens laterais, headers sticky). Mitigação: `content-visibility: auto` por capítulo, placeholder de altura fixa fora da viewport, `whileInView once`, WebP de 280 px com `loading="lazy"` e `decoding="async"`, halo por transform, `will-change` só no nó atual, um único balão com animação infinita.
6. `AnimatePresence mode="popLayout"` exige pai `relative`, altura estável e `forwardRef` nos componentes; o filho que sai fica absoluto e pode sobrepor o rodapé. Mitigação: `min-height` do exercício anterior durante a transição e `overflow-x: hidden`; se oscilar, `mode="sync"` com `position: absolute` manual no `exit`.
7. Inversão da trilha, popover, textarea e cerimônias quebram os drivers e2e. Mitigação: seção 10.2 (drivers primeiro, em modo tolerante).
8. Teclado virtual no iOS com rodapé `fixed`. Mitigação: `100dvh`, `scrollIntoView` no foco, esconder o rodapé enquanto `visualViewport` encolhe, Enter como VERIFICAR.
9. iOS Safari não tem `navigator.vibrate`; `SpeechRecognition` varia. Mitigação: haptics como aprimoramento progressivo; "NÃO POSSO FALAR AGORA" sempre visível; troca por leitura quando não suportado.
10. Pipeline pós-lição pode virar 4 telas seguidas. Mitigação: cada tela só aparece quando o evento aconteceu naquela lição; toque pula para o estado final; nenhuma dura mais de 2,5 s sem interação.
11. Som novo depende de geração externa. Mitigação: mapa provisório com os 9 sons atuais e variação de pitch (8.2); sprite v2 versionado no SW.
12. Lint anti-emoji pode bloquear conteúdo legítimo. Mitigação: a regra mira literais JSX e atributos, não valores de dados; emoji de dados renderizado em `span.emoji`.
13. Fontes e service worker: sem precache, o PWA offline cai na fonte do sistema (as 98 capturas da auditoria renderizaram em DejaVu Sans). Mitigação: preload do woff2, precache do shell, `CACHE = "biblialearn-react-v2"`.
14. Escopo: ~45 componentes e 10 telas; risco de dois visuais convivendo. Mitigação: ordem de entrega por marco (Apêndice C) com captura comparativa a cada marco e critério de pronto binário.
15. Tailwind v4: `--text-*` colide com cores de mesmo sufixo; `--animate-*` exige `@keyframes` no `@theme`; aliases não podem usar `@theme inline`. Mitigação: nomes de cor sem sufixos de tamanho, keyframes dentro do bloco, aliases com `var()` simples.

## Apêndice C. Ordem de entrega e critério de pronto

| Marco | Entregas | Critério de pronto |
|---|---|---|
| M1 Fundações (P0) | `index.css` novo com aliases; `core/motion.js`, `core/sfx.js`, `core/haptics.js`, `core/palette.js`; `Icon.jsx` + `icons/`; `Button3D`, `Bubble`, `Tile`, `Option`, `TextCard`, `FeedbackFooter`, `CharacterStage`, `CountUp`, `Sheet`, `Snackbar`; drivers e2e atualizados | `contrast-check` verde nos dois temas; zero emoji em JSX da casca e da lição (lint); `e2e-course.mjs` "CURSO COMPLETO OK"; rajadas: troca sem frame vazio, rodapé em 3 frames, reação visível |
| M2 Lição e Result (P0/P1) | 22 formatos conforme 6.3 (inclui `word-card`, `SpeakPrompt`, `WordBankCore`, `MatchCell`); Result em cascata com `Chest`; `HeartsSheet` | checklist 11.2 e 11.3 completo nos dois temas; `shots-visual.mjs` com capturas de todos os formatos |
| M3 Trilha e casca (P1) | Home de cima para baixo com `PathNode`, `UnitHeader`, `NodePopover`, `NodeBalloon`, `SegmentRing`, baús e personagens laterais; `Hud`; `TabBar`; `SectionDivider` | checklist 11.1 completo; 60 fps em scroll no Android médio (Chrome DevTools Performance, CPU 4x) |
| M4 Abas (P1) | Hub, Missões, Personagens + ficha, Perfil + Configurações, História, Madness | checklists 11.4 a 11.8 completos |
| M5 Cerimônias e polimento (P2) | Streak, DailyGoal, Crown, Mission screens; `UnitGuideSheet`; desktop em 3 colunas; ativos v2 dos 22 personagens; sprite `sfx-v2`; reduced motion e haptics como preferências | checklist 11.3 (cerimônias) e 11.9 completos; `prefers-reduced-motion` verificado em rajada; aliases de tokens removidos; `tools/content/validate.js` e `contrast-check` no CI |

Fim do documento.
