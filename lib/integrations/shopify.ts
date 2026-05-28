import "server-only";

import fs from "node:fs/promises";
import path from "node:path";
import { cache } from "react";

import type { ShopifySeedProduct } from "@/lib/types";

export const shopifyConfig = {
  storeDomain: process.env.SHOPIFY_STORE_DOMAIN ?? "",
  storefrontToken: process.env.SHOPIFY_STOREFRONT_TOKEN ?? "",
  productUrlTemplate: process.env.SHOPIFY_PRODUCT_URL_TEMPLATE ?? ""
};

export function isShopifyConfigured() {
  return Boolean(shopifyConfig.storeDomain && shopifyConfig.storefrontToken);
}

const shopifySeedPath = path.join(process.cwd(), "generated", "seed", "shopify-products.json");

export const getSeedShopifyProducts = cache(async (): Promise<ShopifySeedProduct[]> => {
  try {
    const source = await fs.readFile(shopifySeedPath, "utf8");
    return JSON.parse(source) as ShopifySeedProduct[];
  } catch {
    return [];
  }
});

export async function getShopifyProductBySlug(slug: string) {
  const products = await getSeedShopifyProducts();
  return products.find((product) => product.handle === slug) ?? null;
}

export async function getShopifyProductCheckoutUrl(slug: string) {
  const product = await getShopifyProductBySlug(slug);

  if (!product) {
    return null;
  }

  if (shopifyConfig.productUrlTemplate) {
    return shopifyConfig.productUrlTemplate.replace("{handle}", product.handle);
  }

  return null;
}
