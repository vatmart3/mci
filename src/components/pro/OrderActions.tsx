"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Order } from "@/lib/types";
import { useCart } from "@/lib/store/cart";
import { useCatalog } from "@/lib/store/catalog";
import { useSession } from "@/lib/store/session";
import { getBackend } from "@/lib/backend";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { IS_DEMO } from "@/lib/env";

/** « Recommander » : reprend une commande passée dans le bon, en un clic. */
export function ReorderButton({ order, size = "sm" }: { order: Order; size?: "sm" | "md" }) {
  const router = useRouter();
  const addMany = useCart((s) => s.addMany);
  const byId = useCatalog((s) => s.byId);
  return (
    <Button
      variant="action"
      size={size}
      onClick={() => {
        const lines = order.lines.filter((l) => byId(l.productId)).map((l) => ({ productId: l.productId, packagingId: l.packagingId, quantity: l.quantity, note: l.note }));
        addMany(lines);
        router.push("/commande");
      }}
      aria-label={`Recommander la commande ${order.number}`}
    >
      <Icon name="repeat" size={16} />
      Recommander
    </Button>
  );
}

export function PdfButton({ order, kind, label }: { order: Order; kind: "bon" | "proforma"; label: string }) {
  const [busy, setBusy] = useState(false);
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        const { downloadOrderPdf } = await import("@/lib/pdf/order-pdf");
        await downloadOrderPdf(order, kind, { demo: IS_DEMO || order.isDemo });
        setBusy(false);
      }}
    >
      <Icon name="download" size={16} />
      {busy ? "PDF…" : label}
    </Button>
  );
}

/** Actions client selon le statut : valider (valideur), accepter la pro-forma. */
export function OrderClientActions({ order, onChange }: { order: Order; onChange?: (o: Order) => void }) {
  const user = useSession((s) => s.user);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const run = async (fn: () => Promise<Order>) => {
    setBusy(true);
    setErr(null);
    try {
      onChange?.(await fn());
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Action impossible");
    } finally {
      setBusy(false);
    }
  };
  const canApprove = order.status === "pending_approval" && user?.role === "approver";
  const canAccept = order.status === "confirmed" && !order.customerAcceptedAt;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {canApprove ? (
        <Button variant="action" size="sm" disabled={busy} onClick={() => run(async () => (await getBackend()).approveOrder(order.id))}>
          <Icon name="check" size={16} /> Valider et transmettre à MCI
        </Button>
      ) : null}
      {order.status === "pending_approval" && user?.role === "buyer" ? <span className="text-sm text-ink/70">En attente de votre valideur.</span> : null}
      {canAccept ? (
        <Button variant="action" size="sm" disabled={busy} onClick={() => run(async () => (await getBackend()).acceptProforma(order.id))}>
          <Icon name="check" size={16} /> Valider la pro-forma
        </Button>
      ) : null}
      {order.status === "confirmed" && order.customerAcceptedAt ? <span className="text-sm text-ok">Pro-forma validée.</span> : null}
      {err ? <span role="alert" className="text-sm text-danger">{err}</span> : null}
    </div>
  );
}
