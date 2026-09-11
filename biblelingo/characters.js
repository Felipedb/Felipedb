// BibleLingo — personagens (arte SVG original, estilo 3D fofinho inspirado em animação)
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
    voice: { gender: "male", pitch: 0.85, rate: 0.88 },
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
    voice: { gender: "male", pitch: 0.62, rate: 0.8 },
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
    voice: { gender: "male", pitch: 1.18, rate: 1.0 },
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
    voice: { gender: "female", pitch: 1.12, rate: 0.95 },
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
    voice: { gender: "male", pitch: 0.68, rate: 0.78 },
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
    voice: { gender: "female", pitch: 1.02, rate: 0.9 },
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
    voice: { gender: "male", pitch: 0.78, rate: 0.92 },
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
    voice: { gender: "male", pitch: 0.66, rate: 0.76 },
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

// Elenco por unidade: personagem principal + convidados
const UNIT_CAST = {
  u1: ["jesus", "moises", "noe"],
  u2: ["noe", "maria"],
  u3: ["moises", "ester"],
  u4: ["davi", "pedro"],
  u5: ["isaias", "jesus", "maria"],
};

function pickCharacter(unitId) {
  const cast = UNIT_CAST[unitId] || Object.keys(CHARACTERS);
  const key = cast[Math.floor(Math.random() * cast.length)];
  return { key, ...CHARACTERS[key] };
}
