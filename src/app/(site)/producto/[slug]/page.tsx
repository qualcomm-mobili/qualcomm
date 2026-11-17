import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/seo";
import { archivePath, categoryChain, getProduct, products, relatedProducts } from "@/lib/catalog";
import { Section } from "@/components/Section";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { RichText } from "@/components/RichText";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductGrid } from "@/components/ProductGrid";
import styles from "./product.module.css";
import { SeoExtras } from "@/components/SeoExtras";

/** Solo las rutas generadas; cualquier otra responde 404. */
export const dynamicParams = false;
export const generateStaticParams = () => products.map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: PageProps<"/producto/[slug]">) {
  const product = getProduct((await params).slug);
  return product ? buildMetadata(product.seo) : {};
}

/** Ficha de producto (plantilla Elementor #661). */
export default async function ProductPage({ params }: PageProps<"/producto/[slug]">) {
  const product = getProduct((await params).slug);
  if (!product) notFound();
  const crumbs = [
    { label: "Inicio", href: "/" },
    ...categoryChain(product.primaryCategory).map((c) => ({ label: c.name, href: archivePath(c) })),
    { label: product.name },
  ];

  const main = categoryChain(product.primaryCategory)[0];
  return (
    <>
      <SeoExtras
        seo={product.seo}
        crumbs={crumbs}
        pageType="ItemPage"
        product={{
          name: product.name,
          description: product.shortDescription.replace(/\*\*/g, ""),
          category: main?.name,
          images: product.images.map((i) => i.src),
        }}
      />
      <section className={`container ${styles.hero}`}>
        <div className={styles.media}>
          <ProductGallery images={product.images} name={product.name} />
        </div>
        <div className={styles.info}>
          <Breadcrumbs items={crumbs} />
          <h1 className={styles.title}>{product.name}</h1>
          {product.shortDescription && <RichText text={product.shortDescription} />}
          <div className={styles.actions}>
            {/* En el original "¡Me interesa!" enlaza a "#" y "Regresar" no tiene enlace. */}
            <a href="#" className={`${styles.button} ${styles.primary}`}>
              ¡Me interesa!
            </a>
            <span className={`${styles.button} ${styles.secondary}`} role="button" aria-disabled="true">
              Regresar
            </span>
          </div>
        </div>
      </section>

      <Section title="Productos que te pueden interesar" tone="gray" titleClassName={styles.relatedTitle}>
        <ProductGrid products={relatedProducts(product)} variant="related" />
      </Section>
    </>
  );
}
