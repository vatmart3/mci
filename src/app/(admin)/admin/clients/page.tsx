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
    <li className="rounded-box border border-rule bg-white">
      <button type="button" className="flex w-full flex-wrap items-center gap-3 px-4 py-3 text-left" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <span className="min-w-0 flex-1">
          <span className="font-semibold">{account.company}</span>
          <span className="t-mono ml-2 text-xs text-ink/70">SIRET {account.siret}</span>
        </span>
        <span className="text-xs text-ink/70">{account.kind} · créé le {formatDate(account.createdAt)}</span>
        {account.isDemo ? <DemoBadge /> : null}
        <Badge tone={statusTone[account.status]}>{statusText[account.status]}</Badge>
      </button>
      {open ? (
        <div className="grid gap-6 border-t border-rule p-4 lg:grid-cols-2">
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
            <div className="text-sm">
              <p className="t-mono text-xs text-ink/70">ADRESSES</p>
              <ul className="mt-1 space-y-1">
                {account.addresses.map((a) => (
                  <li key={a.id}>
                    {a.label ? <strong>{a.label} · </strong> : null}
                    {a.line1}, {a.postalCode} {a.city}
                  </li>
                ))}
              </ul>
            </div>
            {err ? <p role="alert" className="text-sm text-danger">{err}</p> : null}
          </div>
          <div>
            <p className="t-mono text-xs text-ink/70">UTILISATEURS</p>
            <ul className="mt-2 divide-y divide-rule border-y border-rule text-sm">
              {(users ?? []).map((u) => (
                <li key={u.id} className="flex items-center justify-between gap-2 py-2">
                  <span>
                    {u.fullName} <span className="t-mono text-xs text-ink/70">{u.email}</span>
                  </span>
                  <Badge tone={u.role === "approver" ? "mci" : "ink"}>{u.role === "approver" ? "VALIDEUR" : "ACHETEUR"}</Badge>
                </li>
              ))}
            </ul>
            <form
              className="mt-4 grid gap-2 sm:grid-cols-2"
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
    <div className="rounded-box border border-rule bg-white p-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-64">
          <Label htmlFor={`gn-${grid.id}`}>Nom de la grille</Label>
          <Input id={`gn-${grid.id}`} fieldSize="sm" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="w-64">
          <Input fieldSize="sm" aria-label="Filtrer" placeholder="Filtrer les produits…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <span className="t-mono text-xs text-ink/70">{filled} PRIX RENSEIGNÉS</span>
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
      <div className="mt-4 max-h-[60vh] overflow-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="t-mono sticky top-0 bg-white text-left text-xs text-ink/70">
            <tr>
              <th className="py-2 pr-2 font-normal">PRODUIT</th>
              <th className="py-2 pr-2 font-normal">CONDITIONNEMENT</th>
              <th className="w-36 py-2 text-right font-normal">PRIX HT (€)</th>
            </tr>
          </thead>
          <tbody>
            {list.flatMap((p) =>
              p.packagings.map((k, i) => {
                const key = `${p.id}:${k.id}`;
                return (
                  <tr key={key} className={cx("border-t border-rule", i > 0 && "border-t-0")}>
                    <td className="py-1 pr-2">{i === 0 ? <span className="t-code text-mci">{p.code}</span> : null}</td>
                    <td className="py-1 pr-2">{k.label}</td>
                    <td className="py-1">
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
      <div className="flex border-b border-rule" role="tablist">
        {(["comptes", "grilles"] as const).map((t) => (
          <button key={t} role="tab" type="button" aria-selected={tab === t} onClick={() => setTab(t)} className={cx("-mb-px border-b-2 px-4 py-2 text-sm font-semibold", tab === t ? "border-mci text-mci" : "border-transparent text-ink/70")}>
            {t === "comptes" ? `Comptes pros (${accounts?.length ?? "…"})` : "Grilles tarifaires"}
          </button>
        ))}
      </div>
      {tab === "comptes" ? (
        <>
          <div className="w-72">
            <Input fieldSize="sm" aria-label="Rechercher" placeholder="Structure, SIRET…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <ul className="space-y-3">
            {list.map((a) => (
              <AccountRow key={a.id} account={a} grids={grids ?? []} onChange={reload} />
            ))}
          </ul>
        </>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-ink/80">
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
