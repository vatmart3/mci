import Link from "next/link";
import { company } from "@/data/company";
import { families } from "@/data/families";
import { sectors } from "@/data/sectors";
import { LogoMark } from "@/components/brand/Logo";
import { FooterLive } from "./FooterLive";

const col = "mb-3 text-xs font-semibold text-ink";
const lnk = "text-xs text-ink/70 transition-colors hover:text-ink hover:underline";

export function Footer() {
  return (
    <footer data-site-footer className="bg-salt pb-32 pt-12 text-ink lg:pb-12">
      <div className="wrap">
        <div className="flex flex-col gap-8 border-b border-black/10 pb-12 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm text-ink/70">Une question produit, un devis, une commande :</p>
            <a href={`tel:${company.phoneE164}`} className="t-h1 mt-2 block whitespace-nowrap text-ink transition-colors hover:text-mci">
              {company.phone}
            </a>
          </div>
          <a href={`mailto:${company.email}`} className="link-u text-lg">
            {company.email} ›
          </a>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-8 py-12 md:grid-cols-4">
          <div>
            <p className={col}>Catalogue</p>
            <ul className="space-y-2">
              {families.map((f) => (
                <li key={f.slug}>
                  <Link href={`/catalogue/${f.slug}`} className={lnk}>
                    {f.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className={col}>Secteurs</p>
            <ul className="space-y-2">
              {sectors.map((s) => (
                <li key={s.slug}>
                  <Link href={`/secteurs/${s.slug}`} className={lnk}>
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className={col}>Commander</p>
            <ul className="space-y-2">
              <li>
                <Link href="/catalogue" className={lnk}>
                  Parcourir le catalogue
                </Link>
              </li>
              <li>
                <Link href="/commande-rapide" className={lnk}>
                  Commande rapide par référence
                </Link>
              </li>
              <li>
                <Link href="/commande" className={lnk}>
                  Bon de commande
                </Link>
              </li>
              <li>
                <Link href="/espace-pro" className={lnk}>
                  Espace pro
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className={col}>MCI Sète</p>
            <address className="text-xs not-italic leading-relaxed text-ink/70">
              {company.name}
              <br />
              {company.street}
              <br />
              {company.postalCode} {company.city}
            </address>
            <a href={company.mapsUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs text-mci hover:underline">
              Itinéraire ›
            </a>
            <FooterLive />
            <ul className="mt-6 space-y-2">
              <li>
                <Link href="/societe" className={lnk}>
                  La société
                </Link>
              </li>
              <li>
                <Link href="/contact" className={lnk}>
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-black/10 pt-6 text-xs text-ink/70 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <LogoMark size={24} />
            <span>
              MCI Sète · depuis {company.founded}
            </span>
          </div>
          <ul className="flex flex-wrap gap-x-4 gap-y-2">
            <li>
              <a href={company.agrementUrl} target="_blank" rel="noopener noreferrer" className="hover:text-ink hover:underline">
                Agrément préfectoral (PDF)
              </a>
            </li>
            <li>
              <Link href="/mentions-legales" className="hover:text-ink hover:underline">
                Mentions légales
              </Link>
            </li>
            <li>
              <Link href="/cgv" className="hover:text-ink hover:underline">
                CGV
              </Link>
            </li>
            <li>
              <Link href="/confidentialite" className="hover:text-ink hover:underline">
                Confidentialité
              </Link>
            </li>
          </ul>
          <p>Site conçu par {company.agency}</p>
        </div>
      </div>
    </footer>
  );
}
