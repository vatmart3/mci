import type { Order } from "@/lib/types";
import { statusFlow, statusLabels } from "@/lib/orders";
import { formatDateTime } from "@/lib/format";
import { cx } from "@/lib/cx";

/** Frise chronologique des statuts (Reçue → Livrée). */
export function OrderTimeline({ order }: { order: Order }) {
  if (order.status === "cancelled" || order.status === "pending_approval") {
    return (
      <ol className="relative space-y-5 pl-8 before:absolute before:bottom-2 before:left-[9px] before:top-2 before:w-px before:bg-rule">
        {order.events.map((e, i) => (
          <li key={i} className="relative">
            <span aria-hidden="true" className={cx("absolute -left-8 top-1 size-[18px] rounded-full border-4 border-white", e.status === "cancelled" ? "bg-danger" : "bg-warn")} />
            <p className="font-semibold">{statusLabels[e.status]}</p>
            <p className="mt-0.5 text-sm tabular-nums text-ink/70">{formatDateTime(e.at)}</p>
            {e.note ? <p className="mt-1 text-sm text-ink/70">{e.note}</p> : null}
          </li>
        ))}
      </ol>
    );
  }
  const idx = statusFlow.indexOf(order.status);
  return (
    <ol className="grid grid-cols-5 gap-1" aria-label="Avancement de la commande">
      {statusFlow.map((s, i) => {
        const ev = [...order.events].reverse().find((e) => e.status === s);
        const done = i <= idx;
        const current = i === idx;
        return (
          <li key={s} className="min-w-0" aria-current={current ? "step" : undefined}>
            <div className="relative h-1.5 overflow-hidden rounded-[2px] bg-steel">
              {done ? <div className={cx("absolute inset-0", current ? "bg-mci" : "bg-ink")} /> : null}
            </div>
            <p className={cx("mt-3 hyphens-auto text-xs leading-tight [overflow-wrap:anywhere] sm:text-sm", done ? "font-semibold text-ink" : "text-ink/70", current && "text-mci")}>{statusLabels[s].replace(" (prix + délai)", "")}</p>
            {ev ? <p className="mt-1 hidden text-xs tabular-nums text-ink/70 sm:block">{formatDateTime(ev.at)}</p> : null}
          </li>
        );
      })}
    </ol>
  );
}
