# Fase 4 — Catálogo

## Build

`pnpm build` (limpio, sin `.next`): **4.1 s en total** (compilación 0.9 s + generación de 244 páginas estáticas 1.1 s).
Se generan las **207 fichas** `/producto/{slug}/` con `generateStaticParams`, los 16 archivos de `/categoria-producto/…/`,
las 6 categorías principales y /tienda/. Las 230 URLs del catálogo responden 200 en local. En los 16 archivos, el orden
de productos coincide con el del HTML original.

## Datos (sin duplicar)

- `src/content/categories.json`: 24 categorías (slug, nombre, padre, ruta, descripción, SEO del archivo). No contienen productos.
- `src/content/products.json`: 207 productos en el "Orden por defecto" de /tienda/. Las categorías van por slug,
  e incluyen `primaryCategory` (la que muestra el breadcrumb), descripción corta, imágenes, relacionados y SEO.
- `src/content/pages/{mobiliario-italiano,…}.json`: composición de cada categoría principal en bloques
  (portada, títulos de línea, textos, productos por slug y mosaicos de subcategoría).
- Todo lo genera `scripts/content/extract-catalog.mjs` desde la API de WooCommerce y el HTML guardado.
- `src/lib/catalog.ts`: consultas (producto, categoría, cadena de breadcrumb, productos por categoría).

## Componentes nuevos

- **`Lightbox`** (único visor): dos apariencias. `elementor` en Proyectos: fondo translúcido, contador,
  pantalla completa/zoom/compartir/cerrar y título abajo. `photoswipe` en las fichas: fondo negro, barra con contador,
  zoom solo en móvil, pantalla completa y cerrar. Navega con flechas, ←/→ y deslizando el dedo, en bucle. Se cierra con ×,
  Esc o clic fuera de la imagen. La foto se muestra a su tamaño natural, limitada por la pantalla.
- **`ProductGallery`**: imagen principal con deslizamiento de 500 ms y alto según la proporción de cada foto. Miniaturas
  en 4 columnas (las inactivas al 50%) y zoom al pasar el cursor, solo si la foto es más grande que como se ve. La lupa
  o un clic en la imagen abren el `Lightbox`. En táctil se desliza con el dedo.
- **`ProjectCard`**: tarjeta de Proyectos conectada al `Lightbox`.
- `ProductCard`, `ProductGrid` (espaciados "catalog" y "related"), `Breadcrumbs`, `CategoryTileGrid`
  (ahora también lo usa /catalogo/) y `ShopArchive` (/tienda/ y /sin-categorizar/, plantilla WooCommerce + tema Hello).

## Rutas

- `src/app/(site)/[category]/`: las 6 categorías principales.
- `src/app/(site)/categoria-producto/[...path]/`: 15 subcategorías (plantilla Elementor) y /sin-categorizar/ (plantilla WooCommerce).
- `src/app/(site)/producto/[slug]/`: fichas.
- `src/app/(site)/tienda/`.

## Altos (original → nuevo), en px

Formato: alto de página / inicio del footer.

| Página | 1440 | 768 | 390 |
|---|---|---|---|
| /mobiliario-italiano/ | 4515→4515 / 2848→2848 | 5229→5231 / 3131→3134 | 4140→4140 / 2516→2516 |
| /mobiliario-nacional/ | 3628→3628 / 1961→1961 | 3980→3979 / 1882→1882 | 3017→3017 / 1393→1393 |
| /recepciones/ | 3153→3153 / 1486→1486 | 3996→3997 / 1898→1900 | 3191→3191 / 1568→1568 |
| /sofas/ | 3471→3471 / 1804→1804 | 4626→4628 / 2528→2531 | 3505→3505 / 1882→1882 |
| /soft-seating/ | 4215→4215 / 2548→2548 | 5622→5625 / 3524→3528 | 4168→4168 / 2545→2545 |
| /silleria/ | 3521→3521 / 1854→1854 | 4286→4285 / 2188→2188 | 3203→3203 / 1579→1579 |
| /categoria-producto/silleria/sillas-directivas/ | 4976→4976 / 3309→3309 | 7000→7005 / 4902→4908 | 5011→5029* / 3405→3405 |
| /categoria-producto/mobiliario-nacional/linea-quadri/ | 3542→3542 / 1875→1875 | 4327→4328 / 2229→2231 | 3323→3341* / 1717→1717 |
| /categoria-producto/silleria/bancas/ | 3116→3116 / 1449→1449 | 3910→3911 / 1812→1814 | 2968→2968 / 1344→1344 |
| /tienda/ | 23980→23978 / 22313→22311 | 48974→48972 / 46876→46875 | 36079→36096* / 34474→34473 |
| /producto/infinity/ (16 fotos) | 4497→4497 / 2830→2830 | 4761→4763 / 2663→2666 | 3986→4004* / 2380→2380 |
| /producto/q3/ (1 foto, nacional) | 3833→3833 / 2166→2166 | 4408→4409 / 2310→2312 | 3626→3644* / 2021→2021 |
| /producto/lit-4/ (italiano) | 4071→4071 / 2404→2404 | 4489→4491 / 2391→2394 | 3783→3801* / 2177→2177 |
| /producto/recepcion-toulouse/ | 3931→3931 / 2264→2264 | 4060→4061 / 1962→1964 | 3402→3402 / 1779→1779 |
| /producto/tenerife/ (sofás) | 4213→4213 / 2546→2546 | 4580→4581 / 2482→2484 | 3779→3796* / 2173→2173 |

\* Los +17/18 px en móvil están **dentro del footer**, no en el contenido de la página (el inicio del footer coincide).
En el original, en esas páginas el logo del footer móvil se renderiza **aplastado a 64×64** en lugar de 64×82. Es un defecto
del original; aquí el logo conserva su proporción. En tablet hay diferencias de 1–6 px que crecen con el número de filas:
son redondeos subpíxel de las tarjetas del original.

## Notas

- **"Productos que te pueden interesar"** son aleatorios en WooCommerce (cambian en cada carga). Aquí se usan los
  de la captura del original, por eso el orden no coincide con una captura nueva. `margot-negro` no tiene relacionados
  en el original (se ve el título y la cuadrícula vacía) y se replicó así.
- **`skeiter-secretarial`**: la API trae 6 fotos y la página muestra 5. Se usan las 5 de la página.
- **116 productos** tienen como descripción corta el texto de relleno "Descripción no disponible." del original.
- `margot-negro` no tiene categoría en la API; el sitio lo muestra en "Sin categorizar" y así quedó.
- Solo `banca-airport` tiene descripción larga, pero la plantilla de la ficha no la muestra. Está guardada en los datos.
- "¡Me interesa!" enlaza a `#` y "Regresar" no tiene enlace en el original; se replicaron igual.
- Lightbox de Proyectos: el botón "compartir" solo se ve; en el original abre un menú de redes.
- og:type `product` de las fichas: Next no lo acepta en `openGraph.type`; se resuelve en la pasada de SEO previa al deploy.
- Corrección de datos: el extractor colapsaba los `<br>` de las descripciones (p. ej. LIT-4). Ya se corrigió; hay 14 productos con varias líneas.
