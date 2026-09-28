"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CartLine, FavoriteList, Packaging, Product } from "@/lib/types";
import { useCatalog } from "@/lib/store/catalog";
import { useCart } from "@/lib/store/cart";
import { useSession } from "@/lib/store/session";
import { getBackend } from "@/lib/backend";
import { buildIndex, search } from "@/lib/search";
import { norm } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Textarea, inputClass } from "@/components/ui/Field";
import { cx } from "@/lib/cx";

interface Row {
  key: number;
  query: string;
  productId: string | null;
  packagingId: string;
  quantity: number;
}

const compact = (s: string) => norm(s).replace(/[\s/]+/g, "");

export function matchPackaging(p: Product, raw: string | undefined): Packaging | undefined {
  if (!raw) return p.packagings[0];
  const q = compact(raw);
  return (
    p.packagings.find((k) => compact(k.id) === q) ??
    p.packagings.find((k) => compact(k.short) === q) ??
    p.packagings.find((k) => compact(k.label).includes(q)) ??
    p.packagings.find((k) => q.includes(compact(k.short)))
  );
}

let seq = 1;
const emptyRow = (): Row => ({ key: seq++, query: "", productId: null, packagingId: "", quantity: 1 });

function CodeCell({
  row,
  products,
  suggest,
  onPick,
  onQuery,
  inputRef,
  onEnterWhenResolved,
}: {
  row: Row;
  products: Map<string, Product>;
  suggest: (q: string) => Product[];
  onPick: (p: Product) => void;
  onQuery: (q: string) => void;
  inputRef: (el: HTMLInputElement | null) => void;
  onEnterWhenResolved: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(0);
  const list = useMemo(() => (row.query.trim() ? suggest(row.query).slice(0, 8) : []), [row.query, suggest]);
  const listId = `qo-list-${row.key}`;
  const product = row.productId ? products.get(row.productId) : undefined;
  return (
    <div className="relative">
      <input
        ref={inputRef}
        role="combobox"
        aria-expanded={open && list.length > 0}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open && list[hi] ? `${listId}-${hi}` : undefined}
        aria-label="Référence produit"
        value={row.query}
        placeholder="Code (ex. DG90)"
        autoComplete="off"
        spellCheck={false}
        className={cx(inputClass, "t-code h-10 px-2 text-sm", product && "border-ok")}
        onChange={(e) => {
          onQuery(e.target.value);
          setOpen(true);
          setHi(0);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 120)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setHi((h) => Math.min(list.length - 1, h + 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHi((h) => Math.max(0, h - 1));
          } else if (e.key === "Enter") {
            e.preventDefault();
            if (open && list[hi] && (!product || list[hi]!.id !== product.id)) {
              onPick(list[hi]!);
              setOpen(false);
            } else if (product) onEnterWhenResolved();
          } else if (e.key === "Escape") setOpen(false);
        }}
      />
      {open && list.length ? (
        <ul id={listId} role="listbox" className="absolute left-0 top-full z-30 mt-1 max-h-72 w-[min(420px,80vw)] overflow-auto rounded-tech border border-ink bg-white shadow-sheet">
          {list.map((p, i) => (
            <li
              key={p.id}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === hi}
              onMouseDown={(e) => {
                e.preventDefault();
                onPick(p);
                setOpen(false);
              }}
              onMouseEnter={() => setHi(i)}
              className={cx("flex cursor-pointer items-baseline gap-3 px-3 py-2 text-sm", i === hi && "bg-salt")}
            >
              <span className="t-code w-40 shrink-0 truncate text-mci">{p.code}</span>
              <span className="truncate text-ink/80">{p.short}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/** Commande rapide façon tableur : code → conditionnement → quantité → Entrée → ligne suivante. */
export function QuickOrder() {
  const router = useRouter();
  const all = useCatalog((s) => s.products);
  const addMany = useCart((s) => s.addMany);
  const { user } = useSession();
  const [rows, setRows] = useState<Row[]>(() => [emptyRow(), emptyRow(), emptyRow()]);
  const [paste, setPaste] = useState("");
  const [report, setReport] = useState<{ ok: number; errors: string[] } | null>(null);
  const [favorites, setFavorites] = useState<FavoriteList[]>([]);
  const [done, setDone] = useState<number | null>(null);
  const codeRefs = useRef(new Map<number, HTMLInputElement>());
  const qtyRefs = useRef(new Map<number, HTMLInputElement>());
  const focusNext = useRef<{ key: number; field: "code" | "qty" } | null>(null);

  const products = useMemo(() => new Map(all.filter((p) => p.active).map((p) => [p.id, p])), [all]);
  const index = useMemo(() => buildIndex([...products.values()]), [products]);
  const byCompact = useMemo(() => {
    const m = new Map<string, Product>();
    for (const p of products.values()) {
      m.set(compact(p.code), p);
      m.set(compact(p.slug), p);
    }
    return m;
  }, [products]);

  const suggest = useMemo(
    () => (q: string) => {
      const c = compact(q);
      const list = [...products.values()];
      const starts = list.filter((p) => compact(p.code).startsWith(c));
      const incl = list.filter((p) => !starts.includes(p) && compact(p.code).includes(c));
      const rest = (search(index, q) ?? []).map((h) => h.product).filter((p) => !starts.includes(p) && !incl.includes(p));
      return [...starts, ...incl, ...rest];
    },
    [products, index],
  );

  useEffect(() => {
    if (!user?.accountId) return;
    void getBackend()
      .then((b) => b.listFavorites(user.accountId!))
      .then(setFavorites)
      .catch(() => undefined);
  }, [user?.accountId]);

  useEffect(() => {
    const f = focusNext.current;
    if (!f) return;
    focusNext.current = null;
    (f.field === "code" ? codeRefs.current.get(f.key) : qtyRefs.current.get(f.key))?.focus();
  });

  const update = (key: number, patch: Partial<Row>) => setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  const pick = (key: number, p: Product) => {
    update(key, { productId: p.id, query: p.code, packagingId: p.packagings[0]?.id ?? "" });
    focusNext.current = { key, field: "qty" };
  };

  const nextRow = (key: number) => {
    const i = rows.findIndex((r) => r.key === key);
    const next = rows[i + 1];
    if (next) {
      codeRefs.current.get(next.key)?.focus();
      return;
    }
    const n = emptyRow();
    focusNext.current = { key: n.key, field: "code" };
    setRows((rs) => [...rs, n]);
  };

  const valid = rows.filter((r) => r.productId && r.quantity > 0);

  const importText = () => {
    const errors: string[] = [];
    const parsed: Row[] = [];
    paste
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
      .forEach((line, i) => {
        const parts = line.split(/[;\t,|]/).map((s) => s.trim());
        const [code = "", pack, qty] = parts;
        const p = byCompact.get(compact(code)) ?? suggest(code).find((x) => compact(x.code) === compact(code));
        if (!p) {
          errors.push(`Ligne ${i + 1} : référence « ${code} » inconnue`);
          return;
        }
        const k = matchPackaging(p, pack);
        if (!k) {
          errors.push(`Ligne ${i + 1} : conditionnement « ${pack} » inconnu pour ${p.code} (${p.packagings.map((x) => x.short).join(", ")})`);
          return;
        }
        const q = qty ? Math.round(Number(qty.replace(",", "."))) : 1;
        if (!Number.isFinite(q) || q < 1) {
          errors.push(`Ligne ${i + 1} : quantité « ${qty} » invalide`);
          return;
        }
        parsed.push({ key: seq++, query: p.code, productId: p.id, packagingId: k.id, quantity: Math.min(999, q) });
      });
    setRows((rs) => [...rs.filter((r) => r.productId || r.query), ...parsed, emptyRow()]);
    setReport({ ok: parsed.length, errors });
    if (parsed.length) setPaste("");
  };

  const loadLines = (lines: CartLine[]) => {
    const extra = lines
      .filter((l) => products.has(l.productId))
      .map((l) => ({ key: seq++, query: products.get(l.productId)!.code, productId: l.productId, packagingId: l.packagingId, quantity: l.quantity }));
    setRows((rs) => [...rs.filter((r) => r.productId || r.query), ...extra, emptyRow()]);
  };

  const submit = (go: boolean) => {
    const lines: CartLine[] = valid.map((r) => ({ productId: r.productId!, packagingId: r.packagingId, quantity: r.quantity }));
    addMany(lines);
    setDone(lines.length);
    setRows([emptyRow(), emptyRow(), emptyRow()]);
    if (go) router.push("/commande");
  };

  return (
    <div className="grid-12 gap-y-12">
      <section className="col-span-12 lg:col-span-8" aria-labelledby="grille">
        <h2 id="grille" className="sr-only">
          Grille de saisie
        </h2>
        <div className="overflow-x-auto rounded-box border border-ink bg-white">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead className="t-mono bg-salt text-left text-xs text-ink/70">
              <tr>
                <th className="w-10 border-b border-rule px-2 py-2 font-normal">#</th>
                <th className="w-[34%] border-b border-rule px-2 py-2 font-normal">RÉFÉRENCE</th>
                <th className="border-b border-rule px-2 py-2 font-normal">DÉSIGNATION</th>
                <th className="w-44 border-b border-rule px-2 py-2 font-normal">CONDITIONNEMENT</th>
                <th className="w-24 border-b border-rule px-2 py-2 font-normal">QTÉ</th>
                <th className="w-10 border-b border-rule px-2 py-2 font-normal">
                  <span className="sr-only">Supprimer</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const p = r.productId ? products.get(r.productId) : undefined;
                const unknown = !p && r.query.trim().length >= 2 && !suggest(r.query).length;
                return (
                  <tr key={r.key} className="border-b border-rule align-middle last:border-b-0">
                    <td className="t-mono px-2 text-xs text-ink/50">{String(i + 1).padStart(2, "0")}</td>
                    <td className="px-2 py-2">
                      <CodeCell
                        row={r}
                        products={products}
                        suggest={suggest}
                        onPick={(prod) => pick(r.key, prod)}
                        onQuery={(q) => {
                          const exact = byCompact.get(compact(q));
                          update(r.key, { query: q, productId: exact?.id ?? null, packagingId: exact?.packagings[0]?.id ?? "" });
                        }}
                        inputRef={(el) => (el ? codeRefs.current.set(r.key, el) : codeRefs.current.delete(r.key))}
                        onEnterWhenResolved={() => qtyRefs.current.get(r.key)?.focus()}
                      />
                    </td>
                    <td className="px-2 py-2">{p ? <span className="line-clamp-1">{p.short}</span> : unknown ? <span className="text-danger">Référence inconnue</span> : <span className="text-ink/40">—</span>}</td>
                    <td className="px-2 py-2">
                      <label htmlFor={`qo-pack-${r.key}`} className="sr-only">
                        Conditionnement ligne {i + 1}
                      </label>
                      <select id={`qo-pack-${r.key}`} disabled={!p} value={r.packagingId} onChange={(e) => update(r.key, { packagingId: e.target.value })} className={cx(inputClass, "h-10 px-2 text-sm disabled:bg-salt")}>
                        {p ? p.packagings.map((k) => <option key={k.id} value={k.id}>{k.label}</option>) : <option value="">—</option>}
                      </select>
                    </td>
                    <td className="px-2 py-2">
                      <input
                        ref={(el) => {
                          if (el) qtyRefs.current.set(r.key, el);
                          else qtyRefs.current.delete(r.key);
                        }}
                        type="number"
                        min={1}
                        max={999}
                        inputMode="numeric"
                        aria-label={`Quantité ligne ${i + 1}`}
                        value={r.quantity}
                        onChange={(e) => update(r.key, { quantity: Math.max(1, Math.min(999, Math.round(Number(e.target.value) || 1))) })}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            nextRow(r.key);
                          }
                        }}
                        className={cx(inputClass, "t-mono h-10 px-2 text-sm")}
                      />
                    </td>
                    <td className="px-2">
                      <button type="button" className="grid size-8 place-items-center rounded-tech text-ink/60 hover:bg-salt hover:text-danger" aria-label={`Supprimer la ligne ${i + 1}`} onClick={() => setRows((rs) => (rs.length > 1 ? rs.filter((x) => x.key !== r.key) : [emptyRow()]))}>
                        <Icon name="close" size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <button type="button" className="link-u inline-flex items-center gap-1 text-sm" onClick={() => setRows((rs) => [...rs, emptyRow()])}>
            <Icon name="plus" size={16} /> Ajouter une ligne
          </button>
          <p className="t-mono text-xs text-ink/60">ENTRÉE : LIGNE SUIVANTE · ↑↓ : SUGGESTIONS</p>
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-ink pt-6 sm:flex-row sm:items-center">
          <Button variant="action" size="lg" disabled={!valid.length} onClick={() => submit(true)}>
            Ajouter {valid.length || ""} ligne{valid.length > 1 ? "s" : ""} et valider
            <Icon name="arrow" />
          </Button>
          <Button variant="outline" disabled={!valid.length} onClick={() => submit(false)}>
            Ajouter au bon, continuer
          </Button>
          {done != null ? (
            <p role="status" className="text-sm text-ok">
              {done} ligne{done > 1 ? "s" : ""} ajoutée{done > 1 ? "s" : ""} au bon de commande.
            </p>
          ) : null}
        </div>
      </section>

      <aside className="col-span-12 space-y-10 lg:col-span-4">
        <section aria-labelledby="import-title">
          <h2 id="import-title" className="t-label">
            Coller une liste
          </h2>
          <p className="mt-2 text-sm text-ink/80">
            Une ligne par référence : <span className="t-mono">CODE;CONDITIONNEMENT;QUANTITÉ</span>. Séparateurs acceptés : point-virgule, tabulation (copier depuis un tableur), virgule.
          </p>
          <label htmlFor="qo-paste" className="sr-only">
            Liste à importer
          </label>
          <Textarea id="qo-paste" rows={6} value={paste} onChange={(e) => setPaste(e.target.value)} className="t-mono mt-3 text-sm" placeholder={"DG90;5L;2\nKERMEX;20L;1\nOXYCHOC;CARTON-12;1"} />
          <Button variant="primary" size="sm" className="mt-3" disabled={!paste.trim()} onClick={importText}>
            Importer dans la grille
          </Button>
          {report ? (
            <div role="status" className="mt-3 text-sm">
              <p className={report.ok ? "text-ok" : "text-ink/70"}>
                {report.ok} ligne{report.ok > 1 ? "s" : ""} importée{report.ok > 1 ? "s" : ""}.
              </p>
              {report.errors.length ? (
                <ul className="mt-2 space-y-1 text-danger">
                  {report.errors.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
        </section>

        <section aria-labelledby="fav-title" className="border-t border-rule pt-6">
          <h2 id="fav-title" className="t-label">
            Listes favorites
          </h2>
          {user ? (
            favorites.length ? (
              <ul className="mt-3 space-y-2">
                {favorites.map((f) => (
                  <li key={f.id} className="flex items-center justify-between gap-3">
                    <span>
                      {f.name} <span className="t-mono text-xs text-ink/60">· {f.lines.length} RÉF.</span>
                    </span>
                    <button type="button" className="link-u text-sm" onClick={() => loadLines(f.lines)}>
                      Charger
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-ink/80">
                Aucune liste pour l&apos;instant. Créez-en depuis <Link href="/espace-pro/favoris" className="link-u">votre espace pro</Link>.
              </p>
            )
          ) : (
            <p className="mt-2 text-sm text-ink/80">
              <Link href="/espace-pro?retour=/commande-rapide" className="link-u">
                Connectez-vous
              </Link>{" "}
              pour retrouver vos listes (« Stock atelier », « Rentrée scolaire »…) et recommander en un clic.
            </p>
          )}
        </section>
      </aside>
    </div>
  );
}
