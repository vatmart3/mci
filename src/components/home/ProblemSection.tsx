"use client";
import Link from "next/link";
import { useId, useRef, useState } from "react";
import { ProductVisual } from "@/components/catalog/ProductVisual";
import { AddToCartButton } from "@/components/cart/AddToCart";
import { Icon } from "@/components/ui/Icon";
import { cx } from "@/lib/cx";
import type { MiniProduct } from "./showcase-data";

export interface Problem {
  id: string;
  /** le problème tel que l'acheteur le formule */
  name: string;
  /** où on le rencontre */
  where: string;
  /** requête catalogue pour « voir tous les produits » */
  q: string;
  products: MiniProduct[];
}

function ProductLine({ p }: { p: MiniProduct }) {
  const [pack, setPack] = useState(p.packagings[0]!.id);
  return (
    <li data-product-row className="grid grid-cols-[88px_1fr] gap-x-4 gap-y-3 py-5 first:pt-0 last:pb-0 sm:grid-cols-[120px_1fr_auto] sm:items-center sm:gap-x-6">
      <Link href={`/produit/${p.slug}`} className="plate row-span-2 grid aspect-square place-items-center rounded-[8px] p-2 sm:row-span-1" tabIndex={-1} aria-hidden="true">
        <ProductVisual product={p} size={120} sizes="120px" alt="" className="h-full w-auto" />
      </Link>
      <div className="min-w-0">
        <Link href={`/produit/${p.slug}`} className="group">
          <span className="t-code block text-2xl leading-none text-mci group-hover:text-deep">{p.code}</span>
          <span className="mt-1 block font-semibold">{p.short}</span>
        </Link>
        {p.usages.length ? <p className="mt-1 text-sm text-ink/70">{p.usages.slice(0, 3).join(" · ")}</p> : null}
      </div>
      <div className="flex min-w-0 items-center gap-2 sm:w-[260px]">
        <label className="sr-only" htmlFor={`pb-${p.id}`}>
          Conditionnement {p.code}
        </label>
        <select id={`pb-${p.id}`} value={pack} onChange={(e) => setPack(e.target.value)} className="h-9 min-w-0 flex-1 cursor-pointer rounded-[6px] border border-rule bg-white px-2 text-sm">
          {p.packagings.map((k) => (
            <option key={k.id} value={k.id}>
              {k.label}
            </option>
          ))}
        </select>
        <AddToCartButton product={p} packagingId={pack} size="sm" />
      </div>
    </li>
  );
}

/**
 * Le problème d'abord : l'acheteur choisit ce qu'il a sous les yeux (graisse cuite, tags, mousses…),
 * la réponse s'affiche à côté avec les produits réels du catalogue, ajoutables au bon.
 * Onglets ARIA : ← → ↑ ↓ Début Fin.
 */
export function ProblemSection({ problems }: { problems: Problem[] }) {
  const [current, setCurrent] = useState(0);
  const id = useId();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const active = problems[current]!;

  const focusTab = (i: number) => {
    const n = (i + problems.length) % problems.length;
    setCurrent(n);
    tabs.current[n]?.focus();
  };

  return (
    <section aria-labelledby="probleme-title" className="py-16 lg:py-28">
      <div className="wrap">
        <div className="grid grid-cols-1 gap-y-6 lg:grid-cols-12 lg:gap-x-8">
          <h2 id="probleme-title" className="t-display lg:col-span-7">
            Quel est le problème&#8239;?
          </h2>
          <p className="t-lead max-w-[46ch] text-ink/70 lg:col-span-5 lg:self-end">Choisissez ce que vous avez sous les yeux. Voici les produits MCI qui le traitent, avec leur conditionnement.</p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:mt-14 lg:grid-cols-12 lg:gap-8">
          <div
            role="tablist"
            aria-label="Problèmes fréquents"
            aria-orientation="vertical"
            className="snap-row -mx-[var(--margin)] gap-2 px-[var(--margin)] pb-1 lg:col-span-5 lg:mx-0 lg:flex-col lg:gap-0 lg:overflow-visible lg:border-t lg:border-ink lg:px-0 lg:pb-0"
            onKeyDown={(e) => {
              if (e.key === "ArrowDown" || e.key === "ArrowRight") focusTab(current + 1);
              else if (e.key === "ArrowUp" || e.key === "ArrowLeft") focusTab(current - 1);
              else if (e.key === "Home") focusTab(0);
              else if (e.key === "End") focusTab(problems.length - 1);
              else return;
              e.preventDefault();
            }}
          >
            {problems.map((pb, i) => {
              const on = i === current;
              return (
                <button
                  key={pb.id}
                  ref={(el) => {
                    tabs.current[i] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`${id}-tab-${pb.id}`}
                  aria-selected={on}
                  aria-controls={`${id}-panel`}
                  tabIndex={on ? 0 : -1}
                  onClick={() => setCurrent(i)}
                  className={cx(
                    "group shrink-0 text-left transition-colors duration-150",
                    // mobile : onglets en pastilles défilantes
                    "rounded-[6px] border px-4 py-2 font-semibold",
                    on ? "border-mci bg-mci text-white" : "border-rule bg-white hover:border-ink",
                    // ordinateur : grande liste filetée
                    "lg:flex lg:items-center lg:justify-between lg:gap-4 lg:rounded-none lg:border-0 lg:border-b lg:border-rule lg:bg-transparent lg:px-0 lg:py-4",
                    on ? "lg:text-mci" : "lg:text-ink lg:hover:text-mci",
                  )}
                >
                  <span className="min-w-0">
                    <span className="block whitespace-nowrap lg:font-display lg:text-[2rem] lg:font-bold lg:leading-none">{pb.name}</span>
                    <span className={cx("mt-1 hidden text-sm font-normal lg:block", on ? "text-ink/80" : "text-ink/60")}>{pb.where}</span>
                  </span>
                  <Icon name="arrow" size={22} className={cx("hidden shrink-0 transition-transform duration-150 lg:block", on ? "translate-x-0 opacity-100" : "-translate-x-1 opacity-0 group-hover:opacity-60")} />
                </button>
              );
            })}
          </div>

          <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${active.id}`} className="rounded-[12px] bg-salt p-5 sm:p-8 lg:col-span-7">
            <div key={active.id} className="animate-fade">
              <p className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-rule pb-4 lg:hidden">
                <span className="font-display text-2xl font-bold leading-tight">{active.name}</span>
                <span className="text-sm text-ink/70">{active.where}</span>
              </p>
              <ul className="mt-5 divide-y divide-rule lg:mt-0">
                {active.products.map((p) => (
                  <ProductLine key={p.id} p={p} />
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-rule pt-5 text-sm">
                <Link href={`/catalogue?q=${encodeURIComponent(active.q)}`} className="inline-flex items-center gap-2 font-semibold text-mci hover:text-deep">
                  Tous les produits pour «&#8239;{active.q}&#8239;» <Icon name="arrow" size={16} />
                </Link>
                <Link href={`/contact?objet=conseil&message=${encodeURIComponent(`Mon problème\u202F: ${active.name.toLowerCase()}. `)}`} className="link-u">
                  Un doute&#8239;? Demandez conseil à MCI
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
