# 04. Movimentos e pontuação

## Como o Just Dance faz

O Just Dance original usava o Kinect (câmera de profundidade) e o Wii Remote (giroscópio
e acelerômetro na mão direita). O Just Dance Now usa o celular no bolso ou na mão como
acelerômetro. Em todos os casos o jogo compara o sinal do jogador com uma referência
gravada por dançarinos profissionais, com tolerância grande ao tempo e à amplitude.
Ele não exige precisão: premia estar no ritmo e na forma geral do movimento.

## Nossa abordagem: webcam e MediaPipe

A webcam comum, com o MediaPipe Pose Landmarker, entrega 33 pontos do corpo por frame
em duas formas:

- `landmarks`: coordenadas normalizadas da imagem (0 a 1). Servem para desenhar.
- `worldLandmarks`: coordenadas em metros com origem no centro do quadril. Servem
  para comparar, porque não dependem de onde o jogador está no quadro nem do zoom.

Modelos disponíveis: `lite` (rápido, alvo do MVP), `full` (mais preciso) e `heavy`
(desnecessário aqui). Delegate GPU (WebGL) com fallback para CPU.

## Produção de coreografias

### 1. Coreografar

Movimentos amplos, com braços e pernas bem separados do tronco, funcionam melhor
para a câmera e para o jogador. Regras que simplificam tudo:

- Um movimento por 1 ou 2 tempos musicais; blocos de 8 tempos que se repetem.
- Refrão sempre com a mesma sequência.
- Sem giros completos (a câmera perde o corpo) e sem chão (o modelo se perde).
- Poses "gold" (paradas de 1 tempo, marcantes) no fim dos refrões.

### 2. Gravar o coach

- Câmera fixa na altura do peito, a 3 ou 4 metros, corpo inteiro com folga.
- Fundo liso, luz frontal, roupa contrastante e justa o suficiente.
- 1080p a 30 fps (ou 60 fps, decimando depois).
- A música toca alto no ambiente e a gravação começa com uma **claque** (palma)
  no primeiro tempo do intro, para alinhar o vídeo ao áudio na edição.
- Dançar espelhado em relação ao jogador não é necessário: o jogo espelha a
  referência na comparação (ver abaixo) e mostra o vídeo do coach espelhado na tela.

### 3. Extrair a referência

A ferramenta `tools/extrair-coreografia` (página web) percorre o vídeo alinhado ao
áudio e salva, a cada 1/30 s, os 33 `worldLandmarks` com visibilidade. Esse é o
`choreo.json`. Como usa o mesmo modelo do jogo, referência e leitura do jogador têm
os mesmos vieses.

### 4. Marcar movimentos

A ferramenta `tools/marcar-movimentos` mostra a grade de tempos (a partir do BPM e
do offset do `song.json`) e permite marcar, para cada movimento, início, fim, nome
curto, peso e se é gold. Um movimento típico dura 1 ou 2 tempos (cerca de 500 ms a
1 s a 124 BPM). Cada movimento vira um item em `choreo.json.movimentos`.

### 5. Revisar

Tocar a música com a referência desenhada como esqueleto sobre o vídeo e conferir
se os pontos seguem o corpo. Frames com visibilidade média abaixo de 0,6 são
marcados como não pontuáveis.

## Representação da pose para comparação

Usamos **direções de membros** a partir dos `worldLandmarks`: vetores unitários entre
articulações. São invariantes à posição e à escala do corpo e mais estáveis que
posições brutas.

| Membro | Pontos (MediaPipe) | Peso |
| --- | --- | --- |
| Braço esquerdo | ombro 11 → cotovelo 13 | 1,5 |
| Antebraço esquerdo | cotovelo 13 → pulso 15 | 1,5 |
| Braço direito | ombro 12 → cotovelo 14 | 1,5 |
| Antebraço direito | cotovelo 14 → pulso 16 | 1,5 |
| Coxa esquerda | quadril 23 → joelho 25 | 1,0 |
| Perna esquerda | joelho 25 → tornozelo 27 | 1,0 |
| Coxa direita | quadril 24 → joelho 26 | 1,0 |
| Perna direita | joelho 26 → tornozelo 28 | 1,0 |
| Tronco | centro do quadril → centro dos ombros | 0,5 |

Braços pesam mais porque são o que o jogador enxerga e imita primeiro, e porque as
pernas costumam ficar parcialmente fora do quadro.

Complemento útil para feedback ("dobre mais o cotovelo"): ângulos nas articulações
(cotovelos, ombros, quadris, joelhos), calculados dos mesmos pontos.

## Espelhamento

O jogador imita o coach como num espelho: quando o coach levanta o braço direito, o
jogador levanta o esquerdo. A referência é espelhada antes da comparação trocando
os índices esquerdo e direito e invertendo o sinal de `x`. A tela mostra a webcam
espelhada (`transform: scaleX(-1)`) para o jogador se ver como no espelho.

## Comparação e pontuação

Para cada movimento `m` com intervalo `[inicio, fim]`:

1. **Amostragem**: pega-se a referência em 4 instantes igualmente espaçados dentro
   do movimento e as poses do jogador no buffer.
2. **Janela temporal**: para cada instante de referência `t`, procura-se a pose do
   jogador no intervalo `[t - 120 ms, t + 350 ms]` que maximize a similaridade. A
   janela é assimétrica porque o jogador reage ao coach com atraso.
3. **Similaridade de pose**: média ponderada, sobre os membros visíveis
   (visibilidade dos dois pontos acima de 0,5 no jogador e na referência), de
   `cos(θ)` entre o vetor do jogador e o da referência, mapeada de `[-1, 1]` para
   `[0, 1]`: `s = (1 + cos θ) / 2`.
4. **Nota do movimento**: média das similaridades dos 4 instantes. Se menos de 3
   membros estiverem visíveis, o movimento não pontua e a UI pede para ajustar o
   enquadramento.
5. **Classe**:

| Classe | Nota |
| --- | --- |
| PERFECT | ≥ 0,90 |
| GOOD | ≥ 0,80 |
| OK | ≥ 0,65 |
| MISS | abaixo de 0,65 |

6. **Pontos**: PERFECT 100, GOOD 70, OK 40, MISS 0, multiplicados pelo peso do
   movimento. Gold moves valem 3x e exigem que a pose seja mantida por pelo menos
   60% do intervalo.
7. **Sequência**: a cada 5 acertos consecutivos (GOOD ou melhor) o multiplicador
   sobe 0,1 até 1,5; um MISS zera.
8. **Resultado**: percentual da pontuação máxima possível. Estrelas: 1 a partir
   de 30%, 2 de 45%, 3 de 60%, 4 de 75%, 5 de 90%. Os limiares serão calibrados
   com jogadores reais; são ponto de partida.

Modo Kids: limiares 0,05 mais baixos e janela temporal de `[-200, +500]` ms.

## Calibração e latência

Antes de cada música:

- **Enquadramento**: exibe os 33 pontos e exige visibilidade média acima de 0,7
  nos tornozelos e pulsos por 2 segundos.
- **Pose de referência**: braços abertos em T. Serve para confirmar a leitura e para
  medir a proporção dos membros (usada só para feedback, não para pontuar).
- **Latência**: opcionalmente, o jogo pisca a tela e pede uma palma; a diferença
  entre o instante do flash e o pico do movimento dos pulsos estima o atraso
  câmera + processamento e ajusta o centro da janela temporal.

## Desempenho

| Situação | Configuração |
| --- | --- |
| Notebook com GPU integrada recente | `lite`, GPU, 640x480, 30 fps |
| Máquina fraca ou sem WebGL | `lite`, CPU, 480x360, detecta a cada 2 frames |
| Iluminação difícil | `full`, GPU |

Detectar em todo frame não é obrigatório: a pontuação amostra 4 instantes por
movimento, e o buffer de 2 segundos absorve frames perdidos.

## Dois jogadores na mesma câmera

`numPoses: 2` no PoseLandmarker. Os jogadores são atribuídos pelo lado do quadro na
calibração (esquerda e direita) e re-identificados a cada frame pela posição
horizontal do centro do quadril. Se as pessoas cruzarem, o jogo mantém a última
atribuição estável por 500 ms antes de trocar.

## Avatar e coach

MVP: vídeo do coach espelhado. Fase 2: boneco 2D desenhado a partir do próprio
`choreo.json` (esqueleto com traços grossos e cor), que permite trocar roupa e cor
sem regravar e reduz o peso dos arquivos. Fase 3 opcional: avatar 3D com Three.js
animado pelos `worldLandmarks`.

## Alternativas e experimentos

- **MoveNet (TensorFlow.js)**: 17 pontos 2D, mais leve em CPU. Vale como fallback
  para máquinas fracas, mas perde a comparação 3D.
- **Celular como controle**: acelerômetro do celular via WebSocket (Just Dance Now).
  Sem câmera, funciona em qualquer TV com navegador. A referência passa a ser a
  aceleração do pulso do coach (derivada dos landmarks). Fase 3.
- **Vídeo de dançarino gerado por IA**: pode servir como coach visual, mas a
  extração de pose ainda vem do vídeo, e a consistência entre frames costuma ser
  pior que a de um humano filmado. Experimento, não plano.
- **Coreografia gerada por IA a partir da música** (modelos de pesquisa como EDGE):
  qualidade instável e licenças acadêmicas. Não usar no MVP.
- **Bases de captura de movimento (AIST++, Mixamo)**: licenças restritas a pesquisa
  ou a usos específicos; não misturar no catálogo sem checar cada termo.
