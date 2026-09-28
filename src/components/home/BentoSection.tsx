"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Blobs } from "@/components/fx/Blobs";
import { CountUp } from "@/components/fx/CountUp";
import { ProductVisual } from "@/components/catalog/ProductVisual";
import { Icon } from "@/components/ui/Icon";
import { company } from "@/data/company";
import type { MiniProduct } from "./showcase-data";
import { SeteMap } from "./SeteMap";

export interface BentoFacts {
  references: number;
  withSheet: number;
  food: number;
  bio: number;
  biocontrol: number;
  families: number;
}

/** Saisie « commande rapide » jouée en boucle (démonstration d'interface, pas une donnée). */
function TypingDemo() {
  const lines = ["DG90 · 5 L · 2", "KERMEX · 20 L · 1", "CST · carton de 12 · 3"];
  const [txt, setTxt] = useState(lines[0]!);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let li = 0;
    let ci = 0;
    let del = false;
    const id = window.setInterval(() => {
      const full = lines[li]!;
      if (!del) {
        ci++;
        if (ci > full.length + 14) del = true;
      } else {
        ci -= 2;
        if (ci <= 0) {
          del = false;
          li = (li + 1) % lines.length;
          ci = 0;
        }
      }
      setTxt(lines[li]!.slice(0, Math.max(0, Math.min(ci, lines[li]!.length))));
    }, 70);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="mt-6 flex h-12 items-center gap-3 rounded-full bg-white px-5 shadow-sheet ring-1 ring-black/5">
      <Icon name="search" size={18} className="shrink-0 text-ink/70" />
      <span className="t-mono truncate text-base">
        {txt}
        <span className="ml-px inline-block h-5 w-px translate-y-1 animate-pulse bg-mci" />
      </span>
    </div>
  );
}

const tile = "tile tile-hover flex flex-col p-8 sm:p-10";

export function BentoSection({ facts, picks }: { facts: BentoFacts; picks: MiniProduct[] }) {
  return (
    <section aria-labelledby="atouts-title" className="bg-salt py-24 lg:py-32">
      <div className="wrap">
        <div data-reveal className="flex flex-col items-center text-center">
          <p className="t-eyebrow">Pourquoi MCI</p>
          <h2 id="atouts-title" className="t-h1 mt-3 max-w-[20ch]">
            Tout ce qu&apos;il faut pour commander juste.
          </h2>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-6 lg:gap-6">
          {/* Catalogue */}
          <Link href="/catalogue" data-reveal className={`${tile} group min-h-[420px] md:col-span-4`}>
            <Blobs colors={["#cfe6f7", "#ffe0c6", "#e8f3fb"]} />
            <p className="t-eyebrow">Catalogue</p>
            <p className="t-h1 mt-3 max-w-[14ch]">
              <CountUp value={facts.references} /> références. Un seul bon de commande.
            </p>
            <p className="mt-4 max-w-[40ch] text-ink/70 sm:max-w-[30ch]">Recherche par nom, par usage ou par problème, filtres par secteur et propriété, conditionnements au choix.</p>
            <span className="mt-auto pt-6 text-md font-medium text-mci">Ouvrir le catalogue ›</span>
            <div className="pointer-events-none absolute -bottom-4 right-4 hidden w-[42%] items-end justify-end sm:flex">
              {picks.slice(0, 3).map((p, i) => (
                <div key={p.slug} className="-ml-[12%] w-1/2 transition-transform duration-700 ease-out group-hover:-translate-y-3" style={{ transitionDelay: `${i * 60}ms`, transform: `rotate(${[-8, 0, 7][i]}deg)` }}>
                  <ProductVisual product={p} size={240} sizes="18vw" alt="" className="h-auto w-full drop-shadow-[0_24px_24px_rgb(10_34_51/0.2)]" />
                </div>
              ))}
            </div>
          </Link>

          {/* Fiches techniques */}
          <div data-reveal style={{ "--reveal-delay": "100ms" } as React.CSSProperties} className={`${tile} bg-night text-white md:col-span-2`}>
            <Blobs colors={["#1f6a99", "#0a2a40"]} className="opacity-80" />
            <Icon name="doc" size={32} className="text-sky" />
            <p className="t-num mt-auto pt-12 text-[clamp(4rem,3rem+4vw,7rem)]">
              <CountUp value={facts.withSheet} />
            </p>
            <p className="mt-3 text-md text-white/70">fiches techniques téléchargeables avant achat. Les FDS sur simple demande.</p>
          </div>

          {/* Contact alimentaire */}
          <Link href="/catalogue?prop=contact-alimentaire" data-reveal className={`${tile} group md:col-span-2`}>
            <p className="t-num text-[clamp(3.5rem,2.8rem+3vw,6rem)] text-mci">
              <CountUp value={facts.food} />
            </p>
            <p className="mt-3 text-md text-ink/70">produits identifiés contact ou qualité alimentaire.</p>
            <span className="mt-auto pt-6 font-medium text-mci">Les voir ›</span>
          </Link>

          {/* Bio */}
          <Link href="/catalogue?prop=bio-vegetal" data-reveal style={{ "--reveal-delay": "80ms" } as React.CSSProperties} className={`${tile} group md:col-span-2`}>
            <Blobs colors={["#e3f4e9", "#f2fbf5"]} />
            <p className="t-num text-[clamp(3.5rem,2.8rem+3vw,6rem)] text-ok">
              <CountUp value={facts.bio} />
            </p>
            <p className="mt-3 text-md text-ink/70">
              produits à base enzymatique, bactérienne ou végétale{facts.biocontrol ? <>, dont {facts.biocontrol} en biocontrôle</> : null}.
            </p>
            <span className="mt-auto pt-6 font-medium text-mci">Les voir ›</span>
          </Link>

          {/* Commande rapide */}
          <Link href="/commande-rapide" data-reveal style={{ "--reveal-delay": "160ms" } as React.CSSProperties} className={`${tile} group md:col-span-2`}>
            <p className="t-eyebrow">Commande rapide</p>
            <p className="t-h2 mt-3">Vous connaissez vos références ? Tapez-les.</p>
            <TypingDemo />
            <span className="mt-auto pt-6 font-medium text-mci">Essayer ›</span>
          </Link>

          {/* Collectivités */}
          <div data-reveal className={`${tile} bg-ink text-white md:col-span-3`}>
            <Blobs colors={["#1f6a99", "#f89746"]} className="opacity-40" />
            <p className="t-eyebrow text-action">Collectivités</p>
            <p className="t-h2 mt-3 max-w-[18ch]">N° d&apos;engagement, Chorus Pro, validation interne.</p>
            <ul className="mt-6 space-y-3 text-white/75">
              <li className="flex gap-3">
                <Icon name="check" size={20} className="mt-px shrink-0 text-action" />
                Le bon de commande exige le numéro d&apos;engagement pour les collectivités.
              </li>
              <li className="flex gap-3">
                <Icon name="check" size={20} className="mt-px shrink-0 text-action" />
                Facturation via Chorus Pro avec code service.
              </li>
              <li className="flex gap-3">
                <Icon name="check" size={20} className="mt-px shrink-0 text-action" />
                Un agent prépare, un valideur confirme : réglable par compte.
              </li>
            </ul>
          </div>

          {/* Espace pro */}
          <Link href="/espace-pro" data-reveal style={{ "--reveal-delay": "100ms" } as React.CSSProperties} className={`${tile} group md:col-span-3`}>
            <Blobs colors={["#ffe0c6", "#fff1e6"]} />
            <p className="t-eyebrow">Espace pro</p>
            <p className="t-h2 mt-3 max-w-[18ch]">Recommander en un clic.</p>
            <p className="mt-4 max-w-[40ch] text-ink/70">Historique, listes favorites (« Stock atelier », « Rentrée scolaire »), bons de livraison et factures, adresses et utilisateurs de votre structure.</p>
            <div className="mt-8 flex flex-wrap gap-2">
              {["Recommander", "Listes favorites", "Documents", "Utilisateurs"].map((t, i) => (
                <span key={t} className={i === 0 ? "rounded-full bg-action px-4 py-2 text-sm font-medium text-ink" : "rounded-full bg-white px-4 py-2 text-sm font-medium ring-1 ring-black/5"}>
                  {t}
                </span>
              ))}
            </div>
            <span className="mt-auto pt-6 font-medium text-mci">Ouvrir l&apos;espace pro ›</span>
          </Link>

          {/* Sète */}
          <div data-reveal className={`${tile} md:col-span-6 lg:flex-row lg:items-center lg:gap-12`}>
            <div className="lg:w-5/12">
              <p className="t-eyebrow">Depuis Sète</p>
              <p className="t-h2 mt-3">Un interlocuteur sur place, qui connaît les produits.</p>
              <p className="mt-4 text-ink/70">
                MCI est installée au {company.street}, {company.postalCode} {company.city}, depuis {company.founded}. Disponibilité et délai sont confirmés à chaque commande.
              </p>
              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
                <a href={`tel:${company.phoneE164}`} className="font-medium text-mci hover:underline">
                  {company.phone} ›
                </a>
                <a href={company.agrementUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-mci hover:underline">
                  Agrément préfectoral (PDF) ›
                </a>
              </div>
            </div>
            <SeteMap className="mt-8 overflow-hidden rounded-box bg-salt p-4 lg:mt-0 lg:w-7/12" />
          </div>
        </div>
      </div>
    </section>
  );
}
