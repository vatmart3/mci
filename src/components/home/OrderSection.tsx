"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { LogoMark } from "@/components/brand/Logo";

const lines = [
  { ref: "DG90", text: "Dégraissant graisses cuites", qty: "2 × 5 L" },
  { ref: "KERMEX", text: "Anti-mousses et algues", qty: "1 × 20 L" },
  { ref: "SANIKEL R.", text: "Détartrant sanitaires", qty: "4 × 5 L" },
];

const steps = [
  { t: "Choisissez", d: "Vos produits et leurs conditionnements, depuis le catalogue ou par référence." },
  { t: "Précisez", d: "Votre n° de bon de commande interne, ou d'engagement pour les collectivités." },
  { t: "MCI confirme", d: "Disponibilité, prix et délai, avant toute préparation." },
  { t: "Retrouvez tout", d: "Bons de livraison et factures dans votre espace pro." },
];

/**
 * Commander, concrètement : les étapes s'allument une à une pendant que le bon de commande
 * (carte arrondie) se remplit au défilement, jusqu'à la pastille « Confirmée ». Mouvement réduit : bon déjà rempli.
 */
export function OrderSection() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!root.current) return;
    if (reduce) return;
    let ctx: { revert: () => void } | null = null;
    let cancelled = false;
    void Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([{ gsap }, { ScrollTrigger }]) => {
      if (cancelled || !root.current) return;
      gsap.registerPlugin(ScrollTrigger);
      ctx = gsap.context(() => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: "[data-sheet]", start: "top 80%", end: "bottom 50%", scrub: 0.6 } });
        const stepsEl = gsap.utils.toArray<HTMLElement>("[data-step] [data-dot]");
        const on = { backgroundColor: "#1f6a99", color: "#ffffff", scale: 1.08, duration: 0.2 };
        tl.to(stepsEl[0]!, on);
        gsap.utils.toArray<HTMLElement>("[data-line]").forEach((el, i) => {
          tl.fromTo(el, { opacity: 0, y: 16, filter: "blur(6px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.5, ease: "power2.out" });
          if (i === 1) tl.to(stepsEl[1]!, on, "<");
        });
        tl.to(stepsEl[2]!, on);
        tl.fromTo("[data-stamp]", { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, ease: "back.out(2.2)", duration: 0.5 }, "<");
        tl.to(stepsEl[3]!, on);
      }, root);
    });
    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  return (
    <section ref={root} aria-labelledby="commander-title" className="bg-salt py-24 lg:py-32">
      <div className="wrap grid grid-cols-1 items-center gap-16 lg:grid-cols-2 [&>*]:min-w-0">
        <div>
          <div data-reveal>
            <p className="t-eyebrow">Commander</p>
            <h2 id="commander-title" className="t-h1 mt-3 max-w-[14ch]">
              Commander, concrètement.
            </h2>
          </div>
          <ol className="mt-10 space-y-6">
            {steps.map((s, i) => (
              <li key={s.t} data-step className="flex gap-5">
                <span data-dot className="t-num grid size-12 shrink-0 place-items-center rounded-full bg-white text-lg text-mci shadow-sheet">{i + 1}</span>
                <span>
                  <span className="t-label block">{s.t}</span>
                  <span className="mt-1 block text-ink/70">{s.d}</span>
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-8 max-w-[48ch] text-sm text-ink/70">Pas de paiement en ligne : virement, facture à échéance ou mandat administratif. Facturation Chorus Pro pour les entités publiques.</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
            <ButtonLink href="/espace-pro?creer=1" variant="primary" size="lg">
              Créer mon compte pro
            </ButtonLink>
            <Link href="/catalogue" className="text-md font-medium text-mci hover:underline">
              Commander sans compte ›
            </Link>
          </div>
        </div>

        <div data-sheet className="relative">
          <span aria-hidden="true" className="absolute inset-x-8 -bottom-6 top-8 -z-10 rounded-tile bg-mci/10 blur-2xl" />
          <div className="mx-auto max-w-[560px] rounded-tile bg-white p-6 shadow-float ring-1 ring-black/5 sm:p-10" aria-label="Exemple de bon de commande rempli" role="img">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <LogoMark size={36} />
                <div>
                  <p className="font-semibold leading-none">Bon de commande</p>
                  <p className="mt-1 text-xs text-ink/70">MCI Sète · exemple</p>
                </div>
              </div>
              <p className="t-mono rounded-full bg-salt px-3 py-1 text-xs text-ink/70">MCI-2026-00042</p>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-tech bg-salt px-4 py-3">
                <p className="text-xs text-ink/70">Établissement</p>
                <p className="mt-1 truncate font-medium">Services techniques</p>
              </div>
              <div className="rounded-tech bg-salt px-4 py-3">
                <p className="text-xs text-ink/70">N° d&apos;engagement</p>
                <p className="t-mono mt-1 truncate font-medium">ENG-2026-0412</p>
              </div>
            </div>
            <ul className="mt-6 space-y-2">
              {lines.map((l) => (
                <li key={l.ref} data-line className="flex items-center gap-4 rounded-tech px-2 py-3 ring-1 ring-black/5">
                  <span className="t-code w-24 shrink-0 text-sm text-mci">{l.ref}</span>
                  <span className="min-w-0 flex-1 truncate text-sm">{l.text}</span>
                  <span className="t-mono shrink-0 text-sm text-ink/70">{l.qty}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
              <p className="text-xs text-ink/70">Prix et délai confirmés par MCI</p>
              <span data-stamp className="inline-flex items-center gap-2 rounded-full bg-ok/12 px-4 py-2 text-sm font-semibold text-ok">
                <Icon name="check" size={18} /> Commande confirmée
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
