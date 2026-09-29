"use client";
import type { Order } from "@/lib/types";
import { StatusBadge, DemoBadge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/format";
import { ReorderButton } from "./OrderActions";
import { cx } from "@/lib/cx";

export function OrdersTable({ orders, selected, onSelect }: { orders: Order[]; selected?: string | null; onSelect?: (o: Order) => void }) {
  if (!orders.length) return <p className="rounded-[8px] border border-rule bg-white px-6 py-10 text-center text-sm text-ink/70">Aucune commande pour l&apos;instant.</p>;
  return (
    <div className="overflow-hidden rounded-[8px] border border-rule bg-white">
      <div className="relative overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-rule bg-steel/60 text-xs font-semibold text-ink/70">
            <tr>
              <th scope="col" className="py-2.5 pl-4 pr-3">
                N°
              </th>
              <th scope="col" className="px-3 py-2.5">
                Date
              </th>
              <th scope="col" className="px-3 py-2.5">
                Réf.
              </th>
              <th scope="col" className="px-3 py-2.5">
                Statut
              </th>
              <th scope="col" className="py-2.5 pl-3 pr-4">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rule">
            {orders.map((o) => (
              <tr key={o.id} className={cx("transition-colors duration-150", selected === o.id ? "bg-sky/40" : "hover:bg-salt")}>
                <td className="py-2.5 pl-4 pr-3">
                  <span className="flex items-center gap-2">
                    <button type="button" className="t-mono font-semibold text-mci underline-offset-4 hover:underline" onClick={() => onSelect?.(o)} aria-expanded={selected === o.id}>
                      {o.number}
                    </button>
                    {o.isDemo ? <DemoBadge /> : null}
                  </span>
                </td>
                <td className="t-mono whitespace-nowrap px-3 py-2.5 text-ink/70">{formatDate(o.createdAt)}</td>
                <td className="max-w-[240px] px-3 py-2.5 text-ink/80">
                  <span className="line-clamp-1">{o.lines.map((l) => l.code).join(", ")}</span>
                </td>
                <td className="px-3 py-2.5">
                  <StatusBadge status={o.status} />
                </td>
                <td className="py-2 pl-3 pr-4 text-right">
                  <ReorderButton order={o} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
