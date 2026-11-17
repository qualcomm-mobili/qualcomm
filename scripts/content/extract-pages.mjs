// Fase 3 — Extrae del HTML guardado (.cache/source/html) el contenido largo de las páginas internas
// y lo escribe como datos en src/content/pages/. Las negritas (<strong>/<b>) se guardan como **texto**.
// Uso: node scripts/content/extract-pages.mjs
// Solo genera los archivos indicados abajo; el resto de páginas se escribió a mano.
import { readFile, writeFile } from "node:fs/promises";
import * as cheerio from "cheerio";

const inv = JSON.parse(await readFile("data/inventory.json", "utf8"));
const load = async (slug) => cheerio.load(await readFile(`.cache/source/html/${slug}.html`, "utf8"));
const local = (u) => u.replace("https://qualcomm.com.mx", "");
const toRich = (html) =>
  html
    .replace(/<\/?(strong|b)>/g, "**")
    .replace(/\*\*\s*\*\*/g, " ")
    .replace(/<br\s*\/?>/g, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/[ \t]+/g, " ")
    .trim();

function seoFor(path) {
  const s = inv.pages.find((p) => p.path === path).seo;
  return {
    title: s.title,
    description: s.description,
    canonical: path,
    ogType: s.og["og:type"],
    ...(s.og["og:image"] ? { ogImage: local(s.og["og:image"]) } : {}),
  };
}

// ---------- Aviso de privacidad ----------
{
  const $ = await load("aviso-de-privacidad");
  const root = $('[data-elementor-type="wp-page"]');
  const blocks = root
    .find('[data-widget_type="text-editor.default"] .elementor-widget-container')
    .map((_, e) => toRich($(e).html()))
    .get();
  const data = { seo: seoFor("/aviso-de-privacidad/"), title: root.find("h1").first().text().trim(), blocks };
  await writeFile("src/content/pages/aviso-de-privacidad.json", JSON.stringify(data, null, 2) + "\n");
  console.log("aviso:", blocks.length, "bloques");
}

// ---------- Proyectos ----------
{
  const $ = await load("proyectos");
  const root = $('[data-elementor-type="wp-page"]');
  const projects = root
    .find('[data-widget_type="image-gallery.default"]')
    .map((_, g) => ({
      title: $(g).parent().find('[data-widget_type="text-editor.default"]').text().trim(),
      images: $(g)
        .find("figure a")
        .map((_, a) => local($(a).attr("href")))
        .get(),
    }))
    .get();
  const data = {
    seo: seoFor("/proyectos/"),
    title: root.find("h1").first().text().trim(),
    intro: root.find('[data-widget_type="text-editor.default"]').first().text().trim(),
    projects,
  };
  await writeFile("src/content/pages/proyectos.json", JSON.stringify(data, null, 2) + "\n");
  console.log("proyectos:", projects.length, "proyectos,", projects.reduce((a, p) => a + p.images.length, 0), "imágenes");
}

// ---------- SEO del resto (para pegar en sus JSON) ----------
for (const p of ["/qualcomm/", "/showroom/", "/descargar-catalogo/", "/contacto/", "/catalogo/", "/gracias-por-contactarnos/"]) {
  console.log(p, JSON.stringify(seoFor(p)));
}
