"use client";
import { useData } from "@/lib/hooks/useData";
import { Badge } from "@/components/ui/Badge";
import { formatDateTime } from "@/lib/format";
import { IS_DEMO } from "@/lib/env";

export default function AdminEmails() {
  const { data: emails } = useData((b) => b.listEmails(), []);
  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="t-h2">Emails envoyés</h1>
      <p className="text-sm text-ink/80">
        {IS_DEMO
          ? "Mode démo : les emails ne partent pas. Ils sont journalisés ici (et dans la console du serveur) pour montrer ce que reçoivent le client et MCI."
          : "Journal des emails transactionnels (Resend, ou console si RESEND_API_KEY est absente)."}
      </p>
      <ul className="space-y-2">
        {(emails ?? []).map((e) => (
          <li key={e.id} className="rounded-box border border-rule bg-white">
            <details>
              <summary className="flex cursor-pointer flex-wrap items-center gap-3 px-4 py-3 text-sm">
                <span className="t-mono text-xs text-ink/60">{formatDateTime(e.at)}</span>
                <span className="min-w-0 flex-1 font-semibold">{e.subject}</span>
                <span className="t-mono text-xs text-ink/70">→ {e.to.join(", ")}</span>
                <Badge tone={e.delivered === "resend" ? "ok" : "warn"}>{e.delivered.toUpperCase()}</Badge>
              </summary>
              <pre className="t-mono overflow-x-auto whitespace-pre-wrap border-t border-rule bg-salt p-4 text-xs leading-relaxed">{e.text}</pre>
            </details>
          </li>
        ))}
        {emails && !emails.length ? <li className="text-sm text-ink/70">Aucun email pour l&apos;instant.</li> : null}
      </ul>
    </div>
  );
}
