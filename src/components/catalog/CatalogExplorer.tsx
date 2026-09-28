"use client";
import Link from "next/link";
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import type { FamilySlug, Format, Product, PropertySlug, SectorSlug } from "@/lib/types";
import { buildIndex, search } from "@/lib/search";
import { families } from "@/data/families";
import { sectors } from "@/data/sectors";
import { formatLabels, formatOrder, propertyLabels, propertyOrder } from "@/data/properties";
import { company } from "@/data/company";
import { ProductCard, ProductRow } from "./ProductRow";
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
    <fieldset className="border-t border-rule py-4">
      <legend className="t-mono float-left mb-3 w-full text-xs text-ink/70">{legend.toUpperCase()}</legend>
      <ul className="clear-both space-y-1">
        {options.map((o) => {
          const n = counts.get(o.value) ?? 0;
          const on = selected.includes(o.value);
          return (
            <li key={o.value}>
              <label className={cx("flex cursor-pointer items-center justify-between gap-2 rounded-tech px-2 py-1 text-sm hover:bg-white", on && "bg-white", !n && !on && "opacity-50")}>
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={() => onToggle(o.value)}
                    className="size-4 shrink-0 cursor-pointer appearance-none rounded-tech border border-ink bg-white checked:border-mci checked:bg-mci"
                  />
                  {o.label}
                </span>
                <span className="t-mono text-xs text-ink/70">{n}</span>
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
        <div className="grid-12 gap-y-4 pb-8">
          <div className="col-span-12 lg:col-span-8">
            <label htmlFor="catalogue-q" className="sr-only">
              Rechercher un produit, un usage, une surface
            </label>
            <div className="relative">
              <Icon name="search" size={24} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/70" />
              <input
                ref={inputRef}
                id="catalogue-q"
                type="search"
                autoComplete="off"
                spellCheck={false}
                placeholder="Graisse cuite, inox, graffiti, guêpes, DG90…"
                value={f.q}
                onChange={(e) => setF((s) => ({ ...s, q: e.target.value }))}
                className="h-16 w-full rounded-tech border border-ink bg-white pl-16 pr-4 text-lg placeholder:text-ink/70 focus:border-mci focus:outline-2 focus:outline-mci/30"
              />
            </div>
          </div>
          <div className="col-span-12 flex items-center gap-3 lg:col-span-4 lg:justify-end">
            <button type="button" className="inline-flex h-12 items-center gap-2 rounded-tech border border-ink bg-white px-4 font-semibold lg:hidden" onClick={() => setPanel((v) => !v)} aria-expanded={panel} aria-controls="filtres">
              Filtres{active ? <span className="t-mono rounded-tech bg-ink px-1 text-xs text-white">{active}</span> : null}
            </button>
            <div className="w-40">
              <label htmlFor="tri" className="sr-only">
                Trier
              </label>
              <Select id="tri" value={f.tri} onChange={(e) => setF((s) => ({ ...s, tri: e.target.value as Sort }))}>
                <option value="pertinence">Pertinence</option>
                <option value="az">A → Z</option>
                <option value="famille">Par famille</option>
              </Select>
            </div>
            <div className="flex rounded-tech border border-rule bg-white" role="group" aria-label="Affichage">
              {(["liste", "grille"] as const).map((v) => (
                <button key={v} type="button" onClick={() => setF((s) => ({ ...s, vue: v }))} aria-pressed={f.vue === v} className={cx("grid size-12 place-items-center", f.vue === v ? "bg-ink text-white" : "hover:bg-salt")} aria-label={v === "liste" ? "Liste dense" : "Grille visuelle"}>
                  <Icon name={v === "liste" ? "list" : "grid"} />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid-12 gap-y-8">
          {/* Filtres */}
          <aside id="filtres" className={cx("col-span-12 lg:col-span-3 lg:block", panel ? "block" : "hidden")} aria-label="Filtres">
            <div className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-96px)] lg:overflow-y-auto lg:pr-2">
              <FilterGroup legend="Famille" options={families.map((x) => ({ value: x.slug, label: x.name }))} selected={f.famille} onToggle={(v) => toggle("famille", v)} counts={counts.famille} />
              <FilterGroup legend="Secteur" options={sectors.map((x) => ({ value: x.slug, label: x.name }))} selected={f.secteur} onToggle={(v) => toggle("secteur", v)} counts={counts.secteur} />
              <FilterGroup legend="Propriétés" options={propertyOrder.map((x) => ({ value: x, label: propertyLabels[x].label }))} selected={f.prop} onToggle={(v) => toggle("prop", v)} counts={counts.prop} />
              <FilterGroup legend="Format" options={formatOrder.map((x) => ({ value: x, label: formatLabels[x] }))} selected={f.format} onToggle={(v) => toggle("format", v)} counts={counts.format} />
            </div>
          </aside>

          {/* Résultats */}
          <section className="col-span-12 lg:col-span-9" aria-labelledby="resultats">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink pb-3">
              <h2 id="resultats" className="t-mono text-sm" aria-live="polite">
                {results.length} RÉFÉRENCE{results.length > 1 ? "S" : ""}
                {f.q ? ` POUR « ${f.q.toUpperCase()} »` : ""} <span className="sr-only">— {title}</span>
              </h2>
              {chips.length ? (
                <ul className="flex flex-wrap gap-2">
                  {chips.map((c) => (
                    <li key={`${c.k}-${c.v}`}>
                      <button type="button" onClick={() => toggle(c.k, c.v as never)} className="inline-flex items-center gap-1 rounded-tech border border-ink bg-white px-2 py-1 text-sm hover:bg-ink hover:text-white" aria-label={`Retirer le filtre ${c.label}`}>
                        {c.label}
                        <Icon name="close" size={14} />
                      </button>
                    </li>
                  ))}
                  <li>
                    <button type="button" className="link-u px-1 py-1 text-sm" onClick={() => setF((s) => ({ ...empty, q: s.q, tri: s.tri, vue: s.vue }))}>
                      Tout effacer
                    </button>
                  </li>
                </ul>
              ) : null}
            </div>

            {results.length === 0 ? (
              <div className="py-16">
                <p className="t-h2 max-w-[22ch]">Aucun résultat{f.q ? ` pour « ${f.q} »` : ""}.</p>
                <p className="t-lead mt-4 max-w-[52ch] text-ink/80">
                  Appelez-nous au{" "}
                  <a href={`tel:${company.phoneE164}`} className="t-mono text-mci underline underline-offset-4">
                    {company.phone}
                  </a>
                  , on a peut-être le produit hors catalogue.
                </p>
                <div className="mt-6 flex flex-wrap gap-4">
                  <Link href={`/contact?objet=produit-specifique${f.q ? `&message=${encodeURIComponent(`Je cherche : ${f.q}`)}` : ""}`} className="link-u">
                    Décrire mon besoin par écrit
                  </Link>
                  {active || f.q ? (
                    <button type="button" className="link-u" onClick={() => setF(empty)}>
                      Réinitialiser la recherche
                    </button>
                  ) : null}
                </div>
              </div>
            ) : f.vue === "liste" ? (
              <ul>
                {results.map((p, i) => (
                  <ProductRow key={p.id} product={p} priority={i < 4} />
                ))}
              </ul>
            ) : (
              <ul className="mt-6 grid grid-cols-1 gap-4 min-[400px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
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
