"use client";
import { useEffect, useState } from "react";
import type { Account, PostalAddress, UserRole } from "@/lib/types";
import { useSession } from "@/lib/store/session";
import { useData } from "@/lib/hooks/useData";
import { getBackend } from "@/lib/backend";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, Checkbox } from "@/components/ui/Field";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";

type Addr = PostalAddress & { id: string; isDefault?: boolean };

export default function ProAddresses() {
  const { user, account, refresh } = useSession();
  const [draft, setDraft] = useState<Account | null>(account);
  const [msg, setMsg] = useState<string | null>(null);
  const accountId = user?.accountId ?? "";
  const { data: users, reload } = useData((b) => (accountId ? b.listUsers(accountId) : Promise.resolve([])), [accountId]);
  const [nu, setNu] = useState({ fullName: "", email: "", role: "buyer" as UserRole, password: "" });
  const [nuErr, setNuErr] = useState<string | null>(null);

  useEffect(() => setDraft(account), [account]);
  if (!account || !draft) return <p className="text-ink/70">Aucune structure rattachée à ce compte.</p>;
  const canEdit = user?.role === "approver";

  const setAddr = (i: number, patch: Partial<Addr>) => setDraft({ ...draft, addresses: draft.addresses.map((a, k) => (k === i ? { ...a, ...patch } : patch.isDefault ? { ...a, isDefault: false } : a)) });

  const save = async () => {
    setMsg(null);
    try {
      await (await getBackend()).updateAccount(account.id, {
        chorus: draft.chorus,
        chorusServiceCode: draft.chorusServiceCode,
        billing: draft.billing,
        addresses: draft.addresses.filter((a) => a.line1 && a.postalCode && a.city),
      });
      await refresh();
      setMsg("Enregistré.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Enregistrement impossible");
    }
  };

  return (
    <div className="space-y-12">
      <h1 className="t-h2">Structure & adresses</h1>

      <section aria-labelledby="s-structure" className="rounded-box border border-rule bg-white p-4 sm:p-6">
        <h2 id="s-structure" className="t-label">
          Structure
        </h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="t-mono text-xs text-ink/70">RAISON SOCIALE</dt>
            <dd>{account.company}</dd>
          </div>
          <div>
            <dt className="t-mono text-xs text-ink/70">SIRET</dt>
            <dd className="t-mono">{account.siret}</dd>
          </div>
          <div>
            <dt className="t-mono text-xs text-ink/70">VALIDATION DES COMMANDES</dt>
            <dd>{account.requiresApproval ? "Les commandes des acheteurs passent par un valideur" : "Directe"}</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-ink/70">Pour modifier la raison sociale ou le SIRET, contactez MCI.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Checkbox id="p-chorus" checked={draft.chorus} disabled={!canEdit} onChange={(e) => setDraft({ ...draft, chorus: e.target.checked })} label="Facturation via Chorus Pro" />
          {draft.chorus ? (
            <div>
              <Label htmlFor="p-chorus-code">Code service Chorus Pro</Label>
              <Input id="p-chorus-code" className="t-mono" disabled={!canEdit} value={draft.chorusServiceCode ?? ""} onChange={(e) => setDraft({ ...draft, chorusServiceCode: e.target.value })} />
            </div>
          ) : null}
        </div>
      </section>

      <section aria-labelledby="s-adresses">
        <div className="flex items-baseline justify-between">
          <h2 id="s-adresses" className="t-label">
            Adresses de livraison
          </h2>
          {canEdit ? (
            <button type="button" className="link-u inline-flex items-center gap-1 text-sm" onClick={() => setDraft({ ...draft, addresses: [...draft.addresses, { id: `new-${Date.now()}`, label: "", line1: "", postalCode: "", city: "" }] })}>
              <Icon name="plus" size={16} /> Ajouter une adresse
            </button>
          ) : null}
        </div>
        <ul className="mt-4 space-y-4">
          {draft.addresses.map((a, i) => (
            <li key={a.id} className="rounded-box border border-rule bg-white p-4">
              <div className="grid gap-3 sm:grid-cols-6">
                <div className="sm:col-span-2">
                  <Label htmlFor={`a-label-${i}`}>Nom</Label>
                  <Input id={`a-label-${i}`} fieldSize="sm" disabled={!canEdit} value={a.label ?? ""} onChange={(e) => setAddr(i, { label: e.target.value })} placeholder="Centre technique, école…" />
                </div>
                <div className="sm:col-span-4">
                  <Label htmlFor={`a-line1-${i}`}>Adresse</Label>
                  <Input id={`a-line1-${i}`} fieldSize="sm" disabled={!canEdit} value={a.line1} onChange={(e) => setAddr(i, { line1: e.target.value })} />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor={`a-cp-${i}`}>Code postal</Label>
                  <Input id={`a-cp-${i}`} fieldSize="sm" className="t-mono" disabled={!canEdit} value={a.postalCode} onChange={(e) => setAddr(i, { postalCode: e.target.value })} />
                </div>
                <div className="sm:col-span-4">
                  <Label htmlFor={`a-city-${i}`}>Ville</Label>
                  <Input id={`a-city-${i}`} fieldSize="sm" disabled={!canEdit} value={a.city} onChange={(e) => setAddr(i, { city: e.target.value })} />
                </div>
                <div className="sm:col-span-6">
                  <Label htmlFor={`a-access-${i}`}>Contraintes d&apos;accès / créneaux</Label>
                  <Input id={`a-access-${i}`} fieldSize="sm" disabled={!canEdit} value={a.accessNotes ?? ""} onChange={(e) => setAddr(i, { accessNotes: e.target.value })} />
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <Checkbox id={`a-def-${i}`} checked={!!a.isDefault} disabled={!canEdit} onChange={() => setAddr(i, { isDefault: true })} label={<span className="text-sm">Adresse par défaut</span>} />
                {canEdit ? (
                  <button type="button" className="link-u text-sm text-danger" onClick={() => setDraft({ ...draft, addresses: draft.addresses.filter((_, k) => k !== i) })}>
                    Supprimer
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="s-factu" className="rounded-box border border-rule bg-white p-4 sm:p-6">
        <h2 id="s-factu" className="t-label">
          Adresse de facturation
        </h2>
        <Checkbox
          id="p-billing-same"
          className="mt-4"
          checked={!draft.billing}
          disabled={!canEdit}
          onChange={(e) => setDraft({ ...draft, billing: e.target.checked ? null : { company: account.company, line1: "", postalCode: "", city: "" } })}
          label="Identique à l'adresse de livraison"
        />
        {draft.billing ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-6">
            <div className="sm:col-span-6">
              <Label htmlFor="b-company">Entité facturée</Label>
              <Input id="b-company" fieldSize="sm" disabled={!canEdit} value={draft.billing.company ?? ""} onChange={(e) => setDraft({ ...draft, billing: { ...draft.billing!, company: e.target.value } })} />
            </div>
            <div className="sm:col-span-6">
              <Label htmlFor="b-line1">Adresse</Label>
              <Input id="b-line1" fieldSize="sm" disabled={!canEdit} value={draft.billing.line1} onChange={(e) => setDraft({ ...draft, billing: { ...draft.billing!, line1: e.target.value } })} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="b-cp">Code postal</Label>
              <Input id="b-cp" fieldSize="sm" className="t-mono" disabled={!canEdit} value={draft.billing.postalCode} onChange={(e) => setDraft({ ...draft, billing: { ...draft.billing!, postalCode: e.target.value } })} />
            </div>
            <div className="sm:col-span-4">
              <Label htmlFor="b-city">Ville</Label>
              <Input id="b-city" fieldSize="sm" disabled={!canEdit} value={draft.billing.city} onChange={(e) => setDraft({ ...draft, billing: { ...draft.billing!, city: e.target.value } })} />
            </div>
          </div>
        ) : null}
      </section>

      {canEdit ? (
        <div className="flex items-center gap-4">
          <Button onClick={save}>Enregistrer les modifications</Button>
          {msg ? <span role="status" className="text-sm">{msg}</span> : null}
        </div>
      ) : (
        <p className="text-sm text-ink/70">Seul un valideur de la structure peut modifier ces informations.</p>
      )}

      <section aria-labelledby="s-users">
        <h2 id="s-users" className="t-label">
          Utilisateurs de la structure
        </h2>
        <ul className="mt-4 divide-y divide-rule border-y border-rule">
          {(users ?? []).map((u) => (
            <li key={u.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
              <span>
                {u.fullName} <span className="t-mono text-xs text-ink/70">{u.email}</span>
              </span>
              <Badge tone={u.role === "approver" ? "mci" : "ink"}>{u.role === "approver" ? "VALIDEUR" : "ACHETEUR"}</Badge>
            </li>
          ))}
        </ul>
        {canEdit ? (
          <form
            className="mt-6 grid gap-3 rounded-box border border-dashed border-ink/40 p-4 sm:grid-cols-2"
            onSubmit={async (e) => {
              e.preventDefault();
              setNuErr(null);
              try {
                await (await getBackend()).addUser(account.id, nu);
                setNu({ fullName: "", email: "", role: "buyer", password: "" });
                reload();
              } catch (err) {
                setNuErr(err instanceof Error ? err.message : "Ajout impossible");
              }
            }}
          >
            <p className="font-semibold sm:col-span-2">Ajouter un utilisateur</p>
            <div>
              <Label htmlFor="nu-name" required>Nom</Label>
              <Input id="nu-name" fieldSize="sm" required value={nu.fullName} onChange={(e) => setNu({ ...nu, fullName: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="nu-email" required>Email</Label>
              <Input id="nu-email" fieldSize="sm" type="email" required value={nu.email} onChange={(e) => setNu({ ...nu, email: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="nu-role">Rôle</Label>
              <Select id="nu-role" fieldSize="sm" value={nu.role} onChange={(e) => setNu({ ...nu, role: e.target.value as UserRole })}>
                <option value="buyer">Acheteur (prépare les commandes)</option>
                <option value="approver">Valideur (valide et transmet)</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="nu-pass" required>Mot de passe provisoire</Label>
              <Input id="nu-pass" fieldSize="sm" type="password" minLength={8} required value={nu.password} onChange={(e) => setNu({ ...nu, password: e.target.value })} />
            </div>
            {nuErr ? <p role="alert" className="text-sm text-danger sm:col-span-2">{nuErr}</p> : null}
            <div className="sm:col-span-2">
              <Button type="submit" size="sm" variant="outline">
                Ajouter
              </Button>
            </div>
          </form>
        ) : null}
      </section>
    </div>
  );
}
