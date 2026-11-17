// Captura páginas completas en 3 anchos (desktop, tablet, móvil) del original y/o del local.
// Uso: node scripts/compare/screenshot.mjs --paths=/,/qualcomm/ [--target=original|local|both] [--out=docs/capturas]
//      LOCAL_ORIGIN=http://localhost:3000 por defecto.
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, "").split("=")));
const paths = (args.paths || "/").split(",");
const target = args.target || "both";
const out = args.out || "docs/capturas";
const ORIGINS = { original: "https://qualcomm.com.mx", local: process.env.LOCAL_ORIGIN || "http://localhost:3000" };
export const WIDTHS = { desktop: 1440, tablet: 768, movil: 390 };

const browser = await chromium.launch({ channel: "chrome" });
for (const [name, origin] of Object.entries(ORIGINS)) {
  if (target !== "both" && target !== name) continue;
  for (const [label, width] of Object.entries(WIDTHS)) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    // Bloquea analítica y el widget flotante de WhatsApp (tochat.be): en una captura de página completa
    // un elemento fijo queda en un punto arbitrario. El formulario de HubSpot SÍ se carga (es contenido visible).
    await page.route(/(googletagmanager|google-analytics|hs-scripts|hs-analytics|hs-banner|tochat\.be)/, (r) => r.abort());
    for (const p of paths) {
      await page.goto(origin + p, { waitUntil: "networkidle", timeout: 60000 }).catch(() => {});
      // Desplaza para disparar lazy-load y animaciones de entrada.
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); }
        window.scrollTo(0, 0);
      });
      await page.addStyleTag({ content: "*,*::before,*::after{animation-duration:0s!important;transition-duration:0s!important} .elementor-invisible{visibility:visible!important} [data-floating-widget]{display:none!important}" });
      await page.waitForTimeout(name === "original" ? 2500 : 800); // el iframe de HubSpot tarda en pintarse
      const slug = p.replace(/^\/|\/$/g, "").replace(/\//g, "_") || "home";
      const file = path.join(out, slug, `${name}-${label}.png`);
      await mkdir(path.dirname(file), { recursive: true });
      await page.screenshot({ path: file, fullPage: true });
      console.log(file);
    }
    await ctx.close();
  }
}
await browser.close();
