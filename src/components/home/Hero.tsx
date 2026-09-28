"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Ruler } from "@/components/ui/Ruler";
import { ProductVisual } from "@/components/catalog/ProductVisual";
import { webglSupport, prefersReducedMotion } from "@/lib/webgl";
import { showcaseItem, type MiniProduct } from "./showcase-data";
import { GlassFog } from "./GlassFog";

const FloatingShowcase = dynamic(() => import("@/components/three/FloatingShowcase").then((m) => m.FloatingShowcase), { ssr: false });

/** Repli statique (sans WebGL / appareil faible) : packshots composés à la main. */
function StaticStage({ products }: { products: { p: MiniProduct; pack?: string }[] }) {
  const spots = [
    "left-[52%] top-[10%] w-[20%] rotate-[-6deg]",
    "left-[70%] top-[4%] w-[16%] rotate-[8deg]",
    "left-[80%] top-[34%] w-[18%] rotate-[-4deg]",
    "left-[58%] top-[40%] w-[22%] rotate-[3deg]",
    "left-[44%] top-[36%] w-[14%] rotate-[-10deg]",
  ];
  return (
    <div className="absolute inset-0" aria-hidden="true">
      {products.slice(0, 5).map(({ p }, i) => (
        <div key={p.slug} className={`absolute ${spots[i]} max-md:hidden`}>
          <ProductVisual product={p} size={320} sizes="22vw" alt="" className="h-auto w-full" priority={i < 2} />
        </div>
      ))}
      <div className="absolute inset-x-0 top-[4%] flex justify-center gap-2 md:hidden">
        {products.slice(0, 3).map(({ p }) => (
          <ProductVisual key={p.slug} product={p} size={140} alt="" priority />
        ))}
      </div>
    </div>
  );
}

export function Hero({ products, stats }: { products: { p: MiniProduct; pack?: string }[]; stats: { references: number; families: number; withSheet: number } }) {
  const [support, setSupport] = useState<"full" | "lite" | "none" | null>(null);
  const [reduced, setReduced] = useState(false);
  const [inView, setInView] = useState(true);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    setSupport(webglSupport());
    setReduced(prefersReducedMotion());
    const io = new IntersectionObserver(([e]) => setInView(!!e?.isIntersecting), { rootMargin: "0px" });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  const items = useMemo(() => {
    const list = products.map(({ p, pack }) => showcaseItem(p, pack));
    return support === "lite" ? list.slice(0, 3) : list;
  }, [products, support]);

  return (
    <section ref={ref} aria-labelledby="hero-title" className="relative isolate h-[calc(100svh-56px)] min-h-[620px] overflow-hidden lg:h-[calc(100svh-72px)] lg:max-h-[1000px]">
      {/* Filet d'horizon du port */}
      <div aria-hidden="true" className="absolute inset-x-0 top-[30%] -z-10 border-t border-rule">
        <span className="t-mono absolute right-[var(--margin)] top-2 text-[11px] text-ink/50">43°24′ N · 3°41′ E — SÈTE</span>
      </div>

      {/* Scène 3D derrière la vitre (décorative) */}
      <div className="absolute inset-0 -z-10">
        {support === "full" || support === "lite" ? (
          <FloatingShowcase items={items} still={reduced} active={inView} className="absolute inset-0" />
        ) : support === "none" ? (
          <StaticStage products={products} />
        ) : null}
      </div>

      {/* La vitre */}
      <GlassFog className="absolute inset-0 z-0 h-full w-full" />

      {/* Texte : visible immédiatement, au-dessus de la vitre */}
      <div className="wrap pointer-events-none relative z-10 flex h-full flex-col justify-end pb-6">
        <div className="grid-12">
          <div className="pointer-events-auto col-span-12 md:col-span-10 lg:col-span-8">
            <h1 id="hero-title" className="t-display" style={{ fontSize: "clamp(2.75rem, 0.9rem + 5.4vw, 6.5rem)" }}>
              Le produit juste pour chaque surface.
            </h1>
            <p className="t-lead mt-6 max-w-[46ch] text-ink/85">
              Nettoyants techniques, désinfectants et traitements de maintenance pour collectivités, industries et loisirs. Livrés depuis Sète.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
              <ButtonLink href="/catalogue" variant="action" size="lg">
                Ouvrir le catalogue
                <Icon name="arrow" />
              </ButtonLink>
              <Link href="/commande-rapide" className="link-u font-semibold">
                Commande rapide par référence →
              </Link>
            </div>
          </div>
        </div>
        <Ruler
          className="pointer-events-auto mt-12 border-t border-ink/20 pt-3"
          items={["MCI SÈTE", "DEPUIS 2015", `${stats.references} RÉFÉRENCES`, `${stats.families} FAMILLES`, `${stats.withSheet} FT DISPONIBLES`]}
        />
      </div>
    </section>
  );
}
