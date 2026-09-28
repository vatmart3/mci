"use client";
import { useMemo } from "react";
import { useSession } from "@/lib/store/session";
import { useCatalog } from "@/lib/store/catalog";
import { useData } from "@/lib/hooks/useData";
import { PdfViewerProvider, SheetButton } from "@/components/catalog/PdfViewer";
import { PdfButton } from "@/components/pro/OrderActions";
import { Icon } from "@/components/ui/Icon";
import { formatDate } from "@/lib/format";

const kinds = { proforma: "Pro-forma", bl: "Bon de livraison", facture: "Facture", autre: "Document" } as const;

export default function ProDocuments() {
  const { user, account } = useSession();
  const byId = useCatalog((s) => s.byId);
  const accountId = user?.accountId ?? "";
  const { data: orders } = useData((b) => b.listOrders(accountId ? { accountId } : undefined), [accountId]);
  const { data: docs } = useData((b) => (accountId ? b.listDocuments(accountId) : Promise.resolve([])), [accountId]);
  const bought = useMemo(() => {
    const ids = new Set((orders ?? []).flatMap((o) => o.lines.map((l) => l.productId)));
    return [...ids].map((id) => byId(id)).filter((p): p is NonNullable<typeof p> => !!p);
  }, [orders, byId]);
  const priced = (orders ?? []).filter((o) => o.lines.some((l) => l.unitPriceHt != null));
  const locked = account?.status !== "active";

  return (
    <PdfViewerProvider>
      <div className="space-y-12">
        <h1 className="t-h2">Documents</h1>
        <section aria-labelledby="docs-mci">
          <h2 id="docs-mci" className="t-label">
            Bons de livraison et factures
          </h2>
          {locked ? <p className="mt-3 text-sm text-ink/70">Disponibles après validation de votre compte par MCI.</p> : null}
          {docs?.length ? (
            <ul className="mt-4 divide-y divide-rule border-y border-rule">
              {docs.map((d) => (
                <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <span>
                    <span className="t-mono mr-3 text-xs text-ink/60">{kinds[d.kind].toUpperCase()}</span>
                    {d.name}
                  </span>
                  <span className="flex items-center gap-4">
                    <span className="t-mono text-xs text-ink/60">{formatDate(d.createdAt)}</span>
                    <a href={d.url} download={d.name} target="_blank" rel="noopener noreferrer" className="link-u inline-flex items-center gap-1 text-sm">
                      <Icon name="download" size={16} /> Télécharger
                    </a>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-ink/70">Aucun document déposé par MCI pour l&apos;instant.</p>
          )}
        </section>

        <section aria-labelledby="docs-pf">
          <h2 id="docs-pf" className="t-label">
            Pro-formas
          </h2>
          {priced.length ? (
            <ul className="mt-4 divide-y divide-rule border-y border-rule">
              {priced.map((o) => (
                <li key={o.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <span className="t-mono text-mci">{o.number}</span>
                  <PdfButton order={o} kind="proforma" label="Pro-forma PDF" />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-ink/70">Les pro-formas apparaissent ici quand MCI a confirmé prix et délai.</p>
          )}
        </section>

        <section aria-labelledby="docs-ft">
          <h2 id="docs-ft" className="t-label">
            Fiches techniques des produits commandés
          </h2>
          {bought.length ? (
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {bought.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 rounded-tech border border-rule bg-white px-3 py-2">
                  <span className="min-w-0">
                    <span className="t-code block text-sm text-mci">{p.code}</span>
                    <span className="block truncate text-sm text-ink/80">{p.short}</span>
                  </span>
                  <SheetButton url={p.technicalSheetUrl} code={p.code} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-ink/70">Les fiches des produits que vous commandez s&apos;afficheront ici.</p>
          )}
        </section>
      </div>
    </PdfViewerProvider>
  );
}
