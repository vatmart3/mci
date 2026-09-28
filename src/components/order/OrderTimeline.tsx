import type { Order } from "@/lib/types";
import { statusFlow, statusLabels } from "@/lib/orders";
import { formatDateTime } from "@/lib/format";
import { cx } from "@/lib/cx";

/** Frise chronologique des statuts (Reçue → Livrée). */
export function OrderTimeline({ order }: { order: Order }) {
  if (order.status === "cancelled" || order.status === "pending_approval") {
    return (
      <ol className="space-y-3 border-l border-rule pl-4">
        {order.events.map((e, i) => (
          <li key={i} className="relative">
            <span className={cx("absolute -left-[21px] top-1.5 size-2.5 rounded-full border-2 border-salt", e.status === "cancelled" ? "bg-danger" : "bg-warn")} />
            <p className="font-semibold">{statusLabels[e.status]}</p>
            <p className="t-mono text-xs text-ink/70">{formatDateTime(e.at)}</p>
            {e.note ? <p className="text-sm text-ink/80">{e.note}</p> : null}
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
        return (
          <li key={s} className="min-w-0" aria-current={i === idx ? "step" : undefined}>
            <div className={cx("h-1.5 rounded-tech", done ? (i === idx ? "bg-mci" : "bg-ink") : "bg-rule")} />
            <p className={cx("mt-2 text-xs leading-tight sm:text-sm", done ? "font-semibold" : "text-ink/70")}>{statusLabels[s].replace(" (prix + délai)", "")}</p>
            {ev ? <p className="t-mono mt-1 hidden text-[11px] text-ink/70 sm:block">{formatDateTime(ev.at)}</p> : null}
          </li>
        );
      })}
    </ol>
  );
}
