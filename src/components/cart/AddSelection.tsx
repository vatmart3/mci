"use client";
import { useRef, useState } from "react";
import type { CartLine } from "@/lib/types";
import { useCart } from "@/lib/store/cart";
import { useUI } from "@/lib/store/ui";
import { buttonClass } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

/** Ajoute toute une sélection (secteur, liste favorite, commande passée) au bon de commande. */
export function AddSelection({ lines, label = "Ajouter la sélection au bon de commande", image, openDrawer = true, className }: { lines: CartLine[]; label?: string; image?: string; openDrawer?: boolean; className?: string }) {
  const addMany = useCart((s) => s.addMany);
  const fly = useUI((s) => s.fly);
  const open = useUI((s) => s.openDrawer);
  const ref = useRef<HTMLButtonElement>(null);
  const [done, setDone] = useState(false);
  return (
    <button
      ref={ref}
      type="button"
      className={buttonClass("action", "lg", className)}
      onClick={() => {
        addMany(lines);
        if (image && ref.current) fly(ref.current.getBoundingClientRect(), image);
        setDone(true);
        if (openDrawer) window.setTimeout(open, 600);
      }}
    >
      <Icon name={done ? "check" : "plus"} />
      {done ? `${lines.length} références ajoutées` : label}
    </button>
  );
}
