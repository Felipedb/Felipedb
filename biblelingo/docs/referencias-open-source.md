# Referências Open Source BíbliaLearn

  BíbliaLearn · levantamento

  Quatro clones abertos do Duolingo, por dentro
  Os quatro repositórios foram clonados e lidos arquivo a arquivo. Aqui está como cada um modela conteúdo, monta a lição, trata erro e dá feedback, com trechos reais do código e o que vale trazer para o BíbliaLearn.

  
    | Repositório | Stack | Formatos de exercício | Montagem da lição | Erro | Estado |
|---|---|---|---|---|---|

    
      | Lingo (sanidhyy) | Next.js 16, Drizzle, Postgres, Clerk, Stripe | 2: SELECT, ASSIST | ordem fixa do banco, sem sorteio | perde coração e repete o mesmo item | completo |

      | react-duolingo (bryanjenningz) | Next.js 14, Zustand, Tailwind | 2: escolha 1 de 3, montar com blocos | meta de 2 acertos, loop cíclico | só conta; corações só no teste de pular unidade | UI fiel, motor mínimo |

      | LibreLingo (kantord) | Python (compilador YAML para JSON), Next.js | 5: cards, options, shortInput, listening, chips | sorteio com prioridade por grupo do item | sem repetição no fim (código do cliente removido) | arquivado |

      | Duolingo (MMAFL) | React + Redux, Express + Sequelize | 1: múltipla escolha | ordem do banco, sem sorteio | perde coração e repete o mesmo item | incompleto |

      | BíbliaLearn (hoje) | HTML, CSS e JS puro, localStorage, PWA | 17 | 15 por lição, teto por formato, rampa, sem vizinho repetido, adaptação | coração, fila de erros no fim, banco "Praticar erros" | em desenvolvimento |

    

  

  
## 1. Lingo, de sanidhyy

  [github.com/sanidhyy/duolingo-clone](https://github.com/sanidhyy/duolingo-clone)Projeto do tutorial "Code With Antonio", o mais copiado no GitHub (vários forks idênticos: DhavalDudheliya, jeancdevx, Davronov).

  Next.js 16
React 19
Drizzle ORM
Postgres/Neon
Clerk
Stripe
Zustand
react-admin

  Conteúdo 100% no banco: cursos, unidades, lições, desafios e opções. Um desafio é apenas {type, question, order} e cada opção traz texto, imagem e áudio. Só existem dois formatos, e os dois usam o mesmo componente: a diferença é uma classe CSS e o balão da pergunta.

  
```
// db/schema.ts:64
export const challengesEnum = pgEnum("type", ["SELECT", "ASSIST"]);
export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  lessonId: integer("lesson_id").references(() => lessons.id).notNull(),
  type: challengesEnum("type").notNull(),
  question: text("question").notNull(),
  order: integer("order").notNull(),
});

// app/lesson/quiz.tsx:97  máquina de estados de 3 fases, um botão só
const onContinue = () => {
  if (!selectedOption) return;
  if (status === "wrong")   { setStatus("none"); setSelectedOption(undefined); return; }
  if (status === "correct") { onNext(); setStatus("none"); setSelectedOption(undefined); return; }
  const correctOption = options.find((o) => o.correct);
  ...
};
```

  Montagem: a lição vem do banco ordenada por order, sem sorteio de exercícios nem de opções (a correta é sempre a primeira no seed). Retoma do primeiro desafio não concluído. Errou: perde coração, rodapé rosa "Try again", o mesmo item repete até acertar. Modo prática devolve 1 coração e nunca tira. Sons: correct.wav, incorrect.wav, finish.mp3. XP fixo de 10 por acerto.

  
    **Vale trazer**
- Máquina de estados none → correct | wrong com um botão que muda de rótulo (Check / Next / Retry). O BíbliaLearn já segue isso.
- Progresso por exercício persistido, permitindo fechar e retomar a lição no ponto.
- Modo prática sem punição, que devolve coração (já temos).

    **Evitar**
- Enum rígido de tipo e um componente com if por tipo: não escala para 17 formatos.
- Ordem fixa e opções sem embaralhar: decorável.
- Gabarito enviado ao cliente e um round-trip de servidor por resposta.

  

  
## 2. react-duolingo, de bryanjenningz

  [github.com/bryanjenningz/react-duolingo](https://github.com/bryanjenningz/react-duolingo)Clone visual estático da interface, sem backend.

  Next.js 14
TypeScript
Tailwind
Zustand
PWA

  
  A trilha é o ponto forte: unidades com cor própria, azulejos em serpentina e estado derivado de um único contador (lessonsCompleted dividido por 4 lições por azulejo). A lição, ao contrário, é mínima: dois problemas fixos escritos dentro da própria página, que se repetem em loop até o aluno acertar dois.

  
```
// src/pages/lesson.tsx:22
const lessonProblem1 = { type: "SELECT_1_OF_3",
  question: `Which one of these is "the apple"?`,
  answers: [{ icon: , name: "la manzana" }, ...], correctAnswer: 0 };
const lessonProblem2 = { type: "WRITE_IN_ENGLISH", question: "El niño",
  answerTiles: ["woman","milk","water","I","The","boy"], correctAnswer: [4, 5] };

// src/pages/lesson.tsx:122  avança em ciclo
setLessonProblem((x) => (x + 1) % lessonProblems.length);
```

  

  Feedback: folha inferior verde "Good job!" ou vermelha "Correct solution: ...", com animação só por posição e transição CSS. Tela final com três cartões (XP, tempo, precisão) e um placar de revisão clicável, questão por questão, mostrando "sua resposta / resposta correta". Variantes por querystring: ?practice (não conta progresso) e ?fast-forward=N (teste para pular unidade, com corações).

  
    **Vale trazer**
- Placar de revisão no fim: lista de {pergunta, sua resposta, correta}. Barato e útil; ainda não temos.
- Trilha com estado derivado de um contador e cor por unidade (já temos algo equivalente com retratos).
- Contrato uniforme de props entre tipos de problema (isAnswerCorrect, onCheck, onFinish, onSkip).

    **Evitar**
- Conteúdo dentro do componente de página (JSX no dado). Nosso conteúdo já é dado puro em data.js.
- Loop cíclico como fila e nada persistido: perde XP e ofensiva no reload.
- Números mágicos de layout (scrollY < 680).

  

  
## 3. LibreLingo, de kantord

  [github.com/kantord/LibreLingo](https://github.com/kantord/LibreLingo)Plataforma comunitária, hoje arquivada; o fork ativo é LibreLingoRelive (Codeberg).

  Python (compilador)
YAML de curso
JSON exportado
Next.js
AWS Polly (TTS)

  O melhor modelo de conteúdo dos quatro. O autor escreve YAML (palavras novas, frases, mini-dicionário, versões alternativas aceitas) e um compilador Python gera, para cada item, vários desafios com priority e group. O cliente sorteia, mas dentro do mesmo grupo a ordem respeita a prioridade: o formato com imagem (cards, prioridade 0) sempre vem antes de digitar (shortInput, prioridade 1) e de montar com blocos (chips, prioridade 2).

  
```
# src/librelingo_json_export/challenge_types.py:59
def get_cards_challenge(word, _):
    return [{ "type": "cards",
              "pictures": [pic + ".jpg" for pic in word.pictures],
              "formInTargetLanguage": word.in_target_language[0],
              "meaningInSourceLanguage": word.in_source_language[0],
              "priority": 0,
              "group": get_dumb_opaque_id("Group", word) }]

# challenge_types.py:118  distratores por distância de edição
extra_chips = sorted(deduplicated_chips,
    key=lambda chip: sum(editdistance.eval(other, chip) for other in solution_chips))

# src/librelingo_utils/utils.py:11  níveis por volume de conteúdo
def calculate_number_of_levels(nwords, nphrases):
    return round(1 + (nwords / 7) + (nphrases / 5))
```

  Montagem: cinco formatos (cards, options, shortInput, listeningExercise, chips nos dois sentidos), níveis calculados pelo volume da habilidade, áudio pré-gerado por hash do texto. A camada de sessão (barra, vidas, sons, repetição de erros) foi removida na reescrita e não existe neste checkout.

  
    **Vale trazer**
- priority + group: embaralhar livremente, mas manter a ordem de dificuldade dentro do mesmo item. É exatamente a regra "apresentação antes da cobrança" que entrou hoje no BíbliaLearn.
- Distratores por distância de edição, para opções e blocos mais plausíveis ("heaven" ao lado de "heavens", não de "fish").
- Versões alternativas aceitas por frase (Also accepted). Já aceitamos com tolerância a erro de digitação; falta a lista editorial.

    **Evitar**
- IDs por hash do conteúdo: corrigir uma vírgula quebra o progresso salvo.
- Toda a lógica de sessão presa ao cliente sem testes: foi o que se perdeu.
- Áudio só por arquivo pré-gerado sem fallback.

  

  
## 4. Duolingo, de MMAFL

  [github.com/MMAFL/Duolingo](https://github.com/MMAFL/Duolingo)Clone didático pequeno; faltam modelos, seed e alguns componentes no repositório.

  React 18 + Vite
Redux Toolkit
TanStack Query
Express
Sequelize / MySQL
JWT

  Hierarquia Unit, Lesson, Question, com um único formato real (múltipla escolha); o tipo ASSIST existe só na tipagem. A lição filtra as questões já concluídas pelo usuário, então refazer uma lição resulta em tela vazia. Sem ofensiva, sem tela de conclusão, sem sorteio.

  
```
// client/src/components/Quiz.tsx:90
if (selectedOption === actualQuestion.data.correctAnswer) {
  if (user && user.lifePoint > 0) { mutate({ userId, lessonId, questionId }); correctAudio.play(); }
  else dispatch(toggleModal());
} else { wrongAudio.play(); decreaseHeartsMutation(...); setStatus("wrong"); }

// client/src/components/LessonButton.tsx:26  serpentina da trilha
const cycleLen = 6; const indentationLevel = index % cycleLen; right = level * 40;
```

  
    **Vale trazer**
- Decomposição Header / Sentence / Options / Footer, onde só "Options" muda por tipo.
- Serpentina da trilha em 15 linhas com index % cycleLen.

    **Evitar**
- Progresso por "questão concluída globalmente": impede refazer a lição.
- new Audio() recriado a cada render.
- Gabarito no payload da questão.

  

  
## Veredito

  
    Nenhum dos quatro tem um motor de lição mais sofisticado que o BíbliaLearn de hoje. Os clones populares reproduzem a casca (trilha, corações, loja, rodapé colorido) com 1 ou 2 formatos e ordem fixa. O único com ideias reais de sequenciamento é o LibreLingo, e elas já foram absorvidas hoje. O que ainda vale copiar:
    
      - Placar de revisão no fim da lição (react-duolingo): lista clicável de cada questão com sua resposta e a correta.

      - Distratores por distância de edição (LibreLingo): alternativas mais parecidas com a resposta certa.

      - Retomar a lição de onde parou (Lingo): salvar o índice da sessão para quem fecha o app no meio.

      - Lista editorial de respostas alternativas (LibreLingo, "Also accepted") por frase: "Deus criou o céu e a terra" e "Deus criou os céus e a terra".

    

    Os quatro repositórios estão clonados no ambiente desta sessão e podem ser consultados linha a linha a qualquer momento.
