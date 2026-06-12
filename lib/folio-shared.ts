import type { AssetImage, StorefrontProduct } from "@/lib/types";

export type GarmentCategory = "Outerwear" | "Tops" | "Bottoms" | "Dresses";

export type FolioGarment = StorefrontProduct & {
  category: GarmentCategory;
  /** First clause of the details copy, used as the material line */
  material: string;
  lookNumber: number;
};

export type FolioPlate =
  | { kind: "cover" }
  | { kind: "index"; groups: Array<{ category: GarmentCategory; garments: FolioGarment[] }> }
  | {
      kind: "look";
      lookNumber: number;
      label: string;
      title: string;
      caption: string;
      image: AssetImage;
      extraImages: AssetImage[];
      garments: FolioGarment[];
    }
  | { kind: "group"; image: AssetImage; caption: string }
  | { kind: "colophon" };

export const FOLIO_META = {
  number: "N°01",
  chapter: "S/S24",
  recorded: "09.05.2024"
} as const;
