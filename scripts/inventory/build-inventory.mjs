// Fase 1 — Construye el inventario a partir de .cache/source (ver fetch-source.mjs):
// URLs (con estado), SEO por página, medios referenciados (con peso vía HEAD), PDFs, fuentes y CSS.
// Escribe data/inventory.json y docs/inventario/*.md
// Uso: node scripts/inventory/build-inventory.mjs
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import * as cheerio from "cheerio";

const ORIGIN = "https://qualcomm.com.mx";
const SRC = path.resolve(".cache/source");
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36";
const OUT_OF_SCOPE = [/^\/nueva\//, /^\/__portada\//, /^\/design-system\//, /^\/carrito\//, /^\/finalizar-compra\//, /^\/mi-cuenta\//];

const readJSON = async (rel) => JSON.parse(await readFile(path.join(SRC, rel), "utf8"));
const pathOf = (u) => new URL(u, ORIGIN).pathname;
const isOut = (p) => OUT_OF_SCOPE.some((r) => r.test(p));

async function pool(items, n, fn) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(Array.from({ length: n }, async () => {
    while (i < items.length) { const k = i++; out[k] = await fn(items[k], k); }
  }));
  return out;
}

async function head(url) {
  for (let i = 0; i < 3; i++) {
    try {
      let r = await fetch(url, { method: "HEAD", headers: { "user-agent": UA }, redirect: "follow" });
      if (r.status === 405 || r.status === 403) r = await fetch(url, { headers: { "user-agent": UA, range: "bytes=0-0" } });
      const len = r.headers.get("content-range")?.split("/")[1] ?? r.headers.get("content-length");
      return { status: r.status, bytes: len ? Number(len) : null, type: r.headers.get("content-type"), finalUrl: r.url };
    } catch (e) {
      if (i === 2) return { status: 0, bytes: null, error: String(e) };
    }
  }
}

const sitemaps = await readJSON("sitemaps/parsed.json");
const htmlIndex = await readJSON("html/_index.json");
const wcProducts = await readJSON("api/wc-products.json");
const wcCategories = await readJSON("api/wc-categories.json");
const wpPages = await readJSON("api/wp-pages.json");

// ---------- Páginas y SEO ----------
const sitemapOf = {};
for (const [name, list] of Object.entries(sitemaps)) for (const u of list) sitemapOf[u.loc] = { name, lastmod: u.lastmod, images: u.images };

const media = new Map(); // url -> { kind, usedBy:Set }
const addMedia = (raw, page, kind) => {
  if (!raw) return;
  let u;
  try { u = new URL(raw.replace(/&#0?38;/g, "&").trim(), ORIGIN); } catch { return; }
  if (!/^https?:$/.test(u.protocol)) return;
  u.hash = "";
  if (u.hostname === "qualcomm.com.mx") u.search = ""; // ?ver=...
  const key = u.toString();
  if (!media.has(key)) media.set(key, { kind, usedBy: new Set() });
  media.get(key).usedBy.add(page);
};

const internalLinks = new Map(); // path -> Set(pages)
const externalLinks = new Map();
const pages = [];

for (const meta of htmlIndex) {
  const p = pathOf(meta.url);
  const html = await readFile(path.join(SRC, meta.file), "utf8");
  const $ = cheerio.load(html);
  const m = (sel, attr = "content") => $(sel).attr(attr) ?? null;
  const seo = {
    title: $("title").first().text().trim() || null,
    description: m('meta[name="description"]'),
    robots: m('meta[name="robots"]'),
    canonical: m('link[rel="canonical"]', "href"),
    og: Object.fromEntries($('meta[property^="og:"]').map((_, el) => [[$(el).attr("property"), $(el).attr("content")]]).get()),
    twitter: Object.fromEntries($('meta[name^="twitter:"]').map((_, el) => [[$(el).attr("name"), $(el).attr("content")]]).get()),
    jsonLd: $('script[type="application/ld+json"]').length,
  };
  const elementorId = $('[data-elementor-type="wp-page"], [data-elementor-type="product"], [data-elementor-type="single-product"]').first().attr("data-elementor-id") ?? null;
  const templates = [...new Set($("[data-elementor-type]").map((_, el) => `${$(el).attr("data-elementor-type")}#${$(el).attr("data-elementor-id")}`).get())];

  // medios
  $("img").each((_, el) => {
    addMedia($(el).attr("src"), p, "img");
    for (const attr of ["srcset", "data-srcset"]) {
      const ss = $(el).attr(attr);
      if (ss) for (const part of ss.split(",")) addMedia(part.trim().split(/\s+/)[0], p, "img-srcset");
    }
    addMedia($(el).attr("data-src"), p, "img");
  });
  $("source[src], video[src], video[poster], audio[src]").each((_, el) => { addMedia($(el).attr("src"), p, "video"); addMedia($(el).attr("poster"), p, "img"); });
  $("[style*='url(']").each((_, el) => {
    for (const mm of ($(el).attr("style") || "").matchAll(/url\(['"]?([^'")]+)['"]?\)/g)) addMedia(mm[1], p, "bg");
  });
  $("[data-settings]").each((_, el) => {
    const s = $(el).attr("data-settings");
    for (const mm of s.matchAll(/"url":"(https?:[^"]+)"/g)) addMedia(mm[1].replace(/\\\//g, "/"), p, "elementor-setting");
  });
  $('link[rel="stylesheet"]').each((_, el) => addMedia($(el).attr("href"), p, "css"));
  $('link[rel~="icon"], link[rel="apple-touch-icon"]').each((_, el) => addMedia($(el).attr("href"), p, "icon"));
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) return;
    let u; try { u = new URL(href, ORIGIN); } catch { return; }
    if (u.hostname === "qualcomm.com.mx") {
      if (/\.(pdf|jpe?g|png|webp|svg|gif|zip)$/i.test(u.pathname)) addMedia(u.toString(), p, "file-link");
      else {
        const key = u.pathname + (u.search && !u.search.includes("add-to-cart") ? u.search : "");
        if (!internalLinks.has(key)) internalLinks.set(key, new Set());
        internalLinks.get(key).add(p);
      }
    } else {
      const key = u.origin + u.pathname;
      if (!externalLinks.has(key)) externalLinks.set(key, new Set());
      externalLinks.get(key).add(p);
    }
  });
  if (seo.og["og:image"]) addMedia(seo.og["og:image"], p, "og-image");

  const sm = sitemapOf[meta.url];
  pages.push({
    path: p,
    type: p.startsWith("/producto/") ? "producto" : "pagina",
    scope: isOut(p) ? "fuera" : "dentro",
    status: meta.status,
    finalUrl: meta.finalUrl !== meta.url ? meta.finalUrl : null,
    sitemap: sm?.name ?? null,
    lastmod: sm?.lastmod ?? null,
    elementorId,
    templates,
    forms: $("form").length,
    seo,
  });
}

// ---------- URLs descubiertas por enlaces internos que no están en sitemaps ----------
const known = new Set(pages.map((x) => x.path));
const discovered = [...internalLinks.keys()].filter((k) => !known.has(k) && !k.startsWith("/wp-") && !k.startsWith("/feed") && !k.includes("?"));
const discoveredStatus = await pool(discovered, 6, async (k) => ({ path: k, ...(await head(ORIGIN + k)), linkedFrom: [...internalLinks.get(k)].slice(0, 5), linkedFromCount: internalLinks.get(k).size }));
// categorías WooCommerce (archivos /categoria-producto/...)
const catArchives = await pool(wcCategories, 6, async (c) => ({ path: pathOf(c.permalink), name: c.name, count: c.count, parent: c.parent, ...(await head(c.permalink)) }));

// ---------- Fuentes y CSS ----------
const cssUrls = [...media.entries()].filter(([, v]) => v.kind === "css").map(([k]) => k);
const fonts = new Map();
const cssTokens = { colors: new Map(), families: new Map(), breakpoints: new Map() };
await pool(cssUrls, 6, async (u) => {
  let css;
  try { css = await (await fetch(u, { headers: { "user-agent": UA } })).text(); } catch { return; }
  for (const mm of css.matchAll(/url\(['"]?([^'")]+\.(?:woff2?|ttf|otf|eot)[^'")]*)['"]?\)/g)) {
    const f = new URL(mm[1], u).toString();
    if (!fonts.has(f)) fonts.set(f, new Set());
    fonts.get(f).add(u);
  }
  for (const mm of css.matchAll(/font-family\s*:\s*([^;}]+)/g)) cssTokens.families.set(mm[1].trim(), (cssTokens.families.get(mm[1].trim()) || 0) + 1);
  for (const mm of css.matchAll(/--e-global-color-[\w-]+\s*:\s*([^;]+)/g)) cssTokens.colors.set(mm[0], 1);
  for (const mm of css.matchAll(/@media\s*\(([^)]*width[^)]*)\)/g)) cssTokens.breakpoints.set(mm[1].replace(/\s+/g, " "), (cssTokens.breakpoints.get(mm[1].replace(/\s+/g, " ")) || 0) + 1);
});

// ---------- Medios de productos desde la API (originales a tamaño completo) ----------
for (const prod of wcProducts) for (const img of prod.images) addMedia(img.src, pathOf(prod.permalink), "product-image");
for (const c of wcCategories) if (c.image) addMedia(c.image.src, pathOf(c.permalink), "category-image");
// imágenes listadas en sitemaps
for (const [, list] of Object.entries(sitemaps)) for (const u of list) for (const img of u.images) addMedia(img, pathOf(u.loc), "sitemap-image");

// ---------- HEAD a todos los medios propios (no CSS/JS de plugins) ----------
const ownMedia = [...media.entries()].filter(([k, v]) => v.kind !== "css" && new URL(k).hostname === "qualcomm.com.mx");
console.log("HEAD a", ownMedia.length, "medios…");
const mediaRows = await pool(ownMedia, 8, async ([url, v]) => {
  const pathsUsing = [...v.usedBy];
  return {
    url,
    kind: v.kind,
    ext: (new URL(url).pathname.split(".").pop() || "").toLowerCase(),
    isResizedVariant: /-\d+x\d+\.(jpe?g|png|webp|gif)$/i.test(url),
    inScope: pathsUsing.some((p) => !isOut(p)),
    usedByCount: pathsUsing.length,
    usedBy: pathsUsing.slice(0, 5),
    ...(await head(url)),
  };
});
const fontRows = await pool([...fonts.entries()], 6, async ([url, from]) => ({ url, from: [...from], ...(await head(url)) }));

// ---------- Externos (fuentes, embeds, analítica) ----------
const scriptsExternal = new Set();
for (const meta of htmlIndex.slice(0, 1)) {
  const $ = cheerio.load(await readFile(path.join(SRC, meta.file), "utf8"));
  $("script[src]").each((_, el) => scriptsExternal.add($(el).attr("src").replace(/\?.*$/, "")));
  $("script:not([src])").each((_, el) => {
    const t = $(el).html() || "";
    for (const mm of t.matchAll(/(googletagmanager\.com\/[^'"]+|gtag\('config',\s*'[^']+'|fbq\('init',\s*'[^']+'|hotjar|clarity\.ms)/g)) scriptsExternal.add(mm[1]);
  });
}

const inventory = {
  generatedAt: new Date().toISOString(),
  origin: ORIGIN,
  pages,
  discoveredUrls: discoveredStatus,
  categoryArchives: catArchives,
  wpPages: wpPages.map((x) => ({ id: x.id, slug: x.slug, link: x.link, status: x.status, parent: x.parent, template: x.template, modified: x.modified })),
  media: mediaRows,
  fonts: fontRows,
  externalLinks: [...externalLinks.entries()].map(([u, s]) => ({ url: u, pages: s.size })).sort((a, b) => b.pages - a.pages),
  scripts: [...scriptsExternal],
  css: {
    stylesheets: cssUrls,
    fontFamilies: [...cssTokens.families.entries()].sort((a, b) => b[1] - a[1]).slice(0, 40),
    elementorGlobalColors: [...cssTokens.colors.keys()],
    breakpoints: [...cssTokens.breakpoints.entries()].sort((a, b) => b[1] - a[1]),
  },
};
await mkdir("data", { recursive: true });
await writeFile("data/inventory.json", JSON.stringify(inventory, null, 2));
console.log("ok data/inventory.json", { pages: pages.length, media: mediaRows.length, fonts: fontRows.length, discovered: discovered.length });
