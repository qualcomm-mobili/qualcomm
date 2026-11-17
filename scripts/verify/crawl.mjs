// Fase 5.2 — Rastrea el sitio local desde "/" siguiendo enlaces internos y verifica:
//   · enlaces internos (<a href>): ninguno roto (las redirecciones 301 cuentan como válidas);
//   · imágenes (<img src/srcset>, next/image, íconos, fondos inline): ninguna 404;
//   · medios referenciados en los datos (src/content/**) que no aparecen en el HTML (p. ej. galerías del lightbox).
// Los enlaces "#" y los externos se listan aparte (no se consultan).
// Uso: LOCAL_ORIGIN=http://localhost:3000 node scripts/verify/crawl.mjs
import { readFile, readdir, writeFile, access } from "node:fs/promises";
import path from "node:path";
import * as cheerio from "cheerio";

const LOCAL = process.env.LOCAL_ORIGIN || "http://localhost:3000";
const exists = (p) => access(p).then(() => true, () => false);

const pages = new Map(); // ruta -> estado
const links = new Map(); // destino interno -> Set(páginas)
const hashLinks = new Map(); // página -> [texto]
const external = new Map(); // url -> Set(páginas)
const assets = new Map(); // ruta de recurso -> Set(páginas)
const queue = ["/"];

const add = (map, k, v) => (map.get(k) ?? map.set(k, new Set()).get(k)).add(v);
const assetPath = (u) => {
  const url = new URL(u, LOCAL);
  if (url.origin !== new URL(LOCAL).origin) return null;
  // next/image: verificar el archivo original (url=…), no cada tamaño generado.
  if (url.pathname.startsWith("/_next/image")) return decodeURIComponent(url.searchParams.get("url"));
  return decodeURIComponent(url.pathname);
};

while (queue.length) {
  const batch = queue.splice(0, 8);
  await Promise.all(
    batch.map(async (p) => {
      if (pages.has(p)) return;
      pages.set(p, "…");
      const res = await fetch(LOCAL + p, { redirect: "follow" });
      pages.set(p, res.status);
      if (!res.ok || !(res.headers.get("content-type") || "").includes("text/html")) return;
      const $ = cheerio.load(await res.text());
      $("a[href]").each((_, a) => {
        const href = $(a).attr("href").trim();
        if (href === "#" || href === "") return add(hashLinks, p, ($(a).text().trim() || $(a).attr("aria-label") || "(sin texto)").slice(0, 40));
        if (/^(mailto|tel|javascript):/.test(href)) return;
        const u = new URL(href, LOCAL + p);
        if (u.origin !== new URL(LOCAL).origin) return add(external, u.origin + u.pathname, p);
        if (/\.(pdf|jpe?g|png|svg|webp)$/i.test(u.pathname)) return add(assets, decodeURIComponent(u.pathname), p);
        add(links, u.pathname, p);
        if (!pages.has(u.pathname) && !queue.includes(u.pathname)) queue.push(u.pathname);
      });
      $("img[src], source[src]").each((_, e) => { const a = assetPath($(e).attr("src")); if (a) add(assets, a, p); });
      $("img[srcset]").each((_, e) => $(e).attr("srcset").split(",").forEach((s) => { const a = assetPath(s.trim().split(/\s+/)[0]); if (a) add(assets, a, p); }));
      $('link[rel~="icon"], link[rel="apple-touch-icon"]').each((_, e) => { const a = assetPath($(e).attr("href")); if (a) add(assets, a, p); });
      $("[style*='url(']").each((_, e) => { for (const m of ($(e).attr("style") || "").matchAll(/url\(["']?([^"')]+)["']?\)/g)) { const a = assetPath(m[1]); if (a) add(assets, a, p); } });
      $("iframe[src]").each((_, e) => add(external, $(e).attr("src").split("?")[0], p));
    }),
  );
}

// Medios mencionados en los datos (galerías del lightbox, slideshows, etc.)
async function walk(dir, out = []) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) await walk(f, out);
    else if (f.endsWith(".json") && !f.endsWith("media.json")) out.push(f);
  }
  return out;
}
const dataMedia = new Set();
for (const f of await walk("src/content")) for (const m of (await readFile(f, "utf8")).matchAll(/"(\/(?:wp-content|terceros|descargas)\/[^"]+)"/g)) dataMedia.add(m[1]);

// Verificación de estados
const check = async (list, fn) => {
  const out = new Map();
  let i = 0;
  await Promise.all(Array.from({ length: 12 }, async () => { while (i < list.length) { const k = list[i++]; out.set(k, await fn(k)); } }));
  return out;
};
const linkStatus = await check([...links.keys()], async (p) => (await fetch(LOCAL + p, { redirect: "manual" })).status);
const allAssets = [...new Set([...assets.keys(), ...dataMedia])];
const assetStatus = await check(allAssets, async (a) => (await fetch(LOCAL + encodeURI(a), { method: "HEAD" })).status);
const dataMissingOnDisk = [];
for (const m of dataMedia) if (!(await exists(path.join("public", m)))) dataMissingOnDisk.push(m);

const brokenLinks = [...linkStatus].filter(([, s]) => s >= 400);
const redirectLinks = [...linkStatus].filter(([, s]) => s >= 300 && s < 400);
const brokenAssets = [...assetStatus].filter(([, s]) => s >= 400);

let md = `# Rastreo de enlaces e imágenes\n\nLocal: ${LOCAL} — ${new Date().toISOString()}\n\n`;
md += `| Qué | Total | Con error |\n|---|---|---|\n`;
md += `| Páginas rastreadas desde "/" | ${pages.size} | ${[...pages.values()].filter((s) => s >= 400).length} |\n`;
md += `| Destinos de enlaces internos | ${links.size} | ${brokenLinks.length} |\n`;
md += `| Imágenes y archivos (HTML + datos) | ${allAssets.length} | ${brokenAssets.length} |\n`;
md += `| Medios de los datos que no están en public/ | ${dataMedia.size} | ${dataMissingOnDisk.length} |\n\n`;
md += `## Enlaces rotos\n\n${brokenLinks.map(([p, s]) => `- \`${p}\` → ${s} (desde ${[...links.get(p)].slice(0, 3).join(", ")})`).join("\n") || "Ninguno."}\n\n`;
md += `## Imágenes/archivos con error\n\n${brokenAssets.map(([a, s]) => `- \`${a}\` → ${s} (en ${[...(assets.get(a) ?? ["datos"])].slice(0, 3).join(", ")})`).join("\n") || "Ninguno."}\n\n`;
md += `## Enlaces internos que redirigen (301, igual que en el original)\n\n${redirectLinks.map(([p, s]) => `- \`${p}\` → ${s} (enlazado desde ${links.get(p).size} páginas)`).join("\n") || "Ninguno."}\n\n`;
const hashByText = {};
for (const [p, texts] of hashLinks) for (const t of texts) (hashByText[t] ||= []).push(p);
md += `## Enlaces "#" (vienen así del original)\n\n${Object.entries(hashByText).map(([t, ps]) => `- «${t}»: ${ps.length} páginas (p. ej. ${ps.slice(0, 3).map((x) => "`" + x + "`").join(", ")})`).join("\n") || "Ninguno."}\n\n`;
md += `## Enlaces externos (no consultados)\n\n${[...external].map(([u, ps]) => `- ${u} (${ps.size} páginas)`).join("\n")}\n`;
await writeFile("docs/verificacion/enlaces.md", md);
console.log({ paginas: pages.size, enlaces: links.size, rotos: brokenLinks.length, redirigen: redirectLinks.length, recursos: allAssets.length, recursosConError: brokenAssets.length, faltanEnPublic: dataMissingOnDisk.length, paginasConHash: hashLinks.size });
