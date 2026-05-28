import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function normalizeAssetPath(path: string) {
  return encodeURI(path.replace(/^\.\.\//, "/assets/"));
}
