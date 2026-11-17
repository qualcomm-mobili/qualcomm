// Fase 5 — Copia las fechas de publicación/modificación de WordPress (API wp/v2) al bloque `seo`
// de cada página (src/content/pages/*.json) y producto (src/content/products.json).
// WordPress guarda la hora local de America/Monterrey (UTC−06:00, sin horario de verano desde 2022),
// que es lo que Rank Math publica en article:published_time / datePublished.
// Uso: node scripts/content/add-dates.mjs
import { readFile, writeFile, readdir } from "node:fs/promises";

const TZ = "-06:00";
const json = async (p) => JSON.parse(await readFile(p, "utf8"));
const pathOf = (link) => new URL(link).pathname;
const dates = new Map();
for (const file of ["wp-pages.json", "wp-products.json"]) {
  for (const x of await json(`.cache/source/api/${file}`)) dates.set(pathOf(x.link), { published: x.date + TZ, modified: x.modified + TZ });
}
// La portada (página 186) ya viene en la API con link "/".
// /tienda/ es un archivo de WooCommerce: Rank Math no publica sus fechas.
dates.delete("/tienda/");

let n = 0;
for (const f of await readdir("src/content/pages")) {
  const p = `src/content/pages/${f}`;
  const data = await json(p);
  const d = data.seo && dates.get(data.seo.canonical);
  if (!d) continue;
  Object.assign(data.seo, d);
  await writeFile(p, JSON.stringify(data, null, 2) + "\n");
  n++;
}
const products = await json("src/content/products.json");
for (const pr of products) Object.assign(pr.seo, dates.get(pr.seo.canonical) ?? {});
await writeFile("src/content/products.json", JSON.stringify(products, null, 2) + "\n");
console.log({ pages: n, products: products.filter((p) => p.seo.published).length });
