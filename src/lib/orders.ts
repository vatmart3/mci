import type { Order, OrderStatus, PriceMode } from "@/lib/types";

export const statusLabels: Record<OrderStatus, string> = {
  pending_approval: "À valider en interne",
  received: "Reçue",
  confirmed: "Confirmée (prix + délai)",
  preparing: "En préparation",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
};

export const statusShort: Record<OrderStatus, string> = {
  pending_approval: "À VALIDER",
  received: "REÇUE",
  confirmed: "CONFIRMÉE",
  preparing: "EN PRÉPA.",
  shipped: "EXPÉDIÉE",
  delivered: "LIVRÉE",
  cancelled: "ANNULÉE",
};

/** Frise principale (hors validation interne et annulation) */
export const statusFlow: OrderStatus[] = ["received", "confirmed", "preparing", "shipped", "delivered"];

export function statusTone(s: OrderStatus): "ok" | "warn" | "danger" | "mci" | "ink" {
  switch (s) {
    case "delivered":
      return "ok";
    case "pending_approval":
    case "received":
      return "warn";
    case "cancelled":
      return "danger";
    case "confirmed":
    case "preparing":
    case "shipped":
      return "mci";
  }
}

export function nextStatuses(s: OrderStatus): OrderStatus[] {
  const i = statusFlow.indexOf(s);
  if (s === "pending_approval") return ["received", "cancelled"];
  if (s === "delivered" || s === "cancelled") return [];
  const next = statusFlow[i + 1];
  return next ? [next, "cancelled"] : ["cancelled"];
}

export function formatOrderNumber(year: number, seq: number): string {
  return `MCI-${year}-${String(seq).padStart(5, "0")}`;
}

export function orderTotal(order: Order): number | null {
  if (!order.lines.length) return null;
  let total = 0;
  for (const l of order.lines) {
    if (l.unitPriceHt == null) return null;
    total += l.unitPriceHt * l.quantity;
  }
  return Math.round(total * 100) / 100;
}

export function unitCount(order: Pick<Order, "lines">): number {
  return order.lines.reduce((n, l) => n + l.quantity, 0);
}

export const priceModeLabels: Record<PriceMode, string> = {
  on_request: "Sur demande — MCI confirme prix et délai",
  per_account: "Par compte — prix HT visibles des comptes pros validés",
  public: "Public — prix HT visibles de tous",
};
