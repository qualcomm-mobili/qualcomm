// Fase 1 — Descarga la fuente del sitio original (sitemaps, APIs y HTML renderizado)
// a .cache/source/ para poder inventariar sin volver a pegarle al servidor.
// Uso: node scripts/inventory/fetch-source.mjs
import { mkdir, writeFile, readFile, access } from "node:fs/promises";
import path from "node:path";

const ORIGIN = "https://qualcomm.com.mx";
const OUT = path.resolve(".cache/source");
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36";

async function get(url, { asText = true } = {}) {
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch(url, { headers: { "user-agent": UA }, redirect: "follow" });
      const body = asText ? await res.text() : null;
      return { status: res.status, finalUrl: res.url, headers: Object.fromEntries(res.headers), body };
    } catch (e) {
      if (i === 2) return { status: 0, error: String(e) };
      await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
    }
  }
}

async function pool(items, n, fn) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(Array.from({ length: n }, async () => {
    while (i < items.length) { const k = i++; out[k] = await fn(items[k], k); }
  }));
  return out;
}

const exists = (p) => access(p).then(() => true, () => false);
const save = async (rel, data) => {
  const p = path.join(OUT, rel);
  await mkdir(path.dirname(p), { recursive: true });
  await writeFile(p, typeof data === "string" ? data : JSON.stringify(data, null, 2));
};

async function paginate(endpoint) {
  const all = [];
  for (let page = 1; ; page++) {
    const sep = endpoint.includes("?") ? "&" : "?";
    const r = await get(`${ORIGIN}${endpoint}${sep}per_page=100&page=${page}`);
    const data = JSON.parse(r.body);
    if (!Array.isArray(data) || data.length === 0) break;
    all.push(...data);
    const total = Number(r.headers["x-wp-totalpages"] || 1);
    if (page >= total) break;
  }
  return all;
}

// 1. Sitemaps
const sitemapIndex = (await get(`${ORIGIN}/wp-sitemap.xml`)).body;
await save("sitemaps/wp-sitemap.xml", sitemapIndex);
const sitemaps = {};
for (const loc of [...sitemapIndex.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1])) {
  const name = loc.split("/").pop();
  const xml = (await get(loc)).body;
  await save(`sitemaps/${name}`, xml);
  sitemaps[name] = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => ({
    loc: m[1].match(/<loc>(.*?)<\/loc>/)[1],
    lastmod: m[1].match(/<lastmod>(.*?)<\/lastmod>/)?.[1] ?? null,
    images: [...m[1].matchAll(/<image:loc>(.*?)<\/image:loc>/g)].map((x) => x[1]),
  }));
}
await save("sitemaps/parsed.json", sitemaps);
console.log("sitemaps:", Object.entries(sitemaps).map(([k, v]) => `${k}=${v.length}`).join(" "));

// 2. APIs
const api = {
  "wc-products.json": "/wp-json/wc/store/v1/products",
  "wc-categories.json": "/wp-json/wc/store/v1/products/categories",
  "wp-pages.json": "/wp-json/wp/v2/pages?context=view",
  "wp-products.json": "/wp-json/wp/v2/product?context=view",
  "wp-media.json": "/wp-json/wp/v2/media?context=view",
};
for (const [file, ep] of Object.entries(api)) {
  const data = await paginate(ep);
  await save(`api/${file}`, data);
  console.log(`api ${file}: ${data.length}`);
}
await save("api/wp-root.json", JSON.parse((await get(`${ORIGIN}/wp-json/`)).body));

// 3. HTML renderizado de cada URL del sitemap (+ páginas extra conocidas)
const extra = ["/tienda/", "/catalogo/", "/aviso-de-privacidad/", "/gracias-por-contactarnos/"].map((p) => ORIGIN + p);
const urls = [...new Set([...Object.values(sitemaps).flat().map((u) => u.loc), ...extra])];
const htmlIndex = await pool(urls, 6, async (url) => {
  const slug = new URL(url).pathname.replace(/^\/|\/$/g, "") || "_home";
  const file = `html/${slug}.html`;
  if (await exists(path.join(OUT, file))) {
    const meta = JSON.parse(await readFile(path.join(OUT, file + ".json"), "utf8"));
    return meta;
  }
  const r = await get(url);
  const meta = { url, status: r.status, finalUrl: r.finalUrl, file, contentType: r.headers?.["content-type"] ?? null, error: r.error ?? null };
  if (r.body) await save(file, r.body);
  await save(file + ".json", meta);
  return meta;
});
await save("html/_index.json", htmlIndex);
console.log("html:", htmlIndex.length, "status:", JSON.stringify(htmlIndex.reduce((a, m) => ((a[m.status] = (a[m.status] || 0) + 1), a), {})));
