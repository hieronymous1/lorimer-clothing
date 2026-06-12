import { cache } from "react";

import { loadLegacySeedData } from "@/lib/legacy-data";
import { getShopifyProductCheckoutUrl } from "@/lib/integrations/shopify";
import { getSanityEditorialOverlay, getSanitySeedDocument } from "@/lib/integrations/sanity";
import type {
  AssetImage,
  CollectionData,
  ContactInfo,
  HomeData,
  ProductState,
  StorefrontProduct
} from "@/lib/types";
import { normalizeAssetPath } from "@/lib/utils";

function normalizeImages(images: AssetImage[]) {
  return images.map((image) => ({
    ...image,
    src: normalizeAssetPath(image.src)
  }));
}

function inferProductState(statusLabel: string): ProductState {
  const normalized = statusLabel.toLowerCase();

  if (normalized.includes("archived")) {
    return "archived";
  }

  if (normalized.includes("available") || normalized.includes("in stock")) {
    return "available";
  }

  return "inquiry-only";
}

export const getStorefrontData = cache(async () => {
  const seed = await loadLegacySeedData();
  const sanitySeed = await getSanitySeedDocument();

  const products: StorefrontProduct[] = await Promise.all(
    seed.products.map(async (product) => {
      const editorialOverlay = await getSanityEditorialOverlay(product.slug);
      const state = inferProductState(product.statusLabel);
      const checkoutHref =
        state === "available"
          ? await getShopifyProductCheckoutUrl(product.slug)
          : null;

      return {
        ...product,
        ...editorialOverlay,
        cover: normalizeAssetPath(editorialOverlay?.cover ?? product.cover),
        gallery: normalizeImages(editorialOverlay?.gallery ?? product.gallery),
        styleGallery: normalizeImages(editorialOverlay?.styleGallery ?? product.styleGallery),
        state: inferProductState(editorialOverlay?.statusLabel ?? product.statusLabel),
        inquiryHref: `mailto:${seed.contact.email}?subject=${encodeURIComponent(
          `Lorimer inquiry: ${editorialOverlay?.title ?? product.title}`
        )}`,
        checkoutHref
      };
    })
  );

  return {
    contact: seed.contact satisfies ContactInfo,
    home: {
      ...(sanitySeed?.home ?? seed.home),
      texture: normalizeAssetPath((sanitySeed?.home ?? seed.home).texture),
      heroImages: normalizeImages((sanitySeed?.home ?? seed.home).heroImages),
      filmstrip: normalizeImages((sanitySeed?.home ?? seed.home).filmstrip)
    } satisfies HomeData,
    categories: sanitySeed?.categories ?? seed.categories,
    products,
    looks: (sanitySeed?.looks ?? seed.looks).map((look) => ({
      ...look,
      images: normalizeImages(look.images)
    })),
    aboutPrinciples: sanitySeed?.aboutPrinciples ?? seed.aboutPrinciples
  };
});

export async function getAllProducts() {
  return (await getStorefrontData()).products;
}

export async function getFeaturedProducts() {
  const data = await getStorefrontData();

  return data.home.featuredSlugs
    .map((slug) => data.products.find((product) => product.slug === slug))
    .filter(Boolean) as StorefrontProduct[];
}

export async function getProductBySlug(slug: string) {
  return (await getStorefrontData()).products.find((product) => product.slug === slug) ?? null;
}

export async function getRelatedProducts(product: StorefrontProduct) {
  const products = await getAllProducts();

  return product.relatedSlugs
    .map((slug) => products.find((candidate) => candidate.slug === slug))
    .filter(Boolean) as StorefrontProduct[];
}

export async function getCollectionBySlug(slug: string): Promise<CollectionData | null> {
  const data = await getStorefrontData();

  if (slug !== "ss24") {
    return null;
  }

  return {
    slug,
    eyebrow: "Collection chapter",
    title: "S/S24 reads as a runway archive before it becomes a product route.",
    intro:
      "Each look is arranged as plates, notes, and linked garments. The rhythm stays editorial while still making every product path available.",
    looks: data.looks
  };
}

export async function getSiteChromeData() {
  const data = await getStorefrontData();

  return {
    contact: data.contact,
    logoSrc: normalizeAssetPath("../FINAL PICS WEBSITE/Lorimer final logo_Lorimer 1 black.png")
  };
}
