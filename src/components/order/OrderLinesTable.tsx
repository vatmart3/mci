import type { Order } from "@/lib/types";
import { formatEur } from "@/lib/format";
import { orderTotal } from "@/lib/orders";

const th = "px-3 py-2.5 text-xs font-semibold text-ink/70 first:pl-0 last:pr-0";
const td = "px-3 py-3 first:pl-0 last:pr-0";

export function OrderLinesTable({ order }: { order: Order }) {
  const priced = order.lines.some((l) => l.unitPriceHt != null);
  const total = orderTotal(order);
  return (
    <div className="relative overflow-x-auto overscroll-x-contain">
      <table className="w-full min-w-[480px] text-sm">
        <thead>
          <tr className="border-b border-rule text-left">
            <th scope="col" className={th}>Réf.</th>
            <th scope="col" className={th}>Désignation</th>
            <th scope="col" className={th}>Conditionnement</th>
            <th scope="col" className={`${th} text-right`}>Qté</th>
            {priced ? <th scope="col" className={`${th} text-right`}>PU HT</th> : null}
            {priced ? <th scope="col" className={`${th} text-right`}>Total HT</th> : null}
          </tr>
        </thead>
        <tbody className="divide-y divide-rule">
          {order.lines.map((l, i) => (
            <tr key={i} className="align-top">
              <td className={`${td} t-code whitespace-nowrap text-base text-mci`}>{l.code}</td>
              <td className={td}>
                <span className="font-medium">{l.name}</span>
                {l.note ? <span className="mt-1 block text-xs text-ink/70">Note : {l.note}</span> : null}
              </td>
              <td className={`${td} text-ink/80`}>{l.packagingLabel}</td>
              <td className={`${td} text-right font-semibold tabular-nums`}>{l.quantity}</td>
              {priced ? <td className={`${td} whitespace-nowrap text-right tabular-nums text-ink/70`}>{l.unitPriceHt != null ? formatEur(l.unitPriceHt) : "—"}</td> : null}
              {priced ? <td className={`${td} whitespace-nowrap text-right font-medium tabular-nums`}>{l.unitPriceHt != null ? formatEur(l.unitPriceHt * l.quantity) : "—"}</td> : null}
            </tr>
          ))}
        </tbody>
        {total != null ? (
          <tfoot>
            <tr className="border-t border-ink/20">
              <td colSpan={5} className="pt-4 text-right text-sm text-ink/70">
                Total HT
              </td>
              <td className="t-num whitespace-nowrap pt-4 text-right text-lg">{formatEur(total)}</td>
            </tr>
          </tfoot>
        ) : null}
      </table>
    </div>
  );
}
