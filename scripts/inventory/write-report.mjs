// Fase 1 — Genera docs/inventario/*.md a partir de data/inventory.json
// Uso: node scripts/inventory/write-report.mjs
import { readFile, writeFile, mkdir } from "node:fs/promises";

const inv = JSON.parse(await readFile("data/inventory.json", "utf8"));
const wc = JSON.parse(await readFile(".cache/source/api/wc-products.json", "utf8"));
const MB = (b) => `${(b / 1e6).toFixed(1)} MB`;
const sum = (rows) => rows.reduce((a, r) => a + (r.bytes || 0), 0);
const esc = (s) => String(s ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
await mkdir("docs/inventario", { recursive: true });

// ---------- urls.md ----------
const paginas = inv.pages.filter((p) => p.type === "pagina").sort((a, b) => a.scope.localeCompare(b.scope) || a.path.localeCompare(b.path));
const productos = inv.pages.filter((p) => p.type === "producto").sort((a, b) => a.path.localeCompare(b.path));
const bySlug = Object.fromEntries(wc.map((p) => [p.slug, p]));
let u = `# Inventario de URLs\n\nGenerado: ${inv.generatedAt} — fuente: sitemaps + API WooCommerce + HTML renderizado.\n\n`;
u += `## Páginas (${paginas.length})\n\n| Ruta | Alcance | HTTP | Elementor ID | Forms | Title | Description |\n|---|---|---|---|---|---|---|\n`;
for (const p of paginas) u += `| \`${p.path}\` | ${p.scope} | ${p.status} | ${p.elementorId ?? "—"} | ${p.forms} | ${esc(p.seo.title)} | ${esc((p.seo.description || "").slice(0, 70))}${(p.seo.description || "").length > 70 ? "…" : ""} |\n`;
u += `\n## Archivos de categoría WooCommerce (${inv.categoryArchives.length}) — NO están en sitemaps\n\n| Ruta | Productos | HTTP | Resuelve a |\n|---|---|---|---|\n`;
for (const c of [...inv.categoryArchives].sort((a, b) => a.path.localeCompare(b.path))) {
  const final = c.finalUrl ? new URL(c.finalUrl).pathname : "";
  u += `| \`${c.path}\` | ${c.count} | ${c.status} | ${final === c.path ? "(misma)" : `redirige → \`${final}\``} |\n`;
}
u += `\n## Otras URLs descubiertas por enlaces internos\n\n| Ruta | HTTP | Resuelve a | Enlazada desde (# páginas) |\n|---|---|---|---|\n`;
for (const d of inv.discoveredUrls.filter((d) => !d.path.startsWith("/categoria-producto/"))) u += `| \`${d.path}\` | ${d.status} | \`${d.finalUrl ? new URL(d.finalUrl).pathname : ""}\` | ${d.linkedFromCount} |\n`;
u += `\n## Productos (${productos.length})\n\n| Ruta | HTTP | Imágenes | Categorías | Descripción corta |\n|---|---|---|---|---|\n`;
for (const p of productos) {
  const slug = p.path.split("/")[2];
  const w = bySlug[slug];
  u += `| \`${p.path}\` | ${p.status} | ${w?.images.length ?? "?"} | ${w ? w.categories.map((c) => c.slug).join(", ") : "NO EN API"} | ${w?.short_description?.trim() ? "sí" : "**no**"} |\n`;
}
await writeFile("docs/inventario/urls.md", u);

// ---------- medios.md ----------
const own = inv.media;
const inScope = own.filter((m) => m.inScope && m.status === 200);
const originals = inScope.filter((m) => !m.isResizedVariant);
const variants = inScope.filter((m) => m.isResizedVariant);
const broken = own.filter((m) => m.status !== 200);
const byExt = {};
for (const m of originals) (byExt[m.ext] ||= []).push(m);
let md = `# Inventario de medios\n\nPesos medidos con HEAD (Content-Length) sobre el servidor original.\n\n`;
md += `## Resumen\n\n| Conjunto | Archivos | Peso |\n|---|---|---|\n`;
md += `| Originales usados en páginas dentro de alcance | ${originals.length} | ${MB(sum(originals))} |\n`;
md += `| Variantes redimensionadas de WP (-300x300, -768x… ) | ${variants.length} | ${MB(sum(variants))} |\n`;
md += `| **Todo (originales + variantes)** | ${inScope.length} | ${MB(sum(inScope))} |\n`;
md += `| Fuentes (Google Fonts Open Sans + WooCommerce icon font) | ${inv.fonts.length} | ${MB(sum(inv.fonts))} |\n\n`;
md += `### Por tipo (originales)\n\n| Ext | Archivos | Peso |\n|---|---|---|\n`;
for (const [e, rows] of Object.entries(byExt).sort((a, b) => sum(b[1]) - sum(a[1]))) md += `| ${e} | ${rows.length} | ${MB(sum(rows))} |\n`;
md += `\n### Los 15 más pesados\n\n| Peso | Archivo | Usado en |\n|---|---|---|\n`;
for (const m of [...originals].sort((a, b) => b.bytes - a.bytes).slice(0, 15)) md += `| ${MB(m.bytes)} | ${m.url.replace("https://qualcomm.com.mx", "")} | ${m.usedBy.slice(0, 2).join(", ")} |\n`;
md += `\n## PDFs\n\n| Archivo | HTTP | Peso | Enlazado desde |\n|---|---|---|---|\n`;
for (const m of own.filter((m) => m.ext === "pdf")) md += `| ${m.url.replace("https://qualcomm.com.mx", "")} | ${m.status} | ${MB(m.bytes || 0)} | ${m.usedByCount} páginas (${m.usedBy.slice(0, 3).join(", ")}…) |\n`;
md += `\n## SVG\n\n`;
for (const m of originals.filter((m) => m.ext === "svg")) md += `- ${m.url.replace("https://qualcomm.com.mx", "")} (${m.bytes} B)\n`;
md += `\n## Fuentes\n\n`;
for (const f of inv.fonts) md += `- ${f.url.split("/").pop()} — ${f.status} — ${f.bytes} B\n`;
md += `\n## Medios rotos (${broken.length})\n\nTodos vienen de \`<image:loc>\` en los sitemaps, con prefijo \`/nuevo/wp-content/...\` (404). `;
md += `La misma imagen sin \`/nuevo/\` existe (200) y es la que realmente se renderiza en las páginas. No afecta al sitio visible.\n\n`;
const brokenBy = {};
for (const m of broken) for (const p of m.usedBy) brokenBy[p] = (brokenBy[p] || 0) + 1;
for (const [p, n] of Object.entries(brokenBy)) md += `- ${p}: ${n}\n`;
await writeFile("docs/inventario/medios.md", md);

console.log({ originals: originals.length, originalsMB: MB(sum(originals)), allMB: MB(sum(inScope)), broken: broken.length });
