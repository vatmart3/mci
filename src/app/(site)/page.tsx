import { existsSync } from "node:fs";
import path from "node:path";
import { getProducts, getStats } from "@/lib/catalog";
import { families } from "@/data/families";
import { sectors } from "@/data/sectors";
import { company } from "@/data/company";
import type { SectorSlug } from "@/lib/types";
import { Hero } from "@/components/home/Hero";
import { StorySection, type Chapter } from "@/components/home/StorySection";
import { SectorsSection } from "@/components/home/SectorsSection";
import { BentoSection } from "@/components/home/BentoSection";
import { ShelfSection, type ShelfGroup } from "@/components/home/ShelfSection";
import { OrderSection } from "@/components/home/OrderSection";
import { TeamSection } from "@/components/home/TeamSection";
import { CtaSection } from "@/components/home/CtaSection";
import { toMini } from "@/components/home/showcase-data";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "MCI Sète — Nettoyants techniques et produits d'entretien professionnels",
  description:
    "Nettoyants techniques, désinfectants, biocides et traitements de maintenance pour mairies, écoles, industries, caves, campings et nautisme. Catalogue, fiches techniques et commande pro en ligne, depuis Sète.",
  path: "/",
});

// arc du hero : le bidon DG90 au centre
const heroPicks: [string, string?][] = [
  ["cst"],
  ["sanikel-renforce", "1l"],
  ["dg90", "5l"],
  ["kermex", "20l"],
  ["super-granul"],
];

// histoire défilée : un geste, un produit
const storyPicks: [string, string, string?][] = [
  ["Dégraisser.", "dg90", "5l"],
  ["Désinfecter.", "ecodyl"],
  ["Démousser.", "kermex", "20l"],
  ["Dégripper.", "cst"],
  ["Absorber.", "super-granul"],
];

// ordre de visite du rayon (brief §8.4)
const shelfOrder = ["aerosols", "decapants-detartrants", "detergents-desinfectants", "desherbants-insecticides-biocides", "absorbants", "produits-bio", "surodorants-shampooings"] as const;

export default async function HomePage() {
  const [all, stats] = await Promise.all([getProducts(), getStats()]);
  const by = new Map(all.map((p) => [p.slug, p]));

  const hero = heroPicks.flatMap(([slug, pack]) => {
    const p = by.get(slug);
    return p ? [{ p: toMini(p), pack }] : [];
  });

  const chapters: Chapter[] = storyPicks.flatMap(([verb, slug, pack]) => {
    const p = by.get(slug);
    return p ? [{ verb, p: toMini(p), pack, usages: p.usages }] : [];
  });

  const selections = Object.fromEntries(sectors.map((s) => [s.slug, all.filter((p) => p.sectors.includes(s.slug)).map(toMini)])) as Record<SectorSlug, ReturnType<typeof toMini>[]>;

  const groups: ShelfGroup[] = shelfOrder.map((slug) => {
    const f = families.find((x) => x.slug === slug)!;
    const inFamily = all.filter((p) => p.families[0] === slug || (slug === "desherbants-insecticides-biocides" && p.families.includes(slug)));
    const picks = [...inFamily.filter((p) => p.featured), ...inFamily.filter((p) => !p.featured)].filter((p, i, arr) => arr.indexOf(p) === i).slice(0, 4);
    return { slug, name: f.name, code: f.code, intro: f.intro, count: all.filter((p) => p.families.includes(slug)).length, products: picks.map(toMini) };
  });

  const facts = {
    references: stats.references,
    withSheet: stats.withSheet,
    food: all.filter((p) => p.properties.includes("contact-alimentaire")).length,
    bio: all.filter((p) => p.properties.includes("bio-vegetal")).length,
    biocontrol: all.filter((p) => p.properties.includes("biocontrole")).length,
    families: stats.families,
  };
  const bentoPicks = ["cst", "dg90", "sanikel-renforce"].flatMap((slug) => {
    const p = by.get(slug);
    return p ? [toMini(p)] : [];
  });

  const teamLocal = existsSync(path.join(process.cwd(), "public", company.photos.team.local));
  const photo = teamLocal ? company.photos.team.local : company.photos.team.remote;

  return (
    <>
      <Hero products={hero} stats={stats} />
      <StorySection chapters={chapters} />
      <SectorsSection selections={selections} />
      <BentoSection facts={facts} picks={bentoPicks} />
      <ShelfSection groups={groups} total={stats.references} />
      <OrderSection />
      <TeamSection photo={photo} />
      <CtaSection />
    </>
  );
}
