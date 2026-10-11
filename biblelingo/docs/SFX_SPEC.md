# SFX SPEC: design sonoro do BíbliaLearn (v2)

Versão 2.1 (11 de outubro de 2026; 2.0 de 3 de outubro). Especificação do redesenho completo dos efeitos sonoros e dos haptics do app React (`biblelingo/app`), a pedido do dono: "vamos trabalhar agora os sons: som de clique, sons de resposta, todos os sons; precisamos refazer e melhorar". Alvo: a sensação do Duolingo real, com a limpeza da Nintendo. Sons curtos, limpos, alegres, que não cansam.

Fonte da verdade do catálogo: `tools/sfx/sounds.json` (legível por máquina: receitas de síntese determinísticas, alvos de loudness, haptics e prompts para o ElevenLabs). Este documento explica os princípios, o inventário de interações, a mixagem, o formato de entrega, as regras de implementação do `sfx.js` v2, o plano de A/B e o checklist de aceitação.

Mudanças da 2.1: inventário conferido de novo contra o código atual (linhas atualizadas; entram cenas, rodapé, divisória de seção, guia, troféu, baú da trilha, nó bloqueado, compartilhar e reportar, toasts por origem); regra dos sons de acompanhamento (`companion`) para resolver clique + sheet e CONTINUAR + troca de exercício; `sheet-open` sem clique próprio nem haptic; `durationMs` de 18 sons alinhado ao fim real do envelope (o checklist reprovaria os antigos); toda entrada de `sounds.json` passa a ter `variants`; correções no rodapé (CONTINUAR hoje está mudo), no `Sheet` (som duplicado no modal de corações) e nos botões de pular e de repetir áudio das cenas.

Documentos irmãos: `docs/VISUAL_SPEC.md` seção 7 (movimento: o som dispara no frame em que a animação começa) e seção 8 (mapa antigo evento, som, haptic, que esta spec substitui); `docs/AUDIO_SPEC_V2.md` seção 8 (vozes a -16 LUFS, SFX a -18 LUFS, limitador). Convenções: português do Brasil com acentos; sem travessão; referências a código como `arquivo:linha`; comandos assumem a raiz `biblelingo/`.

## Sumário

1. Princípios
2. Inventário de interações (evento, som, haptic, gatilho, prioridade)
3. Catálogo (resumo de `sounds.json`)
4. Mixagem e loudness
5. Formato de entrega
6. Implementação (`sfx.js` v2, `haptics.js`, componentes)
7. Pipeline de produção (`tools/sfx`)
8. Plano de A/B: sintetizado x ElevenLabs
9. Checklist de aceitação
Anexo A: esquema da receita de síntese
Anexo B: estado atual (o que está errado hoje)

---

## 1. Princípios

1. **Uma paleta tonal.** Tudo que tem altura definida vive na escala de dó maior pentatônica (C, D, E, G, A). Qualquer combinação de sons que toque junta ou em sequência soa consonante: a peça (C5), o par (G5), o acerto (G5 para C6), o combo (C6, E6, G6, C7), a fanfarra (C5, E5, G5, C6 e o acorde E6, G6, C7). O erro usa as mesmas notas uma ou duas oitavas abaixo (E3, C3), nunca uma nota estranha à escala. Registro: interface em C5 a C6; feedback em G5 a C7 (acerto) e C3 a E4 (erro); celebrações em C5 a C7 com metais sintéticos em G4 a C6.
2. **Três timbres, sempre os mesmos.** Madeira (marimba/xilofone: seno + parciais inarmônicos em 3,93 e 9,1 com decaimento de 90 ms e um clique de baqueta de 6 ms), sino (seno + parciais 2,76 e 5,4, leve detune de 6 cents, decaimento de 200 a 800 ms) e pop (seno com glide descendente de 60 ms, soft clip leve). Metais sintéticos (serra em uníssono + quadrada) só nas fanfarras. Nada de ruído branco cru: todo ruído passa por filtro e envelope curto (clique, sopro, estalo, cintilação).
3. **Ataque menor que 5 ms** em tudo que responde a um toque (cliques, pops, madeira: `a` entre 0,5 e 2 ms). Só os pads e sopros têm ataque lento (bless 80 ms, sheet 40 ms), porque acompanham animações e não toques.
4. **Sem cauda longa fora das celebrações.** Interface e feedback terminam em até 450 ms (correct 430, wrong 400; a cauda do sino do acerto é o que dá o brilho). Reverb só em finish, levelup e bless (mix de 10 a 18 %, 300 a 400 ms). Único som com cauda de verdade: o gongo (1,5 s), que é o fim de um jogo.
5. **Silêncio cortado e bordas limpas.** Cada arquivo começa no primeiro sample do ataque (rampa de 1 ms) e termina com rampa de saída de 5 a 80 ms; nada abaixo de -60 dBFS fica nas pontas; passa-altas no master tira DC e rumble.
6. **Contra o cansaço.** Os sons que tocam dezenas de vezes por lição são os mais quietos e os mais curtos: tap -22 LUFS, tap-soft -24, deselect -23, swoosh -24, tick -22. O acerto tem três variações (transpostas +2 e -3 semitons) sorteadas sem repetir a anterior; peças, pares, moedas e estrelas têm variantes por nota. O ganho por família é relativo: interface -4 dB, exercício -2 dB, transições -6 dB, feedback e celebração 0 dB.
7. **Um gesto, um transiente, um haptic.** Quem toca é o componente de UI compartilhado (`Button3D`, `Option`, `MatchCell`, `WordBankCore`, `Toggle`, `Sheet`, `Card`, `TabBar`); telas só disparam eventos sem componente (cerimônias, Result, cronômetro). Cada toque produz exatamente um som com ataque (clique, pop, nota) e no máximo um haptic. Todos os botões tocam clique (`tap` ou `tap-soft`), inclusive CONTINUAR; VERIFICAR não toca clique (o acerto ou o erro é a resposta imediata, no mesmo frame); botões de áudio, de repetir a fala e o microfone nunca tocam nada além da voz.
   - **Acompanhamento (`companion: true` em `sounds.json`):** `sheet-open`, `sheet-close` e `swoosh` são sopros sem transiente (ataque de 38 a 45 ms, -24 a -26 LUFS, sem haptic). Eles podem soar junto do clique do toque que os causou (botão que abre uma sheet; CONTINUAR que troca o exercício) e soam como um gesto só: "toc-fff". Um acompanhamento nunca vibra.
   - **Consequência imediata substitui o clique:** quando o toque produz, no mesmo frame, um som de resposta com ataque (`correct`, `wrong`, `start`, `select` de uma opção), o botão não toca clique (`sound={false}`). Casos: VERIFICAR, COMEÇAR do popover do nó (a sessão toca `start`).
   - **Consequência atrasada não substitui:** CONTINUAR que leva ao Result toca `tap-soft`, e o `finish` chega quando a tela entra; um botão que abre uma cerimônia toca o clique e a cerimônia toca o seu som.
8. **Som no frame zero da animação** (VISUAL_SPEC 7.2 regra 4): o som e o haptic disparam no gatilho, e a coreografia visual os segue; nunca no `onAnimationComplete`.
9. **Respeito ao usuário.** `state.sound` desliga tudo; `state.haptics` desliga a vibração; nenhum som toca antes do primeiro gesto (destravamento do WebAudio); o visual nunca depende do som nem do haptic.

---

## 2. Inventário de interações

Levantamento de `app/src` (telas, componentes, `core/session.js`, `core/store.js`, `App.jsx`) em 3 de outubro de 2026, conferido de novo em 11 de outubro (as linhas citadas são desse dia; outras equipes editam as telas em paralelo, então confira o trecho antes de inserir). "Hoje" descreve o que o código faz agora; "Som v2" é o evento canônico do catálogo; "Onde ligar" é o arquivo e componente que deve chamar `sfx()` e `haptic()`. Prioridade: P0 = a sensação principal (clique, resposta, peças, pares, resultado); P1 = celebrações e trilha; P2 = polimento.

### 2.1 Navegação e casca

| Interação | Som v2 | Haptic | Onde ligar | Hoje | Prioridade |
|---|---|---|---|---|---|
| Trocar de aba (barra inferior e sidebar) | `tab` | 8 | `App.jsx:85` (`go`), chamado por `shell/TabBar.jsx:31` e `shell/Sidebar.jsx:22` | `tap` + `select` | P1 |
| Tocar um nó da trilha ou o troféu do capítulo (abre o popover) | `node` | 8 | `trail/PathNode.jsx:57` (nó) e `:109` (`TrophyNode`) | `tap` + `select` | P0 |
| Tocar um nó bloqueado (popover cinza "conclua as anteriores") | `deselect` (pop descendente: "ainda não") | 6 | `trail/PathNode.jsx:57` (ramo `locked`) | `tap` | P1 |
| Popover do nó abrindo | `sheet-open` a 0,7 (acompanhamento do `node`) | nenhum | `trail/NodePopover.jsx` (ao montar) | nada | P2 |
| COMEÇAR / RETOMAR / PRATICAR no popover | `start` (o botão não toca clique: consequência imediata) | nenhum | `core/session.js:148` (`begin`); botão `on-unit` em `trail/NodePopover.jsx:82` passa `sound={false}` (com o novo padrão `tap-soft` dos botões grandes ele tocaria dois sons) | só `start` (o `on-unit` ainda não toca) | P0 |
| Toast "Conclua a etapa anterior primeiro" | `toast` | 8 | `core/session.js:169`, som em `ui/Snackbar.jsx` | só haptic | P2 |
| Baú da trilha (`TrailChest`) pronto, tocado | `chest` + `coin` (pelo `ui/Chest.jsx`) | `[30,40,60]` | `trail/PathNode.jsx:136`, `screens/Home.jsx:85` (`openChest`) | `sparkle` + `coin` | P1 |
| Baú da trilha bloqueado, tocado | `deselect` | 6 | `ui/Chest.jsx` (estado `locked`) | nada | P2 |
| Pílula "Retomar" na trilha | `start` | nenhum | `screens/Home.jsx:253` via `startLesson` | `start` | P1 |
| Estrelas do nó concluído (3 pops ao voltar) | `pair` com índice 0..2 | nenhum | `trail/PathNode.jsx:28` | `pop(i)` | P1 |
| Próximo nó desbloqueando | `unlock` | 8 | `trail/PathNode.jsx` (transição locked para available, 600 ms) | nada | P1 |
| Botão do guia do capítulo e sheet do guia | `tap` do botão + `sheet-open` (acompanhamento) / `sheet-close` | 8 (do botão) / nenhum | botão em `trail/UnitHeader.jsx:20` (`Button3D` icon); sheet em `ui/Sheet.jsx:34` (`useDialog`, ao abrir) e `onClose` (fechar) | `tap` do botão + `tap` do Sheet (dois cliques) | P1 |
| CTA do guia (Começar / Continuar) | `tap-soft` | 8 | `trail/UnitGuideSheet.jsx:29` (`Button3D` primary) | nada | P1 |
| Personagens e chips do guia | nenhum (toca a voz) | nenhum | `trail/UnitGuideSheet.jsx:50,75` | nada (correto) | P2 |
| Divisória de seção: "Ver detalhes" e escolher capítulo | `tap` + `sheet-open` (acompanhamento); `tap` no capítulo | 8 | `trail/SectionDivider.jsx:22` (`Button3D` secondary) e `:33` (botão nativo) | `tap` + `tap` do Sheet; nada no capítulo | P2 |
| "Ver todas" das missões na coluna direita (desktop) | `tap` | 8 | `shell/RightRail.jsx:33` (`Button3D` ghost) | `tap` | P2 |
| HUD: popovers de curso, ofensiva, XP, corações | `tap` + `sheet-open` a 0,7 (acompanhamento) / `sheet-close` | 8 | `shell/Hud.jsx:128` (`toggle`), `shell/HudPopover.jsx` | `tap` | P2 |
| Card clicável (Hub, Perfil, Missões) | `tap` | 8 | `ui/Card.jsx:22` | `tap` sem haptic | P1 |
| Botões secundários, ghost, ícone, neutros | `tap` | 8 | `ui/Button3D.jsx:78` | `tap` só nessas variantes | P0 |
| Botões primários grandes (CONTINUAR, Jogar de novo, Iniciar lições, cerimônias) | `tap-soft` | 8 | `ui/Button3D.jsx:78` (padrão para `primary`, `danger`, `accent`, `on-unit`) | nada | P0 |
| VERIFICAR | nenhum (a resposta é o som) | nenhum | `ui/FeedbackFooter.jsx:96`: trocar `sound={false}` por `sound={fb ? "tap-soft" : false}` (sem feedback o CTA é VERIFICAR; com feedback é CONTINUAR ou ENTENDI) | nada (correto) | P0 |
| CONTINUAR / ENTENDI do rodapé | `tap-soft` (+ `swoosh` de acompanhamento quando o exercício troca) | 8 | `ui/FeedbackFooter.jsx:96` (mesma regra acima) | nada: hoje o rodapé passa `sound={false}` também no CONTINUAR | P0 |
| "Explique minha resposta", "Praticar pronúncia" | `tap` | 8 | `ui/FeedbackFooter.jsx:91` (`Button3D` secondary) | `tap` | P2 |
| "Não posso ouvir agora" / "Não posso falar agora" | `tap` | 8 | `ui/FeedbackFooter.jsx:85` (tirar `sound={false}`) | nada | P1 |
| Compartilhar e Reportar no rodapé | `tap` | 8 | `ui/FeedbackFooter.jsx:66,71` (botões nativos: `sfx("tap")` + `haptic("tap")` no `onClick`) | nada | P2 |
| Botões de áudio (todas as variantes, tartaruga) | nenhum | nenhum | `ui/AudioButton.jsx` (nunca chama `sfx`) | nada (correto) | P0 |
| Microfone | nenhum | nenhum | `ui/MicButton.jsx`, `exercises/Speak.jsx:67` | nada (correto) | P0 |
| Toggle ligar / desligar | `toggle-on` / `toggle-off` | 8 | `ui/Toggle.jsx:13` | `tap` + `select` | P1 |
| Snackbar entrando | `toast`; `mission` a 0,7 quando `cls === "combo"` (missão concluída) | 8 | `ui/Snackbar.jsx:21`; `App.jsx:71` precisa repassar `cls` ao snack (hoje `toSnack` só usa `cls` para o ícone) | só haptic | P2 |
| Modal de corações abrindo (`HeartsSheet`) | `heart-empty` | `[80,40,80]` | `components/HeartsModal.jsx:44,45`; o `Sheet` recebe `sound={false}` | `tap` + haptic do `Sheet` e `heart-lost` do modal (dois sons, dois haptics) | P0 |
| Configurações: abrir, voltar, tema, meta, avatar | `tap` da engrenagem + `sheet-open` (acompanhamento); `tap` nos itens; `tap` no voltar | 8 | `profile/ConfigModal.jsx:78,113,114,127,172` | `tap` | P2 |
| Ligar "Efeitos sonoros" nas configurações | `correct` (demonstração) | 20 | `profile/ConfigModal.jsx:136,137` | `correct` / haptic | P2 |
| Perfil: calendário (mês anterior/seguinte), avatar, "ver todas" | `tap` | 8 | `screens/Profile.jsx:66,160,185`; engrenagem `:154` | `tap` (haptic só na engrenagem) | P2 |
| Personagens: abrir ficha (grade e carrossel) | `tap` do card + `sheet-open` (acompanhamento) | 8 | `screens/Characters.jsx:33,68`, `characters/CharacterSheet.jsx` | `tap` + `tap` do Sheet | P1 |
| Ficha do personagem: abas internas, ouvir o nome, fechar | `tab` nas abas; nenhum no nome (voz); `sheet-close` no fechar | 8 / nenhum / nenhum | `characters/CharacterSheet.jsx:36,44,60` | nada | P2 |
| Praticar (Hub): cards que iniciam sessão (Erros, Palavras, Escuta, Fala, cena) | `start` da sessão (o `tap` do card é absorvido pela regra de coalescência, 6.1 regra 11) | 8 | `screens/Hub.jsx:42` (`PracticeCard`), `:62` (cena); som em `core/session.js:148` | `tap` + `start` (dois transientes) | P1 |
| Praticar (Hub): Match Madness, História, abrir lista | Madness: `madness-start` (absorve o `tap`); História e lista: `tap` | 8 | `screens/Hub.jsx:42,137,196,204` | `tap` + haptic | P1 |
| Missões: abrir calendário, expandir, baú da missão | `tap`; baú: `chest` + `coin` | 8; `[30,40,60]` | `screens/Quests.jsx:81,143,168` | `tap`; baú só haptic | P1 |
| Chip de vocabulário, palavra clicável (`Sayable`), tooltip de dica | nenhum (toca a voz) | nenhum | `ui/Badge.jsx:42`, `exercises/Sayable.jsx:36`, `ui/HintTooltip.jsx:33` | nada (correto) | P2 |

### 2.2 Lição

| Interação | Som v2 | Haptic | Onde ligar | Hoje | Prioridade |
|---|---|---|---|---|---|
| Entrar na lição (tela sobe) | `start` | nenhum | `core/session.js:148` | `start` | P0 |
| Troca de exercício (novo conteúdo entra) | `swoosh` (acompanhamento do `tap-soft` do CONTINUAR) | nenhum | `screens/Lesson.jsx:118` | `swoosh` (start a 0,6) | P0 |
| Interstício de revisão | `start` (volume 0,8) | nenhum | `screens/Lesson.jsx:64` | `start` | P1 |
| Badge PALAVRA NOVA / card de palavra | `newword` | nenhum | `exercises/WordCard.jsx` (ao montar, 60 ms depois do swoosh) | nada | P1 |
| Selecionar opção (múltipla escolha, imagem, verdade, resposta de cena) | `select` | 8 | `ui/Option.jsx:37,65`, `exercises/Choice.jsx:79` | `select` + haptic | P0 |
| Desselecionar opção / trocar seleção | `deselect` quando a mesma opção é tocada de novo; `select` ao trocar | 6 | `ui/Option.jsx` (comparar `selected` antes de chamar) | `select` sempre | P1 |
| Pegar peça do banco (índice = posição na frase) | `tile(i)` | 8 | `ui/WordBankCore.jsx:61` | `tile` (select a 1,2 + 0,04 i) | P0 |
| Devolver peça ao banco | `tile-return` | 8 | `ui/WordBankCore.jsx:68` | `tile(0)` | P0 |
| Célula de pares: selecionar | `select` | 8 | `exercises/Match.jsx:42`, `ui/MatchCell.jsx` | `select` + haptic | P0 |
| Célula de pares: desselecionar (tocar a mesma) | `deselect` | 6 | `exercises/Match.jsx:46` (`selected.id === id`) | `select` | P1 |
| Par certo (índice = pares feitos) | `pair(i)` | 12 | `exercises/Match.jsx:54` | `pop(i)` + haptic | P0 |
| Par errado | `pair-wrong` | `[30,20,30]` | `exercises/Match.jsx:63` | só haptic `wrong` | P0 |
| VERIFICAR certo | `correct` (1 de 3) | 20 | `core/session.js:298,299` (`sfx`); haptic: trocar `buzz(25)` de `session.js:300` por `haptic("correct")` (respeita `state.haptics`) | `correct` + `buzz(25)` | P0 |
| Combo múltiplo de 5 | `combo` (no lugar do correct) | `[20,30,40]` | `core/session.js:296` | `combo` | P0 |
| VERIFICAR errado | `wrong` | `[50,30,50]` | `core/session.js:309`; haptic: trocar `buzz([60,40,60])` de `session.js:310` por `haptic("wrong")` | `wrong` + `buzz([60,40,60])` | P0 |
| Perder coração (150 ms depois do erro, coração treme) | `heart-lost` | `[30,20,60]` | `screens/Lesson.jsx` (`Hearts`, prop `lost`) | nada | P0 |
| Sem corações (1200 ms depois: sheet) | `heart-empty` | `[80,40,80]` | `components/HeartsModal.jsx:44` | `heart-lost` | P0 |
| Pular (exercício de fala ou escuta) | `tap` | 8 | `Button3D`; `scenes/SceneSpeak.jsx:74` tira `sound={false}` | `tap` na lição; nada na cena | P2 |
| Alternar peças / teclado | `tap` | 8 | `exercises/WordBank.jsx:47` (tirar `sound={false}`), `scenes/SceneBuild.jsx:64` (já toca) | inconsistente: muda na lição, `tap` na cena | P2 |
| Digitar (TypeInput, modo teclado) | nenhum por tecla | nenhum | `exercises/TypeInput.jsx` | nada (correto) | P2 |
| Cenas: opções, peças | `select` / `tile(i)` e `tile-return` (pelos componentes compartilhados) | 8 | `scenes/shared.jsx:214` (`Option`), `scenes/SceneBuild.jsx:82` (`WordBankCore`) | `select` / `tile` | P0 |
| Cenas: balão de chat tocável, chips de vocabulário | nenhum (toca a voz) | nenhum | `scenes/shared.jsx:69,233` | nada (correto) | P1 |
| Cenas: botão "ouvir de novo" (`Button3D` secondary com ícone de alto-falante) | nenhum: é botão de áudio | nenhum | `scenes/SceneTruth.jsx:52` passa `sound={false}` | `tap` antes da voz (errado) | P1 |
| Começar sem corações (lição ou nível) | `heart-empty` (pelo modal) | `[80,40,80]` | `core/session.js:163,565` emitem `hearts-modal`; som em `components/HeartsModal.jsx` | `tap` + `heart-lost` | P1 |
| Toast de missão durante a lição (900 ms depois do fim) | `mission` a 0,7 | 8 | `core/session.js:72` (`cls "combo"`), som em `ui/Snackbar.jsx` | nada | P2 |
| Toasts informativos (escuta/fala pausadas, desafio extra, sem erros pendentes) | `toast` | 8 | `core/session.js:241,253,344,546`, som em `ui/Snackbar.jsx` | só haptic | P2 |
| Boa pronúncia (fala) | `correct` | 20 | `screens/Lesson.jsx:182` | `correct` | P1 |
| Karaokê, falas automáticas, balão do personagem | nenhum | nenhum | `exercises/CharacterBubble.jsx`, cenas | nada (correto) | P0 |
| Sair da lição (X) e confirmar | `tap` (ícone) e `tap-soft` (confirmar) | 8 | `Button3D` | `tap` | P2 |

### 2.3 Resultado e cerimônias

| Interação | Som v2 | Haptic | Onde ligar | Hoje | Prioridade |
|---|---|---|---|---|---|
| Result entra (t = 0) | `finish` | `[40,30,40,30,80]` | `screens/Result.jsx:88` | `finish` + haptic | P0 |
| Estrelas 1..3 (450 / 630 / 810 ms) | `star(i)` (C6, E6, G6) | 15 | `screens/Result.jsx:100` | `star(i)` (sparkle com pitch) | P0 |
| Cards de estatística (700 / 820 / 940 ms) | `stat(i)` | nenhum | `screens/Result.jsx:164` | `pop(i)` | P1 |
| Baú abrindo (t = 80 ms da sequência) | `chest` | `[30,40,60]` | `ui/Chest.jsx:29,37` | `sparkle` + haptic | P0 |
| Moedas voando (150 ms, 3 a 8 moedas, passo 40 ms) | `coin` (1 de 3 por moeda; no máximo 3 chamadas, uma a cada 120 ms) | nenhum | `ui/Chest.jsx:50` | `coin(i)` (pop) | P1 |
| Card XP recebendo o bônus (pulsa) | `pair(6)` | nenhum | `ui/Chest.jsx` (`onReward`) | nada | P2 |
| Bênção aparecendo (1900 ms, antes da voz) | `bless` | nenhum | `screens/Result.jsx:102` (300 ms antes do `speak`) | nada | P1 |
| CONTINUAR do Result | `tap-soft` | 8 | `screens/Result.jsx:239` via `Button3D` | nada | P0 |
| Revisão da etapa (expandir) | `tap` | nenhum | `screens/Result.jsx:210` | `tap` | P2 |
| Ofensiva (`StreakScreen`, 100 ms) | `streak` | `[40,30,40,30,120]` | `ceremonies/StreakScreen.jsx:14` | `streak` (finish) | P0 |
| Meta diária (`DailyGoalScreen`, 900 ms, anel fecha) | `goal` | `[30,40,60]` | `ceremonies/DailyGoalScreen.jsx:17` | `sparkle` + haptic `mission` | P1 |
| Coroa / subir de nível (`CrownScreen`, 0 ms) | `levelup` | `[40,30,40,30,120]` | `ceremonies/CrownScreen.jsx:18` | `levelup` (finish a 1,1) | P1 |
| Missão concluída (`MissionScreen`) | `mission` | 8 | `ceremonies/MissionScreen.jsx:17`, `screens/Quests.jsx:81` | `mission` (sparkle) | P1 |
| Toque na cerimônia que pula a animação | nenhum | nenhum | `ceremonies/Ceremony.jsx:36` | nada | P2 |
| Toast "Missão concluída" fora da lição | `mission` (volume 0,7) | 8 | `ui/Snackbar.jsx` com `cls === "combo"` (repassado por `App.jsx:71`) | nada | P2 |
| CONTINUAR das cerimônias | `tap-soft` | 8 | `ceremonies/Ceremony.jsx:42` (`Button3D` primary cta, novo padrão) | nada | P1 |

### 2.4 Match Madness e História

| Interação | Som v2 | Haptic | Onde ligar | Hoje | Prioridade |
|---|---|---|---|---|---|
| Início do Madness e "Jogar de novo" | `madness-start` | `[20,30,20]` | `screens/Madness.jsx` (montagem e `again`, `:132`) | nada | P1 |
| Selecionar célula | `select` | 8 | `screens/Madness.jsx:91` | `select` | P0 |
| Par certo | `pair(i % 7)` | 12 | `screens/Madness.jsx:105` | `pop(ns % 8)` | P0 |
| Par errado (-2 s) | `pair-wrong` | `[30,20,30]` | `screens/Madness.jsx:116` | `wrong` | P0 |
| Últimos 10 s (um por segundo) | `tick` | 6 | `screens/Madness.jsx:62` | `tick` (tap a 1,5) | P1 |
| Fim (tempo zerado) | `gong` | `[40,30,80]` | `screens/Madness.jsx:76` | `gong` (finish a 0,7) | P1 |
| Recorde (confete) | `mission` 300 ms depois do gongo | nenhum | `screens/Madness.jsx` (`setEnd`, `record`) | nada | P2 |
| Sair / Voltar | `tap` | 8 | `screens/Madness.jsx:158,208` | `tap` | P2 |
| História: balão novo (beat de fala) | `bubble` | nenhum | `screens/Story.jsx:58` (`SpeechBeat` ao montar com `current`) | nada | P1 |
| História: pergunta certa / errada | `correct` / `wrong` | 20 / `[50,30,50]` | `screens/Story.jsx:136,137` | `correct` / `wrong` + haptic | P0 |
| História: fim (XP) | `finish` | `[40,30,40,30,80]` | `screens/Story.jsx:121` | `finish` | P1 |
| História: CONTINUAR entre beats | `tap-soft` | 8 | `Button3D` | nada | P1 |

### 2.5 Sem som, de propósito

Karaokê e falas (a voz é o som), botões de áudio e tartaruga, microfone e gravação, palavras clicáveis, chips de vocabulário, tooltips, scroll da trilha, `whileInView` dos capítulos, `CountUp` dos números, barras e anéis de progresso (exceto o fechamento da meta), reações do personagem (happy, sad), confete (o som é o do evento que o disparou), toques que pulam animação de cerimônia.

---

## 3. Catálogo (resumo de `tools/sfx/sounds.json`)

38 sons, 48 arquivos no sprite (contando variantes; toda entrada de `sounds.json` tem `variants`, com uma única variante de mesmo nome quando o som não varia). `role` define a família de mixagem (seção 4); `companion: true` marca os acompanhamentos (princípio 7). A duração é o fim real do envelope da receita (o arquivo final); a parte audível de um `tile` ou `pair` é bem mais curta (os 40 a 60 ms finais são a cauda da madeira abaixo de -30 dB). Alvo de loudness em LUFS (janela M para sons de até 1 s, S para os longos). Haptics alinhados a `core/haptics.js`.

| Nome | Variantes / índice | Papel | Duração (ms) | LUFS | Haptic | Como soa |
|---|---|---|---|---|---|---|
| `tap` | | ui | 30 | -22 | 8 | clique seco e macio, sem tom |
| `tap-soft` | | ui | 45 | -24 | 8 | "tum" grave e redondo dos botões grandes |
| `select` | | ui | 80 | -20 | 8 | pop claro E6 para A5 com clique |
| `deselect` | | ui | 70 | -23 | 6 | pop menor A5 para E5 |
| `toggle-on` / `toggle-off` | | ui | 60 | -22 / -23 | 8 | clique + blip subindo / descendo |
| `tab` | | ui | 55 | -22 | 8 | clique um fio mais claro que o tap |
| `node` | | ui | 80 | -20 | 8 | "bloop" grave (400 para 250 Hz) |
| `sheet-open` / `sheet-close` | | ui (acompanhamento) | 180 / 160 | -24 / -26 | nenhum | sopro subindo / descendo, sem clique |
| `toast` | | ui | 240 | -24 | 8 | dois sininhos E6, G6 |
| `bubble` | | ui | 120 | -24 | nenhum | plop de mensagem G5 para C6 |
| `tile` | tile-1..3 (C5, E5, A5); ladder C5 D5 E5 G5 A5 C6 | exercise | 120 | -20 | 8 | nota de madeira que sobe com a posição |
| `tile-return` | | exercise | 95 | -22 | 8 | madeira fosca caindo para A4 |
| `pair` | pair-1..3 (G5, C6, E6); ladder G5 A5 C6 D6 E6 G6 A6 | exercise | 155 | -19 | 12 | pop de bolha com tom, sobe a cada par |
| `pair-wrong` | | exercise | 170 | -20 | `[30,20,30]` | "buh" duplo abafado E4, C4 |
| `start` | | feedback | 350 | -18 | nenhum | madeira C5 + sino G5 + sopro |
| `correct` | correct-1..3 (0, +2, -3 semitons) | feedback | 430 | -18 | 20 | "ta-ding" G5 madeira, C6 sino |
| `combo` | | feedback | 600 | -17 | `[20,30,40]` | arpejo de sinos C6 E6 G6 C7 + brilho |
| `wrong` | | feedback | 400 | -18 | `[50,30,50]` | "bonk-bonk" E3, C3 |
| `heart-lost` | | feedback | 250 | -19 | `[30,20,60]` | nota grave caindo A3 para E3 |
| `heart-empty` | | feedback | 700 | -18 | `[80,40,80]` | três madeiras descendo G4 E4 C4 + baque |
| `tick` | | feedback | 40 | -22 | 6 | bloco de madeira agudo |
| `swoosh` | | transition (acompanhamento) | 180 | -24 | nenhum | sopro rosa subindo |
| `newword` | | transition | 455 | -21 | nenhum | dois sininhos D6, A6 + brilho |
| `finish` | | celebration | 1400 | -16 (S) | `[40,30,40,30,80]` | fanfarra: arpejo C5 E5 G5 C6 + acorde E6 G6 C7 |
| `star` | star-1..3 (C6, E6, G6) | celebration | 365 | -17 | 15 | sino com "ping" |
| `stat` | índice por rate (C5, E5, G5) | celebration | 80 | -22 | nenhum | pop grave e curto |
| `chest` | | celebration | 745 | -17 | `[30,40,60]` | tranca + glissando de sinos C6 a A6 |
| `coin` | coin-1..3 (0, +3, +5) | celebration | 235 | -20 | nenhum | "pi-ping" A5, D6 metálico |
| `bless` | | celebration | 500 | -22 (S) | nenhum | pad quente C5 G5 C6 com reverb |
| `streak` | | celebration | 800 | -16 (S) | `[40,30,40,30,120]` | fogo (sopro + estalos) + sino G5, C6 |
| `goal` | | celebration | 665 | -17 | `[30,40,60]` | glissando C5 a C6 + sino + brilho |
| `levelup` | | celebration | 900 | -16 (S) | `[40,30,40,30,120]` | fanfarra de metais G4 C5 E5 G5 + acorde C6 |
| `mission` | | celebration | 495 | -18 | 8 | três sinos E6 G6 C7 |
| `unlock` | | celebration | 505 | -19 | 8 | clique de cadeado + sino G5 |
| `madness-start` | | celebration | 500 | -17 | `[20,30,20]` | quatro pops subindo + sopro |
| `gong` | | celebration | 1500 | -16 (S) | `[40,30,80]` | gongo FM em C3 com cauda |

Aliases (nomes legados aceitos pelo runtime): `pop` = `pair`, `sparkle` = `mission`, `card` = `tap`, `popover-open` = `sheet-open`, `popover-close` = `sheet-close`, `heart-lost-all` = `heart-empty`, `madness-pair` = `pair`, `madness-wrong` = `pair-wrong`, `node-done` = `pair`.

Cada entrada do JSON traz ainda `description` (como soa, em português), `reference` (como o Duolingo soa nesse momento), `recipe` (receita determinística; Anexo A) e `elevenPrompt` (texto em inglês, duração e `prompt_influence` para gerar candidatos por IA).

---

## 4. Mixagem e loudness

### 4.1 Alvos por família

| Família (`role`) | Alvo LUFS | Ganho relativo no runtime | Exemplos |
|---|---|---|---|
| ui | -22 a -26 | -4 dB | tap, tab, toggle, sheet, toast |
| exercise | -19 a -22 | -2 dB | tile, pair, select (select é ui mas a -20) |
| feedback | -17 a -19 | 0 dB | correct, wrong, combo, heart-lost, start |
| transition | -21 a -24 | -6 dB | swoosh, newword |
| celebration | -16 a -18 (S) | 0 dB | finish, streak, levelup, chest, gong |

As vozes estão a -16 LUFS integrado (AUDIO_SPEC_V2 seção 8.1). Os efeitos ficam 2 dB abaixo da voz no feedback e no mesmo nível nas celebrações (que nunca tocam junto da voz, exceto `bless`, que é 6 dB mais baixo e termina antes da fala). Interface fica 6 a 10 dB abaixo da voz: um clique nunca compete com a frase que está tocando.

### 4.2 Como medir

- LUFS: `ffmpeg -i X.wav -af ebur128=peak=true:meter=18 -f null -` e ler `Momentary` máximo (janela M, para sons de até 1 s) ou `Short-term` máximo (janela S, para os longos: finish, streak, levelup, gong, bless). Tolerância: ±1 dB do alvo em `sounds.json`.
- Pico real: a mesma saída, `True peak` <= -1,0 dBTP (campo `truePeakMax`).
- O sintetizador normaliza por ganho simples (mede, aplica `alvo - medido`) e só depois passa o limitador `alimiter=limit=0.891:attack=1:release=20` (-1 dBTP) se o pico ultrapassar o limite. Em sons de 35 a 90 ms o pico manda: o ganho é limitado pelo pico antes do LUFS, e o valor medido pode ficar 1 a 2 dB abaixo do alvo; é aceitável e registrado em `tools/sfx/report.json`.

### 4.3 Sobreposição

- Mesmo nome dentro de 30 ms: a segunda chamada é ignorada (debounce por nome base).
- Sons diferentes se somam livremente (select + swoosh, correct + tap-soft do CONTINUAR não ocorrem juntos por desenho). Para o pior caso real (`combo` + `pair` + `tick` no Madness) a soma de -17, -19 e -22 LUFS fica abaixo de -14 LUFS e sob o limitador de cada arquivo não passa de -1 dBTP cada; o `GainNode` mestre a 0,9 deixa 0,9 dB de folga.
- Polifonia máxima: 8 fontes simultâneas; a nona chamada derruba a mais antiga da família `ui`.

---

## 5. Formato de entrega

### 5.1 Sprite v2

- `audio/sfx/sfx-v2.ogg`: Vorbis `-q:a 5` (~160 kbps VBR), 44 100 Hz, mono. 48 sons com 100 ms de silêncio entre eles. O runtime toca cada trecho com `source.start(0, início, duração)`, em segundos do buffer, então mudar o `playbackRate` nunca invade o vizinho; o gap só absorve o vazamento do codec nas bordas. Tamanho estimado: 16,4 s de áudio + 4,8 s de gaps = 21 s, ~250 a 300 KB em Vorbis q5 (silêncio custa quase nada) e ~330 KB em AAC 128 kbps.
- `audio/sfx/sfx-v2.m4a`: AAC-LC 128 kbps, 44 100 Hz, mono, `-movflags +faststart`, para Safari (que não decodifica Vorbis). Codificado a partir do mesmo PCM, com os mesmos offsets; o build confere o atraso de priming do AAC decodificando o `.m4a` com ffmpeg e medindo o onset de cada som (tolerância 3 ms; se passar, o build aplica a correção no mapa `.m4a` em vez de confiar no edit list).
- `audio/sfx/sfx-v2.json`: `{ "tap": ["sfx-v2.ogg", 0.000, 0.035], "correct-1": ["sfx-v2.ogg", 2.450, 0.350], ... }` no formato de `audio/sprites.json` (nome, arquivo, início em s, duração em s). O runtime troca a extensão para `.m4a` quando `audio.canPlayType('audio/ogg; codecs="vorbis"')` devolve vazio. Se o build detectar offsets diferentes para o AAC, grava `sfx-v2.m4a.json` e o runtime carrega esse.
- Os três arquivos são versionados pelo nome (`sfx-v2`) e entram na lista de pré-cache do `sw.js` (hoje o `sw.js:34` já serve `/audio/*` do cache).

### 5.2 Reserva embutida (`sfx-data.js`)

- Regenerar `biblelingo/sfx-data.js` (único arquivo do app clássico que esta tarefa pode tocar) com os 6 sons essenciais para a lição funcionar antes de o sprite chegar: `tap`, `select`, `tile-1`, `pair-1`, `correct-1`, `wrong`. WAV PCM 16 bits mono a 22 050 Hz, base64. Orçamento: 30 + 80 + 120 + 155 + 430 + 400 ms = 1,2 s de áudio = 54 KB de PCM = 72 KB em base64, abaixo do teto de 150 KB (o arquivo atual tem 132 KB com 9 sons). Se passar de 150 KB, cortar `correct-1` e `wrong` com fade de 20 ms em 300 ms (a reserva só precisa reconhecer o desenho de duas notas).
- O `sfx.js` v2 mapeia os demais nomes para o essencial mais próximo enquanto o sprite não decodificou (`tap-soft`, `tab`, `node`, `toggle-*` para `tap`; `deselect`, `stat` para `select`; `tile-*`, `tile-return` para `tile-1`; `pair-*`, `coin-*`, `star-*`, `mission`, `toast`, `bubble` para `pair-1`; `combo`, `start`, `finish`, `goal`, `levelup`, `streak`, `chest`, `unlock`, `madness-start`, `newword` para `correct-1`; `heart-lost`, `heart-empty`, `pair-wrong`, `gong` para `wrong`; `swoosh`, `sheet-*`, `bless`, `tick` ficam mudos até o sprite).
- O app clássico (`biblelingo/sfx.js`) continua funcionando com os mesmos 6 nomes? Não: ele usa `tap`, `select`, `correct`, `wrong`, `combo`, `pop`, `finish`, `sparkle`, `start`. Para não quebrá-lo sem editar `sfx.js`, o `sfx-data.js` regenerado exporta também esses 9 nomes como aliases apontando para os mesmos dados (`combo` e `finish` para `correct-1`, `pop` e `sparkle` para `pair-1`, `start` para `correct-1`): o objeto cresce em chaves, não em bytes.

### 5.3 Masters e candidatos

- `tools/sfx/out/<nome>.wav`: masters sintetizados a 44 100 Hz, 32 bits float antes do loudness, 16 bits depois. Entram no git (48 arquivos, ~1,5 MB) porque o build do sprite precisa deles no GitHub Actions sem rodar o sintetizador de novo.
- `tools/sfx/candidates/<nome>-el-<n>.mp3`: candidatos do ElevenLabs (seção 8), 3 por som. Ficam fora do git (`.gitignore`) exceto os escolhidos, copiados para `tools/sfx/chosen/`.

---

## 6. Implementação

### 6.1 `app/src/core/sfx.js` v2

API pública mantida: `sfx(name, arg)`, `SFX` (proxy legado), `unlock()`, `soundEnabled()`; novos: `preload()`, `sfxCatalog` (importado de `core/sfxCatalog.js`, gerado por `tools/sfx/build-sfx.mjs` a partir de `sounds.json`: variantes, ladders, família, ganho relativo, aliases).

Regras:

1. **Nome base, variante sorteada.** `sfx("correct")` escolhe entre `correct-1..3` sem repetir a última escolhida (guarda `lastVariant[name]`). O sorteio usa `Math.random()` só aqui, no runtime, nunca na síntese.
2. **Índice.** `sfx("tile", i)`, `sfx("pair", i)`, `sfx("star", i)`, `sfx("stat", i)` aplicam a regra `index` do catálogo: nota alvo = `ladder[min(i, ladder.length - 1)]`; `pick: "nearest-variant"` escolhe a variante com a nota mais próxima e corrige o resto com `playbackRate = 2^(semitons/12)` (nunca mais que `maxSemitones`); `pick: "rate"` usa a única amostra. `pop(i)` legado continua funcionando (alias `pair`).
3. **Debounce de 30 ms por nome base.** Guarda `lastAt[name]` em `ctx.currentTime`; chamadas repetidas dentro da janela retornam `false`. Evita o duplo clique do `pointerdown` + `click` e o toque que dispara seleção e card ao mesmo tempo.
4. **Ganho.** `volume = masterGain (0,9) x 10^(familyDb/20) x (arg.volume ?? 1)`. Um `GainNode` mestre único ligado a `ctx.destination`; cada fonte tem o seu `GainNode` de volume.
5. **Pré-carga no primeiro gesto.** O listener de `pointerdown`/`touchend`/`keydown` em captura (já existe) chama `unlock()`, que: retoma o contexto, liga o keep-alive do iOS, decodifica os 6 WAV de reserva e dispara `preload()` (busca `sfx-v2.json`, escolhe `.ogg` ou `.m4a`, decodifica uma vez). Nada toca antes do primeiro gesto. Em `visibilitychange` para visível, retoma o contexto de novo (iOS suspende ao trocar de app).
6. **Prioridade de fonte.** Sprite decodificado > WAV de reserva decodificado > `<audio>` HTML com o WAV (só se o WebAudio falhar). O mapeamento de reserva da seção 5.2 vale para as duas últimas camadas.
7. **`state.sound`.** Verificado em cada chamada; desligado, `sfx()` retorna `false` sem tocar nem criar contexto. Ligar o som nas configurações toca `correct` como demonstração.
8. **Sem som duplicado por interação.** Só componentes de `components/ui` e os pontos listados na seção 2 chamam `sfx()`. Um componente que recebe `onClick` e renderiza `Button3D` nunca chama `sfx("tap")` por conta própria. `Card` e `Option` são os únicos não-botões que tocam.
9. **Polifonia.** Lista de fontes ativas; acima de 8, a mais antiga da família `ui` é parada (`stop()`), nunca uma de feedback ou celebração.
10. **Log de testes.** Em `import.meta.env.DEV`, cada chamada que toca empurra `{ name, variant, rate, t, companion, absorbed }` em `window.__sfxLog` (máximo 200) para os testes de ponta a ponta contarem um transiente por toque (VISUAL_SPEC 7.6); um clique absorvido (regra 11) entra com `absorbed: true` e não conta.
11. **Coalescência de um frame (clique absorvido).** Sons da família `ui` que não são acompanhamento (`tap`, `tap-soft`, `tab`, `node`, `toggle-*`, `deselect`) não tocam na hora: entram numa fila pendente e tocam no próximo `requestAnimationFrame` (no máximo 16 ms de atraso, abaixo da latência de saída do próprio WebAudio, imperceptível). Se, antes desse frame, chegar um som que não é `ui` nem acompanhamento (`start`, `madness-start`, `correct`, `combo`, `wrong`, `select`, `tile`, `pair`, `chest`, `heart-empty`, cerimônias), o clique pendente é descartado. Entre dois `ui` no mesmo frame, só o primeiro toca. Acompanhamentos tocam na hora e não descartam nada. Efeito: VERIFICAR, COMEÇAR, os cards de prática e o card do Madness ficam com um transiente só, mesmo que o botão toque `tap` por padrão; os `sound={false}` desta spec continuam valendo como cinto e suspensório e para o haptic. O haptic do clique descartado não precisa ser cancelado: `navigator.vibrate` troca o padrão em curso pelo do som de resposta.

### 6.2 `app/src/core/haptics.js`

Adicionar ao mapa: `deselect: 6`, `"pair-wrong": [30, 20, 30]`, `"heart-empty": [80, 40, 80]` (manter `heart-lost-all` como alias), `goal: [30, 40, 60]`, `"madness-start": [20, 30, 20]`, `unlock: 8`, `tab: 8`, `node: 8`, `"tap-soft": 8`, `"toggle-on": 8`, `"toggle-off": 8`. Sem entrada para `sheet-open`, `sheet-close` e `swoosh` (acompanhamentos não vibram; o botão que abriu já vibrou). O `Sheet` deixa de chamar `haptic("tap")` em `useDialog`. Remover `buzz()` de `core/session.js:300,310` (o haptic de acerto e erro passa a ser disparado pelo rodapé, junto do som, com `haptic("correct")` 20 e `haptic("wrong")` `[50,30,50]`; `util.js:87` fica só para o app clássico).

### 6.3 Componentes compartilhados

- `ui/Button3D.jsx`: prop `sound` aceita `true`, `false`, `"tap"` ou `"tap-soft"`. Padrão: `"tap-soft"` para `primary`, `danger`, `accent` e `on-unit` em `size` `cta` ou `lg`; `"tap"` para `secondary`, `neutral`, `ghost`, `icon` e tamanhos `md`/`sm`. Haptic 8 em todo botão que toca som (hoje o `Button3D` não vibra). Atualizar o comentário de cabeçalho (`Button3D.jsx:9`), que ainda diz que CONTINUAR nunca toca.
- `ui/FeedbackFooter.jsx`: `:96` passa `sound={fb ? "tap-soft" : false}` (VERIFICAR mudo, CONTINUAR e ENTENDI com `tap-soft`); `:85` tira `sound={false}` do ghost; `:66` e `:71` (compartilhar, reportar) chamam `sfx("tap")` + `haptic("tap")`.
- `trail/NodePopover.jsx:82`: `sound={false}` (o `start` da sessão é o som; a regra 11 também cobriria).
- `scenes/SceneTruth.jsx:52`: `sound={false}` (botão de repetir áudio). `scenes/SceneSpeak.jsx:74` e `exercises/WordBank.jsx:47`: tirar `sound={false}` (pular e alternar teclado tocam `tap`).
- `ui/Option.jsx` e `exercises/Choice.jsx`: `deselect` quando a opção tocada já está selecionada; `select` nos demais casos.
- `ui/WordBankCore.jsx`: `sfx("tile", chosen.length)` ao pegar; `sfx("tile-return")` ao devolver.
- `exercises/Match.jsx`: `deselect` na mesma célula; `pair(m.length - 1)`; `pair-wrong` no erro (hoje não toca som).
- `ui/Toggle.jsx`: `toggle-on` / `toggle-off` conforme o novo valor.
- `ui/Sheet.jsx`: nova prop `sound` (padrão `true`). Com `true`: `sheet-open` ao abrir (substitui o `tap` + `haptic("tap")` de `useDialog`, `:34,35`) e `sheet-close` ao fechar (overlay, alça, arrasto ou Escape); sem haptic. Com `false`: mudo (quem abriu sem toque toca o próprio som). `HeartsModal` passa `sound={false}` e toca `heart-empty`.
- `ui/Card.jsx`: `tap` + `haptic("tap")`.
- `ui/Chest.jsx`: `chest` em vez de `sparkle`; `coin` até 3 vezes; `pair(6)` no `onReward`.
- `ui/Snackbar.jsx`: `toast` + haptic; `mission` a 0,7 quando `cls === "combo"` (missão concluída). `App.jsx:71` passa a incluir `cls` no objeto do snack.
- `shell/TabBar.jsx` e `shell/Sidebar.jsx` via `App.jsx` `go`: `tab`.
- `trail/PathNode.jsx`: `node` (`:57` e `TrophyNode` `:109`); `deselect` no nó bloqueado; estrelas com `pair(i)`; `unlock` na transição para disponível.
- `ui/Chest.jsx`: no estado `locked`, toque toca `deselect` + haptic 6 (vale para o baú da trilha e o das missões).
- `components/HeartsModal.jsx`: `heart-empty`.
- `screens/Lesson.jsx`: `heart-lost` quando `lost` muda (150 ms depois do erro); `newword` no `WordCard`.
- `screens/Result.jsx`: `stat(i)` no lugar de `pop(i)` (`:164`), `bless` 300 ms antes da fala.
- `core/session.js`: `:300` e `:310` trocam `buzz()` por `haptic("correct")` e `haptic("wrong")`; `:72` (missão) segue emitindo o toast com `cls "combo"`.
- `ceremonies/DailyGoalScreen.jsx:17`: `goal` no lugar de `sparkle`, haptic `goal`.
- `screens/Madness.jsx`: `madness-start` (montagem e "Jogar de novo"), `pair(i % 7)` no par certo (`:105`, hoje `pop(ns % 8)`), `pair-wrong` no erro (`:116`, hoje `wrong`).
- `screens/Story.jsx`: `bubble` ao montar o beat atual.

Regra de convivência: telas são editadas só com inserções mínimas (`Edit`), relendo o arquivo antes; o grosso fica em `core/` e `components/ui`.

---

## 7. Pipeline de produção (`tools/sfx`)

```
tools/sfx/
  sounds.json          catálogo (fonte da verdade)
  synth.mjs            node tools/sfx/synth.mjs [nome...]  : renderiza out/<variante>.wav a partir das receitas (Node 22, sem dependências; WAV com Buffer)
  measure.mjs          node tools/sfx/measure.mjs           : ffmpeg ebur128/astats em out/ e candidates/, grava report.json e falha no que viola o checklist
  build-sfx.mjs        node tools/sfx/build-sfx.mjs         : escolhe a fonte por choices.json, monta o sprite (ogg + m4a + json), regenera sfx-data.js (6 essenciais) e app/src/core/sfxCatalog.js
  gen-eleven.mjs       node tools/sfx/gen-eleven.mjs        : no GitHub Actions (ELEVENLABS_API_KEY), gera 3 candidatos por som em candidates/
  audition.html        página estática com um player por evento (sintetizado x candidatos) e o botão "escolher" que grava choices.json via copiar/colar
  choices.json         escolha por evento (seção 8)
  report.json          métricas da última medição
  out/                 masters sintetizados (git)
  candidates/          candidatos ElevenLabs (fora do git)
  chosen/              candidatos escolhidos (git)
```

Síntese (`synth.mjs`): oscilador por camada com fase contínua; `fm` modula a fase da portadora; `noise` usa um gerador xorshift com `seed` (pink por filtro de Paul Kellet, brown por integração vazada); `glide` exponencial entre as frequências; envelopes ADSR lineares com `hold`; biquads RBJ para os filtros com varredura exponencial de cutoff por sample; `unison` soma vozes com detune simétrico; `delay` com realimentação; `reverb` curto por quatro combs + dois all-pass; `softClip` por `tanh(x * (1 + 4 * drive)) / tanh(1 + 4 * drive)`; master: passa-altas, passa-baixas opcional, reverb, trim a -60 dBFS, rampas, normalização por LUFS (medida com ffmpeg, aplicada por ganho), limitador se preciso, dither TPDF ao gravar 16 bits. Variantes: `transpose` em semitons aplicado a todas as notas e `freqHz`; `seed + índice da variante` nos ruídos. Saída idêntica a cada execução (comparável por hash no CI).

Medição (`measure.mjs`) implementa a seção 9 e grava, por arquivo: duração, pico real, LUFS M/S, DC, amostras nas bordas, contagem de clipping, resultado.

---

## 8. Plano de A/B: sintetizado x ElevenLabs

1. **Geração.** `gen-eleven.mjs` roda só no workflow `.github/workflows/gen-sfx.yml` (disparo manual, `workflow_dispatch`, com o segredo `ELEVENLABS_API_KEY`; a chave nunca é pedida nem registrada). Para cada som do catálogo faz 3 chamadas `POST https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_128` com o `elevenPrompt` (`text`, `duration_seconds`, `prompt_influence`; sem `model_id`, sem `loop`), variando `prompt_influence` em 0,3 / 0,45 / 0,6 para explorar. 38 sons x 3 = 114 chamadas. O workflow publica `candidates/` como artefato do Actions.
2. **Pós-processo igual para os dois lados.** Cada candidato passa por `silenceremove` (limiar -50 dB), trim ao `durationMs` do catálogo (+20 % de folga; fade de saída de 20 ms), passa-altas, normalização ao mesmo LUFS e limitador. Só então entra na audição.
3. **Audição.** `audition.html` lista, por evento, o sintetizado e os 3 candidatos, cada um com botão de tocar e a tabela de métricas; o dono marca a escolha e cola o resultado em `choices.json`:
   ```json
   { "default": "synth", "correct": "synth", "wrong": "eleven:2", "streak": "eleven:1", "gong": "eleven:3" }
   ```
   `synth` usa `out/<variante>.wav`; `eleven:<n>` usa `candidates/<nome>-el-<n>.mp3` (copiado para `chosen/` ao escolher). Para sons com variantes, a escolha vale para o nome base; um candidato ElevenLabs vira as variantes por transposição de rate no build (`asetrate`/`atempo`), limitado a ±3 semitons.
4. **Critérios para preferir o ElevenLabs:** textura orgânica que a síntese não alcança (fogo do `streak`, gongo, tranca do `chest`, cadeado do `unlock`, sopros). Critérios para manter a síntese: tudo que precisa de nota exata na paleta (tile, pair, star, coin, correct, combo, finish, levelup) e os cliques (a IA tende a gerar cliques com cauda e ruído). Expectativa: 30 sintetizados, 8 da IA.
5. **Regra de aceitação:** um candidato só pode ser escolhido se passar no checklist da seção 9 depois do pós-processo.

---

## 9. Checklist de aceitação

Por arquivo (masters e candidatos escolhidos), verificado por `measure.mjs`:

| Métrica | Como medir | Critério |
|---|---|---|
| Duração | `ffprobe -show_entries format=duration` | entre 0,8 e 1,2 x `durationMs` do catálogo (gong e bless: até 1,3 x) |
| Pico real | `ffmpeg -af ebur128=peak=true -f null -` | <= -1,0 dBTP |
| Loudness | mesma saída, `Momentary` máx. (sons <= 1 s) ou `Short-term` máx. (longos) | alvo `lufsShort` ±1 dB (±2 dB em sons < 60 ms, onde o pico limita) |
| Clique de borda | `astats` nos primeiros e últimos 1 ms: `Peak level` | < -60 dBFS nas duas pontas; primeira amostra com módulo < 0,001 |
| DC | `astats` campo `DC offset` | módulo < 0,001 |
| Clipping | `astats` campos `Flat factor` e `Peak count` | `Flat factor` = 0 e no máximo 1 amostra no pico |
| Silêncio interno | `silencedetect=n=-60dB:d=0.06` | nenhum trecho silencioso > 60 ms, exceto em `heart-empty` e `pair-wrong` (pausas intencionais) |
| Espectro | `showspectrumpic` e `showwavespic` em `tools/sfx/report/` | inspeção visual: nada abaixo de 40 Hz acima de -40 dB; sem harmônicos de aliasing acima de 16 kHz |
| Determinismo | hash SHA-1 de `out/*.wav` em duas execuções | idêntico |
| Catálogo | `node -e` que lê `tools/sfx/sounds.json` (seção 9.1) | JSON válido; 38 sons; todos com `name`, `variants` não vazio, `role`, `durationMs`, `description`, `reference`, `recipe.layers` não vazio, `loudness.lufsShort`, `loudness.truePeakMax` = -1, `haptic` (número, lista ou null), `elevenPrompt` com `durationSeconds` entre 0,5 e 30 e `promptInfluence` entre 0 e 1; notas só em C, D, E, G, A; nenhum travessão |
| Acompanhamento | receita de quem tem `companion: true` | nenhuma camada com ataque < 30 ms; `haptic` null |

### 9.1 Validação do catálogo

```sh
node -e 'const j=JSON.parse(require("fs").readFileSync("tools/sfx/sounds.json","utf8"));const req=["name","variants","role","durationMs","description","reference","recipe","loudness","haptic","elevenPrompt"];let bad=0;for(const s of j.sounds){const m=req.filter(k=>!(k in s));const e=s.elevenPrompt;if(m.length||!s.variants.length||!s.recipe.layers.length||s.loudness.truePeakMax!==-1||!(e.durationSeconds>=0.5&&e.durationSeconds<=30)||!(e.promptInfluence>=0&&e.promptInfluence<=1)){bad++;console.log("falha",s.name,m)}}if(/\u2014/.test(JSON.stringify(j)))bad++;console.log(j.sounds.length,"sons,",j.sounds.reduce((n,s)=>n+s.variants.length,0),"arquivos,",bad?"FALHOU":"OK");process.exit(bad?1:0)'
```

### 9.2 No app

No app (Playwright, `app/scripts/e2e-course.mjs` e um `scripts/sfx-check.mjs` novo que lê `window.__sfxLog`):

- Um transiente por toque: cada clique em botão, opção, peça e célula produz exatamente uma entrada no log sem `companion` e sem `absorbed`; acompanhamentos (`sheet-open`, `sheet-close`, `swoosh`) podem aparecer junto.
- CONTINUAR produz `tap-soft` e, na troca de exercício, `swoosh`; abrir uma sheet por botão produz `tap` (ou `tap-soft`) + `sheet-open`, e um único `navigator.vibrate`.
- COMEÇAR do popover, cards de prática e Madness produzem só `start` / `madness-start` (o clique, se houver, entra `absorbed`).
- Modal de corações: só `heart-empty`, nenhum `tap` nem `sheet-open`.
- VERIFICAR não produz `tap`; o acerto produz uma entrada `correct-*` ou `combo`; o erro produz `wrong` e, 150 ms depois, `heart-lost`.
- Botões de áudio e microfone não produzem entrada alguma.
- `tile(i)` sobe de nota com `i`; `pair(i)` idem; `star(i)` toca C6, E6, G6 em frames distintos.
- Com `state.sound = false`, o log fica vazio durante uma lição inteira.
- O sprite v2 carrega em até 1,5 s em 3G rápido (~220 KB) e, antes disso, a reserva WAV responde em menos de 30 ms ao toque.
- `cd app && node scripts/e2e-course.mjs http://localhost:5179/ --only=u1l1,c-jesus-1,u1r` termina com "CURSO COMPLETO OK".
- Safari (iOS): o `.m4a` toca com os offsets do mapa; som toca com a chave de silencioso ligada (keep-alive); nenhum som antes do primeiro gesto.

---

## Anexo A: esquema da receita de síntese

Cada som tem `recipe: { layers: [...], master: {...} }`. Uma camada é um evento sonoro com um oscilador (ou ruído), um envelope e processamento próprio; sequências de notas são várias camadas com `at` diferente. Campos:

| Campo | Significado |
|---|---|
| `type` | `sine`, `triangle`, `square`, `saw`, `noise`, `fm` |
| `at` | deslocamento em ms (padrão 0) |
| `note` ou `freqHz` | altura; `note` em notação científica (C4 = 261,63 Hz) |
| `ratio` | multiplicador da frequência (parciais: 2,76 e 5,4 em sinos; 3,93 e 9,1 em madeira; 0,5 suboitava) |
| `detune` | cents; `unison: { voices, cents }` cria cópias espalhadas |
| `glide` | `{ to: nota | toHz, ms, curve: exp | lin }` varredura de tom |
| `adsr` | `{ a, d, s, r, hold }` em ms, `s` nível 0..1; duração = a + d + hold + r |
| `filter` | `{ type: lowpass | highpass | bandpass, cutoff, q, sweepTo, sweepMs }` biquad |
| `gain` | ganho linear da camada |
| `fm` | `{ ratio, index, indexDecayMs }` (só `type: fm`) |
| `noise` | `{ color: white | pink | brown, seed }` (só `type: noise`) |
| `delay` | `{ ms, feedback, mix }` |
| `softClip` | 0..1, drive de tanh |

Master: `highpassHz`, `lowpassHz` (opcional), `reverb: { ms, mix }` (só celebrações), `fadeOutMs` (>= 5), trim a -60 dBFS nas pontas. Variantes: lista obrigatória de `{ name, transpose }` em semitons (som sem variação: uma variante com o próprio nome e `transpose: 0`). `companion: true` (opcional, no nível do som): acompanhamento sem transiente. Índice: `{ ladder, base, pick: nearest-variant | rate, maxSemitones }`. Loudness: `{ lufsShort, truePeakMax, window: M | S }`.

## Anexo B: estado atual (o que está errado hoje)

- Os 9 WAV de `sfx-data.js` (gerados pelo `tools/gen-sfx` antigo, que não existe mais no repositório) são o único material: `tap` e `select` são bons de duração (2 KB) mas sem caráter; `correct` e `wrong` não têm o desenho de duas notas do Duolingo; `finish` (28 KB) é longo e sem brilho; não há sons para peças, pares errados, coração, estrelas, baú, moedas, ofensiva, meta, coroa, tique, gongo, toggles, sheets, abas, nem balão da História.
- `sfx.js` improvisa 19 eventos a partir dos 9 sons por mudança de `playbackRate` (tile = select a 1,2; tick = tap a 1,5; gong = finish a 0,7; swoosh = start a 0,6), o que muda o timbre e a duração junto com a altura e soa barato.
- `Button3D` toca `tap` só nas variantes secundárias; os botões primários (CONTINUAR, cerimônias, "Jogar de novo") não tocam nada, contra o pedido do dono.
- O par errado não tem som; o coração perdido não tem som próprio; o modal de corações toca `wrong` grave.
- `session.js:300,310` ainda usa `buzz()` direto (ignora `state.haptics`), duplicando o haptic que o rodapé deveria disparar.
- Sem sprite v2, sem normalização de loudness (os 9 WAV têm picos e níveis diferentes), sem debounce, sem log de testes.
- (11 de outubro) `FeedbackFooter.jsx:96` passa `sound={false}` também no CONTINUAR e no ENTENDI: o botão mais tocado do app é mudo.
- (11 de outubro) Dois transientes por toque: `Sheet` toca `tap` + haptic em `useDialog` além do botão que o abriu (guia, ficha de personagem, "Ver detalhes", configurações); o modal de corações soma `tap` do `Sheet` e `heart-lost`; cards de prática e de cena tocam `tap` e a sessão toca `start` no mesmo frame.
- (11 de outubro) Inconsistências de botão: "ouvir de novo" da cena (`SceneTruth.jsx:52`) toca `tap` antes da voz; "Pular" da cena de fala, "Não posso ouvir agora" e o alternador de teclado da lição estão mudos, enquanto o alternador da cena toca.
- (11 de outubro) O Madness usa `pop(ns % 8)` (8 degraus, um a mais que a escada de `pair`) e `wrong` no par errado; a meta diária toca `sparkle`; o Result toca `pop(i)` nos cards de estatística.
