# JustGospelDance

Jogo de dança no estilo Just Dance com músicas gospel. As músicas são versões novas e
animadas de hinos em domínio público, geradas com IA (Suno). Os movimentos do jogador
são lidos pela webcam e comparados em tempo real com a coreografia de referência.

## Como funciona em 30 segundos

1. **Música**: escolhe-se um hino em domínio público (letra e melodia), gera-se uma
   versão animada no Suno e guarda-se o áudio com BPM e metadados.
2. **Coreografia**: alguém dança a música na frente de uma câmera. O vídeo vira o
   "coach" na tela e os pontos do corpo (33 landmarks do MediaPipe) viram o arquivo
   `choreo.json`.
3. **Jogo**: o navegador abre a webcam, detecta a pose do jogador a cada frame,
   compara com a pose de referência daquele instante e pontua
   (PERFECT, GOOD, OK, MISS).

## Estrutura

| Pasta | Conteúdo |
| --- | --- |
| `docs/` | Visão, arquitetura, pipeline de músicas, movimentos e pontuação, formatos de dados, roadmap |
| `musicas/` | Catálogo de hinos candidatos com status de domínio público |
| `prototipo/pose-webcam/` | Prova de conceito: detecção de pose na webcam e pontuação contra uma pose de referência |

## Documentação

- [01 Visão e escopo](docs/01-visao-e-escopo.md)
- [02 Arquitetura](docs/02-arquitetura.md)
- [03 Pipeline de músicas: Suno e domínio público](docs/03-pipeline-musicas.md)
- [04 Movimentos e pontuação](docs/04-movimentos-e-pontuacao.md)
- [05 Formatos de dados](docs/05-formatos-de-dados.md)
- [06 Roadmap](docs/06-roadmap.md)
- [Catálogo de músicas candidatas](musicas/catalogo-candidatas.md)

## Rodar o protótipo

```bash
cd prototipo/pose-webcam
python3 -m http.server 8080
# abra http://localhost:8080 no Chrome ou Edge e permita a webcam

node --test prototipo/pose-webcam/pontuacao.test.mjs   # testes da pontuação
```

## Stack do MVP

Navegador (Chrome ou Edge), TypeScript + Vite, MediaPipe Pose Landmarker
(`@mediapipe/tasks-vision`), Canvas 2D, Web Audio API. Sem backend no MVP.
Detalhes em [docs/02-arquitetura.md](docs/02-arquitetura.md).

## Licença e direitos

A definir. O que já está mapeado sobre direitos das músicas está em
[docs/03-pipeline-musicas.md](docs/03-pipeline-musicas.md).
