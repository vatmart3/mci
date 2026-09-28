import { contactSchema, contactSubjects } from "@/lib/schemas/contact";
import { sendEmails, notifyRecipients } from "@/lib/server/mailer";
import { adminClient } from "@/lib/server/supabase-admin";

const recent = new Map<string, number>();

export async function POST(req: Request) {
  const parsed = contactSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ ok: false, issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  const d = parsed.data;
  if (d.website) return Response.json({ ok: true }); // robot
  // limitation simple : 1 demande / 20 s / email (instance)
  const last = recent.get(d.email) ?? 0;
  if (Date.now() - last < 20_000) return Response.json({ ok: false, error: "Patientez quelques secondes." }, { status: 429 });
  recent.set(d.email, Date.now());

  const sb = adminClient();
  let notify: string[] = [];
  if (sb) {
    const { data } = await sb.from("settings").select("notify_emails").eq("id", 1).maybeSingle();
    notify = data?.notify_emails ?? [];
  }
  const email = {
    kind: `contact_${d.subject}`,
    to: notifyRecipients(notify),
    subject: `[${contactSubjects[d.subject]}] ${d.company}${d.product ? ` — ${d.product}` : ""}`,
    text: [
      `${contactSubjects[d.subject]} depuis le site`,
      "",
      `Structure : ${d.company}`,
      `Contact : ${d.name}`,
      `Email : ${d.email}`,
      d.phone ? `Téléphone : ${d.phone}` : "",
      d.sector ? `Secteur : ${d.sector}` : "",
      d.product ? `Produit : ${d.product}` : "",
      "",
      d.message,
    ]
      .filter(Boolean)
      .join("\n"),
  };
  const delivered = await sendEmails([email]);
  if (sb) await sb.from("email_log").insert({ to: email.to, subject: email.subject, text: email.text, kind: email.kind, delivered });
  return Response.json({ ok: true, email, delivered });
}
