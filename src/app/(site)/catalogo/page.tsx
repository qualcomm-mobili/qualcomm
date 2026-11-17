import page from "@/content/pages/catalogo.json";
import { buildMetadata, type PageSeo } from "@/lib/seo";
import { Section } from "@/components/Section";
import { CategoryTileGrid } from "@/components/CategoryTileGrid";
import { SeoExtras } from "@/components/SeoExtras";

export const metadata = buildMetadata(page.seo as PageSeo);

export default function CatalogoPage() {
  return (
    <>
      <SeoExtras seo={page.seo as PageSeo} crumbs={[{ label: "Inicio", href: "/" }, { label: page.title }]} />
      <Section title={page.title} titleAs="h1">
        <p>{page.intro}</p>
        <CategoryTileGrid items={page.categories} />
      </Section>
    </>
  );
}
