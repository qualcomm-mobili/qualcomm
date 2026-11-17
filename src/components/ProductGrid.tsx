import type { Product } from "@/lib/catalog";
import { ProductCard } from "./ProductCard";
import styles from "./ProductGrid.module.css";

type Props = {
  products: Product[];
  /**
   * Espaciado del loop-grid de Elementor:
   * "catalog": categorías y archivos (aire arriba 60/50/20 y filas 60/50/40);
   * "related": "Productos que te pueden interesar" (sin aire arriba; filas 60/50/20).
   */
  variant?: "catalog" | "related";
  /** El loop-grid del original deja el mismo aire debajo, salvo cuando es el último bloque de la sección. */
  spaceAfter?: boolean;
};

/** Cuadrícula de productos: 4 columnas en desktop, 2 en tablet y móvil. */
export function ProductGrid({ products, variant = "catalog", spaceAfter = false }: Props) {
  return (
    <div className={`${styles.grid} ${styles[variant]} ${spaceAfter ? styles.spaceAfter : ""}`}>
      {products.map((p) => (
        <ProductCard key={p.slug} product={p} />
      ))}
    </div>
  );
}
