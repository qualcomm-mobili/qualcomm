import page from "@/content/pages/gracias-por-contactarnos.json";
import { buildMetadata, type PageSeo } from "@/lib/seo";
import { Img } from "@/components/Img";
import { Button } from "@/components/Button";
import styles from "./gracias.module.css";
import { SeoExtras } from "@/components/SeoExtras";

export const metadata = buildMetadata(page.seo as PageSeo);

/** Página "canvas" del original: sin header ni footer, contenido centrado a pantalla completa. */
export default function GraciasPage() {
  return (
    <main className={styles.page}>
      <SeoExtras seo={page.seo as PageSeo} crumbs={[{ label: "Inicio", href: "/" }, { label: "Gracias por contactarnos" }]} />
      <div className={`container ${styles.inner}`}>
        <Img src={page.logo} alt="Qualcomm Mobili Italiani" className={styles.logo} preload />
        <h2 className={styles.title}>{page.title}</h2>
        <p>{page.text}</p>
        <Button {...page.button} uppercase={false} />
      </div>
    </main>
  );
}
