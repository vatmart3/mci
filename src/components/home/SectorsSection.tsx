"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { SectorSlug, SectorGroup } from "@/lib/types";
import { sectors, sectorGroups } from "@/data/sectors";
import { ProductVisual } from "@/components/catalog/ProductVisual";
import { Icon } from "@/components/ui/Icon";
import type { MiniProduct } from "./showcase-data";
import { cx } from "@/lib/cx";

const tint: Record<SectorGroup, { bg: string; blob: string; ink: string }> = {
  administrations: { bg: "#eaf3fa", blob: "#bcdcf2", ink: "text-mci" },
  industries: { bg: "#f1f2f4", blob: "#d7dce2", ink: "text-ink" },
  loisirs: { bg: "#fff2e7", blob: "#ffd4b0", ink: "text-[#b25a12]" },
};

/**
 * Secteurs : carrousel horizontal de grandes cartes arrondies (défilement natif, aimanté),
 * flèches sur ordinateur. Chaque carte : le problème du métier et trois produits de sa sélection.
 */
export function SectorsSection({ selections }: { selections: Record<SectorSlug, MiniProduct[]> }) {
  const row = useRef<HTMLUListElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  const update = useCallback(() => {
    const el = row.current;
    if (!el) return;
    setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth > el.scrollWidth - 8 });
  }, []);
  useEffect(() => {
    update();
    const el = row.current;
    el?.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el?.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  const go = (dir: 1 | -1) => {
    const el = row.current;
    if (!el) return;
    const card = el.querySelector("li");
    const step = card ? card.getBoundingClientRect().width + 20 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };

  return (
    <section id="secteurs" aria-labelledby="secteurs-title" className="scroll-mt-16 overflow-hidden py-24 lg:py-32">
      <div className="wrap flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div data-reveal>
          <p className="t-eyebrow">Secteurs</p>
          <h2 id="secteurs-title" className="t-h1 mt-3 max-w-[16ch]">
            Neuf métiers. Neuf sélections.
          </h2>
          <p className="t-lead mt-4 max-w-[44ch] text-ink/70">Chaque secteur a ses surfaces, ses salissures et ses contraintes d&apos;achat.</p>
        </div>
        <div className="hidden gap-3 md:flex">
          <button type="button" onClick={() => go(-1)} disabled={edge.start} className="grid size-11 place-items-center rounded-full bg-salt text-ink transition-colors hover:bg-rule disabled:opacity-40" aria-label="Secteurs précédents">
            <Icon name="chevronRight" size={20} className="rotate-180" />
          </button>
          <button type="button" onClick={() => go(1)} disabled={edge.end} className="grid size-11 place-items-center rounded-full bg-salt text-ink transition-colors hover:bg-rule disabled:opacity-40" aria-label="Secteurs suivants">
            <Icon name="chevronRight" size={20} />
          </button>
        </div>
      </div>

      <ul ref={row} className="snap-row mt-12 gap-5 px-[var(--margin)] pb-8 [scroll-padding-inline:var(--margin)] xl:px-[max(var(--margin),calc((100vw-1280px)/2))] xl:[scroll-padding-inline:max(var(--margin),calc((100vw-1280px)/2))]">
        {sectors.map((s, i) => {
          const t = tint[s.group];
          const picks = (selections[s.slug] ?? []).slice(0, 3);
          return (
            <li key={s.slug} data-reveal style={{ "--reveal-delay": `${Math.min(i, 4) * 70}ms` } as React.CSSProperties} className="w-[min(82vw,360px)] shrink-0">
              <Link href={`/secteurs/${s.slug}`} className="tile tile-hover group flex h-[520px] flex-col p-8" style={{ background: t.bg }}>
                <span aria-hidden="true" className="absolute -right-16 -top-16 -z-10 size-64 animate-drift rounded-full opacity-70 blur-3xl" style={{ background: t.blob, animationDelay: `${i * -3}s` }} />
                <span className={cx("text-sm font-semibold", t.ink)}>{sectorGroups[s.group]}</span>
                <span className="t-h2 mt-2">{s.name}</span>
                <span className="mt-4 line-clamp-4 text-ink/70">{s.problem}</span>
                <span className="relative mt-auto flex h-40 items-end justify-center">
                  {picks.map((p, k) => (
                    <span key={p.slug} className="-mx-3 w-[38%] transition-transform duration-700 ease-out group-hover:-translate-y-2" style={{ transform: `rotate(${[-7, 0, 7][k]}deg) translateY(${k === 1 ? -8 : 0}px)`, transitionDelay: `${k * 50}ms`, zIndex: k === 1 ? 2 : 1 }}>
                      <ProductVisual product={p} size={180} sizes="140px" alt="" className="h-auto w-full drop-shadow-[0_16px_16px_rgb(10_34_51/0.18)]" />
                    </span>
                  ))}
                  <span className="absolute bottom-0 right-0 grid size-10 place-items-center rounded-full bg-ink text-white transition-transform duration-300 group-hover:scale-110" aria-hidden="true">
                    <Icon name="plus" size={18} />
                  </span>
                </span>
                <span className="sr-only">Voir la sélection {s.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
