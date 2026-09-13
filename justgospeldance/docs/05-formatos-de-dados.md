# 05. Formatos de dados

Tudo é arquivo estático. Uma pasta por música em `songs/<slug>/`.

```
songs/
  index.json
  castelo-forte/
    song.json
    choreo.json
    audio.mp3
    coach.mp4
    capa.jpg
```

## songs/index.json

```json
{
  "versao": 1,
  "musicas": ["castelo-forte", "vencendo-vem-jesus"]
}
```

## song.json

```json
{
  "versao": 1,
  "id": "castelo-forte",
  "titulo": "Castelo Forte",
  "tituloOriginal": "Ein feste Burg ist unser Gott",
  "dificuldade": "facil",
  "letra": {
    "autor": "Martinho Lutero",
    "falecimento": 1546,
    "portugues": { "fonte": "letra própria", "autor": "Felipe Batista de Oliveira", "ano": 2026 }
  },
  "melodia": { "autor": "Martinho Lutero", "falecimento": 1546 },
  "dominioPublico": {
    "brasil": true,
    "verificadoEm": "2026-09-13",
    "fontes": ["https://hymnary.org/text/a_mighty_fortress_is_our_god_a_bulwark"]
  },
  "geracao": {
    "ferramenta": "suno",
    "plano": "pro",
    "modelo": "v5",
    "geradoEm": "2026-09-20",
    "idGeracao": "…",
    "promptEstilo": "Gospel pop dançante, 124 BPM, 4/4, …"
  },
  "audio": {
    "arquivo": "audio.mp3",
    "duracaoMs": 141000,
    "bpm": 124,
    "offsetPrimeiroBeatMs": 480,
    "loudnessLufs": -14
  },
  "coach": { "arquivo": "coach.mp4", "offsetMs": 0 },
  "coreografia": "choreo.json",
  "capa": "capa.jpg"
}
```

`coach.offsetMs` é a diferença entre o início do vídeo e o início do áudio, medida
pela claque na gravação. Positivo quando o vídeo começa antes do áudio.

## choreo.json

```json
{
  "versao": 1,
  "modelo": "mediapipe-pose-landmarker-lite",
  "landmarks": "world-33",
  "fps": 30,
  "frames": [
    { "t": 0, "p": [[0.012, -0.611, -0.087, 0.99], [0.03, -0.64, -0.1, 0.98]] }
  ],
  "movimentos": [
    { "id": 1, "inicioMs": 1935, "fimMs": 2903, "nome": "braços para cima", "peso": 1, "gold": false },
    { "id": 2, "inicioMs": 2903, "fimMs": 3871, "nome": "passo lateral", "peso": 1, "gold": false }
  ],
  "naoPontuavel": [{ "inicioMs": 0, "fimMs": 1935 }]
}
```

- `frames[i].p` tem 33 entradas `[x, y, z, visibilidade]` em metros, origem no
  centro do quadril, na ordem do MediaPipe (0 nariz … 32 dedo do pé direito).
  Arredondar para 3 casas decimais; 2:30 de música a 30 fps dá cerca de 4.500
  frames e menos de 3 MB sem compressão. Gzip do servidor reduz para menos de 1 MB.
- `movimentos` cobre a música inteira sem sobreposição; trechos sem movimento
  (intro, respiros) entram em `naoPontuavel`.
- `t` e os tempos dos movimentos estão no relógio do **áudio**, já com o
  `coach.offsetMs` aplicado.

## Resultado de partida (localStorage no MVP)

```json
{
  "musica": "castelo-forte",
  "data": "2026-10-01T20:15:00-03:00",
  "modo": "solo",
  "pontos": 8420,
  "maximo": 11200,
  "percentual": 75.2,
  "estrelas": 4,
  "classes": { "perfect": 31, "good": 48, "ok": 20, "miss": 9 },
  "melhorSequencia": 23
}
```

## Validação

Um script `npm run validar` confere: `index.json` aponta para pastas existentes;
`song.json` tem todos os campos e `dominioPublico.brasil` é `true`; `choreo.json`
tem 33 pontos por frame, `t` crescente e movimentos sem sobreposição; a duração do
áudio bate com o último frame com tolerância de 1 s.
