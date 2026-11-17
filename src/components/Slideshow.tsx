"use client";

import { useEffect, useState } from "react";
import { Img } from "./Img";
import styles from "./Slideshow.module.css";

type Props = {
  images: string[];
  /** Tiempo que cada imagen permanece visible (Elementor: slide_duration). */
  slideMs: number;
  /** Zoom lento hacia dentro mientras la imagen está activa ("Ken Burns" de Elementor). */
  kenBurns?: boolean;
  sizes: string;
  className?: string;
  priority?: boolean;
};

/** Fondo tipo "background slideshow" de Elementor: fundido de 500ms entre imágenes, en bucle. */
export function Slideshow({ images, slideMs, kenBurns, sizes, className, priority }: Props) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (images.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setActive((i) => (i + 1) % images.length), slideMs);
    return () => clearInterval(id);
  }, [images.length, slideMs]);

  return (
    <div className={`${styles.slideshow} ${kenBurns ? styles.kenBurns : ""} ${className ?? ""}`}>
      {images.map((src, i) => (
        <div
          key={src}
          className={`${styles.slide} ${i === active ? styles.active : ""}`}
          style={{ "--slide-ms": `${slideMs}ms` } as React.CSSProperties}
        >
          <Img src={src} fill sizes={sizes} className={styles.img} preload={priority && i === 0} />
        </div>
      ))}
    </div>
  );
}
