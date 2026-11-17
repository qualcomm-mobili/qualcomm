import { pageGraph, type Crumb } from "@/lib/structured-data";
import type { PageSeo } from "@/lib/seo";

type Props = {
  seo: PageSeo & { published?: string; modified?: string; ogUpdatedTime?: string };
  crumbs: Crumb[];
  pageType?: "WebPage" | "CollectionPage" | "ItemPage";
  product?: { name: string; description: string; category?: string; images: string[] };
};

/**
 * Lo que la Metadata API de Next no cubre y Rank Math sí publicaba:
 * - JSON-LD (negocio, sitio, página, BreadcrumbList y Product en fichas);
 * - <meta property> de fechas (article:published_time / modified_time, og:updated_time) y og:type "product".
 * React 19 mueve estos <meta> al <head>.
 */
export function SeoExtras({ seo, crumbs, pageType, product }: Props) {
  const graph = pageGraph({ seo, crumbs, pageType, product });
  // Rank Math solo publica og:updated_time si la página se modificó después de publicarse.
  const updated = seo.ogUpdatedTime ?? (seo.modified && seo.modified !== seo.published ? seo.modified : undefined);
  return (
    <>
      {seo.ogType === "product" && (
        <>
          <meta property="og:type" content="product" />
          <meta property="product:price:currency" content="MXN" />
          <meta property="product:availability" content="instock" />
        </>
      )}
      {updated && <meta property="og:updated_time" content={updated} />}
      {seo.ogType !== "product" && seo.published && <meta property="article:published_time" content={seo.published} />}
      {seo.ogType !== "product" && seo.modified && <meta property="article:modified_time" content={seo.modified} />}
      <script
        type="application/ld+json"
        // JSON propio (sin entrada de usuarios); se escapa "<" para no cerrar la etiqueta.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replace(/</g, "\\u003c") }}
      />
    </>
  );
}
