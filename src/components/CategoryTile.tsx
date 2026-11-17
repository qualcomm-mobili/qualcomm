import Link from "next/link";
import { Img } from "./Img";
import styles from "./CategoryTile.module.css";

type Props = { label: string; href: string; image: string; sizes?: string };

/** Mosaico de categoría: imagen de fondo recortada y título enlazado debajo (como en /catalogo/). */
export function CategoryTile({ label, href, image, sizes = "(max-width: 1024px) 47vw, 273px" }: Props) {
  return (
    <div className={styles.tile}>
      <div className={styles.media}>
        <Img src={image} fill sizes={sizes} />
      </div>
      <p className={styles.label}>
        <Link href={href}>{label}</Link>
      </p>
    </div>
  );
}
