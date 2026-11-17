// Fase 1 — Descarga a public/ los medios ORIGINALES (no las variantes -WxH de WordPress;
// next/image genera los tamaños) conservando la ruta original, p. ej.
// https://qualcomm.com.mx/wp-content/uploads/2025/12/x.jpg → public/wp-content/uploads/2025/12/x.jpg
// Así las URLs viejas de imágenes y PDFs siguen funcionando.
// Uso: node scripts/inventory/download-media.mjs
import { readFile, writeFile, mkdir, stat } from "node:fs/promises";
import path from "node:path";

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36";
const inv = JSON.parse(await readFile("data/inventory.json", "utf8"));
const todo = inv.media.filter((m) => m.inScope && m.status === 200 && !m.isResizedVariant);

let i = 0, done = 0, skipped = 0, failed = [];
await Promise.all(Array.from({ length: 8 }, async () => {
  while (i < todo.length) {
    const m = todo[i++];
    const rel = decodeURIComponent(new URL(m.url).pathname);
    const dest = path.join("public", rel);
    try {
      const s = await stat(dest).catch(() => null);
      if (s && s.size === m.bytes) { skipped++; continue; }
      const res = await fetch(m.url, { headers: { "user-agent": UA } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await mkdir(path.dirname(dest), { recursive: true });
      await writeFile(dest, Buffer.from(await res.arrayBuffer()));
      done++;
    } catch (e) {
      failed.push({ url: m.url, error: String(e) });
    }
  }
}));
await writeFile("data/media-download.json", JSON.stringify({ total: todo.length, done, skipped, failed }, null, 2));
console.log({ total: todo.length, done, skipped, failed: failed.length });
