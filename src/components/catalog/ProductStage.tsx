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
    <figure className="crop relative aspect-square w-full border border-rule bg-white tech-grid">
      <div className={cx("absolute inset-0 grid place-items-center transition-opacity duration-300", ready ? "opacity-0" : "opacity-100")}>
        <ProductVisual product={product} size={520} priority sizes="(max-width: 1024px) 90vw, 45vw" className="h-4/5 w-4/5" alt={`${product.code} — ${product.short}, ${packaging.label}`} />
      </div>
      {product.imageUrl ? null : <ProductViewer3D product={product} container={packaging.container} onReady={() => setReady(true)} />}
      <figcaption className="t-mono absolute bottom-3 left-4 right-4 flex justify-between text-xs text-ink/70">
        <span>
          REF · {product.code} · {packaging.short}
        </span>
        <span aria-hidden="true" className="hidden sm:inline">
          GLISSER POUR TOURNER
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
    <div data-product-row className="rounded-box border border-ink bg-white p-4 lg:p-6">
      <fieldset>
        <legend className="t-mono mb-3 text-xs text-ink/70">CONDITIONNEMENT</legend>
        <div className="flex flex-wrap gap-2">
          {product.packagings.map((p) => (
            <label key={p.id} className={cx("cursor-pointer rounded-tech border px-3 py-2 text-sm has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-mci", pack === p.id ? "border-ink bg-ink text-white" : "border-rule bg-white hover:border-ink")}>
              <input type="radio" name="packaging" value={p.id} checked={pack === p.id} onChange={() => setPack(p.id)} className="sr-only" />
              {p.label}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Stepper value={qty} onChange={setQty} label={`Quantité ${product.code}`} />
        <AddToCartButton product={product} packagingId={pack} quantity={qty} size="md" label="Ajouter au bon de commande" className="flex-1" />
      </div>
      <p className="mt-3 flex items-start gap-2 text-sm text-ink/75">
        <Icon name="info" size={16} className="mt-px shrink-0" />
        {price != null ? (
          <span>
            <span className="t-mono font-medium text-ink">{formatEur(price)} HT</span> l&apos;unité · {formatEur(price * qty)} HT pour {qty}
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
