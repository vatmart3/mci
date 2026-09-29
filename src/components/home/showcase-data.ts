import type { Product } from "@/lib/types";

/** Mini-produit transmis du serveur au client pour l'accueil */
export type MiniProduct = Pick<Product, "id" | "slug" | "code" | "short" | "families" | "packagings" | "properties" | "container" | "imageUrl" | "description" | "sectors" | "usages" | "technicalSheetUrl">;

export function toMini(p: Product): MiniProduct {
  const { id, slug, code, short, families, packagings, properties, container, imageUrl, description, sectors, usages, technicalSheetUrl } = p;
  return { id, slug, code, short, families, packagings, properties, container, imageUrl, description, sectors, usages, technicalSheetUrl };
}
