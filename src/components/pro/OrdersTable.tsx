"use client";
import type { Order } from "@/lib/types";
import { StatusBadge, DemoBadge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/format";
import { ReorderButton } from "./OrderActions";
import { cx } from "@/lib/cx";

export function OrdersTable({ orders, selected, onSelect }: { orders: Order[]; selected?: string | null; onSelect?: (o: Order) => void }) {
  if (!orders.length) return <p className="rounded-box bg-white px-6 py-10 text-center text-ink/70 ring-1 ring-black/5">Aucune commande pour l&apos;instant.</p>;
  return (
    <div className="overflow-hidden rounded-box bg-white ring-1 ring-black/5">
      <div className="relative overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="text-left text-xs text-ink/70">
              <th className="py-3 pl-5 pr-3 font-medium">N°</th>
              <th className="px-3 py-3 font-medium">Date</th>
              <th className="px-3 py-3 font-medium">Réf.</th>
              <th className="px-3 py-3 font-medium">Statut</th>
              <th className="py-3 pl-3 pr-5 font-medium">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className={cx("border-t border-black/5 transition-colors duration-200", selected === o.id ? "bg-mci/5" : "hover:bg-salt")}>
                <td className="py-3.5 pl-5 pr-3">
                  <span className="flex items-center gap-2">
                    <button type="button" className="t-mono font-medium text-mci underline-offset-4 hover:underline" onClick={() => onSelect?.(o)} aria-expanded={selected === o.id}>
                      {o.number}
                    </button>
                    {o.isDemo ? <DemoBadge /> : null}
                  </span>
                </td>
                <td className="t-mono px-3 py-3.5 text-ink/70">{formatDate(o.createdAt)}</td>
                <td className="max-w-[240px] px-3 py-3.5 text-ink/70">
                  <span className="line-clamp-1">{o.lines.map((l) => l.code).join(", ")}</span>
                </td>
                <td className="px-3 py-3.5">
                  <StatusBadge status={o.status} />
                </td>
                <td className="py-3.5 pl-3 pr-5 text-right">
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
