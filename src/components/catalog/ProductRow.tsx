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
import { usePrice } from "@/lib/store/session";
import { formatEur } from "@/lib/format";

function PriceTag({ productId, packagingId }: { productId: string; packagingId: string }) {
  const price = usePrice(productId, packagingId);
  if (price == null) return null;
  return <span className="t-mono text-sm">{formatEur(price)} HT</span>;
}

/** Ligne dense du catalogue : les acheteurs pros scannent. */
export function ProductRow({ product, priority = false }: { product: Product; priority?: boolean }) {
  const [pack, setPack] = useState(product.packagings[0]?.id ?? "");
  const [qty, setQty] = useState(1);
  const id = `row-${product.slug}`;
  return (
    <li data-product-row className="grid grid-cols-[64px_1fr] gap-x-4 gap-y-3 border-b border-rule py-4 md:grid-cols-[72px_minmax(0,1fr)_auto] md:items-center lg:grid-cols-[72px_minmax(0,1.3fr)_minmax(0,0.9fr)_auto]">
      <Link href={`/produit/${product.slug}`} className="row-span-2 self-start rounded-tech bg-white md:row-span-1" tabIndex={-1} aria-hidden="true">
        <ProductVisual product={product} size={72} priority={priority} alt="" className="size-16 md:size-18" />
      </Link>
      <div className="min-w-0">
        <Link href={`/produit/${product.slug}`} className="group">
          <span className="t-code text-mci group-hover:underline">{product.code}</span>
          <span className="block font-semibold leading-snug">{product.short}</span>
        </Link>
        <p className="mt-1 line-clamp-2 text-sm text-ink/80">{product.description}</p>
      </div>
      <div className="col-start-2 flex flex-wrap items-center gap-x-3 gap-y-2 md:col-start-2 lg:col-start-3">
        <span className="t-mono text-xs text-ink/70">{product.formats.map((f) => formatLabels[f].toUpperCase()).join(" · ")}</span>
        <PropertyBadges properties={product.properties} />
      </div>
      <div className="col-span-2 flex flex-wrap items-center gap-2 md:col-span-1 md:col-start-3 md:row-start-1 md:row-span-2 md:justify-end lg:col-start-4 lg:row-span-1">
        <SheetButton url={product.technicalSheetUrl} code={product.code} />
        <label htmlFor={`${id}-pack`} className="sr-only">
          Conditionnement {product.code}
        </label>
        <div className="w-40">
          <Select id={`${id}-pack`} value={pack} onChange={(e) => setPack(e.target.value)} fieldSize="sm">
            {product.packagings.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </Select>
        </div>
        <Stepper size="sm" value={qty} onChange={setQty} label={`Quantité ${product.code}`} />
        <AddToCartButton product={product} packagingId={pack} quantity={qty} size="sm" />
        <PriceTag productId={product.id} packagingId={pack} />
      </div>
    </li>
  );
}

/** Vue grille visuelle */
export function ProductCard({ product }: { product: Product }) {
  const pack = product.packagings[0]?.id ?? "";
  return (
    <li data-product-row className="flex flex-col rounded-box border border-rule bg-white">
      <Link href={`/produit/${product.slug}`} className="group flex flex-1 flex-col p-4">
        <span className="grid aspect-square place-items-center bg-salt">
          <ProductVisual product={product} size={200} sizes="(max-width: 640px) 45vw, 220px" alt="" className="h-4/5 w-4/5" />
        </span>
        <span className="t-code mt-4 text-sm text-mci group-hover:underline">{product.code}</span>
        <span className="font-semibold leading-snug">{product.short}</span>
        <PropertyBadges properties={product.properties} className="mt-2" />
      </Link>
      <div className="flex items-center justify-between gap-2 border-t border-rule p-3">
        <SheetButton url={product.technicalSheetUrl} code={product.code} />
        <AddToCartButton product={product} packagingId={pack} size="sm" label="Ajouter" />
      </div>
    </li>
  );
}
