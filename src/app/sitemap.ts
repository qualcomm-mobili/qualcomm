import type { MetadataRoute } from "next";
import site from "@/content/site.json";
import { archiveCategories, archivePath, products } from "@/lib/catalog";
import home from "@/content/pages/home.json";
import qualcomm from "@/content/pages/qualcomm.json";
import proyectos from "@/content/pages/proyectos.json";
import showroom from "@/content/pages/showroom.json";
import descargarCatalogo from "@/content/pages/descargar-catalogo.json";
import contacto from "@/content/pages/contacto.json";
import catalogo from "@/content/pages/catalogo.json";
import avisoDePrivacidad from "@/content/pages/aviso-de-privacidad.json";
import gracias from "@/content/pages/gracias-por-contactarnos.json";
import tienda from "@/content/pages/tienda.json";
import mobiliarioItaliano from "@/content/pages/mobiliario-italiano.json";
import mobiliarioNacional from "@/content/pages/mobiliario-nacional.json";
import recepciones from "@/content/pages/recepciones.json";
import sofas from "@/content/pages/sofas.json";
import softSeating from "@/content/pages/soft-seating.json";
import silleria from "@/content/pages/silleria.json";

type Seo = { canonical: string; modified?: string };

/**
 * sitemap.xml con las URLs reales del sitio nuevo: páginas, categorías, archivos de subcategoría y fichas
 * (con sus imágenes). Sin las imágenes /nuevo/… rotas del sitemap de Rank Math ni las páginas fuera de alcance.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    home,
    qualcomm,
    proyectos,
    showroom,
    descargarCatalogo,
    contacto,
    catalogo,
    avisoDePrivacidad,
    gracias,
    tienda,
    mobiliarioItaliano,
    mobiliarioNacional,
    recepciones,
    sofas,
    softSeating,
    silleria,
  ].map((p) => p.seo as Seo);
  const entry = (seo: Seo, images?: string[]): MetadataRoute.Sitemap[number] => ({
    url: new URL(seo.canonical, site.url).toString(),
    ...(seo.modified ? { lastModified: seo.modified } : {}),
    ...(images?.length ? { images: images.map((src) => new URL(src, site.url).toString()) } : {}),
  });
  return [
    ...pages.map((seo) => entry(seo)),
    ...archiveCategories().map((c) => entry({ canonical: archivePath(c) })),
    ...products.map((p) => entry(p.seo, p.images.map((i) => i.src))),
  ];
}
