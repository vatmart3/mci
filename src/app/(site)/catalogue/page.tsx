import Link from "next/link";
import { getProducts, getStats } from "@/lib/catalog";
import { CatalogExplorer } from "@/components/catalog/CatalogExplorer";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Icon } from "@/components/ui/Icon";
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
  const figures = [
    { n: stats.references, label: "références" },
    { n: stats.families, label: "familles" },
    { n: stats.withSheet, label: "fiches techniques en ligne" },
  ];
  return (
    <>
      <div className="border-b border-rule bg-salt">
        <div className="wrap pb-8 pt-6 lg:pb-10 lg:pt-8">
          <Breadcrumb items={[{ name: "Accueil", path: "/" }, { name: "Catalogue", path: "/catalogue" }]} />
          <div className="mt-6 grid grid-cols-1 gap-6 lg:mt-8 lg:grid-cols-12 lg:items-end lg:gap-x-6">
            <div className="min-w-0 lg:col-span-7">
              <h1 className="t-h1 max-w-[20ch]">Le catalogue, référence par référence</h1>
              <p className="t-lead mt-3 max-w-[60ch] text-ink/70">
                Cherchez par nom, par surface ou par problème (« graffiti », « fosse septique », « gymnase »). Chaque ligne s&apos;ajoute au bon de commande.
              </p>
            </div>
            <div className="min-w-0 lg:col-span-5 lg:justify-self-end">
              <ul className="flex flex-wrap gap-x-6 gap-y-2">
                {figures.map((f) => (
                  <li key={f.label} className="flex min-w-0 items-baseline gap-1.5">
                    <span className="t-num text-2xl">{f.n}</span>
                    <span className="text-sm text-ink/70">{f.label}</span>
                  </li>
                ))}
                <li className="flex min-w-0 items-baseline text-sm text-ink/70">FDS sur demande</li>
              </ul>
              <Link href="/commande-rapide" className="link-u mt-4 inline-flex items-center gap-1.5 text-sm font-semibold">
                Vous connaissez vos références ? Commande rapide
                <Icon name="chevronRight" size={16} />
              </Link>
            </div>
          </div>

          <nav aria-label="Familles" className="mt-8">
            <ul className="snap-row -mx-[var(--margin)] gap-2 px-[var(--margin)] scroll-px-[var(--margin)] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
              {families.map((f) => (
                <li key={f.slug} className="shrink-0">
                  <Link
                    href={`/catalogue/${f.slug}`}
                    className="inline-flex h-9 items-center whitespace-nowrap rounded-[6px] border border-rule bg-white px-3 text-sm font-medium text-ink transition-colors duration-150 ease-out hover:border-mci hover:text-mci"
                  >
                    {f.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
      <div className="pb-16 pt-8 lg:pb-24 lg:pt-10">
        <CatalogExplorer products={products} />
      </div>
    </>
  );
}
