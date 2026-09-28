import { z } from "zod";
import { sendEmails, notifyRecipients } from "@/lib/server/mailer";
import { adminClient, callerProfile } from "@/lib/server/supabase-admin";
import { IS_DEMO, SITE_URL } from "@/lib/env";
import {
  emailsForAccountCreated,
  emailsForAccountValidated,
  emailsForApprovalNeeded,
  emailsForOrderPlaced,
  emailsForProformaAccepted,
  emailsForStatus,
  type OutgoingEmail,
} from "@/lib/emails";
import type { Account, Order, PriceMode } from "@/lib/types";

/* eslint-disable @typescript-eslint/no-explicit-any */

const demoSchema = z.object({
  mode: z.literal("demo"),
  emails: z.array(z.object({ to: z.array(z.string()), subject: z.string().max(300), text: z.string().max(20000), kind: z.string().max(60) })).max(10),
});

const liveSchema = z.object({
  kind: z.enum(["order_placed", "status", "proforma_accepted", "account_created", "account_validated"]),
  orderId: z.string().uuid().optional(),
  accountId: z.string().uuid().optional(),
  email: z.string().email().optional(),
  note: z.string().max(2000).optional(),
});

function toOrder(r: any): Order {
  return {
    id: r.id, number: r.number, accountId: r.account_id, status: r.status, customer: r.customer, delivery: r.delivery, billing: r.billing,
    poNumber: r.po_number ?? undefined, chorus: r.chorus, chorusServiceCode: r.chorus_service_code ?? undefined, deliverySlots: r.delivery_slots ?? undefined,
    comment: r.comment ?? undefined, leadTime: r.lead_time ?? undefined, mciNote: r.mci_note ?? undefined, createdAt: r.created_at, updatedAt: r.updated_at,
    lines: (r.order_lines ?? []).sort((a: any, b: any) => a.position - b.position).map((l: any) => ({ productId: l.product_id, code: l.code, name: l.name, packagingId: l.packaging_id, packagingLabel: l.packaging_label, quantity: l.quantity, note: l.note ?? undefined, unitPriceHt: l.unit_price_ht == null ? null : Number(l.unit_price_ht) })),
    events: [],
  };
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  // Mode démo : les emails sont journalisés côté navigateur ; ici, simple copie console (jamais d'envoi réel).
  if (IS_DEMO) {
    const parsed = demoSchema.safeParse(body);
    if (!parsed.success) return Response.json({ ok: false }, { status: 400 });
    for (const e of parsed.data.emails) {
      console.info(`\n──── EMAIL (démo, non envoyé) ─── ${e.kind}\nÀ : ${e.to.join(", ")}\nObjet : ${e.subject}\n\n${e.text}\n────────────────────────`);
    }
    return Response.json({ ok: true, delivered: "demo" });
  }

  const parsed = liveSchema.safeParse(body);
  if (!parsed.success) return Response.json({ ok: false }, { status: 400 });
  const sb = adminClient();
  if (!sb) return Response.json({ ok: false, error: "SUPABASE_SERVICE_ROLE_KEY manquante" }, { status: 503 });
  const { kind, orderId, accountId, email, note } = parsed.data;
  const { data: settings } = await sb.from("settings").select("*").eq("id", 1).single();
  const notify = notifyRecipients(settings?.notify_emails ?? []);
  const priceMode = (settings?.price_mode ?? "on_request") as PriceMode;
  let emails: OutgoingEmail[] = [];

  if (orderId) {
    const { data: row } = await sb.from("orders").select("*, order_lines(*)").eq("id", orderId).single();
    if (!row) return Response.json({ ok: false }, { status: 404 });
    const order = toOrder(row);
    if (kind === "order_placed") {
      // Anti-rejeu : un seul envoi par commande (réarmé par approve_order)
      if (row.notified_at) return Response.json({ ok: true, skipped: true });
      await sb.from("orders").update({ notified_at: new Date().toISOString() }).eq("id", orderId);
      emails = emailsForOrderPlaced(order, notify, SITE_URL, priceMode);
      if (order.status === "pending_approval" && order.accountId) {
        const { data: approvers } = await sb.from("profiles").select("email").eq("account_id", order.accountId).eq("role", "approver");
        emails.push(...emailsForApprovalNeeded(order, (approvers ?? []).map((a) => a.email), SITE_URL));
      }
    } else {
      const caller = await callerProfile(req);
      const staff = caller && (caller.role === "admin" || caller.role === "sales");
      const member = caller && caller.account_id && caller.account_id === order.accountId;
      if (kind === "status" && !staff) return Response.json({ ok: false }, { status: 403 });
      if (kind === "proforma_accepted" && !staff && !member) return Response.json({ ok: false }, { status: 403 });
      emails = kind === "status" ? emailsForStatus(order, SITE_URL, note) : emailsForProformaAccepted(order, notify, SITE_URL);
    }
  } else if (kind === "account_created" && email) {
    const { data: prof } = await sb.from("profiles").select("*, accounts(*)").eq("email", email).order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (!prof?.accounts || Date.now() - new Date(prof.created_at).getTime() > 10 * 60_000) return Response.json({ ok: true, skipped: true });
    const acc = prof.accounts as any;
    emails = emailsForAccountCreated({ id: acc.id, company: acc.company, siret: acc.siret, kind: acc.kind } as Account, { fullName: prof.full_name, email: prof.email, phone: prof.phone }, notify, SITE_URL);
  } else if (kind === "account_validated" && accountId) {
    const caller = await callerProfile(req);
    if (!caller || !(caller.role === "admin" || caller.role === "sales")) return Response.json({ ok: false }, { status: 403 });
    const { data: acc } = await sb.from("accounts").select("*").eq("id", accountId).single();
    const { data: users } = await sb.from("profiles").select("email").eq("account_id", accountId);
    if (acc) emails = emailsForAccountValidated({ id: acc.id, company: acc.company } as Account, (users ?? []).map((u) => u.email), SITE_URL);
  }

  const delivered = await sendEmails(emails);
  if (emails.length) {
    await sb.from("email_log").insert(emails.map((e) => ({ to: e.to, subject: e.subject, text: e.text, kind: e.kind, delivered })));
  }
  return Response.json({ ok: true, sent: emails.length, delivered });
}
