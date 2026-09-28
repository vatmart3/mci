import type { Order } from "@/lib/types";
import { formatEur } from "@/lib/format";
import { orderTotal } from "@/lib/orders";

export function OrderLinesTable({ order }: { order: Order }) {
  const priced = order.lines.some((l) => l.unitPriceHt != null);
  const total = orderTotal(order);
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] text-sm">
        <thead>
          <tr className="t-mono border-b border-ink text-left text-xs text-ink/70">
            <th className="py-2 pr-3 font-normal">RÉF.</th>
            <th className="py-2 pr-3 font-normal">DÉSIGNATION</th>
            <th className="py-2 pr-3 font-normal">CONDITIONNEMENT</th>
            <th className="py-2 pr-3 text-right font-normal">QTÉ</th>
            {priced ? <th className="py-2 pr-3 text-right font-normal">PU HT</th> : null}
            {priced ? <th className="py-2 text-right font-normal">TOTAL HT</th> : null}
          </tr>
        </thead>
        <tbody>
          {order.lines.map((l, i) => (
            <tr key={i} className="border-b border-rule align-top">
              <td className="t-code py-3 pr-3 text-mci">{l.code}</td>
              <td className="py-3 pr-3">
                {l.name}
                {l.note ? <span className="block text-xs text-ink/70">Note : {l.note}</span> : null}
              </td>
              <td className="py-3 pr-3">{l.packagingLabel}</td>
              <td className="t-mono py-3 pr-3 text-right">{l.quantity}</td>
              {priced ? <td className="t-mono py-3 pr-3 text-right">{l.unitPriceHt != null ? formatEur(l.unitPriceHt) : "—"}</td> : null}
              {priced ? <td className="t-mono py-3 text-right">{l.unitPriceHt != null ? formatEur(l.unitPriceHt * l.quantity) : "—"}</td> : null}
            </tr>
          ))}
        </tbody>
        {total != null ? (
          <tfoot>
            <tr>
              <td colSpan={5} className="t-mono pt-3 text-right text-xs text-ink/70">
                TOTAL HT
              </td>
              <td className="t-mono pt-3 text-right font-medium">{formatEur(total)}</td>
            </tr>
          </tfoot>
        ) : null}
      </table>
    </div>
  );
}
