// BíbliaLearn — personagens (arte SVG original, estilo 3D fofinho inspirado em animação)
// Construídos por template para manter proporções e iluminação consistentes.

function _personSVG(p) {
  const id = p.prefix;
  const beard = p.beard || "";
  const hair = p.hair || "";
  const extra = p.extra || "";
  const mouth = p.mouth ||
    `<path d="M62 64 Q70 71 78 64" stroke="${p.mouthColor || "#b3573a"}" stroke-width="3" stroke-linecap="round" fill="none"/>`;
  return `<svg viewBox="0 0 140 152" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="${id}-skin" cx="38%" cy="28%" r="80%">
        <stop offset="0%" stop-color="${p.skinLight}"/>
        <stop offset="100%" stop-color="${p.skinDark}"/>
      </radialGradient>
      <linearGradient id="${id}-robe" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${p.robeLight}"/>
        <stop offset="100%" stop-color="${p.robeDark}"/>
      </linearGradient>
      <radialGradient id="${id}-iris" cx="40%" cy="35%" r="70%">
        <stop offset="0%" stop-color="${p.irisLight || "#8d6e63"}"/>
        <stop offset="100%" stop-color="${p.irisDark || "#4e342e"}"/>
      </radialGradient>
    </defs>
    <ellipse cx="70" cy="145" rx="36" ry="6" fill="#1a2b40" opacity="0.14"/>
    <path d="M42 86 Q70 74 98 86 L106 138 Q70 150 34 138 Z" fill="url(#${id}-robe)"/>
    <path d="M46 90 Q70 82 94 90" stroke="#ffffff" stroke-opacity="0.25" stroke-width="4" stroke-linecap="round" fill="none"/>
    ${p.robeExtra || ""}
    <circle cx="41" cy="56" r="6" fill="${p.skinDark}"/>
    <circle cx="99" cy="56" r="6" fill="${p.skinDark}"/>
    <circle cx="70" cy="52" r="31" fill="url(#${id}-skin)"/>
    ${hair}
    ${beard}
    <ellipse cx="52" cy="63" rx="6" ry="4" fill="#ff7d6b" opacity="0.30"/>
    <ellipse cx="88" cy="63" rx="6" ry="4" fill="#ff7d6b" opacity="0.30"/>
    <g>
      <ellipse cx="58" cy="50" rx="8.2" ry="10" fill="#fff"/>
      <ellipse cx="82" cy="50" rx="8.2" ry="10" fill="#fff"/>
      <circle cx="59.5" cy="52" r="4.6" fill="url(#${id}-iris)"/>
      <circle cx="80.5" cy="52" r="4.6" fill="url(#${id}-iris)"/>
      <circle cx="59.5" cy="52" r="2.1" fill="#20140f"/>
      <circle cx="80.5" cy="52" r="2.1" fill="#20140f"/>
      <circle cx="61" cy="50" r="1.5" fill="#fff"/>
      <circle cx="82" cy="50" r="1.5" fill="#fff"/>
      <circle cx="58" cy="54" r="0.8" fill="#fff" opacity="0.85"/>
      <circle cx="79" cy="54" r="0.8" fill="#fff" opacity="0.85"/>
    </g>
    <path d="M50 40 Q58 36 64 40" stroke="${p.browColor}" stroke-width="3.6" stroke-linecap="round" fill="none"/>
    <path d="M76 40 Q82 36 90 40" stroke="${p.browColor}" stroke-width="3.6" stroke-linecap="round" fill="none"/>
    <path d="M68 56 Q70 60 72 56 Q71 59 70 59 Q69 59 68 56 Z" fill="${p.skinDark}" opacity="0.85"/>
    ${mouth}
    ${extra}
  </svg>`;
}

const CHARACTERS = {
  jesus: {
    img: "chars/jesus.jpg",
    title: "Amor que transforma", virtue: "Amor", ref: "Mateus 1–28",
    desc: "Jesus ensinou com amor, curou os doentes e deu a vida por nós. Ele é o caminho, a verdade e a vida.",
    lessons: ["Amar a Deus e ao próximo", "Perdoar sempre", "Servir com humildade", "Confiar no Pai"],
    voice: { gender: "male", pitch: 0.9, rate: 1.0 },
    name: "Jesus",
    svg: _personSVG({
      prefix: "je",
      skinLight: "#ffdcb4", skinDark: "#e7a878",
      robeLight: "#fdfcf7", robeDark: "#e4ddca",
      browColor: "#5d4037",
      hair: `<path d="M38 54 Q33 12 70 12 Q107 12 102 54 L103 84 Q97 94 92 82 L91 44 Q70 28 49 44 L48 82 Q43 94 37 84 Z" fill="#6d4c41"/>
             <path d="M44 30 Q56 18 70 18" stroke="#8d6e63" stroke-width="4" stroke-linecap="round" fill="none"/>
             <path d="M70 14 L70 26" stroke="#5d4037" stroke-width="3" stroke-linecap="round"/>`,
      beard: `<path d="M50 62 Q52 84 70 86 Q88 84 90 62 Q80 70 70 70 Q60 70 50 62 Z" fill="#6d4c41"/>
              <path d="M60 80 Q70 86 80 80" stroke="#5d4037" stroke-width="2" stroke-linecap="round" fill="none"/>`,
      mouth: `<path d="M63 68 Q70 74 77 68" stroke="#a1554a" stroke-width="3" stroke-linecap="round" fill="none"/>`,
      robeExtra: `<path d="M50 88 Q70 80 76 90 L64 140 Q50 138 42 132 Z" fill="#c62828"/>
                  <path d="M52 92 Q66 86 72 94" stroke="#e05a5a" stroke-width="3" stroke-linecap="round" fill="none"/>`,
      extra: `<path d="M96 100 Q104 92 112 100 M100 96 L100 118 Q100 124 94 124" stroke="#e8b62f" stroke-width="0" fill="none"/>`,
    }),
  },
  moises: {
    img: "chars/moises.jpg",
    title: "Um líder que obedeceu a Deus", virtue: "Libertação", ref: "Êxodo 2–34",
    desc: "Moisés foi escolhido por Deus para tirar o seu povo do Egito. Ele nos ensina sobre fé, obediência e coragem.",
    lessons: ["Ouvir a Deus", "Coragem", "Confiar no plano de Deus", "Liderar com humildade"],
    voice: { gender: "male", pitch: 0.78, rate: 0.95 },
    name: "Moisés",
    svg: _personSVG({
      prefix: "mo",
      skinLight: "#ffd9ae", skinDark: "#e8ab74",
      robeLight: "#a1887f", robeDark: "#6d4c41",
      browColor: "#b0bec5",
      hair: `<path d="M39 52 Q36 18 70 16 Q104 18 101 52 L101 40 Q70 26 39 40 Z" fill="#e3e8eb"/>
             <path d="M42 34 Q56 24 70 24" stroke="#ffffff" stroke-opacity="0.6" stroke-width="3" stroke-linecap="round" fill="none"/>`,
      beard: `<path d="M42 58 Q40 96 70 98 Q100 96 98 58 Q86 72 70 72 Q54 72 42 58 Z" fill="#eef2f4"/>
              <path d="M52 78 Q60 84 70 84 Q80 84 88 78" stroke="#cfd8dc" stroke-width="2" stroke-linecap="round" fill="none"/>`,
      mouth: `<path d="M63 70 Q70 76 77 70" stroke="#a1554a" stroke-width="3" stroke-linecap="round" fill="none"/>`,
      extra: `<path d="M112 60 L116 136" stroke="#8a5a35" stroke-width="7" stroke-linecap="round"/>
              <path d="M112 60 Q124 50 121 38" stroke="#8a5a35" stroke-width="7" stroke-linecap="round" fill="none"/>
              <path d="M112 60 L116 136" stroke="#ffffff" stroke-opacity="0.2" stroke-width="2.5" stroke-linecap="round"/>
              <rect x="14" y="96" width="26" height="34" rx="6" fill="#efd9b1" stroke="#cfa96a" stroke-width="2.5"/>
              <path d="M21 105 h12 M21 112 h12 M21 119 h12" stroke="#c39b55" stroke-width="2.2" stroke-linecap="round"/>`,
    }),
  },
  davi: {
    img: "chars/davi.jpg",
    title: "Um homem segundo o coração de Deus", virtue: "Adoração", ref: "1 Samuel 16 – 2 Samuel 22",
    desc: "Davi foi pastor, músico e rei. Ele nos ensina que Deus olha para o coração.",
    lessons: ["Um coração de adoração", "Coragem nas dificuldades", "Arrependimento", "Confiar no tempo de Deus"],
    voice: { gender: "male", pitch: 1.12, rate: 1.05 },
    name: "Davi",
    svg: _personSVG({
      prefix: "da",
      skinLight: "#ffe0b8", skinDark: "#eab07c",
      robeLight: "#64b5f6", robeDark: "#1e6db8",
      browColor: "#9b501f",
      irisLight: "#7cb1e0", irisDark: "#2d5f96",
      hair: `<path d="M40 48 Q34 16 70 16 Q106 16 100 48 Q98 32 86 28 Q92 36 82 38 Q70 22 52 36 Q46 38 40 48 Z" fill="#d3712f"/>
             <path d="M52 24 Q62 18 74 20" stroke="#eb9350" stroke-width="4" stroke-linecap="round" fill="none"/>`,
      robeExtra: `<path d="M42 92 L56 98 L56 140 L38 136 Z" fill="#8d6e63"/>
                  <path d="M46 100 L52 102 L52 130 L46 128 Z" fill="#a1887f"/>`,
      extra: `<path d="M104 96 Q126 92 122 118 Q118 138 104 132 Q98 112 104 96 Z" fill="#ffd166"/>
              <path d="M106 100 L117 126 M111 98 L120 121 M104 107 L114 129" stroke="#d99a26" stroke-width="2.2" stroke-linecap="round"/>
              <path d="M104 96 Q112 94 118 100" stroke="#ffe6a3" stroke-width="3" stroke-linecap="round" fill="none"/>`,
    }),
  },
  ester: {
    img: "chars/ester.jpg",
    title: "Coragem para fazer a diferença", virtue: "Coragem", ref: "Ester 1–10",
    desc: "Ester foi uma mulher de coragem que confiou em Deus e ajudou a salvar o seu povo.",
    lessons: ["Coragem", "Fé nas situações difíceis", "Usar os seus dons", "Fazer a diferença"],
    voice: { gender: "female", pitch: 1.08, rate: 1.02 },
    name: "Ester",
    svg: _personSVG({
      prefix: "es",
      skinLight: "#ffdfc0", skinDark: "#e8ad80",
      robeLight: "#ce93d8", robeDark: "#8e24aa",
      browColor: "#4e342e",
      irisLight: "#a1887f", irisDark: "#3e2723",
      hair: `<path d="M39 50 Q34 14 70 14 Q106 14 101 50 L102 84 Q95 92 90 82 L90 46 Q70 30 50 46 L50 82 Q45 92 38 84 Z" fill="#4e342e"/>
             <path d="M46 28 Q58 20 72 22" stroke="#6d4c41" stroke-width="4" stroke-linecap="round" fill="none"/>`,
      mouth: `<path d="M62 64 Q70 72 78 64" stroke="#c2185b" stroke-width="3" stroke-linecap="round" fill="none"/>`,
      robeExtra: `<circle cx="70" cy="112" r="7" fill="#ffd166"/><circle cx="70" cy="112" r="3" fill="#fff3c4"/>`,
      extra: `<path d="M48 22 L55 10 L62 19 L70 8 L78 19 L85 10 L92 22 Q70 14 48 22 Z" fill="#ffd166"/>
              <path d="M48 22 Q70 15 92 22" stroke="#e8b62f" stroke-width="2.5" stroke-linecap="round" fill="none"/>
              <circle cx="55" cy="15" r="2.2" fill="#ef5da8"/><circle cx="70" cy="12" r="2.2" fill="#4dd0e1"/><circle cx="85" cy="15" r="2.2" fill="#ef5da8"/>`,
    }),
  },
  noe: {
    img: "chars/noe.jpg",
    title: "Obediência em meio à tempestade", virtue: "Obediência", ref: "Gênesis 6–9",
    desc: "Noé obedeceu a Deus e construiu a arca mesmo sem ver a chuva. Deus cumpriu a sua promessa.",
    lessons: ["Obedecer mesmo sem entender", "Perseverança", "Confiar nas promessas de Deus"],
    voice: { gender: "male", pitch: 0.8, rate: 0.95 },
    name: "Noé",
    svg: _personSVG({
      prefix: "no",
      skinLight: "#ffd9ae", skinDark: "#e5a877",
      robeLight: "#7986cb", robeDark: "#3f51a5",
      browColor: "#e3e8eb",
      hair: `<path d="M41 48 Q40 22 70 22 Q100 22 99 48 L99 40 Q70 30 41 40 Z" fill="#f4f7f8"/>`,
      beard: `<path d="M44 58 Q42 94 70 96 Q98 94 96 58 Q84 72 70 72 Q56 72 44 58 Z" fill="#f4f7f8"/>
              <path d="M54 78 Q62 84 70 84 Q78 84 86 78" stroke="#d9e2e6" stroke-width="2" stroke-linecap="round" fill="none"/>`,
      mouth: `<path d="M63 70 Q70 76 77 70" stroke="#a1554a" stroke-width="3" stroke-linecap="round" fill="none"/>`,
      extra: `<path d="M18 30 Q70 -6 122 30" stroke="#ef5350" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.9"/>
              <path d="M23 37 Q70 4 117 37" stroke="#ffa726" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.9"/>
              <path d="M28 44 Q70 14 112 44" stroke="#66bb6a" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.9"/>
              <path d="M12 112 L42 112 L37 128 L17 128 Z" fill="#b07a4e"/>
              <path d="M12 112 L42 112 L41 117 L13 117 Z" fill="#c98f5f"/>
              <rect x="22" y="100" width="10" height="12" rx="2.5" fill="#8d6e63"/>
              <circle cx="27" cy="94" r="5.5" fill="#ffffff"/>
              <path d="M27 94 L37 89" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
              <path d="M31 92 l4 -1" stroke="#ffb74d" stroke-width="2" stroke-linecap="round"/>`,
    }),
  },
  maria: {
    img: "chars/maria.jpg",
    title: "Um coração humilde", virtue: "Humildade", ref: "Lucas 1:26–56",
    desc: "Maria disse sim a Deus com humildade e se tornou a mãe de Jesus.",
    lessons: ["Dizer sim a Deus", "Humildade", "Guardar a Palavra no coração"],
    voice: { gender: "female", pitch: 1.02, rate: 1.0 },
    name: "Maria",
    svg: _personSVG({
      prefix: "ma",
      skinLight: "#ffe3c4", skinDark: "#e9af82",
      robeLight: "#90caf9", robeDark: "#3d7cc9",
      browColor: "#5d4037",
      irisLight: "#a1887f", irisDark: "#3e2723",
      hair: `<path d="M38 54 Q32 12 70 12 Q108 12 102 54 L104 96 Q97 106 91 94 L90 48 Q70 30 50 48 L49 94 Q43 106 36 96 Z" fill="#2f74c0"/>
             <path d="M38 54 Q32 12 70 12 Q108 12 102 54 L101 44 Q70 26 39 44 Z" fill="#1f5fa8"/>
             <path d="M44 30 Q56 18 70 18" stroke="#5b9bd8" stroke-width="4" stroke-linecap="round" fill="none"/>
             <path d="M46 46 Q48 36 56 32 L56 40 Q50 42 46 46 Z" fill="#6d4c41"/>
             <path d="M94 46 Q92 36 84 32 L84 40 Q90 42 94 46 Z" fill="#6d4c41"/>`,
      mouth: `<path d="M62 64 Q70 71 78 64" stroke="#c2185b" stroke-width="3" stroke-linecap="round" fill="none"/>`,
      robeExtra: `<path d="M60 104 Q70 96 80 104 Q80 120 70 124 Q60 120 60 104 Z" fill="#fff2b8"/>
                  <path d="M64 106 Q70 101 76 106" stroke="#f4d879" stroke-width="2.5" stroke-linecap="round" fill="none"/>`,
    }),
  },
  pedro: {
    img: "chars/pedro.jpg",
    title: "De pescador a líder", virtue: "Liderança", ref: "Mateus 4–28; Atos 1–12",
    desc: "Pedro era pescador, seguiu Jesus e se tornou um líder da igreja, mesmo depois de errar.",
    lessons: ["Seguir a Jesus", "Levantar depois da queda", "Liderar com fé"],
    voice: { gender: "male", pitch: 0.85, rate: 1.0 },
    name: "Pedro",
    svg: _personSVG({
      prefix: "pe",
      skinLight: "#f6cf9e", skinDark: "#d99a66",
      robeLight: "#4db6ac", robeDark: "#00796b",
      browColor: "#4e342e",
      hair: `<path d="M40 48 Q40 18 70 18 Q100 18 100 48 L100 38 Q70 28 40 38 Z" fill="#5d4037"/>`,
      beard: `<path d="M44 56 Q44 86 70 88 Q96 86 96 56 Q84 68 70 68 Q56 68 44 56 Z" fill="#6d4c41"/>
              <path d="M54 74 Q62 80 70 80 Q78 80 86 74" stroke="#5d4037" stroke-width="2" stroke-linecap="round" fill="none"/>`,
      mouth: `<path d="M63 68 Q70 74 77 68" stroke="#9c4a3f" stroke-width="3" stroke-linecap="round" fill="none"/>`,
      robeExtra: `<path d="M46 96 L94 96 L96 104 L44 104 Z" fill="#00695c" opacity="0.7"/>`,
      extra: `<path d="M104 100 Q122 104 120 126 M104 112 Q114 114 113 130" stroke="#9fdcd4" stroke-width="2.6" fill="none" stroke-linecap="round"/>
              <path d="M104 100 L104 132 M110 103 L110 130 M116 108 L116 128" stroke="#9fdcd4" stroke-width="2.6" stroke-linecap="round"/>
              <path d="M14 108 q7 -9 14 0 q-7 9 -14 0 Z" fill="#4dd0e1"/>
              <path d="M15 106 q6 -5 11 1" stroke="#a2ecf5" stroke-width="1.8" stroke-linecap="round" fill="none"/>
              <circle cx="19" cy="107" r="1.5" fill="#00363a"/>
              <path d="M28 108 l7 -4.5 l0 9 Z" fill="#26c6da"/>`,
    }),
  },
  isaias: {
    img: "chars/isaias.jpg",
    title: "Eis-me aqui, envia-me", virtue: "Profecia", ref: "Isaías 1–12; 38–55",
    desc: "Isaías viu o Senhor no trono e respondeu ao chamado. Ele anunciou o Príncipe da Paz.",
    lessons: ["Responder ao chamado", "Falar a verdade", "Esperança no Messias"],
    voice: { gender: "male", pitch: 0.8, rate: 0.95 },
    name: "Isaías",
    svg: _personSVG({
      prefix: "is",
      skinLight: "#f7d3a6", skinDark: "#dfa270",
      robeLight: "#a8a884", robeDark: "#75755a",
      browColor: "#cfd2cd",
      hair: `<path d="M40 50 Q38 20 70 20 Q102 20 100 50 L100 40 Q70 30 40 40 Z" fill="#d8dcd9"/>`,
      beard: `<path d="M43 58 Q41 92 70 94 Q99 92 97 58 Q85 71 70 71 Q55 71 43 58 Z" fill="#e6eae7"/>
              <path d="M53 78 Q61 84 70 84 Q79 84 87 78" stroke="#c6ccc8" stroke-width="2" stroke-linecap="round" fill="none"/>`,
      mouth: `<path d="M63 69 Q70 75 77 69" stroke="#a1554a" stroke-width="3" stroke-linecap="round" fill="none"/>`,
      extra: `<rect x="12" y="94" width="30" height="38" rx="4" fill="#f3e6c4" stroke="#d3bb85" stroke-width="2.5"/>
              <path d="M12 98 q-6 4 0 8 M42 120 q6 4 0 8" stroke="#d3bb85" stroke-width="2.5" fill="none" stroke-linecap="round"/>
              <path d="M19 104 h16 M19 111 h16 M19 118 h10" stroke="#c7ab6c" stroke-width="2" stroke-linecap="round"/>`,
    }),
  },
};

// Personagens do inventário (retratos recortados do pôster)
Object.assign(CHARACTERS, {
  adao: { img: "chars/adao.jpg", name: "Adão", title: "O primeiro homem", virtue: "Cuidado da criação", ref: "Gênesis 1–3", voice: { gender: "male", pitch: 0.95, rate: 1.0 }, desc: "Adão foi criado por Deus e cuidou do jardim. A sua história mostra o começo de tudo.", lessons: ["Cuidar da criação", "Andar com Deus", "As consequências das escolhas"] },
  eva: { img: "chars/eva.jpg", name: "Eva", title: "A primeira mulher", virtue: "Companheirismo", ref: "Gênesis 2–3", voice: { gender: "female", pitch: 1.05, rate: 1.0 }, desc: "Eva foi criada como companheira de Adão. A sua história fala de escolhas e do cuidado de Deus.", lessons: ["Companheirismo", "Escolhas e responsabilidade", "A graça de Deus"] },
  abraao: { img: "chars/abraao.jpg", name: "Abraão", title: "O pai da fé", virtue: "Fé", ref: "Gênesis 12–22", voice: { gender: "male", pitch: 0.8, rate: 0.95 }, desc: "Abraão saiu da sua terra porque confiou em Deus, e recebeu a promessa de uma grande nação.", lessons: ["Fé para obedecer", "Confiar sem ver", "Paciência nas promessas"] },
  sara: { img: "chars/sara.jpg", name: "Sara", title: "A promessa cumprida", virtue: "Promessa", ref: "Gênesis 17–21", voice: { gender: "female", pitch: 1.0, rate: 0.98 }, desc: "Sara riu da promessa, mas Deus a cumpriu: ela foi mãe de Isaque na velhice.", lessons: ["Nada é impossível para Deus", "Esperar com fé", "Alegria na promessa"] },
  isaac: { img: "chars/isaac.jpg", name: "Isaque", title: "Filho da promessa", virtue: "Obediência", ref: "Gênesis 21–26", voice: { gender: "male", pitch: 0.95, rate: 1.0 }, desc: "Isaque foi o filho prometido a Abraão e Sara e aprendeu a confiar em Deus desde cedo.", lessons: ["Obediência", "Confiança no pai", "Paz com os vizinhos"] },
  jaco: { img: "chars/jaco.jpg", name: "Jacó", title: "Perseverança que transforma", virtue: "Perseverança", ref: "Gênesis 25–35", voice: { gender: "male", pitch: 0.9, rate: 1.0 }, desc: "Jacó lutou, errou e perseverou. Deus mudou o seu nome para Israel.", lessons: ["Perseverar", "Reconciliação", "Deus transforma vidas"] },
  rebeca: { img: "chars/rebeca.jpg", name: "Rebeca", title: "Sabedoria e generosidade", virtue: "Sabedoria", ref: "Gênesis 24", voice: { gender: "female", pitch: 1.05, rate: 1.0 }, desc: "Rebeca serviu água a um estranho e aos seus camelos, e se tornou esposa de Isaque.", lessons: ["Generosidade", "Sabedoria nas decisões", "Servir com alegria"] },
  jose: { img: "chars/jose.jpg", name: "José", title: "Sonhos e perdão", virtue: "Sonhos", ref: "Gênesis 37–50", voice: { gender: "male", pitch: 1.05, rate: 1.02 }, desc: "José foi vendido pelos irmãos, mas Deus o levantou no Egito, e ele perdoou a sua família.", lessons: ["Fidelidade nas provações", "Perdoar", "Deus usa tudo para o bem"] },
  arao: { img: "chars/arao.jpg", name: "Arão", title: "Servo e porta-voz", virtue: "Serviço", ref: "Êxodo 4–40", voice: { gender: "male", pitch: 0.85, rate: 0.97 }, desc: "Arão foi o porta-voz de Moisés e o primeiro sacerdote de Israel.", lessons: ["Servir ao lado do líder", "Falar em nome de Deus", "Fidelidade no serviço"] },
  josue: { img: "chars/josue.jpg", name: "Josué", title: "Forte e corajoso", virtue: "Liderança", ref: "Josué 1–24", voice: { gender: "male", pitch: 0.88, rate: 1.0 }, desc: "Josué liderou o povo na terra prometida. Deus lhe disse: sê forte e corajoso.", lessons: ["Coragem", "Obedecer à Palavra", "Liderar pelo exemplo"] },
  calebe: { img: "chars/calebe.jpg", name: "Calebe", title: "Um espírito diferente", virtue: "Coragem", ref: "Números 13–14", voice: { gender: "male", pitch: 0.9, rate: 1.0 }, desc: "Calebe acreditou que Deus daria a terra, quando os outros tiveram medo.", lessons: ["Fé contra a maioria", "Coragem", "Fidelidade por toda a vida"] },
  debora: { img: "chars/debora.jpg", name: "Débora", title: "Justiça e liderança", virtue: "Justiça", ref: "Juízes 4–5", voice: { gender: "female", pitch: 1.0, rate: 0.98 }, desc: "Débora foi juíza e profetisa; liderou Israel com sabedoria e justiça.", lessons: ["Justiça", "Sabedoria para julgar", "Liderar com fé"] },
  gideao: { img: "chars/gideao.jpg", name: "Gideão", title: "Valente com poucos", virtue: "Fé", ref: "Juízes 6–8", voice: { gender: "male", pitch: 0.95, rate: 1.0 }, desc: "Gideão venceu um grande exército com apenas 300 homens, porque Deus estava com ele.", lessons: ["Deus usa os pequenos", "Confiar mais em Deus que em números", "Obedecer passo a passo"] },
  sansao: { img: "chars/sansao.jpg", name: "Sansão", title: "Força que vem de Deus", virtue: "Força", ref: "Juízes 13–16", voice: { gender: "male", pitch: 0.75, rate: 0.98 }, desc: "Sansão recebeu força de Deus e aprendeu, no fim, de onde ela vinha.", lessons: ["A força vem de Deus", "Cuidado com as escolhas", "Deus responde ao arrependimento"] },
  rute: { img: "chars/rute.jpg", name: "Rute", title: "Lealdade que Deus honra", virtue: "Lealdade", ref: "Rute 1–4", voice: { gender: "female", pitch: 1.05, rate: 1.0 }, desc: "Rute ficou ao lado de Noemi e disse: o teu Deus será o meu Deus. Deus a abençoou.", lessons: ["Lealdade", "Trabalhar com humildade", "Deus cuida dos fiéis"] },
  samuel: { img: "chars/samuel.jpg", name: "Samuel", title: "Fala, porque o teu servo ouve", virtue: "Oração", ref: "1 Samuel 1–3", voice: { gender: "male", pitch: 1.08, rate: 1.02 }, desc: "Samuel ouviu a voz de Deus ainda menino e se tornou profeta e juiz.", lessons: ["Ouvir a Deus", "Oração", "Obedecer desde cedo"] },
  salomao: { img: "chars/salomao.jpg", name: "Salomão", title: "O rei sábio", virtue: "Sabedoria", ref: "1 Reis 3–11", voice: { gender: "male", pitch: 0.85, rate: 0.98 }, desc: "Salomão pediu sabedoria a Deus e construiu o templo em Jerusalém.", lessons: ["Pedir sabedoria", "Usar os dons para Deus", "Guardar o coração"] },
  elias: { img: "chars/elias.jpg", name: "Elias", title: "Zelo pelo Senhor", virtue: "Zelo", ref: "1 Reis 17–19", voice: { gender: "male", pitch: 0.78, rate: 0.95 }, desc: "Elias enfrentou os profetas de Baal e viu o fogo de Deus descer do céu.", lessons: ["Zelo por Deus", "Coragem diante da oposição", "Ouvir a voz mansa de Deus"] },
  eliseu: { img: "chars/eliseu.jpg", name: "Eliseu", title: "Servo fiel do profeta", virtue: "Serviço", ref: "2 Reis 2–13", voice: { gender: "male", pitch: 0.85, rate: 0.97 }, desc: "Eliseu serviu Elias e recebeu porção dobrada do seu espírito.", lessons: ["Servir antes de liderar", "Fidelidade", "Milagres de cuidado"] },
  daniel: { img: "chars/daniel.jpg", name: "Daniel", title: "Fiel na cova dos leões", virtue: "Fidelidade", ref: "Daniel 1–12", voice: { gender: "male", pitch: 0.9, rate: 1.0 }, desc: "Daniel orou a Deus mesmo proibido, e Deus fechou a boca dos leões.", lessons: ["Fidelidade em terra estranha", "Oração constante", "Confiar em Deus diante do perigo"] },
  neemias: { img: "chars/neemias.jpg", name: "Neemias", title: "Reconstruindo os muros", virtue: "Reconstrução", ref: "Neemias 1–13", voice: { gender: "male", pitch: 0.88, rate: 1.0 }, desc: "Neemias orou, planejou e reconstruiu os muros de Jerusalém em 52 dias.", lessons: ["Orar e agir", "Trabalho em equipe", "Persistir diante da oposição"] },
  ezequiel: { img: "chars/ezequiel.jpg", name: "Ezequiel", title: "Visões de esperança", virtue: "Visão", ref: "Ezequiel 1–48", voice: { gender: "male", pitch: 0.8, rate: 0.95 }, desc: "Ezequiel viu ossos secos voltarem à vida: Deus restaura o seu povo.", lessons: ["Esperança na restauração", "Falar o que Deus manda", "Deus dá vida nova"] },
  jonas: { img: "chars/jonas.jpg", name: "Jonas", title: "Obediência em segunda chance", virtue: "Obediência", ref: "Jonas 1–4", voice: { gender: "male", pitch: 0.9, rate: 1.0 }, desc: "Jonas fugiu, foi engolido por um grande peixe e depois obedeceu: Nínive se arrependeu.", lessons: ["Não fugir do chamado", "Deus dá segunda chance", "Misericórdia para todos"] },
  marta: { img: "chars/marta.jpg", name: "Marta", title: "Serviço com o coração", virtue: "Serviço", ref: "Lucas 10:38–42", voice: { gender: "female", pitch: 1.0, rate: 1.0 }, desc: "Marta serviu a Jesus com dedicação e aprendeu a escolher a boa parte.", lessons: ["Servir com amor", "Equilibrar serviço e escuta", "Confiar em Jesus"] },
  josepai: { img: "chars/josepai.jpg", name: "José (pai de Jesus)", title: "Justo e obediente", virtue: "Justiça", ref: "Mateus 1–2", voice: { gender: "male", pitch: 0.85, rate: 0.97 }, desc: "José obedeceu ao anjo, cuidou de Maria e protegeu o menino Jesus.", lessons: ["Obedecer a Deus", "Proteger a família", "Justiça com bondade"] },
  joaobatista: { img: "chars/joaobatista.jpg", name: "João Batista", title: "Preparai o caminho", virtue: "Preparação", ref: "Mateus 3:1–12", voice: { gender: "male", pitch: 0.8, rate: 1.0 }, desc: "João Batista preparou o caminho para Jesus e batizou o Senhor no Jordão.", lessons: ["Preparar o coração", "Humildade: Ele deve crescer", "Falar a verdade"] },
  paulo: { img: "chars/paulo.jpg", name: "Paulo", title: "De perseguidor a missionário", virtue: "Missão", ref: "Atos 9–28", voice: { gender: "male", pitch: 0.85, rate: 1.02 }, desc: "Paulo encontrou Jesus no caminho de Damasco e levou o evangelho a muitas nações.", lessons: ["Deus transforma", "Missão", "Perseverar nas dificuldades"] },
  barnabe: { img: "chars/barnabe.jpg", name: "Barnabé", title: "Filho da consolação", virtue: "Incentivo", ref: "Atos 4:36–37; 9:27; 15:36–39", voice: { gender: "male", pitch: 0.9, rate: 1.0 }, desc: "Barnabé incentivou Paulo e Marcos e foi generoso com a igreja.", lessons: ["Incentivar os outros", "Generosidade", "Dar segunda chance"] },
  timoteo: { img: "chars/timoteo.jpg", name: "Timóteo", title: "Jovem e fiel", virtue: "Companheirismo", ref: "1–2 Timóteo", voice: { gender: "male", pitch: 1.1, rate: 1.03 }, desc: "Timóteo foi discípulo de Paulo e liderou a igreja ainda jovem.", lessons: ["Ninguém despreze a tua mocidade", "Fidelidade", "Aprender com um mentor"] },
  lidia: { img: "chars/lidia.jpg", name: "Lídia", title: "Hospitalidade", virtue: "Hospitalidade", ref: "Atos 16:11–15", voice: { gender: "female", pitch: 1.02, rate: 1.0 }, desc: "Lídia abriu o coração e a casa para Paulo, e a igreja nasceu em Filipos.", lessons: ["Hospitalidade", "Abrir o coração à Palavra", "Generosidade"] },
  filipe: { img: "chars/filipe.jpg", name: "Filipe", title: "Evangelista no deserto", virtue: "Evangelização", ref: "Atos 8:26–40", voice: { gender: "male", pitch: 0.95, rate: 1.02 }, desc: "Filipe explicou as Escrituras ao etíope e o batizou no caminho.", lessons: ["Compartilhar a Palavra", "Obedecer à direção de Deus", "Explicar com paciência"] },
  natanael: { img: "chars/natanael.jpg", name: "Natanael", title: "Um homem sem engano", virtue: "Integridade", ref: "João 1:43–51", voice: { gender: "male", pitch: 0.95, rate: 1.0 }, desc: "Jesus viu Natanael debaixo da figueira e o chamou de israelita sem engano.", lessons: ["Integridade", "Vem e vê", "Jesus nos conhece"] },
  tome: { img: "chars/tome.jpg", name: "Tomé", title: "Da dúvida à fé", virtue: "Dúvida e fé", ref: "João 20:24–29", voice: { gender: "male", pitch: 0.9, rate: 1.0 }, desc: "Tomé duvidou, mas ao ver Jesus disse: Senhor meu e Deus meu.", lessons: ["Trazer as dúvidas a Jesus", "Fé que confessa", "Bem-aventurados os que creem"] },
  zaqueu: { img: "chars/zaqueu.jpg", name: "Zaqueu", title: "Transformado por Jesus", virtue: "Transformação", ref: "Lucas 19:1–10", voice: { gender: "male", pitch: 1.0, rate: 1.02 }, desc: "Zaqueu subiu na árvore para ver Jesus e a sua vida mudou completamente.", lessons: ["Buscar a Jesus", "Restituir e reparar", "Alegria na salvação"] },
  bartimeu: { img: "chars/bartimeu.jpg", name: "Bartimeu", title: "Clamor que Jesus ouve", virtue: "Clamor", ref: "Marcos 10:46–52", voice: { gender: "male", pitch: 0.9, rate: 1.0 }, desc: "Bartimeu, cego, clamou por Jesus e recebeu a visão.", lessons: ["Clamar com fé", "Persistir", "Seguir a Jesus"] },
  madalena: { img: "chars/madalena.jpg", name: "Maria Madalena", title: "Gratidão e fidelidade", virtue: "Gratidão", ref: "João 20:1–18", voice: { gender: "female", pitch: 1.02, rate: 1.0 }, desc: "Maria Madalena seguiu Jesus com gratidão e foi a primeira a vê-lo ressuscitado.", lessons: ["Gratidão", "Fidelidade até o fim", "Anunciar a boa notícia"] },
});
Object.keys(CHARACTERS).forEach((k) => { CHARACTERS[k].key = k; });

// Ordem da galeria (como na faixa "Bible Characters" da referência)
const CHARACTER_ORDER = ["jesus", "noe", "abraao", "sara", "jose", "moises", "davi", "ester", "daniel", "jonas", "paulo",
  "adao", "eva", "isaac", "jaco", "rebeca", "arao", "josue", "calebe", "debora", "gideao", "sansao", "rute", "samuel", "salomao",
  "elias", "eliseu", "isaias", "neemias", "ezequiel", "marta", "maria", "josepai", "joaobatista", "pedro", "barnabe", "timoteo",
  "lidia", "filipe", "natanael", "tome", "zaqueu", "bartimeu", "madalena"];

// Elenco por unidade: personagem principal + convidados
const UNIT_CAST = {
  u1: ["jesus", "adao", "eva"],
  u2: ["noe", "jaco", "rebeca"],
  u3: ["moises", "arao", "josue"],
  u4: ["davi", "samuel", "salomao"],
  u5: ["isaias", "jonas", "daniel", "elias"],
  u6: ["jose", "jaco", "rebeca"],
  u7: ["daniel", "ezequiel", "neemias"],
  u8: ["jesus", "pedro", "maria", "madalena"],
};
// Unidade ligada a cada personagem (para "Iniciar lições")
const CHARACTER_UNIT = { jesus: "u1", adao: "u1", eva: "u1", noe: "u2", jaco: "u2", rebeca: "u2", moises: "u3", arao: "u3", josue: "u3",
  davi: "u4", samuel: "u4", salomao: "u4", isaias: "u5", jonas: "u5", elias: "u5", jose: "u6", daniel: "u7", ezequiel: "u7", neemias: "u7",
  pedro: "u8", madalena: "u8", marta: "u8", tome: "u8", zaqueu: "u8", bartimeu: "u8" };

function pickCharacter(unitId) {
  const cast = UNIT_CAST[unitId] || Object.keys(CHARACTERS);
  const key = cast[Math.floor(Math.random() * cast.length)];
  return { key, ...CHARACTERS[key] };
}
