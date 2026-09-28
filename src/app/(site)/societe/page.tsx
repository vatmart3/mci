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

export default async function SocietePage() {
  const stats = await getStats();
  const building = local(company.photos.building.local) ? company.photos.building.local : company.photos.building.remote;
  const team = local(company.photos.team.local) ? company.photos.team.local : company.photos.team.remote;
  const groups = Object.keys(sectorGroups) as (keyof typeof sectorGroups)[];
  return (
    <div className="wrap pb-8 pt-8 lg:pt-12">
      <Breadcrumb items={[{ name: "Accueil", path: "/" }, { name: "La société", path: "/societe" }]} />
      <div className="grid-12 mt-8 gap-y-8">
        <h1 className="t-h1 col-span-12 lg:col-span-8">MCI, à Sète, depuis {company.founded}.</h1>
        <p className="t-lead col-span-12 text-ink/85 lg:col-span-6">
          Traitements industriels et nettoyants techniques de maintenance, d&apos;entretien et d&apos;hygiène, pour les professionnels et les collectivités. Uniquement en B2B : TPE, PME, artisans, industrie, administrations, loisirs.
        </p>
      </div>

      <div className="grid-12 mt-16 gap-y-8">
        <BrandPhoto className="col-span-12 lg:col-span-7" src={building} alt="Les locaux de MCI au Parc Aquatechnique de Sète" caption="Parc Aquatechnique, Sète" />
        <dl className="col-span-12 border-t border-ink lg:col-span-4 lg:col-start-9">
          {[
            ["Création", String(company.founded)],
            ["Adresse", `${company.street}, ${company.postalCode} ${company.city}`],
            ["Téléphone", company.phone],
            ["Email", company.email],
            ["Catalogue", `${stats.references} références, ${stats.families} familles`],
            ["Fiches techniques", `${stats.withSheet} en ligne`],
          ].map(([k, v]) => (
            <div key={k} className="border-b border-rule py-3">
              <dt className="t-mono text-xs text-ink/70">{k!.toUpperCase()}</dt>
              <dd className="mt-1">{v}</dd>
            </div>
          ))}
          <div className="border-b border-rule py-3">
            <dt className="t-mono text-xs text-ink/70">AGRÉMENT</dt>
            <dd className="mt-1">
              <a href={company.agrementUrl} target="_blank" rel="noopener noreferrer" className="link-u inline-flex items-center gap-1">
                Agrément préfectoral (PDF) <Icon name="external" size={14} />
              </a>
            </dd>
          </div>
        </dl>
      </div>

      <section className="mt-24" aria-labelledby="pour-qui">
        <SectionHead index="01" kicker="Pour qui" id="pour-qui" title="Trois familles de clients, neuf métiers." />
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {groups.map((g) => (
            <div key={g} className="border-t border-ink pt-4">
              <p className="t-label">{sectorGroups[g]}</p>
              <ul className="mt-3 space-y-2">
                {sectors
                  .filter((s) => s.group === g)
                  .map((s) => (
                    <li key={s.slug}>
                      <Link href={`/secteurs/${s.slug}`} className="link-u">
                        {s.name}
                      </Link>
                      <p className="text-sm text-ink/70">{s.buyer}</p>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-24" aria-labelledby="comment">
        <SectionHead index="02" kicker="Comment on travaille" id="comment" title="Un catalogue, une fiche par produit, un interlocuteur." />
        <div className="grid-12 mt-12 gap-y-8">
          <div className="prose-mci col-span-12 max-w-[64ch] text-ink/85 lg:col-span-6">
            <p>Chaque référence a sa fiche produit : usages, conditionnements, fiche technique téléchargeable quand elle existe, fiche de données de sécurité sur demande. Les produits biocides portent la mention réglementaire.</p>
            <p>Vous commandez en ligne, avec ou sans compte : MCI confirme la disponibilité, le délai et le prix avant préparation. Les collectivités indiquent leur numéro d&apos;engagement et peuvent être facturées via Chorus Pro.</p>
            <p>Pour un besoin hors catalogue, décrivez la surface, la salissure ou le nuisible : on cherche le produit avec vous.</p>
          </div>
          <div className="col-span-12 lg:col-span-5 lg:col-start-8">
            <BrandPhoto src={team} alt="L'équipe MCI" caption="L'équipe MCI" />
          </div>
        </div>
      </section>

      <section className="mt-24 grid-12 gap-y-8" aria-labelledby="venir">
        <div className="col-span-12 lg:col-span-5">
          <SectionHead index="03" kicker="Nous trouver" id="venir" title="Parc Aquatechnique, Sète." />
          <p className="mt-6">
            {company.street}
            <br />
            {company.postalCode} {company.city}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={company.mapsUrl} target="_blank" rel="noopener noreferrer" className="link-u inline-flex items-center gap-1">
              <Icon name="pin" size={16} /> Itinéraire
            </a>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/catalogue" variant="action">
              Ouvrir le catalogue
            </ButtonLink>
            <ButtonLink href="/contact" variant="outline">
              Nous écrire
            </ButtonLink>
          </div>
        </div>
        <div className="col-span-12 lg:col-span-6 lg:col-start-7">
          <SeteMap />
        </div>
      </section>
    </div>
  );
}
