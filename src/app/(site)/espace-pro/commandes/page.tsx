"use client";
import { useEffect, useState } from "react";
import type { OrderStatus } from "@/lib/types";
import { useSession } from "@/lib/store/session";
import { useData } from "@/lib/hooks/useData";
import { OrdersTable } from "@/components/pro/OrdersTable";
import { OrderDetail } from "@/components/pro/OrderDetail";
import { statusLabels } from "@/lib/orders";
import { Select } from "@/components/ui/Field";

export default function ProOrders() {
  const user = useSession((s) => s.user);
  const accountId = user?.accountId ?? "";
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [selected, setSelected] = useState<string | null>(null);
  const { data: orders, loading } = useData((b) => b.listOrders(accountId ? { accountId } : undefined), [accountId]);

  useEffect(() => {
    const n = new URLSearchParams(window.location.search).get("n");
    if (n && orders) setSelected(orders.find((o) => o.number === n)?.id ?? null);
  }, [orders]);

  const list = (orders ?? []).filter((o) => !status || o.status === status);
  const current = list.find((o) => o.id === selected) ?? (orders ?? []).find((o) => o.id === selected);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="t-h2">Commandes</h1>
        <div className="w-full sm:w-64">
          <label htmlFor="f-status" className="sr-only">
            Filtrer par statut
          </label>
          <Select id="f-status" fieldSize="sm" className="rounded-full! pl-4!" value={status} onChange={(e) => setStatus(e.target.value as OrderStatus | "")}>
            <option value="">Tous les statuts</option>
            {(Object.keys(statusLabels) as OrderStatus[]).map((s) => (
              <option key={s} value={s}>
                {statusLabels[s]}
              </option>
            ))}
          </Select>
        </div>
      </div>
      {current ? <OrderDetail order={current} /> : null}
      {loading && !orders ? <p className="rounded-box bg-white px-6 py-10 text-center text-sm text-ink/70 ring-1 ring-black/5">Chargement…</p> : <OrdersTable orders={list} selected={selected} onSelect={(o) => setSelected((s) => (s === o.id ? null : o.id))} />}
    </div>
  );
}
