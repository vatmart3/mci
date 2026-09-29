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
    <div>
      <figure className="plate relative aspect-square w-full overflow-hidden rounded-[12px] border border-rule">
        <div className={cx("absolute inset-0 grid place-items-center transition-opacity duration-200 ease-out", ready ? "opacity-0" : "opacity-100")}>
          <ProductVisual product={product} size={520} priority sizes="(max-width: 1024px) 90vw, 45vw" className="h-4/5 w-4/5" alt={`${product.code} — ${product.short}, ${packaging.label}`} />
        </div>
        {product.imageUrl ? null : <ProductViewer3D product={product} container={packaging.container} onReady={() => setReady(true)} />}
        <figcaption className="pointer-events-none absolute inset-x-3 bottom-3 flex items-center justify-between gap-2 text-xs sm:inset-x-4 sm:bottom-4">
          <span className="inline-flex min-w-0 items-center gap-2 rounded-[4px] border border-rule bg-white px-2.5 py-1 text-ink/80">
            <span className="t-code shrink-0 text-ink">{product.code}</span>
            <span aria-hidden="true" className="text-ink/40">
              ·
            </span>
            <span className="truncate">{packaging.short}</span>
          </span>
          <span aria-hidden="true" className={cx("hidden items-center gap-1.5 rounded-[4px] border border-rule bg-white px-2.5 py-1 text-ink/70 transition-opacity duration-200 ease-out sm:inline-flex", ready ? "opacity-100" : "opacity-0")}>
            <Icon name="repeat" size={14} />
            Glisser pour tourner
          </span>
        </figcaption>
      </figure>
      {/* Sans photo réelle, le visuel est un rendu 3D à étiquette recomposée */}
      {product.imageUrl ? null : <p className="mt-2 text-xs text-ink/65">Visuel d&apos;illustration : l&apos;emballage réel peut différer.</p>}
    </div>
  );
}

/** Encart d'achat : conditionnement, quantité, ajout au bon. */
export function OrderPanel({ product }: { product: Product }) {
  const { pack, setPack } = useContext(PackCtx);
  const [qty, setQty] = useState(1);
  const price = usePrice(product.id, pack);
  const priceMode = useSession((s) => s.settings.priceMode);
  const packagingsToConfirm = product.toConfirm.includes("packagings");
  return (
    <div data-product-row className="rounded-[8px] border border-rule bg-white">
      <fieldset className="p-4 sm:p-5">
        <legend className="float-left mb-3 w-full text-sm font-semibold text-ink">Conditionnement</legend>
        <div className="clear-left grid grid-cols-1 gap-2 min-[400px]:grid-cols-2">
          {product.packagings.map((p) => {
            const on = pack === p.id;
            return (
              <label
                key={p.id}
                className={cx(
                  "flex min-w-0 cursor-pointer items-center gap-2.5 rounded-[6px] border px-3 py-2.5 text-sm font-medium transition-colors duration-150 ease-out has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-mci",
                  on ? "border-mci bg-sky/40 text-ink shadow-[inset_0_0_0_1px_var(--color-mci)]" : "border-rule bg-white text-ink hover:border-ink/40",
                )}
              >
                <input type="radio" name="packaging" value={p.id} checked={on} onChange={() => setPack(p.id)} className="sr-only" />
                <span aria-hidden="true" className={cx("grid size-4 shrink-0 place-items-center rounded-full border", on ? "border-mci" : "border-ink/40")}>
                  {on ? <span className="size-2 rounded-full bg-mci" /> : null}
                </span>
                <span className="min-w-0">{p.label}</span>
              </label>
            );
          })}
        </div>
        {packagingsToConfirm ? <p className="mt-3 text-xs text-ink/65">Conditionnements indicatifs : MCI confirme le format disponible avec votre commande.</p> : null}
      </fieldset>
      <div className="border-t border-rule p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm font-semibold text-ink" aria-hidden="true">
            Quantité
          </span>
          <Stepper value={qty} onChange={setQty} label={`Quantité ${product.code}`} />
        </div>
        <AddToCartButton product={product} packagingId={pack} quantity={qty} size="lg" label="Ajouter au bon de commande" className="mt-4 w-full whitespace-normal! text-center leading-tight" />
        <p className="mt-3 flex items-start gap-2 text-sm text-ink/70">
          <Icon name="info" size={16} className="mt-0.5 shrink-0" />
          {price != null ? (
            <span>
              <span className="font-semibold tabular-nums text-ink">{formatEur(price)} HT</span> l&apos;unité · {formatEur(price * qty)} HT pour {qty}
            </span>
          ) : priceMode === "per_account" ? (
            <span>Prix visibles une fois votre compte pro validé. Sinon, MCI confirme le tarif après envoi du bon.</span>
          ) : (
            <span>
              Prix et délai confirmés par MCI après envoi du bon.
              {packagingsToConfirm ? null : " Conditionnements indicatifs, validés à la confirmation."}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
