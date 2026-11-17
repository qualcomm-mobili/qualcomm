# Fase 1 — Notas, hallazgos y dudas

Detalle completo: [urls.md](urls.md), [medios.md](medios.md), datos crudos en `data/inventory.json`.
Fuente descargada (re-generable, ignorada por git): `.cache/source/` (sitemaps, APIs, 232 HTML).

## Cifras

| Qué | Esperado | Real |
|---|---|---|
| Páginas en sitemap | ~17 | 25 (17 dentro de alcance + 8 fuera) |
| Productos | ~180 | **207** (API) / 208 entradas en sitemap (la 208 es `/tienda/`) |
| Categorías WooCommerce | — | 24 (8 padre, 16 hijas) |
| Medios originales en alcance | — | 1,081 archivos, **53 MB** (descargados a `public/wp-content/...`) |
| Variantes WP redimensionadas | — | 4,824, 90 MB (NO descargadas: next/image genera tamaños) |
| PDFs | 1-2 | **1**: `/descargas/Muestrario-de-telas-2026.pdf` (1.1 MB). No existe un "catálogo" PDF aparte. |

## Hallazgos que cambian el alcance

1. **15 archivos de subcategoría reales que no estaban en la lista** (HTTP 200, plantilla WooCommerce, enlazados desde `/silleria/`, `/mobiliario-nacional/` y desde cada ficha):
   `/categoria-producto/silleria/{sillas-directivas, sillas-ejecutivas, sillas-operativas, sillas-secretariales, sillas-industriales, sillas-visita, sillas-escolar, taburetes, bancas}/`
   y `/categoria-producto/mobiliario-nacional/{linea-temx, linea-air-duo, linea-basic, linea-quadri, linea-versatil, linea-dinamo}/` (9 de sillería + 6 de nacional).
   Además `/categoria-producto/sin-categorizar/` (1 producto: `margot-negro`, sin categoría asignada).
2. **Redirecciones existentes** que conviene replicar en `next.config.ts`:
   `/categoria-producto/{silleria, sofas, soft-seating, recepciones, mobiliario-nacional, mobiliario-italiano}/` → `/{slug}/`,
   `/categoria-producto/mobiliario-italiano/{larus, lithos}/` → `/mobiliario-italiano/`, y `/home/` → `/` (el logo enlaza a `/home/` en las 232 páginas).
3. `/tienda/` muestra los 207 productos en una sola página (no hay `/tienda/page/N/`). Tiene `<select>` de ordenamiento.
4. `/catalogo/` es una página Elementor (no PDF) con el mismo description SEO que la Home.

## Diseño / fuentes

- **Tipografía de titulares: `acumin-pro` vía Adobe Fonts (Typekit, kit `xyu6pxi`)** — no es Google Fonts y su licencia no permite copiar los archivos al repo. Cuerpo: Open Sans (Google Fonts, se puede auto-hospedar con `next/font`).
- Breakpoints Elementor: los por defecto (móvil ≤767, tablet ≤1024). No hay breakpoints personalizados.
- Colores globales Elementor (kit `post-6.css`): `#444245`, `#504C51`, `#F7F7F7`, `#EA8835` (naranja), `#F7A662`, `#F8F3E9`, `#FEFCFA`, `#E8DDD1`, `#969696`, `#FF5252`, `#E0E0E0` (+ los 4 por defecto de Elementor sin uso aparente: `#6EC1E4`, `#54595F`, `#7A7A7A`, `#61CE70`).
- Menú móvil = popup Elementor #210 (overlay deslizando desde la derecha). Hay un segundo popup #1911 "Showroom" con formulario, sin disparadores configurados (triggers vacíos): **no queda claro qué lo abre**.

## Cosas que se ven rotas o raras en el original (no se inventan, se replican tal cual salvo indicación)

- Formulario CTA global ("Forma de contacto CTA", aparece en todas las páginas): el select "¿Cómo podemos ayudarte?" tiene opciones **"Opción 1 / Opción 2 / Opción 3"** (placeholder).
- Además del form Elementor hay un form de **HubSpot** (portal 20567623) embebido 2 veces por página.
- 225 `<image:loc>` de los sitemaps apuntan a `/nuevo/wp-content/...` → 404 (la imagen real existe sin `/nuevo/`). Solo afecta al sitemap.
- `/finalizar-compra/` tiene title "Carrito" (fuera de alcance).
- 33 productos sin descripción corta; solo 1 (`banca-airport`) tiene descripción larga. Varios productos sin meta description propia.
- `/design-system/` está publicada e indexable con Lorem ipsum (fuera de alcance).

## Terceros (solo visual por ahora)

- Analítica: GA4 `G-Z067LREBHM`, GTM `GTM-TDQT7FN4`, HubSpot tracking `20567623`, WooCommerce sourcebuster.
- **Widget flotante de WhatsApp de tochat.be** (visible en todas las páginas) → habría que replicarlo como botón estático.
- Mapa de Google embebido en `/showroom/` (iframe `maps.google.com?q=Mobiset`).
- Redes: Facebook, Instagram, Twitter (X).

## Fuera de alcance (solo listadas)

`/nueva/`, `/nueva/home/`, `/nueva/detalle-categoria/`, `/nueva/detalle-producto/`, `/__portada/`, `/design-system/`, `/carrito/`, `/finalizar-compra/`, `/mi-cuenta/` (+ `/mi-cuenta/lost-password/`).
