"use client";
import { useState } from "react";
import type { CartLine, FavoriteList } from "@/lib/types";
import { useSession } from "@/lib/store/session";
import { useCart } from "@/lib/store/cart";
import { useCatalog } from "@/lib/store/catalog";
import { useData } from "@/lib/hooks/useData";
import { getBackend } from "@/lib/backend";
import { AddSelection } from "@/components/cart/AddSelection";
import { ProductPicker } from "@/components/pro/ProductPicker";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { Stepper } from "@/components/ui/Stepper";
import { Icon } from "@/components/ui/Icon";

function ListEditor({ list, onSaved }: { list: FavoriteList; onSaved: () => void }) {
  const byId = useCatalog((s) => s.byId);
  const [name, setName] = useState(list.name);
  const [lines, setLines] = useState<CartLine[]>(list.lines);
  const [saved, setSaved] = useState(false);
  const dirty = name !== list.name || JSON.stringify(lines) !== JSON.stringify(list.lines);
  const save = async () => {
    const b = await getBackend();
    await b.saveFavorite({ ...list, name, lines });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1500);
    onSaved();
  };
  return (
    <article className="rounded-box border border-rule bg-white p-4 sm:p-6">
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor={`fav-${list.id}`} className="sr-only">
          Nom de la liste
        </label>
        <Input id={`fav-${list.id}`} value={name} onChange={(e) => setName(e.target.value)} className="max-w-sm font-semibold" />
        <AddSelection lines={lines} label="Ajouter au bon" className="h-12 px-4 text-base" />
      </div>
      <ul className="mt-4 divide-y divide-rule">
        {lines.map((l, i) => {
          const p = byId(l.productId);
          if (!p) return null;
          return (
            <li key={`${l.productId}-${i}`} className="flex flex-wrap items-center gap-3 py-2">
              <span className="t-code w-40 truncate text-sm text-mci">{p.code}</span>
              <div className="w-44">
                <Select fieldSize="sm" aria-label={`Conditionnement ${p.code}`} value={l.packagingId} onChange={(e) => setLines((ls) => ls.map((x, k) => (k === i ? { ...x, packagingId: e.target.value } : x)))}>
                  {p.packagings.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.label}
                    </option>
                  ))}
                </Select>
              </div>
              <Stepper size="sm" value={l.quantity} onChange={(q) => setLines((ls) => ls.map((x, k) => (k === i ? { ...x, quantity: q } : x)))} label={`Quantité ${p.code}`} />
              <button type="button" className="grid size-8 place-items-center rounded-tech text-ink/70 hover:bg-salt hover:text-danger" aria-label={`Retirer ${p.code}`} onClick={() => setLines((ls) => ls.filter((_, k) => k !== i))}>
                <Icon name="trash" size={16} />
              </button>
            </li>
          );
        })}
      </ul>
      <div className="mt-4 max-w-md">
        <ProductPicker onPick={(p) => setLines((ls) => [...ls, { productId: p.id, packagingId: p.packagings[0]!.id, quantity: 1 }])} />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-rule pt-4">
        <Button size="sm" disabled={!dirty} onClick={save}>
          Enregistrer
        </Button>
        {saved ? <span role="status" className="text-sm text-ok">Enregistré.</span> : null}
        <button
          type="button"
          className="link-u ml-auto text-sm text-danger"
          onClick={async () => {
            if (!confirm(`Supprimer la liste « ${list.name} » ?`)) return;
            await (await getBackend()).deleteFavorite(list.id);
            onSaved();
          }}
        >
          Supprimer la liste
        </button>
      </div>
    </article>
  );
}

export default function ProFavorites() {
  const user = useSession((s) => s.user);
  const cartLines = useCart((s) => s.lines);
  const accountId = user?.accountId ?? "";
  const { data: lists, reload } = useData((b) => (accountId ? b.listFavorites(accountId) : Promise.resolve([])), [accountId]);
  const [newName, setNewName] = useState("");
  if (!accountId) return <p className="text-ink/70">Les listes favorites sont rattachées à une structure.</p>;
  const create = async (lines: CartLine[]) => {
    const name = newName.trim() || `Liste du ${new Date().toLocaleDateString("fr-FR")}`;
    await (await getBackend()).saveFavorite({ accountId, name, lines });
    setNewName("");
    reload();
  };
  return (
    <div className="space-y-8">
      <h1 className="t-h2">Listes favorites</h1>
      <div className="flex flex-wrap items-end gap-3 rounded-box border border-dashed border-ink/40 p-4">
        <div className="min-w-60 flex-1">
          <label htmlFor="fav-new" className="mb-2 block text-sm font-semibold">
            Nouvelle liste
          </label>
          <Input id="fav-new" placeholder="Stock atelier, Rentrée scolaire, Ouverture saison…" value={newName} onChange={(e) => setNewName(e.target.value)} />
        </div>
        <Button variant="outline" onClick={() => create([])}>
          Créer vide
        </Button>
        <Button variant="primary" disabled={!cartLines.length} onClick={() => create(cartLines)}>
          Créer depuis le bon actuel ({cartLines.length})
        </Button>
      </div>
      {(lists ?? []).map((l) => (
        <ListEditor key={l.id + l.name} list={l} onSaved={reload} />
      ))}
    </div>
  );
}
