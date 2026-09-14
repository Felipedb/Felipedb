# Análise forense: exercícios do Duolingo (2025/2026) e plano de execução do BíbliaLearn

Objetivo: dissecar como o Duolingo constrói uma lição hoje (tipos de exercício, sequência, micro-interações, feedback e recompensas), comparar com o estado atual do BíbliaLearn e transformar as lacunas em um plano de execução por fases.

Fontes: pesquisa em guias e wikis da comunidade (duoplanet, Duolingo Wiki, Class Central, Duolingo Investors) e conhecimento de produto; os números são os praticados pelo app em 2025/2026.

## 1. Anatomia de uma lição do Duolingo

| Elemento | Como o Duolingo faz |
|---|---|
| Tamanho | 12 a 17 exercícios por lição; ~3 a 5 minutos |
| Rampa | Começa com reconhecimento (selecionar imagem, pares, "o que significa"), passa para compreensão (escuta, lacuna) e termina com produção (montar/digitar frase, falar) |
| Final | Se você foi bem, 1 ou 2 exercícios "mais difíceis" no fim; se errou, os erros voltam no fim da lição ("Vamos revisar seus erros") |
| Palavra nova | Introduzida em um card com imagem e áudio antes de ser cobrada |
| Repetição | A mesma palavra aparece 3 a 4 vezes na lição em formatos diferentes (ver → ouvir → montar → falar) |
| Verificação | Botão "Verificar" só ativa após resposta; pareamento avança sozinho |
| Erros | Perde 1 coração (ou 1 a 2 de energia, sistema em teste desde jul/2025, 25 de energia por dia); prática recupera |
| Combo | A partir de 5 acertos seguidos a barra fica laranja "em chamas" e há bônus de XP |
| Fim | Tela de resultado com XP, tempo, precisão, personagem animado e baú/bônus |

## 2. Catálogo de tipos de exercício (formato atual)

### Reconhecimento e vocabulário
1. **Selecione a imagem correta**: palavra nova + 4 cards ilustrados com legenda.
2. **O que significa esta palavra/frase?**: múltipla escolha com balão do personagem.
3. **Toque nos pares**: colunas EN/PT; avança sozinho; versão cronometrada "Match Madness" no hub de prática.
4. **Selecione a palavra que falta**: frase com lacuna e 3 opções (gramática/vocabulário em contexto).

### Tradução
5. **Traduza esta frase** (PT→EN e EN→PT): banco de palavras com peças que voam; alternância "Usar teclado"; dicas por palavra (sublinhado pontilhado com tradução ao tocar).
6. **Complete a tradução**: frase traduzida com uma palavra faltando para digitar.
7. **Escreva em inglês**: digitação livre com tolerância a erros de digitação leves.

### Escuta
8. **Toque no que você ouviu**: alto-falante grande + tartaruga; banco de palavras.
9. **Digite o que você ouviu**: mesma dinâmica, com teclado.
10. **Selecione o que você ouviu**: 2 a 4 opções de áudio/palavra.
11. **Escuta interativa** (níveis de história): diálogo em áudio com perguntas no meio.

### Fala
12. **Fale esta frase**: microfone, avaliação por reconhecimento, "Não posso falar agora" (silencia por 15 min), pontuação verde por palavra.
13. **Repita/pronúncia**: em cursos selecionados, feedback fonético por palavra.

### Conversa e leitura
14. **Complete a conversa**: fala do personagem + 3 respostas possíveis.
15. **Leia e responda**: parágrafo curto + pergunta de compreensão.
16. **Histórias**: narrativa interativa com personagens, perguntas de compreensão e "toque no que ouviu" no meio.
17. **Roleplay / Video Call com a Lily** (Max; gratuito em cursos populares desde jan/2026): conversa livre por IA com transcrição.
18. **Adventures**: mini-jogos de exploração com tarefas do dia a dia.

### Gramática e escrita
19. **Escolha a forma correta**: conjugação/plural/artigo em contexto.
20. **Escreva sobre** (Max): produção escrita com correção por IA.

## 3. Micro-interações que fazem a "fluidez"

| Detalhe | Comportamento do Duolingo |
|---|---|
| Toque na palavra | Qualquer palavra no idioma alvo fala ao toque (peças, balões, opções) |
| Dicas | Palavras com sublinhado pontilhado abrem tooltip de tradução ao toque |
| Áudio | Botão azul grande + tartaruga (lento); clipes pré-gravados por personagem, latência zero; autoplay só em escuta/fala/conversa |
| Peças | Animação de voo do banco para a resposta; espaço "fantasma" mantém o layout |
| Feedback | Folha desliza de baixo: verde com ✓ e elogio aleatório ("Excelente!", "Muito bem!") + "Significado"; vermelha com ✗ e "Resposta correta:" |
| Sons | "tok" curto ascendente no acerto, som seco no erro, fanfarra no fim; vibração no celular |
| Personagens | Reagem (feliz/triste) com animação curta; falam com voz própria |
| Progresso | Barra animada com brilho; laranja no combo; corações/energia à direita |
| Teclado | Enter verifica/continua; números escolhem opções (desktop) |
| Transição | Exercício entra deslizando; sem tela intermediária |
| Erros | Reaparecem no fim da lição; opção de "Praticar erros" no hub |
| Resultado | XP + tempo + precisão em cards, personagem comemorando, confete, baú de bônus |

## 4. Estado atual do BíbliaLearn (comparativo)

| Item do Duolingo | BíbliaLearn hoje | Status |
|---|---|---|
| Selecionar imagem | Cards com ícone (emoji) + legenda | ✅ (ícones, não ilustrações) |
| O que significa | ✅ com balão do personagem | ✅ |
| Toque nos pares | ✅ com som por par e auto-avanço | ✅ |
| Selecione a palavra que falta (frase) | Só no versículo (lacuna com opções) | ⚠️ falta em frases comuns |
| Traduzir PT→EN (banco + teclado + dicas + animação) | ✅ | ✅ |
| Traduzir EN→PT | ❌ | ❌ |
| Complete a tradução (digitar palavra que falta) | ❌ | ❌ |
| Escreva em inglês (palavra) | ✅ | ✅ (só palavras; frases não) |
| Toque no que ouviu (frase) | ✅ | ✅ |
| Digite o que ouviu | ❌ | ❌ |
| Selecione o que ouviu | ✅ | ✅ |
| Fale esta frase + pular | ✅ (sem silenciar por 15 min) | ⚠️ |
| Barra Ouvir/Devagar/Falar em todo exercício | ✅ (além do Duolingo) | ✅ |
| Complete a conversa | ✅ | ✅ |
| Leia e responda / quiz da história | ✅ (quiz de 1 pergunta) | ⚠️ sem parágrafo de leitura |
| Histórias interativas | ❌ | ❌ |
| Conversa livre com personagem (IA) | ❌ | ❌ (precisa de backend/API) |
| Palavra nova em card antes de cobrar | ❌ | ❌ |
| Rampa de dificuldade | Ordem aleatória (só evita começar por fala/digitação) | ⚠️ |
| Erros voltam no fim | ❌ | ❌ |
| Exercícios "mais difíceis" no fim | ❌ | ❌ |
| Repetição da mesma palavra em 3+ formatos | Parcial (1 formato por palavra + pares) | ⚠️ |
| Toque na palavra fala | ✅ | ✅ |
| Dicas por palavra | ✅ (PT→EN) | ✅ |
| Áudio pré-gravado por personagem | ❌ (síntese do navegador) | ❌ (maior gap de qualidade e latência) |
| Folha de feedback, sons, vibração, reações | ✅ | ✅ |
| Combo + barra em chamas | ✅ | ✅ |
| Corações/energia | Corações (5/dia, prática recupera) | ✅ (decisão: manter corações ou adotar energia) |
| Resultado com XP/tempo/precisão/confete | ✅ | ✅ |
| Baú/bônus no fim | ❌ | ❌ |
| Metas diárias, missões, ligas | ❌ | ❌ (ligas exigem backend) |
| Hub de prática (Match Madness, revisão rápida, praticar erros) | ❌ | ❌ |
| Conteúdo | 5 unidades, 15 lições, 60 palavras | ⚠️ pequeno para retenção |
| Contas, sincronização entre aparelhos | ❌ (localStorage) | ❌ |
| Offline/PWA instalável | Manifest sim; service worker não | ⚠️ |

## 5. Plano de execução

Prioridade por impacto na sensação "é o Duolingo" dividido pelo esforço. Estimativas em dias de trabalho com o app atual (HTML/JS puro).

### Fase 1: paridade da lição (1 a 2 semanas)
| # | Entrega | O que muda | Esforço |
|---|---|---|---|
| 1.1 | **Rampa de dificuldade** | Ordenar: card de palavra nova → imagem/significado → pares → escuta → lacuna → montar → digitar/falar; fim com 1 a 2 "difíceis" se sem erros | 1 d |
| 1.2 | **Erros voltam no fim** | Fila de erros re-perguntados após o último exercício ("Vamos revisar seus erros") | 0,5 d |
| 1.3 | **Card "Palavra nova"** | Tela de introdução com ícone/ilustração, palavra, áudio e frase-exemplo antes da primeira cobrança | 1 d |
| 1.4 | **Repetição planejada** | Cada palavra da lição aparece em 3 formatos (reconhecer, ouvir, produzir) | 1 d |
| 1.5 | **Novos tipos**: traduzir EN→PT, digite o que ouviu, complete a tradução (palavra que falta), selecione a palavra que falta em frase, leia e responda com parágrafo | 5 tipos com dados | 3 d |
| 1.6 | **Digitar frases** com tolerância a pequenos erros (distância de edição ≤ 1 por palavra) | Menos frustração no teclado | 0,5 d |
| 1.7 | **"Não posso falar agora"** silencia a fala por 15 min | Igual ao Duolingo | 0,2 d |
| 1.8 | **Baú de bônus** no resultado (XP extra aleatório) e "Praticar erros" na trilha | Recompensa e loop de prática | 1 d |

### Fase 2: áudio e personagens (1 semana + decisão de orçamento)
| # | Entrega | O que muda | Esforço |
|---|---|---|---|
| 2.1 | **Áudio pré-gravado** de todo o conteúdo (≈150 frases/palavras × personagem narrador) com TTS profissional (ElevenLabs, Google, Azure ou Higgsfield) | Resolve qualidade das vozes e a latência ao tocar em palavras | 2 d + custo do serviço (decisão sua) |
| 2.2 | **Manifesto de áudio** (`audio/manifest.json`) com fallback para a síntese do navegador | Toca instantâneo quando existe clipe | 1 d |
| 2.3 | **Elenco completo** do pôster (Adão, Eva, Abraão, Sara, José, Daniel, Jonas, Paulo…) recortado e com voz | Mais variedade por unidade | 1 d |
| 2.4 | **Ilustrações nos cards de imagem** no lugar dos emojis (gerar/recortar 60 ícones no mesmo estilo) | Mais fiel ao Duolingo | 2 d + arte |

### Fase 3: conteúdo e estrutura (2 a 3 semanas)
| # | Entrega | O que muda | Esforço |
|---|---|---|---|
| 3.1 | **Curso ampliado**: 12 a 15 unidades (Gênesis a Atos), 4 a 6 lições por unidade, 250+ palavras, versículos e diálogos | Retenção de semanas, não de dias | 8 d |
| 3.2 | **Histórias interativas** (1 por unidade): narrativa curta com personagens, perguntas no meio e "toque no que ouviu" | Modo mais engajante do Duolingo | 4 d |
| 3.3 | **Níveis por lição** (1 a 5 coroas) e **revisão lendária** | Rejogar com dificuldade crescente | 2 d |
| 3.4 | **Hub de prática**: Match Madness cronometrado, revisão rápida, praticar erros | Loop diário | 2 d |

### Fase 4: engajamento e contas (precisa de backend)
| # | Entrega | O que muda | Esforço |
|---|---|---|---|
| 4.1 | **Contas e sincronização** (Supabase: auth + tabela de progresso) | Progresso em vários aparelhos | 3 d |
| 4.2 | **Metas diárias, missões e ligas semanais** | Competição e hábito | 4 d |
| 4.3 | **Notificações** (PWA push) e lembrete de sequência | Retenção | 2 d |
| 4.4 | **Conversa com personagem por IA** (estilo Video Call): chat guiado com Moisés/Davi em inglês simples, com correções | Diferencial forte; custo por uso (decisão sua) | 4 d |
| 4.5 | **Publicação**: GitHub Pages + service worker offline + domínio | Produto acessível | 1 d |

### Decisões que são suas (eu oriento, você decide)
- Serviço de TTS para os áudios e orçamento mensal (Fase 2).
- Corações (atual) ou energia (novo padrão do Duolingo); eu recomendo manter corações por serem mais simpáticos ao público.
- Escopo do curso ampliado (quais livros/histórias) e se inclui a voz de Jesus.
- Backend (Supabase) para contas/ligas e IA para conversa: ambos têm custo e exposição de dados de usuários.
- Nome final, domínio e publicação.

### Métricas para validar
- Tempo médio por lição de 3 a 5 min; taxa de conclusão de lição > 85%.
- Toques por exercício ≤ 3 (fluidez).
- Retorno no dia seguinte (D1) > 40% após notificações.
- Erros revisados no fim reduzindo erro na repetição em > 50%.

### Ordem recomendada de início
1. Fase 1 inteira (maior ganho de "sensação Duolingo" sem custo).
2. Decisão do TTS e Fase 2.1/2.2 (resolve vozes e latência de uma vez).
3. Fase 3.1 (conteúdo) em paralelo com a arte da 2.4.
