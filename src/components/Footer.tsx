import site from "@/content/site.json";
import { Img } from "./Img";
import { MenuGroups } from "./MenuGroups";
import { Slideshow } from "./Slideshow";
import { HubSpotForm } from "./HubSpotForm";
import styles from "./Footer.module.css";

function Socials({ className }: { className: string }) {
  return (
    <ul className={className}>
      {site.socials.map((s) => (
        <li key={s.href}>
          <a href={s.href} target="_blank" rel="nofollow" aria-label={s.label}>
            <Img src={s.icon} alt="" />
          </a>
        </li>
      ))}
    </ul>
  );
}

function Address() {
  return (
    <p className={styles.address}>
      {site.address.map((line, i) => (
        <span key={line}>
          {i > 0 && <br />}
          {line}
        </span>
      ))}
    </p>
  );
}

/** Footer global (plantilla Elementor #92): separador naranja, CTA "Trabajemos juntos", columnas y copyright. */
export function Footer() {
  const { cta } = site;
  return (
    <footer>
      <div className={styles.divider} role="presentation" />

      <section className={`container ${styles.cta}`}>
        <div className={styles.ctaHead}>
          <h2 className={styles.ctaTitle}>{cta.title}</h2>
          <p>{cta.text}</p>
        </div>
        <div className={styles.ctaBody}>
          <Slideshow images={cta.slideshow} slideMs={cta.slideDurationMs} sizes="(max-width: 1024px) 95vw, 570px" className={styles.ctaMedia} />
          <div className={styles.ctaForm}>
            <HubSpotForm fields={cta.form.fields} submit={cta.form.submit} />
          </div>
        </div>
      </section>

      {/* Desktop y tablet */}
      <div className={styles.main}>
        <div className={styles.inner}>
          <div className={styles.brand}>
            <Img src={site.logos.footer} alt="Qualcomm Mobili Italiani" className={styles.logo} />
            <Address />
          </div>
          <MenuGroups groups={site.menuGroups} variant="footer" />
          <div className={styles.follow}>
            <p className={styles.followTitle}>Síguenos</p>
            <Socials className={styles.socials} />
          </div>
        </div>
      </div>

      {/* Móvil */}
      <div className={styles.mobile}>
        <div className={styles.mobileInner}>
          <div className={styles.mobileBrand}>
            <Img src={site.logos.footer} alt="Qualcomm Mobili Italiani" className={styles.logo} />
            <Address />
          </div>
          <div className={styles.mobileFollow}>
            <p className={styles.followTitle}>Síguenos</p>
            <Socials className={styles.socials} />
          </div>
        </div>
      </div>

      <p className={`container ${styles.copyright}`}>{site.copyright}</p>
    </footer>
  );
}
