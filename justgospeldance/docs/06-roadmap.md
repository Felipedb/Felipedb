# 06. Roadmap

Sem datas: a ordem e o critério de pronto de cada fase importam mais que o prazo.

## Fase 0: fundação (feita nesta primeira entrega)

- [x] Repositório e documentação de visão, arquitetura, músicas, movimentos e dados.
- [x] Catálogo inicial de hinos candidatos com status de domínio público.
- [x] Protótipo de detecção de pose na webcam com pontuação contra uma pose
      de referência (`prototipo/pose-webcam`), com testes das funções de
      pontuação e verificação em Chromium headless (modelo carrega, loop roda,
      pessoa da imagem de teste do MediaPipe pontua PERFECT contra a pose em T).
- [ ] Mover para o repositório próprio `Felipedb/JustGospelDance` (ver `MIGRACAO.md`).

## Fase 1: MVP, uma música jogável de ponta a ponta

Entregáveis:

1. Projeto Vite + TypeScript com a estrutura de `docs/02-arquitetura.md`.
2. Primeira música: escolher no catálogo, verificar direitos, gerar no Suno,
   normalizar, medir BPM e offset.
3. Gravar o coach e extrair `choreo.json` com a ferramenta `extrair-coreografia`.
4. Marcar movimentos com a ferramenta `marcar-movimentos`.
5. Telas: menu (1 música), calibração, contagem, jogo, resultado.
6. Pontuação conforme `docs/04-movimentos-e-pontuacao.md`, com os limiares
   ajustados depois de 5 pessoas jogarem.
7. Deploy estático em URL pública ou privada.

Critério de pronto: uma pessoa que nunca viu o projeto abre o link, calibra, dança a
música inteira e recebe um resultado que faz sentido para ela (quem dança melhor
pontua mais).

## Fase 2: catálogo e experiência

1. 5 a 8 músicas no catálogo, com variação de BPM e dificuldade, incluindo 2 no
   modo Kids.
2. Modo dupla na mesma câmera.
3. Coach como boneco 2D desenhado a partir do `choreo.json` (opção ao vídeo).
4. Faixa de "próximos movimentos" com pictogramas gerados do `choreo.json`.
5. Feedback por membro ("levante mais o braço esquerdo") nos MISS.
6. Script `validar` e verificação em CI de todos os `song.json` e `choreo.json`.
7. Git LFS ou storage externo para mídia.

Critério de pronto: uma sessão de 30 minutos com um grupo de jovens sem precisar de
quem desenvolveu por perto.

## Fase 3: alcance

1. Celular como controle (acelerômetro via WebSocket), para TVs sem webcam.
2. Ranking local por sala (código de 4 letras) e, se fizer sentido, online (Supabase).
3. PWA com cache das músicas para uso sem internet.
4. Playlists por ocasião (culto de jovens, EBD, Natal com o pacote de cânticos
   natalinos em domínio público).
5. Página pública do projeto e material de divulgação.

## Próximos passos imediatos

1. Criar o repositório vazio no GitHub e migrar a pasta (`MIGRACAO.md`).
2. Escolher as 3 primeiras músicas do catálogo e fechar a verificação de direitos.
3. Assinar o plano do Suno adequado ao uso pretendido e gerar as 3 músicas.
4. Gravar o coach da primeira música (basta um celular no tripé).
5. Iniciar o projeto Vite e portar o protótipo para a interface `PoseProvider`.
