import Link from "next/link";
import type { SectorSlug } from "@/lib/types";
import { sectors, sectorGroups } from "@/data/sectors";
import { Icon, type IconName } from "@/components/ui/Icon";

/**
 * Entrée par métier : les neuf secteurs en grille filetée (pas de cartes), groupés par famille
 * d'acheteurs, avec le nombre réel de produits de chaque sélection.
 */
export function SectorsSection({ counts }: { counts: Record<SectorSlug, number> }) {
  const groups = Object.keys(sectorGroups) as (keyof typeof sectorGroups)[];
  return (
    <section id="secteurs" aria-labelledby="secteurs-title" className="scroll-mt-24 py-16 lg:py-24">
      <div className="wrap">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 id="secteurs-title" className="t-h1">
              Une sélection pour votre métier
            </h2>
            <p className="t-lead mt-3 max-w-[58ch] text-ink/70">Chaque secteur a ses surfaces, ses salissures et ses contraintes d&apos;achat. Choisissez le vôtre.</p>
          </div>
        </div>

        <div className="mt-10 grid gap-x-8 gap-y-10 lg:grid-cols-3">
          {groups.map((g) => (
            <div key={g}>
              <p className="border-b-2 border-ink pb-2 font-display text-lg font-bold">{sectorGroups[g]}</p>
              <ul className="divide-y divide-rule">
                {sectors
                  .filter((s) => s.group === g)
                  .map((s) => (
                    <li key={s.slug}>
                      <Link href={`/secteurs/${s.slug}`} className="group -mx-3 flex items-center gap-4 rounded-[6px] px-3 py-4 transition-colors duration-150 hover:bg-salt">
                        <span className="grid size-12 shrink-0 place-items-center rounded-[6px] bg-sky/60 text-mci transition-colors duration-150 group-hover:bg-mci group-hover:text-white">
                          <Icon name={`sec-${s.slug}` as IconName} size={26} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-display text-xl font-bold leading-tight">{s.name}</span>
                          <span className="mt-0.5 line-clamp-1 text-sm text-ink/70">{s.buyer}</span>
                        </span>
                        <span className="shrink-0 text-sm font-semibold text-mci tabular-nums">{counts[s.slug] ?? 0} produits</span>
                        <Icon name="chevronRight" size={18} className="shrink-0 text-ink/40 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-mci" />
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
