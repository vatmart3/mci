"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { SectionHead } from "@/components/ui/SectionHead";
import { company } from "@/data/company";
import { buttonClass } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { SeteMap } from "./SeteMap";

/** 05 — L'équipe, à Sète : photo révélée au scroll (clip-path qui s'ouvre verticalement). */
export function TeamSection({ photo }: { photo: string }) {
  const frame = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.style.clipPath = "inset(0 0 100% 0)";
    let ctx: { revert: () => void } | null = null;
    let cancelled = false;
    void Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([{ gsap }, { ScrollTrigger }]) => {
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      ctx = gsap.context(() => {
        gsap.fromTo(el, { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "none", scrollTrigger: { trigger: el, start: "top 85%", end: "top 30%", scrub: 0.4 } });
        gsap.fromTo(el.querySelector("img"), { scale: 1.12 }, { scale: 1, ease: "none", scrollTrigger: { trigger: el, start: "top 85%", end: "bottom top", scrub: 0.4 } });
      });
    });
    return () => {
      cancelled = true;
      ctx?.revert();
      el.style.clipPath = "";
    };
  }, []);

  return (
    <section aria-labelledby="equipe-title" className="wrap mt-24 lg:mt-32">
      <SectionHead index="05" kicker="L'équipe, à Sète" id="equipe-title" title="Des interlocuteurs qui connaissent les produits." />
      <div ref={frame} className={`relative mt-12 w-full overflow-hidden bg-white tech-grid ${failed ? "aspect-[16/5]" : "aspect-[16/9]"}`}>
        {failed ? (
          <div className="absolute inset-0 grid place-items-center p-8 text-center">
            <p className="t-mono text-sm text-ink/60">PHOTO DE L&apos;ÉQUIPE MCI — {company.city.toUpperCase()}</p>
          </div>
        ) : (
          <Image src={photo} alt="L'équipe MCI dans ses locaux du Parc Aquatechnique, à Sète" fill sizes="(max-width: 1440px) 100vw, 1440px" className="object-cover" onError={() => setFailed(true)} />
        )}
      </div>
      <div className="grid-12 mt-12 gap-y-10">
        <div className="col-span-12 lg:col-span-5">
          <p className="t-lead">
            MCI a été créée à Sète en {company.founded}. Au téléphone, vous avez un interlocuteur sur place, qui connaît le catalogue et vous oriente vers le produit adapté à votre surface.
          </p>
          <address className="mt-8 not-italic">
            <span className="t-mono block text-xs text-ink/60">ADRESSE</span>
            <span className="mt-2 block text-md">
              {company.street}
              <br />
              {company.postalCode} {company.city}
            </span>
          </address>
          <div className="mt-6 flex flex-wrap gap-4">
            <a href={company.mapsUrl} target="_blank" rel="noopener noreferrer" className={buttonClass("outline", "md")}>
              <Icon name="pin" size={18} /> Itinéraire
            </a>
            <a href={`tel:${company.phoneE164}`} className={buttonClass("primary", "md")}>
              <Icon name="phone" size={18} /> {company.phone}
            </a>
          </div>
        </div>
        <div className="col-span-12 lg:col-span-6 lg:col-start-7">
          <SeteMap />
        </div>
      </div>
    </section>
  );
}
