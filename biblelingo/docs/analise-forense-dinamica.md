# Dinâmica de Lição Duolingo

  BíbliaLearn · análise forense 2

  Dinâmica de lição do Duolingo, item por item
  O que o Duolingo faz dentro de uma lição de 15 exercícios, com fonte primária para cada afirmação, o diagnóstico da monotonia no BíbliaLearn e o que já foi implementado a partir disso.

  Fontes: whitepaper oficial "The Duolingo Method" (2023), blog e wiki
Estado: 14 de 16 práticas aplicadas
12 set 2026

  
## 1. O que o Duolingo faz (com evidência)

  Cada item traz a fonte e o estado no BíbliaLearn: já tinha
, feito agora
 ou pendente
.

  
    
**01. A lição tem cerca de 15 exercícios, escolhidos entre um pool de ~200 candidatos**

      Session generator: "considers around 200 challenges, selects 14" (IEEE Spectrum / Birdbrain); combo máximo de 15 acertos por lição (wiki Combo bonus).

      feito agora
 15 exercícios + 1 desafio reservado; antes eram 22 a 25.

    
**02. Nenhum formato domina: há um teto de repetições do mesmo tipo por lição**

      Blog Duolingo (curso de chinês): "no lesson contains more than a certain number of the same kind of exercise".

      feito agora
 teto de 2 por formato (3 para apresentação de palavra nova).

    
**03. Poucos objetivos por lição; palavras novas em frases feitas só de palavras conhecidas (i+1)**

      Whitepaper: "Each lesson is designed to focus on a small number of distinct learning objectives"; blog: "taught a handful of new words by seeing them in sentences made up of only familiar words".

      feito agora
 4 palavras e 3 frases por lição, sorteadas de um conteúdo maior (6 palavras, 4 a 5 frases).

    
**04. Começa receptivo com dicas tocáveis; só depois pede produção (digitar, falar)**

      Whitepaper: "starting everyone out with receptive exercises with tappable hints so they can choose their level of scaffolding"; blog: "learn to recognize a new word, and eventually you'll be typing it out yourself".

      feito agora
 a apresentação da palavra é sempre colocada antes de qualquer cobrança dela; dicas por toque já existiam.

    
**05. Exercícios mais difíceis ficam no fim ("dificuldade desejável"); se o aluno erra sempre, a dificuldade cai**

      Whitepaper: "these more difficult exercises occur at the end of a lesson and, if a learner consistently gets them incorrect, the difficulty level of the exercises is decreased".

      já tinha
 desafio final liberado só sem erros. feito agora
 dois erros rebaixam o próximo exercício de produção para reconhecimento.

    
**06. Se está indo bem, o algoritmo escolhe exercícios um pouco mais difíceis dentro da própria lição**

      Whitepaper: "if a learner is performing well in a lesson, our algorithm selects slightly more challenging exercises".

      feito agora
 combo de 3 acertos troca o próximo exercício de reconhecimento por "digite em inglês".

    
**07. Erro gera dica e o mesmo conceito volta no fim da lição**

      Whitepaper: "If they make a mistake, they receive a hint, and an exercise targeting the same concept is resurfaced at the very end of the lesson".

      já tinha
 fila de revisão de erros no fim + banco "Praticar erros".

    
**08. Exercício de revisão de material anterior inserido na lição nova**

      Blog "Measuring lesson recall": "an extra exercise that comes from an earlier part of the course is included. This extra exercise is called a Review Exercise".

      feito agora
 1 exercício com palavra de lição já concluída, etiquetado "Revisão".

    
**09. Ordem sequenciada pela probabilidade de acerto ("Goldilocks"), sem blocos do mesmo formato**

      Birdbrain: "predicted success probabilities ... to sequence or order which challenges will be in that particular lesson".

      feito agora
 rampa de dificuldade com variação aleatória e regra de vizinhança: nunca o mesmo formato nem o mesmo item em sequência.

    
**10. Recompensa a cada exercício e uma maior no fim; feedback imediato e efeitos sonoros**

      Whitepaper: "a reward, a chime, sparkles, animations, coming after each completed exercise. Then, after a session is finished, the learner receives a larger dose of positive reinforcement".

      já tinha
 "tok" no acerto, folha verde, confete, baú e XP no fim.

    
**11. Elogio baseado em esforço, sem punição por tentar**

      Whitepaper: "effort-based praise and encouragement ... along with humorous images".

      já tinha
 frases de elogio variadas e reação do personagem.

    
**12. Repetição espaçada: revisita frequente logo depois de aprender, depois menos**

      Whitepaper: "learners revisit new content frequently after they've first learned it, but later on they revisit that content less frequently".

      pendente
 requer uma "força" por palavra com data (acertos, erros, última vez). Não precisa de decisão sua.

    
**13. Analogia e contraste: pares de frases que só mudam o padrão-alvo**

      Whitepaper: "we use analogy and contrast across exercises to expose learners to examples of given patterns".

      pendente
 curadoria editorial (ex.: "God created the light / God created the earth"). Já há 6 pares assim no conteúdo novo; ampliar é escopo seu.

    
**14. Sessões curtas, "mais uma lição" custa pouco**

      Whitepaper: "On average, a lesson takes no more than a few minutes".

      feito agora
 15 exercícios, cerca de 3 a 4 minutos.

    
**15. Teclado como opção para quem quer mais desafio (banco de palavras por padrão)**

      Blog "difficult exercises": exercícios de digitação e escuta sem banco são os mais difíceis; o banco de palavras é o andaime padrão.

      já tinha
 "Usar teclado" no montar frase.

    
**16. Fala aparece já nas primeiras lições, no meio do fluxo**

      Notas de produto 2024/2025: "introduces speaking exercises in the very first lesson".

      feito agora
 "Fale a frase" deixou de ser reserva de fim e entra no fluxo normal.

  

  
## 2. Por que estava monótono

  
    Diagnóstico do montador anterior
    
      - Conteúdo fino. Cada lição tinha 4 palavras e 1 ou 2 frases. A mesma frase aparecia em até 5 formatos (montar, ouvir e montar, ouvir e digitar, lacuna, falar) e cada palavra era cobrada duas vezes em sequência.

      - Ordenação por tipo. A rampa ordenava pelo formato, então saíam blocos: 4 "selecione a palavra" seguidos, depois 4 "ouça", depois 4 de frase.

      - Sem teto. Nada impedia 6 exercícios do mesmo formato; a lição chegava a 25 itens.

      - Sem revisão espaçada nem adaptação. A lição era igual para quem acertava tudo e para quem errava tudo, e nunca puxava uma palavra de lições anteriores.

    

  

  
## 3. Sequência gerada agora (exemplo real, lição 1)

  Saída do novo montador para "Céu e terra", primeira vez. Nenhum formato se repete em sequência e nenhuma palavra ou frase aparece duas vezes seguidas.

  
    01Selecione a palavra · earth

    02O que significa · heaven

    03Toque nos pares

    04Selecione a palavra · God

    05Ouça e escolha a tradução · God created the earth

    06Ouça · God

    07O que significa · light

    08Ouça · earth

    09Ouça e monte · God created the heaven and the earth

    10Escreva em inglês · In the beginning God created the light

    11Palavra que falta · God created the heaven and the earth

    12Complete o versículo

    13Fale a frase

    14Digite em inglês · heaven

    15Complete a conversa

    +1Desafio: digite o que ouviu (sem erros)

  

  palavra
frase
pares, versículo, história

  
## 4. Antes e depois

  
    | Dimensão | Antes | Agora |
|---|---|---|

    
      | Tamanho da lição | 22 a 25 exercícios | 15 + 1 desafio final |

      | Conteúdo por lição | 4 palavras, 1 a 2 frases | 6 palavras, 4 a 5 frases; cada lição usa 4 e 3, sorteadas |

      | Formatos | 15 | 17 (novos: ouvir frase e escolher tradução; português para inglês por escolha) |

      | Repetição do mesmo item | frase em até 5 formatos seguidos | no máximo 2 formatos por frase, nunca vizinhos |

      | Ordem | blocos por tipo | rampa com variação + teto por tipo + regra de vizinhança |

      | Palavra nova | etiqueta, mas cobrança podia vir antes da apresentação | apresentação garantida antes de qualquer cobrança |

      | Revisão de lições anteriores | só na lição "Revisão" da unidade | 1 exercício "Revisão" dentro de cada lição nova |

      | Adaptação na hora | nenhuma | sobe para produção com 3 acertos seguidos; desce com 2 erros |

      | Falar | só no desafio final | no fluxo normal |

    

  

  
### Núcleo do montador

  
```
// 1) cobertura obrigatória: cada palavra apresentada de forma receptiva, cada frase em um formato
vocab.forEach((w, i) => pick(rotacao(introTypes, i), w));
sentences.forEach((s, i) => pick(rotacao(sentTypes, i), s, unit.id));
take(match); take(verse);
// 2) complementos até 15: recordação da palavra, lacunas, história, fala, revisão de lição anterior
optional.sort(porPrioridade).forEach((o) => { if (chosen.length  rank(a) + jitter - rank(b));
while (cands.length) { escolhe o primeiro que não repete formato nem item do anterior
                       e cuja palavra já foi apresentada; senão, encaixa mais cedo }
```

  Arquivo: biblelingo/app.js, função buildExercises; adaptação em adaptNext; fábrica de formatos em EX_MAKE.

  
## 5. Pendências

  
    Repetição espaçada entre liçõesGuardar por palavra: acertos, erros e data. A lição "Revisão" e o exercício "Revisão" passam a puxar as palavras mais fracas e mais antigas.
sem decisão

    Pares de analogia e contrasteMais frases que só trocam uma palavra ("God created the light / the earth"). É escolha editorial de conteúdo.
sua decisão

    Vozes ElevenLabsDepende do secret ELEVENLABS_API_KEY no repositório. O fluxo já está pronto.
sua ação

    Ilustrações nos cartões de palavraHoje são emojis. Arte própria ou licenciada muda a percepção de qualidade.
sua decisão

  

  
## Fontes

  
    [The Duolingo Method for App-based Teaching and Learning (whitepaper, 2023)](https://duolingo-papers.s3.amazonaws.com/reports/Duolingo_whitepaper_duolingo_method_2023.pdf) ·
    [Measuring lesson recall on Duolingo](https://blog.duolingo.com/review-exercises-help-measure-learner-recall/) ·
    [Introducing Birdbrain](https://blog.duolingo.com/learning-how-to-help-you-learn-introducing-birdbrain/) ·
    [Difficult exercises](https://blog.duolingo.com/duolingo-difficult-exercises/) ·
    [How Duolingo's AI learns what you need to learn (IEEE Spectrum)](https://spectrum.ieee.org/duolingo) ·
    [Combo bonus (wiki)](https://duolingo.fandom.com/wiki/Combo_bonus) ·
    [How Duolingo teaches English](https://blog.duolingo.com/how-duolingo-teaches-english/)
