# Protótipo: pose na webcam

Prova de conceito da parte mais arriscada do jogo: ler a pose do jogador no
navegador e pontuá-la contra uma referência.

O que mostra:

- MediaPipe Pose Landmarker (`@mediapipe/tasks-vision` 1.0.1) rodando em modo
  VIDEO com delegate GPU e fallback para CPU.
- Esqueleto desenhado sobre a imagem espelhada da webcam.
- Nota e classe (PERFECT, GOOD, OK, MISS) da pose atual contra uma referência,
  com a mesma fórmula planejada para o jogo (`docs/04-movimentos-e-pontuacao.md`):
  média ponderada da similaridade de cosseno entre as direções dos membros nas
  coordenadas 3D do mundo.
- Ângulos de cotovelos, ombros e joelhos, base para o feedback por membro.
- Captura de referência: faça uma pose, clique em capturar, e a nota passa a medir
  o quanto você repete aquela pose. É a semente do fluxo "gravar coreografia e
  comparar".

Arquivos:

- `index.html`: tela, import map do MediaPipe e URLs do modelo.
- `app.js`: webcam, carregamento do modelo, loop de detecção e desenho.
- `pontuacao.js`: funções puras de pontuação (sem DOM), reutilizáveis pelo jogo.
- `pontuacao.test.mjs`: testes das funções de pontuação.

Como rodar:

```bash
python3 -m http.server 8080
# http://localhost:8080 no Chrome ou Edge; ?auto=1 inicia a câmera sem clique; ?delegate=CPU força CPU

node --test pontuacao.test.mjs   # testes da pontuação (Node 20+)
```

Precisa de internet para baixar o modelo e o WebAssembly do MediaPipe na primeira
carga. O estado interno fica em `window.__jgd` (frames, poses, fps, erros) para
inspeção no console e para testes automatizados.
