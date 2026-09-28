"use client";
import { useData } from "@/lib/hooks/useData";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { formatDateTime } from "@/lib/format";
import { IS_DEMO } from "@/lib/env";

export default function AdminEmails() {
  const { data: emails } = useData((b) => b.listEmails(), []);
  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="t-h2">Emails envoyés</h1>
      <p className="rounded-box bg-white px-5 py-4 text-sm text-ink/70 ring-1 ring-black/5">
        {IS_DEMO
          ? "Mode démo : les emails ne partent pas. Ils sont journalisés ici (et dans la console du serveur) pour montrer ce que reçoivent le client et MCI."
          : "Journal des emails transactionnels (Resend, ou console si RESEND_API_KEY est absente)."}
      </p>
      <ul className="space-y-3">
        {(emails ?? []).map((e) => (
          <li key={e.id} className="overflow-hidden rounded-box bg-white ring-1 ring-black/5">
            <details className="group">
              <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-3 gap-y-1 px-5 py-4 text-sm transition-colors duration-200 hover:bg-salt/60 [&::-webkit-details-marker]:hidden">
                <Icon name="chevronRight" size={16} className="shrink-0 text-ink/70 transition-transform duration-300 ease-out group-open:rotate-90" />
                <span className="t-mono text-xs text-ink/70">{formatDateTime(e.at)}</span>
                <span className="min-w-0 flex-1 basis-48 font-semibold">{e.subject}</span>
                <span className="t-mono min-w-0 break-all text-xs text-ink/70">→ {e.to.join(", ")}</span>
                <Badge tone={e.delivered === "resend" ? "ok" : "warn"}>{e.delivered.toUpperCase()}</Badge>
              </summary>
              <pre className="t-mono overflow-x-auto whitespace-pre-wrap border-t border-black/5 bg-salt p-5 text-xs leading-relaxed">{e.text}</pre>
            </details>
          </li>
        ))}
        {emails && !emails.length ? <li className="rounded-box bg-white p-6 text-sm text-ink/70 ring-1 ring-black/5">Aucun email pour l&apos;instant.</li> : null}
      </ul>
    </div>
  );
}
