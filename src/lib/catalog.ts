import categoriesData from "@/content/categories.json";
import productsData from "@/content/products.json";
import type { PageSeo } from "./seo";

export type Category = {
  slug: string;
  name: string;
  parent: string | null;
  href: string;
  description: string;
  image?: string;
  /** Solo las categorías con archivo propio en /categoria-producto/…/ */
  seo?: PageSeo;
  /** "elementor": plantilla de archivo de Elementor; "woocommerce": plantilla por defecto (como /tienda/). */
  layout?: "elementor" | "woocommerce";
};

export type Product = {
  slug: string;
  name: string;
  categories: string[];
  /** Categoría que muestra el breadcrumb del original. */
  primaryCategory: string | null;
  shortDescription: string;
  description?: string;
  images: { src: string; alt: string }[];
  seo: PageSeo & { published?: string; modified?: string };
};

export const categories = categoriesData as Category[];
/** En el orden de /tienda/ ("Orden por defecto" de WooCommerce). */
export const products = productsData as Product[];

const categoryBySlug = new Map(categories.map((c) => [c.slug, c]));
const productBySlug = new Map(products.map((p) => [p.slug, p]));

export const getCategory = (slug: string) => categoryBySlug.get(slug);
export const getProduct = (slug: string) => productBySlug.get(slug);
export const productHref = (slug: string) => `/producto/${slug}/`;

/** Productos por slug, en el orden pedido, ignorando los que no existan. */
export const productsBySlugs = (slugs: string[]) => slugs.map((s) => productBySlug.get(s)).filter((p): p is Product => !!p);

/** Productos de una categoría (directa), en el orden de la tienda. */
export const productsInCategory = (slug: string) => products.filter((p) => p.categories.includes(slug));

/** Cadena de categorías de la raíz a la indicada, p. ej. [silleria, sillas-visita]. */
export function categoryChain(slug: string | null): Category[] {
  const chain: Category[] = [];
  let c = slug ? categoryBySlug.get(slug) : undefined;
  while (c) {
    chain.unshift(c);
    c = c.parent ? categoryBySlug.get(c.parent) : undefined;
  }
  return chain;
}

/** Ruta del archivo WooCommerce de una categoría (lo que enlaza el breadcrumb del original). */
export const archivePath = (c: Category) => `/categoria-producto/${categoryChain(c.slug).map((x) => x.slug).join("/")}/`;

/** Categorías con página de archivo propia (/categoria-producto/…/). */
export const archiveCategories = () => categories.filter((c) => c.seo);

/** Cantidad de "Productos que te pueden interesar" del original (loop-grid de 8). */
const RELATED_COUNT = 8;

/** Lista empezando justo después de `slug` y dando la vuelta (para que cada ficha muestre vecinos distintos). */
function rotateAfter(list: Product[], slug: string): Product[] {
  const i = list.findIndex((p) => p.slug === slug);
  return i < 0 ? list : [...list.slice(i + 1), ...list.slice(0, i)];
}

/**
 * "Productos que te pueden interesar", determinista (en WordPress eran aleatorios):
 * primero de la misma subcategoría y, si faltan, de la misma categoría principal; nunca el producto actual.
 * Dentro de cada grupo, en el orden de la tienda empezando por el siguiente al actual.
 */
export function relatedProducts(product: Product): Product[] {
  const chain = categoryChain(product.primaryCategory);
  if (!chain.length) return [];
  const sub = chain.at(-1)!;
  const main = chain[0];
  const picked: Product[] = [];
  const add = (list: Product[]) => {
    for (const p of rotateAfter(list, product.slug)) {
      if (picked.length >= RELATED_COUNT) return;
      if (p.slug !== product.slug && !picked.includes(p)) picked.push(p);
    }
  };
  add(productsInCategory(sub.slug));
  if (main.slug !== sub.slug) add(productsInCategory(main.slug));
  return picked;
}
