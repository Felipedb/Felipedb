// Copia áudio, retratos (chars/ com os bustos de chars/v2/), ícones e ilustrações 3D (img/fx/) da pasta mãe para dist/
// (o app publicado é 100% estático)
import fs from "node:fs";
import path from "node:path";
const root = path.resolve(import.meta.dirname, "..", "..");
const dist = path.resolve(import.meta.dirname, "..", "dist");
// audio/align/ (timestamps por caractere) só serve ao recorte de palavras em tools/: não vai para o app
const skip = (p) => /[\\/]audio[\\/]align(?:[\\/]|$)/.test(p);
for (const dir of ["audio", "chars", "icons", "img"]) {
  fs.cpSync(path.join(root, dir), path.join(dist, dir), { recursive: true, filter: (p) => !skip(p) });
}
console.log("assets copiados para dist/");
