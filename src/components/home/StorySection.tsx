"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { ShaderBackground } from "@/components/fx/ShaderBackground";
import { ProductVisual } from "@/components/catalog/ProductVisual";
import { webglSupport, prefersReducedMotion, whenWebGLAllowed } from "@/lib/webgl";
import { useScrollProgress } from "@/lib/hooks/useScrollProgress";
import { showcaseItem, type MiniProduct } from "./showcase-data";
import { cx } from "@/lib/cx";

const StoryScene = dynamic(() => import("@/components/three/StoryScene").then((m) => m.StoryScene), { ssr: false });

export interface Chapter {
  verb: string;
  p: MiniProduct;
  pack?: string;
  usages: string[];
}

/**
 * « Un geste, le bon produit » : section épinglée sur fond nuit (caustiques animées).
 * Chaque cran de défilement fait tourner le contenant suivant au centre et change le chapitre.
 */
export function StorySection({ chapters }: { chapters: Chapter[] }) {
  const n = chapters.length;
  const track = useRef<HTMLElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const [idx, setIdx] = useState(0);
  const [support, setSupport] = useState<"full" | "lite" | "none" | null>(null);
  const [allowed, setAllowed] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [inView, setInView] = useState(false);
  const progress = useScrollProgress(track, {
    onChange: (p) => {
      setIdx(Math.min(n - 1, Math.floor(p * n)));
      bar.current?.style.setProperty("transform", `scaleX(${p})`);
    },
  });

  useEffect(() => {
    const s = webglSupport();
    setSupport(s);
    setReduced(prefersReducedMotion());
    const stop = s === "none" ? () => undefined : whenWebGLAllowed(s, () => setAllowed(true));
    const io = new IntersectionObserver(([e]) => setInView(!!e?.isIntersecting), { rootMargin: "200px 0px" });
    if (track.current) io.observe(track.current);
    return () => {
      io.disconnect();
      stop();
    };
  }, []);

  const items = useMemo(() => chapters.map((c) => showcaseItem(c.p, c.pack)), [chapters]);
  const use3d = allowed && (support === "full" || support === "lite");

  const jump = (i: number) => {
    const el = track.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const span = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + span * ((i + 0.5) / n), behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <section ref={track} id="histoire" aria-labelledby="histoire-title" className="relative bg-night text-white" style={{ height: `${n * 90 + 60}svh` }}>
      <div className="sticky top-0 isolate h-svh min-h-[600px] overflow-hidden">
        <ShaderBackground variant="night" />

        {/* Produit : 3D, ou packshot en fondu enchaîné */}
        <div className="absolute inset-0">
          {use3d ? (
            <StoryScene items={items} progress={progress} still={reduced} active={inView} className="absolute inset-0" />
          ) : (
            chapters.map((c, i) => (
              <div key={c.p.slug} className={cx("absolute inset-x-0 top-[12%] flex justify-center transition-[opacity,transform] duration-700 ease-out lg:left-1/2 lg:top-[18%]", i === idx ? "opacity-100" : "translate-y-8 opacity-0")}>
                <ProductVisual product={c.p} size={420} sizes="40vw" alt="" className="h-[38svh] w-auto drop-shadow-[0_40px_40px_rgb(0_0_0/0.5)] lg:h-[58svh]" />
              </div>
            ))
          )}
        </div>

        <div className="wrap pointer-events-none relative flex h-full flex-col justify-end pb-40 lg:justify-center lg:pb-0">
          <p className="t-eyebrow text-sky">Un geste, le bon produit</p>
          <h2 id="histoire-title" className="sr-only">
            Un geste, le bon produit
          </h2>
          <div className="relative mt-3 min-h-[280px] lg:min-h-[380px] lg:max-w-[560px]">
            {chapters.map((c, i) => (
              <div key={c.p.slug} aria-hidden={i !== idx} className={cx("absolute inset-x-0 top-0 transition-[opacity,transform,filter] duration-700 ease-out", i === idx ? "opacity-100" : i < idx ? "-translate-y-6 opacity-0 blur-sm" : "translate-y-6 opacity-0 blur-sm")}>
                <p className="t-display text-white">{c.verb}</p>
                <p className="mt-4 flex flex-wrap items-center gap-3">
                  <span className="t-code rounded-full bg-white/10 px-3 py-1 text-sm text-white ring-1 ring-white/20">{c.p.code}</span>
                  <span className="text-white/70">{c.p.short}</span>
                </p>
                <p className="t-lead mt-4 max-w-[36ch] text-white/80">{c.p.description}</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {c.usages.slice(0, 3).map((u) => (
                    <li key={u} className="rounded-full bg-white/8 px-3 py-1 text-sm text-white/80 ring-1 ring-white/10">
                      {u}
                    </li>
                  ))}
                </ul>
                <Link href={`/produit/${c.p.slug}`} tabIndex={i === idx ? 0 : -1} className="pointer-events-auto mt-6 inline-block text-md font-medium text-sky hover:underline">
                  Voir la fiche {c.p.code} ›
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation des chapitres + progression */}
        <div className="absolute inset-x-0 bottom-24 z-10 lg:bottom-6">
          <div className="wrap flex items-center gap-4">
            <nav aria-label="Chapitres" className="glass-night pointer-events-auto flex max-w-full gap-1 overflow-x-auto rounded-full p-1 ring-1 ring-white/10 [scrollbar-width:none]">
              {chapters.map((c, i) => (
                <button key={c.p.slug} type="button" onClick={() => jump(i)} aria-current={i === idx ? "step" : undefined} className={cx("shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors duration-300 sm:text-sm", i === idx ? "bg-white text-ink" : "text-white/70 hover:text-white")}>
                  {c.verb.replace(".", "")}
                </button>
              ))}
            </nav>
            <span className="hidden h-px flex-1 overflow-hidden bg-white/15 md:block">
              <span ref={bar} className="block h-full origin-left scale-x-0 bg-white/80" />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
