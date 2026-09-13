# 01. Visão e escopo

## Objetivo

Um jogo de dança para navegador, no estilo Just Dance, com músicas gospel. O jogador
vê um "coach" dançando na tela, repete os movimentos na frente da webcam e recebe
pontuação em tempo real. Toda música do catálogo é uma versão nova e animada de um
hino em domínio público, gerada com IA.

## Para quem

- Grupos de jovens e ministérios infantis em igrejas (uso projetado na TV ou telão).
- Famílias em casa, no notebook ligado à TV.
- Escolas e eventos que queiram uma atividade física com repertório gospel.

## Experiência do jogador

1. **Tela inicial**: catálogo de músicas com capa, duração, dificuldade e BPM.
2. **Calibração**: o jogador se afasta até o corpo inteiro aparecer no quadro e
   faz uma pose de referência (braços abertos). O jogo confirma que está vendo os
   33 pontos do corpo com boa visibilidade.
3. **Contagem**: 4 tempos antes da música começar.
4. **Jogo**: coach à esquerda, silhueta do jogador à direita, faixa de "próximos
   movimentos" na parte de baixo, pontuação e classificação do movimento
   (PERFECT, GOOD, OK, MISS) a cada 1 ou 2 segundos.
5. **Resultado**: pontuação total, estrelas (0 a 5), melhor sequência e
   percentual por classe.

## Modos

| Modo | Fase | Descrição |
| --- | --- | --- |
| Solo | MVP | Um jogador, uma câmera |
| Dupla | 2 | Dois jogadores na mesma câmera, lado a lado, placares separados |
| Kids | 2 | Coreografias curtas com movimentos amplos e tolerância maior |
| Celular como controle | 3 | Sem webcam: acelerômetro do celular via WebSocket, como o Just Dance Now |

## Plataforma alvo

Navegador Chrome ou Edge em notebook ou desktop, com webcam. A imagem vai para a TV
por HDMI ou espelhamento. Smart TVs não têm webcam nem WebGL confiável, então não são
alvo direto. Celular como tela é possível, mas a câmera frontal em pé enquadra mal o
corpo inteiro; fica para depois.

## Fora do escopo do MVP

- Backend, login e ranking online.
- Avatar 3D animado (o coach é vídeo).
- Editor visual de coreografias (a marcação de movimentos é feita em JSON com
  ajuda de uma ferramenta simples no navegador).
- Loja, monetização e distribuição em lojas de aplicativos.

## Princípios

- **Domínio público ou nada**: só entra música cuja letra, melodia e tradução sejam
  de domínio público no Brasil, ou escritas por nós. Ver `03-pipeline-musicas.md`.
- **Roda sem instalação**: abrir um link e permitir a webcam é o único setup.
- **Latência é o inimigo**: o relógio do jogo é o áudio, não o relógio de parede,
  e toda comparação tolera o atraso natural de quem está reagindo ao coach.
- **Dados como arquivos**: cada música é uma pasta com `song.json`, `choreo.json`,
  áudio e vídeo. Sem banco de dados no MVP.

## Riscos conhecidos

| Risco | Mitigação |
| --- | --- |
| Direitos autorais de tradução ou arranjo | Checklist por música e registro das fontes (ver 03) |
| Termos do Suno mudarem | Registrar plano, data e versão do modelo por música; reler os termos antes de publicar |
| Detecção ruim com pouca luz ou roupa larga | Tela de calibração com feedback de visibilidade; modelo `full` como opção |
| Máquinas fracas (sem GPU) | Modelo `lite`, resolução 640x480, fallback para CPU |
| Produzir coreografias custa tempo | Pipeline de gravação e extração automatizado; catálogo pequeno e bem feito |
