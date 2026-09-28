import Link from "next/link";
import { SectionHead } from "@/components/ui/SectionHead";
import { Icon } from "@/components/ui/Icon";
import { company } from "@/data/company";

export interface Facts {
  references: number;
  withSheet: number;
  food: number;
  bio: number;
  biocontrol: number;
}

/** Vignette de document (aperçu stylisé : le PDF n'est pas reproduit, il est lié). */
function DocThumb() {
  return (
    <svg viewBox="0 0 60 80" className="h-20 w-15 shrink-0" aria-hidden="true">
      <path d="M1 1h42l16 16v62H1z" fill="#fff" stroke="#0E2533" strokeWidth="1" />
      <path d="M43 1v16h16" fill="none" stroke="#0E2533" strokeWidth="1" />
      <rect x="8" y="10" width="22" height="4" fill="#206996" />
      {[24, 30, 36, 42, 48, 54].map((y) => (
        <path key={y} d={`M8 ${y}h${y % 12 ? 44 : 36}`} stroke="#D5DCE0" strokeWidth="2" />
      ))}
      <circle cx="44" cy="66" r="7" fill="none" stroke="#206996" strokeWidth="1.2" />
    </svg>
  );
}

/** 04 — Ce qui est vérifiable : uniquement des faits, en tableau technique. */
export function FactsSection({ facts }: { facts: Facts }) {
  const rows: { k: string; v: React.ReactNode }[] = [
    { k: "Société", v: <>Entreprise sétoise créée en {company.founded}. {company.street}, {company.postalCode} {company.city}.</> },
    {
      k: "Agrément",
      v: (
        <span className="flex items-center gap-4">
          <DocThumb />
          <span>
            Agrément préfectoral, consultable en ligne.
            <br />
            <a href={company.agrementUrl} target="_blank" rel="noopener noreferrer" className="link-u inline-flex items-center gap-1 font-semibold">
              Lire le document (PDF) <Icon name="external" size={14} />
            </a>
          </span>
        </span>
      ),
    },
    {
      k: "Fiches techniques",
      v: (
        <>
          {facts.withSheet} fiches téléchargeables avant achat, sur {facts.references} références. Les autres sur simple demande, comme les FDS.
        </>
      ),
    },
    {
      k: "Contact alimentaire",
      v: (
        <>
          {facts.food} produits identifiés contact / qualité alimentaire.{" "}
          <Link href="/catalogue?prop=contact-alimentaire" className="link-u">
            Les voir
          </Link>
        </>
      ),
    },
    {
      k: "Bio & biocontrôle",
      v: (
        <>
          {facts.bio} produits à base enzymatique, bactérienne ou végétale ; {facts.biocontrol} produit de biocontrôle.{" "}
          <Link href="/catalogue?prop=bio-vegetal" className="link-u">
            Les voir
          </Link>
        </>
      ),
    },
    { k: "Commande", v: <>En ligne, avec ou sans compte. Prix et délai confirmés par MCI avant préparation.</> },
    {
      k: "Téléphone",
      v: (
        <a href={`tel:${company.phoneE164}`} className="t-mono text-lg text-mci hover:underline">
          {company.phone}
        </a>
      ),
    },
  ];
  return (
    <section aria-labelledby="faits-title" className="wrap mt-24 lg:mt-32">
      <SectionHead index="04" kicker="Vérifiable" id="faits-title" title="Ce qui est vérifiable.">
        Pas de slogan : des faits que vous pouvez contrôler avant de commander.
      </SectionHead>
      <dl className="tech-grid-lg mt-12 border-t border-ink bg-white/0">
        {rows.map((r) => (
          <div key={r.k} className="grid grid-cols-1 gap-2 border-b border-rule bg-salt/0 py-6 md:grid-cols-12 md:gap-6">
            <dt className="t-mono text-xs text-ink/70 md:col-span-3">{r.k.toUpperCase()}</dt>
            <dd className="text-md md:col-span-8">{r.v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
