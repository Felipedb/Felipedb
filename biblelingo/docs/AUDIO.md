# Áudios com ElevenLabs (pipeline v2, fase 1)

Especificação completa: `docs/AUDIO_SPEC_V2.md` (a seção final "Decisões de implementação (fase 1)" registra o que
desta spec já está no código e o que ficou para depois).

## Como rodar

1. Crie uma chave em elevenlabs.io → Profile → API Keys (permissões Text to Speech e Pronunciation
   Dictionaries; sem a segunda o gerador segue sem dicionário).
2. No GitHub: Settings → Secrets and variables → Actions → New repository secret `ELEVENLABS_API_KEY`.
3. Rode o workflow **Gerar áudios (ElevenLabs)** (Actions → escolher a branch → Run workflow).
   Entradas: `limit` (0 = todos), `only` (vazio = tudo; `names` = só o nome de cada personagem, amostra barata;
   `audition` = audição do elenco em `audio/audition/`, fora do manifesto e dos sprites) e `model`
   (padrão `eleven_multilingual_v2`).
4. O workflow faz, em sequência: lint do elenco (sem créditos; colisão de voz termina o job) →
   `node tools/gen-audio.mjs` (clipes + alinhamentos + QA) → `node tools/cut-words.mjs` (palavras recortadas das
   frases) → `node tools/build-sprites.mjs` (sprites) → artefato de segurança → commit de `biblelingo/audio`
   (inclui `audio/audition` e `audio/qa-report.json`) e dos caches de `tools/`. Com `only = audition`, recorte e
   sprites são pulados (o manifesto não muda).
5. O app toca os clipes automaticamente (síntese do navegador como reserva).

Ordem recomendada antes de gastar os ~85 mil créditos da regeneração completa: `only = audition` (~7 mil créditos),
ouvir `audio/audition/index.html`, ajustar `tools/voices.json`, repetir a audição só das vozes trocadas (os clipes
já aprovados não são refeitos) e só então rodar sem filtros.

Localmente, sem chave:

- `node tools/gen-audio.mjs --dry` roda o lint do elenco, lista as vozes resolvidas e estima os créditos (a gerar,
  regeneração completa do zero e audição). Sai com 1 se o lint achar colisão.
- `node tools/gen-audio.mjs --lint` só o lint (0 = limpo, 1 = colisão).
- Fluxo inteiro sem API: `AUDIO_DIR=/tmp/x node tools/gen-audio.mjs --mock --limit=30`,
  `AUDIO_DIR=/tmp/x node tools/gen-audio.mjs --mock --only=audition`, depois
  `AUDIO_DIR=/tmp/x node tools/cut-words.mjs --mock` e `AUDIO_DIR=/tmp/x node tools/build-sprites.mjs`
  (o mock gera tons de 440 Hz e alinhamentos uniformes; exige `AUDIO_DIR` fora do repositório, porque a
  limpeza de órfãos apagaria os clipes reais; `MOCK_QA_FAIL=1` faz 1 em 10 clipes reprovar na primeira tentativa,
  para exercitar o QA). Requer ffmpeg e ffprobe no PATH. Sem Python.

## O que é gerado

| Arquivo | Conteúdo |
| --- | --- |
| `audio/<hash>.mp3` | clipe em `mp3_44100_128` (44,1 kHz, 128 kbps); hash = sha1(texto normalizado, voice_id, modelo, formato, voice_settings, seed do personagem e, quando o texto tem um nome do dicionário, a versão do dicionário) |
| `audio/align/<hash>.json` | `{ text, source, characters, start, end, seed, requestId, qa }`: timestamps por caractere (3 casas) do endpoint `/with-timestamps`, seed usada, `request-id` da resposta e o resultado do QA (`{ dur, attempts, ok, reason? }`) |
| `audio/manifest.json` | `{ "<texto normalizado>": { "<personagem>": arquivo, "default": arquivo, "~slow": { "<personagem>": arquivo, "default": arquivo } } }` |
| `audio/qa-report.json` | resumo da última execução: gerados, falhas, clipes repetidos pelo QA e lista dos reprovados (`qaFailed`) |
| `audio/audition/<voz>-<n>.mp3`, `<voz>-<n>.json`, `index.json`, `index.html` | audição do elenco (4 clipes por voz com alinhamento e QA); nunca entra no manifesto, nos sprites nem na limpeza de órfãos |
| `audio/words/<hash>.mp3` | palavra recortada da frase (44,1 kHz mono, 96 kbps, loudnorm); hash = sha1(arquivo da frase, palavra) |
| `audio/words.json` | `{ "<palavra>": { "<personagem>": { f, p: 1, d }, "default": "words/x.mp3" } }` (p = 1: alinhamento nativo; d = duração) |
| `audio/words-index.json` | por arquivo de frase: palavras recortadas, qual alinhamento foi usado (`source`) e `ver` (ALIGN_VER 6) |
| `audio/sprites/s<N>-<hash>.mp3` + `audio/sprites.json` | clipes, variantes lentas e recortes empacotados (96 kbps mono), `{ arquivo: [sprite, início, duração] }` |
| `tools/voices.json` | catálogo de vozes, casting, pools, papéis exclusivos e substituições documentadas (fonte única do elenco) |
| `tools/.voices-ok.json`, `tools/.voices-assigned.json` | vozes validadas na conta (por apelido) e vozes de reserva já escolhidas |
| `tools/.pron-dict.json` | `{ id, version_id, hash }` do dicionário de pronúncia criado na conta |

Tudo é idempotente: clipe com o nome esperado já no disco (com o seu alinhamento) não é pedido de novo;
frase já indexada na versão atual não é recortada de novo; clipe de audição com o mesmo hash não é refeito.
Numa execução completa (sem `limit`/`only`), clipes, alinhamentos e recortes que nenhum texto cita mais são
apagados (só arquivos soltos em `audio/` e `audio/align/`; `audio/audition/` fica intacta).

## Casting (`tools/voices.json`)

`voices` (apelido → `{ id, gender, accent, age, notes }`), `cast` (personagem → apelido), `pools` (grupos usados na
troca de voz indisponível), `exclusive` (papéis cuja voz ninguém mais usa), `divine` (papéis com o perfil "divine")
e `substitutions` (por que cada slot da Voice Library da spec virou uma voz do catálogo). Extras de
`scenes.js`/`scenes2.js` sem entrada em `cast` usam `SCENE_EXTRAS[*].voice` (hoje todos têm entrada). Sotaque único
General American; as vozes britânicas, australianas, irlandesas e suecas ficam listadas como reserva e só entram com
aviso do lint (`allowAccent` por papel). Jesus é Eric; George (britânico) fica em `alt` como alternativa consciente,
só por decisão do dono.

| Voz | Personagens (o primeiro é o principal, ouvido na audição) |
| --- | --- |
| brian | narrator (exclusiva) |
| adam | voice, a voz do Senhor (exclusiva) |
| thomas | anjo (exclusiva) |
| eric | jesus (exclusiva) |
| bill | moises (exclusiva) |
| liam | davi (exclusiva) |
| chris | pedro (exclusiva) |
| arnold | isaias (exclusiva) |
| harry | jose (exclusiva) |
| josh | daniel (exclusiva) |
| jessica | maria (exclusiva) |
| sarah | ester (exclusiva) |
| domi | madalena (exclusiva) |
| michael | noe, samuel, jaco, ezequiel, abraao, isaac (único ancião GA livre do catálogo; nunca dois no mesmo conjunto) |
| clyde | pharaoh, elias, joaobatista |
| drew | saul, nabucodonosor, arao, juda, calebe, jonas, zebedeu (v2) |
| patrick | goliath, belsazar, ismaelita, bartimeu, sansao |
| paul | jesse, dario, povo, sedento, coxo, eliseu, barnabe |
| roger | acaz, salomao, merchant (Zabad no v2), potifar, aspenaz, paulo |
| antoni | ezequias, sem, jonatas, oficial, neemias, natanael |
| sam | adao, josue, andre, atalaia, mordomo, gideao, filipe |
| ethan | mefibosete, copeiro, zaqueu, josepai, timoteo, tome, trio (v2) |
| matilda | sara, esposa (Naamá no v2), isabel (v2), viuva (v2) |
| elli | eva |
| emily | marta |
| serena | lidia, ana (v2) |
| freya | serva (Roda no v2) |
| laura | rute |
| aria | debora, abigail (v2) |
| rachel | rebeca, miria (v2), samaritana (v2), lia (v2, narradora das histórias pares) |

Elli, Emily, Serena e Freya ainda não foram validadas nesta conta: o probe da primeira execução real cuida disso e,
se alguma estiver indisponível (400/404), troca por outra voz livre do mesmo gênero que não colida com quem contracena
com o papel nem com as exclusivas (a escolha fica em `tools/.voices-assigned.json`).

## Lint do elenco

Roda em toda execução (inclusive `--dry` e `--mock`) e no primeiro passo do workflow. Monta os conjuntos de falantes
que se ouvem juntos, lendo o estado atual dos arquivos: cada cena de `scenes.js`/`scenes2.js` (`char`, `with`, `who`
das falas, `extras`), cada história de `stories.js` (`who` dos beats, `null` = narrador), cada unidade (`UNIT_CAST`
de `characters.js` mais `cast` e `extras` de `content/course.json`) e cada lição v2 que exista em `data.js` ou
`content/u*.json` (`narrator`, `guests`, `conversation.with`, `speaker` dos beats, `who` dos turnos). Erros: papel
sem voz, voz exclusiva usada por dois papéis, dois papéis do mesmo conjunto com o mesmo `voice_id`. Avisos: voz com
sotaque diferente de `american` sem `allowAccent`. Com erro, a geração aborta antes de gastar créditos; o `--dry`
imprime tudo e sai com 1. Depois de uma troca de voz pelo probe, o lint roda de novo.

## Vozes, settings e prosódia

- `voice_settings` por tipo de texto (`settingsFor(personagem, tipo, lento)`, tabela 3.2 da spec), todos com
  `similarity_boost` 0,85 e `use_speaker_boost`:

| Tipo | O que é | stability | style | speed | lenta |
| --- | --- | --- | --- | --- | --- |
| `word` | vocabulário, peça do banco de palavras, opção de 1 palavra | 0,75 | 0,00 | 1,00 | não |
| `name` | nome do personagem | 0,75 | 0,00 | 1,00 | não |
| `sentence` | frase de lição | 0,60 | 0,10 | 1,00 | sim |
| `line` | fala de cena, fala e respostas de diálogo | 0,50 | 0,20 | 1,00 | sim |
| `story` | beat de história, texto de leitura | 0,55 | 0,15 | 0,95 | sim |
| `verse` | versículo (completo e com "blank") | 0,70 | 0,05 | 0,92 | sim |
| `question` | pergunta de quiz, leitura e história, opções com 2+ palavras | 0,60 | 0,05 | 1,00 | não |
| `divine` | qualquer texto (exceto palavra e nome) de `voice` e `anjo` | 0,65 | 0,10 | 0,90 | sim |

- A assinatura dos settings entra no hash: trocar um valor da tabela regenera só o tipo afetado.
- `seed` fixa por personagem (crc32 do nome do papel, ou `seeds[papel]` em `voices.json`), para estabilizar o timbre
  entre clipes do mesmo personagem; o QA repete com `seed + 1`.
- Falas de cena e beats de história vão com `previous_text`/`next_text` (a fala anterior e a seguinte do
  mesmo roteiro); respostas de diálogo e opções de quiz/leitura recebem a pergunta como `previous_text`.
  Só contexto em inglês; sem contexto, o campo é omitido.
- 429/5xx: espera o `retry-after` quando vem; senão espera crescente com um pouco de aleatoriedade.

## Variante lenta

Todo texto com 2+ palavras de um tipo com variante lenta (frases, falas, histórias, leituras, versículos, falas
divinas) ganha um segundo clipe com `speed: 0.8`, mesma voz, mesma seed e mesmos settings, guardado em
`manifest[texto]["~slow"]`. O botão "devagar" do app toca essa variante a velocidade normal (o tom não muda); sem ela
(palavras soltas, perguntas e opções, que não têm botão de tartaruga), cai no `playbackRate` 0,75.

## QA por clipe

Logo depois de cada resposta, o clipe é reprovado quando o áudio dura menos de 0,25 s, mais de
2,5 x (0,075 s x caracteres + 0,4 s) (alucinação, texto repetido) ou quando o alinhamento vem vazio. Reprovado, é
pedido de novo uma vez com `seed + 1`; se reprovar de novo, fica no disco (já foi pago), o alinhamento guarda
`qa.ok = false` com o motivo, e o clipe entra em `audio/qa-report.json` (`qaFailed`) e no resumo final, para o ouvido
decidir (apague o `.mp3` para forçar nova geração). A mesma regra vale para os clipes da audição.

## Audição do elenco

`node tools/gen-audio.mjs --only=audition` (ou `--audition`; no workflow, `only = audition`) gera, por voz usada no
casting, 4 clipes: o nome do personagem principal que usa a voz, 2 frases do repertório dele (falas de cena, frases
de lição, beats, versículos; quando o personagem só tem o nome, pega frases de outro personagem da mesma voz ou
frases genéricas) e 1 frase com nomes bíblicos difíceis (passa pelo dicionário). Sai em
`audio/audition/<voz>-<n>.mp3` com `index.json` (voz, voice_id, personagem, texto, hash, QA) e `index.html`
(um player por clipe, nome da voz e rótulos, personagens que a usam, campo de notas guardado no navegador e botão
para exportar as notas em JSON). Custo com o conteúdo atual: 30 vozes, 120 clipes, ~7 mil créditos; clipe cujo hash
não mudou não é refeito, então trocar uma voz em `voices.json` regera só os clipes dela.

## Dicionário de pronúncia

Regras `alias` (respelling em inglês, sem espaços, maiúsculas na tônica) para ~90 nomes bíblicos da seção 7 da spec
(lista `PRONUNCIATIONS` no gerador, mesclada com a anterior): de Joseph, Noah, Moses e Jesus a Nebuchadnezzar,
Mephibosheth, Zarephath e Yahweh ("the-LORD"). Regras `phoneme` não valem no `eleven_multilingual_v2`. O dicionário
é criado uma vez (`/v1/pronunciation-dictionaries/add-from-rules`), cacheado em `tools/.pron-dict.json` e recriado
quando as regras mudam; só os textos que contêm um desses nomes pedem o dicionário, e só esses levam `PRON_VER` no
hash (subir a versão regera só eles). Se a API recusar, segue sem.

## Recorte por timestamps

`tools/cut-words.mjs` lê `audio/align/<hash>.json` de cada frase (variante normal) e mapeia os
caracteres nas palavras do texto original (split por espaço, sem a pontuação das pontas, apóstrofo
interno mantido; composta por hífen é uma palavra só). Quando os `characters` reconstroem o texto enviado,
usa `alignment` direto; se o ElevenLabs devolveu o texto normalizado (alias do dicionário, número por extenso),
usa `normalized_alignment`: com o mesmo número de palavras nos dois textos, a n-ésima palavra mapeia na n-ésima
(é o caso dos aliases, que não têm espaço); senão, mapeamento aproximado por maior subsequência comum.
`source` no índice diz qual foi.

Janela de cada palavra: 0,03 s antes e 0,08 s depois, sem invadir mais que 0,04 s da palavra vizinha;
mínimo 0,12 s (expande simetricamente). Corte com ffmpeg a partir do MP3: `loudnorm I=-16:TP=-1.5:LRA=11`,
fade in 0,01 s, fade out 0,035 s, `libmp3lame` 44,1 kHz mono 96 kbps. `default` de cada palavra = recorte
do narrador quando houver, senão o primeiro.

## Custos

`eleven_multilingual_v2`: 1 crédito por caractere (flash/turbo: 0,5). O conteúdo atual tem 1 753 textos
(47 mil caracteres) e 891 variantes lentas (38 mil caracteres): 2 644 clipes, ~85 mil créditos na geração completa
do zero. Audição: ~7 mil. Nomes (`only = names`): 254. Re-executar só gera o que faltar ou mudou (texto, voz,
modelo, formato, settings, seed ou versão do dicionário). `--dry` mostra as três estimativas antes de gastar.
