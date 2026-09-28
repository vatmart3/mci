"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { FamilySlug } from "@/lib/types";
import { SectionHead } from "@/components/ui/SectionHead";
import { ProductVisual } from "@/components/catalog/ProductVisual";
import { AddToCartButton } from "@/components/cart/AddToCart";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { MiniProduct } from "./showcase-data";

export interface ShelfGroup {
  slug: FamilySlug;
  name: string;
  code: string;
  count: number;
  products: MiniProduct[];
}

function Item({ p }: { p: MiniProduct }) {
  return (
    <li data-product-row className="shelf-item relative flex w-[200px] shrink-0 flex-col sm:w-[220px]">
      <Link href={`/produit/${p.slug}`} className="shelf-pack block px-4" tabIndex={-1} aria-hidden="true">
        <ProductVisual product={p} size={180} alt="" className="mx-auto h-[180px] w-auto" />
      </Link>
      {/* planche de l'étagère */}
      <div aria-hidden="true" className="h-2 border-y border-ink/60 bg-white" />
      <div className="flex min-h-[64px] items-start justify-between gap-2 px-3 pt-3">
        <div className="min-w-0">
          <Link href={`/produit/${p.slug}`} className="t-code block truncate text-sm text-mci hover:underline">
            {p.code}
          </Link>
          <p className="line-clamp-2 text-sm leading-snug text-ink/80">{p.short}</p>
        </div>
        <AddToCartButton product={p} packagingId={p.packagings[0]!.id} size="sm" iconOnly />
      </div>
    </li>
  );
}

/**
 * 02 — Le rayon : un rayonnage d'atelier au trait, parcouru en scroll horizontal épinglé.
 * Les contenants se posent un par un, famille par famille. Mobile / mouvement réduit :
 * carrousel natif avec scroll-snap, sans épinglage.
 */
export function ShelfSection({ groups, total }: { groups: ShelfGroup[]; total: number }) {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setPinned(desktop && !reduce);
  }, []);

  useEffect(() => {
    if (!pinned || !section.current || !track.current) return;
    let ctx: { revert: () => void } | null = null;
    let cancelled = false;
    void Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([{ gsap }, { ScrollTrigger }]) => {
      if (cancelled || !section.current || !track.current) return;
      gsap.registerPlugin(ScrollTrigger);
      ctx = gsap.context(() => {
        const el = track.current!;
        const distance = () => el.scrollWidth - window.innerWidth + 64;
        const tween = gsap.to(el, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: section.current,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        });
        // chaque contenant se pose sur la planche quand il entre dans le cadre
        gsap.utils.toArray<HTMLElement>(".shelf-pack").forEach((pack) => {
          gsap.from(pack, {
            y: -90,
            rotate: -8,
            opacity: 0,
            duration: 0.6,
            ease: "back.out(1.6)",
            scrollTrigger: { trigger: pack, containerAnimation: tween, start: "left 92%", toggleActions: "play none none reverse" },
          });
        });
      }, section);
    });
    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [pinned]);

  return (
    <section ref={section} aria-labelledby="rayon-title" className="relative mt-24 overflow-hidden bg-salt lg:mt-32 lg:flex lg:h-svh lg:flex-col lg:justify-center">
      <div className="wrap">
        <SectionHead index="02" kicker="Le rayon" id="rayon-title" title="Le rayon, famille par famille.">
          {total} références rangées comme dans un atelier. Le « + » ajoute directement au bon de commande.
        </SectionHead>
      </div>

      <div className={pinned ? "mt-12" : "wrap mt-12"}>
        <div ref={track} className={pinned ? "flex w-max gap-16 pl-[var(--margin)] pr-16" : "snap-row gap-12 pb-6"}>
          {groups.map((g) => (
            <div key={g.slug} className="flex shrink-0 gap-6">
              {/* montant de l'étagère + étiquette de famille */}
              <div className="flex w-[180px] shrink-0 flex-col justify-end border-l border-ink/60 pl-4">
                <p className="t-mono text-xs text-ink/70">{g.code}</p>
                <p className="t-label mt-1">{g.name}</p>
                <Link href={`/catalogue/${g.slug}`} className="link-u mt-2 inline-flex items-center gap-1 text-sm">
                  {g.count} réf. <Icon name="arrow" size={14} />
                </Link>
                <div className="mt-12 h-2" />
                <div className="h-[60px]" />
              </div>
              <ul className="flex">
                {g.products.map((p) => (
                  <Item key={p.slug} p={p} />
                ))}
              </ul>
            </div>
          ))}
          <div className="flex w-[320px] shrink-0 flex-col justify-center gap-6 border-l border-ink/60 pl-8">
            <p className="t-h2">Tout le reste est au catalogue.</p>
            <ButtonLink href="/catalogue" variant="action" size="lg">
              Voir les {total} références
              <Icon name="arrow" />
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
