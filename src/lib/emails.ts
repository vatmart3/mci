/** Gabarits des emails transactionnels (texte brut lisible + HTML sobre). Partagés client/serveur. */
import type { Account, Order, OrderStatus, PriceMode } from "@/lib/types";
import { company } from "@/data/company";
import { statusLabels, orderTotal } from "@/lib/orders";
import { formatDateTime, formatEur } from "@/lib/format";

export interface OutgoingEmail {
  to: string[];
  subject: string;
  text: string;
  kind: string;
}

const signature = `—\nMCI Sète · ${company.street}, ${company.postalCode} ${company.city}\nTél. ${company.phone} · ${company.email}`;

function linesBlock(order: Order): string {
  return order.lines
    .map((l) => {
      const price = l.unitPriceHt != null ? `  ${formatEur(l.unitPriceHt)} HT/u` : "";
      return `  ${l.code.padEnd(22)} ${l.packagingLabel.padEnd(24)} × ${String(l.quantity).padStart(3)}${price}${l.note ? `\n    ↳ ${l.note}` : ""}`;
    })
    .join("\n");
}

function addressBlock(order: Order): string {
  const d = order.delivery;
  return [d.company ?? order.customer.company, d.line1, d.line2, `${d.postalCode} ${d.city}`, d.accessNotes ? `Accès : ${d.accessNotes}` : ""]
    .filter(Boolean)
    .join("\n  ");
}

export function orderSummary(order: Order, siteUrl: string): string {
  const total = orderTotal(order);
  return [
    `Commande ${order.number} — ${formatDateTime(order.createdAt)}`,
    `Statut : ${statusLabels[order.status]}`,
    "",
    `Client : ${order.customer.company} (SIRET ${order.customer.siret})`,
    `Contact : ${order.customer.contactName} · ${order.customer.phone} · ${order.customer.email}`,
    order.poNumber ? `N° de bon de commande / engagement : ${order.poNumber}` : "",
    order.chorus ? `Facturation Chorus Pro${order.chorusServiceCode ? ` — code service ${order.chorusServiceCode}` : ""}` : "",
    "",
    "Lignes :",
    linesBlock(order),
    total != null ? `\nTotal HT : ${formatEur(total)}` : "",
    order.leadTime ? `Délai : ${order.leadTime}` : "",
    "",
    "Livraison :",
    `  ${addressBlock(order)}`,
    order.deliverySlots ? `Créneaux / contraintes : ${order.deliverySlots}` : "",
    order.comment ? `Commentaire : ${order.comment}` : "",
    "",
    `Suivi : ${siteUrl}/espace-pro/commandes?n=${order.number}`,
  ]
    .filter((l) => l !== "")
    .join("\n");
}

export function emailsForOrderPlaced(order: Order, notify: string[], siteUrl: string, priceMode: PriceMode): OutgoingEmail[] {
  const pending = order.status === "pending_approval";
  const client: OutgoingEmail = {
    kind: "order_placed_client",
    to: [order.customer.email],
    subject: pending ? `Commande ${order.number} en attente de validation interne` : `MCI Sète — commande ${order.number} reçue`,
    text: [
      `Bonjour ${order.customer.contactName},`,
      "",
      pending
        ? "Votre commande est enregistrée. Elle doit être validée par le valideur de votre structure avant d'être transmise à MCI."
        : priceMode === "on_request"
          ? "Nous avons bien reçu votre commande. Nous revenons vers vous avec les prix et le délai de livraison (pro-forma) : vous la validerez en un clic depuis votre espace pro ou en répondant à cet email."
          : "Nous avons bien reçu votre commande. Nous vous confirmons la disponibilité et le délai de livraison rapidement.",
      "",
      orderSummary(order, siteUrl),
      "",
      signature,
    ].join("\n"),
  };
  const internal: OutgoingEmail = {
    kind: "order_placed_mci",
    to: notify,
    subject: `[Commande] ${order.number} — ${order.customer.company}${pending ? " (en attente de validation client)" : ""}`,
    text: [`Nouvelle commande sur le site.`, "", orderSummary(order, siteUrl), "", `Back-office : ${siteUrl}/admin/commandes/${order.id}`].join("\n"),
  };
  return pending ? [client] : [client, internal];
}

export function emailsForApprovalNeeded(order: Order, approvers: string[], siteUrl: string): OutgoingEmail[] {
  if (!approvers.length) return [];
  return [
    {
      kind: "approval_needed",
      to: approvers,
      subject: `À valider : commande ${order.number} (${order.customer.contactName})`,
      text: [`Une commande attend votre validation avant envoi à MCI.`, "", orderSummary(order, siteUrl), "", `Valider : ${siteUrl}/espace-pro/commandes?n=${order.number}`, "", signature].join("\n"),
    },
  ];
}

const statusMessages: Partial<Record<OrderStatus, string>> = {
  received: "Votre commande a été transmise à MCI.",
  confirmed: "MCI a confirmé votre commande avec les prix et le délai ci-dessous. Validez la pro-forma depuis votre espace pro pour lancer la préparation.",
  preparing: "Votre commande est en préparation.",
  shipped: "Votre commande est expédiée.",
  delivered: "Votre commande est livrée. La facture sera disponible dans votre espace pro.",
  cancelled: "Votre commande a été annulée. Contactez-nous pour toute question.",
};

export function emailsForStatus(order: Order, siteUrl: string, note?: string): OutgoingEmail[] {
  return [
    {
      kind: `status_${order.status}`,
      to: [order.customer.email],
      subject: `Commande ${order.number} — ${statusLabels[order.status]}`,
      text: [`Bonjour ${order.customer.contactName},`, "", statusMessages[order.status] ?? "", note ? `\nMessage de MCI : ${note}` : "", "", orderSummary(order, siteUrl), "", signature].join("\n"),
    },
  ];
}

export function emailsForProformaAccepted(order: Order, notify: string[], siteUrl: string): OutgoingEmail[] {
  return [
    {
      kind: "proforma_accepted",
      to: notify,
      subject: `[Pro-forma validée] ${order.number} — ${order.customer.company}`,
      text: [`Le client a validé la pro-forma. La commande peut passer en préparation.`, "", orderSummary(order, siteUrl)].join("\n"),
    },
  ];
}

export function emailsForAccountCreated(account: Account, contact: { fullName: string; email: string; phone?: string }, notify: string[], siteUrl: string): OutgoingEmail[] {
  return [
    {
      kind: "account_created_mci",
      to: notify,
      subject: `[Compte pro à valider] ${account.company}`,
      text: [`Nouvelle demande de compte pro.`, "", `Structure : ${account.company} (${account.kind})`, `SIRET : ${account.siret}`, `Contact : ${contact.fullName} · ${contact.email} · ${contact.phone ?? ""}`, "", `Valider : ${siteUrl}/admin/clients`].join("\n"),
    },
    {
      kind: "account_created_client",
      to: [contact.email],
      subject: "MCI Sète — votre compte pro est créé",
      text: [`Bonjour ${contact.fullName},`, "", "Votre compte pro est créé. Vous pouvez déjà commander ; MCI valide votre compte pour l'accès aux tarifs et aux documents.", "", `Espace pro : ${siteUrl}/espace-pro`, "", signature].join("\n"),
    },
  ];
}

export function emailsForAccountValidated(account: Account, to: string[], siteUrl: string): OutgoingEmail[] {
  return [
    {
      kind: "account_validated",
      to,
      subject: "MCI Sète — votre compte pro est validé",
      text: [`Bonjour,`, "", `Le compte « ${account.company} » est validé.`, `Espace pro : ${siteUrl}/espace-pro`, "", signature].join("\n"),
    },
  ];
}
