"use client";
import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/lib/types";
import { ProductVisual } from "./ProductVisual";
import { PropertyBadges } from "./PropertyBadges";
import { SheetButton } from "./PdfViewer";
import { AddToCartButton } from "@/components/cart/AddToCart";
import { Stepper } from "@/components/ui/Stepper";
import { Select } from "@/components/ui/Field";
import { formatLabels } from "@/data/properties";
import { familyBySlug } from "@/data/families";
import { usePrice } from "@/lib/store/session";
import { formatEur } from "@/lib/format";
import { cx } from "@/lib/cx";

/** Gabarit de colonnes partagé par l'en-tête et les lignes (tableau à partir de xl). */
const cols = "xl:grid-cols-[64px_minmax(0,1fr)_116px_152px_100px_112px] xl:gap-x-4";

function PriceTag({ productId, packagingId }: { productId: string; packagingId: string }) {
  const price = usePrice(productId, packagingId);
  if (price == null) return null;
  return <span className="whitespace-nowrap text-sm font-semibold tabular-nums">{formatEur(price)} HT</span>;
}

/** Ligne dense du catalogue : les acheteurs pros scannent. */
export function ProductRow({ product, priority = false }: { product: Product; priority?: boolean }) {
  const [pack, setPack] = useState(product.packagings[0]?.id ?? "");
  const [qty, setQty] = useState(1);
  const id = `row-${product.slug}`;
  return (
    <li
      data-product-row
      className={cx(
        "grid grid-cols-[56px_minmax(0,1fr)] gap-x-3 gap-y-3 px-3 py-4 transition-colors duration-150 ease-out hover:bg-salt sm:grid-cols-[64px_minmax(0,1fr)] sm:gap-x-4 sm:px-4 xl:items-center xl:py-3",
        cols,
      )}
    >
      <Link
        href={`/produit/${product.slug}`}
        className="plate grid size-14 place-items-center self-start overflow-hidden rounded-[6px] border border-rule sm:size-16 xl:self-center"
        tabIndex={-1}
        aria-hidden="true"
      >
        <ProductVisual product={product} size={64} priority={priority} alt="" className="size-12 sm:size-14" />
      </Link>

      <div className="min-w-0">
        <Link href={`/produit/${product.slug}`} className="group/name block">
          <span className="t-code block text-lg leading-tight text-mci group-hover/name:underline group-hover/name:underline-offset-4">{product.code}</span>
          <span className="block font-semibold leading-snug">{product.short}</span>
        </Link>
        <p className="mt-0.5 line-clamp-2 text-sm text-ink/70 md:line-clamp-1">{product.description}</p>
        <div className="mt-2 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5">
          <span className="text-xs font-medium text-ink/70">{product.formats.map((f) => formatLabels[f]).join(" · ")}</span>
          <PropertyBadges properties={product.properties} />
        </div>
      </div>

      {/* Commande : bloc replié sous le produit, puis colonnes du tableau à partir de xl */}
      <div className="col-span-2 flex min-w-0 flex-wrap items-center gap-2 sm:col-span-1 sm:col-start-2 xl:contents">
        <div className="shrink-0 xl:justify-self-start">
          <SheetButton url={product.technicalSheetUrl} code={product.code} />
        </div>
        <div className="min-w-0 flex-1 basis-40 xl:w-full xl:basis-auto">
          <label htmlFor={`${id}-pack`} className="sr-only">
            Conditionnement {product.code}
          </label>
          <Select id={`${id}-pack`} value={pack} onChange={(e) => setPack(e.target.value)} fieldSize="sm">
            {product.packagings.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="shrink-0">
          <Stepper size="sm" value={qty} onChange={setQty} label={`Quantité ${product.code}`} />
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1 xl:items-stretch">
          <AddToCartButton product={product} packagingId={pack} quantity={qty} size="sm" className="xl:w-full" />
          <PriceTag productId={product.id} packagingId={pack} />
        </div>
      </div>
    </li>
  );
}

/** Vue liste : tableau dense (en-tête de colonnes à partir de xl, lignes filetées). */
export function ProductTable({ products, priorityCount = 3 }: { products: Product[]; priorityCount?: number }) {
  return (
    <div className="overflow-hidden rounded-[8px] border border-rule bg-white">
      <div aria-hidden="true" className={cx("hidden border-b border-rule bg-steel/60 px-4 py-2.5 text-xs font-semibold text-ink/70 xl:grid", cols)}>
        <span className="col-span-2">Produit</span>
        <span>Fiche technique</span>
        <span>Conditionnement</span>
        <span>Quantité</span>
        <span>Bon de commande</span>
      </div>
      <ul className="divide-y divide-rule">
        {products.map((p, i) => (
          <ProductRow key={p.id} product={p} priority={i < priorityCount} />
        ))}
      </ul>
    </div>
  );
}

/** Vue grille visuelle */
export function ProductCard({ product }: { product: Product }) {
  const [pack, setPack] = useState(product.packagings[0]?.id ?? "");
  const family = familyBySlug.get(product.families[0]!);
  return (
    <li data-product-row className="tile tile-hover flex min-w-0 flex-col">
      <Link href={`/produit/${product.slug}`} className="group flex flex-1 flex-col">
        <span className="plate grid h-44 place-items-center border-b border-rule p-4 sm:h-48">
          <ProductVisual
            product={product}
            size={200}
            sizes="(max-width: 640px) 60vw, 200px"
            alt=""
            className="h-36 w-auto transition-transform duration-200 ease-out group-hover:scale-[1.03] sm:h-40"
          />
        </span>
        <span className="flex flex-1 flex-col p-4 sm:p-5">
          {family ? <span className="text-xs font-semibold text-ink/70">{family.name}</span> : null}
          <span className="t-code mt-1 text-2xl leading-none text-ink group-hover:text-mci">{product.code}</span>
          <span className="mt-1 text-sm text-ink/80">{product.short}</span>
          <PropertyBadges properties={product.properties} className="mt-3" />
        </span>
      </Link>
      <div className="absolute right-3 top-3">
        <SheetButton url={product.technicalSheetUrl} code={product.code} />
      </div>
      <div className="flex flex-wrap items-center gap-2 border-t border-rule p-3">
        <label className="sr-only" htmlFor={`card-${product.slug}-pack`}>
          Conditionnement {product.code}
        </label>
        <select
          id={`card-${product.slug}-pack`}
          value={pack}
          onChange={(e) => setPack(e.target.value)}
          className="h-9 min-w-0 flex-1 basis-24 cursor-pointer rounded-[6px] border border-rule bg-white px-2 text-sm transition-colors duration-150 ease-out hover:border-ink/40"
        >
          {product.packagings.map((k) => (
            <option key={k.id} value={k.id}>
              {k.label}
            </option>
          ))}
        </select>
        <AddToCartButton product={product} packagingId={pack} size="sm" label="Ajouter" />
      </div>
    </li>
  );
}
