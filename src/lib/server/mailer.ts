import "server-only";
import { Resend } from "resend";
import type { OutgoingEmail } from "@/lib/emails";

const key = process.env.RESEND_API_KEY ?? "";
const from = process.env.EMAIL_FROM || "MCI Sète <onboarding@resend.dev>";

export function notifyRecipients(fallback: string[] = []): string[] {
  const env = (process.env.MCI_NOTIFY_EMAILS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  return env.length ? env : fallback.length ? fallback : ["contactmci@sfr.fr"];
}

function toHtml(text: string) {
  const esc = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return `<div style="font-family:'IBM Plex Mono',ui-monospace,monospace;font-size:13px;line-height:1.55;color:#0E2533;background:#F3F1EC;padding:24px"><div style="max-width:640px;margin:0 auto;background:#fff;border:1px solid #D5DCE0;border-radius:6px"><div style="background:#206996;color:#fff;padding:12px 20px;font-weight:700;letter-spacing:.04em">MCI SÈTE</div><pre style="white-space:pre-wrap;margin:0;padding:20px;font:inherit">${esc}</pre></div></div>`;
}

/** Envoie via Resend si configuré, sinon écrit dans la console serveur (mode local / démo). */
export async function sendEmails(emails: OutgoingEmail[]): Promise<"resend" | "console"> {
  if (!key) {
    for (const e of emails) {
      console.info(`\n──── EMAIL (console) ─── ${e.kind}\nÀ : ${e.to.join(", ")}\nObjet : ${e.subject}\n\n${e.text}\n────────────────────────`);
    }
    return "console";
  }
  const resend = new Resend(key);
  for (const e of emails) {
    if (!e.to.length) continue;
    const { error } = await resend.emails.send({ from, to: e.to, subject: e.subject, text: e.text, html: toHtml(e.text) });
    if (error) console.error("Resend :", error.message);
  }
  return "resend";
}
