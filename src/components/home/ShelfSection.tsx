import Link from "next/link";
import { ProductVisual } from "@/components/catalog/ProductVisual";
import { Icon } from "@/components/ui/Icon";
import type { MiniProduct } from "./showcase-data";

export interface ShelfGroup {
  slug: string;
  name: string;
  code: string;
  count: number;
  intro?: string;
  products: MiniProduct[];
}

/** Le catalogue par famille : neuf entrées illustrées par les vrais produits de chaque famille. */
export function ShelfSection({ groups, total }: { groups: ShelfGroup[]; total: number }) {
  const stocked = groups.filter((g) => g.count > 0);
  const onRequest = groups.filter((g) => g.count === 0);
  // la bande « hors ligne » comble la dernière rangée de la grille (2 colonnes en sm, 3 en lg)
  const smSpan = ["sm:col-span-2", "sm:col-span-1"][stocked.length % 2];
  const lgSpan = ["lg:col-span-3", "lg:col-span-2", "lg:col-span-1"][stocked.length % 3];
  return (
    <section aria-labelledby="gamme-title" className="bg-salt py-16 lg:py-24">
      <div className="wrap">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 id="gamme-title" className="t-h1">
              Le catalogue, famille par famille
            </h2>
            <p className="t-lead mt-3 max-w-[58ch] text-ink/70">{total} références classées par usage, avec leur fiche technique et leurs conditionnements.</p>
          </div>
          <Link href="/catalogue" className="inline-flex h-11 shrink-0 items-center gap-2 self-start rounded-[6px] border border-rule bg-white px-5 font-semibold transition-colors duration-150 hover:border-ink md:self-auto">
            Tout le catalogue <Icon name="arrow" size={18} />
          </Link>
        </div>

        <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {stocked.map((g) => {
            return (
              <li key={g.slug} className="min-w-0">
                <Link href={`/catalogue/${g.slug}`} className="tile tile-hover group flex h-full flex-col">
                  <span className="plate relative flex h-44 items-end justify-center overflow-hidden border-b border-rule px-6 pt-6">
                    {g.products.slice(0, 3).map((p, k) => (
                        <span key={p.slug} className="relative -mx-3 w-[34%] transition-transform duration-200 ease-out group-hover:-translate-y-1" style={{ zIndex: k === 1 ? 2 : 1, marginBottom: k === 1 ? 10 : 0 }}>
                          <ProductVisual product={p} size={180} sizes="(max-width: 640px) 30vw, 140px" alt="" className="h-auto w-full drop-shadow-[0_12px_12px_rgb(22_35_45/0.18)]" />
                        </span>
                    ))}
                  </span>
                  <span className="flex flex-1 flex-col p-5">
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="font-display text-xl font-bold leading-tight group-hover:text-mci">{g.name}</span>
                      <span className="shrink-0 text-sm font-semibold text-ink/70 tabular-nums">{g.count} produits</span>
                    </span>
                    {g.intro ? <span className="mt-2 line-clamp-2 text-sm text-ink/70">{g.intro}</span> : null}
                  </span>
                </Link>
              </li>
            );
          })}
          {onRequest.length ? (
            <li className={`min-w-0 ${smSpan} ${lgSpan}`}>
              <div className="flex h-full flex-col justify-between gap-5 rounded-[12px] border border-rule bg-white p-6">
                <div className="flex items-start gap-4">
                  <span className="grid size-12 shrink-0 place-items-center rounded-[8px] bg-sky/60 text-mci">
                    <Icon name="search" size={24} />
                  </span>
                  <p className="max-w-[70ch]">
                    <span className="block font-display text-xl font-bold leading-tight">Un produit qui n&apos;est pas en ligne ?</span>
                    <span className="mt-1 block text-ink/75">
                      {onRequest.map((g, i) => (
                        <span key={g.slug}>
                          {i > 0 ? (i === onRequest.length - 1 ? " et " : ", ") : null}
                          <Link href={`/catalogue/${g.slug}`} className="link-u">
                            {g.name}
                          </Link>
                        </span>
                      ))}
                      {onRequest.length > 1 ? " sont proposés" : " est proposé"} sur demande. Plus largement, MCI cherche avec vous le produit adapté à votre surface.
                    </span>
                  </p>
                </div>
                <Link href="/contact?objet=conseil" className="inline-flex h-11 shrink-0 items-center gap-2 self-start rounded-[6px] bg-mci px-5 font-semibold text-white transition-colors duration-150 hover:bg-deep">
                  Décrire mon besoin <Icon name="arrow" size={18} />
                </Link>
              </div>
            </li>
          ) : null}
        </ul>
      </div>
    </section>
  );
}
