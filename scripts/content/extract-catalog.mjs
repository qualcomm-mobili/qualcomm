// Fase 4 — Genera los datos del catálogo a partir de la API de WooCommerce y del HTML guardado:
//   src/content/categories.json  — 24 categorías (sin productos dentro)
//   src/content/products.json    — 207 productos (referencian categorías por slug)
//   src/content/pages/{categoría principal}.json y tienda.json — composición de cada página
// Uso: node scripts/content/extract-catalog.mjs
import { readFile, writeFile } from "node:fs/promises";
import * as cheerio from "cheerio";

const SRC = ".cache/source";
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36";
const json = async (p) => JSON.parse(await readFile(p, "utf8"));
const load = async (rel) => cheerio.load(await readFile(`${SRC}/html/${rel}.html`, "utf8"));
const local = (u) => (u ? decodeURI(new URL(u, "https://qualcomm.com.mx").pathname) : u);
const slugOf = (href) => local(href).replace(/\/$/, "").split("/").pop();
const clean = (s) => s.replace(/ /g, " ").replace(/\s+/g, " ").trim();
// Los saltos (<br>, cambio de párrafo) se marcan con ⏎ (no es espacio para \s) antes de colapsar espacios y luego se restauran.
const toRich = (html) =>
  clean(
    (html || "")
      .replace(/<\/?(strong|b)>/g, "**")
      .replace(/<br\s*\/?>/g, "⏎")
      .replace(/<\/p>\s*<p>/g, "⏎⏎")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&#8211;/g, "–")
      .replace(/&#8220;|&#8221;/g, '"'),
  ).replace(/ ?⏎ ?/g, "\n");

/**
 * Texto enriquecido de un widget de texto de Elementor recorriendo el HTML: **negritas**, saltos (<br>) y
 * listas (<ul>/<li>) como líneas "- item". El salto entre el texto y la lista es el separador de líneas,
 * así RichText reproduce exactamente los <br> del original.
 */
function richFromHtml(html) {
  const $ = cheerio.load(`<div id="r">${html || ""}</div>`);
  let out = "";
  let afterList = false;
  const text = (t) => {
    const v = t.replace(/[\s\u00a0]+/g, " ");
    if (!v.trim()) return;
    if (afterList) { out += "\n"; afterList = false; }
    out += out.endsWith("\n") || !out ? v.trimStart() : v;
  };
  const walk = (node) => {
    for (const n of node.children ?? []) {
      if (n.type === "text") text(n.data);
      else if (n.name === "br") { out = out.replace(/ +$/, "") + "\n"; afterList = false; }
      else if (n.name === "strong" || n.name === "b") { if (afterList) { out += "\n"; afterList = false; } out += "**"; walk(n); out += "**"; }
      else if (n.name === "ul" || n.name === "ol") {
        const items = $(n).children("li").map((_, li) => clean($(li).text())).get();
        out = (out ? out.replace(/ +$/, "") + "\n" : "") + items.map((i) => `- ${i}`).join("\n");
        afterList = true;
      } else walk(n);
    }
  };
  walk($("#r")[0]);
  return out.replace(/\*\* +\*\*/g, " ").replace(/ +\n/g, "\n").trim();
}

const wcProducts = await json(`${SRC}/api/wc-products.json`);
const wcCategories = await json(`${SRC}/api/wc-categories.json`);
const inv = await json("data/inventory.json");
const catById = Object.fromEntries(wcCategories.map((c) => [c.id, c]));

function seoFrom($, path) {
  const m = (sel) => $(sel).attr("content") ?? null;
  return {
    title: $("title").first().text().trim(),
    description: m('meta[name="description"]') ?? "",
    canonical: path,
    ogType: m('meta[property="og:type"]') ?? "article",
    ...(m('meta[property="og:image"]') ? { ogImage: local(m('meta[property="og:image"]')) } : {}),
    // En los archivos, Rank Math publica la descripción de la categoría con HTML (<p>…</p>) en og:description; se limpia.
    ...(!m('meta[name="description"]') && m('meta[property="og:description"]') ? { ogDescription: clean(cheerio.load(m('meta[property="og:description"]')).text()) } : {}),
  };
}

// ---------------- Categorías ----------------
const MAIN = ["mobiliario-italiano", "mobiliario-nacional", "recepciones", "sofas", "soft-seating", "silleria"];
const categories = [];
for (const c of wcCategories.sort((a, b) => a.id - b.id)) {
  const parent = c.parent ? catById[c.parent].slug : null;
  const archivePath = local(c.permalink);
  const isMain = MAIN.includes(c.slug);
  // Las principales tienen página Elementor propia (/slug/); larus/lithos redirigen a /mobiliario-italiano/.
  const href = isMain ? `/${c.slug}/` : ["larus", "lithos"].includes(c.slug) ? "/mobiliario-italiano/" : archivePath;
  const cat = { slug: c.slug, name: c.name, parent, href, description: clean(c.description || "") };
  if (!isMain && href === archivePath) {
    const $ = await load(archivePath.replace(/^\/|\/$/g, ""));
    cat.seo = seoFrom($, archivePath);
    cat.layout = $('[data-elementor-type="product-archive"]').length ? "elementor" : "woocommerce";
  }
  if (c.image) cat.image = local(c.image.src);
  categories.push(cat);
}
// "Sin categorizar" no sale en la API de la tienda (categoría por defecto de WordPress).
if (!categories.find((c) => c.slug === "sin-categorizar")) {
  const $ = await load("categoria-producto/sin-categorizar");
  categories.push({ slug: "sin-categorizar", name: "Sin categorizar", parent: null, href: "/categoria-producto/sin-categorizar/", description: "", seo: seoFrom($, "/categoria-producto/sin-categorizar/"), layout: "woocommerce" });
}

// ---------------- Productos ----------------
const $shop = await load("tienda");
const shopOrder = $shop("ul.products li.product a.woocommerce-LoopProduct-link").map((_, a) => slugOf($shop(a).attr("href"))).get();

const products = [];
const notes = [];
for (const p of wcProducts) {
  const path = local(p.permalink);
  const $ = await load(path.replace(/^\/|\/$/g, ""));
  const root = $('[data-elementor-type="product"]');
  const crumbs = root.find(".woocommerce-breadcrumb a").map((_, a) => $(a).attr("href")).get().slice(1); // sin "Inicio"
  const primary = crumbs.length ? slugOf(crumbs.at(-1)) : null;
  let cats = p.categories.map((c) => c.slug);
  if (!cats.length && primary) cats = [primary];
  const shortHtml = root.find('[data-widget_type="text-editor.default"] .elementor-widget-container').first().html();
  // La galería que se ve en la página manda; la API solo aporta el texto alternativo.
  const rendered = root.find(".woocommerce-product-gallery__image a").map((_, a) => local($(a).attr("href"))).get();
  const altOf = Object.fromEntries(p.images.map((im) => [local(im.src), im.alt || ""]));
  const images = rendered.map((src) => ({ src, alt: altOf[src] ?? "" }));
  if (rendered.join() !== p.images.map((im) => local(im.src)).join()) notes.push(`${p.slug}: la página muestra ${rendered.length} imágenes y la API ${p.images.length}; se usan las de la página`);
  products.push({
    slug: p.slug,
    name: clean(cheerio.load(p.name).text()),
    categories: cats,
    primaryCategory: primary,
    shortDescription: shortHtml ? richFromHtml(shortHtml) : "",
    ...(p.description.trim() ? { description: toRich(p.description) } : {}),
    images,
    seo: seoFrom($, path),
  });
}
products.sort((a, b) => shopOrder.indexOf(a.slug) - shopOrder.indexOf(b.slug));

// ---------------- Páginas de categorías principales ----------------
async function bgImages(pageId) {
  const css = await (await fetch(`https://qualcomm.com.mx/wp-content/uploads/elementor/css/post-${pageId}.css`, { headers: { "user-agent": UA } })).text();
  const out = {};
  for (const m of css.matchAll(/elementor-element-([0-9a-f]{7})[^{]*\{[^}]*background-image:url\("([^"]+)"\)/g)) out[m[1]] ??= local(m[2]);
  return out;
}

const pages = {};
for (const slug of MAIN) {
  const $ = await load(slug);
  const root = $('[data-elementor-type="wp-page"]');
  const pageId = root.attr("data-elementor-id");
  const bgs = await bgImages(pageId);
  const page = { seo: seoFrom($, `/${slug}/`), title: root.find("h1").first().text().trim(), intro: toRich(root.find('[data-widget_type="text-editor.default"] .elementor-widget-container').first().html()), blocks: [] };
  // Recorre los widgets/contenedores de primer nivel dentro del contenedor principal, en orden.
  const top = root.find("> .e-con > .e-con-inner > *, > .e-con > *").filter((_, e) => $(e).attr("data-element_type"));
  let pendingHeading = null;
  let first = true;
  top.each((_, el) => {
    const $el = $(el);
    const type = $el.attr("data-widget_type") || $el.attr("data-element_type");
    const id = $el.attr("data-id");
    if (type === "heading.default" && $el.find("h1").length) return;
    if (type === "text-editor.default" && first) { first = false; return; }
    if (type === "heading.default") { pendingHeading = { title: clean($el.text()) }; page.blocks.push({ type: "heading", ...pendingHeading }); return; }
    if (type === "text-editor.default") { page.blocks.push({ type: "text", text: toRich($el.find(".elementor-widget-container").html() ?? $el.html()) }); return; }
    if (type === "loop-grid.product") {
      page.blocks.push({ type: "products", products: $el.find(".e-loop-item p a").map((_, a) => slugOf($(a).attr("href"))).get() });
      return;
    }
    if (type === "container") {
      const tiles = $el.find('[data-widget_type="heading.default"] a');
      if (tiles.length) {
        page.blocks.push({
          type: "subcategories",
          items: tiles
            .map((_, a) => {
              const tile = $(a).closest('[data-widget_type="heading.default"]').parents('[data-element_type="container"]').first();
              const imgCon = tile.find('[data-element_type="container"]').first();
              return { category: slugOf($(a).attr("href")), label: clean($(a).text()), image: bgs[imgCon.attr("data-id")] ?? null };
            })
            .get(),
        });
      } else if (bgs[id]) page.blocks.push({ type: "banner", image: bgs[id] });
    }
  });
  pages[slug] = page;
}
// Ajuste medido en el original (no se deduce del HTML): en /silleria/ el título "Líneas disponibles"
// tiene 60/50/20px de padding inferior propio; en /mobiliario-nacional/ no.
pages.silleria.blocks.find((b) => b.type === "heading").spaceAfter = true;

// ---------------- Escritura ----------------
await writeFile("src/content/categories.json", JSON.stringify(categories, null, 2) + "\n");
await writeFile("src/content/products.json", JSON.stringify(products, null, 2) + "\n");
for (const [slug, page] of Object.entries(pages)) await writeFile(`src/content/pages/${slug}.json`, JSON.stringify(page, null, 2) + "\n");
const shopSeo = inv.pages.find((p) => p.path === "/tienda/").seo;
await writeFile(
  "src/content/pages/tienda.json",
  JSON.stringify({ seo: { title: shopSeo.title, description: shopSeo.description, canonical: "/tienda/", ogType: shopSeo.og["og:type"] ?? "website" }, title: "Tienda" }, null, 2) + "\n",
);
console.log({ categories: categories.length, products: products.length, pages: Object.keys(pages), notes });
