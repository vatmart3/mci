"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/store/cart";
import { useSession } from "@/lib/store/session";
import { useCatalog } from "@/lib/store/catalog";
import { IS_DEMO } from "@/lib/env";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { FlyLayer } from "@/components/cart/FlyLayer";
import { MobileBar } from "./MobileBar";
import { CookieBanner } from "./CookieBanner";

function useSmoothScroll(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) return;
    let lenis: import("lenis").default | null = null;
    let raf = 0;
    let cancelled = false;
    void Promise.all([import("lenis"), import("gsap"), import("gsap/ScrollTrigger")]).then(([{ default: Lenis }, { gsap }, { ScrollTrigger }]) => {
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      lenis = new Lenis({ lerp: 0.12, wheelMultiplier: 1 });
      lenis.on("scroll", ScrollTrigger.update);
      const loop = (t: number) => {
        lenis?.raf(t);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      lenis?.destroy();
    };
  }, [enabled]);
}

export function Providers({ children }: { children: React.ReactNode }) {
  const refresh = useSession((s) => s.refresh);
  const loadCatalog = useCatalog((s) => s.load);
  const pathname = usePathname();
  // Lenis uniquement sur les pages éditoriales (pas sur l'admin, les formulaires longs gardent le scroll natif)
  useSmoothScroll(pathname === "/" || pathname.startsWith("/secteurs") || pathname === "/societe");

  useEffect(() => {
    void useCart.persist.rehydrate();
    void refresh();
    void loadCatalog();
    const onChange = () => void refresh();
    window.addEventListener("mci-demo:change", onChange);
    let unsub: (() => void) | undefined;
    if (!IS_DEMO) {
      void import("@/lib/backend/supabase").then(({ supabase }) => {
        const { data } = supabase().auth.onAuthStateChange(() => void refresh());
        unsub = () => data.subscription.unsubscribe();
      });
    }
    return () => {
      window.removeEventListener("mci-demo:change", onChange);
      unsub?.();
    };
  }, [refresh, loadCatalog]);

  return (
    <>
      {children}
      <CartDrawer />
      <FlyLayer />
      <MobileBar />
      <CookieBanner />
    </>
  );
}
