"use client";
import type { Order } from "@/lib/types";
import { StatusBadge, DemoBadge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/format";
import { ReorderButton } from "./OrderActions";
import { cx } from "@/lib/cx";

export function OrdersTable({ orders, selected, onSelect }: { orders: Order[]; selected?: string | null; onSelect?: (o: Order) => void }) {
  if (!orders.length) return <p className="py-8 text-ink/70">Aucune commande pour l&apos;instant.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="t-mono border-b border-ink text-left text-xs text-ink/70">
            <th className="py-2 pr-3 font-normal">N°</th>
            <th className="py-2 pr-3 font-normal">DATE</th>
            <th className="py-2 pr-3 font-normal">RÉF.</th>
            <th className="py-2 pr-3 font-normal">STATUT</th>
            <th className="py-2 font-normal">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className={cx("border-b border-rule", selected === o.id && "bg-white")}>
              <td className="py-3 pr-3">
                <button type="button" className="t-mono text-mci underline-offset-4 hover:underline" onClick={() => onSelect?.(o)} aria-expanded={selected === o.id}>
                  {o.number}
                </button>
                {o.isDemo ? <span className="ml-2"><DemoBadge /></span> : null}
              </td>
              <td className="t-mono py-3 pr-3">{formatDate(o.createdAt)}</td>
              <td className="py-3 pr-3 text-ink/80">
                <span className="line-clamp-1">{o.lines.map((l) => l.code).join(", ")}</span>
              </td>
              <td className="py-3 pr-3">
                <StatusBadge status={o.status} />
              </td>
              <td className="py-3 text-right">
                <ReorderButton order={o} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
