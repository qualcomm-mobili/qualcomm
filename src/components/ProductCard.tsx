import Link from "next/link";
import { productHref, type Product } from "@/lib/catalog";
import { Img } from "./Img";
import styles from "./ProductCard.module.css";

/** Tarjeta de producto (loop item #675 de Elementor): imagen recortada enlazada y nombre debajo. */
export function ProductCard({ product }: { product: Product }) {
  const href = productHref(product.slug);
  const image = product.images[0];
  return (
    <div className={styles.card}>
      <Link href={href} className={styles.media} aria-label={product.name}>
        {image && <Img src={image.src} alt={image.alt || product.name} fill sizes="(max-width: 1024px) 47vw, 273px" />}
      </Link>
      <p className={styles.title}>
        <Link href={href}>{product.name}</Link>
      </p>
    </div>
  );
}
