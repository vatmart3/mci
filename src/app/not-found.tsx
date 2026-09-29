import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Providers } from "@/components/layout/Providers";
import { company } from "@/data/company";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

/** 404 globale (URL hors des groupes de routes) : même mise en page que le site. */
export default function RootNotFound() {
  return (
    <Providers>
      <Header />
      <main id="contenu" className="wrap py-12 lg:py-20">
        <div className="mx-auto max-w-[720px] rounded-[8px] border border-rule bg-white p-6 sm:p-10">
          <h1 className="t-h1">Page introuvable.</h1>
          <p className="t-lead mt-3 max-w-[52ch] text-ink/70">
            L&apos;adresse a peut-être changé avec le nouveau site. Le produit que vous cherchez est sûrement au catalogue ; sinon, appelez le{" "}
            <a href={`tel:${company.phoneE164}`} className="whitespace-nowrap font-semibold text-mci hover:underline">
              {company.phone}
            </a>
            .
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <ButtonLink href="/catalogue" variant="primary" size="lg">
              Ouvrir le catalogue
            </ButtonLink>
            <ButtonLink href="/" variant="outline" size="lg">
              Retour à l&apos;accueil
            </ButtonLink>
            <ButtonLink href="/contact" variant="ghost" size="lg" className="self-start sm:self-auto">
              Nous contacter
              <Icon name="chevronRight" size={16} />
            </ButtonLink>
          </div>
        </div>
      </main>
      <Footer />
    </Providers>
  );
}
