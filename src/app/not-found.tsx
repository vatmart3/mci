import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Providers } from "@/components/layout/Providers";
import { company } from "@/data/company";
import { ButtonLink } from "@/components/ui/Button";

/** 404 globale (URL hors des groupes de routes) : même mise en page que le site. */
export default function RootNotFound() {
  return (
    <Providers>
      <Header />
      <main id="contenu" className="wrap grid min-h-[60vh] content-center py-24">
        <p className="t-mono text-sm text-ink/70">
          <span className="text-mci">404</span> — PAGE INTROUVABLE
        </p>
        <h1 className="t-h1 mt-4 max-w-[18ch]">Cette page a été nettoyée un peu trop fort.</h1>
        <p className="t-lead mt-6 max-w-[52ch] text-ink/80">
          L&apos;adresse a peut-être changé avec le nouveau site. Le produit que vous cherchez est sûrement au catalogue ; sinon, appelez le{" "}
          <a href={`tel:${company.phoneE164}`} className="t-mono text-mci underline">
            {company.phone}
          </a>
          .
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-6">
          <ButtonLink href="/catalogue" variant="action" size="lg">
            Ouvrir le catalogue
          </ButtonLink>
          <Link href="/" className="link-u font-semibold">
            Retour à l&apos;accueil
          </Link>
        </div>
      </main>
      <Footer />
    </Providers>
  );
}
