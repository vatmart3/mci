"use client";
import { createContext, useContext, useState } from "react";
import dynamic from "next/dynamic";
import type { Product } from "@/lib/types";
import { AddToCartButton } from "@/components/cart/AddToCart";
import { Stepper } from "@/components/ui/Stepper";
import { Icon } from "@/components/ui/Icon";
import { usePrice, useSession } from "@/lib/store/session";
import { formatEur } from "@/lib/format";
import { cx } from "@/lib/cx";
import { ProductVisual } from "./ProductVisual";

const ProductViewer3D = dynamic(() => import("@/components/three/ProductViewer3D").then((m) => m.ProductViewer3D), {
  ssr: false,
  loading: () => null,
});

interface Ctx {
  pack: string;
  setPack: (p: string) => void;
}
const PackCtx = createContext<Ctx>({ pack: "", setPack: () => undefined });

export function ProductStageProvider({ product, children }: { product: Product; children: React.ReactNode }) {
  const [pack, setPack] = useState(product.packagings[0]?.id ?? "");
  return <PackCtx.Provider value={{ pack, setPack }}>{children}</PackCtx.Provider>;
}

/** Visuel principal : contenant 3D interactif (rotation au drag), repli packshot. */
export function ProductViewer({ product }: { product: Product }) {
  const { pack } = useContext(PackCtx);
  const packaging = product.packagings.find((p) => p.id === pack) ?? product.packagings[0]!;
  const [ready, setReady] = useState(false);
  return (
    <figure className="relative aspect-square w-full overflow-hidden rounded-tile bg-salt">
      <div className={cx("absolute inset-0 grid place-items-center transition-opacity duration-500 ease-out", ready ? "opacity-0" : "opacity-100")}>
        <ProductVisual product={product} size={520} priority sizes="(max-width: 1024px) 90vw, 45vw" className="h-4/5 w-4/5" alt={`${product.code} — ${product.short}, ${packaging.label}`} />
      </div>
      {product.imageUrl ? null : <ProductViewer3D product={product} container={packaging.container} onReady={() => setReady(true)} />}
      <figcaption className="pointer-events-none absolute inset-x-3 bottom-3 flex items-center justify-between gap-2 text-xs sm:inset-x-5 sm:bottom-5">
        <span className="glass inline-flex min-w-0 items-center gap-2 rounded-full px-3 py-1.5 text-ink/80 shadow-sheet">
          <span className="t-code shrink-0 text-ink">{product.code}</span>
          <span aria-hidden="true" className="text-ink/30">
            ·
          </span>
          <span className="truncate">{packaging.short}</span>
        </span>
        <span aria-hidden="true" className={cx("glass hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-ink/70 transition-opacity duration-500 sm:inline-flex", ready ? "opacity-100" : "opacity-0")}>
          <Icon name="repeat" size={14} />
          Glisser pour tourner
        </span>
      </figcaption>
    </figure>
  );
}

/** Bloc commande collant */
export function OrderPanel({ product }: { product: Product }) {
  const { pack, setPack } = useContext(PackCtx);
  const [qty, setQty] = useState(1);
  const price = usePrice(product.id, pack);
  const priceMode = useSession((s) => s.settings.priceMode);
  return (
    <div data-product-row className="rounded-tile bg-salt p-5 sm:p-7">
      <fieldset>
        <legend className="mb-3 text-sm font-semibold text-ink">
          Conditionnement
        </legend>
        <div className="flex flex-wrap gap-2">
          {product.packagings.map((p) => (
            <label
              key={p.id}
              className={cx(
                "cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition-[background-color,color,box-shadow] duration-300 ease-out has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-mci",
                pack === p.id ? "bg-ink text-white shadow-sheet" : "bg-white text-ink ring-1 ring-black/10 hover:ring-ink/40",
              )}
            >
              <input type="radio" name="packaging" value={p.id} checked={pack === p.id} onChange={() => setPack(p.id)} className="sr-only" />
              {p.label}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Stepper value={qty} onChange={setQty} label={`Quantité ${product.code}`} />
        <AddToCartButton product={product} packagingId={pack} quantity={qty} size="lg" label="Ajouter au bon de commande" className="min-w-0 flex-1 basis-60 whitespace-normal! text-center leading-tight" />
      </div>
      <p className="mt-4 flex items-start gap-2 text-sm text-ink/70">
        <Icon name="info" size={16} className="mt-0.5 shrink-0" />
        {price != null ? (
          <span>
            <span className="font-semibold tabular-nums text-ink">{formatEur(price)} HT</span> l&apos;unité · {formatEur(price * qty)} HT pour {qty}
          </span>
        ) : priceMode === "per_account" ? (
          <span>Prix visibles une fois votre compte pro validé. Sinon, MCI confirme le tarif après envoi du bon.</span>
        ) : (
          <span>Prix et délai confirmés par MCI après envoi du bon. Conditionnements indicatifs, validés à la confirmation.</span>
        )}
      </p>
    </div>
  );
}
