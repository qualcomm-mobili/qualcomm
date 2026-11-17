# Fase 3 — Páginas internas

## Capturas (original | nuevo)

`docs/capturas/{pagina}/lado-a-lado-{desktop,tablet,movil}.jpg` para:
qualcomm, proyectos, showroom, descargar-catalogo, contacto, catalogo, aviso-de-privacidad, gracias-por-contactarnos.
Menú móvil: `docs/capturas/home/menu-movil-lado-a-lado.png`.

## Altos de página (original → nuevo), en px

| Página | 1440 | 768 | 390 |
|---|---|---|---|
| /qualcomm/ | 3526 → 3526 | 3671 → 3670 | 3457 → 3457 |
| /proyectos/ | 4607 → 4607 | 5431 → 5430 | 3879 → 3879 |
| /showroom/ | 3132 → 3132 | 3205 → 3204 | 2601 → 2601 |
| /descargar-catalogo/ | 2599 → 2599 | 2699 → 2698 | 2369 → 2369 |
| /contacto/ | 1998 → 1998 | 2415 → 2414 | 1895 → 1895 |
| /catalogo/ | 3027 → 3027 | 3502 → 3501 | 2650 → 2650 |
| /aviso-de-privacidad/ | 4240 → 4240 | 4896 → 4895 | 5903 → 5903 |
| /gracias-por-contactarnos/ | 900 → 900 | 900 → 900 | 900 → 900 |

Además, el inicio del footer coincide al píxel en todas las páginas y anchos. El −1px en tablet está dentro del
footer: es el redondeo de la réplica del formulario de HubSpot.

## Componentes nuevos

- `RichText`: párrafo con **negritas** y saltos de línea, guardados en JSON como `**texto**` (sin HTML en los datos).
- `ElementorForm`: réplica visual del formulario de Elementor Pro (formulario de /descargar-catalogo/). Sin envío.
- `CategoryTile`: imagen recortada con título enlazado debajo (/catalogo/; probablemente se reutilice en la Fase 4).
- `Section` ahora acepta `titleAs="h1"`. `Button` acepta `uppercase={false}` (botón "Regresar").

## Estructura

- `src/app/(site)/`: páginas con header y footer. `src/app/(canvas)/`: páginas sin ellos (/gracias-por-contactarnos/,
  que en el original usa la plantilla "canvas"). El widget de WhatsApp está en el layout raíz y aparece en ambas.
- Contenido en `src/content/pages/*.json`, con el SEO original (title, description, canonical, og:type y og:image en /proyectos/).
- `scripts/content/extract-pages.mjs` generó `aviso-de-privacidad.json` y `proyectos.json` a partir del HTML guardado.
- `scripts/inventory/download-css-media.mjs`: 6 imágenes de fondo solo existían en los CSS de Elementor
  (qualcomm-01…04 y las portadas de mobiliario italiano y nacional). Ya están descargadas (0.96 MB).

## Notas

- **Proyectos:** en el original cada tarjeta es una galería con lightbox; solo se ve la primera foto. Las 218 fotos de los
  16 proyectos están en los datos, pero el lightbox no se construyó (por ahora nada tiene que funcionar). Hay que decidir si se hace.
- **Contacto:** el formulario propio de la página está oculto en todos los dispositivos en el original. Solo se ve el título
  y el CTA global del footer, y así quedó.
- **Contacto, desktop:** el original usa 64px de padding arriba y 0 abajo (en tablet y móvil es 100/100 y 80/80). Se replicó tal cual.
- **Rank Math** genera además metas `article:published_time` / `article:modified_time` y JSON-LD. No se replicaron;
  si se quieren, se agregan en `buildMetadata`.
- Menú móvil: la X ahora es el icono `eicon-close` de Elementor, de 32px, a 20px del borde superior y del derecho. Coincide al píxel.
