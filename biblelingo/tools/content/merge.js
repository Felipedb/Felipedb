// Gera biblelingo/data.js a partir de content/u1..u8.json (cabeçalhos das unidades vêm do data.js atual)
// Uso: node tools/content/merge.js   (na pasta biblelingo)
const fs = require("fs"), vm = require("vm"), path = require("path");
const root = path.resolve(__dirname, "../..") + "/";
const dir = path.join(root, "content");
const ctx = {}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(root + "data.js", "utf8"), ctx);
const OLD = vm.runInContext("COURSE", ctx);
const units = OLD.map((u) => {
  const f = path.join(dir, u.id + ".json");
  if (!fs.existsSync(f)) { console.error("falta " + f); process.exit(1); }
  const j = JSON.parse(fs.readFileSync(f, "utf8"));
  if (j.id !== u.id || j.lessons.length !== 3) { console.error("unidade inválida " + f); process.exit(1); }
  const order = ["id", "title", "vocab", "sentences", "verse", "reading", "dialogue", "quiz"];
  const lessons = j.lessons.map((l) => { const o = {}; order.forEach((k) => { if (l[k] !== undefined) o[k] = l[k]; }); return o; });
  lessons.push({ id: u.id + "r", title: "Revisão", review: true });
  return { id: u.id, title: u.title, subtitle: u.subtitle, icon: u.icon, face: u.face, color: u.color, lessons };
});
// Cruzamentos: vocabulário repetido entre unidades (aviso), frases repetidas (aviso)
const seen = new Map(), sent = new Map();
units.forEach((u) => u.lessons.forEach((l) => {
  (l.vocab || []).forEach((v) => { const k = v.en.toLowerCase(); if (seen.has(k)) console.log(`aviso: vocab "${v.en}" em ${seen.get(k)} e ${l.id}`); else seen.set(k, l.id); });
  (l.sentences || []).forEach((s) => { const k = s.en.toLowerCase(); if (sent.has(k)) console.log(`aviso: frase repetida "${s.en}" em ${sent.get(k)} e ${l.id}`); else sent.set(k, l.id); });
}));
const head = `// BíbliaLearn — conteúdo das unidades e lições (gerado de content/u*.json; edite os JSON e rode merge.js)
// Cada lição: vocab (as 4 primeiras são as palavras-base da 1ª vez), sentences (arco da passagem),
// verse (KJV, domínio público, com lacuna), reading, dialogue e quiz.

`;
const body = "const COURSE = " + JSON.stringify(units, null, 2) + ";\n";
fs.writeFileSync(root + "data.js", head + body);
const nv = units.reduce((n, u) => n + u.lessons.reduce((m, l) => m + (l.vocab || []).length, 0), 0);
const ns = units.reduce((n, u) => n + u.lessons.reduce((m, l) => m + (l.sentences || []).length, 0), 0);
console.log(`data.js gerado: ${units.length} unidades · ${nv} palavras · ${ns} frases`);
