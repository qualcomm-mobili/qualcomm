import page from "@/content/pages/proyectos.json";
import { buildMetadata, type PageSeo } from "@/lib/seo";
import { Section } from "@/components/Section";
import { ProjectCard } from "@/components/ProjectCard";
import styles from "./proyectos.module.css";
import { SeoExtras } from "@/components/SeoExtras";

export const metadata = buildMetadata(page.seo as PageSeo);

/** Cada proyecto es una galería: se ve la primera foto y el resto se abre en el visor (Lightbox). */
export default function ProyectosPage() {
  return (
    <>
      <SeoExtras seo={page.seo as PageSeo} crumbs={[{ label: "Inicio", href: "/" }, { label: page.title }]} />
      <Section title={page.title} titleAs="h1">
        <p>{page.intro}</p>
        <div className={styles.grid}>
          {page.projects.map((p) => (
            <ProjectCard key={p.title} title={p.title} images={p.images} />
          ))}
        </div>
      </Section>
    </>
  );
}
