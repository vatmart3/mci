"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import type { SectorSlug } from "@/lib/types";
import { sectors, sectorGroups } from "@/data/sectors";
import { SectionHead } from "@/components/ui/SectionHead";
import { ProductVisual } from "@/components/catalog/ProductVisual";
import { Icon } from "@/components/ui/Icon";
import { webglSupport, prefersReducedMotion } from "@/lib/webgl";
import { showcaseItem, type MiniProduct } from "./showcase-data";
import { cx } from "@/lib/cx";

const FloatingShowcase = dynamic(() => import("@/components/three/FloatingShowcase").then((m) => m.FloatingShowcase), { ssr: false });

/**
 * 01 — Secteurs : liste typographique. Au survol / focus (ou au premier tap sur mobile),
 * la ligne s'étire (axe wdth 100 → 125) et la scène 3D montre la sélection du secteur.
 */
export function SectorsSection({ selections }: { selections: Record<SectorSlug, MiniProduct[]> }) {
  const [active, setActive] = useState<SectorSlug>("mairies");
  const [support, setSupport] = useState<"full" | "lite" | "none" | null>(null);
  const [reduced, setReduced] = useState(false);
  const [inView, setInView] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const pointerType = useRef<string>("mouse");

  useEffect(() => {
    setSupport(webglSupport());
    setReduced(prefersReducedMotion());
    const io = new IntersectionObserver(([e]) => setInView(!!e?.isIntersecting), { rootMargin: "100px 0px" });
    if (stage.current) io.observe(stage.current);
    return () => io.disconnect();
  }, []);

  const items = useMemo(() => (selections[active] ?? []).slice(0, 5).map((p) => showcaseItem(p)), [active, selections]);
  const current = selections[active] ?? [];

  return (
    <section id="secteurs" aria-labelledby="secteurs-title" className="wrap scroll-mt-24 pt-24 lg:pt-32">
      <SectionHead index="01" kicker="Secteurs" id="secteurs-title" title="Pour qui ? Neuf métiers, neuf sélections.">
        Administrations, industries, loisirs : chaque secteur a ses surfaces, ses salissures et ses contraintes. Survolez un métier pour voir ce que MCI lui propose.
      </SectionHead>

      <div className="grid-12 mt-12 gap-y-8">
        <ul className="col-span-12 border-t border-ink lg:col-span-7" onPointerDown={(e) => (pointerType.current = e.pointerType)}>
          {sectors.map((s) => {
            const on = s.slug === active;
            return (
              <li key={s.slug} className="border-b border-rule">
                <Link
                  href={`/secteurs/${s.slug}`}
                  onMouseEnter={() => setActive(s.slug)}
                  onFocus={() => setActive(s.slug)}
                  onClick={(e) => {
                    // mobile : premier tap = sélection, second tap = page secteur
                    if (pointerType.current === "touch" && !on) {
                      e.preventDefault();
                      setActive(s.slug);
                    }
                  }}
                  aria-describedby={`sector-group-${s.slug}`}
                  className="group grid grid-cols-[40px_1fr_auto] items-baseline gap-4 py-3 lg:py-4"
                >
                  <span className="t-mono text-xs text-ink/60">{String(s.position).padStart(2, "0")}</span>
                  <span
                    className={cx("font-display font-extrabold leading-[0.95] tracking-tight transition-[font-variation-settings,color] duration-500 ease-out", on ? "text-mci" : "text-ink")}
                    style={{ fontSize: "clamp(1.75rem, 0.8rem + 2.9vw, 3.75rem)", fontVariationSettings: `"wdth" ${on ? 125 : 100}` }}
                  >
                    {s.name}
                  </span>
                  <span id={`sector-group-${s.slug}`} className={cx("t-mono flex items-center gap-2 text-xs transition-opacity duration-300", on ? "opacity-100" : "opacity-40 group-hover:opacity-100")}>
                    <span className="hidden sm:inline">{sectorGroups[s.group].toUpperCase()}</span>
                    <Icon name="arrow" size={18} className={cx("transition-transform duration-300", on && "translate-x-1")} />
                  </span>
                </Link>
                {/* Mobile : la sélection s'affiche sous la ligne */}
                {on ? (
                  <div className="pb-4 lg:hidden">
                    <ul className="snap-row gap-3 pb-2">
                      {current.slice(0, 6).map((p) => (
                        <li key={p.slug} className="w-28 shrink-0 text-center">
                          <ProductVisual product={p} size={112} alt="" />
                          <span className="t-code mt-1 block truncate text-xs text-mci">{p.code}</span>
                        </li>
                      ))}
                    </ul>
                    <Link href={`/secteurs/${s.slug}`} className="link-u mt-2 inline-block text-sm font-semibold">
                      Voir la sélection {s.name.toLowerCase()} →
                    </Link>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>

        <div className="col-span-12 hidden lg:col-span-5 lg:block">
          <div ref={stage} className="sticky top-24">
            <div className="crop relative aspect-[4/5] border border-rule bg-white tech-grid" aria-hidden="true">
              {support && support !== "none" && inView ? (
                <FloatingShowcase items={items} layout="panel" still={reduced} active={inView} className="absolute inset-0" />
              ) : (
                <div className="absolute inset-0 grid grid-cols-2 place-items-center p-8">
                  {current.slice(0, 4).map((p) => (
                    <ProductVisual key={p.slug} product={p} size={180} alt="" />
                  ))}
                </div>
              )}
              <p className="t-mono absolute left-4 top-3 text-xs text-ink/60">SÉLECTION · {sectors.find((s) => s.slug === active)?.name.toUpperCase()}</p>
            </div>
            <p className="t-mono mt-3 text-xs text-ink/70" aria-live="polite">
              {current.map((p) => p.code).join(" · ")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
