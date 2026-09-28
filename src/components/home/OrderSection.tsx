"use client";
import { useEffect, useRef } from "react";
import { SectionHead } from "@/components/ui/SectionHead";
import { ButtonLink } from "@/components/ui/Button";
import { LogoMark } from "@/components/brand/Logo";
import Link from "next/link";

const lines = [
  { ref: "DG90", text: "Dégraissant graisses cuites", qty: "2 × 5 L" },
  { ref: "KERMEX", text: "Anti-mousses et algues", qty: "1 × 20 L" },
  { ref: "SANIKEL R.", text: "Détartrant sanitaires", qty: "4 × 5 L" },
];

const steps = [
  "Vous choisissez vos produits et conditionnements.",
  "Vous indiquez votre n° de bon de commande interne ou d'engagement (collectivités).",
  "MCI confirme la disponibilité et le délai.",
  "Livraison et facture dans votre espace pro.",
];

/**
 * 03 — Commander, concrètement : un vrai bon de commande papier qui se remplit au scroll,
 * ligne par ligne, puis le tampon « VALIDÉ ». Mouvement réduit : bon déjà rempli.
 */
export function OrderSection() {
  const sheet = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !sheet.current) return;
    let ctx: { revert: () => void } | null = null;
    let cancelled = false;
    void Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([{ gsap }, { ScrollTrigger }]) => {
      if (cancelled || !sheet.current) return;
      gsap.registerPlugin(ScrollTrigger);
      ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: sheet.current, start: "top 75%", end: "bottom 45%", scrub: 0.5 },
        });
        gsap.utils.toArray<HTMLElement>("[data-type]").forEach((el) => {
          const chars = el.textContent?.length ?? 10;
          tl.fromTo(el, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", ease: `steps(${chars})`, duration: chars / 24 });
        });
        tl.fromTo("[data-stamp]", { scale: 2.2, opacity: 0, rotate: -24 }, { scale: 1, opacity: 1, rotate: -12, ease: "back.out(2)", duration: 0.6 });
      }, sheet);
    });
    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  return (
    <section aria-labelledby="commander-title" className="wrap mt-24 lg:mt-32">
      <SectionHead index="03" kicker="Commander" id="commander-title" title="Commander, concrètement." />
      <div className="grid-12 mt-12 gap-y-12">
        <div className="col-span-12 lg:col-span-5">
          <ol className="border-t border-ink">
            {steps.map((s, i) => (
              <li key={s} className="grid grid-cols-[48px_1fr] gap-4 border-b border-rule py-4">
                <span className="t-mono text-sm text-mci">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-md">{s}</span>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-ink/80">Pas de paiement en ligne : virement, facture à échéance ou mandat administratif. Facturation Chorus Pro pour les entités publiques.</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
            <ButtonLink href="/espace-pro?creer=1" variant="primary" size="lg">
              Créer mon compte pro
            </ButtonLink>
            <Link href="/catalogue" className="link-u font-semibold">
              Commander sans compte →
            </Link>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-6 lg:col-start-7">
          <div ref={sheet} className="crop relative mx-auto max-w-[620px] bg-white p-6 shadow-sheet sm:p-10" aria-label="Exemple de bon de commande rempli" role="img">
            <div className="flex items-start justify-between gap-4 border-b-2 border-ink pb-4">
              <div className="flex items-center gap-3">
                <LogoMark size={36} />
                <div>
                  <p className="font-display text-lg font-extrabold leading-none" style={{ fontVariationSettings: '"wdth" 120' }}>
                    BON DE COMMANDE
                  </p>
                  <p className="t-mono mt-1 text-[11px] text-ink/60">MCI SÈTE · PARC AQUATECHNIQUE</p>
                </div>
              </div>
              <p className="t-mono text-right text-xs">
                N° MCI-2026-00042
                <br />
                <span className="text-ink/60">EXEMPLE</span>
              </p>
            </div>
            <dl className="t-mono mt-6 grid grid-cols-[130px_1fr] gap-y-3 text-xs sm:text-sm">
              <dt className="text-ink/60">ÉTABLISSEMENT</dt>
              <dd className="dotted-line pb-1">
                <span data-type className="inline-block whitespace-nowrap">
                  Services techniques
                </span>
              </dd>
              <dt className="text-ink/60">N° ENGAGEMENT</dt>
              <dd className="dotted-line pb-1">
                <span data-type className="inline-block whitespace-nowrap">
                  ENG-2026-0412
                </span>
              </dd>
            </dl>
            <table className="t-mono mt-8 w-full text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-ink text-left text-ink/60">
                  <th className="py-2 font-normal">RÉF.</th>
                  <th className="py-2 font-normal">DÉSIGNATION</th>
                  <th className="py-2 text-right font-normal">QTÉ</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((l) => (
                  <tr key={l.ref} className="dotted-line">
                    <td className="py-3 pr-2 align-bottom">
                      <span data-type className="inline-block whitespace-nowrap font-medium text-mci">
                        {l.ref}
                      </span>
                    </td>
                    <td className="py-3 pr-2 align-bottom">
                      <span data-type className="inline-block">
                        {l.text}
                      </span>
                    </td>
                    <td className="py-3 text-right align-bottom">
                      <span data-type className="inline-block whitespace-nowrap">
                        {l.qty}
                      </span>
                    </td>
                  </tr>
                ))}
                <tr className="dotted-line">
                  <td className="py-3">&nbsp;</td>
                  <td />
                  <td />
                </tr>
              </tbody>
            </table>
            <div className="mt-8 flex items-end justify-between">
              <p className="t-mono text-[11px] text-ink/60">
                PRIX ET DÉLAI
                <br />
                CONFIRMÉS PAR MCI
              </p>
              <div data-stamp className="rounded-tech border-[3px] border-action px-4 py-2 text-action" style={{ transform: "rotate(-12deg)" }}>
                <span className="font-display text-2xl font-black tracking-[0.12em]" style={{ fontVariationSettings: '"wdth" 125' }}>
                  VALIDÉ
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
