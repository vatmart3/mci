import { existsSync } from "node:fs";
import path from "node:path";
import { getProducts, getStats } from "@/lib/catalog";
import { families } from "@/data/families";
import { sectors } from "@/data/sectors";
import { company } from "@/data/company";
import type { SectorSlug } from "@/lib/types";
import { Hero } from "@/components/home/Hero";
import { SectorsSection } from "@/components/home/SectorsSection";
import { ShelfSection, type ShelfGroup } from "@/components/home/ShelfSection";
import { FeaturedSection } from "@/components/home/FeaturedSection";
import { OrderSection } from "@/components/home/OrderSection";
import { PublicBuyersSection } from "@/components/home/PublicBuyersSection";
import { DocumentsSection } from "@/components/home/DocumentsSection";
import { TeamSection } from "@/components/home/TeamSection";
import { toMini } from "@/components/home/showcase-data";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "MCI Sète — Nettoyants techniques et produits d'entretien professionnels",
  description:
    "Nettoyants techniques, désinfectants, biocides et traitements de maintenance pour mairies, écoles, industries, caves, campings et nautisme. Catalogue, fiches techniques et commande pro en ligne, depuis Sète.",
  path: "/",
});

// composition du bandeau, de gauche à droite (le bidon DG90 au centre, au premier plan)
const heroPicks = ["cst", "sanikel-renforce", "dg90", "kermex", "super-granul"];
// fiches techniques mises en avant dans la section documents
const sheetPicks = ["dg90", "kermex", "detag", "super-granul", "ecodyl", "oxychoc"];

export default async function HomePage() {
  const [all, stats] = await Promise.all([getProducts(), getStats()]);
  const active = all.filter((p) => p.active);
  const by = new Map(active.map((p) => [p.slug, p]));
  const pick = (slugs: string[]) => slugs.flatMap((s) => (by.get(s) ? [toMini(by.get(s)!)] : []));

  const hero = pick(heroPicks).map((p) => ({ p }));

  const counts = Object.fromEntries(sectors.map((s) => [s.slug, active.filter((p) => p.sectors.includes(s.slug)).length])) as Record<SectorSlug, number>;

  const groups: ShelfGroup[] = [...families]
    .sort((a, b) => a.position - b.position)
    .map((f) => {
      const inFamily = active.filter((p) => p.families.includes(f.slug));
      const ordered = [...inFamily.filter((p) => p.featured), ...inFamily.filter((p) => !p.featured)];
      return { slug: f.slug, name: f.name, code: f.code, intro: f.intro, count: inFamily.length, products: ordered.slice(0, 3).map(toMini) };
    })
    // familles garnies d'abord, gammes sur demande en fin de grille
    .sort((a, b) => Number(b.count > 0) - Number(a.count > 0));

  const featured = active.filter((p) => p.featured).slice(0, 8).map(toMini);
  const sheets = pick(sheetPicks).filter((p) => p.technicalSheetUrl);

  const teamLocal = existsSync(path.join(process.cwd(), "public", company.photos.team.local));
  const photo = teamLocal ? company.photos.team.local : company.photos.team.remote;

  return (
    <>
      <Hero products={hero} stats={stats} />
      <SectorsSection counts={counts} />
      <ShelfSection groups={groups} total={stats.references} />
      <FeaturedSection products={featured} />
      <PublicBuyersSection />
      <OrderSection />
      <DocumentsSection sheets={sheets} withSheet={stats.withSheet} references={stats.references} />
      <TeamSection photo={photo} />
    </>
  );
}
