// Fase 3 — Algunas imágenes (fondos de contenedores Elementor) solo aparecen en los CSS por página
// (/wp-content/uploads/elementor/css/post-{id}.css), no en el HTML. Este script lee esos CSS para
// todas las páginas en alcance y descarga a public/ las imágenes que falten.
// Uso: node scripts/inventory/download-css-media.mjs
import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import path from "node:path";

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36";
const inv = JSON.parse(await readFile("data/inventory.json", "utf8"));
const cssUrls = new Set();
for (const p of inv.pages.filter((p) => p.scope === "dentro")) {
  const slug = p.path.replace(/^\/|\/$/g, "") || "_home";
  const html = await readFile(path.join(".cache/source/html", `${slug}.html`), "utf8");
  for (const m of html.matchAll(/https:\/\/qualcomm\.com\.mx\/wp-content\/uploads\/elementor\/css\/post-\d+\.css/g)) cssUrls.add(m[0]);
}

const found = new Map(); // url de imagen -> css de origen
for (const u of cssUrls) {
  const css = await (await fetch(u, { headers: { "user-agent": UA } })).text();
  for (const m of css.matchAll(/url\(["']?(https:\/\/qualcomm\.com\.mx\/wp-content\/uploads\/[^"')]+)["']?\)/g)) found.set(m[1], u.split("/").pop());
}

const exists = (p) => access(p).then(() => true, () => false);
const result = { cssFiles: cssUrls.size, images: found.size, downloaded: [], alreadyPresent: 0, failed: [] };
for (const [url, from] of found) {
  const dest = path.join("public", decodeURIComponent(new URL(url).pathname));
  if (await exists(dest)) { result.alreadyPresent++; continue; }
  const res = await fetch(url, { headers: { "user-agent": UA } });
  if (!res.ok) { result.failed.push({ url, status: res.status, from }); continue; }
  await mkdir(path.dirname(dest), { recursive: true });
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(dest, buf);
  result.downloaded.push({ url, bytes: buf.length, from });
}
await writeFile("data/css-media-download.json", JSON.stringify(result, null, 2));
console.log({ cssFiles: result.cssFiles, images: result.images, downloaded: result.downloaded.length, alreadyPresent: result.alreadyPresent, failed: result.failed.length });
