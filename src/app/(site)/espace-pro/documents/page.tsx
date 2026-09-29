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

  const th = "px-4 py-2.5";
  const empty = "mt-3 rounded-[8px] border border-rule bg-white px-4 py-5 text-sm text-ink/70";

  return (
    <PdfViewerProvider>
      <div className="space-y-8">
        <h1 className="t-h2">Documents</h1>
        <section aria-labelledby="docs-mci">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <h2 id="docs-mci" className="t-label">
              Bons de livraison et factures
            </h2>
            {locked ? (
              <p className="inline-flex items-center gap-2 rounded-[4px] bg-steel px-2 py-1 text-sm text-ink/80">
                <Icon name="lock" size={14} className="shrink-0" /> Disponibles après validation de votre compte par MCI.
              </p>
            ) : null}
          </div>
          {docs?.length ? (
            <div className="mt-3 overflow-hidden rounded-[8px] border border-rule bg-white">
              <div className="relative overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead className="border-b border-rule bg-steel/60 text-xs font-semibold text-ink/70">
                    <tr>
                      <th scope="col" className={th}>
                        Type
                      </th>
                      <th scope="col" className={th}>
                        Document
                      </th>
                      <th scope="col" className={th}>
                        Date
                      </th>
                      <th scope="col" className={`${th} text-right`}>
                        <span className="sr-only">Télécharger</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rule">
                    {docs.map((d) => (
                      <tr key={d.id} className="transition-colors duration-150 hover:bg-salt">
                        <td className="whitespace-nowrap px-4 py-2.5 text-ink/80">
                          <span className="inline-flex items-center gap-2">
                            <Icon name="doc" size={18} className="shrink-0 text-mci" />
                            {kinds[d.kind]}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 font-semibold">
                          <span className="break-words">{d.name}</span>
                        </td>
                        <td className="t-mono whitespace-nowrap px-4 py-2.5 text-ink/70">{formatDate(d.createdAt)}</td>
                        <td className="px-4 py-2 text-right">
                          <a href={d.url} download={d.name} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-[6px] border border-rule px-3 py-1.5 font-semibold transition-colors duration-150 hover:border-mci hover:text-mci">
                            <Icon name="download" size={16} /> Télécharger
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className={empty}>Aucun document déposé par MCI pour l&apos;instant.</p>
          )}
        </section>

        <section aria-labelledby="docs-pf">
          <h2 id="docs-pf" className="t-label">
            Pro-formas
          </h2>
          {priced.length ? (
            <ul className="mt-3 divide-y divide-rule overflow-hidden rounded-[8px] border border-rule bg-white">
              {priced.map((o) => (
                <li key={o.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 transition-colors duration-150 hover:bg-salt">
                  <span className="t-mono font-semibold text-mci">{o.number}</span>
                  <PdfButton order={o} kind="proforma" label="Pro-forma PDF" />
                </li>
              ))}
            </ul>
          ) : (
            <p className={empty}>Les pro-formas apparaissent ici quand MCI a confirmé prix et délai.</p>
          )}
        </section>

        <section aria-labelledby="docs-ft">
          <h2 id="docs-ft" className="t-label">
            Fiches techniques des produits commandés
          </h2>
          {bought.length ? (
            <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {bought.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 rounded-[8px] border border-rule bg-white px-4 py-3 transition-colors duration-150 hover:border-ink/30">
                  <span className="min-w-0">
                    <span className="t-code block text-sm text-mci">{p.code}</span>
                    <span className="block truncate text-sm text-ink/70">{p.short}</span>
                  </span>
                  <SheetButton url={p.technicalSheetUrl} code={p.code} />
                </li>
              ))}
            </ul>
          ) : (
            <p className={empty}>Les fiches des produits que vous commandez s&apos;afficheront ici.</p>
          )}
        </section>
      </div>
    </PdfViewerProvider>
  );
}
