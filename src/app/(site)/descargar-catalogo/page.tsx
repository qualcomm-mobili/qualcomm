import page from "@/content/pages/descargar-catalogo.json";
import { buildMetadata, type PageSeo } from "@/lib/seo";
import { Section } from "@/components/Section";
import { ElementorForm, type FormField } from "@/components/ElementorForm";
import styles from "./descargar-catalogo.module.css";
import { SeoExtras } from "@/components/SeoExtras";

export const metadata = buildMetadata(page.seo as PageSeo);

export default function DescargarCatalogoPage() {
  return (
    <>
      <SeoExtras seo={page.seo as PageSeo} crumbs={[{ label: "Inicio", href: "/" }, { label: page.title }]} />
      <Section title={page.title} titleAs="h1">
        <p>{page.intro}</p>
        <div className={styles.box}>
          <ElementorForm name={page.form.name} fields={page.form.fields as FormField[]} submit={page.form.submit} />
        </div>
      </Section>
    </>
  );
}
