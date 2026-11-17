import Link from "next/link";
import { productHref, type Product } from "@/lib/catalog";
import { Breadcrumbs, type Crumb } from "./Breadcrumbs";
import { Img } from "./Img";
import styles from "./ShopArchive.module.css";

const ORDER_OPTIONS = [
  "Orden por defecto",
  "Ordenar por popularidad",
  "Ordenar por calificación media",
  "Ordenar por las últimas",
  "Ordenar por precio: bajo a alto",
  "Ordenar por precio: alto a bajo",
];

/**
 * Plantilla por defecto de WooCommerce + tema Hello (sin Elementor): /tienda/ y /categoria-producto/sin-categorizar/.
 * El selector de orden solo se ve (no reordena).
 */
export function ShopArchive({ title, crumbs, products }: { title: string; crumbs: Crumb[]; products: Product[] }) {
  const count = products.length === 1 ? "Mostrando el único resultado" : `Mostrando todos los ${products.length} resultados`;
  return (
    <div className={styles.main}>
      <Breadcrumbs items={crumbs} variant="woocommerce" />
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.toolbar}>
        <p className={styles.count}>{count}</p>
        <form className={styles.ordering} action="#">
          <select className={styles.select} name="orderby" aria-label="Pedido de la tienda" defaultValue={ORDER_OPTIONS[0]}>
            {ORDER_OPTIONS.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </form>
      </div>
      <ul className={styles.products}>
        {products.map((p) => (
          <li key={p.slug} className={styles.product}>
            <Link href={productHref(p.slug)} className={styles.link}>
              <span className={styles.thumb}>
                {p.images[0] && <Img src={p.images[0].src} alt={p.name} fill sizes="(max-width: 768px) 48vw, 251px" />}
              </span>
              <h2 className={styles.name}>{p.name}</h2>
            </Link>
            <Link href={productHref(p.slug)} className={styles.button}>
              Leer más
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
