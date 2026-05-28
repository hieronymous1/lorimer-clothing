import "server-only";

import fs from "node:fs/promises";
import path from "node:path";
import { cache } from "react";

import type { SanityProductOverlay, SanitySeedDocument } from "@/lib/types";

export const sanityConfig = {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "",
  apiToken: process.env.SANITY_API_READ_TOKEN ?? ""
};

export function isSanityConfigured() {
  return Boolean(sanityConfig.projectId && sanityConfig.dataset);
}

const sanitySeedPath = path.join(process.cwd(), "generated", "seed", "sanity-seed.json");

export const getSanitySeedDocument = cache(async (): Promise<SanitySeedDocument | null> => {
  try {
    const source = await fs.readFile(sanitySeedPath, "utf8");
    return JSON.parse(source) as SanitySeedDocument;
  } catch {
    return null;
  }
});

export async function getSanityEditorialOverlay(slug: string): Promise<SanityProductOverlay | null> {
  const seed = await getSanitySeedDocument();
  return seed?.products.find((product) => product.slug === slug) ?? null;
}
