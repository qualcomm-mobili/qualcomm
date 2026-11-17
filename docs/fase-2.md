# Fase 2 — Design system, layout global y Home

## Capturas (original | nuevo)

- `docs/capturas/home/lado-a-lado-{desktop,tablet,movil}.jpg` (1440 / 768 / 390 px)
- `docs/capturas/home/menu-movil-lado-a-lado.png` (menú overlay a 390 px)
- Regenerar: `pnpm build && pnpm start`, luego
  `node scripts/compare/screenshot.mjs --paths=/ && node scripts/compare/side-by-side.mjs`

Alto total de la página (original → nuevo): 1440: 5238 → 5239 · 768: 6204 → 6204 · 390: 6444 → 6445.

## Estructura

- Tokens: `src/app/globals.css` (colores del kit Elementor, tipografías, tamaños, contenedor, espaciados, breakpoints documentados).
- Contenido: `src/content/site.json` (navegación, footer, CTA, WhatsApp) y `src/content/pages/home.json` (incluye SEO).
- `src/content/media.json`: dimensiones de cada imagen de `public/` (`pnpm media:manifest`).
- Componentes (`src/components/`): Header (+ MobileMenu), Footer (CTA + columnas), MenuGroups, Hero, Section,
  CategoryCard, Button, Img, Slideshow, HubSpotForm (visual), WhatsAppWidget (visual).

## Decisiones y notas

- **Fuente del cuerpo: NO es Open Sans.** Corrijo lo que dije en la Fase 1. El kit de Elementor declara Open Sans
  pero ningún elemento la usa; el original pinta todo el texto con la pila de sistema del tema Hello Elementor
  (-apple-system / Segoe UI / Roboto…). Para que se vea igual uso esa misma pila y no cargo Open Sans. Si se prefiere
  Open Sans, es un cambio de una línea (`--font-body`) más `next/font/google`.
- **acumin-pro (Adobe Fonts, kit `xyu6pxi`) carga bien en localhost** (verificado: CSS, ping p.typekit.net y
  archivo de la fuente con respuesta 200, `document.fonts.check` = true). No hizo falta el respaldo con Archivo.
  Hay que confirmar que el kit permita el dominio de Vercel cuando se publique.
- El kit solo trae los pesos 800/900. El original declara 400/500 en títulos y menú, pero el navegador muestra 800;
  aquí se declara 800 directamente.
- Entre 1025 y 1139 px el original no deja margen lateral: el contenido de 1140 px toca los bordes. Se replicó igual.
- Los slideshows (hero con zoom lento y CTA) son un componente cliente con fundido de 500 ms. Como las imágenes
  rotan, cada captura puede mostrar una foto distinta.
- El formulario "Forma de contacto CTA" (el de las "Opción 1/2/3") está **oculto en todos los dispositivos** en el
  original; lo que se ve es el formulario de HubSpot. Se replicó solo el de HubSpot, sin conexión.
- El widget de WhatsApp aparece desplegado al cargar, igual que en el original; la X lo pliega. En las capturas de
  página completa se oculta en ambos lados porque es un elemento fijo.
- En el original, el botón "Contacta a un agente" enlaza a `#`. Se dejó igual.
- Redirecciones permanentes en `next.config.ts`: `/home/` y `/categoria-producto/{principal}/`.
