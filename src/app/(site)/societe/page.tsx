import Link from "next/link";
import { existsSync } from "node:fs";
import path from "node:path";
import { company } from "@/data/company";
import { sectors, sectorGroups } from "@/data/sectors";
import { getStats } from "@/lib/catalog";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { SectionHead } from "@/components/ui/SectionHead";
import { ButtonLink } from "@/components/ui/Button";
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

/** Photo arrondie : on habille BrandPhoto (hors périmètre) sans toucher à son code. */
const photo = "[&>div]:rounded-tile [&>div]:bg-salt [&>div]:bg-none [&_figcaption]:hidden";

export default async function SocietePage() {
  const stats = await getStats();
  const building = local(company.photos.building.local) ? company.photos.building.local : company.photos.building.remote;
  const team = local(company.photos.team.local) ? company.photos.team.local : company.photos.team.remote;
  const groups = Object.keys(sectorGroups) as (keyof typeof sectorGroups)[];
  return (
    <div className="pb-24">
      <div className="wrap pt-8 lg:pt-12">
        <Breadcrumb items={[{ name: "Accueil", path: "/" }, { name: "La société", path: "/societe" }]} />
        <header className="mx-auto mt-12 flex max-w-[980px] flex-col items-center text-center lg:mt-20">
          <p data-reveal className="t-eyebrow">
            La société
          </p>
          <h1 data-reveal className="t-display mt-4 max-w-[14ch]" style={{ "--reveal-delay": "80ms" } as React.CSSProperties}>
            MCI, à Sète, depuis {company.founded}.
          </h1>
          <p data-reveal className="t-lead mt-8 max-w-[52ch] text-ink/70" style={{ "--reveal-delay": "160ms" } as React.CSSProperties}>
            Traitements industriels et nettoyants techniques de maintenance, d&apos;entretien et d&apos;hygiène, pour les professionnels et les collectivités. Uniquement en B2B : TPE, PME, artisans, industrie, administrations, loisirs.
          </p>
        </header>

        <div data-reveal className="mt-16 lg:mt-24">
          <BrandPhoto className={`${photo} lg:[&>div]:aspect-[21/9]`} src={building} alt="Les locaux de MCI au Parc Aquatechnique de Sète" caption="Parc Aquatechnique, Sète" />
          <p className="mt-4 text-center text-sm text-ink/70">Parc Aquatechnique, Sète</p>
        </div>
      </div>

      {/* Repères */}
      <section className="wrap mt-24 lg:mt-32" aria-labelledby="reperes">
        <h2 id="reperes" className="sr-only">
          Repères
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div data-reveal className="tile flex flex-col justify-between gap-10 bg-salt p-8 sm:row-span-2 lg:p-10">
            <p className="text-sm font-medium text-ink/70">Création</p>
            <p className="t-num text-[clamp(4rem,2.5rem+6vw,8rem)] text-mci">{company.founded}</p>
          </div>
          <div data-reveal className="tile bg-salt p-8" style={{ "--reveal-delay": "60ms" } as React.CSSProperties}>
            <p className="text-sm font-medium text-ink/70">Catalogue</p>
            <p className="mt-3 flex flex-wrap items-baseline gap-x-2">
              <span className="t-num text-[clamp(2.5rem,2rem+2vw,3.5rem)]">{stats.references}</span>
              <span className="font-semibold">références</span>
            </p>
            <p className="mt-1 text-ink/70">{stats.families} familles</p>
          </div>
          <div data-reveal className="tile bg-salt p-8" style={{ "--reveal-delay": "120ms" } as React.CSSProperties}>
            <p className="text-sm font-medium text-ink/70">Fiches techniques</p>
            <p className="mt-3 flex flex-wrap items-baseline gap-x-2">
              <span className="t-num text-[clamp(2.5rem,2rem+2vw,3.5rem)]">{stats.withSheet}</span>
              <span className="font-semibold">en ligne</span>
            </p>
          </div>
          <div data-reveal className="tile min-w-0 bg-salt p-8" style={{ "--reveal-delay": "60ms" } as React.CSSProperties}>
            <p className="text-sm font-medium text-ink/70">Adresse</p>
            <p className="mt-3 font-semibold leading-snug">
              {company.street}, {company.postalCode} {company.city}
            </p>
          </div>
          <div data-reveal className="tile min-w-0 bg-salt p-8" style={{ "--reveal-delay": "120ms" } as React.CSSProperties}>
            <p className="text-sm font-medium text-ink/70">Téléphone et email</p>
            <a href={`tel:${company.phoneE164}`} className="mt-3 block font-semibold hover:text-mci">
              {company.phone}
            </a>
            <a href={`mailto:${company.email}`} className="link-u mt-1 block break-words">
              {company.email}
            </a>
          </div>
          <a
            data-reveal
            href={company.agrementUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="tile tile-hover group flex flex-col justify-between gap-6 bg-deep p-8 text-white sm:col-span-2 lg:col-span-3 lg:flex-row lg:items-center lg:p-10"
            style={{ "--reveal-delay": "180ms" } as React.CSSProperties}
          >
            <p className="text-sm font-medium text-white/60">Agrément</p>
            <p className="flex items-end justify-between gap-4">
              <span className="t-label">Agrément préfectoral (PDF)</span>
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white/10 transition-colors duration-300 group-hover:bg-white/20">
                <Icon name="external" size={18} />
              </span>
            </p>
          </a>
        </div>
      </section>

      <section className="wrap mt-24 lg:mt-32" aria-labelledby="pour-qui">
        <SectionHead index="01" kicker="Pour qui" id="pour-qui" title="Trois familles de clients, neuf métiers." />
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {groups.map((g, gi) => (
            <div key={g} data-reveal className="tile bg-salt p-8" style={{ "--reveal-delay": `${gi * 80}ms` } as React.CSSProperties}>
              <p className="t-label">{sectorGroups[g]}</p>
              <ul className="mt-6 space-y-4">
                {sectors
                  .filter((s) => s.group === g)
                  .map((s) => (
                    <li key={s.slug}>
                      <Link href={`/secteurs/${s.slug}`} className="group inline-flex items-center gap-1 font-semibold text-ink transition-colors hover:text-mci">
                        {s.name}
                        <Icon name="chevronRight" size={16} className="text-ink/30 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-mci" />
                      </Link>
                      <p className="mt-0.5 text-sm text-ink/70">{s.buyer}</p>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="wrap mt-24 lg:mt-32" aria-labelledby="comment">
        <SectionHead index="02" kicker="Comment on travaille" id="comment" title="Un catalogue, une fiche par produit, un interlocuteur." />
        <div className="grid-12 mt-12 items-center gap-y-10">
          <div data-reveal className="prose-mci col-span-12 max-w-[60ch] text-md text-ink/70 lg:col-span-6">
            <p>Chaque référence a sa fiche produit : usages, conditionnements, fiche technique téléchargeable quand elle existe, fiche de données de sécurité sur demande. Les produits biocides portent la mention réglementaire.</p>
            <p>Vous commandez en ligne, avec ou sans compte : MCI confirme la disponibilité, le délai et le prix avant préparation. Les collectivités indiquent leur numéro d&apos;engagement et peuvent être facturées via Chorus Pro.</p>
            <p>Pour un besoin hors catalogue, décrivez la surface, la salissure ou le nuisible : on cherche le produit avec vous.</p>
          </div>
          <div data-reveal className="col-span-12 lg:col-span-6 lg:col-start-7" style={{ "--reveal-delay": "120ms" } as React.CSSProperties}>
            <BrandPhoto className={photo} src={team} alt="L'équipe MCI" caption="L'équipe MCI" />
            <p className="mt-4 text-center text-sm text-ink/70">L&apos;équipe MCI</p>
          </div>
        </div>
      </section>

      <section className="wrap mt-24 lg:mt-32" aria-labelledby="venir">
        <div className="tile grid-12 gap-y-10 bg-salt p-6 sm:p-10 lg:p-16">
          <div className="col-span-12 flex flex-col lg:col-span-5">
            <SectionHead index="03" kicker="Nous trouver" id="venir" title="Parc Aquatechnique, Sète." />
            <p className="mt-6 text-md text-ink/70">
              {company.street}
              <br />
              {company.postalCode} {company.city}
            </p>
            <a href={company.mapsUrl} target="_blank" rel="noopener noreferrer" className="link-u mt-4 inline-flex w-fit items-center gap-1">
              <Icon name="pin" size={16} /> Itinéraire ›
            </a>
            <div className="mt-10 flex flex-wrap gap-3">
              <ButtonLink href="/catalogue" variant="action" size="lg">
                Ouvrir le catalogue
              </ButtonLink>
              <ButtonLink href="/contact" variant="outline" size="lg">
                Nous écrire
              </ButtonLink>
            </div>
          </div>
          <div data-reveal className="col-span-12 rounded-box bg-white p-4 sm:p-6 lg:col-span-6 lg:col-start-7">
            <SeteMap />
          </div>
        </div>
      </section>
    </div>
  );
}
