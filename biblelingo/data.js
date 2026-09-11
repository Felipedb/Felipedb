// BíbliaLearn — conteúdo das unidades e lições
// Estrutura espelhada na tela de referência: 5 grandes lições na trilha.
// Vocabulário: pares EN/PT. Sentences: frases para montar com banco de palavras.
// Verses: versículos (KJV, domínio público) para exercício de lacuna.

const COURSE = [
  {
    id: "u1",
    title: "A Palavra de Deus",
    subtitle: "Gênesis 1–3",
    icon: "📖",
    face: "book",
    color: "#58a700",
    lessons: [
      {
        id: "u1l1",
        title: "Céu e terra",
        vocab: [
          { en: "God", pt: "Deus" },
          { en: "heaven", pt: "céu" },
          { en: "earth", pt: "terra" },
          { en: "light", pt: "luz" },
        ],
        sentences: [
          { en: "God created the heaven and the earth", pt: "Deus criou o céu e a terra" },
        ],
        verse: {
          text: "In the beginning God created the heaven and the earth.",
          pt: "No princípio, Deus criou o céu e a terra.",
          ref: "Gênesis 1:1",
          blank: "created",
          options: ["created", "loved", "said", "saw"],
        },
      },
      {
        id: "u1l2",
        title: "Luz e trevas",
        vocab: [
          { en: "darkness", pt: "trevas" },
          { en: "day", pt: "dia" },
          { en: "night", pt: "noite" },
          { en: "good", pt: "bom" },
        ],
        sentences: [
          { en: "God called the light Day", pt: "Deus chamou a luz de Dia" },
          { en: "the darkness he called Night", pt: "às trevas ele chamou Noite" },
        ],
        verse: {
          text: "And God said, Let there be light: and there was light.",
          pt: "E disse Deus: Haja luz. E houve luz.",
          ref: "Gênesis 1:3",
          blank: "light",
          options: ["light", "water", "earth", "night"],
        },
      },
      {
        id: "u1l3",
        title: "O jardim",
        vocab: [
          { en: "garden", pt: "jardim" },
          { en: "tree", pt: "árvore" },
          { en: "life", pt: "vida" },
          { en: "man", pt: "homem" },
        ],
        sentences: [
          { en: "the tree of life", pt: "a árvore da vida" },
          { en: "God saw that it was good", pt: "Deus viu que era bom" },
        ],
        verse: {
          text: "And the LORD God planted a garden eastward in Eden.",
          pt: "E plantou o Senhor Deus um jardim no Éden, do lado oriental.",
          ref: "Gênesis 2:8",
          blank: "garden",
          options: ["garden", "house", "city", "sea"],
        },
      },
      { id: "u1r", title: "Revisão", review: true },
    ],
  },
  {
    id: "u2",
    title: "Noé e a Arca",
    subtitle: "Gênesis 6–9",
    icon: "🚢",
    face: "noe",
    color: "#7e57c2",
    lessons: [
      {
        id: "u2l1",
        title: "A arca",
        vocab: [
          { en: "ark", pt: "arca" },
          { en: "rain", pt: "chuva" },
          { en: "animals", pt: "animais" },
          { en: "door", pt: "porta" },
        ],
        sentences: [
          { en: "Noah made an ark of wood", pt: "Noé fez uma arca de madeira" },
        ],
        verse: {
          text: "Make thee an ark of gopher wood.",
          pt: "Faze para ti uma arca de madeira de gofer.",
          ref: "Gênesis 6:14",
          blank: "ark",
          options: ["ark", "boat", "tent", "wall"],
        },
      },
      {
        id: "u2l2",
        title: "O dilúvio",
        vocab: [
          { en: "flood", pt: "dilúvio" },
          { en: "forty", pt: "quarenta" },
          { en: "water", pt: "água" },
          { en: "window", pt: "janela" },
        ],
        sentences: [
          { en: "the rain was upon the earth", pt: "a chuva caiu sobre a terra" },
          { en: "forty days and forty nights", pt: "quarenta dias e quarenta noites" },
        ],
        verse: {
          text: "And the rain was upon the earth forty days and forty nights.",
          pt: "E houve chuva sobre a terra quarenta dias e quarenta noites.",
          ref: "Gênesis 7:12",
          blank: "rain",
          options: ["rain", "sun", "wind", "fire"],
        },
      },
      {
        id: "u2l3",
        title: "A promessa",
        vocab: [
          { en: "dove", pt: "pomba" },
          { en: "rainbow", pt: "arco-íris" },
          { en: "promise", pt: "promessa" },
          { en: "cloud", pt: "nuvem" },
        ],
        sentences: [
          { en: "the dove came back to him", pt: "a pomba voltou para ele" },
        ],
        verse: {
          text: "I do set my bow in the cloud.",
          pt: "O meu arco tenho posto na nuvem.",
          ref: "Gênesis 9:13",
          blank: "cloud",
          options: ["cloud", "sea", "field", "night"],
        },
      },
      { id: "u2r", title: "Revisão", review: true },
    ],
  },
  {
    id: "u3",
    title: "Moisés e o Êxodo",
    subtitle: "Êxodo 1–15",
    icon: "🔥",
    face: "moises",
    color: "#e6a817",
    lessons: [
      {
        id: "u3l1",
        title: "A sarça ardente",
        vocab: [
          { en: "fire", pt: "fogo" },
          { en: "holy", pt: "santo" },
          { en: "ground", pt: "chão" },
          { en: "to see", pt: "ver" },
        ],
        sentences: [
          { en: "the bush burned with fire", pt: "a sarça ardia no fogo" },
        ],
        verse: {
          text: "The place whereon thou standest is holy ground.",
          pt: "O lugar em que tu estás é terra santa.",
          ref: "Êxodo 3:5",
          blank: "holy",
          options: ["holy", "dry", "cold", "far"],
        },
      },
      {
        id: "u3l2",
        title: "Deixa o meu povo ir",
        vocab: [
          { en: "people", pt: "povo" },
          { en: "free", pt: "livre" },
          { en: "king", pt: "rei" },
          { en: "to go", pt: "ir" },
        ],
        sentences: [
          { en: "let my people go", pt: "deixa ir o meu povo" },
        ],
        verse: {
          text: "Thus saith the LORD God of Israel, Let my people go.",
          pt: "Assim diz o Senhor, Deus de Israel: Deixa ir o meu povo.",
          ref: "Êxodo 5:1",
          blank: "people",
          options: ["people", "sheep", "sons", "kings"],
        },
      },
      {
        id: "u3l3",
        title: "O mar se abre",
        vocab: [
          { en: "sea", pt: "mar" },
          { en: "dry", pt: "seco" },
          { en: "hand", pt: "mão" },
          { en: "wind", pt: "vento" },
        ],
        sentences: [
          { en: "the waters were divided", pt: "as águas foram divididas" },
          { en: "Moses stretched out his hand", pt: "Moisés estendeu a sua mão" },
        ],
        verse: {
          text: "And the LORD made the sea dry land, and the waters were divided.",
          pt: "E o Senhor fez o mar terra seca, e as águas foram partidas.",
          ref: "Êxodo 14:21",
          blank: "sea",
          options: ["sea", "sky", "hill", "city"],
        },
      },
      { id: "u3r", title: "Revisão", review: true },
    ],
  },
  {
    id: "u4",
    title: "Davi, um coração segundo o coração de Deus",
    subtitle: "1 Samuel 16–31",
    icon: "👑",
    face: "davi",
    color: "#6a4fb3",
    lessons: [
      {
        id: "u4l1",
        title: "O pastorzinho",
        vocab: [
          { en: "shepherd", pt: "pastor" },
          { en: "sheep", pt: "ovelha" },
          { en: "harp", pt: "harpa" },
          { en: "heart", pt: "coração" },
        ],
        sentences: [
          { en: "David kept the sheep", pt: "Davi cuidava das ovelhas" },
        ],
        verse: {
          text: "Man looketh on the outward appearance, but the LORD looketh on the heart.",
          pt: "O homem vê o exterior, porém o Senhor olha para o coração.",
          ref: "1 Samuel 16:7",
          blank: "heart",
          options: ["heart", "face", "hands", "house"],
        },
      },
      {
        id: "u4l2",
        title: "Davi e Golias",
        vocab: [
          { en: "stone", pt: "pedra" },
          { en: "giant", pt: "gigante" },
          { en: "sling", pt: "funda" },
          { en: "battle", pt: "batalha" },
        ],
        sentences: [
          { en: "the battle is the Lord's", pt: "a batalha é do Senhor" },
          { en: "David took five stones", pt: "Davi tomou cinco pedras" },
        ],
        verse: {
          text: "For the battle is the LORD's, and he will give you into our hands.",
          pt: "Porque a batalha é do Senhor, e ele vos entregará na nossa mão.",
          ref: "1 Samuel 17:47",
          blank: "battle",
          options: ["battle", "silver", "harvest", "story"],
        },
      },
      {
        id: "u4l3",
        title: "O rei cantor",
        vocab: [
          { en: "song", pt: "cântico" },
          { en: "to sing", pt: "cantar" },
          { en: "rock", pt: "rocha" },
          { en: "strong", pt: "forte" },
        ],
        sentences: [
          { en: "David sang unto the Lord", pt: "Davi cantou ao Senhor" },
        ],
        verse: {
          text: "The LORD is my rock, and my fortress, and my deliverer.",
          pt: "O Senhor é o meu rochedo, e o meu lugar forte, e o meu libertador.",
          ref: "2 Samuel 22:2",
          blank: "rock",
          options: ["rock", "song", "lamp", "road"],
        },
      },
      { id: "u4r", title: "Revisão", review: true },
    ],
  },
  {
    id: "u5",
    title: "Os Profetas",
    subtitle: "Isaías 1–12",
    icon: "📜",
    face: "isaias",
    color: "#8a8a6d",
    lessons: [
      {
        id: "u5l1",
        title: "Eis-me aqui",
        vocab: [
          { en: "prophet", pt: "profeta" },
          { en: "voice", pt: "voz" },
          { en: "to send", pt: "enviar" },
          { en: "to hear", pt: "ouvir" },
        ],
        sentences: [
          { en: "here am I; send me", pt: "eis-me aqui, envia-me a mim" },
        ],
        verse: {
          text: "Whom shall I send, and who will go for us? Then said I, Here am I; send me.",
          pt: "A quem enviarei, e quem há de ir por nós? Então, disse eu: Eis-me aqui, envia-me a mim.",
          ref: "Isaías 6:8",
          blank: "send",
          options: ["send", "keep", "teach", "feed"],
        },
      },
      {
        id: "u5l2",
        title: "Emanuel",
        vocab: [
          { en: "sign", pt: "sinal" },
          { en: "child", pt: "menino" },
          { en: "name", pt: "nome" },
          { en: "with us", pt: "conosco" },
        ],
        sentences: [
          { en: "God with us", pt: "Deus conosco" },
        ],
        verse: {
          text: "Behold, a virgin shall conceive, and bear a son, and shall call his name Immanuel.",
          pt: "Eis que uma virgem conceberá, e dará à luz um filho, e será o seu nome Emanuel.",
          ref: "Isaías 7:14",
          blank: "name",
          options: ["name", "land", "word", "sign"],
        },
      },
      {
        id: "u5l3",
        title: "O Príncipe da Paz",
        vocab: [
          { en: "peace", pt: "paz" },
          { en: "prince", pt: "príncipe" },
          { en: "wonderful", pt: "maravilhoso" },
          { en: "counsellor", pt: "conselheiro" },
        ],
        sentences: [
          { en: "the Prince of Peace", pt: "o Príncipe da Paz" },
        ],
        verse: {
          text: "And his name shall be called Wonderful, Counsellor, The mighty God, The everlasting Father, The Prince of Peace.",
          pt: "E o seu nome será Maravilhoso Conselheiro, Deus Forte, Pai da Eternidade, Príncipe da Paz.",
          ref: "Isaías 9:6",
          blank: "Peace",
          options: ["Peace", "Rain", "Gold", "Light"],
        },
      },
      { id: "u5r", title: "Revisão", review: true },
    ],
  },
];
