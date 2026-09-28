/**
 * Accès catalogue côté serveur (pages statiques / SEO).
 * Mode démo : seed TypeScript. Mode Supabase : lecture publique (RLS) avec repli sur le seed.
 */
import { products as seedProducts } from "@/data/catalog";
import { families } from "@/data/families";
import { sectors } from "@/data/sectors";
import type { FamilySlug, Product, SectorSlug } from "@/lib/types";
import { IS_DEMO, SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/env";
import { rowToProduct, type ProductRow } from "@/lib/backend/mappers";

let cache: { at: number; data: Product[] } | null = null;

async function fetchRemote(): Promise<Product[] | null> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*&active=eq.true&order=position`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
      next: { revalidate: 300, tags: ["products"] },
    });
    if (!res.ok) return null;
    const rows = (await res.json()) as ProductRow[];
    return rows.length ? rows.map(rowToProduct) : null;
  } catch {
    return null;
  }
}

export async function getProducts(): Promise<Product[]> {
  if (IS_DEMO) return seedProducts.filter((p) => p.active);
  if (cache && Date.now() - cache.at < 60_000) return cache.data;
  const remote = await fetchRemote();
  const data = remote ?? seedProducts.filter((p) => p.active);
  cache = { at: Date.now(), data };
  return data;
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  return (await getProducts()).find((p) => p.slug === slug);
}

export async function getFamilyProducts(slug: FamilySlug): Promise<Product[]> {
  return (await getProducts()).filter((p) => p.families.includes(slug));
}

export async function getSectorProducts(slug: SectorSlug): Promise<Product[]> {
  return (await getProducts()).filter((p) => p.sectors.includes(slug));
}

export async function getStats() {
  const list = await getProducts();
  return {
    references: list.length,
    families: families.length,
    sectors: sectors.length,
    withSheet: list.filter((p) => p.technicalSheetUrl).length,
  };
}

export { families, sectors };
