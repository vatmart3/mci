import { company } from "@/data/company";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ContactFromQuery } from "@/components/order/ContactFromQuery";
import { SeteMap } from "@/components/home/SeteMap";
import { Icon } from "@/components/ui/Icon";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Contact, devis et échantillons",
  description: `Contactez MCI Sète : question produit, devis, échantillon, fiche de données de sécurité. ${company.phone} · ${company.street}, ${company.postalCode} ${company.city}.`,
  path: "/contact",
});

export default function ContactPage() {
  return (
    <div className="wrap pb-20 pt-6 lg:pb-24 lg:pt-10">
      <Breadcrumb items={[{ name: "Accueil", path: "/" }, { name: "Contact", path: "/contact" }]} />
      <header className="mt-6 max-w-[820px] lg:mt-8">
        <h1 className="t-h1">Une question, un devis, un échantillon.</h1>
        <p className="t-lead mt-3 max-w-[52ch] text-ink/70">Le plus rapide reste le téléphone. Pour une demande écrite, le formulaire arrive directement chez MCI.</p>
      </header>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:mt-10 lg:grid-cols-12 lg:gap-8">
        <div className="flex min-w-0 flex-col gap-6 lg:col-span-5">
          <section aria-labelledby="coordonnees" className="rounded-[8px] bg-night p-5 text-white sm:p-8">
            <h2 id="coordonnees" className="t-label">
              {company.name}
            </h2>
            <dl className="mt-5 divide-y divide-white/15 border-y border-white/15">
              <div className="py-4">
                <dt className="flex items-center gap-2 text-sm text-white/80">
                  <Icon name="phone" size={16} className="shrink-0" /> Téléphone
                </dt>
                <dd className="mt-1">
                  <a href={`tel:${company.phoneE164}`} className="t-h2 whitespace-nowrap text-white underline decoration-white/0 underline-offset-4 transition-[text-decoration-color] duration-150 hover:decoration-white/70">
                    {company.phone}
                  </a>
                </dd>
              </div>
              <div className="py-4">
                <dt className="flex items-center gap-2 text-sm text-white/80">
                  <Icon name="mail" size={16} className="shrink-0" /> Email
                </dt>
                <dd className="mt-1">
                  <a href={`mailto:${company.email}`} className="break-words text-md font-semibold text-white underline decoration-white/40 underline-offset-4 transition-[text-decoration-color] duration-150 hover:decoration-white">
                    {company.email}
                  </a>
                </dd>
              </div>
              <div className="py-4">
                <dt className="flex items-center gap-2 text-sm text-white/80">
                  <Icon name="pin" size={16} className="shrink-0" /> Adresse
                </dt>
                <dd className="mt-1">
                  <address className="not-italic leading-snug">
                    {company.street}
                    <br />
                    {company.postalCode} {company.city}
                  </address>
                  <a href={company.mapsUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-white underline decoration-white/40 underline-offset-4 transition-[text-decoration-color] duration-150 hover:decoration-white">
                    Itinéraire <Icon name="external" size={14} />
                  </a>
                </dd>
              </div>
            </dl>
          </section>
          <div className="hidden rounded-[8px] border border-rule bg-salt p-4 lg:block">
            <SeteMap />
          </div>
        </div>
        <section aria-labelledby="ecrire" className="min-w-0 rounded-[8px] border border-rule bg-white p-5 sm:p-8 lg:col-span-7">
          <h2 id="ecrire" className="t-h2">
            Écrire à MCI
          </h2>
          <p className="mb-6 mt-2 text-sm text-ink/70">Les champs marqués d&apos;un astérisque sont obligatoires.</p>
          <ContactFromQuery />
        </section>
      </div>
    </div>
  );
}
