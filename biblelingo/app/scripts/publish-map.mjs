// Gera o corpo da página do artefato (a partir de dist/index.html) e o mapa de arquivos
// suportados, no formato que a publicação incremental usa (null remove os antigos).
import fs from "node:fs";
import path from "node:path";
const dist = path.resolve(import.meta.dirname, "..", "dist");
const outDir = process.argv[2] || "/tmp";
const html = fs.readFileSync(path.join(dist, "index.html"), "utf8");
const head = html.match(/<title>[\s\S]*?<\/head>/)[0].replace(/<\/head>$/, "").replace(/^\s+/gm, "  ");
const bodyScripts = [...html.matchAll(/<script[^>]*src="[^"]+"[^>]*><\/script>/g)].map((m) => m[0]).join("\n");
const page = `${head}\n<div id="root"></div>\n${bodyScripts}\n`;
fs.writeFileSync(path.join(outDir, "biblelingo-react.html"), page.replace(/"\.\//g, '"'));
// mapa: tudo de dist menos index.html
const files = {};
const walk = (dir, rel = "") => {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f), r = rel ? rel + "/" + f : f;
    if (fs.statSync(p).isDirectory()) walk(p, r);
    else if (r !== "index.html") files[r] = "app/dist/" + r;
  }
};
walk(dist);
fs.writeFileSync(path.join(outDir, "react-files.json"), JSON.stringify(files));
console.log("página e mapa gerados:", Object.keys(files).length, "arquivos");
