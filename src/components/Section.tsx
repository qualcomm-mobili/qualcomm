import type { ReactNode } from "react";
import styles from "./Section.module.css";

type Props = {
  title?: string;
  /** h1 en páginas internas, h2 en secciones de la Home. */
  titleAs?: "h1" | "h2";
  children?: ReactNode;
  /** "gray": fondo #F7F7F7 y margen inferior igual al padding (patrón del original). */
  tone?: "plain" | "gray";
  /** "top": solo padding superior (la sección siguiente aporta el espacio). */
  spacing?: "both" | "top";
  className?: string;
  titleClassName?: string;
};

/** Sección estándar: padding vertical 150/100/80px, contenedor 1140px y título opcional. */
export function Section({ title, titleAs: Title = "h2", children, tone = "plain", spacing = "both", className, titleClassName }: Props) {
  return (
    <section className={`${styles.section} ${styles[tone]} ${styles[spacing]} ${className ?? ""}`}>
      <div className={`container ${styles.inner}`}>
        {title && <Title className={`${styles.title} ${titleClassName ?? ""}`}>{title}</Title>}
        {children}
      </div>
    </section>
  );
}
