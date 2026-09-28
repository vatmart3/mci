"use client";
import { useRef, useState } from "react";
import type { Product } from "@/lib/types";
import { useCart } from "@/lib/store/cart";
import { useUI } from "@/lib/store/ui";
import { packshotSrc } from "@/components/catalog/ProductVisual";
import { Icon } from "@/components/ui/Icon";
import { buttonClass, type ButtonSize } from "@/components/ui/Button";
import { cx } from "@/lib/cx";

/** Hook : ajoute au bon et lance le vol du packshot depuis `origin`. */
export function useAddToCart() {
  const add = useCart((s) => s.add);
  const fly = useUI((s) => s.fly);
  return (product: Pick<Product, "id" | "slug" | "imageUrl">, packagingId: string, quantity: number, origin?: HTMLElement | null, note?: string) => {
    add({ productId: product.id, packagingId, quantity, note });
    const el = origin?.closest("[data-product-row]")?.querySelector("[data-packshot]") ?? origin;
    if (el) fly(el.getBoundingClientRect(), packshotSrc(product));
  };
}

export function AddToCartButton({
  product,
  packagingId,
  quantity = 1,
  size = "md",
  label = "Ajouter",
  iconOnly = false,
  className,
}: {
  product: Pick<Product, "id" | "slug" | "imageUrl" | "code">;
  packagingId: string;
  quantity?: number;
  size?: ButtonSize;
  label?: string;
  iconOnly?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const addToCart = useAddToCart();
  const [done, setDone] = useState(false);
  return (
    <button
      ref={ref}
      type="button"
      className={cx(buttonClass("action", size), iconOnly && "w-8 !px-0", className)}
      aria-label={iconOnly ? `Ajouter ${product.code} au bon de commande` : undefined}
      onClick={() => {
        addToCart(product, packagingId, quantity, ref.current);
        setDone(true);
        window.setTimeout(() => setDone(false), 1400);
      }}
    >
      <Icon name={done ? "check" : "plus"} size={iconOnly ? 16 : 18} />
      {iconOnly ? null : <span>{done ? "Ajouté" : label}</span>}
      <span className="sr-only" aria-live="polite">
        {done ? `${product.code} ajouté au bon de commande` : ""}
      </span>
    </button>
  );
}
