// BíbliaLearn — histórias interativas (uma por unidade)
// Cada história é uma sequência de "beats": falas (who = personagem ou null = narrador),
// perguntas de compreensão (q + options + answer) e lacunas (gap + options + answer).

const STORIES = [
  {
    id: "s1", unit: "u1", title: "O jardim do Éden", subtitle: "Gênesis 1–3", cover: "adao", xp: 10,
    beats: [
      { who: "adao", en: "God made the heaven and the earth.", pt: "Deus fez o céu e a terra." },
      { who: "eva", en: "He made the light, the sea and the trees.", pt: "Ele fez a luz, o mar e as árvores." },
      { q: "What did God make first?", options: ["The heaven and the earth", "The ark", "The king"], answer: "The heaven and the earth" },
      { who: "adao", en: "God planted a garden in Eden.", pt: "Deus plantou um jardim no Éden." },
      { who: "eva", en: "In the garden there is the tree of life.", pt: "No jardim há a árvore da vida." },
      { gap: "God saw that it was ___.", options: ["good", "dark", "cold"], answer: "good", pt: "Deus viu que era bom." },
      { who: "adao", en: "God said: it is very good!", pt: "Deus disse: é muito bom!" },
      { who: "eva", en: "We walk with God in the garden.", pt: "Nós andamos com Deus no jardim." },
      { q: "Where do Adam and Eve walk with God?", options: ["In the garden", "In the sea", "In Egypt"], answer: "In the garden" },
    ],
  },
  {
    id: "s2", unit: "u2", title: "A arca de Noé", subtitle: "Gênesis 6–9", cover: "noe", xp: 10,
    beats: [
      { who: null, en: "Noah was a good man, and he walked with God.", pt: "Noé era um homem bom e andava com Deus." },
      { who: "noe", en: "God said to me: make an ark of wood.", pt: "Deus me disse: faze uma arca de madeira." },
      { q: "What did God tell Noah to make?", options: ["An ark of wood", "A house of stone", "A big garden"], answer: "An ark of wood" },
      { who: "noe", en: "The animals came in two by two.", pt: "Os animais entraram de dois em dois." },
      { who: null, en: "Then the rain came, forty days and forty nights.", pt: "Então veio a chuva, quarenta dias e quarenta noites." },
      { gap: "The ___ was upon the earth forty days.", options: ["rain", "sun", "wind"], answer: "rain", pt: "A chuva caiu sobre a terra quarenta dias." },
      { who: "noe", en: "I sent a dove, and it came back with a leaf.", pt: "Enviei uma pomba, e ela voltou com uma folha." },
      { who: null, en: "God set a rainbow in the cloud as a promise.", pt: "Deus pôs um arco-íris na nuvem como promessa." },
      { q: "What is the sign of God's promise?", options: ["A rainbow", "A dove", "A stone"], answer: "A rainbow" },
    ],
  },
  {
    id: "s3", unit: "u3", title: "A sarça e o mar", subtitle: "Êxodo 3–14", cover: "moises", xp: 10,
    beats: [
      { who: null, en: "Moses kept the sheep in the desert.", pt: "Moisés cuidava das ovelhas no deserto." },
      { who: "moises", en: "I see a bush that burns with fire!", pt: "Eu vejo uma sarça que arde em fogo!" },
      { who: null, en: "God said: take off your shoes, this is holy ground.", pt: "Deus disse: tira as sandálias, este é chão santo." },
      { q: "What did Moses see in the desert?", options: ["A burning bush", "A big river", "A golden calf"], answer: "A burning bush" },
      { who: "moises", en: "God sent me to the king of Egypt.", pt: "Deus me enviou ao rei do Egito." },
      { who: "arao", en: "Let my people go!", pt: "Deixa ir o meu povo!" },
      { gap: "Let my ___ go!", options: ["people", "sheep", "king"], answer: "people", pt: "Deixa ir o meu povo!" },
      { who: "moises", en: "I stretched out my hand over the sea.", pt: "Estendi a minha mão sobre o mar." },
      { who: null, en: "The waters were divided, and the people walked on dry ground.", pt: "As águas foram divididas, e o povo andou em terra seca." },
      { q: "How did the people cross the sea?", options: ["On dry ground", "In a boat", "Swimming"], answer: "On dry ground" },
    ],
  },
  {
    id: "s4", unit: "u4", title: "Davi e Golias", subtitle: "1 Samuel 17", cover: "davi", xp: 10,
    beats: [
      { who: "samuel", en: "The Lord looks at the heart, not at the outward appearance.", pt: "O Senhor olha para o coração, não para a aparência." },
      { who: "davi", en: "I am a shepherd. I keep the sheep and play the harp.", pt: "Eu sou pastor. Cuido das ovelhas e toco harpa." },
      { q: "Where does the Lord look?", options: ["At the heart", "At the face", "At the hands"], answer: "At the heart" },
      { who: null, en: "Goliath was a giant, and everyone was afraid.", pt: "Golias era um gigante, e todos tinham medo." },
      { who: "davi", en: "The battle is the Lord's!", pt: "A batalha é do Senhor!" },
      { gap: "David took five ___ and a sling.", options: ["stones", "swords", "harps"], answer: "stones", pt: "Davi tomou cinco pedras e uma funda." },
      { who: null, en: "One stone, and the giant fell.", pt: "Uma pedra, e o gigante caiu." },
      { who: "davi", en: "The Lord is my rock and my fortress.", pt: "O Senhor é a minha rocha e a minha fortaleza." },
      { q: "Why did David win the battle?", options: ["Because the battle is the Lord's", "Because he was tall", "Because he had a sword"], answer: "Because the battle is the Lord's" },
    ],
  },
  {
    id: "s5", unit: "u5", title: "Eis-me aqui", subtitle: "Isaías 6–9", cover: "isaias", xp: 10,
    beats: [
      { who: null, en: "Isaiah saw the Lord sitting on a throne.", pt: "Isaías viu o Senhor sentado num trono." },
      { who: "isaias", en: "Whom shall I send? said the Lord.", pt: "A quem enviarei?, disse o Senhor." },
      { who: "isaias", en: "Here am I; send me!", pt: "Eis-me aqui, envia-me a mim!" },
      { q: "What did Isaiah answer?", options: ["Here am I; send me", "I cannot go", "Send my brother"], answer: "Here am I; send me" },
      { who: null, en: "Isaiah spoke about a child.", pt: "Isaías falou sobre um menino." },
      { who: "isaias", en: "His name will be Immanuel: God with us.", pt: "O nome dele será Emanuel: Deus conosco." },
      { gap: "He is the Prince of ___.", options: ["Peace", "Rain", "Gold"], answer: "Peace", pt: "Ele é o Príncipe da Paz." },
      { who: "jonas", en: "God gives peace to everyone who believes.", pt: "Deus dá paz a todo aquele que crê." },
      { q: "What does Immanuel mean?", options: ["God with us", "King of Egypt", "A big river"], answer: "God with us" },
    ],
  },
];
