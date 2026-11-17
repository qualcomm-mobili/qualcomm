import Link from "next/link";
import site from "@/content/site.json";
import { Img } from "./Img";
import { MobileMenu } from "./MobileMenu";
import styles from "./Header.module.css";

type NavLink = { label: string; href: string; external?: boolean };

function NavList({ links, className }: { links: NavLink[]; className: string }) {
  return (
    <ul className={className}>
      {links.map((l) => (
        <li key={l.href}>
          {l.external ? (
            <a href={l.href} target="_blank">
              {l.label}
            </a>
          ) : (
            <Link href={l.href}>{l.label}</Link>
          )}
        </li>
      ))}
    </ul>
  );
}

/** Header global. Desktop (≥1025px): logo + dos menús. Tablet/móvil: barra fija con logo compacto y menú overlay. */
export function Header() {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.desktop}`}>
        <Link href={site.homeHref} className={styles.logo} aria-label="Qualcomm Mobili Italiani — inicio">
          <Img src={site.logos.header} alt="" preload />
        </Link>
        <nav className={styles.nav} aria-label="Principal">
          <NavList links={site.nav.primary} className={styles.primary} />
          <NavList links={site.nav.catalog} className={styles.catalog} />
        </nav>
      </div>

      <div className={`container ${styles.compact}`}>
        <Link href={site.homeHref} className={styles.logoCompact} aria-label="Qualcomm Mobili Italiani — inicio">
          <Img src={site.logos.headerCompact} alt="" />
        </Link>
        <MobileMenu icon={site.logos.menuIcon} groups={site.menuGroups} />
      </div>
    </header>
  );
}
