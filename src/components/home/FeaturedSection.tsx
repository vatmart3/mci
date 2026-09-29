"use client";
import Link from "next/link";
import { useState } from "react";
import { ProductVisual } from "@/components/catalog/ProductVisual";
import { PropertyBadges } from "@/components/catalog/PropertyBadges";
import { AddToCartButton } from "@/components/cart/AddToCart";
import { Icon } from "@/components/ui/Icon";
import { familyBySlug } from "@/data/families";
import type { MiniProduct } from "./showcase-data";
import { cx } from "@/lib/cx";

function ProductCard({ p }: { p: MiniProduct }) {
  const [pack, setPack] = useState(p.packagings[0]!.id);
  return (
    <article className="tile tile-hover flex h-full flex-col">
      <Link href={`/produit/${p.slug}`} className="group flex flex-1 flex-col">
        <span className="plate grid h-52 place-items-center border-b border-rule p-4">
          <ProductVisual product={p} size={220} sizes="(max-width: 640px) 60vw, 220px" alt={`${p.code} — ${p.short}`} className="h-44 w-auto transition-transform duration-200 ease-out group-hover:scale-[1.03]" />
        </span>
        <span className="flex flex-1 flex-col p-5">
          <span className="t-code text-2xl leading-none text-ink group-hover:text-mci">{p.code}</span>
          <span className="mt-1 text-sm text-ink/80">{p.short}</span>
          <span className="mt-1 text-xs text-ink/65">{familyBySlug.get(p.families[0]!)?.name}</span>
          <PropertyBadges properties={p.properties} className="mt-3" />
        </span>
      </Link>
      <div className="flex items-center gap-2 border-t border-rule p-3">
        <label className="sr-only" htmlFor={`fp-${p.id}`}>
          Conditionnement {p.code}
        </label>
        <select id={`fp-${p.id}`} value={pack} onChange={(e) => setPack(e.target.value)} className="h-9 min-w-0 flex-1 cursor-pointer rounded-[6px] border border-rule bg-white px-2 text-sm">
          {p.packagings.map((k) => (
            <option key={k.id} value={k.id}>
              {k.label}
            </option>
          ))}
        </select>
        <AddToCartButton product={p} packagingId={pack} size="sm" />
      </div>
    </article>
  );
}

/** Sélection de produits phares, ajoutables au bon sans quitter l'accueil. */
export function FeaturedSection({ products }: { products: MiniProduct[] }) {
  const [page, setPage] = useState(0);
  const perPage = 4;
  const pages = Math.ceil(products.length / perPage);
  return (
    <section aria-labelledby="phares-title" className="py-16 lg:py-24">
      <div className="wrap">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 id="phares-title" className="t-h1">
              Produits phares
            </h2>
            <p className="t-lead mt-3 max-w-[58ch] text-ink/70">Choisissez le conditionnement et ajoutez au bon de commande directement.</p>
          </div>
          {pages > 1 ? (
            <div className="hidden items-center gap-2 lg:flex">
              <span className="mr-2 text-sm text-ink/70 tabular-nums">
                {page + 1} / {pages}
              </span>
              <button type="button" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="grid size-11 place-items-center rounded-[6px] border border-rule bg-white transition-colors duration-150 hover:border-ink disabled:opacity-40" aria-label="Produits précédents">
                <Icon name="chevronRight" size={18} className="rotate-180" />
              </button>
              <button type="button" onClick={() => setPage((p) => Math.min(pages - 1, p + 1))} disabled={page === pages - 1} className="grid size-11 place-items-center rounded-[6px] border border-rule bg-white transition-colors duration-150 hover:border-ink disabled:opacity-40" aria-label="Produits suivants">
                <Icon name="chevronRight" size={18} />
              </button>
            </div>
          ) : null}
        </div>

        {/* mobile : défilement horizontal aimanté ; ordinateur : pages de quatre */}
        <ul className="snap-row -mx-[var(--margin)] mt-10 gap-4 px-[var(--margin)] pb-2 lg:hidden [scroll-padding-inline:var(--margin)]">
          {products.map((p) => (
            <li key={p.id} className="w-[min(78vw,300px)] shrink-0">
              <ProductCard p={p} />
            </li>
          ))}
        </ul>
        <ul className="mt-10 hidden grid-cols-4 gap-6 lg:grid">
          {products.map((p, i) => (
            <li key={p.id} className={cx(Math.floor(i / perPage) !== page && "hidden", "min-w-0 animate-fade")}>
              <ProductCard p={p} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
