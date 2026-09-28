"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { company } from "@/data/company";
import { buttonClass } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

/** L'équipe, à Sète : grande photo arrondie qui s'agrandit jusqu'à pleine largeur au défilement. */
export function TeamSection({ photo }: { photo: string }) {
  const frame = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = frame.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let ctx: { revert: () => void } | null = null;
    let cancelled = false;
    void Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([{ gsap }, { ScrollTrigger }]) => {
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      ctx = gsap.context(() => {
        gsap.fromTo(el, { scale: 0.86, borderRadius: 48 }, { scale: 1, borderRadius: 32, ease: "none", scrollTrigger: { trigger: el, start: "top 95%", end: "top 25%", scrub: 0.5 } });
        const img = el.querySelector("img");
        if (img) gsap.fromTo(img, { scale: 1.15 }, { scale: 1, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.5 } });
      });
    });
    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  return (
    <section aria-labelledby="equipe-title" className="py-24 lg:py-32">
      <div className="wrap">
        <div data-reveal className="flex flex-col items-center text-center">
          <p className="t-eyebrow">L&apos;équipe, à Sète</p>
          <h2 id="equipe-title" className="t-h1 mt-3 max-w-[18ch]">
            Des interlocuteurs qui connaissent les produits.
          </h2>
        </div>
        <div ref={frame} className={`relative mt-12 w-full overflow-hidden rounded-tile bg-salt will-change-transform ${failed ? "aspect-[16/6]" : "aspect-[4/3] sm:aspect-[16/8]"}`}>
          {failed ? (
            <div className="absolute inset-0 grid place-items-center p-8 text-center">
              <p className="text-sm text-ink/70">Photo de l&apos;équipe MCI — {company.city}</p>
            </div>
          ) : (
            <Image src={photo} alt="L'équipe MCI dans ses locaux du Parc Aquatechnique, à Sète" fill sizes="(max-width: 1280px) 100vw, 1280px" className="object-cover" onError={() => setFailed(true)} />
          )}
        </div>
        <div className="mt-12 grid gap-8 lg:grid-cols-2 lg:items-end">
          <p data-reveal className="t-lead text-ink/70">
            MCI a été créée à Sète en {company.founded}. Au téléphone, vous avez un interlocuteur sur place, qui connaît le catalogue et vous oriente vers le produit adapté à votre surface.
          </p>
          <div data-reveal className="flex flex-wrap gap-3 lg:justify-end">
            <a href={`tel:${company.phoneE164}`} className={buttonClass("primary", "lg")}>
              <Icon name="phone" size={18} /> {company.phone}
            </a>
            <a href={company.mapsUrl} target="_blank" rel="noopener noreferrer" className={buttonClass("outline", "lg")}>
              <Icon name="pin" size={18} /> Itinéraire
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
