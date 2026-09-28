import Link from "next/link";
import { ProductVisual } from "@/components/catalog/ProductVisual";
import { Icon } from "@/components/ui/Icon";
import type { MiniProduct } from "./showcase-data";
import { cx } from "@/lib/cx";

export interface ShelfGroup {
  slug: string;
  name: string;
  code: string;
  count: number;
  intro?: string;
  products: MiniProduct[];
}

/**
 * La gamme : grille de tuiles arrondies, une par famille. Les packshots se déploient en éventail
 * au survol ; la première famille occupe une tuile large.
 */
export function ShelfSection({ groups, total }: { groups: ShelfGroup[]; total: number }) {
  return (
    <section aria-labelledby="gamme-title" className="py-24 lg:py-32">
      <div className="wrap">
        <div data-reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="t-eyebrow">La gamme</p>
            <h2 id="gamme-title" className="t-h1 mt-3 max-w-[16ch]">
              {total} produits, rangés par usage.
            </h2>
          </div>
          <Link href="/catalogue" className="text-md font-medium text-mci hover:underline">
            Tout le catalogue ›
          </Link>
        </div>

        <ul className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {groups.map((g, i) => {
            const wide = i === 0;
            // la dernière tuile comble la rangée incomplète sur 3 colonnes
            const fill = i === groups.length - 1 && (groups.length + 1) % 3 === 2;
            return (
              <li key={g.slug} data-reveal style={{ "--reveal-delay": `${(i % 3) * 80}ms` } as React.CSSProperties} className={cx(wide && "sm:col-span-2", fill && "lg:col-span-2")}>
                <Link href={`/catalogue/${g.slug}`} className={cx("tile tile-hover group flex h-full min-h-[400px] flex-col bg-salt p-8", wide && "lg:min-h-[440px]")}>
                  <span className="self-start rounded-full bg-white px-3 py-1 text-sm font-medium text-ink/70">{g.count} produits</span>
                  <span className={cx("mt-4 font-display font-semibold tracking-[-0.03em] [text-wrap:balance]", wide ? "t-h2" : "text-[1.75rem] leading-[1.1]")}>{g.name.replace(" – ", " · ")}</span>
                  {g.intro ? <span className={cx("mt-3 text-ink/70", wide ? "max-w-[46ch]" : "line-clamp-3")}>{g.intro}</span> : null}
                  <span className={cx("relative mt-auto flex items-end justify-center pt-8", wide ? "h-56" : "h-44")}>
                    {g.products.slice(0, wide ? 4 : 3).map((p, k, arr) => {
                      const mid = (arr.length - 1) / 2;
                      const off = k - mid;
                      return (
                        <span
                          key={p.slug}
                          className="-mx-2 transition-transform duration-700 ease-out group-hover:[transform:var(--fan)]"
                          style={
                            {
                              width: wide ? "24%" : "34%",
                              transform: `rotate(${off * 5}deg) translateY(${Math.abs(off) * 6}px)`,
                              "--fan": `rotate(${off * 11}deg) translate(${off * 14}px, ${Math.abs(off) * 10 - 10}px)`,
                              zIndex: 10 - Math.round(Math.abs(off) * 2),
                            } as React.CSSProperties
                          }
                        >
                          <ProductVisual product={p} size={220} sizes="(max-width: 640px) 30vw, 180px" alt="" className="h-auto w-full drop-shadow-[0_18px_18px_rgb(10_34_51/0.16)]" />
                        </span>
                      );
                    })}
                  </span>
                  <span className="mt-6 inline-flex items-center gap-1 font-medium text-mci">
                    Voir la famille <Icon name="chevronRight" size={16} />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
