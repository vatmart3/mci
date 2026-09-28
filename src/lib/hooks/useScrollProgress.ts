"use client";
import { useEffect, useRef, type RefObject } from "react";

/**
 * Progression du défilement à travers un élément, sans re-rendu React :
 * 0 quand le haut de l'élément atteint le haut de l'écran (mode "sticky")
 * ou le bas de l'écran (mode "enter"), 1 quand son bas atteint le bas (sticky) / le haut (enter) de l'écran.
 * `onChange` est appelé à chaque image où la valeur change (pour piloter du CSS ou un index).
 */
export function useScrollProgress(target: RefObject<HTMLElement | null>, opts: { mode?: "sticky" | "enter"; onChange?: (p: number) => void } = {}) {
  const progress = useRef(0);
  const cb = useRef(opts.onChange);
  cb.current = opts.onChange;
  const mode = opts.mode ?? "sticky";
  useEffect(() => {
    const el = target.current;
    if (!el) return;
    let raf = 0;
    const measure = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = mode === "sticky" ? -r.top / Math.max(1, r.height - vh) : (vh - r.top) / (r.height + vh);
      const c = Math.min(1, Math.max(0, p));
      if (c !== progress.current) {
        progress.current = c;
        cb.current?.(c);
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    cb.current?.(progress.current);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [target, mode]);
  return progress;
}
