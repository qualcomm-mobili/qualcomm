import site from "@/content/site.json";
import media from "@/content/media.json";
import type { PageSeo } from "./seo";

const sizes: Record<string, number[]> = media;
const abs = (path: string) => new URL(path, site.url).toString();
const ORG_ID = `${site.url}/#organization`;
const WEBSITE_ID = `${site.url}/#website`;

export type Crumb = { label: string; href?: string };
type Seo = PageSeo & { published?: string; modified?: string };

/** Negocio (equivale al "Organization" de Rank Math, con dirección y redes del sitio). */
function organization() {
  return {
    "@type": ["Organization", "LocalBusiness"],
    "@id": ORG_ID,
    name: site.name,
    alternateName: site.titleSuffix,
    url: `${site.url}/`,
    logo: { "@type": "ImageObject", url: abs(site.logos.header) },
    image: abs(site.logos.header),
    telephone: site.phone,
    email: site.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.postalAddress.street,
      addressLocality: site.postalAddress.locality,
      addressRegion: site.postalAddress.region,
      postalCode: site.postalAddress.postalCode,
      addressCountry: site.postalAddress.country,
    },
    sameAs: site.socials.map((s) => s.href),
  };
}

function website() {
  return { "@type": "WebSite", "@id": WEBSITE_ID, url: `${site.url}/`, name: site.name, publisher: { "@id": ORG_ID }, inLanguage: "es" };
}

function breadcrumbList(id: string, crumbs: Crumb[], currentUrl: string) {
  return {
    "@type": "BreadcrumbList",
    "@id": id,
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      item: c.href ? abs(c.href) : currentUrl,
    })),
  };
}

const imageObject = (src: string) => {
  const d = sizes[src];
  return { "@type": "ImageObject", url: abs(src), ...(d ? { width: d[0], height: d[1] } : {}) };
};

/**
 * Grafo JSON-LD de una página: negocio + sitio + página (WebPage / CollectionPage / ItemPage)
 * + BreadcrumbList y, en fichas, Product. Fechas de WordPress cuando existen.
 */
export function pageGraph({
  seo,
  pageType = "WebPage",
  crumbs,
  product,
}: {
  seo: Seo;
  pageType?: "WebPage" | "CollectionPage" | "ItemPage";
  crumbs: Crumb[];
  product?: { name: string; description: string; category?: string; images: string[] };
}) {
  const url = abs(seo.canonical);
  const pageId = `${url}#webpage`;
  const crumbId = `${url}#breadcrumb`;
  const primaryImage = seo.ogImage ?? product?.images[0];
  const graph: Record<string, unknown>[] = [
    organization(),
    website(),
    {
      "@type": pageType,
      "@id": pageId,
      url,
      name: seo.title,
      ...(seo.description ? { description: seo.description } : {}),
      ...(seo.published ? { datePublished: seo.published } : {}),
      ...(seo.modified ? { dateModified: seo.modified } : {}),
      isPartOf: { "@id": WEBSITE_ID },
      about: { "@id": ORG_ID },
      ...(primaryImage ? { primaryImageOfPage: imageObject(primaryImage) } : {}),
      breadcrumb: { "@id": crumbId },
      inLanguage: "es",
    },
    breadcrumbList(crumbId, crumbs, url),
  ];
  if (product) {
    graph.push({
      "@type": "Product",
      "@id": `${url}#product`,
      name: product.name,
      ...(product.description ? { description: product.description } : {}),
      ...(product.category ? { category: product.category } : {}),
      brand: { "@id": ORG_ID },
      image: product.images.map(imageObject),
      url,
      mainEntityOfPage: { "@id": pageId },
    });
  }
  return { "@context": "https://schema.org", "@graph": graph };
}
