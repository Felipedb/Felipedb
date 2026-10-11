# Efeitos sonoros v2 (audio/sfx)

Sons do app React gerados por síntese determinística a partir de `tools/sfx/sounds.json` (fonte da verdade das
receitas; princípios, inventário e mixagem em `docs/SFX_SPEC.md`). Nada aqui é editado à mão: tudo sai dos dois
scripts abaixo e muda junto quando o catálogo muda.

## Arquivos

| Arquivo | O que é |
|---|---|
| `src/<variante>.wav` | Masters finais, PCM 16 bits mono 44 100 Hz, um por variante (48). Entram no git para o sprite poder ser remontado sem sintetizar de novo. |
| `sfx-v2.ogg` | Sprite Vorbis q5 com os 48 sons, 60 ms de silêncio antes de cada um. É o que Chrome, Firefox e Android tocam. |
| `sfx-v2.m4a` | O mesmo sprite em AAC 128 kbps com `+faststart`, para o Safari. |
| `sfx-v2.json` | Mapa `{ "tap": ["sfx-v2", início_s, duração_s], ... }`. O app troca `sfx-v2` por `sfx-v2.ogg` ou `sfx-v2.m4a` conforme o navegador. |
| `sfx-v2.m4a.json` | Só existe se o AAC deslocar algum som mais de 3 ms; nesse caso traz os inícios corrigidos para o `.m4a`. |
| `report.json` | Métricas de cada arquivo (duração, LUFS, pico real, DC, bordas), o bloco `sprite` (tamanhos, fontes, desvio de offset, reserva) e um resumo do catálogo usado pela página de audição. |
| `index.html` | Página de audição: cada som tocado do sprite e do WAV, a sequência de lição e os sons antigos. |
| `old/sfx-data.js` | Cópia da reserva antiga (9 WAV de 16 kHz) para comparar na audição. |

A reserva embutida do app fica fora daqui, em `biblelingo/sfx-data.js` (gerada pelo mesmo build).

## Como regenerar

A partir de `biblelingo/`, com Node 22 e ffmpeg no PATH (sem dependências de npm):

```sh
node tools/gen-sfx.mjs --sprite          # sintetiza os 48 arquivos e monta sprite, mapa e reserva
node tools/gen-sfx.mjs --only=tap,correct # só esses sons (nome base ou variante); depois rode o build abaixo
node tools/build-sfx-sprite.mjs          # só remonta sprite, mapa e reserva a partir de src/ (e choices.json)
node tools/gen-sfx.mjs --pics=/tmp/sfx   # também grava espectrograma e forma de onda (PNG 600x200) de cada som
node tools/gen-sfx.mjs --out=/tmp/sfx    # sintetiza em outra pasta, sem tocar em src/ nem no relatório
node tools/gen-sfx.mjs --raw --only=gong # só a síntese em float32, sem pós-processamento (para depurar receitas)
```

A saída é idêntica a cada execução (mesmo SHA-1 dos WAV, do `.ogg`, do `.m4a` e do `sfx-data.js`).

## O que cada etapa faz

1. **Síntese** (`tools/gen-sfx.mjs`, 44 100 Hz em float32): osciladores seno, triângulo, quadrada e dente de serra
   (aditivos com limite de banda, sem aliasing acima de 15 kHz), FM com índice que decai, ruído branco, rosa e marrom
   com semente fixa, envelopes ADSR em ms (ataque linear, decaimento exponencial que chega a -30 dB no fim de `d`,
   liberação que termina em zero exato), glide exponencial ou linear, biquads RBJ com varredura do corte, delay,
   reverb de Schroeder (4 combs amortecidos e 2 all-pass), soft clip por tanh e uníssono. Variantes transpõem todas
   as notas e trocam as sementes do ruído. O master aplica passa-altas, passa-baixas, reverb e a rampa `fadeOutMs`.
2. **Pós-processamento**: ganho medido com o `ebur128` do ffmpeg até o alvo `loudness.lufsShort` de cada som;
   limitador próprio com antecipação de 1,5 ms sobre o pico real (interpolação 4x), no máximo 3 dB de redução,
   para o pico real ficar em -1 dBTP ou abaixo; corte do silêncio abaixo de -60 dBFS nas duas pontas com rampas de
   2 ms (`silenceremove` e `afade` do ffmpeg); PCM 16 bits com dither triangular. Verificação com `ebur128` e
   `astats`: pico real, loudness, DC, clipping, primeira e última amostra.
3. **Sprite** (`tools/build-sfx-sprite.mjs`): concatena os 48 sons na ordem do catálogo, codifica `.ogg` e `.m4a`,
   grava o mapa e confere, decodificando os dois arquivos, que cada som começa onde o mapa diz (correlação cruzada;
   tolerância de 3 ms).
4. **Reserva** (`biblelingo/sfx-data.js`, até 150 KB): `tap`, `select`, `tile`, `pop`, `correct`, `wrong` e
   `finish` em WAV 22 050 Hz mono base64, com os apelidos `tile-1`, `pair-1`, `correct-1`, `combo`, `start` e
   `sparkle` apontando para os mesmos dados (o objeto cresce em chaves, não em bytes). Mantém a forma
   `const SFX_DATA = {...}` que o `app/vite.config.mjs` reexporta e que o app clássico (`sfx.js`) lê.

## Loudness: como os alvos são medidos

- Janela `M` (sons de até 1 s): máximo momentâneo do `ebur128` (janela de 400 ms).
- Janela `S` (finish, streak, levelup, gong, bless): loudness integrado do próprio som, sem deixar o máximo
  momentâneo passar 3 LU acima do alvo. A janela S literal do `ebur128` tem 3 s e diluiria sons de 0,5 a 1,5 s em
  3 a 8 dB: o alvo só seria alcançado esmagando o pico. O valor S de 3 s fica no relatório (`lufsS`) só como referência.
- Sons muito curtos são limitados pelo pico: o `tap` (24 ms) fica em -27 LUFS-M com o pico a -3,6 dBTP, abaixo do
  alvo de -22, e as peças (`tile-*`) ficam a 1 dB do alvo com 3 dB de limitador. É o esperado pela SFX_SPEC 4.2 e
  fica registrado no `report.json`.

## Trocar um som por um candidato do ElevenLabs

Crie `tools/sfx/choices.json` com a fonte de cada som (o padrão é o sintetizado):

```json
{ "default": "synth", "streak": "eleven:2", "gong": "eleven:gong-el-3.mp3" }
```

`eleven:<n>` usa `<som>-el-<n>.mp3`; `eleven:<arquivo>` usa o arquivo indicado. O build procura em
`tools/sfx/chosen/` e depois em `tools/sfx/candidates/`, passa o candidato pelo mesmo pós-processamento (silêncio
inicial a -50 dB, duração até 1,2 x `durationMs`, passa-altas, mesmo loudness, limitador e bordas) e gera as
variantes por transposição de rate, só até ±3 semitons (acima disso a variante fica sintetizada). A geração dos
candidatos roda no GitHub Actions, que tem a chave da API; ela nunca entra no repositório.

## Ouvir

Sirva a pasta `biblelingo/` por HTTP (o navegador não carrega os arquivos por `file://`) e abra a página:

```sh
python3 -m http.server 8000      # em biblelingo/, depois http://localhost:8000/audio/sfx/index.html
```

Com o servidor de desenvolvimento do app no ar, `http://localhost:5179/audio/sfx/index.html` também funciona.
