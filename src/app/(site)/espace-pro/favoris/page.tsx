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
    <article className="rounded-box bg-white p-4 ring-1 ring-black/5 sm:p-8">
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor={`fav-${list.id}`} className="sr-only">
          Nom de la liste
        </label>
        <Input id={`fav-${list.id}`} value={name} onChange={(e) => setName(e.target.value)} className="min-w-0 flex-1 font-semibold sm:max-w-sm" />
        <AddSelection lines={lines} label="Ajouter au bon" className="h-12! px-5! text-base! sm:ml-auto" />
      </div>
      <ul className="mt-6 divide-y divide-black/5 overflow-hidden rounded-box bg-salt empty:hidden">
        {lines.map((l, i) => {
          const p = byId(l.productId);
          if (!p) return null;
          return (
            <li key={`${l.productId}-${i}`} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <span className="t-code w-full truncate text-sm text-mci sm:w-40">{p.code}</span>
              <div className="w-44 max-w-full">
                <Select fieldSize="sm" aria-label={`Conditionnement ${p.code}`} value={l.packagingId} onChange={(e) => setLines((ls) => ls.map((x, k) => (k === i ? { ...x, packagingId: e.target.value } : x)))}>
                  {p.packagings.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.label}
                    </option>
                  ))}
                </Select>
              </div>
              <Stepper size="sm" value={l.quantity} onChange={(q) => setLines((ls) => ls.map((x, k) => (k === i ? { ...x, quantity: q } : x)))} label={`Quantité ${p.code}`} />
              <button type="button" className="ml-auto grid size-9 place-items-center rounded-full text-ink/70 transition-colors hover:bg-white hover:text-danger" aria-label={`Retirer ${p.code}`} onClick={() => setLines((ls) => ls.filter((_, k) => k !== i))}>
                <Icon name="trash" size={16} />
              </button>
            </li>
          );
        })}
      </ul>
      <div className="mt-4 max-w-md">
        <ProductPicker onPick={(p) => setLines((ls) => [...ls, { productId: p.id, packagingId: p.packagings[0]!.id, quantity: 1 }])} />
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-black/5 pt-5">
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
  if (!accountId) return <p className="rounded-box bg-white p-6 text-ink/70 ring-1 ring-black/5">Les listes favorites sont rattachées à une structure.</p>;
  const create = async (lines: CartLine[]) => {
    const name = newName.trim() || `Liste du ${new Date().toLocaleDateString("fr-FR")}`;
    await (await getBackend()).saveFavorite({ accountId, name, lines });
    setNewName("");
    reload();
  };
  return (
    <div className="space-y-8">
      <h1 className="t-h2">Listes favorites</h1>
      <div className="flex flex-col gap-3 rounded-box bg-white p-4 ring-1 ring-black/5 sm:flex-row sm:flex-wrap sm:items-end sm:p-6">
        <div className="min-w-0 sm:min-w-60 sm:flex-1">
          <label htmlFor="fav-new" className="mb-2 block text-sm font-semibold">
            Nouvelle liste
          </label>
          <Input id="fav-new" placeholder="Stock atelier, Rentrée scolaire, Ouverture saison…" value={newName} onChange={(e) => setNewName(e.target.value)} />
        </div>
        <Button variant="outline" onClick={() => create([])}>
          Créer vide
        </Button>
        <Button variant="primary" className="h-auto! min-h-11 whitespace-normal! py-2 text-center" disabled={!cartLines.length} onClick={() => create(cartLines)}>
          Créer depuis le bon actuel ({cartLines.length})
        </Button>
      </div>
      {(lists ?? []).map((l) => (
        <ListEditor key={l.id + l.name} list={l} onSaved={reload} />
      ))}
    </div>
  );
}
