import { CategoryTile } from "./CategoryTile";
import styles from "./CategoryTileGrid.module.css";

type Tile = { label: string; href: string; image: string };

/** Cuadrícula de mosaicos de categoría (4/2/2 columnas) — /catalogo/, /silleria/, /mobiliario-nacional/. */
export function CategoryTileGrid({ items }: { items: Tile[] }) {
  return (
    <div className={styles.grid}>
      {items.map((t) => (
        <CategoryTile key={t.href} {...t} />
      ))}
    </div>
  );
}
