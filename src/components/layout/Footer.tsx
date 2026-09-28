import Link from "next/link";
import { company } from "@/data/company";
import { families } from "@/data/families";
import { LogoMark } from "@/components/brand/Logo";
import { FooterLive } from "./FooterLive";

/** Silhouette du Mont Saint-Clair vue du large, avec le filet d'horizon du port. Trait fin. */
function MontSaintClair({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 1440 160" preserveAspectRatio="none" className={className} aria-hidden="true" focusable="false">
      <path
        d="M0 150 H180 C260 150 300 146 360 140 C430 133 470 122 520 108 C560 96 590 80 625 66 C650 56 670 49 690 46 C696 45 701 44 706 44 C730 45 760 52 806 70 C846 90 884 110 940 124 C990 136 1040 142 1110 146 C1180 150 1260 150 1440 150 M706 44 V30 M701 35 H711"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        vectorEffect="non-scaling-stroke"
      />
      {/* phare et jetée */}
      <path d="M1250 150 V128 M1244 128 H1256 M1250 128 V122" fill="none" stroke="currentColor" strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
      <path d="M1180 150 H1320" fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      <path d="M0 156 H1440" fill="none" stroke="currentColor" strokeWidth="0.75" strokeDasharray="2 6" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer data-site-footer className="relative mt-24 bg-deep pb-24 text-white lg:pb-8">
      <MontSaintClair className="pointer-events-none absolute inset-x-0 top-8 h-24 w-full text-white/30" />
      <div className="wrap pt-32">
        <div className="grid-12 gap-y-12">
          <div className="col-span-12 lg:col-span-7">
            <p className="t-mono mb-4 text-sm text-white/70">UNE QUESTION PRODUIT, UN DEVIS, UNE COMMANDE</p>
            <a href={`tel:${company.phoneE164}`} className="block whitespace-nowrap font-mono font-medium leading-none text-white hover:text-action" style={{ fontSize: "clamp(1.75rem, 0.6rem + 4.6vw, 5.25rem)", letterSpacing: "-0.04em" }}>
              {company.phone}
            </a>
            <a href={`mailto:${company.email}`} className="link-u mt-4 inline-block text-lg text-white/90 hover:text-white">
              {company.email}
            </a>
          </div>
          <div className="col-span-12 sm:col-span-6 lg:col-span-2 lg:col-start-9">
            <p className="t-mono mb-4 text-xs text-white/70">ADRESSE</p>
            <address className="not-italic leading-relaxed text-white/90">
              {company.name}
              <br />
              {company.street}
              <br />
              {company.postalCode} {company.city}
            </address>
            <a href={company.mapsUrl} target="_blank" rel="noopener noreferrer" className="link-u mt-3 inline-block text-sm text-white/90 hover:text-white">
              Itinéraire
            </a>
            <FooterLive />
          </div>
          <div className="col-span-12 sm:col-span-6 lg:col-span-2">
            <p className="t-mono mb-4 text-xs text-white/70">FAMILLES</p>
            <ul className="space-y-2 text-sm">
              {families.map((f) => (
                <li key={f.slug}>
                  <Link href={`/catalogue/${f.slug}`} className="text-white/90 hover:text-white hover:underline">
                    {f.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-6 border-t border-white/20 pt-6 text-sm text-white/80 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <LogoMark size={28} />
            <span className="t-mono text-xs">MCI SÈTE · DEPUIS {company.founded}</span>
          </div>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            <li>
              <a href={company.agrementUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white hover:underline">
                Agrément préfectoral (PDF)
              </a>
            </li>
            <li>
              <Link href="/mentions-legales" className="hover:text-white hover:underline">
                Mentions légales
              </Link>
            </li>
            <li>
              <Link href="/cgv" className="hover:text-white hover:underline">
                CGV
              </Link>
            </li>
            <li>
              <Link href="/confidentialite" className="hover:text-white hover:underline">
                Confidentialité
              </Link>
            </li>
            <li>
              <Link href="/espace-pro" className="hover:text-white hover:underline">
                Espace pro
              </Link>
            </li>
          </ul>
          <p className="t-mono text-xs">Site conçu par {company.agency}</p>
        </div>
      </div>
    </footer>
  );
}
