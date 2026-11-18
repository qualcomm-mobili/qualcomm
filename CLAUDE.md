# Qualcomm — réplica de qualcomm.com.mx en Next.js

Réplica de https://qualcomm.com.mx/ (WordPress + Elementor + WooCommerce usado solo como catálogo,
sin precios ni compra) en Next.js (App Router, TypeScript) para publicar en Vercel.

Objetivo: que se vea IGUAL (desktop, tablet, móvil) con TODO el contenido, con código limpio y simple.
Nada de "div soup" de Elementor: pocos componentes propios y reutilizables.

## Reglas

- NUNCA hacer `git commit` ni `git push`, ni tocar el remoto.
- Trabajar por fases. Al terminar cada una, detenerse y entregar un reporte corto
  (qué se hizo, qué falta, dudas). No avanzar sin aprobación.
- Si algo del original no es claro o se ve roto, no inventarlo: anotarlo (ver `docs/inventario/notas.md`).
- El contenido vive en el repo como datos (JSON/MDX). Sin CMS ni WordPress.
- Por ahora nada tiene que funcionar: formularios, carrito, búsqueda y analítica solo se ven.
- Mismas rutas exactas que el original, con `trailingSlash: true`.
- Conservar el SEO de cada página (title, description, Open Graph).
- Usar `next/image` para imágenes.
- Medios (imágenes, SVG, PDFs, fuentes) descargados al repo. Si el peso total pasa de ~300 MB, detenerse y proponer alternativa.

## Fases

1. Setup + inventario de TODAS las URLs, medios y PDFs con su estado → reporte y STOP.
2. Design system + layout global + Home idéntica → STOP para revisión visual.
3. Páginas internas.
4. Catálogo: categorías, /tienda/ y las ~180 fichas generadas desde datos.
5. Verificación: script que confirme que cada URL del inventario existe localmente + capturas
   lado a lado (original vs. nuevo) en 3 anchos + reporte de diferencias.

## Fuera de alcance (solo listar)

/nueva/*, /__portada/, /design-system/, /carrito/, /finalizar-compra/, /mi-cuenta/

## Componentes base previstos

Header (menú overlay en móvil), Footer, Hero, Section, CategoryCard, ProductGrid,
ProductGallery, Form (visual).

## Rediseño (identidad nueva)

- Tokens en `src/styles/tokens.css` (muestra en `/tokens/`, noindex). Fuentes locales en `src/fonts/` vía `src/styles/fonts.ts`.
- Temas anidables: `.qc-inverse` (sección oscura) remapea los tokens semánticos y de componente; `.qc-light`
  los restablece a claro (p. ej. una superficie clara dentro de una sección oscura).
- Los componentes usan solo tokens semánticos (`--color-*`, `--button-*`, `--card-bg`…), nunca primitivos (`--qc-*`)
  directos. Los primitivos solo existen dentro de `tokens.css`.
- Los componentes nuevos se construyen en `src/components/ui/` usando solo `tokens.css`.
- Los componentes y estilos viejos no se modifican; se borran cuando la página que los usa se reemplace completa por su versión nueva.
- No mezclar sistemas en una misma página.
- Por ahora no tocar acumin-pro ni `globals.css`.
