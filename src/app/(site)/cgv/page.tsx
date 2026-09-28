import { company } from "@/data/company";
import { LegalPage } from "@/components/ui/LegalPage";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Conditions générales de vente", description: "Conditions générales de vente B2B de MCI Sète.", path: "/cgv" });

export default function Cgv() {
  return (
    <LegalPage title="Conditions générales de vente" path="/cgv" updated="VERSION PROVISOIRE — LES CONDITIONS PARTICULIÈRES DE LA PRO-FORMA PRÉVALENT">
      <p>Les présentes conditions s&apos;appliquent aux ventes de {company.name} à des clients professionnels (entreprises, collectivités, associations). Elles ne s&apos;appliquent pas aux consommateurs.</p>
      <h2 className="t-h2">1. Commande</h2>
      <p>Le bon de commande transmis en ligne constitue une demande. La vente est formée à la confirmation de MCI (prix, disponibilité et délai), le cas échéant par la pro-forma validée par le client.</p>
      <h2 className="t-h2">2. Prix</h2>
      <p>Les prix sont exprimés hors taxes. Ils sont ceux de la confirmation de commande ou de la grille tarifaire applicable au compte du client. Les frais de livraison éventuels figurent sur la confirmation.</p>
      <h2 className="t-h2">3. Conditionnements</h2>
      <p>Les conditionnements affichés sur le site sont indicatifs ; MCI confirme le conditionnement livré lors de la confirmation de commande.</p>
      <h2 className="t-h2">4. Livraison</h2>
      <p>Les délais sont indiqués sur la confirmation. Le client précise les contraintes d&apos;accès du lieu de livraison. Les réserves en cas de colis endommagé ou manquant sont à porter sur le bon de livraison et à confirmer à MCI.</p>
      <h2 className="t-h2">5. Paiement</h2>
      <p>Pas de paiement en ligne. Règlement par virement, à l&apos;échéance indiquée sur la facture, ou par mandat administratif pour les entités publiques (facturation via Chorus Pro sur demande). Conformément à l&apos;article L441-10 du Code de commerce, tout retard de paiement entraîne des pénalités de retard et une indemnité forfaitaire pour frais de recouvrement de 40 €.</p>
      <h2 className="t-h2">6. Utilisation des produits</h2>
      <p>Le client utilise les produits conformément à leur étiquette, à leur fiche technique et à leur fiche de données de sécurité. Utilisez les biocides avec précaution. Avant toute utilisation, lisez l&apos;étiquette et les informations concernant le produit.</p>
      <h2 className="t-h2">7. Contact</h2>
      <p>
        {company.name} · {company.street}, {company.postalCode} {company.city} · {company.phone} · {company.email}
      </p>
    </LegalPage>
  );
}
