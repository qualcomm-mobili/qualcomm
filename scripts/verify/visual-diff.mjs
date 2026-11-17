// Fase 5.3 — Comparación visual automática original vs. local de TODAS las páginas en alcance, en 3 anchos.
// Por página y ancho:
//   · alto total del documento e inicio del footer;
//   · diferencia de píxeles en la zona de contenido (entre header y footer; en fichas, hasta
//     "Productos que te pueden interesar", que ahora se calculan distinto a propósito).
// Reporta solo lo que difiera > 5 px de alto o > UMBRAL % de píxeles. Guarda las imágenes de diferencia en
// docs/capturas/diff/ (ignorado por git).
// Uso: LOCAL_ORIGIN=http://localhost:3000 node scripts/verify/visual-diff.mjs [--only=/ruta/,/otra/] [--widths=1440,768,390]
import { chromium } from "playwright";
import sharp from "sharp";
import { readFile, writeFile, mkdir } from "node:fs/promises";

const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, "").split("=")));
const LOCAL = process.env.LOCAL_ORIGIN || "http://localhost:3000";
const ORIGIN = "https://qualcomm.com.mx";
const WIDTHS = (args.widths || "1440,768,390").split(",").map(Number);
const HEIGHT_TOL = 5;
const PIXEL_TOL = 2; // % de píxeles distintos en la zona de contenido
const CONCURRENCY = 4;
const DIFF_W = 360; // ancho al que se reducen las capturas para comparar (absorbe antialiasing)

const OUT_OF_SCOPE = [/^\/nueva\//, /^\/__portada\//, /^\/design-system\//, /^\/carrito\//, /^\/finalizar-compra\//, /^\/mi-cuenta\//];
const inv = JSON.parse(await readFile("data/inventory.json", "utf8"));
let paths = [
  ...inv.pages.map((p) => p.path),
  ...inv.discoveredUrls.filter((d) => d.status === 200 && d.finalUrl && new URL(d.finalUrl).pathname === d.path).map((d) => d.path),
].filter((p) => !OUT_OF_SCOPE.some((r) => r.test(p)));
paths = [...new Set(paths)].sort();
if (args.only) paths = args.only.split(",");

const browser = await chromium.launch({ channel: "chrome" });
await mkdir("docs/capturas/diff", { recursive: true });

const HIDE = "*,*::before,*::after{animation-duration:0s!important;transition-duration:0s!important;caret-color:transparent!important} .elementor-invisible{visibility:visible!important} [data-floating-widget]{display:none!important}";

async function shoot(ctx, url, isOriginal, attempt = 1) {
  try {
    return await shootOnce(ctx, url, isOriginal);
  } catch (e) {
    if (attempt < 2) return shoot(ctx, url, isOriginal, attempt + 1);
    return { error: String(e).split("\n")[0], doc: null, footer: null, buf: null };
  }
}

async function shootOnce(ctx, url, isOriginal) {
  const page = await ctx.newPage();
  await page.route(/(googletagmanager|google-analytics|hs-scripts|hs-analytics|hs-banner|tochat\.be)/, (r) => r.abort());
  await page.goto(url, { waitUntil: "networkidle", timeout: 90000 }).catch(() => {});
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 150)); }
    window.scrollTo(0, 0);
  });
  await page.addStyleTag({ content: HIDE });
  await page.waitForTimeout(isOriginal ? 2500 : 400); // el iframe de HubSpot termina de ajustar su alto
  const m = await page.evaluate(() => {
    const top = (el) => (el ? Math.round(el.getBoundingClientRect().top + scrollY) : null);
    const header = document.querySelector('[data-elementor-type="header"], body > header, header');
    const footer = document.querySelector('[data-elementor-type="footer"], footer');
    const related = [...document.querySelectorAll("h2")].find((h) => h.textContent.trim() === "Productos que te pueden interesar");
    const relatedBox = related && (related.closest('[data-element_type="container"].e-parent, section') ?? related);
    const headerBottom = header ? Math.round(header.getBoundingClientRect().bottom + scrollY) : 0;
    return { doc: document.documentElement.scrollHeight, headerBottom, footer: top(footer), end: top(relatedBox) ?? top(footer) };
  });
  const height = Math.max(1, (m.end ?? m.doc) - m.headerBottom);
  if (!m.doc) throw new Error("página vacía");
  const buf = await page.screenshot({ fullPage: true, clip: { x: 0, y: m.headerBottom, width: page.viewportSize().width, height } }).catch(() => null);
  await page.close();
  return { ...m, buf };
}

async function pixelDiff(a, b, file) {
  const load = async (buf) => {
    const img = sharp(buf).resize({ width: DIFF_W });
    const { data, info } = await img.removeAlpha().raw().toBuffer({ resolveWithObject: true });
    return { data, info };
  };
  const [A, B] = await Promise.all([load(a), load(b)]);
  const w = DIFF_W, h = Math.max(A.info.height, B.info.height), hMin = Math.min(A.info.height, B.info.height);
  const out = Buffer.alloc(w * h * 3, 255);
  let diff = 0;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 3;
      let d = 255 * 3;
      if (y < hMin) d = Math.abs(A.data[i] - B.data[i]) + Math.abs(A.data[i + 1] - B.data[i + 1]) + Math.abs(A.data[i + 2] - B.data[i + 2]);
      const g = y < A.info.height ? Math.round((A.data[i] + A.data[i + 1] + A.data[i + 2]) / 3 * 0.3 + 178) : 255;
      if (d > 60) { diff++; out[i] = 255; out[i + 1] = 0; out[i + 2] = 80; } else { out[i] = out[i + 1] = out[i + 2] = g; }
    }
  const pct = (diff / (w * h)) * 100;
  if (file && pct > PIXEL_TOL) await sharp(out, { raw: { width: w, height: h, channels: 3 } }).png().toFile(file);
  return pct;
}

// Reanudable: lo ya comparado se guarda en data/verify-visual.partial.json y se salta al volver a correr.
const PARTIAL = "data/verify-visual.partial.json";
const results = args.fresh ? [] : JSON.parse(await readFile(PARTIAL, "utf8").catch(() => "[]")).filter((r) => !r.error);
const doneKeys = new Set(results.map((r) => `${r.path}@${r.width}`));
const jobs = paths.flatMap((p) => WIDTHS.map((w) => ({ p, w }))).filter((j) => !doneKeys.has(`${j.p}@${j.w}`));
let next = 0, done = 0;
const t0 = Date.now();
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    const ctxs = {};
    while (next < jobs.length) {
      const { p, w } = jobs[next++];
      for (const k of ["o", "l"]) ctxs[`${k}${w}`] ??= await browser.newContext({ viewport: { width: w, height: 900 }, deviceScaleFactor: 1 });
      const [o, l] = await Promise.all([shoot(ctxs[`o${w}`], ORIGIN + p, true), shoot(ctxs[`l${w}`], LOCAL + p, false)]);
      const slug = (p.replace(/^\/|\/$/g, "").replace(/\//g, "_") || "home") + `-${w}`;
      const pct = o.buf && l.buf ? await pixelDiff(o.buf, l.buf, `docs/capturas/diff/${slug}.png`) : 100;
      results.push({ path: p, width: w, docO: o.doc, docL: l.doc, footO: o.footer, footL: l.footer, pixels: +pct.toFixed(2), ...(o.error || l.error ? { error: o.error || l.error } : {}) });
      if (done % 10 === 0) await writeFile(PARTIAL, JSON.stringify(results));
      if (++done % 25 === 0) console.log(`${done}/${jobs.length} (${Math.round((Date.now() - t0) / 1000)} s)`);
    }
  }),
);
await browser.close();
results.sort((a, b) => a.path.localeCompare(b.path) || b.width - a.width);
await writeFile("data/verify-visual.json", JSON.stringify(results, null, 2));

await writeFile(PARTIAL, JSON.stringify(results));
const errors = results.filter((r) => r.error);
const flagged = results.filter((r) => !r.error).filter((r) => Math.abs(r.footL - r.footO) > HEIGHT_TOL || Math.abs(r.docL - r.docO) > HEIGHT_TOL || r.pixels > PIXEL_TOL);
let md = `# Comparación visual (original vs. local)\n\n${paths.length} páginas × ${WIDTHS.length} anchos = ${results.length} comparaciones — ${new Date().toISOString()}\n\n`;
md += `Criterio: alto del documento o inicio del footer con más de ${HEIGHT_TOL} px de diferencia, o más de ${PIXEL_TOL}% de píxeles distintos en el contenido (reducido a ${DIFF_W} px de ancho).\n\n`;
md += `**Marcadas: ${flagged.length}** de ${results.length}.\n\n| Página | Ancho | Alto doc. | Inicio footer | % píxeles |\n|---|---|---|---|---|\n`;
for (const r of flagged) md += `| \`${r.path}\` | ${r.width} | ${r.docO}→${r.docL} (${r.docL - r.docO}) | ${r.footO}→${r.footL} (${r.footL - r.footO}) | ${r.pixels} |\n`;
if (errors.length) md += `\n## No se pudieron comparar (${errors.length})\n\n${errors.map((r) => `- \`${r.path}\` @${r.width}: ${r.error}`).join("\n")}\n`;
await writeFile("docs/verificacion/visual.md", md);
console.log({ comparaciones: results.length, marcadas: flagged.length, segundos: Math.round((Date.now() - t0) / 1000) });
