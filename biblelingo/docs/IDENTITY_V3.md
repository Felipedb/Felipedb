# BíbliaLearn: Identidade Visual V3

Direção de arte da reformulação "parecido com o Duolingo, lindo, vivo e fácil". Este documento prevalece sobre `docs/VISUAL_SPEC.md` onde divergir; o resto da VISUAL_SPEC (contratos de teste da seção 10, sons, acessibilidade) continua valendo. Os achados de usabilidade numerados estão em `docs/UX_AUDIT_V3.md` (UX-01 a UX-44) e são citados aqui pelo número.

Evidências: capturas da auditoria em `scratchpad/ux-audit/r3-light/` e `r3-dark/` (jogo real como usuário novo, 390x844) e em `scratchpad/shots-now/{dark,light}/`. Referências: 11 telas do Duolingo real (`refs/2115c98f`, `3b852f1b`, `51a0685b`, `568c98d4`, `ae856f0e`, `af04a0f5`, `bed6c88f`, `ce268949`, `d4dfd400`, `d51aafbb`, `da162265`) e 4 mockups do dono (`refs/006a1702`, `2bf4fe01`, `7471e956`, `89fe17e1`).

Critério de pronto (do dono): um usuário do Duolingo abre o app e acha bonito, vivo e fácil, sem nada com cara de protótipo.

---

## 1. Norte em uma frase

**Duolingo na estrutura, no ritmo e no feedback; Bíblia nos personagens pintados, na luz dourada e no pergaminho.** O personagem é o protagonista de toda tela, a ilustração é 3D (Fluent), a cor vem em blocos chapados com sombra dura, e nada é texto corrido.

### 1.1 Diagnóstico visual (o que deixa o app "feio" hoje)

| # | Problema | Evidência | Peso |
|---|---|---|---|
| D1 | Personagem pequeno, cortado reto no peito, sem chão, flutuando (110 a 134 px) | `r3-light/13-licao-1-ex-choice-en-pt`, `01-primeira-abertura`, `43-licao-13-intersticio` | P0 |
| D2 | Emoji do sistema como ilustração (🐾 para "animal", 🆗 para "Era bom", 📅 "July 17" para "dia", 👤 para "à imagem de Deus") | `15-licao-2-ex-image-choice`, `51-cena-image-choice`, `shots-now/dark/ex-image-choice` | P0 |
| D3 | Trilha: nós bloqueados todos com cadeado, laterais vazias, cartão "Antigo Testamento" com rolo de pergaminho em estilo foto | `01-primeira-abertura`, `91-trilha-topo` | P0 |
| D4 | HUD com retângulo verde ambíguo e "0" cinzas sem explicação | `01-primeira-abertura`, `02-hud-pop-0` | P0 |
| D5 | Cerimônias brancas e vazias em série (3 telas "Missão concluída" seguidas) | `62/63/64-cena-cerimonia` | P0 |
| D6 | Perfil com "D" genérico e banner verde apagado | `75-perfil`, `shots-now/dark/profile` | P0 |
| D7 | Baú de recompensa em estilo foto, destoando de todo o resto | `46-resultado` | P1 |
| D8 | Toasts pretos sobre a área de feedback da lição | `40-fb-ok-speak`, `41-licao-12-ex-read` | P0 |
| D9 | Sem boas-vindas: o app abre direto na trilha com zeros | `01-primeira-abertura` | P0 |

---

## 2. O que copiar do Duolingo e o que é nosso

### 2.1 Copiar (estrutura e sensação)

| Aspecto | Regra copiada | Referência |
|---|---|---|
| Estrutura da lição | Topo: X, barra de progresso grossa (16 px) e corações. Título do exercício em negrito à esquerda. Personagem grande à esquerda com balão à direita. Rodapé fixo com VERIFICAR | `ae856f0e`, `d4dfd400` |
| Ritmo | Uma ideia por tela; exercício novo entra pela direita em 250 ms; rodapé de feedback sobe por mola; sem tela vazia entre exercícios | `bed6c88f`, `ce268949` |
| Feedback | Faixa colorida suave (verde ou vermelha) com ícone em círculo, título curto e engraçado ("Amém!", "Fez bonito!"), a resposta certa embaixo, CTA cheio | `af04a0f5`, `bed6c88f` |
| Personagem protagonista | Corpo grande, fala com animação de boca/balanço, reage ao acerto e ao erro, fica em pé sobre uma elipse de sombra | `ae856f0e`, `d4dfd400`, `d51aafbb` |
| Cor | Blocos chapados saturados, sombra dura de 4 px na cor escura da mesma família, zero sombra difusa | todos |
| Densidade | Pouco texto, alvos grandes (opções de 56 a 64 px), muito ar entre blocos | `da162265` |
| Tipografia | Rótulos de botão em caixa alta com espaçamento, títulos pesados e arredondados | todos |
| Trilha | Nós 3D em zigue-zague, nó atual com anel de progresso e balão COMEÇAR flutuando, personagens e baús nas laterais | mockup `89fe17e1` (trilha com personagens redondos) |
| Celebração | Confete, contagem dos números, estrelas que estalam, personagem pulando com luz atrás | mockup `006a1702` ("Great job!") |
| Combo | Rótulo "COMBO xN" acima da barra, barra amarela com brilho a partir de x5 | `d4dfd400`, `da162265` |

### 2.2 Próprio do BíbliaLearn

| Elemento | Regra |
|---|---|
| Personagens pintados recortados | Bustos de `chars/v2/<chave>/bust.webp` (estilo pintado, 44 personagens) são a mascote coletiva. Jesus abre o app (boas-vindas) como o Duo abre o Duolingo |
| Luz dourada | Halo radial `#ffc800` a 35% atrás do personagem no Resultado, na ofensiva, na coroa e no nó lendário. Nunca em tela comum |
| Pergaminho | Superfície creme `#fbf5e6` (claro) / `#2b2619` (escuro) só para versículo: card do versículo no Resultado, exercício "Complete o versículo", "O que aconteceu de verdade" nas cenas, Versículo do dia e ficha (aba Versículos) |
| Versículos | Referência em caixa alta pequena ("GÊNESIS 1:1") em `parchment-text`; citação em Nunito 600 itálico não, reto, entre aspas curvas |
| Microcopy de fé | Títulos de acerto incluem "Amém!", "Glória!", "Fez bonito!"; nunca em erro |
| Capítulos coloridos | Cada capítulo tem uma família (verde, azul, laranja, roxo, teal, rosa, vermelho, royal); amarelo é exclusivo de recompensa |

---

## 3. Paleta final

Os valores abaixo substituem os de `app/src/index.css` onde diferirem. Tema "auto" segue o sistema; o claro é branco puro, sem creme na página.

### 3.1 Neutros

| Token | Claro | Escuro | Papel |
|---|---|---|---|
| `page` | `#ffffff` | `#131f24` | fundo de toda tela |
| `raised` | `#f7f7f7` | `#202f36` | campo de texto, linha de lista ativa, trilho de barra |
| `line` | `#e5e5e5` | `#37464f` | borda 2 px de card e opção, divisória |
| `ink-strong` (novo) | `#3c3c3c` | `#ffffff` | títulos e números grandes |
| `ink` | `#4b4b4b` | `#f1f7fb` | texto de corpo, opções, peças |
| `muted` | `#6f6f6f` | `#8fa3ad` | legenda, subtítulo (4,69:1 sobre `#f7f7f7`; 5,27:1 sobre `#202f36`) |
| `disabled` | `#afafaf` | `#52656d` | botão desabilitado, ícone de nó bloqueado |
| `overlay` | `rgba(0,0,0,.5)` | `rgba(0,0,0,.6)` | scrim de sheet e modal |

### 3.2 Cores de papel fixo

| Família | Base | Sombra | Suave claro / escuro | Texto claro / escuro | Papel |
|---|---|---|---|---|---|
| Verde (marca) | `#58cc02` | `#58a700` | `#d7ffb8` / `#1d3a17` | `#3f7d12` / `#93d333` | CTA, acerto, nó concluído, capítulo 1 |
| Azul (Céu) | `#1cb0f6` | `#1899d6` | `#ddf4ff` / `#14313f` | `#0f6f9f` / `#49c0f8` | áudio, link, seleção, foco |
| Vermelho (Rubi) | `#ff4b4b` | `#ea2b2b` | `#ffdfe0` / `#40191c` | `#b32a2a` / `#ff7b7b` | erro, coração |
| Laranja (Chama) | `#ff9600` | `#e68a00` | `#ffe0b3` / `#3a2a10` | `#d96c00` / `#ff9600` | ofensiva, "Corrija o erro de antes" |
| Ouro (Luz) | `#ffc800` | `#e5a600` | `#fff3bf` / `#33290f` | `#b88100` / `#ffc800` | XP, estrela, coroa, baú, combo, Perfeito |
| Roxo (Púrpura) | `#ce82ff` | `#a560e8` | `#f3e0ff` / `#2c2140` | `#7b3fd1` / `#c4a8ef` | "Palavra nova", Missões, conquistas |
| Pergaminho | `#fbf5e6` | linha `#ecdfbf` | escuro `#2b2619`, linha `#4a4128` | `#7a5a16` / `#e8d7a8` | só versículos (seção 2.2) |

Mudanças em relação ao `index.css` atual: `green-shadow` passa de `#46a302` para `#58a700` (valor do Duolingo, sombra menos escura); `red-shadow` `#d33131` para `#ea2b2b`; pergaminho escuro deixa de ser `#1e2a2c` (azulado, não parece pergaminho) e vira `#2b2619` com texto `#e8d7a8` (10,6:1); novos `ink-strong`, `orange-text` claro `#d96c00` (3,45:1, só em numeral 19 px 800) e `yellow-text` claro `#b88100` (3,4:1, idem).

### 3.3 Texto sobre cor

| Superfície | Claro | Escuro | Nota |
|---|---|---|---|
| CTA verde `#58cc02` | texto `#ffffff` 800 caixa alta | CTA `#93d333`, texto `#131f24` | branco sobre verde é 2,09:1 como no Duolingo; o modo Alto contraste troca por `#131f24` (já existe) |
| CTA vermelho (Entendi) | `#ffffff` sobre `#ff4b4b` | `#131f24` sobre `#ee5555` | |
| Cabeçalho de capítulo | `#ffffff` sobre a base da família | igual | título 19 px 800 |
| Balão COMEÇAR | texto na cor do capítulo sobre `#ffffff`, borda 2 px `line` | texto `unit-text` escuro sobre `#202f36`, borda 2 px `#37464f` | ver 7.2 |
| Números do HUD | ofensiva `#d96c00`, XP `#b88100`, corações `#ea2b2b` | `#ff9600`, `#ffc800`, `#ff4b4b` | 19 px 800 (texto grande) |

### 3.4 Capítulos

Mantém `core/palette.js` (ciclo verde, azul, laranja, roxo, teal, rosa, vermelho, royal). Uso: cabeçalho do capítulo, face dos nós disponíveis e concluídos, anel do nó atual, chip do capítulo na ficha, fundo suave do card de personagem.

---

## 4. Sistema de ilustração: Fluent Emoji 3D via `<Illo>`

### 4.1 Regra

Todo objeto ilustrado (palavra, missão, conquista, atalho do Hub, HUD, prêmio) é um webp 3D do pacote MIT `@lobehub/fluent-emoji-3d`, renderizado pelo componente `<Illo>`. Emoji do sistema nunca aparece na tela (UX-04). Ícone de interface (X, setas, alto-falante, microfone, cadeado, check, engrenagem, teclado, bandeira de reportar, abas) continua SVG de `app/src/icons`.

### 4.2 Componente

```jsx
<Illo emoji="🔥" size={32} alt="" />            // dado de conteúdo (data.js / icons.js)
<Illo code="1f4d6" size={48} alt="Bíblia" />    // uso de interface
```

- Resolução: emoji para codepoints em hex minúsculo unidos por "-"; procura `illo/<code>.webp`, depois sem `-fe0f`, depois com `-fe0f` no fim do primeiro codepoint. Sem arquivo: círculo `raised` com a primeira letra do `alt` em 800 (nunca o emoji cru).
- Ativos: o pacote fica só em devDependency; `scripts/copy-illo.mjs` (rodado no `prebuild` e no dev) varre `src/core/illoMap.js`, o `icons.js` exposto pelo plugin do Vite e a lista de UI da 4.4, e copia os webp de `node_modules/@lobehub/fluent-emoji-3d/assets/` (o caminho real é `assets/`, não `package/assets/`) para `app/public/illo/`. O app nunca importa o pacote.
- `<img width height loading="lazy" decoding="async" draggable="false">`, `aspect-ratio: 1`, sem borda, sem fundo. Sombra própria do 3D basta.
- `illoMap.js` (do app) sobrescreve escolhas ruins do conteúdo sem editar `icons.js` (outra equipe): ver 4.5.

### 4.3 Tamanhos por contexto

| Contexto | Tamanho | Observação |
|---|---|---|
| HUD | 28 | ao lado do número |
| Linha de missão, conquista em lista, linha do Hub | 40 | à esquerda, centrado vertical |
| Chip de vocabulário (cena, "Você praticou") | 24 | |
| Prompt com palavra no balão (Digite em inglês: 🌍 terra) | 28 | |
| Opção de "Selecione a imagem" | 72 | cartão 2x2 de 171x150 |
| Cartão "Palavra nova" (word-card) | 120 | centro, com leve flutuação |
| Pares com imagem | 48 | |
| Card do Hub (grade) | 64 | |
| Cerimônia de missão, modal de corações, estado vazio | 96 a 128 | entra com pop |
| Popover do nó (3 palavras da lição) | 32 | substitui a lista "Vocabulário: earth, light..." |

### 4.4 Mapa de interface (codepoints conferidos no pacote)

| Uso | Emoji | Arquivo |
|---|---|---|
| Curso no HUD | 📖 | `1f4d6.webp` |
| Ofensiva acesa / apagada | 🔥 / 🔥 com `grayscale(1) opacity(.45)` | `1f525.webp` |
| XP | ⚡ | `26a1.webp` |
| Coração cheio / partido | ❤️ / 💔 | `2764-fe0f.webp` / `1f494.webp` |
| Coroa | 👑 | `1f451.webp` |
| Troféu | 🏆 | `1f3c6.webp` |
| Medalha | 🏅 | `1f3c5.webp` |
| Estrela / Perfeito | ⭐ / 🌟 | `2b50.webp` / `1f31f.webp` |
| Missões diárias | 🎯 | `1f3af.webp` |
| Missão mensal | 📅 | `1f4c5.webp` |
| Erros (Hub) | 🩹 | `1fa79.webp` |
| Palavras (Hub) | 📚 | `1f4da.webp` |
| Escuta (Hub) | 🎧 | `1f3a7.webp` |
| Fala (Hub) | 🎙️ | `1f399-fe0f.webp` |
| Match Madness | ⚡ | `26a1.webp` |
| Histórias / Versículo | 📜 | `1f4dc.webp` |
| Cenas do dia a dia | 💬 | `1f4ac.webp` |
| Meta diária (onboarding) | ⏱️ | `23f1-fe0f.webp` |
| Fé, oração | 🙏 | `1f64f.webp` |
| Paz | 🕊️ | `1f54a-fe0f.webp` |
| Luz | 💡 / 🕯️ | `1f4a1.webp` / `1f56f-fe0f.webp` |
| Decoração da trilha | 🐑 🌿 🕊️ 📜 🏺 ⛵ 🌈 🐟 🍞 🍇 | `1f411`, `1f33f`, `1f54a-fe0f`, `1f4dc`, `1f3fa`, `26f5`, `1f308`, `1f41f`, `1f35e`, `1f347` |
| Celebração | 🎉 ✨ 💯 | `1f389`, `2728`, `1f4af` |

Baú: não existe emoji de baú; continua o componente `Chest` próprio, redesenhado em 3D chapado na mesma linguagem (seção 7.9), nunca a imagem em estilo foto do Resultado atual.

### 4.5 Correções de conteúdo via `illoMap.js` (sem editar `icons.js`)

| Palavra | Hoje | Proposta |
|---|---|---|
| animal | 🐾 | 🐑 `1f411` |
| Era bom / good (frase) | 🆗 | 👍 `1f44d` (e "bom" ganha ✨ `2728`) |
| dia | 📅 ("July 17", texto em inglês) | ☀️ `2600-fe0f` |
| noite | 🌃 | 🌙 `1f319` |
| escuro | 🌑 | 🌑 `1f311` (fica) |
| à imagem de Deus | 👤 | 🪞 `1fa9e` (espelho: "imagem"); reserva 🧑 `1f9d1` |
| Venha comigo | 🚶 | 👋 `1f44b` |
| agora mesmo | ⏱ | ⚡ `26a1` |
| Vamos | ➡️ | 🏃 `1f3c3` |

A lista completa sai de um script que renderiza todas as palavras do `icons.js` em grade (claro e escuro) para revisão; a equipe de conteúdo decide se adota no `icons.js` depois.

---

## 5. Personagens

### 5.1 Regra geral

- Sempre o busto recortado `chars/v2/<chave>/bust.webp`, sem moldura, sem fundo pintado, em pé sobre uma **elipse de sombra**.
- A base reta do busto nunca aparece crua: máscara `mask-image: linear-gradient(to top, transparent 0, #000 14%)` nos últimos 14% da altura, e a elipse cobre a transição.
- Elipse: largura 72% do busto, altura 10% do busto, centro na base, `rgba(0,0,0,.10)` no claro e `rgba(0,0,0,.32)` no escuro, `border-radius: 50%`, sem blur (sombra chapada, como no Duolingo).
- Nenhum badge de emoji de reação (o rostinho amarelo atual some, UX-03). A reação é do corpo.
- Retrato redondo (JPG `chars/<chave>.jpg` em círculo com anel de 4 px na cor do capítulo) só em: avatares de 40 a 56 px (chat da cena, lista, seletor de avatar) e nos personagens de reserva da 5.4.

### 5.2 Tamanhos por tela (altura do busto)

| Tela | Altura | Posição |
|---|---|---|
| Boas-vindas (onboarding 1) | 240 | centro, balão acima à direita |
| Onboarding 2 a 4 | 140 | canto superior esquerdo, balão à direita |
| Trilha (decoração lateral) | 120 a 140 | alterna esquerda e direita a cada 4 nós, a 24 px do nó |
| Popover do nó | 72 | não usar; o popover leva Illos (4.3) |
| Lição, exercício com balão | 150 (palco de 160) | esquerda, balão à direita com rabicho |
| Fala ("Repita o que X disse") | 220 | centro, balão acima, microfone abaixo |
| Interstício "Vamos corrigir" | 200 | direita, inteiro na tela, balão à esquerda (hoje cortado, UX-08) |
| Resultado | 200 | centro, luz dourada atrás |
| Cerimônias | 160 | centro |
| Cena: intro | 120 cada (dois, frente a frente) | seta entre eles |
| Cena: conversa | 44 redondo | ao lado do balão |
| Cena: verdade e resultado | 160 | |
| História (topo) | 120 | elenco da história lado a lado |
| Hub (cabeçalho) | 110 | direita |
| Missões (banner) | 120 | direita, sai pela borda de cima do banner |
| Personagens (card da grade) | 96 | sobre fundo suave do capítulo |
| Ficha (herói) | arte JPG de cena (fica) | o busto não substitui a pintura |
| Perfil (avatar) | 104 redondo | busto dentro de círculo com anel do capítulo |
| Modal de corações, estado vazio | 140 | |

### 5.3 Animação

| Estado | Movimento | Duração |
|---|---|---|
| Ocioso (respiração) | `scale` 1 a 1.02 e volta, origem na base | 3 s, ease-in-out, infinito; desliga com reduced motion |
| Falando (áudio tocando) | `y` 0 a -3 e `rotate` -1 a 1 alternados | 240 ms por ciclo enquanto o áudio toca |
| Acerto | pulo `y` 0 a -14 a 0 com `scaleY` 0.96 na aterrissagem; elipse encolhe para 80% no topo do pulo | 420 ms, mola SPRING.pop |
| Erro | inclinação `rotate` 0 a -6 a 0 e `x` ±4 | 380 ms |
| Entrada no exercício | `opacity` 0 a 1, `y` 12 a 0 | 250 ms, junto com o exercício |
| Resultado | entra de baixo (`y` 40 a 0) com pulo duplo ao fim da contagem | 600 ms |

Reduced motion: sem respiração, sem pulo; acerto e erro viram troca de 120 ms de opacidade do halo.

### 5.4 Avaliação dos 44 bustos (revisados sobre fundo magenta, escuro e branco)

| Situação | Personagens | Ação |
|---|---|---|
| Bons | adao, arao, barnabe, bartimeu, calebe, daniel, davi, debora, eliseu, ester, eva, ezequiel, filipe, gideao, isaac, jaco, jesus, jonas, jose, josepai, josue, lidia, madalena, maria, marta, natanael, neemias, paulo, pedro, rebeca, salomao, samuel, sansao, sara, timoteo, tome, zaqueu | usar como busto |
| Reserva (retrato redondo) | `isaias` (rosto chapado, outro estilo), `joaobatista` (recorte semitransparente, fundo escuro residual: alfa semi/opaco 4,7) | `BUST_FALLBACK` no app |
| Limpar antes de usar | `abraao` (mancha do fundo à esquerda), `moises` e `elias` (mão branca semitransparente), `rute` (trigo-fantasma à direita), `noe` (pedaço da arca à esquerda) | rodar limpeza de alfa em `tools/cut-chars.py` (alfa < 40 vira 0, erosão de 1 px, remover componentes desconexos menores que 2% da área); até lá, reserva |

Implementação: `BUST_FALLBACK = new Set(["isaias", "joaobatista", "abraao", "moises", "elias", "rute", "noe"])` em `components/ui/CharacterStage.jsx`/`Avatar.jsx`; remover da lista cada um que for limpo.

### 5.5 Carga sem salto

Hoje o JPG redondo aparece e depois troca para o busto (UX-16, `r3-light/00-first-paint`). Regra: o palco reserva o tamanho final; a decisão busto ou reserva vem da lista estática (5.4), sem sondar o arquivo em tempo de execução; o busto entra com `opacity` 0 a 1 em 180 ms quando carregar; `<link rel="preload">` do busto do personagem da trilha atual e de Jesus.

---

## 6. Tipografia

### 6.1 Famílias

- **Baloo 2** (700 e 800): títulos de tela, título do exercício, títulos de celebração, números de cerimônia, título do cabeçalho do capítulo, wordmark. É a fonte mais próxima da "Feather Bold" do Duolingo e dá personalidade; hoje está restrita ao wordmark e a interface ficou genérica.
- **Nunito** (500 a 900): todo o resto (frases, opções, peças, botões, legendas, números de HUD).

### 6.2 Escala

| Token | Família | Tamanho / linha | Peso | Uso |
|---|---|---|---|---|
| `display-xl` | Baloo 2 | 40 / 44 | 800 | número da ofensiva na cerimônia, "Lição concluída!" |
| `display` | Baloo 2 | 30 / 36 | 800 | boas-vindas, título de cerimônia |
| `title` | Baloo 2 | 26 / 32 | 700 | título de aba ("Praticar", "Personagens") |
| `prompt` | Baloo 2 | 24 / 30 | 700 | título do exercício ("Selecione a imagem:") |
| `heading` | Nunito | 19 / 26 | 800 | título de card, cabeçalho de capítulo, título do feedback (24 no rodapé) |
| `sentence` | Nunito | 19 / 28 | 600 | frase do balão, frase a traduzir |
| `option` | Nunito | 17 / 24 | 600 | opção, peça, célula de par |
| `body` | Nunito | 17 / 24 | 500 | texto corrido curto |
| `secondary` | Nunito | 15 / 22 | 500 | subtítulo, descrição |
| `label` | Nunito | 15 / 20 | 800, caixa alta, tracking 0,8 px | botões |
| `caption` | Nunito | 13 / 18 | 800, caixa alta, tracking 0,8 px | rótulos ("PALAVRA NOVA", "SEÇÃO 1") |
| `numeral` | Nunito | 19 / 24 | 800, `tabular-nums` | HUD, contadores |

Regras: nenhum texto de interface menor que 13 px; frase de exercício nunca menor que 17 px; títulos de feedback com no máximo 18 caracteres para caber em uma linha (UX-06).

---

## 7. Forma, profundidade e componentes

### 7.1 Raios e sombras (só sombra dura)

| Elemento | Raio | Borda | Sombra |
|---|---|---|---|
| Botão CTA (50 px de altura) | 16 | nenhuma | `0 4px 0 <sombra da família>`; pressionado: `translateY(4px)` e sombra 0 |
| Botão secundário (outline) | 16 | 2 px `line` | `0 4px 0 line` |
| Opção, peça, célula de par, card do Hub | 16 (peça 12) | 2 px `line` | `0 4px 0 line` (borda inferior grossa, como no Duolingo) |
| Opção selecionada | 16 | 2 px `blue-line` | fundo `blue-soft`, texto `blue-text`, sombra `0 4px 0 blue-line` |
| Card de conteúdo (missão, perfil) | 16 | 2 px `line` | nenhuma |
| Nó da trilha | círculo 72 (face) | nenhuma | `0 8px 0 <sombra do capítulo>`; bloqueado `0 8px 0 #c4c4c4` (claro) / `#2a3940` (escuro) |
| Sheet e modal | 24 no topo | nenhuma | scrim |
| Balão de fala | 16 | 2 px `line` | nenhuma; rabicho de 12 px |

### 7.2 Balão COMEÇAR / RETOMAR

Pílula 2 px `line`, fundo `#ffffff` no claro e `#202f36` no escuro com borda `#37464f`, texto `label` na cor do capítulo (no escuro, `unit-text` escuro), seta de 10 px para baixo, flutuação `y` 0 a -6 em 1,4 s. No escuro hoje parece um botão apagado: a borda clara e o texto na cor do capítulo resolvem.

### 7.3 Ícones SVG

Traço 2,5 px, cantos arredondados, 24 px no corpo e 28 a 32 px no topo da lição e na tab bar. Cor: `muted` neutro, `blue` para áudio, cor da família quando ativo. Alvo mínimo de toque 44x44 mesmo quando o desenho é 24.

### 7.4 Espaçamento e densidade

- Grade de 8; calha lateral de 16 no celular.
- Entre título do exercício e personagem: 16. Entre personagem e opções: 24. Entre opções: 12. Altura mínima de opção de texto: 56; de peça: 48 (hoje 44 a 46).
- Telas de lista: cards separados por 12; seções separadas por 32 com título `heading`.
- Nada de parágrafos com mais de 2 linhas fora do versículo e da ficha.

---

## 8. Movimento

| Momento | Regra | Duração |
|---|---|---|
| Troca de aba | conteúdo novo entra com `x` 24 a 0 na direção da aba (esquerda ou direita) e `opacity`; a caixa da aba ativa desliza (`layoutId`) | 220 ms |
| Troca de exercício | antigo sai `x` 0 a -40 e some; novo entra `x` 40 a 0 (`popLayout`), sem quadro vazio | 250 ms |
| Rodapé de feedback | sobe `y` 100% a 0 por mola; título com pop de escala 0,9 a 1; ícone em círculo gira 0 a 360 no acerto, treme no erro | 300 ms |
| Opção tocada | `scale` 0,97 no toque, borda azul em 80 ms | 80 ms |
| Peça do banco | voa até a resposta com `layoutId`, pousa com overshoot | 220 ms |
| Barra de progresso | anima largura com mola; brilho que corre a cada acerto | 400 ms |
| Combo | "COMBO xN" entra com pop; a partir de x5 a barra fica dourada com shimmer | 300 ms |
| Personagem | seção 5.3 | |
| Resultado | personagem entra, título com pop, estrelas uma a uma (300 ms entre elas, com som), cards de estatística com contagem, baú pulsa; CTA aos 1,2 s (hoje 2,2 s, UX-10) | 1,2 s |
| Cerimônias | uma tela por tipo, nunca várias telas iguais em série (UX-12) | |
| Trilha ao abrir | rola até o nó atual centrado, sem animação visível; nó atual com halo pulsando 1,6 s | |
| Desbloqueio de nó | nó cinza gira 180 e vira colorido com faísca, balão COMEÇAR salta para ele | 600 ms |
| Sheets | mola de baixo, arrastável para fechar | 300 ms |
| Reduced motion | tudo vira fade de 120 ms; sem confete, sem respiração | |

Proibido: toast flutuante preto dentro da lição ou de cerimônia (UX-05). Mensagens da lição viram linha dentro do rodapé de feedback; fora da lição, Snackbar acima da tab bar, branco no escuro e `#3c3c3c` no claro, 2,5 s, nunca sobre CTA.

---

## 9. Blueprint por tela

Prioridade: **P0** deixa feio ou confuso; **P1** polimento; **P2** desejável.

### 9.1 Boas-vindas e onboarding (novo)

Problema: não existe (UX-01); o mockup do dono (`refs/7471e956`, `refs/006a1702` primeira tela) pede "Seja bem-vindo! Vamos aprender juntos a Palavra de Deus?" com Jesus.

| Passo | Conteúdo | Medidas |
|---|---|---|
| 1. Boas-vindas `[data-onboarding="1"]` | Wordmark "BíbliaLearn" (Baloo 2 30, verde) no topo; Jesus 240 px sobre elipse, respirando; balão acima: "Seja bem-vindo! Vamos aprender juntos a Palavra de Deus?"; fundo com luz dourada radial suave atrás de Jesus; CTA "COMEÇAR" | CTA 358x50 a 24 px do fundo; balão 280 de largura máx |
| 2. Por que você quer aprender? `[data-onboarding="2"]` | Jesus 140 no canto com balão "O que te traz aqui?"; 4 opções com Illo 40: 📖 `1f4d6` Ler a Bíblia em inglês, 🙏 `1f64f` Crescer na fé, ✈️ `2708-fe0f` Viagem e missões, 🎓 `1f393` Estudo e trabalho; escolha única, opcional | opções 358x64 |
| 3. Meta diária `[data-onboarding="3"]` | balão "Quanto tempo por dia?"; 4 opções: Casual 10 XP (5 min), Regular 20 XP (10 min), Sério 30 XP (15 min), Intenso 50 XP (20 min); Regular pré-selecionada; Illo ⏱️ | opções 358x64 com valor à direita |
| 4. Seu nome e avatar `[data-onboarding="4"]` | "Como podemos te chamar?" campo de texto (opcional, placeholder "Seu nome"); grade 3x2 de avatares redondos 88 px: Adão, Eva, Noé, Davi, Ester, Maria + "Iniciais"; anel do selecionado em verde 4 px | grade com 12 de espaço |
| Fim | Transição para a trilha com o nó u1l1 centrado e um coach-mark: balão "Comece aqui!" já flutuando e um anel pulsando no nó | |

Barra de progresso de 4 segmentos no topo, botão voltar (seta) a partir do passo 2, botão "PULAR" discreto à direita (vai direto ao fim com padrões). Estado salvo: `onboarded: true`, `motive`, `dailyGoal`, `name`, `avatar`.

Regras de teste: nunca aparece se `localStorage["biblelingo"]` já existe; em DEV, `?skipOnboarding=1` e `window.__blSkipOnboarding()`; `driver.mjs`, `e2e-course.mjs`, `e2e-lesson.mjs` e `shots-all.mjs` chamam o atalho; `shots-all.mjs` captura `onboarding-1` a `onboarding-4` no início.

Prioridade: **P0**.

### 9.2 Trilha

Problemas: `01-primeira-abertura`, `91-trilha-topo`, `49-trilha-apos-licao`, UX-15, UX-16, UX-17, UX-35. Nós bloqueados só com cadeado, laterais vazias, cartão de seção grande com rolo em estilo foto entre os nós, Adão flutuando com corte reto, estrelas soltas entre nós.

Alvo (de baixo para cima, decisão do dono):

| Elemento | Especificação |
|---|---|
| Cabeçalho do capítulo (sticky, topo) | 358x84, raio 16, fundo base do capítulo, sombra `0 4px 0` da família; "SEÇÃO 1 · CAPÍTULO 1" `caption` branco a 80%; título `heading` Baloo 2 20 branco; botão Guia 48x48 à direita com ícone de livro (SVG) em caixa branca a 20% |
| Nó disponível/concluído | face 72 circular na cor do capítulo, sombra 8 px, ícone branco 32 do tipo (estrela lição, livro história, balão cena, haltere revisão); concluído mostra o ícone com coroa pequena ou check; estrelas 3x14 px coladas sob o nó (dentro do wrapper, nunca soltas) |
| Nó atual | anel segmentado 92 px (cinza com segmentos na cor do capítulo), halo pulsando, balão COMEÇAR (7.2) |
| Nó bloqueado | face `#e5e5e5` (claro) / `#37464f` (escuro), sombra `#c4c4c4` / `#2a3940`, **ícone do tipo** em `disabled` (não cadeado); toque abre o popover cinza (já existe) |
| Baú no caminho | Chest 3D 64 sobre o caminho a cada capítulo; concluído aberto com brilho |
| Troféu do capítulo | nó 72 dourado no fim do capítulo |
| Decoração lateral | a cada 4 nós, alternando lado: busto do elenco do capítulo 120 a 140 px com elipse e respiração; entre eles, 1 Illo de cenário 56 px (🐑 🕊️ 🌿 📜 conforme o capítulo) |
| Divisor de seção | linha 2 px `line` com texto central "ANTIGO TESTAMENTO" `caption` `muted` e Illo 📜 24; o cartão grande "Seção 1 Ver detalhes" sai do meio da trilha; o guia da seção fica no botão do cabeçalho |
| Base | "Comece aqui e suba" com bandeira (fica), mas com Jesus 120 ao lado no primeiro uso |
| Botão voltar ao atual | círculo 48 azul com seta, canto inferior direito acima da tab bar, aparece quando o nó atual sai da tela (UX-17) |

Prioridade: **P0** (ícones de tipo nos bloqueados, decoração lateral com bustos e elipse, divisor novo); **P1** (botão voltar, desbloqueio animado); **P2** (Illos de cenário por capítulo).

### 9.3 HUD

Problemas: `02-hud-pop-0` a `05-hud-pop-3`, UX-02. Retângulo verde com livro (ambíguo), chama cinza e "0" cinzas, número do XP quase invisível no claro.

Alvo: barra de 56 px, 4 itens de mesma largura com alvo 64x48: [📖 28 curso] [🔥 28 + número laranja] [⚡ 28 + número dourado] [❤️ 28 + número vermelho]. Números `numeral` 19 px 800 nas cores da 3.3. Ofensiva apagada: chama em cinza e número `disabled`, e no primeiro dia o popover abre sozinho uma vez, após a primeira lição, com "Sua ofensiva começou!". Popovers (já existem) ganham Illo 48 à esquerda e uma frase que explica o número ("XP: pontos que você ganha a cada lição. Meta de hoje: 20"). Borda inferior 2 px `line`. **P0**.

### 9.4 Popover do nó

Problema: `12-popover-no`. Texto técnico "Vocabulário: earth, light, dark, good, Let there be light".

Alvo: 358 de largura, fundo da cor do capítulo, raio 16, seta para o nó; título "No princípio" `heading` branco; subtítulo "Lição 1 de 4" `secondary` branco a 85%; fileira com 3 Illos 32 das palavras novas e o texto "3 palavras novas"; CTA branco com texto na cor do capítulo "COMEÇAR +10 XP" (`[data-popover-start]`); em retomada "RETOMAR 4/15" com mini barra. Bloqueado: cinza, "Conclua as etapas anteriores para desbloquear" (já existe). **P1**.

### 9.5 Lição (casca)

Problemas: `13-licao-1-ex-choice-en-pt`, `26-licao-5-ex-type`, UX-03, UX-28, UX-42.

| Elemento | Alvo |
|---|---|
| Topo | X 28 px `muted` com alvo 44 (hoje `#afafaf` fraco); barra 16 px de altura, raio 8, verde com brilho superior branco a 30%; corações: Illo ❤️ 28 + número vermelho |
| Combo | "COMBO x3" `caption` 13 px acima da barra, com pop; x5+ dourado |
| Título | `prompt` Baloo 2 24 à esquerda, 16 px abaixo do topo |
| Palco | personagem 150 + balão (seção 5) |
| Rodapé | VERIFICAR 358x50 desabilitado `raised` com texto `disabled`; habilitado verde |
| "Não posso ouvir/falar agora" | `label` `muted` 44 de altura, centrado, 16 acima do CTA |

**P0** (personagem e balão), **P1** (topo e combo).

### 9.6 Famílias de exercício

| Família | Formatos | Problema atual | Alvo | P |
|---|---|---|---|---|
| Palavra nova (word-card) | `word-card` e marcação PALAVRA NOVA | selo roxo pequeno; emoji do sistema | cartão 358 com Illo 120 flutuando, palavra em Baloo 2 32, tradução `muted`, frase exemplo; botões Ouvir (azul 3D 64) e Devagar (tartaruga) como no ref `51a0685b` | P0 |
| Escolha de texto | choice-en-pt, choice-pt-en, missing-word, quiz | opções finas (56) e personagem pequeno | opções 64 com borda inferior 4 px; número da opção (1 a 4) em quadradinho 24 `line` à esquerda, como no Duolingo | P1 |
| Escolha de imagem | image-choice | emoji do sistema, ícones errados (🐾, 🆗, 📅 "July 17") | grade 2x2 de 171x150, Illo 72, rótulo 17 600; mapa da 4.5 | P0 |
| Pares | match, listen-match | células apagadas no fim parecem desabilitadas sem celebração | célula 171x64; par certo pisca verde e some com `scale` 0,9; erro treme vermelho; fim com "Fez bonito!" | P1 |
| Montagem | build, listen-build, translate-en-pt, scene-build | ok | linhas de resposta 2 px `line` com 56 de altura; peças 48 com borda inferior 4 px; espaço deixado pela peça fica `raised` com mesma forma | P1 |
| Digitação | type, listen-type, complete-translation, scene-gap | caixa vazia com placeholder repetindo o título | textarea 358x140 `raised` com borda 2 px; placeholder "Escreva aqui"; Enter = VERIFICAR | P2 |
| Escuta | listen, listen-choice | botão Devagar 71x18 (UX-19); balão de onda pequeno | botões Ouvir 96x80 azul 3D e Devagar 64x64 com tartaruga, como `51a0685b`; personagem 150 falando | P1 |
| Versículo | verse | pergaminho ok; peças pequenas | cartão pergaminho com referência `caption`; lacuna 2 px `parchment-line`; peças 48 | P1 |
| Fala | speak, scene-speak | personagem 99 px, microfone 186x80 | personagem 220 centrado com balão acima (`refs/d51aafbb`, `da162265`); microfone azul 3D 200x80; "Não posso falar agora" abaixo | P0 |
| Leitura e diálogo | read, dialogue | bloco de texto longo de 5 linhas | texto em balões por personagem (bustos 44), cada frase com áudio; pergunta separada em `heading` | P1 |

### 9.7 Feedback (rodapé)

Problemas: `40-fb-ok-speak` (título em 2 linhas e coberto por toast), `27-fb-ok-type` (texto redundante "earth").

Alvo: altura automática publicada em `--footer-h`; fundo `green-soft`/`red-soft` até a borda; ícone em círculo branco 32 com check verde/X vermelho; título `heading` 24 800 em `green-text`/`red-text` (no máximo 18 caracteres: "Amém!", "Fez bonito!", "Boa!", "Tudo certo!", "Incorreto"; "Tudo bem, seguimos!" vira "Seguimos!"); segunda linha: no acerto só quando há tradução útil ("Significado: terra"), no erro sempre "Resposta certa:" `caption` + resposta 17 600; ícones de compartilhar e reportar 24 com alvo 44 à direita; CTA "CONTINUAR"/"ENTENDI"; botão secundário outline "PRATICAR PRONÚNCIA" depois do CTA no DOM. Avisos da lição ("Exercícios de fala pausados por 15 min") entram como terceira linha `secondary` com ícone, nunca como toast. **P0**.

### 9.8 Interstício "Vamos corrigir os exercícios que você errou!"

Problema: `43-licao-13-intersticio` (Adão cortado na borda direita, metade da tela vazia).

Alvo: personagem 200 inteiro à direita com elipse, balão à esquerda com rabicho, Illo 🎯 40 no balão; fundo `page`; entra com o personagem acenando (`rotate` -6 a 6 duas vezes). `[data-interstitial]` preservado. **P0**.

### 9.9 Resultado e cerimônias

Problemas: `46-resultado`, `47/48-cerimonia-streak`, `62/63/64-cena-cerimonia`, UX-10 a UX-14.

| Tela | Alvo | P |
|---|---|---|
| Resultado | luz dourada 320 px atrás do personagem 200 pulando; título Baloo 2 40 "Lição concluída!" em `#ffc800` com contorno `#e5a600` 2 px (claro) ou só `#ffc800` (escuro); 3 estrelas 48 que estalam; 3 StatCards 110x92 (XP dourado, Tempo azul, Precisão verde) com contagem; baú Chest 3D 72 em card dourado "Baú de recompensa / TOQUE PARA ABRIR" com pulso; versículo em pergaminho opaco 100% (hoje translúcido e ilegível sob o confete); CTA aos 1,2 s | P0 |
| Ofensiva | fundo `page` do tema (não escuro forçado no claro); chama Illo 🔥 160 com número Baloo 2 64 por cima; "dias de ofensiva!" `display`; semana S T Q Q S S D completa com o dia de hoje aceso em laranja; frase curta "Volte amanhã para manter a chama acesa." | P1 |
| Meta diária | anel 160 dourado com rótulo dentro ("20 de 20 XP") desde o primeiro quadro; check pop; "Meta diária batida!" | P1 |
| Missões | **uma** tela "Missões concluídas" listando todas as concluídas nesta lição (linha com Illo 40, nome e "+5 XP" que sobe), em vez de uma tela por missão | P0 |
| Coroa | coroa Illo 👑 160 com luz dourada | P2 |

Ordem fixa: Resultado, Ofensiva (só se acendeu hoje), Meta diária (só se bateu agora), Missões (só se houver), Coroa (só no fim do capítulo). Cada uma com `[data-ceremony]` e CTA "Continuar".

### 9.10 Cena (situações do dia a dia)

Problemas: `50-cena-scene-intro`, `54-cena-scene-reply`, `60-cena-scene-truth`, UX-30, UX-31.

Alvo: intro com os dois bustos 120 frente a frente sobre elipses e seta animada; rótulo "SITUAÇÃO" `caption` e o tipo da situação em `secondary` normal (não caixa alta de 2 linhas); "Palavras da cena" com Illo 24 em chips 2 px; conversa com avatares redondos 44 (anel do capítulo) e balões 2 px, o balão do usuário verde suave; "Ouvindo a conversa..." com o CTA desabilitado até o áudio terminar, mais "Pular" textual; verdade em pergaminho; nada de toast ("Mandou bem! Um desafio extra" vira selo dourado acima do título do próximo exercício). **P1**.

### 9.11 História

Problemas: `shots-now/light/story-beat` (título cortado "O jardim..."), texto palavra a palavra com CONTINUAR desabilitado, avatares 40.

Alvo: topo com seta, barra de progresso e título completo em segunda linha (`secondary`, 2 linhas no máximo); palco com elenco 120 lado a lado; quem fala ganha escala 1,05 e os outros ficam a 60%; balão grande abaixo; toque na tela completa a frase e um segundo toque avança; perguntas como opções 64. **P1**.

### 9.12 Match Madness

Problema: `68-madness-inicio` começa direto, "60" sem rótulo.

Alvo: tela de entrada com Illo ⚡ 128, "Match Madness" Baloo 2 30, regra "Combine o máximo de pares em 60 segundos", recorde pessoal, CTA "COMEÇAR"; contagem 3, 2, 1 (Baloo 2 96); topo com relógio Illo ⏱️ 28 e barra de tempo que esvazia e fica vermelha nos 10 finais; combo multiplicador em dourado; fim com recorde e confete. **P1**.

### 9.13 Hub (Praticar)

Problemas: `65-hub`, `66-hub-meio`, `shots-now/dark/hub` (lista de cards genéricos com ícones SVG chapados; histórias bloqueadas em cinza fotográfico com o mesmo texto repetido).

Alvo: cabeçalho "Praticar" `title` com Jesus 110 à direita e linha "12 palavras aprendidas · 2 para revisar"; card destaque "Erros" (vermelho suave, Illo 🩹 64, contador grande, CTA "PRATICAR"); grade 2x2 de cards 171x150 (Palavras 📚, Escuta 🎧, Fala 🎙️, Match Madness ⚡ com selo "60 s"), cada um com Illo 64 no topo, título `heading` e uma linha `secondary`; "Histórias" e "Situações do dia a dia" como carrosséis com cards 160x200 (busto 96 sobre fundo suave do capítulo, título, "+10 XP"); bloqueado: busto em silhueta (`brightness(0) opacity(.18)`), cadeado 24 e "Capítulo 3" (não "Conclua a 1ª etapa do capítulo" em todos). `data-hub`, `data-scene`, `data-story` preservados. **P1**.

### 9.14 Missões

Problemas: `69-missoes`, `70-missoes-fim`, UX-23.

Alvo: banner roxo 358x120 com Eva 120 saindo pela borda de cima e o Chest 3D 64 à direita; "Missões diárias" com "Faltam 22 h" e relógio; linhas com Illo 40 (⚡ 🎯 🌟 🔥), título 17 800, barra 16 px com "3/20" dentro; baú 48 à direita (alvo 48); concluída: barra verde cheia, baú dourado pulando até ser aberto, toque abre com pop e "+5 XP"; mensal com Illo 📅 64 e barra; quando tudo concluído: "Tudo feito por hoje!" com Eva 140. Remover o card de Ofensiva duplicado (fica no Perfil). **P1**.

### 9.15 Personagens e ficha

Problemas: `71-personagens`, `74-personagem-bloqueado` (bloqueado abre ficha com "Iniciar lições"), UX-24.

Alvo: grade 3 colunas (como o inventário do dono `refs/2bf4fe01`): card 112x156, fundo suave do capítulo, busto 96 com elipse, nome `heading` 15, virtude `caption` com Illo 16; agrupado por capítulo com cabeçalho colorido e "2/2 conhecidos"; bloqueado: silhueta escura, cadeado, "Capítulo 3"; toque no bloqueado abre sheet curto "Conheça José no Capítulo 3" com CTA "IR PARA A TRILHA" (sem "Iniciar lições"). Ficha: arte JPG no topo (fica), nome Baloo 2 30, abas Sobre/Lições/Versículos, botão de áudio azul 3D 48, CTA "INICIAR LIÇÕES" e link "PRATICAR COM ADÃO" com alvo 44. `[data-char]` preservado. **P1**.

### 9.16 Perfil e Configurações

Problemas: `75-perfil`, `77-avatar-picker`, `78-config`, UX-25, UX-26, UX-07, UX-19.

Perfil alvo: banner 358x140 com gradiente suave do capítulo atual e 3 Illos decorativos (📖 🕊️ ✨) em 40 a 60% de opacidade; avatar 104 redondo com o busto escolhido e anel 4 px do capítulo, botão lápis 36 (alvo 44) sobre ele; nome Baloo 2 26 editável, "@nome · Entrou em outubro de 2026"; "Visão geral" 2x2 de StatCards com Illo 32 (🔥 ofensiva, ⚡ XP total, 👑 coroas, ⭐ estrelas) e uma linha de explicação embaixo de cada número na primeira vez ("Coroas: ganhe ao terminar um capítulo"); conquistas com medalhas 3D e barra; calendário com dias estudados em laranja; capítulos concluídos com medalhas por motivo.

Configurações alvo: linhas de 56 com toque na linha inteira (hoje só o toggle 50x30); toggles 52x32; "Exercícios de fala" mostra "Pausado até 14:32" quando pausado por "Não posso falar agora" em vez de parecer desligado; tema com 3 cards visuais (Claro, Escuro, Automático) com miniatura; meta diária com as 4 opções do onboarding; seção "Conta" com nome e avatar. **P0** (avatar e nome), **P1** (resto).

### 9.17 Modal de corações

Estado atual bom (`82-sem-coracoes-modal`). Alvo: Illo 💔 96 com tremida na entrada; 5 corações vazios Illo 28 em cinza; texto de 2 linhas; CTA verde "PRATICAR E RECUPERAR 1 CORAÇÃO"; contador do próximo coração com `tabular-nums`; "NÃO, OBRIGADO" outline. Ao reabrir uma lição concluída sem corações, um selo "Prática: não gasta corações" no topo da lição explica o "∞" (UX-27). **P2**.

### 9.18 Estados vazios

| Onde | Personagem e texto | CTA |
|---|---|---|
| Hub, Erros sem pendências | Jesus 140: "Nenhum erro para revisar. Continue assim!" | "IR PARA A TRILHA" |
| Personagens, só 2 conhecidos | Adão e Eva 96: "Conheça mais personagens avançando na trilha" | |
| Perfil, capítulos concluídos vazio | medalha cinza Illo 🏅 64: "Conclua o Capítulo 1 para ganhar sua primeira medalha" | |
| Missões concluídas | Eva 140: "Tudo feito por hoje! Volte amanhã." | |
| Sem conexão (áudio) | Illo 🎧 64 riscado: "Sem áudio agora. Pule com Não posso ouvir agora." | |

Regra: todo estado vazio tem personagem ou Illo, uma frase de no máximo 70 caracteres e, quando houver, um CTA. **P1**.

---

## 10. Acessibilidade

- Contraste: corpo 4,5:1; numerais e títulos ≥ 19 px 800 em 3:1; CTA verde com branco é exceção de marca coberta pelo modo Alto contraste. O `scripts/contrast-check.mjs` está quebrado (para em "token sem cor literal: unit-text"); deve ignorar tokens `var(...)` e ganhar os pares novos da 3.3.
- Alvo de toque mínimo 44x44 (lista dos que falham em UX-19).
- Foco visível: anel 3 px `blue` com 2 px de afastamento em todo botão (já existe; manter nos componentes novos do onboarding).
- Todo `<Illo>` de conteúdo tem `alt` com a palavra; decorativo tem `alt=""`.
- Reduced motion obedecido em personagem, confete, halo e trilha.

---

## 11. Checklist de pronto (juiz de captura)

1. Abrir sem `localStorage`: aparecem 4 telas de onboarding, a primeira com Jesus 240 e o balão do mockup.
2. Trilha: nenhum nó só com cadeado; ao menos 1 busto com elipse visível na primeira dobra; cabeçalho do capítulo colorido; balão COMEÇAR legível nos dois temas.
3. HUD: 4 Illos 3D coloridos, números em negrito na cor do ícone.
4. Lição: personagem ≥ 150 px sem corte reto visível, respirando; nenhum emoji do sistema; nenhum toast sobre o rodapé.
5. Feedback: título em uma linha.
6. Interstício: personagem inteiro.
7. Resultado: luz dourada, estrelas, contagem, baú 3D, versículo legível, CTA em até 1,2 s; no máximo uma tela de missões.
8. Hub, Missões, Personagens, Perfil: Illos 3D em todo item, bustos nos cabeçalhos, avatar com busto.
9. Os dois temas lindos: claro branco, escuro `#131f24`, pergaminho escuro quente.
10. `npm run build`, `node scripts/e2e-course.mjs ... --only=u1l1,c-jesus-1,u1r` termina com "CURSO COMPLETO OK"; `shots-all.mjs` sem erros.
