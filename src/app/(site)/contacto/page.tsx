import page from "@/content/pages/contacto.json";
import { buildMetadata, type PageSeo } from "@/lib/seo";
import { Section } from "@/components/Section";
import styles from "./contacto.module.css";
import { SeoExtras } from "@/components/SeoExtras";

export const metadata = buildMetadata(page.seo as PageSeo);

/**
 * En el original esta página solo muestra el título: su formulario propio está oculto en todos los
 * dispositivos y el contacto real es el CTA "Trabajemos juntos" del footer.
 */
export default function ContactoPage() {
  return (
    <>
      <SeoExtras seo={page.seo as PageSeo} crumbs={[{ label: "Inicio", href: "/" }, { label: page.title }]} />
      <Section title={page.title} titleAs="h1" className={styles.section} titleClassName={styles.title} />
    </>
  );
}
