import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { company } from "@/data/company";
import { BIOCIDE_NOTICE, familyBySlug } from "@/data/families";
import type { MiniProduct } from "./showcase-data";

/**
 * Documents : les vraies fiches techniques en tableau (lien PDF direct), la FDS sur demande,
 * l'agrément préfectoral et la mention biocides. Tout est vérifiable.
 */
export function DocumentsSection({ sheets, withSheet, references }: { sheets: MiniProduct[]; withSheet: number; references: number }) {
  return (
    <section aria-labelledby="docs-title" className="bg-salt py-16 lg:py-24">
      <div className="wrap grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8 [&>*]:min-w-0">
        <div className="lg:col-span-4">
          <h2 id="docs-title" className="t-h1">
            Les documents avant l&apos;achat
          </h2>
          <p className="t-lead mt-3 text-ink/70">
            {withSheet} fiches techniques sur {references} références se lisent en ligne. Les fiches de données de sécurité s&apos;envoient sur simple demande.
          </p>
          <ul className="mt-8 space-y-3 text-sm">
            <li>
              <Link href="/contact?objet=fds" className="flex items-center gap-3 rounded-[8px] border border-rule bg-white p-4 font-semibold transition-colors duration-150 hover:border-ink">
                <Icon name="warning" size={22} className="shrink-0 text-warn" />
                Demander une fiche de données de sécurité
                <Icon name="chevronRight" size={18} className="ml-auto shrink-0 text-mci" />
              </Link>
            </li>
            <li>
              <a href={company.agrementUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-[8px] border border-rule bg-white p-4 font-semibold transition-colors duration-150 hover:border-ink">
                <Icon name="doc" size={22} className="shrink-0 text-mci" />
                Agrément préfectoral de MCI (PDF)
                <Icon name="external" size={18} className="ml-auto shrink-0 text-mci" />
              </a>
            </li>
          </ul>
          <p className="mt-6 flex gap-3 text-sm text-ink/80">
            <Icon name="biocide" size={20} className="mt-0.5 shrink-0 text-warn" />
            {BIOCIDE_NOTICE}
          </p>
        </div>

        <div className="lg:col-span-7 lg:col-start-6">
          <div className="overflow-hidden rounded-[12px] border border-rule bg-white">
            {/* Mobile : lignes empilées, sans défilement horizontal */}
            <ul className="divide-y divide-rule sm:hidden" aria-label="Exemples de fiches techniques disponibles">
              {sheets.map((p) => (
                <li key={p.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                  <Link href={`/produit/${p.slug}`} className="group min-w-0 flex-1">
                    <span className="t-code block text-base text-mci group-hover:underline">{p.code}</span>
                    <span className="block text-ink/80">{p.short}</span>
                  </Link>
                  <a href={p.technicalSheetUrl} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center gap-1.5 rounded-[6px] border border-rule px-3 py-2 font-semibold transition-colors duration-150 hover:border-mci hover:text-mci">
                    <Icon name="download" size={16} /> PDF
                    <span className="sr-only">— fiche technique {p.code}</span>
                  </a>
                </li>
              ))}
            </ul>
            <div className="hidden sm:block">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">Exemples de fiches techniques disponibles</caption>
                <thead className="border-b border-rule bg-steel/60 text-xs font-semibold text-ink/70">
                  <tr>
                    <th scope="col" className="px-4 py-3">
                      Référence
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Famille
                    </th>
                    <th scope="col" className="px-4 py-3 text-right">
                      Fiche technique
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rule">
                  {sheets.map((p) => (
                    <tr key={p.id} className="transition-colors duration-150 hover:bg-salt">
                      <td className="px-4 py-3">
                        <Link href={`/produit/${p.slug}`} className="group">
                          <span className="t-code block text-base text-mci group-hover:underline">{p.code}</span>
                          <span className="text-ink/80">{p.short}</span>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-ink/80">{familyBySlug.get(p.families[0]!)?.name}</td>
                      <td className="px-4 py-3 text-right">
                        <a href={p.technicalSheetUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-[6px] border border-rule px-3 py-1.5 font-semibold transition-colors duration-150 hover:border-mci hover:text-mci">
                          <Icon name="download" size={16} /> PDF
                          <span className="sr-only">— fiche technique {p.code}</span>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Link href="/catalogue" className="flex items-center justify-between border-t border-rule px-4 py-3 text-sm font-semibold text-mci hover:bg-salt">
              Toutes les fiches, depuis chaque produit du catalogue <Icon name="arrow" size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
