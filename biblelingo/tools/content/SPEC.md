# Conteúdo das lições v2: guia operacional para quem escreve uma unidade

Resumo de `docs/CONTENT_SPEC_V2.md` (a fonte da verdade; leia as seções 2, 3.3, 4, 5 e 6 antes de escrever).
Este arquivo diz o que entregar, em que formato, quais regras o validador aplica e como rodar as ferramentas.

Padrão de qualidade: inglês moderno natural (sem thee/thou/unto/hath/shall arcaico nas frases do aluno), português do
Brasil em "você" com acentos, NUNCA o travessão (U+2014), fidelidade bíblica absoluta (nada que a passagem não diga;
referências corretas). O modelo de ouro é `content/examples/u1l1.v2.json` (lição u1l1 da spec, Anexo A).

## Arquivos

- `content/course.json`: ordem da trilha (`order`: u1, u2, u6, u3, u4, u5, u7, u8), cabeçalhos das unidades (`title`,
  `subtitle`, `icon`, `face`, `color`, `level`), `cast` (personagens de `CHARACTERS` em `characters.js` que falam na
  unidade), `extras` (vozes de `SCENE_EXTRAS` em `scenes.js`/`scenes2.js`) e `gallery` (opcional: personagens da
  galeria ligados à unidade sem voz nas lições). O merge gera `UNIT_CAST` e `CHARACTER_UNIT` a partir dele.
- `content/uX.json`: uma unidade com `"v": 2`, `"id": "uX"` e exatamente 3 lições `uXl1`, `uXl2`, `uXl3`. Arquivos sem
  `"v": 2` seguem validados pelas regras antigas (v1) durante a migração; as unidades são convertidas uma a uma.
- `content/examples/`: lições-modelo (não entram no merge).
- `tools/content/`: `validate.js`, `merge.js`, `web.mjs` (consulta à World English Bible) e as listas auxiliares
  `function-words.json`, `grammar-sets.json`, `synonyms.json`, `icons.json`, `ngsl.json`.

## Esquema de uma lição v2

```
{
  "id": "u1l1", "title": "No princípio", "ref": "Gênesis 1:1-19", "level": "A1.1",
  "narrator": "adao",                    // lê beats e versículo; precisa estar no cast da unidade; nunca jesus nem voice
  "guests": ["eva", "voice"],            // vozes da conversa e de beats com speaker (CHARACTERS ou SCENE_EXTRAS)
  "names": [ { "en": "God", "pt": "Deus", "note": "..." } ],   // "Quem é quem": nomes próprios nunca são vocabulário
  "hints": { "created": "criou", "heavens": "céus" },           // glosas de palavras fora do vocabulário (forma exata)
  "tips": [ tip P1, tip P2 ],            // uma Dica de gramática por parte
  "vocab": [ 10 itens ],                 // por parte: 4 de conteúdo (noun/verb/adj/adv/num) + 1 chunk
  "beats": [ 12 beats ],                 // order 1..12; parte 1 = 1..6, parte 2 = 7..12
  "contrast": [ { "a": beat, "b": variante, "note": "..." } x 2 ],
  "verse": { "text": WEB, "classic": KJV, "pt": versão livre em você, "classicPt": Almeida 1898, "ref", "blanks": [2 a 3] },
  "reading": { "text", "pt", "questions": [ literal, inference ] },
  "conversation": { "with": "eva", "turns": [ 3 a 4 turnos, 2 do aluno ] },
  "fact": { "pt": "Você sabia?", "ref": "Gênesis 1:1" }
}
tip   = { "part": 1, "id": "past-be", "grammar": "past-be", "title", "body", "examples": [ {en, pt}, {en, pt} ], "contrast": { a, b, note } }
item  = { "en": "earth", "pt": "terra", "pos": "noun", "field": "creation", "tier": "core", "part": 1, "icon": "🌍",
          "image": "earth.png", "example": 2, "ptAlt": [...], "alt": [...], "plural", "iconic", "recycle", "note", "forms": ["went"] }
beat  = { "order": 2, "en": "The earth was empty and dark", "pt": "A terra estava vazia e escura", "kind": "statement",
          "fact": true, "speaker": "voice", "iconic": false, "prod": true, "alt": [...], "altPt": [...],
          "gap": { "word": "was", "kind": "grammar", "options": ["was", "is", "were"] }, "grammar": "past-be" }
turn  = { "who": "eva", "en", "pt", "mood": "surpreso" }  |  { "who": "you", "options": [3], "answer", "pt", "intent", "speak": true }
```

Valores fechados: `pos` noun | verb | adj | adv | num | chunk; `field` creation | nature | animals | people | family |
food | body | feelings | mind | quality | actions | places | time | objects | work | faith | speech | quantity;
`tier` core | bible; `kind` statement | question | negative | first-person | quote; `gap.kind` grammar | lexical;
`mood` calmo | animado | surpreso | assustado | triste | irônico | bravo | carinhoso | urgente | solene | rindo | sussurrando.

## Regras que o validador aplica (bloqueia = impede o merge; avisa = só imprime)

Estrutura (A): `v: 2`; id em `course.json.order`; 3 lições; campos obrigatórios; `narrator` em `CHARACTERS` e no `cast`
da unidade; `guests`, `speaker` e `conversation.with` em `CHARACTERS` ou `SCENE_EXTRAS` (avisa se não estiverem em
cast/extras); o aluno nunca fala por Jesus nem pela voz do Senhor.

Vocabulário (B): 10 itens (4 + 1 chunk por parte); campos obrigatórios; `image` é OPCIONAL nesta fase (avisa quando
falta em substantivo/verbo concreto); `en` e `pt` sem parênteses nem barra; substantivo no singular; verbo com "to ";
chunk com 2+ palavras; >= 6 dos 8 itens de conteúdo `tier: core` e no máximo 2 `bible` (bloqueia); core fora de
`ngsl.json` (avisa); nada de nome próprio nem de item de `names`; sem repetir `en` na unidade; entre unidades v2 só com
`recycle: true` (bloqueia); coincidência com o conteúdo v1 (avisa); cada item em >= 2 beats da sua parte (chunk >= 1;
flexões irregulares via `forms`); glosa igual à de outra palavra do curso (avisa); ícone: emoji até 12.0, um ícone por
conceito (`icons.json`: `icons` bloqueia, `legacy` avisa), sem repetir na lição; `example` aponta para um beat da mesma
parte que contém a palavra.

Beats (C): 12 beats, `order` 1..12; 4 a 10 palavras quando `prod !== false` (até 12 com `prod: false`); maiúscula
inicial; sem ponto final (avisa); pontuação interna fora de citações (avisa); arcaísmos proibidos (thee, thou, thy, ye,
unto, hath, saith, shalt, art, hast, whereon, lest, verily, midst, upon, void...); behold/whom/shall/for ever só com
`prod: false`; grafia americana (color, counselor, forever, neighbor, savior, honor); toda palavra de um beat de
produção precisa estar no vocabulário da lição, no de lições anteriores (ordem de `course.json`), em
`function-words.json`, em `names` ou em `hints` (bloqueia; mais de 1 glosa por beat avisa); >= 2 perguntas, >= 1
negativa, >= 1 fala em 1ª pessoa; 2 pares de `contrast` com `a` igual a um beat; `gap.word` exatamente uma vez no
beat, nas `options`; `grammar` = variantes morfológicas ou um conjunto de `grammar-sets.json`; `lexical` = opções do
vocabulário da lição com a mesma `pos` e sem vizinhos ortográficos (light/night); `pt` em "você" (tu/te/ti/teu/vós/vos...
bloqueia; verbos em -ais/-eis avisa); travessão em qualquer campo bloqueia; mesmas 2 palavras iniciais em > 2 beats
avisa; cada parte com 1 beat `gap.kind: grammar` cujo `grammar` bate com a Dica da parte.

Versículo, leitura, conversa, fato (D): `text` WEB com <= 18 palavras, `classic` KJV, `pt` livre, `classicPt` Almeida,
`ref`; 2 ou 3 `blanks`, cada `word` uma vez no texto, 4 opções únicas, nenhuma opção presente no texto nem sinônimo da
resposta (`synonyms.json`). Leitura com 3 a 5 frases, discurso direto com vírgula e aspas, sem arcaísmo, palavras
cobertas (vocabulário + funcionais + names + hints), 2 perguntas (`literal` e `inference`) com `qPt`, 3 opções,
nenhuma opção copiando 4+ palavras do texto, `explain` na inferência (avisa se faltar). Conversa com 3 a 4 turnos,
exatamente 2 do aluno (`who: "you"`), 3 opções únicas de tamanho parecido (± 4 palavras, mesmo número de frases ± 1),
sem vocabulário de unidade posterior nem nome de outra unidade, `intent` (avisa), `mood` nas falas do interlocutor.
`fact.pt` com `fact.ref`. Campos legados (`quiz`, `dialogue`, `sentences`, `verse.blank`, `reading.q`) só avisam: o
merge os deriva.

Curso (E, só com `--all`): palavra nova que volta em menos de 3 lições posteriores (avisa); lista mínima de alta
frequência da seção 4.1 ainda sem lição (avisa); frase repetida entre lições (avisa).

Cenas e histórias (`--scenes`, `--stories`, seção 7.3): cenas/histórias no formato antigo recebem só avisos (a
reescrita fica para a fase do motor); no formato v2 (`hero`, `mood`, `fact`, `alt`) as regras bloqueiam.

## Comandos (na pasta biblelingo)

```
node tools/content/web.mjs "Gênesis 1:1-3" "Isaías 9:6"      # texto da WEB (domínio público) para verse.text
node tools/content/validate.js content/u1.json                 # valida uma unidade ("OK" = nada a corrigir)
node tools/content/validate.js content/examples/u1l1.v2.json --one   # lição isolada (arquivo com 1 a 3 lições)
node tools/content/validate.js --all [--scenes] [--stories]    # 8 unidades + course.json + cruzamentos
node tools/content/validate.js --all --write-icons             # registra ícones novos em icons.json
node tools/content/merge.js                                    # valida tudo, gera data.js e regrava UNIT_CAST/CHARACTER_UNIT em characters.js
cd app && npm run build                                        # o app continua funcionando com os campos legados derivados
```

Saída do validador: "OK arquivo", ou uma linha por problema (`u1l1: C5: ...`) e linhas `aviso ...`; código de saída 1
com problemas. O merge aborta se o validador acusar problemas (`--force` grava mesmo assim; `--no-validate` pula).

## O que o merge grava em data.js

Unidades na ordem de `course.json` com os cabeçalhos de lá (mais `level`). Lições v1 passam como hoje. Lições v2 vão
com os campos v2 integrais e com os legados derivados para o motor atual: `sentences` = beats (en, pt, alt, altPt);
`verse.blank`/`options` = `blanks[0]`; `reading.q`/`options`/`answer` = `questions[0]`; `dialogue` = turnos 1 e 2 da
conversa; `quiz` = `questions[1]` com `explain` (ou `fact.pt`). A lição de revisão vira `{ id: "uXr", title: "Revisão",
review: true, checkpoint: true }`.

## Processo por unidade

1. Leia a entrada da unidade na seção 6 da spec (fatos-chave, versículo, Dicas, chunks, vocabulário sugerido) e a
   seção 2.2 (nível). Consulte o texto com `web.mjs`; `classic` é a KJV literal; `classicPt` é a Almeida 1898 (está nos
   `verse.pt` atuais, com as duas correções de CB-22).
2. Escreva os 12 beats em ordem narrativa antes do vocabulário; depois escolha as 4 palavras + 1 chunk de cada parte
   entre as que aparecem em 2+ beats da parte. O que sobrar de palavra nova vai para `hints` (glosa) ou `names`.
3. Dica por parte ligada a pelo menos um beat com `gap.kind: "grammar"` e `grammar` igual.
4. Leitura (3 a 5 frases que recontam os beats, 2 perguntas parafraseadas), conversa (3 a 4 turnos, respostas
   plausíveis da mesma cena, chunk em uma resposta correta), fato com referência.
5. `node tools/content/validate.js content/uX.json` até "OK"; revise avisos (ícones em `legacy`, glosas repetidas,
   palavras fora da NGSL). Não edite `data.js` nem `characters.js` à mão: rode `merge.js`.

## Decisões desta fase (valem sobre a spec onde divergirem)

- Ordem da trilha e ids conforme `course.json`; `testamentOf` continua `idx < 7`.
- `vocab.image` opcional (ainda não há ilustrações): o card usa o emoji e o validador avisa.
- Nenhum personagem novo na galeria: `narrator` precisa estar em `CHARACTERS` e no `cast` da unidade (Adão em u1, Noé
  em u2, José em u6, Moisés em u3, Davi em u4, Isaías em u5, Daniel em u7, Pedro em u8); `guests`, `speaker` e `with`
  só entre `CHARACTERS` e `SCENE_EXTRAS` existentes (voice, pharaoh, sem, esposa, goliath, saul, jonatas, jesse, acaz,
  ezequias, potifar, copeiro, juda, ismaelita, aspenaz, nabucodonosor, belsazar, dario, andre, serva, coxo, povo, anjo,
  mefibosete, atalaia, sedento, mordomo, oficial, merchant).
- Cenas e histórias não são reescritas agora; `--scenes`/`--stories` só avisam sobre o formato antigo.
- `UNIT_CAST` e `CHARACTER_UNIT` são regravados DENTRO de `characters.js` pelo merge (sem `content/cast.js`).
- `ngsl.json` é uma aproximação gerada sem rede (ver cabeçalho do arquivo); troque pela NGSL oficial quando possível.
