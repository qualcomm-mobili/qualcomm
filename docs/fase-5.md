# Fase 5 — Verificación y preparación para deploy

Reportes detallados: `docs/verificacion/urls.md`, `docs/verificacion/enlaces.md`, `docs/verificacion/visual.md`,
`docs/verificacion/lighthouse.md`.
Volver a correr todo (con `pnpm build && pnpm start` en otra terminal):
`pnpm verify:urls`, `pnpm verify:links`, `pnpm verify:visual`.

## 0. Productos relacionados (pendiente de la Fase 4)

`relatedProducts()` en `src/lib/catalog.ts`. Funciona igual en cada build: primero los de la misma subcategoría,
y si faltan, los de la misma categoría principal, sin el producto actual. Máximo 8, como el original. Dentro de cada
grupo van en el orden de la tienda, empezando por el producto siguiente al actual, para que cada ficha muestre
vecinos distintos. Se quitó el campo `related` de `products.json`.

## 1. URLs y SEO — 258/258 OK

Se recorren todas las URLs de `data/inventory.json` (25 páginas, 207 productos, 16 archivos, 9 redirecciones y
1 URL descubierta fuera de alcance):

- Estado: 200 en lo que está en alcance, **301** en las redirecciones (con el mismo destino que el original) y **404**
  en lo que está fuera de alcance.
- title, description, robots, canonical, og:locale/type/title/description/url/site_name/image, og:updated_time,
  article:published_time/modified_time y twitter:card/title/description: iguales al HTML original.
- **Diferencia intencional (16 archivos de categoría):** Rank Math no publica `og:title`/`twitter:title` en los archivos y aquí sí.
  En esas mismas páginas, Rank Math ponía la descripción **con HTML** (`<p>…</p>`) en `og:description`; aquí va el texto limpio.

### Corregido en este paso
- Las rutas desconocidas y las páginas fuera de alcance respondían **200** (por `cacheComponents`, que venía activado en la
  plantilla de Next y sirve una carcasa estática antes de llamar a `notFound()`). Se desactivó `cacheComponents` y las 3
  rutas dinámicas usan `dynamicParams = false`: ahora todo el sitio es SSG y lo desconocido responde 404.
- Las redirecciones respondían 308; ahora responden **301**, como WordPress.
- `og:type = product` y `product:*` en las fichas, y `og:updated_time` con la regla de Rank Math: solo si la página se
  modificó después de publicarse.
- `/tienda/` no publica fechas `article:*` (igual que el original).

## 2. Enlaces e imágenes — 0 rotos, 0 imágenes 404

Rastreo desde "/": 244 páginas, 244 destinos de enlace interno y 1093 imágenes/archivos. Incluye las galerías del lightbox
y los slideshows, que solo están en los datos.
- Corregido: la `og:image` de `silla-plegable-space` apunta a una variante redimensionada (`-1024x1024`) que no se había
  descargado. Ya está en `public/`.
- 9 enlaces internos responden 301 como en el original (el logo enlaza a `/home/` y los breadcrumbs a
  `/categoria-producto/{principal}/`). Se podrían apuntar directo a la URL final para ahorrar un salto.
- Enlaces `#` heredados del original: «Contacta a un agente» (Home) y «¡Me interesa!» (206 fichas).
- `margot-negro` y `/categoria-producto/sin-categorizar/` son huérfanas (solo se enlazan entre sí), igual que en el original.
  `/tienda/` tampoco está en el menú. Las tres están en el sitemap.

## 4. sitemap.xml y robots.txt

- `src/app/sitemap.ts`: 239 URLs (16 páginas, 16 archivos y 207 fichas con sus imágenes) y `lastmod` de WordPress
  donde existe. Sin las imágenes `/nuevo/…` rotas y sin páginas fuera de alcance.
- `src/app/robots.ts`: permite todo salvo `/_next/` y `/api/` y apunta a `/sitemap.xml`.
- Los sitemaps viejos (`/wp-sitemap.xml`, `/sitemap_index.xml`, `/page-sitemap.xml`, `/product-sitemap{1,2}.xml`) redirigen 301 a `/sitemap.xml`.

## 5. Datos estructurados (JSON-LD) y fechas

`src/lib/structured-data.ts` + `src/components/SeoExtras.tsx`. Hay un grafo por página con:
- `Organization` + `LocalBusiness`: nombre, logo, dirección, teléfono y correo (los del aviso de privacidad) y redes sociales.
- `WebSite`.
- `WebPage` / `CollectionPage` (archivos y tienda) / `ItemPage` (fichas), con `datePublished`/`dateModified` de WordPress.
- `BreadcrumbList` en todas las páginas, con las mismas migas que se ven.
- `Product` en las fichas: nombre, descripción, categoría principal, todas las imágenes con medidas y marca.

Las fechas vienen de la API de WordPress (`scripts/content/add-dates.mjs`, hora local UTC−06:00, igual que Rank Math).
- Nota: igual que en el original, `Product` no lleva `offers` (el sitio no muestra precios). Google Search Console
  marcará la advertencia "falta offers/review/aggregateRating" para fragmentos enriquecidos de producto.
- Rank Math generaba además un `Person` "Admin Qualcomm" con gravatar y `ImageObject` con URLs `/nuevo/…` rotas: no se replicaron.

## 3. Comparación visual (detenida por indicación)

- Ficha de soft-seating `/producto/zip/`: alto y footer iguales en los 3 anchos (±2 px); 0.02–0.33% de píxeles distintos.
- De lo ya comparado, diferencia real de alto (>5 px antes del footer): `sillas-ejecutivas`@390 (−24), `sillas-visita`@390 (−48),
  `amsterdam`@390 (−48), `dinamo`@768/390 (−24), `dublin`@390 (−24). Probable causa: los nombres largos de producto
  ocupan 2 líneas en el original y en la tarjeta nueva el título tiene alto fijo. No se investigó más.
- El resto de lo marcado son el slideshow de la Home y desfases de 1–6 px en tablet.

## 6. Lighthouse móvil (build de producción en local, sin optimizar)

| Página | Rendimiento | Accesibilidad | Buenas prácticas | SEO | FCP | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|---|
| / | 90 | 96 | 100 | 100 | 2.2 s | 3.3 s | 0 ms | 0 |
| /silleria/ | 94 | 96 | 100 | 100 | 2.2 s | 2.8 s | 0 ms | 0 |
| /producto/zip/ | 93 | 96 | 100 | 100 | 2.2 s | 2.9 s | 10 ms | 0 |

Principales oportunidades: la CSS de Adobe Fonts bloquea el renderizado y no usa `font-display: swap`; falta `preconnect` a p.typekit.net;
el contraste es insuficiente (gris claro de breadcrumb/textos sobre blanco, igual que en el original); y la caché de `/wp-content`
en `public/` no es "immutable" (se configura en Vercel o con headers).
