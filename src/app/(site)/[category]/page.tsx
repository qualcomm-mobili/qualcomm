import { notFound } from "next/navigation";
import mobiliarioItaliano from "@/content/pages/mobiliario-italiano.json";
import mobiliarioNacional from "@/content/pages/mobiliario-nacional.json";
import recepciones from "@/content/pages/recepciones.json";
import sofas from "@/content/pages/sofas.json";
import softSeating from "@/content/pages/soft-seating.json";
import silleria from "@/content/pages/silleria.json";
import { buildMetadata, type PageSeo } from "@/lib/seo";
import { getCategory, productsBySlugs } from "@/lib/catalog";
import { Section } from "@/components/Section";
import { RichText } from "@/components/RichText";
import { ProductGrid } from "@/components/ProductGrid";
import { CategoryTileGrid } from "@/components/CategoryTileGrid";
import { Img } from "@/components/Img";
import styles from "./category.module.css";
import { SeoExtras } from "@/components/SeoExtras";

type Block =
  | { type: "banner"; image: string }
  | { type: "heading"; title: string; spaceAfter?: boolean }
  | { type: "text"; text: string }
  | { type: "products"; products: string[] }
  | { type: "subcategories"; items: { category: string; label: string; image: string | null }[] };

type CategoryPage = { seo: PageSeo; title: string; intro: string; blocks: Block[] };

/** Páginas Elementor de las 6 categorías principales (el contenido de cada una vive en src/content/pages/). */
const PAGES: Record<string, CategoryPage> = {
  "mobiliario-italiano": mobiliarioItaliano as CategoryPage,
  "mobiliario-nacional": mobiliarioNacional as CategoryPage,
  recepciones: recepciones as CategoryPage,
  sofas: sofas as CategoryPage,
  "soft-seating": softSeating as CategoryPage,
  silleria: silleria as CategoryPage,
};

/** Solo las rutas generadas; cualquier otra responde 404. */
export const dynamicParams = false;
export const generateStaticParams = () => Object.keys(PAGES).map((category) => ({ category }));

export async function generateMetadata({ params }: PageProps<"/[category]">) {
  const page = PAGES[(await params).category];
  return page ? buildMetadata(page.seo) : {};
}

export default async function CategoryLandingPage({ params }: PageProps<"/[category]">) {
  const page = PAGES[(await params).category];
  if (!page) notFound();
  return (
    <>
      <SeoExtras seo={page.seo} crumbs={[{ label: "Inicio", href: "/" }, { label: page.title }]} />
      <Section title={page.title} titleAs="h1">
        <RichText text={page.intro} />
        {page.blocks.map((block, i) => {
          const isLast = i === page.blocks.length - 1;
          switch (block.type) {
            case "banner":
              return (
                <div key={i} className={styles.banner}>
                  <Img src={block.image} fill sizes="(max-width: 1024px) 95vw, 1140px" />
                </div>
              );
            case "heading":
              return (
                <h2 key={i} className={`${styles.heading} ${block.spaceAfter ? styles.headingSpace : ""}`}>
                  {block.title}
                </h2>
              );
            case "text":
              return <RichText key={i} text={block.text} />;
            case "products":
              return <ProductGrid key={i} products={productsBySlugs(block.products)} spaceAfter={!isLast} />;
            case "subcategories":
              return (
                <CategoryTileGrid
                  key={i}
                  items={block.items.map((it) => ({
                    label: it.label,
                    href: getCategory(it.category)?.href ?? "#",
                    image: it.image ?? "",
                  }))}
                />
              );
          }
        })}
      </Section>
    </>
  );
}
