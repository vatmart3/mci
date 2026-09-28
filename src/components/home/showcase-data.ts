import type { Product } from "@/lib/types";
import { labelFor } from "@/components/three/Container";
import type { ShowcaseItem } from "@/components/three/FloatingShowcase";

/** Mini-produit transmis du serveur au client pour la 3D d'accueil */
export type MiniProduct = Pick<Product, "id" | "slug" | "code" | "short" | "families" | "packagings" | "properties" | "container" | "imageUrl" | "description" | "sectors">;

export function toMini(p: Product): MiniProduct {
  const { id, slug, code, short, families, packagings, properties, container, imageUrl, description, sectors } = p;
  return { id, slug, code, short, families, packagings, properties, container, imageUrl, description, sectors };
}

export function showcaseItem(p: MiniProduct, packId?: string): ShowcaseItem {
  const pack = p.packagings.find((k) => k.id === packId) ?? p.packagings[0]!;
  return { id: `${p.slug}:${pack.id}`, kind: pack.container, label: labelFor(p, pack.short) };
}
