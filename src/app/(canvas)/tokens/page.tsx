import type { Metadata } from "next";
import type { CSSProperties } from "react";
import "@/styles/tokens.css";
import styles from "./tokens.module.css";

/**
 * Muestra interna del sistema de tokens de la identidad nueva. No se enlaza, no está en el sitemap y es noindex.
 * tokens.css se importa solo aquí hasta que los componentes migren (su --container-max choca con el de globals.css).
 */
export const metadata: Metadata = {
  title: "Tokens — Qualcomm",
  robots: { index: false, follow: false },
};

const palette = [
  { token: "--qc-black", name: "Black", hex: "#111413", role: "Texto · fondo inverso" },
  { token: "--qc-ebony", name: "Ebony", hex: "#555c54", role: "Texto secundario · acento" },
  { token: "--qc-pig-iron", name: "Pig Iron", hex: "#99918d", role: "Solo bordes y detalles (no texto sobre claro)" },
  { token: "--qc-moon-mist", name: "Moon Mist", hex: "#ccccc6", role: "Bordes · superficie alterna" },
  { token: "--qc-pampas", name: "Pampas", hex: "#f4f2ef", role: "Fondo · texto inverso" },
  { token: "--qc-white", name: "White", hex: "#ffffff", role: "Superficie" },
];

const semantic = [
  ["--color-bg", "pampas"],
  ["--color-surface", "white"],
  ["--color-surface-alt", "moon-mist"],
  ["--color-text", "black"],
  ["--color-text-muted", "ebony"],
  ["--color-accent", "ebony"],
  ["--color-accent-hover", "ebony −12 %"],
  ["--color-border", "moon-mist"],
  ["--color-border-strong", "pig-iron"],
  ["--color-inverse-bg", "black"],
  ["--color-inverse-text", "pampas"],
  ["--color-inverse-muted", "moon-mist"],
];

const typeScale = [
  { token: "--text-display", size: "44 → 88", cls: styles.display, sample: "Diseño italiano" },
  { token: "--text-h1", size: "36 → 64", cls: styles.h1, sample: "Mobiliario de oficina" },
  { token: "--text-h2", size: "30 → 48", cls: styles.h2, sample: "Sillería ejecutiva" },
  { token: "--text-h3", size: "24 → 32", cls: styles.h3, sample: "Recepciones y salas de espera" },
  { token: "--text-h4", size: "20 → 24", cls: styles.h4, sample: "Showroom en Ciudad de México" },
  {
    token: "--text-lead",
    size: "18 → 22",
    cls: styles.lead,
    sample: "Más de veinte años equipando espacios de trabajo con mobiliario italiano y nacional.",
  },
  {
    token: "--text-body",
    size: "16 → 17",
    cls: styles.body,
    sample:
      "Texto de cuerpo en Fustat regular con interlineado de 1.6. Pensado para párrafos largos, descripciones de producto y textos legales, con buena lectura en pantallas pequeñas.",
  },
  { token: "--text-small", size: "14", cls: styles.small, sample: "Texto chico: notas, pies de imagen y datos de contacto." },
  { token: "--text-eyebrow", size: "12 → 13", cls: styles.eyebrow, sample: "Colección 2026" },
];

const weights = [
  { token: "--weight-light", value: 300, label: "Light" },
  { token: "--weight-regular", value: 400, label: "Regular" },
  { token: "--weight-medium", value: 500, label: "Medium" },
  { token: "--weight-semibold", value: 600, label: "Semibold" },
];

const spaces = [4, 8, 12, 16, 24, 32, 48, 64, 96, 128];

const radii = [
  { token: "--radius-sm", value: "4px", use: "Botones, inputs, chips" },
  { token: "--radius-md", value: "6px", use: "Tarjetas, imágenes de producto" },
  { token: "--radius-lg", value: "10px", use: "Banners, imágenes grandes" },
  { token: "--radius-full", value: "999px", use: "Solo indicadores circulares" },
];

const shadows = [
  { token: "--shadow-sm", value: "0 1px 2px rgb(17 20 19 / 0.06)" },
  { token: "--shadow-md", value: "0 8px 24px rgb(17 20 19 / 0.08)" },
];

/** Bloque de muestra que se repite en fondo claro y en fondo oscuro. */
function Specimen() {
  return (
    <>
      <section className={styles.section}>
        <p className={styles.eyebrow}>01 · Color</p>
        <h2 className={styles.h2}>
          Paleta <span className="qc-connector">de</span> color
        </h2>
        <ul className={styles.swatches}>
          {palette.map((c) => (
            <li key={c.token} className={styles.swatch}>
              <span className={styles.chip} style={{ background: `var(${c.token})` }} />
              <strong>{c.name}</strong>
              <code>{c.hex}</code>
              <code>{c.token}</code>
              <span className={styles.muted}>{c.role}</span>
            </li>
          ))}
        </ul>
        <ul className={styles.semantic}>
          {semantic.map(([token, ref]) => (
            <li key={token}>
              <span className={styles.dot} style={{ background: `var(${token})` }} />
              <code>{token}</code>
              <span className={styles.muted}>{ref}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <p className={styles.eyebrow}>02 · Tipografía</p>
        <h2 className={styles.h2}>
          Escala <span className="qc-connector">y</span> familias
        </h2>
        <div className={styles.examples}>
          <p className={styles.display}>
            Espacios <span className="qc-connector">de</span> trabajo
          </p>
          <p className={styles.quienes}>Quiénes somos</p>
          <p className={styles.quienesText}>Quiénes somos</p>
          <p className={`${styles.serif} ${styles.h4}`}>
            Libre Caslon Text 400 · <em>400 itálica</em> · <strong>700</strong>
          </p>
          <p className={styles.muted}>Libre Caslon Display 400 (titulares) · Fustat variable 200–800 (texto)</p>
        </div>
        <dl className={styles.scale}>
          {typeScale.map((t) => (
            <div key={t.token} className={styles.scaleRow}>
              <dt>
                <code>{t.token}</code>
                <span className={styles.muted}>{t.size} px</span>
              </dt>
              <dd className={t.cls}>{t.sample}</dd>
            </div>
          ))}
        </dl>
        <ul className={styles.weights}>
          {weights.map((w) => (
            <li key={w.token} style={{ fontWeight: w.value }}>
              {w.label} {w.value}
              <code>{w.token}</code>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <p className={styles.eyebrow}>03 · Espaciado</p>
        <h2 className={styles.h2}>
          Espaciado <span className="qc-connector">en base</span> 4
        </h2>
        <ul className={styles.spaces}>
          {spaces.map((px, i) => (
            <li key={px}>
              <code>--space-{i + 1}</code>
              <span className={styles.bar} style={{ "--w": `${px}px` } as CSSProperties} />
              <span className={styles.muted}>{px}px</span>
            </li>
          ))}
        </ul>
        <p className={styles.muted}>
          <code>--section-y</code> clamp(64px, 10vw, 128px) · <code>--container-max</code> 1280px ·{" "}
          <code>--container-narrow</code> 760px · <code>--gutter</code> clamp(20px, 5vw, 64px)
        </p>
      </section>

      <section className={styles.section}>
        <p className={styles.eyebrow}>04 · Bordes y sombras</p>
        <h2 className={styles.h2}>
          Radios <span className="qc-connector">y</span> sombras
        </h2>
        <ul className={styles.radii}>
          {radii.map((r) => (
            <li key={r.token}>
              <span className={styles.radiusBox} style={{ borderRadius: `var(${r.token})` }} />
              <code>{r.token}</code>
              <span className={styles.muted}>
                {r.value} · {r.use}
              </span>
            </li>
          ))}
        </ul>
        <div className={styles.components}>
          <article className={styles.card}>
            <div className={styles.cardImage} />
            <p className={styles.eyebrow}>Sillería</p>
            <h3 className={styles.h4}>Silla ejecutiva</h3>
            <p className={styles.small}>Tarjeta: --radius-md, borde --color-border, --shadow-sm.</p>
          </article>
          <div className={styles.controls}>
            <button type="button" className={styles.button}>
              Contacta a un agente
            </button>
            <label className={styles.field}>
              <span className={styles.small}>Correo electrónico</span>
              <input type="email" className={`qc-light ${styles.input}`} placeholder="nombre@empresa.com" />
            </label>
            <span className={styles.indicators}>
              <span className={styles.indicator} data-active="" />
              <span className={styles.indicator} />
              <span className={styles.indicator} />
            </span>
          </div>
          <div className={`qc-light ${styles.banner}`}>Banner · --radius-lg</div>
        </div>
        <ul className={styles.shadows}>
          {shadows.map((s) => (
            <li key={s.token} className="qc-light" style={{ boxShadow: `var(${s.token})` }}>
              <code>{s.token}</code>
              <span className={styles.muted}>{s.value}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

export default function TokensPage() {
  return (
    <main className={styles.page}>
      <header className={styles.intro}>
        <p className={styles.eyebrow}>Qualcomm · Identidad 2026</p>
        <h1 className={styles.h1}>
          Sistema <span className="qc-connector">de</span> tokens
        </h1>
        <p className={styles.lead}>Color, tipografía, espaciado, bordes, sombras y movimiento.</p>
      </header>
      <Specimen />
      <div className="qc-inverse">
        <Specimen />
      </div>
    </main>
  );
}
