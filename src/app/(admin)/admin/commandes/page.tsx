"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Order, OrderStatus } from "@/lib/types";
import { useData } from "@/lib/hooks/useData";
import { StatusBadge, DemoBadge } from "@/components/ui/Badge";
import { Input, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { statusLabels, orderTotal, unitCount } from "@/lib/orders";
import { formatDateTime, norm } from "@/lib/format";

function toCsv(orders: Order[]): string {
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const head = ["numero", "date", "statut", "societe", "siret", "type", "contact", "telephone", "email", "engagement", "chorus", "code_service", "cp", "ville", "ligne_code", "ligne_designation", "conditionnement", "quantite", "pu_ht", "total_commande_ht", "demo"];
  const rows = orders.flatMap((o) =>
    o.lines.map((l) =>
      [o.number, o.createdAt, statusLabels[o.status], o.customer.company, o.customer.siret, o.customer.kind, o.customer.contactName, o.customer.phone, o.customer.email, o.poNumber, o.chorus ? "oui" : "non", o.chorusServiceCode, o.delivery.postalCode, o.delivery.city, l.code, l.name, l.packagingLabel, l.quantity, l.unitPriceHt ?? "", orderTotal(o) ?? "", o.isDemo ? "oui" : ""].map(esc).join(";"),
    ),
  );
  return "﻿" + [head.join(";"), ...rows].join("\r\n");
}

export default function AdminOrders() {
  const { data: orders, loading } = useData((b) => b.listOrders(), []);
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [q, setQ] = useState("");
  useEffect(() => {
    const s = new URLSearchParams(window.location.search).get("statut");
    if (s) setStatus(s as OrderStatus);
  }, []);
  const list = useMemo(() => {
    const nq = norm(q);
    return (orders ?? []).filter((o) => (!status || o.status === status) && (!nq || norm(`${o.number} ${o.customer.company} ${o.customer.contactName} ${o.poNumber ?? ""} ${o.lines.map((l) => l.code).join(" ")}`).includes(nq)));
  }, [orders, status, q]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="t-h2">Commandes</h1>
        <Button
          variant="outline"
          size="sm"
          disabled={!list.length}
          onClick={() => {
            const blob = new Blob([toCsv(list)], { type: "text/csv;charset=utf-8" });
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = `commandes-mci-${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
          }}
        >
          <Icon name="download" size={16} /> Export CSV ({list.length})
        </Button>
      </div>
      <div className="flex flex-wrap gap-3">
        <div className="w-72">
          <label htmlFor="ao-q" className="sr-only">
            Rechercher
          </label>
          <Input id="ao-q" fieldSize="sm" placeholder="N°, client, engagement, référence…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="w-60">
          <label htmlFor="ao-s" className="sr-only">
            Statut
          </label>
          <Select id="ao-s" fieldSize="sm" value={status} onChange={(e) => setStatus(e.target.value as OrderStatus | "")}>
            <option value="">Tous les statuts</option>
            {(Object.keys(statusLabels) as OrderStatus[]).map((s) => (
              <option key={s} value={s}>
                {statusLabels[s]}
              </option>
            ))}
          </Select>
        </div>
      </div>
      <div className="overflow-x-auto rounded-box border border-rule bg-white">
        <table className="w-full min-w-[860px] text-sm">
          <thead className="t-mono bg-salt text-left text-xs text-ink/70">
            <tr>
              <th className="px-3 py-2 font-normal">N°</th>
              <th className="px-3 py-2 font-normal">DATE</th>
              <th className="px-3 py-2 font-normal">CLIENT</th>
              <th className="px-3 py-2 font-normal">ENGAGEMENT</th>
              <th className="px-3 py-2 text-right font-normal">LIGNES / U.</th>
              <th className="px-3 py-2 font-normal">STATUT</th>
            </tr>
          </thead>
          <tbody>
            {loading && !orders ? (
              <tr>
                <td colSpan={6} className="t-mono px-3 py-6 text-xs text-ink/60">
                  CHARGEMENT…
                </td>
              </tr>
            ) : list.length ? (
              list.map((o) => (
                <tr key={o.id} className="border-t border-rule hover:bg-salt/60">
                  <td className="px-3 py-2">
                    <Link href={`/admin/commandes/${o.id}`} className="t-mono text-mci hover:underline">
                      {o.number}
                    </Link>
                  </td>
                  <td className="t-mono px-3 py-2 text-xs">{formatDateTime(o.createdAt)}</td>
                  <td className="px-3 py-2">
                    <span className="flex items-center gap-2">
                      {o.customer.company} {o.isDemo ? <DemoBadge /> : null}
                    </span>
                    <span className="block text-xs text-ink/60">{o.accountId ? "Compte pro" : "Invité"} · {o.customer.contactName}</span>
                  </td>
                  <td className="t-mono px-3 py-2 text-xs">{o.poNumber ?? "—"}</td>
                  <td className="t-mono px-3 py-2 text-right">
                    {o.lines.length} / {unitCount(o)}
                  </td>
                  <td className="px-3 py-2">
                    <StatusBadge status={o.status} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-ink/70">
                  Aucune commande.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
