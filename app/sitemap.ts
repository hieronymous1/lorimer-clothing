import type { MetadataRoute } from "next";

import { getAllProducts } from "@/lib/storefront";
import { getSiteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const products = await getAllProducts();
  const now = new Date();

  return [
    "",
    "/shop",
    "/ss24",
    "/about",
    ...products.map((product) => `/product/${product.slug}`)
  ].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now
  }));
}
