// Genera src/content/media.json: { "/wp-content/uploads/...jpg": [ancho, alto] } para todas las
// imágenes en public/. Lo usa <Img> para dar width/height a next/image sin importar archivos.
// Uso: node scripts/media-manifest.mjs
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { imageSize } from "image-size";

const ROOT = "public";
const out = {};
async function walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) await walk(p);
    else if (/\.(jpe?g|png|webp|gif|svg)$/i.test(e.name)) {
      try {
        const { width, height } = imageSize(await readFile(p));
        out["/" + path.relative(ROOT, p).split(path.sep).join("/")] = [width, height];
      } catch (err) {
        console.warn("sin dimensiones:", p, err.message);
      }
    }
  }
}
await walk(ROOT);
const sorted = Object.fromEntries(Object.entries(out).sort(([a], [b]) => a.localeCompare(b)));
await writeFile("src/content/media.json", JSON.stringify(sorted, null, 0).replace(/\],"/g, '],\n"'));
console.log(Object.keys(sorted).length, "imágenes");
