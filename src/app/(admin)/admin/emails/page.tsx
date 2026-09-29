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
      <p className="flex items-start gap-2 rounded-[8px] border border-rule bg-white px-4 py-3 text-sm text-ink/80">
        <Icon name="info" size={18} className="mt-px shrink-0 text-mci" />
        <span>
          {IS_DEMO
            ? "Mode démo : les emails ne partent pas. Ils sont journalisés ici (et dans la console du serveur) pour montrer ce que reçoivent le client et MCI."
            : "Journal des emails transactionnels (Resend, ou console si RESEND_API_KEY est absente)."}
        </span>
      </p>
      <ul className="divide-y divide-rule overflow-hidden rounded-[8px] border border-rule bg-white empty:hidden">
        {(emails ?? []).map((e) => (
          <li key={e.id}>
            <details className="group">
              <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 text-sm transition-colors duration-150 hover:bg-salt [&::-webkit-details-marker]:hidden">
                <Icon name="chevronRight" size={16} className="shrink-0 text-ink/70 transition-transform duration-150 group-open:rotate-90" />
                <span className="t-mono text-xs text-ink/70">{formatDateTime(e.at)}</span>
                <span className="min-w-0 flex-1 basis-48 font-semibold">{e.subject}</span>
                <span className="t-mono min-w-0 break-all text-xs text-ink/70">→ {e.to.join(", ")}</span>
                <Badge tone={e.delivered === "resend" ? "ok" : "warn"}>{e.delivered.toUpperCase()}</Badge>
              </summary>
              <pre className="t-mono overflow-x-auto whitespace-pre-wrap break-words border-t border-rule bg-salt px-4 py-4 text-xs leading-relaxed">{e.text}</pre>
            </details>
          </li>
        ))}
        {emails && !emails.length ? <li className="px-4 py-5 text-sm text-ink/70">Aucun email pour l&apos;instant.</li> : null}
      </ul>
    </div>
  );
}
