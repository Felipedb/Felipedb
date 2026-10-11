# BíbliaLearn: Auditoria de Usabilidade V3

Como foi feita: o app foi jogado no Playwright como usuário novo (sem `localStorage`), 390x844, toque habilitado, tema claro e escuro, servidor dev em `http://localhost:5179/`. Roteiro: primeira abertura, os 4 itens do HUD, toque em nó bloqueado, foco por teclado, popover do nó, lição u1l1 inteira (errando 2 vezes, saindo pelo X no exercício 4 e retomando), Resultado e cerimônias, cena `c-jesus-1` inteira, Hub (com Match Madness), Missões, Personagens (ficha liberada e bloqueada), Perfil (seletor de avatar), Configurações, corações zerados. Também foram medidos alvos de toque menores que 44 px, rolagem horizontal, emojis do sistema no texto da tela e as imagens visíveis com o tamanho renderizado.

Evidências: `scratchpad/ux-audit/r3-light/NN-*.png` e `r3-dark/NN-*.png` (82 capturas por tema; os números abaixo valem para os dois), relatório bruto em `scratchpad/ux-audit/report.json`, roteiro em `scratchpad/ux-audit/audit.mjs`. Capturas anteriores do orquestrador: `scratchpad/shots-now/{dark,light}/`.

Direção visual correspondente: `docs/IDENTITY_V3.md` (citada como ID-seção).

Prioridade: **P0** deixa feio ou confuso; **P1** polimento; **P2** desejável.

Pontos positivos verificados (manter): popover do nó bloqueado explica o motivo (`90-toque-bloqueado-mouse`); retomada da lição após sair (RETOMAR 4/15, `20-popover-retomar`, voltou no exercício 4); tab Praticar com contador de erros; foco por teclado visível (`11-foco-teclado`); nenhuma rolagem horizontal em nenhuma tela; nenhum erro de JavaScript no console nos dois temas; trilha pronta em cerca de 1 a 1,5 s.

---

## Resumo por prioridade

| P | IDs |
|---|---|
| P0 | UX-01, UX-02, UX-03, UX-04, UX-05, UX-08, UX-12, UX-15, UX-25, UX-10 (versículo ilegível), UX-31, UX-20 (histórias bloqueadas), UX-35, UX-11, UX-36 |
| P1 | UX-06, UX-07, UX-09, UX-13, UX-14, UX-16, UX-18, UX-19, UX-21, UX-22, UX-23, UX-24, UX-29, UX-30, UX-32, UX-37, UX-38, UX-41, UX-43 |
| P2 | UX-17, UX-26, UX-27, UX-28, UX-33, UX-34, UX-39, UX-40, UX-42, UX-44 |

---

## Primeiro uso e orientação

### UX-01. Não existe boas-vindas nem onboarding (P0)
- Evidência: `01-primeira-abertura` (claro e escuro). O app abre direto na trilha com HUD "0 · 0 · 5", sem nome, sem meta, sem explicar nada. O mockup do dono (`refs/7471e956`) tem "Seja bem-vindo! Vamos aprender juntos a Palavra de Deus?" com Jesus.
- Correção: onboarding de 4 passos (boas-vindas com Jesus 240, motivo, meta diária, nome e avatar) e coach-mark "Comece aqui!" no primeiro nó. Não aparece se `localStorage["biblelingo"]` existir; atalhos de teste `?skipOnboarding=1` e `window.__blSkipOnboarding()` em DEV; drivers e `shots-all.mjs` atualizados (ID-9.1).
- Onde: novo `app/src/screens/Onboarding.jsx`, `App.jsx` (rota inicial), `core/store.js` (campos `onboarded`, `motive`, `name`, `avatar`, `dailyGoal` já existe), `scripts/lib/driver.mjs`, `e2e-course.mjs`, `e2e-lesson.mjs`, `shots-all.mjs`.

### UX-02. HUD com zeros e ícone ambíguo, sem explicação (P0)
- Evidência: `01-primeira-abertura`, `02-hud-pop-0` a `05-hud-pop-3`. O primeiro item é um retângulo verde com um livro (não se entende que é o curso); chama e "0" em cinza parecem desativados; o "0" do XP em `yellow-text` some no claro. Os popovers explicam, mas nada convida a tocá-los.
- Correção: Illos 3D 28 (📖 🔥 ⚡ ❤️) e números 19 px 800 na cor do ícone (ID-3.3, ID-9.3); popover da ofensiva abre sozinho após a primeira lição ("Sua ofensiva começou!"); cada popover ganha uma frase que explica o número.
- Onde: `components/shell/Hud.jsx`, `HudPopover.jsx`.

### UX-03. Personagens pequenos, cortados reto e com rostinho de emoji (P0)
- Evidência: `13-licao-1-ex-choice-en-pt` (Eva 110 px), `39-licao-11-ex-speak` (99 px), `01-primeira-abertura` (Adão 134 px flutuando ao lado do nó, base reta à mostra), `14-fb-erro-choice-en-pt` e `24-fb-ok-listen` (badge de rosto amarelo 28 px ao lado da cabeça, com cara de emoji barato). No Duolingo o personagem tem corpo inteiro, ocupa um terço da tela e reage com o corpo (`refs/ae856f0e`, `d51aafbb`).
- Correção: bustos nos tamanhos da ID-5.2, elipse de sombra, máscara na base, respiração 3 s, pulo no acerto e inclinação no erro; remover o badge de reação (ID-5.3).
- Onde: `components/ui/CharacterStage.jsx`, `components/exercises/CharacterBubble.jsx`, `components/trail/*` (decoração lateral), `screens/Home.jsx`.

### UX-04. Emoji do sistema como ilustração, com escolhas erradas (P0)
- Evidência: `15-licao-2-ex-image-choice` ("animal" = 🐾, "Era bom" = 🆗, "bom" = 👍); `51-cena-image-choice` ("dia" = 📅 com o texto em inglês "July 17"); `26-licao-5-ex-type` (🌍 dentro do balão); `50-cena-scene-intro` (🌅 🎣 🚶 ⏱ ➡ nos chips); `shots-now/dark/ex-image-choice` ("à imagem de Deus" = 👤 silhueta). O relatório mediu emojis do sistema no texto em image-choice, type, choice-pt-en, cena intro, cena image-choice e cena truth.
- Correção: componente `<Illo>` com Fluent Emoji 3D copiado para `public/illo/`, reserva em letra (nunca o emoji cru) e `illoMap.js` do app para corrigir escolhas sem editar `icons.js` (ID-4).
- Onde: novo `components/ui/Illo.jsx`, `core/illoMap.js`, `scripts/copy-illo.mjs`; uso em `exercises/Choice.jsx`, `WordCard.jsx`, `TypeInput.jsx`, `scenes/shared.jsx`, `ui/Option.jsx`, `Result.jsx`.

### UX-05. Toast preto cobre o rodapé de feedback e persiste por vários exercícios (P0)
- Evidência: `40-fb-ok-speak` (o toast "Exercícios de fala pausados por 15 min" cobre o título "Tudo bem, seguimos!" e a resposta), `41-licao-12-ex-read` e `43-licao-13-intersticio` (o mesmo toast continua sobre a tela seguinte, acima do VERIFICAR); `59-cena-listen-type` e `60-cena-scene-truth` ("Mandou bem! Um desafio extra" sobre o conteúdo).
- Correção: dentro da lição e das cerimônias não há toast; o aviso vira linha no rodapé de feedback ou selo dourado acima do título do exercício seguinte (ID-9.7, ID-9.10).
- Onde: `App.jsx` (Snackbar desligado quando `inLesson`), `core/session.js` (eventos `toast` de fala/escuta/desafio extra viram campo no `feedback`), `components/ui/FeedbackFooter.jsx`.

### UX-06. Título do feedback quebra em duas linhas (P1)
- Evidência: `40-fb-ok-speak` ("Tudo bem, / seguimos!").
- Correção: títulos com no máximo 18 caracteres ("Seguimos!"); `white-space: nowrap` com redução para 20 px se exceder.
- Onde: lista de frases de feedback em `core/session.js` ou `components/exercises/feedback.jsx`.

### UX-07. "Não posso falar agora" parece desligar a fala para sempre (P1)
- Evidência: depois de tocar "Não posso falar agora", `78-config` mostra "Exercícios de fala" desligado, enquanto o toast dizia "pausados por 15 min". O usuário não sabe se precisa religar.
- Correção: na linha de Configurações, estado "Pausado até 14:32" com botão "Retomar agora"; o toggle reflete só a preferência permanente.
- Onde: `components/profile/ConfigModal.jsx`, `core/store.js` (`speakMutedUntil`, `listenMutedUntil`).

### UX-08. Interstício com personagem cortado e tela meio vazia (P0)
- Evidência: `43-licao-13-intersticio`, `shots-now/{dark,light}/lesson-interstitial` (Adão sai pela borda direita, só o rosto aparece; o resto da tela fica vazio).
- Correção: personagem 200 inteiro à direita com elipse, balão à esquerda, aceno na entrada (ID-9.8). Manter `[data-interstitial]`.
- Onde: `screens/Lesson.jsx` (bloco do interstício).

### UX-09. X da lição sai sem confirmar (P1)
- Evidência: `19-licao-sair`: um toque no X no exercício 4 volta à trilha direto; os 2 corações perdidos ficam perdidos. A retomada funciona (`20-popover-retomar`), mas o toque acidental é fácil (X de 24 px no canto).
- Correção: sheet "Espere, não vá! Seu progresso nesta lição fica guardado." com "CONTINUAR APRENDENDO" (verde) e "SAIR" (texto vermelho), como no Duolingo; sem sheet quando ainda não respondeu nada.
- Onde: `screens/Lesson.jsx` (botão fechar), `components/ui/Sheet.jsx`.

### UX-10. Resultado: CTA demora 2,2 s e o versículo fica ilegível (P0 para o versículo, P1 para o tempo)
- Evidência: `46-resultado` (claro e escuro): sem botão na tela durante 2,2 s; o card do versículo "The joy of the LORD is your strength" está translúcido e o confete passa por cima; no escuro (`r3-dark/46-resultado`) quase some.
- Correção: CTA aos 1,2 s; versículo em pergaminho opaco, com ícone de áudio 44 e referência legível (ID-9.9).
- Onde: `screens/Result.jsx` (linha 236 em diante).

### UX-11. Baú do Resultado em estilo foto (P0 visual)
- Evidência: `46-resultado`, `61-cena-resultado`: baú realista marrom destoando de tudo; texto "TOQUE PARA ABRIR" em caixa alta sobre amarelo com baixo contraste.
- Correção: `Chest` 3D chapado da linguagem nova, card dourado com borda inferior 4 px, pulso (ID-7.1, ID-9.9).
- Onde: `components/ui/Chest.jsx`, `screens/Result.jsx`.

### UX-12. Três telas "Missão concluída" seguidas (P0)
- Evidência: `62`, `63`, `64-cena-cerimonia`: três telas brancas quase vazias, cada uma com um baú pequeno e uma linha ("Ganhe XP", "Complete 2 lições", "Faça 1 lição perfeita"), cada uma pedindo um toque.
- Correção: uma única tela "Missões concluídas" com a lista e os "+XP" subindo (ID-9.9).
- Onde: `screens/ceremonies/MissionScreen.jsx`, `screens/Result.jsx` (fila `pendingCelebrations`), `core/session.js` linha 70.

### UX-13. Meta diária mostra "19" sem rótulo (P1)
- Evidência: `48-cerimonia-streak` (na verdade a tela da meta durante a animação): anel amarelo com "19" e nada mais na tela.
- Correção: rótulo "de 20 XP" dentro do anel desde o primeiro quadro e título visível desde o início.
- Onde: `screens/ceremonies/DailyGoalScreen.jsx`.

### UX-14. Ofensiva escura no tema claro e semana incompleta (P1)
- Evidência: `47-cerimonia-streak` (claro): fundo `#131f24` forçado; a faixa da semana mostra só "S T Q Q" com bolinhas cinzas e espaço vazio à direita.
- Correção: fundo do tema; semana completa com o dia de hoje aceso (ID-9.9).
- Onde: `screens/ceremonies/StreakScreen.jsx` (linha 19 força `dark`).

### UX-15. Trilha com cara de protótipo (P0)
- Evidência: `01-primeira-abertura`, `91-trilha-topo`, `49-trilha-apos-licao`: 79 nós bloqueados idênticos com cadeado; laterais vazias exceto um busto a cada capítulo; cartão "Seção 1 Antigo Testamento VER DETALHES" de 358x106 com rolo de pergaminho em estilo foto no meio do caminho; estrelas do nó concluído soltas entre dois nós (parecem pertencer ao nó de cena).
- Correção: nós bloqueados com o ícone do tipo; bustos com elipse e Illos de cenário nas laterais; divisor de seção em linha fina com rótulo; estrelas coladas no nó (ID-9.2).
- Onde: `components/trail/PathNode.jsx`, `SectionDivider.jsx`, `screens/Home.jsx`.

### UX-16. Personagem troca de imagem ao carregar (P1)
- Evidência: `00-first-paint` (claro e escuro): Adão aparece como retrato redondo JPG e depois salta para o busto; o nó atual aparece desbotado.
- Correção: decisão busto ou reserva por lista estática, palco com tamanho reservado, fade do busto, preload (ID-5.5).
- Onde: `components/ui/CharacterStage.jsx` e `Avatar.jsx` (`useAsset`).

### UX-17. Trilha de 10.706 px sem atalho para o nó atual (P2)
- Evidência: medição de `document.body.scrollHeight` na trilha com 80 etapas.
- Correção: botão flutuante "voltar ao atual" quando o nó atual sai da tela (ID-9.2).
- Onde: `screens/Home.jsx`.

### UX-18. Popover do nó com texto técnico (P1)
- Evidência: `12-popover-no`: "Vocabulário: earth, light, dark, good, Let there be light" em 13 px sobre verde; o popover cobre o cartão da seção.
- Correção: 3 Illos das palavras novas e "3 palavras novas"; subtítulo "Lição 1 de 4" (ID-9.4).
- Onde: `components/trail/NodePopover.jsx`.

### UX-19. Alvos de toque menores que 44 px (P1)
- Evidência (`report.json`, campo `small`):

| Elemento | Medida | Tela |
|---|---|---|
| "Devagar" (ouvir devagar) | 71x18 | listen, listen-choice, listen-build, cena listen |
| Alto-falante do balão | 32x32 | choice, image-choice, translate, speak, resultado |
| Toggles de Configurações | 50x30 | config |
| "Ver tudo" (conquistas) | 74x18 | perfil |
| Fechar da ficha | 36x36 | ficha |
| "Ver detalhes" da seção | 144x36 | trilha |
| "Usar teclado" | 169x36 | build e cena build |
| Baú da missão | 40x40 | missões |
| "Praticar com Adão" | 204x40 | ficha |

- Correção: área mínima 44x44 com `::before` invisível ou padding, sem mudar o desenho; linha inteira de Configurações clicável.
- Onde: `components/ui/AudioButton.jsx`, `exercises/AudioButton.jsx`, `ui/Toggle.jsx`, `profile/ConfigModal.jsx`, `characters/CharacterSheet.jsx`, `screens/Profile.jsx`, `screens/Quests.jsx`, `trail/SectionDivider.jsx`, `ui/WordBankCore.jsx`.

### UX-20. Hub genérico e histórias bloqueadas tristes (P0 visual, P1 uso)
- Evidência: `65-hub`, `66-hub-meio`, `67-hub-fim`, `shots-now/dark/hub-bottom`: lista de cards iguais com ícones chapados; histórias bloqueadas em foto cinza com o mesmo texto "Conclua a 1ª etapa do capítulo" repetido em todas; "Situações do dia a dia" com 8 carrosséis cortados na borda e cards de 128 px com retratos redondos.
- Correção: grade 2x2 com Illos 64, card destaque de Erros, carrosséis com cards 160x200 e bustos, bloqueado com silhueta e "Capítulo 3" (ID-9.13).
- Onde: `screens/Hub.jsx`.

### UX-21. Match Madness começa sem regra nem contagem (P1)
- Evidência: `68-madness-inicio`: grade de pares e um "60" num retângulo, sem título de regra, sem "pronto?".
- Correção: tela de entrada com regra e recorde, contagem 3-2-1, barra de tempo (ID-9.12).
- Onde: `screens/Madness.jsx`.

### UX-22. História com título cortado e leitura lenta (P1)
- Evidência: `shots-now/light/story-beat`: título "O jardim..." truncado no topo; frase revelada palavra a palavra com CONTINUAR desabilitado; avatares 40.
- Correção: título completo em segunda linha, toque completa a frase, elenco 120 no topo (ID-9.11).
- Onde: `screens/Story.jsx`.

### UX-23. Missões: baús pequenos e Ofensiva duplicada (P1)
- Evidência: `69-missoes`, `70-missoes-fim`: depois de concluídas, quatro baús de 40 px iguais, sem destaque para "abrir"; card "Ofensiva 1 dia" repete o que está no Perfil e no HUD.
- Correção: baú concluído pula e brilha até ser aberto; alvo 48; remover a Ofensiva desta aba (ID-9.14).
- Onde: `screens/Quests.jsx`, `components/ui/QuestRow.jsx`.

### UX-24. Personagem bloqueado abre ficha com "Iniciar lições" (P1)
- Evidência: `74-personagem-bloqueado`: José (capítulo 3, bloqueado) abre a ficha completa com "INICIAR LIÇÕES" e "PRATICAR COM JOSÉ".
- Correção: sheet curto "Conheça José no Capítulo 3" com "IR PARA A TRILHA" (ID-9.15).
- Onde: `screens/Characters.jsx`, `components/characters/CharacterSheet.jsx`.

### UX-25. Perfil sem identidade: "D", "Discípulo", banner apagado (P0)
- Evidência: `75-perfil`, `shots-now/dark/profile`: avatar azul com a letra "D"; nome "Discípulo" padrão sem convite para mudar; banner verde com livro translúcido; o seletor de avatar existe, mas só aparece tocando no círculo (`77-avatar-picker`) e oferece apenas personagens já conhecidos.
- Correção: avatar e nome escolhidos no onboarding; avatar com busto e anel; lápis visível; banner com gradiente e Illos (ID-9.16).
- Onde: `screens/Profile.jsx`, `components/ui/Avatar.jsx`.

### UX-26. Números do Perfil sem contexto (P2)
- Evidência: `75-perfil`: "Coroas 0", "Estrelas 5", conquistas "Nível 1 · 0/1 · Etapas concluídas" sem dizer como ganhar.
- Correção: linha de ajuda sob cada StatCard na primeira vez; conquista mostra a próxima meta ("Conclua 5 etapas").
- Onde: `screens/Profile.jsx`, `components/ui/StatCard.jsx`.

### UX-27. Lição repetida sem corações mostra "∞" sem explicar (P2)
- Evidência: `shots-now/{dark,light}/hearts-modal` (com 0 corações, reabrir u1l1 concluída entra com "∞" no lugar dos corações).
- Correção: selo "Prática: não gasta corações" no topo na primeira vez (ID-9.17).
- Onde: `screens/Lesson.jsx` (topo).

### UX-28. Rótulo do combo minúsculo (P2)
- Evidência: `30-licao-7-ex-listen-choice` em diante: "COMBO x6" com 11 px sobre a barra; novato não sabe o que é.
- Correção: 13 px com pop; na primeira vez que chega a x5, linha no rodapé "Combo! 5 acertos seguidos".
- Onde: `components/ui/ProgressBar.jsx`, `screens/Lesson.jsx`.

### UX-29. Digitação com placeholder que repete o título (P1)
- Evidência: `26-licao-5-ex-type`: título "Digite em inglês:" e placeholder "Digite em inglês"; balão com 🌍.
- Correção: placeholder "Escreva aqui", Illo no balão, Enter verifica (ID-9.6).
- Onde: `components/exercises/TypeInput.jsx`.

### UX-30. Cena: avatares pequenos e CONTINUAR ativo durante a narração (P1)
- Evidência: `53-cena-scene-read`, `54-cena-scene-reply`: avatares de 40 px; "Ouvindo a conversa..." com CONTINUAR verde habilitado (o usuário pula sem querer).
- Correção: avatares 44 com anel; CTA desabilitado até o áudio terminar e link "Pular" (ID-9.10).
- Onde: `components/scenes/SceneRead.jsx`, `SceneReply.jsx`, `scenes/shared.jsx`.

### UX-31. Intro da cena com rótulo longo em caixa alta e chips com emoji (P0 visual)
- Evidência: `50-cena-scene-intro`: "SITUAÇÃO · CONVIDAR ALGUÉM E RESPONDER AO CONVITE" em duas linhas de caixa alta; chips "Palavras da cena" com emojis do sistema; personagens em círculos de 72.
- Correção: "SITUAÇÃO" em caption e o resto em texto normal; bustos 120 frente a frente; Illos 24 nos chips (ID-9.10).
- Onde: `components/scenes/SceneIntro.jsx`.

### UX-32. Contraste e ferramenta de contraste quebrada (P1)
- Evidência: `node scripts/contrast-check.mjs` termina com "token sem cor literal: unit-text -> unit-text". Medições: branco sobre CTA `#58cc02` 2,09:1; `yellow-text` em numeral; `#afafaf` (X da lição) 2,19:1 sobre branco.
- Correção: script ignora tokens `var(...)` e testa os pares da ID-3.3; X da lição em `muted`.
- Onde: `app/scripts/contrast-check.mjs`, `contrast-pairs.json`, `src/index.css`.

### UX-33. Pergaminho escuro parece um card comum (P2)
- Evidência: `r3-dark/32-licao-8-ex-verse`, `r3-dark/60-cena-scene-truth`: `#1e2a2c` azulado.
- Correção: `#2b2619` com texto `#e8d7a8` (ID-3.2).
- Onde: `src/index.css` (`.dark`).

### UX-34. Feedback de acerto repete a palavra (P2)
- Evidência: `27-fb-ok-type` ("Boa!" e embaixo "earth", que o usuário acabou de digitar); `22-fb-ok-image-choice` ("terra").
- Correção: no acerto, mostrar a segunda linha só quando acrescenta (tradução ou forma correta com acento); senão só o título (ID-9.7).
- Onde: `components/ui/FeedbackFooter.jsx`.

### UX-35. Cartão de seção no meio da trilha confunde a leitura (P0)
- Evidência: `01-primeira-abertura`: o cartão verde "Seção 1 · Antigo Testamento · VER DETALHES" fica entre o nó atual e a bandeira de início, com a mesma cor do cabeçalho do capítulo; parece um segundo cabeçalho e empurra o início para fora da tela.
- Correção: divisor fino com rótulo; guia no botão do cabeçalho (ID-9.2).
- Onde: `components/trail/SectionDivider.jsx`.

### UX-36. Meta diária nunca é escolhida pelo usuário (P0, junto com UX-01)
- Evidência: meta fixa em 20 XP (`core/store.js` linha 23) e a escolha fica no fim das Configurações, abaixo da dobra (`78-config`, `79-config-fim`).
- Correção: escolha no onboarding (passo 3) e no topo do popover do XP.
- Onde: `screens/Onboarding.jsx`, `components/shell/HudPopover.jsx`.

### UX-37. Opções de pares ficam apagadas sem celebração clara (P1)
- Evidência: `18-fb-ok-match`: ao terminar, todas as células ficam cinza claro como se estivessem desabilitadas.
- Correção: par certo pisca verde e encolhe; no fim, as células somem em cascata (ID-9.6).
- Onde: `components/exercises/Match.jsx`, `ui/MatchCell.jsx`.

### UX-38. "Ouvir devagar" escrito, sem ícone (P1)
- Evidência: `23-licao-4-ex-listen`: "DEVAGAR" em texto azul de 13 px abaixo do balão.
- Correção: botão 64x64 com tartaruga (SVG), como `refs/51a0685b` (ID-9.6).
- Onde: `components/ui/AudioButton.jsx`.

### UX-39. Bloco de leitura longo (P2)
- Evidência: `41-licao-12-ex-read`: parágrafo de 5 linhas antes da pergunta.
- Correção: frases em balões por personagem com áudio por frase (ID-9.6).
- Onde: componente do formato `read`.

### UX-40. Trilha não indica o que vem depois da lição (P2)
- Evidência: `49-trilha-apos-licao`: o próximo nó é uma cena (ícone de balão) sem explicação do que é uma cena.
- Correção: na primeira cena, o popover diz "Cena: converse em inglês como Jesus" com os dois bustos.
- Onde: `components/trail/NodePopover.jsx`.

### UX-41. Ficha do personagem: textos pequenos e ações secundárias fracas (P1)
- Evidência: `72-ficha`, `73-ficha-licoes`: botão fechar 36; "PRATICAR COM ADÃO" link de 40 px; abas com sublinhado fino.
- Correção: fechar 44; abas com caixa deslizante; link com alvo 44 (ID-9.15).
- Onde: `components/characters/CharacterSheet.jsx`.

### UX-42. X da lição em cinza fraco (P2)
- Evidência: `13-licao-1-ex-choice-en-pt`: X `#afafaf` 24 px (2,19:1).
- Correção: X 28 em `muted` com alvo 44.
- Onde: `screens/Lesson.jsx`.

### UX-43. Regra das estrelas não é explicada (P1)
- Evidência: `46-resultado`: precisão 87% dá 2 estrelas sem dizer por quê; no nó concluído aparecem "★★☆".
- Correção: toque nas estrelas abre dica "3 estrelas: sem erros"; no popover do nó concluído, "Refaça sem erros para 3 estrelas".
- Onde: `screens/Result.jsx`, `components/trail/NodePopover.jsx`.

### UX-44. Configurações: tema como lista seca (P2)
- Evidência: `78-config`: Claro, Escuro, Automático em linhas com ícone e check.
- Correção: 3 cards com miniatura do app em cada tema (ID-9.16).
- Onde: `components/profile/ConfigModal.jsx`.

---

## Avaliação dos bustos (ver ID-5.4)

Revisados os 44 sobre fundo magenta, escuro e branco (`scratchpad/ux-audit/m/busts-mag.jpg`, `busts-zoom.jpg`) e medida a fração de pixels semitransparentes por arquivo. Reserva em retrato redondo: `isaias` (estilo chapado), `joaobatista` (semi/opaco 4,7, fundo escuro residual). Limpar antes de usar: `abraao`, `moises`, `elias`, `rute`, `noe`. Os outros 37 estão bons.

## Ilustração 3D (ver ID-4)

O pacote `@lobehub/fluent-emoji-3d` está instalado em `app/node_modules/@lobehub/fluent-emoji-3d/assets/` (não em `package/assets/`). Todos os codepoints da tabela ID-4.4 e ID-4.5 foram conferidos no diretório.
