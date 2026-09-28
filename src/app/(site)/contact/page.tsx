import { company } from "@/data/company";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ContactFromQuery } from "@/components/order/ContactFromQuery";
import { SeteMap } from "@/components/home/SeteMap";
import { Icon } from "@/components/ui/Icon";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Contact, devis et échantillons",
  description: `Contactez MCI Sète : question produit, devis, échantillon, fiche de données de sécurité. ${company.phone} · ${company.street}, ${company.postalCode} ${company.city}.`,
  path: "/contact",
});

export default function ContactPage() {
  return (
    <div className="wrap pb-8 pt-8 lg:pt-12">
      <Breadcrumb items={[{ name: "Accueil", path: "/" }, { name: "Contact", path: "/contact" }]} />
      <div className="grid-12 mt-8 gap-y-12">
        <div className="col-span-12 lg:col-span-5">
          <h1 className="t-h1">Une question, un devis, un échantillon.</h1>
          <p className="t-lead mt-6 text-ink/80">Le plus rapide reste le téléphone. Pour une demande écrite, le formulaire arrive directement chez MCI.</p>
          <a href={`tel:${company.phoneE164}`} className="t-mono mt-8 block text-3xl text-mci hover:underline">
            {company.phone}
          </a>
          <a href={`mailto:${company.email}`} className="link-u mt-3 inline-flex items-center gap-2">
            <Icon name="mail" size={18} /> {company.email}
          </a>
          <address className="mt-8 not-italic">
            <span className="t-mono block text-xs text-ink/70">ADRESSE</span>
            {company.name}
            <br />
            {company.street}
            <br />
            {company.postalCode} {company.city}
          </address>
          <a href={company.mapsUrl} target="_blank" rel="noopener noreferrer" className="link-u mt-3 inline-flex items-center gap-1">
            <Icon name="pin" size={16} /> Itinéraire
          </a>
          <SeteMap className="mt-12 hidden lg:block" />
        </div>
        <div className="col-span-12 lg:col-span-6 lg:col-start-7">
          <div className="rounded-box border border-rule bg-white p-6 lg:p-8">
            <ContactFromQuery />
          </div>
        </div>
      </div>
    </div>
  );
}
