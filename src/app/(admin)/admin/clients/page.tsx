"use client";
import { useMemo, useState } from "react";
import type { Account, AccountStatus, PriceGrid, UserRole } from "@/lib/types";
import { useData } from "@/lib/hooks/useData";
import { useCatalog } from "@/lib/store/catalog";
import { useSession } from "@/lib/store/session";
import { getBackend } from "@/lib/backend";
import { Badge, DemoBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, Checkbox } from "@/components/ui/Field";
import { formatDate, norm } from "@/lib/format";
import { priceModeLabels } from "@/lib/orders";
import { Icon } from "@/components/ui/Icon";
import { cx } from "@/lib/cx";

const statusTone: Record<AccountStatus, "ok" | "warn" | "danger"> = { active: "ok", pending: "warn", suspended: "danger" };
const statusText: Record<AccountStatus, string> = { active: "VALIDÉ", pending: "À VALIDER", suspended: "SUSPENDU" };

function AccountRow({ account, grids, onChange }: { account: Account; grids: PriceGrid[]; onChange: () => void }) {
  const [open, setOpen] = useState(account.status === "pending");
  const { data: users, reload } = useData((b) => (open ? b.listUsers(account.id) : Promise.resolve([])), [open, account.id]);
  const [nu, setNu] = useState({ fullName: "", email: "", role: "buyer" as UserRole, password: "" });
  const [err, setErr] = useState<string | null>(null);
  const patch = async (p: Partial<Account>) => {
    setErr(null);
    try {
      await (await getBackend()).updateAccount(account.id, p);
      onChange();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erreur");
    }
  };
  return (
    <li className="overflow-hidden rounded-box bg-white ring-1 ring-black/5">
      <button type="button" className="flex w-full flex-wrap items-center gap-3 px-4 py-4 text-left transition-colors duration-200 hover:bg-salt/60 sm:px-6" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <span className="min-w-0 flex-1 basis-56">
          <span className="font-semibold">{account.company}</span>
          <span className="t-mono ml-2 text-xs text-ink/70">SIRET {account.siret}</span>
        </span>
        <span className="text-xs text-ink/70">{account.kind} · créé le {formatDate(account.createdAt)}</span>
        {account.isDemo ? <DemoBadge /> : null}
        <Badge tone={statusTone[account.status]}>{statusText[account.status]}</Badge>
        <Icon name="chevronDown" size={18} className={cx("shrink-0 text-ink/70 transition-transform duration-300 ease-out", open && "rotate-180")} />
      </button>
      {open ? (
        <div className="grid grid-cols-1 gap-8 border-t border-black/5 p-4 sm:p-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {account.status !== "active" ? (
                <Button size="sm" variant="primary" onClick={() => patch({ status: "active" })}>
                  Valider le compte
                </Button>
              ) : (
                <Button size="sm" variant="danger" onClick={() => patch({ status: "suspended" })}>
                  Suspendre
                </Button>
              )}
            </div>
            <div>
              <Label htmlFor={`g-${account.id}`}>Grille tarifaire</Label>
              <Select id={`g-${account.id}`} fieldSize="sm" value={account.priceGridId ?? ""} onChange={(e) => patch({ priceGridId: e.target.value || null })}>
                <option value="">Aucune (prix sur demande)</option>
                {grids.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </Select>
            </div>
            <Checkbox id={`ra-${account.id}`} checked={account.requiresApproval} onChange={(e) => patch({ requiresApproval: e.target.checked })} label={<span className="text-sm">Les commandes des acheteurs doivent être validées par un valideur de la structure</span>} />
            <Checkbox id={`ch-${account.id}`} checked={account.chorus} onChange={(e) => patch({ chorus: e.target.checked })} label={<span className="text-sm">Facturation Chorus Pro{account.chorusServiceCode ? ` (${account.chorusServiceCode})` : ""}</span>} />
            <div className="rounded-tech bg-salt p-4 text-sm">
              <p className="text-xs font-medium text-ink/70">Adresses</p>
              <ul className="mt-2 space-y-1">
                {account.addresses.map((a) => (
                  <li key={a.id}>
                    {a.label ? <strong>{a.label} · </strong> : null}
                    {a.line1}, {a.postalCode} {a.city}
                  </li>
                ))}
              </ul>
            </div>
            {err ? <p role="alert" className="rounded-tech bg-danger/10 px-4 py-3 text-sm text-danger">{err}</p> : null}
          </div>
          <div>
            <p className="text-xs font-medium text-ink/70">Utilisateurs</p>
            <ul className="mt-2 divide-y divide-black/5 overflow-hidden rounded-tech bg-salt text-sm empty:hidden">
              {(users ?? []).map((u) => (
                <li key={u.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5">
                  <span className="min-w-0">
                    <span className="font-medium">{u.fullName}</span> <span className="t-mono break-all text-xs text-ink/70">{u.email}</span>
                  </span>
                  <Badge tone={u.role === "approver" ? "mci" : "ink"}>{u.role === "approver" ? "VALIDEUR" : "ACHETEUR"}</Badge>
                </li>
              ))}
            </ul>
            <form
              className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"
              onSubmit={async (e) => {
                e.preventDefault();
                setErr(null);
                try {
                  await (await getBackend()).addUser(account.id, nu);
                  setNu({ fullName: "", email: "", role: "buyer", password: "" });
                  reload();
                } catch (x) {
                  setErr(x instanceof Error ? x.message : "Ajout impossible");
                }
              }}
            >
              <Input fieldSize="sm" aria-label="Nom" placeholder="Nom" required value={nu.fullName} onChange={(e) => setNu({ ...nu, fullName: e.target.value })} />
              <Input fieldSize="sm" aria-label="Email" placeholder="Email" type="email" required value={nu.email} onChange={(e) => setNu({ ...nu, email: e.target.value })} />
              <Select fieldSize="sm" aria-label="Rôle" value={nu.role} onChange={(e) => setNu({ ...nu, role: e.target.value as UserRole })}>
                <option value="buyer">Acheteur</option>
                <option value="approver">Valideur</option>
              </Select>
              <Input fieldSize="sm" aria-label="Mot de passe provisoire" placeholder="Mot de passe provisoire" type="password" minLength={8} required value={nu.password} onChange={(e) => setNu({ ...nu, password: e.target.value })} />
              <Button type="submit" size="sm" variant="outline" className="sm:col-span-2">
                Ajouter un utilisateur
              </Button>
            </form>
          </div>
        </div>
      ) : null}
    </li>
  );
}

function GridEditor({ grid, onSaved }: { grid: PriceGrid; onSaved: () => void }) {
  const products = useCatalog((s) => s.products);
  const [prices, setPrices] = useState<Record<string, string>>(() => Object.fromEntries(Object.entries(grid.prices).map(([k, v]) => [k, String(v)])));
  const [name, setName] = useState(grid.name);
  const [q, setQ] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const list = useMemo(() => products.filter((p) => p.active && (!q || norm(`${p.code} ${p.short}`).includes(norm(q)))), [products, q]);
  const filled = Object.values(prices).filter((v) => v.trim()).length;
  return (
    <div className="rounded-box bg-white p-4 ring-1 ring-black/5 sm:p-6">
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-full sm:w-64">
          <Label htmlFor={`gn-${grid.id}`}>Nom de la grille</Label>
          <Input id={`gn-${grid.id}`} fieldSize="sm" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="w-full sm:w-64">
          <Input fieldSize="sm" className="rounded-full! pl-4!" aria-label="Filtrer" placeholder="Filtrer les produits…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <span className="inline-flex h-9 items-center rounded-full bg-salt px-3 text-xs text-ink/70">
          <span className="t-mono mr-1 font-medium text-ink">{filled}</span> prix renseignés
        </span>
        <Button
          size="sm"
          className="ml-auto"
          onClick={async () => {
            const out: Record<string, number> = {};
            for (const [k, v] of Object.entries(prices)) {
              const n = Number(v.replace(",", "."));
              if (v.trim() && Number.isFinite(n) && n >= 0) out[k] = Math.round(n * 100) / 100;
            }
            await (await getBackend()).savePriceGrid({ id: grid.id, name, prices: out });
            setMsg("Grille enregistrée.");
            onSaved();
          }}
        >
          Enregistrer la grille
        </Button>
        {msg ? <span role="status" className="text-sm text-ok">{msg}</span> : null}
      </div>
      <div className="relative mt-5 max-h-[60vh] overflow-auto rounded-tech ring-1 ring-black/5">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="sticky top-0 z-10 bg-salt text-left text-xs text-ink/70">
            <tr>
              <th className="py-2.5 pl-4 pr-2 font-medium">Produit</th>
              <th className="py-2.5 pr-2 font-medium">Conditionnement</th>
              <th className="w-40 py-2.5 pl-2 pr-4 text-right font-medium">Prix HT (€)</th>
            </tr>
          </thead>
          <tbody>
            {list.flatMap((p) =>
              p.packagings.map((k, i) => {
                const key = `${p.id}:${k.id}`;
                return (
                  <tr key={key} className={cx("border-t border-black/5 transition-colors duration-200 hover:bg-salt/60", i > 0 && "border-t-0")}>
                    <td className="py-1.5 pl-4 pr-2">{i === 0 ? <span className="t-code text-mci">{p.code}</span> : null}</td>
                    <td className="py-1.5 pr-2 text-ink/80">{k.label}</td>
                    <td className="py-1.5 pl-2 pr-4">
                      <Input fieldSize="sm" inputMode="decimal" aria-label={`Prix ${p.code} ${k.label}`} className="t-mono text-right" value={prices[key] ?? ""} placeholder="—" onChange={(e) => setPrices({ ...prices, [key]: e.target.value })} />
                    </td>
                  </tr>
                );
              }),
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AdminClients() {
  const { data: accounts, reload } = useData((b) => b.listAccounts(), []);
  const { data: grids, reload: reloadGrids } = useData((b) => b.listPriceGrids(), []);
  const priceMode = useSession((s) => s.settings.priceMode);
  const [tab, setTab] = useState<"comptes" | "grilles">("comptes");
  const [q, setQ] = useState("");
  const list = (accounts ?? []).filter((a) => !q || norm(`${a.company} ${a.siret}`).includes(norm(q))).sort((a, b) => (a.status === "pending" ? -1 : 0) - (b.status === "pending" ? -1 : 0));
  return (
    <div className="space-y-6">
      <h1 className="t-h2">Clients</h1>
      <div className="flex w-full max-w-md rounded-full bg-black/5 p-1" role="tablist">
        {(["comptes", "grilles"] as const).map((t) => (
          <button
            key={t}
            role="tab"
            type="button"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={cx(
              "h-9 min-w-0 flex-1 truncate rounded-full px-3 text-sm font-medium transition-[background-color,color,box-shadow] duration-300 ease-out",
              tab === t ? "bg-white text-ink shadow-sheet" : "text-ink/70 hover:text-ink",
            )}
          >
            {t === "comptes" ? `Comptes pros (${accounts?.length ?? "…"})` : "Grilles tarifaires"}
          </button>
        ))}
      </div>
      {tab === "comptes" ? (
        <>
          <div className="w-full sm:w-72">
            <Input fieldSize="sm" className="rounded-full! pl-4!" aria-label="Rechercher" placeholder="Structure, SIRET…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <ul className="space-y-3">
            {list.map((a) => (
              <AccountRow key={a.id} account={a} grids={grids ?? []} onChange={reload} />
            ))}
          </ul>
        </>
      ) : (
        <div className="space-y-4">
          <p className="rounded-box bg-white px-5 py-4 text-sm text-ink/70 ring-1 ring-black/5">
            Mode de prix actuel : <strong>{priceModeLabels[priceMode]}</strong>. Les grilles servent en mode « par compte » (grille affectée au compte) et « public » (première grille).
          </p>
          {(grids ?? []).map((g) => (
            <GridEditor key={g.id} grid={g} onSaved={reloadGrids} />
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              await (await getBackend()).savePriceGrid({ name: `Grille ${(grids?.length ?? 0) + 1}`, prices: {} });
              reloadGrids();
            }}
          >
            Nouvelle grille
          </Button>
        </div>
      )}
    </div>
  );
}
