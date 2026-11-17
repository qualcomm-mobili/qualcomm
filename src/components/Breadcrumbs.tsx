import Link from "next/link";
import { Fragment } from "react";
import styles from "./Breadcrumbs.module.css";

export type Crumb = { label: string; href?: string };

/** Breadcrumb de WooCommerce: "Inicio / Categoría / … / Actual", separados por " / ". */
export function Breadcrumbs({ items, variant = "elementor" }: { items: Crumb[]; variant?: "elementor" | "woocommerce" }) {
  return (
    <nav className={`${styles.nav} ${styles[variant]}`} aria-label="Ruta de navegación">
      {items.map((c, i) => (
        <Fragment key={i}>
          {i > 0 && " / "}
          {c.href ? <Link href={c.href}>{c.label}</Link> : c.label}
        </Fragment>
      ))}
    </nav>
  );
}
