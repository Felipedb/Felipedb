// BibleLingo — personagens (arte SVG original, estilo flat)
// Cada personagem fala com o aluno nos exercícios, como no Duolingo.

const CHARACTERS = {
  moises: {
    name: "Moisés",
    svg: `<svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg">
      <path d="M96 52 L100 128" stroke="#a1704a" stroke-width="6" stroke-linecap="round"/>
      <path d="M96 52 Q106 44 104 34" stroke="#a1704a" stroke-width="6" stroke-linecap="round" fill="none"/>
      <path d="M34 74 Q60 62 86 74 L94 128 Q60 140 26 128 Z" fill="#8d6e63"/>
      <path d="M52 76 L60 92 L68 76 Z" fill="#6d4c41"/>
      <circle cx="60" cy="46" r="27" fill="#f2c79c"/>
      <path d="M33 46 Q33 16 60 16 Q87 16 87 46 L87 36 Q60 24 33 36 Z" fill="#cfd8dc"/>
      <path d="M36 52 Q36 88 60 88 Q84 88 84 52 Q74 63 60 63 Q46 63 36 52 Z" fill="#eceff1"/>
      <ellipse cx="50" cy="45" rx="6.5" ry="8" fill="#fff"/>
      <ellipse cx="70" cy="45" rx="6.5" ry="8" fill="#fff"/>
      <circle cx="51.5" cy="46.5" r="3.2" fill="#4e342e"/>
      <circle cx="68.5" cy="46.5" r="3.2" fill="#4e342e"/>
      <path d="M43 34 Q50 30 56 34" stroke="#b0bec5" stroke-width="3" stroke-linecap="round" fill="none"/>
      <path d="M64 34 Q70 30 77 34" stroke="#b0bec5" stroke-width="3" stroke-linecap="round" fill="none"/>
      <path d="M56 55 Q60 58 64 55" stroke="#c98b60" stroke-width="2.5" stroke-linecap="round" fill="none"/>
      <rect x="16" y="86" width="24" height="30" rx="5" fill="#e0c9a6" stroke="#c9a86e" stroke-width="2.5"/>
      <path d="M22 94 h12 M22 100 h12 M22 106 h12" stroke="#c9a86e" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
  },
  davi: {
    name: "Davi",
    svg: `<svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg">
      <path d="M36 76 Q60 66 84 76 L90 128 Q60 138 30 128 Z" fill="#42a5f5"/>
      <path d="M36 76 L48 82 L48 128 L34 126 Z" fill="#8d6e63"/>
      <circle cx="60" cy="46" r="26" fill="#f8cfa5"/>
      <path d="M34 44 Q32 14 60 16 Q90 18 86 44 Q84 30 74 28 Q78 34 72 36 Q60 22 44 34 Q38 36 34 44 Z" fill="#c1642c"/>
      <ellipse cx="51" cy="46" rx="6.5" ry="8" fill="#fff"/>
      <ellipse cx="70" cy="46" rx="6.5" ry="8" fill="#fff"/>
      <circle cx="52.5" cy="47.5" r="3.2" fill="#3e2723"/>
      <circle cx="68.5" cy="47.5" r="3.2" fill="#3e2723"/>
      <path d="M44 35 Q50 32 55 35" stroke="#8d4a1f" stroke-width="3" stroke-linecap="round" fill="none"/>
      <path d="M65 35 Q70 32 76 35" stroke="#8d4a1f" stroke-width="3" stroke-linecap="round" fill="none"/>
      <path d="M52 60 Q60 67 68 60" stroke="#b26a3c" stroke-width="3" stroke-linecap="round" fill="none"/>
      <path d="M92 88 Q112 84 108 108 Q104 126 92 122 Q86 104 92 88 Z" fill="#f6b93b"/>
      <path d="M94 92 L104 116 M98 90 L107 111 M92 98 L101 119" stroke="#c98b1e" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
  },
  ester: {
    name: "Ester",
    svg: `<svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg">
      <path d="M34 76 Q60 64 86 76 L94 130 Q60 140 26 130 Z" fill="#ab47bc"/>
      <path d="M46 80 Q60 88 74 80 L74 96 Q60 102 46 96 Z" fill="#8e24aa"/>
      <circle cx="60" cy="46" r="26" fill="#eebd8e"/>
      <path d="M34 46 Q30 14 60 14 Q90 14 86 46 L86 70 Q80 76 76 68 L76 44 Q60 30 44 44 L44 68 Q40 76 34 70 Z" fill="#4e342e"/>
      <path d="M42 22 L48 12 L54 20 L60 10 L66 20 L72 12 L78 22 Z" fill="#ffc107"/>
      <circle cx="48" cy="16" r="2" fill="#e91e63"/><circle cx="60" cy="14" r="2" fill="#00bcd4"/><circle cx="72" cy="16" r="2" fill="#e91e63"/>
      <ellipse cx="51" cy="47" rx="6" ry="7.5" fill="#fff"/>
      <ellipse cx="69" cy="47" rx="6" ry="7.5" fill="#fff"/>
      <circle cx="52.5" cy="48.5" r="3" fill="#3e2723"/>
      <circle cx="67.5" cy="48.5" r="3" fill="#3e2723"/>
      <path d="M44 37 Q50 34 55 37" stroke="#3e2723" stroke-width="2.5" stroke-linecap="round" fill="none"/>
      <path d="M65 37 Q70 34 76 37" stroke="#3e2723" stroke-width="2.5" stroke-linecap="round" fill="none"/>
      <path d="M53 60 Q60 66 67 60" stroke="#c2185b" stroke-width="3" stroke-linecap="round" fill="none"/>
      <circle cx="60" cy="104" r="6" fill="#ffc107"/>
    </svg>`,
  },
  noe: {
    name: "Noé",
    svg: `<svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 30 Q60 2 100 30" stroke="#ef5350" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M24 36 Q60 10 96 36" stroke="#ffa726" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M28 42 Q60 18 92 42" stroke="#66bb6a" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M36 80 Q60 70 84 80 L90 126 Q60 136 30 126 Z" fill="#5c6bc0"/>
      <circle cx="60" cy="56" r="24" fill="#f2c79c"/>
      <path d="M38 54 Q38 30 60 30 Q82 30 82 54 L82 48 Q60 38 38 48 Z" fill="#fafafa"/>
      <path d="M40 60 Q40 92 60 92 Q80 92 80 60 Q70 70 60 70 Q50 70 40 60 Z" fill="#fafafa"/>
      <ellipse cx="52" cy="55" rx="5.5" ry="7" fill="#fff" stroke="#e0e0e0" stroke-width="1"/>
      <ellipse cx="69" cy="55" rx="5.5" ry="7" fill="#fff" stroke="#e0e0e0" stroke-width="1"/>
      <circle cx="53" cy="56.5" r="3" fill="#4e342e"/>
      <circle cx="68" cy="56.5" r="3" fill="#4e342e"/>
      <path d="M46 45 Q52 42 57 45" stroke="#e0e0e0" stroke-width="3" stroke-linecap="round" fill="none"/>
      <path d="M64 45 Q69 42 75 45" stroke="#e0e0e0" stroke-width="3" stroke-linecap="round" fill="none"/>
      <path d="M14 108 L38 108 L34 120 L18 120 Z" fill="#a1704a"/>
      <rect x="22" y="98" width="8" height="10" rx="2" fill="#8d6e63"/>
      <circle cx="26" cy="94" r="5" fill="#eceff1"/>
      <path d="M26 94 L34 90" stroke="#eceff1" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`,
  },
  maria: {
    name: "Maria",
    svg: `<svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg">
      <path d="M34 78 Q60 66 86 78 L92 130 Q60 140 28 130 Z" fill="#64b5f6"/>
      <path d="M32 50 Q28 12 60 12 Q92 12 88 50 L90 92 Q84 100 78 92 L78 48 Q60 32 42 48 L42 92 Q36 100 30 92 Z" fill="#1e88e5"/>
      <circle cx="60" cy="48" r="23" fill="#f8cfa5"/>
      <path d="M40 44 Q42 26 60 26 Q78 26 80 44 L80 40 Q60 30 40 40 Z" fill="#5d4037"/>
      <ellipse cx="52" cy="48" rx="5.5" ry="7" fill="#fff"/>
      <ellipse cx="69" cy="48" rx="5.5" ry="7" fill="#fff"/>
      <circle cx="53.5" cy="49.5" r="2.9" fill="#3e2723"/>
      <circle cx="67.5" cy="49.5" r="2.9" fill="#3e2723"/>
      <path d="M46 39 Q51 36 56 39" stroke="#5d4037" stroke-width="2.5" stroke-linecap="round" fill="none"/>
      <path d="M65 39 Q70 36 75 39" stroke="#5d4037" stroke-width="2.5" stroke-linecap="round" fill="none"/>
      <path d="M53 60 Q60 66 67 60" stroke="#c2185b" stroke-width="3" stroke-linecap="round" fill="none"/>
      <path d="M52 96 Q60 90 68 96 Q68 108 60 112 Q52 108 52 96 Z" fill="#fff59d"/>
    </svg>`,
  },
  pedro: {
    name: "Pedro",
    svg: `<svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg">
      <path d="M36 76 Q60 66 84 76 L90 128 Q60 138 30 128 Z" fill="#26a69a"/>
      <path d="M36 90 L84 90 L86 100 L34 100 Z" fill="#00897b"/>
      <circle cx="60" cy="46" r="26" fill="#e8b482"/>
      <path d="M34 44 Q34 16 60 16 Q86 16 86 44 L86 36 Q60 26 34 36 Z" fill="#4e342e"/>
      <path d="M38 52 Q38 80 60 80 Q82 80 82 52 Q72 62 60 62 Q48 62 38 52 Z" fill="#5d4037"/>
      <ellipse cx="51" cy="45" rx="6" ry="7.5" fill="#fff"/>
      <ellipse cx="70" cy="45" rx="6" ry="7.5" fill="#fff"/>
      <circle cx="52.5" cy="46.5" r="3" fill="#3e2723"/>
      <circle cx="68.5" cy="46.5" r="3" fill="#3e2723"/>
      <path d="M44 35 Q50 31 55 35" stroke="#4e342e" stroke-width="3" stroke-linecap="round" fill="none"/>
      <path d="M65 35 Q70 31 76 35" stroke="#4e342e" stroke-width="3" stroke-linecap="round" fill="none"/>
      <path d="M92 92 Q108 96 106 116 M92 104 Q102 106 101 120" stroke="#80cbc4" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M92 92 L92 122 M98 96 L98 120 M104 102 L104 118" stroke="#80cbc4" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M14 100 q6 -8 12 0 q-6 8 -12 0 Z" fill="#4dd0e1"/>
      <circle cx="18" cy="99" r="1.4" fill="#00363a"/>
      <path d="M26 100 l6 -4 l0 8 Z" fill="#4dd0e1"/>
    </svg>`,
  },
};

// Elenco por unidade: personagem principal + convidados
const UNIT_CAST = {
  u1: ["noe", "moises"],
  u2: ["moises", "ester"],
  u3: ["pedro", "maria"],
  u4: ["davi", "noe"],
  u5: ["maria", "pedro", "davi", "ester"],
};

function pickCharacter(unitId) {
  const cast = UNIT_CAST[unitId] || Object.keys(CHARACTERS);
  const key = cast[Math.floor(Math.random() * cast.length)];
  return { key, ...CHARACTERS[key] };
}
