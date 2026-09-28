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
    <div className="wrap pb-24 pt-8 lg:pt-12">
      <Breadcrumb items={[{ name: "Accueil", path: "/" }, { name: "Contact", path: "/contact" }]} />
      <header className="mt-10 max-w-[820px] lg:mt-14">
        <p className="t-eyebrow">Contact</p>
        <h1 className="t-h1 mt-3">Une question, un devis, un échantillon.</h1>
        <p className="t-lead mt-6 max-w-[48ch] text-ink/70">Le plus rapide reste le téléphone. Pour une demande écrite, le formulaire arrive directement chez MCI.</p>
      </header>

      <div className="grid-12 mt-12 gap-y-6 lg:mt-16">
        <div className="col-span-12 flex flex-col gap-4 lg:col-span-5">
          <a
            href={`tel:${company.phoneE164}`}
            className="tile tile-hover group block bg-salt p-6 sm:p-8"
          >
            <span className="flex items-center gap-2 text-sm font-medium text-ink/70">
              <Icon name="phone" size={16} className="text-mci" /> Téléphone
            </span>
            <span className="t-h2 mt-3 block whitespace-nowrap text-ink transition-colors duration-300 group-hover:text-mci">{company.phone}</span>
          </a>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <a href={`mailto:${company.email}`} className="tile tile-hover group block min-w-0 bg-salt p-6">
              <span className="flex items-center gap-2 text-sm font-medium text-ink/70">
                <Icon name="mail" size={16} className="text-mci" /> Email
              </span>
              <span className="mt-2 block break-words font-semibold text-ink transition-colors duration-300 group-hover:text-mci">{company.email}</span>
            </a>
            <div className="tile min-w-0 bg-salt p-6">
              <span className="flex items-center gap-2 text-sm font-medium text-ink/70">
                <Icon name="pin" size={16} className="text-mci" /> Adresse
              </span>
              <address className="mt-2 not-italic font-semibold leading-snug">
                {company.name}
                <br />
                <span className="font-normal text-ink/70">
                  {company.street}
                  <br />
                  {company.postalCode} {company.city}
                </span>
              </address>
              <a href={company.mapsUrl} target="_blank" rel="noopener noreferrer" className="link-u mt-3 inline-flex items-center gap-1 text-sm">
                Itinéraire ›
              </a>
            </div>
          </div>
          <div className="tile hidden bg-salt p-6 lg:block">
            <SeteMap />
          </div>
        </div>
        <div className="col-span-12 lg:col-span-7">
          <div className="rounded-tile bg-salt p-5 sm:p-8 lg:p-10">
            <h2 className="t-label mb-6">Écrire à MCI</h2>
            <ContactFromQuery />
          </div>
        </div>
      </div>
    </div>
  );
}
