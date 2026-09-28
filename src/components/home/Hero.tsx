"use client";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { ProductVisual } from "@/components/catalog/ProductVisual";
import { ShaderBackground } from "@/components/fx/ShaderBackground";
import { webglSupport, prefersReducedMotion, whenWebGLAllowed } from "@/lib/webgl";
import { useScrollProgress } from "@/lib/hooks/useScrollProgress";
import { showcaseItem, type MiniProduct } from "./showcase-data";

const HeroScene = dynamic(() => import("@/components/three/HeroScene").then((m) => m.HeroScene), { ssr: false });

/** Repli statique : les packshots en arc, mêmes places que la scène 3D. */
function StaticArc({ products }: { products: { p: MiniProduct }[] }) {
  const n = products.length;
  return (
    <div className="absolute inset-x-0 bottom-[6%] flex items-end justify-center" aria-hidden="true">
      {products.map(({ p }, i) => {
        const k = n === 1 ? 0 : i / (n - 1) - 0.5;
        const w = 22 - Math.abs(k) * 12;
        return (
          <div key={p.slug} className={i === 0 || i === n - 1 ? "max-sm:hidden" : undefined} style={{ width: `${w}%`, maxWidth: 260, marginInline: "-1.5%", transform: `translateY(${Math.abs(k) * -24}%)`, zIndex: 10 - Math.round(Math.abs(k) * 10) }}>
            <ProductVisual product={p} size={320} sizes="22vw" alt="" className="h-auto w-full drop-shadow-[0_24px_24px_rgb(10_34_51/0.18)]" priority={i === Math.floor(n / 2)} />
          </div>
        );
      })}
    </div>
  );
}

export function Hero({ products, stats }: { products: { p: MiniProduct; pack?: string }[]; stats: { references: number; families: number; withSheet: number } }) {
  const [support, setSupport] = useState<"full" | "lite" | "none" | null>(null);
  const [reduced, setReduced] = useState(false);
  const [inView, setInView] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [ready3d, setReady3d] = useState(false);
  const track = useRef<HTMLElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const progress = useScrollProgress(track, {
    onChange: (p) => copy.current?.style.setProperty("--p", String(p)),
  });

  useEffect(() => {
    const s = webglSupport();
    setSupport(s);
    setReduced(prefersReducedMotion());
    const stop = s === "none" ? () => undefined : whenWebGLAllowed(s, () => setAllowed(true));
    const io = new IntersectionObserver(([e]) => setInView(!!e?.isIntersecting));
    if (track.current) io.observe(track.current);
    return () => {
      io.disconnect();
      stop();
    };
  }, []);

  const items = useMemo(() => {
    const list = products.map(({ p, pack }) => showcaseItem(p, pack));
    return support === "lite" ? list.slice(1, 4) : list;
  }, [products, support]);
  const statics = support === "lite" ? products.slice(1, 4) : products;

  return (
    <section ref={track} aria-labelledby="hero-title" className="relative h-[165svh]">
      <div className="sticky top-0 isolate h-svh min-h-[640px] overflow-hidden">
        <ShaderBackground variant="aurora" />

        <div
          ref={copy}
          className="wrap relative z-10 flex flex-col items-center pt-[9svh] text-center will-change-transform lg:pt-[10svh]"
          style={{ opacity: "calc(1 - var(--p, 0) * 2.4)", transform: "translate3d(0, calc(var(--p, 0) * -120px), 0) scale(calc(1 - var(--p, 0) * 0.1))" }}
        >
          <p className="t-eyebrow animate-rise">Nettoyants techniques professionnels · Sète</p>
          <h1 id="hero-title" className="t-display mt-4 max-w-[14ch] animate-rise [animation-delay:80ms]" style={{ fontSize: "clamp(2.75rem, 1rem + 6vw, 7rem)" }}>
            Le produit juste <span className="t-sheen">pour chaque surface.</span>
          </h1>
          <p className="t-lead mt-6 max-w-[40ch] animate-rise text-ink/70 [animation-delay:160ms]">
            Nettoyants, désinfectants et traitements de maintenance pour collectivités, industries et loisirs.
          </p>
          <div className="mt-8 flex animate-rise flex-wrap items-center justify-center gap-4 [animation-delay:240ms]">
            <ButtonLink href="/catalogue" variant="action" size="lg">
              Ouvrir le catalogue
            </ButtonLink>
            <ButtonLink href="/commande-rapide" variant="outline" size="lg">
              Commande rapide
            </ButtonLink>
          </div>
          <p className="mt-6 animate-rise text-sm text-ink/70 [animation-delay:320ms]">
            {stats.references} références · {stats.families} familles · {stats.withSheet} fiches techniques en ligne
          </p>
        </div>

        {/* La gamme : packshots immédiats, relayés par la 3D dès qu'elle est prête */}
        <div className="absolute inset-x-0 bottom-0 h-[44%] sm:h-[46%]">
          <div className={`absolute inset-0 transition-opacity duration-700 ${ready3d ? "opacity-0" : "opacity-100"}`}>
            <StaticArc products={statics} />
          </div>
          {allowed && (support === "full" || support === "lite") ? (
            <HeroScene items={items} progress={progress} still={reduced} active={inView} className="absolute inset-0" onReady={() => setReady3d(true)} />
          ) : null}
        </div>

        <a href="#histoire" className="absolute bottom-6 left-1/2 z-10 grid size-11 -translate-x-1/2 place-items-center rounded-full bg-white/70 text-ink shadow-sheet ring-1 ring-black/5 transition-transform hover:translate-y-1" aria-label="Découvrir la gamme">
          <Icon name="arrowDown" size={18} />
        </a>
      </div>
    </section>
  );
}
