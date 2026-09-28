import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/catalog";
import { families } from "@/data/families";
import { sectors } from "@/data/sectors";
import { SITE_URL } from "@/lib/env";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();
  const now = new Date();
  const page = (path: string, priority: number, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = "monthly") => ({ url: `${SITE_URL}${path}`, lastModified: now, changeFrequency, priority });
  return [
    page("/", 1, "weekly"),
    page("/catalogue", 0.9, "weekly"),
    page("/commande-rapide", 0.6),
    page("/societe", 0.6),
    page("/contact", 0.6),
    ...families.map((f) => page(`/catalogue/${f.slug}`, 0.8, "weekly")),
    ...sectors.map((s) => page(`/secteurs/${s.slug}`, 0.8)),
    ...products.map((p) => page(`/produit/${p.slug}`, 0.7)),
    page("/mentions-legales", 0.2, "yearly"),
    page("/cgv", 0.2, "yearly"),
    page("/confidentialite", 0.2, "yearly"),
  ];
}
