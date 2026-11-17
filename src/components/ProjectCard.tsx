"use client";

import { useState } from "react";
import { Img } from "./Img";
import { Lightbox } from "./Lightbox";
import styles from "./ProjectCard.module.css";

/**
 * Proyecto de /proyectos/: se ve la primera foto; al hacer clic se abre la galería completa
 * en el visor con la apariencia del lightbox de Elementor (título del proyecto abajo).
 */
export function ProjectCard({ title, images }: { title: string; images: string[] }) {
  const [index, setIndex] = useState<number | null>(null);
  return (
    <article className={styles.card}>
      <a
        href={images[0]}
        className={styles.media}
        onClick={(e) => {
          e.preventDefault();
          setIndex(0);
        }}
      >
        <Img src={images[0]} alt={title} className={styles.image} sizes="(max-width: 1024px) 47vw, 369px" />
      </a>
      <p className={styles.title}>{title}</p>
      <Lightbox images={images.map((src) => ({ src, alt: title }))} index={index} onIndexChange={setIndex} variant="elementor" caption={title} />
    </article>
  );
}
