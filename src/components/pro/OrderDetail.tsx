"use client";
import type { Order } from "@/lib/types";
import { StatusBadge, DemoBadge, Badge } from "@/components/ui/Badge";
import { OrderTimeline } from "@/components/order/OrderTimeline";
import { OrderLinesTable } from "@/components/order/OrderLinesTable";
import { formatDateTime } from "@/lib/format";
import { OrderClientActions, PdfButton, ReorderButton } from "./OrderActions";

export function OrderDetail({ order, onChange }: { order: Order; onChange?: (o: Order) => void }) {
  const d = order.delivery;
  return (
    <article className="rounded-box bg-white p-4 shadow-sheet ring-1 ring-black/5 sm:p-8" aria-labelledby={`od-${order.id}`}>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 id={`od-${order.id}`} className="t-mono text-lg font-medium text-ink">
            {order.number}
          </h2>
          <p className="mt-1 text-sm text-ink/70">
            Passée le {formatDateTime(order.createdAt)} · {order.customer.contactName}
            {order.poNumber ? ` · Engagement ${order.poNumber}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge status={order.status} />
          {order.customerAcceptedAt ? <Badge tone="ok">PRO-FORMA VALIDÉE</Badge> : null}
          {order.isDemo ? <DemoBadge /> : null}
        </div>
      </header>
      <div className="mt-8">
        <OrderTimeline order={order} />
      </div>
      {order.leadTime || order.mciNote ? (
        <div className="mt-8 grid grid-cols-1 gap-3 rounded-tech bg-salt p-4 text-sm sm:grid-cols-2">
          {order.leadTime ? (
            <p>
              <span className="block text-xs font-medium text-ink/70">Délai</span>
              {order.leadTime}
            </p>
          ) : null}
          {order.mciNote ? (
            <p>
              <span className="block text-xs font-medium text-ink/70">Message MCI</span>
              {order.mciNote}
            </p>
          ) : null}
        </div>
      ) : null}
      <div className="mt-8">
        <OrderLinesTable order={order} />
      </div>
      <p className="mt-6 text-sm text-ink/80">
        <span className="mr-2 text-xs font-medium text-ink/70">Livraison</span>
        {d.line1}, {d.postalCode} {d.city}
        {d.accessNotes ? ` — ${d.accessNotes}` : ""}
      </p>
      <footer className="mt-6 flex flex-wrap items-center gap-2 border-t border-black/5 pt-5">
        <OrderClientActions order={order} onChange={onChange} />
        <ReorderButton order={order} />
        <PdfButton order={order} kind="bon" label="Bon de commande" />
        {order.lines.some((l) => l.unitPriceHt != null) ? <PdfButton order={order} kind="proforma" label="Pro-forma" /> : null}
      </footer>
    </article>
  );
}
