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
    <div data-no-print className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 gap-2 border-t border-rule bg-white p-2 pb-[max(8px,env(safe-area-inset-bottom))] lg:hidden">
      <a href={`tel:${company.phoneE164}`} className="flex h-12 items-center justify-center gap-2 rounded-[6px] border border-rule font-semibold text-ink">
        <Icon name="phone" size={18} />
        Appeler
      </a>
      <button type="button" onClick={open} data-cart-target className="flex h-12 items-center justify-center gap-2 rounded-[6px] bg-action font-semibold text-ink">
        <Icon name="order" size={18} />
        Commande
        <span className="inline-grid h-6 min-w-6 place-items-center rounded-[4px] bg-ink px-1.5 text-xs font-bold text-white">{n}</span>
      </button>
    </div>
  );
}
