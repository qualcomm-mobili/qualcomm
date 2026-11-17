import type { Metadata } from "next";
import site from "@/content/site.json";
import { WhatsAppWidget } from "@/components/WhatsAppWidget";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  icons: {
    icon: [
      { url: site.favicons.icon32, sizes: "32x32" },
      { url: site.favicons.icon192, sizes: "192x192" },
    ],
    apple: site.favicons.apple,
  },
};

/**
 * Layout raíz: solo documento, fuentes y widget flotante.
 * Header/Footer viven en (site)/layout.tsx; (canvas) es para páginas sin ellos (p. ej. /gracias-por-contactarnos/).
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es">
      <head>
        {/* Adobe Fonts (acumin-pro 800/900) — mismo kit que el sitio original. */}
        <link rel="preconnect" href="https://use.typekit.net" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://p.typekit.net" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://use.typekit.net/xyu6pxi.css" />
      </head>
      <body>
        {children}
        <WhatsAppWidget />
      </body>
    </html>
  );
}
