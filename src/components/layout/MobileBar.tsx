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
    <div data-no-print className="glass fixed inset-x-3 bottom-[max(12px,env(safe-area-inset-bottom))] z-40 grid grid-cols-2 gap-1 rounded-full p-1 shadow-float ring-1 ring-black/5 lg:hidden">
      <a href={`tel:${company.phoneE164}`} className="flex h-12 items-center justify-center gap-2 rounded-full font-medium text-ink">
        <Icon name="phone" size={18} />
        Appeler
      </a>
      <button type="button" onClick={open} data-cart-target className="flex h-12 items-center justify-center gap-2 rounded-full bg-action font-medium text-ink">
        <Icon name="order" size={18} />
        Commande
        <span className="inline-grid h-6 min-w-6 place-items-center rounded-full bg-ink px-2 text-xs font-semibold text-white">{n}</span>
      </button>
    </div>
  );
}
