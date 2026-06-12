import "server-only";

import { cache } from "react";

import { getStorefrontData } from "@/lib/storefront";
import { FOLIO_META } from "@/lib/folio-shared";
import type { FolioGarment, FolioPlate, GarmentCategory } from "@/lib/folio-shared";
import type { StorefrontProduct } from "@/lib/types";
import { normalizeAssetPath } from "@/lib/utils";

export { FOLIO_META };
export type { FolioGarment, FolioPlate, GarmentCategory };

const CATEGORY_RULES: Array<[RegExp, GarmentCategory]> = [
  [/dress/i, "Dresses"],
  [/jacket|bomber|suit/i, "Outerwear"],
  [/trouser|jean|short|skirt|bottom/i, "Bottoms"],
  [/top|vest|sweatshirt|shirt|button/i, "Tops"]
];

export function categorizeGarment(title: string): GarmentCategory {
  for (const [pattern, category] of CATEGORY_RULES) {
    if (pattern.test(title)) return category;
  }
  return "Tops";
}

function materialOf(product: StorefrontProduct) {
  const first = product.details.split(",")[0]?.trim() ?? "";
  return first.replace(/\.$/, "");
}

function lookNumberOf(product: StorefrontProduct) {
  const match = product.season.match(/look\s*(\d+)/i);
  return match ? Number(match[1]) : 0;
}

export function toFolioGarment(product: StorefrontProduct): FolioGarment {
  return {
    ...product,
    category: categorizeGarment(product.title),
    material: materialOf(product),
    lookNumber: lookNumberOf(product)
  };
}

export const getFolioGarments = cache(async (): Promise<FolioGarment[]> => {
  const data = await getStorefrontData();
  return data.products.map(toFolioGarment);
});

/**
 * The bound sequence of the S/S24 folio:
 * cover → index → one plate per look → group plate → colophon.
 */
export const getFolioPlates = cache(async (): Promise<FolioPlate[]> => {
  const data = await getStorefrontData();
  const garments = await getFolioGarments();
  const bySlug = new Map(garments.map((g) => [g.slug, g]));

  const categoryOrder: GarmentCategory[] = ["Outerwear", "Tops", "Bottoms", "Dresses"];
  const groups = categoryOrder
    .map((category) => ({
      category,
      garments: garments.filter((g) => g.category === category)
    }))
    .filter((group) => group.garments.length > 0);

  const lookPlates: FolioPlate[] = data.looks.map((look, i) => ({
    kind: "look",
    lookNumber: i + 1,
    label: look.label,
    title: look.title,
    caption: look.caption,
    image: look.images[0],
    extraImages: look.images.slice(1),
    garments: look.productSlugs
      .map((slug) => bySlug.get(slug))
      .filter((g): g is FolioGarment => Boolean(g))
  }));

  return [
    { kind: "cover" },
    { kind: "index", groups },
    ...lookPlates,
    {
      kind: "group",
      image: {
        src: normalizeAssetPath("../FINAL PICS WEBSITE/S:S24/9.5.2024.JPG"),
        alt: "S/S24 group frame from the garden show"
      },
      caption: "The garden show — all looks, one frame. Recorded 09.05.2024."
    },
    { kind: "colophon" }
  ];
});
