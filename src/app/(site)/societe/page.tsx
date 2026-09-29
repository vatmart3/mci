import Link from "next/link";
import { existsSync } from "node:fs";
import path from "node:path";
import { company } from "@/data/company";
import { sectors, sectorGroups } from "@/data/sectors";
import { getStats } from "@/lib/catalog";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { SectionHead } from "@/components/ui/SectionHead";
import { ButtonLink, buttonClass } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { SeteMap } from "@/components/home/SeteMap";
import { BrandPhoto } from "@/components/home/BrandPhoto";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "La société — MCI, Parc Aquatechnique, Sète",
  description: "MCI Sète, créée en 2015 : traitements industriels et nettoyants techniques de maintenance, d'entretien et d'hygiène pour professionnels et collectivités. Agrément préfectoral, fiches techniques, commande pro.",
  path: "/societe",
});

const local = (p: string) => existsSync(path.join(process.cwd(), "public", p));

export default async function SocietePage() {
  const stats = await getStats();
  const building = local(company.photos.building.local) ? company.photos.building.local : company.photos.building.remote;
  const team = local(company.photos.team.local) ? company.photos.team.local : company.photos.team.remote;
  const groups = Object.keys(sectorGroups) as (keyof typeof sectorGroups)[];
  const facts: { k: string; v: React.ReactNode; d?: React.ReactNode }[] = [
    { k: "Création", v: <span className="t-num text-[2.5rem]">{company.founded}</span>, d: `${company.city}, ${company.department}` },
    { k: "Catalogue", v: <span className="t-num text-[2.5rem]">{stats.references}</span>, d: `références, ${stats.families} familles` },
    { k: "Fiches techniques", v: <span className="t-num text-[2.5rem]">{stats.withSheet}</span>, d: "en ligne" },
    {
      k: "Contact",
      v: (
        <a href={`tel:${company.phoneE164}`} className="t-label whitespace-nowrap transition-colors duration-150 hover:text-mci">
          {company.phone}
        </a>
      ),
      d: (
        <a href={`mailto:${company.email}`} className="link-u break-words">
          {company.email}
        </a>
      ),
    },
  ];
  return (
    <div className="pb-20 lg:pb-24">
      <div className="wrap pt-6 lg:pt-10">
        <Breadcrumb items={[{ name: "Accueil", path: "/" }, { name: "La société", path: "/societe" }]} />
        <header className="mt-6 grid grid-cols-1 gap-6 lg:mt-8 lg:grid-cols-12 lg:items-end lg:gap-8">
          <h1 className="t-display max-w-[14ch] lg:col-span-7">MCI, à Sète, depuis {company.founded}.</h1>
          <p className="t-lead max-w-[52ch] text-ink/80 lg:col-span-5">
            Traitements industriels et nettoyants techniques de maintenance, d&apos;entretien et d&apos;hygiène, pour les professionnels et les collectivités. Uniquement en B2B : TPE, PME, artisans, industrie, administrations, loisirs.
          </p>
        </header>

        <BrandPhoto className="mt-8 lg:mt-12 lg:[&>div]:aspect-[21/9]" sizes="(max-width: 1400px) 100vw, 1320px" src={building} alt="Les locaux de MCI au Parc Aquatechnique de Sète" caption="Parc Aquatechnique, Sète" />

        {/* Repères : une fiche d'identité, pas des tuiles */}
        <section className="mt-12 lg:mt-16" aria-labelledby="reperes">
          <h2 id="reperes" className="sr-only">
            Repères
          </h2>
          <dl className="grid grid-cols-1 gap-px border-y border-rule bg-rule sm:grid-cols-2 lg:grid-cols-4">
            {facts.map((f) => (
              <div key={f.k} className="min-w-0 bg-white py-5 sm:px-6 sm:py-6">
                <dt className="text-sm font-semibold text-ink/70">{f.k}</dt>
                <dd className="mt-2">{f.v}</dd>
                {f.d ? <dd className="mt-1 text-sm text-ink/80">{f.d}</dd> : null}
              </div>
            ))}
          </dl>
        </section>
      </div>

      <section className="wrap mt-16 lg:mt-24" aria-labelledby="pour-qui">
        <SectionHead id="pour-qui" title="Trois familles de clients, neuf métiers." />
        <div className="mt-8 grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-3 lg:mt-10">
          {groups.map((g) => (
            <div key={g} className="min-w-0 border-t border-ink pt-4">
              <h3 className="t-label">{sectorGroups[g]}</h3>
              <ul className="mt-4 divide-y divide-rule">
                {sectors
                  .filter((s) => s.group === g)
                  .map((s) => (
                    <li key={s.slug}>
                      <Link href={`/secteurs/${s.slug}`} className="group flex items-start justify-between gap-3 py-3">
                        <span className="min-w-0">
                          <span className="block font-semibold text-ink transition-colors duration-150 group-hover:text-mci">{s.name}</span>
                          <span className="mt-0.5 block text-sm text-ink/70">{s.buyer}</span>
                        </span>
                        <Icon name="chevronRight" size={18} className="mt-0.5 shrink-0 text-mci" />
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="wrap mt-16 lg:mt-24" aria-labelledby="comment">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="min-w-0 lg:col-span-6">
            <h2 id="comment" className="t-h1 max-w-[20ch]">
              Un catalogue, une fiche par produit, un interlocuteur.
            </h2>
            <div className="prose-mci mt-6 text-md text-ink/80">
              <p>Chaque référence a sa fiche produit : usages, conditionnements, fiche technique téléchargeable quand elle existe, fiche de données de sécurité sur demande. Les produits biocides portent la mention réglementaire.</p>
              <p>Vous commandez en ligne, avec ou sans compte : MCI confirme la disponibilité, le délai et le prix avant préparation. Les collectivités indiquent leur numéro d&apos;engagement et peuvent être facturées via Chorus Pro.</p>
              <p>Pour un besoin hors catalogue, décrivez la surface, la salissure ou le nuisible : on cherche le produit avec vous.</p>
            </div>
          </div>
          <div className="min-w-0 lg:col-span-6">
            <BrandPhoto src={team} alt="L'équipe MCI" caption="L'équipe MCI" />
          </div>
        </div>
      </section>

      <section className="mt-16 bg-mci py-10 text-white lg:mt-24 lg:py-14" aria-labelledby="agrement">
        <div className="wrap flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <Icon name="doc" size={32} className="mt-1 shrink-0 text-white" />
            <div className="min-w-0">
              <h2 id="agrement" className="t-h2">
                Agrément préfectoral
              </h2>
              <p className="mt-2 max-w-[56ch] text-white/85">Le document d&apos;agrément de MCI est consultable en ligne, au format PDF.</p>
            </div>
          </div>
          <a href={company.agrementUrl} target="_blank" rel="noopener noreferrer" className={buttonClass("inverse", "lg", "shrink-0 self-start md:self-auto")}>
            Agrément préfectoral (PDF)
            <Icon name="external" size={18} />
          </a>
        </div>
      </section>

      <section className="wrap mt-16 lg:mt-24" aria-labelledby="venir">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="flex min-w-0 flex-col lg:col-span-5">
            <h2 id="venir" className="t-h1">
              Parc Aquatechnique, Sète.
            </h2>
            <address className="mt-5 flex gap-3 text-md not-italic text-ink/80">
              <Icon name="pin" size={22} className="mt-0.5 shrink-0 text-mci" />
              <span>
                {company.street}
                <br />
                {company.postalCode} {company.city}
                <br />
                <a href={company.mapsUrl} target="_blank" rel="noopener noreferrer" className="link-u text-sm font-semibold">
                  Itinéraire
                </a>
              </span>
            </address>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/catalogue" variant="primary" size="lg">
                Ouvrir le catalogue
              </ButtonLink>
              <ButtonLink href="/contact" variant="outline" size="lg">
                Nous écrire
              </ButtonLink>
            </div>
          </div>
          <div className="min-w-0 rounded-[12px] border border-rule bg-salt p-4 sm:p-6 lg:col-span-6 lg:col-start-7">
            <SeteMap />
          </div>
        </div>
      </section>
    </div>
  );
}
