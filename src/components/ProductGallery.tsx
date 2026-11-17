"use client";

import { useRef, useState } from "react";
import media from "@/content/media.json";
import { Img } from "./Img";
import { Lightbox, type LightboxImage } from "./Lightbox";
import styles from "./ProductGallery.module.css";

const sizes: Record<string, number[]> = media;
const SWIPE_PX = 40;

/**
 * Galería de la ficha (WooCommerce: flexslider + zoom + PhotoSwipe):
 * - imagen principal que se desliza (500 ms) y ajusta su alto a la proporción de cada foto;
 * - miniaturas en 4 columnas (la activa opaca, el resto al 50%);
 * - zoom al pasar el cursor sobre la imagen principal (desktop);
 * - la lupa o un clic en la imagen abren el visor a pantalla completa (Lightbox "photoswipe").
 */
export function ProductGallery({ images, name }: { images: LightboxImage[]; name: string }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [zoom, setZoom] = useState<{ x: number; y: number; scale: number } | null>(null);
  const touch = useRef<number | null>(null);
  const count = images.length;
  const ratio = (src: string) => {
    const d = sizes[src];
    return d ? d[1] / d[0] : 1;
  };

  // Como jQuery Zoom: solo si la foto original es más grande que como se muestra.
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const natural = sizes[images[active].src]?.[0] ?? 0;
    const scale = natural / r.width;
    if (scale <= 1) return setZoom(null);
    setZoom({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height, scale });
  };

  return (
    <div className={styles.gallery}>
      <div className={styles.viewport} style={{ aspectRatio: `1 / ${ratio(images[active].src)}` }}>
        <button type="button" className={styles.trigger} aria-label="Ver galería de imágenes en pantalla completa" onClick={() => setLightbox(active)} />
        <div className={styles.track} style={{ transform: `translateX(${-active * 100}%)` }}>
          {images.map((im, i) => (
            <div
              key={im.src + i}
              className={styles.slide}
              onMouseMove={i === active ? onMove : undefined}
              onMouseLeave={() => setZoom(null)}
              onClick={() => setLightbox(i)}
              onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
              onTouchEnd={(e) => {
                if (touch.current === null) return;
                const dx = e.changedTouches[0].clientX - touch.current;
                touch.current = null;
                if (dx < -SWIPE_PX && active < count - 1) setActive(active + 1);
                if (dx > SWIPE_PX && active > 0) setActive(active - 1);
              }}
            >
              <Img src={im.src} alt={im.alt || name} sizes="(max-width: 767px) 92vw, (max-width: 1024px) 47vw, 560px" className={styles.image} preload={i === 0} />
              {i === active && zoom && (
                <span
                  className={styles.zoom}
                  aria-hidden="true"
                  style={{
                    backgroundImage: `url("${im.src}")`,
                    backgroundSize: `${zoom.scale * 100}%`,
                    backgroundPosition: `${zoom.x * 100}% ${zoom.y * 100}%`,
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {count > 1 && (
        <ol className={styles.thumbs}>
          {images.map((im, i) => (
            <li key={im.src + i}>
              <button type="button" className={`${styles.thumb} ${i === active ? styles.thumbActive : ""}`} onClick={() => setActive(i)} aria-label={`Imagen ${i + 1}`}>
                <Img src={im.src} alt="" fill sizes="(max-width: 1024px) 23vw, 134px" />
              </button>
            </li>
          ))}
        </ol>
      )}

      <Lightbox images={images} index={lightbox} onIndexChange={setLightbox} variant="photoswipe" />
    </div>
  );
}
