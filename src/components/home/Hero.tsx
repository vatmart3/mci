"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Ruler } from "@/components/ui/Ruler";
import { ProductVisual } from "@/components/catalog/ProductVisual";
import { webglSupport, prefersReducedMotion, whenWebGLAllowed } from "@/lib/webgl";
import { showcaseItem, type MiniProduct } from "./showcase-data";
import { GlassFog } from "./GlassFog";

const FloatingShowcase = dynamic(() => import("@/components/three/FloatingShowcase").then((m) => m.FloatingShowcase), { ssr: false });

/** Repli statique (sans WebGL / appareil faible) : packshots composés à la main. */
function StaticStage({ products }: { products: { p: MiniProduct; pack?: string }[] }) {
  // mêmes emplacements que la scène 3D (FloatingShowcase) pour un relais sans saut
  const spots: [number, number, number][] = [
    [0.6, 0.2, 11],
    [0.79, 0.15, 9],
    [0.93, 0.34, 10],
    [0.74, 0.42, 12],
    [0.89, 0.6, 11],
  ];
  return (
    <div className="absolute inset-0" aria-hidden="true">
      {products.slice(0, 5).map(({ p }, i) => {
        const [x, y, w] = spots[i]!;
        return (
          <div key={p.slug} className="absolute max-md:hidden" style={{ left: `${x * 100 - w / 2}%`, top: `${y * 100}%`, width: `${w}%`, transform: `translateY(-50%) rotate(${[-6, 8, -4, 3, -9][i]}deg)` }}>
            <ProductVisual product={p} size={320} sizes="12vw" alt="" className="h-auto w-full" priority={i < 2} />
          </div>
        );
      })}
      <div className="absolute inset-x-0 top-[3%] flex justify-center gap-2 md:hidden">
        {products.slice(0, 3).map(({ p }) => (
          <ProductVisual key={p.slug} product={p} size={120} alt="" priority />
        ))}
      </div>
    </div>
  );
}

export function Hero({ products, stats }: { products: { p: MiniProduct; pack?: string }[]; stats: { references: number; families: number; withSheet: number } }) {
  const [support, setSupport] = useState<"full" | "lite" | "none" | null>(null);
  const [reduced, setReduced] = useState(false);
  const [inView, setInView] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [ready3d, setReady3d] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const s = webglSupport();
    setSupport(s);
    setReduced(prefersReducedMotion());
    const stop = s === "none" ? () => undefined : whenWebGLAllowed(s, () => setAllowed(true));
    const io = new IntersectionObserver(([e]) => setInView(!!e?.isIntersecting), { rootMargin: "0px" });
    if (ref.current) io.observe(ref.current);
    return () => {
      io.disconnect();
      stop();
    };
  }, []);

  const items = useMemo(() => {
    const list = products.map(({ p, pack }) => showcaseItem(p, pack));
    return support === "lite" ? list.slice(0, 3) : list;
  }, [products, support]);

  return (
    <section ref={ref} aria-labelledby="hero-title" className="relative isolate h-[calc(100svh-56px)] min-h-[620px] overflow-hidden lg:h-[calc(100svh-72px)] lg:max-h-[1000px]">
      {/* Filet d'horizon du port */}
      <div aria-hidden="true" className="absolute inset-x-0 top-[30%] -z-10 border-t border-rule">
        <span className="t-mono absolute right-[var(--margin)] top-2 hidden text-[11px] text-ink/70 md:block">43°24′ N · 3°41′ E — SÈTE</span>
      </div>

      {/* Scène 3D derrière la vitre (décorative) */}
      <div className="absolute inset-0 -z-10">
        {/* packshots statiques : immédiats, remplacés par la 3D dès qu'elle est prête */}
        <div className={`absolute inset-0 transition-opacity duration-500 ${ready3d ? "opacity-0" : "opacity-100"}`}>
          <StaticStage products={products} />
        </div>
        {allowed && (support === "full" || support === "lite") ? (
          <FloatingShowcase items={items} still={reduced} active={inView} className="absolute inset-0" onReady={() => setReady3d(true)} />
        ) : null}
      </div>

      {/* La vitre */}
      <GlassFog className="absolute inset-0 z-0 h-full w-full" />

      {/* Texte : visible immédiatement, au-dessus de la vitre */}
      <div className="wrap pointer-events-none relative z-10 flex h-full flex-col justify-end pb-20 lg:pb-6">
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
