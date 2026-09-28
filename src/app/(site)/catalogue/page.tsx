import Link from "next/link";
import { getProducts, getStats } from "@/lib/catalog";
import { CatalogExplorer } from "@/components/catalog/CatalogExplorer";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Ruler } from "@/components/ui/Ruler";
import { pageMeta } from "@/lib/seo";
import { families } from "@/data/families";

export const metadata = pageMeta({
  title: "Catalogue produits d'entretien et nettoyants techniques",
  description:
    "Toutes les références MCI Sète : aérosols, décapants, détartrants, désinfectants, biocides, absorbants, produits bio. Recherche par usage, filtres, fiches techniques et commande pro.",
  path: "/catalogue",
});

export default async function CataloguePage() {
  const [products, stats] = await Promise.all([getProducts(), getStats()]);
  return (
    <>
      <div className="wrap pb-8 pt-8 lg:pt-12">
        <Breadcrumb items={[{ name: "Accueil", path: "/" }, { name: "Catalogue", path: "/catalogue" }]} />
        <div className="grid-12 mt-8 gap-y-6">
          <h1 className="t-h1 col-span-12 lg:col-span-7">Le catalogue, référence par référence.</h1>
          <div className="col-span-12 flex flex-col justify-end gap-4 lg:col-span-4 lg:col-start-9">
            <p className="text-ink/80">Cherchez par nom, par surface ou par problème (« graffiti », « fosse septique », « gymnase »). Chaque ligne s&apos;ajoute au bon de commande.</p>
            <Link href="/commande-rapide" className="link-u font-semibold">
              Vous connaissez vos références ? Commande rapide →
            </Link>
          </div>
        </div>
        <Ruler className="mt-8 border-y border-rule py-3" items={[`${stats.references} RÉFÉRENCES`, `${stats.families} FAMILLES`, `${stats.withSheet} FICHES TECHNIQUES EN LIGNE`, "FDS SUR DEMANDE"]} />
        <nav aria-label="Familles" className="mt-6 flex flex-wrap gap-2">
          {families.map((f) => (
            <Link key={f.slug} href={`/catalogue/${f.slug}`} className="rounded-tech border border-rule bg-white px-3 py-1 text-sm hover:border-ink">
              {f.name}
            </Link>
          ))}
        </nav>
      </div>
      <CatalogExplorer products={products} />
    </>
  );
}
