import Link from "next/link";
import styles from "./Button.module.css";

export type ButtonLink = { label: string; href: string };

/** Botón naranja de Elementor (kit global): mayúsculas, 15px, radio 2px. */
export function Button({ label, href, uppercase = true }: ButtonLink & { uppercase?: boolean }) {
  return (
    <Link href={href} className={`${styles.button} ${uppercase ? styles.uppercase : ""}`}>
      {label}
    </Link>
  );
}
