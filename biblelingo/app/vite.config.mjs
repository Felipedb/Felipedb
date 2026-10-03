import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import fs from "node:fs";
import path from "node:path";

// Os arquivos de conteúdo (data.js, scenes.js...) são compartilhados com as ferramentas de
// geração de áudio e continuam scripts clássicos. Este plugin os expõe como módulos ES
// sem tocar nos arquivos em disco.
const CONTENT_EXPORTS = {
  "data.js": "export { COURSE };",
  "characters.js": "export { CHARACTERS, CHARACTER_ORDER, UNIT_CAST, CHARACTER_UNIT };",
  "scenes.js": "export { SCENES, SCENE_EXTRAS };",
  "stories.js": "export { STORIES };",
  "icons.js": "export { ICONS };",
  "sfx-data.js": "export { SFX_DATA };",
};
function contentAsModules() {
  const root = path.resolve(__dirname, "..");
  return {
    name: "content-as-modules",
    transform(code, id) {
      const rel = path.relative(root, id).replace(/\\/g, "/");
      if (CONTENT_EXPORTS[rel]) return code + "\n" + CONTENT_EXPORTS[rel];
      if (rel === "scenes2.js")
        return 'import { SCENES, SCENE_EXTRAS } from "./scenes.js";\n' + code + "\nexport const loaded = true;";
      if (rel === "sfx.js")
        return 'import { SFX_DATA } from "./sfx-data.js";\nimport { state } from "/src/core/store.js";\n' + code + "\nexport { SFX };";
      return null;
    },
    // Em desenvolvimento, serve os áudios e retratos da pasta mãe
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const m = /^\/(audio|chars|icons)\/(.+)$/.exec(req.url.split("?")[0]);
        if (!m) return next();
        const file = path.join(root, m[1], decodeURIComponent(m[2]));
        if (!fs.existsSync(file)) return next();
        const ext = path.extname(file);
        const type = { ".mp3": "audio/mpeg", ".json": "application/json", ".jpg": "image/jpeg", ".png": "image/png" }[ext];
        if (type) res.setHeader("Content-Type", type);
        fs.createReadStream(file).pipe(res);
      });
    },
  };
}

export default defineConfig({
  base: "./",
  plugins: [contentAsModules(), react(), tailwindcss()],
  server: { fs: { allow: [".."] } },
  build: { outDir: "dist", assetsDir: "assets" },
});
