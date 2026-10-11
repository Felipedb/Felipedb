// Consulta a World English Bible (WEB, domínio público, inglês moderno) para o conteúdo das lições.
// Uso: node tools/content/web.mjs "Gênesis 1:1-3" ["Isaías 9:6" ...]   (aceita nomes em português ou inglês)
//      WEB_DIR aponta para a pasta json do pacote npm "world-english-bible" (padrão: node_modules do app).
// Saída: uma linha por versículo: "Gênesis 1:1  In the beginning, God created the heavens and the earth."
// "Yahweh" é apresentado como "the LORD" (forma familiar ao leitor evangélico brasileiro; a WEB é de domínio público).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const DIR = process.env.WEB_DIR || [path.join(ROOT, "app", "node_modules", "world-english-bible", "json"), "/tmp/claude-0/-home-user-Felipedb/68313eda-2830-5bf7-a4e9-1f5e74f95180/scratchpad/sdk/web/package/json"].find((d) => fs.existsSync(d));
if (!DIR) { console.error("WEB não encontrada: instale world-english-bible ou defina WEB_DIR"); process.exit(1); }

// Nome do livro (português ou inglês, sem acento, minúsculo) -> arquivo json
export const BOOKS = {
  genesis: "genesis", exodo: "exodus", exodus: "exodus", levitico: "leviticus", leviticus: "leviticus", numeros: "numbers", numbers: "numbers",
  deuteronomio: "deuteronomy", deuteronomy: "deuteronomy", josue: "joshua", joshua: "joshua", juizes: "judges", judges: "judges", rute: "ruth", ruth: "ruth",
  "1samuel": "1samuel", "2samuel": "2samuel", "1reis": "1kings", "1kings": "1kings", "2reis": "2kings", "2kings": "2kings",
  "1cronicas": "1chronicles", "1chronicles": "1chronicles", "2cronicas": "2chronicles", "2chronicles": "2chronicles", esdras: "ezra", ezra: "ezra",
  neemias: "nehemiah", nehemiah: "nehemiah", ester: "esther", esther: "esther", jo: "job", job: "job", salmos: "psalms", salmo: "psalms", psalms: "psalms", psalm: "psalms",
  proverbios: "proverbs", proverbs: "proverbs", eclesiastes: "ecclesiastes", ecclesiastes: "ecclesiastes", cantares: "songofsolomon", canticos: "songofsolomon", songofsolomon: "songofsolomon",
  isaias: "isaiah", isaiah: "isaiah", jeremias: "jeremiah", jeremiah: "jeremiah", lamentacoes: "lamentations", lamentations: "lamentations",
  ezequiel: "ezekiel", ezekiel: "ezekiel", daniel: "daniel", oseias: "hosea", hosea: "hosea", joel: "joel", amos: "amos", obadias: "obadiah", obadiah: "obadiah",
  jonas: "jonah", jonah: "jonah", miqueias: "micah", micah: "micah", naum: "nahum", nahum: "nahum", habacuque: "habakkuk", habakkuk: "habakkuk",
  sofonias: "zephaniah", zephaniah: "zephaniah", ageu: "haggai", haggai: "haggai", zacarias: "zechariah", zechariah: "zechariah", malaquias: "malachi", malachi: "malachi",
  mateus: "matthew", matthew: "matthew", marcos: "mark", mark: "mark", lucas: "luke", luke: "luke", joao: "john", john: "john", atos: "acts", acts: "acts",
  romanos: "romans", romans: "romans", "1corintios": "1corinthians", "1corinthians": "1corinthians", "2corintios": "2corinthians", "2corinthians": "2corinthians",
  galatas: "galatians", galatians: "galatians", efesios: "ephesians", ephesians: "ephesians", filipenses: "philippians", philippians: "philippians",
  colossenses: "colossians", colossians: "colossians", "1tessalonicenses": "1thessalonians", "1thessalonians": "1thessalonians", "2tessalonicenses": "2thessalonians", "2thessalonians": "2thessalonians",
  "1timoteo": "1timothy", "1timothy": "1timothy", "2timoteo": "2timothy", "2timothy": "2timothy", tito: "titus", titus: "titus", filemom: "philemon", philemon: "philemon",
  hebreus: "hebrews", hebrews: "hebrews", tiago: "james", james: "james", "1pedro": "1peter", "1peter": "1peter", "2pedro": "2peter", "2peter": "2peter",
  "1joao": "1john", "1john": "1john", "2joao": "2john", "2john": "2john", "3joao": "3john", "3john": "3john", judas: "jude", jude: "jude", apocalipse: "revelation", revelation: "revelation",
};
const slug = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
const cache = {};
function book(name) {
  const key = BOOKS[slug(name)];
  if (!key) throw new Error("Livro desconhecido: " + name);
  if (!cache[key]) {
    const data = JSON.parse(fs.readFileSync(path.join(DIR, key + ".json"), "utf8"));
    const verses = {};
    for (const e of data) {
      if (!e.chapterNumber || !e.verseNumber || typeof e.value !== "string") continue;
      const id = e.chapterNumber + ":" + e.verseNumber;
      verses[id] = ((verses[id] || "") + " " + e.value).replace(/\s+/g, " ").trim();
    }
    cache[key] = verses;
  }
  return cache[key];
}
const present = (t) => t.replace(/Yahweh's/g, "the LORD's").replace(/\bYahweh\b/g, "the LORD").replace(/(^|[.!?]\s+|[“‘"]\s*)the LORD/g, "$1The LORD");

// "Gênesis 1:1-3" | "Salmo 23:1" | "João 3:16" -> [{ ref, text }]
export function lookup(ref) {
  const m = /^(.+?)\s+(\d+):(\d+)(?:-(\d+))?$/.exec(ref.trim());
  if (!m) throw new Error("Referência inválida: " + ref + " (use Livro cap:v ou Livro cap:v-v)");
  const [, name, ch, v1, v2] = m;
  const verses = book(name);
  const out = [];
  for (let v = Number(v1); v <= Number(v2 || v1); v++) {
    const t = verses[ch + ":" + v];
    if (t) out.push({ ref: name.trim() + " " + ch + ":" + v, text: present(t) });
  }
  return out;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const refs = process.argv.slice(2);
  if (!refs.length) { console.log('Uso: node tools/content/web.mjs "Gênesis 1:1-3" ...'); process.exit(0); }
  for (const r of refs) for (const v of lookup(r)) console.log(v.ref + "  " + v.text);
}
