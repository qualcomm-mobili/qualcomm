import page from "@/content/pages/qualcomm.json";
import { buildMetadata, type PageSeo } from "@/lib/seo";
import { Section } from "@/components/Section";
import { RichText } from "@/components/RichText";
import { Img } from "@/components/Img";
import styles from "./qualcomm.module.css";
import { SeoExtras } from "@/components/SeoExtras";

export const metadata = buildMetadata(page.seo as PageSeo);

export default function QualcommPage() {
  const [img1, img2, img3, img4] = page.images;
  const tile = (src: string, className: string) => (
    <div className={`${styles.tile} ${className}`}>
      <Img src={src} fill sizes="(max-width: 767px) 92vw, (max-width: 1024px) 57vw, 658px" />
    </div>
  );
  return (
    <>
      <SeoExtras seo={page.seo as PageSeo} crumbs={[{ label: "Inicio", href: "/" }, { label: page.title }]} />
      <Section title={page.title} titleAs="h1" titleClassName={styles.title}>
        {page.intro.map((t) => (
          <RichText key={t} text={t} />
        ))}
        <div className={styles.grid}>
          {tile(img1, styles.a)}
          {tile(img2, styles.b)}
          {tile(img3, styles.c)}
          <div className={styles.text}>
            <Img src={page.isotype} alt="" className={styles.isotype} />
            <p className={styles.quote}>{page.quote}</p>
            {page.body.map((t) => (
              <RichText key={t} text={t} />
            ))}
          </div>
          {tile(img4, styles.d)}
        </div>
      </Section>
    </>
  );
}
