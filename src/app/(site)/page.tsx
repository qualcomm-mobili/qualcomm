import home from "@/content/pages/home.json";
import { buildMetadata, type PageSeo } from "@/lib/seo";
import { Hero } from "@/components/Hero";
import { Section } from "@/components/Section";
import { Button } from "@/components/Button";
import { CategoryCard } from "@/components/CategoryCard";
import { Img } from "@/components/Img";
import styles from "./home.module.css";
import { SeoExtras } from "@/components/SeoExtras";

export const metadata = buildMetadata(home.seo as PageSeo);

function Feature({ title, text }: { title: string; text: string }) {
  return (
    <div className={styles.feature}>
      <p>
        <strong>{title}</strong>
      </p>
      <p>{text}</p>
    </div>
  );
}

export default function HomePage() {
  const { hero, welcome, categories, reasons } = home;
  return (
    <>
      <SeoExtras seo={home.seo as PageSeo} crumbs={[{ label: "Inicio" }]} />
      <Hero {...hero} />

      <Section title={welcome.title} spacing="top">
        <p>
          <strong>{welcome.lead}</strong>
        </p>
        <p>{welcome.text}</p>
        <div className={styles.welcomeGrid}>
          {welcome.images.map((img) => (
            <div key={img.src} className={`${styles.welcomeImage} ${img.position === "left" ? styles.left : ""}`}>
              <Img src={img.src} fill sizes="(max-width: 1167px) 50vw, 466px" />
            </div>
          ))}
          <div className={styles.welcomeText}>
            <p>
              <strong>{welcome.aside.lead}</strong>
            </p>
            <p>{welcome.aside.text}</p>
            <Button {...welcome.aside.button} />
          </div>
        </div>
      </Section>

      <Section title={categories.title}>
        <div className={styles.cards}>
          {categories.items.map((item) => (
            <CategoryCard key={item.title} {...item} />
          ))}
        </div>
      </Section>

      <Section title={reasons.title} tone="gray">
        <div className={styles.reasons}>
          {reasons.columns.map((col, i) => (
            <div key={i} className={`${styles.reasonCol} ${styles[col.layout]}`}>
              {col.layout === "image-then-text" && col.image && <Img src={col.image} className={styles.reasonImage} sizes="(max-width: 767px) 60vw, 367px" />}
              {col.items.map((item) => (
                <Feature key={item.title} {...item} />
              ))}
              {col.layout === "text-then-image" && col.image && <Img src={col.image} className={styles.reasonImage} sizes="(max-width: 767px) 60vw, 367px" />}
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
