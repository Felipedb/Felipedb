# CONTENT SPEC V2: lições, cenas e histórias do BíbliaLearn

Versão 2.0 (outubro de 2026). Documento operacional para reescrever as 24 lições de `content/u1.json` a `content/u8.json`, as 48 cenas (`scenes.js`, `scenes2.js`), as 8 histórias (`stories.js`) e para evoluir o motor (`app/src/core/builder.js`, `session.js`, `checker.js`, `sr.js`, `sceneBuilder.js`) e as ferramentas (`tools/content/validate.js`, `tools/content/merge.js`, `tools/gen-audio.mjs`).

Sintetiza quatro auditorias independentes feitas sobre o jogo real (Playwright, `window.__session`, capturas): pedagogia (CP-01 a CP-34), língua (CL-01 a CL-36), fidelidade bíblica (CB-01 a CB-32) e cenas e histórias (CS-01 a CS-26). Os códigos entre parênteses ao longo do texto remetem a esses achados.

Convenções deste documento: português do Brasil com acentos; sem travessão em nenhum texto, nem no conteúdo nem na interface; referências a código no formato `arquivo:linha`; valores exatos (palavras, px, ms, créditos) sempre que houver.

## Sumário

1. Diagnóstico: por que as lições estão ruins
2. Filosofia pedagógica e nível (A1 a A2)
3. Formato JSON v2 por lição e mudanças em `validate.js` e `merge.js`
4. Regras de conteúdo: vocabulário, frases, versículo, leitura, conversa, quiz, distratores, ícones
5. Guia de estilo linguístico
6. Arco narrativo por lição (24 entradas)
7. Cenas e histórias v2
8. Motor de exercícios v2 (com pseudocódigo)
9. Critérios de aceitação e checklist de revisão
10. Anexo A: três lições-modelo em JSON v2 (u1l1, u3l2, u8l3)
11. Anexo B: ordem de execução

---

## 1. Diagnóstico: por que as lições estão ruins

O conteúdo atual tem base bíblica sólida (os 24 versículos batem palavra por palavra com a KJV; 22 dos 24 `verse.pt` seguem a Almeida Revista e Corrigida; as referências de `explain` e `truth` estão corretas; não há doutrina sectária). O problema não é a letra, é a língua ensinada, a arquitetura da lição e a arquitetura da narrativa. Três camadas se somam.

### 1.1 A língua ensinada não é o inglês que o aluno vai usar

- 79 dos 238 itens de vocabulário (33%) estão fora das 2000 palavras mais frequentes do inglês: `counsellor`, `zeal`, `hallowed`, `sheaf`, `butler`, `to defile`, `covenant`, `decree`, `furnace`, `pillar`, `two by two`, `I AM`, `with us` (CP-12, CL-19). Ao mesmo tempo faltam pronomes, palavras interrogativas, cores, dias, adjetivos básicos.
- 14 dos 24 versículos e 28 das 282 frases livres estão em inglês arcaico da KJV: "Make thee an ark" (`u2.json:122`), "The place whereon thou standest" (`u3.json:123`), "Thus saith the LORD" (`u3.json:276`), "Our Father which art in heaven, Hallowed be thy name" (`u8.json:284`), "Darkness was upon the face of the deep" (`u1.json:66`), "Unto us a son is given" (`u5.json:257`). Nas 282 frases: 9 com "upon", 9 com "shall", 0 contrações (CL-01, CL-02, CP-11). Pior: `u1l1-first.json` #14 pede para o aluno pronunciar "The earth was without form and void".
- Gramática zero: 0 campos `tip` ou `note` em `data.js`. A primeira lição já usa passado simples (created, moved, divided), jussivo ("Let there be") e "was without form"; u5 usa futuro com "shall" e passivas; u8 usa subjuntivo ("Hallowed be thy name"). 181 das 282 frases estão no passado desde a primeira lição; só 6 perguntas e 22 negativas no curso inteiro; nada sobre artigos, plural, there is, presente simples, possessivos (CP-13, CP-28).
- O português oscila entre "você" e "tu/vós" na mesma lição: `u3.json:70` "Tira os teus sapatos" ao lado de `u2l1` "Noé, o que você está fazendo?"; `u8.json:147` "Sim, Senhor! Eu te seguirei" como resposta a `u8.json:140` "Pedro, deixe as redes e siga-me" (CL-07, CP-21). O aluno monta peça por peça "Eu sou pesado de boca" (`u3.json:115`) e "Deitar-me faz em verdes pastos" (`u4.json:407`), porque `translate-en-pt` aceita só `s.pt` (`checker.js:23`) e nenhuma das 282 frases define `altPt` (CL-08, CL-28).
- Glosas com termo da Almeida de 1898 como principal: covenant = "concerto (aliança)" (`u2.json:357`), to fight = "pelejar (lutar)", sheaf = "molho (feixe)", food = "comida (manjar)" (CL-16). 29 itens com parênteses vazam para opções e peças ("só (sozinho)", "lançar (a rede)") (CP-19).

### 1.2 O montador quebra princípios básicos de uma lição

- Pares antes da apresentação: em `u1l1-first.json` o #2 é `match` com God/earth/heaven/light, e as apresentações só vêm em #3, #4 e #6. Causa: a regra de ordenação `ok(e)` em `builder.js:164` só vale para exercícios com `e.word`; `match` tem `pairs` e passa livre (CP-01). O aluno perde coração por palavra que nunca viu, porque `session.js:301-303` desconta coração em qualquer erro fora de `practice` (CP-33).
- Sorteio em vez de narrativa: `builder.js:88` pega `slice(0, 4)` do vocabulário e `builder.js:91` faz `shuffle(lesson.sentences).slice(0, 4)`. Em `u1l1-first.json` a sequência é "God said, Let there be light" (#7), "God created the heaven and the earth" (#9), "The earth was without form and void" (#11): a luz é criada antes das trevas (CP-03). Na 2ª jogada, `builder.js:88` sorteia 4 de 8 a 10 e `builder.js:181` só marca `newWord` quando `firstTime`, então as palavras 5 a 10 de cada lição (cerca de 130 das 238 do curso) nunca recebem apresentação (CP-02, CP-23): a trilha inteira apresenta 96 palavras.
- O "desafio difícil" é digitar uma palavra: a rotação `sentTypes` de `builder.js:115` tem `listen-type` na 5ª posição; com 4 frases, nunca é sorteado, e `reserve("listen-type")` (`builder.js:153`) cai em `reserve("type")` (CP-04). `adaptNext` (`session.js:377-378`) troca `listen`/`choice-pt-en` por `type` sempre que `combo >= 3`, sem contar exposições: em `u4l2.json` #4 apresenta `sling` e #6 já pede para digitar `sling` (CP-05).
- Monotonia: 9 a 10 dos 15 exercícios são múltipla escolha; produção (build, translate-en-pt, type, speak) são 4, e speak costuma ser pulado (CP-15). Só 1 dos 3 itens de história entra por lição (`builder.js:135-136`): o diálogo, que tem o inglês mais útil ("What are you making?", "Bring them to me"), fica de fora na maioria das vezes (CP-16). O versículo repete a mesma lacuna e as mesmas opções em todas as jogadas (CP-17).
- Cada palavra é vista 2 ou 3 vezes, nunca nas 4 modalidades (ver, ouvir, montar, falar): `u1l1-first` light=2, God=3; `u8r` afraid=2 (CP-24). A repetição espaçada existe (`sr.js:5` `SR_INTERVALS [0,1,2,4,7,15,30]`) mas só 1 exercício de revisão entra por lição (`builder.js:142`) e as 240 expressões das cenas ficam fora de `allVocab()` (`content.js:60-62`) (CP-22, CP-25).

### 1.3 Distratores e perguntas não exigem compreensão

- `exDistract` (`builder.js:20-25`) filtra só ícone e `pt` iguais; o JSON não tem classe gramatical. Resultado: `image-choice earth` com terra / sete / criar / trevas (CP-06). `exNearWords` (`builder.js:26-30`) ordena por distância de edição mais `Math.random() * 1.5`: lacuna "And there was ___" com fight / night / light; "Never again ___ a flood destroy the earth" com will / wall / wife, porque `will = vontade` está no vocabulário de u8 (CP-07, CL-05, CL-06).
- 44 dos 48 distratores de diálogo apontam para outra história: "Where is the ark?" na Criação (`u1.json:126`), "I am the ark." e "I am a rainbow." para "Who are you?" em u3l2, "Send the crowd to Egypt." em u8l3 (CP-08, CL-09). Responde-se por eliminação.
- 23 das 24 perguntas de leitura têm a resposta copiada do texto ("What did God say?" com "Let there be light" no texto), e `Choice.jsx:126-131` oferece "Ver em português" antes de responder (CP-09). O quiz testa trivia bíblica ("How old was David when he began to reign?") e cobra fatos que nenhuma frase da lição ensinou: "Who was thrown into the fiery furnace?" em u7l1 sem os três nomes em lugar nenhum (CP-10, CB-04).
- As peças do banco carregam pontuação ("disse:", "pray,", "dois,"), porque `exBank` (`builder.js:32`) faz `split(" ")` sem `cleanWord` (CP-18, CL-12).

### 1.4 A arquitetura narrativa está desalinhada com a trilha

- A unidade 1 "Gênesis 1-3" tem seis cenas dos Evangelhos (`scenes.js:40-160`, `unit: "u1"`), duas duplicando u8, e nenhuma sobre a queda; a história s1 termina em "We walk with God in the garden" sem serpente, sem "Where are you?", sem saída do jardim (CB-01, CB-03).
- A trilha põe José (Gênesis 37-50) depois de Moisés e de Isaías, quebrando a jornada cronológica que o separador "Antigo/Novo Testamento" (`content.js:81-83`) promete (CB-02). Daniel 6 ocupa duas lições e Daniel 3 (a fornalha) tem uma frase; Êxodo 1-2 (o cesto no rio) não existe; u5l2 e u5l3 repetem Isaías 9 (CB-07, CB-08, CB-09).
- Narradores anacrônicos: Jesus narra Gênesis 1, Jacó e Rebeca narram Noé (`characters.js:296-297`), Daniel narra Isaías (CB-11). Deus e Golias usam a mesma voz "clyde" (`scenes.js:11,13`); Jesus e Isaías, "george" (`tools/gen-audio.mjs:53`) (CS-18).
- As cenas mostram cada fala com tradução e, no exercício seguinte, perguntam exatamente o que acabou de ser mostrado (`sceneBuilder.js:84-105`); os distratores vêm de outras cenas ("Bom dia! Preciso de madeira." para Pedro no barco); 28 das 240 expressões nunca aparecem literalmente nas falas; 41 falas passam de 12 palavras; 0 heroínas entre os 8 protagonistas (CS-01 a CS-07, CS-16). As histórias têm 40 a 56 palavras (Duolingo: 150 a 300) e 6 das 24 interações exigem o que a história não deu (CS-11, CS-12).

### 1.5 Síntese

O caminho é um conteúdo v2 com: sílabo gramatical A1 a A2 por capítulo, vocabulário 70/30 (frequente/bíblico), frases modernas em ordem narrativa, card de Dica e card de palavra nova, planejador por slots com apresentação garantida antes da cobrança e 4 toques por palavra, distratores por classe gramatical, conversa de vários turnos, leitura com inferência, versículo em inglês atual (World English Bible) com a KJV como versão clássica, português do Brasil em "você", cenas no modelo Duolingo Stories (interação antes da revelação) e trilha reordenada cronologicamente.

---

## 2. Filosofia pedagógica e nível (A1 a A2)

### 2.1 Oito princípios

1. **Inglês moderno primeiro.** O texto-base das frases livres é inglês contemporâneo A1/A2 em grafia americana. Os versículos vêm de uma tradução moderna de domínio público (World English Bible, WEB, já consultável com `node tools/content/web.mjs "Gênesis 1:1"`). A KJV aparece apenas como "versão clássica" no card do versículo. Nunca em `build`, `type`, `speak`, `fill-bank` ou lacuna.
2. **Utilidade antes de fidelidade lexical.** Regra 70/30: pelo menos 70% das palavras novas de cada lição estão no top 2000 (NGSL); o resto é `tier: "bible"`, ensinado só receptivamente, no máximo 2 por lição. Nomes próprios não são vocabulário: ficam no card "Quem é quem".
3. **Narrativa em ordem.** A passagem é contada em `beats` numerados (`order` 1 a 12); a lição percorre os beats em ordem. Cada lição tem duas partes (Parte 1: beats 1 a 6 e palavras 1 a 4; Parte 2: beats 7 a 12 e palavras 5 a 8), apresentadas como dois níveis do mesmo nó da trilha. Nada de sortear 4 frases de 12.
4. **Gramática explícita e progressiva.** Um card "Dica" por parte (48 no curso), com 2 exemplos e 1 contraste, exibido antes do primeiro exercício que usa a estrutura; lacunas gramaticais ligadas à Dica; o `explain` do erro cita a Dica.
5. **Repetição planejada.** Toda palavra nova é vista em 4 modalidades (ver, ouvir, montar, falar) e em pelo menos 2 beats da sua parte; volta em 3 lições posteriores e na repetição espaçada, que passa a cobrir lições e cenas num registro único.
6. **Compreensão, não eliminação.** Distratores da mesma classe e do mesmo campo; respostas de conversa todas plausíveis na mesma cena; perguntas de leitura com inferência; versículo com lacuna variável.
7. **Português do Brasil em "você"** em tudo que o aluno lê e produz; a forma da Almeida fica em `classicPt` e em `altPt` (aceita, nunca exigida).
8. **Produção todos os dias.** Pelo menos 4 dos 16 exercícios cobrados são produtivos já na primeira visita (mais 2 de reserva), 7 na segunda e 10 na terceira.

### 2.2 Nível por unidade (CEFR)

| Posição | Unidade | Nível alvo | Marcadores de nível |
|---|---|---|---|
| 1 | u1 Criação | A1.1 | to be (presente e passado), there is/was, artigos, plural, adjetivos, 3 a 7 palavras por frase |
| 2 | u2 Noé | A1.1 | passado regular -ed, números, preposições de lugar, for + duração |
| 3 | u6 José | A1.2 | passado de verbos de sentimento, pronomes objeto, because/so, can/cannot |
| 4 | u3 Moisés | A1.2 | imperativo afirmativo e negativo, who/what/where, do not/did not, instruções |
| 5 | u4 Davi | A1.2 | passado irregular, possessivos, comparativo e superlativo, will |
| 6 | u5 Isaías | A2.1 | will em afirmativas e perguntas, presente simples 3ª pessoa, títulos compostos, how long |
| 7 | u7 Daniel | A2.1 | must/cannot/could, frequência, passiva simples, comparativo com than |
| 8 | u8 Pedro e Jesus | A2.1 | pedidos com pronome objeto, only/also, how many/how much, perguntas com did |

Teto de tamanho: frases de produção com 4 a 9 palavras (máximo 10); citações marcadas `prod: false` podem ter até 12; falas de cena com até 10 palavras para o herói e 12 para os outros.

### 2.3 Padrão de referência (Duolingo)

Lição de 12 a 17 exercícios em 3 a 5 minutos; rampa receptivo para produtivo; a palavra é introduzida antes de ser cobrada (`docs/analise-forense-duolingo.md`, seção 1); erros voltam no fim; dica antes da estrutura nova; toda palavra da língua alvo tem sublinhado pontilhado com tradução (`refs/af04a0f5-image.png`, `refs/d51aafbb-image.png`); botão "Explique minha resposta" após verificar. O protótipo anterior do próprio BíbliaLearn (`refs/51a0685b-image.png`) já tinha um card PALAVRA NOVA com ícone, `earth`, `terra`, frase-exemplo, botões Ouvir, devagar e Falar: esse card volta como `intro-word`.

### 2.4 Anatomia da lição v2 (Parte 1, primeira visita)

Cards silenciosos (fora da contagem, sem coração, sem XP próprio): A0, I1 a I5, D1, F1. Dezesseis exercícios cobrados mais dois de reserva. Beats A, B, C, D são os quatro primeiros beats da parte que contêm palavras novas (o planejador escolhe entre os 6 da parte mantendo a ordem narrativa).

| # | Tipo | Item | Regra |
|---|---|---|---|
| A0 | `lesson-intro` (silencioso) | referência, retrato do narrador, 4 palavras + 1 chunk, Dica em 1 linha | 1 toque |
| I1 | `intro-word` (silencioso) | palavra 1: ilustração, en, pt, frase-exemplo, áudio normal e devagar, botão Falar opcional | sempre antes da 1ª cobrança |
| 1 | `image-choice` | palavra 1 | distratores da mesma `pos` e `field` |
| I2 | `intro-word` | palavra 2 | |
| 2 | `choice-en-pt` | palavra 2 | |
| 3 | `listen` | palavra 1 | 2ª exposição |
| I3 | `intro-word` | palavra 3 | |
| 4 | `image-choice` (ou `choice-en-pt` se abstrata) | palavra 3 | |
| D1 | `tip-card` (silencioso) | Dica da parte: título, 2 exemplos, 1 contraste | antes do 1º uso da estrutura |
| 5 | `missing-word` gramatical | beat A, lacuna ligada à Dica | opções = variantes morfológicas |
| I4 | `intro-word` | palavra 4 | |
| 6 | `choice-pt-en` | palavra 4 | |
| 7 | `match` | palavras 1 a 4 + chunk | só depois de I4 e I5 |
| I5 | `intro-word` | chunk da parte (frase-chave) | com áudio e Falar |
| 8 | `listen-choice` | beat B | distratores: beats da mesma parte, mesma estrutura |
| 9 | `build` | beat A (PT para EN com banco) | banco com extras da mesma `pos` e tempo |
| 10 | `fill-bank` (novo) | beat C, lacuna lexical com palavra nova, banco de 4 peças | |
| 11 | `conversation` (novo) | 3 a 4 turnos, o aluno responde 2 | respostas plausíveis da mesma cena |
| 12 | `listen-build` | beat D | |
| 13 | `review` | 1 a 3 palavras vencidas de lições anteriores (`listen`, `choice-pt-en` ou `type`) | `type` só com 3+ exposições |
| 14 | `read` | texto de 3 a 5 frases + 2 perguntas (literal e inferência) | PT só depois de verificar |
| 15 | `speak` | chunk da parte | nunca arcaico |
| 16 | `verse` | versículo com uma das 2 ou 3 lacunas | sorteio por visita |
| H1 | `listen-type` (reserva) | beat B | só sem erros |
| H2 | `type-sentence` (reserva, novo) | beat C, PT para EN no teclado | só sem erros |
| F1 | `fact-card` (silencioso) | "Você sabia?" com referência, +2 XP | fim da lição |

Toques por palavra nova na primeira visita: card + reconhecimento + pares + pelo menos um beat em produção (A ou C) ou escuta (B ou D); a palavra 1 ganha ainda a escuta isolada (#3). O planejador recusa um plano em que alguma palavra nova tenha menos de 4 toques (seção 8.2).

Visitas seguintes do mesmo nível: 2ª (prática) sem cards de palavra já apresentada, `image-choice` vira `listen`, `choice-en-pt` vira `type` (se a palavra já tem 3 exposições), `build` vira `type-sentence`, `listen-type` entra no fluxo, o versículo vira `verse-build` e os beats rotacionam (A recebe E, B recebe F, C recebe A, D recebe B); 3ª (lendária) só produção e escuta, versículo em ditado. A Parte 2 é um nível próprio, com a sua primeira visita completa (cards para as palavras 5 a 8).

Duração alvo: 16 cobrados x 10 s + 8 cards x 4 s, entre 3 e 4 minutos. Precisão média alvo entre 75% e 90%.

---
## 3. Formato JSON v2 por lição e mudanças em `validate.js` e `merge.js`

### 3.1 Princípios do esquema

- Um arquivo por unidade em `content/uX.json`, com `"v": 2` no topo. O validador detecta a versão e aplica o conjunto de regras correspondente; arquivos sem `v` continuam validados pelas regras atuais durante a migração.
- Um arquivo novo `content/course.json` guarda a ordem da trilha e os cabeçalhos das unidades (hoje `merge.js:7-9` lê os cabeçalhos do próprio `data.js`, o que é circular e impede reordenar).
- Tudo o que o aluno produz vem de campos modernos (`en`, `pt`); tudo o que é clássico vai para `classic` e `classicPt` (exibição) ou `alt` e `altPt` (aceitação).
- Campos novos são aditivos. O `merge.js` v2 continua gerando `data.js` com os campos legados derivados (`sentences`, `verse.blank`, `verse.options`, `reading.q`, `dialogue`, `quiz`) para que o motor atual siga funcionando até o motor v2 entrar; o motor v2 lê os campos novos.

### 3.2 `content/course.json`

```json
{
  "v": 2,
  "order": ["u1", "u2", "u6", "u3", "u4", "u5", "u7", "u8"],
  "units": {
    "u1": { "title": "A Criação e o Éden", "subtitle": "Gênesis 1-3", "icon": "🌍", "face": "adao", "color": "#58a700", "cast": ["adao", "eva"], "extras": ["voice"], "level": "A1.1" },
    "u2": { "title": "Noé e a arca", "subtitle": "Gênesis 6-9", "icon": "🌈", "face": "noe", "color": "#1cb0f6", "cast": ["noe", "sem", "naama"], "extras": ["voice"], "level": "A1.1" },
    "u6": { "title": "José no Egito", "subtitle": "Gênesis 37-50", "icon": "🌾", "face": "jose", "color": "#ce82ff", "cast": ["jose", "jaco", "juda"], "extras": ["pharaoh", "copeiro", "potifar"], "level": "A1.2" },
    "u3": { "title": "Moisés e o Êxodo", "subtitle": "Êxodo 1-15", "icon": "🔥", "face": "moises", "color": "#ff9600", "cast": ["moises", "arao", "miria"], "extras": ["pharaoh", "voice"], "level": "A1.2" },
    "u4": { "title": "Davi, o pastor e o rei", "subtitle": "1 Samuel 16-17; 2 Samuel 22; Salmo 23", "icon": "🎵", "face": "davi", "color": "#ff4b4b", "cast": ["davi", "samuel", "jonatas"], "extras": ["goliath", "saul"], "level": "A1.2" },
    "u5": { "title": "Isaías, o profeta", "subtitle": "Isaías 6-9; 36-38", "icon": "👑", "face": "isaias", "color": "#2b70c9", "cast": ["isaias", "ezequias"], "extras": ["acaz", "anjo", "voice"], "level": "A2.1" },
    "u7": { "title": "Daniel na Babilônia", "subtitle": "Daniel 1-6", "icon": "🦁", "face": "daniel", "color": "#a56644", "cast": ["daniel", "ezequiel"], "extras": ["nabucodonosor", "dario", "aspenaz", "trio"], "level": "A2.1" },
    "u8": { "title": "Pedro e Jesus", "subtitle": "Mateus 4-16; Lucas 5; João 21", "icon": "🐟", "face": "pedro", "color": "#1cb0f6", "cast": ["pedro", "jesus", "madalena"], "extras": ["andre", "zebedeu"], "level": "A2.1" }
  }
}
```

`testamentOf` (`content.js:81-83`) continua `idx < 7`, porque u8 segue na última posição. `UNIT_CAST` e `CHARACTER_UNIT` (`characters.js:295-307`) passam a ser gerados a partir de `cast` (CB-11): Jacó e Rebeca saem de u2; Jonas, Daniel e Elias saem de u5; Jesus sai de u1.

### 3.3 Esquema de uma lição v2

```
lesson = {
  id: "u1l1",                         // mantido
  title: "No princípio",              // pt
  ref: "Gênesis 1:1-19",              // passagem coberta
  level: "A1.1",
  narrator: "adao",                   // voz que lê beats e versículo (galeria)
  guests: ["eva", "voice"],           // vozes de conversa e falas marcadas
  names: [ { en: "God", pt: "Deus" }, ... ],            // "Quem é quem": nunca vocabulário
  hints: { "created": "criou", "heavens": "céus", ... }, // glosas de palavras fora do vocabulário
  tips: [ tip (part 1), tip (part 2) ],
  vocab: [ item x 10 ],              // 4 conteúdo + 1 chunk por parte, campo part
  beats: [ beat x 12 ],              // order 1..12; part = order <= 6 ? 1 : 2
  contrast: [ { a, b, note } x 2 ],   // pares de contraste mínimo
  verse: { text, classic, pt, classicPt, ref, blanks: [ { word, options } x 2..3 ] },
  reading: { text, pt, questions: [ q1 literal, q2 inferência ] },
  conversation: { with, turns: [ ... ] },
  fact: { pt, ref },
}
```

Campos por tipo:

```
tip = { part: 1, id: "past-be", title: "was = passado de is",
        body: "...", examples: [ { en, pt }, { en, pt } ],
        contrast: { a, b, note }, grammar: "past-be" }

item (vocab) = {
  en: "earth",            // forma de dicionário: substantivo no singular, verbo com "to ", adjetivo sem artigo,
                          // chunk como frase completa; sem parênteses nem barra (CS-20, CP-19)
  pt: "terra",            // 1 a 2 palavras, sem parênteses
  ptAlt: ["chão"],        // opcional, aceitas ao digitar PT
  alt: ["heavens"],       // opcional, aceitas ao digitar EN
  pos: "noun",            // noun | verb | adj | adv | num | chunk | func
  field: "creation",      // creation | nature | animals | people | family | food | body | feelings | mind | quality |
                          // actions | places | time | objects | work | faith | speech | quantity
  tier: "core",           // core (NGSL top 2000) | bible (máximo 2 por lição, só receptivo)
  part: 1,                // 1 ou 2
  icon: "🌍",             // emoji até 12.0, único por conceito no curso (tools/content/icons.json)
  image: "earth.png",     // obrigatório para noun e verb concretos (ilustração própria em app/public/img/vocab/)
  example: 2,             // order do beat que serve de frase-exemplo no card
  plural: "loaves",       // opcional (plural irregular)
  iconic: true,           // opcional (chunk citado da Escritura)
  recycle: true,          // opcional: já ensinado antes; conta como revisão, não como palavra nova
  note: "levar algo a alguém" // opcional, só exibição
}

beat = {
  order: 2,
  en: "The earth was empty and dark",   // 4 a 10 palavras, sem pontuação interna; ponto final omitido
  pt: "A terra estava vazia e escura",
  alt: ["The earth was formless and empty"],   // opcional
  altPt: ["A terra era sem forma e vazia"],   // opcional (forma Almeida, variantes)
  kind: "statement",      // statement | question | negative | first-person | quote
  speaker: "adao",        // opcional: quem fala (default: narrator). "voice" para a voz do Senhor
  fact: true,             // true = texto ou paráfrase direta; false = frase livre imaginada
  iconic: false,
  prod: true,             // false = nunca em build/type/speak/fill-bank (citação longa ou arcaísmo tolerado)
  gap: { word: "was", kind: "grammar", options: ["was", "is", "were"] },  // opcional; kind: grammar | lexical
  grammar: "past-be"      // opcional: liga à Dica
}

contrast = { a: "God made the sun for the day", b: "God made the moon for the night",
             note: "só mudam sun/day por moon/night" }   // a deve ser um beat; b pode ser variante

verse = {
  text: "In the beginning, God created the heavens and the earth.",   // WEB (ou KJV quando não houver arcaísmo)
  classic: "In the beginning God created the heaven and the earth.",  // KJV
  pt: "No princípio, Deus criou os céus e a terra.",                   // versão livre moderna
  classicPt: "No princípio, criou Deus os céus e a terra.",            // Almeida Revista e Corrigida (1898)
  ref: "Gênesis 1:1",
  blanks: [ { word: "created", options: ["created", "saw", "said", "called"] },
            { word: "beginning", options: ["beginning", "garden", "evening", "night"] } ]
}

reading = {
  text: "...",  // 3 a 5 frases, inglês atual, aspas no discurso direto, só vocabulário já ensinado + 1 glosa
  pt: "...",
  questions: [
    { kind: "literal",   q: "What was the earth like at first?", qPt: "Como era a terra no começo?",
      options: [...], answer: "..." },
    { kind: "inference", q: "...", qPt: "...", options: [...], answer: "...", explain: "..." }
  ]
}

conversation = {
  with: "eva",                               // interlocutor (galeria ou extras)
  turns: [
    { who: "eva", en: "Adam, look! What is that?", pt: "Adão, olhe! O que é aquilo?", mood: "surpreso" },
    { who: "you", options: ["It is the light. God made it.", "It is the night. It is dark.", "It is the earth. It is empty."],
      answer: "It is the light. God made it.", pt: "É a luz. Deus a fez.", intent: "Diga o que é e quem fez" },
    { who: "eva", en: "Is the light good?", pt: "A luz é boa?" },
    { who: "you", options: [...], answer: "...", pt: "...", speak: true }  // speak: true = último turno pode ser falado
  ]
}

fact = { pt: "A palavra hebraica para \"princípio\" (bereshit) dá nome ao livro de Gênesis em hebraico.", ref: "Gênesis 1:1" }
```

### 3.4 Mudanças exatas em `tools/content/validate.js`

O arquivo atual (59 linhas) checa: campos obrigatórios (linha 17), 8 a 10 itens de vocab (19), ícone repetido (23), vocab repetido na unidade (24), emoji 13+ (26), 8 a 12 frases (30), frase > 12 palavras (35), maiúscula inicial (36), travessão (37), frase sem palavra do vocabulário (41-42), 3 frases com o mesmo início (44), lacuna única do versículo (47-49), opções (50-55), quiz e reading com a mesma pergunta (56), quiz sem explain (57). O v2 mantém essas (ajustando os limites) e acrescenta as seguintes, em blocos. Toda regra "bloqueia" vira linha em `probs`; toda regra "avisa" vira `console.log("aviso ...")`.

Entrada: `node tools/content/validate.js content/u1.json [--all] [--scenes] [--stories]`. Com `--all` valida as 8 unidades mais `course.json`; `--scenes` carrega `scenes.js` e `scenes2.js` por `vm` (como já faz com `data.js` na linha 7) e aplica as regras da seção 7.3; `--stories` faz o mesmo com `stories.js`.

Bloco A, estrutura:
- A1. `u.v === 2`; `u.id` em `course.json.order`; exatamente 3 lições com ids `uXl1..3`.
- A2. Campos obrigatórios da lição: `title`, `ref`, `level`, `narrator`, `tips` (2, uma por parte), `vocab`, `beats`, `contrast` (2), `verse`, `reading`, `conversation`, `fact`. Bloqueia se faltar.
- A3. `narrator` existe em `CHARACTERS` (carregar `characters.js` por `vm`); cada `guests[i]` existe em `CHARACTERS` ou `SCENE_EXTRAS`.

Bloco B, vocabulário:
- B1. 10 itens: por parte, 4 com `pos` em {noun, verb, adj, adv, num} e 1 com `pos: "chunk"`. Bloqueia.
- B2. Campos obrigatórios: `en`, `pt`, `pos`, `field`, `tier`, `part`, `icon`, `example`; `image` obrigatório quando `pos` é noun ou verb e `field` não é feelings/mind/quality/faith/quantity/speech. Bloqueia.
- B3. `pt` sem parênteses e sem barra; `en` sem parênteses e sem barra; `en` de substantivo no singular (regex `/s$/` com lista de exceções: `vegetables`, `lips`, `clothes`, `news`); verbo começa com "to "; chunk tem pelo menos 2 palavras. Bloqueia.
- B4. `tier: "core"` em pelo menos 70% dos 8 itens de conteúdo (7 de 8 ou 6 de 8 arredondando: exigir >= 6); `tier: "bible"` em no máximo 2. A lista NGSL (2800 lemas) entra em `tools/content/ngsl.json`; o validador avisa quando `tier: "core"` não está na lista. Bloqueia a proporção, avisa a lista.
- B5. `en` não é nome próprio (não começa com maiúscula, salvo chunk) e não está em `names`. Bloqueia.
- B6. `en` não repete dentro da unidade; entre unidades só com `recycle: true` (compara com todas as unidades v2 carregadas). Bloqueia a repetição sem `recycle`.
- B7. Cada item com `part: p` aparece verbatim (ignorando "to " e caixa; verbos aceitam as formas de `IRR` e sufixos, como hoje nas linhas 39-41) em pelo menos 2 beats da mesma parte. Chunk: em pelo menos 1 beat. Como o `stem` da linha 40 corta em 4 letras e exige 3 (então `went` não casa com `to go`), o item pode declarar `forms: ["went", "goes", "going"]` e o validador conta essas formas como ocorrências. Bloqueia.
- B8. Glosa básica (`pt` sem acentos) não coincide com a de outro item do curso que tenha `en` diferente, salvo `recycle` (CL-17): woman/wife, earth/ground, to shut/to close, pit/den. Avisa.
- B9. Ícone único por conceito: `icon` não pode estar associado a outro `en` em `tools/content/icons.json`; o validador adiciona pares novos ao arquivo com `--write-icons`. Bloqueia duplicidade; mantém a regra de emoji até 12.0 (`/[\u{1FA70}-\u{1FAFF}]/u`).
- B10. `example` aponta para um beat da mesma parte que contém a palavra. Bloqueia.

Bloco C, beats:
- C1. 12 beats, `order` 1 a 12 sem buracos. Bloqueia.
- C2. `en` com 4 a 10 palavras quando `prod !== false` (até 12 quando `prod: false`); começa com maiúscula; sem ponto final; sem vírgula, dois-pontos ou ponto e vírgula internos quando `prod !== false` (aspas de discurso direto permitidas: `God said, "Let there be light"` conta como 1 vírgula tolerada se `iconic: true`). Bloqueia tamanho; avisa pontuação.
- C3. Arcaísmos: regex `\b(thee|thou|thy|thine|ye|unto|hath|saith|doth|shalt|art|hast|whereon|standest|looketh|saveth|shewed|stedfast|brethren|lest|verily|midst|upon|purposed|trespass|void)\b` proibida em `en` de beats, reading, conversation e vocab. `behold`, `whom`, `shall`, `for ever` proibidos em beats com `prod !== false`; tolerados em `verse.text` só quando a WEB os traz. Bloqueia.
- C4. Grafia americana: lista `{ colour: color, counsellor: counselor, "for ever": forever, kneeled: knelt, shewed: showed, stedfast: steadfast, neighbour: neighbor, saviour: savior, honour: honor }` aplicada a `en` de beats e vocab. Bloqueia.
- C5. Palavras de conteúdo fora do vocabulário: para cada beat com `prod !== false`, as palavras que não estão (a) no vocabulário da lição, (b) no vocabulário de lições anteriores em `course.json.order`, (c) na lista funcional `tools/content/function-words.json` (cerca de 160: artigos, pronomes, preposições, auxiliares, numerais, dias, "yes", "no", "very", "also", "everyone", mais os verbos de ligação narrativa say/said, ask/asked, come/came, go/went, com glosa), (d) em `names` ou (e) em `hints` geram bloqueio; mais de 1 palavra do beat em `hints` gera aviso.
- C6. Por lição: >= 2 beats com `kind: "question"` (ou `en` terminando em "?"), >= 1 `negative` (regex `\b(not|don't|doesn't|didn't|cannot|can't|never|no)\b`), >= 1 `first-person` (regex `\b(I|we|my|our|me|us)\b`), e os 2 pares de `contrast` com `a` igual a um beat. Bloqueia.
- C7. `gap`: `word` ocorre exatamente uma vez como palavra inteira no `en`; `kind: "grammar"` exige que as `options` sejam variantes morfológicas da mesma palavra ou da mesma classe funcional (lista `tools/content/grammar-sets.json`: `[is, are, was, were]`, `[a, an, the]`, `[do, does, did]`, `[go, goes, went, going]`, ...); `kind: "lexical"` exige que todas as `options` estejam no vocabulário da lição com a mesma `pos` e nunca sejam vizinhos ortográficos (distância de edição > 2 ou comprimento diferente). Bloqueia.
- C8. `pt` em registro "você": regex `\b(tu|te|ti|teu|teus|tua|tuas|vós|vos|vosso|vossos|vossa|vossas|contigo|convosco)\b` e verbos em -ais/-eis/-is de 2ª do plural (`\b\w+(ais|eis)\b` com lista branca: "pais", "mais", "reis", "leis", "seis", "dez", "jamais", "depois") proibidos em `pt` de beats, reading, conversation, vocab e tips; permitidos só em `altPt` e `classicPt`. Bloqueia.
- C9. Sem travessão em nenhum campo de texto (estende a linha 37 a todos os campos). Bloqueia.
- C10. No máximo 2 beats começam com as mesmas duas palavras (mantém a linha 44) e no máximo 4 com a mesma primeira palavra. Avisa.
- C11. Pelo menos 1 beat em cada parte com `gap.kind: "grammar"` cuja `grammar` bate com `tips[part].grammar`. Bloqueia.

Bloco D, versículo, leitura, conversa, fato:
- D1. `verse.text`, `classic`, `pt`, `classicPt`, `ref` presentes; `text` com no máximo 18 palavras; cada `blanks[i].word` aparece exatamente uma vez em `text` (reaproveita a regex da linha 47) e está em `options`; 4 opções únicas; 2 a 3 lacunas; nenhuma `option` aparece no `text` fora da lacuna (CB-23); nenhuma `option` é sinônimo listado da resposta (`tools/content/synonyms.json`, pequeno). Bloqueia.
- D2. `reading.text` com 3 a 5 frases (contagem por `[.!?]`), discurso direto entre aspas, sem arcaísmos (C3), palavras de conteúdo cobertas (C5 com tolerância de até 3 palavras glosadas em `hints`, porque a leitura é receptiva e tem dica por toque); `questions` com exatamente 2, `kind` literal e inference; nenhuma `option` é substring literal de 4+ palavras do `text` (CP-09); `answer` em `options`; `qPt` presente. Bloqueia.
- D3. `conversation.turns`: 3 a 4 turnos; exatamente 2 com `who: "you"`; cada um com 3 `options` únicas, `answer` em `options`, todas as opções com o mesmo número de frases (±1) e comprimento parecido (±4 palavras); nenhuma opção contém palavra de vocabulário de outra unidade que ainda não foi ensinada na ordem de `course.json` (CP-08, CL-09); nenhuma opção cita nome de `names` de outra unidade. Bloqueia.
- D4. `fact.pt` com referência em `fact.ref`; sem travessão. Bloqueia.
- D5. Sem `quiz` e sem `dialogue` em v2 (campos legados são gerados pelo merge). Avisa se existirem.

Bloco E, cruzamentos de curso (`--all`):
- E1. Cada palavra nova (`tier` qualquer, sem `recycle`) ocorre em beats, reading ou conversation de pelo menos 3 lições posteriores (ou cenas da unidade seguinte). Avisa (vira bloqueio quando as 24 lições estiverem prontas).
- E2. Lista mínima de alta frequência (seção 4.1) coberta até u8: pronomes, possessivos, question words, números 1 a 12 e 40, tempo, família, comida, corpo, lugares, 40 verbos. Avisa listando as que faltam.
- E3. Frase repetida entre lições (mantém o aviso do `merge.js:23`).

### 3.5 Mudanças exatas em `tools/content/merge.js`

1. Ler `content/course.json` para a ordem (`order`) e os cabeçalhos (`units`), em vez de `OLD` (linhas 6-9). Gerar `COURSE` na ordem de `order`.
2. Para cada lição v2, gravar em `data.js` os campos v2 integrais (`tips`, `names`, `hints`, `vocab` com todos os campos, `beats`, `contrast`, `verse` com `blanks`, `reading` com `questions`, `conversation`, `fact`) e também os campos legados derivados, até o motor v2 substituir o atual:
   - `sentences` = `beats.map(b => ({ en: b.en, pt: b.pt, alt: b.alt, altPt: b.altPt }))`;
   - `verse.blank` = `blanks[0].word`, `verse.options` = `blanks[0].options`;
   - `reading.q/options/answer` = `questions[0]`;
   - `dialogue` = `{ line: turns[0].en, pt: turns[0].pt, options: turns[1].options, answer: turns[1].answer, answerPt: turns[1].pt }`;
   - `quiz` = `{ q: questions[1].q, options, answer, explain: questions[1].explain || fact.pt }`.
3. Manter a lição de revisão `{ id: u.id + "r", title: "Revisão", review: true }` e acrescentar `checkpoint: true` (seção 8.9).
4. Gerar `UNIT_CAST` e `CHARACTER_UNIT` num novo `content/cast.js` a partir de `units[*].cast` (o app importa de lá; `characters.js` deixa de definir os dois).
5. Avisos cruzados existentes (vocab e frases repetidas, linhas 19-24) continuam.
6. Imprimir o resumo com a contagem nova: `unidades · palavras (core/bible) · chunks · beats · dicas`.

Comando de verificação de ponta a ponta: `node tools/content/validate.js --all --scenes --stories && node tools/content/merge.js && cd app && npm run build`.

---

## 4. Regras de conteúdo

### 4.1 Vocabulário

- Por lição: 8 palavras de conteúdo (4 por parte) + 2 chunks (1 por parte) + 0 a 2 palavras funcionais por parte introduzidas pela Dica (`the`, `a`, `was`, `not`, `my`, `there`, `only`, `did`). Carga: 24 lições x 10 itens = 240 itens de lição, cerca de 50 funcionais únicos via Dica, 240 expressões das cenas, mais os nomes de "Quem é quem": entre 530 e 560 itens, dentro do alvo A1 completo (500 a 600). Uma eventual lição "Inglês do dia a dia" por unidade (5 palavras + 1 chunk sobre o tema da passagem) é extensão opcional e não entra nesta reescrita.
- Proporção 70/30 por lição (>= 6 dos 8 itens de conteúdo no top 2000). Itens `tier: "bible"` (no máximo 2 por lição: `lamb`, `frog`, `ark`, `furnace`, `altar`, `prophet`...) são ensinados só receptivamente: entram em `intro-word`, `image-choice`, `choice-en-pt`, `listen`, `match` e em beats de escuta; nunca em `type`, `type-sentence` ou `speak`.
- Nomes próprios (God, the Lord, Pharaoh, Egypt, Babylon, Noah, Peter) e títulos ficam em `names` e no card "Quem é quem" da `lesson-intro`, com pronúncia; não entram em `image-choice`, `type` nem na repetição espaçada (CP-31). "I AM", "two by two", "with us" deixam de ser vocabulário (CL-19): "I AM" vira beat citado (`Êxodo 3:14`), "two by two" vira o beat "The animals came in two by two", "Immanuel = Emanuel (Deus conosco)" vai para `names` com `note`.
- Cada palavra nova aparece em pelo menos 2 beats da própria parte (B7) e volta em 3 lições posteriores (E1).
- Sem repetição de `en` entre unidades salvo `recycle: true` (CL-32). Trocas obrigatórias: u2l2 `water` fica, u1l1 deixa de ensinar `water` (ver Anexo A); `seven` fica em u1l2 e u6l2 usa `fat` e `thin`; `alive` fica em u2 e u6l3 usa `to hug`; `holy` fica em u3l1 e u5l1 usa `seraph` (bible); `afraid` fica em u3 e u8l3 usa `wave` e `to sink`; `to walk` fica em u3l3; `to forgive` fica em u6l3 e u8l2 usa `debtor` (bible); `kingdom` fica em u7l3.
- Forma de dicionário: substantivo no singular (`star`, `animal`, `frog`, `wing`, `color`, `debt`, `loaf` com `plural: "loaves"`), exceto plurais lexicalizados (`vegetables`, `lips`); verbo com "to "; adjetivo sem artigo (CL-18).
- Glosas modernas (CL-16, CL-19): aliança, lutar, feixe, comida, governo, brilhar, vivo, sandálias (`sandals`), copeiro (`cupbearer`), oliveira (`olive tree`), trigo. Glosas distintas para pares próximos (CL-17): `wife` = esposa, `ground` = chão, `den` = cova dos leões (bible), `pit` = poço, `mighty` = poderoso, `to cast` = lançar.
- Lista mínima de alta frequência a cobrir até u8 (E2): pronomes (I, you, he, she, we, they, it), possessivos (my, your, his, her, our, their), palavras interrogativas (who, what, where, when, why, how, how many, how much), números 1 a 12 e 40, tempo (day, night, morning, evening, today, now, year), família (father, mother, son, daughter, brother, sister, wife, family, friend), comida (bread, water, fish, fruit, wine, food, meat), corpo (hand, heart, eye, mouth, foot, head), lugares (house, city, land, sea, river, mountain, garden, road), 40 verbos básicos (be, have, go, come, make, see, say, give, take, eat, drink, sleep, walk, run, open, close, send, follow, pray, sing, write, read, buy, sell, love, help, work, wait, ask, answer, know, think, want, need, find, put, bring, call, leave, look).

### 4.2 Frases (beats)

- 12 beats por lição, numerados por `order` e cobrindo a passagem em ordem (início, conflito, clímax, desfecho). Parte 1: `order` 1 a 6; Parte 2: 7 a 12.
- Toda frase de produção (`prod !== false`): oração completa com sujeito e verbo, 4 a 10 palavras, inglês atual, sem `thee`, `thou`, `shall`, `unto`, `upon`, `hath`, `saith`, `void`; pontuação só final (omitida no JSON e renderizada pela interface), discurso direto com vírgula e aspas apenas em beats `iconic`.
- Por lição: >= 2 perguntas, >= 1 negativa, >= 1 fala em 1ª pessoa, 2 pares de contraste mínimo ligados à Dica ("God made the sun for the day" / "God made the moon for the night"; "The king let the people go" / "The king did not let the people go"). Um `fill-bank` usa um par por visita (CP-34).
- Fragmentos sem verbo ("The tree of life", "Five loaves and two fishes", "Forty days and forty nights") só no card do versículo; nos beats viram frases completas: "The tree of life was in the garden", "We only have five loaves and two fish", "It rained for forty days and forty nights" (CL-35).
- Citações icônicas curtas e correntes mantidas e marcadas `iconic: true`: "Let there be light", "Let my people go", "Follow me", "The Lord is my shepherd", "Here I am. Send me!", "The battle is the Lord's", "Lord, save me!", "Bring them to me".
- Decalques do hebraico reescritos (CL-20): "The prison keeper put Joseph in charge of all the prisoners", "Joseph hugged his brother Benjamin and cried", "The doorposts shook at his voice", "on the earth" (não "in the earth"), "look at" (não "look on"), "all over Galilee".
- `pt` em "você" (imperativo em -e/-a: Tire, Deixe, Venha, Tragam); `altPt` obrigatório quando houver sinônimo comum (céu/céus, Senhor/SENHOR) ou forma Almeida conhecida; `alt` em inglês para variantes (heavens/heaven, fish/fishes, sandals/shoes, ark/ship).
- Contrações: nos beats narrados, formas plenas ("do not", "it is") por serem lidas pelo narrador; nas conversas e cenas, contrações por padrão ("don't", "it's"). `normalize()` (`util.js:31-41`) aceita as duas, então nenhuma `alt` extra é necessária.

### 4.3 Versículo

- Fonte do texto principal: World English Bible, consultada com `tools/content/web.mjs` (que já troca "Yahweh" por "the LORD", linha 51). Duas adaptações editoriais declaradas na tela de créditos: "the LORD" exibido como "the Lord" com versalete opcional por CSS (`font-variant: small-caps`) em vez de caixa alta no texto (CL-10); "ship" em Gênesis 6-9 lido como "ark" (termo universal: "Noah's ark"). Quando a KJV não tem arcaísmo e é a forma mais conhecida (Mateus 4:19 "Follow me, and I will make you fishers of men"), ela pode ser o texto principal e a WEB vai para `alt`.
- `classic` = KJV literal; `classicPt` = Almeida Revista e Corrigida de 1898 literal (domínio público); `pt` = versão livre moderna do BíbliaLearn em "você", fiel ao sentido, rotulada "versão livre" na interface. Decisão aberta para o dono: licenciar NVI/NAA ou verificar a licença da Bíblia Livre se quiser um texto reconhecido nas igrejas; em qualquer cenário, o que o aluno monta é o `pt` moderno.
- Texto com no máximo 18 palavras (cabe em uma linha e meia no celular), um trecho sem saltos internos; se cortar o início, começar com maiúscula.
- `blanks`: 2 ou 3 lacunas alternativas, cada uma com 4 opções da mesma classe gramatical, ausentes do versículo e sem sinônimo da resposta. Modos por visita: 1ª lacuna por escolha (sorteada entre as 2 ou 3), 2ª `verse-build` (montar com banco), 3ª `verse-type` (ditado).
- O card exibe: texto WEB com áudio na voz do narrador, `pt` versão livre, botão "versão clássica" que mostra `classic` e `classicPt`. A doxologia de Mateus 6:13b fica fora de lacuna e pergunta, com nota no `fact` de u8l2 (CB-32).

### 4.4 Leitura (`reading`)

- 3 a 5 frases em inglês atual que recontam os beats em ordem (pode incluir 1 detalhe a mais da passagem), discurso direto com vírgula e aspas, só vocabulário já ensinado mais no máximo 3 palavras glosadas em `hints` (com dica por toque).
- 2 perguntas: `q1` literal (a resposta está no texto, mas as opções são parafraseadas, nunca copiadas: "began to sink" vira "started to go down into the water"), `q2` de inferência (why, what happens next, who is speaking, which came first), com 1 distrator verdadeiro que não responde à pergunta e 1 falso plausível. `qPt` sempre presente; o `explain` da q2 fica em português e cita a referência.
- O português do texto só aparece depois de verificar (`Choice.jsx:126-131` passa a renderizar `ReadingPt` apenas quando `session.checked`). Perguntas lidas pelo narrador.

### 4.5 Conversa (`conversation`, substitui `dialogue`)

- 3 a 4 turnos entre o aluno (no papel do narrador ou de um discípulo, nunca no papel de Jesus nem da voz do Senhor, CS-21) e um interlocutor da passagem. O aluno responde 2 turnos escolhendo entre 3 respostas; o último turno pode ser falado (`speak: true`).
- As 3 respostas são gramaticais, do mesmo registro, do mesmo tamanho e da mesma cena; só a pragmática decide: "Noah, what are you making?" com "An ark of wood." / "A door for the ark." / "Food for the animals." Proibido citar personagens ou objetos de outra unidade (regra D3).
- Cada conversa usa o chunk da lição em pelo menos uma resposta correta e segue as contrações da fala natural ("It's the light", "Don't be afraid").
- `intent` (português curto: "Diga o que é e quem fez") é mostrado em vez da tradução da resposta, para que o aluno não ache a opção por cognato (CS-03).

### 4.6 Quiz e "Você sabia?"

- O `quiz` deixa de existir como exercício: a segunda pergunta da leitura cumpre o papel de compreensão e usa só vocabulário ensinado.
- A curiosidade bíblica (Shadrach, Meshach e Abednego; Davi tinha 30 anos ao reinar; a Páscoa lembra a noite do sangue) vai para o `fact-card` silencioso no fim da lição, com +2 XP e referência, sem coração. Nenhuma pergunta pode cobrar fato ausente dos beats, da leitura ou da conversa (CB-04).

### 4.7 Distratores

| Exercício | Regra | Exemplo |
|---|---|---|
| Palavra (`image-choice`, `choice-en-pt`, `choice-pt-en`, `listen`) | mesma `pos`; preferir mesma lição e mesmo `field`; comprimento parecido (±3 letras); nunca nome próprio; nunca sinônimo ou glosa básica igual; nunca mesmo ícone/imagem | `earth`: light / sun / moon (nunca sete / criar) |
| Lacuna lexical (`missing-word`, `fill-bank`) | 2 a 3 opções da mesma `pos` do vocabulário da lição que cabem gramaticalmente mas não no sentido; distância de edição > 2 | "And there was ___": light / earth / sun |
| Lacuna gramatical (`missing-word`) | variantes morfológicas ou mesmo conjunto funcional (`grammar-sets.json`) | "The earth ___ dark": was / is / were |
| Banco (`build`, `listen-build`, `fill-bank`, `verse-build`) | 2 a 3 peças extras da mesma `pos` e tempo verbal da frase; peças sem pontuação (`cleanWord`, `util.js:81`) | extras para "God made the light": created / a |
| Frase (`listen-choice`) | traduções de beats da mesma parte com a mesma estrutura, diferindo em 1 ou 2 palavras de conteúdo | "Deus fez o sol para o dia" / "Deus fez a lua para a noite" |
| Conversa | 3 respostas plausíveis da mesma cena (4.5) | |
| Leitura | opções parafraseadas; 1 verdadeira que não responde | |
| Versículo | 3 distratores da mesma classe, ausentes do versículo | |

O validador rejeita: mistura de `pos` nas opções de palavra, opção de conversa com palavra de outra unidade, lacuna com vizinho ortográfico, opção de versículo presente no texto.

### 4.8 Ícones e ilustrações

- Emoji até a versão 12.0 em lições, cenas e histórias (validador já bloqueia U+1FA70 a U+1FAFF; passa a rodar também em `scenes.js`, `scenes2.js` e `stories.js`, CL-15). Substituições (os sete glifos proibidos citados pelo code point): wood U+1FAB5 por 🌲, window U+1FA9F por 🖼️, rock U+1FAA8 por 🗻 e stone por 🔘, chair U+1FA91 (table) por 🍽️, stethoscope U+1FA7A (How do you feel?) por 🤒, bandage U+1FA79 (Are you hurt?) por 🤕, coin U+1FA99 por 💰.
- Um ícone representa um só conceito em todo o curso (`tools/content/icons.json`, regra B9). Resolução dos conflitos atuais (CL-13, CL-14): fire 🔥, coal ♨️, altar ⛪, furnace 🌋, zeal 💥; king 👑, throne 💺, to reign 🏛️, kingdom 🏰, ruler 🎖️, Pharaoh 🧔 (como nome, no card), to anoint 🧴; prophet 🗣️, covenant 🤝, decree 📣; God 🙏, grace 🎁, prayer 🛐, faith 💗; mountain ⛰️, rock 🗻; star ⭐, sign 🚩; shield 🛡️, faithful 💙, to deliver 🆓; afraid 😨, to fear 😰; stone 🔘, giant 🏋️, statue 🗿, net 🕸️, sack 🎒, cup 🥤, great 🔝, disciple 🧑‍🎓, virgin 👧, sling 🎯, to cast 🎣. Verbos mostram a ação, não o objeto.
- `image-choice` só para substantivos concretos e verbos de ação com ilustração própria (`image`, conjunto gerado no mesmo estilo dos retratos, 1 PNG de 256 x 256 px por palavra em `app/public/img/vocab/`); abstratos (`grace`, `mercy`, `faith`, `likeness`) usam `choice-en-pt` com a frase-exemplo (CP-20). Enquanto a ilustração não existir, o card usa o emoji e o validador avisa.

---
## 5. Guia de estilo linguístico

### 5.1 Política de fontes

- **Inglês dos versículos: WEB** (World English Bible, domínio público declarado em ebible.org, inglês contemporâneo, aspas no discurso direto). Já está instalada no projeto (`app/node_modules/world-english-bible/json`) e consultável por `node tools/content/web.mjs "Isaías 9:6"`. Conferir cada texto com a ferramenta antes de gravar no JSON; os textos da seção 6 foram extraídos dela.
- **KJV** (1611/1769): apenas `classic` no card do versículo e `alt` nas frases citadas. Nunca cobrada.
- **Português dos versículos**: `pt` é versão livre moderna em "você"; `classicPt` é a Almeida Revista e Corrigida de 1898 (domínio público; é o texto que já está nos 24 `verse.pt` atuais, com as duas correções de CB-22: 2 Samuel 22:2 "O SENHOR é o meu rochedo, e o meu lugar forte, e o meu libertador" e Mateus 14:19 "tomando os cinco pães e os dois peixes e erguendo os olhos ao céu, os abençoou").
- Toda frase citada ganha `alt` (forma WEB e forma KJV sem pronome arcaico) e `altPt` (forma Almeida e variantes céu/céus, Senhor/SENHOR, pronome oblíquo alternativo). Regra de ouro: nenhuma resposta correta de um falante nativo pode ser marcada errada.

### 5.2 Inglês

- Nível A1/A2: uma ideia por frase; presente, passado simples e imperativo até u4; will, modais e passiva simples de u5 em diante.
- Inglês americano: color, counselor, forever, knelt, showed, steadfast, neighbor, favor. Grafias KJV/britânicas só em `alt`.
- Proibidos em frases livres, leituras, conversas, fatos e cenas (regra C3): thee, thou, thy, thine, ye, unto, hath, saith, doth, shalt, art, hast, whereon, standest, looketh, saveth, shewed, stedfast, brethren, lest, verily, midst, upon, purposed, trespass, void; e as construções "go about", "fell on the neck", "be of good cheer", "woe is me" (vira "I am ruined!").
- Nome divino: "the Lord" em frases, conversas e cenas; "LORD" só na exibição do versículo, via versalete em CSS; "God" sempre maiúsculo; pronomes referentes a Deus em minúscula (padrão WEB).
- Naturalidade: "on the earth", "look at", "put in charge of", "hugged", "shook", "all over Galilee", "Take courage! It's me. Don't be afraid."; nunca tradução literal do hebraico.
- Contrações por padrão em conversas, cenas e histórias (I'm, it's, that's, don't, can't, let's, I'll, you're); formas plenas em beats narrados, versículos e ênfase ("I AM").
- Maiúsculas: títulos antes de nome (King Darius, Pharaoh, Prophet Isaiah), topônimos compostos (Sea of Galilee, Red Sea, Mount Sinai); "lions' den" em minúscula; "Holy, holy, holy" e "Santo, santo, santo" com o mesmo critério (CL-33).
- Nomes em inglês moderno: Jonah (profeta), "Simon, son of John" para o pai de Pedro (ou "son of Jonah" com nota no `fact`), Ishmaelites (alt Ishmeelites), Shem, Ham, Japheth (CL-24).

### 5.3 Português

- Registro único "você/vocês" em beats, leituras, conversas, dicas, cenas, histórias e interface; imperativo em -e/-a (Tire, Deixe, Venha, Tragam, Ponham); "Olha!" e "Vem!" aceitos só como interjeição coloquial em cenas; ênclise só quando natural ("Perdoe-nos" sim; "Tragam-nos a mim" vira "Tragam para mim") (CL-36).
- Acentos e cedilha obrigatórios em tudo (conteúdo e interface). Sem travessão (U+2014) em nenhum texto: `Choice.jsx:94` troca o travessão entre `{ex.verse.ref}` e `“{ex.verse.pt}”` por dois-pontos; `checker.js:25`, `:34` e `:49` trocam o travessão entre `"${s.en}"` e `${s.pt}` pelo sinal de igual, como já fazem as linhas 12 a 23 (CL-31, CP-14).
- Discurso direto: português com dois-pontos e aspas, maiúscula após os dois-pontos ("Deus disse: "Haja luz.""); inglês com vírgula e aspas (God said, "Let there be light.").
- Vocabulário moderno nas glosas e nas frases (seção 4.1); o termo da Almeida em `altPt` e `classicPt`.
- Traduções sem contrassenso: "The Lord shut the door behind him" / "O Senhor fechou a porta atrás dele" (não "por fora", CL-34).

### 5.4 Nomes próprios (glossário único inglês = português)

Deus: God = Deus; the Lord = o Senhor; the Spirit of God = o Espírito de Deus; Immanuel = Emanuel. Pessoas: Adam = Adão, Eve = Eva, Noah = Noé, Shem = Sem, Ham = Cam, Japheth = Jafé, Abraham = Abraão, Isaac = Isaque, Jacob = Jacó, Joseph = José, Benjamin = Benjamim, Judah = Judá, Reuben = Rúben, Potiphar = Potifar, Pharaoh = Faraó, Moses = Moisés, Aaron = Arão, Miriam = Miriã, Joshua = Josué, Samuel = Samuel, Jesse = Jessé, Saul = Saul, David = Davi, Goliath = Golias, Jonathan = Jônatas, Mephibosheth = Mefibosete, Isaiah = Isaías, Uzziah = Uzias, Ahaz = Acaz, Hezekiah = Ezequias, Sennacherib = Senaqueribe, Daniel = Daniel, Belteshazzar = Beltessazar, Shadrach, Meshach and Abednego = Sadraque, Mesaque e Abede-Nego, Nebuchadnezzar = Nabucodonosor, Belshazzar = Belsazar, Darius = Dario, Jesus = Jesus, Peter/Simon = Pedro/Simão, Andrew = André, James = Tiago, John = João, Zebedee = Zebedeu, Zacchaeus = Zaqueu, Bartimaeus = Bartimeu, Martha = Marta, Mary = Maria, Mary Magdalene = Maria Madalena, Elijah = Elias, Elisha = Eliseu, Jeremiah = Jeremias, Jonah = Jonas (o profeta), Ruth = Rute, Esther = Ester, Deborah = Débora, Lydia = Lídia, Rebekah = Rebeca, Abigail = Abigail, Hannah = Ana. Lugares: Eden = Éden, Ararat = Ararate, Egypt = Egito, Canaan = Canaã, Goshen = Gósen, Midian = Midiã, Bethlehem = Belém, Gath = Gate, Jerusalem = Jerusalém, Zion = Sião, Babylon = Babilônia, Nineveh = Nínive, Galilee = Galileia, Sea of Galilee = mar da Galileia, Red Sea = mar Vermelho, Nazareth = Nazaré. Povos: Ishmaelites = ismaelitas, Egyptians = egípcios, Philistines = filisteus, Medes and Persians = medos e persas, Chaldeans = caldeus. Em português o título vai em minúscula quando é cargo (rei Dario, profeta Isaías) e Faraó em maiúscula quando usado como nome sem artigo.

### 5.5 Variantes aceitas

Obrigatórias para toda frase com citação: forma WEB, forma KJV sem arcaísmo de pronome, sinônimos consagrados (fish/fishes, fishers of men/fishers for men, sandals/shoes, ark/ship, rainbow/bow, counselor/counsellor, forever/for ever). `normalize()` já cobre contrações, apóstrofo tipográfico e hífen. Para `altPt`: céu/céus, Senhor/SENHOR, forma Almeida, forma moderna, ordem alternativa de pronome ("o fechou" / "fechou ele"). Script auxiliar `tools/content/variants.mjs` gera as variantes mecânicas (céu/céus, Senhor/SENHOR, tu para você) para revisão manual (CL-28).

### 5.6 Tom

- Beats: narrativa clara e concreta, verbos de ação, nada de paráfrase solene; a reverência fica no versículo.
- Conversas, cenas e histórias: cotidiano como palco, Bíblia como verdade; a graça nasce do contraste (o mercador que nunca viu barco, o copeiro nervoso, Golias que acha a funda ridícula). Falas de Jesus e da voz do Senhor próximas do texto (`fact: true`), sem piada; o humor vem dos humanos ao redor.
- Campo `mood` por fala de conversa, cena e história (lista fechada de 12: calmo, animado, surpreso, assustado, triste, irônico, bravo, carinhoso, urgente, solene, rindo, sussurrando) alimenta a expressão do retrato e a direção de voz (seção 7.6).

---

## 6. Arco narrativo por lição (24 entradas)

Regras do arco: ordem cronológica (u1, u2, u6, u3, u4, u5, u7, u8), ids mantidos; cada lição tem início, conflito, clímax e desfecho distribuídos nos 12 beats (Parte 1: beats 1 a 6; Parte 2: 7 a 12); todo fato cobrado em leitura ou conversa aparece em beat; versículo em WEB (texto literal da ferramenta `web.mjs`, com "the LORD" exibido como "the Lord"), no máximo 18 palavras, 2 ou 3 lacunas; narrador = voz da galeria que lê beats e versículo; convidados = vozes de conversa e falas marcadas. Dicas P1/P2 = gramática das duas partes (sílabo da seção 2.2).

### Unidade 1: A Criação e o Éden (Gênesis 1-3). Narrador Adão; convidados Eva e a voz do Senhor.

**u1l1 "No princípio" (Gênesis 1:1-19).** Fatos-chave: terra vazia e escura, Espírito sobre as águas (1:2); "Haja luz", a luz era boa, Dia e Noite (1:3-5); céu, mares e terra seca, plantas (1:6-13); quarto dia: sol, lua e estrelas (1:14-19). Versículo: Gênesis 1:1 WEB "In the beginning, God created the heavens and the earth." (lacunas created, beginning, earth; KJV "In the beginning God created the heaven and the earth."). Dicas: P1 was/were (passado de to be); P2 there was / there were. Chunks: "Let there be light"; "It was good". Modelo completo no Anexo A.

**u1l2 "Os sete dias" (Gênesis 1:20 a 2:3).** Fatos-chave: quinto dia, peixes e aves (1:20-23); sexto dia, animais e o ser humano à imagem de Deus, homem e mulher (1:24-27); "era muito bom" (1:31); sétimo dia, Deus descansou e abençoou o dia (2:2-3). Versículo: Gênesis 1:31 (trecho) WEB "God saw everything that he had made, and, behold, it was very good." (lacunas good, everything, saw; KJV "And God saw every thing that he had made, and, behold, it was very good."); alternativa Gênesis 2:2 (trecho) "He rested on the seventh day from all his work which he had done." (lacuna rested). Dicas: P1 plural regular (-s) e ordinais (first, sixth, seventh); P2 adjetivos com very (very good, very big). Chunks: "very good"; "It is time to rest". Vocabulário sugerido: bird, animal, man, woman, seven, to rest, sky, to bless (fish fica para u8l3); nomes: Day, Night. Narrador Adão; Eva no sexto dia.

**u1l3 "O jardim e a queda" (Gênesis 2:4 a 3:24).** Fatos-chave: pó da terra e sopro de vida; jardim no Éden, árvore da vida e a ordem "não coma" (2:7-9, 16-17); "não é bom que o homem esteja só", a mulher (2:18-23); a serpente, "Deus disse mesmo?", os dois comem e se escondem (3:1-8); "Onde você está?" e as consequências (3:9-19); túnicas de peles e saída do jardim (3:21-24). Versículo: Gênesis 3:9 WEB "The Lord God called to the man, and said to him, 'Where are you?'" (lacunas Where, man, called; KJV "And the LORD God called unto Adam, and said unto him, Where art thou?"); alternativa Gênesis 2:18 (trecho) "It is not good for the man to be alone." (lacuna alone). Dicas: P1 artigos the/a e possessivos my/your/his; P2 perguntas com where (Where are you? Where is the tree?). Chunks: "Where are you?"; "Do not eat". Vocabulário: garden, tree, fruit, to eat, snake (bible), alone, to hide, afraid (recycle não: primeira ocorrência aqui; u3l1 marca recycle). Narradora Eva (protagonista do capítulo 3); Adão responde; a voz do Senhor pergunta. Corrige CB-03 (a queda não existia).

### Unidade 2: Noé e a arca (Gênesis 6-9). Narrador Noé; convidados Sem, Naamá (esposa de Noé, promovida à galeria) e a voz do Senhor.

**u2l1 "A arca" (Gênesis 6:5-22; 7:1-16).** Fatos-chave: maldade grande, "Noé achou graça", justo, andava com Deus (6:5-9); arca de madeira de gofer, 300 x 50 x 30 côvados, betume, porta, janela, três andares (6:14-16); animais aos pares e sete pares dos limpos; Sem, Cam e Jafé; Noé, a esposa, os filhos e as noras, oito pessoas (6:10, 19-20; 7:2, 7, 13; corrige CB-30); "o Senhor fechou a porta atrás dele" (7:16); "Noé fez tudo o que Deus mandou" (6:22). Versículo: Gênesis 6:22 WEB "Thus Noah did. He did all that God commanded him." (lacunas commanded, all; KJV "Thus did Noah; according to all that God commanded him, so did he."); alternativa 6:14 "Make an ark of gopher wood." (lacunas ark, wood; WEB traz "ship", adaptado). Dicas: P1 passado regular -ed (walked, closed, covered); P2 preposições de lugar (in, on, into, out of). Chunks: "What are you making?"; "Come into the ark". Vocabulário: wood, door, big, to build, animal (recycle de u1l2), wife, son, to close (window fica como glosa e nas cenas).

**u2l2 "O dilúvio" (Gênesis 7:11 a 8:5).** Fatos-chave: Noé com 600 anos; fontes do abismo e janelas do céu (7:6, 11); chuva por quarenta dias e quarenta noites (7:12); águas acima dos montes por 150 dias (7:20, 24); só Noé e os da arca sobreviveram (7:21-23); "Deus se lembrou de Noé", vento, as águas baixam, a arca para no Ararate (8:1-4). Versículo: Gênesis 8:1 (trecho) WEB "God remembered Noah, all the animals, and all the livestock that were with him in the ark" (lacunas remembered, animals; "ship" adaptado; KJV "And God remembered Noah, and every living thing, and all the cattle that was with him in the ark"); alternativa 7:12 "It rained on the earth forty days and forty nights." (lacunas rained, nights, earth). Dicas: P1 números e quantidades (two, eight, forty, many, all); P2 for + duração (for forty days, for a long time). Chunks: "It is raining!"; "We are safe". Vocabulário: rain, water, mountain, forty, to rain, alive, wind, to wait.

**u2l3 "A pomba e o arco" (Gênesis 8:6 a 9:17).** Fatos-chave: corvo; pomba três vezes, folha de oliveira à tarde (8:7-12); "saia da arca" e a saída de todos (8:15-19); altar (8:20); "enquanto a terra durar" (8:22); aliança com toda carne e o arco-íris nas nuvens (9:11-17). Versículo: Gênesis 9:13 WEB "I set my rainbow in the cloud, and it will be a sign of a covenant between me and the earth." (lacunas cloud, rainbow, sign; KJV "I do set my bow in the cloud, and it shall be for a token of a covenant between me and the earth."). Dicas: P1 conectores and / but / then; P2 there is / there are no presente (There is a rainbow in the cloud). Chunks: "Go out of the ark"; "never again". Vocabulário: dove, leaf, cloud, rainbow, promise, covenant (bible), to send, to go out.

### Unidade 3 (nova posição): José no Egito (Gênesis 37-50). Narrador José; convidados Jacó, Judá, Faraó, Copeiro, Benjamim.

**u6l1 "Os sonhos e a túnica" (Gênesis 37).** Fatos-chave: dezessete anos, túnica colorida, o pai o amava mais (37:2-4); dois sonhos: os feixes; sol, lua e onze estrelas (37:5-11); poço seco em Dotã; Rúben quer salvá-lo (37:17-24); Judá propõe vender aos ismaelitas por vinte moedas de prata (37:26-28); a túnica no sangue do cabrito; Jacó chora (37:31-35). Versículo: Gênesis 37:5 (trecho) WEB "Joseph dreamed a dream, and he told it to his brothers." (lacunas dream, brothers, told; KJV "And Joseph dreamed a dream, and he told it his brethren."); alternativa 37:28 (trecho) "sold Joseph to the Ishmaelites for twenty pieces of silver" (lacuna twenty). Dicas: P1 passado de verbos de sentimento (loved, hated, dreamed) e more than (loved him more than his brothers); P2 pronomes objeto (me, him, them). Chunks: "Listen to my dream"; "Let's sell him". Vocabulário: dream, coat, brother, father, to love, to hate, to sell, silver. Narrador José jovem; Judá nos diálogos. O distrator "To Potiphar" sai (CB-12): a pergunta de inferência passa a ser sobre o motivo da venda.

**u6l2 "Da prisão ao palácio" (Gênesis 39-41).** Fatos-chave: casa de Potifar, "o Senhor estava com José" (39:2-6); a mentira da mulher de Potifar, em linguagem segura para crianças, e a prisão; o carcereiro põe José como responsável por todos os presos (39:14-23; corrige CB-10); copeiro e padeiro, "as interpretações pertencem a Deus", três dias; o copeiro esquece por dois anos (40:5-23; 41:1); sonho de Faraó: sete vacas e sete espigas, sete anos de fartura e sete de fome (41:1-36); governador do Egito aos trinta anos (41:40-46). Versículo: Gênesis 39:21 (trecho) WEB "But the Lord was with Joseph, and showed kindness to him." (lacunas with, kindness, showed; KJV "But the LORD was with Joseph, and shewed him mercy."). Dicas: P1 because / so; P2 can / cannot (Can you explain my dream? I cannot, but God can). Chunks: "Can you help me?"; "Do not forget me". Vocabulário: prison, cow, year, fat, thin, to explain, to forget, to remember.

**u6l3 "Eu sou José" (Gênesis 42-50).** Fatos-chave: os irmãos descem para comprar trigo e se curvam: o sonho se cumpre (42:1-8); dinheiro nos sacos; o copo de prata no saco de Benjamim (42:25; 44:1-12); Judá se oferece no lugar de Benjamim (44:33); "Eu sou José! Meu pai ainda vive?" e "Deus me enviou na frente de vocês" (45:1-8); Jacó desce a Gósen; "vocês quiseram o meu mal, mas Deus transformou em bem" (45:28; 47:27; 50:20). Versículo: Gênesis 50:20 (trecho) WEB "You meant evil against me, but God meant it for good." (lacunas good, evil; KJV "Ye thought evil against me; but God meant it unto good."); alternativa 45:5 (trecho) "God sent me before you to preserve life." (lacuna life). Dicas: P1 identidade e perguntas com to be (I am Joseph! Is my father alive?); P2 passado irregular em bloco (sent, came, saw, meant). Chunks: "I am Joseph"; "Come closer". Vocabulário: grain, sack, cup, alive (recycle de u2l2), to hug, to cry, to forgive, evil.

### Unidade 4 (nova posição): Moisés e o Êxodo (Êxodo 1-15). Narrador Moisés; convidados Arão, Miriã (promovida), Faraó, Josué, a voz do Senhor.

**u3l1 "O cesto e a sarça" (Êxodo 1:8 a 2:10; 3:1 a 4:17).** Fatos-chave: um novo rei, escravidão, ordem contra os meninos (1:8-22); escondido três meses, cesto no rio, Miriã vigia, a filha de Faraó o tira da água (2:1-10; corrige CB-08); fuga para Midiã, pastor (2:15-21); sarça que queima e não se consome, "tire as sandálias", "EU SOU O QUE SOU" (3:1-14); "Arão falará por você" (4:1-17). Versículo: Êxodo 3:5 (trecho) WEB "Take off your sandals, for the place you are standing on is holy ground." (lacunas holy, sandals, standing; KJV "Put off thy shoes from off thy feet, for the place whereon thou standest is holy ground."); alternativa 3:14 (trecho) "I AM has sent me to you." (lacuna sent). Dicas: P1 imperativo afirmativo e negativo (Take off, Do not come close); P2 perguntas com who e what (Who are you? What is your name?). Chunks: "Take off your sandals"; "Who are you?". Vocabulário: baby, river, basket, fire, bush (bible), sandal, holy, name.

**u3l2 "Deixe o meu povo ir" (Êxodo 5-12).** Fatos-chave: "Quem é o Senhor?" e mais trabalho para o povo (5:1-9); coração endurecido e as pragas: sangue, rãs, trevas (7-10); Páscoa: cordeiro, sangue na porta (12:3-11); "quando eu vir o sangue, passarei por vocês" (12:13); meia-noite, Faraó chama Moisés de noite: "Saiam!" (12:29-33); 430 anos (12:40-41). Versículo: Êxodo 12:13 (trecho) WEB "When I see the blood, I will pass over you." (lacunas blood, see, pass; KJV idêntica); alternativa 5:1 (trecho) "This is what the Lord, the God of Israel, says: Let my people go." (lacunas people, go). Dicas: P1 negativa com do not / did not; P2 ordens e instruções (Put, Get out). Chunks: "Let my people go"; "Get out!". Modelo completo no Anexo A.

**u3l3 "O mar se abre" (Êxodo 13:17 a 15:21).** Fatos-chave: coluna de nuvem de dia e de fogo de noite (13:21-22); Faraó persegue com seiscentos carros (14:5-9); "não tenham medo, fiquem firmes, o Senhor lutará por vocês" (14:13-14; corrige CB-05: Moisés fala ao povo, não manda estender a mão); mão estendida, vento leste, águas como muro (14:21-22); o mar cobre os egípcios; cântico de Moisés e de Miriã com tamborim (14:26-28; 15:1-2, 20-21). Versículo: Êxodo 14:14 WEB "The Lord will fight for you, and you shall be still." (lacunas fight, still; KJV "The LORD shall fight for you, and ye shall hold your peace."); alternativa 14:21 (trecho) "made the sea dry land, and the waters were divided" (lacuna divided; distrator "dry" trocado por "calm", CB-23). Dicas: P1 Do not be afraid / Stand still (imperativo com be); P2 preposições de movimento (through, across, into). Chunks: "Do not be afraid"; "Let's go!". Vocabulário: sea, wall, chariot (bible), to fight, to walk, dry, to sing, drum.

### Unidade 5: Davi (1 Samuel 16-18, 24; 2 Samuel 5, 6, 22; Salmo 23). Narrador Davi; convidados Samuel, Jônatas (promovido), Saul, Golias.

**u4l1 "O pastor escolhido" (1 Samuel 16).** Fatos-chave: Samuel vai a Belém com azeite, à casa de Jessé (16:1-5); sete filhos passam: "o Senhor olha para o coração" (16:6-10); o caçula com as ovelhas é ungido (16:11-13); espírito mau atormenta Saul; Davi toca harpa e Saul se alivia (16:14-23). Versículo: 1 Samuel 16:7 (trecho) WEB "Man looks at the outward appearance, but the Lord looks at the heart." (lacunas heart, appearance; KJV "Man looketh on the outward appearance, but the LORD looketh on the heart."). Dicas: P1 passado irregular (took, came, saw, chose); P2 possessivos (my, his, your) e the youngest. Chunks: "Bring him to me"; "Play for me". Vocabulário: shepherd, sheep, oil, heart, harp, youngest, to choose, to play. Leitura e conversa cobrem fatos diferentes do versículo (CB-14: a conversa pergunta quantos filhos passaram, "Seven").

**u4l2 "Davi e Golias" (1 Samuel 17).** Fatos-chave: Golias de Gate, quase três metros, quarenta dias de desafio (17:4-16); Davi leva pão e queijos e ouve o gigante (17:17-26); leão e urso; a armadura de Saul recusada; cajado, funda e cinco pedras (17:34-40); "você vem com espada, eu venho em nome do Senhor; a batalha é do Senhor" (17:45-47); a pedra na testa, o gigante cai (17:49-51). Versículo: 1 Samuel 17:47 (trecho) WEB "The battle is the Lord's, and he will give you into our hand." (lacunas battle, hand, give; KJV "For the battle is the LORD's, and he will give you into our hands."). Dicas: P1 comparativo e superlativo (tall, taller, the tallest; strong, stronger); P2 presente simples 1ª e 2ª pessoa (You come with a sword. I come in the name of the Lord). Chunks: "I am not afraid"; "The battle is the Lord's". Vocabulário: giant, stone, sling (bible), sword, tall, strong, to throw, to fall.

**u4l3 "O rei cantor" (1 Samuel 18:1-4; 24; 2 Samuel 5:1-5; 6:14; 22; Salmo 23).** Fatos-chave: amizade com Jônatas: manto, espada e arco (18:1-4); Davi poupa Saul na caverna (24:4-12); rei aos trinta anos; dança diante da arca (2 Samuel 5:4; 6:14); "O Senhor é a minha rocha" (22:1-4); Salmo 23: pastor, pastos verdes, vale escuro, bondade. Versículo: Salmo 23:1 WEB "The Lord is my shepherd: I shall lack nothing." (lacunas shepherd, nothing; KJV "The LORD is my shepherd; I shall not want."); alternativa 2 Samuel 22:2 (trecho) "The Lord is my rock, my fortress, and my deliverer" (lacuna rock). Dicas: P1 will / will not (I will sing, I will not be afraid); P2 adjetivos de sentimento com feel (I feel safe, happy, afraid). Chunks: "I will sing"; "You are with me". Vocabulário: friend, king, rock, song, green, valley, to sing (recycle de u3l3), safe. "Sing a new song" vira "I will sing a new song to you" (Salmo 144:9, CB-31).

### Unidade 6: Isaías, o profeta (Isaías 6-9; 36-38). Narrador Isaías; convidados Acaz, Ezequias (promovido), o anjo e a voz do Senhor.

**u5l1 "Santo, santo, santo" (Isaías 6).** Fatos-chave: no ano da morte de Uzias, o Senhor no trono alto; serafins de seis asas (6:1-2); "Santo, santo, santo", os umbrais tremem à voz do que clamava (6:3-4; corrige CB-13); "estou perdido, homem de lábios impuros" (6:5); brasa do altar, pecado perdoado (6:6-7); "a quem enviarei?", "Aqui estou. Envie-me!" (6:8). Versículo: Isaías 6:8 (trecho) WEB "Whom shall I send, and who will go for us? Then I said, 'Here I am. Send me!'" (lacunas go, said, Here; KJV "Whom shall I send, and who will go for us? Then said I, Here am I; send me."). Dicas: P1 passado irregular de percepção (saw, heard) e Here I am; P2 will em perguntas (Who will go? Will you go?). Chunks: "Here I am. Send me!"; "Holy, holy, holy". Vocabulário: throne, wing, lip, coal, seraph (bible), to see, to hear, to send. "Here am I; send me" vira apenas `alt` (CL-03).

**u5l2 "Emanuel e o Príncipe da Paz" (Isaías 7:1-16; 9:1-7; Mateus 1:23).** Fatos-chave: dois reis marcham contra Jerusalém; o coração de Acaz treme como árvores ao vento (7:1-2); "fique calmo, não tenha medo" (7:3-9); sinal: "a virgem conceberá... Emanuel" (7:14); o povo em trevas vê grande luz (9:2); "um menino nos nasceu": Maravilhoso Conselheiro, Deus Forte, Pai Eterno, Príncipe da Paz (9:6); Mateus 1:23 explica "Deus conosco" (CB-27). Versículo: Isaías 9:6 (trecho) WEB "His name will be called Wonderful Counselor, Mighty God, Everlasting Father, Prince of Peace." (lacunas Peace, name, called; KJV "And his name shall be called Wonderful, Counsellor, The mighty God, The everlasting Father, The Prince of Peace."). Dicas: P1 futuro com will (A child will be born. His name will be called); P2 títulos compostos e means (Immanuel means God with us). Chunks: "Stay calm"; "God with us". Vocabulário: child, son, sign, peace, counselor, mighty (bible), to be born, to mean. Elimina a repetição de Isaías 9 em duas lições (CB-09).

**u5l3 "Ezequias e o anjo" (Isaías 36-38).** Fatos-chave: o rei da Assíria cerca Judá; o general zomba junto ao aqueduto (36:1-20); Ezequias rasga as roupas, estende a carta diante do Senhor e ora (37:1, 14-20); Isaías: "ele não entrará nesta cidade" (37:33-35); o anjo fere o exército à noite; o rei volta para casa (37:36-37); Ezequias doente: "ponha a sua casa em ordem"; oração e lágrimas; quinze anos; a sombra volta dez degraus (38:1-8). Versículo: Isaías 38:5 (trecho) WEB "I have heard your prayer. I have seen your tears. Behold, I will add fifteen years to your life." (lacunas tears, prayer, fifteen; KJV "I have heard thy prayer, I have seen thy tears: behold, I will add unto thy days fifteen years."); alternativa 41:10 (trecho) "Don't you be afraid, for I am with you." (lacuna afraid). Dicas: P1 presente simples 3ª pessoa (he prays, the king says, the sun goes back); P2 how long / how many (How long will I live? Fifteen years). Chunks: "Put your house in order"; "I have heard your prayer". Vocabulário: letter, city, army, prayer, tear, sick, to pray, to add. Lição nova; substitui a repetição de Isaías 9.

### Unidade 7: Daniel na Babilônia (Daniel 1-6). Narrador Daniel; convidados Nabucodonosor, Dario, Aspenaz, "os três amigos" (voz extra `trio`).

**u7l1 "Fiel na Babilônia" (Daniel 1-2).** Fatos-chave: levado de Jerusalém; nomes novos; três anos de escola (1:1-7); "decidiu não comer a comida do rei"; legumes e água por dez dias; mais saudáveis (1:8-16); dez vezes mais sábios (1:17-20); o sonho da estátua: Daniel pede tempo, ora com os amigos, o segredo é revelado de noite (2:1-19); ouro, prata, bronze, ferro e barro; a pedra que vira montanha; "há um Deus no céu que revela segredos" (2:28-45). Versículo: Daniel 2:28 (trecho) WEB "There is a God in heaven who reveals secrets." (lacunas secrets, heaven, reveals; KJV "But there is a God in heaven that revealeth secrets."); alternativa 1:8 só como `classic` de leitura (purposed, defile, dainties são arcaicos). Dicas: P1 must / must not / cannot (We must not eat this food. I cannot eat it); P2 comparativo com than (better and stronger than the others). Chunks: "I cannot eat this"; "Give us ten days". Vocabulário: food, vegetable, wine, secret, statue, gold, to eat (recycle), to reveal.

**u7l2 "A fornalha de fogo" (Daniel 3). Lição nova.** Fatos-chave: estátua de ouro; ao som da música todos se curvam (3:1-7); Sadraque, Mesaque e Abede-Nego não se curvam (3:12); "o nosso Deus pode nos livrar; e, se não, mesmo assim não adoraremos" (3:16-18); fornalha sete vezes mais quente; quatro homens soltos andando no fogo (3:19-25); nem cheiro de fogo; o rei louva o Deus deles (3:27-29). Versículo: Daniel 3:17 (trecho) WEB "Our God whom we serve is able to deliver us from the burning fiery furnace." (lacunas deliver, furnace, serve; KJV idêntica); alternativa 3:25 (trecho) "I see four men loose, walking in the middle of the fire, and they are unharmed." (lacuna four). Dicas: P1 will not + even if (We will not bow. Even if he does not save us); P2 passiva simples (was thrown, were not hurt). Chunks: "We will not bow"; "Look! I see four men". Vocabulário: music, to bow, furnace (bible), hot, four, to burn, to save, to serve. Corrige CB-04 (a) e CB-07.

**u7l3 "A cova dos leões" (Daniel 6, lição única).** Fatos-chave: Daniel preferido, nenhuma culpa achada (6:1-5); decreto de trinta dias; lei dos medos e persas (6:6-9); janelas abertas para Jerusalém, três vezes ao dia, como antes (6:10); cova, pedra selada com o anel do rei, rei em jejum (6:16-18); "o meu Deus enviou o seu anjo e fechou a boca dos leões" (6:22); acusadores lançados na cova; decreto de Dario: "ele é o Deus vivo" (6:24-27; corrige CB-04 b). Versículo: Daniel 6:22 (trecho) WEB "My God has sent his angel, and has shut the lions' mouths, and they have not hurt me." (lacunas angel, mouths, hurt; KJV "My God hath sent his angel, and hath shut the lions' mouths, that they have not hurt me."). Dicas: P1 frequência (every day, three times a day, as before); P2 could not / did not (The lions could not hurt me). Chunks: "three times a day"; "Good morning, my king". Vocabulário: lion, den (bible), window, law, angel, ring, to pray (recycle de u5l3), to shut. O quiz "signet" vira "ring" (CB-24).

### Unidade 8: Pedro e Jesus (Mateus 4, 6, 14, 16; Lucas 5; João 21). Narrador Pedro; convidados Jesus, André, Zebedeu.

**u8l1 "Pescadores de homens" (Mateus 4:18-25; Lucas 5:1-11).** Fatos-chave: mar da Galileia; Simão e André lançando a rede (Mateus 4:18); "venham comigo, e eu farei de vocês pescadores de homens"; deixaram as redes na hora (4:19-20); Tiago e João com Zebedeu consertando as redes (4:21-22); Lucas: noite sem pescar, "pela sua palavra lançarei a rede", dois barcos cheios (Lucas 5:4-10); Jesus percorre a Galileia ensinando e curando (Mateus 4:23). Versículo: Mateus 4:19 KJV "Follow me, and I will make you fishers of men." (sem arcaísmo; lacunas Follow, fishers, men; WEB "Come after me, and I will make you fishers for men." em `alt`). Dicas: P1 imperativo + will (Follow me, and I will make you); P2 expressões de tempo (all night, right now, immediately). Chunks: "Follow me"; "We worked all night". Vocabulário: net, boat, sea (recycle de u3l3), fisherman, to follow, to leave, to work, to catch. c-jesus-1 "Vem, segue-me" migra para esta unidade como cena de Pedro (seção 7).

**u8l2 "O Pai Nosso" (Mateus 6:5-15).** Fatos-chave: orar no quarto com a porta fechada; sem repetições vazias (6:5-8); "o Pai de vocês sabe do que vocês precisam" (6:8); Pai nosso: nome santo, reino, vontade (6:9-10); pão de cada dia, dívidas e devedores, livramento do mal (6:11-13); "se vocês perdoarem, o Pai de vocês perdoará" (6:14). Versículo: Mateus 6:9 (trecho) WEB "Our Father in heaven, may your name be kept holy." (lacunas Father, holy, name; KJV "Our Father which art in heaven, Hallowed be thy name."); alternativa 6:11 WEB "Give us today our daily bread." (lacuna bread). Dicas: P1 pedidos com pronome objeto (Give us, Forgive us, Lead us); P2 possessivos plurais our/your e daily. Chunks: "Lord, teach us to pray"; "Give us today our daily bread". Vocabulário: father, to give, daily, debt, debtor (bible), room, to ask, to forgive (recycle de u6l3); bread fica como glosa no chunk e é ensinado em u8l3. O vocab "will = vontade" sai (CL-05); "hallowed" sai (CL-04); a doxologia fica fora de lacuna (CB-32).

**u8l3 "Pães, peixes e o mar" (Mateus 14:13-33).** Fatos-chave: a multidão; "deem vocês de comer"; cinco pães e dois peixes (14:15-17); "Tragam para mim"; sentar na grama; abençoou e partiu; cinco mil homens; doze cestos (14:18-21); o barco à noite, vento contrário; Jesus anda sobre o mar: "Sou eu, não tenham medo" (14:22-27); Pedro anda sobre as águas, teme o vento, afunda, "Senhor, salve-me!", a mão estendida (14:28-31); o vento para; "você é mesmo o Filho de Deus" (14:32-33). Versículo: Mateus 14:27 (trecho) WEB "Cheer up! It is I! Don't be afraid." (lacunas afraid, Cheer; KJV "Be of good cheer; it is I; be not afraid."); alternativa 14:19 (trecho) "He took the five loaves and the two fish, and looking up to heaven, he blessed." (lacuna blessed). Dicas: P1 only e how many / how much; P2 perguntas no passado com did. Chunks: "Bring them to me"; "Lord, save me!". Modelo completo no Anexo A.

### 6.1 Ajustes transversais que o arco pressupõe

- Cenas: mover c-jesus-1 a c-jesus-6 para u8 (reescritas com o aluno no papel do discípulo) e criar seis cenas de Gênesis 1-3 para u1 (seção 7.7); criar c-moises-0 (cesto, Êxodo 2:4-9); substituir o mercador de c-noe-2 por Sem e Jafé ou exibir o selo "cena imaginada"; corrigir c-noe-5 (saída só por ordem de Deus, 8:15-16), c-daniel-1 (legumes só para os quatro, 1:16), c-davi-5 (Saul: "A bad spirit troubles me", 16:14), c-jesus-4 (ref "Marcos 4:35-41; Lucas 8:22-25"), c-daniel-5 (acrescentar "Salmo 55:17" ao truth) (CB-15 a CB-20, CB-29).
- Histórias: s1 ganha serpente, "Where are you?" e saída do jardim; s6 troca "To Egypt" por "To whom did the brothers sell Joseph? To the Ishmaelites"; s8 ganha o beat dos doze cestos e move o Pai Nosso para antes dos pães; s7 cita a fornalha em um beat (CB-06, CB-21, CS-12).
- Galeria e elenco: promover Sem, Naamá (esposa de Noé), Miriã, Jônatas, Ezequias e "os três amigos"; `cast` sem anacronismos (seção 3.2).
- Subtítulos: u4 "1 Samuel 16-17; 2 Samuel 22; Salmo 23" (CB-25), u5 "Isaías 6-9; 36-38", u8 "Mateus 4-16; Lucas 5; João 21" (CB-28).

---
## 7. Cenas e histórias v2

Padrão de referência: Duolingo Stories (150 a 300 palavras, 12 a 25 beats, interação a cada 2 a 4 falas, sempre sobre o que ainda não foi revelado ou sobre sentido; elenco fixo com personalidade e voz única; humor em toda história; XP 14 a 28, sem corações). Hoje a cena mostra fala + tradução e cobra a mesma fala no exercício seguinte (`sceneBuilder.js:84-105`), distratores vêm de outras cenas (`sceneBuilder.js:38-55`) e a história tem 40 a 56 palavras com dois formatos (`Story.jsx:120-155`).

### 7.1 Formato de dados v2 (cena)

```json
{
  "id": "c-noe-2", "unit": "u2", "topic": "mercado",
  "title": "Madeira? Quanta madeira?",
  "func": "Comprar, perguntar o preço e pechinchar",
  "hero": "noe", "cast": ["noe", "zabad", "naama"],
  "ref": "Gênesis 6:14, 22",
  "hook": "Noé precisa de muita madeira. O mercador nunca viu um barco.",
  "vocab": [
    { "en": "I need", "pt": "eu preciso", "icon": "🙋", "pos": "chunk" },
    { "en": "How much is it?", "pt": "Quanto custa?", "icon": "💰", "pos": "chunk" },
    { "en": "a lot of", "pt": "muito", "icon": "📦", "pos": "func" },
    { "en": "expensive", "pt": "caro", "icon": "💸", "pos": "adj" },
    { "en": "Deal!", "pt": "Fechado!", "icon": "🤝", "pos": "chunk" }
  ],
  "lines": [
    { "who": "zabad", "en": "Good morning, Noah! What do you need today?", "pt": "Bom dia, Noé! Do que você precisa hoje?",
      "mood": "animado", "fact": false,
      "alt": ["Good morning, Noah! Where is your family?", "Good morning, Noah! Is it raining?"] },
    { "who": "noe", "en": "Good morning. I need wood. A lot of wood.", "pt": "Bom dia. Preciso de madeira. Muita madeira.",
      "mood": "calmo", "fact": false, "gap": "a lot of",
      "alt": ["Good morning. I need water. A lot of water.", "Good morning. I need a boat today."] }
  ],
  "truth": {
    "bible": ["Deus mandou fazer a arca de madeira de gofer e vedá-la com betume (Gênesis 6:14).", "Noé fez tudo como Deus ordenou (Gênesis 6:22)."],
    "imagined": "A compra da madeira e o mercador Zabad.",
    "read": "Gênesis 6:14-22"
  }
}
```

Campos novos por fala: `mood` (lista de 12 da seção 5.6), `fact` (true = citação ou paráfrase direta; false = imaginada), `alt` (exatamente 2 alternativas plausíveis no mesmo contexto, mesmo tamanho ±3 palavras, mudando uma informação), `gap` (expressão do vocabulário presente na fala). Campos novos por cena: `topic` (mercado, casa, viagem, trabalho, saúde, emergência, amizade, fé), `hero`, `cast` (todos os falantes), `hook`, `truth` estruturado (2 marcadores bíblicos + 1 imaginado + trecho para ler).

### 7.2 Formato de dados v2 (história)

```json
{
  "id": "s2", "unit": "u2", "title": "A arca de Noé", "subtitle": "Gênesis 6-9", "cover": "noe",
  "narrator": "lucas", "cast": ["noe", "naama", "sem"], "xp": 15, "xpPerfect": 5, "xpReplay": 8,
  "beats": [
    { "who": null, "en": "Noah is building a boat. There is no sea. There is no rain.", "pt": "...", "mood": "calmo" },
    { "who": "sem", "en": "Father, why a boat? We live in the desert.", "pt": "...", "mood": "surpreso" },
    { "type": "tap-heard", "line": 2 },
    { "who": "noe", "en": "God said, \"Make an ark of wood.\" So I make an ark of wood.", "pt": "...", "mood": "calmo", "fact": true },
    { "type": "what-next", "line": 5, "options": ["Where do the lions sleep?", "Is it raining?", "I like elephants."] },
    { "who": "naama", "en": "Where do the lions sleep?", "pt": "...", "mood": "preocupado" },
    { "type": "meaning", "qPt": "Por que os leões dormem longe das ovelhas?", "options": ["Para não comerem as ovelhas", "Porque gostam de ovelhas", "Porque não há leões"], "answer": "Para não comerem as ovelhas" },
    { "type": "who-said", "quote": "Not yet.", "options": ["noe", "sem", "naama"], "answer": "noe" }
  ]
}
```

Beat de fala: `who` (null = narrador), `en`, `pt`, `mood`, `fact`. Beat de interação: `type` em {`tap-heard`, `what-next`, `meaning`, `who-said`, `fill`, `match`}; a resposta de toda interação deve aparecer verbatim em beat anterior (ou, em `what-next`, ser a fala imediatamente seguinte). 12 a 18 beats, 120 a 200 palavras, narrador com rosto e voz próprios alternando por capítulo (Lucas nos ímpares, Ana nos pares), 2 ou 3 personagens que se respondem, 1 conflito ou desejo e 1 virada.

### 7.3 Regras do validador (`--scenes`, `--stories`), bloqueiam o merge

1. Cena com 10 a 12 falas; o herói com 5 ou 6; nenhuma fala do herói com mais de 10 palavras, nenhuma outra com mais de 12 (CS-06, CL-22).
2. As 5 expressões do `vocab` aparecem verbatim nas falas (pelo menos 3 em falas do herói); `en` sem parênteses nem barra (CS-07, CS-20).
3. No máximo 10% dos tokens da cena fora de (vocabulário das lições até a unidade na ordem de `course.json` + vocab da cena + `function-words.json` + nomes).
4. Toda fala tem `mood` e `fact`; toda fala do herói e toda fala cobrada em `tap-heard` tem `alt` com exatamente 2 itens.
5. Falas em "você" (regra C8), sem arcaísmos (regra C3), com contrações permitidas; grafia americana; emoji até 12.0 (CL-15).
6. Todo falante de `cast` tem retrato (`CHARACTERS[k].img` ou `SCENE_EXTRAS[k].img`) e `voice` único dentro da cena (CS-17, CS-18).
7. Cada expressão de `vocab` é "nova" em uma única cena ou lição do curso; repetições viram `recycle: true` (CS-08).
8. Cena ancorada na unidade cujo protagonista fala (cenas de Jesus na unidade de Jesus); o aluno nunca fala por Jesus nem pela voz do Senhor (CS-21).
9. História: 12 a 18 beats, 120 a 200 palavras, pelo menos 5 interações de 3 tipos diferentes, resposta presente em beat anterior (CS-11, CS-12); discurso direto com aspas e maiúscula (CL-26).
10. `truth.bible` com referência em cada marcador; `truth.imagined` presente sempre que alguma fala tiver `fact: false`.

### 7.4 Estrutura de uma cena v2 (12 a 14 passos, 2 a 3 minutos)

1. Abertura (card): título com gancho, função, retratos de todos os falantes, 1 frase de contexto, referência. Sem lista de vocabulário.
2. Combine os pares com as 5 expressões (en/pt, áudio na voz do herói). Único exercício receptivo antes da conversa (CS-02).
3. Conversa em 5 blocos de 2 falas, cadência fixa (CS-01):
   - Bloco 1: Leia e ouça (falas 1 e 2 reveladas uma por toque, karaokê de palavras, dica por palavra; tradução atrás de um botão).
   - Bloco 2: "O que vem agora?" (3 continuações para a fala do herói, sem tradução; a intenção vem em português curto: "Diga que precisa de muita madeira").
   - Bloco 3: "Toque no que ouviu" (fala do outro escondida: só áudio + peças embaralhadas; revela ao acertar).
   - Bloco 4: "O que ele quis dizer?" (pergunta de sentido em português sobre a fala recém-ouvida, 3 opções que mudam um detalhe) e, na réplica do herói, "Complete a fala" (lacuna de vocab, 3 opções da mesma classe vindas do vocab da cena ou da unidade).
   - Bloco 5: "Quem disse?" sobre a virada (fala cômica) ou "Fale como o herói" na fala de fechamento.
4. "Na Bíblia" (card): 2 marcadores do que é texto bíblico + 1 do que foi imaginado + botão "ler o trecho" (abre WEB com toggle KJV); chips das 5 expressões com áudio; "ouvir a conversa inteira" como teatro.
5. Reservado para quem não errou: "Escute e digite" 1 fala do herói.

Regra dura: uma fala nunca é cobrada em forma visível a menos de 3 passos da sua revelação; cada fala do herói recebe no máximo 1 cobrança visível + 1 cobrança de escuta às cegas; registro único de falas cobradas por sessão, incluindo a reserva (CS-05). Adaptação: 2 erros rebaixam "O que vem agora?" para "Escolha a tradução"; combo 3 troca "Complete" por digitação; nunca a mesma fala duas vezes.

### 7.5 Tipos de interação (cenas e histórias)

| Código | Nome na tela | Quando | Produção |
|---|---|---|---|
| R | Leia e ouça | revela | receptiva |
| I1 `what-next` | O que vem agora? | antes da fala do herói | reconhecimento sem tradução |
| I2 `tap-heard` | Toque no que ouviu | antes da fala do outro | escuta + ordem das palavras |
| I3 `meaning` | O que ele quis dizer? | depois, sobre sentido | compreensão em português |
| I4 `fill` | Complete a fala | antes da fala do herói com lacuna | vocab-alvo |
| I5 `who-said` | Quem disse? | depois de 4 falas | compreensão global |
| I6 `match` | Combine os pares | antes da conversa | vocab |
| I7 `speak` | Fale como X | depois | fala |
| I8 `listen-type` | Escute e digite | reservado | escrita |

Histórias usam R, I1, I2, I3, I4 e I5; uma interação a cada 2 ou 3 beats; a última é sempre I3 em português sobre a virada. Erro em cena ou história não desconta coração (como no Duolingo) e aparece em "corrija o erro" no fim.

### 7.6 Elenco, heroínas e vozes

- 12 das 48 cenas com heroína (substituem as 12 mais fracas, que migram para a aba Cenas): Rute (pedir trabalho no campo), Ester (convidar para um banquete), Maria (visitar Isabel), Madalena (dar uma notícia urgente), Débora (dar instruções), Rebeca (oferecer água no poço), Marta e Maria (dividir tarefas), Lídia (receber visita), Abigail (acalmar um homem bravo), Ana (pedir algo com fé), a viúva de Sarepta (dividir a última comida), a samaritana (conversar com um estranho) (CS-16).
- Coadjuvantes recorrentes com nome, traço e bordão: Zabad, mercador desconfiado ("Fine, fine, fine."); Faraó impaciente ("I say no."); Golias zombeteiro; Sem, filho prático de Noé ("Can we keep the doves?"); Naamá, esposa de Noé, organizada ("Where are our sons?"); o copeiro ansioso; Aspenaz, professor rígido; Roda, a serva curiosa. Retrato no estilo da galeria para todo extra recorrente, silhueta dourada com raios para a voz do Senhor; 4 expressões por retrato (neutro, feliz, surpreso, preocupado) escolhidas pelo `mood` (CS-17).
- Uma voz por falante (IDs já em `tools/gen-audio.mjs:29-49`): jesus george; pedro bill; moises arnold; noe daniel; davi liam; isaias thomas; jose harry; daniel matthew; voz do Senhor clyde com pós-processo (pitch -2 semitons, reverb curto); goliath adam; pharaoh james; zabad roger; sem callum; naama grace; roda laura; copeiro dave; aspenaz joseph; nabucodonosor drew; dario patrick; ismaelita paul; narrador Lucas brian; narradora Ana alice; miria lily; jonatas sam; ezequias michael; trio (três amigos) josh. `gen-audio.mjs` aborta se dois falantes da mesma cena partilham `voice_id` (CS-18).
- Direção: `mood` mapeado para tags do `eleven_v3` ([excited], [whispers], [shouting], [laughs], [sighs], [sad], [curious]) ou para `stability`/`style` por fala no `eleven_multilingual_v2` (hoje `settings(char)` em `gen-audio.mjs:212-216` usa 0.5/0.2 para todo extra); saída `mp3_44100_128` em vez de `mp3_22050_32` (`gen-audio.mjs:224`); 2 takes para falas de virada com escolha manual. Como `audio/manifest.json` indexa pelo texto exato (1727 entradas hoje), toda mudança em `en` regenera o clipe: planejar a reescrita em lotes por unidade e rodar `gen-audio.mjs` por lote (cerca de 20 mil caracteres para as 404 falas das cenas e os beats das histórias).

### 7.7 Integração na trilha e no Hub

- Unidade = L1, Cena A (obrigatória), L2, Cena B (obrigatória), L3, História (nó 📚), Checkpoint. `unitSteps` (`content.js:26-41`) passa a intercalar só as cenas com `trail: true` (2 por unidade) e a inserir o nó de história antes da revisão; as outras 4 cenas ficam na aba Cenas, em grade por `topic`, com XP de prática e missões ("Jogue 2 cenas de mercado") (CS-10, CS-13, CS-26).
- Cenas novas de u1 (Gênesis 1-3, com Adão e Eva): "Dar nomes" (Adão nomeia os animais, 2:19-20: "What do you call this animal?"), "Apresentar alguém" (2:21-23), "Falar do dia" (a voz do Senhor nos dias da criação, 1:3-5), "Recusar um convite" (Eva e a serpente, 3:1-6), "Responder a uma pergunta difícil" ("Where are you?", 3:8-13), "Despedir-se de um lugar" (3:21-24). As seis cenas de Jesus vão para u8 reescritas com o aluno no papel de Pedro, Zaqueu, Marta, Bartimeu ou André (CB-01, CS-21).
- Recompensa: cena 15 XP (+5 perfeita), história 15 XP (+5 perfeita), releitura 8; sem corações; "corrija o erro" no fim (CS-23). `Story.jsx:71-82` passa a ler `xp`, `xpPerfect` e `xpReplay` do JSON.
- Tela da história: fala revelada só em inglês com karaokê sincronizado ao clipe (`audio/words.json` já tem os cortes por palavra), toque na palavra mostra o significado (dicionário en para pt, seção 8.11), botão "ver tradução"; perguntas em português lidas pela narradora; resposta correta lida na voz de quem a disse; capa ilustrada por história (CS-14, CS-22).

### 7.8 Exemplo reescrito: c-noe-2 "Madeira? Quanta madeira?" (herói Noé)

1. Zabad [animado]: Good morning, Noah! What do you need today?
2. Noé [calmo]: Good morning. I need wood. A lot of wood. (I1, alt: "Good morning. I need water. A lot of water." / "Good morning. I need a boat today.")
3. Zabad [curioso]: A lot? How much is "a lot"?
4. Noé [sério]: Enough for a boat. A very big boat.
5. Zabad [rindo]: A boat? Noah, the sea is very far from here! (I2, fala escondida)
6. Noé [calmo]: I know. It's going to rain. A lot. (I3 em português: "Por que Noé precisa do barco?" Vai chover muito / O mar vai subir / Ele vai pescar)
7. Zabad [desconfiado]: Rain? The sky is blue! Fine. Ten pieces of silver for each tree.
8. Noé: That's expensive. Eight. And I need pitch too. (I4: lacuna expensive, opções cheap / expensive / far)
9. Zabad: Eight, and you buy fifty trees. Deal?
10. Noé [sorrindo]: Deal! Thank you very much. (I7 Fale como Noé)
11. Zabad [para si, rindo]: A boat in the desert! Who is going to sail it?
12. Noé [carinhoso]: Everybody who comes in, my friend. The door is open. (I5: Quem disse "The door is open"?)

Na Bíblia: a arca de madeira de gofer, vedada com betume (Gênesis 6:14); Noé fez tudo como Deus ordenou (6:22); imaginado: o mercador e a compra. Reserva: Escute e digite "I need wood. A lot of wood."

---

## 8. Motor de exercícios v2

Arquivos afetados: `app/src/core/builder.js` (planejador), `session.js` (corações, adaptação, reserva, tipos silenciosos), `checker.js` (fuzzy, altPt, explain), `sr.js` (intro, exposições, registro único), `content.js` (dicionário bidirecional, registro de vocabulário), `sceneBuilder.js` (cadência de blocos), `components/exercises/registry.js` (tipos novos), `screens/Lesson.jsx` (cards, "Por quê?", lâmpada da Dica), `Choice.jsx` (leitura com 2 perguntas, PT só após verificar).

### 8.1 Tipos novos

| Tipo | Silencioso | Componente | Descrição |
|---|---|---|---|
| `lesson-intro` | sim | `LessonIntro.jsx` | referência, retrato do narrador, 4 palavras + chunk, Dica em 1 linha, "Quem é quem" |
| `intro-word` | sim | `IntroWord.jsx` | ilustração ou emoji, en, pt, frase-exemplo (beat `example`) com áudio normal e devagar, botão Falar opcional |
| `tip-card` | sim | `TipCard.jsx` | título, body, 2 exemplos com áudio, contraste |
| `fill-bank` | não | `WordBank.jsx` (modo lacuna) | frase com lacuna + banco de 4 peças; checagem exata |
| `conversation` | parcial | `Conversation.jsx` | turnos revelados um a um; 2 turnos cobrados (escolha entre 3; o último pode ser `speak`); silencioso entre turnos |
| `type-sentence` | não | `TypeInput.jsx` | PT para EN no teclado, fuzzy por palavra, `alt` aceitas |
| `verse-build` | não | `WordBank.jsx` | versículo com banco (2ª visita) |
| `verse-type` | não | `TypeInput.jsx` | ditado do versículo (3ª visita) |
| `read` (v2) | não | `Reading.jsx` | texto + 2 perguntas no mesmo card; PT só após verificar as duas |
| `fact-card` | sim | `FactCard.jsx` | "Você sabia?" com referência, +2 XP |

Registrar os tipos em `registry.js`, em `EX_RANK` (`builder.js:8`), na lista `known` de `resumable()` (`session.js:97`) e em `SCENE_TYPES` quando for cena. Tipos silenciosos usam `ex.silent = true` (já tratado em `session.js:253`) e `continueLabel`.

### 8.2 Planejador por slots (substitui o greedy de `buildExercises`, `builder.js:81-185`)

```
function planLesson(lesson, part, visit, ctx):
  // ctx: state.words (intro, seen, lvl), state.errors, listenMuted, canSpeak, due = palavras vencidas
  words  = lesson.vocab.filter(v => v.part == part && v.pos != "chunk")     // 4
  chunk  = lesson.vocab.find(v => v.part == part && v.pos == "chunk")
  beats  = lesson.beats.filter(b => partOf(b.order) == part)                // 6, em ordem
  tip    = lesson.tips.find(t => t.part == part)

  // 1) beats cobrados nesta visita, mantendo a ordem narrativa
  prodBeats = beats.filter(b => b.prod !== false)
  rot = (visit - 1) * 2
  [A, B, C, D] = rotate(prodBeats, rot).slice(0, 4).sort(byOrder)
  if (!coversAllWords(words, [A, B, C, D])) swapUntilCovered(prodBeats, words)   // cada palavra em >= 1 de A..D

  // 2) esqueleto por slots (tabela da seção 2.4)
  plan = []
  push(lesson-intro)                                      if visit == 1
  for i, w in words:
    if (!hasIntro(w)) push(intro-word w)                  // CP-02: card sempre que a palavra não tem intro, em qualquer visita
    push(recog(w, i, visit))                              // image-choice | choice-en-pt | listen | type (regras 8.4)
    if (i == 0) push(listen w0)                           // 2ª exposição da 1ª palavra
    if (i == 2) { push(tip-card tip) if visit == 1 or tipUnseen(tip); push(missing-word A, gap grammar) }
  push(intro-word chunk)                                  if !hasIntro(chunk)
  push(match words + chunk)                               // só aqui, depois de todos os cards (CP-01)
  push(listen-choice B)
  push(visit == 1 ? build A : type-sentence A)
  push(fill-bank C)
  push(conversation lesson.conversation)
  push(listen-build D)
  push(...review(ctx.due, n = clamp(due.length / 4, 1, 3)))     // 1 a 3 revisões
  push(read lesson.reading)
  push(canSpeak ? speak chunk : listen-build chunkBeat)
  push(verseMode(visit))                                  // verse | verse-build | verse-type, lacuna sorteada
  hard = [listen-type B, type-sentence C]                 // reserva (CP-04)
  tail = [fact-card]

  // 3) garantias
  assert eachNewWordTouches(plan) >= 4                    // card + reconhecimento + pares + beat; senão troca review por listen w
  assert noChargeBeforeIntro(plan)                        // inclui match e beats (8.3)
  assert familyCaps(plan, visit)                          // 8.5
  plan = spreadNeighbors(plan)  respeitando ordem dos silenciosos e dos beats (A < B < C < D)
  plan.hard = hard; plan.tail = tail
  return plan
```

Regras auxiliares: `recog(w, i, visit)`: 1ª visita alterna `image-choice` (se `w.image` ou `w.icon` concreto) e `choice-en-pt`; 2ª visita usa `listen` e `choice-pt-en`; 3ª usa `type` quando `seen(w) >= 3` e `tier != "bible"`. `verseMode`: visita 1 `verse` com `blanks[rand]`, visita 2 `verse-build`, visita 3 `verse-type`. `review`: palavras vencidas de lições e cenas anteriores (`weakestWords` sobre o registro único, 8.10), tipo `listen`/`choice-pt-en`/`type` conforme `seen`.

### 8.3 Garantia de apresentação (CP-01, CP-02)

```
introOf(e) =
  e.word                 ? [e.word.en]
  e.pairs                ? e.pairs.map(p => p.en)                      // match e listen-match
  e.sentence || e.beat   ? newWordsIn(e.sentence.en)                   // palavras novas da lição contidas na frase
  : []
ok(e) = introOf(e).every(en => placed.has(introCard(en)) || hasIntro(en))
```

`state.words[en]` ganha `intro: "AAAA-MM-DD"` (gravado ao concluir o `intro-word`) e `seen: n` (incrementado em todo exercício que mostra a palavra). `newWord` deriva de `!intro`, não de `firstTime` (`builder.js:85, 181`). `wordStat` (`sr.js:7-10`) passa a criar `{ lvl: 0, ok: 0, bad: 0, last: 0, intro: null, seen: 0, hints: 0, source: "lesson" | "scene" }`.

### 8.4 Adaptação (`adaptNext`, `session.js:361-386`)

```
if (nxt.newWord || nxt.isReview || session.reviewing) return
if (combo >= 3 && nxt.word && ["listen", "choice-pt-en"].includes(nxt.type)
    && seen(nxt.word) >= 3 && nxt.word.tier != "bible") swap = type(nxt.word)            // CP-05
else if (combo >= 3 && nxt.type == "build") swap = type-sentence(nxt.sentence)
else if (mistakes >= 2 && nxt.type == "type") swap = choice-pt-en(nxt.word)               // manter
else if (mistakes >= 2 && ["listen-type", "build", "type-sentence"].includes(nxt.type)) swap = listen-choice(nxt.sentence)
aplicar só se !sameNeighbor(swap) && countFamily(swap) < cap
```

### 8.5 Tetos por família e por visita

| Família | Tipos | Visita 1 | Visita 2 | Visita 3 |
|---|---|---|---|---|
| Palavra por escolha | image-choice, choice-en-pt, choice-pt-en, listen | <= 5 | <= 3 | 0 |
| Frase por escolha | listen-choice, missing-word, verse, read, conversation | <= 5 | <= 4 | <= 3 |
| Produção | build, fill-bank, listen-build, type, type-sentence, verse-build, verse-type, speak | >= 4 (+2 reserva) | >= 7 | >= 10 |
| Conversa | conversation | = 1 | = 1 | = 1 |
| Leitura | read | = 1 | = 1 | = 1 |

Vizinhança: nunca o mesmo formato nem o mesmo item em sequência (`spreadNeighbors`, `builder.js:69-79`, mantido, mas sem mover silenciosos para depois da primeira cobrança da palavra).

### 8.6 Corações, reserva e fila de erros (`session.js`)

- Não descontar coração em `newWord`, em `isReview` (fila de erros) nem em cenas e histórias; descontar nos demais exercícios cobrados fora de `practice` (`session.js:301-304`) (CP-33).
- Reserva `hard = [listen-type B, type-sentence C]`, liberada sem erros (regra atual de `session.js:328-337` mantida), com toast "Mandou bem! Um desafio extra".
- `fact-card` entra depois da fila de erros e antes de `finishLesson`, soma +2 XP.
- Erros voltam no fim (manter `reviewQueue`); `cloneExercise` (`session.js:209-216`) preserva `beat` e `gap`.

### 8.7 Distratores (`builder.js:20-44`)

```
exDistract(v, key, n = 3):
  pool = registry().filter(p => p.pos == v.pos && p.en != v.en && !isName(p)
                              && basePt(p) != basePt(v) && p.icon != v.icon && p.image != v.image
                              && !synonyms(v).includes(p.en))
  rank = p => (p.lesson == v.lesson ? 0 : 10) + (p.field == v.field ? 0 : 5) + Math.abs(len(p.en) - len(v.en)) + rand(2)
  return sortBy(pool, rank).slice(0, n)

gapOptions(beat):              // substitui exNearWords + exBlankOf (CP-07, CL-05, CL-06)
  if (beat.gap) return beat.gap.options           // declaradas no JSON e validadas
  w = cleanWord(contentWordIn(beat))              // nunca palavra funcional (will, with, to, for)
  return [w, ...exDistract(vocabItem(w), "en", 2).map(p => p.en)]

exBank(s, lang):
  words = s[lang].split(" ").map(cleanWord)       // peças sem pontuação (CP-18, CL-12)
  extras = samePosSameTense(s, lang, 2 ou 3)      // made/created, the/a/an, was/were, do/did
  return shuffle([...words, ...extras])

exPtDistractors(beat, lesson):
  same = lesson.beats.filter(b => b.part == beat.part && b != beat && sameStructure(b, beat))
  return shuffle(same.length >= 2 ? same : lesson.beats.filter(b => b != beat)).slice(0, 2).map(b => b.pt)
```

`sameStructure`: mesmo `kind`, mesmo número de palavras ±2, mesmo primeiro token funcional. Lacuna por `missing-word` gramatical lê `beat.gap` (kind grammar); `fill-bank` lê `beat.gap` (kind lexical) ou gera por `gapOptions`.

### 8.8 Checker (`checker.js`)

- `type`: `ex.fuzzy = w.en.replace(/^to /, "").length >= 5`; feedback "Atenção à ortografia" quando `typo` (CP-26).
- `translate-en-pt` e `type-sentence`: `accept = [s.pt, ...s.altPt]` / `[s.en, ...s.alt]`; `fuzzyEqual` por palavra (já existe em `checker.js:96-100`).
- `explain` estruturado `{ pt, note }`: `pt` é o par (`"The earth was dark" = "A terra estava escura"`), `note` vem da Dica quando o exercício tem `grammar` ("Lembre: was é o passado de is") ou do `explain` da pergunta de inferência; o rodapé mostra `pt` e um expansor "Por quê?" com `note` (CP-14). Sem travessão em nenhuma string (`checker.js:25, 34, 49`).
- `conversation`: `correct` = `turns[k].answer`; `explain.pt` = `answer` + " = " + `pt`; `audioText` = fala do interlocutor na voz dele; `audioAfter` = resposta na voz do narrador.
- `read` v2: duas respostas no mesmo exercício; `ok` só com as duas certas; feedback indica qual errou; a leitura em português aparece após verificar.

### 8.9 Repetição espaçada, revisão do dia e checkpoint (`sr.js`, `content.js`)

- Registro único de vocabulário: `registry()` = itens das lições (todos os campos) + expressões das cenas (`source: "scene"`, `pos: "chunk"`); `allVocab()` (`content.js:60-62`) passa a ler dele; `weakestWords`, distratores de chunks e `HINTS` também (CP-22).
- `wordUrgency` devolve `-1` para palavra sem `intro` (nunca apresentada não é "vencida"); `hints` (toques na dica) soma 0.3 por toque à urgência (CP-32).
- Home mostra "N para revisar hoje"; sessão "Revisão do dia" com 8 a 10 palavras vencidas e 60% de produção (`startQuickPractice("due")`).
- Lição de revisão da unidade vira checkpoint: 6 palavras mais fracas (dados reais de `state.words` e `state.errors`), 1 beat de cada lição em produção (`type-sentence` ou `build`), leitura nova que resume a unidade (campo `summary` em `course.json.units[u]`), conversa de 3 turnos, 0 cards, aprovação com 80% para desbloquear a próxima unidade (CP-30).
- `startLevelUp` (`session.js:540-559`) usa o mesmo planejador com `visit = crowns + 1`.

### 8.10 Cenas (`sceneBuilder.js`)

- Nova cadência de blocos (7.4) substitui o laço de `sceneBuilder.js:84-105`; `sceneListenOptions` e `sceneReplyOptions` leem `line.alt` em vez de outras cenas; `scene-missing` usa `pos` do vocab; registro único `charged = Set(li)` cobre read, prod e reserva; `newWord` por palavra (via `state.words.intro`), não por cena concluída (`sceneBuilder.js:61, 76`).
- `castChar` (`content.js:12-17`) devolve `img` e `voice` próprios para extras; fallback `pitch`/`rate` por extra em `SCENE_EXTRAS` (CS-25).

### 8.11 Dicas por toque (`Sayable.jsx`)

- Dicionário bidirecional: `HINTS_EN` (en normalizado para pt) construído do registro único + `function-words.json` com glosas + `names` + `hints` da lição; `HINTS` (pt para en) mantido para o banco em português.
- Sublinhado pontilhado em todo texto em inglês (`Sayable` passa a aceitar `hint`), inclusive peças do banco, falas de conversa, leitura e cenas; o toque mostra a glosa e toca a palavra; registra `state.words[en].hints++`.

### 8.12 Ordem de implementação do motor

1. `sr.js` e `store.js`: `intro`, `seen`, `hints`, `source`; migração de `state.words` existente (palavras de lições concluídas recebem `intro = today()`).
2. `content.js`: registro único, `HINTS_EN`, leitura de `course.json`, `unitSteps` com `trail` e nó de história.
3. `builder.js`: `planLesson`, `introOf` ampliado, distratores por `pos`, `exBank` limpo, `gapOptions`.
4. `session.js`: tipos silenciosos novos, corações, adaptação, reserva, `fact-card`, checkpoint.
5. `checker.js` e `Lesson.jsx`: `explain {pt, note}`, "Por quê?", lâmpada da Dica, remoção do travessão.
6. Componentes: `LessonIntro`, `IntroWord`, `TipCard`, `Conversation`, `Reading`, `FactCard`, modos novos de `WordBank` e `TypeInput`.
7. `sceneBuilder.js` e componentes de cena: blocos, I1 a I8, `mood` e `fact` na UI.
8. Scripts Playwright (`app/scripts/e2e-course.mjs`) com as asserções da seção 9.3.

---
## 9. Critérios de aceitação e checklist de revisão

### 9.1 Métricas de aceite por lição (medidas pelo validador e pelo planejador)

- 10 itens de vocabulário (4 + 1 chunk por parte), >= 6 dos 8 de conteúdo no top 2000, <= 2 `tier: "bible"`, 0 nomes próprios como vocabulário, 0 parênteses em `en` e `pt`.
- 12 beats em ordem, 4 a 10 palavras em produção, 0 arcaísmos, 0 tu/vós, 0 travessão, >= 2 perguntas, >= 1 negativa, >= 1 fala em 1ª pessoa, 2 pares de contraste, 1 lacuna gramatical por parte ligada à Dica, cada palavra nova em >= 2 beats da sua parte, cada chunk em >= 1 beat.
- 2 Dicas, 1 versículo WEB (<= 18 palavras) com 2 ou 3 lacunas e `classic`/`classicPt`, 1 leitura de 3 a 5 frases com 2 perguntas (literal e inferência, opções parafraseadas), 1 conversa de 3 a 4 turnos com 2 respostas cobradas e distratores da mesma cena, 1 fato com referência.
- Plano da primeira visita: 16 cobrados + 2 reserva + 8 cards; >= 4 produção; palavra por escolha <= 5; 1 conversa; 1 leitura; 1 fala; cada palavra nova com card e >= 4 toques; 0 cobrança antes da apresentação (inclusive pares e beats).
- Replays: palavras sem `intro` recebem card; o versículo muda de lacuna e de modo; produção cresce (>= 7 na 2ª, >= 10 na 3ª).
- Duração 3 a 4 minutos; precisão média alvo entre 75% e 90%; taxa de conclusão > 85% (medir com `session.log` e `accuracy` em `finishLesson`).

### 9.2 Métricas de aceite por curso

- 24 lições na ordem u1, u2, u6, u3, u4, u5, u7, u8; 240 itens de lição + ~50 funcionais via Dica + 240 expressões de cena; lista mínima de alta frequência (4.1) coberta.
- Toda palavra nova volta em >= 3 lições posteriores (ou cenas); 0 repetição de `en` entre unidades sem `recycle`.
- 24 versículos conferidos contra a WEB (`web.mjs`) e 24 `classicPt` conferidos contra a ARC; 0 opções de versículo presentes no texto.
- 48 cenas (12 com heroínas, 2 por unidade na trilha), 16 histórias (2 por unidade) nos formatos v2; 100% das falas com clipe no manifesto; 0 pares de falantes com a mesma voz na mesma cena.
- Áudio regenerado para todo `en` alterado (o manifesto indexa pelo texto exato) a 44,1 kHz/128 kbps, com `mood` aplicado.

### 9.3 Asserções automáticas (Playwright, a partir de `app/scripts/e2e-course.mjs`)

1. Em toda jogada, nenhum exercício cobrado contém palavra nova (`word`, `pairs`, `newWordsIn(sentence)`) sem `intro-word` anterior na mesma sessão ou `state.words[en].intro` já gravado.
2. Nenhum `match` antes do último `intro-word` da parte.
3. Beats cobrados em ordem crescente de `order` dentro da visita.
4. Contagem por família dentro dos tetos da seção 8.5; exatamente 1 `conversation`, 1 `read`, 1 `verse*`.
5. `type` e `type-sentence` só em palavras/frases com `seen >= 3`; nunca em `tier: "bible"`.
6. Nenhum coração descontado em `newWord`, `isReview`, cena ou história (comparar `state.hearts` antes e depois de forçar erro).
7. Em replays, `verse.blank` difere entre visitas consecutivas e o modo progride (`verse`, `verse-build`, `verse-type`).
8. Cena: nenhuma cobrança visível a menos de 3 passos da revelação da fala; nenhuma fala cobrada duas vezes; `tap-heard` só com `alt` presente.
9. História: toda resposta de interação aparece verbatim em beat anterior.
10. Capturas em 390 x 844 nos temas claro e escuro de: `lesson-intro`, `intro-word`, `tip-card`, `fill-bank`, `conversation`, `read` (2 perguntas), `fact-card`, `verse` com toggle clássico; nenhuma string com travessão (`grep -rP "\x{2014}" app/src content scenes.js scenes2.js stories.js` vazio).

### 9.4 Checklist de revisão humana (antes de gerar áudio)

Fidelidade bíblica (revisor com Bíblia aberta na WEB e na ARC):
- [ ] Cada fato cobrado em leitura ou conversa aparece em beat; nenhuma pergunta sobre fato não lido (CB-04).
- [ ] Quem fala cada fala está certo (Moisés fala ao povo em Êxodo 14:13-14; o Senhor fala a Moisés em 14:16); o aluno nunca fala por Jesus nem pela voz do Senhor.
- [ ] Nomes, lugares e números conferem (ismaelitas, vinte moedas, quarenta dias, doze cestos, cinco mil homens, oito pessoas na arca, três vezes ao dia).
- [ ] Frases `fact: false` são plausíveis e inofensivas; `truth.imagined` declara o que foi imaginado.
- [ ] Versículo: `text` literal da WEB (adaptações "the Lord" e "ark" declaradas), `classic` literal da KJV, `classicPt` literal da ARC, `pt` fiel ao sentido.
- [ ] Nada doutrinário ou sectário; a doxologia de Mateus 6:13b fora de lacuna.
- [ ] Referências no formato "Livro c:v-v" em português (Gênesis, Êxodo, 1 Samuel, Salmo, Isaías, Daniel, Mateus, Lucas, João).

Naturalidade do inglês (falante nativo ou revisor C2):
- [ ] Toda frase soa como inglês falado hoje; 0 tokens da lista proibida; grafia americana.
- [ ] Contrações nas conversas, cenas e histórias; formas plenas nos beats narrados.
- [ ] Distratores gramaticais e plausíveis; nenhuma resposta correta de nativo seria recusada (`alt` completo).
- [ ] Chunks são expressões que um brasileiro usaria em viagem ou trabalho ("Bring them to me", "Get out!", "Lord, save me!", "I need", "How much is it?").
- [ ] Nível: até u4 sem will, modais ou passiva; de u5 em diante, uma estrutura nova por Dica.

Português do Brasil (revisor com o guia da seção 5.3):
- [ ] Acentos e cedilha em 100% das strings (`grep -P "[a-z]ao\b|cao\b|nao\b" content/*.json` vazio como primeiro filtro).
- [ ] Registro "você" em beats, leituras, conversas, dicas, cenas e histórias; tu/vós só em `altPt` e `classicPt`.
- [ ] Imperativos em -e/-a; sem ênclise artificial; sem "concerto", "pelejar", "manjar", "molho" fora de `classicPt`.
- [ ] Sem travessão em nenhum campo; discurso direto com dois-pontos e aspas e maiúscula.
- [ ] Glosas curtas (1 a 2 palavras) sem parênteses; o complemento vai para `note`.

Pedagogia (revisor com o plano impresso pelo planejador em modo `--dry`):
- [ ] Nenhuma cobrança antes da apresentação; cada palavra nova com >= 4 toques e em >= 2 beats.
- [ ] A Dica aparece antes do primeiro beat que usa a estrutura; o `explain` do erro cita a Dica.
- [ ] Leitura com inferência real; conversa decidida por pragmática, não por eliminação.
- [ ] Ícone único por conceito; ilustrações presentes para substantivos e verbos concretos.

### 9.5 Processo

1. Autor escreve `content/uX.json` v2 seguindo o Anexo A; roda `node tools/content/validate.js content/uX.json` até "OK".
2. Revisão bíblica, de inglês e de português com a checklist 9.4; correções no JSON.
3. `node tools/content/validate.js --all --scenes --stories && node tools/content/merge.js`.
4. `ELEVENLABS_API_KEY=... node tools/gen-audio.mjs --dry` para contar créditos do lote; depois a geração real pelo workflow `.github/workflows/gen-audio.yml`; `tools/align-words.py` e `tools/build-sprites.mjs` como hoje (`docs/AUDIO.md`).
5. `node app/scripts/e2e-course.mjs` com as asserções 9.3; capturas revisadas; publicação.

---

## 10. Anexo A: três lições-modelo em JSON v2 (modelo de ouro)

As três lições abaixo são o padrão a copiar. Os textos dos versículos foram extraídos com `tools/content/web.mjs`; os `classicPt` são a ARC já presente nos JSON atuais. Cada JSON abaixo é um elemento de `lessons` dentro de `{ "v": 2, "id": "uX", "lessons": [ ... ] }`.

### 10.1 u1l1 "No princípio" (Gênesis 1:1-19)

```json
{
  "id": "u1l1",
  "title": "No princípio",
  "ref": "Gênesis 1:1-19",
  "level": "A1.1",
  "narrator": "adao",
  "guests": ["eva", "voice"],
  "names": [
    { "en": "God", "pt": "Deus", "note": "sempre com maiúscula; os pronomes (he, his) ficam em minúscula" }
  ],
  "hints": {
    "beginning": "princípio", "created": "criou", "heavens": "céus", "empty": "vazia", "still": "ainda",
    "called": "chamou", "darkness": "escuridão", "evening": "tarde", "morning": "manhã", "moon": "lua", "stars": "estrelas", "saw": "viu, vimos"
  },
  "tips": [
    {
      "part": 1, "id": "past-be", "grammar": "past-be",
      "title": "was = passado de is",
      "body": "Para falar do que já aconteceu, is vira was e are vira were. O resto da frase não muda.",
      "examples": [
        { "en": "The earth is dark", "pt": "A terra está escura" },
        { "en": "The earth was dark", "pt": "A terra estava escura" }
      ],
      "contrast": { "a": "The light is good", "b": "The light was good", "note": "is = agora; was = naquele momento" }
    },
    {
      "part": 2, "id": "there-was", "grammar": "there-was",
      "title": "there was = havia",
      "body": "Para dizer que algo existia, use there was (uma coisa) ou there were (várias). No presente: there is e there are.",
      "examples": [
        { "en": "There was light", "pt": "Havia luz" },
        { "en": "There were two great lights", "pt": "Havia dois grandes luminares" }
      ],
      "contrast": { "a": "There is light", "b": "There was light", "note": "there is = há; there was = havia" }
    }
  ],
  "vocab": [
    { "en": "earth", "pt": "terra", "pos": "noun", "field": "creation", "tier": "core", "part": 1, "icon": "🌍", "image": "earth.png", "example": 2 },
    { "en": "light", "pt": "luz", "pos": "noun", "field": "creation", "tier": "core", "part": 1, "icon": "💡", "image": "light.png", "example": 4 },
    { "en": "dark", "pt": "escuro", "ptAlt": ["escura"], "pos": "adj", "field": "quality", "tier": "core", "part": 1, "icon": "🌑", "example": 2 },
    { "en": "good", "pt": "bom", "ptAlt": ["boa"], "pos": "adj", "field": "quality", "tier": "core", "part": 1, "icon": "👍", "example": 5 },
    { "en": "Let there be light", "pt": "Haja luz", "pos": "chunk", "field": "speech", "tier": "core", "part": 1, "icon": "✨", "iconic": true, "example": 3 },
    { "en": "day", "pt": "dia", "pos": "noun", "field": "time", "tier": "core", "part": 2, "icon": "📅", "image": "day.png", "example": 9 },
    { "en": "night", "pt": "noite", "pos": "noun", "field": "time", "tier": "core", "part": 2, "icon": "🌃", "image": "night.png", "example": 10 },
    { "en": "sun", "pt": "sol", "pos": "noun", "field": "nature", "tier": "core", "part": 2, "icon": "☀️", "image": "sun.png", "example": 9 },
    { "en": "to make", "pt": "fazer", "pos": "verb", "field": "actions", "tier": "core", "part": 2, "icon": "🔨", "image": "make.png", "example": 9 },
    { "en": "It was good", "pt": "Era bom", "ptAlt": ["Foi bom"], "pos": "chunk", "field": "speech", "tier": "core", "part": 2, "icon": "🙌", "iconic": true, "example": 11 }
  ],
  "beats": [
    { "order": 1, "en": "In the beginning, God created the heavens and the earth", "pt": "No princípio, Deus criou os céus e a terra",
      "alt": ["In the beginning God created the heaven and the earth"], "altPt": ["No princípio, criou Deus os céus e a terra", "No princípio, Deus criou o céu e a terra"],
      "kind": "quote", "fact": true, "iconic": true, "prod": false },
    { "order": 2, "en": "The earth was empty and dark", "pt": "A terra estava vazia e escura",
      "alt": ["The earth was formless and empty"], "altPt": ["A terra era sem forma e vazia"],
      "kind": "statement", "fact": true, "gap": { "word": "was", "kind": "grammar", "options": ["was", "is", "were"] }, "grammar": "past-be" },
    { "order": 3, "en": "God said, \"Let there be light\"", "pt": "Deus disse: \"Haja luz\"",
      "kind": "quote", "fact": true, "iconic": true, "speaker": "voice" },
    { "order": 4, "en": "And there was light", "pt": "E houve luz", "alt": ["There was light"],
      "kind": "statement", "fact": true, "gap": { "word": "light", "kind": "lexical", "options": ["light", "earth", "sun"] } },
    { "order": 5, "en": "God saw that the light was good", "pt": "Deus viu que a luz era boa",
      "alt": ["God saw the light, and it was good"], "kind": "statement", "fact": true },
    { "order": 6, "en": "Was the earth still dark? No, the light was good", "pt": "A terra ainda estava escura? Não, a luz era boa",
      "kind": "question", "fact": false, "grammar": "past-be" },
    { "order": 7, "en": "He called the light Day and the darkness Night", "pt": "Ele chamou a luz de Dia e a escuridão de Noite",
      "kind": "statement", "fact": true },
    { "order": 8, "en": "There was evening and morning: the first day", "pt": "Houve tarde e manhã: o primeiro dia",
      "alt": ["There was evening, and there was morning, the first day"], "kind": "quote", "fact": true, "iconic": true, "prod": false,
      "gap": { "word": "was", "kind": "grammar", "options": ["was", "were", "is"] }, "grammar": "there-was" },
    { "order": 9, "en": "God made the sun for the day", "pt": "Deus fez o sol para o dia", "kind": "statement", "fact": false },
    { "order": 10, "en": "God made the moon for the night", "pt": "Deus fez a lua para a noite", "kind": "statement", "fact": false },
    { "order": 11, "en": "At night we saw the moon, and it was good", "pt": "À noite vimos a lua, e era bom", "kind": "first-person", "fact": false, "speaker": "adao" },
    { "order": 12, "en": "Was the sun there at night? No, only the moon", "pt": "O sol estava lá à noite? Não, só a lua",
      "kind": "question", "fact": false, "speaker": "adao" }
  ],
  "contrast": [
    { "a": "God made the sun for the day", "b": "God made the moon for the night", "note": "só mudam sun/day por moon/night" },
    { "a": "The earth was empty and dark", "b": "The earth is empty and dark", "note": "was = passado; is = presente" }
  ],
  "verse": {
    "text": "In the beginning, God created the heavens and the earth.",
    "classic": "In the beginning God created the heaven and the earth.",
    "pt": "No princípio, Deus criou os céus e a terra.",
    "classicPt": "No princípio, criou Deus os céus e a terra.",
    "ref": "Gênesis 1:1",
    "blanks": [
      { "word": "created", "options": ["created", "saw", "said", "called"] },
      { "word": "beginning", "options": ["beginning", "garden", "evening", "night"] },
      { "word": "earth", "options": ["earth", "water", "sky", "light"] }
    ]
  },
  "reading": {
    "text": "In the beginning, the earth was empty and dark. Then God said, \"Let there be light.\" And there was light. God called the light Day and the darkness Night. Then he made the sun, the moon and the stars.",
    "pt": "No princípio, a terra estava vazia e escura. Então Deus disse: \"Haja luz.\" E houve luz. Deus chamou a luz de Dia e a escuridão de Noite. Depois ele fez o sol, a lua e as estrelas.",
    "questions": [
      { "kind": "literal", "q": "What was the earth like at first?", "qPt": "Como era a terra no começo?",
        "options": ["Dark, with nothing in it", "Full of light", "Full of trees"], "answer": "Dark, with nothing in it" },
      { "kind": "inference", "q": "Which came first, the light or the sun?", "qPt": "O que veio primeiro, a luz ou o sol?",
        "options": ["The light", "The sun", "They came together"], "answer": "The light",
        "explain": "A luz é do primeiro dia (Gênesis 1:3); o sol e a lua são do quarto dia (Gênesis 1:16)." }
    ]
  },
  "conversation": {
    "with": "eva",
    "turns": [
      { "who": "eva", "en": "Adam, look! What is that?", "pt": "Adão, olhe! O que é aquilo?", "mood": "surpreso" },
      { "who": "you", "options": ["It is the light. God made it.", "It is the night. It is dark.", "It is the earth. It is empty."],
        "answer": "It is the light. God made it.", "pt": "É a luz. Deus a fez.", "intent": "Diga o que é e quem fez" },
      { "who": "eva", "en": "Is the light good?", "pt": "A luz é boa?", "mood": "animado" },
      { "who": "you", "options": ["Yes, it is very good.", "No, it is very dark.", "Yes, it is the moon."],
        "answer": "Yes, it is very good.", "pt": "Sim, é muito boa.", "intent": "Responda se a luz é boa", "speak": true }
    ]
  },
  "fact": { "pt": "A palavra hebraica para \"princípio\" (bereshit) é o nome do livro de Gênesis na Bíblia hebraica.", "ref": "Gênesis 1:1" }
}
```

### 10.2 u3l2 "Deixe o meu povo ir" (Êxodo 5-12)

```json
{
  "id": "u3l2",
  "title": "Deixe o meu povo ir",
  "ref": "Êxodo 5:1-2; 7:14-21; 8:1-6; 12:1-33",
  "level": "A1.2",
  "narrator": "moises",
  "guests": ["arao", "pharaoh", "voice"],
  "names": [
    { "en": "Moses", "pt": "Moisés" }, { "en": "Aaron", "pt": "Arão" }, { "en": "Pharaoh", "pt": "Faraó", "note": "o rei do Egito" },
    { "en": "Egypt", "pt": "Egito" }, { "en": "Israel", "pt": "Israel" }, { "en": "the Lord", "pt": "o Senhor" }
  ],
  "hints": {
    "asked": "perguntou", "everywhere": "por toda parte", "houses": "casas", "beds": "camas", "lamb": "cordeiro",
    "pass": "passarei", "midnight": "meia-noite", "plagues": "pragas", "sent": "mandou", "at last": "por fim", "called": "chamou"
  },
  "tips": [
    {
      "part": 1, "id": "negation-do", "grammar": "negation-do",
      "title": "do not / did not: dizer não",
      "body": "Para negar, use do not (don't) antes do verbo: I do not know. No passado, use did not: The king did not let them go. O verbo fica na forma básica, sem -ed. Para perguntar no passado: Did the king know? No, he did not.",
      "examples": [
        { "en": "I know the Lord", "pt": "Eu conheço o Senhor" },
        { "en": "I do not know the Lord", "pt": "Eu não conheço o Senhor" }
      ],
      "contrast": { "a": "The king let the people go", "b": "The king did not let the people go", "note": "did not + verbo básico (let), nunca did not + passado" }
    },
    {
      "part": 2, "id": "imperative", "grammar": "imperative",
      "title": "Put, Go, Get out: ordens e instruções",
      "body": "O imperativo é o verbo na forma básica, sem sujeito: Put the blood on the door. Get out! Para negar: Do not go. Para pedir com educação, acrescente please.",
      "examples": [
        { "en": "Put the blood on the door", "pt": "Ponham o sangue na porta" },
        { "en": "Get out of Egypt!", "pt": "Saiam do Egito!" }
      ],
      "contrast": { "a": "Go!", "b": "Do not go!", "note": "negativa do imperativo = Do not + verbo" }
    }
  ],
  "vocab": [
    { "en": "people", "pt": "povo", "ptAlt": ["pessoas"], "pos": "noun", "field": "people", "tier": "core", "part": 1, "icon": "👥", "image": "people.png", "example": 2 },
    { "en": "king", "pt": "rei", "pos": "noun", "field": "people", "tier": "core", "part": 1, "icon": "👑", "image": "king.png", "example": 1 },
    { "en": "to go", "pt": "ir", "pos": "verb", "field": "actions", "tier": "core", "part": 1, "icon": "🚶", "image": "go.png", "example": 2 },
    { "en": "to know", "pt": "conhecer", "ptAlt": ["saber"], "pos": "verb", "field": "mind", "tier": "core", "part": 1, "icon": "💭", "example": 4 },
    { "en": "Let my people go", "pt": "Deixe o meu povo ir", "ptAlt": ["Deixa ir o meu povo"], "pos": "chunk", "field": "speech", "tier": "core", "part": 1, "icon": "✊", "iconic": true, "example": 2 },
    { "en": "blood", "pt": "sangue", "pos": "noun", "field": "body", "tier": "core", "part": 2, "icon": "🔴", "image": "blood.png", "example": 7 },
    { "en": "door", "pt": "porta", "pos": "noun", "field": "objects", "tier": "core", "part": 2, "icon": "🚪", "image": "door.png", "example": 9 },
    { "en": "to put", "pt": "pôr", "ptAlt": ["colocar"], "pos": "verb", "field": "actions", "tier": "core", "part": 2, "icon": "🤲", "image": "put.png", "example": 9 },
    { "en": "frog", "pt": "rã", "ptAlt": ["sapo"], "pos": "noun", "field": "animals", "tier": "bible", "part": 2, "icon": "🐸", "image": "frog.png", "example": 8 },
    { "en": "Get out!", "pt": "Saiam!", "ptAlt": ["Saia!", "Fora!"], "pos": "chunk", "field": "speech", "tier": "core", "part": 2, "icon": "🏃", "example": 12 }
  ],
  "beats": [
    { "order": 1, "en": "Moses and Aaron went to the king of Egypt", "pt": "Moisés e Arão foram ao rei do Egito", "kind": "statement", "fact": true },
    { "order": 2, "en": "Moses said, \"Let my people go\"", "pt": "Moisés disse: \"Deixe o meu povo ir\"", "altPt": ["Moisés disse: Deixa ir o meu povo"],
      "kind": "quote", "fact": true, "iconic": true, "speaker": "moises" },
    { "order": 3, "en": "The king asked, \"Who is the Lord?\"", "pt": "O rei perguntou: \"Quem é o Senhor?\"", "kind": "question", "fact": true, "speaker": "pharaoh" },
    { "order": 4, "en": "\"I do not know the Lord,\" said the king", "pt": "\"Eu não conheço o Senhor\", disse o rei",
      "kind": "negative", "fact": true, "speaker": "pharaoh", "gap": { "word": "do", "kind": "grammar", "options": ["do", "does", "did"] }, "grammar": "negation-do" },
    { "order": 5, "en": "The king did not let the people go", "pt": "O rei não deixou o povo ir", "kind": "negative", "fact": true, "grammar": "negation-do" },
    { "order": 6, "en": "Did the king know the Lord? No, he did not", "pt": "O rei conhecia o Senhor? Não, não conhecia", "kind": "question", "fact": false, "grammar": "negation-do" },
    { "order": 7, "en": "The water was blood, and frogs were everywhere", "pt": "A água era sangue, e havia rãs por toda parte", "kind": "statement", "fact": true },
    { "order": 8, "en": "There were frogs in the houses and on the beds", "pt": "Havia rãs nas casas e nas camas", "kind": "statement", "fact": true },
    { "order": 9, "en": "Put the blood of the lamb on the door", "pt": "Ponham o sangue do cordeiro na porta", "altPt": ["Ponde o sangue do cordeiro nas ombreiras das portas"],
      "kind": "quote", "fact": true, "speaker": "voice", "gap": { "word": "Put", "kind": "grammar", "options": ["Put", "Puts", "Putting"] }, "grammar": "imperative" },
    { "order": 10, "en": "When I see the blood, I will pass over you", "pt": "Quando eu vir o sangue, passarei por vocês", "altPt": ["Quando eu vir o sangue, passarei por cima de vós"],
      "kind": "quote", "fact": true, "iconic": true, "speaker": "voice", "prod": false },
    { "order": 11, "en": "The people put the blood on their doors", "pt": "O povo pôs o sangue nas suas portas",
      "kind": "statement", "fact": true, "gap": { "word": "doors", "kind": "lexical", "options": ["doors", "frogs", "kings"] } },
    { "order": 12, "en": "At midnight, the king said, \"Get out of Egypt!\"", "pt": "À meia-noite, o rei disse: \"Saiam do Egito!\"",
      "kind": "quote", "fact": true, "speaker": "pharaoh" }
  ],
  "contrast": [
    { "a": "The king did not let the people go", "b": "The king let the people go", "note": "did not + verbo básico = negativa no passado" },
    { "a": "Put the blood of the lamb on the door", "b": "Do not put the blood on the door", "note": "Do not + verbo = ordem negativa" }
  ],
  "verse": {
    "text": "When I see the blood, I will pass over you.",
    "classic": "And when I see the blood, I will pass over you.",
    "pt": "Quando eu vir o sangue, passarei por vocês.",
    "classicPt": "Quando eu vir o sangue, passarei por cima de vós.",
    "ref": "Êxodo 12:13",
    "blanks": [
      { "word": "blood", "options": ["blood", "water", "door", "lamb"] },
      { "word": "see", "options": ["see", "hear", "eat", "make"] },
      { "word": "pass", "options": ["pass", "go", "run", "walk"] }
    ]
  },
  "reading": {
    "text": "Moses went to the king of Egypt and said, \"Let my people go.\" But the king said no. So the Lord sent blood and frogs on Egypt. At last, the people of Israel put the blood of a lamb on their doors. That night, the king called Moses and said, \"Get out!\"",
    "pt": "Moisés foi ao rei do Egito e disse: \"Deixe o meu povo ir.\" Mas o rei disse não. Então o Senhor mandou sangue e rãs sobre o Egito. Por fim, o povo de Israel pôs o sangue de um cordeiro nas suas portas. Naquela noite, o rei chamou Moisés e disse: \"Saiam!\"",
    "questions": [
      { "kind": "literal", "q": "What did the people put on their doors?", "qPt": "O que o povo pôs nas portas?",
        "options": ["Lamb's blood", "River water", "A green frog"], "answer": "Lamb's blood" },
      { "kind": "inference", "q": "Why did the king let the people go in the end?", "qPt": "Por que o rei deixou o povo ir no final?",
        "options": ["Because of the plagues on Egypt", "Because he loved Moses", "Because the people paid him"], "answer": "Because of the plagues on Egypt",
        "explain": "Só depois da última praga Faraó chamou Moisés de noite e mandou o povo sair (Êxodo 12:29-31)." }
    ]
  },
  "conversation": {
    "with": "pharaoh",
    "turns": [
      { "who": "pharaoh", "en": "Moses, why are you here?", "pt": "Moisés, por que você está aqui?", "mood": "bravo" },
      { "who": "you", "options": ["Let my people go.", "Give my people more work.", "Let my people stay here."],
        "answer": "Let my people go.", "pt": "Deixe o meu povo ir.", "intent": "Faça o pedido do Senhor" },
      { "who": "pharaoh", "en": "Who is the Lord? I don't know him.", "pt": "Quem é o Senhor? Eu não o conheço.", "mood": "irônico" },
      { "who": "you", "options": ["He is the God of Israel.", "He is the king of Egypt.", "He is my brother Aaron."],
        "answer": "He is the God of Israel.", "pt": "Ele é o Deus de Israel.", "intent": "Diga quem é o Senhor", "speak": true }
    ]
  },
  "fact": { "pt": "A Páscoa judaica (Pessach) lembra até hoje a noite em que o Senhor passou por cima das casas marcadas com sangue (Êxodo 12:14).", "ref": "Êxodo 12:14" }
}
```

### 10.3 u8l3 "Pães, peixes e o mar" (Mateus 14:13-33)

```json
{
  "id": "u8l3",
  "title": "Pães, peixes e o mar",
  "ref": "Mateus 14:13-33",
  "level": "A2.1",
  "narrator": "pedro",
  "guests": ["jesus", "andre"],
  "names": [
    { "en": "Jesus", "pt": "Jesus" }, { "en": "Peter", "pt": "Pedro" }, { "en": "disciples", "pt": "discípulos" }
  ],
  "hints": {
    "late": "tarde", "loaves": "pães", "blessed": "abençoou", "left": "sobrou, sobraram", "began": "comecei, começou",
    "cried": "gritei", "fed": "alimentou", "thousand": "mil", "doubt": "duvidar", "took": "segurou", "hand": "mão", "big": "grande", "still": "ainda"
  },
  "tips": [
    {
      "part": 1, "id": "only-howmany", "grammar": "only-howmany",
      "title": "only e how many: quantidades",
      "body": "only = só, apenas; vem antes do verbo principal ou do número: We only have five loaves. Para perguntar a quantidade de coisas que se contam, use how many + plural: How many loaves? Para coisas que não se contam, how much: How much bread?",
      "examples": [
        { "en": "We have five loaves", "pt": "Temos cinco pães" },
        { "en": "We only have five loaves", "pt": "Temos só cinco pães" }
      ],
      "contrast": { "a": "How many fish?", "b": "How much bread?", "note": "how many para contáveis (fish, loaves, baskets); how much para incontáveis (bread, water)" }
    },
    {
      "part": 2, "id": "past-did", "grammar": "past-did",
      "title": "Did...? perguntas no passado",
      "body": "Para perguntar sobre o passado, use Did + sujeito + verbo básico: Did Jesus walk on the waves? A resposta curta é Yes, he did ou No, he did not. O verbo principal fica sem -ed.",
      "examples": [
        { "en": "Jesus walked on the waves", "pt": "Jesus andou sobre as ondas" },
        { "en": "Did Jesus walk on the waves?", "pt": "Jesus andou sobre as ondas?" }
      ],
      "contrast": { "a": "Why did you doubt?", "b": "Why do you doubt?", "note": "did = passado; do = presente" }
    }
  ],
  "vocab": [
    { "en": "fish", "pt": "peixe", "ptAlt": ["peixes"], "pos": "noun", "field": "food", "tier": "core", "part": 1, "icon": "🐟", "image": "fish.png", "example": 3 },
    { "en": "bread", "pt": "pão", "pos": "noun", "field": "food", "tier": "core", "part": 1, "icon": "🍞", "image": "bread.png", "example": 5 },
    { "en": "crowd", "pt": "multidão", "pos": "noun", "field": "people", "tier": "core", "part": 1, "icon": "🧑‍🤝‍🧑", "image": "crowd.png", "example": 1 },
    { "en": "hungry", "pt": "com fome", "ptAlt": ["faminto"], "pos": "adj", "field": "feelings", "tier": "core", "part": 1, "icon": "🍴", "example": 2 },
    { "en": "Bring them to me", "pt": "Tragam para mim", "ptAlt": ["Tragam-nos a mim", "Traga para mim"], "pos": "chunk", "field": "speech", "tier": "core", "part": 1, "icon": "🙌", "iconic": true, "example": 4 },
    { "en": "boat", "pt": "barco", "pos": "noun", "field": "objects", "tier": "core", "part": 2, "icon": "⛵", "image": "boat.png", "example": 7 },
    { "en": "wind", "pt": "vento", "pos": "noun", "field": "nature", "tier": "core", "part": 2, "icon": "💨", "image": "wind.png", "example": 8 },
    { "en": "wave", "pt": "onda", "pos": "noun", "field": "nature", "tier": "core", "part": 2, "icon": "🌊", "image": "wave.png", "example": 8 },
    { "en": "to sink", "pt": "afundar", "pos": "verb", "field": "actions", "tier": "core", "part": 2, "icon": "⬇️", "image": "sink.png", "example": 11 },
    { "en": "Lord, save me!", "pt": "Senhor, salve-me!", "ptAlt": ["Senhor, salva-me!", "Senhor, me salve!"], "pos": "chunk", "field": "speech", "tier": "core", "part": 2, "icon": "🆘", "iconic": true, "example": 12 }
  ],
  "beats": [
    { "order": 1, "en": "A big crowd followed Jesus", "pt": "Uma grande multidão seguiu Jesus", "kind": "statement", "fact": true },
    { "order": 2, "en": "It was late, and the crowd was hungry", "pt": "Era tarde, e a multidão estava com fome", "kind": "statement", "fact": true },
    { "order": 3, "en": "We only have five loaves and two fish", "pt": "Nós só temos cinco pães e dois peixes", "altPt": ["Temos só cinco pães e dois peixes"],
      "kind": "first-person", "fact": true, "iconic": true, "speaker": "pedro", "gap": { "word": "only", "kind": "grammar", "options": ["only", "also", "all"] }, "grammar": "only-howmany" },
    { "order": 4, "en": "Jesus said, \"Bring them to me\"", "pt": "Jesus disse: \"Tragam para mim\"", "altPt": ["Jesus disse: Tragam-nos a mim"],
      "kind": "quote", "fact": true, "iconic": true, "speaker": "jesus" },
    { "order": 5, "en": "He blessed the bread and the fish, and everyone ate", "pt": "Ele abençoou o pão e o peixe, e todos comeram",
      "kind": "statement", "fact": true, "gap": { "word": "bread", "kind": "lexical", "options": ["bread", "crowd", "boat"] } },
    { "order": 6, "en": "Was the crowd still hungry? No, there was bread left", "pt": "A multidão ainda estava com fome? Não, sobrou pão",
      "kind": "question", "fact": true },
    { "order": 7, "en": "That night, the disciples were in a boat", "pt": "Naquela noite, os discípulos estavam num barco", "kind": "statement", "fact": true },
    { "order": 8, "en": "The wind was strong, and the waves were big", "pt": "O vento estava forte, e as ondas estavam grandes",
      "kind": "statement", "fact": true, "gap": { "word": "wind", "kind": "lexical", "options": ["wind", "wave", "boat"] } },
    { "order": 9, "en": "Did Jesus walk on the waves? Yes, he did", "pt": "Jesus andou sobre as ondas? Sim, andou",
      "kind": "question", "fact": true, "gap": { "word": "Did", "kind": "grammar", "options": ["Did", "Does", "Do"] }, "grammar": "past-did" },
    { "order": 10, "en": "Jesus came to the boat and said, \"Don't be afraid\"", "pt": "Jesus veio até o barco e disse: \"Não tenham medo\"", "altPt": ["Jesus veio até o barco e disse: Não temais"],
      "kind": "negative", "fact": true, "iconic": true, "speaker": "jesus" },
    { "order": 11, "en": "I saw the wind and began to sink", "pt": "Eu vi o vento e comecei a afundar", "kind": "first-person", "fact": true, "speaker": "pedro" },
    { "order": 12, "en": "I cried, \"Lord, save me!\" and I did not sink", "pt": "Eu gritei: \"Senhor, salve-me!\" e não afundei", "altPt": ["Eu clamei: Senhor, salva-me! e não afundei"],
      "kind": "first-person", "fact": true, "iconic": true, "speaker": "pedro", "grammar": "past-did" }
  ],
  "contrast": [
    { "a": "The wind was strong, and the waves were big", "b": "The wind was not strong, and the waves were small", "note": "negativa de to be e antônimos" },
    { "a": "Did Jesus walk on the waves? Yes, he did", "b": "Did Peter walk on the waves? Yes, but he began to sink", "note": "mesma pergunta com did, sujeito diferente" }
  ],
  "verse": {
    "text": "Cheer up! It is I! Don't be afraid.",
    "classic": "Be of good cheer; it is I; be not afraid.",
    "pt": "Coragem! Sou eu! Não tenham medo.",
    "classicPt": "Tende bom ânimo; sou eu, não temais.",
    "ref": "Mateus 14:27",
    "blanks": [
      { "word": "afraid", "options": ["afraid", "hungry", "alone", "late"] },
      { "word": "Cheer", "options": ["Cheer", "Hurry", "Wake", "Come"] }
    ]
  },
  "reading": {
    "text": "Jesus fed five thousand people with five loaves and two fish. That night, the disciples were in a boat, and the wind was strong. Jesus came to them, walking on the sea. Peter walked on the water too, but he saw the wind and began to sink. Jesus took his hand and said, \"Why did you doubt?\"",
    "pt": "Jesus alimentou cinco mil pessoas com cinco pães e dois peixes. Naquela noite, os discípulos estavam num barco, e o vento estava forte. Jesus foi até eles, andando sobre o mar. Pedro também andou sobre a água, mas viu o vento e começou a afundar. Jesus segurou a mão dele e disse: \"Por que você duvidou?\"",
    "questions": [
      { "kind": "literal", "q": "What did Peter do when he saw the wind?", "qPt": "O que Pedro fez quando viu o vento?",
        "options": ["He started to go down into the water", "He got back into the boat", "He swam to Jesus"], "answer": "He started to go down into the water" },
      { "kind": "inference", "q": "Why did Peter begin to sink?", "qPt": "Por que Pedro começou a afundar?",
        "options": ["Because he was afraid and stopped trusting", "Because the boat was too far", "Because he could not swim"], "answer": "Because he was afraid and stopped trusting",
        "explain": "Pedro olhou para o vento, teve medo e duvidou; Jesus o segurou e perguntou por que duvidou (Mateus 14:30-31)." }
    ]
  },
  "conversation": {
    "with": "jesus",
    "turns": [
      { "who": "jesus", "en": "Peter, how many loaves do you have?", "pt": "Pedro, quantos pães vocês têm?", "mood": "calmo", "fact": true, "ref": "Marcos 6:38" },
      { "who": "you", "options": ["Only five, Lord. And two fish.", "Twelve baskets, Lord.", "Five thousand, Lord."],
        "answer": "Only five, Lord. And two fish.", "pt": "Só cinco, Senhor. E dois peixes.", "intent": "Diga quantos pães e peixes vocês têm" },
      { "who": "jesus", "en": "Come, Peter. Walk on the water.", "pt": "Venha, Pedro. Ande sobre a água.", "mood": "solene", "fact": true, "ref": "Mateus 14:29" },
      { "who": "you", "options": ["Lord, save me! I am sinking!", "Lord, the wind is too strong. I cannot come.", "Lord, the boat is far. Wait for me."],
        "answer": "Lord, save me! I am sinking!", "pt": "Senhor, salve-me! Estou afundando!", "intent": "Peça socorro", "speak": true }
    ]
  },
  "fact": { "pt": "Mateus conta que comeram cerca de cinco mil homens, \"além das mulheres e crianças\" (Mateus 14:21): a multidão era bem maior.", "ref": "Mateus 14:21" }
}
```

Observações sobre os modelos: as palavras `people`, `strong`, `big`, `to follow`, `to give`, `to take`, `water` e `afraid` aparecem em beats sem estar no vocabulário destas lições porque já foram ensinadas em lições anteriores da ordem de `course.json` (regra C5-b); `Don't be afraid` em u8l3 é chunk reciclado de u3l3. Ícones de chunk (✨, 🙌, ✊, 🏃, 🆘) entram em `icons.json` como conceitos próprios.

---

## 11. Anexo B: ordem de execução

1. **Esquema e ferramentas (S):** `course.json`, `validate.js` v2 (blocos A a E, `--scenes`, `--stories`), `merge.js` v2 com campos legados derivados, `icons.json`, `function-words.json`, `grammar-sets.json`, `ngsl.json`, `variants.mjs`. Validar os 3 modelos do Anexo A até "OK".
2. **Conteúdo das lições (L):** reescrever u1 e u2 primeiro (nível A1.1, modelos u1l1), depois u6, u3 (modelo u3l2), u4, u5, u7, u8 (modelo u8l3), sempre com `web.mjs` aberto para os versículos e a checklist 9.4 por lição. Lotes por unidade para o áudio.
3. **Motor (M):** ordem da seção 8.12; manter o motor atual funcionando com os campos legados até o planejador v2 passar nas asserções 9.3.
4. **Cenas e histórias (L):** esquema v2 e validador; mover c-jesus-1..6 para u8 e escrever as 6 cenas de Gênesis 1-3 e c-moises-0; 12 cenas com heroínas; 16 histórias; `mood`, `fact`, `alt` e distratores manuais em todas.
5. **Elenco e áudio (M):** retratos dos 12 coadjuvantes e das narradoras, tabela de vozes única, `gen-audio.mjs` com `mood`, 44,1 kHz/128 kbps, abortar em voz duplicada; regenerar por lote; `align-words.py` e `build-sprites.mjs`.
6. **Trilha (M):** `course.json.order`, 2 cenas + 1 história por unidade, aba Cenas por tema, carrossel de histórias, checkpoint com 80%.
7. **Verificação (M):** Playwright com as asserções 9.3 em claro e escuro, capturas revisadas, `grep` de travessão e de tokens proibidos vazio, publicação.
