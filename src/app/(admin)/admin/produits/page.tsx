"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useData } from "@/lib/hooks/useData";
import { useCatalog } from "@/lib/store/catalog";
import { getBackend } from "@/lib/backend";
import { familyBySlug, families } from "@/data/families";
import { ProductVisual } from "@/components/catalog/ProductVisual";
import { Badge, ToConfirm } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { norm } from "@/lib/format";

export default function AdminProducts() {
  const { data: products, reload } = useData((b) => b.listAllProducts(), []);
  const loadCatalog = useCatalog((s) => s.load);
  const [q, setQ] = useState("");
  const [fam, setFam] = useState("");
  const [onlyTodo, setOnlyTodo] = useState(false);
  useEffect(() => setOnlyTodo(new URLSearchParams(window.location.search).has("a-confirmer")), []);
  const list = useMemo(
    () =>
      (products ?? []).filter(
        (p) => (!q || norm(`${p.code} ${p.short} ${p.description}`).includes(norm(q))) && (!fam || p.families.includes(fam as never)) && (!onlyTodo || p.toConfirm.length),
      ),
    [products, q, fam, onlyTodo],
  );
  const toggle = async (id: string, key: "active" | "featured") => {
    const p = products?.find((x) => x.id === id);
    if (!p) return;
    await (await getBackend()).saveProduct({ ...p, [key]: !p[key] });
    reload();
    void loadCatalog();
  };
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="t-h2">Produits ({products?.length ?? "…"})</h1>
        <ButtonLink href="/admin/produits/nouveau" variant="primary" size="sm">
          <Icon name="plus" size={16} /> Nouveau produit
        </ButtonLink>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="w-full sm:w-72">
          <Input fieldSize="sm" aria-label="Rechercher" placeholder="Code, nom…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="w-full sm:w-64">
          <Select fieldSize="sm" aria-label="Famille" value={fam} onChange={(e) => setFam(e.target.value)}>
            <option value="">Toutes les familles</option>
            {families.map((f) => (
              <option key={f.slug} value={f.slug}>
                {f.name}
              </option>
            ))}
          </Select>
        </div>
        <label className="flex min-h-9 cursor-pointer items-center gap-2 rounded-[6px] border border-rule bg-white px-3 py-1.5 text-sm transition-colors duration-150 hover:border-ink/30">
          <input type="checkbox" className="size-4 shrink-0 accent-mci" checked={onlyTodo} onChange={(e) => setOnlyTodo(e.target.checked)} /> Seulement les fiches avec des champs à confirmer
        </label>
      </div>
      <div className="overflow-hidden rounded-[8px] border border-rule bg-white">
        <div className="relative overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-rule bg-steel/60 text-xs font-semibold text-ink/70">
              <tr>
                <th scope="col" className="py-2.5 pl-4 pr-3">Produit</th>
                <th scope="col" className="px-3 py-2.5">Famille(s)</th>
                <th scope="col" className="px-3 py-2.5">FT</th>
                <th scope="col" className="px-3 py-2.5">À confirmer</th>
                <th scope="col" className="px-3 py-2.5">Actif</th>
                <th scope="col" className="py-2.5 pl-3 pr-4">En avant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule">
              {list.map((p) => (
                <tr key={p.id} className="transition-colors duration-150 hover:bg-salt">
                  <td className="py-2 pl-4 pr-3">
                    <Link href={`/admin/produits/${p.id}`} className="group flex items-center gap-3">
                      <span className="shrink-0 overflow-hidden rounded-[4px] border border-rule bg-salt">
                        <ProductVisual product={p} size={40} alt="" />
                      </span>
                      <span className="min-w-0">
                        <span className="t-code block text-mci group-hover:underline">{p.code}</span>
                        <span className="text-ink/70">{p.short}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-xs text-ink/80">{p.families.map((f) => familyBySlug.get(f)?.name).join(", ")}</td>
                  <td className="px-3 py-2">{p.technicalSheetUrl ? <Badge tone="ok">OUI</Badge> : <Badge tone="warn">NON</Badge>}</td>
                  <td className="px-3 py-2">{p.toConfirm.length ? <ToConfirm>{p.toConfirm.length} CHAMPS</ToConfirm> : <Badge tone="ok">OK</Badge>}</td>
                  <td className="px-3 py-2">
                    <input type="checkbox" className="size-4 cursor-pointer accent-mci" aria-label={`Actif ${p.code}`} checked={p.active} onChange={() => toggle(p.id, "active")} />
                  </td>
                  <td className="py-2 pl-3 pr-4">
                    <input type="checkbox" className="size-4 cursor-pointer accent-mci" aria-label={`Mis en avant ${p.code}`} checked={p.featured} onChange={() => toggle(p.id, "featured")} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
