// BibleLingo — conteúdo das unidades e lições
// Vocabulário: pares EN/PT. Sentences: frases para montar com banco de palavras.
// Verses: versículos (domínio público, KJV/WEB) para exercício de lacuna.

const COURSE = [
  {
    id: "u1",
    title: "A Criação",
    subtitle: "Gênesis 1",
    icon: "🌍",
    color: "#58cc02",
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
        title: "Águas e vida",
        vocab: [
          { en: "water", pt: "água" },
          { en: "sea", pt: "mar" },
          { en: "tree", pt: "árvore" },
          { en: "life", pt: "vida" },
        ],
        sentences: [
          { en: "the tree of life", pt: "a árvore da vida" },
          { en: "God saw that it was good", pt: "Deus viu que era bom" },
        ],
        verse: {
          text: "And God saw every thing that he had made, and, behold, it was very good.",
          pt: "E viu Deus tudo quanto fizera, e eis que era muito bom.",
          ref: "Gênesis 1:31",
          blank: "good",
          options: ["good", "dark", "small", "new"],
        },
      },
      {
        id: "u1r",
        title: "Revisão da unidade",
        review: true,
      },
    ],
  },
  {
    id: "u2",
    title: "Família e Pessoas",
    subtitle: "Os patriarcas",
    icon: "👨‍👩‍👦",
    color: "#1cb0f6",
    lessons: [
      {
        id: "u2l1",
        title: "A família",
        vocab: [
          { en: "father", pt: "pai" },
          { en: "mother", pt: "mãe" },
          { en: "son", pt: "filho" },
          { en: "brother", pt: "irmão" },
        ],
        sentences: [
          { en: "Abraham was the father of Isaac", pt: "Abraão foi o pai de Isaque" },
        ],
        verse: {
          text: "Honour thy father and thy mother.",
          pt: "Honra teu pai e tua mãe.",
          ref: "Êxodo 20:12",
          blank: "father",
          options: ["father", "brother", "friend", "king"],
        },
      },
      {
        id: "u2l2",
        title: "Homem e mulher",
        vocab: [
          { en: "man", pt: "homem" },
          { en: "woman", pt: "mulher" },
          { en: "child", pt: "criança" },
          { en: "name", pt: "nome" },
        ],
        sentences: [
          { en: "the man and the woman", pt: "o homem e a mulher" },
          { en: "his name was Moses", pt: "o nome dele era Moisés" },
        ],
        verse: {
          text: "So God created man in his own image.",
          pt: "E criou Deus o homem à sua imagem.",
          ref: "Gênesis 1:27",
          blank: "man",
          options: ["man", "sea", "day", "tree"],
        },
      },
      {
        id: "u2l3",
        title: "Reis e servos",
        vocab: [
          { en: "king", pt: "rei" },
          { en: "servant", pt: "servo" },
          { en: "people", pt: "povo" },
          { en: "friend", pt: "amigo" },
        ],
        sentences: [
          { en: "David was king of Israel", pt: "Davi era rei de Israel" },
          { en: "speak, for thy servant heareth", pt: "fala, porque o teu servo ouve" },
        ],
        verse: {
          text: "The LORD is my shepherd; I shall not want.",
          pt: "O Senhor é o meu pastor; nada me faltará.",
          ref: "Salmos 23:1",
          blank: "shepherd",
          options: ["shepherd", "servant", "king", "brother"],
        },
      },
      {
        id: "u2r",
        title: "Revisão da unidade",
        review: true,
      },
    ],
  },
  {
    id: "u3",
    title: "Verbos da Fé",
    subtitle: "Ações essenciais",
    icon: "✨",
    color: "#ff9600",
    lessons: [
      {
        id: "u3l1",
        title: "Amar e dar",
        vocab: [
          { en: "to love", pt: "amar" },
          { en: "to give", pt: "dar" },
          { en: "to believe", pt: "crer" },
          { en: "world", pt: "mundo" },
        ],
        sentences: [
          { en: "God so loved the world", pt: "Deus amou o mundo de tal maneira" },
        ],
        verse: {
          text: "For God so loved the world, that he gave his only begotten Son.",
          pt: "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito.",
          ref: "João 3:16",
          blank: "loved",
          options: ["loved", "saw", "called", "made"],
        },
      },
      {
        id: "u3l2",
        title: "Ir e vir",
        vocab: [
          { en: "to come", pt: "vir" },
          { en: "to go", pt: "ir" },
          { en: "to say", pt: "dizer" },
          { en: "to see", pt: "ver" },
        ],
        sentences: [
          { en: "come and see", pt: "vem e vê" },
          { en: "go in peace", pt: "vai em paz" },
        ],
        verse: {
          text: "Come unto me, all ye that labour, and I will give you rest.",
          pt: "Vinde a mim, todos os que estais cansados, e eu vos aliviarei.",
          ref: "Mateus 11:28",
          blank: "Come",
          options: ["Come", "Go", "Look", "Stay"],
        },
      },
      {
        id: "u3l3",
        title: "Fazer e ouvir",
        vocab: [
          { en: "to make", pt: "fazer" },
          { en: "to hear", pt: "ouvir" },
          { en: "to pray", pt: "orar" },
          { en: "word", pt: "palavra" },
        ],
        sentences: [
          { en: "hear the word of the Lord", pt: "ouvi a palavra do Senhor" },
          { en: "watch and pray", pt: "vigiai e orai" },
        ],
        verse: {
          text: "Thy word is a lamp unto my feet, and a light unto my path.",
          pt: "Lâmpada para os meus pés é a tua palavra e luz para o meu caminho.",
          ref: "Salmos 119:105",
          blank: "word",
          options: ["word", "name", "hand", "house"],
        },
      },
      {
        id: "u3r",
        title: "Revisão da unidade",
        review: true,
      },
    ],
  },
  {
    id: "u4",
    title: "Salmos e Natureza",
    subtitle: "Salmo 23",
    icon: "🌿",
    color: "#2ec4b6",
    lessons: [
      {
        id: "u4l1",
        title: "O pastor",
        vocab: [
          { en: "shepherd", pt: "pastor" },
          { en: "green", pt: "verde" },
          { en: "soul", pt: "alma" },
          { en: "still waters", pt: "águas tranquilas" },
        ],
        sentences: [
          { en: "he restoreth my soul", pt: "ele restaura a minha alma" },
        ],
        verse: {
          text: "He maketh me to lie down in green pastures.",
          pt: "Ele me faz repousar em pastos verdejantes.",
          ref: "Salmos 23:2",
          blank: "green",
          options: ["green", "dark", "cold", "high"],
        },
      },
      {
        id: "u4l2",
        title: "Montanhas e céus",
        vocab: [
          { en: "mountain", pt: "montanha" },
          { en: "sun", pt: "sol" },
          { en: "star", pt: "estrela" },
          { en: "glory", pt: "glória" },
        ],
        sentences: [
          { en: "the heavens declare the glory of God", pt: "os céus declaram a glória de Deus" },
        ],
        verse: {
          text: "I will lift up mine eyes unto the hills.",
          pt: "Elevo os meus olhos para os montes.",
          ref: "Salmos 121:1",
          blank: "eyes",
          options: ["eyes", "hands", "feet", "voice"],
        },
      },
      {
        id: "u4l3",
        title: "Caminho e temor",
        vocab: [
          { en: "valley", pt: "vale" },
          { en: "to fear", pt: "temer" },
          { en: "evil", pt: "mal" },
          { en: "house", pt: "casa" },
        ],
        sentences: [
          { en: "I will fear no evil", pt: "não temerei mal algum" },
          { en: "the house of the Lord", pt: "a casa do Senhor" },
        ],
        verse: {
          text: "Yea, though I walk through the valley of the shadow of death, I will fear no evil.",
          pt: "Ainda que eu ande pelo vale da sombra da morte, não temerei mal algum.",
          ref: "Salmos 23:4",
          blank: "valley",
          options: ["valley", "garden", "river", "city"],
        },
      },
      {
        id: "u4r",
        title: "Revisão da unidade",
        review: true,
      },
    ],
  },
  {
    id: "u5",
    title: "Palavras da Fé",
    subtitle: "Fé, esperança e amor",
    icon: "🕊️",
    color: "#a560e8",
    lessons: [
      {
        id: "u5l1",
        title: "Fé e esperança",
        vocab: [
          { en: "faith", pt: "fé" },
          { en: "hope", pt: "esperança" },
          { en: "peace", pt: "paz" },
          { en: "joy", pt: "alegria" },
        ],
        sentences: [
          { en: "faith, hope, and love", pt: "fé, esperança e amor" },
        ],
        verse: {
          text: "And now abideth faith, hope, charity, these three; but the greatest of these is charity.",
          pt: "Agora, pois, permanecem a fé, a esperança e o amor, estes três; mas o maior destes é o amor.",
          ref: "1 Coríntios 13:13",
          blank: "faith",
          options: ["faith", "fear", "gold", "law"],
        },
      },
      {
        id: "u5l2",
        title: "Graça e verdade",
        vocab: [
          { en: "grace", pt: "graça" },
          { en: "truth", pt: "verdade" },
          { en: "way", pt: "caminho" },
          { en: "heart", pt: "coração" },
        ],
        sentences: [
          { en: "the way, the truth, and the life", pt: "o caminho, a verdade e a vida" },
        ],
        verse: {
          text: "I am the way, the truth, and the life.",
          pt: "Eu sou o caminho, e a verdade, e a vida.",
          ref: "João 14:6",
          blank: "truth",
          options: ["truth", "night", "bread", "door"],
        },
      },
      {
        id: "u5l3",
        title: "Amor e luz",
        vocab: [
          { en: "love", pt: "amor" },
          { en: "light of the world", pt: "luz do mundo" },
          { en: "salt", pt: "sal" },
          { en: "kingdom", pt: "reino" },
        ],
        sentences: [
          { en: "ye are the light of the world", pt: "vós sois a luz do mundo" },
          { en: "God is love", pt: "Deus é amor" },
        ],
        verse: {
          text: "Ye are the salt of the earth.",
          pt: "Vós sois o sal da terra.",
          ref: "Mateus 5:13",
          blank: "salt",
          options: ["salt", "sand", "rock", "rain"],
        },
      },
      {
        id: "u5r",
        title: "Revisão da unidade",
        review: true,
      },
    ],
  },
];
