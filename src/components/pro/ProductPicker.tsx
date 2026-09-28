"use client";
import { useMemo, useState } from "react";
import type { Product } from "@/lib/types";
import { useCatalog } from "@/lib/store/catalog";
import { buildIndex, search } from "@/lib/search";
import { inputClass } from "@/components/ui/Field";
import { cx } from "@/lib/cx";

/** Petite recherche de produit (auto-complétion) pour composer une liste. */
export function ProductPicker({ onPick, label = "Ajouter un produit" }: { onPick: (p: Product) => void; label?: string }) {
  const products = useCatalog((s) => s.products);
  const index = useMemo(() => buildIndex(products.filter((p) => p.active)), [products]);
  const [q, setQ] = useState("");
  const [hi, setHi] = useState(0);
  const results = useMemo(() => (q.trim() ? (search(index, q) ?? []).slice(0, 6).map((h) => h.product) : []), [q, index]);
  const id = useMemo(() => `pp-${Math.random().toString(36).slice(2, 7)}`, []);
  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        role="combobox"
        aria-expanded={results.length > 0}
        aria-controls={`${id}-list`}
        placeholder={`${label} (code, usage…)`}
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setHi(0);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") setHi((h) => Math.min(results.length - 1, h + 1));
          if (e.key === "ArrowUp") setHi((h) => Math.max(0, h - 1));
          if (e.key === "Enter" && results[hi]) {
            e.preventDefault();
            onPick(results[hi]!);
            setQ("");
          }
        }}
        className={cx(inputClass, "h-10 px-4 text-sm")}
      />
      {results.length ? (
        <ul id={`${id}-list`} role="listbox" className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-box bg-white p-1.5 shadow-float ring-1 ring-black/5">
          {results.map((p, i) => (
            <li
              key={p.id}
              role="option"
              aria-selected={i === hi}
              className={cx("flex cursor-pointer gap-3 rounded-tech px-3 py-2.5 text-sm transition-colors duration-150", i === hi ? "bg-salt" : "hover:bg-salt/60")}
              onMouseDown={(e) => {
                e.preventDefault();
                onPick(p);
                setQ("");
              }}
            >
              <span className="t-code w-28 shrink-0 truncate text-mci sm:w-36">{p.code}</span>
              <span className="min-w-0 truncate text-ink/80">{p.short}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
