import page from "@/content/pages/aviso-de-privacidad.json";
import { buildMetadata, type PageSeo } from "@/lib/seo";
import { Section } from "@/components/Section";
import { RichText } from "@/components/RichText";
import { SeoExtras } from "@/components/SeoExtras";

export const metadata = buildMetadata(page.seo as PageSeo);

export default function AvisoDePrivacidadPage() {
  return (
    <>
      <SeoExtras seo={page.seo as PageSeo} crumbs={[{ label: "Inicio", href: "/" }, { label: page.title }]} />
      <Section title={page.title} titleAs="h1">
        {page.blocks.map((text, i) => (
          <RichText key={i} text={text} />
        ))}
      </Section>
    </>
  );
}
