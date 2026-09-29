"use client";
import Link from "next/link";
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import type { FamilySlug, Format, Product, PropertySlug, SectorSlug } from "@/lib/types";
import { buildIndex, search } from "@/lib/search";
import { families } from "@/data/families";
import { sectors } from "@/data/sectors";
import { formatLabels, formatOrder, propertyLabels, propertyOrder } from "@/data/properties";
import { company } from "@/data/company";
import { ProductCard, ProductTable } from "./ProductRow";
import { PdfViewerProvider } from "./PdfViewer";
import { Icon } from "@/components/ui/Icon";
import { Select } from "@/components/ui/Field";
import { cx } from "@/lib/cx";

type Sort = "pertinence" | "az" | "famille";
type View = "liste" | "grille";

interface Filters {
  q: string;
  famille: FamilySlug[];
  secteur: SectorSlug[];
  prop: PropertySlug[];
  format: Format[];
  tri: Sort;
  vue: View;
}

const empty: Filters = { q: "", famille: [], secteur: [], prop: [], format: [], tri: "pertinence", vue: "liste" };

function readUrl(): Filters {
  const p = new URLSearchParams(window.location.search);
  const list = <T extends string>(k: string) => (p.get(k)?.split(",").filter(Boolean) ?? []) as T[];
  return {
    q: p.get("q") ?? "",
    famille: list("famille"),
    secteur: list("secteur"),
    prop: list("prop"),
    format: list("format"),
    tri: (p.get("tri") as Sort) ?? "pertinence",
    vue: (p.get("vue") as View) ?? "liste",
  };
}

function writeUrl(f: Filters) {
  const p = new URLSearchParams();
  if (f.q) p.set("q", f.q);
  for (const k of ["famille", "secteur", "prop", "format"] as const) if (f[k].length) p.set(k, f[k].join(","));
  if (f.tri !== "pertinence") p.set("tri", f.tri);
  if (f.vue !== "liste") p.set("vue", f.vue);
  const qs = p.toString();
  window.history.replaceState(window.history.state, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);
}

const checkClass =
  "size-[18px] shrink-0 cursor-pointer appearance-none rounded-[4px] border border-ink/40 bg-white bg-center bg-no-repeat transition-colors duration-150 ease-out checked:border-mci checked:bg-mci checked:bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2016%2016%22%3E%3Cpath%20d=%22M3.5%208.5l3%203%206-7%22%20fill=%22none%22%20stroke=%22white%22%20stroke-width=%222%22/%3E%3C/svg%3E')]";

function FilterGroup<T extends string>({
  legend,
  options,
  selected,
  onToggle,
  counts,
}: {
  legend: string;
  options: { value: T; label: string }[];
  selected: T[];
  onToggle: (v: T) => void;
  counts: Map<string, number>;
}) {
  return (
    <fieldset className="min-w-0 border-t border-rule py-3 first:border-t-0">
      <legend className="sr-only">{legend}</legend>
      <p aria-hidden="true" className="px-4 pb-1 pt-1 font-display text-base font-bold text-ink">
        {legend}
      </p>
      <ul>
        {options.map((o) => {
          const n = counts.get(o.value) ?? 0;
          const on = selected.includes(o.value);
          return (
            <li key={o.value} className="min-w-0">
              <label
                className={cx(
                  "flex min-w-0 cursor-pointer items-center gap-3 px-4 py-1.5 text-sm transition-colors duration-150 ease-out hover:bg-salt",
                  on ? "font-semibold text-ink" : n ? "text-ink" : "text-ink/70",
                )}
              >
                <input type="checkbox" checked={on} onChange={() => onToggle(o.value)} className={checkClass} />
                <span className="min-w-0 flex-1 leading-snug">{o.label}</span>
                <span className="shrink-0 text-xs font-medium tabular-nums text-ink/70">{n}</span>
              </label>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}

export function CatalogExplorer({ products, title = "Catalogue" }: { products: Product[]; title?: string }) {
  const [f, setF] = useState<Filters>(empty);
  const [panel, setPanel] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const hydrated = useRef(false);

  useEffect(() => {
    setF(readUrl());
    hydrated.current = true;
  }, []);
  useEffect(() => {
    if (hydrated.current) writeUrl(f);
  }, [f]);

  const index = useMemo(() => buildIndex(products), [products]);
  const q = useDeferredValue(f.q);

  const searched = useMemo(() => {
    const hits = search(index, q);
    return hits ? hits.map((h) => h.product) : products;
  }, [index, q, products]);

  const passes = useCallback(
    (p: Product, skip?: keyof Filters) =>
      (skip === "famille" || !f.famille.length || f.famille.some((x) => p.families.includes(x))) &&
      (skip === "secteur" || !f.secteur.length || f.secteur.some((x) => p.sectors.includes(x))) &&
      (skip === "prop" || !f.prop.length || f.prop.every((x) => p.properties.includes(x))) &&
      (skip === "format" || !f.format.length || f.format.some((x) => p.formats.includes(x))),
    [f.famille, f.secteur, f.prop, f.format],
  );

  const results = useMemo(() => {
    const list = searched.filter((p) => passes(p));
    if (f.tri === "az") return [...list].sort((a, b) => a.code.localeCompare(b.code, "fr"));
    if (f.tri === "famille") {
      const pos = new Map(families.map((x) => [x.slug, x.position]));
      return [...list].sort((a, b) => (pos.get(a.families[0]!) ?? 99) - (pos.get(b.families[0]!) ?? 99) || a.code.localeCompare(b.code, "fr"));
    }
    return list;
  }, [searched, passes, f.tri]);

  // Compteurs par option (en ignorant le groupe lui-même : sélection combinable)
  const counts = useMemo(() => {
    const count = (key: "famille" | "secteur" | "prop" | "format", get: (p: Product) => string[]) => {
      const m = new Map<string, number>();
      for (const p of searched) if (passes(p, key)) for (const v of get(p)) m.set(v, (m.get(v) ?? 0) + 1);
      return m;
    };
    return {
      famille: count("famille", (p) => p.families),
      secteur: count("secteur", (p) => p.sectors),
      prop: count("prop", (p) => p.properties),
      format: count("format", (p) => p.formats),
    };
  }, [searched, passes]);

  const toggle = <K extends "famille" | "secteur" | "prop" | "format">(k: K, v: Filters[K][number]) =>
    setF((s) => {
      const cur = s[k] as string[];
      return { ...s, [k]: cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v] };
    });

  const active = f.famille.length + f.secteur.length + f.prop.length + f.format.length;

  const chips = [
    ...f.famille.map((v) => ({ k: "famille" as const, v, label: families.find((x) => x.slug === v)?.name ?? v })),
    ...f.secteur.map((v) => ({ k: "secteur" as const, v, label: sectors.find((x) => x.slug === v)?.name ?? v })),
    ...f.prop.map((v) => ({ k: "prop" as const, v, label: propertyLabels[v]?.label ?? v })),
    ...f.format.map((v) => ({ k: "format" as const, v, label: formatLabels[v] ?? v })),
  ];

  return (
    <PdfViewerProvider>
      <div className="wrap">
        {/* Recherche */}
        <div className="relative">
          <label htmlFor="catalogue-q" className="sr-only">
            Rechercher un produit, un usage, une surface
          </label>
          <Icon name="search" size={22} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/70" />
          <input
            ref={inputRef}
            id="catalogue-q"
            type="search"
            autoComplete="off"
            spellCheck={false}
            placeholder="Graisse cuite, inox, graffiti, guêpes, DG90…"
            value={f.q}
            onChange={(e) => setF((s) => ({ ...s, q: e.target.value }))}
            className="h-14 w-full min-w-0 rounded-[8px] border border-rule bg-white pl-12 pr-4 text-md text-ink transition-[border-color,box-shadow] duration-150 ease-out placeholder:text-ink/55 hover:border-ink/40 focus:border-mci focus:shadow-[0_0_0_3px_rgb(31_106_153/0.2)] focus:outline-none"
          />
        </div>

        {/* Barre d'outils : filtres (mobile), nombre de résultats, tri, affichage */}
        <div className="mt-6 flex flex-wrap items-center gap-x-[var(--gutter)] gap-y-3 border-b border-rule pb-3">
          <button
            type="button"
            className="order-1 inline-flex h-10 items-center gap-2 rounded-[6px] border border-rule bg-white px-3 text-sm font-semibold transition-colors duration-150 ease-out hover:border-ink lg:hidden"
            onClick={() => setPanel((v) => !v)}
            aria-expanded={panel}
            aria-controls="filtres"
          >
            <Icon name="menu" size={18} />
            Filtres
            {active ? <span className="grid h-5 min-w-5 place-items-center rounded-[4px] bg-mci px-1 text-xs font-semibold text-white tabular-nums">{active}</span> : null}
            <Icon name="chevronDown" size={16} className={cx("transition-transform duration-150 ease-out", panel && "rotate-180")} />
          </button>
          <p aria-hidden="true" className="hidden font-display text-lg font-bold lg:order-1 lg:block lg:w-[calc(25%_-_var(--gutter)_*_0.75)]">
            Filtres
          </p>
          <h2 id="resultats" className="order-3 basis-full text-base font-semibold lg:order-2 lg:flex-1 lg:basis-auto" aria-live="polite">
            <span className="tabular-nums">{results.length}</span> référence{results.length > 1 ? "s" : ""}
            {f.q ? <span className="font-normal text-ink/70"> pour « {f.q} »</span> : null} <span className="sr-only">— {title}</span>
          </h2>
          <div className="order-2 ml-auto flex items-center gap-2 lg:order-3">
            <label htmlFor="tri" className="hidden text-sm text-ink/70 sm:block">
              Trier par
            </label>
            <div className="w-36 sm:w-40">
              <Select id="tri" value={f.tri} onChange={(e) => setF((s) => ({ ...s, tri: e.target.value as Sort }))} fieldSize="sm" className="h-10!">
                <option value="pertinence">Pertinence</option>
                <option value="az">A → Z</option>
                <option value="famille">Par famille</option>
              </Select>
            </div>
            <div className="flex overflow-hidden rounded-[6px] border border-rule" role="group" aria-label="Affichage">
              {(["liste", "grille"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setF((s) => ({ ...s, vue: v }))}
                  aria-pressed={f.vue === v}
                  className={cx(
                    "grid size-10 place-items-center border-l border-rule transition-colors duration-150 ease-out first:border-l-0",
                    f.vue === v ? "bg-mci text-white" : "bg-white text-ink/70 hover:bg-salt hover:text-ink",
                  )}
                  aria-label={v === "liste" ? "Liste dense" : "Grille visuelle"}
                >
                  <Icon name={v === "liste" ? "list" : "grid"} size={18} />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid-12 mt-6 gap-y-6">
          {/* Filtres */}
          <aside id="filtres" className={cx("col-span-12 lg:col-span-3 lg:block", panel ? "block" : "hidden")} aria-label="Filtres">
            <div className="rounded-[8px] border border-rule bg-white py-1 lg:sticky lg:top-24 lg:max-h-[calc(100vh-112px)] lg:overflow-y-auto">
              <FilterGroup legend="Famille" options={families.map((x) => ({ value: x.slug, label: x.name }))} selected={f.famille} onToggle={(v) => toggle("famille", v)} counts={counts.famille} />
              <FilterGroup legend="Secteur" options={sectors.map((x) => ({ value: x.slug, label: x.name }))} selected={f.secteur} onToggle={(v) => toggle("secteur", v)} counts={counts.secteur} />
              <FilterGroup legend="Propriétés" options={propertyOrder.map((x) => ({ value: x, label: propertyLabels[x].label }))} selected={f.prop} onToggle={(v) => toggle("prop", v)} counts={counts.prop} />
              <FilterGroup legend="Format" options={formatOrder.map((x) => ({ value: x, label: formatLabels[x] }))} selected={f.format} onToggle={(v) => toggle("format", v)} counts={counts.format} />
            </div>
          </aside>

          {/* Résultats */}
          <section className="col-span-12 lg:col-span-9" aria-labelledby="resultats">
            {chips.length ? (
              <ul className="mb-4 flex min-w-0 flex-wrap items-center gap-2">
                {chips.map((c) => (
                  <li key={`${c.k}-${c.v}`} className="min-w-0 max-w-full">
                    <button
                      type="button"
                      onClick={() => toggle(c.k, c.v as never)}
                      className="inline-flex h-8 max-w-full items-center gap-1.5 rounded-[6px] border border-mci/25 bg-sky/60 pl-2.5 pr-2 text-sm font-medium text-night transition-colors duration-150 ease-out hover:border-mci/50 hover:bg-sky"
                      aria-label={`Retirer le filtre ${c.label}`}
                    >
                      <span className="truncate">{c.label}</span>
                      <Icon name="close" size={14} className="shrink-0" />
                    </button>
                  </li>
                ))}
                <li>
                  <button type="button" className="link-u px-1 py-1 text-sm font-medium" onClick={() => setF((s) => ({ ...empty, q: s.q, tri: s.tri, vue: s.vue }))}>
                    Tout effacer
                  </button>
                </li>
              </ul>
            ) : null}

            {results.length === 0 ? (
              <div className="rounded-[8px] border border-rule bg-salt px-6 py-10 sm:px-10 sm:py-12">
                <span className="grid size-12 place-items-center rounded-full border border-rule bg-white text-ink/70">
                  <Icon name="search" size={22} />
                </span>
                <p className="t-h2 mt-5 max-w-[24ch]">Aucun résultat{f.q ? ` pour « ${f.q} »` : ""}.</p>
                <p className="mt-3 max-w-[56ch] text-ink/80">
                  Appelez-nous au{" "}
                  <a href={`tel:${company.phoneE164}`} className="whitespace-nowrap font-semibold text-mci hover:underline hover:underline-offset-4">
                    {company.phone}
                  </a>
                  , on a peut-être le produit hors catalogue.
                </p>
                <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
                  <Link href={`/contact?objet=produit-specifique${f.q ? `&message=${encodeURIComponent(`Je cherche : ${f.q}`)}` : ""}`} className="link-u font-medium">
                    Décrire mon besoin par écrit
                  </Link>
                  {active || f.q ? (
                    <button type="button" className="link-u font-medium" onClick={() => setF(empty)}>
                      Réinitialiser la recherche
                    </button>
                  ) : null}
                </div>
              </div>
            ) : f.vue === "liste" ? (
              <ProductTable products={results} priorityCount={4} />
            ) : (
              <ul className="grid grid-cols-1 gap-4 min-[440px]:grid-cols-2 md:grid-cols-3 2xl:grid-cols-4">
                {results.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </PdfViewerProvider>
  );
}
