"use client";
import { company } from "@/data/company";
import { Icon } from "@/components/ui/Icon";
import { useCart, cartCount } from "@/lib/store/cart";
import { useUI } from "@/lib/store/ui";
import { useEffect, useState } from "react";

/** Barre inférieure fixe mobile : Appeler · Bon de commande (§15). */
export function MobileBar() {
  const lines = useCart((s) => s.lines);
  const open = useUI((s) => s.openDrawer);
  const [ok, setOk] = useState(false);
  useEffect(() => setOk(true), []);
  const n = ok ? cartCount(lines) : 0;
  return (
    <div data-no-print className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 border-t border-rule bg-salt pb-[env(safe-area-inset-bottom)] lg:hidden">
      <a href={`tel:${company.phoneE164}`} className="flex h-14 items-center justify-center gap-2 font-semibold text-ink">
        <Icon name="phone" size={18} />
        Appeler
      </a>
      <button type="button" onClick={open} data-cart-target className="flex h-14 items-center justify-center gap-2 bg-action font-semibold text-ink">
        <Icon name="order" size={18} />
        Bon de commande
        <span className="t-mono rounded-tech bg-ink px-1 text-xs text-white">{n}</span>
      </button>
    </div>
  );
}
