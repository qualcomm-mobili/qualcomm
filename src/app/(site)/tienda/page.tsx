import page from "@/content/pages/tienda.json";
import { buildMetadata, type PageSeo } from "@/lib/seo";
import { products } from "@/lib/catalog";
import { ShopArchive } from "@/components/ShopArchive";
import { SeoExtras } from "@/components/SeoExtras";

export const metadata = buildMetadata(page.seo as PageSeo);

/** /tienda/: los 207 productos en una sola página, en el "Orden por defecto" de WooCommerce. */
export default function TiendaPage() {
  const crumbs = [{ label: "Inicio", href: "/" }, { label: page.title }];
  return (
    <>
      <SeoExtras seo={page.seo as PageSeo} crumbs={crumbs} pageType="CollectionPage" />
      <ShopArchive title={page.title} crumbs={crumbs} products={products} />
    </>
  );
}
