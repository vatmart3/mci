import Link from "next/link";
import { company } from "@/data/company";
import { families } from "@/data/families";
import { sectors } from "@/data/sectors";
import { LogoMark } from "@/components/brand/Logo";
import { Icon } from "@/components/ui/Icon";
import { FooterLive } from "./FooterLive";

const col = "mb-4 font-display text-lg font-bold text-white";
const lnk = "text-sm text-white/75 transition-colors duration-150 hover:text-white";

export function Footer() {
  return (
    <footer data-site-footer className="bg-night pb-28 pt-16 text-white lg:pb-10">
      <div className="wrap">
        <div className="flex flex-col gap-6 rounded-[12px] bg-deep p-6 sm:p-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-display text-2xl font-bold">Une question produit, un devis, une commande ?</p>
            <p className="mt-1 text-white/75">Un interlocuteur de MCI vous répond, à Sète.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href={`tel:${company.phoneE164}`} className="inline-flex h-12 items-center gap-2 rounded-[6px] bg-white px-5 font-display text-xl font-bold text-mci hover:bg-sky">
              <Icon name="phone" size={20} /> {company.phone}
            </a>
            <a href={`mailto:${company.email}`} className="inline-flex h-12 items-center gap-2 rounded-[6px] border border-white/40 px-5 font-semibold hover:border-white">
              <Icon name="mail" size={20} /> Écrire
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-10 py-14 md:grid-cols-4">
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
            <address className="text-sm not-italic leading-relaxed text-white/75">
              {company.name}
              <br />
              {company.street}
              <br />
              {company.postalCode} {company.city}
            </address>
            <a href={company.mapsUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm font-semibold text-sky hover:underline">
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

        <div className="flex flex-col gap-4 border-t border-white/15 pt-6 text-sm text-white/70 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <LogoMark size={24} />
            <span>
              MCI Sète · depuis {company.founded}
            </span>
          </div>
          <ul className="flex flex-wrap gap-x-4 gap-y-2">
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
          </ul>
          <p>Site conçu par {company.agency}</p>
        </div>
      </div>
    </footer>
  );
}
