// Une original-{ancho}.png y local-{ancho}.png en una sola imagen (original | nuevo) por ancho.
// Uso: node scripts/compare/side-by-side.mjs [--dir=docs/capturas/home]
import sharp from "sharp";
import path from "node:path";

const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, "").split("=")));
const dirs = (args.dirs || args.dir || "docs/capturas/home").split(",");
const GAP = 24;
const LABEL_H = 48;

const label = (text, width) =>
  Buffer.from(
    `<svg width="${width}" height="${LABEL_H}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#222"/>` +
      `<text x="16" y="31" font-family="Helvetica, Arial" font-size="20" font-weight="700" fill="#fff">${text}</text></svg>`,
  );

for (const dir of dirs) for (const w of ["desktop", "tablet", "movil"]) {
  const a = path.join(dir, `original-${w}.png`);
  const b = path.join(dir, `local-${w}.png`);
  const [ma, mb] = await Promise.all([sharp(a).metadata(), sharp(b).metadata()]);
  const width = ma.width + GAP + mb.width;
  const height = LABEL_H + Math.max(ma.height, mb.height);
  const out = path.join(dir, `lado-a-lado-${w}.jpg`);
  await sharp({ create: { width, height, channels: 3, background: "#ff00ff" } })
    .composite([
      { input: label(`ORIGINAL — ${ma.width}px (alto ${ma.height})`, ma.width), left: 0, top: 0 },
      { input: label(`NUEVO — ${mb.width}px (alto ${mb.height})`, mb.width), left: ma.width + GAP, top: 0 },
      { input: a, left: 0, top: LABEL_H },
      { input: b, left: ma.width + GAP, top: LABEL_H },
    ])
    .jpeg({ quality: 80 })
    .toFile(out);
  console.log(out);
}
