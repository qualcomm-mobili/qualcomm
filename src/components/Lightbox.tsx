"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Img } from "./Img";
import styles from "./Lightbox.module.css";

export type LightboxImage = { src: string; alt?: string };

type Props = {
  images: LightboxImage[];
  /** Índice abierto; null = cerrado. */
  index: number | null;
  onIndexChange: (index: number | null) => void;
  /**
   * Apariencia del original:
   * "elementor": lightbox de Elementor (Proyectos): fondo translúcido, contador arriba a la izquierda,
   *   íconos pantalla completa / zoom / compartir / cerrar y título abajo.
   * "photoswipe": PhotoSwipe de WooCommerce (fichas): fondo negro, barra superior con contador,
   *   zoom (si la imagen es mayor que la pantalla), pantalla completa y cerrar.
   */
  variant: "elementor" | "photoswipe";
  caption?: string;
};

const SWIPE_PX = 50;

/**
 * Visor de imágenes a pantalla completa. Navegación: flechas en pantalla, ←/→ del teclado y deslizar
 * en táctil (en bucle, como el original). Cierre: botón ×, tecla Esc o clic fuera de la imagen.
 */
export function Lightbox({ images, index, onIndexChange, variant, caption }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [zoomed, setZoomed] = useState(false);
  const [drag, setDrag] = useState(0);
  const start = useRef<{ x: number; y: number } | null>(null);
  const open = index !== null;
  const count = images.length;

  const close = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    setZoomed(false);
    onIndexChange(null);
  }, [onIndexChange]);
  const go = useCallback(
    (delta: number) => {
      if (index === null) return;
      setZoomed(false);
      onIndexChange((index + delta + count) % count);
    },
    [index, count, onIndexChange],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    rootRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, close, go]);

  if (!open) return null;

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else rootRef.current?.requestFullscreen?.().catch(() => {});
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (zoomed) return;
    start.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (start.current) setDrag(e.clientX - start.current.x);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (!start.current) return;
    const dx = e.clientX - start.current.x;
    start.current = null;
    setDrag(0);
    if (Math.abs(dx) > SWIPE_PX && count > 1) go(dx < 0 ? 1 : -1);
  };

  const isElementor = variant === "elementor";
  return (
    <div
      ref={rootRef}
      className={`${styles.root} ${styles[variant]}`}
      role="dialog"
      aria-modal="true"
      aria-label={caption ?? "Galería de imágenes"}
      tabIndex={-1}
    >
      <div className={styles.toolbar}>
        <span className={styles.counter}>
          {index + 1} / {count}
        </span>
        <div className={styles.actions}>
          {!isElementor && (
            <button type="button" className={`${styles.btn} ${styles.zoomOnlyMobile}`} aria-label="Acercar / alejar" onClick={() => setZoomed((z) => !z)}>
              <Icon name={zoomed ? "zoomOut" : "zoomIn"} />
            </button>
          )}
          <button type="button" className={styles.btn} aria-label="Pantalla completa" onClick={toggleFullscreen}>
            <Icon name="fullscreen" />
          </button>
          {isElementor && (
            <>
              <button type="button" className={styles.btn} aria-label="Acercar / alejar" onClick={() => setZoomed((z) => !z)}>
                <Icon name={zoomed ? "zoomOut" : "zoomIn"} />
              </button>
              {/* Compartir: en el original abre un menú de redes; por ahora solo se ve. */}
              <button type="button" className={styles.btn} aria-label="Compartir">
                <Icon name="share" />
              </button>
            </>
          )}
          <button type="button" className={styles.btn} aria-label="Cerrar" onClick={close}>
            <Icon name="close" />
          </button>
        </div>
      </div>

      <div
        className={styles.stage}
        onClick={(e) => e.target === e.currentTarget && close()}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          start.current = null;
          setDrag(0);
        }}
      >
        <div className={styles.track} style={{ transform: `translateX(calc(${-index * 100}% + ${drag}px))`, transition: drag ? "none" : undefined }}>
          {images.map((im, i) => (
            <div key={im.src + i} className={styles.slide} onClick={(e) => e.target === e.currentTarget && close()}>
              {Math.abs(i - index) <= 1 || (index === 0 && i === count - 1) || (index === count - 1 && i === 0) ? (
                <div className={`${styles.frame} ${i === index && zoomed ? styles.zoomed : ""}`} onDoubleClick={() => setZoomed((z) => !z)}>
                  <Img src={im.src} alt={im.alt ?? ""} sizes="100vw" className={styles.image} draggable={false} />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      {count > 1 && (
        <>
          <button type="button" className={`${styles.arrow} ${styles.prev}`} aria-label="Anterior" onClick={() => go(-1)}>
            <Icon name={isElementor ? "chevronLeft" : "arrowLeft"} />
          </button>
          <button type="button" className={`${styles.arrow} ${styles.next}`} aria-label="Siguiente" onClick={() => go(1)}>
            <Icon name={isElementor ? "chevronRight" : "arrowRight"} />
          </button>
        </>
      )}

      <div className={styles.caption}>{isElementor ? caption : null}</div>
    </div>
  );
}

const PATHS: Record<string, string> = {
  close: "M5 5l14 14M19 5L5 19",
  fullscreen: "M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5",
  zoomIn: "M10.5 4a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13zM15.5 15.5L20 20M10.5 7.5v6M7.5 10.5h6",
  zoomOut: "M10.5 4a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13zM15.5 15.5L20 20M7.5 10.5h6",
  share: "M14 5l6 5.5-6 5.5v-3.2c-5 0-8 1.4-10 4.7.7-5.2 3.6-9 10-9.6z",
  chevronLeft: "M15 4l-8 8 8 8",
  chevronRight: "M9 4l8 8-8 8",
  arrowLeft: "M20 12H5M11 6l-6 6 6 6",
  arrowRight: "M4 12h15M13 6l6 6-6 6",
};

function Icon({ name }: { name: keyof typeof PATHS }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.icon}>
      <path d={PATHS[name]} />
    </svg>
  );
}
