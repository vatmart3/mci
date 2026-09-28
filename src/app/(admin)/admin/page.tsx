"use client";
import Link from "next/link";
import { useMemo } from "react";
import { useData } from "@/lib/hooks/useData";
import { useCatalog } from "@/lib/store/catalog";
import { StatusBadge, DemoBadge } from "@/components/ui/Badge";
import { statusFlow, statusLabels, unitCount } from "@/lib/orders";
import { formatDateTime } from "@/lib/format";
import type { OrderStatus } from "@/lib/types";

function Kpi({ label, value, href }: { label: string; value: number | string; href?: string }) {
  const inner = (
    <>
      <p className="t-mono text-xs text-ink/70">{label.toUpperCase()}</p>
      <p className="t-mono mt-2 text-3xl">{value}</p>
    </>
  );
  return href ? (
    <Link href={href} className="block rounded-box border border-rule bg-white p-4 hover:border-ink">
      {inner}
    </Link>
  ) : (
    <div className="rounded-box border border-rule bg-white p-4">{inner}</div>
  );
}

export default function AdminDashboard() {
  const { data: orders } = useData((b) => b.listOrders(), []);
  const { data: accounts } = useData((b) => b.listAccounts(), []);
  const products = useCatalog((s) => s.products);

  const stats = useMemo(() => {
    const list = orders ?? [];
    const weekAgo = Date.now() - 7 * 864e5;
    const week = list.filter((o) => new Date(o.createdAt).getTime() >= weekAgo);
    const byStatus = new Map<OrderStatus, number>();
    for (const o of list) byStatus.set(o.status, (byStatus.get(o.status) ?? 0) + 1);
    const qty = new Map<string, number>();
    for (const o of list) if (o.status !== "cancelled") for (const l of o.lines) qty.set(l.productId, (qty.get(l.productId) ?? 0) + l.quantity);
    const top = [...qty.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
    return { week, byStatus, top, toProcess: list.filter((o) => o.status === "received") };
  }, [orders]);
  const pending = (accounts ?? []).filter((a) => a.status === "pending");
  const toConfirm = products.filter((p) => p.toConfirm.length).length;

  return (
    <div className="space-y-10">
      <h1 className="t-h2">Tableau de bord</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Kpi label="Commandes (7 jours)" value={stats.week.length} href="/admin/commandes" />
        <Kpi label="À traiter (reçues)" value={stats.toProcess.length} href="/admin/commandes?statut=received" />
        <Kpi label="Comptes à valider" value={pending.length} href="/admin/clients" />
        <Kpi label="Fiches produits [à confirmer]" value={toConfirm} href="/admin/produits?a-confirmer=1" />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="rounded-box border border-rule bg-white p-4 sm:p-6" aria-labelledby="k-traiter">
          <h2 id="k-traiter" className="t-label">
            Commandes à traiter
          </h2>
          <ul className="mt-4 divide-y divide-rule">
            {stats.toProcess.length ? (
              stats.toProcess.map((o) => (
                <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                  <Link href={`/admin/commandes/${o.id}`} className="t-mono text-mci hover:underline">
                    {o.number}
                  </Link>
                  <span className="min-w-0 flex-1 truncate px-2">{o.customer.company}</span>
                  {o.isDemo ? <DemoBadge /> : null}
                  <span className="t-mono text-xs text-ink/60">{formatDateTime(o.createdAt)}</span>
                </li>
              ))
            ) : (
              <li className="py-2 text-sm text-ink/70">Rien en attente.</li>
            )}
          </ul>
        </section>
        <section className="rounded-box border border-rule bg-white p-4 sm:p-6" aria-labelledby="k-statuts">
          <h2 id="k-statuts" className="t-label">
            Par statut
          </h2>
          <ul className="mt-4 space-y-2">
            {(["pending_approval", ...statusFlow, "cancelled"] as OrderStatus[]).map((s) => {
              const n = stats.byStatus.get(s) ?? 0;
              const max = Math.max(1, ...stats.byStatus.values());
              return (
                <li key={s} className="grid grid-cols-[120px_1fr_32px] items-center gap-3 text-sm">
                  <StatusBadge status={s} />
                  <span className="h-2 rounded-tech bg-salt" aria-hidden="true">
                    <span className="block h-2 rounded-tech bg-mci" style={{ width: `${(n / max) * 100}%` }} />
                  </span>
                  <span className="t-mono text-right" aria-label={`${statusLabels[s]} : ${n}`}>
                    {n}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
        <section className="rounded-box border border-rule bg-white p-4 sm:p-6" aria-labelledby="k-top">
          <h2 id="k-top" className="t-label">
            Produits les plus commandés
          </h2>
          <ol className="mt-4 divide-y divide-rule">
            {stats.top.map(([id, q], i) => {
              const p = products.find((x) => x.id === id);
              return (
                <li key={id} className="flex items-center justify-between py-2 text-sm">
                  <span>
                    <span className="t-mono mr-3 text-xs text-ink/50">{String(i + 1).padStart(2, "0")}</span>
                    <span className="t-code text-mci">{p?.code ?? id}</span> <span className="text-ink/70">{p?.short}</span>
                  </span>
                  <span className="t-mono">{q} u.</span>
                </li>
              );
            })}
          </ol>
        </section>
        <section className="rounded-box border border-rule bg-white p-4 sm:p-6" aria-labelledby="k-comptes">
          <h2 id="k-comptes" className="t-label">
            Comptes en attente de validation
          </h2>
          <ul className="mt-4 divide-y divide-rule">
            {pending.length ? (
              pending.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                  <span>{a.company}</span>
                  <Link href="/admin/clients" className="link-u">
                    Valider
                  </Link>
                </li>
              ))
            ) : (
              <li className="py-2 text-sm text-ink/70">Aucun.</li>
            )}
          </ul>
          <p className="t-mono mt-4 text-xs text-ink/60">{(orders ?? []).reduce((n, o) => n + unitCount(o), 0)} UNITÉS COMMANDÉES AU TOTAL</p>
        </section>
      </div>
    </div>
  );
}
