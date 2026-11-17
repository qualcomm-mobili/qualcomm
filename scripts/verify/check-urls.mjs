// Fase 5.1 — Recorre TODAS las URLs de data/inventory.json (páginas, productos, archivos y URLs descubiertas)
// contra el sitio local y verifica:
//   · estado HTTP esperado (200; 301 donde el original redirige; 404 en lo que está fuera de alcance);
//   · SEO idéntico al original (HTML guardado en .cache/source): title, description, robots, canonical,
//     Open Graph, Twitter y fechas.
// Uso: LOCAL_ORIGIN=http://localhost:3000 node scripts/verify/check-urls.mjs
// Escribe docs/verificacion/urls.md y data/verify-urls.json.
import { readFile, writeFile, access } from "node:fs/promises";
import * as cheerio from "cheerio";

const LOCAL = process.env.LOCAL_ORIGIN || "http://localhost:3000";
const inv = JSON.parse(await readFile("data/inventory.json", "utf8"));
const exists = (p) => access(p).then(() => true, () => false);

// Campos comparados. Las URLs absolutas se comparan tal cual (el dominio de producción es el mismo).
const NAME = ["description", "robots", "twitter:card", "twitter:title", "twitter:description"];
const PROP = ["og:locale", "og:type", "og:title", "og:description", "og:url", "og:site_name", "og:image", "og:updated_time", "article:published_time", "article:modified_time"];

// Diferencias deliberadas respecto a Rank Math (se reportan aparte, no como errores).
const INTENTIONAL = [
  {
    test: (path, k, orig) => path.startsWith("/categoria-producto/") && orig === null && /^(og|twitter):title$/.test(k),
    why: "Rank Math no publica og:title/twitter:title en archivos de categoría; aquí sí (mismo texto que <title>).",
  },
];
// Rank Math metía HTML (<p>…</p>) en algunas descripciones: se compara el texto.
const norm = (v) => (v == null ? null : v.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim());

function seoOf(html) {
  const $ = cheerio.load(html);
  const out = { title: $("title").first().text().trim(), canonical: $('link[rel="canonical"]').attr("href") ?? null };
  for (const n of NAME) out[n] = $(`meta[name="${n}"]`).attr("content") ?? null;
  for (const p of PROP) out[p] = $(`meta[property="${p}"]`).first().attr("content") ?? null;
  // Rank Math escribe "index, follow, max-snippet:-1, …" y Next "index, follow, max-video-preview:-1, …": se comparan como conjunto.
  if (out.robots) out.robots = out.robots.split(",").map((s) => s.trim()).sort().join(", ");
  out["json-ld"] = $('script[type="application/ld+json"]').length > 0;
  return out;
}

const OUT_OF_SCOPE = [/^\/nueva\//, /^\/__portada\//, /^\/design-system\//, /^\/carrito\//, /^\/finalizar-compra\//, /^\/mi-cuenta\//];
const isOut = (p) => OUT_OF_SCOPE.some((r) => r.test(p));

// ---------- Lista de URLs ----------
const targets = [];
for (const p of inv.pages) targets.push({ path: p.path, kind: p.type, expect: isOut(p.path) ? 404 : 200, cache: `.cache/source/html/${p.path.replace(/^\/|\/$/g, "") || "_home"}.html` });
for (const d of inv.discoveredUrls) {
  if (targets.some((t) => t.path === d.path)) continue;
  const final = d.finalUrl ? new URL(d.finalUrl).pathname : d.path;
  if (isOut(d.path)) targets.push({ path: d.path, kind: "descubierta", expect: 404 });
  else if (final !== d.path) targets.push({ path: d.path, kind: "redirección", expect: 301, location: final });
  else targets.push({ path: d.path, kind: "archivo", expect: 200, cache: `.cache/source/html${d.path.replace(/\/$/, "")}.html` });
}

// ---------- Verificación ----------
const results = [];
let i = 0;
await Promise.all(
  Array.from({ length: 8 }, async () => {
    while (i < targets.length) {
      const t = targets[i++];
      const res = await fetch(LOCAL + t.path, { redirect: "manual" });
      const r = { ...t, status: res.status, problems: [], intentional: [] };
      if (res.status !== t.expect) r.problems.push(`estado ${res.status} (se esperaba ${t.expect})`);
      if (t.expect === 301) {
        const loc = res.headers.get("location") ? new URL(res.headers.get("location"), LOCAL).pathname : null;
        if (loc !== t.location) r.problems.push(`redirige a ${loc} (se esperaba ${t.location})`);
      }
      if (t.expect === 200 && res.status === 200 && t.cache && (await exists(t.cache))) {
        const mine = seoOf(await res.text());
        const orig = seoOf(await readFile(t.cache, "utf8"));
        for (const k of Object.keys(orig)) {
          if (k === "json-ld") {
            if (!mine[k]) r.problems.push("falta JSON-LD");
            continue;
          }
          if (norm(orig[k]) === norm(mine[k])) continue;
          const why = INTENTIONAL.find((x) => x.test(t.path, k, orig[k] ?? null, mine[k] ?? null));
          (why ? r.intentional : r.problems).push(`${k}: «${orig[k]}» ≠ «${mine[k]}»${why ? ` — ${why.why}` : ""}`);
        }
      } else if (t.expect === 200) {
        await res.arrayBuffer();
      }
      results.push(r);
    }
  }),
);
results.sort((a, b) => a.path.localeCompare(b.path));

// ---------- Reporte ----------
const bad = results.filter((r) => r.problems.length);
const byField = {};
for (const r of bad) for (const p of r.problems) {
  const k = p.split(":")[0].split(" ")[0];
  (byField[k] ||= []).push(r.path);
}
let md = `# Verificación de URLs y SEO\n\nLocal: ${LOCAL} — ${new Date().toISOString()}\n\n`;
md += `| Tipo | URLs | OK |\n|---|---|---|\n`;
for (const kind of [...new Set(results.map((r) => r.kind))]) {
  const rs = results.filter((r) => r.kind === kind);
  md += `| ${kind} | ${rs.length} | ${rs.filter((r) => !r.problems.length).length} |\n`;
}
md += `| **Total** | ${results.length} | ${results.length - bad.length} |\n\n`;
md += `## Diferencias por campo\n\n`;
for (const [k, paths] of Object.entries(byField)) md += `- **${k}**: ${paths.length} URLs (p. ej. ${paths.slice(0, 4).map((p) => "`" + p + "`").join(", ")})\n`;
md += `\n## Detalle\n\n`;
for (const r of bad) md += `- \`${r.path}\` (${r.kind}, ${r.status})\n${r.problems.map((p) => `  - ${p}`).join("\n")}\n`;
const intent = results.filter((r) => r.intentional.length);
md += `\n## Diferencias intencionales (${intent.length} URLs)\n\n${[...new Set(intent.flatMap((r) => r.intentional.map((p) => p.split(" — ")[1])))].map((w) => `- ${w}`).join("\n")}\n`;
md += `\n## Fuera de alcance (404 esperado)\n\n${results.filter((r) => r.expect === 404).map((r) => `- \`${r.path}\` → ${r.status}`).join("\n")}\n`;
await writeFile("docs/verificacion/urls.md", md);
await writeFile("data/verify-urls.json", JSON.stringify(results, null, 2));
console.log({ total: results.length, ok: results.length - bad.length, conProblemas: bad.length, porCampo: Object.fromEntries(Object.entries(byField).map(([k, v]) => [k, v.length])) });
