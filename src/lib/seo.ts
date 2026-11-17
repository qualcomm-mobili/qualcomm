import type { Metadata } from "next";
import site from "@/content/site.json";

export type PageSeo = {
  title: string;
  description: string;
  canonical: string;
  /** "product" (fichas) no está entre los tipos de Open Graph que acepta Next; se omite por ahora. */
  ogType?: string;
  ogUpdatedTime?: string;
  ogImage?: string;
  /** Descripción para Open Graph/Twitter cuando difiere de la meta description (archivos de categoría). */
  ogDescription?: string;
};

/** Metadata de Next a partir del bloque `seo` de cada página (copiado del original: Rank Math). */
export function buildMetadata(seo: PageSeo): Metadata {
  return {
    title: { absolute: seo.title },
    ...(seo.description ? { description: seo.description } : {}),
    alternates: { canonical: seo.canonical },
    robots: { index: true, follow: true, "max-snippet": -1, "max-video-preview": -1, "max-image-preview": "large" },
    openGraph: {
      locale: site.locale,
      ...(seo.ogType === "website" || seo.ogType === "article" || !seo.ogType ? { type: (seo.ogType ?? "website") as "website" | "article" } : {}),
      title: seo.title,
      description: seo.ogDescription ?? seo.description,
      url: seo.canonical,
      siteName: site.name,
      ...(seo.ogImage ? { images: [seo.ogImage] } : {}),
    },
    twitter: { card: "summary_large_image", title: seo.title, description: seo.ogDescription ?? seo.description },
  };
}
