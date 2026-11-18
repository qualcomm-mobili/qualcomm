import localFont from "next/font/local";

/**
 * Fuentes de la identidad nueva, servidas desde el repo (src/fonts/, licencia OFL 1.1 junto a cada archivo).
 * Subconjunto "latin" (cubre español). Cada una expone una variable CSS que tokens.css usa en --font-*.
 */
export const caslonDisplay = localFont({
  src: "../fonts/LibreCaslonDisplay-Regular.woff2",
  weight: "400",
  style: "normal",
  display: "swap",
  variable: "--font-caslon-display",
  fallback: ["Georgia", "Times New Roman", "serif"],
});

export const caslonText = localFont({
  src: [
    { path: "../fonts/LibreCaslonText-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/LibreCaslonText-Italic.woff2", weight: "400", style: "italic" },
    { path: "../fonts/LibreCaslonText-Bold.woff2", weight: "700", style: "normal" },
  ],
  display: "swap",
  variable: "--font-caslon-text",
  fallback: ["Georgia", "Times New Roman", "serif"],
});

export const fustat = localFont({
  src: "../fonts/Fustat-Variable.woff2",
  weight: "200 800",
  style: "normal",
  display: "swap",
  variable: "--font-fustat",
  fallback: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "Arial", "sans-serif"],
});

/** Clases que definen las tres variables; van en <html>. */
export const fontVariables = `${caslonDisplay.variable} ${caslonText.variable} ${fustat.variable}`;
