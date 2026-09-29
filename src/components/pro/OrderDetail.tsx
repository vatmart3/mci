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
    <article className="overflow-hidden rounded-[8px] border border-rule bg-white shadow-sheet" aria-labelledby={`od-${order.id}`}>
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-rule px-4 py-4 sm:px-6">
        <div className="min-w-0">
          <h2 id={`od-${order.id}`} className="t-mono break-all text-lg font-semibold text-ink">
            {order.number}
          </h2>
          <p className="mt-0.5 text-sm text-ink/70">
            Passée le <span className="t-mono">{formatDateTime(order.createdAt)}</span> · {order.customer.contactName}
            {order.poNumber ? (
              <>
                {" "}
                · Engagement <span className="t-mono">{order.poNumber}</span>
              </>
            ) : null}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge status={order.status} />
          {order.customerAcceptedAt ? <Badge tone="ok">PRO-FORMA VALIDÉE</Badge> : null}
          {order.isDemo ? <DemoBadge /> : null}
        </div>
      </header>
      <div className="space-y-6 px-4 py-5 sm:px-6">
        <OrderTimeline order={order} />
        {order.leadTime || order.mciNote ? (
          <dl className="grid grid-cols-1 divide-y divide-rule rounded-[6px] border border-rule bg-salt text-sm sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            {order.leadTime ? (
              <div className="px-4 py-3">
                <dt className="text-xs font-semibold text-ink/70">Délai</dt>
                <dd className="mt-0.5">{order.leadTime}</dd>
              </div>
            ) : null}
            {order.mciNote ? (
              <div className="px-4 py-3">
                <dt className="text-xs font-semibold text-ink/70">Message MCI</dt>
                <dd className="mt-0.5">{order.mciNote}</dd>
              </div>
            ) : null}
          </dl>
        ) : null}
        <OrderLinesTable order={order} />
        <p className="text-sm text-ink/80">
          <span className="mr-2 text-xs font-semibold text-ink/70">Livraison</span>
          {d.line1}, {d.postalCode} {d.city}
          {d.accessNotes ? ` — ${d.accessNotes}` : ""}
        </p>
      </div>
      <footer className="flex flex-wrap items-center gap-2 border-t border-rule bg-salt px-4 py-3 sm:px-6">
        <OrderClientActions order={order} onChange={onChange} />
        <ReorderButton order={order} />
        <PdfButton order={order} kind="bon" label="Bon de commande" />
        {order.lines.some((l) => l.unitPriceHt != null) ? <PdfButton order={order} kind="proforma" label="Pro-forma" /> : null}
      </footer>
    </article>
  );
}
