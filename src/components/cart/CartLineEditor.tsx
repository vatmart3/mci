"use client";
import Link from "next/link";
import { useState } from "react";
import type { CartLine } from "@/lib/types";
import { useCart } from "@/lib/store/cart";
import { useCatalog } from "@/lib/store/catalog";
import { usePrice } from "@/lib/store/session";
import { ProductVisual } from "@/components/catalog/ProductVisual";
import { Stepper } from "@/components/ui/Stepper";
import { Select, inputClass } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { formatEur } from "@/lib/format";
import { cx } from "@/lib/cx";

export function CartLineEditor({ line, index, dense = false }: { line: CartLine; index: number; dense?: boolean }) {
  const product = useCatalog((s) => s.byId(line.productId));
  const update = useCart((s) => s.update);
  const remove = useCart((s) => s.remove);
  const price = usePrice(line.productId, line.packagingId);
  const [noteOpen, setNoteOpen] = useState(!!line.note);
  if (!product) {
    return (
      <li className="flex items-center justify-between gap-4 py-5 text-sm text-ink/70">
        Référence retirée du catalogue.
        <button type="button" className="link-u" onClick={() => remove(index)}>
          Retirer
        </button>
      </li>
    );
  }
  const id = `l-${index}-${product.slug}`;
  return (
    <li className="py-5" data-product-row>
      <div className="flex gap-4">
        <Link
          href={`/produit/${product.slug}`}
          className="shrink-0 self-start overflow-hidden rounded-box bg-salt p-1 transition-transform duration-300 ease-out hover:scale-[1.03]"
        >
          <ProductVisual product={product} size={dense ? 56 : 72} alt="" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="t-code text-sm text-mci">{product.code}</p>
              <p className="mt-0.5 truncate text-sm text-ink/70">{product.short}</p>
            </div>
            <button
              type="button"
              onClick={() => remove(index)}
              className="-mr-1 -mt-1 grid size-9 shrink-0 place-items-center rounded-full text-ink/70 transition-colors duration-200 hover:bg-danger/10 hover:text-danger"
              aria-label={`Retirer ${product.code}`}
            >
              <Icon name="trash" size={18} />
            </button>
          </div>
          <div className={cx("mt-3 flex flex-wrap items-center gap-2", dense && "gap-2")}>
            <label htmlFor={`${id}-pack`} className="sr-only">
              Conditionnement
            </label>
            <div className="min-w-0 flex-1 basis-40">
              <Select id={`${id}-pack`} value={line.packagingId} onChange={(e) => update(index, { packagingId: e.target.value })} fieldSize="sm" className="!rounded-full !pl-4">
                {product.packagings.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </Select>
            </div>
            <Stepper size="sm" value={line.quantity} onChange={(q) => update(index, { quantity: q })} label={`Quantité ${product.code}`} />
          </div>
          <div className="mt-3 flex items-center justify-between gap-2">
            {noteOpen ? null : (
              <button type="button" className="inline-flex items-center gap-1 text-sm text-ink/70 transition-colors hover:text-mci" onClick={() => setNoteOpen(true)}>
                <Icon name="plus" size={14} />
                Ajouter une note
              </button>
            )}
            {price != null ? <p className="ml-auto text-sm font-semibold tabular-nums">{formatEur(price * line.quantity)} HT</p> : null}
          </div>
          {noteOpen ? (
            <div className="mt-2">
              <label htmlFor={`${id}-note`} className="sr-only">
                Note pour {product.code}
              </label>
              <input
                id={`${id}-note`}
                className={cx(inputClass, "h-9 px-3 text-sm")}
                placeholder="Note (parfum, livraison séparée…)"
                value={line.note ?? ""}
                maxLength={200}
                onChange={(e) => update(index, { note: e.target.value })}
              />
            </div>
          ) : null}
        </div>
      </div>
    </li>
  );
}
