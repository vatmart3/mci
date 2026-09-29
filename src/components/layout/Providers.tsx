"use client";
import { useEffect } from "react";
import { useCart } from "@/lib/store/cart";
import { useSession } from "@/lib/store/session";
import { useCatalog } from "@/lib/store/catalog";
import { IS_DEMO } from "@/lib/env";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { FlyLayer } from "@/components/cart/FlyLayer";
import { MobileBar } from "./MobileBar";
import { CookieBanner } from "./CookieBanner";

export function Providers({ children }: { children: React.ReactNode }) {
  const refresh = useSession((s) => s.refresh);
  const loadCatalog = useCatalog((s) => s.load);

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
