import { company } from "@/data/company";
import { LegalPage } from "@/components/ui/LegalPage";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Politique de confidentialité", description: "Données personnelles et cookies sur le site MCI Sète (RGPD).", path: "/confidentialite" });

export default function Confidentialite() {
  return (
    <LegalPage title="Confidentialité et cookies" path="/confidentialite">
      <h2 className="t-h2">Responsable du traitement</h2>
      <p>
        {company.name}, {company.street}, {company.postalCode} {company.city} — {company.email}.
      </p>
      <h2 className="t-h2">Données collectées et finalités</h2>
      <ul>
        <li>Commandes : structure, SIRET, contact, adresses, références administratives — pour traiter, livrer et facturer la commande (exécution du contrat).</li>
        <li>Compte pro : identifiants, utilisateurs de la structure, listes favorites, documents — pour l&apos;espace pro (exécution du contrat).</li>
        <li>Formulaire de contact : pour répondre à la demande (intérêt légitime / mesures précontractuelles).</li>
      </ul>
      <h2 className="t-h2">Durées de conservation</h2>
      <p>Données de compte : pendant la relation commerciale puis 3 ans. Pièces comptables : 10 ans (obligation légale). Demandes de contact sans suite : 3 ans.</p>
      <h2 className="t-h2">Destinataires</h2>
      <p>Les équipes de MCI et ses prestataires techniques : hébergement du site (Vercel), base de données et authentification (Supabase), envoi des emails transactionnels (Resend). Aucune donnée n&apos;est vendue ni cédée.</p>
      <h2 className="t-h2">Vos droits</h2>
      <p>Accès, rectification, effacement, limitation, opposition et portabilité : écrivez à {company.email}. Vous pouvez saisir la CNIL (cnil.fr).</p>
      <h2 className="t-h2">Cookies et stockage local</h2>
      <p>Le site n&apos;utilise aucun cookie publicitaire ni outil de mesure d&apos;audience tiers. Il enregistre uniquement dans votre navigateur ce qui est nécessaire à son fonctionnement : le bon de commande en cours, votre session de connexion et votre choix concernant ce bandeau. Refuser n&apos;empêche pas de commander.</p>
    </LegalPage>
  );
}
