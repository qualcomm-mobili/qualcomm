import type { MetadataRoute } from "next";
import site from "@/content/site.json";

/** robots.txt: todo indexable salvo las rutas internas de Next; apunta al sitemap nuevo. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/_next/", "/api/"] },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
