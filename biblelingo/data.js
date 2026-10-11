// BíbliaLearn — conteúdo das unidades e lições (gerado de content/course.json + content/u*.json; edite os JSON e rode tools/content/merge.js)
// Ordem e cabeçalhos das unidades vêm de course.json. Lições v1: vocab (as 4 primeiras são as palavras-base da 1ª vez),
// sentences (arco da passagem), verse (KJV, domínio público, com lacuna), reading, dialogue e quiz.
// Lições v2 (campo v: 2): tips, names, hints, vocab (pos/field/tier/part/icon/example), beats (order 1..12, gap, grammar),
// contrast, verse (WEB em text, KJV em classic, blanks), reading (questions), conversation, fact; os campos legados
// (sentences, verse.blank/options, reading.q/options/answer, dialogue, quiz) são derivados para o motor atual.
// A lição "Revisão" de cada unidade é o checkpoint (checkpoint: true).

const COURSE = [
  {
    "id": "u1",
    "title": "A Criação e o Éden",
    "subtitle": "Gênesis 1-3",
    "icon": "🌍",
    "face": "adao",
    "color": "#58a700",
    "level": "A1.1",
    "v": 2,
    "lessons": [
      {
        "id": "u1l1",
        "title": "No princípio",
        "ref": "Gênesis 1:1-19",
        "level": "A1.1",
        "narrator": "adao",
        "guests": [
          "eva",
          "voice"
        ],
        "names": [
          {
            "en": "God",
            "pt": "Deus",
            "note": "sempre com maiúscula; os pronomes (he, his) ficam em minúscula"
          }
        ],
        "hints": {
          "beginning": "princípio",
          "created": "criou",
          "heavens": "céus",
          "empty": "vazia",
          "still": "ainda",
          "called": "chamou",
          "darkness": "escuridão",
          "evening": "tarde",
          "morning": "manhã",
          "moon": "lua",
          "saw": "viu, vimos"
        },
        "tips": [
          {
            "part": 1,
            "id": "past-be",
            "grammar": "past-be",
            "title": "was = passado de is",
            "body": "Para falar do que já aconteceu, is vira was e are vira were. O resto da frase não muda.",
            "examples": [
              {
                "en": "The earth is dark",
                "pt": "A terra está escura"
              },
              {
                "en": "The earth was dark",
                "pt": "A terra estava escura"
              }
            ],
            "contrast": {
              "a": "The light is good",
              "b": "The light was good",
              "note": "is = agora; was = naquele momento"
            }
          },
          {
            "part": 2,
            "id": "there-was",
            "grammar": "there-was",
            "title": "there was = havia",
            "body": "Para dizer que algo existia, use there was (uma coisa) ou there were (várias). No presente: there is e there are.",
            "examples": [
              {
                "en": "There was light",
                "pt": "Havia luz"
              },
              {
                "en": "There were two great lights",
                "pt": "Havia dois grandes luminares"
              }
            ],
            "contrast": {
              "a": "There is light",
              "b": "There was light",
              "note": "there is = há; there was = havia"
            }
          }
        ],
        "vocab": [
          {
            "en": "earth",
            "pt": "terra",
            "pos": "noun",
            "field": "creation",
            "tier": "core",
            "part": 1,
            "icon": "🌍",
            "image": "earth.png",
            "example": 2
          },
          {
            "en": "light",
            "pt": "luz",
            "pos": "noun",
            "field": "creation",
            "tier": "core",
            "part": 1,
            "icon": "💡",
            "image": "light.png",
            "example": 4
          },
          {
            "en": "dark",
            "pt": "escuro",
            "ptAlt": [
              "escura"
            ],
            "pos": "adj",
            "field": "quality",
            "tier": "core",
            "part": 1,
            "icon": "🌑",
            "example": 2
          },
          {
            "en": "good",
            "pt": "bom",
            "ptAlt": [
              "boa"
            ],
            "pos": "adj",
            "field": "quality",
            "tier": "core",
            "part": 1,
            "icon": "👍",
            "example": 5
          },
          {
            "en": "Let there be light",
            "pt": "Haja luz",
            "pos": "chunk",
            "field": "speech",
            "tier": "core",
            "part": 1,
            "icon": "✨",
            "iconic": true,
            "example": 3
          },
          {
            "en": "day",
            "pt": "dia",
            "pos": "noun",
            "field": "time",
            "tier": "core",
            "part": 2,
            "icon": "📅",
            "image": "day.png",
            "example": 9
          },
          {
            "en": "night",
            "pt": "noite",
            "pos": "noun",
            "field": "time",
            "tier": "core",
            "part": 2,
            "icon": "🌃",
            "image": "night.png",
            "example": 10
          },
          {
            "en": "sun",
            "pt": "sol",
            "pos": "noun",
            "field": "nature",
            "tier": "core",
            "part": 2,
            "icon": "☀️",
            "image": "sun.png",
            "example": 9
          },
          {
            "en": "to make",
            "pt": "fazer",
            "pos": "verb",
            "field": "actions",
            "tier": "core",
            "part": 2,
            "icon": "🔨",
            "image": "make.png",
            "example": 9
          },
          {
            "en": "It was good",
            "pt": "Era bom",
            "ptAlt": [
              "Foi bom"
            ],
            "pos": "chunk",
            "field": "speech",
            "tier": "core",
            "part": 2,
            "icon": "🆗",
            "iconic": true,
            "example": 11
          }
        ],
        "sentences": [
          {
            "en": "In the beginning, God created the heavens and the earth",
            "pt": "No princípio, Deus criou os céus e a terra",
            "alt": [
              "In the beginning God created the heaven and the earth"
            ],
            "altPt": [
              "No princípio, criou Deus os céus e a terra",
              "No princípio, Deus criou o céu e a terra"
            ]
          },
          {
            "en": "The earth was empty and dark",
            "pt": "A terra estava vazia e escura",
            "alt": [
              "The earth was formless and empty"
            ],
            "altPt": [
              "A terra era sem forma e vazia"
            ]
          },
          {
            "en": "God said, \"Let there be light\"",
            "pt": "Deus disse: \"Haja luz\""
          },
          {
            "en": "And there was light",
            "pt": "E houve luz",
            "alt": [
              "There was light"
            ]
          },
          {
            "en": "God saw that the light was good",
            "pt": "Deus viu que a luz era boa",
            "alt": [
              "God saw the light, and it was good"
            ]
          },
          {
            "en": "Was the earth still dark? No, the light was good",
            "pt": "A terra ainda estava escura? Não, a luz era boa"
          },
          {
            "en": "He called the light Day and the darkness Night",
            "pt": "Ele chamou a luz de Dia e a escuridão de Noite",
            "altPt": [
              "E Deus chamou à luz Dia, e às trevas chamou Noite"
            ]
          },
          {
            "en": "There was evening and morning: the first day",
            "pt": "Houve tarde e manhã: o primeiro dia",
            "alt": [
              "There was evening, and there was morning, the first day"
            ],
            "altPt": [
              "E foi a tarde e a manhã, o dia primeiro"
            ]
          },
          {
            "en": "God made the sun for the day",
            "pt": "Deus fez o sol para o dia"
          },
          {
            "en": "God made the moon for the night",
            "pt": "Deus fez a lua para a noite"
          },
          {
            "en": "By day we saw the sun and it was good",
            "pt": "De dia vimos o sol e era bom"
          },
          {
            "en": "Was the sun there at night? No, only the moon",
            "pt": "O sol estava lá à noite? Não, só a lua"
          }
        ],
        "beats": [
          {
            "order": 1,
            "en": "In the beginning, God created the heavens and the earth",
            "pt": "No princípio, Deus criou os céus e a terra",
            "alt": [
              "In the beginning God created the heaven and the earth"
            ],
            "altPt": [
              "No princípio, criou Deus os céus e a terra",
              "No princípio, Deus criou o céu e a terra"
            ],
            "kind": "quote",
            "fact": true,
            "iconic": true,
            "prod": false
          },
          {
            "order": 2,
            "en": "The earth was empty and dark",
            "pt": "A terra estava vazia e escura",
            "alt": [
              "The earth was formless and empty"
            ],
            "altPt": [
              "A terra era sem forma e vazia"
            ],
            "kind": "statement",
            "fact": true,
            "gap": {
              "word": "was",
              "kind": "grammar",
              "options": [
                "was",
                "is",
                "were"
              ]
            },
            "grammar": "past-be"
          },
          {
            "order": 3,
            "en": "God said, \"Let there be light\"",
            "pt": "Deus disse: \"Haja luz\"",
            "kind": "quote",
            "fact": true,
            "iconic": true,
            "speaker": "voice"
          },
          {
            "order": 4,
            "en": "And there was light",
            "pt": "E houve luz",
            "alt": [
              "There was light"
            ],
            "kind": "statement",
            "fact": true,
            "gap": {
              "word": "light",
              "kind": "lexical",
              "options": [
                "light",
                "earth",
                "sun"
              ]
            }
          },
          {
            "order": 5,
            "en": "God saw that the light was good",
            "pt": "Deus viu que a luz era boa",
            "alt": [
              "God saw the light, and it was good"
            ],
            "kind": "statement",
            "fact": true
          },
          {
            "order": 6,
            "en": "Was the earth still dark? No, the light was good",
            "pt": "A terra ainda estava escura? Não, a luz era boa",
            "kind": "question",
            "fact": false,
            "grammar": "past-be"
          },
          {
            "order": 7,
            "en": "He called the light Day and the darkness Night",
            "pt": "Ele chamou a luz de Dia e a escuridão de Noite",
            "altPt": [
              "E Deus chamou à luz Dia, e às trevas chamou Noite"
            ],
            "kind": "statement",
            "fact": true
          },
          {
            "order": 8,
            "en": "There was evening and morning: the first day",
            "pt": "Houve tarde e manhã: o primeiro dia",
            "alt": [
              "There was evening, and there was morning, the first day"
            ],
            "altPt": [
              "E foi a tarde e a manhã, o dia primeiro"
            ],
            "kind": "quote",
            "fact": true,
            "iconic": true,
            "prod": false,
            "gap": {
              "word": "was",
              "kind": "grammar",
              "options": [
                "was",
                "were",
                "is"
              ]
            },
            "grammar": "there-was"
          },
          {
            "order": 9,
            "en": "God made the sun for the day",
            "pt": "Deus fez o sol para o dia",
            "kind": "statement",
            "fact": false
          },
          {
            "order": 10,
            "en": "God made the moon for the night",
            "pt": "Deus fez a lua para a noite",
            "kind": "statement",
            "fact": false
          },
          {
            "order": 11,
            "en": "By day we saw the sun and it was good",
            "pt": "De dia vimos o sol e era bom",
            "kind": "first-person",
            "fact": false,
            "speaker": "adao"
          },
          {
            "order": 12,
            "en": "Was the sun there at night? No, only the moon",
            "pt": "O sol estava lá à noite? Não, só a lua",
            "kind": "question",
            "fact": false,
            "speaker": "adao"
          }
        ],
        "contrast": [
          {
            "a": "God made the sun for the day",
            "b": "God made the moon for the night",
            "note": "só mudam sun/day por moon/night"
          },
          {
            "a": "The earth was empty and dark",
            "b": "The earth is empty and dark",
            "note": "was = passado; is = presente"
          }
        ],
        "verse": {
          "text": "In the beginning, God created the heavens and the earth.",
          "classic": "In the beginning God created the heaven and the earth.",
          "pt": "No princípio, Deus criou os céus e a terra.",
          "classicPt": "No princípio, criou Deus os céus e a terra.",
          "ref": "Gênesis 1:1",
          "blank": "created",
          "options": [
            "created",
            "saw",
            "said",
            "called"
          ],
          "blanks": [
            {
              "word": "created",
              "options": [
                "created",
                "saw",
                "said",
                "called"
              ]
            },
            {
              "word": "beginning",
              "options": [
                "beginning",
                "garden",
                "evening",
                "night"
              ]
            },
            {
              "word": "earth",
              "options": [
                "earth",
                "water",
                "sky",
                "light"
              ]
            }
          ]
        },
        "reading": {
          "text": "At first, the earth was dark. Then God said, \"Let there be light.\" And there was light. God called the light Day and the darkness Night. Then he made the sun and the moon.",
          "pt": "No começo, a terra estava escura. Então Deus disse: \"Haja luz.\" E houve luz. Deus chamou a luz de Dia e a escuridão de Noite. Depois ele fez o sol e a lua.",
          "q": "What was the earth like at first?",
          "options": [
            "Dark, with nothing in it",
            "Full of light",
            "Full of trees"
          ],
          "answer": "Dark, with nothing in it",
          "questions": [
            {
              "kind": "literal",
              "q": "What was the earth like at first?",
              "qPt": "Como era a terra no começo?",
              "options": [
                "Dark, with nothing in it",
                "Full of light",
                "Full of trees"
              ],
              "answer": "Dark, with nothing in it"
            },
            {
              "kind": "inference",
              "q": "Which came first, the light or the sun?",
              "qPt": "O que veio primeiro, a luz ou o sol?",
              "options": [
                "The light",
                "The sun",
                "They came together"
              ],
              "answer": "The light",
              "explain": "A luz é do primeiro dia (Gênesis 1:3); o sol e a lua são do quarto dia (Gênesis 1:16)."
            }
          ]
        },
        "dialogue": {
          "line": "Adam, look at the light! What did God say?",
          "pt": "Adão, olhe a luz! O que Deus disse?",
          "options": [
            "He said, \"Let there be light.\"",
            "He said, \"Let there be night.\"",
            "He said, \"Let there be earth.\""
          ],
          "answer": "He said, \"Let there be light.\"",
          "answerPt": "Ele disse: \"Haja luz.\""
        },
        "conversation": {
          "with": "eva",
          "turns": [
            {
              "who": "eva",
              "en": "Adam, look at the light! What did God say?",
              "pt": "Adão, olhe a luz! O que Deus disse?",
              "mood": "surpreso"
            },
            {
              "who": "you",
              "options": [
                "He said, \"Let there be light.\"",
                "He said, \"Let there be night.\"",
                "He said, \"Let there be earth.\""
              ],
              "answer": "He said, \"Let there be light.\"",
              "pt": "Ele disse: \"Haja luz.\"",
              "intent": "Diga o que Deus disse"
            },
            {
              "who": "eva",
              "en": "And was the light good?",
              "pt": "E a luz era boa?",
              "mood": "animado"
            },
            {
              "who": "you",
              "options": [
                "Yes, it was good.",
                "No, it was dark.",
                "Yes, it was the moon."
              ],
              "answer": "Yes, it was good.",
              "pt": "Sim, era boa.",
              "intent": "Responda se a luz era boa",
              "speak": true
            }
          ]
        },
        "quiz": {
          "q": "Which came first, the light or the sun?",
          "options": [
            "The light",
            "The sun",
            "They came together"
          ],
          "answer": "The light",
          "explain": "A luz é do primeiro dia (Gênesis 1:3); o sol e a lua são do quarto dia (Gênesis 1:16)."
        },
        "fact": {
          "pt": "A palavra hebraica para \"princípio\" (bereshit) é o nome do livro de Gênesis na Bíblia hebraica.",
          "ref": "Gênesis 1:1"
        },
        "v": 2
      },
      {
        "id": "u1l2",
        "title": "Os sete dias",
        "ref": "Gênesis 1:20 a 2:3",
        "level": "A1.1",
        "narrator": "adao",
        "guests": [
          "eva",
          "voice"
        ],
        "names": [
          {
            "en": "God",
            "pt": "Deus",
            "note": "sempre com maiúscula; os pronomes (he, his) ficam em minúscula"
          }
        ],
        "hints": {
          "fish": "peixes",
          "fly": "voar",
          "created": "criou",
          "fill": "encham",
          "saw": "viu",
          "finished": "terminou"
        },
        "tips": [
          {
            "part": 1,
            "id": "ordinals",
            "grammar": "ordinals",
            "title": "fifth, sixth, seventh: contando os dias",
            "body": "Para dizer a ordem, o número ganha -th: fifth (quinto), sixth (sexto), seventh (sétimo). Só first (primeiro) e second (segundo) são diferentes. E para falar de mais de um, a palavra ganha -s: bird, birds; animal, animals.",
            "examples": [
              {
                "en": "On the fifth day God made the birds",
                "pt": "No quinto dia Deus fez os pássaros"
              },
              {
                "en": "On the sixth day God made the animals",
                "pt": "No sexto dia Deus fez os animais"
              }
            ],
            "contrast": {
              "a": "six days",
              "b": "the sixth day",
              "note": "six = seis (quantos); sixth = sexto (qual)"
            }
          },
          {
            "part": 2,
            "id": "very-adj",
            "grammar": "very-adj",
            "title": "very good = muito bom",
            "body": "very vem antes do adjetivo e deixa a ideia mais forte: very good, very big, very dark. O adjetivo não muda.",
            "examples": [
              {
                "en": "The light was good",
                "pt": "A luz era boa"
              },
              {
                "en": "Everything was very good",
                "pt": "Tudo era muito bom"
              }
            ],
            "contrast": {
              "a": "It was good",
              "b": "It was very good",
              "note": "very = muito; good continua igual"
            }
          }
        ],
        "vocab": [
          {
            "en": "bird",
            "pt": "pássaro",
            "ptAlt": [
              "ave"
            ],
            "pos": "noun",
            "field": "animals",
            "tier": "core",
            "part": 1,
            "icon": "🐦",
            "image": "bird.png",
            "example": 1
          },
          {
            "en": "animal",
            "pt": "animal",
            "pos": "noun",
            "field": "animals",
            "tier": "core",
            "part": 1,
            "icon": "🐾",
            "image": "animal.png",
            "example": 3
          },
          {
            "en": "man",
            "pt": "homem",
            "pos": "noun",
            "field": "people",
            "tier": "core",
            "part": 1,
            "icon": "🧔",
            "image": "man.png",
            "plural": "men",
            "example": 4
          },
          {
            "en": "woman",
            "pt": "mulher",
            "pos": "noun",
            "field": "people",
            "tier": "core",
            "part": 1,
            "icon": "👩",
            "image": "woman.png",
            "plural": "women",
            "example": 5
          },
          {
            "en": "in God's image",
            "pt": "à imagem de Deus",
            "pos": "chunk",
            "field": "faith",
            "tier": "core",
            "part": 1,
            "icon": "👤",
            "iconic": true,
            "example": 5
          },
          {
            "en": "seventh",
            "pt": "sétimo",
            "ptAlt": [
              "sétima"
            ],
            "pos": "num",
            "field": "quantity",
            "tier": "core",
            "part": 2,
            "icon": "7️⃣",
            "example": 9
          },
          {
            "en": "to rest",
            "pt": "descansar",
            "pos": "verb",
            "field": "actions",
            "tier": "core",
            "part": 2,
            "icon": "😴",
            "image": "rest.png",
            "example": 10
          },
          {
            "en": "work",
            "pt": "trabalho",
            "ptAlt": [
              "obra"
            ],
            "pos": "noun",
            "field": "work",
            "tier": "core",
            "part": 2,
            "icon": "💼",
            "image": "work.png",
            "example": 9
          },
          {
            "en": "to bless",
            "pt": "abençoar",
            "pos": "verb",
            "field": "faith",
            "tier": "core",
            "part": 2,
            "icon": "🙌",
            "example": 11
          },
          {
            "en": "very good",
            "pt": "muito bom",
            "ptAlt": [
              "muito boa"
            ],
            "pos": "chunk",
            "field": "quality",
            "tier": "core",
            "part": 2,
            "icon": "💯",
            "iconic": true,
            "example": 8
          }
        ],
        "sentences": [
          {
            "en": "On the fifth day God made fish and birds",
            "pt": "No quinto dia Deus fez peixes e pássaros",
            "altPt": [
              "No quinto dia Deus fez peixes e aves"
            ]
          },
          {
            "en": "God said, \"Let the birds fly above the earth\"",
            "pt": "Deus disse: \"Que os pássaros voem sobre a terra\"",
            "altPt": [
              "Deus disse: \"Que as aves voem sobre a terra\""
            ]
          },
          {
            "en": "Then God made the animals on the sixth day",
            "pt": "Depois Deus fez os animais no sexto dia"
          },
          {
            "en": "God said, \"Let's make man in our image\"",
            "pt": "Deus disse: \"Façamos o homem à nossa imagem\"",
            "alt": [
              "God said, \"Let us make man in our image\""
            ]
          },
          {
            "en": "So God created man and woman in God's image",
            "pt": "Então Deus criou o homem e a mulher à imagem de Deus",
            "alt": [
              "So God created man and woman in his image"
            ],
            "altPt": [
              "E criou Deus o homem à sua imagem; macho e fêmea os criou"
            ]
          },
          {
            "en": "Did God make only animals? No, man and woman too",
            "pt": "Deus fez só animais? Não, o homem e a mulher também"
          },
          {
            "en": "He blessed us and said, \"Fill the earth\"",
            "pt": "Ele nos abençoou e disse: \"Encham a terra\"",
            "altPt": [
              "Ele nos abençoou e disse: \"Enchei a terra\""
            ]
          },
          {
            "en": "God saw everything he made and it was very good",
            "pt": "Deus viu tudo o que fez e era muito bom",
            "alt": [
              "God saw everything that he had made and it was very good"
            ],
            "altPt": [
              "E viu Deus tudo quanto tinha feito, e eis que era muito bom"
            ]
          },
          {
            "en": "On the seventh day God finished his work",
            "pt": "No sétimo dia Deus terminou o seu trabalho",
            "altPt": [
              "No sétimo dia Deus terminou a sua obra"
            ]
          },
          {
            "en": "He rested on the seventh day from all his work",
            "pt": "Ele descansou no sétimo dia de todo o seu trabalho",
            "altPt": [
              "E descansou no sétimo dia de toda a sua obra"
            ]
          },
          {
            "en": "God blessed the seventh day",
            "pt": "Deus abençoou o sétimo dia"
          },
          {
            "en": "Did God work on the seventh day? No, he rested",
            "pt": "Deus trabalhou no sétimo dia? Não, ele descansou"
          }
        ],
        "beats": [
          {
            "order": 1,
            "en": "On the fifth day God made fish and birds",
            "pt": "No quinto dia Deus fez peixes e pássaros",
            "altPt": [
              "No quinto dia Deus fez peixes e aves"
            ],
            "kind": "statement",
            "fact": true,
            "gap": {
              "word": "fifth",
              "kind": "grammar",
              "options": [
                "fifth",
                "sixth",
                "seventh"
              ]
            },
            "grammar": "ordinals"
          },
          {
            "order": 2,
            "en": "God said, \"Let the birds fly above the earth\"",
            "pt": "Deus disse: \"Que os pássaros voem sobre a terra\"",
            "altPt": [
              "Deus disse: \"Que as aves voem sobre a terra\""
            ],
            "kind": "quote",
            "fact": true,
            "speaker": "voice"
          },
          {
            "order": 3,
            "en": "Then God made the animals on the sixth day",
            "pt": "Depois Deus fez os animais no sexto dia",
            "kind": "statement",
            "fact": true,
            "gap": {
              "word": "animals",
              "kind": "lexical",
              "options": [
                "animals",
                "birds",
                "men"
              ]
            }
          },
          {
            "order": 4,
            "en": "God said, \"Let's make man in our image\"",
            "pt": "Deus disse: \"Façamos o homem à nossa imagem\"",
            "alt": [
              "God said, \"Let us make man in our image\""
            ],
            "kind": "quote",
            "fact": true,
            "iconic": true,
            "speaker": "voice"
          },
          {
            "order": 5,
            "en": "So God created man and woman in God's image",
            "pt": "Então Deus criou o homem e a mulher à imagem de Deus",
            "alt": [
              "So God created man and woman in his image"
            ],
            "altPt": [
              "E criou Deus o homem à sua imagem; macho e fêmea os criou"
            ],
            "kind": "statement",
            "fact": true
          },
          {
            "order": 6,
            "en": "Did God make only animals? No, man and woman too",
            "pt": "Deus fez só animais? Não, o homem e a mulher também",
            "kind": "question",
            "fact": true
          },
          {
            "order": 7,
            "en": "He blessed us and said, \"Fill the earth\"",
            "pt": "Ele nos abençoou e disse: \"Encham a terra\"",
            "altPt": [
              "Ele nos abençoou e disse: \"Enchei a terra\""
            ],
            "kind": "first-person",
            "fact": true,
            "speaker": "adao"
          },
          {
            "order": 8,
            "en": "God saw everything he made and it was very good",
            "pt": "Deus viu tudo o que fez e era muito bom",
            "alt": [
              "God saw everything that he had made and it was very good"
            ],
            "altPt": [
              "E viu Deus tudo quanto tinha feito, e eis que era muito bom"
            ],
            "kind": "statement",
            "fact": true,
            "gap": {
              "word": "very",
              "kind": "grammar",
              "options": [
                "very",
                "so",
                "too"
              ]
            },
            "grammar": "very-adj"
          },
          {
            "order": 9,
            "en": "On the seventh day God finished his work",
            "pt": "No sétimo dia Deus terminou o seu trabalho",
            "altPt": [
              "No sétimo dia Deus terminou a sua obra"
            ],
            "kind": "statement",
            "fact": true
          },
          {
            "order": 10,
            "en": "He rested on the seventh day from all his work",
            "pt": "Ele descansou no sétimo dia de todo o seu trabalho",
            "altPt": [
              "E descansou no sétimo dia de toda a sua obra"
            ],
            "kind": "statement",
            "fact": true
          },
          {
            "order": 11,
            "en": "God blessed the seventh day",
            "pt": "Deus abençoou o sétimo dia",
            "kind": "statement",
            "fact": true,
            "gap": {
              "word": "blessed",
              "kind": "lexical",
              "options": [
                "blessed",
                "rested",
                "made"
              ]
            }
          },
          {
            "order": 12,
            "en": "Did God work on the seventh day? No, he rested",
            "pt": "Deus trabalhou no sétimo dia? Não, ele descansou",
            "kind": "question",
            "fact": true
          }
        ],
        "contrast": [
          {
            "a": "On the fifth day God made fish and birds",
            "b": "Then God made the animals on the sixth day",
            "note": "só mudam o dia (fifth, sixth) e o que foi feito (fish and birds, the animals)"
          },
          {
            "a": "God saw everything he made and it was very good",
            "b": "God saw everything he made and it was good",
            "note": "very = muito; sem very, good fica mais fraco"
          }
        ],
        "verse": {
          "text": "God saw everything that he had made, and, behold, it was very good.",
          "classic": "And God saw every thing that he had made, and, behold, it was very good.",
          "pt": "Deus viu tudo o que tinha feito, e era muito bom.",
          "classicPt": "E viu Deus tudo quanto tinha feito, e eis que era muito bom.",
          "ref": "Gênesis 1:31",
          "blank": "good",
          "options": [
            "good",
            "big",
            "dark",
            "new"
          ],
          "blanks": [
            {
              "word": "good",
              "options": [
                "good",
                "big",
                "dark",
                "new"
              ]
            },
            {
              "word": "everything",
              "options": [
                "everything",
                "nothing",
                "someone",
                "something"
              ]
            },
            {
              "word": "saw",
              "options": [
                "saw",
                "said",
                "called",
                "heard"
              ]
            }
          ]
        },
        "reading": {
          "text": "On the fifth day, God made the fish and the birds. On the sixth day, he made the animals, and then he made man and woman in his image. God saw everything, and it was very good. On the seventh day, God finished his work and rested. He blessed the seventh day.",
          "pt": "No quinto dia, Deus fez os peixes e os pássaros. No sexto dia, ele fez os animais e depois fez o homem e a mulher à sua imagem. Deus viu tudo, e era muito bom. No sétimo dia, Deus terminou o seu trabalho e descansou. Ele abençoou o sétimo dia.",
          "q": "What did God make on the sixth day?",
          "options": [
            "The animals, the man and the woman",
            "Fish and birds",
            "The sun and the moon"
          ],
          "answer": "The animals, the man and the woman",
          "questions": [
            {
              "kind": "literal",
              "q": "What did God make on the sixth day?",
              "qPt": "O que Deus fez no sexto dia?",
              "options": [
                "The animals, the man and the woman",
                "Fish and birds",
                "The sun and the moon"
              ],
              "answer": "The animals, the man and the woman"
            },
            {
              "kind": "inference",
              "q": "Why was the seventh day different from the other days?",
              "qPt": "Por que o sétimo dia foi diferente dos outros dias?",
              "options": [
                "God did not work on it",
                "God made the birds on it",
                "It was the day of the animals"
              ],
              "answer": "God did not work on it",
              "explain": "Nos seis dias Deus criou; no sétimo ele descansou de toda a sua obra e abençoou esse dia (Gênesis 2:2-3)."
            }
          ]
        },
        "dialogue": {
          "line": "Adam, look! What are those in the sky?",
          "pt": "Adão, olhe! O que são aqueles no céu?",
          "options": [
            "They are birds. God made them on the fifth day.",
            "They are animals. God made them on the sixth day.",
            "They are stars. God made them on the fourth day."
          ],
          "answer": "They are birds. God made them on the fifth day.",
          "answerPt": "São pássaros. Deus os fez no quinto dia."
        },
        "conversation": {
          "with": "eva",
          "turns": [
            {
              "who": "eva",
              "en": "Adam, look! What are those in the sky?",
              "pt": "Adão, olhe! O que são aqueles no céu?",
              "mood": "surpreso"
            },
            {
              "who": "you",
              "options": [
                "They are birds. God made them on the fifth day.",
                "They are animals. God made them on the sixth day.",
                "They are stars. God made them on the fourth day."
              ],
              "answer": "They are birds. God made them on the fifth day.",
              "pt": "São pássaros. Deus os fez no quinto dia.",
              "intent": "Diga o que são e em que dia Deus os fez"
            },
            {
              "who": "eva",
              "en": "And is everything good?",
              "pt": "E tudo é bom?",
              "mood": "animado"
            },
            {
              "who": "you",
              "options": [
                "Yes, everything is very good.",
                "No, everything is very dark.",
                "Yes, everything is very big."
              ],
              "answer": "Yes, everything is very good.",
              "pt": "Sim, tudo é muito bom.",
              "intent": "Diga como é tudo o que Deus fez",
              "speak": true
            }
          ]
        },
        "quiz": {
          "q": "Why was the seventh day different from the other days?",
          "options": [
            "God did not work on it",
            "God made the birds on it",
            "It was the day of the animals"
          ],
          "answer": "God did not work on it",
          "explain": "Nos seis dias Deus criou; no sétimo ele descansou de toda a sua obra e abençoou esse dia (Gênesis 2:2-3)."
        },
        "fact": {
          "pt": "O descanso de Deus no sétimo dia é a origem do sábado: o mandamento do descanso semanal lembra os seis dias da criação e o sétimo de descanso (Êxodo 20:11).",
          "ref": "Gênesis 2:2-3; Êxodo 20:11"
        },
        "v": 2
      },
      {
        "id": "u1l3",
        "title": "O jardim e a queda",
        "ref": "Gênesis 2:4 a 3:24",
        "level": "A1.1",
        "narrator": "adao",
        "guests": [
          "eva",
          "voice"
        ],
        "names": [
          {
            "en": "God",
            "pt": "Deus",
            "note": "sempre com maiúscula; os pronomes (he, his) ficam em minúscula"
          },
          {
            "en": "the Lord",
            "pt": "o Senhor",
            "note": "the Lord God = o Senhor Deus (Gênesis 2:4 em diante)"
          },
          {
            "en": "Eden",
            "pt": "Éden",
            "note": "o lugar do jardim"
          },
          {
            "en": "Adam",
            "pt": "Adão",
            "note": "o homem; em hebraico, adam = homem"
          },
          {
            "en": "Eve",
            "pt": "Eva",
            "note": "a mulher; o nome lembra \"vida\" (Gênesis 3:20)"
          }
        ],
        "hints": {
          "dust": "pó",
          "planted": "plantou",
          "evil": "mal",
          "really": "mesmo, de verdade",
          "die": "morrer",
          "saw": "viu",
          "called": "chamou",
          "sent": "mandou, enviou"
        },
        "tips": [
          {
            "part": 1,
            "id": "articles",
            "grammar": "articles",
            "title": "a garden, the garden: um e o",
            "body": "a = um, uma (um qualquer); the = o, a (aquele que já conhecemos). Antes de som de vogal, a vira an: an animal. Para dizer de quem é, use my (meu), your (seu) e his (dele): his wife.",
            "examples": [
              {
                "en": "God planted a garden",
                "pt": "Deus plantou um jardim"
              },
              {
                "en": "The garden was in Eden",
                "pt": "O jardim ficava no Éden"
              }
            ],
            "contrast": {
              "a": "a tree",
              "b": "the tree",
              "note": "a tree = uma árvore qualquer; the tree = aquela árvore"
            }
          },
          {
            "part": 2,
            "id": "where-questions",
            "grammar": "where-questions",
            "title": "Where are you? = Onde você está?",
            "body": "Where pergunta o lugar. Depois de where vem o verbo e depois a pessoa ou a coisa: Where are you? Where is the tree? Who pergunta a pessoa e what pergunta a coisa.",
            "examples": [
              {
                "en": "Where are you?",
                "pt": "Onde você está?"
              },
              {
                "en": "Where is the tree?",
                "pt": "Onde está a árvore?"
              }
            ],
            "contrast": {
              "a": "Where are you?",
              "b": "Who are you?",
              "note": "where = onde (lugar); who = quem (pessoa)"
            }
          }
        ],
        "vocab": [
          {
            "en": "garden",
            "pt": "jardim",
            "pos": "noun",
            "field": "places",
            "tier": "core",
            "part": 1,
            "icon": "🌷",
            "image": "garden.png",
            "example": 2
          },
          {
            "en": "tree",
            "pt": "árvore",
            "pos": "noun",
            "field": "nature",
            "tier": "core",
            "part": 1,
            "icon": "🌳",
            "image": "tree.png",
            "example": 3
          },
          {
            "en": "to eat",
            "pt": "comer",
            "pos": "verb",
            "field": "food",
            "tier": "core",
            "part": 1,
            "icon": "🍴",
            "image": "eat.png",
            "example": 3
          },
          {
            "en": "alone",
            "pt": "sozinho",
            "ptAlt": [
              "só",
              "sozinha"
            ],
            "pos": "adj",
            "field": "feelings",
            "tier": "core",
            "part": 1,
            "icon": "🧍",
            "example": 5
          },
          {
            "en": "Do not eat",
            "pt": "Não coma",
            "ptAlt": [
              "Não comam"
            ],
            "pos": "chunk",
            "field": "speech",
            "tier": "core",
            "part": 1,
            "icon": "⛔",
            "iconic": true,
            "example": 4
          },
          {
            "en": "snake",
            "pt": "cobra",
            "ptAlt": [
              "serpente"
            ],
            "alt": [
              "serpent"
            ],
            "pos": "noun",
            "field": "animals",
            "tier": "bible",
            "part": 2,
            "icon": "🐍",
            "image": "snake.png",
            "example": 8
          },
          {
            "en": "fruit",
            "pt": "fruto",
            "ptAlt": [
              "fruta"
            ],
            "pos": "noun",
            "field": "food",
            "tier": "core",
            "part": 2,
            "icon": "🍎",
            "image": "fruit.png",
            "example": 9
          },
          {
            "en": "to hide",
            "pt": "esconder",
            "ptAlt": [
              "se esconder"
            ],
            "pos": "verb",
            "field": "actions",
            "tier": "core",
            "part": 2,
            "icon": "🙈",
            "image": "hide.png",
            "example": 10
          },
          {
            "en": "afraid",
            "pt": "com medo",
            "pos": "adj",
            "field": "feelings",
            "tier": "core",
            "part": 2,
            "icon": "😨",
            "example": 12
          },
          {
            "en": "Where are you?",
            "pt": "Onde você está?",
            "pos": "chunk",
            "field": "speech",
            "tier": "core",
            "part": 2,
            "icon": "❓",
            "iconic": true,
            "example": 11
          }
        ],
        "sentences": [
          {
            "en": "The Lord God made the man from the dust",
            "pt": "O Senhor Deus fez o homem do pó",
            "alt": [
              "The Lord God formed the man from the dust",
              "The Lord God formed man from the dust of the ground"
            ],
            "altPt": [
              "O SENHOR Deus formou o homem do pó da terra"
            ]
          },
          {
            "en": "He planted a garden in Eden with many trees",
            "pt": "Ele plantou um jardim no Éden com muitas árvores"
          },
          {
            "en": "\"You may eat from every tree in the garden\"",
            "pt": "\"Você pode comer de toda árvore do jardim\"",
            "alt": [
              "You may freely eat of every tree of the garden"
            ],
            "altPt": [
              "De toda árvore do jardim comerás livremente"
            ]
          },
          {
            "en": "\"Do not eat from the tree of good and evil\"",
            "pt": "\"Não coma da árvore do bem e do mal\"",
            "alt": [
              "You shall not eat of the tree of the knowledge of good and evil"
            ],
            "altPt": [
              "Da árvore do conhecimento do bem e do mal não comerás"
            ]
          },
          {
            "en": "God said, \"It is not good for the man to be alone\"",
            "pt": "Deus disse: \"Não é bom que o homem esteja sozinho\"",
            "altPt": [
              "Deus disse: \"Não é bom que o homem esteja só\""
            ]
          },
          {
            "en": "God made the woman and the man was not alone",
            "pt": "Deus fez a mulher e o homem não ficou sozinho"
          },
          {
            "en": "The snake asked the woman, \"Did God really say that?\"",
            "pt": "A cobra perguntou à mulher: \"Deus disse mesmo isso?\"",
            "altPt": [
              "A serpente perguntou à mulher: \"Deus disse mesmo isso?\""
            ]
          },
          {
            "en": "The snake said, \"You will not die\"",
            "pt": "A cobra disse: \"Vocês não vão morrer\"",
            "alt": [
              "The serpent said, \"You will not die\"",
              "The snake said, \"You won't really die\""
            ],
            "altPt": [
              "A serpente disse: \"Certamente não morrereis\""
            ]
          },
          {
            "en": "She saw that the fruit was good",
            "pt": "Ela viu que o fruto era bom",
            "altPt": [
              "Ela viu que a fruta era boa"
            ]
          },
          {
            "en": "They ate the fruit and hid because they were afraid",
            "pt": "Eles comeram o fruto e se esconderam porque estavam com medo"
          },
          {
            "en": "God called the man, \"Where are you?\"",
            "pt": "Deus chamou o homem: \"Onde você está?\"",
            "alt": [
              "The Lord God called to the man, \"Where are you?\""
            ],
            "altPt": [
              "Deus chamou o homem: \"Onde estás?\""
            ]
          },
          {
            "en": "The man said, \"I was afraid and I hid\"",
            "pt": "O homem disse: \"Eu estava com medo e me escondi\"",
            "alt": [
              "The man said, \"I was afraid, so I hid\""
            ],
            "altPt": [
              "O homem disse: \"Tive medo e me escondi\""
            ]
          }
        ],
        "beats": [
          {
            "order": 1,
            "en": "The Lord God made the man from the dust",
            "pt": "O Senhor Deus fez o homem do pó",
            "alt": [
              "The Lord God formed the man from the dust",
              "The Lord God formed man from the dust of the ground"
            ],
            "altPt": [
              "O SENHOR Deus formou o homem do pó da terra"
            ],
            "kind": "statement",
            "fact": true
          },
          {
            "order": 2,
            "en": "He planted a garden in Eden with many trees",
            "pt": "Ele plantou um jardim no Éden com muitas árvores",
            "kind": "statement",
            "fact": true,
            "gap": {
              "word": "a",
              "kind": "grammar",
              "options": [
                "a",
                "the",
                "an"
              ]
            },
            "grammar": "articles"
          },
          {
            "order": 3,
            "en": "\"You may eat from every tree in the garden\"",
            "pt": "\"Você pode comer de toda árvore do jardim\"",
            "alt": [
              "You may freely eat of every tree of the garden"
            ],
            "altPt": [
              "De toda árvore do jardim comerás livremente"
            ],
            "kind": "quote",
            "fact": true,
            "speaker": "voice"
          },
          {
            "order": 4,
            "en": "\"Do not eat from the tree of good and evil\"",
            "pt": "\"Não coma da árvore do bem e do mal\"",
            "alt": [
              "You shall not eat of the tree of the knowledge of good and evil"
            ],
            "altPt": [
              "Da árvore do conhecimento do bem e do mal não comerás"
            ],
            "kind": "negative",
            "fact": true,
            "speaker": "voice",
            "gap": {
              "word": "eat",
              "kind": "lexical",
              "options": [
                "eat",
                "hide",
                "rest"
              ]
            }
          },
          {
            "order": 5,
            "en": "God said, \"It is not good for the man to be alone\"",
            "pt": "Deus disse: \"Não é bom que o homem esteja sozinho\"",
            "altPt": [
              "Deus disse: \"Não é bom que o homem esteja só\""
            ],
            "kind": "quote",
            "fact": true,
            "iconic": true,
            "prod": false,
            "speaker": "voice"
          },
          {
            "order": 6,
            "en": "God made the woman and the man was not alone",
            "pt": "Deus fez a mulher e o homem não ficou sozinho",
            "kind": "negative",
            "fact": true
          },
          {
            "order": 7,
            "en": "The snake asked the woman, \"Did God really say that?\"",
            "pt": "A cobra perguntou à mulher: \"Deus disse mesmo isso?\"",
            "altPt": [
              "A serpente perguntou à mulher: \"Deus disse mesmo isso?\""
            ],
            "kind": "question",
            "fact": true
          },
          {
            "order": 8,
            "en": "The snake said, \"You will not die\"",
            "pt": "A cobra disse: \"Vocês não vão morrer\"",
            "alt": [
              "The serpent said, \"You will not die\"",
              "The snake said, \"You won't really die\""
            ],
            "altPt": [
              "A serpente disse: \"Certamente não morrereis\""
            ],
            "kind": "negative",
            "fact": true
          },
          {
            "order": 9,
            "en": "She saw that the fruit was good",
            "pt": "Ela viu que o fruto era bom",
            "altPt": [
              "Ela viu que a fruta era boa"
            ],
            "kind": "statement",
            "fact": true
          },
          {
            "order": 10,
            "en": "They ate the fruit and hid because they were afraid",
            "pt": "Eles comeram o fruto e se esconderam porque estavam com medo",
            "kind": "statement",
            "fact": true
          },
          {
            "order": 11,
            "en": "God called the man, \"Where are you?\"",
            "pt": "Deus chamou o homem: \"Onde você está?\"",
            "alt": [
              "The Lord God called to the man, \"Where are you?\""
            ],
            "altPt": [
              "Deus chamou o homem: \"Onde estás?\""
            ],
            "kind": "quote",
            "fact": true,
            "iconic": true,
            "speaker": "voice",
            "gap": {
              "word": "Where",
              "kind": "grammar",
              "options": [
                "Where",
                "Who",
                "What"
              ]
            },
            "grammar": "where-questions"
          },
          {
            "order": 12,
            "en": "The man said, \"I was afraid and I hid\"",
            "pt": "O homem disse: \"Eu estava com medo e me escondi\"",
            "alt": [
              "The man said, \"I was afraid, so I hid\""
            ],
            "altPt": [
              "O homem disse: \"Tive medo e me escondi\""
            ],
            "kind": "first-person",
            "fact": true,
            "speaker": "adao"
          }
        ],
        "contrast": [
          {
            "a": "He planted a garden in Eden with many trees",
            "b": "He planted the garden in Eden with many trees",
            "note": "a garden = um jardim qualquer; the garden = o jardim já conhecido"
          },
          {
            "a": "The snake said, \"You will not die\"",
            "b": "God said, \"You will die\"",
            "note": "not nega a frase; Deus avisou (Gênesis 2:17) e a cobra negou (Gênesis 3:4)"
          }
        ],
        "verse": {
          "text": "The Lord God called to the man, and said to him, \"Where are you?\"",
          "classic": "And the LORD God called unto Adam, and said unto him, Where art thou?",
          "pt": "O Senhor Deus chamou o homem e lhe perguntou: \"Onde você está?\"",
          "classicPt": "E chamou o SENHOR Deus a Adão, e disse-lhe: Onde estás?",
          "ref": "Gênesis 3:9",
          "blank": "Where",
          "options": [
            "Where",
            "Who",
            "What",
            "When"
          ],
          "blanks": [
            {
              "word": "Where",
              "options": [
                "Where",
                "Who",
                "What",
                "When"
              ]
            },
            {
              "word": "man",
              "options": [
                "man",
                "woman",
                "snake",
                "tree"
              ]
            },
            {
              "word": "called",
              "options": [
                "called",
                "came",
                "looked",
                "walked"
              ]
            }
          ]
        },
        "reading": {
          "text": "In the garden of Eden, God said to the man, \"Do not eat from the tree of good and evil.\" But the snake said to the woman, \"You will not die.\" So she ate the fruit, and the man ate too. They hid from God, but he said, \"Where are you?\" At last, God sent them out of the garden.",
          "pt": "No jardim do Éden, Deus disse ao homem: \"Não coma da árvore do bem e do mal.\" Mas a cobra disse à mulher: \"Vocês não vão morrer.\" Então ela comeu o fruto, e o homem comeu também. Eles se esconderam de Deus, mas ele disse: \"Onde você está?\" No fim, Deus os mandou para fora do jardim.",
          "q": "Who told the woman that she would not die?",
          "options": [
            "The snake",
            "The man",
            "God"
          ],
          "answer": "The snake",
          "questions": [
            {
              "kind": "literal",
              "q": "Who told the woman that she would not die?",
              "qPt": "Quem disse à mulher que ela não morreria?",
              "options": [
                "The snake",
                "The man",
                "God"
              ],
              "answer": "The snake"
            },
            {
              "kind": "inference",
              "q": "Why did the man and the woman hide?",
              "qPt": "Por que o homem e a mulher se esconderam?",
              "options": [
                "They were afraid after eating the fruit",
                "The snake talked to the woman",
                "They wanted to see God"
              ],
              "answer": "They were afraid after eating the fruit",
              "explain": "Depois de comer o fruto, eles ouviram a voz de Deus no jardim e tiveram medo; por isso se esconderam (Gênesis 3:8-10)."
            }
          ]
        },
        "dialogue": {
          "line": "Adam, look at this tree! Can we eat its fruit?",
          "pt": "Adão, olhe esta árvore! Podemos comer o fruto dela?",
          "options": [
            "No. God said, \"Do not eat from that tree.\"",
            "Yes. God said, \"Eat from every tree.\"",
            "No. God said, \"Do not hide from me.\""
          ],
          "answer": "No. God said, \"Do not eat from that tree.\"",
          "answerPt": "Não. Deus disse: \"Não coma daquela árvore.\""
        },
        "conversation": {
          "with": "eva",
          "turns": [
            {
              "who": "eva",
              "en": "Adam, look at this tree! Can we eat its fruit?",
              "pt": "Adão, olhe esta árvore! Podemos comer o fruto dela?",
              "mood": "animado"
            },
            {
              "who": "you",
              "options": [
                "No. God said, \"Do not eat from that tree.\"",
                "Yes. God said, \"Eat from every tree.\"",
                "No. God said, \"Do not hide from me.\""
              ],
              "answer": "No. God said, \"Do not eat from that tree.\"",
              "pt": "Não. Deus disse: \"Não coma daquela árvore.\"",
              "intent": "Diga o que Deus mandou sobre essa árvore"
            },
            {
              "who": "eva",
              "en": "And the other trees in the garden?",
              "pt": "E as outras árvores do jardim?",
              "mood": "calmo"
            },
            {
              "who": "you",
              "options": [
                "We may eat from every other tree.",
                "We may not eat from any tree.",
                "We may eat only from that tree."
              ],
              "answer": "We may eat from every other tree.",
              "pt": "Podemos comer de todas as outras árvores.",
              "intent": "Diga de quais árvores vocês podem comer",
              "speak": true
            }
          ]
        },
        "quiz": {
          "q": "Why did the man and the woman hide?",
          "options": [
            "They were afraid after eating the fruit",
            "The snake talked to the woman",
            "They wanted to see God"
          ],
          "answer": "They were afraid after eating the fruit",
          "explain": "Depois de comer o fruto, eles ouviram a voz de Deus no jardim e tiveram medo; por isso se esconderam (Gênesis 3:8-10)."
        },
        "fact": {
          "pt": "O nome Eva (em hebraico, Havá) lembra a palavra \"vida\": Adão deu esse nome à mulher porque ela seria a mãe de todos os que vivem (Gênesis 3:20).",
          "ref": "Gênesis 3:20"
        },
        "v": 2
      },
      {
        "id": "u1r",
        "title": "Revisão",
        "review": true,
        "checkpoint": true
      }
    ]
  },
  {
    "id": "u2",
    "title": "Noé e a arca",
    "subtitle": "Gênesis 6-9",
    "icon": "🌈",
    "face": "noe",
    "color": "#1cb0f6",
    "level": "A1.1",
    "v": 2,
    "lessons": [
      {
        "id": "u2l1",
        "title": "A arca",
        "ref": "Gênesis 6:5-22; 7:1-16",
        "level": "A1.1",
        "narrator": "noe",
        "guests": [
          "sem",
          "esposa",
          "voice"
        ],
        "names": [
          {
            "en": "God",
            "pt": "Deus",
            "note": "sempre com maiúscula; os pronomes (he, his) ficam em minúscula"
          },
          {
            "en": "the Lord",
            "pt": "o Senhor"
          },
          {
            "en": "Noah",
            "pt": "Noé"
          },
          {
            "en": "Shem",
            "pt": "Sem",
            "note": "um dos três filhos de Noé"
          },
          {
            "en": "Ham",
            "pt": "Cam",
            "note": "filho de Noé"
          },
          {
            "en": "Japheth",
            "pt": "Jafé",
            "note": "filho de Noé"
          }
        ],
        "hints": {
          "bad": "maus",
          "good": "bom",
          "man": "homem",
          "walked": "andou",
          "floors": "andares",
          "father": "pai",
          "animals": "animais",
          "open": "aberta",
          "commanded": "mandou"
        },
        "tips": [
          {
            "part": 1,
            "id": "past-ed",
            "grammar": "past-ed",
            "title": "walked = passado com -ed",
            "body": "Para contar o que já aconteceu, muitos verbos ganham -ed no fim: walk vira walked, close vira closed, rain vira rained. A forma é a mesma para todas as pessoas: I walked, he walked, they walked.",
            "examples": [
              {
                "en": "Noah walks with God",
                "pt": "Noé anda com Deus"
              },
              {
                "en": "Noah walked with God",
                "pt": "Noé andou com Deus"
              }
            ],
            "contrast": {
              "a": "I look at the ark",
              "b": "I looked at the ark",
              "note": "look = agora; looked = naquele momento (look + ed)"
            }
          },
          {
            "part": 2,
            "id": "prep-place",
            "grammar": "prep-place",
            "title": "in, on, into, out of: onde e para onde",
            "body": "in = dentro de (parado); on = em cima de; into = para dentro de (movimento); out of = para fora de. Com verbos de movimento como come e go, use into e out of: come into the ark, go out of the ark.",
            "examples": [
              {
                "en": "The animals are in the ark",
                "pt": "Os animais estão na arca"
              },
              {
                "en": "The animals came into the ark",
                "pt": "Os animais entraram na arca"
              }
            ],
            "contrast": {
              "a": "Come into the ark",
              "b": "Go out of the ark",
              "note": "into = para dentro; out of = para fora"
            }
          }
        ],
        "vocab": [
          {
            "en": "ark",
            "pt": "arca",
            "alt": [
              "ship",
              "boat"
            ],
            "pos": "noun",
            "field": "objects",
            "tier": "bible",
            "part": 1,
            "icon": "🚢",
            "example": 3,
            "note": "o grande barco de Noé"
          },
          {
            "en": "wood",
            "pt": "madeira",
            "pos": "noun",
            "field": "nature",
            "tier": "core",
            "part": 1,
            "icon": "🌲",
            "example": 3
          },
          {
            "en": "long",
            "pt": "comprido",
            "ptAlt": [
              "comprida",
              "longo",
              "longa"
            ],
            "pos": "adj",
            "field": "quality",
            "tier": "core",
            "part": 1,
            "icon": "📏",
            "example": 4
          },
          {
            "en": "to build",
            "pt": "construir",
            "pos": "verb",
            "field": "work",
            "tier": "core",
            "part": 1,
            "icon": "🏗️",
            "example": 4
          },
          {
            "en": "What are you making?",
            "pt": "O que você está fazendo?",
            "ptAlt": [
              "O que você está construindo?"
            ],
            "pos": "chunk",
            "field": "speech",
            "tier": "core",
            "part": 1,
            "icon": "🗨️",
            "example": 5
          },
          {
            "en": "door",
            "pt": "porta",
            "pos": "noun",
            "field": "objects",
            "tier": "core",
            "part": 2,
            "icon": "🚪",
            "example": 11
          },
          {
            "en": "wife",
            "pt": "esposa",
            "ptAlt": [
              "mulher"
            ],
            "pos": "noun",
            "field": "family",
            "tier": "core",
            "part": 2,
            "icon": "👩‍🦳",
            "plural": "wives",
            "example": 8
          },
          {
            "en": "son",
            "pt": "filho",
            "pos": "noun",
            "field": "family",
            "tier": "core",
            "part": 2,
            "icon": "👦",
            "example": 9
          },
          {
            "en": "to close",
            "pt": "fechar",
            "alt": [
              "to shut"
            ],
            "pos": "verb",
            "field": "actions",
            "tier": "core",
            "part": 2,
            "icon": "🔒",
            "example": 11
          },
          {
            "en": "Come into the ark",
            "pt": "Entre na arca",
            "ptAlt": [
              "Entra na arca",
              "Venha para a arca"
            ],
            "pos": "chunk",
            "field": "speech",
            "tier": "core",
            "part": 2,
            "icon": "📥",
            "iconic": true,
            "example": 7
          }
        ],
        "sentences": [
          {
            "en": "Everyone on the earth was very bad",
            "pt": "Todos na terra eram muito maus",
            "altPt": [
              "A maldade do homem era grande sobre a terra"
            ]
          },
          {
            "en": "But Noah was a good man and walked with God",
            "pt": "Mas Noé era um homem bom e andava com Deus",
            "alt": [
              "But Noah was a righteous man and walked with God"
            ],
            "altPt": [
              "Mas Noé era um homem justo e andava com Deus"
            ]
          },
          {
            "en": "God said, \"Make an ark of wood\"",
            "pt": "Deus disse: \"Faça uma arca de madeira\"",
            "alt": [
              "God said, Make an ark of gopher wood",
              "God said, Make a ship of gopher wood"
            ],
            "altPt": [
              "Deus disse: Faze para ti uma arca de madeira de gofer"
            ]
          },
          {
            "en": "Noah built a very long ark with three floors",
            "pt": "Noé construiu uma arca muito comprida com três andares",
            "altPt": [
              "Noé construiu uma arca muito longa com três andares"
            ]
          },
          {
            "en": "Shem asked me, \"What are you making?\"",
            "pt": "Sem me perguntou: \"O que você está fazendo?\""
          },
          {
            "en": "I am building a long ark of wood",
            "pt": "Eu estou construindo uma arca comprida de madeira",
            "altPt": [
              "Estou construindo uma arca longa de madeira"
            ]
          },
          {
            "en": "God said, \"Come into the ark with your sons\"",
            "pt": "Deus disse: \"Entre na arca com os seus filhos\"",
            "alt": [
              "God said, Come into the ship with your sons"
            ],
            "altPt": [
              "Deus disse: Entra na arca com os teus filhos"
            ]
          },
          {
            "en": "Noah went into the ark with his wife",
            "pt": "Noé entrou na arca com a sua esposa",
            "altPt": [
              "Noé entrou na arca com a sua mulher"
            ]
          },
          {
            "en": "His three sons and their wives came too",
            "pt": "Os seus três filhos e as esposas deles também entraram",
            "altPt": [
              "Seus três filhos e as mulheres deles também vieram"
            ]
          },
          {
            "en": "The animals came into the ark two by two",
            "pt": "Os animais entraram na arca dois a dois",
            "altPt": [
              "Os animais entraram na arca aos pares"
            ]
          },
          {
            "en": "Then the Lord closed the door behind him",
            "pt": "Então o Senhor fechou a porta atrás dele",
            "alt": [
              "Then the Lord shut the door behind him",
              "Then the Lord shut him in"
            ],
            "altPt": [
              "E o Senhor o fechou por fora"
            ]
          },
          {
            "en": "Did Noah close the door? No, the Lord closed it",
            "pt": "Noé fechou a porta? Não, o Senhor a fechou",
            "altPt": [
              "Noé fechou a porta? Não, o Senhor fechou ela"
            ]
          }
        ],
        "beats": [
          {
            "order": 1,
            "en": "Everyone on the earth was very bad",
            "pt": "Todos na terra eram muito maus",
            "altPt": [
              "A maldade do homem era grande sobre a terra"
            ],
            "kind": "statement",
            "fact": true
          },
          {
            "order": 2,
            "en": "But Noah was a good man and walked with God",
            "pt": "Mas Noé era um homem bom e andava com Deus",
            "alt": [
              "But Noah was a righteous man and walked with God"
            ],
            "altPt": [
              "Mas Noé era um homem justo e andava com Deus"
            ],
            "kind": "statement",
            "fact": true,
            "gap": {
              "word": "walked",
              "kind": "grammar",
              "options": [
                "walked",
                "walk",
                "walks"
              ]
            },
            "grammar": "past-ed"
          },
          {
            "order": 3,
            "en": "God said, \"Make an ark of wood\"",
            "pt": "Deus disse: \"Faça uma arca de madeira\"",
            "alt": [
              "God said, Make an ark of gopher wood",
              "God said, Make a ship of gopher wood"
            ],
            "altPt": [
              "Deus disse: Faze para ti uma arca de madeira de gofer"
            ],
            "kind": "quote",
            "fact": true,
            "iconic": true,
            "speaker": "voice"
          },
          {
            "order": 4,
            "en": "Noah built a very long ark with three floors",
            "pt": "Noé construiu uma arca muito comprida com três andares",
            "altPt": [
              "Noé construiu uma arca muito longa com três andares"
            ],
            "kind": "statement",
            "fact": true
          },
          {
            "order": 5,
            "en": "Shem asked me, \"What are you making?\"",
            "pt": "Sem me perguntou: \"O que você está fazendo?\"",
            "kind": "question",
            "fact": false,
            "speaker": "sem"
          },
          {
            "order": 6,
            "en": "I am building a long ark of wood",
            "pt": "Eu estou construindo uma arca comprida de madeira",
            "altPt": [
              "Estou construindo uma arca longa de madeira"
            ],
            "kind": "first-person",
            "fact": false,
            "speaker": "noe",
            "gap": {
              "word": "wood",
              "kind": "lexical",
              "options": [
                "wood",
                "ark",
                "wife"
              ]
            }
          },
          {
            "order": 7,
            "en": "God said, \"Come into the ark with your sons\"",
            "pt": "Deus disse: \"Entre na arca com os seus filhos\"",
            "alt": [
              "God said, Come into the ship with your sons"
            ],
            "altPt": [
              "Deus disse: Entra na arca com os teus filhos"
            ],
            "kind": "quote",
            "fact": true,
            "iconic": true,
            "speaker": "voice"
          },
          {
            "order": 8,
            "en": "Noah went into the ark with his wife",
            "pt": "Noé entrou na arca com a sua esposa",
            "altPt": [
              "Noé entrou na arca com a sua mulher"
            ],
            "kind": "statement",
            "fact": true,
            "gap": {
              "word": "into",
              "kind": "grammar",
              "options": [
                "into",
                "on",
                "out"
              ]
            },
            "grammar": "prep-place"
          },
          {
            "order": 9,
            "en": "His three sons and their wives came too",
            "pt": "Os seus três filhos e as esposas deles também entraram",
            "altPt": [
              "Seus três filhos e as mulheres deles também vieram"
            ],
            "kind": "statement",
            "fact": true
          },
          {
            "order": 10,
            "en": "The animals came into the ark two by two",
            "pt": "Os animais entraram na arca dois a dois",
            "altPt": [
              "Os animais entraram na arca aos pares"
            ],
            "kind": "statement",
            "fact": true,
            "grammar": "prep-place"
          },
          {
            "order": 11,
            "en": "Then the Lord closed the door behind him",
            "pt": "Então o Senhor fechou a porta atrás dele",
            "alt": [
              "Then the Lord shut the door behind him",
              "Then the Lord shut him in"
            ],
            "altPt": [
              "E o Senhor o fechou por fora"
            ],
            "kind": "statement",
            "fact": true
          },
          {
            "order": 12,
            "en": "Did Noah close the door? No, the Lord closed it",
            "pt": "Noé fechou a porta? Não, o Senhor a fechou",
            "altPt": [
              "Noé fechou a porta? Não, o Senhor fechou ela"
            ],
            "kind": "question",
            "fact": true
          }
        ],
        "contrast": [
          {
            "a": "But Noah was a good man and walked with God",
            "b": "But Noah is a good man and walks with God",
            "note": "walked = passado (com -ed); walks = presente"
          },
          {
            "a": "Noah went into the ark with his wife",
            "b": "Noah went out of the ark with his wife",
            "note": "into = para dentro; out of = para fora"
          }
        ],
        "verse": {
          "text": "Thus Noah did. He did all that God commanded him.",
          "classic": "Thus did Noah; according to all that God commanded him, so did he.",
          "pt": "Assim fez Noé. Ele fez tudo o que Deus mandou.",
          "classicPt": "E fê-lo Noé; conforme a tudo o que Deus lhe mandou, assim o fez.",
          "ref": "Gênesis 6:22",
          "blank": "commanded",
          "options": [
            "commanded",
            "asked",
            "showed",
            "gave"
          ],
          "blanks": [
            {
              "word": "commanded",
              "options": [
                "commanded",
                "asked",
                "showed",
                "gave"
              ]
            },
            {
              "word": "all",
              "options": [
                "all",
                "some",
                "none",
                "half"
              ]
            }
          ]
        },
        "reading": {
          "text": "Everyone on the earth was very bad, but Noah was a good man and walked with God. God said to him, \"Make an ark of wood.\" Noah built a long ark with a door. The animals came into the ark two by two, and Noah went in with his wife and his sons. Then the Lord closed the door behind him.",
          "pt": "Todos na terra eram muito maus, mas Noé era um homem bom e andava com Deus. Deus disse a ele: \"Faça uma arca de madeira.\" Noé construiu uma arca comprida com uma porta. Os animais entraram na arca dois a dois, e Noé entrou com a sua esposa e os seus filhos. Então o Senhor fechou a porta atrás dele.",
          "q": "Who closed the door of the ark?",
          "options": [
            "The Lord did it",
            "Noah did it",
            "His sons did it"
          ],
          "answer": "The Lord did it",
          "questions": [
            {
              "kind": "literal",
              "q": "Who closed the door of the ark?",
              "qPt": "Quem fechou a porta da arca?",
              "options": [
                "The Lord did it",
                "Noah did it",
                "His sons did it"
              ],
              "answer": "The Lord did it"
            },
            {
              "kind": "inference",
              "q": "Why did Noah build the ark?",
              "qPt": "Por que Noé construiu a arca?",
              "options": [
                "Because God told him to",
                "Because he had three sons",
                "Because he wanted a long house"
              ],
              "answer": "Because God told him to",
              "explain": "Deus mandou Noé fazer a arca, e Noé fez tudo como Deus ordenou (Gênesis 6:14, 22)."
            }
          ]
        },
        "dialogue": {
          "line": "Father, what are you making? It's very long!",
          "pt": "Pai, o que você está fazendo? É muito comprido!",
          "options": [
            "An ark of wood. God wants it.",
            "A door of wood. It's for you.",
            "A long bed. It's for the animals."
          ],
          "answer": "An ark of wood. God wants it.",
          "answerPt": "Uma arca de madeira. Deus quer isso."
        },
        "conversation": {
          "with": "sem",
          "turns": [
            {
              "who": "sem",
              "en": "Father, what are you making? It's very long!",
              "pt": "Pai, o que você está fazendo? É muito comprido!",
              "mood": "surpreso"
            },
            {
              "who": "you",
              "options": [
                "An ark of wood. God wants it.",
                "A door of wood. It's for you.",
                "A long bed. It's for the animals."
              ],
              "answer": "An ark of wood. God wants it.",
              "pt": "Uma arca de madeira. Deus quer isso.",
              "intent": "Diga o que é e por que"
            },
            {
              "who": "sem",
              "en": "And how do we go in? Is there a door?",
              "pt": "E como a gente entra? Tem uma porta?",
              "mood": "animado"
            },
            {
              "who": "you",
              "options": [
                "Yes. Come into the ark with me.",
                "No. Go out of the ark with me.",
                "Yes. Close the door behind me."
              ],
              "answer": "Yes. Come into the ark with me.",
              "pt": "Sim. Entre na arca comigo.",
              "intent": "Convide Sem para entrar",
              "speak": true
            }
          ]
        },
        "quiz": {
          "q": "Why did Noah build the ark?",
          "options": [
            "Because God told him to",
            "Because he had three sons",
            "Because he wanted a long house"
          ],
          "answer": "Because God told him to",
          "explain": "Deus mandou Noé fazer a arca, e Noé fez tudo como Deus ordenou (Gênesis 6:14, 22)."
        },
        "fact": {
          "pt": "A arca tinha trezentos côvados de comprimento, cinquenta de largura e trinta de altura: cerca de 135 metros por 22 por 13, com três andares e uma porta na lateral.",
          "ref": "Gênesis 6:15-16"
        },
        "v": 2
      },
      {
        "id": "u2l2",
        "title": "O dilúvio",
        "ref": "Gênesis 7:10 a 8:5",
        "level": "A1.1",
        "narrator": "noe",
        "guests": [
          "sem",
          "esposa"
        ],
        "names": [
          {
            "en": "God",
            "pt": "Deus"
          },
          {
            "en": "Noah",
            "pt": "Noé"
          },
          {
            "en": "Shem",
            "pt": "Sem",
            "note": "filho de Noé"
          },
          {
            "en": "Ararat",
            "pt": "Ararate",
            "note": "região de montanhas onde a arca parou"
          }
        ],
        "hints": {
          "look": "olhe",
          "high": "alto",
          "covered": "cobriu",
          "remembered": "lembrou-se de",
          "rested": "parou",
          "blew": "soprou",
          "years": "anos",
          "old": "de idade",
          "animals": "animais"
        },
        "tips": [
          {
            "part": 1,
            "id": "numbers",
            "grammar": "numbers",
            "title": "seven, forty, many: números e quantidades",
            "body": "O número vem antes do substantivo e não muda de forma: seven days, forty days, two animals. Para quantidades sem número, use many (muitos), all (todos) e only (só): many days, all the animals, only Noah.",
            "examples": [
              {
                "en": "It rained for forty days",
                "pt": "Choveu por quarenta dias"
              },
              {
                "en": "The animals came in two by two",
                "pt": "Os animais entraram dois a dois"
              }
            ],
            "contrast": {
              "a": "It rained for seven days",
              "b": "It rained for forty days",
              "note": "seven = 7; forty = 40; só o número muda"
            }
          },
          {
            "part": 2,
            "id": "for-duration",
            "grammar": "for-duration",
            "title": "for + tempo: por quanto tempo",
            "body": "Para dizer quanto tempo algo durou, use for antes do período: for forty days, for many days, for a long time. Em inglês não se usa during nem by nesse caso.",
            "examples": [
              {
                "en": "It rained for forty days and forty nights",
                "pt": "Choveu por quarenta dias e quarenta noites"
              },
              {
                "en": "We waited in the ark for many days",
                "pt": "Esperamos na arca por muitos dias"
              }
            ],
            "contrast": {
              "a": "We waited for one day",
              "b": "We waited for many days",
              "note": "for + período: for one day, for many days"
            }
          }
        ],
        "vocab": [
          {
            "en": "flood",
            "pt": "dilúvio",
            "ptAlt": [
              "enchente"
            ],
            "pos": "noun",
            "field": "nature",
            "tier": "core",
            "part": 1,
            "icon": "⛈️",
            "example": 1
          },
          {
            "en": "forty",
            "pt": "quarenta",
            "pos": "num",
            "field": "quantity",
            "tier": "core",
            "part": 1,
            "icon": "🔢",
            "example": 3
          },
          {
            "en": "to rain",
            "pt": "chover",
            "pos": "verb",
            "field": "nature",
            "tier": "core",
            "part": 1,
            "icon": "🌧️",
            "example": 3,
            "note": "rain também é a chuva"
          },
          {
            "en": "water",
            "pt": "água",
            "pos": "noun",
            "field": "nature",
            "tier": "core",
            "part": 1,
            "icon": "💧",
            "example": 4
          },
          {
            "en": "It is raining!",
            "pt": "Está chovendo!",
            "pos": "chunk",
            "field": "speech",
            "tier": "core",
            "part": 1,
            "icon": "☔",
            "example": 2
          },
          {
            "en": "mountain",
            "pt": "montanha",
            "ptAlt": [
              "monte"
            ],
            "pos": "noun",
            "field": "places",
            "tier": "core",
            "part": 2,
            "icon": "⛰️",
            "example": 7
          },
          {
            "en": "alive",
            "pt": "vivo",
            "ptAlt": [
              "viva",
              "vivos"
            ],
            "pos": "adj",
            "field": "quality",
            "tier": "core",
            "part": 2,
            "icon": "💓",
            "example": 8
          },
          {
            "en": "to wait",
            "pt": "esperar",
            "pos": "verb",
            "field": "actions",
            "tier": "core",
            "part": 2,
            "icon": "⏳",
            "example": 9
          },
          {
            "en": "wind",
            "pt": "vento",
            "pos": "noun",
            "field": "nature",
            "tier": "core",
            "part": 2,
            "icon": "💨",
            "example": 11
          },
          {
            "en": "We are safe",
            "pt": "Estamos seguros",
            "ptAlt": [
              "Nós estamos seguros",
              "Estamos a salvo"
            ],
            "pos": "chunk",
            "field": "speech",
            "tier": "core",
            "part": 2,
            "icon": "😌",
            "example": 10
          }
        ],
        "sentences": [
          {
            "en": "The flood came on the earth after seven days",
            "pt": "O dilúvio veio sobre a terra depois de sete dias",
            "altPt": [
              "As águas do dilúvio vieram sobre a terra depois de sete dias"
            ]
          },
          {
            "en": "Shem said, \"Look! It is raining!\"",
            "pt": "Sem disse: \"Olhe! Está chovendo!\""
          },
          {
            "en": "It rained for forty days and forty nights",
            "pt": "Choveu por quarenta dias e quarenta noites",
            "alt": [
              "It rained on the earth forty days and forty nights",
              "The rain was on the earth forty days and forty nights"
            ],
            "altPt": [
              "Choveu quarenta dias e quarenta noites",
              "E houve chuva sobre a terra quarenta dias e quarenta noites"
            ]
          },
          {
            "en": "The water went up very high on the earth",
            "pt": "A água subiu muito alto sobre a terra",
            "altPt": [
              "As águas subiram muito sobre a terra"
            ]
          },
          {
            "en": "Our ark went up high on the water",
            "pt": "A nossa arca subiu alto sobre a água",
            "altPt": [
              "Nossa arca flutuava sobre as águas"
            ]
          },
          {
            "en": "Was the flood forty days on the earth? Yes",
            "pt": "O dilúvio ficou quarenta dias sobre a terra? Sim"
          },
          {
            "en": "The water covered all the mountains",
            "pt": "A água cobriu todas as montanhas",
            "altPt": [
              "As águas cobriram todos os altos montes"
            ]
          },
          {
            "en": "Was anyone alive outside the ark? No, nobody",
            "pt": "Alguém estava vivo fora da arca? Não, ninguém"
          },
          {
            "en": "We waited in the ark for many days",
            "pt": "Esperamos na arca por muitos dias",
            "altPt": [
              "Nós esperamos na arca por muitos dias"
            ]
          },
          {
            "en": "I said, \"Wait. We are safe and alive\"",
            "pt": "Eu disse: \"Esperem. Estamos seguros e vivos\"",
            "altPt": [
              "Eu disse: Esperem. Nós estamos seguros e vivos"
            ]
          },
          {
            "en": "God remembered Noah and the wind came",
            "pt": "Deus se lembrou de Noé, e o vento veio",
            "altPt": [
              "Deus lembrou-se de Noé e fez passar um vento sobre a terra"
            ]
          },
          {
            "en": "The wind blew and the ark rested on the mountains",
            "pt": "O vento soprou e a arca parou sobre as montanhas",
            "altPt": [
              "O vento soprou e a arca repousou sobre os montes"
            ]
          }
        ],
        "beats": [
          {
            "order": 1,
            "en": "The flood came on the earth after seven days",
            "pt": "O dilúvio veio sobre a terra depois de sete dias",
            "altPt": [
              "As águas do dilúvio vieram sobre a terra depois de sete dias"
            ],
            "kind": "statement",
            "fact": true,
            "gap": {
              "word": "seven",
              "kind": "grammar",
              "options": [
                "seven",
                "six",
                "forty"
              ]
            },
            "grammar": "numbers"
          },
          {
            "order": 2,
            "en": "Shem said, \"Look! It is raining!\"",
            "pt": "Sem disse: \"Olhe! Está chovendo!\"",
            "kind": "quote",
            "fact": false,
            "speaker": "sem"
          },
          {
            "order": 3,
            "en": "It rained for forty days and forty nights",
            "pt": "Choveu por quarenta dias e quarenta noites",
            "alt": [
              "It rained on the earth forty days and forty nights",
              "The rain was on the earth forty days and forty nights"
            ],
            "altPt": [
              "Choveu quarenta dias e quarenta noites",
              "E houve chuva sobre a terra quarenta dias e quarenta noites"
            ],
            "kind": "statement",
            "fact": true,
            "iconic": true
          },
          {
            "order": 4,
            "en": "The water went up very high on the earth",
            "pt": "A água subiu muito alto sobre a terra",
            "altPt": [
              "As águas subiram muito sobre a terra"
            ],
            "kind": "statement",
            "fact": true
          },
          {
            "order": 5,
            "en": "Our ark went up high on the water",
            "pt": "A nossa arca subiu alto sobre a água",
            "altPt": [
              "Nossa arca flutuava sobre as águas"
            ],
            "kind": "first-person",
            "fact": true,
            "speaker": "noe"
          },
          {
            "order": 6,
            "en": "Was the flood forty days on the earth? Yes",
            "pt": "O dilúvio ficou quarenta dias sobre a terra? Sim",
            "kind": "question",
            "fact": true
          },
          {
            "order": 7,
            "en": "The water covered all the mountains",
            "pt": "A água cobriu todas as montanhas",
            "altPt": [
              "As águas cobriram todos os altos montes"
            ],
            "kind": "statement",
            "fact": true,
            "gap": {
              "word": "water",
              "kind": "lexical",
              "options": [
                "water",
                "wind",
                "ark"
              ]
            }
          },
          {
            "order": 8,
            "en": "Was anyone alive outside the ark? No, nobody",
            "pt": "Alguém estava vivo fora da arca? Não, ninguém",
            "kind": "question",
            "fact": true
          },
          {
            "order": 9,
            "en": "We waited in the ark for many days",
            "pt": "Esperamos na arca por muitos dias",
            "altPt": [
              "Nós esperamos na arca por muitos dias"
            ],
            "kind": "first-person",
            "fact": false,
            "speaker": "noe",
            "gap": {
              "word": "for",
              "kind": "grammar",
              "options": [
                "for",
                "at",
                "by"
              ]
            },
            "grammar": "for-duration"
          },
          {
            "order": 10,
            "en": "I said, \"Wait. We are safe and alive\"",
            "pt": "Eu disse: \"Esperem. Estamos seguros e vivos\"",
            "altPt": [
              "Eu disse: Esperem. Nós estamos seguros e vivos"
            ],
            "kind": "first-person",
            "fact": false,
            "speaker": "noe"
          },
          {
            "order": 11,
            "en": "God remembered Noah and the wind came",
            "pt": "Deus se lembrou de Noé, e o vento veio",
            "altPt": [
              "Deus lembrou-se de Noé e fez passar um vento sobre a terra"
            ],
            "kind": "statement",
            "fact": true
          },
          {
            "order": 12,
            "en": "The wind blew and the ark rested on the mountains",
            "pt": "O vento soprou e a arca parou sobre as montanhas",
            "altPt": [
              "O vento soprou e a arca repousou sobre os montes"
            ],
            "kind": "statement",
            "fact": true
          }
        ],
        "contrast": [
          {
            "a": "It rained for forty days and forty nights",
            "b": "It rained for seven days and seven nights",
            "note": "só muda o número: forty / seven"
          },
          {
            "a": "We waited in the ark for many days",
            "b": "We waited in the ark for one day",
            "note": "for + tempo: for many days, for one day"
          }
        ],
        "verse": {
          "text": "It rained on the earth forty days and forty nights.",
          "classic": "And the rain was upon the earth forty days and forty nights.",
          "pt": "Choveu sobre a terra quarenta dias e quarenta noites.",
          "classicPt": "E houve chuva sobre a terra quarenta dias e quarenta noites.",
          "ref": "Gênesis 7:12",
          "blank": "rained",
          "options": [
            "rained",
            "waited",
            "walked",
            "closed"
          ],
          "blanks": [
            {
              "word": "rained",
              "options": [
                "rained",
                "waited",
                "walked",
                "closed"
              ]
            },
            {
              "word": "nights",
              "options": [
                "nights",
                "years",
                "weeks",
                "months"
              ]
            },
            {
              "word": "earth",
              "options": [
                "earth",
                "ark",
                "mountain",
                "sea"
              ]
            }
          ]
        },
        "reading": {
          "text": "It rained for forty days and forty nights, and the water covered all the mountains. Nobody outside the ark was alive, but Noah and his sons were safe. Then God remembered Noah, and a wind came over the earth. The water went down, and the ark rested on the mountains of Ararat.",
          "pt": "Choveu por quarenta dias e quarenta noites, e a água cobriu todas as montanhas. Ninguém fora da arca estava vivo, mas Noé e os seus filhos estavam seguros. Então Deus se lembrou de Noé, e um vento veio sobre a terra. A água baixou, e a arca parou sobre as montanhas de Ararate.",
          "q": "Where did the ark stop?",
          "options": [
            "On a high mountain",
            "On the dry earth",
            "In the deep water"
          ],
          "answer": "On a high mountain",
          "questions": [
            {
              "kind": "literal",
              "q": "Where did the ark stop?",
              "qPt": "Onde a arca parou?",
              "options": [
                "On a high mountain",
                "On the dry earth",
                "In the deep water"
              ],
              "answer": "On a high mountain"
            },
            {
              "kind": "inference",
              "q": "Why did the water go down?",
              "qPt": "Por que a água baixou?",
              "options": [
                "Because God did not forget Noah",
                "Because it rained for many days",
                "Because the ark was very long"
              ],
              "answer": "Because God did not forget Noah",
              "explain": "Deus se lembrou de Noé e fez passar um vento sobre a terra; então as águas baixaram (Gênesis 8:1)."
            }
          ]
        },
        "dialogue": {
          "line": "Noah, it is raining a lot! Are we safe?",
          "pt": "Noé, está chovendo muito! Estamos seguros?",
          "options": [
            "Yes, we are safe in the ark.",
            "No, we are not in the ark.",
            "Yes, we are safe on the mountain."
          ],
          "answer": "Yes, we are safe in the ark.",
          "answerPt": "Sim, estamos seguros na arca."
        },
        "conversation": {
          "with": "esposa",
          "turns": [
            {
              "who": "esposa",
              "en": "Noah, it is raining a lot! Are we safe?",
              "pt": "Noé, está chovendo muito! Estamos seguros?",
              "mood": "assustado"
            },
            {
              "who": "you",
              "options": [
                "Yes, we are safe in the ark.",
                "No, we are not in the ark.",
                "Yes, we are safe on the mountain."
              ],
              "answer": "Yes, we are safe in the ark.",
              "pt": "Sim, estamos seguros na arca.",
              "intent": "Acalme a sua esposa"
            },
            {
              "who": "esposa",
              "en": "How many days will it rain?",
              "pt": "Quantos dias vai chover?",
              "mood": "calmo"
            },
            {
              "who": "you",
              "options": [
                "Forty days and forty nights.",
                "Seven days and seven nights.",
                "One day and one night."
              ],
              "answer": "Forty days and forty nights.",
              "pt": "Quarenta dias e quarenta noites.",
              "intent": "Diga quanto tempo vai chover",
              "speak": true
            }
          ]
        },
        "quiz": {
          "q": "Why did the water go down?",
          "options": [
            "Because God did not forget Noah",
            "Because it rained for many days",
            "Because the ark was very long"
          ],
          "answer": "Because God did not forget Noah",
          "explain": "Deus se lembrou de Noé e fez passar um vento sobre a terra; então as águas baixaram (Gênesis 8:1)."
        },
        "fact": {
          "pt": "Noé tinha seiscentos anos quando veio o dilúvio, e as águas ficaram altas sobre a terra por cento e cinquenta dias.",
          "ref": "Gênesis 7:6, 24"
        },
        "v": 2
      },
      {
        "id": "u2l3",
        "title": "A pomba e o arco",
        "ref": "Gênesis 8:6 a 9:17",
        "level": "A1.1",
        "narrator": "noe",
        "guests": [
          "sem",
          "esposa",
          "voice"
        ],
        "names": [
          {
            "en": "God",
            "pt": "Deus"
          },
          {
            "en": "the Lord",
            "pt": "o Senhor"
          },
          {
            "en": "Noah",
            "pt": "Noé"
          },
          {
            "en": "Shem",
            "pt": "Sem",
            "note": "filho de Noé"
          }
        ],
        "hints": {
          "raven": "corvo",
          "found": "encontrou",
          "place": "lugar",
          "rest": "descansar",
          "altar": "altar",
          "made": "fez",
          "destroy": "destruir",
          "sign": "sinal",
          "promised": "prometeu",
          "animals": "animais"
        },
        "tips": [
          {
            "part": 1,
            "id": "connectors",
            "grammar": "connectors",
            "title": "and, but, then: ligando as frases",
            "body": "and liga duas ideias (e); but mostra um contraste (mas); then marca o passo seguinte (então, depois). Com then, a frase costuma começar por ele: Then he sent out a dove.",
            "examples": [
              {
                "en": "First Noah sent out a raven",
                "pt": "Primeiro Noé soltou um corvo"
              },
              {
                "en": "Then he sent out a dove",
                "pt": "Depois ele soltou uma pomba"
              }
            ],
            "contrast": {
              "a": "The dove came back and it had a leaf",
              "b": "The dove went out but it did not come back",
              "note": "and = soma; but = contraste"
            }
          },
          {
            "part": 2,
            "id": "there-is",
            "grammar": "there-is",
            "title": "there is / there are = há",
            "body": "Para dizer que algo existe agora, use there is (uma coisa) ou there are (várias): There is a rainbow in the cloud. There are many animals in the ark. No passado, você já viu there was e there were na unidade 1.",
            "examples": [
              {
                "en": "There is a rainbow in the cloud",
                "pt": "Há um arco-íris na nuvem"
              },
              {
                "en": "There are many animals in the ark",
                "pt": "Há muitos animais na arca"
              }
            ],
            "contrast": {
              "a": "There is a rainbow",
              "b": "There was a rainbow",
              "note": "is = agora; was = antes"
            }
          }
        ],
        "vocab": [
          {
            "en": "dove",
            "pt": "pomba",
            "pos": "noun",
            "field": "animals",
            "tier": "bible",
            "part": 1,
            "icon": "🕊️",
            "example": 2
          },
          {
            "en": "to send",
            "pt": "enviar",
            "ptAlt": [
              "mandar",
              "soltar"
            ],
            "pos": "verb",
            "field": "actions",
            "tier": "core",
            "part": 1,
            "icon": "📨",
            "example": 1,
            "note": "send out = soltar, mandar para fora"
          },
          {
            "en": "to come back",
            "pt": "voltar",
            "pos": "verb",
            "field": "actions",
            "tier": "core",
            "part": 1,
            "icon": "🔙",
            "example": 5
          },
          {
            "en": "again",
            "pt": "de novo",
            "ptAlt": [
              "novamente",
              "outra vez"
            ],
            "pos": "adv",
            "field": "time",
            "tier": "core",
            "part": 1,
            "icon": "🔁",
            "example": 4
          },
          {
            "en": "an olive leaf",
            "pt": "uma folha de oliveira",
            "pos": "chunk",
            "field": "nature",
            "tier": "core",
            "part": 1,
            "icon": "🍃",
            "example": 5
          },
          {
            "en": "family",
            "pt": "família",
            "pos": "noun",
            "field": "family",
            "tier": "core",
            "part": 2,
            "icon": "👨‍👩‍👧‍👦",
            "example": 7
          },
          {
            "en": "rainbow",
            "pt": "arco-íris",
            "ptAlt": [
              "arco"
            ],
            "alt": [
              "bow"
            ],
            "pos": "noun",
            "field": "nature",
            "tier": "core",
            "part": 2,
            "icon": "🌈",
            "example": 11
          },
          {
            "en": "cloud",
            "pt": "nuvem",
            "pos": "noun",
            "field": "nature",
            "tier": "core",
            "part": 2,
            "icon": "☁️",
            "example": 11
          },
          {
            "en": "covenant",
            "pt": "aliança",
            "pos": "noun",
            "field": "faith",
            "tier": "bible",
            "part": 2,
            "icon": "🤝",
            "example": 9,
            "note": "um acordo solene; na Almeida, concerto"
          },
          {
            "en": "never again",
            "pt": "nunca mais",
            "pos": "chunk",
            "field": "speech",
            "tier": "core",
            "part": 2,
            "icon": "🙅",
            "iconic": true,
            "example": 10
          }
        ],
        "sentences": [
          {
            "en": "First Noah sent out a raven",
            "pt": "Primeiro Noé soltou um corvo",
            "altPt": [
              "Primeiro Noé enviou um corvo"
            ]
          },
          {
            "en": "Then he sent out a dove",
            "pt": "Depois ele soltou uma pomba",
            "altPt": [
              "Então ele enviou uma pomba"
            ]
          },
          {
            "en": "Was there a place for the dove? No",
            "pt": "Havia um lugar para a pomba? Não",
            "altPt": [
              "Tinha um lugar para a pomba? Não"
            ]
          },
          {
            "en": "Noah waited seven days and then sent the dove again",
            "pt": "Noé esperou sete dias e então soltou a pomba de novo",
            "altPt": [
              "Noé esperou sete dias e depois enviou a pomba outra vez"
            ]
          },
          {
            "en": "The dove came back with an olive leaf",
            "pt": "A pomba voltou com uma folha de oliveira",
            "altPt": [
              "A pomba voltou com uma folha de oliveira no bico"
            ]
          },
          {
            "en": "He sent it again and it did not come back",
            "pt": "Ele a soltou de novo e ela não voltou",
            "altPt": [
              "Ele enviou a pomba outra vez e ela não voltou mais"
            ]
          },
          {
            "en": "God said, \"Go out of the ark with your family\"",
            "pt": "Deus disse: \"Saia da arca com a sua família\"",
            "alt": [
              "God said, Go out of the ship with your family"
            ],
            "altPt": [
              "Deus disse: Sai da arca com a tua família"
            ]
          },
          {
            "en": "My family and I went out of the ark",
            "pt": "A minha família e eu saímos da arca",
            "altPt": [
              "Eu e a minha família saímos da arca"
            ]
          },
          {
            "en": "God made a covenant with Noah and the animals",
            "pt": "Deus fez uma aliança com Noé e com os animais",
            "altPt": [
              "Deus fez um concerto com Noé e com os animais"
            ]
          },
          {
            "en": "Will a flood destroy the earth again? Never again",
            "pt": "Um dilúvio vai destruir a terra de novo? Nunca mais",
            "altPt": [
              "Um dilúvio destruirá a terra outra vez? Nunca mais"
            ]
          },
          {
            "en": "There is a rainbow in the cloud",
            "pt": "Há um arco-íris na nuvem",
            "altPt": [
              "Tem um arco-íris na nuvem",
              "Há um arco na nuvem"
            ]
          },
          {
            "en": "The rainbow in the cloud is the sign of the covenant",
            "pt": "O arco-íris na nuvem é o sinal da aliança",
            "altPt": [
              "O arco nas nuvens é o sinal do concerto"
            ]
          }
        ],
        "beats": [
          {
            "order": 1,
            "en": "First Noah sent out a raven",
            "pt": "Primeiro Noé soltou um corvo",
            "altPt": [
              "Primeiro Noé enviou um corvo"
            ],
            "kind": "statement",
            "fact": true
          },
          {
            "order": 2,
            "en": "Then he sent out a dove",
            "pt": "Depois ele soltou uma pomba",
            "altPt": [
              "Então ele enviou uma pomba"
            ],
            "kind": "statement",
            "fact": true
          },
          {
            "order": 3,
            "en": "Was there a place for the dove? No",
            "pt": "Havia um lugar para a pomba? Não",
            "altPt": [
              "Tinha um lugar para a pomba? Não"
            ],
            "kind": "question",
            "fact": true
          },
          {
            "order": 4,
            "en": "Noah waited seven days and then sent the dove again",
            "pt": "Noé esperou sete dias e então soltou a pomba de novo",
            "altPt": [
              "Noé esperou sete dias e depois enviou a pomba outra vez"
            ],
            "kind": "statement",
            "fact": true,
            "gap": {
              "word": "then",
              "kind": "grammar",
              "options": [
                "then",
                "but",
                "so"
              ]
            },
            "grammar": "connectors"
          },
          {
            "order": 5,
            "en": "The dove came back with an olive leaf",
            "pt": "A pomba voltou com uma folha de oliveira",
            "altPt": [
              "A pomba voltou com uma folha de oliveira no bico"
            ],
            "kind": "statement",
            "fact": true,
            "iconic": true,
            "gap": {
              "word": "dove",
              "kind": "lexical",
              "options": [
                "dove",
                "ark",
                "cloud"
              ]
            }
          },
          {
            "order": 6,
            "en": "He sent it again and it did not come back",
            "pt": "Ele a soltou de novo e ela não voltou",
            "altPt": [
              "Ele enviou a pomba outra vez e ela não voltou mais"
            ],
            "kind": "negative",
            "fact": true
          },
          {
            "order": 7,
            "en": "God said, \"Go out of the ark with your family\"",
            "pt": "Deus disse: \"Saia da arca com a sua família\"",
            "alt": [
              "God said, Go out of the ship with your family"
            ],
            "altPt": [
              "Deus disse: Sai da arca com a tua família"
            ],
            "kind": "quote",
            "fact": true,
            "iconic": true,
            "speaker": "voice"
          },
          {
            "order": 8,
            "en": "My family and I went out of the ark",
            "pt": "A minha família e eu saímos da arca",
            "altPt": [
              "Eu e a minha família saímos da arca"
            ],
            "kind": "first-person",
            "fact": true,
            "speaker": "noe"
          },
          {
            "order": 9,
            "en": "God made a covenant with Noah and the animals",
            "pt": "Deus fez uma aliança com Noé e com os animais",
            "altPt": [
              "Deus fez um concerto com Noé e com os animais"
            ],
            "kind": "statement",
            "fact": true
          },
          {
            "order": 10,
            "en": "Will a flood destroy the earth again? Never again",
            "pt": "Um dilúvio vai destruir a terra de novo? Nunca mais",
            "altPt": [
              "Um dilúvio destruirá a terra outra vez? Nunca mais"
            ],
            "kind": "question",
            "fact": true
          },
          {
            "order": 11,
            "en": "There is a rainbow in the cloud",
            "pt": "Há um arco-íris na nuvem",
            "altPt": [
              "Tem um arco-íris na nuvem",
              "Há um arco na nuvem"
            ],
            "kind": "statement",
            "fact": true,
            "gap": {
              "word": "is",
              "kind": "grammar",
              "options": [
                "is",
                "are",
                "was"
              ]
            },
            "grammar": "there-is"
          },
          {
            "order": 12,
            "en": "The rainbow in the cloud is the sign of the covenant",
            "pt": "O arco-íris na nuvem é o sinal da aliança",
            "altPt": [
              "O arco nas nuvens é o sinal do concerto"
            ],
            "kind": "statement",
            "fact": true,
            "iconic": true,
            "prod": false
          }
        ],
        "contrast": [
          {
            "a": "He sent it again and it did not come back",
            "b": "He sent it again but it did not come back",
            "note": "and = e (sequência); but = mas (contraste)"
          },
          {
            "a": "There is a rainbow in the cloud",
            "b": "There was a rainbow in the cloud",
            "note": "there is = há (agora); there was = havia"
          }
        ],
        "verse": {
          "text": "I set my rainbow in the cloud, and it will be a sign of a covenant.",
          "classic": "I do set my bow in the cloud, and it shall be for a token of a covenant.",
          "pt": "Eu ponho o meu arco-íris na nuvem, e ele será o sinal de uma aliança.",
          "classicPt": "O meu arco tenho posto nas nuvens; este será por sinal do concerto.",
          "ref": "Gênesis 9:13",
          "blank": "rainbow",
          "options": [
            "rainbow",
            "dove",
            "raven",
            "leaf"
          ],
          "blanks": [
            {
              "word": "rainbow",
              "options": [
                "rainbow",
                "dove",
                "raven",
                "leaf"
              ]
            },
            {
              "word": "cloud",
              "options": [
                "cloud",
                "sea",
                "mountain",
                "ark"
              ]
            },
            {
              "word": "sign",
              "options": [
                "sign",
                "door",
                "window",
                "flood"
              ]
            }
          ]
        },
        "reading": {
          "text": "Noah sent out a dove, but it came back. Seven days later, he sent the dove again, and it came back with an olive leaf. Then God said, \"Go out of the ark with your family.\" Noah went out and built an altar to the Lord. God made a covenant with Noah, and the rainbow in the cloud is the sign: never again will a flood destroy the earth.",
          "pt": "Noé soltou uma pomba, mas ela voltou. Sete dias depois, ele soltou a pomba de novo, e ela voltou com uma folha de oliveira. Então Deus disse: \"Saia da arca com a sua família.\" Noé saiu e construiu um altar ao Senhor. Deus fez uma aliança com Noé, e o arco-íris na nuvem é o sinal: nunca mais um dilúvio destruirá a terra.",
          "q": "What did the dove bring back?",
          "options": [
            "A leaf from an olive tree",
            "A place to rest",
            "A small white cloud"
          ],
          "answer": "A leaf from an olive tree",
          "questions": [
            {
              "kind": "literal",
              "q": "What did the dove bring back?",
              "qPt": "O que a pomba trouxe de volta?",
              "options": [
                "A leaf from an olive tree",
                "A place to rest",
                "A small white cloud"
              ],
              "answer": "A leaf from an olive tree"
            },
            {
              "kind": "inference",
              "q": "What does the rainbow mean?",
              "qPt": "O que o arco-íris significa?",
              "options": [
                "God will not send a flood again",
                "The dove will come back again",
                "Noah must build another altar"
              ],
              "answer": "God will not send a flood again",
              "explain": "O arco-íris é o sinal da aliança: nunca mais um dilúvio destruirá a terra (Gênesis 9:11-13)."
            }
          ]
        },
        "dialogue": {
          "line": "Father, look! There is something in the cloud!",
          "pt": "Pai, olhe! Há algo na nuvem!",
          "options": [
            "It's a rainbow. It's God's promise to us.",
            "It's a dove. It's coming back to us.",
            "It's the rain. It's coming back to us."
          ],
          "answer": "It's a rainbow. It's God's promise to us.",
          "answerPt": "É um arco-íris. É a promessa de Deus para nós."
        },
        "conversation": {
          "with": "sem",
          "turns": [
            {
              "who": "sem",
              "en": "Father, look! There is something in the cloud!",
              "pt": "Pai, olhe! Há algo na nuvem!",
              "mood": "surpreso"
            },
            {
              "who": "you",
              "options": [
                "It's a rainbow. It's God's promise to us.",
                "It's a dove. It's coming back to us.",
                "It's the rain. It's coming back to us."
              ],
              "answer": "It's a rainbow. It's God's promise to us.",
              "pt": "É um arco-íris. É a promessa de Deus para nós.",
              "intent": "Diga o que é e o que significa"
            },
            {
              "who": "sem",
              "en": "Will there be another flood?",
              "pt": "Vai haver outro dilúvio?",
              "mood": "assustado"
            },
            {
              "who": "you",
              "options": [
                "No. Never again. God promised.",
                "Yes. Very soon. God promised.",
                "No. Not today. Maybe later."
              ],
              "answer": "No. Never again. God promised.",
              "pt": "Não. Nunca mais. Deus prometeu.",
              "intent": "Tranquilize Sem com a promessa de Deus",
              "speak": true
            }
          ]
        },
        "quiz": {
          "q": "What does the rainbow mean?",
          "options": [
            "God will not send a flood again",
            "The dove will come back again",
            "Noah must build another altar"
          ],
          "answer": "God will not send a flood again",
          "explain": "O arco-íris é o sinal da aliança: nunca mais um dilúvio destruirá a terra (Gênesis 9:11-13)."
        },
        "fact": {
          "pt": "A pomba voltou à tarde com uma folha de oliveira recém-arrancada no bico; por isso Noé soube que as águas tinham baixado.",
          "ref": "Gênesis 8:11"
        },
        "v": 2
      },
      {
        "id": "u2r",
        "title": "Revisão",
        "review": true,
        "checkpoint": true
      }
    ]
  },
  {
    "id": "u6",
    "title": "José no Egito",
    "subtitle": "Gênesis 37-50",
    "icon": "🌾",
    "face": "jose",
    "color": "#ce82ff",
    "level": "A1.2",
    "v": 2,
    "lessons": [
      {
        "id": "u6l1",
        "title": "Os sonhos e a túnica",
        "ref": "Gênesis 37",
        "level": "A1.2",
        "narrator": "jose",
        "guests": [
          "juda",
          "jaco",
          "ismaelita"
        ],
        "names": [
          {
            "en": "Joseph",
            "pt": "José",
            "note": "o filho querido de Jacó; narra a unidade"
          },
          {
            "en": "Jacob",
            "pt": "Jacó",
            "note": "o pai de José; também é chamado Israel"
          },
          {
            "en": "Judah",
            "pt": "Judá",
            "note": "um dos irmãos de José"
          },
          {
            "en": "Ishmaelites",
            "pt": "ismaelitas",
            "note": "mercadores que iam para o Egito"
          },
          {
            "en": "Egypt",
            "pt": "Egito"
          }
        ],
        "hints": {
          "father": "pai",
          "color": "cor, cores",
          "see": "ver, viu, viram",
          "moon": "lua",
          "star": "estrela, estrelas",
          "bow": "curvar-se, se curvaram",
          "put": "pôr, puseram",
          "pit": "poço",
          "piece": "moeda, moedas",
          "cry": "chorar, chorou",
          "kill": "matar",
          "dreamer": "sonhador"
        },
        "tips": [
          {
            "part": 1,
            "id": "past-feeling",
            "grammar": "past-feeling",
            "title": "loved, hated: sentimentos no passado",
            "body": "Verbos de sentimento ganham -ed no passado: love vira loved, hate vira hated, dream vira dreamed. Para comparar, use more than: loved me more than my brothers (me amava mais do que os meus irmãos).",
            "examples": [
              {
                "en": "My father loves me",
                "pt": "Meu pai me ama"
              },
              {
                "en": "My father loved me more than my brothers",
                "pt": "Meu pai me amava mais do que os meus irmãos"
              }
            ],
            "contrast": {
              "a": "They hate me",
              "b": "They hated me",
              "note": "hate = agora; hated = naquele tempo"
            }
          },
          {
            "part": 2,
            "id": "object-pronouns",
            "grammar": "object-pronouns",
            "title": "me, him, them: quem recebe a ação",
            "body": "Depois do verbo, o pronome muda: I vira me, he vira him, they vira them, we vira us. They sold me (eles me venderam). Let's sell him (vamos vendê-lo). Em inglês o pronome vem sempre depois do verbo.",
            "examples": [
              {
                "en": "He loved me",
                "pt": "Ele me amava"
              },
              {
                "en": "They sold him",
                "pt": "Eles o venderam"
              }
            ],
            "contrast": {
              "a": "They sold me",
              "b": "They sold him",
              "note": "me = eu recebo a ação; him = ele recebe a ação"
            }
          }
        ],
        "vocab": [
          {
            "en": "dream",
            "pt": "sonho",
            "pos": "noun",
            "field": "mind",
            "tier": "core",
            "part": 1,
            "icon": "💤",
            "example": 4
          },
          {
            "en": "coat",
            "pt": "túnica",
            "ptAlt": [
              "casaco",
              "manto"
            ],
            "alt": [
              "tunic",
              "robe"
            ],
            "pos": "noun",
            "field": "objects",
            "tier": "core",
            "part": 1,
            "icon": "🧥",
            "example": 2
          },
          {
            "en": "to love",
            "pt": "amar",
            "pos": "verb",
            "field": "feelings",
            "tier": "core",
            "part": 1,
            "icon": "💕",
            "example": 1
          },
          {
            "en": "to hate",
            "pt": "odiar",
            "pos": "verb",
            "field": "feelings",
            "tier": "core",
            "part": 1,
            "icon": "😠",
            "example": 3
          },
          {
            "en": "Listen to my dream",
            "pt": "Ouçam o meu sonho",
            "ptAlt": [
              "Ouça o meu sonho",
              "Escutem o meu sonho"
            ],
            "pos": "chunk",
            "field": "speech",
            "tier": "core",
            "part": 1,
            "icon": "🌠",
            "iconic": true,
            "example": 4
          },
          {
            "en": "brother",
            "pt": "irmão",
            "pos": "noun",
            "field": "family",
            "tier": "core",
            "part": 2,
            "icon": "👬",
            "example": 9
          },
          {
            "en": "to sell",
            "pt": "vender",
            "pos": "verb",
            "field": "work",
            "tier": "core",
            "part": 2,
            "icon": "💵",
            "example": 10
          },
          {
            "en": "silver",
            "pt": "prata",
            "pos": "noun",
            "field": "objects",
            "tier": "core",
            "part": 2,
            "icon": "🥈",
            "example": 10
          },
          {
            "en": "to take",
            "pt": "levar",
            "ptAlt": [
              "pegar",
              "tomar"
            ],
            "pos": "verb",
            "field": "actions",
            "tier": "core",
            "part": 2,
            "icon": "🧳",
            "example": 11
          },
          {
            "en": "Let's sell him",
            "pt": "Vamos vendê-lo",
            "ptAlt": [
              "Vamos vender ele"
            ],
            "pos": "chunk",
            "field": "speech",
            "tier": "core",
            "part": 2,
            "icon": "🐪",
            "iconic": true,
            "example": 9
          }
        ],
        "sentences": [
          {
            "en": "My father Jacob loved me more than my brothers",
            "pt": "Meu pai Jacó me amava mais do que os meus irmãos",
            "altPt": [
              "Meu pai Jacó amava a mim mais do que aos meus irmãos"
            ]
          },
          {
            "en": "He made me a coat of many colors",
            "pt": "Ele me fez uma túnica de muitas cores",
            "alt": [
              "He made me a tunic of many colors"
            ],
            "altPt": [
              "Ele fez para mim uma túnica de muitas cores"
            ]
          },
          {
            "en": "My brothers saw the coat and hated me",
            "pt": "Meus irmãos viram a túnica e me odiaram"
          },
          {
            "en": "I had a dream and said, \"Listen to my dream\"",
            "pt": "Eu tive um sonho e disse: \"Ouçam o meu sonho\"",
            "altPt": [
              "Eu tive um sonho e disse: \"Escutem o meu sonho\""
            ]
          },
          {
            "en": "The sun, the moon and eleven stars bowed down to me",
            "pt": "O sol, a lua e onze estrelas se curvaram diante de mim",
            "altPt": [
              "O sol, e a lua, e onze estrelas se inclinavam a mim"
            ]
          },
          {
            "en": "Did my brothers love my dreams? No, they hated them",
            "pt": "Meus irmãos amavam os meus sonhos? Não, eles os odiavam"
          },
          {
            "en": "One day my father sent me to my brothers",
            "pt": "Um dia meu pai me mandou até os meus irmãos"
          },
          {
            "en": "They took my coat and put me in a pit",
            "pt": "Eles tiraram a minha túnica e me puseram num poço",
            "altPt": [
              "Eles pegaram a minha túnica e me colocaram em um poço"
            ]
          },
          {
            "en": "Judah said, \"Let's sell him. He is our brother\"",
            "pt": "Judá disse: \"Vamos vendê-lo. Ele é nosso irmão\"",
            "altPt": [
              "Judá disse: \"Vamos vender ele. Ele é nosso irmão\""
            ]
          },
          {
            "en": "They sold me to the Ishmaelites for silver",
            "pt": "Eles me venderam aos ismaelitas por prata",
            "alt": [
              "They sold me to the Ishmeelites for silver"
            ]
          },
          {
            "en": "The Ishmaelites took me to Egypt",
            "pt": "Os ismaelitas me levaram para o Egito"
          },
          {
            "en": "How much silver did they get for me? Twenty pieces",
            "pt": "Quanta prata eles receberam por mim? Vinte moedas"
          }
        ],
        "beats": [
          {
            "order": 1,
            "en": "My father Jacob loved me more than my brothers",
            "pt": "Meu pai Jacó me amava mais do que os meus irmãos",
            "altPt": [
              "Meu pai Jacó amava a mim mais do que aos meus irmãos"
            ],
            "kind": "first-person",
            "fact": true,
            "speaker": "jose",
            "gap": {
              "word": "loved",
              "kind": "grammar",
              "options": [
                "loved",
                "love",
                "loves"
              ]
            },
            "grammar": "past-feeling"
          },
          {
            "order": 2,
            "en": "He made me a coat of many colors",
            "pt": "Ele me fez uma túnica de muitas cores",
            "alt": [
              "He made me a tunic of many colors"
            ],
            "altPt": [
              "Ele fez para mim uma túnica de muitas cores"
            ],
            "kind": "statement",
            "fact": true
          },
          {
            "order": 3,
            "en": "My brothers saw the coat and hated me",
            "pt": "Meus irmãos viram a túnica e me odiaram",
            "kind": "statement",
            "fact": true
          },
          {
            "order": 4,
            "en": "I had a dream and said, \"Listen to my dream\"",
            "pt": "Eu tive um sonho e disse: \"Ouçam o meu sonho\"",
            "altPt": [
              "Eu tive um sonho e disse: \"Escutem o meu sonho\""
            ],
            "kind": "quote",
            "fact": true,
            "iconic": true,
            "speaker": "jose"
          },
          {
            "order": 5,
            "en": "The sun, the moon and eleven stars bowed down to me",
            "pt": "O sol, a lua e onze estrelas se curvaram diante de mim",
            "altPt": [
              "O sol, e a lua, e onze estrelas se inclinavam a mim"
            ],
            "kind": "quote",
            "fact": true,
            "iconic": true,
            "prod": false,
            "speaker": "jose"
          },
          {
            "order": 6,
            "en": "Did my brothers love my dreams? No, they hated them",
            "pt": "Meus irmãos amavam os meus sonhos? Não, eles os odiavam",
            "kind": "question",
            "fact": true,
            "gap": {
              "word": "hated",
              "kind": "grammar",
              "options": [
                "hated",
                "hate",
                "hates"
              ]
            },
            "grammar": "past-feeling"
          },
          {
            "order": 7,
            "en": "One day my father sent me to my brothers",
            "pt": "Um dia meu pai me mandou até os meus irmãos",
            "kind": "first-person",
            "fact": true,
            "speaker": "jose"
          },
          {
            "order": 8,
            "en": "They took my coat and put me in a pit",
            "pt": "Eles tiraram a minha túnica e me puseram num poço",
            "altPt": [
              "Eles pegaram a minha túnica e me colocaram em um poço"
            ],
            "kind": "statement",
            "fact": true
          },
          {
            "order": 9,
            "en": "Judah said, \"Let's sell him. He is our brother\"",
            "pt": "Judá disse: \"Vamos vendê-lo. Ele é nosso irmão\"",
            "altPt": [
              "Judá disse: \"Vamos vender ele. Ele é nosso irmão\""
            ],
            "kind": "quote",
            "fact": true,
            "iconic": true,
            "speaker": "juda"
          },
          {
            "order": 10,
            "en": "They sold me to the Ishmaelites for silver",
            "pt": "Eles me venderam aos ismaelitas por prata",
            "alt": [
              "They sold me to the Ishmeelites for silver"
            ],
            "kind": "statement",
            "fact": true,
            "gap": {
              "word": "me",
              "kind": "grammar",
              "options": [
                "me",
                "him",
                "them"
              ]
            },
            "grammar": "object-pronouns"
          },
          {
            "order": 11,
            "en": "The Ishmaelites took me to Egypt",
            "pt": "Os ismaelitas me levaram para o Egito",
            "kind": "statement",
            "fact": true
          },
          {
            "order": 12,
            "en": "How much silver did they get for me? Twenty pieces",
            "pt": "Quanta prata eles receberam por mim? Vinte moedas",
            "kind": "question",
            "fact": true
          }
        ],
        "contrast": [
          {
            "a": "My father Jacob loved me more than my brothers",
            "b": "My father Jacob loves me more than my brothers",
            "note": "loved = passado (amava); loves = presente (ama)"
          },
          {
            "a": "They sold me to the Ishmaelites for silver",
            "b": "They sold him to the Ishmaelites for silver",
            "note": "me = a mim; him = a ele (pronome depois do verbo)"
          }
        ],
        "verse": {
          "text": "Joseph dreamed a dream, and he told it to his brothers.",
          "classic": "And Joseph dreamed a dream, and he told it his brethren.",
          "pt": "José teve um sonho e o contou aos seus irmãos.",
          "classicPt": "Sonhou também José um sonho, que contou a seus irmãos.",
          "ref": "Gênesis 37:5",
          "blank": "dream",
          "options": [
            "dream",
            "coat",
            "pit",
            "song"
          ],
          "blanks": [
            {
              "word": "dream",
              "options": [
                "dream",
                "coat",
                "pit",
                "song"
              ]
            },
            {
              "word": "brothers",
              "options": [
                "brothers",
                "father",
                "Ishmaelites",
                "animals"
              ]
            },
            {
              "word": "told",
              "options": [
                "told",
                "sold",
                "gave",
                "showed"
              ]
            }
          ]
        },
        "reading": {
          "text": "Jacob loved Joseph more than his other sons and made him a coat of many colors. Joseph had two dreams, and his brothers hated him for his dreams. One day they took his coat and sold him to the Ishmaelites for silver. The Ishmaelites took Joseph to Egypt, and Jacob cried for his son for many days.",
          "pt": "Jacó amava José mais do que os seus outros filhos e lhe fez uma túnica de muitas cores. José teve dois sonhos, e os seus irmãos o odiaram por causa dos sonhos. Um dia eles tiraram a túnica dele e o venderam aos ismaelitas por prata. Os ismaelitas levaram José para o Egito, e Jacó chorou pelo seu filho por muitos dias.",
          "q": "Why did the brothers hate Joseph?",
          "options": [
            "Because of his dreams",
            "Because of his silver",
            "Because he went to Egypt"
          ],
          "answer": "Because of his dreams",
          "questions": [
            {
              "kind": "literal",
              "q": "Why did the brothers hate Joseph?",
              "qPt": "Por que os irmãos odiavam José?",
              "options": [
                "Because of his dreams",
                "Because of his silver",
                "Because he went to Egypt"
              ],
              "answer": "Because of his dreams"
            },
            {
              "kind": "inference",
              "q": "Why did Judah say, \"Let's sell him\"?",
              "qPt": "Por que Judá disse: \"Vamos vendê-lo\"?",
              "options": [
                "He did not want to kill his brother",
                "The Ishmaelites were going to Egypt",
                "He wanted to have Joseph's coat"
              ],
              "answer": "He did not want to kill his brother",
              "explain": "Os irmãos queriam matar José. Judá perguntou que proveito teriam nisso e propôs vendê-lo aos ismaelitas: \"ele é nosso irmão, nossa carne\" (Gênesis 37:26-27)."
            }
          ]
        },
        "dialogue": {
          "line": "Look! Here comes the dreamer. Why are you here, Joseph?",
          "pt": "Olhem! Lá vem o sonhador. Por que você está aqui, José?",
          "options": [
            "My father sent me to you.",
            "My father sent me to Egypt.",
            "The Ishmaelites sent me to you."
          ],
          "answer": "My father sent me to you.",
          "answerPt": "Meu pai me mandou até vocês."
        },
        "conversation": {
          "with": "juda",
          "turns": [
            {
              "who": "juda",
              "en": "Look! Here comes the dreamer. Why are you here, Joseph?",
              "pt": "Olhem! Lá vem o sonhador. Por que você está aqui, José?",
              "mood": "irônico"
            },
            {
              "who": "you",
              "options": [
                "My father sent me to you.",
                "My father sent me to Egypt.",
                "The Ishmaelites sent me to you."
              ],
              "answer": "My father sent me to you.",
              "pt": "Meu pai me mandou até vocês.",
              "intent": "Diga quem mandou você"
            },
            {
              "who": "juda",
              "en": "The dreamer! Tell us your dream again.",
              "pt": "O sonhador! Conte o seu sonho de novo.",
              "mood": "bravo"
            },
            {
              "who": "you",
              "options": [
                "Listen to my dream. Eleven stars bowed down to me.",
                "Listen to my dream. My coat had many colors.",
                "Listen to my dream. I was alone in a pit."
              ],
              "answer": "Listen to my dream. Eleven stars bowed down to me.",
              "pt": "Ouçam o meu sonho. Onze estrelas se curvaram diante de mim.",
              "intent": "Conte o sonho das estrelas",
              "speak": true
            }
          ]
        },
        "quiz": {
          "q": "Why did Judah say, \"Let's sell him\"?",
          "options": [
            "He did not want to kill his brother",
            "The Ishmaelites were going to Egypt",
            "He wanted to have Joseph's coat"
          ],
          "answer": "He did not want to kill his brother",
          "explain": "Os irmãos queriam matar José. Judá perguntou que proveito teriam nisso e propôs vendê-lo aos ismaelitas: \"ele é nosso irmão, nossa carne\" (Gênesis 37:26-27)."
        },
        "fact": {
          "pt": "Em hebraico a túnica de José é \"ketonet passim\". A tradução \"túnica de muitas cores\" vem das versões grega e latina antigas; outras traduções modernas dizem \"túnica longa com mangas\" (Gênesis 37:3).",
          "ref": "Gênesis 37:3"
        },
        "v": 2
      },
      {
        "id": "u6l2",
        "title": "Da prisão ao palácio",
        "ref": "Gênesis 39-41",
        "level": "A1.2",
        "narrator": "jose",
        "guests": [
          "copeiro",
          "pharaoh",
          "potifar"
        ],
        "names": [
          {
            "en": "Joseph",
            "pt": "José"
          },
          {
            "en": "Potiphar",
            "pt": "Potifar",
            "note": "oficial de Faraó que comprou José"
          },
          {
            "en": "Pharaoh",
            "pt": "Faraó",
            "note": "o rei do Egito"
          },
          {
            "en": "Egypt",
            "pt": "Egito"
          },
          {
            "en": "the Lord",
            "pt": "o Senhor"
          },
          {
            "en": "God",
            "pt": "Deus"
          }
        ],
        "hints": {
          "house": "casa",
          "well": "bem",
          "lie": "mentir, mentiu",
          "put": "pôr, pôs",
          "remember": "lembrar, se lembrou",
          "year": "ano, anos",
          "bad": "mau, ruins",
          "ruler": "governador",
          "river": "rio",
          "angry": "bravo",
          "father": "pai"
        },
        "tips": [
          {
            "part": 1,
            "id": "because-so",
            "grammar": "because-so",
            "title": "because e so: causa e consequência",
            "body": "because apresenta a causa: He was angry because she lied (ele ficou bravo porque ela mentiu). so apresenta a consequência: She lied, so he was angry (ela mentiu, então ele ficou bravo). É a mesma história contada de dois lados.",
            "examples": [
              {
                "en": "The Lord was with me, so everything went well",
                "pt": "O Senhor estava comigo, então tudo ia bem"
              },
              {
                "en": "Potiphar was angry because his wife lied",
                "pt": "Potifar ficou bravo porque a esposa dele mentiu"
              }
            ],
            "contrast": {
              "a": "She lied, so he was angry",
              "b": "He was angry because she lied",
              "note": "so = então (consequência); because = porque (causa)"
            }
          },
          {
            "part": 2,
            "id": "can-cannot",
            "grammar": "can-cannot",
            "title": "can e cannot: poder e não poder",
            "body": "can + verbo na forma básica = poder, conseguir: God can explain it. A negativa é cannot (ou can't): I cannot explain it. Na pergunta, can vem antes do sujeito: Can you explain my dream?",
            "examples": [
              {
                "en": "Can you explain my dream?",
                "pt": "Você pode explicar o meu sonho?"
              },
              {
                "en": "I cannot, but God can",
                "pt": "Eu não posso, mas Deus pode"
              }
            ],
            "contrast": {
              "a": "I can explain it",
              "b": "I cannot explain it",
              "note": "cannot = negativa de can; o verbo não muda"
            }
          }
        ],
        "vocab": [
          {
            "en": "prison",
            "pt": "prisão",
            "ptAlt": [
              "cadeia"
            ],
            "pos": "noun",
            "field": "places",
            "tier": "core",
            "part": 1,
            "icon": "⛓️",
            "example": 3
          },
          {
            "en": "servant",
            "pt": "servo",
            "ptAlt": [
              "empregado",
              "criado"
            ],
            "pos": "noun",
            "field": "people",
            "tier": "core",
            "part": 1,
            "icon": "🧹",
            "example": 1
          },
          {
            "en": "to explain",
            "pt": "explicar",
            "ptAlt": [
              "interpretar"
            ],
            "alt": [
              "to interpret"
            ],
            "pos": "verb",
            "field": "speech",
            "tier": "core",
            "part": 1,
            "icon": "🧩",
            "example": 5
          },
          {
            "en": "to forget",
            "pt": "esquecer",
            "pos": "verb",
            "field": "mind",
            "tier": "core",
            "part": 1,
            "icon": "🌫️",
            "example": 6
          },
          {
            "en": "Do not forget me",
            "pt": "Não se esqueça de mim",
            "ptAlt": [
              "Não me esqueça",
              "Não esqueça de mim"
            ],
            "alt": [
              "Don't forget me"
            ],
            "pos": "chunk",
            "field": "speech",
            "tier": "core",
            "part": 1,
            "icon": "🔔",
            "iconic": true,
            "example": 6
          },
          {
            "en": "cow",
            "pt": "vaca",
            "pos": "noun",
            "field": "animals",
            "tier": "core",
            "part": 2,
            "icon": "🐄",
            "example": 8
          },
          {
            "en": "fat",
            "pt": "gordo",
            "ptAlt": [
              "gorda",
              "gordas"
            ],
            "pos": "adj",
            "field": "quality",
            "tier": "core",
            "part": 2,
            "icon": "🎈",
            "example": 9
          },
          {
            "en": "thin",
            "pt": "magro",
            "ptAlt": [
              "magra",
              "magras"
            ],
            "pos": "adj",
            "field": "quality",
            "tier": "core",
            "part": 2,
            "icon": "🦴",
            "example": 9
          },
          {
            "en": "year",
            "pt": "ano",
            "pos": "noun",
            "field": "time",
            "tier": "core",
            "part": 2,
            "icon": "📆",
            "example": 7
          },
          {
            "en": "I cannot, but God can",
            "pt": "Eu não posso, mas Deus pode",
            "ptAlt": [
              "Eu não consigo, mas Deus consegue"
            ],
            "alt": [
              "I can't, but God can"
            ],
            "pos": "chunk",
            "field": "speech",
            "tier": "core",
            "part": 2,
            "icon": "🔑",
            "iconic": true,
            "example": 11
          }
        ],
        "sentences": [
          {
            "en": "In Egypt I was a servant in Potiphar's house",
            "pt": "No Egito eu era servo na casa de Potifar"
          },
          {
            "en": "The Lord was with me so everything went well",
            "pt": "O Senhor estava comigo, então tudo ia bem",
            "alt": [
              "The Lord was with me, so everything went well"
            ]
          },
          {
            "en": "His wife lied so he put me in prison",
            "pt": "A esposa dele mentiu, então ele me pôs na prisão",
            "alt": [
              "His wife lied, so he put me in prison"
            ]
          },
          {
            "en": "Did God forget me in prison? No, never",
            "pt": "Deus se esqueceu de mim na prisão? Não, nunca"
          },
          {
            "en": "A servant in prison asked, \"Can you explain my dream?\"",
            "pt": "Um servo na prisão perguntou: \"Você pode explicar o meu sonho?\""
          },
          {
            "en": "I explained his dream and said, \"Do not forget me\"",
            "pt": "Eu expliquei o sonho dele e disse: \"Não se esqueça de mim\"",
            "alt": [
              "I explained his dream and said, \"Don't forget me\""
            ],
            "altPt": [
              "Eu interpretei o sonho dele e disse: \"Lembre-se de mim\""
            ]
          },
          {
            "en": "But the servant forgot me for two years",
            "pt": "Mas o servo se esqueceu de mim por dois anos"
          },
          {
            "en": "Then Pharaoh had a dream about seven cows",
            "pt": "Então Faraó teve um sonho com sete vacas"
          },
          {
            "en": "Seven thin cows ate seven fat cows",
            "pt": "Sete vacas magras comeram sete vacas gordas"
          },
          {
            "en": "Pharaoh said, \"No one can explain my dream\"",
            "pt": "Faraó disse: \"Ninguém pode explicar o meu sonho\""
          },
          {
            "en": "I said, \"I cannot, but God can\"",
            "pt": "Eu disse: \"Eu não posso, mas Deus pode\"",
            "alt": [
              "I said, \"I can't, but God can\""
            ],
            "altPt": [
              "Eu disse: \"Eu não consigo, mas Deus consegue\""
            ]
          },
          {
            "en": "The fat cows were good years and the thin cows bad years",
            "pt": "As vacas gordas eram anos bons e as vacas magras, anos ruins",
            "altPt": [
              "As vacas gordas eram anos de fartura e as vacas magras eram anos de fome"
            ]
          }
        ],
        "beats": [
          {
            "order": 1,
            "en": "In Egypt I was a servant in Potiphar's house",
            "pt": "No Egito eu era servo na casa de Potifar",
            "kind": "first-person",
            "fact": true,
            "speaker": "jose"
          },
          {
            "order": 2,
            "en": "The Lord was with me so everything went well",
            "pt": "O Senhor estava comigo, então tudo ia bem",
            "alt": [
              "The Lord was with me, so everything went well"
            ],
            "kind": "statement",
            "fact": true,
            "gap": {
              "word": "so",
              "kind": "grammar",
              "options": [
                "so",
                "because",
                "but"
              ]
            },
            "grammar": "because-so"
          },
          {
            "order": 3,
            "en": "His wife lied so he put me in prison",
            "pt": "A esposa dele mentiu, então ele me pôs na prisão",
            "alt": [
              "His wife lied, so he put me in prison"
            ],
            "kind": "statement",
            "fact": true,
            "gap": {
              "word": "so",
              "kind": "grammar",
              "options": [
                "so",
                "because",
                "and"
              ]
            },
            "grammar": "because-so"
          },
          {
            "order": 4,
            "en": "Did God forget me in prison? No, never",
            "pt": "Deus se esqueceu de mim na prisão? Não, nunca",
            "kind": "question",
            "fact": true
          },
          {
            "order": 5,
            "en": "A servant in prison asked, \"Can you explain my dream?\"",
            "pt": "Um servo na prisão perguntou: \"Você pode explicar o meu sonho?\"",
            "kind": "question",
            "fact": true,
            "speaker": "copeiro"
          },
          {
            "order": 6,
            "en": "I explained his dream and said, \"Do not forget me\"",
            "pt": "Eu expliquei o sonho dele e disse: \"Não se esqueça de mim\"",
            "alt": [
              "I explained his dream and said, \"Don't forget me\""
            ],
            "altPt": [
              "Eu interpretei o sonho dele e disse: \"Lembre-se de mim\""
            ],
            "kind": "quote",
            "fact": true,
            "iconic": true,
            "speaker": "jose"
          },
          {
            "order": 7,
            "en": "But the servant forgot me for two years",
            "pt": "Mas o servo se esqueceu de mim por dois anos",
            "kind": "statement",
            "fact": true
          },
          {
            "order": 8,
            "en": "Then Pharaoh had a dream about seven cows",
            "pt": "Então Faraó teve um sonho com sete vacas",
            "kind": "statement",
            "fact": true
          },
          {
            "order": 9,
            "en": "Seven thin cows ate seven fat cows",
            "pt": "Sete vacas magras comeram sete vacas gordas",
            "kind": "statement",
            "fact": true
          },
          {
            "order": 10,
            "en": "Pharaoh said, \"No one can explain my dream\"",
            "pt": "Faraó disse: \"Ninguém pode explicar o meu sonho\"",
            "kind": "negative",
            "fact": true,
            "speaker": "pharaoh",
            "gap": {
              "word": "can",
              "kind": "grammar",
              "options": [
                "can",
                "cannot",
                "could"
              ]
            },
            "grammar": "can-cannot"
          },
          {
            "order": 11,
            "en": "I said, \"I cannot, but God can\"",
            "pt": "Eu disse: \"Eu não posso, mas Deus pode\"",
            "alt": [
              "I said, \"I can't, but God can\""
            ],
            "altPt": [
              "Eu disse: \"Eu não consigo, mas Deus consegue\""
            ],
            "kind": "quote",
            "fact": true,
            "iconic": true,
            "speaker": "jose"
          },
          {
            "order": 12,
            "en": "The fat cows were good years and the thin cows bad years",
            "pt": "As vacas gordas eram anos bons e as vacas magras, anos ruins",
            "altPt": [
              "As vacas gordas eram anos de fartura e as vacas magras eram anos de fome"
            ],
            "kind": "statement",
            "fact": true,
            "prod": false
          }
        ],
        "contrast": [
          {
            "a": "His wife lied so he put me in prison",
            "b": "He put me in prison because his wife lied",
            "note": "so = consequência; because = causa"
          },
          {
            "a": "Pharaoh said, \"No one can explain my dream\"",
            "b": "Pharaoh said, \"Joseph can explain my dream\"",
            "note": "No one can = ninguém pode; Joseph can = José pode"
          }
        ],
        "verse": {
          "text": "But the Lord was with Joseph, and showed kindness to him.",
          "classic": "But the LORD was with Joseph, and shewed him mercy.",
          "pt": "Mas o Senhor estava com José e foi bondoso com ele.",
          "classicPt": "O Senhor, porém, estava com José e estendeu sobre ele a sua benignidade.",
          "ref": "Gênesis 39:21",
          "blank": "with",
          "options": [
            "with",
            "against",
            "after",
            "under"
          ],
          "blanks": [
            {
              "word": "with",
              "options": [
                "with",
                "against",
                "after",
                "under"
              ]
            },
            {
              "word": "kindness",
              "options": [
                "kindness",
                "silver",
                "water",
                "grain"
              ]
            },
            {
              "word": "showed",
              "options": [
                "showed",
                "sold",
                "forgot",
                "explained"
              ]
            }
          ]
        },
        "reading": {
          "text": "Joseph was Potiphar's servant in Egypt, and the Lord was with him. But Potiphar's wife lied about Joseph, so Potiphar put him in prison. In prison, Joseph explained the dreams of two of Pharaoh's servants, but one of them forgot him for two years. Then Pharaoh had a dream about seven fat cows and seven thin cows, and the servant remembered Joseph. Joseph said, \"I cannot explain it, but God can,\" and Pharaoh put Joseph over all Egypt.",
          "pt": "José era servo de Potifar no Egito, e o Senhor estava com ele. Mas a esposa de Potifar mentiu sobre José, então Potifar o pôs na prisão. Na prisão, José explicou os sonhos de dois servos de Faraó, mas um deles se esqueceu dele por dois anos. Então Faraó teve um sonho com sete vacas gordas e sete vacas magras, e o servo se lembrou de José. José disse: \"Eu não posso explicar, mas Deus pode\", e Faraó pôs José sobre todo o Egito.",
          "q": "Why was Joseph in prison?",
          "options": [
            "Potiphar's wife told lies about him",
            "He forgot Pharaoh's dream",
            "He sold Potiphar's cows"
          ],
          "answer": "Potiphar's wife told lies about him",
          "questions": [
            {
              "kind": "literal",
              "q": "Why was Joseph in prison?",
              "qPt": "Por que José estava na prisão?",
              "options": [
                "Potiphar's wife told lies about him",
                "He forgot Pharaoh's dream",
                "He sold Potiphar's cows"
              ],
              "answer": "Potiphar's wife told lies about him"
            },
            {
              "kind": "inference",
              "q": "Why did Pharaoh call Joseph after two years?",
              "qPt": "Por que Faraó chamou José depois de dois anos?",
              "options": [
                "The servant remembered that Joseph explained dreams",
                "Joseph was a servant in Egypt before",
                "Pharaoh wanted to put Joseph in prison"
              ],
              "answer": "The servant remembered that Joseph explained dreams",
              "explain": "O copeiro só se lembrou de José quando ninguém no Egito conseguiu explicar o sonho de Faraó (Gênesis 41:8-14)."
            }
          ]
        },
        "dialogue": {
          "line": "Joseph, you explained my dream! In three days I'll be with Pharaoh again.",
          "pt": "José, você explicou o meu sonho! Em três dias eu estarei com Faraó de novo.",
          "options": [
            "Do not forget me. Tell Pharaoh about me.",
            "Do not forget me. Tell Potiphar about me.",
            "Do not forget me. Tell my father about me."
          ],
          "answer": "Do not forget me. Tell Pharaoh about me.",
          "answerPt": "Não se esqueça de mim. Fale de mim a Faraó."
        },
        "conversation": {
          "with": "copeiro",
          "turns": [
            {
              "who": "copeiro",
              "en": "Joseph, you explained my dream! In three days I'll be with Pharaoh again.",
              "pt": "José, você explicou o meu sonho! Em três dias eu estarei com Faraó de novo.",
              "mood": "animado"
            },
            {
              "who": "you",
              "options": [
                "Do not forget me. Tell Pharaoh about me.",
                "Do not forget me. Tell Potiphar about me.",
                "Do not forget me. Tell my father about me."
              ],
              "answer": "Do not forget me. Tell Pharaoh about me.",
              "pt": "Não se esqueça de mim. Fale de mim a Faraó.",
              "intent": "Peça para ele falar de você a Faraó"
            },
            {
              "who": "copeiro",
              "en": "But why are you here in prison? What did you do?",
              "pt": "Mas por que você está aqui na prisão? O que você fez?",
              "mood": "surpreso"
            },
            {
              "who": "you",
              "options": [
                "Nothing. Potiphar's wife lied about me.",
                "Nothing. I was a servant in Potiphar's house.",
                "Nothing. I did not want to explain the dreams."
              ],
              "answer": "Nothing. Potiphar's wife lied about me.",
              "pt": "Nada. A esposa de Potifar mentiu sobre mim.",
              "intent": "Explique por que você está preso",
              "speak": true
            }
          ]
        },
        "quiz": {
          "q": "Why did Pharaoh call Joseph after two years?",
          "options": [
            "The servant remembered that Joseph explained dreams",
            "Joseph was a servant in Egypt before",
            "Pharaoh wanted to put Joseph in prison"
          ],
          "answer": "The servant remembered that Joseph explained dreams",
          "explain": "O copeiro só se lembrou de José quando ninguém no Egito conseguiu explicar o sonho de Faraó (Gênesis 41:8-14)."
        },
        "fact": {
          "pt": "José tinha trinta anos quando ficou diante de Faraó. Ele recebeu o anel do rei, roupas de linho fino e um colar de ouro, e só no trono Faraó seria maior do que ele (Gênesis 41:40-46).",
          "ref": "Gênesis 41:40-46"
        },
        "v": 2
      },
      {
        "id": "u6l3",
        "title": "Eu sou José",
        "ref": "Gênesis 42-50",
        "level": "A1.2",
        "narrator": "jose",
        "guests": [
          "juda",
          "jaco"
        ],
        "names": [
          {
            "en": "Joseph",
            "pt": "José"
          },
          {
            "en": "Jacob",
            "pt": "Jacó",
            "note": "o pai de José"
          },
          {
            "en": "Judah",
            "pt": "Judá",
            "note": "o irmão que se ofereceu no lugar de Benjamim"
          },
          {
            "en": "Benjamin",
            "pt": "Benjamim",
            "note": "o irmão mais novo de José"
          },
          {
            "en": "Egypt",
            "pt": "Egito"
          },
          {
            "en": "Canaan",
            "pt": "Canaã",
            "note": "a terra onde Jacó morava"
          },
          {
            "en": "Pharaoh",
            "pt": "Faraó",
            "note": "o rei do Egito"
          },
          {
            "en": "God",
            "pt": "Deus"
          }
        ],
        "hints": {
          "bow": "curvar-se, se curvaram",
          "know": "conhecer, reconheceram",
          "put": "pôr, pôs",
          "father": "pai",
          "close": "perto, mais perto",
          "year": "ano, anos",
          "mean": "querer dizer, quiseram",
          "keep": "ficar com, deixar",
          "boy": "menino",
          "save": "salvar",
          "people": "pessoas",
          "still": "ainda"
        },
        "tips": [
          {
            "part": 1,
            "id": "be-identity",
            "grammar": "be-identity",
            "title": "I am, you are, is he?: dizer quem é e perguntar",
            "body": "Para dizer quem alguém é, use o verbo to be: I am Joseph (eu sou José). You are my brothers (vocês são meus irmãos). Para perguntar, o verbo vem antes do sujeito: Is my father alive? Where are you from? (De onde vocês são?)",
            "examples": [
              {
                "en": "I am Joseph",
                "pt": "Eu sou José"
              },
              {
                "en": "Is my father alive?",
                "pt": "Meu pai está vivo?"
              }
            ],
            "contrast": {
              "a": "My father is alive",
              "b": "Is my father alive?",
              "note": "afirmação: sujeito + is; pergunta: is + sujeito"
            }
          },
          {
            "part": 2,
            "id": "past-irregular",
            "grammar": "past-irregular",
            "title": "sent, came, saw: passados que mudam a palavra",
            "body": "Alguns verbos não ganham -ed no passado: a palavra inteira muda. send vira sent, come vira came, see vira saw, mean vira meant, know vira knew. São poucos, mas muito usados: aprenda cada um como uma palavra nova.",
            "examples": [
              {
                "en": "God sends me",
                "pt": "Deus me manda"
              },
              {
                "en": "God sent me here before you",
                "pt": "Deus me mandou aqui antes de vocês"
              }
            ],
            "contrast": {
              "a": "My brothers come to Egypt",
              "b": "My brothers came to Egypt",
              "note": "come = vêm (agora); came = vieram (passado)"
            }
          }
        ],
        "vocab": [
          {
            "en": "grain",
            "pt": "trigo",
            "ptAlt": [
              "cereal",
              "grão"
            ],
            "pos": "noun",
            "field": "food",
            "tier": "core",
            "part": 1,
            "icon": "🌾",
            "example": 1
          },
          {
            "en": "to buy",
            "pt": "comprar",
            "pos": "verb",
            "field": "work",
            "tier": "core",
            "part": 1,
            "icon": "🛒",
            "example": 1
          },
          {
            "en": "sack",
            "pt": "saco",
            "ptAlt": [
              "saca"
            ],
            "alt": [
              "bag"
            ],
            "pos": "noun",
            "field": "objects",
            "tier": "bible",
            "part": 1,
            "icon": "🎒",
            "example": 5
          },
          {
            "en": "cup",
            "pt": "copo",
            "ptAlt": [
              "taça"
            ],
            "pos": "noun",
            "field": "objects",
            "tier": "core",
            "part": 1,
            "icon": "🥤",
            "example": 5
          },
          {
            "en": "Where are you from?",
            "pt": "De onde vocês são?",
            "ptAlt": [
              "De onde você é?",
              "De onde vocês vêm?"
            ],
            "alt": [
              "Where did you come from?"
            ],
            "pos": "chunk",
            "field": "speech",
            "tier": "core",
            "part": 1,
            "icon": "🧭",
            "iconic": true,
            "example": 3
          },
          {
            "en": "evil",
            "pt": "mal",
            "ptAlt": [
              "maldade"
            ],
            "pos": "noun",
            "field": "faith",
            "tier": "core",
            "part": 2,
            "icon": "😈",
            "example": 11
          },
          {
            "en": "to hug",
            "pt": "abraçar",
            "pos": "verb",
            "field": "actions",
            "tier": "core",
            "part": 2,
            "icon": "👐",
            "example": 9
          },
          {
            "en": "to cry",
            "pt": "chorar",
            "pos": "verb",
            "field": "feelings",
            "tier": "core",
            "part": 2,
            "icon": "😭",
            "example": 7
          },
          {
            "en": "to forgive",
            "pt": "perdoar",
            "pos": "verb",
            "field": "faith",
            "tier": "core",
            "part": 2,
            "icon": "🤍",
            "example": 12
          },
          {
            "en": "I am Joseph",
            "pt": "Eu sou José",
            "pos": "chunk",
            "field": "speech",
            "tier": "core",
            "part": 2,
            "icon": "🎭",
            "iconic": true,
            "example": 7
          }
        ],
        "sentences": [
          {
            "en": "My brothers came to Egypt to buy grain",
            "pt": "Meus irmãos vieram ao Egito para comprar trigo",
            "altPt": [
              "Meus irmãos vieram ao Egito para comprar cereal"
            ]
          },
          {
            "en": "They bowed down to me and did not know me",
            "pt": "Eles se curvaram diante de mim e não me reconheceram",
            "altPt": [
              "Eles se inclinaram diante de mim e não me conheceram"
            ]
          },
          {
            "en": "I asked them, \"Where are you from?\"",
            "pt": "Eu perguntei a eles: \"De onde vocês são?\"",
            "alt": [
              "I asked them, \"Where did you come from?\""
            ],
            "altPt": [
              "Eu perguntei a eles: \"De onde vocês vêm?\""
            ]
          },
          {
            "en": "They said, \"We came from Canaan to buy grain\"",
            "pt": "Eles disseram: \"Viemos de Canaã para comprar trigo\""
          },
          {
            "en": "My servant put my silver cup in Benjamin's sack",
            "pt": "Meu servo pôs o meu copo de prata no saco de Benjamim",
            "altPt": [
              "Meu servo colocou a minha taça de prata no saco de Benjamim"
            ]
          },
          {
            "en": "Was the cup in Judah's sack? No, in Benjamin's",
            "pt": "O copo estava no saco de Judá? Não, no de Benjamim"
          },
          {
            "en": "I cried, \"I am Joseph! Is my father alive?\"",
            "pt": "Eu chorei: \"Eu sou José! Meu pai está vivo?\"",
            "altPt": [
              "Eu chorei: \"Eu sou José! Vive ainda meu pai?\""
            ]
          },
          {
            "en": "I said, \"Come closer. God sent me here before you\"",
            "pt": "Eu disse: \"Cheguem mais perto. Deus me mandou aqui antes de vocês\"",
            "altPt": [
              "Eu disse: \"Cheguem-se a mim. Deus me enviou adiante de vocês\""
            ]
          },
          {
            "en": "Then I hugged my brother Benjamin and we cried",
            "pt": "Então eu abracei o meu irmão Benjamim e nós choramos"
          },
          {
            "en": "My father was alive and I hugged him in Egypt",
            "pt": "Meu pai estava vivo e eu o abracei no Egito"
          },
          {
            "en": "My brothers asked, \"Will you forgive the evil we did?\"",
            "pt": "Meus irmãos perguntaram: \"Você vai perdoar o mal que fizemos?\""
          },
          {
            "en": "I forgave them: \"You meant evil but God meant it for good\"",
            "pt": "Eu os perdoei: \"Vocês quiseram o mal, mas Deus transformou isso em bem\"",
            "altPt": [
              "Eu os perdoei: \"Vós intentastes mal contra mim, porém Deus o tornou em bem\""
            ]
          }
        ],
        "beats": [
          {
            "order": 1,
            "en": "My brothers came to Egypt to buy grain",
            "pt": "Meus irmãos vieram ao Egito para comprar trigo",
            "altPt": [
              "Meus irmãos vieram ao Egito para comprar cereal"
            ],
            "kind": "first-person",
            "fact": true,
            "speaker": "jose"
          },
          {
            "order": 2,
            "en": "They bowed down to me and did not know me",
            "pt": "Eles se curvaram diante de mim e não me reconheceram",
            "altPt": [
              "Eles se inclinaram diante de mim e não me conheceram"
            ],
            "kind": "negative",
            "fact": true
          },
          {
            "order": 3,
            "en": "I asked them, \"Where are you from?\"",
            "pt": "Eu perguntei a eles: \"De onde vocês são?\"",
            "alt": [
              "I asked them, \"Where did you come from?\""
            ],
            "altPt": [
              "Eu perguntei a eles: \"De onde vocês vêm?\""
            ],
            "kind": "question",
            "fact": true,
            "iconic": true,
            "speaker": "jose",
            "gap": {
              "word": "are",
              "kind": "grammar",
              "options": [
                "are",
                "is",
                "am"
              ]
            },
            "grammar": "be-identity"
          },
          {
            "order": 4,
            "en": "They said, \"We came from Canaan to buy grain\"",
            "pt": "Eles disseram: \"Viemos de Canaã para comprar trigo\"",
            "kind": "quote",
            "fact": true,
            "speaker": "juda"
          },
          {
            "order": 5,
            "en": "My servant put my silver cup in Benjamin's sack",
            "pt": "Meu servo pôs o meu copo de prata no saco de Benjamim",
            "altPt": [
              "Meu servo colocou a minha taça de prata no saco de Benjamim"
            ],
            "kind": "statement",
            "fact": true
          },
          {
            "order": 6,
            "en": "Was the cup in Judah's sack? No, in Benjamin's",
            "pt": "O copo estava no saco de Judá? Não, no de Benjamim",
            "kind": "question",
            "fact": true
          },
          {
            "order": 7,
            "en": "I cried, \"I am Joseph! Is my father alive?\"",
            "pt": "Eu chorei: \"Eu sou José! Meu pai está vivo?\"",
            "altPt": [
              "Eu chorei: \"Eu sou José! Vive ainda meu pai?\""
            ],
            "kind": "question",
            "fact": true,
            "iconic": true,
            "speaker": "jose"
          },
          {
            "order": 8,
            "en": "I said, \"Come closer. God sent me here before you\"",
            "pt": "Eu disse: \"Cheguem mais perto. Deus me mandou aqui antes de vocês\"",
            "altPt": [
              "Eu disse: \"Cheguem-se a mim. Deus me enviou adiante de vocês\""
            ],
            "kind": "quote",
            "fact": true,
            "iconic": true,
            "speaker": "jose",
            "gap": {
              "word": "sent",
              "kind": "grammar",
              "options": [
                "sent",
                "send",
                "sends"
              ]
            },
            "grammar": "past-irregular"
          },
          {
            "order": 9,
            "en": "Then I hugged my brother Benjamin and we cried",
            "pt": "Então eu abracei o meu irmão Benjamim e nós choramos",
            "kind": "first-person",
            "fact": true,
            "speaker": "jose"
          },
          {
            "order": 10,
            "en": "My father was alive and I hugged him in Egypt",
            "pt": "Meu pai estava vivo e eu o abracei no Egito",
            "kind": "first-person",
            "fact": true,
            "speaker": "jose"
          },
          {
            "order": 11,
            "en": "My brothers asked, \"Will you forgive the evil we did?\"",
            "pt": "Meus irmãos perguntaram: \"Você vai perdoar o mal que fizemos?\"",
            "kind": "question",
            "fact": true,
            "speaker": "juda"
          },
          {
            "order": 12,
            "en": "I forgave them: \"You meant evil but God meant it for good\"",
            "pt": "Eu os perdoei: \"Vocês quiseram o mal, mas Deus transformou isso em bem\"",
            "altPt": [
              "Eu os perdoei: \"Vós intentastes mal contra mim, porém Deus o tornou em bem\""
            ],
            "kind": "quote",
            "fact": true,
            "iconic": true,
            "prod": false,
            "speaker": "jose"
          }
        ],
        "contrast": [
          {
            "a": "I cried, \"I am Joseph! Is my father alive?\"",
            "b": "I cried, \"I am Joseph! My father is alive\"",
            "note": "Is my father alive? = pergunta (is antes); My father is alive = afirmação"
          },
          {
            "a": "I said, \"Come closer. God sent me here before you\"",
            "b": "I said, \"Come closer. God sends me here before you\"",
            "note": "sent = passado irregular de send (mandou); sends = presente (manda)"
          }
        ],
        "verse": {
          "text": "You meant evil against me, but God meant it for good.",
          "classic": "Ye thought evil against me; but God meant it unto good.",
          "pt": "Vocês quiseram me fazer mal, mas Deus transformou isso em bem.",
          "classicPt": "Vós bem intentastes mal contra mim, porém Deus o tornou em bem.",
          "ref": "Gênesis 50:20",
          "blank": "good",
          "options": [
            "good",
            "silver",
            "grain",
            "nothing"
          ],
          "blanks": [
            {
              "word": "good",
              "options": [
                "good",
                "silver",
                "grain",
                "nothing"
              ]
            },
            {
              "word": "evil",
              "options": [
                "evil",
                "nothing",
                "silver",
                "water"
              ]
            },
            {
              "word": "against",
              "options": [
                "against",
                "with",
                "under",
                "after"
              ]
            }
          ]
        },
        "reading": {
          "text": "Jacob's sons went to Egypt to buy grain, and they bowed down to Joseph, but they did not know him. The silver cup was in Benjamin's sack, and Judah asked Joseph to let Benjamin go. Then Joseph cried and said, \"I am Joseph! Is my father still alive?\" Jacob came to Egypt with all his family, and Joseph forgave his brothers.",
          "pt": "Os filhos de Jacó foram ao Egito comprar trigo e se curvaram diante de José, mas não o reconheceram. O copo de prata estava no saco de Benjamim, e Judá pediu a José que deixasse Benjamim ir. Então José chorou e disse: \"Eu sou José! Meu pai ainda está vivo?\" Jacó veio ao Egito com toda a sua família, e José perdoou os seus irmãos.",
          "q": "Why did Jacob's sons go to Egypt?",
          "options": [
            "To get grain for their family",
            "To see their brother Joseph",
            "To sell their silver cup"
          ],
          "answer": "To get grain for their family",
          "questions": [
            {
              "kind": "literal",
              "q": "Why did Jacob's sons go to Egypt?",
              "qPt": "Por que os filhos de Jacó foram ao Egito?",
              "options": [
                "To get grain for their family",
                "To see their brother Joseph",
                "To sell their silver cup"
              ],
              "answer": "To get grain for their family"
            },
            {
              "kind": "inference",
              "q": "Why did Joseph say, \"God sent me here before you\"?",
              "qPt": "Por que José disse: \"Deus me mandou aqui antes de vocês\"?",
              "options": [
                "God used the evil to save many people",
                "His brothers sold him for silver",
                "Pharaoh asked for him in Egypt"
              ],
              "answer": "God used the evil to save many people",
              "explain": "José viu a mão de Deus na própria venda: \"Deus me enviou adiante de vocês para preservar a vida\" (Gênesis 45:5), e depois: \"vocês quiseram o meu mal, mas Deus transformou em bem\" (Gênesis 50:20)."
            }
          ]
        },
        "dialogue": {
          "line": "My lord, please. Keep me here and let the boy go to his father.",
          "pt": "Meu senhor, por favor. Fique comigo aqui e deixe o menino voltar para o pai.",
          "options": [
            "Come closer. I am Joseph, your brother.",
            "Come closer. I am a servant of Pharaoh.",
            "Come closer. I am a man from Canaan."
          ],
          "answer": "Come closer. I am Joseph, your brother.",
          "answerPt": "Cheguem mais perto. Eu sou José, o irmão de vocês."
        },
        "conversation": {
          "with": "juda",
          "turns": [
            {
              "who": "juda",
              "en": "My lord, please. Keep me here and let the boy go to his father.",
              "pt": "Meu senhor, por favor. Fique comigo aqui e deixe o menino voltar para o pai.",
              "mood": "urgente"
            },
            {
              "who": "you",
              "options": [
                "Come closer. I am Joseph, your brother.",
                "Come closer. I am a servant of Pharaoh.",
                "Come closer. I am a man from Canaan."
              ],
              "answer": "Come closer. I am Joseph, your brother.",
              "pt": "Cheguem mais perto. Eu sou José, o irmão de vocês.",
              "intent": "Revele quem você é"
            },
            {
              "who": "juda",
              "en": "Joseph? But we sold you! Are you angry with us?",
              "pt": "José? Mas nós vendemos você! Você está bravo conosco?",
              "mood": "assustado"
            },
            {
              "who": "you",
              "options": [
                "No. God sent me here to save many people.",
                "Yes. God sent me here to buy grain.",
                "No. I did not know you in Egypt."
              ],
              "answer": "No. God sent me here to save many people.",
              "pt": "Não. Deus me mandou aqui para salvar muitas pessoas.",
              "intent": "Diga por que você não está bravo",
              "speak": true
            }
          ]
        },
        "quiz": {
          "q": "Why did Joseph say, \"God sent me here before you\"?",
          "options": [
            "God used the evil to save many people",
            "His brothers sold him for silver",
            "Pharaoh asked for him in Egypt"
          ],
          "answer": "God used the evil to save many people",
          "explain": "José viu a mão de Deus na própria venda: \"Deus me enviou adiante de vocês para preservar a vida\" (Gênesis 45:5), e depois: \"vocês quiseram o meu mal, mas Deus transformou em bem\" (Gênesis 50:20)."
        },
        "fact": {
          "pt": "A família de Jacó que desceu ao Egito tinha setenta pessoas. Eles moraram na terra de Gósen, e José cuidou deles durante os anos de fome (Gênesis 46:27; 47:11-12).",
          "ref": "Gênesis 46:27; 47:11-12"
        },
        "v": 2
      },
      {
        "id": "u6r",
        "title": "Revisão",
        "review": true,
        "checkpoint": true
      }
    ]
  },
  {
    "id": "u3",
    "title": "Moisés e o Êxodo",
    "subtitle": "Êxodo 1-15",
    "icon": "🔥",
    "face": "moises",
    "color": "#ff9600",
    "level": "A1.2",
    "v": 2,
    "lessons": [
      {
        "id": "u3l1",
        "title": "O cesto e a sarça",
        "ref": "Êxodo 1:8-22; 2:1-10; 3:1-14; 4:10-13",
        "level": "A1.2",
        "narrator": "moises",
        "guests": [
          "pharaoh",
          "voice"
        ],
        "names": [
          {
            "en": "God",
            "pt": "Deus",
            "note": "sempre com maiúscula; os pronomes (he, his) ficam em minúscula"
          },
          {
            "en": "the Lord",
            "pt": "o Senhor"
          },
          {
            "en": "Moses",
            "pt": "Moisés"
          },
          {
            "en": "Pharaoh",
            "pt": "Faraó",
            "note": "o rei do Egito"
          },
          {
            "en": "Pharaoh's daughter",
            "pt": "a filha de Faraó"
          },
          {
            "en": "Egypt",
            "pt": "Egito"
          },
          {
            "en": "Israel",
            "pt": "Israel",
            "note": "o povo de Deus, também chamado de hebreus"
          },
          {
            "en": "Joseph",
            "pt": "José",
            "note": "o José da unidade anterior; o novo rei não o conhecia"
          },
          {
            "en": "Midian",
            "pt": "Midiã",
            "note": "a terra para onde Moisés fugiu"
          }
        ],
        "hints": {
          "new": "novo",
          "know": "conhecia",
          "hard": "duro, pesado",
          "throw": "jogar, joguem",
          "boy": "menino",
          "mother": "mãe",
          "saw": "viu",
          "burn": "queimar, queimava",
          "called": "chamou",
          "sandals": "sandálias",
          "later": "mais tarde"
        },
        "tips": [
          {
            "part": 1,
            "id": "imperative",
            "grammar": "imperative",
            "title": "Take, Throw, Do not: dar ordens",
            "body": "Para dar uma ordem ou instrução, use o verbo na forma básica, sem sujeito: Take the baby. Throw it into the river. Para proibir, ponha Do not (don't) antes do verbo: Do not come close. A forma é a mesma para você e para vocês.",
            "examples": [
              {
                "en": "Take care of him",
                "pt": "Cuide dele"
              },
              {
                "en": "Do not come close",
                "pt": "Não chegue perto"
              }
            ],
            "contrast": {
              "a": "Take off your sandals",
              "b": "Do not take off your sandals",
              "note": "Do not + verbo = ordem negativa"
            }
          },
          {
            "part": 2,
            "id": "wh-questions",
            "grammar": "wh-questions",
            "title": "Who? What?: perguntar quem e o quê",
            "body": "Who pergunta por pessoas (quem); what pergunta por coisas (o quê, qual). A palavra vem no começo da pergunta, antes do verbo: Who am I? Who are you? What is his name? What is that in your hand?",
            "examples": [
              {
                "en": "Who am I?",
                "pt": "Quem sou eu?"
              },
              {
                "en": "What is his name?",
                "pt": "Qual é o nome dele?"
              }
            ],
            "contrast": {
              "a": "Who is there?",
              "b": "What is there?",
              "note": "who = pessoa; what = coisa"
            }
          }
        ],
        "vocab": [
          {
            "en": "baby",
            "pt": "bebê",
            "ptAlt": [
              "neném"
            ],
            "pos": "noun",
            "field": "family",
            "tier": "core",
            "part": 1,
            "icon": "🍼",
            "example": 4
          },
          {
            "en": "river",
            "pt": "rio",
            "pos": "noun",
            "field": "places",
            "tier": "core",
            "part": 1,
            "icon": "🏞️",
            "example": 5
          },
          {
            "en": "basket",
            "pt": "cesto",
            "ptAlt": [
              "cesta"
            ],
            "pos": "noun",
            "field": "objects",
            "tier": "core",
            "part": 1,
            "icon": "🧺",
            "example": 4
          },
          {
            "en": "king",
            "pt": "rei",
            "pos": "noun",
            "field": "people",
            "tier": "core",
            "part": 1,
            "icon": "👑",
            "example": 2
          },
          {
            "en": "Take care of him",
            "pt": "Cuide dele",
            "ptAlt": [
              "Cuida dele",
              "Cuide dele para mim"
            ],
            "pos": "chunk",
            "field": "speech",
            "tier": "core",
            "part": 1,
            "icon": "🤱",
            "example": 6
          },
          {
            "en": "fire",
            "pt": "fogo",
            "pos": "noun",
            "field": "nature",
            "tier": "core",
            "part": 2,
            "icon": "🔥",
            "example": 8
          },
          {
            "en": "bush",
            "pt": "sarça",
            "ptAlt": [
              "arbusto"
            ],
            "pos": "noun",
            "field": "nature",
            "tier": "bible",
            "part": 2,
            "icon": "🌿",
            "example": 7,
            "note": "um arbusto; a sarça ardente de Êxodo 3"
          },
          {
            "en": "holy",
            "pt": "santo",
            "ptAlt": [
              "santa",
              "sagrado"
            ],
            "pos": "adj",
            "field": "faith",
            "tier": "core",
            "part": 2,
            "icon": "🕯️",
            "example": 10
          },
          {
            "en": "ground",
            "pt": "chão",
            "pos": "noun",
            "field": "nature",
            "tier": "core",
            "part": 2,
            "icon": "🟫",
            "example": 10
          },
          {
            "en": "Who am I?",
            "pt": "Quem sou eu?",
            "pos": "chunk",
            "field": "speech",
            "tier": "core",
            "part": 2,
            "icon": "🤷",
            "iconic": true,
            "example": 12
          }
        ],
        "sentences": [
          {
            "en": "A new king did not know Joseph",
            "pt": "Um novo rei não conhecia José"
          },
          {
            "en": "The king made Israel work very hard",
            "pt": "O rei fez Israel trabalhar muito",
            "altPt": [
              "O rei fez Israel trabalhar duro"
            ]
          },
          {
            "en": "The king said, \"Throw every baby boy into the river\"",
            "pt": "O rei disse: \"Joguem no rio todo menino recém-nascido\"",
            "altPt": [
              "O rei disse: \"Joguem todo bebê menino no rio\""
            ]
          },
          {
            "en": "A mother hid her baby in a basket",
            "pt": "Uma mãe escondeu o bebê num cesto",
            "altPt": [
              "Uma mãe escondeu seu bebê em um cesto",
              "Uma mãe escondeu o seu bebê numa cesta"
            ]
          },
          {
            "en": "Pharaoh's daughter saw the basket in the river",
            "pt": "A filha de Faraó viu o cesto no rio"
          },
          {
            "en": "Pharaoh's daughter said, \"Take care of him for me\"",
            "pt": "A filha de Faraó disse: \"Cuide dele para mim\""
          },
          {
            "en": "In Midian, Moses saw a bush on fire",
            "pt": "Em Midiã, Moisés viu uma sarça em chamas",
            "altPt": [
              "Em Midiã, Moisés viu uma sarça pegando fogo"
            ]
          },
          {
            "en": "The bush was on fire, but it did not burn",
            "pt": "A sarça estava em chamas, mas não se consumia",
            "altPt": [
              "A sarça ardia, mas não se consumia",
              "A sarça estava pegando fogo, mas não queimava"
            ]
          },
          {
            "en": "God called from the bush, \"Moses! Moses!\"",
            "pt": "Deus chamou do meio da sarça: \"Moisés! Moisés!\""
          },
          {
            "en": "\"Take off your sandals. This is holy ground\"",
            "pt": "\"Tire as sandálias. Este é chão santo\"",
            "altPt": [
              "\"Tira os teus sapatos. O lugar em que tu estás é terra santa\""
            ]
          },
          {
            "en": "Was the ground holy? Yes, God was there",
            "pt": "O chão era santo? Sim, Deus estava ali"
          },
          {
            "en": "Moses asked, \"Who am I to go to Pharaoh?\"",
            "pt": "Moisés perguntou: \"Quem sou eu para ir a Faraó?\""
          }
        ],
        "beats": [
          {
            "order": 1,
            "en": "A new king did not know Joseph",
            "pt": "Um novo rei não conhecia José",
            "kind": "negative",
            "fact": true
          },
          {
            "order": 2,
            "en": "The king made Israel work very hard",
            "pt": "O rei fez Israel trabalhar muito",
            "altPt": [
              "O rei fez Israel trabalhar duro"
            ],
            "kind": "statement",
            "fact": true
          },
          {
            "order": 3,
            "en": "The king said, \"Throw every baby boy into the river\"",
            "pt": "O rei disse: \"Joguem no rio todo menino recém-nascido\"",
            "altPt": [
              "O rei disse: \"Joguem todo bebê menino no rio\""
            ],
            "kind": "quote",
            "fact": true,
            "speaker": "pharaoh",
            "gap": {
              "word": "Throw",
              "kind": "grammar",
              "options": [
                "Throw",
                "Throws",
                "Throwing"
              ]
            },
            "grammar": "imperative"
          },
          {
            "order": 4,
            "en": "A mother hid her baby in a basket",
            "pt": "Uma mãe escondeu o bebê num cesto",
            "altPt": [
              "Uma mãe escondeu seu bebê em um cesto",
              "Uma mãe escondeu o seu bebê numa cesta"
            ],
            "kind": "statement",
            "fact": true
          },
          {
            "order": 5,
            "en": "Pharaoh's daughter saw the basket in the river",
            "pt": "A filha de Faraó viu o cesto no rio",
            "kind": "statement",
            "fact": true,
            "gap": {
              "word": "basket",
              "kind": "lexical",
              "options": [
                "basket",
                "baby",
                "river"
              ]
            }
          },
          {
            "order": 6,
            "en": "Pharaoh's daughter said, \"Take care of him for me\"",
            "pt": "A filha de Faraó disse: \"Cuide dele para mim\"",
            "kind": "quote",
            "fact": true
          },
          {
            "order": 7,
            "en": "In Midian, Moses saw a bush on fire",
            "pt": "Em Midiã, Moisés viu uma sarça em chamas",
            "altPt": [
              "Em Midiã, Moisés viu uma sarça pegando fogo"
            ],
            "kind": "statement",
            "fact": true,
            "gap": {
              "word": "fire",
              "kind": "lexical",
              "options": [
                "fire",
                "bush",
                "ground"
              ]
            }
          },
          {
            "order": 8,
            "en": "The bush was on fire, but it did not burn",
            "pt": "A sarça estava em chamas, mas não se consumia",
            "altPt": [
              "A sarça ardia, mas não se consumia",
              "A sarça estava pegando fogo, mas não queimava"
            ],
            "kind": "negative",
            "fact": true
          },
          {
            "order": 9,
            "en": "God called from the bush, \"Moses! Moses!\"",
            "pt": "Deus chamou do meio da sarça: \"Moisés! Moisés!\"",
            "kind": "quote",
            "fact": true,
            "speaker": "voice"
          },
          {
            "order": 10,
            "en": "\"Take off your sandals. This is holy ground\"",
            "pt": "\"Tire as sandálias. Este é chão santo\"",
            "altPt": [
              "\"Tira os teus sapatos. O lugar em que tu estás é terra santa\""
            ],
            "kind": "quote",
            "fact": true,
            "iconic": true,
            "speaker": "voice",
            "gap": {
              "word": "Take",
              "kind": "grammar",
              "options": [
                "Take",
                "Takes",
                "Taking"
              ]
            },
            "grammar": "imperative"
          },
          {
            "order": 11,
            "en": "Was the ground holy? Yes, God was there",
            "pt": "O chão era santo? Sim, Deus estava ali",
            "kind": "question",
            "fact": false
          },
          {
            "order": 12,
            "en": "Moses asked, \"Who am I to go to Pharaoh?\"",
            "pt": "Moisés perguntou: \"Quem sou eu para ir a Faraó?\"",
            "kind": "question",
            "fact": true,
            "iconic": true,
            "speaker": "moises",
            "gap": {
              "word": "Who",
              "kind": "grammar",
              "options": [
                "Who",
                "What",
                "Where"
              ]
            },
            "grammar": "wh-questions"
          }
        ],
        "contrast": [
          {
            "a": "The king said, \"Throw every baby boy into the river\"",
            "b": "The king said, \"Do not throw the baby boys into the river\"",
            "note": "Do not + verbo = ordem negativa (Dica 1)"
          },
          {
            "a": "Was the ground holy? Yes, God was there",
            "b": "Who was there? God was there",
            "note": "pergunta de sim ou não com was; pergunta com who pede uma pessoa (Dica 2)"
          }
        ],
        "verse": {
          "text": "Take off your sandals, for the place you are standing on is holy ground.",
          "classic": "Put off thy shoes from off thy feet, for the place whereon thou standest is holy ground.",
          "pt": "Tire as sandálias, porque o lugar onde você está é chão santo.",
          "classicPt": "Tira os teus sapatos de teus pés; porque o lugar em que tu estás é terra santa.",
          "ref": "Êxodo 3:5",
          "blank": "holy",
          "options": [
            "holy",
            "dry",
            "new",
            "dark"
          ],
          "blanks": [
            {
              "word": "holy",
              "options": [
                "holy",
                "dry",
                "new",
                "dark"
              ]
            },
            {
              "word": "sandals",
              "options": [
                "sandals",
                "hands",
                "eyes",
                "feet"
              ]
            },
            {
              "word": "standing",
              "options": [
                "standing",
                "sleeping",
                "walking",
                "eating"
              ]
            }
          ]
        },
        "reading": {
          "text": "A new king of Egypt made Israel work very hard. A woman hid her baby in a basket by the river, and Pharaoh's daughter saw him there and called him Moses. Later, in Midian, Moses saw a bush on fire, and God called him from the bush. God said, \"Take off your sandals, for this is holy ground. Now go, I will send you to Pharaoh.\"",
          "pt": "Um novo rei do Egito fez Israel trabalhar muito. Uma mulher escondeu o bebê num cesto junto ao rio, e a filha de Faraó o viu ali e o chamou de Moisés. Mais tarde, em Midiã, Moisés viu uma sarça em chamas, e Deus o chamou do meio da sarça. Deus disse: \"Tire as sandálias, porque este é chão santo. Agora vá, eu envio você a Faraó.\"",
          "q": "Where did the woman hide her baby?",
          "options": [
            "In a basket near the water",
            "In the house of the king",
            "In a tree in the garden"
          ],
          "answer": "In a basket near the water",
          "questions": [
            {
              "kind": "literal",
              "q": "Where did the woman hide her baby?",
              "qPt": "Onde a mulher escondeu o bebê?",
              "options": [
                "In a basket near the water",
                "In the house of the king",
                "In a tree in the garden"
              ],
              "answer": "In a basket near the water"
            },
            {
              "kind": "inference",
              "q": "Why did the woman hide her baby?",
              "qPt": "Por que a mulher escondeu o bebê?",
              "options": [
                "To keep him safe from the king",
                "Because she did not want him",
                "Because the water was good for him"
              ],
              "answer": "To keep him safe from the king",
              "explain": "O rei mandou jogar no rio todos os meninos hebreus recém-nascidos; por isso a mãe escondeu Moisés (Êxodo 1:22; 2:2-3)."
            }
          ]
        },
        "dialogue": {
          "line": "Moses! Moses! Do not come close.",
          "pt": "Moisés! Moisés! Não chegue perto.",
          "options": [
            "Here I am, Lord.",
            "Who are you, Lord?",
            "Come here, Lord."
          ],
          "answer": "Here I am, Lord.",
          "answerPt": "Aqui estou, Senhor."
        },
        "conversation": {
          "with": "voice",
          "turns": [
            {
              "who": "voice",
              "en": "Moses! Moses! Do not come close.",
              "pt": "Moisés! Moisés! Não chegue perto.",
              "mood": "solene"
            },
            {
              "who": "you",
              "options": [
                "Here I am, Lord.",
                "Who are you, Lord?",
                "Come here, Lord."
              ],
              "answer": "Here I am, Lord.",
              "pt": "Aqui estou, Senhor.",
              "intent": "Responda ao chamado de Deus"
            },
            {
              "who": "voice",
              "en": "Take off your sandals. This is holy ground. Now go, I will send you to Pharaoh.",
              "pt": "Tire as sandálias. Este é chão santo. Agora vá, eu envio você a Faraó.",
              "mood": "solene"
            },
            {
              "who": "you",
              "options": [
                "Who am I, Lord? Please send someone else.",
                "Yes, Lord. I know Pharaoh very well.",
                "No, Lord. Pharaoh is not in Egypt."
              ],
              "answer": "Who am I, Lord? Please send someone else.",
              "pt": "Quem sou eu, Senhor? Por favor, mande outra pessoa.",
              "intent": "Diga que não se sente capaz e peça para Deus mandar outro",
              "speak": true
            }
          ]
        },
        "quiz": {
          "q": "Why did the woman hide her baby?",
          "options": [
            "To keep him safe from the king",
            "Because she did not want him",
            "Because the water was good for him"
          ],
          "answer": "To keep him safe from the king",
          "explain": "O rei mandou jogar no rio todos os meninos hebreus recém-nascidos; por isso a mãe escondeu Moisés (Êxodo 1:22; 2:2-3)."
        },
        "fact": {
          "pt": "Quando Moisés perguntou qual era o nome de Deus, a resposta foi: \"EU SOU O QUE SOU\" (Êxodo 3:14). E o nome Moisés lembra o verbo hebraico \"tirar\": a filha de Faraó disse \"porque das águas o tirei\" (Êxodo 2:10).",
          "ref": "Êxodo 3:14"
        },
        "v": 2
      },
      {
        "id": "u3l2",
        "title": "Deixe o meu povo ir",
        "ref": "Êxodo 5:1-2; 7:14-21; 8:1-6; 12:1-33",
        "level": "A1.2",
        "narrator": "moises",
        "guests": [
          "pharaoh",
          "voice"
        ],
        "names": [
          {
            "en": "God",
            "pt": "Deus",
            "note": "sempre com maiúscula; os pronomes (he, his) ficam em minúscula"
          },
          {
            "en": "the Lord",
            "pt": "o Senhor"
          },
          {
            "en": "Moses",
            "pt": "Moisés"
          },
          {
            "en": "Aaron",
            "pt": "Arão",
            "note": "irmão de Moisés; falava por ele"
          },
          {
            "en": "Pharaoh",
            "pt": "Faraó",
            "note": "o rei do Egito"
          },
          {
            "en": "Egypt",
            "pt": "Egito"
          },
          {
            "en": "Israel",
            "pt": "Israel",
            "note": "o povo de Deus"
          }
        ],
        "hints": {
          "hard": "duro",
          "houses": "casas",
          "see": "vir, ver",
          "pass": "passar, passarei",
          "called": "chamou"
        },
        "tips": [
          {
            "part": 1,
            "id": "negation-do",
            "grammar": "negation-do",
            "title": "do not / did not: dizer não",
            "body": "Para negar, use do not (don't) antes do verbo: I do not know. No passado, use did not: The king did not let them go. O verbo fica na forma básica, sem -ed. Para perguntar no passado: Did the king know? No, he did not.",
            "examples": [
              {
                "en": "I know the Lord",
                "pt": "Eu conheço o Senhor"
              },
              {
                "en": "I do not know the Lord",
                "pt": "Eu não conheço o Senhor"
              }
            ],
            "contrast": {
              "a": "The king let the people go",
              "b": "The king did not let the people go",
              "note": "did not + verbo básico (let), nunca did not + passado"
            }
          },
          {
            "part": 2,
            "id": "instructions",
            "grammar": "instructions",
            "title": "Put, Go, Get out: ordens e instruções",
            "body": "Uma instrução é o verbo na forma básica, sem sujeito: Put the blood on the door. Get out! Para negar: Do not go. Para uma sequência, use then: Take a lamb, then put the blood on the door. Para pedir com educação, acrescente please.",
            "examples": [
              {
                "en": "Put the blood on the door",
                "pt": "Ponham o sangue na porta"
              },
              {
                "en": "Get out of Egypt!",
                "pt": "Saiam do Egito!"
              }
            ],
            "contrast": {
              "a": "Go!",
              "b": "Do not go!",
              "note": "negativa do imperativo = Do not + verbo"
            }
          }
        ],
        "vocab": [
          {
            "en": "people",
            "pt": "povo",
            "ptAlt": [
              "pessoas"
            ],
            "pos": "noun",
            "field": "people",
            "tier": "core",
            "part": 1,
            "icon": "👥",
            "example": 2
          },
          {
            "en": "heart",
            "pt": "coração",
            "pos": "noun",
            "field": "body",
            "tier": "core",
            "part": 1,
            "icon": "❤️",
            "example": 5
          },
          {
            "en": "to go",
            "pt": "ir",
            "pos": "verb",
            "field": "actions",
            "tier": "core",
            "part": 1,
            "icon": "🚶",
            "example": 2,
            "forms": [
              "went"
            ]
          },
          {
            "en": "to know",
            "pt": "conhecer",
            "ptAlt": [
              "saber"
            ],
            "pos": "verb",
            "field": "mind",
            "tier": "core",
            "part": 1,
            "icon": "🤔",
            "example": 4,
            "forms": [
              "knew"
            ]
          },
          {
            "en": "Let my people go",
            "pt": "Deixe o meu povo ir",
            "ptAlt": [
              "Deixa ir o meu povo"
            ],
            "pos": "chunk",
            "field": "speech",
            "tier": "core",
            "part": 1,
            "icon": "✊",
            "iconic": true,
            "example": 2
          },
          {
            "en": "blood",
            "pt": "sangue",
            "pos": "noun",
            "field": "body",
            "tier": "core",
            "part": 2,
            "icon": "🔴",
            "example": 7
          },
          {
            "en": "to put",
            "pt": "pôr",
            "ptAlt": [
              "colocar"
            ],
            "pos": "verb",
            "field": "actions",
            "tier": "core",
            "part": 2,
            "icon": "🤲",
            "example": 9
          },
          {
            "en": "frog",
            "pt": "rã",
            "ptAlt": [
              "sapo"
            ],
            "pos": "noun",
            "field": "animals",
            "tier": "bible",
            "part": 2,
            "icon": "🐸",
            "example": 7
          },
          {
            "en": "lamb",
            "pt": "cordeiro",
            "pos": "noun",
            "field": "animals",
            "tier": "bible",
            "part": 2,
            "icon": "🐑",
            "example": 9,
            "note": "filhote de ovelha; o cordeiro da Páscoa"
          },
          {
            "en": "Get out!",
            "pt": "Saiam!",
            "ptAlt": [
              "Saia!",
              "Fora!"
            ],
            "pos": "chunk",
            "field": "speech",
            "tier": "core",
            "part": 2,
            "icon": "👉",
            "example": 12
          }
        ],
        "sentences": [
          {
            "en": "Moses and Aaron went to the king of Egypt",
            "pt": "Moisés e Arão foram ao rei do Egito"
          },
          {
            "en": "Moses said, \"Let my people go\"",
            "pt": "Moisés disse: \"Deixe o meu povo ir\"",
            "altPt": [
              "Moisés disse: \"Deixa ir o meu povo\""
            ]
          },
          {
            "en": "The king asked, \"Who is the Lord?\"",
            "pt": "O rei perguntou: \"Quem é o Senhor?\""
          },
          {
            "en": "\"I do not know the Lord,\" said the king",
            "pt": "\"Eu não conheço o Senhor\", disse o rei"
          },
          {
            "en": "His heart was hard, and the people did not go",
            "pt": "O coração dele era duro, e o povo não pôde ir",
            "altPt": [
              "O coração dele era duro, e o povo não foi",
              "O seu coração se endureceu, e o povo não saiu"
            ]
          },
          {
            "en": "Did the king know God? No, his heart was hard",
            "pt": "O rei conhecia Deus? Não, o coração dele era duro"
          },
          {
            "en": "The water was blood, and frogs were everywhere",
            "pt": "A água era sangue, e havia rãs por toda parte",
            "altPt": [
              "A água virou sangue, e havia rãs em todo lugar"
            ]
          },
          {
            "en": "There were frogs in the river and in the houses",
            "pt": "Havia rãs no rio e nas casas"
          },
          {
            "en": "Put the blood of the lamb on the door",
            "pt": "Ponham o sangue do cordeiro na porta",
            "altPt": [
              "Ponde o sangue do cordeiro nas ombreiras das portas",
              "Coloquem o sangue do cordeiro na porta"
            ]
          },
          {
            "en": "When I see the blood, I will pass over you",
            "pt": "Quando eu vir o sangue, passarei por vocês",
            "altPt": [
              "Quando eu vir o sangue, passarei por cima de vós",
              "Vendo eu sangue, passarei por cima de vós"
            ]
          },
          {
            "en": "The people put the lamb's blood on their doors",
            "pt": "O povo pôs o sangue do cordeiro nas suas portas",
            "altPt": [
              "O povo colocou o sangue do cordeiro em suas portas"
            ]
          },
          {
            "en": "That night, the king said, \"Get out of Egypt!\"",
            "pt": "Naquela noite, o rei disse: \"Saiam do Egito!\""
          }
        ],
        "beats": [
          {
            "order": 1,
            "en": "Moses and Aaron went to the king of Egypt",
            "pt": "Moisés e Arão foram ao rei do Egito",
            "kind": "statement",
            "fact": true
          },
          {
            "order": 2,
            "en": "Moses said, \"Let my people go\"",
            "pt": "Moisés disse: \"Deixe o meu povo ir\"",
            "altPt": [
              "Moisés disse: \"Deixa ir o meu povo\""
            ],
            "kind": "quote",
            "fact": true,
            "iconic": true,
            "speaker": "moises"
          },
          {
            "order": 3,
            "en": "The king asked, \"Who is the Lord?\"",
            "pt": "O rei perguntou: \"Quem é o Senhor?\"",
            "kind": "question",
            "fact": true,
            "speaker": "pharaoh"
          },
          {
            "order": 4,
            "en": "\"I do not know the Lord,\" said the king",
            "pt": "\"Eu não conheço o Senhor\", disse o rei",
            "kind": "negative",
            "fact": true,
            "speaker": "pharaoh",
            "gap": {
              "word": "do",
              "kind": "grammar",
              "options": [
                "do",
                "does",
                "did"
              ]
            },
            "grammar": "negation-do"
          },
          {
            "order": 5,
            "en": "His heart was hard, and the people did not go",
            "pt": "O coração dele era duro, e o povo não pôde ir",
            "altPt": [
              "O coração dele era duro, e o povo não foi",
              "O seu coração se endureceu, e o povo não saiu"
            ],
            "kind": "negative",
            "fact": true,
            "grammar": "negation-do"
          },
          {
            "order": 6,
            "en": "Did the king know God? No, his heart was hard",
            "pt": "O rei conhecia Deus? Não, o coração dele era duro",
            "kind": "question",
            "fact": true,
            "grammar": "negation-do"
          },
          {
            "order": 7,
            "en": "The water was blood, and frogs were everywhere",
            "pt": "A água era sangue, e havia rãs por toda parte",
            "altPt": [
              "A água virou sangue, e havia rãs em todo lugar"
            ],
            "kind": "statement",
            "fact": true
          },
          {
            "order": 8,
            "en": "There were frogs in the river and in the houses",
            "pt": "Havia rãs no rio e nas casas",
            "kind": "statement",
            "fact": true
          },
          {
            "order": 9,
            "en": "Put the blood of the lamb on the door",
            "pt": "Ponham o sangue do cordeiro na porta",
            "altPt": [
              "Ponde o sangue do cordeiro nas ombreiras das portas",
              "Coloquem o sangue do cordeiro na porta"
            ],
            "kind": "quote",
            "fact": true,
            "speaker": "voice",
            "gap": {
              "word": "Put",
              "kind": "grammar",
              "options": [
                "Put",
                "Puts",
                "Putting"
              ]
            },
            "grammar": "instructions"
          },
          {
            "order": 10,
            "en": "When I see the blood, I will pass over you",
            "pt": "Quando eu vir o sangue, passarei por vocês",
            "altPt": [
              "Quando eu vir o sangue, passarei por cima de vós",
              "Vendo eu sangue, passarei por cima de vós"
            ],
            "kind": "quote",
            "fact": true,
            "iconic": true,
            "speaker": "voice",
            "prod": false
          },
          {
            "order": 11,
            "en": "The people put the lamb's blood on their doors",
            "pt": "O povo pôs o sangue do cordeiro nas suas portas",
            "altPt": [
              "O povo colocou o sangue do cordeiro em suas portas"
            ],
            "kind": "statement",
            "fact": true,
            "gap": {
              "word": "doors",
              "kind": "lexical",
              "options": [
                "doors",
                "frogs",
                "baskets"
              ]
            }
          },
          {
            "order": 12,
            "en": "That night, the king said, \"Get out of Egypt!\"",
            "pt": "Naquela noite, o rei disse: \"Saiam do Egito!\"",
            "kind": "quote",
            "fact": true,
            "speaker": "pharaoh"
          }
        ],
        "contrast": [
          {
            "a": "\"I do not know the Lord,\" said the king",
            "b": "\"I know the Lord,\" said the king",
            "note": "do not + verbo básico = negativa no presente (Dica 1)"
          },
          {
            "a": "Put the blood of the lamb on the door",
            "b": "Do not put the blood on the door",
            "note": "Do not + verbo = ordem negativa (Dica 2)"
          }
        ],
        "verse": {
          "text": "When I see the blood, I will pass over you.",
          "classic": "And when I see the blood, I will pass over you.",
          "pt": "Quando eu vir o sangue, passarei por vocês.",
          "classicPt": "Vendo eu sangue, passarei por cima de vós.",
          "ref": "Êxodo 12:13",
          "blank": "blood",
          "options": [
            "blood",
            "water",
            "door",
            "lamb"
          ],
          "blanks": [
            {
              "word": "blood",
              "options": [
                "blood",
                "water",
                "door",
                "lamb"
              ]
            },
            {
              "word": "see",
              "options": [
                "see",
                "hear",
                "eat",
                "make"
              ]
            },
            {
              "word": "pass",
              "options": [
                "pass",
                "go",
                "run",
                "walk"
              ]
            }
          ]
        },
        "reading": {
          "text": "Moses went to the king of Egypt and said, \"Let my people go.\" But the king's heart was hard, and he said no. So the Lord sent blood and frogs on Egypt. At last, the people of Israel put the blood of a lamb on their doors. That night, the king called Moses and said, \"Get out!\"",
          "pt": "Moisés foi ao rei do Egito e disse: \"Deixe o meu povo ir.\" Mas o coração do rei era duro, e ele disse não. Então o Senhor mandou sangue e rãs sobre o Egito. Por fim, o povo de Israel pôs o sangue de um cordeiro nas suas portas. Naquela noite, o rei chamou Moisés e disse: \"Saiam!\"",
          "q": "What did the people put on their doors?",
          "options": [
            "Lamb's blood",
            "River water",
            "A green frog"
          ],
          "answer": "Lamb's blood",
          "questions": [
            {
              "kind": "literal",
              "q": "What did the people put on their doors?",
              "qPt": "O que o povo pôs nas portas?",
              "options": [
                "Lamb's blood",
                "River water",
                "A green frog"
              ],
              "answer": "Lamb's blood"
            },
            {
              "kind": "inference",
              "q": "Why did the king let the people go in the end?",
              "qPt": "Por que o rei deixou o povo ir no final?",
              "options": [
                "Because of the plagues on Egypt",
                "Because he loved Moses",
                "Because the people paid him"
              ],
              "answer": "Because of the plagues on Egypt",
              "explain": "Só depois da última praga Faraó chamou Moisés de noite e mandou o povo sair (Êxodo 12:29-31)."
            }
          ]
        },
        "dialogue": {
          "line": "Moses, why are you here?",
          "pt": "Moisés, por que você está aqui?",
          "options": [
            "Let my people go.",
            "Let my people work.",
            "Let my people stay here."
          ],
          "answer": "Let my people go.",
          "answerPt": "Deixe o meu povo ir."
        },
        "conversation": {
          "with": "pharaoh",
          "turns": [
            {
              "who": "pharaoh",
              "en": "Moses, why are you here?",
              "pt": "Moisés, por que você está aqui?",
              "mood": "bravo"
            },
            {
              "who": "you",
              "options": [
                "Let my people go.",
                "Let my people work.",
                "Let my people stay here."
              ],
              "answer": "Let my people go.",
              "pt": "Deixe o meu povo ir.",
              "intent": "Faça o pedido do Senhor"
            },
            {
              "who": "pharaoh",
              "en": "Who is the Lord? I don't know him.",
              "pt": "Quem é o Senhor? Eu não o conheço.",
              "mood": "irônico"
            },
            {
              "who": "you",
              "options": [
                "He is the God of Israel.",
                "He is the king of Egypt.",
                "He is my brother Aaron."
              ],
              "answer": "He is the God of Israel.",
              "pt": "Ele é o Deus de Israel.",
              "intent": "Diga quem é o Senhor",
              "speak": true
            }
          ]
        },
        "quiz": {
          "q": "Why did the king let the people go in the end?",
          "options": [
            "Because of the plagues on Egypt",
            "Because he loved Moses",
            "Because the people paid him"
          ],
          "answer": "Because of the plagues on Egypt",
          "explain": "Só depois da última praga Faraó chamou Moisés de noite e mandou o povo sair (Êxodo 12:29-31)."
        },
        "fact": {
          "pt": "A Páscoa judaica (Pessach) lembra até hoje a noite em que o Senhor passou por cima das casas marcadas com sangue (Êxodo 12:14).",
          "ref": "Êxodo 12:14"
        },
        "v": 2
      },
      {
        "id": "u3l3",
        "title": "O mar se abre",
        "ref": "Êxodo 13:21-22; 14:5-31; 15:1-21",
        "level": "A1.2",
        "narrator": "moises",
        "guests": [
          "voice",
          "povo"
        ],
        "names": [
          {
            "en": "God",
            "pt": "Deus",
            "note": "sempre com maiúscula; os pronomes (he, his) ficam em minúscula"
          },
          {
            "en": "the Lord",
            "pt": "o Senhor"
          },
          {
            "en": "Moses",
            "pt": "Moisés"
          },
          {
            "en": "Miriam",
            "pt": "Miriã",
            "note": "irmã de Moisés e Arão; profetisa"
          },
          {
            "en": "Pharaoh",
            "pt": "Faraó",
            "note": "o rei do Egito"
          },
          {
            "en": "Egypt",
            "pt": "Egito"
          },
          {
            "en": "Israel",
            "pt": "Israel",
            "note": "o povo de Deus"
          }
        ],
        "hints": {
          "pillar": "coluna",
          "saw": "viu, viram",
          "stand": "ficar, fiquem",
          "hand": "mão",
          "covered": "cobriu",
          "tambourine": "tamborim",
          "walls": "muros, paredes"
        },
        "tips": [
          {
            "part": 1,
            "id": "imperative-be",
            "grammar": "imperative-be",
            "title": "Do not be afraid: ordens com be",
            "body": "O verbo be (ser, estar) também dá ordens: Be still (Fique quieto), Be good (Seja bom). Para proibir, use Do not be (don't be): Do not be afraid = Não tenha medo. Stand still = Fiquem parados.",
            "examples": [
              {
                "en": "Be still",
                "pt": "Fique quieto"
              },
              {
                "en": "Do not be afraid",
                "pt": "Não tenha medo"
              }
            ],
            "contrast": {
              "a": "Be afraid",
              "b": "Do not be afraid",
              "note": "Do not + be = proibição; a ordem fica negativa"
            }
          },
          {
            "part": 2,
            "id": "prep-movement",
            "grammar": "prep-movement",
            "title": "through, into, over: por onde a gente passa",
            "body": "through = através de, pelo meio de (walk through the sea); into = para dentro de (go into the sea); over = por cima de (over the sea); across = de um lado ao outro. Elas vêm depois do verbo de movimento e antes do lugar.",
            "examples": [
              {
                "en": "We walked through the sea",
                "pt": "Nós andamos pelo meio do mar"
              },
              {
                "en": "The army went into the sea",
                "pt": "O exército entrou no mar"
              }
            ],
            "contrast": {
              "a": "We walked through the sea",
              "b": "We walked into the sea",
              "note": "through = atravessar; into = entrar"
            }
          }
        ],
        "vocab": [
          {
            "en": "army",
            "pt": "exército",
            "pos": "noun",
            "field": "people",
            "tier": "core",
            "part": 1,
            "icon": "🏹",
            "example": 2
          },
          {
            "en": "chariot",
            "pt": "carro de guerra",
            "ptAlt": [
              "carro",
              "carruagem"
            ],
            "pos": "noun",
            "field": "objects",
            "tier": "bible",
            "part": 1,
            "icon": "🐎",
            "example": 2,
            "note": "carro de duas rodas puxado por cavalos"
          },
          {
            "en": "to fight",
            "pt": "lutar",
            "ptAlt": [
              "pelejar"
            ],
            "pos": "verb",
            "field": "actions",
            "tier": "core",
            "part": 1,
            "icon": "⚔️",
            "example": 5,
            "forms": [
              "fought"
            ]
          },
          {
            "en": "to stand",
            "pt": "ficar de pé",
            "ptAlt": [
              "ficar",
              "parar"
            ],
            "pos": "verb",
            "field": "actions",
            "tier": "core",
            "part": 1,
            "icon": "🧍‍♂️",
            "example": 4,
            "forms": [
              "stood"
            ]
          },
          {
            "en": "Do not be afraid",
            "pt": "Não tenham medo",
            "ptAlt": [
              "Não tenha medo",
              "Não temam"
            ],
            "pos": "chunk",
            "field": "speech",
            "tier": "core",
            "part": 1,
            "icon": "🤗",
            "iconic": true,
            "example": 4
          },
          {
            "en": "sea",
            "pt": "mar",
            "pos": "noun",
            "field": "places",
            "tier": "core",
            "part": 2,
            "icon": "🌊",
            "example": 9
          },
          {
            "en": "dry",
            "pt": "seco",
            "ptAlt": [
              "seca"
            ],
            "pos": "adj",
            "field": "quality",
            "tier": "core",
            "part": 2,
            "icon": "🏜️",
            "example": 9
          },
          {
            "en": "to walk",
            "pt": "andar",
            "ptAlt": [
              "caminhar"
            ],
            "pos": "verb",
            "field": "actions",
            "tier": "core",
            "part": 2,
            "icon": "🦶",
            "example": 9
          },
          {
            "en": "to sing",
            "pt": "cantar",
            "pos": "verb",
            "field": "actions",
            "tier": "core",
            "part": 2,
            "icon": "🎤",
            "example": 12,
            "forms": [
              "sang"
            ]
          },
          {
            "en": "Sing to the Lord",
            "pt": "Cantem ao Senhor",
            "ptAlt": [
              "Cante ao Senhor",
              "Cantai ao Senhor"
            ],
            "pos": "chunk",
            "field": "speech",
            "tier": "core",
            "part": 2,
            "icon": "🎼",
            "iconic": true,
            "example": 12
          }
        ],
        "sentences": [
          {
            "en": "A pillar of cloud and fire went before Israel",
            "pt": "Uma coluna de nuvem e de fogo ia adiante de Israel",
            "altPt": [
              "Uma coluna de nuvem e fogo ia na frente de Israel"
            ]
          },
          {
            "en": "Pharaoh came after them with his army and chariots",
            "pt": "Faraó veio atrás deles com o seu exército e carros de guerra",
            "altPt": [
              "Faraó veio atrás deles com seu exército e seus carros"
            ]
          },
          {
            "en": "Israel saw the army and chariots and was very afraid",
            "pt": "Israel viu o exército e os carros e ficou com muito medo",
            "altPt": [
              "Israel viu o exército e os carros de guerra e teve muito medo"
            ]
          },
          {
            "en": "Moses said, \"Do not be afraid. Stand still\"",
            "pt": "Moisés disse: \"Não tenham medo. Fiquem parados\"",
            "altPt": [
              "Moisés disse: \"Não temais. Ficai firmes\""
            ]
          },
          {
            "en": "Moses said, \"The Lord will fight for you\"",
            "pt": "Moisés disse: \"O Senhor lutará por vocês\"",
            "altPt": [
              "Moisés disse: \"O Senhor pelejará por vós\"",
              "Moisés disse: \"O Senhor vai lutar por vocês\""
            ]
          },
          {
            "en": "Did Israel stand still? Yes, the Lord fought for them",
            "pt": "Israel ficou parado? Sim, o Senhor lutou por eles"
          },
          {
            "en": "The Lord said, \"Put out your hand over the sea\"",
            "pt": "O Senhor disse: \"Estenda a mão sobre o mar\"",
            "altPt": [
              "O Senhor disse: \"Estende a tua mão sobre o mar\""
            ]
          },
          {
            "en": "All night a wind came, and the sea was dry",
            "pt": "A noite toda veio um vento, e o mar ficou seco",
            "altPt": [
              "Um vento soprou a noite inteira, e o mar secou"
            ]
          },
          {
            "en": "We walked through the sea on dry ground",
            "pt": "Nós andamos pelo meio do mar em chão seco",
            "altPt": [
              "Andamos pelo mar em terra seca",
              "Nós atravessamos o mar em chão seco"
            ]
          },
          {
            "en": "Did we walk through the water? No, on dry ground",
            "pt": "Nós andamos pela água? Não, em chão seco"
          },
          {
            "en": "The water covered the army. We sang to the Lord",
            "pt": "A água cobriu o exército. Nós cantamos ao Senhor",
            "altPt": [
              "As águas cobriram o exército. Cantamos ao Senhor"
            ]
          },
          {
            "en": "Miriam sang with a tambourine, \"Sing to the Lord\"",
            "pt": "Miriã cantou com um tamborim: \"Cantem ao Senhor\"",
            "altPt": [
              "Miriã cantou com um tamborim: \"Cantai ao Senhor\""
            ]
          }
        ],
        "beats": [
          {
            "order": 1,
            "en": "A pillar of cloud and fire went before Israel",
            "pt": "Uma coluna de nuvem e de fogo ia adiante de Israel",
            "altPt": [
              "Uma coluna de nuvem e fogo ia na frente de Israel"
            ],
            "kind": "statement",
            "fact": true
          },
          {
            "order": 2,
            "en": "Pharaoh came after them with his army and chariots",
            "pt": "Faraó veio atrás deles com o seu exército e carros de guerra",
            "altPt": [
              "Faraó veio atrás deles com seu exército e seus carros"
            ],
            "kind": "statement",
            "fact": true
          },
          {
            "order": 3,
            "en": "Israel saw the army and chariots and was very afraid",
            "pt": "Israel viu o exército e os carros e ficou com muito medo",
            "altPt": [
              "Israel viu o exército e os carros de guerra e teve muito medo"
            ],
            "kind": "statement",
            "fact": true
          },
          {
            "order": 4,
            "en": "Moses said, \"Do not be afraid. Stand still\"",
            "pt": "Moisés disse: \"Não tenham medo. Fiquem parados\"",
            "altPt": [
              "Moisés disse: \"Não temais. Ficai firmes\""
            ],
            "kind": "negative",
            "fact": true,
            "iconic": true,
            "speaker": "moises",
            "gap": {
              "word": "be",
              "kind": "grammar",
              "options": [
                "be",
                "is",
                "are"
              ]
            },
            "grammar": "imperative-be"
          },
          {
            "order": 5,
            "en": "Moses said, \"The Lord will fight for you\"",
            "pt": "Moisés disse: \"O Senhor lutará por vocês\"",
            "altPt": [
              "Moisés disse: \"O Senhor pelejará por vós\"",
              "Moisés disse: \"O Senhor vai lutar por vocês\""
            ],
            "kind": "quote",
            "fact": true,
            "iconic": true,
            "speaker": "moises"
          },
          {
            "order": 6,
            "en": "Did Israel stand still? Yes, the Lord fought for them",
            "pt": "Israel ficou parado? Sim, o Senhor lutou por eles",
            "kind": "question",
            "fact": true
          },
          {
            "order": 7,
            "en": "The Lord said, \"Put out your hand over the sea\"",
            "pt": "O Senhor disse: \"Estenda a mão sobre o mar\"",
            "altPt": [
              "O Senhor disse: \"Estende a tua mão sobre o mar\""
            ],
            "kind": "quote",
            "fact": true,
            "speaker": "voice",
            "gap": {
              "word": "over",
              "kind": "grammar",
              "options": [
                "over",
                "into",
                "through"
              ]
            },
            "grammar": "prep-movement"
          },
          {
            "order": 8,
            "en": "All night a wind came, and the sea was dry",
            "pt": "A noite toda veio um vento, e o mar ficou seco",
            "altPt": [
              "Um vento soprou a noite inteira, e o mar secou"
            ],
            "kind": "statement",
            "fact": true
          },
          {
            "order": 9,
            "en": "We walked through the sea on dry ground",
            "pt": "Nós andamos pelo meio do mar em chão seco",
            "altPt": [
              "Andamos pelo mar em terra seca",
              "Nós atravessamos o mar em chão seco"
            ],
            "kind": "first-person",
            "fact": true,
            "speaker": "moises",
            "gap": {
              "word": "sea",
              "kind": "lexical",
              "options": [
                "sea",
                "army",
                "river"
              ]
            }
          },
          {
            "order": 10,
            "en": "Did we walk through the water? No, on dry ground",
            "pt": "Nós andamos pela água? Não, em chão seco",
            "kind": "question",
            "fact": true,
            "speaker": "moises"
          },
          {
            "order": 11,
            "en": "The water covered the army. We sang to the Lord",
            "pt": "A água cobriu o exército. Nós cantamos ao Senhor",
            "altPt": [
              "As águas cobriram o exército. Cantamos ao Senhor"
            ],
            "kind": "first-person",
            "fact": true,
            "speaker": "moises"
          },
          {
            "order": 12,
            "en": "Miriam sang with a tambourine, \"Sing to the Lord\"",
            "pt": "Miriã cantou com um tamborim: \"Cantem ao Senhor\"",
            "altPt": [
              "Miriã cantou com um tamborim: \"Cantai ao Senhor\""
            ],
            "kind": "quote",
            "fact": true,
            "iconic": true
          }
        ],
        "contrast": [
          {
            "a": "Moses said, \"Do not be afraid. Stand still\"",
            "b": "Moses said, \"Do not be afraid. Do not run\"",
            "note": "Do not + be (afraid) e Do not + verbo (run): a mesma forma de proibição (Dica 1)"
          },
          {
            "a": "We walked through the sea on dry ground",
            "b": "We walked across the sea on dry ground",
            "note": "through = pelo meio; across = de um lado ao outro (Dica 2)"
          }
        ],
        "verse": {
          "text": "The Lord will fight for you, and you shall be still.",
          "classic": "The LORD shall fight for you, and ye shall hold your peace.",
          "pt": "O Senhor lutará por vocês; vocês só precisam ficar quietos.",
          "classicPt": "O SENHOR pelejará por vós, e vos calareis.",
          "ref": "Êxodo 14:14",
          "blank": "fight",
          "options": [
            "fight",
            "sing",
            "walk",
            "wait"
          ],
          "blanks": [
            {
              "word": "fight",
              "options": [
                "fight",
                "sing",
                "walk",
                "wait"
              ]
            },
            {
              "word": "still",
              "options": [
                "still",
                "afraid",
                "dry",
                "alone"
              ]
            }
          ]
        },
        "reading": {
          "text": "The king of Egypt came after Israel with his army and chariots, and the people were very afraid. Moses said, \"Do not be afraid. The Lord will fight for you.\" Moses put out his hand, a wind came all night, and Israel walked through the sea on dry ground. Then the water came back and covered the army, and Miriam sang, \"Sing to the Lord!\"",
          "pt": "O rei do Egito veio atrás de Israel com o seu exército e os carros de guerra, e o povo ficou com muito medo. Moisés disse: \"Não tenham medo. O Senhor lutará por vocês.\" Moisés estendeu a mão, um vento soprou a noite toda, e Israel andou pelo meio do mar em chão seco. Depois a água voltou e cobriu o exército, e Miriã cantou: \"Cantem ao Senhor!\"",
          "q": "What did Moses tell the people to do?",
          "options": [
            "Not to be scared, because God would fight",
            "To go back to Egypt",
            "To fight the army with chariots"
          ],
          "answer": "Not to be scared, because God would fight",
          "questions": [
            {
              "kind": "literal",
              "q": "What did Moses tell the people to do?",
              "qPt": "O que Moisés disse ao povo para fazer?",
              "options": [
                "Not to be scared, because God would fight",
                "To go back to Egypt",
                "To fight the army with chariots"
              ],
              "answer": "Not to be scared, because God would fight"
            },
            {
              "kind": "inference",
              "q": "Who made the sea dry?",
              "qPt": "Quem secou o mar?",
              "options": [
                "The Lord, with the wind",
                "Moses, with his own hand",
                "The army, with the chariots"
              ],
              "answer": "The Lord, with the wind",
              "explain": "Moisés estendeu a mão, mas foi o Senhor quem fez o mar recuar com um forte vento leste a noite toda (Êxodo 14:21)."
            }
          ]
        },
        "dialogue": {
          "line": "Moses, look! Pharaoh's chariots are coming after us!",
          "pt": "Moisés, olhe! Os carros de Faraó estão vindo atrás de nós!",
          "options": [
            "Do not be afraid. The Lord will fight for you.",
            "Do not be afraid. The army is very small.",
            "Be afraid. Go back to Egypt now."
          ],
          "answer": "Do not be afraid. The Lord will fight for you.",
          "answerPt": "Não tenham medo. O Senhor lutará por vocês."
        },
        "conversation": {
          "with": "povo",
          "turns": [
            {
              "who": "povo",
              "en": "Moses, look! Pharaoh's chariots are coming after us!",
              "pt": "Moisés, olhe! Os carros de Faraó estão vindo atrás de nós!",
              "mood": "assustado"
            },
            {
              "who": "you",
              "options": [
                "Do not be afraid. The Lord will fight for you.",
                "Do not be afraid. The army is very small.",
                "Be afraid. Go back to Egypt now."
              ],
              "answer": "Do not be afraid. The Lord will fight for you.",
              "pt": "Não tenham medo. O Senhor lutará por vocês.",
              "intent": "Acalme o povo e diga quem vai lutar"
            },
            {
              "who": "povo",
              "en": "The sea is in front of us! Where can we go?",
              "pt": "O mar está na nossa frente! Para onde podemos ir?",
              "mood": "urgente"
            },
            {
              "who": "you",
              "options": [
                "Through the sea, on dry ground. Let's go!",
                "Back to Egypt, to the king. Let's go!",
                "Into the chariots, with the army. Let's go!"
              ],
              "answer": "Through the sea, on dry ground. Let's go!",
              "pt": "Pelo meio do mar, em chão seco. Vamos!",
              "intent": "Diga por onde o povo vai passar",
              "speak": true
            }
          ]
        },
        "quiz": {
          "q": "Who made the sea dry?",
          "options": [
            "The Lord, with the wind",
            "Moses, with his own hand",
            "The army, with the chariots"
          ],
          "answer": "The Lord, with the wind",
          "explain": "Moisés estendeu a mão, mas foi o Senhor quem fez o mar recuar com um forte vento leste a noite toda (Êxodo 14:21)."
        },
        "fact": {
          "pt": "Miriã, irmã de Moisés e Arão, é chamada de profetisa: ela pegou um tamborim, e todas as mulheres saíram atrás dela com tamborins e danças (Êxodo 15:20).",
          "ref": "Êxodo 15:20"
        },
        "v": 2
      },
      {
        "id": "u3r",
        "title": "Revisão",
        "review": true,
        "checkpoint": true
      }
    ]
  },
  {
    "id": "u4",
    "title": "Davi, o pastor e o rei",
    "subtitle": "1 Samuel 16-17; 2 Samuel 22; Salmo 23",
    "icon": "🎵",
    "face": "davi",
    "color": "#ff4b4b",
    "level": "A1.2",
    "v": 2,
    "lessons": [
      {
        "id": "u4l1",
        "title": "O pastor escolhido",
        "ref": "1 Samuel 16:1-23",
        "level": "A1.2",
        "narrator": "davi",
        "guests": [
          "voice",
          "samuel",
          "jesse",
          "saul"
        ],
        "names": [
          {
            "en": "the Lord",
            "pt": "o Senhor"
          },
          {
            "en": "Samuel",
            "pt": "Samuel",
            "note": "profeta de Israel; ungiu Saul e depois Davi"
          },
          {
            "en": "Jesse",
            "pt": "Jessé",
            "note": "pai de Davi, de Belém"
          },
          {
            "en": "David",
            "pt": "Davi",
            "note": "o caçula de Jessé; pastor de ovelhas"
          },
          {
            "en": "Saul",
            "pt": "Saul",
            "note": "o primeiro rei de Israel"
          },
          {
            "en": "Bethlehem",
            "pt": "Belém"
          }
        ],
        "hints": {
          "oldest": "mais velho",
          "face": "rosto",
          "anointed": "ungiu",
          "well": "bem",
          "left": "deixou"
        },
        "tips": [
          {
            "part": 1,
            "id": "past-irregular",
            "grammar": "past-irregular",
            "title": "took, went, chose: passados sem -ed",
            "body": "Muitos verbos comuns não ganham -ed no passado: a palavra muda. take vira took, go vira went, choose vira chose, see vira saw, come vira came. A forma é a mesma para I, you, he e they: I took, he took.",
            "examples": [
              {
                "en": "Samuel takes the oil",
                "pt": "Samuel pega o azeite"
              },
              {
                "en": "Samuel took the oil",
                "pt": "Samuel pegou o azeite"
              }
            ],
            "contrast": {
              "a": "I choose a king",
              "b": "I chose a king",
              "note": "choose = escolho (agora); chose = escolhi (passado)"
            }
          },
          {
            "part": 2,
            "id": "possessives",
            "grammar": "possessives",
            "title": "my, your, his: de quem é?",
            "body": "Para dizer de quem é algo, use my (meu, minha), your (seu, sua, de você), his (dele) e her (dela) antes do nome: my son, your sons, his sheep. Eles não mudam no plural: my sons. E o mais novo de todos é the youngest: -est no fim do adjetivo com the na frente.",
            "examples": [
              {
                "en": "My youngest son is with the sheep",
                "pt": "O meu filho mais novo está com as ovelhas"
              },
              {
                "en": "His sheep are in the field",
                "pt": "As ovelhas dele estão no campo"
              }
            ],
            "contrast": {
              "a": "Are all your sons here?",
              "b": "Are all his sons here?",
              "note": "your = seus (de você); his = dele"
            }
          }
        ],
        "vocab": [
          {
            "en": "oil",
            "pt": "azeite",
            "ptAlt": [
              "óleo"
            ],
            "pos": "noun",
            "field": "food",
            "tier": "core",
            "part": 1,
            "icon": "🏺",
            "example": 2,
            "note": "azeite de oliva; o mesmo nome para o óleo"
          },
          {
            "en": "father",
            "pt": "pai",
            "pos": "noun",
            "field": "family",
            "tier": "core",
            "part": 1,
            "icon": "👨",
            "example": 2
          },
          {
            "en": "to look",
            "pt": "olhar",
            "pos": "verb",
            "field": "actions",
            "tier": "core",
            "part": 1,
            "icon": "🧐",
            "example": 3,
            "note": "look at = olhar para"
          },
          {
            "en": "to choose",
            "pt": "escolher",
            "pos": "verb",
            "field": "mind",
            "tier": "core",
            "part": 1,
            "icon": "✅",
            "example": 6,
            "forms": [
              "chose",
              "chosen"
            ]
          },
          {
            "en": "The Lord looks at the heart",
            "pt": "O Senhor olha para o coração",
            "pos": "chunk",
            "field": "speech",
            "tier": "core",
            "part": 1,
            "icon": "🔍",
            "iconic": true,
            "example": 5
          },
          {
            "en": "sheep",
            "pt": "ovelha",
            "ptAlt": [
              "ovelhas"
            ],
            "pos": "noun",
            "field": "animals",
            "tier": "core",
            "part": 2,
            "icon": "🐏",
            "example": 8,
            "plural": "sheep",
            "note": "singular e plural iguais: one sheep, two sheep"
          },
          {
            "en": "harp",
            "pt": "harpa",
            "pos": "noun",
            "field": "objects",
            "tier": "bible",
            "part": 2,
            "icon": "🎻",
            "example": 11
          },
          {
            "en": "to play",
            "pt": "tocar música",
            "ptAlt": [
              "tocar"
            ],
            "pos": "verb",
            "field": "actions",
            "tier": "core",
            "part": 2,
            "icon": "🎹",
            "example": 11,
            "note": "tocar um instrumento; também brincar, jogar"
          },
          {
            "en": "young",
            "pt": "jovem",
            "ptAlt": [
              "novo",
              "nova"
            ],
            "pos": "adj",
            "field": "quality",
            "tier": "core",
            "part": 2,
            "icon": "🧒",
            "example": 8,
            "note": "the youngest = o mais novo, o caçula"
          },
          {
            "en": "Bring him to me",
            "pt": "Tragam ele para mim",
            "ptAlt": [
              "Tragam-no a mim",
              "Traga ele para mim"
            ],
            "pos": "chunk",
            "field": "speech",
            "tier": "core",
            "part": 2,
            "icon": "👋",
            "iconic": true,
            "example": 10
          }
        ],
        "sentences": [
          {
            "en": "The Lord said, \"Take oil. I chose a king\"",
            "pt": "O Senhor disse: \"Pegue azeite. Eu escolhi um rei\"",
            "altPt": [
              "O Senhor disse: \"Leve azeite. Eu escolhi um rei\""
            ]
          },
          {
            "en": "Samuel took the oil to Jesse, a father of eight",
            "pt": "Samuel levou o azeite a Jessé, um pai de oito filhos",
            "altPt": [
              "Samuel levou o azeite para Jessé, pai de oito filhos"
            ]
          },
          {
            "en": "Samuel looked at the oldest son first",
            "pt": "Samuel olhou primeiro para o filho mais velho"
          },
          {
            "en": "The Lord said, \"Do not look at his face\"",
            "pt": "O Senhor disse: \"Não olhe para o rosto dele\"",
            "altPt": [
              "O Senhor disse: \"Não olhe para a aparência dele\""
            ]
          },
          {
            "en": "But the Lord looks at the heart, not the outside",
            "pt": "Mas o Senhor olha para o coração, não para o exterior",
            "alt": [
              "But the Lord looks at the heart, not at the outside",
              "But the Lord looks at the heart, not the outward appearance"
            ],
            "altPt": [
              "Mas o Senhor olha para o coração, não para a aparência",
              "Mas o Senhor olha para o coração, e não para o que está diante dos olhos"
            ]
          },
          {
            "en": "But the Lord did not choose the father's seven sons",
            "pt": "Mas o Senhor não escolheu os sete filhos daquele pai",
            "altPt": [
              "Mas o Senhor não escolheu os sete filhos do pai"
            ]
          },
          {
            "en": "Samuel asked, \"Are all your sons here?\"",
            "pt": "Samuel perguntou: \"Todos os seus filhos estão aqui?\"",
            "alt": [
              "Samuel asked, \"Are all your children here?\""
            ],
            "altPt": [
              "Samuel perguntou: \"Estão aqui todos os seus filhos?\""
            ]
          },
          {
            "en": "Jesse said, \"My youngest son is with the sheep\"",
            "pt": "Jessé disse: \"O meu filho mais novo está com as ovelhas\"",
            "altPt": [
              "Jessé disse: \"O meu caçula está com as ovelhas\""
            ]
          },
          {
            "en": "Samuel anointed the youngest son with oil",
            "pt": "Samuel ungiu o filho mais novo com azeite",
            "altPt": [
              "Samuel ungiu o caçula com azeite"
            ]
          },
          {
            "en": "Saul was not well. He said, \"Bring him to me\"",
            "pt": "Saul não estava bem. Ele disse: \"Tragam ele para mim\"",
            "altPt": [
              "Saul não estava bem. Ele disse: \"Tragam-no a mim\""
            ]
          },
          {
            "en": "David left the sheep and played the harp for Saul",
            "pt": "Davi deixou as ovelhas e tocou harpa para Saul",
            "altPt": [
              "Davi deixou as ovelhas e tocou a harpa para Saul"
            ]
          },
          {
            "en": "Was Saul well when David played the harp? Yes",
            "pt": "Saul ficava bem quando Davi tocava harpa? Sim"
          }
        ],
        "beats": [
          {
            "order": 1,
            "en": "The Lord said, \"Take oil. I chose a king\"",
            "pt": "O Senhor disse: \"Pegue azeite. Eu escolhi um rei\"",
            "altPt": [
              "O Senhor disse: \"Leve azeite. Eu escolhi um rei\""
            ],
            "kind": "quote",
            "fact": true,
            "speaker": "voice"
          },
          {
            "order": 2,
            "en": "Samuel took the oil to Jesse, a father of eight",
            "pt": "Samuel levou o azeite a Jessé, um pai de oito filhos",
            "altPt": [
              "Samuel levou o azeite para Jessé, pai de oito filhos"
            ],
            "kind": "statement",
            "fact": true,
            "gap": {
              "word": "took",
              "kind": "grammar",
              "options": [
                "took",
                "take",
                "takes"
              ]
            },
            "grammar": "past-irregular"
          },
          {
            "order": 3,
            "en": "Samuel looked at the oldest son first",
            "pt": "Samuel olhou primeiro para o filho mais velho",
            "kind": "statement",
            "fact": true
          },
          {
            "order": 4,
            "en": "The Lord said, \"Do not look at his face\"",
            "pt": "O Senhor disse: \"Não olhe para o rosto dele\"",
            "altPt": [
              "O Senhor disse: \"Não olhe para a aparência dele\""
            ],
            "kind": "negative",
            "fact": true,
            "speaker": "voice"
          },
          {
            "order": 5,
            "en": "But the Lord looks at the heart, not the outside",
            "pt": "Mas o Senhor olha para o coração, não para o exterior",
            "alt": [
              "But the Lord looks at the heart, not at the outside",
              "But the Lord looks at the heart, not the outward appearance"
            ],
            "altPt": [
              "Mas o Senhor olha para o coração, não para a aparência",
              "Mas o Senhor olha para o coração, e não para o que está diante dos olhos"
            ],
            "kind": "negative",
            "fact": true,
            "iconic": true
          },
          {
            "order": 6,
            "en": "But the Lord did not choose the father's seven sons",
            "pt": "Mas o Senhor não escolheu os sete filhos daquele pai",
            "altPt": [
              "Mas o Senhor não escolheu os sete filhos do pai"
            ],
            "kind": "negative",
            "fact": true
          },
          {
            "order": 7,
            "en": "Samuel asked, \"Are all your sons here?\"",
            "pt": "Samuel perguntou: \"Todos os seus filhos estão aqui?\"",
            "alt": [
              "Samuel asked, \"Are all your children here?\""
            ],
            "altPt": [
              "Samuel perguntou: \"Estão aqui todos os seus filhos?\""
            ],
            "kind": "question",
            "fact": true,
            "speaker": "samuel"
          },
          {
            "order": 8,
            "en": "Jesse said, \"My youngest son is with the sheep\"",
            "pt": "Jessé disse: \"O meu filho mais novo está com as ovelhas\"",
            "altPt": [
              "Jessé disse: \"O meu caçula está com as ovelhas\""
            ],
            "kind": "quote",
            "fact": true,
            "speaker": "jesse",
            "gap": {
              "word": "My",
              "kind": "grammar",
              "options": [
                "My",
                "Your",
                "His"
              ]
            },
            "grammar": "possessives"
          },
          {
            "order": 9,
            "en": "Samuel anointed the youngest son with oil",
            "pt": "Samuel ungiu o filho mais novo com azeite",
            "altPt": [
              "Samuel ungiu o caçula com azeite"
            ],
            "kind": "statement",
            "fact": true
          },
          {
            "order": 10,
            "en": "Saul was not well. He said, \"Bring him to me\"",
            "pt": "Saul não estava bem. Ele disse: \"Tragam ele para mim\"",
            "altPt": [
              "Saul não estava bem. Ele disse: \"Tragam-no a mim\""
            ],
            "kind": "negative",
            "fact": true,
            "speaker": "saul"
          },
          {
            "order": 11,
            "en": "David left the sheep and played the harp for Saul",
            "pt": "Davi deixou as ovelhas e tocou harpa para Saul",
            "altPt": [
              "Davi deixou as ovelhas e tocou a harpa para Saul"
            ],
            "kind": "statement",
            "fact": true,
            "gap": {
              "word": "harp",
              "kind": "lexical",
              "options": [
                "harp",
                "sheep",
                "oil"
              ]
            }
          },
          {
            "order": 12,
            "en": "Was Saul well when David played the harp? Yes",
            "pt": "Saul ficava bem quando Davi tocava harpa? Sim",
            "kind": "question",
            "fact": true
          }
        ],
        "contrast": [
          {
            "a": "Samuel took the oil to Jesse, a father of eight",
            "b": "Samuel takes the oil to Jesse, a father of eight",
            "note": "took = levou (passado irregular); takes = leva (Dica 1)"
          },
          {
            "a": "Jesse said, \"My youngest son is with the sheep\"",
            "b": "Jesse said, \"His youngest son is with the sheep\"",
            "note": "my = meu; his = dele (Dica 2)"
          }
        ],
        "verse": {
          "text": "Man looks at the outward appearance, but the Lord looks at the heart.",
          "classic": "Man looketh on the outward appearance, but the LORD looketh on the heart.",
          "pt": "As pessoas olham para a aparência, mas o Senhor olha para o coração.",
          "classicPt": "Pois o homem vê o que está diante dos olhos, porém o Senhor olha para o coração.",
          "ref": "1 Samuel 16:7",
          "blank": "heart",
          "options": [
            "heart",
            "face",
            "hand",
            "head"
          ],
          "blanks": [
            {
              "word": "heart",
              "options": [
                "heart",
                "face",
                "hand",
                "head"
              ]
            },
            {
              "word": "appearance",
              "options": [
                "appearance",
                "family",
                "house",
                "work"
              ]
            }
          ]
        },
        "reading": {
          "text": "Samuel took oil and went to Bethlehem. Seven sons of Jesse came to him, but the Lord did not choose them. Samuel asked, \"Are all your sons here?\" Jesse said, \"My youngest son is with the sheep.\" Samuel anointed him with oil, and later David played the harp for King Saul.",
          "pt": "Samuel pegou azeite e foi a Belém. Sete filhos de Jessé vieram até ele, mas o Senhor não os escolheu. Samuel perguntou: \"Todos os seus filhos estão aqui?\" Jessé disse: \"O meu filho mais novo está com as ovelhas.\" Samuel o ungiu com azeite, e mais tarde Davi tocou harpa para o rei Saul.",
          "q": "Where was the youngest son when Samuel came?",
          "options": [
            "Out with the animals",
            "At home with his father",
            "At the house of the king"
          ],
          "answer": "Out with the animals",
          "questions": [
            {
              "kind": "literal",
              "q": "Where was the youngest son when Samuel came?",
              "qPt": "Onde estava o filho mais novo quando Samuel chegou?",
              "options": [
                "Out with the animals",
                "At home with his father",
                "At the house of the king"
              ],
              "answer": "Out with the animals"
            },
            {
              "kind": "inference",
              "q": "Why did the Lord not choose the seven older sons?",
              "qPt": "Por que o Senhor não escolheu os sete filhos mais velhos?",
              "options": [
                "Because he looks at the heart, not at the outside",
                "Because they were the sons of Jesse",
                "Because they were too young to be king"
              ],
              "answer": "Because he looks at the heart, not at the outside",
              "explain": "O Senhor disse a Samuel que não vê como o homem vê: o homem olha para a aparência, mas o Senhor olha para o coração (1 Samuel 16:7)."
            }
          ]
        },
        "dialogue": {
          "line": "David, Samuel chose you, not your brothers. Why?",
          "pt": "Davi, Samuel escolheu você, não os seus irmãos. Por quê?",
          "options": [
            "I don't know, Father. The Lord looks at the heart.",
            "I don't know, Father. The Lord looks at the face.",
            "I know, Father. I am the oldest son."
          ],
          "answer": "I don't know, Father. The Lord looks at the heart.",
          "answerPt": "Não sei, pai. O Senhor olha para o coração."
        },
        "conversation": {
          "with": "jesse",
          "turns": [
            {
              "who": "jesse",
              "en": "David, Samuel chose you, not your brothers. Why?",
              "pt": "Davi, Samuel escolheu você, não os seus irmãos. Por quê?",
              "mood": "surpreso"
            },
            {
              "who": "you",
              "options": [
                "I don't know, Father. The Lord looks at the heart.",
                "I don't know, Father. The Lord looks at the face.",
                "I know, Father. I am the oldest son."
              ],
              "answer": "I don't know, Father. The Lord looks at the heart.",
              "pt": "Não sei, pai. O Senhor olha para o coração.",
              "intent": "Diga para onde o Senhor olha"
            },
            {
              "who": "jesse",
              "en": "Now King Saul wants you. Take your harp and go.",
              "pt": "Agora o rei Saul quer você. Pegue a sua harpa e vá.",
              "mood": "urgente"
            },
            {
              "who": "you",
              "options": [
                "Yes, Father. I can play for the king.",
                "No, Father. I can play for the sheep.",
                "Yes, Father. I can fight for the king."
              ],
              "answer": "Yes, Father. I can play for the king.",
              "pt": "Sim, pai. Eu posso tocar para o rei.",
              "intent": "Aceite e diga o que você vai fazer na casa do rei",
              "speak": true
            }
          ]
        },
        "quiz": {
          "q": "Why did the Lord not choose the seven older sons?",
          "options": [
            "Because he looks at the heart, not at the outside",
            "Because they were the sons of Jesse",
            "Because they were too young to be king"
          ],
          "answer": "Because he looks at the heart, not at the outside",
          "explain": "O Senhor disse a Samuel que não vê como o homem vê: o homem olha para a aparência, mas o Senhor olha para o coração (1 Samuel 16:7)."
        },
        "fact": {
          "pt": "Davi era o caçula de oito irmãos (1 Samuel 17:12). Quando Samuel chegou a Belém, ninguém o chamou para o sacrifício: ele estava no campo, cuidando das ovelhas, e Samuel não quis se sentar até que ele viesse (1 Samuel 16:11).",
          "ref": "1 Samuel 16:11"
        },
        "v": 2
      },
      {
        "id": "u4l2",
        "title": "Davi e Golias",
        "ref": "1 Samuel 17:4-51",
        "level": "A1.2",
        "narrator": "davi",
        "guests": [
          "goliath",
          "saul"
        ],
        "names": [
          {
            "en": "the Lord",
            "pt": "o Senhor"
          },
          {
            "en": "David",
            "pt": "Davi"
          },
          {
            "en": "Saul",
            "pt": "Saul",
            "note": "o rei de Israel"
          },
          {
            "en": "Goliath",
            "pt": "Golias",
            "note": "o gigante filisteu de Gate"
          },
          {
            "en": "Gath",
            "pt": "Gate",
            "note": "cidade dos filisteus"
          },
          {
            "en": "Israel",
            "pt": "Israel",
            "note": "o povo de Deus"
          }
        ],
        "hints": {
          "ran": "correram, fugiram",
          "lion": "leão",
          "dog": "cachorro",
          "threw": "atirou, lançou",
          "name": "nome"
        },
        "tips": [
          {
            "part": 1,
            "id": "comparatives",
            "grammar": "comparatives",
            "title": "taller, the tallest: comparar",
            "body": "Para comparar duas pessoas, acrescente -er ao adjetivo curto e use than: The giant was taller than Saul. Para dizer que é o maior de todos, use the e -est: the tallest man. Assim: tall, taller, the tallest; young, younger, the youngest; old, older, the oldest.",
            "examples": [
              {
                "en": "Saul was tall",
                "pt": "Saul era alto"
              },
              {
                "en": "The giant was taller than Saul",
                "pt": "O gigante era mais alto que Saul"
              }
            ],
            "contrast": {
              "a": "The giant was taller than Saul",
              "b": "The giant was the tallest man",
              "note": "taller than = mais alto que (dois); the tallest = o mais alto (de todos)"
            }
          },
          {
            "part": 2,
            "id": "present-simple",
            "grammar": "present-simple",
            "title": "You come, I come: o presente com I e you",
            "body": "No presente simples, com I, you, we e they o verbo fica na forma básica, sem -s: You come with a sword. I come in the name of the Lord. Só com he, she e it o verbo ganha -s: He comes with a sword. Para negar com I e you, use do not: I do not come with a sword.",
            "examples": [
              {
                "en": "You come to me with a sword",
                "pt": "Você vem a mim com uma espada"
              },
              {
                "en": "I come to you in the name of the Lord",
                "pt": "Eu venho a você em nome do Senhor"
              }
            ],
            "contrast": {
              "a": "You come with a sword",
              "b": "He comes with a sword",
              "note": "I e you: come; he, she e it: comes"
            }
          }
        ],
        "vocab": [
          {
            "en": "giant",
            "pt": "gigante",
            "pos": "noun",
            "field": "people",
            "tier": "core",
            "part": 1,
            "icon": "🏋️",
            "example": 1
          },
          {
            "en": "tall",
            "pt": "alto",
            "ptAlt": [
              "alta"
            ],
            "pos": "adj",
            "field": "quality",
            "tier": "core",
            "part": 1,
            "icon": "🦒",
            "example": 1,
            "note": "altura de pessoa ou coisa; o som alto é loud"
          },
          {
            "en": "to kill",
            "pt": "matar",
            "pos": "verb",
            "field": "actions",
            "tier": "core",
            "part": 1,
            "icon": "💀",
            "example": 6
          },
          {
            "en": "bear",
            "pt": "urso",
            "pos": "noun",
            "field": "animals",
            "tier": "core",
            "part": 1,
            "icon": "🐻",
            "example": 6
          },
          {
            "en": "I am not afraid",
            "pt": "Eu não tenho medo",
            "ptAlt": [
              "Não tenho medo",
              "Eu não estou com medo"
            ],
            "pos": "chunk",
            "field": "speech",
            "tier": "core",
            "part": 1,
            "icon": "😎",
            "example": 5
          },
          {
            "en": "stone",
            "pt": "pedra",
            "pos": "noun",
            "field": "nature",
            "tier": "core",
            "part": 2,
            "icon": "🔘",
            "example": 7
          },
          {
            "en": "sling",
            "pt": "funda",
            "ptAlt": [
              "estilingue"
            ],
            "pos": "noun",
            "field": "objects",
            "tier": "bible",
            "part": 2,
            "icon": "🎯",
            "example": 7,
            "note": "tira de couro para lançar pedras"
          },
          {
            "en": "sword",
            "pt": "espada",
            "pos": "noun",
            "field": "objects",
            "tier": "core",
            "part": 2,
            "icon": "🗡️",
            "example": 9
          },
          {
            "en": "to fall",
            "pt": "cair",
            "pos": "verb",
            "field": "actions",
            "tier": "core",
            "part": 2,
            "icon": "🍂",
            "example": 12,
            "forms": [
              "fell",
              "fallen"
            ]
          },
          {
            "en": "The battle is the Lord's",
            "pt": "A batalha é do Senhor",
            "ptAlt": [
              "A guerra é do Senhor",
              "Do Senhor é a guerra"
            ],
            "pos": "chunk",
            "field": "speech",
            "tier": "core",
            "part": 2,
            "icon": "🎺",
            "iconic": true,
            "example": 10
          }
        ],
        "sentences": [
          {
            "en": "Goliath was a giant from Gath. He was very tall",
            "pt": "Golias era um gigante de Gate. Ele era muito alto"
          },
          {
            "en": "Who was taller, Saul or the giant? The giant",
            "pt": "Quem era mais alto, Saul ou o gigante? O gigante"
          },
          {
            "en": "For forty days the giant said, \"Choose a man!\"",
            "pt": "Durante quarenta dias o gigante dizia: \"Escolham um homem!\"",
            "altPt": [
              "Por quarenta dias o gigante dizia: \"Escolham um homem!\""
            ]
          },
          {
            "en": "The men of Israel ran from him. They were afraid",
            "pt": "Os homens de Israel fugiram dele. Eles tinham medo",
            "altPt": [
              "Os homens de Israel correram dele. Eles estavam com medo"
            ]
          },
          {
            "en": "\"I am not afraid. I killed a bear,\" said David",
            "pt": "\"Eu não tenho medo. Eu matei um urso\", disse Davi",
            "altPt": [
              "\"Não tenho medo. Matei um urso\", disse Davi"
            ]
          },
          {
            "en": "A lion and a bear came, and David killed them",
            "pt": "Um leão e um urso vieram, e Davi os matou",
            "altPt": [
              "Um leão e um urso vieram, e Davi matou os dois"
            ]
          },
          {
            "en": "David took five stones and his sling, not a sword",
            "pt": "Davi pegou cinco pedras e a sua funda, não uma espada",
            "altPt": [
              "Davi pegou cinco pedras e a funda, e não uma espada"
            ]
          },
          {
            "en": "The giant looked at young David. \"Am I a dog?\"",
            "pt": "O gigante olhou para o jovem Davi: \"Eu sou um cachorro?\"",
            "altPt": [
              "O gigante olhou para o jovem Davi: \"Sou eu algum cão?\""
            ]
          },
          {
            "en": "David said, \"You come to me with a sword\"",
            "pt": "Davi disse: \"Você vem a mim com uma espada\"",
            "altPt": [
              "Davi disse: \"Você vem contra mim com espada\""
            ]
          },
          {
            "en": "David said, \"The battle is the Lord's\"",
            "pt": "Davi disse: \"A batalha é do Senhor\"",
            "altPt": [
              "Davi disse: \"Do Senhor é a guerra\"",
              "Davi disse: \"A guerra é do Senhor\""
            ]
          },
          {
            "en": "David threw a stone with his sling. The giant fell",
            "pt": "Davi atirou uma pedra com a funda. O gigante caiu",
            "altPt": [
              "Davi lançou uma pedra com a sua funda. O gigante caiu"
            ]
          },
          {
            "en": "The giant fell down, and David took the giant's sword",
            "pt": "O gigante caiu no chão, e Davi pegou a espada do gigante",
            "altPt": [
              "O gigante caiu, e Davi tomou a espada do gigante"
            ]
          }
        ],
        "beats": [
          {
            "order": 1,
            "en": "Goliath was a giant from Gath. He was very tall",
            "pt": "Golias era um gigante de Gate. Ele era muito alto",
            "kind": "statement",
            "fact": true
          },
          {
            "order": 2,
            "en": "Who was taller, Saul or the giant? The giant",
            "pt": "Quem era mais alto, Saul ou o gigante? O gigante",
            "kind": "question",
            "fact": true,
            "gap": {
              "word": "taller",
              "kind": "grammar",
              "options": [
                "taller",
                "tall",
                "tallest"
              ]
            },
            "grammar": "comparatives"
          },
          {
            "order": 3,
            "en": "For forty days the giant said, \"Choose a man!\"",
            "pt": "Durante quarenta dias o gigante dizia: \"Escolham um homem!\"",
            "altPt": [
              "Por quarenta dias o gigante dizia: \"Escolham um homem!\""
            ],
            "kind": "quote",
            "fact": true,
            "speaker": "goliath"
          },
          {
            "order": 4,
            "en": "The men of Israel ran from him. They were afraid",
            "pt": "Os homens de Israel fugiram dele. Eles tinham medo",
            "altPt": [
              "Os homens de Israel correram dele. Eles estavam com medo"
            ],
            "kind": "statement",
            "fact": true
          },
          {
            "order": 5,
            "en": "\"I am not afraid. I killed a bear,\" said David",
            "pt": "\"Eu não tenho medo. Eu matei um urso\", disse Davi",
            "altPt": [
              "\"Não tenho medo. Matei um urso\", disse Davi"
            ],
            "kind": "first-person",
            "fact": true,
            "speaker": "davi"
          },
          {
            "order": 6,
            "en": "A lion and a bear came, and David killed them",
            "pt": "Um leão e um urso vieram, e Davi os matou",
            "altPt": [
              "Um leão e um urso vieram, e Davi matou os dois"
            ],
            "kind": "statement",
            "fact": true,
            "gap": {
              "word": "bear",
              "kind": "lexical",
              "options": [
                "bear",
                "giant",
                "sheep"
              ]
            }
          },
          {
            "order": 7,
            "en": "David took five stones and his sling, not a sword",
            "pt": "Davi pegou cinco pedras e a sua funda, não uma espada",
            "altPt": [
              "Davi pegou cinco pedras e a funda, e não uma espada"
            ],
            "kind": "negative",
            "fact": true
          },
          {
            "order": 8,
            "en": "The giant looked at young David. \"Am I a dog?\"",
            "pt": "O gigante olhou para o jovem Davi: \"Eu sou um cachorro?\"",
            "altPt": [
              "O gigante olhou para o jovem Davi: \"Sou eu algum cão?\""
            ],
            "kind": "question",
            "fact": true
          },
          {
            "order": 9,
            "en": "David said, \"You come to me with a sword\"",
            "pt": "Davi disse: \"Você vem a mim com uma espada\"",
            "altPt": [
              "Davi disse: \"Você vem contra mim com espada\""
            ],
            "kind": "quote",
            "fact": true,
            "speaker": "davi",
            "gap": {
              "word": "come",
              "kind": "grammar",
              "options": [
                "come",
                "comes",
                "coming"
              ]
            },
            "grammar": "present-simple"
          },
          {
            "order": 10,
            "en": "David said, \"The battle is the Lord's\"",
            "pt": "Davi disse: \"A batalha é do Senhor\"",
            "altPt": [
              "Davi disse: \"Do Senhor é a guerra\"",
              "Davi disse: \"A guerra é do Senhor\""
            ],
            "kind": "quote",
            "fact": true,
            "iconic": true,
            "speaker": "davi"
          },
          {
            "order": 11,
            "en": "David threw a stone with his sling. The giant fell",
            "pt": "Davi atirou uma pedra com a funda. O gigante caiu",
            "altPt": [
              "Davi lançou uma pedra com a sua funda. O gigante caiu"
            ],
            "kind": "statement",
            "fact": true
          },
          {
            "order": 12,
            "en": "The giant fell down, and David took the giant's sword",
            "pt": "O gigante caiu no chão, e Davi pegou a espada do gigante",
            "altPt": [
              "O gigante caiu, e Davi tomou a espada do gigante"
            ],
            "kind": "statement",
            "fact": true
          }
        ],
        "contrast": [
          {
            "a": "Goliath was a giant from Gath. He was very tall",
            "b": "Goliath was a giant from Gath. He was the tallest",
            "note": "very tall = muito alto; the tallest = o mais alto de todos (Dica 1)"
          },
          {
            "a": "David said, \"You come to me with a sword\"",
            "b": "David said, \"I come to you with a sling\"",
            "note": "You come / I come: com I e you o verbo fica sem -s (Dica 2)"
          }
        ],
        "verse": {
          "text": "The battle is the Lord's, and he will give you into our hand.",
          "classic": "For the battle is the LORD's, and he will give you into our hands.",
          "pt": "A batalha é do Senhor, e ele vai entregar vocês nas nossas mãos.",
          "classicPt": "Porque do Senhor é a guerra, e ele vos entregará na nossa mão.",
          "ref": "1 Samuel 17:47",
          "blank": "battle",
          "options": [
            "battle",
            "army",
            "sword",
            "stone"
          ],
          "blanks": [
            {
              "word": "battle",
              "options": [
                "battle",
                "army",
                "sword",
                "stone"
              ]
            },
            {
              "word": "hand",
              "options": [
                "hand",
                "head",
                "heart",
                "face"
              ]
            },
            {
              "word": "give",
              "options": [
                "give",
                "take",
                "send",
                "put"
              ]
            }
          ]
        },
        "reading": {
          "text": "Goliath was a very tall giant from Gath, and for forty days he came out and said, \"Choose a man and send him to me!\" The men of Israel were afraid, but David said to Saul, \"I am not afraid. I killed a lion and a bear.\" David did not take Saul's sword. He took his sling and five stones, and he said to the giant, \"You come with a sword, but I come in the name of the Lord.\"",
          "pt": "Golias era um gigante muito alto de Gate, e durante quarenta dias ele saía e dizia: \"Escolham um homem e mandem ele até mim!\" Os homens de Israel tinham medo, mas Davi disse a Saul: \"Eu não tenho medo. Eu matei um leão e um urso.\" Davi não pegou a espada de Saul. Ele pegou a sua funda e cinco pedras, e disse ao gigante: \"Você vem com uma espada, mas eu venho em nome do Senhor.\"",
          "q": "What did David take to fight the giant?",
          "options": [
            "Five small stones and a sling",
            "The sword and the armor of King Saul",
            "Bread and cheese for his brothers"
          ],
          "answer": "Five small stones and a sling",
          "questions": [
            {
              "kind": "literal",
              "q": "What did David take to fight the giant?",
              "qPt": "O que Davi levou para lutar com o gigante?",
              "options": [
                "Five small stones and a sling",
                "The sword and the armor of King Saul",
                "Bread and cheese for his brothers"
              ],
              "answer": "Five small stones and a sling"
            },
            {
              "kind": "inference",
              "q": "Why was David not afraid of the giant?",
              "qPt": "Por que Davi não tinha medo do gigante?",
              "options": [
                "Because the Lord helped him before",
                "Because he was taller than the giant",
                "Because he had the sword of the king"
              ],
              "answer": "Because the Lord helped him before",
              "explain": "Davi lembrou que o Senhor o livrou do leão e do urso e disse que o mesmo Senhor o livraria da mão do gigante (1 Samuel 17:37)."
            }
          ]
        },
        "dialogue": {
          "line": "Am I a dog? You come to me with sticks!",
          "pt": "Eu sou um cachorro? Você vem a mim com paus!",
          "options": [
            "You come with a sword, but I come in the name of the Lord.",
            "You come with a sword, but I come with a bigger sword.",
            "You come with a sword, and I come with my sheep."
          ],
          "answer": "You come with a sword, but I come in the name of the Lord.",
          "answerPt": "Você vem com uma espada, mas eu venho em nome do Senhor."
        },
        "conversation": {
          "with": "goliath",
          "turns": [
            {
              "who": "goliath",
              "en": "Am I a dog? You come to me with sticks!",
              "pt": "Eu sou um cachorro? Você vem a mim com paus!",
              "mood": "irônico"
            },
            {
              "who": "you",
              "options": [
                "You come with a sword, but I come in the name of the Lord.",
                "You come with a sword, but I come with a bigger sword.",
                "You come with a sword, and I come with my sheep."
              ],
              "answer": "You come with a sword, but I come in the name of the Lord.",
              "pt": "Você vem com uma espada, mas eu venho em nome do Senhor.",
              "intent": "Diga em nome de quem você vem"
            },
            {
              "who": "goliath",
              "en": "Come here, boy! I will give you to the birds!",
              "pt": "Venha aqui, garoto! Vou dar você aos pássaros!",
              "mood": "bravo"
            },
            {
              "who": "you",
              "options": [
                "The battle is the Lord's! I am not afraid of you.",
                "The battle is yours! I am very afraid of you.",
                "The battle is mine! I am stronger than you."
              ],
              "answer": "The battle is the Lord's! I am not afraid of you.",
              "pt": "A batalha é do Senhor! Eu não tenho medo de você.",
              "intent": "Diga de quem é a batalha",
              "speak": true
            }
          ]
        },
        "quiz": {
          "q": "Why was David not afraid of the giant?",
          "options": [
            "Because the Lord helped him before",
            "Because he was taller than the giant",
            "Because he had the sword of the king"
          ],
          "answer": "Because the Lord helped him before",
          "explain": "Davi lembrou que o Senhor o livrou do leão e do urso e disse que o mesmo Senhor o livraria da mão do gigante (1 Samuel 17:37)."
        },
        "fact": {
          "pt": "Golias media \"seis côvados e um palmo\" (1 Samuel 17:4), quase três metros de altura. Davi venceu sem espada: o texto diz que \"não havia espada na mão de Davi\" (1 Samuel 17:50).",
          "ref": "1 Samuel 17:4"
        },
        "v": 2
      },
      {
        "id": "u4l3",
        "title": "O rei cantor",
        "ref": "1 Samuel 18:1-4; 19:1; 24:1-12; 2 Samuel 22:1-3, 50; Salmo 23",
        "level": "A1.2",
        "narrator": "davi",
        "guests": [
          "jonatas",
          "saul"
        ],
        "names": [
          {
            "en": "God",
            "pt": "Deus",
            "note": "sempre com maiúscula; os pronomes (he, his) ficam em minúscula"
          },
          {
            "en": "the Lord",
            "pt": "o Senhor"
          },
          {
            "en": "David",
            "pt": "Davi"
          },
          {
            "en": "Jonathan",
            "pt": "Jônatas",
            "note": "filho do rei Saul e amigo de Davi"
          },
          {
            "en": "Saul",
            "pt": "Saul",
            "note": "o rei de Israel"
          }
        ],
        "hints": {
          "gave": "deu",
          "saved": "salvou, livrou",
          "lie": "deitar",
          "pastures": "pastos"
        },
        "tips": [
          {
            "part": 1,
            "id": "will",
            "grammar": "will",
            "title": "will: o que vai acontecer",
            "body": "Para falar do futuro ou de uma decisão, use will antes do verbo na forma básica: I will sing (Eu vou cantar). Para negar, use will not (won't): I will not kill the king. O verbo não muda: I will sing, he will sing, they will sing.",
            "examples": [
              {
                "en": "I will sing to the Lord",
                "pt": "Eu vou cantar ao Senhor"
              },
              {
                "en": "I will not kill the king",
                "pt": "Eu não vou matar o rei"
              }
            ],
            "contrast": {
              "a": "I sing to the Lord",
              "b": "I will sing to the Lord",
              "note": "sem will = agora, sempre; com will = depois, uma decisão"
            }
          },
          {
            "part": 2,
            "id": "no-noun",
            "grammar": "no-noun",
            "title": "no + nome: negar sem not",
            "body": "Em inglês dá para negar colocando no antes do substantivo, sem not e sem do: I fear no evil (Não temo mal nenhum). I lack nothing (Nada me falta). Com not, o verbo precisa de do: I do not fear evil. Nunca junte as duas formas: I do not fear no evil está errado.",
            "examples": [
              {
                "en": "I will fear no evil",
                "pt": "Não vou temer mal nenhum"
              },
              {
                "en": "I lack nothing",
                "pt": "Nada me falta"
              }
            ],
            "contrast": {
              "a": "I fear no evil",
              "b": "I do not fear evil",
              "note": "no + substantivo ou do not + verbo: uma negação só, nunca as duas"
            }
          }
        ],
        "vocab": [
          {
            "en": "friend",
            "pt": "amigo",
            "ptAlt": [
              "amiga"
            ],
            "pos": "noun",
            "field": "people",
            "tier": "core",
            "part": 1,
            "icon": "🧑‍🤝‍🧑",
            "example": 1
          },
          {
            "en": "cave",
            "pt": "caverna",
            "ptAlt": [
              "gruta"
            ],
            "pos": "noun",
            "field": "places",
            "tier": "core",
            "part": 1,
            "icon": "🕳️",
            "example": 4
          },
          {
            "en": "rock",
            "pt": "rocha",
            "ptAlt": [
              "rochedo"
            ],
            "pos": "noun",
            "field": "nature",
            "tier": "core",
            "part": 1,
            "icon": "🗻",
            "example": 5
          },
          {
            "en": "song",
            "pt": "cântico",
            "ptAlt": [
              "canção",
              "música"
            ],
            "pos": "noun",
            "field": "faith",
            "tier": "core",
            "part": 1,
            "icon": "🎵",
            "example": 5
          },
          {
            "en": "I will sing to the Lord",
            "pt": "Eu vou cantar ao Senhor",
            "ptAlt": [
              "Cantarei ao Senhor",
              "Vou cantar ao Senhor"
            ],
            "pos": "chunk",
            "field": "speech",
            "tier": "core",
            "part": 1,
            "icon": "🎙️",
            "example": 6
          },
          {
            "en": "shepherd",
            "pt": "pastor",
            "ptAlt": [
              "pastora"
            ],
            "pos": "noun",
            "field": "work",
            "tier": "core",
            "part": 2,
            "icon": "🧑‍🌾",
            "example": 7,
            "note": "quem cuida das ovelhas"
          },
          {
            "en": "green",
            "pt": "verde",
            "ptAlt": [
              "verdes"
            ],
            "pos": "adj",
            "field": "quality",
            "tier": "core",
            "part": 2,
            "icon": "🟢",
            "example": 8
          },
          {
            "en": "valley",
            "pt": "vale",
            "pos": "noun",
            "field": "places",
            "tier": "core",
            "part": 2,
            "icon": "🌄",
            "example": 10
          },
          {
            "en": "to fear",
            "pt": "temer",
            "ptAlt": [
              "ter medo de"
            ],
            "pos": "verb",
            "field": "feelings",
            "tier": "core",
            "part": 2,
            "icon": "😰",
            "example": 10,
            "note": "afraid = com medo (adjetivo); to fear = temer (verbo)"
          },
          {
            "en": "You are with me",
            "pt": "Você está comigo",
            "ptAlt": [
              "Tu estás comigo",
              "Está comigo"
            ],
            "pos": "chunk",
            "field": "speech",
            "tier": "core",
            "part": 2,
            "icon": "👫",
            "iconic": true,
            "example": 12
          }
        ],
        "sentences": [
          {
            "en": "Jonathan loved David and was his friend",
            "pt": "Jônatas amava Davi e era seu amigo",
            "altPt": [
              "Jônatas amava Davi e era amigo dele"
            ]
          },
          {
            "en": "Jonathan gave his sword to his friend",
            "pt": "Jônatas deu a sua espada ao amigo",
            "altPt": [
              "Jônatas deu a espada dele ao seu amigo"
            ]
          },
          {
            "en": "David hid from Saul in a cave in the rocks",
            "pt": "Davi se escondeu de Saul numa caverna nas rochas",
            "altPt": [
              "Davi se escondeu de Saul em uma caverna entre as rochas"
            ]
          },
          {
            "en": "In the cave, David said, \"I will not kill Saul\"",
            "pt": "Na caverna, Davi disse: \"Eu não vou matar Saul\"",
            "altPt": [
              "Na caverna, Davi disse: \"Não vou matar Saul\""
            ]
          },
          {
            "en": "David sang this song, \"The Lord is my rock\"",
            "pt": "Davi cantou este cântico: \"O Senhor é a minha rocha\"",
            "altPt": [
              "Davi cantou esta canção: \"O Senhor é a minha rocha\"",
              "Davi cantou este cântico: \"O Senhor é o meu rochedo\""
            ]
          },
          {
            "en": "The song said, \"I will sing to the Lord\"",
            "pt": "O cântico dizia: \"Eu vou cantar ao Senhor\"",
            "altPt": [
              "A canção dizia: \"Cantarei ao Senhor\""
            ]
          },
          {
            "en": "David also sang, \"The Lord is my shepherd\"",
            "pt": "Davi também cantou: \"O Senhor é o meu pastor\""
          },
          {
            "en": "My shepherd makes me lie down in green pastures",
            "pt": "O meu pastor me faz deitar em pastos verdes",
            "altPt": [
              "Deitar-me faz em verdes pastos",
              "O meu pastor me faz descansar em pastos verdes"
            ]
          },
          {
            "en": "Where do I rest? In green pastures",
            "pt": "Onde eu descanso? Em pastos verdes"
          },
          {
            "en": "In the dark valley, I will fear no evil",
            "pt": "No vale escuro, não vou temer mal nenhum",
            "altPt": [
              "Ainda que eu ande pelo vale da sombra da morte, não temerei mal algum",
              "No vale escuro, não temerei mal nenhum"
            ]
          },
          {
            "en": "Did David fear the valley? No, God was with him",
            "pt": "Davi temeu o vale? Não, Deus estava com ele"
          },
          {
            "en": "David sang to the Lord, \"You are with me\"",
            "pt": "Davi cantou ao Senhor: \"Você está comigo\"",
            "altPt": [
              "Davi cantou ao Senhor: \"Tu estás comigo\""
            ]
          }
        ],
        "beats": [
          {
            "order": 1,
            "en": "Jonathan loved David and was his friend",
            "pt": "Jônatas amava Davi e era seu amigo",
            "altPt": [
              "Jônatas amava Davi e era amigo dele"
            ],
            "kind": "statement",
            "fact": true
          },
          {
            "order": 2,
            "en": "Jonathan gave his sword to his friend",
            "pt": "Jônatas deu a sua espada ao amigo",
            "altPt": [
              "Jônatas deu a espada dele ao seu amigo"
            ],
            "kind": "statement",
            "fact": true,
            "gap": {
              "word": "friend",
              "kind": "lexical",
              "options": [
                "friend",
                "rock",
                "cave"
              ]
            }
          },
          {
            "order": 3,
            "en": "David hid from Saul in a cave in the rocks",
            "pt": "Davi se escondeu de Saul numa caverna nas rochas",
            "altPt": [
              "Davi se escondeu de Saul em uma caverna entre as rochas"
            ],
            "kind": "statement",
            "fact": true
          },
          {
            "order": 4,
            "en": "In the cave, David said, \"I will not kill Saul\"",
            "pt": "Na caverna, Davi disse: \"Eu não vou matar Saul\"",
            "altPt": [
              "Na caverna, Davi disse: \"Não vou matar Saul\""
            ],
            "kind": "negative",
            "fact": true,
            "speaker": "davi"
          },
          {
            "order": 5,
            "en": "David sang this song, \"The Lord is my rock\"",
            "pt": "Davi cantou este cântico: \"O Senhor é a minha rocha\"",
            "altPt": [
              "Davi cantou esta canção: \"O Senhor é a minha rocha\"",
              "Davi cantou este cântico: \"O Senhor é o meu rochedo\""
            ],
            "kind": "quote",
            "fact": true,
            "iconic": true,
            "speaker": "davi"
          },
          {
            "order": 6,
            "en": "The song said, \"I will sing to the Lord\"",
            "pt": "O cântico dizia: \"Eu vou cantar ao Senhor\"",
            "altPt": [
              "A canção dizia: \"Cantarei ao Senhor\""
            ],
            "kind": "first-person",
            "fact": true,
            "speaker": "davi",
            "gap": {
              "word": "will",
              "kind": "grammar",
              "options": [
                "will",
                "can",
                "must"
              ]
            },
            "grammar": "will"
          },
          {
            "order": 7,
            "en": "David also sang, \"The Lord is my shepherd\"",
            "pt": "Davi também cantou: \"O Senhor é o meu pastor\"",
            "kind": "quote",
            "fact": true,
            "iconic": true,
            "speaker": "davi"
          },
          {
            "order": 8,
            "en": "My shepherd makes me lie down in green pastures",
            "pt": "O meu pastor me faz deitar em pastos verdes",
            "altPt": [
              "Deitar-me faz em verdes pastos",
              "O meu pastor me faz descansar em pastos verdes"
            ],
            "kind": "first-person",
            "fact": true,
            "speaker": "davi"
          },
          {
            "order": 9,
            "en": "Where do I rest? In green pastures",
            "pt": "Onde eu descanso? Em pastos verdes",
            "kind": "question",
            "fact": true,
            "speaker": "davi"
          },
          {
            "order": 10,
            "en": "In the dark valley, I will fear no evil",
            "pt": "No vale escuro, não vou temer mal nenhum",
            "altPt": [
              "Ainda que eu ande pelo vale da sombra da morte, não temerei mal algum",
              "No vale escuro, não temerei mal nenhum"
            ],
            "kind": "negative",
            "fact": true,
            "speaker": "davi",
            "gap": {
              "word": "no",
              "kind": "grammar",
              "options": [
                "no",
                "not",
                "never"
              ]
            },
            "grammar": "no-noun"
          },
          {
            "order": 11,
            "en": "Did David fear the valley? No, God was with him",
            "pt": "Davi temeu o vale? Não, Deus estava com ele",
            "kind": "question",
            "fact": true
          },
          {
            "order": 12,
            "en": "David sang to the Lord, \"You are with me\"",
            "pt": "Davi cantou ao Senhor: \"Você está comigo\"",
            "altPt": [
              "Davi cantou ao Senhor: \"Tu estás comigo\""
            ],
            "kind": "quote",
            "fact": true,
            "iconic": true,
            "speaker": "davi"
          }
        ],
        "contrast": [
          {
            "a": "The song said, \"I will sing to the Lord\"",
            "b": "The song said, \"I sing to the Lord\"",
            "note": "will sing = vou cantar (decisão, futuro); sing = canto (Dica 1)"
          },
          {
            "a": "In the dark valley, I will fear no evil",
            "b": "In the dark valley, I do not fear evil",
            "note": "no + substantivo ou do not + verbo: a mesma negação, uma forma só (Dica 2)"
          }
        ],
        "verse": {
          "text": "The Lord is my shepherd: I shall lack nothing.",
          "classic": "The LORD is my shepherd; I shall not want.",
          "pt": "O Senhor é o meu pastor; nada vai me faltar.",
          "classicPt": "O Senhor é o meu pastor; nada me faltará.",
          "ref": "Salmo 23:1",
          "blank": "shepherd",
          "options": [
            "shepherd",
            "father",
            "friend",
            "king"
          ],
          "blanks": [
            {
              "word": "shepherd",
              "options": [
                "shepherd",
                "father",
                "friend",
                "king"
              ]
            },
            {
              "word": "nothing",
              "options": [
                "nothing",
                "everything",
                "something",
                "anything"
              ]
            },
            {
              "word": "lack",
              "options": [
                "lack",
                "have",
                "give",
                "see"
              ]
            }
          ]
        },
        "reading": {
          "text": "Jonathan loved David and gave him his sword. King Saul hated David, but David did not kill him in the cave. He said, \"I will not kill the king.\" Later, David sang, \"The Lord is my rock.\" He also sang, \"The Lord is my shepherd, and you are with me.\"",
          "pt": "Jônatas amava Davi e deu a ele a sua espada. O rei Saul odiava Davi, mas Davi não o matou na caverna. Ele disse: \"Eu não vou matar o rei.\" Mais tarde, Davi cantou: \"O Senhor é a minha rocha.\" Ele também cantou: \"O Senhor é o meu pastor, e você está comigo.\"",
          "q": "What did Jonathan give to David?",
          "options": [
            "The sword that was his",
            "The house of his father",
            "A song for the Lord"
          ],
          "answer": "The sword that was his",
          "questions": [
            {
              "kind": "literal",
              "q": "What did Jonathan give to David?",
              "qPt": "O que Jônatas deu a Davi?",
              "options": [
                "The sword that was his",
                "The house of his father",
                "A song for the Lord"
              ],
              "answer": "The sword that was his"
            },
            {
              "kind": "inference",
              "q": "Why did David not kill Saul in the cave?",
              "qPt": "Por que Davi não matou Saul na caverna?",
              "options": [
                "Because the Lord chose Saul as king",
                "Because Jonathan was David's friend",
                "Because David did not have a sword"
              ],
              "answer": "Because the Lord chose Saul as king",
              "explain": "Davi disse aos seus homens que não estenderia a mão contra Saul, porque ele era o ungido do Senhor, o rei que o Senhor escolheu (1 Samuel 24:6, 10)."
            }
          ]
        },
        "dialogue": {
          "line": "David, my father wants to kill you. What will you do?",
          "pt": "Davi, o meu pai quer matar você. O que você vai fazer?",
          "options": [
            "I will not kill the king. The Lord is with me.",
            "I will kill the king. The Lord is with me.",
            "I will not go. My father is with me."
          ],
          "answer": "I will not kill the king. The Lord is with me.",
          "answerPt": "Eu não vou matar o rei. O Senhor está comigo."
        },
        "conversation": {
          "with": "jonatas",
          "turns": [
            {
              "who": "jonatas",
              "en": "David, my father wants to kill you. What will you do?",
              "pt": "Davi, o meu pai quer matar você. O que você vai fazer?",
              "mood": "assustado"
            },
            {
              "who": "you",
              "options": [
                "I will not kill the king. The Lord is with me.",
                "I will kill the king. The Lord is with me.",
                "I will not go. My father is with me."
              ],
              "answer": "I will not kill the king. The Lord is with me.",
              "pt": "Eu não vou matar o rei. O Senhor está comigo.",
              "intent": "Diga o que você não vai fazer e quem está com você"
            },
            {
              "who": "jonatas",
              "en": "You're my friend. Take my sword and go.",
              "pt": "Você é meu amigo. Pegue a minha espada e vá.",
              "mood": "carinhoso"
            },
            {
              "who": "you",
              "options": [
                "Thank you, my friend. I will sing to the Lord.",
                "Thank you, my friend. I will kill the king.",
                "No, my friend. I will take your father's sword."
              ],
              "answer": "Thank you, my friend. I will sing to the Lord.",
              "pt": "Obrigado, meu amigo. Eu vou cantar ao Senhor.",
              "intent": "Agradeça e diga o que você vai fazer",
              "speak": true
            }
          ]
        },
        "quiz": {
          "q": "Why did David not kill Saul in the cave?",
          "options": [
            "Because the Lord chose Saul as king",
            "Because Jonathan was David's friend",
            "Because David did not have a sword"
          ],
          "answer": "Because the Lord chose Saul as king",
          "explain": "Davi disse aos seus homens que não estenderia a mão contra Saul, porque ele era o ungido do Senhor, o rei que o Senhor escolheu (1 Samuel 24:6, 10)."
        },
        "fact": {
          "pt": "Davi tinha trinta anos quando começou a reinar, e reinou quarenta anos (2 Samuel 5:4). O Salmo 23 traz o título \"Salmo de Davi\", e o cântico de 2 Samuel 22 foi cantado por ele no dia em que o Senhor o livrou de todos os seus inimigos e da mão de Saul (2 Samuel 22:1).",
          "ref": "2 Samuel 5:4"
        },
        "v": 2
      },
      {
        "id": "u4r",
        "title": "Revisão",
        "review": true,
        "checkpoint": true
      }
    ]
  },
  {
    "id": "u5",
    "title": "Isaías, o profeta",
    "subtitle": "Isaías 6-9; 36-38",
    "icon": "👑",
    "face": "isaias",
    "color": "#2b70c9",
    "level": "A2.1",
    "v": 2,
    "lessons": [
      {
        "id": "u5l1",
        "title": "Santo, santo, santo",
        "ref": "Isaías 6:1-8",
        "level": "A2.1",
        "narrator": "isaias",
        "guests": [
          "anjo",
          "voice"
        ],
        "names": [
          {
            "en": "Isaiah",
            "pt": "Isaías",
            "note": "o profeta; narra a unidade"
          },
          {
            "en": "Uzziah",
            "pt": "Uzias",
            "note": "rei de Judá; morreu no ano da visão"
          },
          {
            "en": "the Lord",
            "pt": "o Senhor"
          },
          {
            "en": "the Lord of Armies",
            "pt": "o Senhor dos Exércitos",
            "note": "a KJV diz Lord of hosts"
          }
        ],
        "hints": {
          "die": "morrer, morreu",
          "high": "alto",
          "fly": "voar, voava, voavam",
          "call": "clamar, clamavam",
          "unclean": "impuro, impuros",
          "sin": "pecado",
          "voice": "voz"
        },
        "tips": [
          {
            "part": 1,
            "id": "past-see-hear",
            "grammar": "past-see-hear",
            "title": "saw, heard: ver e ouvir no passado",
            "body": "Alguns verbos não ganham -ed no passado: eles mudam de forma. see vira saw (vi, viu) e hear vira heard (ouvi, ouviu). A forma é a mesma para todas as pessoas: I saw, he saw, they saw.",
            "examples": [
              {
                "en": "I see the Lord",
                "pt": "Eu vejo o Senhor"
              },
              {
                "en": "I saw the Lord",
                "pt": "Eu vi o Senhor"
              }
            ],
            "contrast": {
              "a": "I hear his voice",
              "b": "I heard his voice",
              "note": "hear = agora; heard = naquele momento"
            }
          },
          {
            "part": 2,
            "id": "will-question",
            "grammar": "will-question",
            "title": "Who will go? Will you go?: perguntas com will",
            "body": "will marca o futuro e não muda de pessoa: I will go, he will go. Para perguntar, will vai antes do sujeito: Will you go? Com quem ou quando, a palavra de pergunta vem primeiro: Who will go for us?",
            "examples": [
              {
                "en": "Who will go for us?",
                "pt": "Quem irá por nós?"
              },
              {
                "en": "Will you go?",
                "pt": "Você vai?"
              }
            ],
            "contrast": {
              "a": "I will go",
              "b": "Will I go?",
              "note": "afirmativa: sujeito + will; pergunta: will + sujeito"
            }
          }
        ],
        "vocab": [
          {
            "en": "throne",
            "pt": "trono",
            "pos": "noun",
            "field": "objects",
            "tier": "core",
            "part": 1,
            "icon": "💺",
            "example": 2
          },
          {
            "en": "wing",
            "pt": "asa",
            "pos": "noun",
            "field": "body",
            "tier": "core",
            "part": 1,
            "icon": "🦅",
            "example": 3
          },
          {
            "en": "seraph",
            "pt": "serafim",
            "plural": "seraphim",
            "forms": [
              "seraphim"
            ],
            "pos": "noun",
            "field": "faith",
            "tier": "bible",
            "part": 1,
            "icon": "😇",
            "example": 3,
            "note": "ser celestial de seis asas; plural seraphim"
          },
          {
            "en": "to see",
            "pt": "ver",
            "pos": "verb",
            "field": "mind",
            "tier": "core",
            "part": 1,
            "icon": "👀",
            "example": 1
          },
          {
            "en": "Holy, holy, holy",
            "pt": "Santo, santo, santo",
            "pos": "chunk",
            "field": "speech",
            "tier": "core",
            "part": 1,
            "icon": "🎶",
            "iconic": true,
            "example": 5
          },
          {
            "en": "lip",
            "pt": "lábio",
            "pos": "noun",
            "field": "body",
            "tier": "core",
            "part": 2,
            "icon": "👄",
            "example": 7
          },
          {
            "en": "coal",
            "pt": "brasa",
            "ptAlt": [
              "carvão"
            ],
            "pos": "noun",
            "field": "objects",
            "tier": "core",
            "part": 2,
            "icon": "♨️",
            "example": 8
          },
          {
            "en": "to touch",
            "pt": "tocar",
            "pos": "verb",
            "field": "actions",
            "tier": "core",
            "part": 2,
            "icon": "👆",
            "example": 8
          },
          {
            "en": "to hear",
            "pt": "ouvir",
            "ptAlt": [
              "escutar"
            ],
            "pos": "verb",
            "field": "mind",
            "tier": "core",
            "part": 2,
            "icon": "👂",
            "example": 10
          },
          {
            "en": "Here I am. Send me!",
            "pt": "Aqui estou. Envie-me!",
            "ptAlt": [
              "Eis-me aqui, envia-me a mim",
              "Aqui estou eu. Me envie!"
            ],
            "alt": [
              "Here am I; send me"
            ],
            "pos": "chunk",
            "field": "speech",
            "tier": "core",
            "part": 2,
            "icon": "🙋‍♂️",
            "iconic": true,
            "example": 12
          }
        ],
        "sentences": [
          {
            "en": "I saw the Lord in the year King Uzziah died",
            "pt": "Eu vi o Senhor no ano em que o rei Uzias morreu",
            "altPt": [
              "No ano em que morreu o rei Uzias, eu vi o Senhor"
            ]
          },
          {
            "en": "The Lord was on a high throne",
            "pt": "O Senhor estava num trono alto",
            "alt": [
              "The Lord was sitting on a high throne"
            ],
            "altPt": [
              "O Senhor estava assentado sobre um alto e sublime trono"
            ]
          },
          {
            "en": "Each seraph had six wings",
            "pt": "Cada serafim tinha seis asas"
          },
          {
            "en": "Did the seraph fly with six wings? No, with two",
            "pt": "O serafim voava com seis asas? Não, com duas"
          },
          {
            "en": "They called, \"Holy, holy, holy is the Lord of Armies\"",
            "pt": "Eles clamavam: \"Santo, santo, santo é o Senhor dos Exércitos\"",
            "alt": [
              "Holy, holy, holy is the Lord of hosts",
              "Holy, holy, holy, is the Lord of Armies"
            ],
            "altPt": [
              "Santo, Santo, Santo é o Senhor dos Exércitos"
            ]
          },
          {
            "en": "What did I see? The Lord on a high throne",
            "pt": "O que eu vi? O Senhor num trono alto"
          },
          {
            "en": "I said, \"I am a man of unclean lips\"",
            "pt": "Eu disse: \"Eu sou um homem de lábios impuros\""
          },
          {
            "en": "A seraph touched my lips with a coal",
            "pt": "Um serafim tocou os meus lábios com uma brasa",
            "altPt": [
              "Um serafim tocou a minha boca com uma brasa"
            ]
          },
          {
            "en": "The coal touched my lips and my sin was forgiven",
            "pt": "A brasa tocou os meus lábios e o meu pecado foi perdoado",
            "altPt": [
              "A brasa tocou os meus lábios, e o meu pecado foi perdoado"
            ]
          },
          {
            "en": "Did I hear the Lord? Yes, I heard his voice",
            "pt": "Eu ouvi o Senhor? Sim, eu ouvi a voz dele"
          },
          {
            "en": "I heard him ask, \"Who will go for us?\"",
            "pt": "Eu o ouvi perguntar: \"Quem irá por nós?\"",
            "alt": [
              "I heard him ask, \"Whom shall I send, and who will go for us?\""
            ],
            "altPt": [
              "Eu ouvi ele perguntar: \"Quem irá por nós?\"",
              "Eu o ouvi perguntar: \"Quem há de ir por nós?\""
            ]
          },
          {
            "en": "I said, \"Here I am. Send me!\"",
            "pt": "Eu disse: \"Aqui estou. Envie-me!\"",
            "alt": [
              "Then I said, \"Here I am. Send me!\"",
              "I said, \"Here am I; send me\""
            ],
            "altPt": [
              "Então disse eu: \"Eis-me aqui, envia-me a mim\"",
              "Eu disse: \"Aqui estou eu. Me envie!\""
            ]
          }
        ],
        "beats": [
          {
            "order": 1,
            "en": "I saw the Lord in the year King Uzziah died",
            "pt": "Eu vi o Senhor no ano em que o rei Uzias morreu",
            "altPt": [
              "No ano em que morreu o rei Uzias, eu vi o Senhor"
            ],
            "kind": "first-person",
            "fact": true,
            "speaker": "isaias",
            "gap": {
              "word": "saw",
              "kind": "grammar",
              "options": [
                "saw",
                "see",
                "sees"
              ]
            },
            "grammar": "past-see-hear"
          },
          {
            "order": 2,
            "en": "The Lord was on a high throne",
            "pt": "O Senhor estava num trono alto",
            "altPt": [
              "O Senhor estava assentado sobre um alto e sublime trono"
            ],
            "alt": [
              "The Lord was sitting on a high throne"
            ],
            "kind": "statement",
            "fact": true
          },
          {
            "order": 3,
            "en": "Each seraph had six wings",
            "pt": "Cada serafim tinha seis asas",
            "kind": "statement",
            "fact": true
          },
          {
            "order": 4,
            "en": "Did the seraph fly with six wings? No, with two",
            "pt": "O serafim voava com seis asas? Não, com duas",
            "kind": "question",
            "fact": true
          },
          {
            "order": 5,
            "en": "They called, \"Holy, holy, holy is the Lord of Armies\"",
            "pt": "Eles clamavam: \"Santo, santo, santo é o Senhor dos Exércitos\"",
            "alt": [
              "Holy, holy, holy is the Lord of hosts",
              "Holy, holy, holy, is the Lord of Armies"
            ],
            "altPt": [
              "Santo, Santo, Santo é o Senhor dos Exércitos"
            ],
            "kind": "quote",
            "fact": true,
            "iconic": true,
            "prod": false,
            "speaker": "anjo"
          },
          {
            "order": 6,
            "en": "What did I see? The Lord on a high throne",
            "pt": "O que eu vi? O Senhor num trono alto",
            "kind": "question",
            "fact": true,
            "speaker": "isaias"
          },
          {
            "order": 7,
            "en": "I said, \"I am a man of unclean lips\"",
            "pt": "Eu disse: \"Eu sou um homem de lábios impuros\"",
            "kind": "first-person",
            "fact": true,
            "speaker": "isaias"
          },
          {
            "order": 8,
            "en": "A seraph touched my lips with a coal",
            "pt": "Um serafim tocou os meus lábios com uma brasa",
            "altPt": [
              "Um serafim tocou a minha boca com uma brasa"
            ],
            "kind": "statement",
            "fact": true,
            "gap": {
              "word": "coal",
              "kind": "lexical",
              "options": [
                "coal",
                "wing",
                "throne"
              ]
            }
          },
          {
            "order": 9,
            "en": "The coal touched my lips and my sin was forgiven",
            "pt": "A brasa tocou os meus lábios e o meu pecado foi perdoado",
            "altPt": [
              "A brasa tocou os meus lábios, e o meu pecado foi perdoado"
            ],
            "kind": "statement",
            "fact": true
          },
          {
            "order": 10,
            "en": "Did I hear the Lord? Yes, I heard his voice",
            "pt": "Eu ouvi o Senhor? Sim, eu ouvi a voz dele",
            "kind": "question",
            "fact": true,
            "speaker": "isaias"
          },
          {
            "order": 11,
            "en": "I heard him ask, \"Who will go for us?\"",
            "pt": "Eu o ouvi perguntar: \"Quem irá por nós?\"",
            "alt": [
              "I heard him ask, \"Whom shall I send, and who will go for us?\""
            ],
            "altPt": [
              "Eu ouvi ele perguntar: \"Quem irá por nós?\"",
              "Eu o ouvi perguntar: \"Quem há de ir por nós?\""
            ],
            "kind": "question",
            "fact": true,
            "iconic": true,
            "gap": {
              "word": "will",
              "kind": "grammar",
              "options": [
                "will",
                "can",
                "must"
              ]
            },
            "grammar": "will-question"
          },
          {
            "order": 12,
            "en": "I said, \"Here I am. Send me!\"",
            "pt": "Eu disse: \"Aqui estou. Envie-me!\"",
            "alt": [
              "Then I said, \"Here I am. Send me!\"",
              "I said, \"Here am I; send me\""
            ],
            "altPt": [
              "Então disse eu: \"Eis-me aqui, envia-me a mim\"",
              "Eu disse: \"Aqui estou eu. Me envie!\""
            ],
            "kind": "quote",
            "fact": true,
            "iconic": true,
            "speaker": "isaias"
          }
        ],
        "contrast": [
          {
            "a": "I saw the Lord in the year King Uzziah died",
            "b": "I see the Lord on his throne",
            "note": "saw = vi (passado); see = vejo (presente)"
          },
          {
            "a": "Did I hear the Lord? Yes, I heard his voice",
            "b": "Will I hear the Lord? Yes, I will hear his voice",
            "note": "did + hear = passado; will + hear = futuro"
          }
        ],
        "verse": {
          "text": "\"Whom shall I send, and who will go for us?\" Then I said, \"Here I am. Send me!\"",
          "classic": "Whom shall I send, and who will go for us? Then said I, Here am I; send me.",
          "pt": "\"Quem eu enviarei, e quem irá por nós?\" Então eu disse: \"Aqui estou. Envie-me!\"",
          "classicPt": "A quem enviarei, e quem há de ir por nós? Então, disse eu: Eis-me aqui, envia-me a mim.",
          "ref": "Isaías 6:8",
          "blank": "go",
          "options": [
            "go",
            "stay",
            "sleep",
            "speak"
          ],
          "blanks": [
            {
              "word": "go",
              "options": [
                "go",
                "stay",
                "sleep",
                "speak"
              ]
            },
            {
              "word": "said",
              "options": [
                "said",
                "asked",
                "heard",
                "called"
              ]
            },
            {
              "word": "Here",
              "options": [
                "Here",
                "There",
                "Now",
                "Today"
              ]
            }
          ]
        },
        "reading": {
          "text": "Isaiah saw the Lord on a throne, and the seraphim said, \"Holy, holy, holy is the Lord of Armies.\" Isaiah said, \"I am a man of unclean lips,\" but a seraph touched his lips with a coal and said, \"Your sin is forgiven.\" Then Isaiah heard the Lord ask, \"Who will go for us?\" He said, \"Here I am. Send me!\"",
          "pt": "Isaías viu o Senhor num trono, e os serafins diziam: \"Santo, santo, santo é o Senhor dos Exércitos.\" Isaías disse: \"Eu sou um homem de lábios impuros\", mas um serafim tocou os lábios dele com uma brasa e disse: \"O seu pecado está perdoado.\" Então Isaías ouviu o Senhor perguntar: \"Quem irá por nós?\" Ele disse: \"Aqui estou. Envie-me!\"",
          "q": "What touched Isaiah's lips?",
          "options": [
            "A hot coal in the hand of a seraph",
            "One of the six wings of a seraph",
            "The hand of the Lord on the throne"
          ],
          "answer": "A hot coal in the hand of a seraph",
          "questions": [
            {
              "kind": "literal",
              "q": "What touched Isaiah's lips?",
              "qPt": "O que tocou os lábios de Isaías?",
              "options": [
                "A hot coal in the hand of a seraph",
                "One of the six wings of a seraph",
                "The hand of the Lord on the throne"
              ],
              "answer": "A hot coal in the hand of a seraph"
            },
            {
              "kind": "inference",
              "q": "Why did Isaiah say, \"I am a man of unclean lips\"?",
              "qPt": "Por que Isaías disse: \"Eu sou um homem de lábios impuros\"?",
              "options": [
                "He saw the holy Lord and felt his own sin",
                "The seraphim had six wings and could fly",
                "The Lord did not want to send him"
              ],
              "answer": "He saw the holy Lord and felt his own sin",
              "explain": "Diante do Senhor santo, Isaías sentiu a sua impureza: \"os meus olhos viram o Rei, o Senhor dos Exércitos\" (Isaías 6:5). Só depois a brasa tirou o seu pecado (Isaías 6:7)."
            }
          ]
        },
        "dialogue": {
          "line": "Who will go for us?",
          "pt": "Quem irá por nós?",
          "options": [
            "Here I am. Send me!",
            "Here I am. Send him!",
            "Here I am. Wait for me!"
          ],
          "answer": "Here I am. Send me!",
          "answerPt": "Aqui estou. Envie-me!"
        },
        "conversation": {
          "with": "voice",
          "turns": [
            {
              "who": "voice",
              "en": "Who will go for us?",
              "pt": "Quem irá por nós?",
              "mood": "solene"
            },
            {
              "who": "you",
              "options": [
                "Here I am. Send me!",
                "Here I am. Send him!",
                "Here I am. Wait for me!"
              ],
              "answer": "Here I am. Send me!",
              "pt": "Aqui estou. Envie-me!",
              "intent": "Responda ao chamado"
            },
            {
              "who": "voice",
              "en": "Go and speak to this people.",
              "pt": "Vá e fale a este povo.",
              "mood": "calmo"
            },
            {
              "who": "you",
              "options": [
                "Lord, how long?",
                "Lord, how many?",
                "Lord, how old?"
              ],
              "answer": "Lord, how long?",
              "pt": "Senhor, até quando?",
              "intent": "Pergunte por quanto tempo",
              "speak": true
            }
          ]
        },
        "quiz": {
          "q": "Why did Isaiah say, \"I am a man of unclean lips\"?",
          "options": [
            "He saw the holy Lord and felt his own sin",
            "The seraphim had six wings and could fly",
            "The Lord did not want to send him"
          ],
          "answer": "He saw the holy Lord and felt his own sin",
          "explain": "Diante do Senhor santo, Isaías sentiu a sua impureza: \"os meus olhos viram o Rei, o Senhor dos Exércitos\" (Isaías 6:5). Só depois a brasa tirou o seu pecado (Isaías 6:7)."
        },
        "fact": {
          "pt": "A palavra \"serafim\" vem do hebraico \"saraf\", que tem a ver com fogo. Como seres celestiais de seis asas, os serafins aparecem na Bíblia somente em Isaías 6 (Isaías 6:2-6).",
          "ref": "Isaías 6:2"
        },
        "v": 2
      },
      {
        "id": "u5l2",
        "title": "Emanuel e o Príncipe da Paz",
        "ref": "Isaías 7:1-14; 9:2-7; Mateus 1:23",
        "level": "A2.1",
        "narrator": "isaias",
        "guests": [
          "acaz",
          "voice"
        ],
        "names": [
          {
            "en": "Isaiah",
            "pt": "Isaías",
            "note": "o profeta; narra a unidade"
          },
          {
            "en": "Ahaz",
            "pt": "Acaz",
            "note": "rei de Judá no tempo de Isaías"
          },
          {
            "en": "Jerusalem",
            "pt": "Jerusalém"
          },
          {
            "en": "Immanuel",
            "pt": "Emanuel",
            "note": "significa Deus conosco (Mateus 1:23)"
          },
          {
            "en": "the Lord",
            "pt": "o Senhor"
          },
          {
            "en": "Wonderful Counselor",
            "pt": "Maravilhoso Conselheiro",
            "note": "primeiro título do menino em Isaías 9:6"
          },
          {
            "en": "Mighty God",
            "pt": "Deus Forte",
            "note": "a Almeida diz Deus Forte"
          },
          {
            "en": "Everlasting Father",
            "pt": "Pai Eterno",
            "note": "a Almeida diz Pai da Eternidade"
          },
          {
            "en": "Prince of Peace",
            "pt": "Príncipe da Paz"
          }
        ],
        "hints": {
          "stay": "ficar, fique",
          "virgin": "virgem",
          "birth": "nascimento",
          "born": "nascido, nasceu",
          "end": "acabar, fim",
          "mean": "significar, significa"
        },
        "tips": [
          {
            "part": 1,
            "id": "will-future",
            "grammar": "will-future",
            "title": "will: falar do futuro",
            "body": "Para falar do que vai acontecer, use will antes do verbo na forma básica: The Lord will give you a sign. A forma é igual para todas as pessoas (I will, he will, they will). A negativa é will not (won't): I will not ask.",
            "examples": [
              {
                "en": "The Lord will give you a sign",
                "pt": "O Senhor dará a você um sinal"
              },
              {
                "en": "A virgin will have a son",
                "pt": "Uma virgem terá um filho"
              }
            ],
            "contrast": {
              "a": "I will ask for a sign",
              "b": "I will not ask for a sign",
              "note": "will = vou; will not = não vou"
            }
          },
          {
            "part": 2,
            "id": "verb-s-means",
            "grammar": "verb-s-means",
            "title": "It means, he calls: o -s da terceira pessoa",
            "body": "No presente, com he, she ou it, o verbo ganha -s: Immanuel means God with us; she calls him Immanuel. Na pergunta, does fica com o -s e o verbo volta à forma básica: What does Immanuel mean? Nomes compostos como Prince of Peace são lidos como um só título.",
            "examples": [
              {
                "en": "Immanuel means God with us",
                "pt": "Emanuel significa Deus conosco"
              },
              {
                "en": "She calls him Immanuel",
                "pt": "Ela o chama de Emanuel"
              }
            ],
            "contrast": {
              "a": "The name means God with us",
              "b": "What does the name mean?",
              "note": "means (com -s) na afirmativa; does + mean (sem -s) na pergunta"
            }
          }
        ],
        "vocab": [
          {
            "en": "calm",
            "pt": "calmo",
            "ptAlt": [
              "calma",
              "tranquilo"
            ],
            "pos": "adj",
            "field": "feelings",
            "tier": "core",
            "part": 1,
            "icon": "😊",
            "example": 2
          },
          {
            "en": "enemy",
            "pt": "inimigo",
            "plural": "enemies",
            "pos": "noun",
            "field": "people",
            "tier": "core",
            "part": 1,
            "icon": "👹",
            "example": 1
          },
          {
            "en": "sign",
            "pt": "sinal",
            "pos": "noun",
            "field": "faith",
            "tier": "core",
            "part": 1,
            "icon": "🚩",
            "example": 5
          },
          {
            "en": "to give",
            "pt": "dar",
            "pos": "verb",
            "field": "actions",
            "tier": "core",
            "part": 1,
            "icon": "💝",
            "example": 5
          },
          {
            "en": "Stay calm",
            "pt": "Fique calmo",
            "ptAlt": [
              "Fique calma",
              "Fique tranquilo",
              "Tenha calma"
            ],
            "pos": "chunk",
            "field": "speech",
            "tier": "core",
            "part": 1,
            "icon": "🧘",
            "iconic": true,
            "example": 3
          },
          {
            "en": "child",
            "pt": "menino",
            "ptAlt": [
              "criança"
            ],
            "plural": "children",
            "pos": "noun",
            "field": "family",
            "tier": "core",
            "part": 2,
            "icon": "👶",
            "example": 8
          },
          {
            "en": "great",
            "pt": "grande",
            "pos": "adj",
            "field": "quality",
            "tier": "core",
            "part": 2,
            "icon": "🔝",
            "example": 7
          },
          {
            "en": "to call",
            "pt": "chamar",
            "pos": "verb",
            "field": "speech",
            "tier": "core",
            "part": 2,
            "icon": "📢",
            "example": 9
          },
          {
            "en": "peace",
            "pt": "paz",
            "pos": "noun",
            "field": "faith",
            "tier": "core",
            "part": 2,
            "icon": "☮️",
            "example": 10
          },
          {
            "en": "God with us",
            "pt": "Deus conosco",
            "pos": "chunk",
            "field": "faith",
            "tier": "core",
            "part": 2,
            "icon": "💞",
            "iconic": true,
            "example": 12
          }
        ],
        "sentences": [
          {
            "en": "Two enemy kings came to fight against Jerusalem",
            "pt": "Dois reis inimigos vieram lutar contra Jerusalém",
            "altPt": [
              "Dois reis subiram a Jerusalém para guerrear contra ela"
            ]
          },
          {
            "en": "Was Ahaz calm? No, he was afraid of his enemies",
            "pt": "Acaz estava calmo? Não, ele estava com medo dos seus inimigos"
          },
          {
            "en": "I said to Ahaz, \"Stay calm. Do not be afraid\"",
            "pt": "Eu disse a Acaz: \"Fique calmo. Não tenha medo\"",
            "alt": [
              "I said to Ahaz, \"Keep calm. Do not be afraid\""
            ],
            "altPt": [
              "Eu disse a Acaz: \"Tenha calma. Não tema\""
            ]
          },
          {
            "en": "Ahaz did not ask the Lord for a sign",
            "pt": "Acaz não pediu um sinal ao Senhor"
          },
          {
            "en": "The Lord himself will give you a sign",
            "pt": "O Senhor mesmo dará a você um sinal",
            "altPt": [
              "O mesmo Senhor vos dará um sinal"
            ]
          },
          {
            "en": "The virgin will give birth to a son called Immanuel",
            "pt": "A virgem dará à luz um filho chamado Emanuel",
            "alt": [
              "The virgin will conceive, and bear a son, and shall call his name Immanuel"
            ],
            "altPt": [
              "Uma virgem conceberá e dará à luz um filho, e será o seu nome Emanuel"
            ]
          },
          {
            "en": "The people in the dark saw a great light",
            "pt": "O povo no escuro viu uma grande luz",
            "alt": [
              "The people who walked in darkness have seen a great light"
            ],
            "altPt": [
              "O povo que andava em trevas viu uma grande luz"
            ]
          },
          {
            "en": "Why this great light? A child is born to us",
            "pt": "Por que esta grande luz? Um menino nos nasceu",
            "altPt": [
              "Por que esta grande luz? Um menino nasceu para nós"
            ]
          },
          {
            "en": "The child will be called Wonderful Counselor, Mighty God",
            "pt": "O menino será chamado Maravilhoso Conselheiro, Deus Forte",
            "alt": [
              "His name will be called Wonderful Counselor, Mighty God"
            ]
          },
          {
            "en": "He will be called Everlasting Father, Prince of Peace",
            "pt": "Ele será chamado Pai Eterno, Príncipe da Paz",
            "altPt": [
              "Ele será chamado Pai da Eternidade, Príncipe da Paz"
            ]
          },
          {
            "en": "Will his peace end? No, his peace will never end",
            "pt": "A paz dele vai acabar? Não, a paz dele nunca vai acabar",
            "altPt": [
              "Da sua paz não haverá fim"
            ]
          },
          {
            "en": "What does Immanuel mean? It means God with us",
            "pt": "O que significa Emanuel? Significa Deus conosco"
          }
        ],
        "beats": [
          {
            "order": 1,
            "en": "Two enemy kings came to fight against Jerusalem",
            "pt": "Dois reis inimigos vieram lutar contra Jerusalém",
            "altPt": [
              "Dois reis subiram a Jerusalém para guerrear contra ela"
            ],
            "kind": "statement",
            "fact": true
          },
          {
            "order": 2,
            "en": "Was Ahaz calm? No, he was afraid of his enemies",
            "pt": "Acaz estava calmo? Não, ele estava com medo dos seus inimigos",
            "kind": "question",
            "fact": true
          },
          {
            "order": 3,
            "en": "I said to Ahaz, \"Stay calm. Do not be afraid\"",
            "pt": "Eu disse a Acaz: \"Fique calmo. Não tenha medo\"",
            "alt": [
              "I said to Ahaz, \"Keep calm. Do not be afraid\""
            ],
            "altPt": [
              "Eu disse a Acaz: \"Tenha calma. Não tema\""
            ],
            "kind": "first-person",
            "fact": true,
            "iconic": true,
            "speaker": "isaias"
          },
          {
            "order": 4,
            "en": "Ahaz did not ask the Lord for a sign",
            "pt": "Acaz não pediu um sinal ao Senhor",
            "kind": "negative",
            "fact": true
          },
          {
            "order": 5,
            "en": "The Lord himself will give you a sign",
            "pt": "O Senhor mesmo dará a você um sinal",
            "altPt": [
              "O mesmo Senhor vos dará um sinal"
            ],
            "kind": "quote",
            "fact": true,
            "speaker": "isaias",
            "gap": {
              "word": "will",
              "kind": "grammar",
              "options": [
                "will",
                "can",
                "must"
              ]
            },
            "grammar": "will-future"
          },
          {
            "order": 6,
            "en": "The virgin will give birth to a son called Immanuel",
            "pt": "A virgem dará à luz um filho chamado Emanuel",
            "altPt": [
              "Uma virgem conceberá e dará à luz um filho, e será o seu nome Emanuel"
            ],
            "kind": "statement",
            "fact": true,
            "iconic": true,
            "speaker": "isaias",
            "alt": [
              "The virgin will conceive, and bear a son, and shall call his name Immanuel"
            ]
          },
          {
            "order": 7,
            "en": "The people in the dark saw a great light",
            "pt": "O povo no escuro viu uma grande luz",
            "altPt": [
              "O povo que andava em trevas viu uma grande luz"
            ],
            "kind": "statement",
            "fact": true,
            "gap": {
              "word": "great",
              "kind": "lexical",
              "options": [
                "great",
                "calm",
                "afraid"
              ]
            },
            "alt": [
              "The people who walked in darkness have seen a great light"
            ]
          },
          {
            "order": 8,
            "en": "Why this great light? A child is born to us",
            "pt": "Por que esta grande luz? Um menino nos nasceu",
            "altPt": [
              "Por que esta grande luz? Um menino nasceu para nós"
            ],
            "kind": "question",
            "fact": true
          },
          {
            "order": 9,
            "en": "The child will be called Wonderful Counselor, Mighty God",
            "pt": "O menino será chamado Maravilhoso Conselheiro, Deus Forte",
            "alt": [
              "His name will be called Wonderful Counselor, Mighty God"
            ],
            "kind": "quote",
            "fact": true,
            "iconic": true,
            "speaker": "isaias"
          },
          {
            "order": 10,
            "en": "He will be called Everlasting Father, Prince of Peace",
            "pt": "Ele será chamado Pai Eterno, Príncipe da Paz",
            "altPt": [
              "Ele será chamado Pai da Eternidade, Príncipe da Paz"
            ],
            "kind": "quote",
            "fact": true,
            "iconic": true,
            "speaker": "isaias"
          },
          {
            "order": 11,
            "en": "Will his peace end? No, his peace will never end",
            "pt": "A paz dele vai acabar? Não, a paz dele nunca vai acabar",
            "altPt": [
              "Da sua paz não haverá fim"
            ],
            "kind": "question",
            "fact": true
          },
          {
            "order": 12,
            "en": "What does Immanuel mean? It means God with us",
            "pt": "O que significa Emanuel? Significa Deus conosco",
            "kind": "question",
            "fact": true,
            "gap": {
              "word": "means",
              "kind": "grammar",
              "options": [
                "means",
                "mean",
                "meant"
              ]
            },
            "grammar": "verb-s-means"
          }
        ],
        "contrast": [
          {
            "a": "The Lord himself will give you a sign",
            "b": "The Lord himself will not give you a sign",
            "note": "will = vai dar; will not = não vai dar"
          },
          {
            "a": "What does Immanuel mean? It means God with us",
            "b": "What do the names mean? They mean God with us",
            "note": "it means (com -s); they mean (sem -s)"
          }
        ],
        "verse": {
          "text": "His name will be called Wonderful Counselor, Mighty God, Everlasting Father, Prince of Peace.",
          "classic": "And his name shall be called Wonderful, Counsellor, The mighty God, The everlasting Father, The Prince of Peace.",
          "pt": "O seu nome será Maravilhoso Conselheiro, Deus Forte, Pai Eterno, Príncipe da Paz.",
          "classicPt": "E o seu nome será Maravilhoso, Conselheiro, Deus Forte, Pai da Eternidade, Príncipe da Paz.",
          "ref": "Isaías 9:6",
          "blank": "Peace",
          "options": [
            "Peace",
            "Light",
            "Love",
            "Life"
          ],
          "blanks": [
            {
              "word": "Peace",
              "options": [
                "Peace",
                "Light",
                "Love",
                "Life"
              ]
            },
            {
              "word": "name",
              "options": [
                "name",
                "son",
                "child",
                "sign"
              ]
            },
            {
              "word": "called",
              "options": [
                "called",
                "born",
                "given",
                "sent"
              ]
            }
          ]
        },
        "reading": {
          "text": "Two kings came to fight against Jerusalem, and King Ahaz was very afraid. Isaiah said to him, \"Stay calm and do not be afraid.\" Ahaz did not ask for a sign, but the Lord himself gave one: a virgin will have a son, Immanuel. Isaiah also said, \"The people in the dark will see a great light, because a child is born to us.\" He will be called Wonderful Counselor, Mighty God, Everlasting Father, Prince of Peace, and Immanuel means God with us.",
          "pt": "Dois reis vieram lutar contra Jerusalém, e o rei Acaz estava com muito medo. Isaías disse a ele: \"Fique calmo e não tenha medo.\" Acaz não pediu um sinal, mas o Senhor mesmo deu um: uma virgem terá um filho, Emanuel. Isaías também disse: \"O povo no escuro verá uma grande luz, porque um menino nos nasceu.\" Ele será chamado Maravilhoso Conselheiro, Deus Forte, Pai Eterno, Príncipe da Paz, e Emanuel significa Deus conosco.",
          "q": "What sign did the Lord give to Ahaz?",
          "options": [
            "A son born to a virgin",
            "A great light over Jerusalem",
            "A new king for the two enemies"
          ],
          "answer": "A son born to a virgin",
          "questions": [
            {
              "kind": "literal",
              "q": "What sign did the Lord give to Ahaz?",
              "qPt": "Que sinal o Senhor deu a Acaz?",
              "options": [
                "A son born to a virgin",
                "A great light over Jerusalem",
                "A new king for the two enemies"
              ],
              "answer": "A son born to a virgin"
            },
            {
              "kind": "inference",
              "q": "Why did Isaiah tell Ahaz to stay calm?",
              "qPt": "Por que Isaías disse a Acaz para ficar calmo?",
              "options": [
                "Because the Lord was with Jerusalem",
                "Because the two kings were his friends",
                "Because Ahaz had asked for a sign"
              ],
              "answer": "Because the Lord was with Jerusalem",
              "explain": "O Senhor mandou Isaías dizer a Acaz que não temesse: o plano dos dois reis não ficaria de pé (Isaías 7:4-7). Deus estava com Jerusalém, e o sinal foi dado mesmo sem Acaz pedir (Isaías 7:14)."
            }
          ]
        },
        "dialogue": {
          "line": "Isaiah, two kings are coming against us! What do I do?",
          "pt": "Isaías, dois reis estão vindo contra nós! O que eu faço?",
          "options": [
            "Stay calm. Do not be afraid.",
            "Stay here. Do not fight them.",
            "Stay calm. Ask them for a sign."
          ],
          "answer": "Stay calm. Do not be afraid.",
          "answerPt": "Fique calmo. Não tenha medo."
        },
        "conversation": {
          "with": "acaz",
          "turns": [
            {
              "who": "acaz",
              "en": "Isaiah, two kings are coming against us! What do I do?",
              "pt": "Isaías, dois reis estão vindo contra nós! O que eu faço?",
              "mood": "assustado"
            },
            {
              "who": "you",
              "options": [
                "Stay calm. Do not be afraid.",
                "Stay here. Do not fight them.",
                "Stay calm. Ask them for a sign."
              ],
              "answer": "Stay calm. Do not be afraid.",
              "pt": "Fique calmo. Não tenha medo.",
              "intent": "Acalme o rei com a palavra do Senhor"
            },
            {
              "who": "acaz",
              "en": "I will not ask the Lord for a sign.",
              "pt": "Eu não vou pedir um sinal ao Senhor.",
              "mood": "bravo"
            },
            {
              "who": "you",
              "options": [
                "The Lord himself will give you a sign.",
                "The Lord himself will fight for you.",
                "The Lord himself will give you a son."
              ],
              "answer": "The Lord himself will give you a sign.",
              "pt": "O Senhor mesmo dará a você um sinal.",
              "intent": "Diga o que o Senhor fará mesmo assim",
              "speak": true
            }
          ]
        },
        "quiz": {
          "q": "Why did Isaiah tell Ahaz to stay calm?",
          "options": [
            "Because the Lord was with Jerusalem",
            "Because the two kings were his friends",
            "Because Ahaz had asked for a sign"
          ],
          "answer": "Because the Lord was with Jerusalem",
          "explain": "O Senhor mandou Isaías dizer a Acaz que não temesse: o plano dos dois reis não ficaria de pé (Isaías 7:4-7). Deus estava com Jerusalém, e o sinal foi dado mesmo sem Acaz pedir (Isaías 7:14)."
        },
        "fact": {
          "pt": "O evangelho de Mateus cita Isaías 7:14 ao contar o nascimento de Jesus e explica o nome: \"Emanuel, que traduzido é: Deus conosco\" (Mateus 1:23).",
          "ref": "Mateus 1:23"
        },
        "v": 2
      },
      {
        "id": "u5l3",
        "title": "Ezequias e o anjo",
        "ref": "Isaías 36:1-2; 37:9-38; 38:1-8",
        "level": "A2.1",
        "narrator": "isaias",
        "guests": [
          "ezequias",
          "voice"
        ],
        "names": [
          {
            "en": "Isaiah",
            "pt": "Isaías",
            "note": "o profeta; narra a unidade"
          },
          {
            "en": "Hezekiah",
            "pt": "Ezequias",
            "note": "rei de Judá, filho de Acaz"
          },
          {
            "en": "Assyria",
            "pt": "Assíria",
            "note": "o grande império do norte"
          },
          {
            "en": "Judah",
            "pt": "Judá",
            "note": "o reino do sul, com a capital Jerusalém"
          },
          {
            "en": "the Lord",
            "pt": "o Senhor"
          },
          {
            "en": "God",
            "pt": "Deus"
          }
        ],
        "hints": {
          "attack": "atacar, atacou",
          "house": "casa",
          "angel": "anjo",
          "strike": "ferir, feriu",
          "death": "morte",
          "prayer": "oração",
          "life": "vida"
        },
        "tips": [
          {
            "part": 1,
            "id": "present-3rd",
            "grammar": "present-3rd",
            "title": "He prays, the Lord says: o -s da terceira pessoa",
            "body": "No presente simples, com he, she ou it, o verbo ganha -s: the king prays, the Lord says, the sun goes back. Com I, you, we e they o verbo fica na forma básica: I pray, they say. A fórmula \"The Lord says\" (assim diz o Senhor) abre a palavra do profeta.",
            "examples": [
              {
                "en": "The Lord says, \"Do not be afraid\"",
                "pt": "O Senhor diz: \"Não tenha medo\""
              },
              {
                "en": "The king prays to the Lord",
                "pt": "O rei ora ao Senhor"
              }
            ],
            "contrast": {
              "a": "I pray to the Lord",
              "b": "He prays to the Lord",
              "note": "I pray (sem -s); he prays (com -s)"
            }
          },
          {
            "part": 2,
            "id": "how-many",
            "grammar": "how-many",
            "title": "How long? How many?: perguntas de quantidade",
            "body": "How long pergunta por tempo (quanto tempo); how many pergunta por quantidade de coisas que se contam (years, days, people); how much é para o que não se conta (water, bread). A resposta pode ser só o número: How many years? Fifteen years.",
            "examples": [
              {
                "en": "How long will I live?",
                "pt": "Quanto tempo eu vou viver?"
              },
              {
                "en": "How many years will God add?",
                "pt": "Quantos anos Deus vai acrescentar?"
              }
            ],
            "contrast": {
              "a": "How many years?",
              "b": "How much water?",
              "note": "many = coisas que se contam; much = o que não se conta"
            }
          }
        ],
        "vocab": [
          {
            "en": "to save",
            "pt": "salvar",
            "pos": "verb",
            "field": "actions",
            "tier": "core",
            "part": 1,
            "icon": "🆘",
            "example": 2
          },
          {
            "en": "city",
            "pt": "cidade",
            "pos": "noun",
            "field": "places",
            "tier": "core",
            "part": 1,
            "icon": "🏘️",
            "example": 5
          },
          {
            "en": "letter",
            "pt": "carta",
            "pos": "noun",
            "field": "objects",
            "tier": "core",
            "part": 1,
            "icon": "✉️",
            "example": 2
          },
          {
            "en": "to pray",
            "pt": "orar",
            "ptAlt": [
              "rezar"
            ],
            "pos": "verb",
            "field": "faith",
            "tier": "core",
            "part": 1,
            "icon": "🧎",
            "example": 3
          },
          {
            "en": "Lord, save us!",
            "pt": "Senhor, salve-nos!",
            "ptAlt": [
              "Senhor, nos salve!",
              "Senhor, salva-nos!"
            ],
            "pos": "chunk",
            "field": "speech",
            "tier": "core",
            "part": 1,
            "icon": "🚨",
            "iconic": true,
            "example": 4
          },
          {
            "en": "sick",
            "pt": "doente",
            "pos": "adj",
            "field": "body",
            "tier": "core",
            "part": 2,
            "icon": "🤒",
            "example": 7
          },
          {
            "en": "tear",
            "pt": "lágrima",
            "pos": "noun",
            "field": "body",
            "tier": "core",
            "part": 2,
            "icon": "💦",
            "example": 9
          },
          {
            "en": "to add",
            "pt": "acrescentar",
            "ptAlt": [
              "adicionar",
              "somar"
            ],
            "pos": "verb",
            "field": "quantity",
            "tier": "core",
            "part": 2,
            "icon": "➕",
            "example": 12
          },
          {
            "en": "fifteen",
            "pt": "quinze",
            "pos": "num",
            "field": "quantity",
            "tier": "core",
            "part": 2,
            "icon": "🧮",
            "example": 11
          },
          {
            "en": "Put your house in order",
            "pt": "Ponha a sua casa em ordem",
            "ptAlt": [
              "Põe em ordem a tua casa",
              "Coloque a sua casa em ordem"
            ],
            "alt": [
              "Set your house in order"
            ],
            "pos": "chunk",
            "field": "speech",
            "tier": "core",
            "part": 2,
            "icon": "🏡",
            "iconic": true,
            "example": 8
          }
        ],
        "sentences": [
          {
            "en": "The king of Assyria attacked the cities of Judah",
            "pt": "O rei da Assíria atacou as cidades de Judá",
            "altPt": [
              "Senaqueribe, rei da Assíria, subiu contra todas as cidades fortes de Judá"
            ]
          },
          {
            "en": "His letter said, \"Your God cannot save you\"",
            "pt": "A carta dele dizia: \"O seu Deus não pode salvar vocês\"",
            "altPt": [
              "A carta dele dizia: \"O teu Deus não pode te salvar\""
            ]
          },
          {
            "en": "King Hezekiah put the letter before the Lord and prayed",
            "pt": "O rei Ezequias pôs a carta diante do Senhor e orou",
            "altPt": [
              "O rei Ezequias estendeu a carta perante o Senhor e orou"
            ]
          },
          {
            "en": "He prayed, \"Lord, save us! You alone are God\"",
            "pt": "Ele orou: \"Senhor, salve-nos! Só você é Deus\"",
            "altPt": [
              "Ele orou: \"Senhor, salva-nos! Só tu és Deus\""
            ]
          },
          {
            "en": "The Lord says, \"He will not come into this city\"",
            "pt": "O Senhor diz: \"Ele não entrará nesta cidade\"",
            "altPt": [
              "Assim diz o Senhor: \"Ele não entrará nesta cidade\""
            ]
          },
          {
            "en": "That night the angel of the Lord struck the army",
            "pt": "Naquela noite o anjo do Senhor feriu o exército",
            "altPt": [
              "Naquela noite o anjo do Senhor atingiu o exército"
            ]
          },
          {
            "en": "Was Hezekiah sick? Yes, he was near death",
            "pt": "Ezequias estava doente? Sim, ele estava perto da morte"
          },
          {
            "en": "The Lord said, \"Put your house in order\"",
            "pt": "O Senhor disse: \"Ponha a sua casa em ordem\"",
            "alt": [
              "The Lord said, \"Set your house in order\""
            ],
            "altPt": [
              "O Senhor disse: \"Põe em ordem a tua casa\""
            ]
          },
          {
            "en": "The sick king prayed and cried with many tears",
            "pt": "O rei doente orou e chorou com muitas lágrimas",
            "altPt": [
              "O rei doente orou e chorou muito"
            ]
          },
          {
            "en": "He said, \"I have heard your prayer. I have seen your tears\"",
            "pt": "Ele disse: \"Eu ouvi a sua oração. Eu vi as suas lágrimas\"",
            "altPt": [
              "Ele disse: \"Ouvi a tua oração e vi as tuas lágrimas\""
            ]
          },
          {
            "en": "How many years will God add? Fifteen years",
            "pt": "Quantos anos Deus vai acrescentar? Quinze anos"
          },
          {
            "en": "God added fifteen years to his life",
            "pt": "Deus acrescentou quinze anos à vida dele",
            "altPt": [
              "Deus acrescentou aos dias dele quinze anos"
            ]
          }
        ],
        "beats": [
          {
            "order": 1,
            "en": "The king of Assyria attacked the cities of Judah",
            "pt": "O rei da Assíria atacou as cidades de Judá",
            "altPt": [
              "Senaqueribe, rei da Assíria, subiu contra todas as cidades fortes de Judá"
            ],
            "kind": "statement",
            "fact": true
          },
          {
            "order": 2,
            "en": "His letter said, \"Your God cannot save you\"",
            "pt": "A carta dele dizia: \"O seu Deus não pode salvar vocês\"",
            "altPt": [
              "A carta dele dizia: \"O teu Deus não pode te salvar\""
            ],
            "kind": "negative",
            "fact": true
          },
          {
            "order": 3,
            "en": "King Hezekiah put the letter before the Lord and prayed",
            "pt": "O rei Ezequias pôs a carta diante do Senhor e orou",
            "altPt": [
              "O rei Ezequias estendeu a carta perante o Senhor e orou"
            ],
            "kind": "statement",
            "fact": true
          },
          {
            "order": 4,
            "en": "He prayed, \"Lord, save us! You alone are God\"",
            "pt": "Ele orou: \"Senhor, salve-nos! Só você é Deus\"",
            "altPt": [
              "Ele orou: \"Senhor, salva-nos! Só tu és Deus\""
            ],
            "kind": "quote",
            "fact": true,
            "iconic": true,
            "speaker": "ezequias"
          },
          {
            "order": 5,
            "en": "The Lord says, \"He will not come into this city\"",
            "pt": "O Senhor diz: \"Ele não entrará nesta cidade\"",
            "altPt": [
              "Assim diz o Senhor: \"Ele não entrará nesta cidade\""
            ],
            "kind": "negative",
            "fact": true,
            "speaker": "voice",
            "gap": {
              "word": "says",
              "kind": "grammar",
              "options": [
                "says",
                "say",
                "said"
              ]
            },
            "grammar": "present-3rd"
          },
          {
            "order": 6,
            "en": "That night the angel of the Lord struck the army",
            "pt": "Naquela noite o anjo do Senhor feriu o exército",
            "altPt": [
              "Naquela noite o anjo do Senhor atingiu o exército"
            ],
            "kind": "statement",
            "fact": true
          },
          {
            "order": 7,
            "en": "Was Hezekiah sick? Yes, he was near death",
            "pt": "Ezequias estava doente? Sim, ele estava perto da morte",
            "kind": "question",
            "fact": true
          },
          {
            "order": 8,
            "en": "The Lord said, \"Put your house in order\"",
            "pt": "O Senhor disse: \"Ponha a sua casa em ordem\"",
            "alt": [
              "The Lord said, \"Set your house in order\""
            ],
            "altPt": [
              "O Senhor disse: \"Põe em ordem a tua casa\""
            ],
            "kind": "quote",
            "fact": true,
            "iconic": true,
            "speaker": "voice"
          },
          {
            "order": 9,
            "en": "The sick king prayed and cried with many tears",
            "pt": "O rei doente orou e chorou com muitas lágrimas",
            "altPt": [
              "O rei doente orou e chorou muito"
            ],
            "kind": "statement",
            "fact": true,
            "gap": {
              "word": "tears",
              "kind": "lexical",
              "options": [
                "tears",
                "letters",
                "cities"
              ]
            }
          },
          {
            "order": 10,
            "en": "He said, \"I have heard your prayer. I have seen your tears\"",
            "pt": "Ele disse: \"Eu ouvi a sua oração. Eu vi as suas lágrimas\"",
            "altPt": [
              "Ele disse: \"Ouvi a tua oração e vi as tuas lágrimas\""
            ],
            "kind": "quote",
            "fact": true,
            "iconic": true,
            "prod": false,
            "speaker": "voice"
          },
          {
            "order": 11,
            "en": "How many years will God add? Fifteen years",
            "pt": "Quantos anos Deus vai acrescentar? Quinze anos",
            "kind": "question",
            "fact": true,
            "gap": {
              "word": "many",
              "kind": "grammar",
              "options": [
                "many",
                "much",
                "few"
              ]
            },
            "grammar": "how-many"
          },
          {
            "order": 12,
            "en": "God added fifteen years to his life",
            "pt": "Deus acrescentou quinze anos à vida dele",
            "altPt": [
              "Deus acrescentou aos dias dele quinze anos"
            ],
            "kind": "statement",
            "fact": true
          }
        ],
        "contrast": [
          {
            "a": "The Lord says, \"He will not come into this city\"",
            "b": "The Lord says, \"He will come into this city\"",
            "note": "will not = negativa; o Senhor garante que o rei da Assíria não entra"
          },
          {
            "a": "How many years will God add? Fifteen years",
            "b": "How long will the king live? Fifteen more years",
            "note": "how many = quantos (anos); how long = quanto tempo"
          }
        ],
        "verse": {
          "text": "I have heard your prayer. I have seen your tears. I will add fifteen years to your life.",
          "classic": "I have heard thy prayer, I have seen thy tears: behold, I will add unto thy days fifteen years.",
          "pt": "Eu ouvi a sua oração. Eu vi as suas lágrimas. Vou acrescentar quinze anos à sua vida.",
          "classicPt": "Ouvi a tua oração e vi as tuas lágrimas; eis que acrescentarei aos teus dias quinze anos.",
          "ref": "Isaías 38:5",
          "blank": "tears",
          "options": [
            "tears",
            "eyes",
            "words",
            "hands"
          ],
          "blanks": [
            {
              "word": "tears",
              "options": [
                "tears",
                "eyes",
                "words",
                "hands"
              ]
            },
            {
              "word": "prayer",
              "options": [
                "prayer",
                "letter",
                "song",
                "city"
              ]
            },
            {
              "word": "fifteen",
              "options": [
                "fifteen",
                "forty",
                "seven",
                "twelve"
              ]
            }
          ]
        },
        "reading": {
          "text": "The army of Assyria came against Judah, and a letter came to King Hezekiah: \"Your God cannot save you.\" Hezekiah put the letter before the Lord and prayed, \"Lord, save us!\" The Lord said, \"He will not come into this city,\" and that night the angel of the Lord struck the army. Later the king was very sick, but he prayed with many tears. So God added fifteen years to his life.",
          "pt": "O exército da Assíria veio contra Judá, e uma carta chegou ao rei Ezequias: \"O seu Deus não pode salvar vocês.\" Ezequias pôs a carta diante do Senhor e orou: \"Senhor, salve-nos!\" O Senhor disse: \"Ele não entrará nesta cidade\", e naquela noite o anjo do Senhor feriu o exército. Mais tarde o rei ficou muito doente, mas orou com muitas lágrimas. Então Deus acrescentou quinze anos à vida dele.",
          "q": "What did Hezekiah do with the letter?",
          "options": [
            "He took it to the Lord's house and prayed there",
            "He sent it back to the king of Assyria",
            "He read it to all the people of the city"
          ],
          "answer": "He took it to the Lord's house and prayed there",
          "questions": [
            {
              "kind": "literal",
              "q": "What did Hezekiah do with the letter?",
              "qPt": "O que Ezequias fez com a carta?",
              "options": [
                "He took it to the Lord's house and prayed there",
                "He sent it back to the king of Assyria",
                "He read it to all the people of the city"
              ],
              "answer": "He took it to the Lord's house and prayed there"
            },
            {
              "kind": "inference",
              "q": "Why did the king of Assyria go home without the city?",
              "qPt": "Por que o rei da Assíria foi embora sem a cidade?",
              "options": [
                "Because the Lord struck his army at night",
                "Because Hezekiah was sick and near death",
                "Because his letter never came to the king"
              ],
              "answer": "Because the Lord struck his army at night",
              "explain": "O anjo do Senhor feriu o exército assírio durante a noite, e Senaqueribe voltou para Nínive (Isaías 37:36-37)."
            }
          ]
        },
        "dialogue": {
          "line": "Isaiah, I'm very sick. What does the Lord say?",
          "pt": "Isaías, eu estou muito doente. O que o Senhor diz?",
          "options": [
            "Put your house in order, my king.",
            "Put the letter before the Lord, my king.",
            "Put your army at the city door, my king."
          ],
          "answer": "Put your house in order, my king.",
          "answerPt": "Ponha a sua casa em ordem, meu rei."
        },
        "conversation": {
          "with": "ezequias",
          "turns": [
            {
              "who": "ezequias",
              "en": "Isaiah, I'm very sick. What does the Lord say?",
              "pt": "Isaías, eu estou muito doente. O que o Senhor diz?",
              "mood": "triste"
            },
            {
              "who": "you",
              "options": [
                "Put your house in order, my king.",
                "Put the letter before the Lord, my king.",
                "Put your army at the city door, my king."
              ],
              "answer": "Put your house in order, my king.",
              "pt": "Ponha a sua casa em ordem, meu rei.",
              "intent": "Transmita a palavra do Senhor ao rei"
            },
            {
              "who": "ezequias",
              "en": "I prayed with many tears. Did the Lord hear me?",
              "pt": "Eu orei com muitas lágrimas. O Senhor me ouviu?",
              "mood": "sussurrando"
            },
            {
              "who": "you",
              "options": [
                "Yes. He will add fifteen years to your life.",
                "Yes. He will add ten steps to your house.",
                "No. He will add fifteen days to your life."
              ],
              "answer": "Yes. He will add fifteen years to your life.",
              "pt": "Sim. Ele vai acrescentar quinze anos à sua vida.",
              "intent": "Dê a resposta do Senhor",
              "speak": true
            }
          ]
        },
        "quiz": {
          "q": "Why did the king of Assyria go home without the city?",
          "options": [
            "Because the Lord struck his army at night",
            "Because Hezekiah was sick and near death",
            "Because his letter never came to the king"
          ],
          "answer": "Because the Lord struck his army at night",
          "explain": "O anjo do Senhor feriu o exército assírio durante a noite, e Senaqueribe voltou para Nínive (Isaías 37:36-37)."
        },
        "fact": {
          "pt": "Como sinal da cura, a sombra no relógio de sol de Acaz voltou dez degraus (Isaías 38:8). Depois de curado, Ezequias escreveu um cântico de gratidão (Isaías 38:9-20).",
          "ref": "Isaías 38:8"
        },
        "v": 2
      },
      {
        "id": "u5r",
        "title": "Revisão",
        "review": true,
        "checkpoint": true
      }
    ]
  },
  {
    "id": "u7",
    "title": "Daniel na Babilônia",
    "subtitle": "Daniel 1-6",
    "icon": "🦁",
    "face": "daniel",
    "color": "#a56644",
    "level": "A2.1",
    "v": 2,
    "lessons": [
      {
        "id": "u7l1",
        "title": "Fiel na Babilônia",
        "ref": "Daniel 1:1-2:49",
        "level": "A2.1",
        "narrator": "daniel",
        "guests": [
          "aspenaz",
          "nabucodonosor"
        ],
        "names": [
          {
            "en": "Daniel",
            "pt": "Daniel",
            "note": "jovem de Judá levado para a Babilônia; narra a unidade"
          },
          {
            "en": "Belteshazzar",
            "pt": "Beltessazar",
            "note": "o nome babilônico dado a Daniel"
          },
          {
            "en": "Nebuchadnezzar",
            "pt": "Nabucodonosor",
            "note": "rei da Babilônia"
          },
          {
            "en": "Aspenaz",
            "pt": "Aspenaz",
            "note": "chefe dos oficiais do rei, responsável pelos jovens"
          },
          {
            "en": "Babylon",
            "pt": "Babilônia",
            "note": "a cidade e o império do rei Nabucodonosor"
          },
          {
            "en": "Jerusalem",
            "pt": "Jerusalém",
            "note": "a cidade de Daniel, em Judá"
          },
          {
            "en": "God",
            "pt": "Deus"
          }
        ],
        "hints": {
          "name": "nome",
          "test": "testar, teste",
          "times": "vezes",
          "sleep": "dormir",
          "statue": "estátua",
          "gold": "ouro",
          "break": "quebrar, quebrou",
          "better": "melhor"
        },
        "tips": [
          {
            "part": 1,
            "id": "must-cannot",
            "grammar": "must-cannot",
            "title": "must, must not, cannot: dever e não poder",
            "body": "must = dever (obrigação); must not = não dever (proibição); cannot = não poder (não consigo ou não é permitido). Depois deles o verbo fica na forma básica, sem to: I must eat, I cannot eat.",
            "examples": [
              {
                "en": "We must not eat this food",
                "pt": "Nós não devemos comer esta comida"
              },
              {
                "en": "I cannot eat it",
                "pt": "Eu não posso comer isso"
              }
            ],
            "contrast": {
              "a": "I must eat this",
              "b": "I must not eat this",
              "note": "must = devo; must not = não devo"
            }
          },
          {
            "part": 2,
            "id": "comparative-than",
            "grammar": "comparative-than",
            "title": "better than, wiser than: comparar com than",
            "body": "Para comparar duas coisas, o adjetivo curto ganha -er (wiser, stronger) e a comparação usa than (do que): wiser than the wise men. Alguns mudam de forma: good vira better, bad vira worse.",
            "examples": [
              {
                "en": "We looked better than the other young men",
                "pt": "Nós parecíamos melhores do que os outros jovens"
              },
              {
                "en": "Daniel was wiser than the wise men",
                "pt": "Daniel era mais sábio do que os sábios"
              }
            ],
            "contrast": {
              "a": "Daniel is wise",
              "b": "Daniel is wiser than the king",
              "note": "wise = sábio; wiser than = mais sábio do que"
            }
          }
        ],
        "vocab": [
          {
            "en": "food",
            "pt": "comida",
            "pos": "noun",
            "field": "food",
            "tier": "core",
            "part": 1,
            "icon": "🍲",
            "image": "food.png",
            "example": 3
          },
          {
            "en": "wine",
            "pt": "vinho",
            "pos": "noun",
            "field": "food",
            "tier": "core",
            "part": 1,
            "icon": "🍷",
            "image": "wine.png",
            "example": 3
          },
          {
            "en": "vegetables",
            "pt": "legumes",
            "ptAlt": [
              "verduras"
            ],
            "pos": "noun",
            "field": "food",
            "tier": "core",
            "part": 1,
            "icon": "🥦",
            "image": "vegetables.png",
            "example": 5
          },
          {
            "en": "to drink",
            "pt": "beber",
            "pos": "verb",
            "field": "food",
            "tier": "core",
            "part": 1,
            "icon": "🥛",
            "image": "drink.png",
            "example": 4
          },
          {
            "en": "I cannot eat this",
            "pt": "Eu não posso comer isto",
            "ptAlt": [
              "Eu não posso comer isso"
            ],
            "pos": "chunk",
            "field": "speech",
            "tier": "core",
            "part": 1,
            "icon": "🛑",
            "example": 4
          },
          {
            "en": "wise",
            "pt": "sábio",
            "ptAlt": [
              "sábia"
            ],
            "pos": "adj",
            "field": "mind",
            "tier": "core",
            "part": 2,
            "icon": "🎓",
            "example": 8
          },
          {
            "en": "secret",
            "pt": "segredo",
            "pos": "noun",
            "field": "mind",
            "tier": "core",
            "part": 2,
            "icon": "🤫",
            "example": 11
          },
          {
            "en": "to reveal",
            "pt": "revelar",
            "pos": "verb",
            "field": "speech",
            "tier": "core",
            "part": 2,
            "icon": "🔦",
            "example": 11
          },
          {
            "en": "heaven",
            "pt": "céu",
            "ptAlt": [
              "céus"
            ],
            "pos": "noun",
            "field": "faith",
            "tier": "core",
            "part": 2,
            "icon": "🌤️",
            "example": 12
          },
          {
            "en": "There is a God in heaven",
            "pt": "Há um Deus no céu",
            "ptAlt": [
              "Existe um Deus no céu"
            ],
            "pos": "chunk",
            "field": "speech",
            "tier": "core",
            "part": 2,
            "icon": "🌌",
            "iconic": true,
            "example": 12
          }
        ],
        "sentences": [
          {
            "en": "The king of Babylon took us from Jerusalem",
            "pt": "O rei da Babilônia nos levou de Jerusalém",
            "altPt": [
              "O rei da Babilônia nos tirou de Jerusalém"
            ]
          },
          {
            "en": "What was my name in Babylon? Belteshazzar",
            "pt": "Qual era o meu nome na Babilônia? Beltessazar"
          },
          {
            "en": "The king gave us his food and his wine",
            "pt": "O rei nos deu a comida e o vinho dele",
            "altPt": [
              "O rei nos deu do seu manjar e do seu vinho"
            ]
          },
          {
            "en": "I cannot eat this food or drink this wine",
            "pt": "Eu não posso comer esta comida nem beber este vinho",
            "altPt": [
              "Eu não posso comer esta comida ou beber este vinho"
            ]
          },
          {
            "en": "We will only eat vegetables and drink water",
            "pt": "Nós vamos comer só legumes e beber água",
            "altPt": [
              "Só vamos comer legumes e beber água"
            ]
          },
          {
            "en": "Please test us for ten days with vegetables and water",
            "pt": "Por favor, nos teste por dez dias com legumes e água",
            "altPt": [
              "Por favor, teste a gente por dez dias com legumes e água"
            ]
          },
          {
            "en": "We looked better than the other young men",
            "pt": "Nós parecíamos melhores do que os outros jovens",
            "altPt": [
              "Nós parecíamos melhores que os outros jovens"
            ]
          },
          {
            "en": "We were ten times wiser than all his wise men",
            "pt": "Nós éramos dez vezes mais sábios do que todos os sábios dele",
            "altPt": [
              "Nós éramos dez vezes mais sábios que todos os sábios dele"
            ]
          },
          {
            "en": "Then the king had a dream and could not sleep",
            "pt": "Então o rei teve um sonho e não conseguia dormir",
            "altPt": [
              "Então o rei teve um sonho e não podia dormir"
            ]
          },
          {
            "en": "Who could explain the dream? No wise man could",
            "pt": "Quem podia explicar o sonho? Nenhum sábio podia"
          },
          {
            "en": "The God of heaven revealed the secret to me",
            "pt": "O Deus do céu revelou o segredo para mim",
            "altPt": [
              "O Deus do céu me revelou o segredo"
            ]
          },
          {
            "en": "There is a God in heaven who reveals secrets",
            "pt": "Há um Deus no céu que revela segredos",
            "alt": [
              "There is a God in heaven that reveals secrets"
            ],
            "altPt": [
              "Há um Deus nos céus que revela os mistérios"
            ]
          }
        ],
        "beats": [
          {
            "order": 1,
            "en": "The king of Babylon took us from Jerusalem",
            "pt": "O rei da Babilônia nos levou de Jerusalém",
            "altPt": [
              "O rei da Babilônia nos tirou de Jerusalém"
            ],
            "kind": "first-person",
            "fact": true,
            "speaker": "daniel"
          },
          {
            "order": 2,
            "en": "What was my name in Babylon? Belteshazzar",
            "pt": "Qual era o meu nome na Babilônia? Beltessazar",
            "kind": "question",
            "fact": true,
            "speaker": "daniel"
          },
          {
            "order": 3,
            "en": "The king gave us his food and his wine",
            "pt": "O rei nos deu a comida e o vinho dele",
            "altPt": [
              "O rei nos deu do seu manjar e do seu vinho"
            ],
            "kind": "statement",
            "fact": true
          },
          {
            "order": 4,
            "en": "I cannot eat this food or drink this wine",
            "pt": "Eu não posso comer esta comida nem beber este vinho",
            "altPt": [
              "Eu não posso comer esta comida ou beber este vinho"
            ],
            "kind": "negative",
            "fact": true,
            "speaker": "daniel",
            "gap": {
              "word": "cannot",
              "kind": "grammar",
              "options": [
                "cannot",
                "must",
                "could"
              ]
            },
            "grammar": "must-cannot"
          },
          {
            "order": 5,
            "en": "We will only eat vegetables and drink water",
            "pt": "Nós vamos comer só legumes e beber água",
            "altPt": [
              "Só vamos comer legumes e beber água"
            ],
            "kind": "first-person",
            "fact": true,
            "speaker": "daniel"
          },
          {
            "order": 6,
            "en": "Please test us for ten days with vegetables and water",
            "pt": "Por favor, nos teste por dez dias com legumes e água",
            "altPt": [
              "Por favor, teste a gente por dez dias com legumes e água"
            ],
            "kind": "first-person",
            "fact": true,
            "speaker": "daniel"
          },
          {
            "order": 7,
            "en": "We looked better than the other young men",
            "pt": "Nós parecíamos melhores do que os outros jovens",
            "altPt": [
              "Nós parecíamos melhores que os outros jovens"
            ],
            "kind": "first-person",
            "fact": true,
            "speaker": "daniel",
            "gap": {
              "word": "better",
              "kind": "grammar",
              "options": [
                "better",
                "good",
                "best"
              ]
            },
            "grammar": "comparative-than"
          },
          {
            "order": 8,
            "en": "We were ten times wiser than all his wise men",
            "pt": "Nós éramos dez vezes mais sábios do que todos os sábios dele",
            "altPt": [
              "Nós éramos dez vezes mais sábios que todos os sábios dele"
            ],
            "kind": "first-person",
            "fact": true,
            "speaker": "daniel",
            "grammar": "comparative-than"
          },
          {
            "order": 9,
            "en": "Then the king had a dream and could not sleep",
            "pt": "Então o rei teve um sonho e não conseguia dormir",
            "altPt": [
              "Então o rei teve um sonho e não podia dormir"
            ],
            "kind": "negative",
            "fact": true
          },
          {
            "order": 10,
            "en": "Who could explain the dream? No wise man could",
            "pt": "Quem podia explicar o sonho? Nenhum sábio podia",
            "kind": "question",
            "fact": true
          },
          {
            "order": 11,
            "en": "The God of heaven revealed the secret to me",
            "pt": "O Deus do céu revelou o segredo para mim",
            "altPt": [
              "O Deus do céu me revelou o segredo"
            ],
            "kind": "first-person",
            "fact": true,
            "speaker": "daniel"
          },
          {
            "order": 12,
            "en": "There is a God in heaven who reveals secrets",
            "pt": "Há um Deus no céu que revela segredos",
            "alt": [
              "There is a God in heaven that reveals secrets"
            ],
            "altPt": [
              "Há um Deus nos céus que revela os mistérios"
            ],
            "kind": "quote",
            "fact": true,
            "iconic": true,
            "speaker": "daniel",
            "gap": {
              "word": "secrets",
              "kind": "lexical",
              "options": [
                "secrets",
                "dreams",
                "hearts"
              ]
            }
          }
        ],
        "contrast": [
          {
            "a": "I cannot eat this food or drink this wine",
            "b": "I can eat this food and drink this wine",
            "note": "cannot = não posso; can = posso"
          },
          {
            "a": "We looked better than the other young men",
            "b": "We looked worse than the other young men",
            "note": "better than = melhor do que; worse than = pior do que"
          }
        ],
        "verse": {
          "text": "There is a God in heaven who reveals secrets.",
          "classic": "There is a God in heaven that revealeth secrets.",
          "pt": "Há um Deus no céu que revela segredos.",
          "classicPt": "Há um Deus nos céus, o qual revela os mistérios.",
          "ref": "Daniel 2:28",
          "blank": "secrets",
          "options": [
            "secrets",
            "dreams",
            "names",
            "kings"
          ],
          "blanks": [
            {
              "word": "secrets",
              "options": [
                "secrets",
                "dreams",
                "names",
                "kings"
              ]
            },
            {
              "word": "heaven",
              "options": [
                "heaven",
                "Babylon",
                "Jerusalem",
                "Egypt"
              ]
            },
            {
              "word": "reveals",
              "options": [
                "reveals",
                "hides",
                "forgets",
                "knows"
              ]
            }
          ]
        },
        "reading": {
          "text": "Daniel was taken from Jerusalem to Babylon with his three friends. The king gave them his food and his wine, but Daniel did not eat it. For ten days they ate only vegetables and drank water, and they looked better than the other young men. Later the king had a dream, and no wise man could explain it. But the God of heaven revealed the secret to Daniel at night.",
          "pt": "Daniel foi levado de Jerusalém para a Babilônia com os seus três amigos. O rei deu a eles a comida e o vinho dele, mas Daniel não comeu. Por dez dias eles comeram só legumes e beberam água, e ficaram com melhor aparência do que os outros jovens. Mais tarde o rei teve um sonho, e nenhum sábio conseguiu explicá-lo. Mas o Deus do céu revelou o segredo a Daniel de noite.",
          "q": "What did Daniel and his friends eat for ten days?",
          "options": [
            "Plants and water, nothing else",
            "The same food as the king",
            "Grain and fruit from the garden"
          ],
          "answer": "Plants and water, nothing else",
          "questions": [
            {
              "kind": "literal",
              "q": "What did Daniel and his friends eat for ten days?",
              "qPt": "O que Daniel e os amigos comeram por dez dias?",
              "options": [
                "Plants and water, nothing else",
                "The same food as the king",
                "Grain and fruit from the garden"
              ],
              "answer": "Plants and water, nothing else"
            },
            {
              "kind": "inference",
              "q": "Why could Daniel explain the king's dream?",
              "qPt": "Por que Daniel conseguiu explicar o sonho do rei?",
              "options": [
                "Because God revealed it to him",
                "Because he was the wisest man in Babylon",
                "Because the king told him the dream"
              ],
              "answer": "Because God revealed it to him",
              "explain": "Nenhum sábio da Babilônia conseguiu; o segredo foi revelado a Daniel numa visão de noite, e ele deu a glória ao Deus do céu (Daniel 2:19, 27-28)."
            }
          ]
        },
        "dialogue": {
          "line": "Daniel, the king gives you his food and his wine. Why don't you eat?",
          "pt": "Daniel, o rei dá a você a comida e o vinho dele. Por que você não come?",
          "options": [
            "I cannot eat this. Please give us vegetables and water.",
            "I cannot eat now. We will eat later with the king.",
            "I cannot eat this. There is too much food here."
          ],
          "answer": "I cannot eat this. Please give us vegetables and water.",
          "answerPt": "Eu não posso comer isto. Por favor, dê legumes e água para nós."
        },
        "conversation": {
          "with": "aspenaz",
          "turns": [
            {
              "who": "aspenaz",
              "en": "Daniel, the king gives you his food and his wine. Why don't you eat?",
              "pt": "Daniel, o rei dá a você a comida e o vinho dele. Por que você não come?",
              "mood": "surpreso"
            },
            {
              "who": "you",
              "options": [
                "I cannot eat this. Please give us vegetables and water.",
                "I cannot eat now. We will eat later with the king.",
                "I cannot eat this. There is too much food here."
              ],
              "answer": "I cannot eat this. Please give us vegetables and water.",
              "pt": "Eu não posso comer isto. Por favor, dê legumes e água para nós.",
              "intent": "Recuse a comida e peça outra coisa"
            },
            {
              "who": "aspenaz",
              "en": "I'm afraid of the king! You will look worse than the other young men.",
              "pt": "Eu tenho medo do rei! Vocês vão ficar com pior aparência do que os outros jovens.",
              "mood": "assustado"
            },
            {
              "who": "you",
              "options": [
                "Please test us for ten days, then look at our faces.",
                "Please tell the king, then give us his food.",
                "Please wait for ten days, then we will drink his wine."
              ],
              "answer": "Please test us for ten days, then look at our faces.",
              "pt": "Por favor, nos teste por dez dias, depois olhe para os nossos rostos.",
              "intent": "Peça um teste e diga por quanto tempo",
              "speak": true
            }
          ]
        },
        "quiz": {
          "q": "Why could Daniel explain the king's dream?",
          "options": [
            "Because God revealed it to him",
            "Because he was the wisest man in Babylon",
            "Because the king told him the dream"
          ],
          "answer": "Because God revealed it to him",
          "explain": "Nenhum sábio da Babilônia conseguiu; o segredo foi revelado a Daniel numa visão de noite, e ele deu a glória ao Deus do céu (Daniel 2:19, 27-28)."
        },
        "fact": {
          "pt": "Os quatro jovens de Judá ganharam nomes babilônicos: Daniel virou Beltessazar, e Hananias, Misael e Azarias viraram Sadraque, Mesaque e Abede-Nego.",
          "ref": "Daniel 1:6-7"
        },
        "v": 2
      },
      {
        "id": "u7l2",
        "title": "A fornalha de fogo",
        "ref": "Daniel 3:1-30",
        "level": "A2.1",
        "narrator": "daniel",
        "guests": [
          "nabucodonosor"
        ],
        "names": [
          {
            "en": "Nebuchadnezzar",
            "pt": "Nabucodonosor",
            "note": "rei da Babilônia"
          },
          {
            "en": "Shadrach, Meshach and Abednego",
            "pt": "Sadraque, Mesaque e Abede-Nego",
            "note": "os três amigos de Daniel; em Judá se chamavam Hananias, Misael e Azarias"
          },
          {
            "en": "Babylon",
            "pt": "Babilônia"
          },
          {
            "en": "God",
            "pt": "Deus",
            "note": "com minúscula (god, gods), fala dos deuses da Babilônia"
          }
        ],
        "hints": {
          "times": "vezes",
          "hand": "mão",
          "soldier": "soldado",
          "hair": "cabelo",
          "like": "como",
          "angry": "bravo, com raiva"
        },
        "tips": [
          {
            "part": 1,
            "id": "will-not",
            "grammar": "will-not",
            "title": "will not, even if: recusa firme",
            "body": "will not (na fala, won't) diz o que a pessoa se recusa a fazer: We will not bow. even if (mesmo que) mostra que a decisão não depende do resultado: Even if God does not save us, we will not bow.",
            "examples": [
              {
                "en": "We will not bow to the statue",
                "pt": "Nós não vamos nos curvar à estátua"
              },
              {
                "en": "Even if he does not save us, we will not bow",
                "pt": "Mesmo que ele não nos salve, nós não vamos nos curvar"
              }
            ],
            "contrast": {
              "a": "We will bow",
              "b": "We will not bow",
              "note": "will = vamos; will not = não vamos (recusa)"
            }
          },
          {
            "part": 2,
            "id": "passive-past",
            "grammar": "passive-past",
            "title": "were thrown, was made: a voz passiva",
            "body": "Quando quem sofre a ação é o foco, use was ou were + particípio (-ed ou forma irregular): The men were thrown into the furnace. Quem fez a ação pode nem aparecer na frase.",
            "examples": [
              {
                "en": "The three men were thrown into the furnace",
                "pt": "Os três homens foram lançados na fornalha"
              },
              {
                "en": "The statue was made of gold",
                "pt": "A estátua foi feita de ouro"
              }
            ],
            "contrast": {
              "a": "The soldiers threw them",
              "b": "They were thrown",
              "note": "ativa: quem faz a ação; passiva: quem sofre a ação"
            }
          }
        ],
        "vocab": [
          {
            "en": "statue",
            "pt": "estátua",
            "pos": "noun",
            "field": "objects",
            "tier": "core",
            "part": 1,
            "icon": "🗿",
            "image": "statue.png",
            "example": 1
          },
          {
            "en": "gold",
            "pt": "ouro",
            "pos": "noun",
            "field": "objects",
            "tier": "core",
            "part": 1,
            "icon": "🥇",
            "image": "gold.png",
            "example": 1
          },
          {
            "en": "music",
            "pt": "música",
            "pos": "noun",
            "field": "objects",
            "tier": "core",
            "part": 1,
            "icon": "🎷",
            "image": "music.png",
            "example": 2
          },
          {
            "en": "to bow",
            "pt": "curvar-se",
            "ptAlt": [
              "se curvar",
              "inclinar-se"
            ],
            "pos": "verb",
            "field": "actions",
            "tier": "core",
            "part": 1,
            "icon": "🙇",
            "image": "bow.png",
            "example": 2,
            "note": "bow down = curvar-se até o chão"
          },
          {
            "en": "We will not bow",
            "pt": "Nós não vamos nos curvar",
            "ptAlt": [
              "Não vamos nos curvar"
            ],
            "pos": "chunk",
            "field": "speech",
            "tier": "core",
            "part": 1,
            "icon": "👊",
            "iconic": true,
            "example": 6
          },
          {
            "en": "hot",
            "pt": "quente",
            "pos": "adj",
            "field": "quality",
            "tier": "core",
            "part": 2,
            "icon": "🥵",
            "example": 8
          },
          {
            "en": "to burn",
            "pt": "queimar",
            "pos": "verb",
            "field": "actions",
            "tier": "core",
            "part": 2,
            "icon": "🧨",
            "image": "burn.png",
            "example": 11
          },
          {
            "en": "to throw",
            "pt": "jogar",
            "ptAlt": [
              "lançar",
              "atirar"
            ],
            "pos": "verb",
            "field": "actions",
            "tier": "core",
            "part": 2,
            "icon": "🤾",
            "image": "throw.png",
            "example": 9
          },
          {
            "en": "furnace",
            "pt": "fornalha",
            "pos": "noun",
            "field": "objects",
            "tier": "bible",
            "part": 2,
            "icon": "🌋",
            "image": "furnace.png",
            "example": 8
          },
          {
            "en": "Look! I see four men",
            "pt": "Olhem! Eu vejo quatro homens",
            "ptAlt": [
              "Olha! Eu vejo quatro homens"
            ],
            "pos": "chunk",
            "field": "speech",
            "tier": "core",
            "part": 2,
            "icon": "4️⃣",
            "iconic": true,
            "example": 10
          }
        ],
        "sentences": [
          {
            "en": "King Nebuchadnezzar made a statue of gold",
            "pt": "O rei Nabucodonosor fez uma estátua de ouro",
            "altPt": [
              "O rei Nabucodonosor fez uma imagem de ouro"
            ]
          },
          {
            "en": "Everyone must bow down when the music plays",
            "pt": "Todos devem se curvar quando a música tocar",
            "altPt": [
              "Todos devem se curvar quando a música toca"
            ]
          },
          {
            "en": "They heard the music and bowed to the gold statue",
            "pt": "Eles ouviram a música e se curvaram à estátua de ouro",
            "altPt": [
              "Eles ouviram a música e se curvaram diante da estátua de ouro"
            ]
          },
          {
            "en": "My three friends did not bow to the statue",
            "pt": "Os meus três amigos não se curvaram à estátua",
            "altPt": [
              "Meus três amigos não se curvaram diante da estátua"
            ]
          },
          {
            "en": "The king asked, \"Who can save you from my hands?\"",
            "pt": "O rei perguntou: \"Quem pode salvar vocês das minhas mãos?\"",
            "altPt": [
              "O rei perguntou: \"Quem pode livrar vocês das minhas mãos?\""
            ]
          },
          {
            "en": "They said, \"We will not bow to your statue\"",
            "pt": "Eles disseram: \"Nós não vamos nos curvar à sua estátua\"",
            "altPt": [
              "Eles disseram: \"Não vamos nos curvar diante da sua estátua\""
            ]
          },
          {
            "en": "So the furnace was made seven times hotter than before",
            "pt": "Então a fornalha foi feita sete vezes mais quente do que antes",
            "altPt": [
              "Então a fornalha foi aquecida sete vezes mais do que antes"
            ]
          },
          {
            "en": "The three men were thrown into the hot burning furnace",
            "pt": "Os três homens foram jogados na fornalha quente e ardente",
            "altPt": [
              "Os três homens foram lançados na fornalha quente e ardente"
            ]
          },
          {
            "en": "Even the soldiers who threw them in were killed",
            "pt": "Até os soldados que os jogaram lá dentro foram mortos",
            "altPt": [
              "Até os soldados que os lançaram lá dentro morreram"
            ]
          },
          {
            "en": "Look! I see four men walking in the fire",
            "pt": "Olhem! Eu vejo quatro homens andando no fogo",
            "alt": [
              "Look, I see four men loose, walking in the middle of the fire"
            ],
            "altPt": [
              "Eis que eu vejo quatro homens soltos, que andam passeando dentro do fogo"
            ]
          },
          {
            "en": "Did the fire burn them? No, not even their hair",
            "pt": "O fogo os queimou? Não, nem mesmo o cabelo deles",
            "altPt": [
              "O fogo queimou eles? Não, nem o cabelo deles"
            ]
          },
          {
            "en": "The king said, \"No other god can save like this\"",
            "pt": "O rei disse: \"Nenhum outro deus pode salvar assim\"",
            "altPt": [
              "O rei disse: \"Nenhum outro deus pode livrar assim\""
            ]
          }
        ],
        "beats": [
          {
            "order": 1,
            "en": "King Nebuchadnezzar made a statue of gold",
            "pt": "O rei Nabucodonosor fez uma estátua de ouro",
            "altPt": [
              "O rei Nabucodonosor fez uma imagem de ouro"
            ],
            "kind": "statement",
            "fact": true
          },
          {
            "order": 2,
            "en": "Everyone must bow down when the music plays",
            "pt": "Todos devem se curvar quando a música tocar",
            "altPt": [
              "Todos devem se curvar quando a música toca"
            ],
            "kind": "statement",
            "fact": true
          },
          {
            "order": 3,
            "en": "They heard the music and bowed to the gold statue",
            "pt": "Eles ouviram a música e se curvaram à estátua de ouro",
            "altPt": [
              "Eles ouviram a música e se curvaram diante da estátua de ouro"
            ],
            "kind": "statement",
            "fact": true
          },
          {
            "order": 4,
            "en": "My three friends did not bow to the statue",
            "pt": "Os meus três amigos não se curvaram à estátua",
            "altPt": [
              "Meus três amigos não se curvaram diante da estátua"
            ],
            "kind": "negative",
            "fact": true,
            "speaker": "daniel"
          },
          {
            "order": 5,
            "en": "The king asked, \"Who can save you from my hands?\"",
            "pt": "O rei perguntou: \"Quem pode salvar vocês das minhas mãos?\"",
            "altPt": [
              "O rei perguntou: \"Quem pode livrar vocês das minhas mãos?\""
            ],
            "kind": "question",
            "fact": true,
            "speaker": "nabucodonosor"
          },
          {
            "order": 6,
            "en": "They said, \"We will not bow to your statue\"",
            "pt": "Eles disseram: \"Nós não vamos nos curvar à sua estátua\"",
            "altPt": [
              "Eles disseram: \"Não vamos nos curvar diante da sua estátua\""
            ],
            "kind": "negative",
            "fact": true,
            "iconic": true,
            "gap": {
              "word": "will",
              "kind": "grammar",
              "options": [
                "will",
                "would",
                "must"
              ]
            },
            "grammar": "will-not"
          },
          {
            "order": 7,
            "en": "So the furnace was made seven times hotter than before",
            "pt": "Então a fornalha foi feita sete vezes mais quente do que antes",
            "altPt": [
              "Então a fornalha foi aquecida sete vezes mais do que antes"
            ],
            "kind": "statement",
            "fact": true,
            "grammar": "passive-past"
          },
          {
            "order": 8,
            "en": "The three men were thrown into the hot burning furnace",
            "pt": "Os três homens foram jogados na fornalha quente e ardente",
            "altPt": [
              "Os três homens foram lançados na fornalha quente e ardente"
            ],
            "kind": "statement",
            "fact": true,
            "gap": {
              "word": "were",
              "kind": "grammar",
              "options": [
                "were",
                "was",
                "are"
              ]
            },
            "grammar": "passive-past"
          },
          {
            "order": 9,
            "en": "Even the soldiers who threw them in were killed",
            "pt": "Até os soldados que os jogaram lá dentro foram mortos",
            "altPt": [
              "Até os soldados que os lançaram lá dentro morreram"
            ],
            "kind": "statement",
            "fact": true,
            "grammar": "passive-past"
          },
          {
            "order": 10,
            "en": "Look! I see four men walking in the fire",
            "pt": "Olhem! Eu vejo quatro homens andando no fogo",
            "alt": [
              "Look, I see four men loose, walking in the middle of the fire"
            ],
            "altPt": [
              "Eis que eu vejo quatro homens soltos, que andam passeando dentro do fogo"
            ],
            "kind": "quote",
            "fact": true,
            "iconic": true,
            "speaker": "nabucodonosor"
          },
          {
            "order": 11,
            "en": "Did the fire burn them? No, not even their hair",
            "pt": "O fogo os queimou? Não, nem mesmo o cabelo deles",
            "altPt": [
              "O fogo queimou eles? Não, nem o cabelo deles"
            ],
            "kind": "question",
            "fact": true
          },
          {
            "order": 12,
            "en": "The king said, \"No other god can save like this\"",
            "pt": "O rei disse: \"Nenhum outro deus pode salvar assim\"",
            "altPt": [
              "O rei disse: \"Nenhum outro deus pode livrar assim\""
            ],
            "kind": "negative",
            "fact": true,
            "speaker": "nabucodonosor"
          }
        ],
        "contrast": [
          {
            "a": "They said, \"We will not bow to your statue\"",
            "b": "They said, \"We will bow to your statue\"",
            "note": "will not = recusa firme; will = aceitação"
          },
          {
            "a": "The three men were thrown into the hot burning furnace",
            "b": "The soldiers threw the three men into the hot burning furnace",
            "note": "were thrown = passiva (eles sofrem a ação); threw = ativa (os soldados fazem a ação)"
          }
        ],
        "verse": {
          "text": "Our God whom we serve is able to deliver us from the burning fiery furnace.",
          "classic": "Our God whom we serve is able to deliver us from the burning fiery furnace.",
          "pt": "O nosso Deus, a quem servimos, pode nos livrar da fornalha de fogo ardente.",
          "classicPt": "O nosso Deus, a quem nós servimos, é que nos pode livrar; ele nos livrará da fornalha de fogo ardente.",
          "ref": "Daniel 3:17",
          "blank": "deliver",
          "options": [
            "deliver",
            "take",
            "hide",
            "call"
          ],
          "blanks": [
            {
              "word": "deliver",
              "options": [
                "deliver",
                "take",
                "hide",
                "call"
              ]
            },
            {
              "word": "furnace",
              "options": [
                "furnace",
                "prison",
                "river",
                "cave"
              ]
            },
            {
              "word": "serve",
              "options": [
                "serve",
                "love",
                "fear",
                "know"
              ]
            }
          ]
        },
        "reading": {
          "text": "King Nebuchadnezzar made a great statue of gold, and everyone had to bow down when the music played. But Shadrach, Meshach and Abednego did not bow. They said, \"Our God can save us from the furnace, but even if he does not, we will not bow.\" The king was very angry, and the three men were thrown into the hot furnace. Then the king saw four men walking in the fire, and the fire did not burn them.",
          "pt": "O rei Nabucodonosor fez uma grande estátua de ouro, e todos tinham de se curvar quando a música tocava. Mas Sadraque, Mesaque e Abede-Nego não se curvaram. Eles disseram: \"O nosso Deus pode nos salvar da fornalha, mas, mesmo que ele não salve, nós não vamos nos curvar.\" O rei ficou muito bravo, e os três homens foram lançados na fornalha quente. Então o rei viu quatro homens andando no fogo, e o fogo não os queimou.",
          "q": "What did the three men say to the king?",
          "options": [
            "They would not bow, with or without God's help",
            "They would bow only after the music stopped",
            "They would leave Babylon and go back home"
          ],
          "answer": "They would not bow, with or without God's help",
          "questions": [
            {
              "kind": "literal",
              "q": "What did the three men say to the king?",
              "qPt": "O que os três homens disseram ao rei?",
              "options": [
                "They would not bow, with or without God's help",
                "They would bow only after the music stopped",
                "They would leave Babylon and go back home"
              ],
              "answer": "They would not bow, with or without God's help"
            },
            {
              "kind": "inference",
              "q": "Why did the king see four men in the fire?",
              "qPt": "Por que o rei viu quatro homens no fogo?",
              "options": [
                "God sent someone to be with the three men",
                "One soldier fell into the furnace with them",
                "The king was angry and could not count well"
              ],
              "answer": "God sent someone to be with the three men",
              "explain": "O rei viu um quarto homem no fogo, parecido com um filho dos deuses, e depois disse que Deus enviou o seu anjo para livrar os servos (Daniel 3:25, 28)."
            }
          ]
        },
        "dialogue": {
          "line": "Is it true? You don't serve my gods and you don't bow to my statue?",
          "pt": "É verdade? Vocês não servem aos meus deuses e não se curvam à minha estátua?",
          "options": [
            "It's true, my king. We will not bow to your statue.",
            "It's true, my king. We will bow when the music plays.",
            "No, my king. We bow to your statue every day."
          ],
          "answer": "It's true, my king. We will not bow to your statue.",
          "answerPt": "É verdade, meu rei. Nós não vamos nos curvar à sua estátua."
        },
        "conversation": {
          "with": "nabucodonosor",
          "turns": [
            {
              "who": "nabucodonosor",
              "en": "Is it true? You don't serve my gods and you don't bow to my statue?",
              "pt": "É verdade? Vocês não servem aos meus deuses e não se curvam à minha estátua?",
              "mood": "bravo"
            },
            {
              "who": "you",
              "options": [
                "It's true, my king. We will not bow to your statue.",
                "It's true, my king. We will bow when the music plays.",
                "No, my king. We bow to your statue every day."
              ],
              "answer": "It's true, my king. We will not bow to your statue.",
              "pt": "É verdade, meu rei. Nós não vamos nos curvar à sua estátua.",
              "intent": "Confirme e diga o que vocês não vão fazer"
            },
            {
              "who": "nabucodonosor",
              "en": "Then I will throw you into the hot furnace! Who can save you from my hands?",
              "pt": "Então eu vou jogar vocês na fornalha quente! Quem pode salvar vocês das minhas mãos?",
              "mood": "urgente"
            },
            {
              "who": "you",
              "options": [
                "Our God can save us. But even if he does not, we will not bow.",
                "Our God can save us. So please make the furnace a little hotter.",
                "Nobody can save us. So we will bow to the statue now."
              ],
              "answer": "Our God can save us. But even if he does not, we will not bow.",
              "pt": "O nosso Deus pode nos salvar. Mas, mesmo que ele não salve, nós não vamos nos curvar.",
              "intent": "Diga quem pode salvar vocês e mantenha a decisão",
              "speak": true
            }
          ]
        },
        "quiz": {
          "q": "Why did the king see four men in the fire?",
          "options": [
            "God sent someone to be with the three men",
            "One soldier fell into the furnace with them",
            "The king was angry and could not count well"
          ],
          "answer": "God sent someone to be with the three men",
          "explain": "O rei viu um quarto homem no fogo, parecido com um filho dos deuses, e depois disse que Deus enviou o seu anjo para livrar os servos (Daniel 3:25, 28)."
        },
        "fact": {
          "pt": "A estátua de ouro tinha sessenta côvados de altura e seis de largura, cerca de 27 metros por 2,7, e foi levantada no campo de Dura, na província da Babilônia.",
          "ref": "Daniel 3:1"
        },
        "v": 2
      },
      {
        "id": "u7l3",
        "title": "A cova dos leões",
        "ref": "Daniel 6:1-28",
        "level": "A2.1",
        "narrator": "daniel",
        "guests": [
          "dario"
        ],
        "names": [
          {
            "en": "Daniel",
            "pt": "Daniel",
            "note": "já idoso, líder no reino de Dario"
          },
          {
            "en": "Darius",
            "pt": "Dario",
            "note": "o rei medo que governou a Babilônia depois de Belsazar"
          },
          {
            "en": "Jerusalem",
            "pt": "Jerusalém",
            "note": "Daniel orava voltado para a cidade"
          },
          {
            "en": "God",
            "pt": "Deus"
          }
        ],
        "hints": {
          "leader": "líder",
          "find": "achar, encontrar",
          "new": "nova, novo",
          "change": "mudar",
          "hurt": "machucar, ferir",
          "thrown": "lançado"
        },
        "tips": [
          {
            "part": 1,
            "id": "frequency",
            "grammar": "frequency",
            "title": "every day, three times a day: com que frequência",
            "body": "Para dizer com que frequência algo acontece, use every day (todo dia), once a day, three times a day (três vezes por dia), always, never. A expressão costuma ficar no fim da frase. as before = como antes.",
            "examples": [
              {
                "en": "I prayed three times a day",
                "pt": "Eu orava três vezes por dia"
              },
              {
                "en": "He prayed every day, as before",
                "pt": "Ele orava todo dia, como antes"
              }
            ],
            "contrast": {
              "a": "I pray every day",
              "b": "I pray three times a day",
              "note": "every day = todo dia; three times a day = três vezes por dia"
            }
          },
          {
            "part": 2,
            "id": "could-not",
            "grammar": "could-not",
            "title": "could not, did not: negativas no passado",
            "body": "could not (couldn't) = não podia, não conseguia: The king could not change the law. did not (didn't) nega qualquer outro verbo no passado, e o verbo volta à forma básica: They did not hurt me.",
            "examples": [
              {
                "en": "The king could not change the law",
                "pt": "O rei não podia mudar a lei"
              },
              {
                "en": "The lions did not hurt me",
                "pt": "Os leões não me machucaram"
              }
            ],
            "contrast": {
              "a": "The lions could hurt me",
              "b": "The lions could not hurt me",
              "note": "could = podiam; could not = não podiam"
            }
          }
        ],
        "vocab": [
          {
            "en": "kingdom",
            "pt": "reino",
            "pos": "noun",
            "field": "places",
            "tier": "core",
            "part": 1,
            "icon": "🏰",
            "image": "kingdom.png",
            "example": 1
          },
          {
            "en": "law",
            "pt": "lei",
            "pos": "noun",
            "field": "work",
            "tier": "core",
            "part": 1,
            "icon": "⚖️",
            "image": "law.png",
            "example": 3
          },
          {
            "en": "window",
            "pt": "janela",
            "pos": "noun",
            "field": "objects",
            "tier": "core",
            "part": 1,
            "icon": "🔲",
            "image": "window.png",
            "example": 5
          },
          {
            "en": "open",
            "pt": "aberto",
            "ptAlt": [
              "aberta",
              "abertas"
            ],
            "pos": "adj",
            "field": "quality",
            "tier": "core",
            "part": 1,
            "icon": "🔓",
            "example": 5
          },
          {
            "en": "three times a day",
            "pt": "três vezes por dia",
            "ptAlt": [
              "três vezes ao dia"
            ],
            "pos": "chunk",
            "field": "time",
            "tier": "core",
            "part": 1,
            "icon": "⏰",
            "example": 6
          },
          {
            "en": "lion",
            "pt": "leão",
            "pos": "noun",
            "field": "animals",
            "tier": "core",
            "part": 2,
            "icon": "🦁",
            "image": "lion.png",
            "example": 8
          },
          {
            "en": "den",
            "pt": "cova",
            "ptAlt": [
              "cova dos leões"
            ],
            "pos": "noun",
            "field": "places",
            "tier": "bible",
            "part": 2,
            "icon": "🏚️",
            "image": "den.png",
            "example": 8,
            "note": "a cova dos leões; lions' den"
          },
          {
            "en": "angel",
            "pt": "anjo",
            "pos": "noun",
            "field": "faith",
            "tier": "bible",
            "part": 2,
            "icon": "👼",
            "example": 11
          },
          {
            "en": "mouth",
            "pt": "boca",
            "pos": "noun",
            "field": "body",
            "tier": "core",
            "part": 2,
            "icon": "😮",
            "image": "mouth.png",
            "example": 12
          },
          {
            "en": "Good morning, my king",
            "pt": "Bom dia, meu rei",
            "pos": "chunk",
            "field": "speech",
            "tier": "core",
            "part": 2,
            "icon": "🌞",
            "example": 11
          }
        ],
        "sentences": [
          {
            "en": "King Darius made me a leader in his kingdom",
            "pt": "O rei Dario me fez um líder no reino dele",
            "altPt": [
              "O rei Dario me fez um dos líderes do reino dele"
            ]
          },
          {
            "en": "Did the other men find anything against me? No",
            "pt": "Os outros homens acharam algo contra mim? Não",
            "altPt": [
              "Os outros homens encontraram alguma coisa contra mim? Não"
            ]
          },
          {
            "en": "They asked the king for a law in his kingdom",
            "pt": "Eles pediram ao rei uma lei no reino dele",
            "altPt": [
              "Eles pediram ao rei uma nova lei no reino dele"
            ]
          },
          {
            "en": "The law said, \"Pray only to the king for thirty days\"",
            "pt": "A lei dizia: \"Orem só ao rei por trinta dias\"",
            "altPt": [
              "A lei dizia: \"Orem somente ao rei por trinta dias\""
            ]
          },
          {
            "en": "My windows were open toward Jerusalem",
            "pt": "As minhas janelas estavam abertas para Jerusalém",
            "altPt": [
              "Minhas janelas estavam abertas na direção de Jerusalém"
            ]
          },
          {
            "en": "I prayed three times a day with my windows open",
            "pt": "Eu orava três vezes por dia com as janelas abertas",
            "altPt": [
              "Eu orava três vezes ao dia com as minhas janelas abertas"
            ]
          },
          {
            "en": "The king could not change the law of his kingdom",
            "pt": "O rei não podia mudar a lei do reino dele",
            "altPt": [
              "O rei não conseguia mudar a lei do reino dele"
            ]
          },
          {
            "en": "They threw me into the den of lions",
            "pt": "Eles me jogaram na cova dos leões",
            "altPt": [
              "Eles me lançaram na cova dos leões"
            ]
          },
          {
            "en": "A stone was put on the mouth of the den",
            "pt": "Uma pedra foi posta na boca da cova",
            "altPt": [
              "Uma pedra foi colocada na boca da cova"
            ]
          },
          {
            "en": "\"Daniel, did your God save you from the lions?\"",
            "pt": "\"Daniel, o seu Deus salvou você dos leões?\"",
            "alt": [
              "Daniel, was your God able to save you from the lions?"
            ],
            "altPt": [
              "\"Daniel, o teu Deus pôde livrar-te dos leões?\""
            ]
          },
          {
            "en": "\"Good morning, my king. God sent his angel to me\"",
            "pt": "\"Bom dia, meu rei. Deus enviou o anjo dele para mim\"",
            "altPt": [
              "\"Bom dia, meu rei. Deus me enviou o seu anjo\""
            ]
          },
          {
            "en": "The angel closed their mouths. They could not hurt me",
            "pt": "O anjo fechou a boca deles. Eles não puderam me machucar",
            "altPt": [
              "O anjo fechou a boca dos leões. Eles não me fizeram mal"
            ]
          }
        ],
        "beats": [
          {
            "order": 1,
            "en": "King Darius made me a leader in his kingdom",
            "pt": "O rei Dario me fez um líder no reino dele",
            "altPt": [
              "O rei Dario me fez um dos líderes do reino dele"
            ],
            "kind": "first-person",
            "fact": true,
            "speaker": "daniel"
          },
          {
            "order": 2,
            "en": "Did the other men find anything against me? No",
            "pt": "Os outros homens acharam algo contra mim? Não",
            "altPt": [
              "Os outros homens encontraram alguma coisa contra mim? Não"
            ],
            "kind": "question",
            "fact": true,
            "speaker": "daniel"
          },
          {
            "order": 3,
            "en": "They asked the king for a law in his kingdom",
            "pt": "Eles pediram ao rei uma lei no reino dele",
            "altPt": [
              "Eles pediram ao rei uma nova lei no reino dele"
            ],
            "kind": "statement",
            "fact": true
          },
          {
            "order": 4,
            "en": "The law said, \"Pray only to the king for thirty days\"",
            "pt": "A lei dizia: \"Orem só ao rei por trinta dias\"",
            "altPt": [
              "A lei dizia: \"Orem somente ao rei por trinta dias\""
            ],
            "kind": "quote",
            "fact": true,
            "prod": false
          },
          {
            "order": 5,
            "en": "My windows were open toward Jerusalem",
            "pt": "As minhas janelas estavam abertas para Jerusalém",
            "altPt": [
              "Minhas janelas estavam abertas na direção de Jerusalém"
            ],
            "kind": "first-person",
            "fact": true,
            "speaker": "daniel"
          },
          {
            "order": 6,
            "en": "I prayed three times a day with my windows open",
            "pt": "Eu orava três vezes por dia com as janelas abertas",
            "altPt": [
              "Eu orava três vezes ao dia com as minhas janelas abertas"
            ],
            "kind": "first-person",
            "fact": true,
            "speaker": "daniel",
            "gap": {
              "word": "three times a day",
              "kind": "grammar",
              "options": [
                "three times a day",
                "every day",
                "as before"
              ]
            },
            "grammar": "frequency"
          },
          {
            "order": 7,
            "en": "The king could not change the law of his kingdom",
            "pt": "O rei não podia mudar a lei do reino dele",
            "altPt": [
              "O rei não conseguia mudar a lei do reino dele"
            ],
            "kind": "negative",
            "fact": true,
            "gap": {
              "word": "could",
              "kind": "grammar",
              "options": [
                "could",
                "would",
                "must"
              ]
            },
            "grammar": "could-not"
          },
          {
            "order": 8,
            "en": "They threw me into the den of lions",
            "pt": "Eles me jogaram na cova dos leões",
            "altPt": [
              "Eles me lançaram na cova dos leões"
            ],
            "kind": "first-person",
            "fact": true,
            "speaker": "daniel"
          },
          {
            "order": 9,
            "en": "A stone was put on the mouth of the den",
            "pt": "Uma pedra foi posta na boca da cova",
            "altPt": [
              "Uma pedra foi colocada na boca da cova"
            ],
            "kind": "statement",
            "fact": true
          },
          {
            "order": 10,
            "en": "\"Daniel, did your God save you from the lions?\"",
            "pt": "\"Daniel, o seu Deus salvou você dos leões?\"",
            "alt": [
              "Daniel, was your God able to save you from the lions?"
            ],
            "altPt": [
              "\"Daniel, o teu Deus pôde livrar-te dos leões?\""
            ],
            "kind": "question",
            "fact": true,
            "speaker": "dario"
          },
          {
            "order": 11,
            "en": "\"Good morning, my king. God sent his angel to me\"",
            "pt": "\"Bom dia, meu rei. Deus enviou o anjo dele para mim\"",
            "altPt": [
              "\"Bom dia, meu rei. Deus me enviou o seu anjo\""
            ],
            "kind": "first-person",
            "fact": true,
            "speaker": "daniel"
          },
          {
            "order": 12,
            "en": "The angel closed their mouths. They could not hurt me",
            "pt": "O anjo fechou a boca deles. Eles não puderam me machucar",
            "altPt": [
              "O anjo fechou a boca dos leões. Eles não me fizeram mal"
            ],
            "kind": "negative",
            "fact": true,
            "speaker": "daniel",
            "grammar": "could-not"
          }
        ],
        "contrast": [
          {
            "a": "I prayed three times a day with my windows open",
            "b": "I prayed every day with my windows open",
            "note": "three times a day = três vezes por dia; every day = todo dia"
          },
          {
            "a": "The king could not change the law of his kingdom",
            "b": "The king could change the law of his kingdom",
            "note": "could not = não podia; could = podia"
          }
        ],
        "verse": {
          "text": "My God has sent his angel, and has shut the lions' mouths, and they have not hurt me.",
          "classic": "My God hath sent his angel, and hath shut the lions' mouths, that they have not hurt me.",
          "pt": "O meu Deus enviou o seu anjo e fechou a boca dos leões, e eles não me machucaram.",
          "classicPt": "O meu Deus enviou o seu anjo, e fechou a boca dos leões, para que não me fizessem dano.",
          "ref": "Daniel 6:22",
          "blank": "angel",
          "options": [
            "angel",
            "servant",
            "friend",
            "son"
          ],
          "blanks": [
            {
              "word": "angel",
              "options": [
                "angel",
                "servant",
                "friend",
                "son"
              ]
            },
            {
              "word": "mouths",
              "options": [
                "mouths",
                "eyes",
                "hands",
                "feet"
              ]
            },
            {
              "word": "hurt",
              "options": [
                "hurt",
                "seen",
                "killed",
                "heard"
              ]
            }
          ]
        },
        "reading": {
          "text": "King Darius put Daniel over many men in his kingdom. The other men could not find anything against him, so they asked the king for a law: for thirty days, pray only to the king. Daniel prayed three times a day with his windows open, as before. The king could do nothing, and Daniel was thrown into the den of lions. But God sent his angel and closed the lions' mouths.",
          "pt": "O rei Dario pôs Daniel acima de muitos homens no reino dele. Os outros homens não conseguiram achar nada contra ele, então pediram ao rei uma lei: por trinta dias, orar só ao rei. Daniel orava três vezes por dia com as janelas abertas, como antes. O rei não pôde fazer nada, e Daniel foi jogado na cova dos leões. Mas Deus enviou o seu anjo e fechou a boca dos leões.",
          "q": "What did the new law say?",
          "options": [
            "Pray to the king alone for a month",
            "Open your windows toward Jerusalem every day",
            "Throw every leader to the lions"
          ],
          "answer": "Pray to the king alone for a month",
          "questions": [
            {
              "kind": "literal",
              "q": "What did the new law say?",
              "qPt": "O que a nova lei dizia?",
              "options": [
                "Pray to the king alone for a month",
                "Open your windows toward Jerusalem every day",
                "Throw every leader to the lions"
              ],
              "answer": "Pray to the king alone for a month"
            },
            {
              "kind": "inference",
              "q": "Why did the men ask the king for this law?",
              "qPt": "Por que os homens pediram essa lei ao rei?",
              "options": [
                "To find something against Daniel",
                "Because the king wanted more prayers",
                "Because Daniel asked them for it"
              ],
              "answer": "To find something against Daniel",
              "explain": "Eles não achavam nenhuma falha em Daniel e só podiam acusá-lo por causa da lei do seu Deus; por isso pediram o decreto (Daniel 6:4-7)."
            }
          ]
        },
        "dialogue": {
          "line": "Daniel, servant of the living God! Did your God save you from the lions?",
          "pt": "Daniel, servo do Deus vivo! O seu Deus salvou você dos leões?",
          "options": [
            "Good morning, my king. God sent his angel to me.",
            "Good morning, my king. The lions are sleeping now.",
            "Good morning, my king. I opened the den and ran."
          ],
          "answer": "Good morning, my king. God sent his angel to me.",
          "answerPt": "Bom dia, meu rei. Deus enviou o anjo dele para mim."
        },
        "conversation": {
          "with": "dario",
          "turns": [
            {
              "who": "dario",
              "en": "Daniel, servant of the living God! Did your God save you from the lions?",
              "pt": "Daniel, servo do Deus vivo! O seu Deus salvou você dos leões?",
              "mood": "urgente"
            },
            {
              "who": "you",
              "options": [
                "Good morning, my king. God sent his angel to me.",
                "Good morning, my king. The lions are sleeping now.",
                "Good morning, my king. I opened the den and ran."
              ],
              "answer": "Good morning, my king. God sent his angel to me.",
              "pt": "Bom dia, meu rei. Deus enviou o anjo dele para mim.",
              "intent": "Cumprimente o rei e diga quem o salvou"
            },
            {
              "who": "dario",
              "en": "Then come out of the den! Did the lions hurt you?",
              "pt": "Então saia da cova! Os leões machucaram você?",
              "mood": "animado"
            },
            {
              "who": "you",
              "options": [
                "No, my king. The lions could not hurt me.",
                "Yes, my king. Now open the den, please.",
                "No, my king. I closed the den with a stone."
              ],
              "answer": "No, my king. The lions could not hurt me.",
              "pt": "Não, meu rei. Os leões não puderam me machucar.",
              "intent": "Responda e diga como você está",
              "speak": true
            }
          ]
        },
        "quiz": {
          "q": "Why did the men ask the king for this law?",
          "options": [
            "To find something against Daniel",
            "Because the king wanted more prayers",
            "Because Daniel asked them for it"
          ],
          "answer": "To find something against Daniel",
          "explain": "Eles não achavam nenhuma falha em Daniel e só podiam acusá-lo por causa da lei do seu Deus; por isso pediram o decreto (Daniel 6:4-7)."
        },
        "fact": {
          "pt": "Enquanto Daniel estava na cova, o rei Dario passou a noite em jejum no palácio, sem música e sem conseguir dormir.",
          "ref": "Daniel 6:18"
        },
        "v": 2
      },
      {
        "id": "u7r",
        "title": "Revisão",
        "review": true,
        "checkpoint": true
      }
    ]
  },
  {
    "id": "u8",
    "title": "Pedro e Jesus",
    "subtitle": "Mateus 4-16; Lucas 5; João 21",
    "icon": "🐟",
    "face": "pedro",
    "color": "#1cb0f6",
    "level": "A2.1",
    "v": 2,
    "lessons": [
      {
        "id": "u8l1",
        "title": "Pescadores de homens",
        "ref": "Mateus 4:18-23; Lucas 5:1-11",
        "level": "A2.1",
        "narrator": "pedro",
        "guests": [
          "jesus"
        ],
        "names": [
          {
            "en": "Jesus",
            "pt": "Jesus"
          },
          {
            "en": "Simon",
            "pt": "Simão",
            "note": "o nome de Pedro antes de Jesus o chamar de Pedro (João 1:42)"
          },
          {
            "en": "Peter",
            "pt": "Pedro",
            "note": "narra a unidade"
          },
          {
            "en": "Andrew",
            "pt": "André",
            "note": "irmão de Pedro"
          },
          {
            "en": "James",
            "pt": "Tiago",
            "note": "filho de Zebedeu"
          },
          {
            "en": "John",
            "pt": "João",
            "note": "irmão de Tiago"
          },
          {
            "en": "Zebedee",
            "pt": "Zebedeu",
            "note": "pai de Tiago e João"
          },
          {
            "en": "Sea of Galilee",
            "pt": "mar da Galileia"
          },
          {
            "en": "God",
            "pt": "Deus"
          },
          {
            "en": "the Lord",
            "pt": "o Senhor"
          }
        ],
        "hints": {
          "casting": "lançando",
          "fishers": "pescadores",
          "immediately": "imediatamente, na hora",
          "taught": "ensinou",
          "full": "cheio, cheios",
          "Master": "Mestre"
        },
        "tips": [
          {
            "part": 1,
            "id": "imperative-will",
            "grammar": "imperative-will",
            "title": "Follow me, and I will...: ordem + promessa",
            "body": "O imperativo é o verbo sem sujeito: Follow me (Siga-me), Come (Venha). Para dizer o que vai acontecer depois, use will + verbo: I will make you fishers of men. Juntos, formam um convite com promessa: faça isto, e eu farei aquilo.",
            "examples": [
              {
                "en": "Follow me",
                "pt": "Siga-me"
              },
              {
                "en": "Follow me, and I will make you fishers of men",
                "pt": "Sigam-me, e eu farei de vocês pescadores de homens"
              }
            ],
            "contrast": {
              "a": "I will make you fishers of men",
              "b": "I make you fishers of men",
              "note": "will = promessa para depois; sem will = agora, hábito"
            }
          },
          {
            "part": 2,
            "id": "time-expressions",
            "grammar": "time-expressions",
            "title": "all night, now, immediately: quando aconteceu",
            "body": "Expressões de tempo dizem quando algo acontece: all night (a noite toda), all day (o dia todo), now (agora), from now on (de agora em diante), immediately (imediatamente). Em geral ficam no fim ou no começo da frase: We worked all night. From now on you will catch people.",
            "examples": [
              {
                "en": "We worked all night",
                "pt": "Trabalhamos a noite toda"
              },
              {
                "en": "From now on you will catch people",
                "pt": "De agora em diante você vai pescar pessoas"
              }
            ],
            "contrast": {
              "a": "We worked all night",
              "b": "We worked all day",
              "note": "night/day: só muda o período do dia"
            }
          }
        ],
        "vocab": [
          {
            "en": "net",
            "pt": "rede",
            "pos": "noun",
            "field": "work",
            "tier": "core",
            "part": 1,
            "icon": "🕸️",
            "example": 2
          },
          {
            "en": "fisherman",
            "pt": "pescador",
            "plural": "fishermen",
            "forms": [
              "fishermen"
            ],
            "pos": "noun",
            "field": "work",
            "tier": "core",
            "part": 1,
            "icon": "🚣",
            "example": 3
          },
          {
            "en": "to follow",
            "pt": "seguir",
            "pos": "verb",
            "field": "actions",
            "tier": "core",
            "part": 1,
            "icon": "👣",
            "example": 5
          },
          {
            "en": "to leave",
            "pt": "deixar",
            "ptAlt": [
              "sair",
              "partir"
            ],
            "pos": "verb",
            "field": "actions",
            "tier": "core",
            "part": 1,
            "icon": "🏃",
            "example": 5
          },
          {
            "en": "Follow me",
            "pt": "Siga-me",
            "ptAlt": [
              "Sigam-me",
              "Me siga",
              "Venha comigo"
            ],
            "pos": "chunk",
            "field": "speech",
            "tier": "core",
            "part": 1,
            "icon": "➡️",
            "iconic": true,
            "example": 4
          },
          {
            "en": "boat",
            "pt": "barco",
            "pos": "noun",
            "field": "objects",
            "tier": "core",
            "part": 2,
            "icon": "⛵",
            "example": 8
          },
          {
            "en": "fish",
            "pt": "peixe",
            "ptAlt": [
              "peixes"
            ],
            "pos": "noun",
            "field": "animals",
            "tier": "core",
            "part": 2,
            "icon": "🐟",
            "example": 7,
            "note": "o plural também é fish"
          },
          {
            "en": "word",
            "pt": "palavra",
            "pos": "noun",
            "field": "speech",
            "tier": "core",
            "part": 2,
            "icon": "🔤",
            "example": 10
          },
          {
            "en": "to catch",
            "pt": "pegar",
            "ptAlt": [
              "pescar",
              "apanhar"
            ],
            "pos": "verb",
            "field": "actions",
            "tier": "core",
            "part": 2,
            "icon": "🤏",
            "example": 7
          },
          {
            "en": "We worked all night",
            "pt": "Trabalhamos a noite toda",
            "ptAlt": [
              "Nós trabalhamos a noite inteira",
              "Trabalhamos a noite inteira"
            ],
            "pos": "chunk",
            "field": "speech",
            "tier": "core",
            "part": 2,
            "icon": "🕛",
            "iconic": true,
            "example": 7
          }
        ],
        "sentences": [
          {
            "en": "Jesus walked by the Sea of Galilee",
            "pt": "Jesus andava à beira do mar da Galileia",
            "altPt": [
              "Jesus andava junto ao mar da Galileia"
            ]
          },
          {
            "en": "Who did he see? Two fishermen casting a net",
            "pt": "Quem ele viu? Dois pescadores lançando uma rede"
          },
          {
            "en": "My brother Andrew and I were fishermen",
            "pt": "Meu irmão André e eu éramos pescadores"
          },
          {
            "en": "Follow me, and I will make you fishers of men",
            "pt": "Sigam-me, e eu farei de vocês pescadores de homens",
            "alt": [
              "Come after me, and I will make you fishers for men"
            ],
            "altPt": [
              "Vinde após mim, e eu vos farei pescadores de homens",
              "Venham comigo, e eu farei de vocês pescadores de homens"
            ]
          },
          {
            "en": "We left our nets and followed him immediately",
            "pt": "Nós deixamos as redes e o seguimos imediatamente",
            "altPt": [
              "Deixamos as redes e seguimos Jesus na hora",
              "Nós deixamos as nossas redes e o seguimos na hora"
            ]
          },
          {
            "en": "James and John also left their boat and their father",
            "pt": "Tiago e João também deixaram o barco e o pai deles",
            "altPt": [
              "Tiago e João também deixaram o barco e o seu pai"
            ]
          },
          {
            "en": "We worked all night and did not catch any fish",
            "pt": "Trabalhamos a noite toda e não pegamos nenhum peixe",
            "altPt": [
              "Nós trabalhamos a noite inteira e não pescamos nada",
              "Trabalhamos a noite toda e não pescamos nenhum peixe"
            ]
          },
          {
            "en": "Then Jesus taught the word of God from my boat",
            "pt": "Depois Jesus ensinou a palavra de Deus do meu barco"
          },
          {
            "en": "He said, \"Let down your nets for a catch\"",
            "pt": "Ele disse: \"Lancem as redes para pescar\"",
            "altPt": [
              "Ele disse: \"Lançai as vossas redes para pescar\"",
              "Ele disse: \"Soltem as redes para a pesca\""
            ]
          },
          {
            "en": "At your word I will let down the net",
            "pt": "Pela sua palavra eu vou lançar a rede",
            "altPt": [
              "Sobre a tua palavra lançarei a rede",
              "Pela sua palavra lançarei a rede"
            ]
          },
          {
            "en": "Did we catch fish? Yes, both boats were full",
            "pt": "Nós pegamos peixes? Sim, os dois barcos ficaram cheios",
            "altPt": [
              "Pescamos alguma coisa? Sim, os dois barcos ficaram cheios"
            ]
          },
          {
            "en": "Don't be afraid. From now on you will catch people",
            "pt": "Não tenha medo. De agora em diante você vai pescar pessoas",
            "alt": [
              "Do not be afraid. From now on you will catch people"
            ],
            "altPt": [
              "Não temas; de agora em diante serás pescador de homens",
              "Não tenha medo. De agora em diante você vai pescar gente"
            ]
          }
        ],
        "beats": [
          {
            "order": 1,
            "en": "Jesus walked by the Sea of Galilee",
            "pt": "Jesus andava à beira do mar da Galileia",
            "altPt": [
              "Jesus andava junto ao mar da Galileia"
            ],
            "kind": "statement",
            "fact": true
          },
          {
            "order": 2,
            "en": "Who did he see? Two fishermen casting a net",
            "pt": "Quem ele viu? Dois pescadores lançando uma rede",
            "kind": "question",
            "fact": true
          },
          {
            "order": 3,
            "en": "My brother Andrew and I were fishermen",
            "pt": "Meu irmão André e eu éramos pescadores",
            "kind": "first-person",
            "fact": true,
            "speaker": "pedro"
          },
          {
            "order": 4,
            "en": "Follow me, and I will make you fishers of men",
            "pt": "Sigam-me, e eu farei de vocês pescadores de homens",
            "alt": [
              "Come after me, and I will make you fishers for men"
            ],
            "altPt": [
              "Vinde após mim, e eu vos farei pescadores de homens",
              "Venham comigo, e eu farei de vocês pescadores de homens"
            ],
            "kind": "quote",
            "fact": true,
            "iconic": true,
            "speaker": "jesus",
            "gap": {
              "word": "will",
              "kind": "grammar",
              "options": [
                "will",
                "can",
                "must"
              ]
            },
            "grammar": "imperative-will"
          },
          {
            "order": 5,
            "en": "We left our nets and followed him immediately",
            "pt": "Nós deixamos as redes e o seguimos imediatamente",
            "altPt": [
              "Deixamos as redes e seguimos Jesus na hora",
              "Nós deixamos as nossas redes e o seguimos na hora"
            ],
            "kind": "first-person",
            "fact": true,
            "speaker": "pedro"
          },
          {
            "order": 6,
            "en": "James and John also left their boat and their father",
            "pt": "Tiago e João também deixaram o barco e o pai deles",
            "altPt": [
              "Tiago e João também deixaram o barco e o seu pai"
            ],
            "kind": "statement",
            "fact": true
          },
          {
            "order": 7,
            "en": "We worked all night and did not catch any fish",
            "pt": "Trabalhamos a noite toda e não pegamos nenhum peixe",
            "altPt": [
              "Nós trabalhamos a noite inteira e não pescamos nada",
              "Trabalhamos a noite toda e não pescamos nenhum peixe"
            ],
            "kind": "negative",
            "fact": true,
            "iconic": true,
            "speaker": "pedro",
            "gap": {
              "word": "all",
              "kind": "grammar",
              "options": [
                "all",
                "only",
                "also"
              ]
            },
            "grammar": "time-expressions"
          },
          {
            "order": 8,
            "en": "Then Jesus taught the word of God from my boat",
            "pt": "Depois Jesus ensinou a palavra de Deus do meu barco",
            "kind": "statement",
            "fact": true,
            "speaker": "pedro"
          },
          {
            "order": 9,
            "en": "He said, \"Let down your nets for a catch\"",
            "pt": "Ele disse: \"Lancem as redes para pescar\"",
            "altPt": [
              "Ele disse: \"Lançai as vossas redes para pescar\"",
              "Ele disse: \"Soltem as redes para a pesca\""
            ],
            "kind": "quote",
            "fact": true,
            "speaker": "jesus"
          },
          {
            "order": 10,
            "en": "At your word I will let down the net",
            "pt": "Pela sua palavra eu vou lançar a rede",
            "altPt": [
              "Sobre a tua palavra lançarei a rede",
              "Pela sua palavra lançarei a rede"
            ],
            "kind": "first-person",
            "fact": true,
            "iconic": true,
            "speaker": "pedro"
          },
          {
            "order": 11,
            "en": "Did we catch fish? Yes, both boats were full",
            "pt": "Nós pegamos peixes? Sim, os dois barcos ficaram cheios",
            "altPt": [
              "Pescamos alguma coisa? Sim, os dois barcos ficaram cheios"
            ],
            "kind": "question",
            "fact": true,
            "speaker": "pedro"
          },
          {
            "order": 12,
            "en": "Don't be afraid. From now on you will catch people",
            "pt": "Não tenha medo. De agora em diante você vai pescar pessoas",
            "alt": [
              "Do not be afraid. From now on you will catch people"
            ],
            "altPt": [
              "Não temas; de agora em diante serás pescador de homens",
              "Não tenha medo. De agora em diante você vai pescar gente"
            ],
            "kind": "quote",
            "fact": true,
            "iconic": true,
            "speaker": "jesus"
          }
        ],
        "contrast": [
          {
            "a": "We worked all night and did not catch any fish",
            "b": "We worked all night and caught many fish",
            "note": "did not catch = negativa no passado; caught = afirmativa no passado (a expressão de tempo não muda, Dica 2)"
          },
          {
            "a": "Follow me, and I will make you fishers of men",
            "b": "Come with me, and I will make you fishers of men",
            "note": "Follow me / Come with me: dois imperativos com o mesmo convite (Dica 1)"
          }
        ],
        "verse": {
          "text": "Follow me, and I will make you fishers of men.",
          "classic": "Follow me, and I will make you fishers of men.",
          "pt": "Sigam-me, e eu farei de vocês pescadores de homens.",
          "classicPt": "Vinde após mim, e eu vos farei pescadores de homens.",
          "ref": "Mateus 4:19",
          "blank": "Follow",
          "options": [
            "Follow",
            "Leave",
            "Call",
            "Send"
          ],
          "blanks": [
            {
              "word": "Follow",
              "options": [
                "Follow",
                "Leave",
                "Call",
                "Send"
              ]
            },
            {
              "word": "fishers",
              "options": [
                "fishers",
                "friends",
                "servants",
                "brothers"
              ]
            },
            {
              "word": "men",
              "options": [
                "men",
                "fish",
                "boats",
                "nets"
              ]
            }
          ]
        },
        "reading": {
          "text": "Jesus walked by the Sea of Galilee and saw two fishermen, Simon and Andrew. He said, \"Follow me, and I will make you fishers of men.\" They left their nets and followed him. Later, Simon worked all night and caught nothing, but at the word of Jesus he let down the net again. He caught so many fish that two boats were full.",
          "pt": "Jesus andava à beira do mar da Galileia e viu dois pescadores, Simão e André. Ele disse: \"Sigam-me, e eu farei de vocês pescadores de homens.\" Eles deixaram as redes e o seguiram. Mais tarde, Simão trabalhou a noite toda e não pegou nada, mas pela palavra de Jesus ele lançou a rede de novo. Ele pegou tantos peixes que dois barcos ficaram cheios.",
          "q": "What did Simon and Andrew do when Jesus called them?",
          "options": [
            "They stopped fishing and went with him",
            "They finished their work and went home",
            "They asked him to get into their boat"
          ],
          "answer": "They stopped fishing and went with him",
          "questions": [
            {
              "kind": "literal",
              "q": "What did Simon and Andrew do when Jesus called them?",
              "qPt": "O que Simão e André fizeram quando Jesus os chamou?",
              "options": [
                "They stopped fishing and went with him",
                "They finished their work and went home",
                "They asked him to get into their boat"
              ],
              "answer": "They stopped fishing and went with him"
            },
            {
              "kind": "inference",
              "q": "Why did Simon let down the net again?",
              "qPt": "Por que Simão lançou a rede de novo?",
              "options": [
                "Because he trusted what Jesus said",
                "Because he saw many fish in the water",
                "Because the night was over and it was day"
              ],
              "answer": "Because he trusted what Jesus said",
              "explain": "Simão disse que tinham trabalhado a noite toda sem pegar nada, mas que lançaria a rede pela palavra de Jesus (Lucas 5:5)."
            }
          ]
        },
        "dialogue": {
          "line": "Simon, follow me, and I will make you fishers of men.",
          "pt": "Simão, siga-me, e eu farei de vocês pescadores de homens.",
          "options": [
            "Yes, Lord. I will leave my net and follow you.",
            "Yes, Lord. I will catch more fish for you.",
            "Not now, Lord. I will finish my work first."
          ],
          "answer": "Yes, Lord. I will leave my net and follow you.",
          "answerPt": "Sim, Senhor. Vou deixar a minha rede e seguir você."
        },
        "conversation": {
          "with": "jesus",
          "turns": [
            {
              "who": "jesus",
              "en": "Simon, follow me, and I will make you fishers of men.",
              "pt": "Simão, siga-me, e eu farei de vocês pescadores de homens.",
              "mood": "calmo",
              "fact": true,
              "ref": "Mateus 4:19"
            },
            {
              "who": "you",
              "options": [
                "Yes, Lord. I will leave my net and follow you.",
                "Yes, Lord. I will catch more fish for you.",
                "Not now, Lord. I will finish my work first."
              ],
              "answer": "Yes, Lord. I will leave my net and follow you.",
              "pt": "Sim, Senhor. Vou deixar a minha rede e seguir você.",
              "intent": "Aceite o convite e diga o que vai deixar"
            },
            {
              "who": "jesus",
              "en": "Let down your nets for a catch.",
              "pt": "Lancem as redes para pescar.",
              "mood": "calmo",
              "fact": true,
              "ref": "Lucas 5:4"
            },
            {
              "who": "you",
              "options": [
                "We worked all night and caught nothing. But at your word, I will.",
                "We worked all night and caught many fish. The boats are full.",
                "We worked all night, Master. Now we need to sleep."
              ],
              "answer": "We worked all night and caught nothing. But at your word, I will.",
              "pt": "Trabalhamos a noite toda e não pegamos nada. Mas pela sua palavra, eu vou lançar.",
              "intent": "Conte como foi a noite e obedeça mesmo assim",
              "speak": true
            }
          ]
        },
        "quiz": {
          "q": "Why did Simon let down the net again?",
          "options": [
            "Because he trusted what Jesus said",
            "Because he saw many fish in the water",
            "Because the night was over and it was day"
          ],
          "answer": "Because he trusted what Jesus said",
          "explain": "Simão disse que tinham trabalhado a noite toda sem pegar nada, mas que lançaria a rede pela palavra de Jesus (Lucas 5:5)."
        },
        "fact": {
          "pt": "Foi Jesus quem deu a Simão o nome Pedro, que quer dizer \"pedra\" (João 1:42). Na pesca que Lucas conta, a rede começou a se romper e os dois barcos ficaram tão cheios que começaram a afundar (Lucas 5:6-7).",
          "ref": "Lucas 5:6-7"
        },
        "v": 2
      },
      {
        "id": "u8l2",
        "title": "O Pai Nosso",
        "ref": "Mateus 6:5-15; Lucas 11:1",
        "level": "A2.1",
        "narrator": "pedro",
        "guests": [
          "jesus"
        ],
        "names": [
          {
            "en": "Jesus",
            "pt": "Jesus"
          },
          {
            "en": "Peter",
            "pt": "Pedro",
            "note": "narra a unidade; aqui fala por todos os discípulos"
          },
          {
            "en": "Our Father",
            "pt": "Pai nosso",
            "note": "Deus, o Pai que está no céu"
          },
          {
            "en": "God",
            "pt": "Deus"
          },
          {
            "en": "the Lord",
            "pt": "o Senhor"
          }
        ],
        "hints": {
          "heaven": "céu",
          "secret": "segredo",
          "empty": "vazias, vazio",
          "lead": "levar, conduzir",
          "temptation": "tentação",
          "deliver": "livrar"
        },
        "tips": [
          {
            "part": 1,
            "id": "possessive-our-your",
            "grammar": "possessive-our-your",
            "title": "our e your: nosso e seu",
            "body": "Os possessivos vêm antes do substantivo e não mudam no plural: our Father (nosso Pai), our debts (nossas dívidas), your room (seu quarto), your Father (o Pai de vocês). Repare que your serve para você e para vocês.",
            "examples": [
              {
                "en": "Our Father in heaven",
                "pt": "Pai nosso que está no céu"
              },
              {
                "en": "Go into your room",
                "pt": "Entre no seu quarto"
              }
            ],
            "contrast": {
              "a": "Our Father knows what we need",
              "b": "Your Father knows what you need",
              "note": "our/we (nós) e your/you (você, vocês) mudam juntos"
            }
          },
          {
            "part": 2,
            "id": "object-pronoun-request",
            "grammar": "object-pronoun-request",
            "title": "Give us, forgive us: pedidos com pronome objeto",
            "body": "Depois do verbo, quem recebe a ação aparece como pronome objeto: me, you, him, her, us, them. Nos pedidos da oração, o verbo vem primeiro e o pronome logo depois: Give us (Dê-nos), Forgive us (Perdoe-nos), Deliver us (Livre-nos). Em português, o pronome pode vir antes ou depois do verbo; em inglês, sempre depois.",
            "examples": [
              {
                "en": "Give us today our daily bread",
                "pt": "Dê-nos hoje o nosso pão de cada dia"
              },
              {
                "en": "Forgive us our debts",
                "pt": "Perdoe-nos as nossas dívidas"
              }
            ],
            "contrast": {
              "a": "Forgive us",
              "b": "Forgive them",
              "note": "us = nós (quem pede); them = eles (os outros)"
            }
          }
        ],
        "vocab": [
          {
            "en": "room",
            "pt": "quarto",
            "ptAlt": [
              "sala",
              "cômodo"
            ],
            "pos": "noun",
            "field": "places",
            "tier": "core",
            "part": 1,
            "icon": "🛋️",
            "example": 3
          },
          {
            "en": "street",
            "pt": "rua",
            "pos": "noun",
            "field": "places",
            "tier": "core",
            "part": 1,
            "icon": "🛣️",
            "example": 2
          },
          {
            "en": "to need",
            "pt": "precisar",
            "pos": "verb",
            "field": "mind",
            "tier": "core",
            "part": 1,
            "icon": "🥺",
            "example": 4
          },
          {
            "en": "to teach",
            "pt": "ensinar",
            "pos": "verb",
            "field": "mind",
            "tier": "core",
            "part": 1,
            "icon": "👨‍🏫",
            "example": 1
          },
          {
            "en": "Lord, teach us to pray",
            "pt": "Senhor, ensine-nos a orar",
            "ptAlt": [
              "Senhor, nos ensine a orar",
              "Senhor, ensina-nos a orar"
            ],
            "pos": "chunk",
            "field": "speech",
            "tier": "core",
            "part": 1,
            "icon": "📖",
            "iconic": true,
            "example": 1
          },
          {
            "en": "daily",
            "pt": "diário",
            "ptAlt": [
              "de cada dia"
            ],
            "pos": "adj",
            "field": "time",
            "tier": "core",
            "part": 2,
            "icon": "🗓️",
            "example": 8
          },
          {
            "en": "debt",
            "pt": "dívida",
            "pos": "noun",
            "field": "work",
            "tier": "core",
            "part": 2,
            "icon": "💳",
            "example": 10
          },
          {
            "en": "debtor",
            "pt": "devedor",
            "pos": "noun",
            "field": "people",
            "tier": "bible",
            "part": 2,
            "icon": "🧾",
            "example": 10,
            "note": "quem deve algo a alguém"
          },
          {
            "en": "bread",
            "pt": "pão",
            "pos": "noun",
            "field": "food",
            "tier": "core",
            "part": 2,
            "icon": "🍞",
            "example": 8
          },
          {
            "en": "Give us today our daily bread",
            "pt": "Dê-nos hoje o nosso pão de cada dia",
            "ptAlt": [
              "O pão nosso de cada dia nos dá hoje",
              "Nos dê hoje o nosso pão de cada dia"
            ],
            "pos": "chunk",
            "field": "speech",
            "tier": "core",
            "part": 2,
            "icon": "🥐",
            "iconic": true,
            "example": 8
          }
        ],
        "sentences": [
          {
            "en": "We asked Jesus, \"Lord, teach us to pray\"",
            "pt": "Nós pedimos a Jesus: \"Senhor, ensine-nos a orar\"",
            "altPt": [
              "Pedimos a Jesus: \"Senhor, ensina-nos a orar\"",
              "Nós pedimos a Jesus: \"Senhor, nos ensine a orar\""
            ]
          },
          {
            "en": "He taught us not to pray in the street",
            "pt": "Ele nos ensinou a não orar na rua",
            "altPt": [
              "Ele nos ensinou a não orar nas ruas"
            ]
          },
          {
            "en": "Go into your room and close the door",
            "pt": "Entre no seu quarto e feche a porta",
            "altPt": [
              "Entra no teu aposento e fecha a tua porta",
              "Entre no seu quarto e feche a sua porta"
            ]
          },
          {
            "en": "Your Father sees in secret and knows what you need",
            "pt": "O seu Pai vê em segredo e sabe do que você precisa",
            "altPt": [
              "O Pai de vocês vê em segredo e sabe do que vocês precisam"
            ]
          },
          {
            "en": "Do we pray in the street? No, in our room",
            "pt": "Nós oramos na rua? Não, no nosso quarto"
          },
          {
            "en": "Who knows what we need? Our Father in heaven",
            "pt": "Quem sabe do que precisamos? O nosso Pai que está no céu",
            "altPt": [
              "Quem sabe do que nós precisamos? Nosso Pai no céu"
            ]
          },
          {
            "en": "Let your Kingdom come, let your will be done",
            "pt": "Venha o seu Reino, seja feita a sua vontade",
            "alt": [
              "Your Kingdom come, your will be done"
            ],
            "altPt": [
              "Venha o teu Reino, seja feita a tua vontade",
              "Venha o seu Reino, seja feita a sua vontade"
            ]
          },
          {
            "en": "Give us today our daily bread",
            "pt": "Dê-nos hoje o nosso pão de cada dia",
            "alt": [
              "Give us this day our daily bread"
            ],
            "altPt": [
              "O pão nosso de cada dia nos dá hoje",
              "Nos dê hoje o nosso pão de cada dia"
            ]
          },
          {
            "en": "What do we ask for? Our daily bread",
            "pt": "O que nós pedimos? O nosso pão de cada dia"
          },
          {
            "en": "Forgive us our debts, as we forgive our debtors",
            "pt": "Perdoe-nos as nossas dívidas, assim como perdoamos os nossos devedores",
            "alt": [
              "Forgive us our debts, as we also forgive our debtors"
            ],
            "altPt": [
              "Perdoa-nos as nossas dívidas, assim como nós perdoamos aos nossos devedores",
              "Perdoe as nossas dívidas, assim como nós perdoamos os nossos devedores"
            ]
          },
          {
            "en": "Do not lead us into temptation, but deliver us from evil",
            "pt": "Não nos deixe cair em tentação, mas livre-nos do mal",
            "alt": [
              "Bring us not into temptation, but deliver us from the evil one",
              "Lead us not into temptation, but deliver us from evil"
            ],
            "altPt": [
              "Não nos induzas à tentação, mas livra-nos do mal",
              "Não nos leve à tentação, mas livre-nos do mal"
            ]
          },
          {
            "en": "Our Father forgives our debts if we forgive our debtors",
            "pt": "O nosso Pai perdoa as nossas dívidas se perdoamos os nossos devedores",
            "altPt": [
              "Nosso Pai perdoa as nossas dívidas se nós perdoamos os nossos devedores"
            ]
          }
        ],
        "beats": [
          {
            "order": 1,
            "en": "We asked Jesus, \"Lord, teach us to pray\"",
            "pt": "Nós pedimos a Jesus: \"Senhor, ensine-nos a orar\"",
            "altPt": [
              "Pedimos a Jesus: \"Senhor, ensina-nos a orar\"",
              "Nós pedimos a Jesus: \"Senhor, nos ensine a orar\""
            ],
            "kind": "first-person",
            "fact": true,
            "iconic": true,
            "speaker": "pedro"
          },
          {
            "order": 2,
            "en": "He taught us not to pray in the street",
            "pt": "Ele nos ensinou a não orar na rua",
            "altPt": [
              "Ele nos ensinou a não orar nas ruas"
            ],
            "kind": "negative",
            "fact": true,
            "speaker": "pedro"
          },
          {
            "order": 3,
            "en": "Go into your room and close the door",
            "pt": "Entre no seu quarto e feche a porta",
            "altPt": [
              "Entra no teu aposento e fecha a tua porta",
              "Entre no seu quarto e feche a sua porta"
            ],
            "kind": "quote",
            "fact": true,
            "speaker": "jesus",
            "gap": {
              "word": "room",
              "kind": "lexical",
              "options": [
                "room",
                "boat",
                "city"
              ]
            }
          },
          {
            "order": 4,
            "en": "Your Father sees in secret and knows what you need",
            "pt": "O seu Pai vê em segredo e sabe do que você precisa",
            "altPt": [
              "O Pai de vocês vê em segredo e sabe do que vocês precisam"
            ],
            "kind": "quote",
            "fact": true,
            "speaker": "jesus",
            "gap": {
              "word": "Your",
              "kind": "grammar",
              "options": [
                "Your",
                "Our",
                "Their"
              ]
            },
            "grammar": "possessive-our-your"
          },
          {
            "order": 5,
            "en": "Do we pray in the street? No, in our room",
            "pt": "Nós oramos na rua? Não, no nosso quarto",
            "kind": "question",
            "fact": true,
            "speaker": "pedro"
          },
          {
            "order": 6,
            "en": "Who knows what we need? Our Father in heaven",
            "pt": "Quem sabe do que precisamos? O nosso Pai que está no céu",
            "altPt": [
              "Quem sabe do que nós precisamos? Nosso Pai no céu"
            ],
            "kind": "question",
            "fact": true,
            "speaker": "pedro",
            "gap": {
              "word": "Our",
              "kind": "grammar",
              "options": [
                "Our",
                "Your",
                "Their"
              ]
            },
            "grammar": "possessive-our-your"
          },
          {
            "order": 7,
            "en": "Let your Kingdom come, let your will be done",
            "pt": "Venha o seu Reino, seja feita a sua vontade",
            "altPt": [
              "Venha o teu Reino, seja feita a tua vontade",
              "Venha o seu Reino, seja feita a sua vontade"
            ],
            "alt": [
              "Your Kingdom come, your will be done"
            ],
            "kind": "quote",
            "fact": true,
            "iconic": true,
            "speaker": "jesus"
          },
          {
            "order": 8,
            "en": "Give us today our daily bread",
            "pt": "Dê-nos hoje o nosso pão de cada dia",
            "altPt": [
              "O pão nosso de cada dia nos dá hoje",
              "Nos dê hoje o nosso pão de cada dia"
            ],
            "alt": [
              "Give us this day our daily bread"
            ],
            "kind": "quote",
            "fact": true,
            "iconic": true,
            "gap": {
              "word": "us",
              "kind": "grammar",
              "options": [
                "us",
                "me",
                "them"
              ]
            },
            "grammar": "object-pronoun-request"
          },
          {
            "order": 9,
            "en": "What do we ask for? Our daily bread",
            "pt": "O que nós pedimos? O nosso pão de cada dia",
            "kind": "question",
            "fact": true,
            "speaker": "pedro"
          },
          {
            "order": 10,
            "en": "Forgive us our debts, as we forgive our debtors",
            "pt": "Perdoe-nos as nossas dívidas, assim como perdoamos os nossos devedores",
            "altPt": [
              "Perdoa-nos as nossas dívidas, assim como nós perdoamos aos nossos devedores",
              "Perdoe as nossas dívidas, assim como nós perdoamos os nossos devedores"
            ],
            "alt": [
              "Forgive us our debts, as we also forgive our debtors"
            ],
            "kind": "quote",
            "fact": true,
            "iconic": true,
            "gap": {
              "word": "us",
              "kind": "grammar",
              "options": [
                "us",
                "me",
                "him"
              ]
            },
            "grammar": "object-pronoun-request"
          },
          {
            "order": 11,
            "en": "Do not lead us into temptation, but deliver us from evil",
            "pt": "Não nos deixe cair em tentação, mas livre-nos do mal",
            "altPt": [
              "Não nos induzas à tentação, mas livra-nos do mal",
              "Não nos leve à tentação, mas livre-nos do mal"
            ],
            "alt": [
              "Bring us not into temptation, but deliver us from the evil one",
              "Lead us not into temptation, but deliver us from evil"
            ],
            "kind": "negative",
            "fact": true,
            "iconic": true,
            "prod": false
          },
          {
            "order": 12,
            "en": "Our Father forgives our debts if we forgive our debtors",
            "pt": "O nosso Pai perdoa as nossas dívidas se perdoamos os nossos devedores",
            "altPt": [
              "Nosso Pai perdoa as nossas dívidas se nós perdoamos os nossos devedores"
            ],
            "kind": "first-person",
            "fact": true,
            "speaker": "pedro"
          }
        ],
        "contrast": [
          {
            "a": "Who knows what we need? Our Father in heaven",
            "b": "Who knows what you need? Your Father in heaven",
            "note": "we/our (nós) viram you/your (vocês): o possessivo acompanha o pronome (Dica 1)"
          },
          {
            "a": "Give us today our daily bread",
            "b": "Give me today my daily bread",
            "note": "us/our (nós) viram me/my (eu): o pedido muda de pessoa (Dica 2)"
          }
        ],
        "verse": {
          "text": "Our Father in heaven, may your name be kept holy.",
          "classic": "Our Father which art in heaven, Hallowed be thy name.",
          "pt": "Pai nosso, que está no céu, santificado seja o seu nome.",
          "classicPt": "Pai nosso, que estás nos céus, santificado seja o teu nome.",
          "ref": "Mateus 6:9",
          "blank": "Father",
          "options": [
            "Father",
            "Brother",
            "King",
            "Friend"
          ],
          "blanks": [
            {
              "word": "Father",
              "options": [
                "Father",
                "Brother",
                "King",
                "Friend"
              ]
            },
            {
              "word": "holy",
              "options": [
                "holy",
                "good",
                "great",
                "true"
              ]
            },
            {
              "word": "name",
              "options": [
                "name",
                "word",
                "house",
                "love"
              ]
            }
          ]
        },
        "reading": {
          "text": "Jesus taught us how to pray. He said, \"Go into your room, close the door, and pray to your Father in secret. Your Father knows what you need before you ask him.\" Then he taught us the Lord's Prayer: \"Our Father in heaven, give us today our daily bread, and forgive us our debts.\"",
          "pt": "Jesus nos ensinou a orar. Ele disse: \"Entre no seu quarto, feche a porta e ore ao seu Pai em segredo. O seu Pai sabe do que você precisa antes de você pedir.\" Depois ele nos ensinou a oração do Pai Nosso: \"Pai nosso que está no céu, dê-nos hoje o nosso pão de cada dia, e perdoe-nos as nossas dívidas.\"",
          "q": "Where did Jesus say we should pray?",
          "options": [
            "Alone, in a closed room",
            "In the city, in front of many people",
            "By the sea, in a boat"
          ],
          "answer": "Alone, in a closed room",
          "questions": [
            {
              "kind": "literal",
              "q": "Where did Jesus say we should pray?",
              "qPt": "Onde Jesus disse que devemos orar?",
              "options": [
                "Alone, in a closed room",
                "In the city, in front of many people",
                "By the sea, in a boat"
              ],
              "answer": "Alone, in a closed room"
            },
            {
              "kind": "inference",
              "q": "Why do we not need many words when we pray?",
              "qPt": "Por que não precisamos de muitas palavras quando oramos?",
              "options": [
                "Because our Father already knows what we need",
                "Because we pray in secret, and nobody hears us",
                "Because the Lord's Prayer is very short"
              ],
              "answer": "Because our Father already knows what we need",
              "explain": "Jesus mandou não usar repetições vazias, porque o Pai sabe do que precisamos antes de pedirmos (Mateus 6:7-8)."
            }
          ]
        },
        "dialogue": {
          "line": "Peter, do you know how to pray?",
          "pt": "Pedro, você sabe orar?",
          "options": [
            "Lord, teach us to pray.",
            "Lord, we already pray every day.",
            "Lord, I pray with many words."
          ],
          "answer": "Lord, teach us to pray.",
          "answerPt": "Senhor, ensine-nos a orar."
        },
        "conversation": {
          "with": "jesus",
          "turns": [
            {
              "who": "jesus",
              "en": "Peter, do you know how to pray?",
              "pt": "Pedro, você sabe orar?",
              "mood": "carinhoso",
              "fact": false
            },
            {
              "who": "you",
              "options": [
                "Lord, teach us to pray.",
                "Lord, we already pray every day.",
                "Lord, I pray with many words."
              ],
              "answer": "Lord, teach us to pray.",
              "pt": "Senhor, ensine-nos a orar.",
              "intent": "Peça para aprender"
            },
            {
              "who": "jesus",
              "en": "Go into your room and pray to your Father in secret. He knows what you need.",
              "pt": "Entre no seu quarto e ore ao seu Pai em segredo. Ele sabe do que você precisa.",
              "mood": "calmo",
              "fact": true,
              "ref": "Mateus 6:6-8"
            },
            {
              "who": "you",
              "options": [
                "Our Father in heaven, give us today our daily bread.",
                "Our Father in heaven, give us a big boat today.",
                "Our Father in heaven, send us many fish today."
              ],
              "answer": "Our Father in heaven, give us today our daily bread.",
              "pt": "Pai nosso que está no céu, dê-nos hoje o nosso pão de cada dia.",
              "intent": "Ore como Jesus ensinou",
              "speak": true
            }
          ]
        },
        "quiz": {
          "q": "Why do we not need many words when we pray?",
          "options": [
            "Because our Father already knows what we need",
            "Because we pray in secret, and nobody hears us",
            "Because the Lord's Prayer is very short"
          ],
          "answer": "Because our Father already knows what we need",
          "explain": "Jesus mandou não usar repetições vazias, porque o Pai sabe do que precisamos antes de pedirmos (Mateus 6:7-8)."
        },
        "fact": {
          "pt": "A frase final \"Porque seu é o Reino, o poder e a glória para sempre. Amém\" (Mateus 6:13) não aparece nos manuscritos mais antigos de Mateus; por isso muitas Bíblias modernas a trazem em nota de rodapé. Lucas registra uma versão mais curta da mesma oração (Lucas 11:2-4).",
          "ref": "Mateus 6:13"
        },
        "v": 2
      },
      {
        "id": "u8l3",
        "title": "Pães, peixes e o mar",
        "ref": "Mateus 14:13-33",
        "level": "A2.1",
        "narrator": "pedro",
        "guests": [
          "jesus"
        ],
        "names": [
          {
            "en": "Jesus",
            "pt": "Jesus"
          },
          {
            "en": "Peter",
            "pt": "Pedro",
            "note": "narra a unidade"
          },
          {
            "en": "disciples",
            "pt": "discípulos",
            "note": "os seguidores de Jesus"
          },
          {
            "en": "the Lord",
            "pt": "o Senhor"
          },
          {
            "en": "God",
            "pt": "Deus"
          }
        ],
        "hints": {
          "late": "tarde",
          "left": "sobrou, sobraram",
          "big": "grande, grandes",
          "doubt": "duvidar, duvidou"
        },
        "tips": [
          {
            "part": 1,
            "id": "only-howmany",
            "grammar": "only-howmany",
            "title": "only e how many: quantidades",
            "body": "only = só, apenas; vem antes do verbo principal ou do número: We only have five loaves. Para perguntar a quantidade de coisas que se contam, use how many + plural: How many loaves? Para coisas que não se contam, how much: How much bread?",
            "examples": [
              {
                "en": "We have five loaves",
                "pt": "Temos cinco pães"
              },
              {
                "en": "We only have five loaves",
                "pt": "Temos só cinco pães"
              }
            ],
            "contrast": {
              "a": "How many fish?",
              "b": "How much bread?",
              "note": "how many para contáveis (fish, loaves, baskets); how much para incontáveis (bread, water)"
            }
          },
          {
            "part": 2,
            "id": "past-did",
            "grammar": "past-did",
            "title": "Did...? perguntas no passado",
            "body": "Para perguntar sobre o passado, use Did + sujeito + verbo básico: Did Jesus walk on the waves? A resposta curta é Yes, he did ou No, he did not. O verbo principal fica sem -ed.",
            "examples": [
              {
                "en": "Jesus walked on the waves",
                "pt": "Jesus andou sobre as ondas"
              },
              {
                "en": "Did Jesus walk on the waves?",
                "pt": "Jesus andou sobre as ondas?"
              }
            ],
            "contrast": {
              "a": "Why did you doubt?",
              "b": "Why do you doubt?",
              "note": "did = passado; do = presente"
            }
          }
        ],
        "vocab": [
          {
            "en": "crowd",
            "pt": "multidão",
            "pos": "noun",
            "field": "people",
            "tier": "core",
            "part": 1,
            "icon": "👭",
            "example": 1
          },
          {
            "en": "hungry",
            "pt": "com fome",
            "ptAlt": [
              "faminto",
              "faminta"
            ],
            "pos": "adj",
            "field": "feelings",
            "tier": "core",
            "part": 1,
            "icon": "🤤",
            "example": 2
          },
          {
            "en": "loaf",
            "pt": "um pão",
            "ptAlt": [
              "pão",
              "pães"
            ],
            "plural": "loaves",
            "forms": [
              "loaves"
            ],
            "pos": "noun",
            "field": "food",
            "tier": "core",
            "part": 1,
            "icon": "🥯",
            "example": 3,
            "note": "um pão inteiro; plural loaves"
          },
          {
            "en": "to feed",
            "pt": "alimentar",
            "ptAlt": [
              "dar de comer"
            ],
            "pos": "verb",
            "field": "actions",
            "tier": "core",
            "part": 1,
            "icon": "🥄",
            "example": 5
          },
          {
            "en": "Bring them to me",
            "pt": "Tragam para mim",
            "ptAlt": [
              "Tragam-nos a mim",
              "Traga para mim",
              "Tragam eles para mim"
            ],
            "pos": "chunk",
            "field": "speech",
            "tier": "core",
            "part": 1,
            "icon": "🥡",
            "iconic": true,
            "example": 4
          },
          {
            "en": "wave",
            "pt": "onda",
            "pos": "noun",
            "field": "nature",
            "tier": "core",
            "part": 2,
            "icon": "🏄",
            "example": 8
          },
          {
            "en": "hand",
            "pt": "mão",
            "pos": "noun",
            "field": "body",
            "tier": "core",
            "part": 2,
            "icon": "✋",
            "example": 11
          },
          {
            "en": "to sink",
            "pt": "afundar",
            "pos": "verb",
            "field": "actions",
            "tier": "core",
            "part": 2,
            "icon": "⬇️",
            "example": 10
          },
          {
            "en": "to begin",
            "pt": "começar",
            "pos": "verb",
            "field": "time",
            "tier": "core",
            "part": 2,
            "icon": "▶️",
            "example": 10
          },
          {
            "en": "Lord, save me!",
            "pt": "Senhor, salve-me!",
            "ptAlt": [
              "Senhor, salva-me!",
              "Senhor, me salve!"
            ],
            "pos": "chunk",
            "field": "speech",
            "tier": "core",
            "part": 2,
            "icon": "😱",
            "iconic": true,
            "example": 11
          }
        ],
        "sentences": [
          {
            "en": "A great crowd followed Jesus",
            "pt": "Uma grande multidão seguiu Jesus"
          },
          {
            "en": "It was late and the crowd was hungry",
            "pt": "Era tarde e a multidão estava com fome"
          },
          {
            "en": "We only have five loaves and two fish",
            "pt": "Nós só temos cinco pães e dois peixes",
            "altPt": [
              "Temos só cinco pães e dois peixes",
              "Não temos aqui senão cinco pães e dois peixes"
            ]
          },
          {
            "en": "Jesus said, \"Bring them to me\"",
            "pt": "Jesus disse: \"Tragam para mim\"",
            "alt": [
              "Jesus said, \"Bring them here to me\""
            ],
            "altPt": [
              "Jesus disse: \"Trazei-mos aqui\"",
              "Jesus disse: \"Tragam-nos a mim\""
            ]
          },
          {
            "en": "He blessed the loaves and fed the hungry crowd",
            "pt": "Ele abençoou os pães e alimentou a multidão faminta",
            "altPt": [
              "Ele abençoou os pães e deu de comer à multidão com fome"
            ]
          },
          {
            "en": "Did he feed everyone? Yes, and there was bread left",
            "pt": "Ele alimentou todos? Sim, e ainda sobrou pão"
          },
          {
            "en": "That night we began to go across the sea",
            "pt": "Naquela noite começamos a atravessar o mar",
            "altPt": [
              "Naquela noite nós começamos a cruzar o mar de barco"
            ]
          },
          {
            "en": "The wind was against us and the waves were big",
            "pt": "O vento estava contra nós e as ondas eram grandes",
            "altPt": [
              "O vento era contrário e as ondas eram grandes"
            ]
          },
          {
            "en": "Did Jesus walk on the waves? Yes, he did",
            "pt": "Jesus andou sobre as ondas? Sim, andou"
          },
          {
            "en": "I walked on the water but began to sink",
            "pt": "Eu andei sobre a água, mas comecei a afundar",
            "altPt": [
              "Andei sobre as águas, mas comecei a afundar"
            ]
          },
          {
            "en": "I cried, \"Lord, save me!\" and he took my hand",
            "pt": "Eu gritei: \"Senhor, salve-me!\" e ele segurou a minha mão",
            "altPt": [
              "Eu clamei: \"Senhor, salva-me!\" e ele me segurou pela mão"
            ]
          },
          {
            "en": "His hand saved me and I did not sink",
            "pt": "A mão dele me salvou e eu não afundei",
            "altPt": [
              "Ele me salvou com a mão e eu não afundei"
            ]
          }
        ],
        "beats": [
          {
            "order": 1,
            "en": "A great crowd followed Jesus",
            "pt": "Uma grande multidão seguiu Jesus",
            "kind": "statement",
            "fact": true
          },
          {
            "order": 2,
            "en": "It was late and the crowd was hungry",
            "pt": "Era tarde e a multidão estava com fome",
            "kind": "statement",
            "fact": true
          },
          {
            "order": 3,
            "en": "We only have five loaves and two fish",
            "pt": "Nós só temos cinco pães e dois peixes",
            "altPt": [
              "Temos só cinco pães e dois peixes",
              "Não temos aqui senão cinco pães e dois peixes"
            ],
            "kind": "first-person",
            "fact": true,
            "iconic": true,
            "speaker": "pedro",
            "gap": {
              "word": "only",
              "kind": "grammar",
              "options": [
                "only",
                "also",
                "all"
              ]
            },
            "grammar": "only-howmany"
          },
          {
            "order": 4,
            "en": "Jesus said, \"Bring them to me\"",
            "pt": "Jesus disse: \"Tragam para mim\"",
            "altPt": [
              "Jesus disse: \"Trazei-mos aqui\"",
              "Jesus disse: \"Tragam-nos a mim\""
            ],
            "alt": [
              "Jesus said, \"Bring them here to me\""
            ],
            "kind": "quote",
            "fact": true,
            "iconic": true,
            "speaker": "jesus"
          },
          {
            "order": 5,
            "en": "He blessed the loaves and fed the hungry crowd",
            "pt": "Ele abençoou os pães e alimentou a multidão faminta",
            "altPt": [
              "Ele abençoou os pães e deu de comer à multidão com fome"
            ],
            "kind": "statement",
            "fact": true,
            "gap": {
              "word": "loaves",
              "kind": "lexical",
              "options": [
                "loaves",
                "fish",
                "crowd"
              ]
            }
          },
          {
            "order": 6,
            "en": "Did he feed everyone? Yes, and there was bread left",
            "pt": "Ele alimentou todos? Sim, e ainda sobrou pão",
            "kind": "question",
            "fact": true
          },
          {
            "order": 7,
            "en": "That night we began to go across the sea",
            "pt": "Naquela noite começamos a atravessar o mar",
            "altPt": [
              "Naquela noite nós começamos a cruzar o mar de barco"
            ],
            "kind": "first-person",
            "fact": true,
            "speaker": "pedro"
          },
          {
            "order": 8,
            "en": "The wind was against us and the waves were big",
            "pt": "O vento estava contra nós e as ondas eram grandes",
            "altPt": [
              "O vento era contrário e as ondas eram grandes"
            ],
            "kind": "statement",
            "fact": true
          },
          {
            "order": 9,
            "en": "Did Jesus walk on the waves? Yes, he did",
            "pt": "Jesus andou sobre as ondas? Sim, andou",
            "kind": "question",
            "fact": true,
            "gap": {
              "word": "Did",
              "kind": "grammar",
              "options": [
                "Did",
                "Does",
                "Do"
              ]
            },
            "grammar": "past-did"
          },
          {
            "order": 10,
            "en": "I walked on the water but began to sink",
            "pt": "Eu andei sobre a água, mas comecei a afundar",
            "altPt": [
              "Andei sobre as águas, mas comecei a afundar"
            ],
            "kind": "first-person",
            "fact": true,
            "speaker": "pedro"
          },
          {
            "order": 11,
            "en": "I cried, \"Lord, save me!\" and he took my hand",
            "pt": "Eu gritei: \"Senhor, salve-me!\" e ele segurou a minha mão",
            "altPt": [
              "Eu clamei: \"Senhor, salva-me!\" e ele me segurou pela mão"
            ],
            "kind": "first-person",
            "fact": true,
            "iconic": true,
            "speaker": "pedro"
          },
          {
            "order": 12,
            "en": "His hand saved me and I did not sink",
            "pt": "A mão dele me salvou e eu não afundei",
            "altPt": [
              "Ele me salvou com a mão e eu não afundei"
            ],
            "kind": "negative",
            "fact": true,
            "speaker": "pedro",
            "grammar": "past-did"
          }
        ],
        "contrast": [
          {
            "a": "We only have five loaves and two fish",
            "b": "We have five loaves and two fish",
            "note": "only = só; sem only a frase perde a ideia de pouco (Dica 1)"
          },
          {
            "a": "Did Jesus walk on the waves? Yes, he did",
            "b": "Did Peter walk on the waves? Yes, but he began to sink",
            "note": "mesma pergunta com did, sujeito diferente (Dica 2)"
          }
        ],
        "verse": {
          "text": "Cheer up! It is I! Don't be afraid.",
          "classic": "Be of good cheer; it is I; be not afraid.",
          "pt": "Coragem! Sou eu! Não tenham medo.",
          "classicPt": "Tende bom ânimo; sou eu, não temais.",
          "ref": "Mateus 14:27",
          "blank": "afraid",
          "options": [
            "afraid",
            "hungry",
            "alone",
            "sick"
          ],
          "blanks": [
            {
              "word": "afraid",
              "options": [
                "afraid",
                "hungry",
                "alone",
                "sick"
              ]
            },
            {
              "word": "Cheer",
              "options": [
                "Cheer",
                "Wake",
                "Hurry",
                "Come"
              ]
            }
          ]
        },
        "reading": {
          "text": "Jesus fed five thousand people with five loaves and two fish. That night, the disciples were in a boat, and the wind was against them. Jesus came to them, walking on the sea. Peter walked on the water too, but he saw the wind and began to sink. Jesus took his hand and said, \"Why did you doubt?\"",
          "pt": "Jesus alimentou cinco mil pessoas com cinco pães e dois peixes. Naquela noite, os discípulos estavam num barco, e o vento estava contra eles. Jesus foi até eles, andando sobre o mar. Pedro também andou sobre a água, mas viu o vento e começou a afundar. Jesus segurou a mão dele e disse: \"Por que você duvidou?\"",
          "q": "What did Peter do when he saw the wind?",
          "options": [
            "He started to go down into the water",
            "He got back into the boat",
            "He swam to Jesus"
          ],
          "answer": "He started to go down into the water",
          "questions": [
            {
              "kind": "literal",
              "q": "What did Peter do when he saw the wind?",
              "qPt": "O que Pedro fez quando viu o vento?",
              "options": [
                "He started to go down into the water",
                "He got back into the boat",
                "He swam to Jesus"
              ],
              "answer": "He started to go down into the water"
            },
            {
              "kind": "inference",
              "q": "Why did Peter begin to sink?",
              "qPt": "Por que Pedro começou a afundar?",
              "options": [
                "Because he was afraid and stopped trusting",
                "Because the boat was too far away",
                "Because he could not swim"
              ],
              "answer": "Because he was afraid and stopped trusting",
              "explain": "Pedro olhou para o vento, teve medo e duvidou; Jesus o segurou e perguntou por que ele duvidou (Mateus 14:30-31)."
            }
          ]
        },
        "dialogue": {
          "line": "Peter, how many loaves do you have?",
          "pt": "Pedro, quantos pães vocês têm?",
          "options": [
            "Only five, Lord. And two fish.",
            "Twelve baskets, Lord.",
            "Five thousand, Lord."
          ],
          "answer": "Only five, Lord. And two fish.",
          "answerPt": "Só cinco, Senhor. E dois peixes."
        },
        "conversation": {
          "with": "jesus",
          "turns": [
            {
              "who": "jesus",
              "en": "Peter, how many loaves do you have?",
              "pt": "Pedro, quantos pães vocês têm?",
              "mood": "calmo",
              "fact": true,
              "ref": "Marcos 6:38"
            },
            {
              "who": "you",
              "options": [
                "Only five, Lord. And two fish.",
                "Twelve baskets, Lord.",
                "Five thousand, Lord."
              ],
              "answer": "Only five, Lord. And two fish.",
              "pt": "Só cinco, Senhor. E dois peixes.",
              "intent": "Diga quantos pães e peixes vocês têm"
            },
            {
              "who": "jesus",
              "en": "Come, Peter. Walk on the water.",
              "pt": "Venha, Pedro. Ande sobre a água.",
              "mood": "solene",
              "fact": true,
              "ref": "Mateus 14:29"
            },
            {
              "who": "you",
              "options": [
                "Lord, save me! I am sinking!",
                "Lord, the wind is too strong. I cannot come.",
                "Lord, the boat is far. Wait for me."
              ],
              "answer": "Lord, save me! I am sinking!",
              "pt": "Senhor, salve-me! Estou afundando!",
              "intent": "Peça socorro",
              "speak": true
            }
          ]
        },
        "quiz": {
          "q": "Why did Peter begin to sink?",
          "options": [
            "Because he was afraid and stopped trusting",
            "Because the boat was too far away",
            "Because he could not swim"
          ],
          "answer": "Because he was afraid and stopped trusting",
          "explain": "Pedro olhou para o vento, teve medo e duvidou; Jesus o segurou e perguntou por que ele duvidou (Mateus 14:30-31)."
        },
        "fact": {
          "pt": "Mateus conta que comeram cerca de cinco mil homens, \"além das mulheres e crianças\" (Mateus 14:21): a multidão era bem maior. Depois que Jesus e Pedro subiram no barco, o vento parou, e os discípulos disseram: \"Você é mesmo o Filho de Deus\" (Mateus 14:32-33).",
          "ref": "Mateus 14:21"
        },
        "v": 2
      },
      {
        "id": "u8r",
        "title": "Revisão",
        "review": true,
        "checkpoint": true
      }
    ]
  }
];
