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
      <main id="contenu" className="wrap flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
        <p className="t-num text-[clamp(5rem,3rem+10vw,11rem)] text-mci/15" aria-hidden="true">
          404
        </p>
        <p className="t-eyebrow mt-2">Page introuvable</p>
        <h1 className="t-h1 mt-4 max-w-[18ch]">Cette page a été nettoyée un peu trop fort.</h1>
        <p className="t-lead mt-6 max-w-[50ch] text-ink/70">
          L&apos;adresse a peut-être changé avec le nouveau site. Le produit que vous cherchez est sûrement au catalogue ; sinon, appelez le{" "}
          <a href={`tel:${company.phoneE164}`} className="whitespace-nowrap font-semibold text-mci hover:underline">
            {company.phone}
          </a>
          .
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <ButtonLink href="/catalogue" variant="action" size="lg">
            Ouvrir le catalogue
          </ButtonLink>
          <ButtonLink href="/" variant="outline" size="lg">
            Retour à l&apos;accueil
          </ButtonLink>
          <ButtonLink href="/contact" variant="ghost" size="lg">
            Nous contacter
            <Icon name="chevronRight" size={16} />
          </ButtonLink>
        </div>
      </main>
      <Footer />
    </Providers>
  );
}
