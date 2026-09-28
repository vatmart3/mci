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
      <div className="wrap pb-10 pt-8 lg:pb-12 lg:pt-12">
        <Breadcrumb items={[{ name: "Accueil", path: "/" }, { name: "Catalogue", path: "/catalogue" }]} />
        <div className="mt-10 grid grid-cols-1 gap-8 lg:mt-14 lg:grid-cols-12 lg:items-end lg:gap-x-6">
          <div data-reveal className="min-w-0 lg:col-span-7">
            <p className="t-eyebrow">Catalogue</p>
            <h1 className="t-h1 mt-3 max-w-[16ch]">Le catalogue, référence par référence.</h1>
          </div>
          <div data-reveal className="flex min-w-0 flex-col gap-5 lg:col-span-5" style={{ "--reveal-delay": "120ms" } as React.CSSProperties}>
            <p className="t-lead text-ink/70">Cherchez par nom, par surface ou par problème (« graffiti », « fosse septique », « gymnase »). Chaque ligne s&apos;ajoute au bon de commande.</p>
            <Link href="/commande-rapide" className="link-u inline-flex items-center gap-1.5 font-medium">
              Vous connaissez vos références ? Commande rapide
              <Icon name="chevronRight" size={16} />
            </Link>
          </div>
        </div>

        <ul data-reveal className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:mt-12" style={{ "--reveal-delay": "180ms" } as React.CSSProperties}>
          {figures.map((f) => (
            <li key={f.label} className="min-w-0 rounded-box bg-salt px-5 py-4">
              <span className="t-num block text-[2rem] sm:text-[2.5rem]">{f.n}</span>
              <span className="mt-1 block text-sm text-ink/70">{f.label}</span>
            </li>
          ))}
          <li className="flex min-w-0 flex-col justify-between rounded-box bg-salt px-5 py-4">
            <Icon name="doc" size={28} className="text-mci" />
            <span className="mt-1 block text-sm text-ink/70">FDS sur demande</span>
          </li>
        </ul>

        <nav aria-label="Familles" className="mt-6">
          <ul className="snap-row -mx-[var(--margin)] gap-2 px-[var(--margin)] scroll-px-[var(--margin)] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
            {families.map((f) => (
              <li key={f.slug} className="shrink-0">
                <Link
                  href={`/catalogue/${f.slug}`}
                  className="inline-flex h-10 items-center whitespace-nowrap rounded-full bg-salt px-4 text-sm font-medium text-ink transition-colors duration-300 ease-out hover:bg-ink hover:text-white"
                >
                  {f.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <CatalogExplorer products={products} />
    </>
  );
}
