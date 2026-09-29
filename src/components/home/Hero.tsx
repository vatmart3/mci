import Link from "next/link";
import { InstantSearch } from "@/components/search/InstantSearch";
import { ProductVisual } from "@/components/catalog/ProductVisual";
import { Icon } from "@/components/ui/Icon";
import { company } from "@/data/company";
import type { MiniProduct } from "./showcase-data";

const FREQUENT = ["graisse cuite", "graffitis", "mousses", "tartre", "frelons", "hydrocarbures"];

/** Vague du logo MCI, reprise en filigrane au pied du bandeau. */
function BrandWave({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className={className} aria-hidden="true" focusable="false">
      <path d="M0 70c120-52 240-52 360 0s240 52 360 0 240-52 360 0 240 52 360 0" fill="none" stroke="currentColor" strokeWidth="18" strokeLinecap="round" />
      <path d="M120 108c90-38 180-38 270 0s180 38 270 0 180-38 270 0 180 38 270 0 180-38 270 0" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Bandeau d'accueil : la recherche par problème est l'action principale, la gamme réelle
 * (packshots) à droite. Aucun effet : tout est lisible au premier affichage.
 */
export function Hero({ products, stats }: { products: { p: MiniProduct; pack?: string }[]; stats: { references: number; families: number; withSheet: number } }) {
  // ordre de composition : du fond vers l'avant (le bidon central au premier plan)
  const place = [
    { l: "-6%", b: "20%", w: "36%", z: 1 },
    { l: "14%", b: "8%", w: "40%", z: 3 },
    { l: "32%", b: "-2%", w: "48%", z: 4 },
    { l: "56%", b: "10%", w: "44%", z: 2 },
    { l: "74%", b: "24%", w: "32%", z: 1 },
  ];
  return (
    <section aria-labelledby="hero-title" className="relative isolate z-10 overflow-x-clip bg-mci text-white">
      <BrandWave className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-28 w-full text-white/[0.07]" />
      <div className="wrap grid gap-12 py-12 lg:grid-cols-12 lg:items-center lg:gap-8 lg:py-20">
        <div className="lg:col-span-7">
          <h1 id="hero-title" className="t-display max-w-[15ch]">
            Le bon produit pour chaque surface.
          </h1>
          <p className="t-lead mt-5 max-w-[52ch] text-white/85">
            Nettoyants techniques, désinfectants et traitements de maintenance pour collectivités, industries et loisirs. {stats.references} références, {stats.withSheet} fiches techniques en ligne, commande avec ou sans compte, et un interlocuteur à Sète qui vous répond.
          </p>
          <InstantSearch size="hero" autoRotate className="mt-8 max-w-[640px] text-ink" />
          <div className="mt-4 flex max-w-[640px] flex-wrap items-center gap-2 text-sm">
            <span className="mr-1 text-white/75">Recherches fréquentes :</span>
            {FREQUENT.map((q) => (
              <Link key={q} href={`/catalogue?q=${encodeURIComponent(q)}`} className="rounded-[4px] bg-white/12 px-2.5 py-1 font-medium text-white transition-colors duration-150 hover:bg-white hover:text-mci">
                {q}
              </Link>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-white/20 pt-6 text-sm">
            <Link href="/commande-rapide" className="inline-flex items-center gap-2 font-semibold hover:underline">
              <Icon name="order" size={18} /> Commande rapide par référence
            </Link>
            <a href={`tel:${company.phoneE164}`} className="inline-flex items-center gap-2 font-semibold hover:underline">
              <Icon name="phone" size={18} /> {company.phone}
            </a>
            <Link href="/contact?objet=echantillon" className="inline-flex items-center gap-2 font-semibold hover:underline">
              <Icon name="mail" size={18} /> Demander un échantillon
            </Link>
          </div>
        </div>

        <div className="relative lg:col-span-5" aria-hidden="true">
          <div className="relative mx-auto aspect-[4/3] w-full max-w-[620px]">
            {products.slice(0, 5).map(({ p }, i) => {
              const s = place[i]!;
              return (
                <div key={p.slug} className="absolute" style={{ left: s.l, bottom: s.b, width: s.w, zIndex: s.z }}>
                  <ProductVisual product={p} size={360} sizes="(max-width: 1024px) 45vw, 300px" alt="" priority={i === 2} className="h-auto w-full drop-shadow-[0_6px_10px_rgb(8_30_45/0.25)]" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
