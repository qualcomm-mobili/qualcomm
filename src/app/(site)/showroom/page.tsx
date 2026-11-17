import page from "@/content/pages/showroom.json";
import { buildMetadata, type PageSeo } from "@/lib/seo";
import { Section } from "@/components/Section";
import styles from "./showroom.module.css";
import { SeoExtras } from "@/components/SeoExtras";

export const metadata = buildMetadata(page.seo as PageSeo);

export default function ShowroomPage() {
  return (
    <>
      <SeoExtras seo={page.seo as PageSeo} crumbs={[{ label: "Inicio", href: "/" }, { label: page.title }]} />
      <Section title={page.title} titleAs="h1" spacing="top" className={styles.intro} titleClassName={styles.title}>
        <p>{page.intro}</p>
        <p className={styles.address}>
          {page.address.map((line, i) => (
            <span key={line}>
              {i > 0 && <br />}
              <strong>{line}</strong>
            </span>
          ))}
        </p>
      </Section>
      {/* Mismo iframe de Google Maps que el original. */}
      <section className={styles.mapSection}>
        <iframe className={styles.map} src={page.map.src} title={page.map.title} loading="lazy" />
      </section>
    </>
  );
}
