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
        reading: {"text": "In the beginning, God created the heaven and the earth. The earth was dark. Then God said: Let there be light.", "pt": "No princípio, Deus criou o céu e a terra. A terra estava escura. Então Deus disse: Haja luz.", "q": "What did God say?", "options": ["Let there be light", "Let there be rain", "Let there be a king"], "answer": "Let there be light"},
        dialogue: {"line": "Look! God created the light.", "pt": "Olha! Deus criou a luz.", "options": ["It is good!", "It is night.", "Where is the ark?"], "answer": "It is good!", "answerPt": "É bom!"},
        quiz: {"q": "In the beginning, who created the heaven and the earth?", "options": ["God", "Noah", "The king"], "answer": "God", "explain": "Gênesis 1:1: no princípio, Deus criou o céu e a terra."},
        title: "Céu e terra",
        vocab: [
          { en: "God", pt: "Deus", icon: "🙏" },
          { en: "heaven", pt: "céu", icon: "🌤️" },
          { en: "earth", pt: "terra", icon: "🌍" },
          { en: "light", pt: "luz", icon: "💡" },
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
        reading: {"text": "God called the light Day, and the darkness he called Night. The evening and the morning were the first day.", "pt": "Deus chamou a luz de Dia, e às trevas chamou Noite. A tarde e a manhã foram o primeiro dia.", "q": "What did God call the darkness?", "options": ["Night", "Day", "Sea"], "answer": "Night"},
        dialogue: {"line": "Good night, my friend.", "pt": "Boa noite, meu amigo.", "options": ["Good night! The darkness is here.", "Good morning! The sun is hot.", "Let my people go."], "answer": "Good night! The darkness is here.", "answerPt": "Boa noite! As trevas chegaram."},
        quiz: {"q": "What did God call the light?", "options": ["Day", "Night", "Sea"], "answer": "Day", "explain": "Deus chamou a luz de Dia e as trevas de Noite."},
        title: "Luz e trevas",
        vocab: [
          { en: "darkness", pt: "trevas", icon: "🌑" },
          { en: "day", pt: "dia", icon: "☀️" },
          { en: "night", pt: "noite", icon: "🌙" },
          { en: "good", pt: "bom", icon: "👍" },
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
        reading: {"text": "God planted a garden in Eden. In the garden there was the tree of life. God saw that it was good.", "pt": "Deus plantou um jardim no Éden. No jardim havia a árvore da vida. Deus viu que era bom.", "q": "What was in the garden?", "options": ["The tree of life", "A big ark", "A golden crown"], "answer": "The tree of life"},
        dialogue: {"line": "Come and see the garden!", "pt": "Vem ver o jardim!", "options": ["The tree of life is beautiful.", "The sea is dry.", "I have five stones."], "answer": "The tree of life is beautiful.", "answerPt": "A árvore da vida é linda."},
        quiz: {"q": "Where did God plant a garden?", "options": ["In Eden", "In Egypt", "In the sea"], "answer": "In Eden", "explain": "Deus plantou um jardim no Éden (Gênesis 2:8)."},
        title: "O jardim",
        vocab: [
          { en: "garden", pt: "jardim", icon: "🌳" },
          { en: "tree", pt: "árvore", icon: "🌲" },
          { en: "life", pt: "vida", icon: "🌱" },
          { en: "man", pt: "homem", icon: "🧔" },
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
        reading: {"text": "God said to Noah: Make an ark of wood. Noah made the ark, and the animals came in two by two.", "pt": "Deus disse a Noé: Faze uma arca de madeira. Noé fez a arca, e os animais entraram de dois em dois.", "q": "How did the animals come in?", "options": ["Two by two", "One by one", "All at night"], "answer": "Two by two"},
        dialogue: {"line": "Noah, what are you making?", "pt": "Noé, o que você está fazendo?", "options": ["An ark of wood.", "A song.", "A crown."], "answer": "An ark of wood.", "answerPt": "Uma arca de madeira."},
        quiz: {"q": "What did Noah make?", "options": ["An ark of wood", "A house of stone", "A garden"], "answer": "An ark of wood", "explain": "Noé fez uma arca de madeira de gofer."},
        title: "A arca",
        vocab: [
          { en: "ark", pt: "arca", icon: "🚢" },
          { en: "rain", pt: "chuva", icon: "🌧️" },
          { en: "animals", pt: "animais", icon: "🐘" },
          { en: "door", pt: "porta", icon: "🚪" },
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
        reading: {"text": "The rain was upon the earth forty days and forty nights. The water covered the mountains. But Noah was safe in the ark.", "pt": "A chuva caiu sobre a terra quarenta dias e quarenta noites. A água cobriu as montanhas. Mas Noé estava seguro na arca.", "q": "How long did it rain?", "options": ["Forty days and forty nights", "Seven days", "One night"], "answer": "Forty days and forty nights"},
        dialogue: {"line": "It is raining a lot!", "pt": "Está chovendo muito!", "options": ["Let us go into the ark.", "Let us go to the desert.", "The battle is the Lord's."], "answer": "Let us go into the ark.", "answerPt": "Vamos entrar na arca."},
        quiz: {"q": "How many days did it rain?", "options": ["Forty days", "Seven days", "Three days"], "answer": "Forty days", "explain": "Choveu quarenta dias e quarenta noites."},
        title: "O dilúvio",
        vocab: [
          { en: "flood", pt: "dilúvio", icon: "⛈️" },
          { en: "forty", pt: "quarenta", icon: "🔢" },
          { en: "water", pt: "água", icon: "💧" },
          { en: "window", pt: "janela", icon: "🪟" },
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
        reading: {"text": "Noah sent a dove. The dove came back with a leaf. Then God set a rainbow in the cloud as a promise.", "pt": "Noé enviou uma pomba. A pomba voltou com uma folha. Então Deus pôs um arco-íris na nuvem como promessa.", "q": "What did the dove bring?", "options": ["A leaf", "A stone", "A fish"], "answer": "A leaf"},
        dialogue: {"line": "Look at the cloud!", "pt": "Olha a nuvem!", "options": ["I see a rainbow!", "I see a giant!", "I see a harp!"], "answer": "I see a rainbow!", "answerPt": "Eu vejo um arco-íris!"},
        quiz: {"q": "What did God set in the cloud?", "options": ["A rainbow", "A dove", "A star"], "answer": "A rainbow", "explain": "Deus pôs o arco-íris na nuvem como sinal da promessa."},
        title: "A promessa",
        vocab: [
          { en: "dove", pt: "pomba", icon: "🕊️" },
          { en: "rainbow", pt: "arco-íris", icon: "🌈" },
          { en: "promise", pt: "promessa", icon: "✍️" },
          { en: "cloud", pt: "nuvem", icon: "☁️" },
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
        reading: {"text": "Moses saw a bush that burned with fire, but it was not consumed. God said: Take off your shoes, this is holy ground.", "pt": "Moisés viu uma sarça que ardia em fogo, mas não se consumia. Deus disse: Tira as sandálias, este é chão santo.", "q": "What did God say to Moses?", "options": ["Take off your shoes", "Build an ark", "Sing a song"], "answer": "Take off your shoes"},
        dialogue: {"line": "Moses, take off your shoes.", "pt": "Moisés, tira as sandálias.", "options": ["Yes, this is holy ground.", "No, the sea is dry.", "Here is my harp."], "answer": "Yes, this is holy ground.", "answerPt": "Sim, este é chão santo."},
        quiz: {"q": "What did Moses see in the desert?", "options": ["A burning bush", "A big river", "A golden calf"], "answer": "A burning bush", "explain": "Moisés viu a sarça que ardia sem se consumir."},
        title: "A sarça ardente",
        vocab: [
          { en: "fire", pt: "fogo", icon: "🔥" },
          { en: "holy", pt: "santo", icon: "✨" },
          { en: "ground", pt: "chão", icon: "🟫" },
          { en: "to see", pt: "ver", icon: "👀" },
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
        reading: {"text": "Moses went to the king of Egypt and said: Let my people go. But the king said no. So God sent signs.", "pt": "Moisés foi ao rei do Egito e disse: Deixa ir o meu povo. Mas o rei disse não. Então Deus enviou sinais.", "q": "What did the king say?", "options": ["No", "Yes", "Maybe"], "answer": "No"},
        dialogue: {"line": "Who are you?", "pt": "Quem é você?", "options": ["I am Moses. Let my people go.", "I am the ark.", "I am a rainbow."], "answer": "I am Moses. Let my people go.", "answerPt": "Eu sou Moisés. Deixa ir o meu povo."},
        quiz: {"q": "What did Moses say to the king?", "options": ["Let my people go", "Give me gold", "Build a city"], "answer": "Let my people go", "explain": "\"Deixa ir o meu povo\" (Êxodo 5:1)."},
        title: "Deixa o meu povo ir",
        vocab: [
          { en: "people", pt: "povo", icon: "👥" },
          { en: "free", pt: "livre", icon: "🔓" },
          { en: "king", pt: "rei", icon: "👑" },
          { en: "to go", pt: "ir", icon: "🚶" },
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
        reading: {"text": "Moses stretched out his hand over the sea. The waters were divided, and the people walked on dry ground.", "pt": "Moisés estendeu a mão sobre o mar. As águas foram divididas, e o povo andou em terra seca.", "q": "Where did the people walk?", "options": ["On dry ground", "On the water", "In the ark"], "answer": "On dry ground"},
        dialogue: {"line": "Moses, the sea is in front of us!", "pt": "Moisés, o mar está na nossa frente!", "options": ["Stretch out your hand!", "Sing a song!", "Build an ark!"], "answer": "Stretch out your hand!", "answerPt": "Estende a tua mão!"},
        quiz: {"q": "What happened to the sea?", "options": ["The waters were divided", "The sea became fire", "The sea was silent"], "answer": "The waters were divided", "explain": "As águas foram divididas e o povo passou em terra seca."},
        title: "O mar se abre",
        vocab: [
          { en: "sea", pt: "mar", icon: "🌊" },
          { en: "dry", pt: "seco", icon: "🏜️" },
          { en: "hand", pt: "mão", icon: "✋" },
          { en: "wind", pt: "vento", icon: "💨" },
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
        reading: {"text": "David was a shepherd. He kept the sheep and played the harp. God looked at his heart and chose him.", "pt": "Davi era pastor. Ele cuidava das ovelhas e tocava harpa. Deus olhou para o seu coração e o escolheu.", "q": "What did David play?", "options": ["The harp", "The drum", "The horn"], "answer": "The harp"},
        dialogue: {"line": "David, where are the sheep?", "pt": "Davi, onde estão as ovelhas?", "options": ["They are in the field.", "They are in the ark.", "They are in the cloud."], "answer": "They are in the field.", "answerPt": "Elas estão no campo."},
        quiz: {"q": "Where does the Lord look?", "options": ["On the heart", "On the face", "On the hands"], "answer": "On the heart", "explain": "O Senhor olha para o coração (1 Samuel 16:7)."},
        title: "O pastorzinho",
        vocab: [
          { en: "shepherd", pt: "pastor", icon: "🧑‍🌾" },
          { en: "sheep", pt: "ovelha", icon: "🐑" },
          { en: "harp", pt: "harpa", icon: "🎶" },
          { en: "heart", pt: "coração", icon: "❤️" },
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
        reading: {"text": "Goliath was a giant. David took five stones and a sling. He said: The battle is the Lord's.", "pt": "Golias era um gigante. Davi tomou cinco pedras e uma funda. Ele disse: A batalha é do Senhor.", "q": "What did David take?", "options": ["Five stones and a sling", "A sword", "A crown"], "answer": "Five stones and a sling"},
        dialogue: {"line": "The giant is coming!", "pt": "O gigante está vindo!", "options": ["The battle is the Lord's!", "Good night!", "I see a rainbow!"], "answer": "The battle is the Lord's!", "answerPt": "A batalha é do Senhor!"},
        quiz: {"q": "What did David take to the battle?", "options": ["Five stones", "A sword", "A crown"], "answer": "Five stones", "explain": "Davi escolheu cinco pedras lisas do ribeiro."},
        title: "Davi e Golias",
        vocab: [
          { en: "stone", pt: "pedra", icon: "🪨" },
          { en: "giant", pt: "gigante", icon: "🗿" },
          { en: "sling", pt: "funda", icon: "🎯" },
          { en: "battle", pt: "batalha", icon: "⚔️" },
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
        reading: {"text": "David became king. He sang: The Lord is my rock and my fortress. He was strong because God was with him.", "pt": "Davi tornou-se rei. Ele cantou: O Senhor é a minha rocha e a minha fortaleza. Ele era forte porque Deus estava com ele.", "q": "Why was David strong?", "options": ["Because God was with him", "Because he had gold", "Because he was tall"], "answer": "Because God was with him"},
        dialogue: {"line": "David, sing for us!", "pt": "Davi, cante para nós!", "options": ["The Lord is my rock!", "The sea is dry!", "Take off your shoes!"], "answer": "The Lord is my rock!", "answerPt": "O Senhor é a minha rocha!"},
        quiz: {"q": "Who is my rock, said David?", "options": ["The Lord", "The king", "The giant"], "answer": "The Lord", "explain": "\"O Senhor é o meu rochedo\" (2 Samuel 22:2)."},
        title: "O rei cantor",
        vocab: [
          { en: "song", pt: "cântico", icon: "🎵" },
          { en: "to sing", pt: "cantar", icon: "🎤" },
          { en: "rock", pt: "rocha", icon: "⛰️" },
          { en: "strong", pt: "forte", icon: "💪" },
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
        reading: {"text": "Isaiah saw the Lord on a throne. God said: Whom shall I send? Isaiah said: Here am I; send me.", "pt": "Isaías viu o Senhor num trono. Deus disse: A quem enviarei? Isaías disse: Eis-me aqui, envia-me a mim.", "q": "What did Isaiah say?", "options": ["Here am I; send me", "I cannot go", "Send my brother"], "answer": "Here am I; send me"},
        dialogue: {"line": "Whom shall I send?", "pt": "A quem enviarei?", "options": ["Here am I; send me.", "Send the sheep.", "Let there be light."], "answer": "Here am I; send me.", "answerPt": "Eis-me aqui, envia-me a mim."},
        quiz: {"q": "What did Isaiah answer to God?", "options": ["Here am I; send me", "I cannot go", "Send my brother"], "answer": "Here am I; send me", "explain": "\"Eis-me aqui, envia-me a mim\" (Isaías 6:8)."},
        title: "Eis-me aqui",
        vocab: [
          { en: "prophet", pt: "profeta", icon: "📜" },
          { en: "voice", pt: "voz", icon: "🗣️" },
          { en: "to send", pt: "enviar", icon: "📨" },
          { en: "to hear", pt: "ouvir", icon: "👂" },
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
        reading: {"text": "Isaiah said: A virgin shall have a son. His name will be Immanuel. It means God with us.", "pt": "Isaías disse: Uma virgem terá um filho. O nome dele será Emanuel. Significa Deus conosco.", "q": "What does Immanuel mean?", "options": ["God with us", "King of Egypt", "Big river"], "answer": "God with us"},
        dialogue: {"line": "What is the name of the child?", "pt": "Qual é o nome do menino?", "options": ["Immanuel: God with us.", "Goliath the giant.", "Noah of the ark."], "answer": "Immanuel: God with us.", "answerPt": "Emanuel: Deus conosco."},
        quiz: {"q": "What does Immanuel mean?", "options": ["God with us", "God is far", "King of Egypt"], "answer": "God with us", "explain": "Emanuel significa \"Deus conosco\"."},
        title: "Emanuel",
        vocab: [
          { en: "sign", pt: "sinal", icon: "⭐" },
          { en: "child", pt: "menino", icon: "👶" },
          { en: "name", pt: "nome", icon: "🏷️" },
          { en: "with us", pt: "conosco", icon: "👫" },
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
        reading: {"text": "Isaiah said: A child is born. His name is Wonderful, Counsellor, The Prince of Peace. He brings peace to the world.", "pt": "Isaías disse: Um menino nasceu. O seu nome é Maravilhoso, Conselheiro, Príncipe da Paz. Ele traz paz ao mundo.", "q": "What does the child bring?", "options": ["Peace", "Rain", "Gold"], "answer": "Peace"},
        dialogue: {"line": "Who is coming?", "pt": "Quem está vindo?", "options": ["The Prince of Peace!", "The king of Egypt!", "A big river!"], "answer": "The Prince of Peace!", "answerPt": "O Príncipe da Paz!"},
        quiz: {"q": "Who is called the Prince of Peace?", "options": ["The Son", "The king of Egypt", "The prophet"], "answer": "The Son", "explain": "Isaías 9:6 anuncia o Filho, o Príncipe da Paz."},
        title: "O Príncipe da Paz",
        vocab: [
          { en: "peace", pt: "paz", icon: "☮️" },
          { en: "prince", pt: "príncipe", icon: "🤴" },
          { en: "wonderful", pt: "maravilhoso", icon: "🌟" },
          { en: "counsellor", pt: "conselheiro", icon: "🧠" },
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
{
  "id": "u6",
  "title": "José no Egito",
  "subtitle": "Gênesis 37–50",
  "icon": "🌾",
  "face": "jose",
  "color": "#2e9d8a",
  "lessons": [
    {
      "id": "u6l1",
      "title": "Os sonhos de José",
      "vocab": [
        {
          "en": "dream",
          "pt": "sonho",
          "icon": "💭"
        },
        {
          "en": "brother",
          "pt": "irmão",
          "icon": "👬"
        },
        {
          "en": "coat",
          "pt": "túnica",
          "icon": "🧥"
        },
        {
          "en": "to sell",
          "pt": "vender",
          "icon": "💰"
        }
      ],
      "sentences": [
        {
          "en": "Joseph had a dream",
          "pt": "José teve um sonho"
        },
        {
          "en": "his brothers sold him",
          "pt": "os irmãos dele o venderam"
        }
      ],
      "verse": {
        "text": "And Joseph dreamed a dream, and he told it his brethren.",
        "pt": "E José teve um sonho e o contou aos seus irmãos.",
        "ref": "Gênesis 37:5",
        "blank": "dream",
        "options": [
          "dream",
          "coat",
          "stone",
          "song"
        ]
      },
      "dialogue": {
        "line": "Joseph, tell us your dream!",
        "pt": "José, conte-nos o seu sonho!",
        "options": [
          "The sun and the moon bowed to me.",
          "The sea is dry.",
          "I see a rainbow!"
        ],
        "answer": "The sun and the moon bowed to me.",
        "answerPt": "O sol e a lua se curvaram diante de mim."
      },
      "quiz": {
        "q": "What did Joseph's father give him?",
        "options": [
          "A coat of many colors",
          "A crown",
          "A harp"
        ],
        "answer": "A coat of many colors",
        "explain": "Jacó deu a José uma túnica de muitas cores."
      },
      "reading": {
        "text": "Joseph was the son Jacob loved. His father gave him a coat of many colors. His brothers were jealous and sold him to Egypt.",
        "pt": "José era o filho que Jacó amava. O pai lhe deu uma túnica de muitas cores. Os irmãos tiveram inveja e o venderam para o Egito.",
        "q": "Why did the brothers sell Joseph?",
        "options": [
          "They were jealous",
          "They needed a boat",
          "They were afraid of lions"
        ],
        "answer": "They were jealous"
      }
    },
    {
      "id": "u6l2",
      "title": "Na casa do rei",
      "vocab": [
        {
          "en": "prison",
          "pt": "prisão",
          "icon": "⛓️"
        },
        {
          "en": "to interpret",
          "pt": "interpretar",
          "icon": "🔎"
        },
        {
          "en": "seven",
          "pt": "sete",
          "icon": "7️⃣"
        },
        {
          "en": "bread",
          "pt": "pão",
          "icon": "🍞"
        }
      ],
      "sentences": [
        {
          "en": "God is with Joseph",
          "pt": "Deus está com José"
        },
        {
          "en": "seven years of plenty",
          "pt": "sete anos de fartura"
        }
      ],
      "verse": {
        "text": "But the LORD was with Joseph, and shewed him mercy.",
        "pt": "Mas o Senhor era com José e lhe mostrou misericórdia.",
        "ref": "Gênesis 39:21",
        "blank": "with",
        "options": [
          "with",
          "far",
          "after",
          "under"
        ]
      },
      "dialogue": {
        "line": "Can you interpret my dream?",
        "pt": "Você pode interpretar o meu sonho?",
        "options": [
          "God will give the answer.",
          "I have five stones.",
          "Let there be light."
        ],
        "answer": "God will give the answer.",
        "answerPt": "Deus dará a resposta."
      },
      "quiz": {
        "q": "How many years of plenty did Joseph announce?",
        "options": [
          "Seven",
          "Forty",
          "Three"
        ],
        "answer": "Seven",
        "explain": "Sete anos de fartura e sete de fome."
      },
      "reading": {
        "text": "In prison, Joseph interpreted dreams. Then the king had a dream. Joseph said: seven years of plenty, then seven years of famine. The king made Joseph a ruler of Egypt.",
        "pt": "Na prisão, José interpretou sonhos. Então o rei teve um sonho. José disse: sete anos de fartura, depois sete anos de fome. O rei fez de José governador do Egito.",
        "q": "What did the king make Joseph?",
        "options": [
          "A ruler of Egypt",
          "A shepherd",
          "A prisoner"
        ],
        "answer": "A ruler of Egypt"
      }
    },
    {
      "id": "u6l3",
      "title": "O perdão",
      "vocab": [
        {
          "en": "to forgive",
          "pt": "perdoar",
          "icon": "🤲"
        },
        {
          "en": "family",
          "pt": "família",
          "icon": "👨‍👩‍👧‍👦"
        },
        {
          "en": "famine",
          "pt": "fome",
          "icon": "🌵"
        },
        {
          "en": "to weep",
          "pt": "chorar",
          "icon": "😢"
        }
      ],
      "sentences": [
        {
          "en": "Joseph forgave his brothers",
          "pt": "José perdoou os seus irmãos"
        },
        {
          "en": "God meant it for good",
          "pt": "Deus o tornou em bem"
        }
      ],
      "verse": {
        "text": "Ye thought evil against me; but God meant it unto good.",
        "pt": "Vós pensastes o mal contra mim, mas Deus o tornou em bem.",
        "ref": "Gênesis 50:20",
        "blank": "good",
        "options": [
          "good",
          "gold",
          "night",
          "water"
        ]
      },
      "dialogue": {
        "line": "We are your brothers. Forgive us!",
        "pt": "Somos seus irmãos. Perdoe-nos!",
        "options": [
          "Do not be afraid. God meant it for good.",
          "Go to the desert.",
          "I see a giant!"
        ],
        "answer": "Do not be afraid. God meant it for good.",
        "answerPt": "Não tenham medo. Deus o tornou em bem."
      },
      "quiz": {
        "q": "What did Joseph do when he saw his brothers?",
        "options": [
          "He forgave them",
          "He sold them",
          "He hid from them"
        ],
        "answer": "He forgave them",
        "explain": "José chorou e perdoou os irmãos."
      },
      "reading": {
        "text": "The famine came, and the brothers went to Egypt for bread. They did not know Joseph. Joseph wept and said: I am Joseph, your brother. God sent me here to save you.",
        "pt": "Veio a fome, e os irmãos foram ao Egito buscar pão. Eles não reconheceram José. José chorou e disse: Eu sou José, o irmão de vocês. Deus me enviou aqui para salvar vocês.",
        "q": "Why did God send Joseph to Egypt?",
        "options": [
          "To save his family",
          "To build an ark",
          "To fight a giant"
        ],
        "answer": "To save his family"
      }
    },
    {
      "id": "u6r",
      "title": "Revisão",
      "review": true
    }
  ]
},
{
  "id": "u7",
  "title": "Daniel na cova dos leões",
  "subtitle": "Daniel 1–6",
  "icon": "🦁",
  "face": "daniel",
  "color": "#c0392b",
  "lessons": [
    {
      "id": "u7l1",
      "title": "Fiel em Babilônia",
      "vocab": [
        {
          "en": "lion",
          "pt": "leão",
          "icon": "🦁"
        },
        {
          "en": "to pray",
          "pt": "orar",
          "icon": "🙏"
        },
        {
          "en": "faithful",
          "pt": "fiel",
          "icon": "💎"
        },
        {
          "en": "law",
          "pt": "lei",
          "icon": "📜"
        }
      ],
      "sentences": [
        {
          "en": "Daniel prayed three times a day",
          "pt": "Daniel orava três vezes ao dia"
        },
        {
          "en": "Daniel was faithful to God",
          "pt": "Daniel era fiel a Deus"
        }
      ],
      "verse": {
        "text": "He kneeled upon his knees three times a day, and prayed.",
        "pt": "Ele se punha de joelhos três vezes ao dia e orava.",
        "ref": "Daniel 6:10",
        "blank": "prayed",
        "options": [
          "prayed",
          "sang",
          "ran",
          "slept"
        ]
      },
      "dialogue": {
        "line": "Daniel, the king made a new law!",
        "pt": "Daniel, o rei fez uma nova lei!",
        "options": [
          "I will pray to my God anyway.",
          "Let us go into the ark.",
          "The sea is dry."
        ],
        "answer": "I will pray to my God anyway.",
        "answerPt": "Vou orar ao meu Deus mesmo assim."
      },
      "quiz": {
        "q": "How many times a day did Daniel pray?",
        "options": [
          "Three",
          "Seven",
          "Once"
        ],
        "answer": "Three",
        "explain": "Daniel orava três vezes ao dia, com a janela aberta."
      },
      "reading": {
        "text": "Daniel lived in Babylon, far from his home. He loved God and prayed three times a day. The king made a law: pray only to the king. But Daniel prayed to God.",
        "pt": "Daniel vivia na Babilônia, longe de casa. Ele amava a Deus e orava três vezes ao dia. O rei fez uma lei: orar só ao rei. Mas Daniel orou a Deus.",
        "q": "What did the law say?",
        "options": [
          "Pray only to the king",
          "Build a temple",
          "Go to Egypt"
        ],
        "answer": "Pray only to the king"
      }
    },
    {
      "id": "u7l2",
      "title": "A cova dos leões",
      "vocab": [
        {
          "en": "angel",
          "pt": "anjo",
          "icon": "👼"
        },
        {
          "en": "mouth",
          "pt": "boca",
          "icon": "👄"
        },
        {
          "en": "to close",
          "pt": "fechar",
          "icon": "🔒"
        },
        {
          "en": "morning",
          "pt": "manhã",
          "icon": "🌅"
        }
      ],
      "sentences": [
        {
          "en": "God sent his angel",
          "pt": "Deus enviou o seu anjo"
        },
        {
          "en": "the angel shut the lions' mouths",
          "pt": "o anjo fechou a boca dos leões"
        }
      ],
      "verse": {
        "text": "My God hath sent his angel, and hath shut the lions' mouths.",
        "pt": "O meu Deus enviou o seu anjo e fechou a boca dos leões.",
        "ref": "Daniel 6:22",
        "blank": "angel",
        "options": [
          "angel",
          "king",
          "brother",
          "stone"
        ]
      },
      "dialogue": {
        "line": "Daniel, is your God able to save you?",
        "pt": "Daniel, o seu Deus pode salvá-lo?",
        "options": [
          "Yes! God sent his angel.",
          "No, the sea is dry.",
          "I have a harp."
        ],
        "answer": "Yes! God sent his angel.",
        "answerPt": "Sim! Deus enviou o seu anjo."
      },
      "quiz": {
        "q": "Who shut the lions' mouths?",
        "options": [
          "An angel of God",
          "The king",
          "Daniel's brother"
        ],
        "answer": "An angel of God",
        "explain": "Deus enviou o seu anjo e fechou a boca dos leões."
      },
      "reading": {
        "text": "They threw Daniel into the lions' den. In the morning, the king ran to the den. Daniel said: My God sent his angel and shut the lions' mouths. The king was very happy.",
        "pt": "Jogaram Daniel na cova dos leões. De manhã, o rei correu até a cova. Daniel disse: O meu Deus enviou o seu anjo e fechou a boca dos leões. O rei ficou muito feliz.",
        "q": "When did the king run to the den?",
        "options": [
          "In the morning",
          "At night",
          "After seven days"
        ],
        "answer": "In the morning"
      }
    },
    {
      "id": "u7l3",
      "title": "O Deus vivo",
      "vocab": [
        {
          "en": "kingdom",
          "pt": "reino",
          "icon": "🏰"
        },
        {
          "en": "forever",
          "pt": "para sempre",
          "icon": "♾️"
        },
        {
          "en": "to save",
          "pt": "salvar",
          "icon": "🛟"
        },
        {
          "en": "living",
          "pt": "vivo",
          "icon": "💚"
        }
      ],
      "sentences": [
        {
          "en": "he is the living God",
          "pt": "ele é o Deus vivo"
        },
        {
          "en": "his kingdom is forever",
          "pt": "o seu reino é para sempre"
        }
      ],
      "verse": {
        "text": "He is the living God, and stedfast for ever.",
        "pt": "Ele é o Deus vivo e permanece para sempre.",
        "ref": "Daniel 6:26",
        "blank": "living",
        "options": [
          "living",
          "little",
          "cold",
          "dry"
        ]
      },
      "dialogue": {
        "line": "People of Babylon, listen!",
        "pt": "Povo da Babilônia, ouçam!",
        "options": [
          "The God of Daniel is the living God.",
          "The rain is coming.",
          "Take off your shoes."
        ],
        "answer": "The God of Daniel is the living God.",
        "answerPt": "O Deus de Daniel é o Deus vivo."
      },
      "quiz": {
        "q": "What did the king say about God?",
        "options": [
          "He is the living God",
          "He is far away",
          "He is a king of Egypt"
        ],
        "answer": "He is the living God",
        "explain": "O rei escreveu: o Deus de Daniel é o Deus vivo."
      },
      "reading": {
        "text": "The king wrote to all the people: The God of Daniel is the living God. His kingdom is forever. He saves and he delivers. Daniel was faithful, and God was faithful to him.",
        "pt": "O rei escreveu a todo o povo: O Deus de Daniel é o Deus vivo. O seu reino é para sempre. Ele salva e livra. Daniel foi fiel, e Deus foi fiel a ele.",
        "q": "How long is God's kingdom?",
        "options": [
          "Forever",
          "Seven years",
          "One day"
        ],
        "answer": "Forever"
      }
    },
    {
      "id": "u7r",
      "title": "Revisão",
      "review": true
    }
  ]
},
{
  "id": "u8",
  "title": "Jesus e os discípulos",
  "subtitle": "Mateus 4–14",
  "icon": "🐟",
  "face": "jesus",
  "color": "#3f7fd6",
  "lessons": [
    {
      "id": "u8l1",
      "title": "Vinde após mim",
      "vocab": [
        {
          "en": "fisherman",
          "pt": "pescador",
          "icon": "🎣"
        },
        {
          "en": "net",
          "pt": "rede",
          "icon": "🕸️"
        },
        {
          "en": "to follow",
          "pt": "seguir",
          "icon": "👣"
        },
        {
          "en": "disciple",
          "pt": "discípulo",
          "icon": "🧑‍🤝‍🧑"
        }
      ],
      "sentences": [
        {
          "en": "follow me",
          "pt": "segue-me"
        },
        {
          "en": "they left their nets and followed him",
          "pt": "eles deixaram as redes e o seguiram"
        }
      ],
      "verse": {
        "text": "Follow me, and I will make you fishers of men.",
        "pt": "Vinde após mim, e eu vos farei pescadores de homens.",
        "ref": "Mateus 4:19",
        "blank": "Follow",
        "options": [
          "Follow",
          "Leave",
          "Send",
          "Build"
        ]
      },
      "dialogue": {
        "line": "Peter, leave your nets and follow me.",
        "pt": "Pedro, deixe as redes e siga-me.",
        "options": [
          "Yes, Lord! I will follow you.",
          "No, the sea is dry.",
          "I have five stones."
        ],
        "answer": "Yes, Lord! I will follow you.",
        "answerPt": "Sim, Senhor! Eu te seguirei."
      },
      "quiz": {
        "q": "What were Peter and Andrew doing?",
        "options": [
          "Fishing",
          "Building an ark",
          "Singing"
        ],
        "answer": "Fishing",
        "explain": "Pedro e André eram pescadores e lançavam as redes ao mar."
      },
      "reading": {
        "text": "Jesus walked by the sea. He saw Peter and Andrew, two fishermen. He said: Follow me, and I will make you fishers of men. They left their nets and followed him.",
        "pt": "Jesus andava à beira do mar. Viu Pedro e André, dois pescadores. Disse: Vinde após mim, e eu vos farei pescadores de homens. Eles deixaram as redes e o seguiram.",
        "q": "What did Peter and Andrew leave?",
        "options": [
          "Their nets",
          "Their crowns",
          "Their harps"
        ],
        "answer": "Their nets"
      }
    },
    {
      "id": "u8l2",
      "title": "O Pai Nosso",
      "vocab": [
        {
          "en": "father",
          "pt": "pai",
          "icon": "👨"
        },
        {
          "en": "bread",
          "pt": "pão",
          "icon": "🍞"
        },
        {
          "en": "to forgive",
          "pt": "perdoar",
          "icon": "🤲"
        },
        {
          "en": "daily",
          "pt": "diário",
          "icon": "📅"
        }
      ],
      "sentences": [
        {
          "en": "give us this day our daily bread",
          "pt": "o pão nosso de cada dia nos dá hoje"
        },
        {
          "en": "forgive us our debts",
          "pt": "perdoa-nos as nossas dívidas"
        }
      ],
      "verse": {
        "text": "Our Father which art in heaven, Hallowed be thy name.",
        "pt": "Pai nosso que estás nos céus, santificado seja o teu nome.",
        "ref": "Mateus 6:9",
        "blank": "Father",
        "options": [
          "Father",
          "Brother",
          "King",
          "Servant"
        ]
      },
      "dialogue": {
        "line": "Lord, teach us to pray.",
        "pt": "Senhor, ensina-nos a orar.",
        "options": [
          "Our Father which art in heaven...",
          "Let my people go.",
          "I see a rainbow!"
        ],
        "answer": "Our Father which art in heaven...",
        "answerPt": "Pai nosso que estás nos céus..."
      },
      "quiz": {
        "q": "How does the prayer begin?",
        "options": [
          "Our Father which art in heaven",
          "In the beginning",
          "Follow me"
        ],
        "answer": "Our Father which art in heaven",
        "explain": "Jesus ensinou a orar começando por 'Pai nosso'."
      },
      "reading": {
        "text": "Jesus taught his disciples to pray: Our Father in heaven, your kingdom come. Give us this day our daily bread. Forgive us, as we forgive others.",
        "pt": "Jesus ensinou os discípulos a orar: Pai nosso que estás nos céus, venha o teu reino. O pão nosso de cada dia nos dá hoje. Perdoa-nos, como nós perdoamos.",
        "q": "What do we ask for each day?",
        "options": [
          "Our daily bread",
          "A new coat",
          "Five stones"
        ],
        "answer": "Our daily bread"
      }
    },
    {
      "id": "u8l3",
      "title": "Pães e peixes",
      "vocab": [
        {
          "en": "fish",
          "pt": "peixe",
          "icon": "🐟"
        },
        {
          "en": "five",
          "pt": "cinco",
          "icon": "5️⃣"
        },
        {
          "en": "crowd",
          "pt": "multidão",
          "icon": "👥"
        },
        {
          "en": "to bless",
          "pt": "abençoar",
          "icon": "🙌"
        }
      ],
      "sentences": [
        {
          "en": "five loaves and two fishes",
          "pt": "cinco pães e dois peixes"
        },
        {
          "en": "they did all eat and were filled",
          "pt": "todos comeram e ficaram satisfeitos"
        }
      ],
      "verse": {
        "text": "And he took the five loaves, and the two fishes, and blessed.",
        "pt": "E tomou os cinco pães e os dois peixes e abençoou.",
        "ref": "Mateus 14:19",
        "blank": "blessed",
        "options": [
          "blessed",
          "sold",
          "hid",
          "cut"
        ]
      },
      "dialogue": {
        "line": "Lord, we have only five loaves and two fishes.",
        "pt": "Senhor, temos só cinco pães e dois peixes.",
        "options": [
          "Bring them to me.",
          "Go to Egypt.",
          "Close the door."
        ],
        "answer": "Bring them to me.",
        "answerPt": "Tragam-nos a mim."
      },
      "quiz": {
        "q": "How many loaves did the boy have?",
        "options": [
          "Five",
          "Forty",
          "Twelve"
        ],
        "answer": "Five",
        "explain": "Cinco pães e dois peixes alimentaram a multidão."
      },
      "reading": {
        "text": "A great crowd followed Jesus. A boy had five loaves and two fishes. Jesus blessed the bread and the fish, and everyone ate. Twelve baskets were left over.",
        "pt": "Uma grande multidão seguia Jesus. Um menino tinha cinco pães e dois peixes. Jesus abençoou o pão e o peixe, e todos comeram. Sobraram doze cestos.",
        "q": "How many baskets were left?",
        "options": [
          "Twelve",
          "Two",
          "Five"
        ],
        "answer": "Twelve"
      }
    },
    {
      "id": "u8r",
      "title": "Revisão",
      "review": true
    }
  ]
}
];
