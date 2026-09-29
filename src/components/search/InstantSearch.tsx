"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useCatalog } from "@/lib/store/catalog";
import { buildIndex, search } from "@/lib/search";
import { familyBySlug } from "@/data/families";
import { ProductVisual } from "@/components/catalog/ProductVisual";
import { Icon } from "@/components/ui/Icon";
import { cx } from "@/lib/cx";

const PROMPTS = ["graisse cuite", "tags sur façade", "mousses sur toiture", "tartre sanitaires", "frelons asiatiques", "fuite d'huile", "désinfection cantine", "WC chimiques"];

/**
 * Recherche instantanée : résultats du vrai moteur (accents, pluriels, fautes, vocabulaire terrain)
 * dès la deuxième lettre, avec vignette, code et famille. Clavier : ↑ ↓ pour choisir, Entrée pour ouvrir,
 * Entrée sans sélection pour voir tous les résultats dans le catalogue. Combobox ARIA 1.2.
 */
export function InstantSearch({ size = "hero", autoRotate = false, className }: { size?: "hero" | "compact"; autoRotate?: boolean; className?: string }) {
  const products = useCatalog((s) => s.products);
  const index = useMemo(() => buildIndex(products.filter((p) => p.active)), [products]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [hint, setHint] = useState(0);
  const router = useRouter();
  const id = useId();
  const box = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  const hits = useMemo(() => (q.trim().length >= 2 ? (search(index, q) ?? []) : []), [index, q]);
  const shown = hits.slice(0, size === "hero" ? 6 : 5);
  const listOpen = open && q.trim().length >= 2;

  // exemples de recherche qui défilent dans le champ vide (arrêtés au focus et en mouvement réduit)
  useEffect(() => {
    if (!autoRotate || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => setHint((h) => (h + 1) % PROMPTS.length), 2600);
    return () => window.clearInterval(t);
  }, [autoRotate]);

  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, []);

  useEffect(() => setActive(-1), [q]);

  const goAll = () => {
    const v = q.trim();
    setOpen(false);
    router.push(v ? `/catalogue?q=${encodeURIComponent(v)}` : "/catalogue");
  };

  const hero = size === "hero";
  return (
    <div ref={box} className={cx("relative", className)}>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          const hit = shown[active];
          if (hit) {
            setOpen(false);
            router.push(`/produit/${hit.product.slug}`);
          } else goAll();
        }}
        className={cx(
          "flex items-center bg-white transition-shadow duration-150 ease-out",
          hero ? "h-16 rounded-[8px] pl-5 pr-2 shadow-float focus-within:shadow-[0_0_0_3px_rgb(248_151_70/0.55),0_24px_48px_-20px_rgb(12_43_64/0.35)]" : "h-10 rounded-[6px] border border-rule pl-3 pr-1 focus-within:border-mci",
        )}
      >
        <Icon name="search" size={hero ? 22 : 18} className="shrink-0 text-mci" />
        <label htmlFor={`${id}-q`} className="sr-only">
          Rechercher un produit, un usage ou une salissure
        </label>
        <input
          ref={input}
          id={`${id}-q`}
          type="search"
          role="combobox"
          aria-expanded={listOpen}
          aria-controls={`${id}-list`}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${id}-opt-${active}` : undefined}
          autoComplete="off"
          spellCheck={false}
          value={q}
          placeholder={hero ? `Ex. ${PROMPTS[hint]}` : "Produit, usage, référence…"}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
              setActive((a) => Math.min(shown.length - 1, a + 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(-1, a - 1));
            } else if (e.key === "Escape") {
              setOpen(false);
            }
          }}
          className={cx("min-w-0 flex-1 bg-transparent outline-none placeholder:text-ink/55 [&::-webkit-search-cancel-button]:hidden", hero ? "px-4 text-lg" : "px-2 text-sm")}
        />
        {hero ? (
          <button type="submit" className="h-12 shrink-0 rounded-[6px] bg-action px-4 font-semibold text-ink transition-colors duration-150 hover:bg-action-hover sm:px-6">
            <span className="max-sm:sr-only">Rechercher</span>
            <Icon name="arrow" size={18} className="sm:hidden" />
          </button>
        ) : null}
      </form>

      {listOpen ? (
        <div className="absolute inset-x-0 top-full z-40 mt-2 animate-drop overflow-hidden rounded-[8px] border border-rule bg-white text-ink shadow-float">
          {shown.length ? (
            <ul id={`${id}-list`} role="listbox" aria-label="Produits correspondants" className="max-h-[60vh] overflow-y-auto py-1">
              {shown.map((h, i) => {
                const p = h.product;
                return (
                  <li key={p.id} id={`${id}-opt-${i}`} role="option" aria-selected={i === active}>
                    <Link
                      href={`/produit/${p.slug}`}
                      onClick={() => setOpen(false)}
                      onMouseEnter={() => setActive(i)}
                      className={cx("flex items-center gap-4 px-3 py-2", i === active && "bg-salt")}
                    >
                      <span className="plate grid size-12 shrink-0 place-items-center rounded-[6px]">
                        <ProductVisual product={p} size={48} alt="" className="h-11 w-auto" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="t-code block text-md leading-tight text-mci">{p.code}</span>
                        <span className="block truncate text-sm">{p.short}</span>
                      </span>
                      <span className="hidden shrink-0 text-xs text-ink/70 sm:block">{familyBySlug.get(p.families[0]!)?.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p id={`${id}-list`} className="px-4 py-4 text-sm text-ink/70">
              Aucun produit pour « {q.trim()} ». Essayez un autre mot, ou{" "}
              <Link href={`/contact?objet=conseil&message=${encodeURIComponent(`Je cherche un produit pour : ${q.trim()}`)}`} className="link-u">
                demandez conseil à MCI
              </Link>
              .
            </p>
          )}
          {hits.length ? (
            <button type="button" onClick={goAll} className="flex w-full items-center justify-between border-t border-rule bg-salt px-4 py-3 text-sm font-semibold text-mci hover:bg-steel">
              Voir {hits.length > 1 ? `les ${hits.length} résultats` : "le résultat"} dans le catalogue
              <Icon name="arrow" size={16} />
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export const SEARCH_PROMPTS = PROMPTS;
