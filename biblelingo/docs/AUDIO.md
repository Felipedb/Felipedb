# Áudios com ElevenLabs (pipeline v2)

## Como rodar

1. Crie uma chave em elevenlabs.io → Profile → API Keys (permissões Text to Speech e Pronunciation
   Dictionaries; sem a segunda o gerador segue sem dicionário).
2. No GitHub: Settings → Secrets and variables → Actions → New repository secret `ELEVENLABS_API_KEY`.
3. Rode o workflow **Gerar áudios (ElevenLabs)** (Actions → escolher a branch → Run workflow).
   Entradas: `limit` (0 = todos), `only` (`names` = só o nome de cada personagem, amostra barata para
   ouvir todas as vozes) e `model` (padrão `eleven_multilingual_v2`).
4. O workflow faz, em sequência: `node tools/gen-audio.mjs` (clipes + alinhamentos) →
   `node tools/cut-words.mjs` (palavras recortadas das frases) → `node tools/build-sprites.mjs` (sprites)
   → artefato de segurança → commit de `biblelingo/audio` e dos caches de `tools/`.
5. O app toca os clipes automaticamente (síntese do navegador como reserva).

Localmente, sem chave: `node tools/gen-audio.mjs --dry` conta textos e estima créditos. Para testar o
fluxo inteiro sem API: `AUDIO_DIR=/tmp/x node tools/gen-audio.mjs --mock --limit=40`, depois
`AUDIO_DIR=/tmp/x node tools/cut-words.mjs --mock` e `AUDIO_DIR=/tmp/x node tools/build-sprites.mjs`
(o mock gera tons de 440 Hz e alinhamentos uniformes; exige `AUDIO_DIR` fora do repositório, porque a
limpeza de órfãos apagaria os clipes reais). Requer ffmpeg e ffprobe no PATH. Sem Python.

## O que é gerado

| Arquivo | Conteúdo |
| --- | --- |
| `audio/<hash>.mp3` | clipe em `mp3_44100_128` (44,1 kHz, 128 kbps); hash = sha1(texto, voz, modelo, formato, voice_settings) |
| `audio/align/<hash>.json` | `{ text, source, characters, start, end }`: timestamps por caractere (3 casas), vindos do endpoint `/with-timestamps` |
| `audio/manifest.json` | `{ "<texto normalizado>": { "<personagem>": arquivo, "default": arquivo, "~slow": { "<personagem>": arquivo, "default": arquivo } } }` |
| `audio/words/<hash>.mp3` | palavra recortada da frase (44,1 kHz mono, 96 kbps, loudnorm); hash = sha1(arquivo da frase, palavra) |
| `audio/words.json` | `{ "<palavra>": { "<personagem>": { f, p: 1, d }, "default": "words/x.mp3" } }` (p = 1: alinhamento nativo; d = duração) |
| `audio/words-index.json` | por arquivo de frase: palavras recortadas, qual alinhamento foi usado (`source`) e `ver` (ALIGN_VER 5) |
| `audio/sprites/s<N>-<hash>.mp3` + `audio/sprites.json` | clipes, variantes lentas e recortes empacotados (96 kbps mono), `{ arquivo: [sprite, início, duração] }` |
| `tools/.voices-ok.json`, `tools/.voices-assigned.json` | vozes validadas na conta e vozes de reserva já escolhidas |
| `tools/.pron-dict.json` | `{ id, version_id, hash }` do dicionário de pronúncia criado na conta |

Tudo é idempotente: clipe com o nome esperado já no disco (com o seu alinhamento) não é pedido de novo;
frase já indexada na versão atual não é recortada de novo. Numa execução completa (sem `limit`/`only`),
clipes, alinhamentos e recortes que nenhum texto cita mais são apagados.

## Vozes, settings e prosódia

- Uma voz pré-definida por personagem (`VOICE_BY_CHAR` em `tools/gen-audio.mjs`; extras das cenas em
  `SCENE_EXTRAS`). Cada voz é validada com um clipe mínimo; voz indisponível na conta é trocada por outra
  livre do mesmo gênero. Com menos de 3 vozes distintas o gerador aborta sem gastar créditos.
- `voice_settings` por tipo de texto (`settingsFor(personagem, tipo, lento)`), com `use_speaker_boost`:
  palavra/nome: stability 0,6, style 0,1; frase/versículo/narração: stability 0,5 (ancião 0,6, jovem
  0,42), style 0,2 (jovem 0,3); fala de diálogo/cena: stability 0,42, style 0,35. Ancião = `pitch < 0,85`
  e jovem = `pitch > 1,02` em `characters.js`. `similarity_boost` 0,8 em tudo.
- Falas de cena e beats de história vão com `previous_text`/`next_text` (a fala anterior e a seguinte do
  mesmo roteiro); respostas de diálogo e opções de quiz/leitura recebem a pergunta como `previous_text`.
  Só contexto em inglês; sem contexto, o campo é omitido.

## Variante lenta

Todo texto com 2+ palavras (exceto nomes) ganha um segundo clipe com `speed: 0.8`, mesma voz e mesmos
settings, guardado em `manifest[texto]["~slow"]`. O botão "devagar" do app toca essa variante a
velocidade normal (o tom não muda); sem ela (palavras soltas, clipe antigo), cai no `playbackRate` 0,75.

## Dicionário de pronúncia

Regras `alias` (respelling em inglês) para nomes bíblicos difíceis: Potiphar, Goshen, Elisha, Isaiah,
Nehemiah, Zacchaeus, Bartimaeus, Mephibosheth, Ahaz, Hezekiah, Nineveh, Jesse, Pharaoh, Ezekiel,
Immanuel, Gethsemane, Nazareth, Galilee, Capernaum, Magdalene (lista `PRONUNCIATIONS` no gerador).
Regras `phoneme` não valem no `eleven_multilingual_v2`. O dicionário é criado uma vez por execução
(`/v1/pronunciation-dictionaries/add-from-rules`), cacheado em `tools/.pron-dict.json` e recriado quando
as regras mudam; só os textos que contêm um desses nomes pedem o dicionário. Se a API recusar, segue sem.

## Recorte por timestamps

`tools/cut-words.mjs` lê `audio/align/<hash>.json` de cada frase (variante normal) e mapeia os
caracteres nas palavras do texto original (split por espaço, sem a pontuação das pontas, apóstrofo
interno mantido; composta por hífen é uma palavra só). Quando os `characters` reconstroem o texto enviado,
usa `alignment` direto; se o ElevenLabs devolveu o texto normalizado (por exemplo com o alias do
dicionário), usa `normalized_alignment` e faz o mapeamento aproximado por maior subsequência comum.
`source` no índice diz qual foi.

Janela de cada palavra: 0,03 s antes e 0,08 s depois, sem invadir mais que 0,04 s da palavra vizinha;
mínimo 0,12 s (expande simetricamente). Corte com ffmpeg a partir do MP3: `loudnorm I=-16:TP=-1.5:LRA=11`,
fade in 0,01 s, fade out 0,035 s, `libmp3lame` 44,1 kHz mono 96 kbps. `default` de cada palavra = recorte
do narrador quando houver, senão o primeiro.

## Custos

`eleven_multilingual_v2`: 1 crédito por caractere (flash/turbo: 0,5). O conteúdo atual tem ~1 770 textos
e ~47 mil caracteres; com as ~1 300 variantes lentas (~45 mil caracteres) a geração completa do zero fica em
~92 mil créditos. Re-executar só gera o que faltar ou mudou (texto, voz, modelo, formato ou settings).
`--dry` mostra a estimativa exata antes de gastar.
