"use client";
import Link from "next/link";
import { useMemo } from "react";
import { useData } from "@/lib/hooks/useData";
import { useCatalog } from "@/lib/store/catalog";
import { StatusBadge, DemoBadge, ToConfirm } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { statusFlow, statusLabels, unitCount } from "@/lib/orders";
import { formatDateTime } from "@/lib/format";
import type { OrderStatus } from "@/lib/types";

function Kpi({ label, value, href }: { label: React.ReactNode; value: number | string; href?: string }) {
  const inner = (
    <>
      <p className="text-sm font-semibold text-ink/70">{label}</p>
      <p className="t-num mt-3 text-[2.5rem] text-ink">{value}</p>
    </>
  );
  return href ? (
    <Link href={href} className="group relative block rounded-[8px] border border-rule bg-white p-4 transition-colors duration-150 hover:border-mci sm:p-5">
      {inner}
      <Icon name="arrowUpRight" size={18} className="absolute right-4 top-4 text-ink/40 transition-colors duration-150 group-hover:text-mci sm:right-5 sm:top-5" />
    </Link>
  ) : (
    <div className="rounded-[8px] border border-rule bg-white p-4 sm:p-5">{inner}</div>
  );
}

const card = "overflow-hidden rounded-[8px] border border-rule bg-white";
const cardHead = "t-label border-b border-rule px-4 py-3 sm:px-5";

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
    <div className="space-y-6">
      <h1 className="t-h2">Tableau de bord</h1>
      <div className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Commandes (7 jours)" value={stats.week.length} href="/admin/commandes" />
        <Kpi label="À traiter (reçues)" value={stats.toProcess.length} href="/admin/commandes?statut=received" />
        <Kpi label="Comptes à valider" value={pending.length} href="/admin/clients" />
        <Kpi
          label={
            <span className="flex flex-wrap items-center gap-x-2 gap-y-1 pr-6">
              Fiches produits <ToConfirm />
            </span>
          }
          value={toConfirm}
          href="/admin/produits?a-confirmer=1"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className={card} aria-labelledby="k-traiter">
          <h2 id="k-traiter" className={cardHead}>
            Commandes à traiter
          </h2>
          <ul className="divide-y divide-rule">
            {stats.toProcess.length ? (
              stats.toProcess.map((o) => (
                <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-sm transition-colors duration-150 hover:bg-salt sm:px-5">
                  <Link href={`/admin/commandes/${o.id}`} className="t-mono font-semibold text-mci hover:underline">
                    {o.number}
                  </Link>
                  <span className="min-w-0 flex-1 truncate px-2">{o.customer.company}</span>
                  {o.isDemo ? <DemoBadge /> : null}
                  <span className="t-mono text-xs text-ink/70">{formatDateTime(o.createdAt)}</span>
                </li>
              ))
            ) : (
              <li className="px-4 py-3 text-sm text-ink/70 sm:px-5">Rien en attente.</li>
            )}
          </ul>
        </section>
        <section className={card} aria-labelledby="k-statuts">
          <h2 id="k-statuts" className={cardHead}>
            Par statut
          </h2>
          <ul className="space-y-3 px-4 py-4 sm:px-5">
            {(["pending_approval", ...statusFlow, "cancelled"] as OrderStatus[]).map((s) => {
              const n = stats.byStatus.get(s) ?? 0;
              const max = Math.max(1, ...stats.byStatus.values());
              return (
                <li key={s} className="grid grid-cols-[112px_1fr_32px] items-center gap-3 text-sm sm:grid-cols-[132px_1fr_40px]">
                  <span className="min-w-0">
                    <StatusBadge status={s} />
                  </span>
                  <span className="h-2 overflow-hidden rounded-[2px] bg-steel" aria-hidden="true">
                    <span className="block h-2 rounded-[2px] bg-mci" style={{ width: `${(n / max) * 100}%` }} />
                  </span>
                  <span className="t-mono text-right font-semibold" aria-label={`${statusLabels[s]} : ${n}`}>
                    {n}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
        <section className={card} aria-labelledby="k-top">
          <h2 id="k-top" className={cardHead}>
            Produits les plus commandés
          </h2>
          <ol className="divide-y divide-rule">
            {stats.top.map(([id, q], i) => {
              const p = products.find((x) => x.id === id);
              return (
                <li key={id} className="flex items-center justify-between gap-3 px-4 py-2 text-sm transition-colors duration-150 hover:bg-salt sm:px-5">
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="t-mono w-6 shrink-0 text-xs text-ink/70">{String(i + 1).padStart(2, "0")}</span>
                    <span className="min-w-0 truncate">
                      <span className="t-code text-mci">{p?.code ?? id}</span> <span className="text-ink/70">{p?.short}</span>
                    </span>
                  </span>
                  <span className="t-mono shrink-0 font-semibold">{q} u.</span>
                </li>
              );
            })}
          </ol>
        </section>
        <section className={card} aria-labelledby="k-comptes">
          <h2 id="k-comptes" className={cardHead}>
            Comptes en attente de validation
          </h2>
          <ul className="divide-y divide-rule">
            {pending.length ? (
              pending.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-2 px-4 py-2.5 text-sm transition-colors duration-150 hover:bg-salt sm:px-5">
                  <span className="min-w-0 truncate">{a.company}</span>
                  <Link href="/admin/clients" className="link-u shrink-0 font-semibold">
                    Valider
                  </Link>
                </li>
              ))
            ) : (
              <li className="px-4 py-3 text-sm text-ink/70 sm:px-5">Aucun.</li>
            )}
          </ul>
          <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t border-rule bg-salt px-4 py-3 sm:px-5">
            <span className="t-num text-[2rem]">{(orders ?? []).reduce((n, o) => n + unitCount(o), 0)}</span>
            <span className="text-sm text-ink/70">unités commandées au total</span>
          </p>
        </section>
      </div>
    </div>
  );
}
