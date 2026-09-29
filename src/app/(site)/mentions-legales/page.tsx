import { company } from "@/data/company";
import { LegalPage } from "@/components/ui/LegalPage";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Mentions légales", description: "Mentions légales du site MCI Sète.", path: "/mentions-legales" });

export default function MentionsLegales() {
  return (
    <LegalPage title="Mentions légales" path="/mentions-legales">
      <h2 className="t-h2">Éditeur</h2>
      <p>
        {company.legalName ?? company.name}
        <br />
        {company.street}, {company.postalCode} {company.city}
        <br />
        Téléphone : {company.phone} · Email : {company.email}
        {company.siret ? (
          <>
            <br />
            SIRET : {company.siret}
          </>
        ) : null}
      </p>
      <p>Les informations d&apos;immatriculation complètes (forme juridique, capital, RCS, n° de TVA, directeur de la publication) sont communiquées sur simple demande à l&apos;adresse ci-dessus.</p>
      <h2 className="t-h2">Hébergement</h2>
      <p>Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis — vercel.com. Données applicatives (comptes, commandes) : Supabase, hébergement en Union européenne selon la région choisie à la mise en service.</p>
      <h2 className="t-h2">Conception</h2>
      <p>Site conçu par {company.agency}.</p>
      <h2 className="t-h2">Propriété intellectuelle</h2>
      <p>Les textes, visuels de conditionnement, logos et fiches techniques sont la propriété de MCI Sète ou de leurs auteurs. Toute reproduction sans autorisation est interdite. Les polices Geist et Geist Mono sont distribuées sous licence SIL Open Font License.</p>
      <h2 className="t-h2">Produits biocides</h2>
      <p>Utilisez les biocides avec précaution. Avant toute utilisation, lisez l&apos;étiquette et les informations concernant le produit.</p>
    </LegalPage>
  );
}
