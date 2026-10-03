# AUDIO SPEC V2: vozes ElevenLabs Pro para o BíbliaLearn

Versão 2.0 (outubro de 2026). Especificação operacional do pipeline de áudio: casting, modelo e settings, formato, variantes lentas, alinhamento, pronúncia, volume, prosódia, idempotência, mudanças arquivo a arquivo e validação. Sintetiza a auditoria de áudio (achados AP-01 a AP-28) e o blueprint que a acompanha, conferidos contra o estado real do repositório em 3 de outubro de 2026.

Documentos irmãos: `docs/CONTENT_SPEC_V2.md` (campos `who`, `speaker`, `mood`, `narrator`, `guests`, `cast`, `extras` que este pipeline consome) e `docs/VISUAL_SPEC.md` (botões de áudio, onda sonora, estado "tocando"). Onde a seção 7.6 do CONTENT SPEC lista IDs de voz, esta especificação prevalece: ela mantém a estrutura proposta lá (coadjuvantes recorrentes, duas vozes de narração nas histórias, `trio`, heroínas) e troca o elenco por um casting General American sem colisões.

Convenções: português do Brasil com acentos; sem travessão em nenhum texto; referências a código como `arquivo:linha`; valores exatos sempre que medidos. Comandos assumem a raiz `biblelingo/`.

## Sumário

1. Diagnóstico
2. Casting final: voz x personagem
3. Modelo e `voice_settings` por tipo de texto
4. Formato e bitrate em toda a cadeia
5. Variantes lentas nativas
6. Alinhamento por `/with-timestamps` e regras de corte
7. Dicionário de pronúncia
8. Normalização de volume
9. Prosódia consistente
10. Idempotência, migração e orçamento
11. Mudanças concretas arquivo a arquivo
12. Plano de validação
Anexo A: `tools/voices.json` (exemplo)
Anexo B: índice v2 (exemplo)
Anexo C: `audio/qa-report.json` (exemplo)
Anexo D: checklist de aceitação

---

## 1. Diagnóstico

### 1.1 O alvo (como o Duolingo faz)

- Uma voz fixa por personagem em todo o curso, com um único sotaque (o curso de inglês do Duolingo usa General American). Personagens secundários nunca dividem voz com alguém da mesma cena.
- Tocar numa palavra toca a fatia da própria frase, na mesma voz e no mesmo tom; nunca uma síntese isolada, nunca o narrador no meio da fala do herói.
- "Devagar" (tartaruga) é uma gravação própria, mais lenta e pausada, no mesmo tom; nunca `playbackRate`.
- O áudio da lição já está carregado quando o exercício aparece: o toque responde em menos de 30 ms; volume igual em todos os clipes e nos efeitos.
- Nada de voz sintética do aparelho misturada com vozes gravadas.

### 1.2 Estado real do repositório (medido)

Há duas camadas descompassadas: as ferramentas e o áudio em disco.

**Ferramentas (HEAD, commit `64704062` "pipeline de áudio v2").** `tools/gen-audio.mjs` já chama `POST /v1/text-to-speech/{voice}/with-timestamps` (linha 346), gera em `mp3_44100_128` (linha 25), cria a variante lenta com `speed: 0.8` (linhas 26 e 264 a 272), inclui formato e settings no hash (linhas 276 a 279), usa `previous_text`/`next_text` (linhas 342 e 343) e um dicionário de pronúncia com 20 regras `alias` (linhas 84 a 91). `tools/cut-words.mjs` recorta palavras pelos timestamps (sem whisper); `tools/align-words.py` e `requirements.txt` já não existem. `.github/workflows/gen-audio.yml` roda só Node 20 + ffmpeg.

**Áudio em disco (gerado pelo pipeline v1, última execução em 14 de setembro).** Nada do v2 foi executado ainda, porque a chave do ElevenLabs vive só no segredo do GitHub e o workflow não rodou depois do commit:

| Item | Medição |
|---|---|
| Clipes `audio/*.mp3` | 1 941 arquivos, 3 807 s (63 min), 19 MB; ffprobe em 6 amostras: 6/6 a 22 050 Hz, mono, 32 kbps (`mp3_22050_32`) |
| Recortes `audio/words/` | 4 007 arquivos, 17 MB, 22 050 Hz a 48 kbps; 443 com duração < 0,20 s e 80 com < 0,15 s; 112 com probabilidade do whisper < 0,7 |
| Sprites `audio/sprites/` | 100 arquivos, 45 MB, 44 100 Hz a 64 kbps, 34 a 98 s cada, 5 948 entradas em `sprites.json` |
| Índices JSON | `manifest.json` 195 KB (1 727 textos, 0 entradas `~slow`), `words.json` 401 KB, `sprites.json` 356 KB, `words-index.json` 324 KB (`ver: 4`, campo `heard` do whisper): 1,27 MB, todos com `cache: "no-cache"` em `app/src/core/audio.js:33-47` |
| `audio/align/` | não existe |
| `node tools/gen-audio.mjs --dry` | "Textos: 1769 · caracteres: 47207 (+44735 nas variantes lentas)"; "Clipes: 3070 (1769 normais + 1301 lentos) · já corretos: 0 · a gerar: 3070"; "Estimativa ≈ 91942 créditos"; "Vozes distintas: 39 para 74 personagens" |

Ou seja: a próxima execução do workflow regeraria tudo (bom), mas com o casting atual, sem controle de qualidade, com sprites particionados por hash e com 1,3 MB de JSON revalidado a cada arranque (ruim). Esta especificação fixa o que mudar antes de gastar os créditos.

### 1.3 Achados da auditoria e situação

| Achado | Resumo | Situação no HEAD | Onde esta spec resolve |
|---|---|---|---|
| AP-01 | geração em `mp3_22050_32` | ferramenta já em 128 kbps; disco ainda em 32 kbps | seção 4 (`mp3_44100_192`) |
| AP-02 | 2 a 3 recodificações (32k, 48k, 64k) | `cut-words.mjs` ainda recodifica palavras (96k); sprites 96k | seção 4 (palavras por offset; uma única recodificação) |
| AP-03 | "devagar" = `playbackRate` 0,75 | ferramenta gera `~slow`; app ainda cai em 0,75 quando falta (`audio.js:73`) | seção 5 |
| AP-04 | whisper erra nomes; 46 frases com palavras sem corte | resolvido na ferramenta (`cut-words.mjs`); disco ainda do whisper | seção 6 |
| AP-05 | falante sorteado por hash do texto (`castCharFor`, `gen-audio.mjs:111-116`) | aberto | seções 2 e 11 (`who` obrigatório) |
| AP-06 | casting inadequado; vozes partilhadas (Clyde = Senhor, Golias, Sansão) | aberto | seção 2 |
| AP-07 | mistura de sotaques | aberto | seção 2 (GA para todos) |
| AP-08 | nenhum QA pós-geração; clipe alucinado "a dove" | aberto | seções 6.5 e 11 (QA gate) |
| AP-09 | palavras isoladas sintetizadas uma a uma | parcial (só palavras sem recorte, `gen-audio.mjs:161-168`) | seção 3 (listas pontuadas) |
| AP-10 | volume de -27,7 a -16,3 LUFS, clipping no Faraó | parcial (`loudnorm` por clipe em `build-sprites.mjs:20`, inadequado para clipes curtos) | seção 8 |
| AP-11 | 270 ms de silêncio final + GAP 120 ms | aberto (`build-sprites.mjs:17`) | seção 4.3 (trim) |
| AP-12 | 100 sprites por hash: lição toca 43 a 58 sprites | aberto (`build-sprites.mjs:18,46`) | seção 4.4 (sprite por lição) |
| AP-13 | 952 KB de JSON (hoje 1,27 MB) revalidados a cada arranque | aberto | seção 4.5 (índice único imutável) |
| AP-14 | 82 MB de áudio no git e no Pages | aberto | seções 4.2 e 11 (masters fora do git) |
| AP-15 | hash ignora formato, settings e pontuação | formato e settings resolvidos; pontuação ainda perdida (`audioKey`, linha 95) | seção 10.1 |
| AP-16 | settings derivados do `pitch` do navegador; sem `seed` | parcial (`settingsFor`, linhas 264 a 272) | seção 3 |
| AP-17 | sem dicionário de pronúncia | parcial (20 nomes, `add-from-rules`) | seção 7 |
| AP-18 | versículo sintetizado com a palavra "blank" | aberto (`gen-audio.mjs:125`) | seção 6.6 |
| AP-19 | AUDIO.md desatualizado; um modelo para tudo | parcial | seção 11 (AUDIO.md) |
| AP-20 | probe de voz gasta créditos; vozes mortas no catálogo | aberto (`probe`, linhas 203 a 217; `will`, `charlie`, `giovanni` em `.voices-ok.json` como `false`) | seção 2.6 |
| AP-21 | 3 workers, retry cego | parcial (4 workers; backoff com jitter, sem `retry-after`) | seção 11 |
| AP-22 | toque na palavra ignora o personagem | aberto (`Sayable.jsx:12`, `WordBank.jsx:33,40`, `Match.jsx:27`) | seção 11 (componentes) |
| AP-23 | animação com duração estimada | parcial (`clipDuration` em `usePlaying`; sem `onended`) | seção 11 (audio.js) |
| AP-24 | cortes curtos (cliques) | parcial (MIN_DUR 0,12 s em `cut-words.mjs:32`) | seção 6.3 |
| AP-25 | fallback robótico; AudioContext sem desbloqueio | aberto | seção 11 (audio.js) |
| AP-26 | workflow com Python + whisper num job só | Python removido; ainda um job, sem QA | seção 11 (gen-audio.yml) |
| AP-27 | conteúdo não declara falante nem emoção | aberto; CONTENT SPEC V2 define `who`, `speaker`, `mood` | seções 3.3 e 11 (validate.js) |
| AP-28 | falas de cena isoladas | parcial (`previous_text`/`next_text` sem request stitching) | seção 9 |

### 1.4 Medições que dimensionam o V2

- Duração por caractere nas frases atuais (1 302 frases): p10 58 ms, mediana 72 ms, p90 106 ms. Base do QA de duração (seção 6.5).
- Por lição (pool completo de textos de `data.js`): 36 a 40 textos, 765 a 1 231 caracteres, 59 a 97 s de áudio normal; variantes lentas estimadas em 64 a 111 s (speed 0,8 alonga 25%). Por cena: 18 a 44 s normal (média 28 s), lentas em média 33 s. Histórias: 265 s no total.
- Falantes: 74 (44 da galeria em `characters.js`, o narrador e 29 extras em `SCENE_EXTRAS` de `scenes.js:10-35` e `scenes2.js:4-9`). Falas de cena por falante: jesus 43, pedro 33, isaias 26, jose 26, noe 25, moises 24, daniel 24, davi 23, a voz do Senhor 20, Faraó 12, Judá 9, Sem 8, os demais 1 a 5.
- Caracteres por tipo de texto (conteúdo atual): frases 10 207, falas de cena 16 499 (404 falas, média 38,5 caracteres), leituras 4 230 (105 a 246 caracteres cada), versículos 1 689, versículo com lacuna 1 689 (a eliminar), opções de versículo 445, diálogos 671 + opções 1 509, quiz 946 + opções 1 056, perguntas de leitura 777 + opções 1 085, histórias 1 837 + perguntas 475 + opções 689, vocabulário 1 422, vocabulário de cena 2 015, nomes 254. Palavras isoladas distintas em frases e falas do herói: 834 (4 409 caracteres).

---

## 2. Casting final: voz x personagem

### 2.1 Regras

1. **Sotaque único General American (GA)** para todo o elenco. Vozes britânicas, australianas, irlandesas, suecas e "transatlânticas" do catálogo saem das atribuições (George, Daniel, Matthew, Joseph, Alice, Lily, Dorothy, Dave, James, Charlie, Fin, Charlotte, Mimi, Giovanni; Callum e Jeremy ficam só como última reserva, com aviso do lint). Exceção única e consciente, se o dono preferir: George para Jesus (seção 2.3).
2. **Vozes exclusivas** para os 15 papéis principais (narrador, voz do Senhor, anjo, Jesus, Moisés, Noé, Davi, Pedro, Isaías, José, Daniel, Samuel, Maria, Ester, Madalena): ninguém mais usa a voz, em nenhuma cena.
3. **Pools** para os demais, com uma regra dura verificada por `cast-lint`: dois falantes do mesmo conjunto de cena, história, lição v2 (`narrator`, `guests`, `conversation.with`, `speaker` dos beats) ou unidade (`cast` + `extras` de `course.json`) nunca resolvem para o mesmo `voice_id`.
4. **Arquétipo antes de nome**: cada papel declara idade, timbre e energia; a voz é escolhida por esses rótulos (que o `GET /v1/voices/{id}` devolve em `labels.age`, `labels.accent`, `labels.description`, `labels.use_case`).
5. **Lacunas vêm da Voice Library** (filtros English, American, Narrative/Characters, idade), adicionadas à conta com `POST /v1/voices/add/{public_user_id}/{voice_id}`; 10 slots previstos (L1 a L10). Cada ID entra em `tools/voices.json` depois de validado.
6. **Audição obrigatória antes de regenerar**: `node tools/gen-audio.mjs --audition` gera, por voz, o nome do personagem e 2 frases do seu próprio repertório, mais os nomes bíblicos da seção 7; escreve `audition/index.html` com um player por clipe e campo de notas. Custo: ~5 mil créditos.

### 2.2 Correção ao blueprint: Samuel não é menino

Toda fala de Samuel no conteúdo é do profeta idoso ungindo Davi (`c-davi-1`: "I am Samuel, the prophet. Nice to meet you, David."; história `s4`). O blueprint pedia uma voz de menino de 10 a 12 anos; isso valeria só para 1 Samuel 3, que não tem fala gravada. Samuel recebe uma voz de ancião (slot L1). Se o conteúdo v2 incluir o menino Samuel, cria-se o papel `samuel-menino` com voz própria da Library.

### 2.3 Tabela de casting (IDs públicos do catálogo atual, `gen-audio.mjs:49-68`)

Vozes com asterisco não constam de `tools/.voices-ok.json` (nunca foram validadas nesta conta): validar na Fase 0 com `GET /v1/voices/{id}`.

**Principais (exclusivos)**

| Papel (`char`) | Arquétipo | Voz | `voice_id` | Por quê |
|---|---|---|---|---|
| `narrator` (e narrador "Lucas" das histórias) | 40 a 50 anos, grave, calmo, dicção perfeita | Brian (mantém) | `nPczCjzI2devNBz1zQrb` | GA, neutro, já validado; é a referência de pronúncia do curso |
| `voice` (A voz do Senhor) | profunda, calorosa, autoridade sem agressividade | Adam + efeito `reverb-lord` | `pNInz6obpgDQGcFmaJgB` | hoje é Clyde (rouco, "veterano") dividido com Golias e Sansão; Adam é a voz grave mais limpa do catálogo |
| `anjo` | jovem adulto, claro, sereno | Thomas + efeito `reverb-light` | `GBv7mTt0atIp3Br8iCZE` | voz calma e brilhante; Neemias e Jessé deixam de usá-la |
| `jesus` | 30 a 35 anos, quente, pausado, firme | Eric | `cjVigY5qzO86Huf0OWal` | GA, maduro e suave. Alternativa consciente: George `JBFqnCBsd6RMkjVDRZzb` (britânico), só se o dono preferir o timbre; nesse caso Isaías sai de George, como abaixo |
| `moises` | 80 anos, autoridade, grave | Bill (mantém, agora exclusivo) | `pqHfZKP75CvOlQylNhV4` | "idoso, confiável"; Pedro sai desta voz |
| `noe` | idoso, avô acolhedor | Michael | `flq6f7yk4E4fJM5XTYuZ` | calmo, idoso, audiolivro; sai de Daniel (britânico); Paulo e Potifar deixam Michael |
| `davi` | 18 a 25 anos, articulado, enérgico | Liam (mantém) | `TX3LPaxmHKxFdv7VOQHJ` | encaixe ótimo |
| `pedro` | 30 anos, enérgico, impulsivo, pescador | Chris | `iP95p4xoKVk53GoZ742B` | casual e conversacional; deixa de ser idoso (Bill); Arão e o anjo saem de Chris |
| `isaias` | maduro, intenso, proclamador | Arnold | `VR6AewLTigWG4xSOukaG` | firme e nítido; Elias e Nabucodonosor deixam Arnold |
| `jose` | 17 a 30 anos, sonhador, levemente ansioso | Harry (mantém) | `SOYHLrjzK2X1ezoPC6cr` | encaixe bom; Acaz sai |
| `daniel` | 20 a 30 anos, sereno, sábio | Josh | `TxGEqnHWrfWFTfGW9XjX` | jovem e grave; sai de Matthew (britânico); Adão, Gideão e o atalaia deixam Josh |
| `samuel` | profeta idoso (ver 2.2) | Library L1 "elderly prophet, GA" | a validar | não há segundo ancião GA livre no catálogo; reserva: Michael (nunca contracena com Noé) |
| `maria` | 20 a 30 anos, doce, firme | Jessica (mantém) | `cgSgspJ2msm6clMCkdW9` | expressiva, jovem, GA |
| `ester` | 20 a 25 anos, rainha, delicada e corajosa | Sarah (mantém) | `EXAVITQu4vr4xnSDxMaL` | suave, jovem, GA |
| `madalena` | jovem adulta, intensa | Domi (mantém) | `AZnzlk1XvdvUeBnXmlld` | forte e jovem, GA |

**Pool régio (reis e autoridades)**

| Papel | Arquétipo | Voz | `voice_id` | Observação |
|---|---|---|---|---|
| `pharaoh` (Faraó, u3 e u6) | duro, impaciente ("I say no.") | Clyde | `2EiwWnXFnvU5JabPnv8n` | sai da voz do Senhor; antagonista recorrente merece timbre marcante |
| `saul` | rei atormentado | Library L2 "regal king A, GA" | a validar | reserva Drew |
| `nabucodonosor` | rei imponente | Drew | `29vD33N1CtxCmqQRPOHJ` | encorpado, meia-idade |
| `belsazar` | rei do banquete, exaltado | Patrick | `ODq5zmih8GrVes37Dizd` | "shouty" cabe na festa |
| `dario` | rei pesaroso, formal | Paul | `5Q0t7uMcjvnagumLfvZi` | repórter, meia-idade |
| `acaz` | rei medroso | Library L3 "regal king B, GA" | a validar | reserva Roger; sai de Harry |
| `ezequias` | rei jovem e piedoso (promovido à galeria no v2) | Antoni | `ErXwobaYiN019PkySvjV` | jovem, redondo; sai de Matthew |
| `salomao` | rei sábio, maduro | Roger | `CwhRBWXzGAHq8TQ4Fs17` | confiante; sai de James (australiano) |

**Pool ancião (Library L4 "elderly patriarch, GA"; reserva Michael apenas fora de u2)**

| Papel | Observação |
|---|---|
| `abraao` | sai de Roger (que também era o mercador) |
| `jesse` (pai de Davi) | sai de Thomas (jovem) |
| `jaco` (idoso em Gênesis 37 a 50; `cast` de u6 no v2) | sai de Eric |
| `isaac` | sai de Jeremy |
| `ezequiel` (`cast` de u7 no v2) | usa L1, como Samuel (u4 e u7 nunca se encontram); sai de Adam |

**Vilões e intensos**

| Papel | Voz | `voice_id` | Observação |
|---|---|---|---|
| `goliath` | Library L7 "giant villain, booming, GA" | a validar | reserva Jessie `t0jbNlBVZ17f02VDIeMI`* (rouco, idoso, GA); depois Patrick. Sai de Clyde |
| `elias` | Clyde | `2EiwWnXFnvU5JabPnv8n` | fogo do Carmelo; nunca contracena com o Faraó |
| `joaobatista` | Clyde | `2EiwWnXFnvU5JabPnv8n` | pregador do deserto; galeria apenas |
| `sansao` | Patrick | `ODq5zmih8GrVes37Dizd` | galeria apenas |

**Pool cotidiano (homens): Roger, Paul, Drew, Patrick, Antoni, Sam, Ethan + Library L5 "young man, GA" e L6 "mature man, GA"**

| Papel | Voz | `voice_id` | Observação |
|---|---|---|---|
| `merchant` (Zabad no v2) | Roger | `CwhRBWXzGAHq8TQ4Fs17` | "Fine, fine, fine." |
| `sem` | Antoni | `ErXwobaYiN019PkySvjV` | filho prático de Noé; sai de Callum |
| `arao` | Drew | `29vD33N1CtxCmqQRPOHJ` | porta-voz; sai de Chris |
| `josue` | Sam | `yoZ06aMxZJJ28mfd3POQ` | jovem ajudante; sai de Ethan (sussurro) |
| `povo` | mistura Paul + Patrick | ver seção 8.4 | sai de Brian (hoje "o povo" soa como o narrador) |
| `jonatas` | Antoni | `ErXwobaYiN019PkySvjV` | príncipe jovem |
| `mefibosete` | Ethan | `g5CIjZEefAph4nQFvHAz` | humilde, suave |
| `sedento` | Paul | `5Q0t7uMcjvnagumLfvZi` | |
| `atalaia` | Sam | `yoZ06aMxZJJ28mfd3POQ` | sai de Josh |
| `juda` | Library L6 | a validar | reserva Callum (transatlântico, com aviso) |
| `ismaelita` | Patrick | `ODq5zmih8GrVes37Dizd` | mercador rude |
| `potifar` | Roger | `CwhRBWXzGAHq8TQ4Fs17` | oficial; sai de Michael |
| `copeiro` | Ethan | `g5CIjZEefAph4nQFvHAz` | ansioso; sai de Dave (britânico) |
| `mordomo` | Sam | `yoZ06aMxZJJ28mfd3POQ` | sai de Jeremy |
| `aspenaz` | Roger | `CwhRBWXzGAHq8TQ4Fs17` | professor rígido; sai de Joseph (britânico) |
| `oficial` | Antoni | `ErXwobaYiN019PkySvjV` | |
| `trio` (os três amigos, v2) | Library L5 | a validar | reserva Jeremy (com aviso) |
| `andre` | Sam | `yoZ06aMxZJJ28mfd3POQ` | pescador jovem; sai de Callum |
| `zebedeu` (v2) | Library L6 | a validar | |
| `coxo` | Paul | `5Q0t7uMcjvnagumLfvZi` | sai de Eric |
| `zaqueu` | Ethan | `g5CIjZEefAph4nQFvHAz` | sai de Daniel (britânico) |
| `bartimeu` | Patrick | `ODq5zmih8GrVes37Dizd` | clamor |
| `adao` | Library L5 | a validar | narrador de u1 no v2; reserva Sam |
| `josepai` | Ethan | `g5CIjZEefAph4nQFvHAz` | sai de Brian |
| `calebe` | Drew | | galeria apenas |
| `gideao` | Sam | | galeria apenas |
| `eliseu` | Paul | | galeria apenas; sai de Callum |
| `neemias` | Antoni | | galeria apenas |
| `jonas` | Library L6 | | sai de Fin (irlandês) |
| `paulo` | Roger | | galeria apenas |
| `barnabe` | Paul | | galeria apenas |
| `timoteo` | Library L5 | | jovem |
| `filipe` | Sam | | sai de Dave |
| `natanael` | Antoni | | sai de Jeremy |
| `tome` | Ethan | | sai de Joseph |

**Mulheres (todas GA)**

| Papel | Arquétipo | Voz | `voice_id` | Observação |
|---|---|---|---|---|
| `sara` | adulta, calorosa, riso | Matilda | `XrExE9yKIg1WjnnlVkGX` | mantém |
| `rebeca` | jovem, generosa | Library L9 "young woman, GA" | a validar | reserva Rachel; sai de Lily (britânica) |
| `rute` | jovem, leal | Laura | `FGY2WhTYpPnrIDTdsKH5` | mantém |
| `debora` | 40 a 50 anos, autoridade serena | Aria | `9BWtsMINqrJLrRacOk9x` | sai de Charlotte (sueca) |
| `eva` | jovem adulta, emotiva | Elli* | `MF3mGyEYCl7XYWbV9V6O` | sai de Alice (britânica); reserva L9 |
| `marta` | adulta, prática | Emily* | `LcfcDJNUP1GQjkzn1xUU` | calma, meia-idade |
| `lidia` | adulta, hospitaleira | Serena* | `pMsXgVXv3BLzUgSXRplE` | sai de Rachel |
| `serva` (Roda no v2) | jovem, curiosa, insistente | Freya* | `jsCqWAovK2LkecY7zXl4` | energia alta; reserva Laura |
| `esposa` (Naamá no v2) | madura, organizada | Library L8 "mature woman, GA" | a validar | sai de Grace (sulista) |
| `miria` (v2) | jovem, decidida | Library L9 | a validar | nunca contracena com Rebeca |
| `abigail` (v2) | adulta, serena | Aria | `9BWtsMINqrJLrRacOk9x` | nunca contracena com Débora |
| `ana` (Hannah, v2) | adulta, emotiva | Serena* | `pMsXgVXv3BLzUgSXRplE` | |
| viúva de Sarepta (v2, `viuva`) | madura | Library L8 | a validar | |
| samaritana (v2, `samaritana`) | adulta, direta | Rachel | `21m00Tcm4TlvDq8ikWAM` | |
| Isabel (v2, `isabel`) | madura | Matilda | `XrExE9yKIg1WjnnlVkGX` | contracena só com Maria (Jessica) |
| narradora das histórias pares (CONTENT SPEC chama "Ana"; sugestão: renomear para "Lia" para não colidir com a heroína Ana) | 30 a 40 anos, clara | Library L10 "female narrator, GA" | a validar | reserva Rachel |

Cobertura: 74 papéis atuais + 10 papéis novos do CONTENT SPEC V2, 26 vozes do catálogo + 10 slots da Library. Nenhum papel fica sem voz; a verificação de colisões por cena, história e unidade foi feita à mão para as 48 cenas, 8 histórias e os 8 `cast`/`extras` de `course.json` e passa; o `cast-lint` a refaz a cada execução.

### 2.4 Vozes removidas das atribuições

`will`, `charlie`, `giovanni` (indisponíveis na conta: 400/404 em `.voices-ok.json`) saem do catálogo. `george`, `daniel`, `callum`, `dave`, `fin`, `james`, `jeremy`, `joseph`, `matthew`, `alice`, `lily`, `charlotte`, `dorothy`, `mimi`, `gigi`, `glinda`, `grace` ficam listadas em `voices.json` com `accent` diferente de `american` e só podem ser atribuídas com `"allowAccent": true` no papel (gera aviso no lint). `george` é a única exceção prevista (Jesus), e só por decisão explícita do dono.

### 2.5 `cast-lint` (em `tools/gen-audio.mjs --lint`, também rodado antes de qualquer geração)

```
conjuntos = []
para cada cena em SCENES: conjuntos.push({ id: cena.id, quem: únicos(cena.lines.map(l => l.who)) })
para cada história em STORIES: conjuntos.push({ id, quem: únicos(beats.map(b => b.who || "narrator")) })
para cada lição v2: conjuntos.push({ id, quem: [narrator, ...guests, conversation.with, ...beats.map(b => b.speaker)] })
para cada unidade em course.json: conjuntos.push({ id, quem: [...cast, ...extras] })
erros = []
para cada papel em cast: se !voices[cast[papel].voice] erros.push("sem voz: " + papel)
para cada voz exclusiva: se usada por 2+ papéis erros.push("voz exclusiva partilhada")
para cada conjunto: agrupar quem por voice_id; grupo com 2+ papéis => erros.push(conjunto.id + ": " + papéis + " dividem " + voz)
para cada papel: se voices[voz].accent !== "american" && !cast[papel].allowAccent avisos.push(...)
para cada voz usada: GET /v1/voices/{id} (sem créditos), cache em tools/.voices-ok.json { id: { ok, checkedAt, labels } }
se erros.length: imprimir e sair com código 1 (nenhum crédito gasto)
```

### 2.6 Validação de voz sem gastar créditos

`probe` (`gen-audio.mjs:203-217`) faz um `POST text-to-speech` com "Hi." por voz (1 crédito cada, `mp3_22050_32`). Substituir por `GET /v1/voices/{voice_id}`: devolve `name`, `labels` e `available_for_tiers`; 404 marca a voz como indisponível. O cache `.voices-ok.json` passa a ser indexado por `voice_id` (não por apelido) e guarda `labels` para o lint de sotaque. `.voices-assigned.json` (hoje `{}`) é removido: a reserva de cada papel fica declarada em `voices.json` (`fallback`), nunca sorteada.

---

## 3. Modelo e `voice_settings` por tipo de texto

### 3.1 Base comum a todas as requisições

- `model_id`: `eleven_multilingual_v2` (1 crédito por caractere). Flash e Turbo v2.5 (0,5 crédito) não entram: a economia de ~45 mil créditos por regeneração não compensa a perda de naturalidade, e a cota do Pro sobra.
- `voice_settings.similarity_boost: 0.85`, `use_speaker_boost: true`.
- `seed`: fixo por personagem (`crc32(char) % 4294967295`, guardado em `voices.json`), somado ao índice da tentativa na regeneração por QA (`seed + tentativa`). Reprodutibilidade é "melhor esforço" no ElevenLabs, mas estabiliza timbre entre clipes do mesmo personagem.
- `apply_text_normalization: "on"` (números, "1 Samuel 16", "forty" já por extenso no conteúdo). Não é suportado em Flash/Turbo v2.5, mais um motivo para o multilingual_v2.
- `pronunciation_dictionary_locators`: `[{ pronunciation_dictionary_id, version_id }]` da seção 7, só em textos que contêm um nome do dicionário (regex gerada a partir dele), como já faz `gen-audio.mjs:344`.
- **Correção ao blueprint:** não enviar `language_code`. A documentação do endpoint diz que a imposição de idioma vale só para Turbo v2.5 e Flash v2.5 e que outros modelos devolvem erro quando o campo é enviado. O inglês do conteúdo é inequívoco; os raros textos em português não vão para o ElevenLabs.
- `previous_text` / `next_text` / `previous_request_ids`: seção 9.

### 3.2 Perfis por tipo de texto

| `kind` | O que é | stability | style | speed (normal) | variante lenta | Observações |
|---|---|---|---|---|---|---|
| `word-list` | vocabulário da lição e da cena, opções de 1 palavra, peças sem recorte | 0,75 | 0,00 | 1,00 | não | lista pontuada de até 40 itens por requisição e por voz ("Heaven. Earth. Light. Darkness."), cortada por item pelos timestamps; nunca uma requisição por palavra (AP-09) |
| `name` | nome do personagem | 0,75 | 0,00 | 1,00 | não | 1 requisição por nome, na própria voz |
| `sentence` | frase de lição (beat), fala do herói que será recortada | 0,60 | 0,10 | 1,00 | sim, 0,80 | `previous_text` = frase anterior da lição |
| `line` | fala de coadjuvante em cena e turno de conversa (não recortada) | 0,50 | 0,20 | 1,00 | sim, 0,80 | ajuste por `mood` (3.3); candidata ao A/B com `eleven_v3` |
| `story` | beat de história e `reading` | 0,55 | 0,15 | 0,95 | sim, 0,80 | `previous_request_ids` entre beats consecutivos |
| `verse` | versículo (WEB no v2; KJV em `classic`, se gravado) | 0,70 | 0,05 | 0,92 | sim, 0,80 | só a versão completa; a lacuna é feita no app (6.6) |
| `question` | pergunta de quiz, de leitura e de história, instrução | 0,60 | 0,05 | 1,00 | não | narrador; opções de 1 palavra viram `word-list` |
| `divine` | falas de `voice` e `anjo` | 0,65 | 0,10 | 0,90 | sim, 0,80 | efeito de reverb no master (8.3); nunca pitch shift |

A assinatura dos settings (`settingsSig`) entra no hash do clipe (10.1); trocar um valor desta tabela regenera só o tipo afetado.

### 3.3 `mood` (CONTENT SPEC V2, lista fechada de 12) e direção de voz

Para `line` e `story` no `eleven_multilingual_v2`, o `mood` ajusta os settings do perfil (resultado limitado a stability 0,35 a 0,85, style 0,00 a 0,35, speed 0,85 a 1,10). No A/B com `eleven_v3`, vira uma audio tag no início do texto (o v3 interpreta tags livremente; a lista abaixo é ponto de partida para a audição, não garantia). O v3 usa stability discreta (0,0 criativa, 0,5 natural, 1,0 robusta) e não aceita `speed`: a variante lenta de falas v3 é montada no app por palavra (seção 5.3).

| `mood` | Δ stability | Δ style | speed | tag v3 |
|---|---|---|---|---|
| calmo | 0 | 0 | 1,00 | (nenhuma) |
| animado | -0,10 | +0,10 | 1,05 | `[excited]` |
| surpreso | -0,10 | +0,10 | 1,00 | `[surprised]` |
| assustado | -0,10 | +0,15 | 1,05 | `[nervous]` |
| triste | +0,05 | +0,10 | 0,95 | `[sad]` |
| irônico | 0 | +0,15 | 1,00 | `[sarcastic]` |
| bravo | -0,10 | +0,20 | 1,00 | `[angry]` |
| carinhoso | +0,05 | +0,10 | 0,95 | `[warmly]` |
| urgente | -0,10 | +0,10 | 1,10 | `[urgent]` |
| solene | +0,15 | 0 | 0,92 | `[solemn]` |
| rindo | -0,15 | +0,20 | 1,00 | `[laughs]` |
| sussurrando | +0,10 | 0 | 0,95 | `[whispers]` (no v2: ganho -3 dB no master) |

O `mood` entra na assinatura dos settings, logo no hash: mudar o humor de uma fala regenera só ela.

---

## 4. Formato e bitrate em toda a cadeia

### 4.1 A cadeia, hoje e no V2

| Etapa | Disco hoje (v1) | Ferramentas no HEAD (não executadas) | V2 |
|---|---|---|---|
| Geração | `mp3_22050_32` | `mp3_44100_128` | `mp3_44100_192` (máximo do Pro para MP3) |
| Master | no git (19 MB) | no git | fora do git: artefato do workflow (30 dias) + asset de Release; ~170 MB a 192 kbps para ~120 min |
| Palavras | corte MP3 48 kbps (4 007 arquivos, 17 MB) | corte MP3 96 kbps com `loudnorm` | offsets dentro do clipe da frase no sprite; zero arquivos, zero recodificação |
| Sprites | 100 por hash, 64 kbps, GAP 120 ms (45 MB) | 100 por hash, 96 kbps | 1 por lição (normal e lento separados), 1 por cena, 1 por história, 1 `core`; MP3 44,1 kHz mono CBR 128 kbps; GAP 60 ms (~115 MB) |
| Recodificações com perdas sobre o que o aluno ouve | 3 nas palavras (32k, 48k, 64k), 2 nas frases | 2 | 1 (192k decodificado uma vez para PCM, processado, codificado uma vez a 128k) |
| Índices | 1,27 MB em 4 JSON, `no-cache` | idem | `audio/index-<hash8>.json` único (~280 KB, ~60 KB gzip), imutável, mais um ponteiro `audio/index.json` de 60 bytes |

Por que MP3 192 e não `pcm_44100`: PCM via `/with-timestamps` chega em `audio_base64` a 88 KB por segundo de áudio; 120 min dariam ~530 MB de PCM (~300 MB em FLAC) por regeneração completa, para subir ao Release a cada execução. A 192 kbps o master é transparente para voz mono e a única recodificação adicional (sprite a 128 kbps) é inaudível em celulares. Se o dono preferir masters sem perdas, a mudança é uma linha (`OUTPUT_FORMAT = "pcm_44100"` + `ffmpeg -f s16le -ar 44100 -ac 1 -i - master.flac`) e o hash cuida da regeneração.

### 4.2 Diretórios

```
biblelingo/audio/                     (git; servido pelo Pages e pelo dev server do Vite)
  index.json                          { "v": 2, "file": "index-3f9a1c2b.json" }   (cache: no-cache, 60 bytes)
  index-<hash8>.json                  índice completo (Cache-Control: immutable via nome com hash)
  sprites/l-u1l1-n-<hash8>.mp3        lição, variante normal (frases, listas de vocabulário, opções, quiz, leitura)
  sprites/l-u1l1-s-<hash8>.mp3        lição, variantes lentas
  sprites/c-noe-2-<hash8>.mp3         cena (falas, vocabulário, normal + lento)
  sprites/s-s2-<hash8>.mp3            história (beats, perguntas, opções, normal + lento)
  sprites/core-<hash8>.mp3            nomes, listas de palavras do narrador, textos partilhados
  qa-report.json                      resumo do QA da última execução (seção 6.5)
biblelingo/.masters/                  (ignorado pelo git; restaurado do Release antes de gerar)
  <hash16>.mp3                        master 192 kbps tal como veio do ElevenLabs (nunca recodificado)
  <hash16>.json                       alinhamento { text, source, characters, start, end, requestId }
  manifest.json                       manifesto v2: spec completo de cada clipe (seção 10.2)
```

`audio/*.mp3`, `audio/words/`, `audio/manifest.json`, `audio/words.json`, `audio/words-index.json` e `audio/sprites.json` deixam de existir na Fase 3 (durante a migração, `manifest.json`, `words.json` e `sprites.json` são derivados do índice para manter o app atual funcionando; seção 10.4).

### 4.3 Processamento em PCM (uma decodificação por master)

Por master, em `tools/build-sprites.mjs`:

```
ffmpeg -i .masters/<hash>.mp3 -af "<cadeia>" -f s16le -ac 1 -ar 44100 -
cadeia =
  silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.02,     # deixa 20 ms antes do ataque
  areverse, silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.10, areverse,   # deixa 100 ms depois
  volume=<ganhoVozDb + ganhoClipeDb>dB,                                       # seção 8
  [aecho=... só para voice/anjo]                                              # seção 8.3
  alimiter=limit=0.84:attack=5:release=50                                     # -1,5 dBTP
```

O trim altera os offsets: `build-sprites.mjs` mede quanto foi removido no início (`trimStart`) e subtrai esse valor dos timestamps do alinhamento ao escrever os offsets de palavras. Hoje os clipes têm em média 270 ms de silêncio final (111 a 342 ms) e 38 ms inicial, mais 120 ms de GAP: em exercícios de toque rápido (match, banco de palavras) são ~400 ms de vazio por item.

### 4.4 Sprites por grupo e impacto no carregamento

| Grupo | Conteúdo | Tamanho estimado a 128 kbps | Decodificado em memória (48 kHz, Float32) |
|---|---|---|---|
| `l-<lição>-n` | 36 a 40 textos (59 a 97 s medidos, menos ~10 s de silêncios removidos) | 0,8 a 1,4 MB | 10 a 17 MB |
| `l-<lição>-s` | variantes lentas (64 a 111 s) | 1,0 a 1,8 MB | 12 a 21 MB |
| `c-<cena>` | 8,4 falas + 5 itens, normal + lento (~60 s) | ~1,0 MB | ~12 MB |
| `s-<história>` | beats + perguntas + opções, normal + lento (~70 s) | ~1,1 MB | ~13 MB |
| `core` | 54 nomes, listas de palavras do narrador, textos partilhados (~80 s) | ~1,3 MB | ~15 MB |

Fluxo no app: ao abrir a folha do nó (tela de intro da lição), `preloadGroup("u1l1")` busca `l-u1l1-n` e decodifica; `l-u1l1-s` é buscado em `requestIdleCallback` e decodificado no primeiro toque na tartaruga. O primeiro toque de qualquer exercício encontra o buffer pronto: < 30 ms (hoje 78 a 331 ms a frio no desktop e ~1 s em 4G, porque uma lição espalha 43 a 58 sprites de 455 KB). Em 4G (4 Mbps) `core` + lição normal (~2,5 MB) descem em ~5 s, durante a tela de intro. A lição de revisão (`u1r`) usa os sprites das três lições da unidade. LRU por segundos decodificados: limite de 420 s (~80 MB), com os sprites do grupo ativo sempre fixados.

Um texto presente em dois grupos (a mesma opção em duas lições) é gravado nos dois sprites; o índice guarda todas as posições e o player escolhe a que já está decodificada.

### 4.5 Cache

- Sprites e `index-<hash8>.json` têm o hash do conteúdo no nome: `app/public/sw.js:13` passa a tratar como mídia (cache primeiro) também `/audio/index-[0-9a-f]{8}.json`. Só `audio/index.json` (ponteiro) fica em "rede primeiro".
- O service worker pré-busca (sem decodificar) os sprites dos 2 próximos nós da trilha quando o app está ocioso e em Wi-Fi (`navigator.connection.saveData` false).
- Limpeza: ao carregar um índice novo, sprites do cache cujo nome não está no índice são apagados (lógica já existente em `audio.js:50-61`, adaptada à nova lista).

---

## 5. Variantes lentas nativas

### 5.1 O que ganha variante lenta

Todo texto dos tipos `sentence`, `line`, `story`, `verse` e `divine` com 2 ou mais palavras (frases de lição, falas de cena, turnos de conversa, beats, leituras, versículos). Não ganham: `word-list`, `name`, `question` e opções de quiz/leitura (não têm botão de tartaruga). É a regra de `hasSlow` em `gen-audio.mjs:178` restrita por tipo (hoje inclui perguntas e opções, 1 301 clipes lentos; com a restrição ficam ~1 050).

### 5.2 Geração

Mesma voz, mesma `seed`, mesmos settings, `speed: 0.8` (faixa permitida 0,7 a 1,2; 0,8 alonga ~25% sem soar arrastado). Também passa por `/with-timestamps`: os offsets da variante lenta servem para palavras funcionais curtas (seção 6.3). Chave no índice: `texto|char|s` (normal é `texto|char|n`).

### 5.3 Reprodução

```
speak(text, { char, slow })
  loc = index.clips[key|char|(slow ? "s" : "n")]
  se slow && !loc:                              # fala v3 ou texto sem variante
    palavras = index.words da variante normal
    agendar cada palavra em sequência: start(t, offset, dur) com GainNode (fade 6 ms / 25 ms), t += dur + 0.18
    emitSpeak(text, duraçãoTotal)               # estilo tartaruga do Duolingo
  senão tocar loc com playbackRate 1
```

`playbackRate` nunca é diferente de 1 (hoje `audio.js:73,112,126` usa 0,75 e a voz desce 5 semitons). `clipDuration(text, char, slow)` devolve a duração da variante escolhida (ou a soma montada), e é o que `usePlaying` e `emitSpeak` usam.

---

## 6. Alinhamento por `/with-timestamps` e regras de corte

### 6.1 Resposta do endpoint

`POST /v1/text-to-speech/{voice_id}/with-timestamps?output_format=mp3_44100_192` devolve `audio_base64`, `alignment` (`characters[]`, `character_start_times_seconds[]`, `character_end_times_seconds[]` para o texto enviado) e `normalized_alignment` (idem para o texto normalizado: números por extenso, abreviações, aliases do dicionário). O cabeçalho `request-id` da resposta é guardado para o request stitching (seção 9). O alinhamento substitui o whisper por completo: é o próprio modelo dizendo quando falou cada caractere, inclusive em nomes ("ark" nunca mais vira "arc", "Immanuel" nunca mais vira "Emmanuel", "two by two" nunca vira "2x2").

`gen-audio.mjs:376-380` já faz a escolha correta: usa `alignment` quando `characters.join("") === text`; senão `normalized_alignment` com `source: "normalized"`. O V2 acrescenta `source: "alignment-divergente"` ao QA (contagem no relatório) e guarda `requestId` no JSON de alinhamento.

### 6.2 Mapeamento de caracteres para palavras (`tools/cut-words.mjs`, já em Node)

1. Tokenizar o texto original com `/\S+/g`, tirando pontuação das pontas e mantendo apóstrofo interno ("God's") e hífen ("two-by-two"), como `tokenize()` em `cut-words.mjs:51-65`.
2. Se `source === "alignment"`, índice de caractere = índice no alinhamento (mapa identidade).
3. Se `source === "normalized"`: primeiro tentar mapeamento por token (quando o número de tokens do texto normalizado é igual ao do original, o n-ésimo token mapeia no n-ésimo; é o caso dos aliases com hífen, "Immanuel" -> "Im-MAN-you-el"); se os totais diferem, cair na maior subsequência comum por caractere (`lcsMap`, linhas 70-80). Por isso os aliases do dicionário nunca contêm espaço (seção 7).
4. Palavra = `start` do primeiro caractere mapeado até `end` do último (`wordTimes`, linhas 83-103).

### 6.3 Janela de cada palavra (offsets, não arquivos)

```
para a palavra i com [s, e], vizinhos prevEnd e nextStart (0 e fim do clipe nas pontas):
  cs = max(0, s - min(0.040, (s - prevEnd) / 2))            # ataque da consoante começa antes do timestamp
  ce = min(fim, e + min(0.070, (nextStart - e) / 2))        # decaimento da sílaba final
  se i é a última palavra: ce = min(fim, e + 0.120)
  se ce - cs < 0.180:
     candidata2 = mesma palavra na variante lenta (speed 0,8): recalcular; aceitar se >= 0.180
     candidata3 = item da lista pontuada da mesma voz (word-list): aceitar se existir
     senão: expandir simetricamente até 0.180 sem passar de prevEnd - 0.040 / nextStart + 0.040 e marcar "curta" no QA
  entre ocorrências da mesma palavra na frase vence a de maior pausa em volta (score de `cut-words.mjs:171`)
```

Os valores substituem PAD_BEFORE 0,03 / PAD_AFTER 0,08 / BLEED 0,04 / MIN_DUR 0,12 de `cut-words.mjs:30-32` e os 0,05 / 0,12 / 0,04 / 0,10 do antigo `align-words.py`. Hoje 443 dos 4 007 recortes têm menos de 0,20 s e 80 menos de 0,15 s ("the" com 0,11 s nas vozes de rebeca, arao e sem): soam como cliques.

### 6.4 Fades na reprodução, não no arquivo

Nenhum recorte é recodificado. O player aplica, por `AudioBufferSourceNode`, um `GainNode` com rampa de 6 ms na entrada e 25 ms na saída (`gain.setValueAtTime(0, t); gain.linearRampToValueAtTime(1, t + 0.006); gain.setValueAtTime(1, t + d - 0.025); gain.linearRampToValueAtTime(0, t + d)`). Vale para palavras e para clipes inteiros (que já começam e terminam em silêncio após o trim).

### 6.5 QA gate por clipe (em `gen-audio.mjs`, logo após a resposta; repete no `pack`)

| Verificação | Regra | Ação ao falhar |
|---|---|---|
| Duração por caractere (textos com 3+ palavras) | 40 a 140 ms por caractere (mediana medida 72 ms; p10 58, p90 106) | regenerar com `seed + 1` (até 2 vezes) |
| Item de `word-list` e `name` | 0,25 a 1,20 s por item | idem |
| Cobertura do alinhamento | `end` do último caractere <= duração do áudio <= `end` + 0,6 s; `start` do primeiro <= 0,4 s; fala alinhada / duração >= 0,6 (pega o "a dove" de 2,48 s que o whisper ouviu como "either way the sure way") | idem |
| Tokens | todo token com `start`/`end` finitos; `source` registrado; 0,06 s <= palavra <= 1,5 s | idem; token sem alinhamento é falha dura |
| Pico e loudness (após ganho, seção 8) | TP <= -1 dBTP; I dentro de ±2 dB do alvo nos clipes >= 3 s | reprocessar ganho; se persistir, reprovar |
| Transcrição (opcional, `--qa=stt`) | `POST /v1/speech-to-text` (`model_id: "scribe_v1"`) com WER <= 0,2 após normalizar números e aplicar o dicionário; cobrado por hora de áudio, à parte dos créditos de TTS (~2,3 h por regeneração completa) | regenerar com `seed + 1`; 3 reprovações = relatório |

Clipe reprovado três vezes entra em `audio/qa-report.json` (`failed[]`) e o job falha antes do commit; os aprovados ficam salvos nos masters (nada pago se perde).

### 6.6 Lacuna do versículo sem síntese extra

Hoje `gen-audio.mjs:125` gera "Make thee an blank of gopher wood" (24 clipes pagos, com o narrador dizendo "blank"). No V2 o app toca o versículo completo e silencia a palavra da lacuna: `gain` para 0 em `[wStart - 0.02, wEnd + 0.02]` com rampa de 10 ms, e um `OscillatorNode` (660 Hz, 300 ms, -20 dBFS, rampas de 10 ms) começa em `wStart`. Com 2 ou 3 lacunas por versículo (CONTENT SPEC V2 `verse.blanks`), a mesma função recebe uma lista de palavras.

### 6.7 `words.json` compatível com o app durante a migração

O índice v2 (Anexo B) é a fonte; `tools/build-sprites.mjs` continua a emitir, até a Fase 3, os três arquivos que `app/src/core/audio.js` e `features.js` leem hoje, derivados do índice:

- `manifest.json`: `{ "<key>": { "<char>": "<id>", "default": "<id>", "~slow": { "<char>": "<id>", "default": "<id>" } } }`, onde `<id>` é um identificador virtual (`<hash16>.mp3` do master) e não mais um arquivo em `audio/`.
- `words.json`: `{ "<tok>": { "<char>": { "f": "w/<hash16>/<tok>", "p": 1, "d": 0.39 }, "default": "w/<hash16>/<tok>" } }` (mesmo formato de `cut-words.mjs`; `f` é virtual).
- `sprites.json`: `{ "<id>": ["l-u1l1-n-3f9a1c2b.mp3", 12.345, 2.41], "w/<hash16>/<tok>": ["l-u1l1-n-3f9a1c2b.mp3", 13.01, 0.39] }`.

`playClip` (`audio.js:94-139`) resolve `manifest -> sprites -> buffer` sem mudar uma linha; só o fallback `playFile()` (que faria `new Audio("audio/w/…")`) é desativado quando `sprites.json` existe. Assim o app atual toca o áudio v2 no mesmo dia da regeneração.

---

## 7. Dicionário de pronúncia

### 7.1 Formato e regras

- Arquivo `tools/pronunciation.pls` (PLS 1.0, `alphabet="ipa"`, `xml:lang="en-US"`), uma `<lexeme>` por nome com `<grapheme>`, `<phoneme>` (IPA, documental) e `<alias>` (respelling em inglês, o que o `eleven_multilingual_v2` usa de fato).
- `alias` funciona em todos os modelos; `phoneme` (IPA ou CMU) só em `eleven_flash_v2`, `eleven_turbo_v2` e `eleven_monolingual_v1`. Por isso o padrão é `alias`, e `phoneme` fica no arquivo como referência de revisão. Para o A/B com `eleven_v3`, confirmar na Fase 0 com uma requisição se o modelo aceita `pronunciation_dictionary_locators`.
- Aliases sem espaço (hífens entre sílabas, maiúsculas na tônica) para preservar a contagem de tokens no mapeamento (seção 6.2).
- Upload: `POST /v1/pronunciation-dictionaries/add-from-file` (multipart com o PLS) -> `{ id, version_id }`, guardados em `voices.json.dictionary` junto com `ver` (inteiro que sobe a cada edição). `ver` entra no hash dos clipes que contêm nomes do dicionário; os demais não mudam. Substitui `add-from-rules` e o cache `tools/.pron-dict.json` (`gen-audio.mjs:93,300-319`).
- No app, "LORD" (KJV em maiúsculas) e "Yahweh" (WEB) são exibidos e enviados como "the Lord" pelo próprio conteúdo (decisão do dono no CONTENT SPEC V2); o dicionário tem a regra "Yahweh" -> "the-LORD" só como rede de segurança.

### 7.2 Lista (nomes presentes no conteúdo atual e previstos no CONTENT SPEC V2; frequência atual entre parênteses)

Nomes de pronúncia inglesa óbvia e já estável no modelo não precisam de regra (David 35, Daniel 31, Peter 13, John 6, Simon 5, James 4, Andrew 4, Benjamin 4, Jacob 4, Eden 3, Martha 3, Jonathan 3, Eve 2, Adam, Mary, Ruth, Esther, Sarah, Thomas, Timothy, Lydia, Hannah, Elizabeth, Abigail, Jordan, Babylon, Egypt, Israel, Jerusalem, Bethlehem, Zion). Os seguintes entram no PLS:

| Grafema | IPA (GA) | Alias |
|---|---|---|
| Joseph (46) | /ˈdʒoʊzəf/ | JOE-zef |
| Noah (29) | /ˈnoʊə/ | NO-uh |
| Moses (25) | /ˈmoʊzɪz/ | MO-ziz |
| Jesus (23) | /ˈdʒiːzəs/ | JEE-zus |
| Isaiah (10) | /aɪˈzeɪə/ | eye-ZAY-uh |
| Immanuel (9) | /ɪˈmænjuəl/ | Im-MAN-you-el |
| Samuel (7) | /ˈsæmjuəl/ | SAM-you-el |
| Goliath (5) | /ɡəˈlaɪəθ/ | guh-LY-uth |
| Saul (4) | /sɔːl/ | SAWL |
| Jesse (4) | /ˈdʒɛsi/ | JESS-ee |
| Potiphar (4) | /ˈpɑːtəfɑːr/ | POT-ih-far |
| Egyptians (4) | /ɪˈdʒɪpʃənz/ | ee-JIP-shunz |
| Darius (3) | /dəˈraɪəs/ | duh-RY-us |
| Zebedee (3) | /ˈzɛbədi/ | ZEB-uh-dee |
| Ararat (2) | /ˈærəræt/ | AIR-uh-rat |
| Gath (2) | /ɡæθ/ | GATH |
| Ahaz (2) | /ˈeɪhæz/ | AY-haz |
| Ishmaelites (2) | /ˈɪʃmiəlaɪts/ | ISH-mee-uh-lites |
| Belteshazzar (2) | /ˌbɛltəˈʃæzər/ | bel-tuh-SHAZZ-er |
| Nebuchadnezzar (2) | /ˌnɛbjəkədˈnɛzər/ | neb-yuh-kud-NEZZ-er |
| Shadrach (2) | /ˈʃædræk/ | SHAD-rak |
| Meshach (2) | /ˈmiːʃæk/ | MEE-shak |
| Abednego (2) | /əˈbɛdnɪɡoʊ/ | uh-BED-nih-go |
| Mene (2) | /ˈmiːni/ | MEE-nee |
| Tekel (1) | /ˈtɛkəl/ | TEK-el |
| Parsin (1) | /pɑːrˈsiːn/ | par-SEEN |
| Aaron (1) | /ˈɛrən/ | AIR-un |
| Miriam (1) | /ˈmɪriəm/ | MEER-ee-um |
| Uzziah (1) | /əˈzaɪə/ | uh-ZY-uh |
| Seraphim (1) | /ˈsɛrəfɪm/ | SAIR-uh-fim |
| Medes (1) | /miːdz/ | MEEDZ |
| Zacchaeus (1) | /zæˈkiːəs/ | za-KEE-us |
| Bartimaeus | /ˌbɑːrtəˈmeɪəs/ | bar-tih-MAY-us |
| Mephibosheth (1) | /məˈfɪbəʃɛθ/ | muh-FIB-oh-sheth |
| Goshen (1) | /ˈɡoʊʃən/ | GO-shen |
| Chaldeans (1) | /kælˈdiːənz/ | kal-DEE-unz |
| Elijah (1) | /ɪˈlaɪdʒə/ | ee-LY-juh |
| Elisha | /ɪˈlaɪʃə/ | ee-LY-shuh |
| Jeremiah (1) | /ˌdʒɛrəˈmaɪə/ | jair-uh-MY-uh |
| Galilean (1) | /ˌɡælɪˈliːən/ | gal-ih-LEE-un |
| Galilee | /ˈɡælɪliː/ | GAL-ih-lee |
| Nazareth | /ˈnæzərəθ/ | NAZ-uh-reth |
| Capernaum | /kəˈpɜːrniəm/ | kuh-PER-nee-um |
| Gethsemane | /ɡɛθˈsɛməni/ | geth-SEM-uh-nee |
| Magdalene | /ˈmæɡdələn/ | MAG-duh-lun |
| Pharaoh | /ˈfɛroʊ/ | FAIR-oh |
| Philistine, Philistines | /ˈfɪlɪstiːn/ | FIL-ih-steen |
| Judah | /ˈdʒuːdə/ | JOO-duh |
| Sinai | /ˈsaɪnaɪ/ | SY-ny |
| Canaan | /ˈkeɪnən/ | KAY-nun |
| Jericho | /ˈdʒɛrɪkoʊ/ | JAIR-ih-ko |
| Hezekiah | /ˌhɛzɪˈkaɪə/ | hez-uh-KY-uh |
| Nehemiah | /ˌniːəˈmaɪə/ | nee-uh-MY-uh |
| Ezekiel | /ɪˈziːkiəl/ | ee-ZEE-kee-ul |
| Nineveh | /ˈnɪnɪvə/ | NIN-uh-vuh |
| Tarshish | /ˈtɑːrʃɪʃ/ | TAR-shish |
| Joppa | /ˈdʒɑːpə/ | JOP-uh |
| Naomi | /neɪˈoʊmi/ | nay-OH-mee |
| Boaz | /ˈboʊæz/ | BO-az |
| Rebekah | /rɪˈbɛkə/ | rih-BEK-uh |
| Mordecai | /ˈmɔːrdɪkaɪ/ | MOR-duh-ky |
| Haman | /ˈheɪmən/ | HAY-mun |
| Deborah | /ˈdɛbərə/ | DEB-er-uh |
| Barak | /ˈbɛəræk/ | BAIR-ak |
| Gideon | /ˈɡɪdiən/ | GID-ee-un |
| Samson | /ˈsæmsən/ | SAM-sun |
| Caleb | /ˈkeɪləb/ | KAY-lub |
| Joshua | /ˈdʒɑːʃuə/ | JOSH-oo-uh |
| Solomon | /ˈsɑːləmən/ | SOL-uh-mun |
| Abraham | /ˈeɪbrəhæm/ | AY-bruh-ham |
| Isaac | /ˈaɪzək/ | EYE-zuk |
| Barnabas | /ˈbɑːrnəbəs/ | BAR-nuh-bus |
| Nathanael | /nəˈθænjəl/ | nuh-THAN-yul |
| Philippi | /fɪˈlɪpaɪ/ | fih-LIP-eye |
| Zarephath | /ˈzærɪfæθ/ | ZAIR-uh-fath |
| Samaria | /səˈmɛriə/ | suh-MAIR-ee-uh |
| Nabal | /ˈneɪbəl/ | NAY-bul |
| Naamah | /ˈneɪəmə/ | NAY-uh-muh |
| Zabad | /ˈzeɪbæd/ | ZAY-bad |
| Rhoda | /ˈroʊdə/ | RO-duh |
| Aspenaz | /ˈæspənæz/ | ASS-puh-naz |
| Belshazzar | /bɛlˈʃæzər/ | bel-SHAZZ-er |
| Jonah, Jonas (1) | /ˈdʒoʊnə/ | JO-nuh |
| Yahweh | (exibido como "the Lord") | the-LORD |

A audição de nomes (`--only=names`, estendido para todos os grafemas do PLS, 1 clipe por nome na voz do narrador, ~1,5 mil créditos) é obrigatória a cada mudança de `ver`.

---

## 8. Normalização de volume

### 8.1 Alvo

Fala a **-16 LUFS integrado** (medição mono), pico real **-1,5 dBTP**, LRA <= 7. Efeitos sonoros do app (acerto, erro, conclusão) a -18 LUFS. Por que -16 e não -18: o app é ouvido em alto-falante de celular, muitas vezes em ambiente ruidoso; -16 LUFS é a recomendação da Apple para conteúdo falado em dispositivos móveis e é o alvo que `cut-words.mjs:34` e `build-sprites.mjs:20` já usam; -18 obrigaria o aluno a subir o volume do aparelho e perderia margem para os efeitos.

### 8.2 Método (em PCM, dentro de `build-sprites.mjs`)

1. **Ganho por voz:** concatenar todos os masters da mesma `voice_id` (normal e lento), medir `ebur128` integrado (`ffmpeg -af ebur128=peak=true -f null -`), `ganhoVoz = -16 - I_voz`. Mantém a dinâmica natural do personagem (o Faraó continua mais alto que Mefibosete, mas dentro de uma janela).
2. **Ajuste por clipe:** para clipes >= 3 s, medir I do clipe já com o ganho da voz e aplicar correção limitada a ±3 dB; clipes < 3 s (palavras, nomes, falas curtas) não têm medida integrada confiável e recebem só o ganho da voz.
3. **Limiter:** `alimiter=limit=0.84` (-1,5 dBTP) com `attack=5`, `release=50`, depois do ganho.
4. **Registro:** `qa-report.json` guarda `I`, `TP` e `LRA` de cada clipe; falha se `|I - (-16)| > 2` (clipes >= 3 s) ou `TP > -1`.

Isso substitui o `loudnorm=I=-16:TP=-1.5:LRA=11` por clipe (`build-sprites.mjs:20,35`), que em clipes curtos é impreciso e achata diferenças de humor, e resolve a variação de 11 dB medida hoje (-27,7 LUFS em "lifted" do narrador a -16,3 LUFS no Faraó com pico +0,3 dBTP).

### 8.3 Efeitos de ambiente (`fx` em `voices.json`)

- `reverb-lord` (voz do Senhor): `aecho=0.8:0.6:60|120:0.25|0.12` (duas reflexões curtas) seguido de `lowpass=f=9000`; aplicado ao master decodificado antes do ganho. Nada de pitch shift: o timbre grave vem da escolha de Adam, sem artefatos de time stretch.
- `reverb-light` (anjo): `aecho=0.8:0.7:40:0.15`.
- `whisper-pad` (`mood: sussurrando` no v2): ganho adicional -3 dB.

### 8.4 "O povo" (multidão)

As 4 falas de `povo` (`c-moises-6`) são geradas duas vezes, com Paul e Patrick (mesmos settings, ~200 caracteres a mais), e mixadas: `[1]adelay=20|20,volume=-6dB[b];[0][b]amix=inputs=2:normalize=0`. O alinhamento usado nos offsets é o da primeira voz. Hoje "o povo" é Brian, a mesma voz do narrador.

---

## 9. Prosódia consistente

- **`previous_text` / `next_text`** (já em `gen-audio.mjs:342-343`): fala anterior e seguinte da mesma cena, história ou conversa; para frases de lição v2, o beat anterior e o seguinte na ordem narrativa (`beats[order-1]`, `beats[order+1]`); para opções de resposta, a pergunta como `previous_text`. Só texto em inglês do mesmo roteiro. Premissa a confirmar na documentação de cobrança antes da Fase 2: o texto de contexto não é sintetizado e não deve ser cobrado como áudio; o dry-run reporta os caracteres de contexto separadamente para conferência com `GET /v1/user/subscription` antes e depois da Fase 1.
- **Request stitching:** para beats de história e falas de cena, enviar `previous_request_ids` com até 3 `request-id` das falas anteriores da mesma voz na mesma cena ou história, na ordem em que foram geradas. Isso obriga a geração sequencial dentro de cada cena por voz: a fila do gerador agrupa por `(grupo, voz)` e processa cada grupo em ordem, com os 8 workers distribuídos entre grupos diferentes.
- **Listas pontuadas** para palavras e opções curtas: a prosódia de citação ("Heaven. Earth. Light.") elimina as frases declarativas isoladas de uma palavra ("created", "loved", "said").
- **Seed por personagem** (3.1) e settings por tipo (3.2) completam a consistência: a mesma voz, nas mesmas condições, para todas as falas de um personagem.

---

## 10. Idempotência, migração e orçamento

### 10.1 Hash v2

```
id = sha1(`${SPEC_VER}|${textoOriginal}|${voice_id}|${model}|${output_format}|${JSON(settingsEfetivos)}|${variant}|${dictVer}|${seed}`).slice(0, 16)
```

- `SPEC_VER = 2` (sobe quando o próprio contrato do pipeline muda).
- `textoOriginal` = texto trimado com espaços colapsados, **com pontuação**: "Come and see" e "Come and see!" viram clipes distintos (hoje `audioKey` em `gen-audio.mjs:95` funde os dois e vence o primeiro encontrado, perdendo a entonação exclamativa). A chave de busca do app (`audioKey`) continua sem pontuação; o índice guarda a lista de `id` por chave e o pack escolhe o que vem do texto exato quando há mais de um.
- `settingsEfetivos` = perfil do tipo já ajustado por `mood` (3.3).
- `variant` ∈ {`n`, `s`}; `dictVer` só quando o texto contém um nome do dicionário (senão `0`), para não regenerar o curso inteiro a cada nome novo.

### 10.2 Manifesto v2 (`.masters/manifest.json`, fora do git, junto dos masters)

```json
{
  "v": 2, "specVer": 2, "built": "2026-10-10T14:03:00Z",
  "clips": {
    "3f9a1c2b4d5e6f70": {
      "text": "Follow me, and I will make you fishers of men.", "key": "follow me and i will make you fishers of men",
      "char": "jesus", "voice": "eric", "voice_id": "cjVigY5qzO86Huf0OWal", "model": "eleven_multilingual_v2",
      "format": "mp3_44100_192", "kind": "sentence", "variant": "n", "mood": null,
      "settings": { "stability": 0.6, "similarity_boost": 0.85, "style": 0.1, "use_speaker_boost": true, "speed": 1 },
      "seed": 2318, "dictVer": 0, "requestId": "…", "groups": ["u8l1", "c-jesus-1"],
      "bytes": 68211, "dur": 2.84, "align": "alignment",
      "qa": { "msPerChar": 61, "coverage": 0.93, "I": -16.4, "TP": -2.1, "ok": true, "attempts": 1 }
    }
  }
}
```

O manifesto é a verdade para `--respec` (lista o que mudaria de spec sem gerar), para o `pack` (sabe a que grupos cada clipe pertence) e para auditoria (qual voz, quais settings, qual dicionário gravou cada clipe).

### 10.3 Regenerar tudo ou só o novo

- Qualquer mudança em texto, falante, voz, modelo, formato, settings, `mood`, variante, `dictVer` ou `SPEC_VER` muda o `id` e só esses clipes voltam à fila. `node tools/gen-audio.mjs --dry` imprime a fila e o custo; `--respec` imprime, por clipe pendente, o motivo (campo que mudou).
- Os masters antigos permanecem até o `pack` confirmar que o novo passou no QA; só então o clipe velho é removido do manifesto e do Release.
- Mudança de voz de um personagem regenera todos os seus clipes (normal e lento); o lint avisa o custo antes.
- O `pack` reconstrói só os sprites de grupos com clipes alterados (o nome do sprite é o hash do seu conteúdo); o índice é sempre reescrito (hash novo, 60 bytes de ponteiro).

### 10.4 Plano de migração

| Fase | Duração | Créditos | Entregas e critérios |
|---|---|---|---|
| 0. Casting | 1 dia | ~5 mil | `tools/voices.json` com a seção 2; `--lint` passa (0 colisões); 10 vozes da Library validadas por `GET /v1/voices/{id}`; `--audition` gera `audition/index.html` (nome + 2 frases por voz, 90 nomes do PLS); o dono ouve e marca `locked: true` por papel; `pronunciation.pls` enviado (`id`, `version_id`, `ver: 1`) |
| 1. Piloto u1 | 2 dias | ~4 mil | pipeline V2 numa branch; `--only=unit:u1` (3 lições + 6 cenas + história s1, normal e lento, listas, QA, sprites por grupo, índice); app com feature flag `audio.v2` lendo o índice; medir no Playwright: toque quente < 30 ms, toque frio < 300 ms, 0 chamadas a `speechSynthesis` em texto do índice, I de 40 clipes dentro de ±2 dB |
| 2. Regeneração completa | meio dia | ~90 mil | `workflow_dispatch` sem filtros, 8 workers (~12 a 16 min de geração para ~2 600 requisições + ~60 listas); QA bloqueia o commit se houver clipe reprovado; masters no Release `audio-masters`; commit só de `audio/sprites/` e `audio/index*.json` (+ os três JSON de compatibilidade) |
| 3. Corte do legado | 1 dia | 0 | app usa só o índice v2; `features.js` (app clássico) idem ou é desligado; remoção de `audio/*.mp3`, `audio/words/`, `manifest.json`, `words.json`, `words-index.json`, `sprites.json`, `tools/.pron-dict.json`, `tools/.voices-assigned.json`; `docs/AUDIO.md` reescrito |
| Contínuo | | | conteúdo v2 por lotes de unidade (CONTENT SPEC V2); A/B do `eleven_v3` nas histórias com `--model=eleven_v3 --only=stories` sem tocar no resto |

### 10.5 Orçamento de créditos (1 crédito por caractere; Pro = 500 mil por mês, 10 requisições simultâneas)

| Parcela | Caracteres | Observação |
|---|---|---|
| Conteúdo atual, variante normal (dry-run) | 47 207 | inclui 1 689 do versículo com "blank" e ~1 100 de palavras isoladas |
| Menos versículo com lacuna (6.6) | -1 689 | |
| Menos palavras isoladas uma a uma; mais listas pontuadas do narrador para ~150 palavras sem recorte | -1 100 + 1 000 | |
| Variantes lentas por tipo (5.1): frases 10 207 + falas de cena 16 499 + leituras 4 230 + versículos 1 689 + diálogos 671 + respostas de diálogo 1 509 + beats 1 837, x1,07 de duplicatas por personagem | ~39 200 | |
| "O povo" em duas vozes, audições de cena para A/B v3 | ~700 | |
| Subtotal regeneração | **~85 300** | |
| QA: regeneração de ~10% com seed nova | ~8 500 | |
| Fase 0: audição de vozes e nomes | ~5 000 | |
| **Total V2 com o conteúdo atual** | **~99 mil** | ~20% de um mês do Pro |
| Conteúdo v2 (CONTENT SPEC: 12 beats e 2 dicas por lição, conversas de 4 turnos, histórias de 120 a 200 palavras, 12 cenas novas): +40% | **~135 mil** | sobra margem para 2 regenerações completas no mesmo mês |

Tempo: ~2 600 requisições a ~2 a 3 s com 8 workers = 11 a 16 min; QA com STT opcional adiciona ~10 min.

---

## 11. Mudanças concretas arquivo a arquivo

### 11.1 `tools/voices.json` (novo; substitui `VOICES`, `VOICE_BY_CHAR`, `SCENE_EXTRAS[*].voice`, `.voices-ok.json` por apelido e `.voices-assigned.json`)

Esquema no Anexo A. `SCENE_EXTRAS` em `scenes.js`/`scenes2.js` perde o campo `voice` (fica `name`, `gender`, `emoji`); o merge do CONTENT SPEC V2 pode gerar `UNIT_CAST` a partir de `course.json`, e o gerador lê o casting só de `voices.json`.

### 11.2 `tools/gen-audio.mjs`

Mantém o que o HEAD já faz bem (`/with-timestamps`, `~slow`, `alignment`/`normalized_alignment`, limpeza de órfãos, `--dry`, `--mock`). Muda:

```
const SPEC_VER = 2, OUTPUT_FORMAT = "mp3_44100_192", CONCURRENCY = 8
const MASTERS = process.env.AUDIO_MASTERS || path.join(ROOT, ".masters")
const V = JSON.parse(read("tools/voices.json"))           # (a) casting, pools, seeds, fx, dicionário

# (b) coleta com falante declarado; falha sem `who`
coletar():
  para cada lição v2: narrator = l.narrator
    beats: add(b.en, b.speaker || narrator, "sentence", { prev: beats[i-1].en, next: beats[i+1].en, group: l.id, mood: b.mood })
    verse.text: add(..., narrator, "verse", { group: l.id })            # sem versão "blank"
    reading.text: add(..., narrator, "story"); reading.questions[*].q: add(..., narrator, "question")
    conversation.turns: who === "you" ? cada option como "line" na voz do narrador da lição (o aluno fala pelo narrador) : add(t.en, t.who, "line", { prev, next, mood })
    vocab: lista pontuada por (voz do narrador): addList(vocab.map(v => v.en), narrator, group l.id)
    opções de 1 palavra (verse.blanks[*].options, quiz/reading options curtas): addList(..., narrator)
  para cada lição legada (data.js, até a migração do conteúdo): mesmo esquema com narrator = UNIT_CAST[u][0] e `who` ausente = narrador; o sorteio `castCharFor` é removido
  cenas: add(l.en, l.who, "line", { prev, next, group: s.id, mood: l.mood }); addList(s.vocab, s.char, group s.id)
  histórias: add(b.en, b.who || storyNarrator(s), "story", { prev, next, group: s.id, mood }); perguntas e opções como "question"/word-list na voz do narrador da história
  nomes: add(name, char, "name", { group: "core" })
  palavras sem recorte em nenhuma voz: addList(restantes, "narrator", group "core")   # calculado a partir dos alinhamentos existentes
  lançar erro listando toda fala/beat/turno sem `who` resolvível (AP-05, AP-27)

# (c) perfil e settings
profile(kind) -> tabela 3.2; applyMood(settings, mood) -> 3.3; settingsSig = JSON estável

# (d) listas pontuadas
addList(items, char, group): fatiar em blocos de até 40 itens; text = items.map(cap).join(". ") + "."; kind "word-list"; cada item vira palavra por offset no pack (tokens com espaço, ex. "to create", são mapeados pelo intervalo de caracteres do item, não por token)

# (e) hash
clipId(job, variant) = sha1([SPEC_VER, job.text, voice.id, MODEL, OUTPUT_FORMAT, settingsSig, variant, hasName(job.text) ? V.dictionary.ver : 0, seed].join("|")).slice(0, 16)

# (f) requisição com stitching, backoff honrando retry-after
request(job):
  body = { text, model_id, voice_settings, seed, apply_text_normalization: "on", previous_text?, next_text?, previous_request_ids?: últimos 3 da mesma (grupo, voz), pronunciation_dictionary_locators? }
  for tentativa 1..6:
    res = POST `${API}/text-to-speech/${voice.id}/with-timestamps?output_format=${OUTPUT_FORMAT}`
    if 429 || 5xx: espera = res.headers["retry-after"] ? s*1000 : min(30000, 1000 * 2**tentativa) + jitter(0..500); continue
    if ok: data.requestId = res.headers.get("request-id"); return data
  fila agrupada por (grupo, voz) para manter a ordem do stitching; 8 workers pegam grupos distintos

# (g) salvar master + alinhamento + QA
gen(job):
  data = request(job); buffer = base64 -> .masters/<id>.mp3 (bytes intactos); align -> .masters/<id>.json
  qa = qaCheck(job, buffer, align)   # 6.5: duração/char, cobertura, tokens
  if !qa.ok && tentativa < 3: seed += 1; repetir; senão report.failed.push(...)
  manifest.clips[id] = { ...spec, requestId, bytes, dur, align: source, qa }
  a cada 10 clipes: gravar manifest

# (h) validação de voz
GET ${API}/voices/${id} para cada voz usada; cache .voices-ok.json por id; 404 => erro no lint

# (i) flags
--lint | --audition | --only=names|stories|scenes|unit:u4|lesson:u1l1 | --respec | --model=eleven_v3 | --qa=stt | --dry | --mock | --limit=N
```

### 11.3 `tools/cut-words.mjs` (substituto do antigo `align-words.py`; já existe, muda de papel)

Deixa de gravar arquivos. Passa a ser um módulo (`export function wordSpans(align, totalDur, slowAlign?, listSpans?)`) que devolve `[ { tok, i0, i1, start, dur, source: "n" | "s" | "list", short: bool } ]` aplicando 6.2 e 6.3. É chamado pelo `build-sprites.mjs` (que já tem o PCM e o `trimStart`) e pelo QA. `ALIGN_VER` vira `CUT_VER = 6` e entra no hash do índice (não dos masters): mudar a regra de corte reescreve o índice sem regenerar nada no ElevenLabs.

### 11.4 `tools/build-sprites.mjs`

```
masters = .masters/manifest.json (só clips com qa.ok)
grupos = agrupar clips por groups[] (um clipe pode cair em vários)      # l-<lição>-n, l-<lição>-s, c-<cena>, s-<história>, core
ganhoVoz = por voice_id: ebur128 do concat dos masters da voz (8.2)
para cada grupo (paralelo 4):
  pcm[] = decodificar cada master uma vez: trim (-45 dB, 20 ms / 100 ms) + fx + ganho + limiter -> s16le 44,1 kHz mono; registrar trimStart
  concatenar com GAP de 60 ms (2 646 amostras); offsets em segundos com 3 casas
  codificar uma vez: ffmpeg -f s16le -ar 44100 -ac 1 -i - -codec:a libmp3lame -b:a 128k -compression_level 2 (CBR)
  nome = `${grupo}-${sha1(pcm).slice(0,8)}.mp3`; só reescreve se o nome mudou
  palavras: spans = wordSpans(align, dur, alignSlow, listSpans) com start ajustado por trimStart; gravar em index.clips[...].w
index = { v: 2, specVer, cutVer, built, sprites, clips, default, groups }   # Anexo B
gravar audio/index-<sha1(index).slice(0,8)>.json e audio/index.json; apagar índices antigos
compat (até a Fase 3): derivar manifest.json, words.json, sprites.json (6.7)
qa-report.json: loudness por clipe, cortes curtos, "alignment-divergente", falhas
```

### 11.5 `.github/workflows/gen-audio.yml`

```yaml
on:
  workflow_dispatch:
    inputs: { only: "", respec: "false", model: "eleven_multilingual_v2", qa: "basic" }   # qa: basic | stt
concurrency: { group: gen-audio-${{ github.ref_name }}, cancel-in-progress: false }
jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - checkout; setup-node 20; apt ffmpeg
      - name: Restaurar masters do Release        # gh release download audio-masters -p 'audio-masters.tar.zst' || true; tar -xf -C biblelingo/.masters
      - name: Lint do elenco                      # node tools/gen-audio.mjs --lint  (sem créditos; falha = fim)
      - name: Gerar (8 workers) + QA              # node tools/gen-audio.mjs --only=$ONLY --model=$MODEL --qa=$QA ; continue-on-error: true
      - name: Guardar masters                     # upload-artifact masters-${{ run_id }} (biblelingo/.masters), retention 30
      - name: Publicar masters no Release         # tar --zstd; gh release upload audio-masters --clobber
      - name: Falhar se o QA reprovou             # if steps.gen.outcome == 'failure'
  pack:
    needs: generate
    steps:
      - checkout; setup-node 20; apt ffmpeg; download-artifact masters-${{ run_id }}
      - name: Sprites + índice                    # node tools/build-sprites.mjs
      - name: Validar                             # node tools/audio-check.mjs (12.1)
      - name: Commit                              # git add biblelingo/audio/sprites biblelingo/audio/index*.json biblelingo/audio/qa-report.json (+ manifest/words/sprites.json até a Fase 3); rebase; push
```

Por que não uma matriz por unidade no `generate`: o limite de 10 requisições simultâneas é da conta, não do job; 8 jobs com 8 workers cada só multiplicariam os 429. Um job com 8 workers ocupa o limite com margem. `git pull --rebase -X theirs` fica, mas agora só toca arquivos gerados (sprites e índice), sem risco para código.

### 11.6 `app/src/core/audio.js`

```
AUDIO = { index: null, buffers: Map<spriteId, { promise, buf, dur, pinned }>, ctx, curSrc, curGain, playToken, decodedSeconds }

loadAudioIndex():
  ptr = fetch("audio/index.json", { cache: "no-cache" }); idx = fetch(`audio/${ptr.file}`)   # imutável
  expandir: clipsByKey = Map(key -> { char -> { n: loc, s: loc } }); wordsByTok = Map(`${tok}|${char}` -> [loc...]); default = idx.default

unlockAudio(): uma vez, em pointerdown/keydown no window: ctx = new AudioContext(); await ctx.resume()
   (hoje `audio.js:121` chama `resume()` sem await dentro do clique; no iOS, se falhar, o clipe some em silêncio)

preloadGroup(groupId): para cada sprite de idx.groups[groupId]: fetch (SW cache) + decodeAudioData; pinned = true
warmGroups(ids): requestIdleCallback -> fetch sem decodificar
evict(): enquanto decodedSeconds > 420 e houver buffer não fixado: remover o menos recente

resolve(text, char, slow):
  e = clipsByKey.get(audioKey(text)); c = (char && e[char]) ? char : default[key]; loc = e[c][slow ? "s" : "n"]
  se locs múltiplos: preferir o sprite já decodificado, depois o em carregamento, depois o primeiro

play(loc, { fadeIn = 0.006, fadeOut = 0.025, mute = [] }):
  src = ctx.createBufferSource(); src.buffer = buf; src.playbackRate.value = 1
  g = ctx.createGain(); rampas 6 ms / 25 ms; para cada [a, b] em mute: g.gain para 0 com rampa 10 ms em [a-0.02, b+0.02]
  src.connect(g).connect(ctx.destination); src.start(0, loc.start, loc.dur)
  src.onended = () => { if (token === playToken) emitSpeakEnd(text) }   # animação acaba com o áudio real (AP-23)

speak(text, { char, slow, word })      # word = palavra tocada dentro da frase (Sayable, WordBank, Match)
  se word: loc = wordsByTok(`${audioKey(word)}|${char.key}`) || default do narrador; play(loc)
  senão se slow && !loc.s: montar por palavras com 180 ms (5.3)
  senão play(loc)
  emitSpeak(text, duraçãoReal)

speakVerseWithGaps(text, char, blanks[]): offsets das palavras das lacunas -> play(loc, { mute }) + tom 660 Hz 300 ms (6.6)

speechSynthesis: só quando audioKey(text) não está no índice (dicas dinâmicas); texto do curso sem clipe mostra o estado "áudio indisponível" (toast) e tenta recarregar o índice uma vez
```

Exposição em DEV: `window.__audio = { lastLatencyMs, lastLoc, decodedSeconds, synthCalls }` para os testes e2e (12.3).

### 11.7 Componentes (`app/src/components`)

- `exercises/Sayable.jsx:12`: `speak(ex.sentence.en, { char, word: w })` em vez de `speak(w)`; o personagem é o da frase (`ex.char` ou `currentChar`).
- `exercises/WordBank.jsx:33,40`: toque na peça -> `speak(ex.sentence.en, { char, word: words[i] })`; peças distratoras (que não estão na frase) -> `speak(words[i], { char })` cai no `default` por palavra.
- `exercises/Match.jsx:27`, `screens/Madness.jsx:63`: `speak(item.label, { char: lessonHero })` (itens de vocabulário vêm da lista pontuada do herói).
- `exercises/Choice.jsx:108`: opções com `char` do narrador da lição; versículo com lacuna -> `speakVerseWithGaps`.
- `exercises/AudioButton.jsx:6-16`: `usePlaying` passa a ouvir `onSpeak`/`onSpeakEnd` em vez de um `setTimeout` com duração estimada; `SlowButton` nunca divide por 0,75.
- `scenes/*.jsx` já passam `char` na maioria dos toques; `SceneBuild.jsx:66,90` e `SceneMissing.jsx:43` passam a enviar `{ char: hero, word }`.
- `screens/LessonIntro` (folha do nó) chama `preloadGroup(lessonId)`; `SceneIntro` e `Story` chamam `preloadGroup(sceneId | storyId)`; a trilha chama `warmGroups` para os 2 próximos nós.

### 11.8 `tools/content/SPEC.md` e `tools/content/validate.js`

- `who` obrigatório em toda fala de cena (`lines[*].who`), beat de história (`who` ou `null` explícito = narrador da história), turno de conversa e `speaker` opcional em beats de lição (padrão `narrator`); `mood` opcional da lista de 12.
- `validate.js --scenes --stories`: falha se `who` faltar ou não existir em `CHARACTERS`, `SCENE_EXTRAS` ou `voices.json.cast`; falha se `mood` estiver fora da lista; avisa fala com mais de 12 palavras (prosódia e recorte pioram).
- Regra nova no bloco de áudio: todo nome próprio em `names` de uma lição deve existir no PLS ou na lista de "pronúncia óbvia" (7.2); senão aviso "nome sem regra de pronúncia".

### 11.9 `docs/AUDIO.md`

Reescrever a partir desta spec: como rodar (Fase 0 a 3), tabela de arquivos (4.2), casting (link para `voices.json`), custos (10.5), audição, e a frase que hoje está errada ("modelo padrão eleven_flash_v2_5 (0,5 crédito; ~14 mil caracteres)"): o modelo é `eleven_multilingual_v2` e o conteúdo tem 47 mil caracteres.

### 11.10 `features.js`, `app.js` (app clássico)

Até a Fase 3, o app clássico continua lendo `manifest.json`, `words.json` e `sprites.json` derivados do índice (6.7) e funciona sem mudanças. Na Fase 3, ou recebe o mesmo loader do índice (porte de `audio.js`), ou é descontinuado junto com os arquivos legados; a decisão é do dono e não bloqueia o app React.

---

## 12. Plano de validação

### 12.1 Verificações automáticas (`tools/audio-check.mjs`, roda no job `pack` e localmente)

| Verificação | Comando ou regra | Critério |
|---|---|---|
| Formato dos masters | `ffprobe -show_entries stream=sample_rate,bit_rate,channels` em 20 amostras | 44 100 Hz, mono, 192 kbps |
| Formato dos sprites | idem em todos os sprites | 44 100 Hz, mono, 128 kbps CBR; duração <= 150 s |
| Loudness | `ffmpeg -af ebur128=peak=true -f null -` em 40 clipes aleatórios recortados do sprite pelos offsets | I = -16 ± 2 LUFS (clipes >= 3 s); TP <= -1 dBTP em 100% |
| Silêncios | `silencedetect=n=-40dB:d=0.1` nas pontas de 20 clipes | inicial <= 60 ms, final <= 150 ms |
| Cobertura do conteúdo | toda chave de `data.js`, `scenes.js`, `scenes2.js`, `stories.js` (e `content/*.json` v2) com `n` no índice; toda frase com `s` | 100%; lista de faltas no relatório |
| Palavras | toda palavra de frase, fala do herói e vocabulário com offset na voz do personagem; nenhum corte < 180 ms sem marca `short`; soma dos spans entre 60% e 100% da duração do clipe | 100%, `short` <= 1% |
| Índice | tamanho do `index-*.json` e do gzip; nenhum sprite órfão em `audio/sprites/`; `index.json` aponta para arquivo existente | <= 400 KB bruto |
| Alinhamento divergente | contagem de `source !== "alignment"` | <= 5% dos clipes; cada caso listado |
| QA do gerador | `qa-report.json.failed` | vazio (senão o job já falhou) |

### 12.2 Amostras para o ouvido

- `audition/index.html` (Fase 0): nome + 2 frases por voz; 90 nomes do PLS na voz do narrador; o dono marca "aprovar/rejeitar" e as notas vão para `voices.json`.
- Folha de 60 clipes aleatórios após a Fase 2 (`node tools/audio-check.mjs --sheet`): 20 frases, 20 palavras recortadas (ouvidas isoladas e dentro da frase), 10 variantes lentas, 10 falas de cena com `mood`; checagem de clique no início/fim, sibilantes, pronúncia de nomes, volume igual entre vozes.
- Comparação A/B v3 nas 8 histórias (`--model=eleven_v3 --only=stories`): mesma folha, escolha por história.

### 12.3 E2E com Playwright (`app/scripts/e2e-audio.mjs`, novo; usa o driver de `app/scripts/e2e-course.mjs` e os seletores `[data-node]`, `[data-opt]`, `button[data-tile]`, `[data-side]`, `footer button.btn-3d`)

1. Abrir u1l1 em 390 x 844, tema escuro e claro; esperar `preloadGroup` (`window.__audio.decodedSeconds > 0`).
2. Em cada exercício, clicar no alto-falante e medir `window.__audio.lastLatencyMs` (de `pointerdown` ao `src.start`): p95 < 30 ms a quente; primeiro toque de um grupo não pré-carregado < 300 ms (desktop).
3. Tocar em 10 palavras de frases do herói (Sayable, banco de palavras): `lastLoc.char === hero` em 100% (hoje "follow" na frase de Jesus toca a voz de Brian).
4. Botão "Devagar": `lastLoc.variant === "s"` e `playbackRate === 1`; duração reportada = duração do índice.
5. Versículo com lacuna: `mute.length === blanks.length`; nenhum clipe com texto "blank" no índice.
6. `speechSynthesis.speak` instrumentado: 0 chamadas durante a lição inteira (texto do curso) em `window.__audio.synthCalls`.
7. Simular rede 4G (`page.route` com atraso de 150 ms e 4 Mbps): a intro da lição termina com o sprite normal decodificado antes do primeiro exercício.
8. Rodar `e2e-course.mjs` completo (todas as lições e cenas) com áudio mutado para garantir que nenhum texto fica sem clipe (`window.__audio.missing` vazio).

### 12.4 Critério de pronto para cada fase

Fase 0: lint 0 erros, 36 vozes validadas, audição aprovada. Fase 1: 12.1 e 12.3 verdes para u1; loudness e latência dentro do alvo. Fase 2: 12.1 verde para o curso inteiro; `qa-report.failed` vazio; Release com masters e manifesto; commit só de sprites e índice. Fase 3: nenhum fetch a `manifest.json`/`words.json`/`sprites.json` no app React; `audio/` com apenas `index*.json`, `sprites/` e `qa-report.json`.

---

## Anexo A: `tools/voices.json` (exemplo reduzido)

```json
{
  "v": 2,
  "accent": "american",
  "dictionary": { "id": "pd_…", "version_id": "pdv_…", "ver": 1, "file": "tools/pronunciation.pls" },
  "voices": {
    "brian":   { "id": "nPczCjzI2devNBz1zQrb", "gender": "m", "age": "middle", "accent": "american", "src": "premade" },
    "adam":    { "id": "pNInz6obpgDQGcFmaJgB", "gender": "m", "age": "middle", "accent": "american", "src": "premade" },
    "eric":    { "id": "cjVigY5qzO86Huf0OWal", "gender": "m", "age": "middle", "accent": "american", "src": "premade" },
    "george":  { "id": "JBFqnCBsd6RMkjVDRZzb", "gender": "m", "age": "middle", "accent": "british", "src": "premade" },
    "L1":      { "id": "…", "public_user_id": "…", "name": "Elderly prophet", "gender": "m", "age": "old", "accent": "american", "src": "library" }
  },
  "pools": {
    "regal": ["clyde", "L2", "drew", "patrick", "paul", "L3", "antoni", "roger"],
    "elder": ["L4", "L1"],
    "everyday-m": ["roger", "paul", "drew", "patrick", "antoni", "sam", "ethan", "L5", "L6"],
    "women": ["matilda", "L9", "laura", "aria", "elli", "emily", "serena", "freya", "L8", "rachel", "L10"]
  },
  "cast": {
    "narrator": { "voice": "brian", "exclusive": true, "seed": 101, "archetype": "40-50, grave, calmo", "locked": true },
    "voice":    { "voice": "adam",  "exclusive": true, "seed": 102, "fx": "reverb-lord", "archetype": "profundo, caloroso" },
    "anjo":     { "voice": "thomas", "exclusive": true, "seed": 103, "fx": "reverb-light" },
    "jesus":    { "voice": "eric",  "exclusive": true, "seed": 104, "alt": "george", "allowAccent": false },
    "samuel":   { "voice": "L1", "exclusive": true, "seed": 112, "fallback": "michael" },
    "pharaoh":  { "voice": "clyde", "pool": "regal", "seed": 201 },
    "povo":     { "voice": "paul", "mix": { "voice": "patrick", "gainDb": -6, "delayMs": 20 }, "seed": 220 },
    "esposa":   { "voice": "L8", "pool": "women", "seed": 230, "fallback": "matilda" }
  }
}
```

## Anexo B: índice v2 (`audio/index-<hash8>.json`, exemplo reduzido)

```json
{
  "v": 2, "specVer": 2, "cutVer": 6, "built": "2026-10-10T14:30:00Z",
  "sprites": {
    "l-u1l1-n-3f9a1c2b": { "file": "sprites/l-u1l1-n-3f9a1c2b.mp3", "bytes": 1398211, "dur": 87.4 },
    "l-u1l1-s-7a0b1c2d": { "file": "sprites/l-u1l1-s-7a0b1c2d.mp3", "bytes": 1710532, "dur": 106.9 },
    "core-9e8d7c6b":     { "file": "sprites/core-9e8d7c6b.mp3", "bytes": 1295000, "dur": 80.9 }
  },
  "groups": { "u1l1": ["l-u1l1-n-3f9a1c2b", "l-u1l1-s-7a0b1c2d"], "u1r": ["l-u1l1-n-3f9a1c2b", "l-u1l2-n-…", "l-u1l3-n-…"], "core": ["core-9e8d7c6b"] },
  "clips": {
    "god created the heaven and the earth|adao|n": { "at": [["l-u1l1-n-3f9a1c2b", 4.354, 2.41]], "w": [[0.00, 0.31], [0.33, 0.52], [0.86, 0.19], [1.05, 0.47], [1.52, 0.20], [1.72, 0.18], [1.90, 0.51]] },
    "god created the heaven and the earth|adao|s": { "at": [["l-u1l1-s-7a0b1c2d", 5.120, 3.02]], "w": [[0.00, 0.39], [0.41, 0.66], [1.09, 0.24], [1.34, 0.58], [1.94, 0.25], [2.19, 0.22], [2.41, 0.61]] },
    "earth|adao|n": { "at": [["l-u1l1-n-3f9a1c2b", 61.20, 0.52]] },
    "jesus|jesus|n": { "at": [["core-9e8d7c6b", 0.00, 0.71]] }
  },
  "default": { "god created the heaven and the earth": "adao", "earth": "adao" }
}
```

`w[i]` é `[início relativo ao clipe, duração]` da i-ésima palavra da chave (tokens da chave na ordem); o app monta `wordsByTok` na carga. Palavras de lista pontuada entram como clipes próprios (`"earth|adao|n"`). `at` tem mais de uma posição quando o texto aparece em vários grupos.

## Anexo C: `audio/qa-report.json` (exemplo)

```json
{
  "built": "2026-10-10T14:30:00Z", "clips": 3112, "ok": 3112, "regenerated": 287, "failed": [],
  "alignmentDivergent": 41, "shortWords": 23,
  "loudness": { "target": -16, "min": -17.6, "max": -14.9, "tpMax": -1.5 },
  "byVoice": { "cjVigY5qzO86Huf0OWal": { "clips": 310, "gainDb": 3.2, "I": -16.1 }, "pNInz6obpgDQGcFmaJgB": { "clips": 48, "gainDb": -1.4, "I": -16.3 } },
  "samples": [ { "id": "3f9a1c2b4d5e6f70", "text": "Follow me, and I will make you fishers of men.", "char": "jesus", "msPerChar": 61, "coverage": 0.93, "I": -16.4, "TP": -2.1, "attempts": 1 } ]
}
```

## Anexo D: checklist de aceitação

- [ ] `tools/voices.json` cobre os 74 papéis atuais e os 10 novos; `--lint` passa; nenhuma voz não GA sem `allowAccent`.
- [ ] 10 vozes da Library validadas por `GET /v1/voices/{id}`; `.voices-ok.json` por `voice_id`; `will`, `charlie`, `giovanni` fora do catálogo.
- [ ] Audição aprovada pelo dono (vozes e 90 nomes); `locked: true` em todos os papéis principais.
- [ ] Masters em `mp3_44100_192`, fora do git (artefato 30 dias + Release `audio-masters`); `audio/` só com `index*.json`, `sprites/`, `qa-report.json` (após a Fase 3).
- [ ] Sprites por lição (normal e lento), cena, história e `core`; 128 kbps CBR mono 44,1 kHz; GAP 60 ms; trim -45 dB com 20/100 ms.
- [ ] Palavras como offsets (0 arquivos em `audio/words/`); mínimo 180 ms com fallback na variante lenta e na lista; fades de 6/25 ms no `GainNode`.
- [ ] Variante lenta nativa (`speed: 0.8`) em frases, falas, leituras, versículos e beats; `playbackRate` sempre 1; fallback por palavras com 180 ms.
- [ ] Hash v2 com texto original (pontuação), voz, modelo, formato, settings efetivos (com `mood`), variante, `dictVer` e `seed`; `--respec` lista motivos.
- [ ] Sem `language_code` nas requisições ao `eleven_multilingual_v2`; `apply_text_normalization: "on"`; `seed` por personagem; `previous_text`/`next_text`; `previous_request_ids` por (grupo, voz).
- [ ] QA gate: duração por caractere, cobertura do alinhamento, tokens, loudness/TP; regeneração com `seed + 1` até 2 vezes; `failed` vazio bloqueia o commit.
- [ ] Loudness -16 LUFS ± 2 (ganho por voz + ajuste por clipe ± 3 dB + limiter -1,5 dBTP); SFX a -18 LUFS; reverb só em `voice` e `anjo`; "o povo" em duas vozes.
- [ ] Dicionário PLS com ~90 nomes (alias sem espaço), enviado por `add-from-file`, `ver` no hash dos textos com nome.
- [ ] Versículo com lacuna silenciado no app (sem clipe "blank" no índice).
- [ ] `audio.js`: índice único imutável + ponteiro; `preloadGroup`, `warmGroups`, LRU por segundos decodificados (420 s); desbloqueio do `AudioContext` no primeiro gesto com `await resume()`; `onended` real; `speechSynthesis` só fora do índice.
- [ ] Componentes passam `char` (e `word`) em todo toque de palavra; `usePlaying` usa `onSpeak`/`onSpeakEnd`.
- [ ] `validate.js` falha sem `who`; `mood` validado; nomes sem regra de pronúncia geram aviso.
- [ ] `tools/audio-check.mjs` e `app/scripts/e2e-audio.mjs` verdes: p95 de toque quente < 30 ms, 100% de cobertura, 0 chamadas a `speechSynthesis` em texto do curso.
- [ ] `docs/AUDIO.md` reescrito; `CONTENT_SPEC_V2.md` 7.6 passa a remeter a este documento para IDs de voz.
