import type { NextConfig } from "next";

// Categorías principales: WordPress redirige su archivo WooCommerce a la página Elementor.
const mainCategories = ["silleria", "sofas", "soft-seating", "recepciones", "mobiliario-nacional", "mobiliario-italiano"];

const nextConfig: NextConfig = {
  // Mismas rutas que el WordPress original: /qualcomm/, /producto/{slug}/, etc.
  trailingSlash: true,
  // Sin cacheComponents: el sitio es 100% estático y así `dynamicParams = false` devuelve 404 reales
  // en rutas dinámicas no generadas (con cacheComponents se servía la carcasa con estado 200).
  images: {
    qualities: [75],
  },
  // 301 como WordPress (Next usaría 308 con `permanent: true`).
  async redirects() {
    return [
      { source: "/home/", destination: "/", statusCode: 301 },
      ...mainCategories.map((slug) => ({
        source: `/categoria-producto/${slug}/`,
        destination: `/${slug}/`,
        statusCode: 301 as const,
      })),
      // Subcategorías italianas sin archivo propio en el original: también van a la página principal.
      { source: "/categoria-producto/mobiliario-italiano/:sub(larus|lithos)/", destination: "/mobiliario-italiano/", statusCode: 301 },
      // Sitemaps de WordPress / Rank Math → sitemap de Next.
      ...["/wp-sitemap.xml", "/sitemap_index.xml", "/page-sitemap.xml", "/product-sitemap1.xml", "/product-sitemap2.xml"].map((source) => ({
        source,
        destination: "/sitemap.xml",
        statusCode: 301 as const,
      })),
    ];
  },
};

export default nextConfig;
