import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/seo";
import { archiveCategories, archivePath, categoryChain, productsInCategory, type Category } from "@/lib/catalog";
import { Section } from "@/components/Section";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ProductGrid } from "@/components/ProductGrid";
import { ShopArchive } from "@/components/ShopArchive";
import styles from "./archive.module.css";
import { SeoExtras } from "@/components/SeoExtras";

/**
 * Archivos de categoría de WooCommerce con página propia: las 15 subcategorías de Sillería y
 * Mobiliario nacional (plantilla de Elementor) y /sin-categorizar/ (plantilla por defecto).
 * Las categorías principales redirigen a sus páginas (/silleria/, …) desde next.config.ts.
 */
/** Solo las rutas generadas; cualquier otra responde 404. */
export const dynamicParams = false;
export const generateStaticParams = () => archiveCategories().map((c) => ({ path: archivePath(c).split("/").filter(Boolean).slice(1) }));

const findCategory = (path: string[]): Category | undefined => {
  const href = `/categoria-producto/${path.join("/")}/`;
  return archiveCategories().find((c) => archivePath(c) === href);
};

export async function generateMetadata({ params }: PageProps<"/categoria-producto/[...path]">) {
  const cat = findCategory((await params).path);
  return cat?.seo ? buildMetadata(cat.seo) : {};
}

export default async function CategoryArchivePage({ params }: PageProps<"/categoria-producto/[...path]">) {
  const cat = findCategory((await params).path);
  if (!cat) notFound();
  const chain = categoryChain(cat.slug);
  const crumbs = [{ label: "Inicio", href: "/" }, ...chain.slice(0, -1).map((c) => ({ label: c.name, href: archivePath(c) })), { label: cat.name }];
  const items = productsInCategory(cat.slug);

  const seo = cat.seo && <SeoExtras seo={cat.seo} crumbs={crumbs} pageType="CollectionPage" />;
  if (cat.layout === "woocommerce")
    return (
      <>
        {seo}
        <ShopArchive title={cat.name} crumbs={crumbs} products={items} />
      </>
    );

  return (
    <>
      {seo}
      <Section>
        <Breadcrumbs items={crumbs} />
        <h1 className={styles.title}>{cat.name}</h1>
        {cat.description && <p>{cat.description}</p>}
        <ProductGrid products={items} />
      </Section>
    </>
  );
}
