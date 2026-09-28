"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartLine } from "@/lib/types";

interface CartState {
  lines: CartLine[];
  add: (line: CartLine) => void;
  addMany: (lines: CartLine[]) => void;
  update: (index: number, patch: Partial<CartLine>) => void;
  remove: (index: number) => void;
  clear: () => void;
  replace: (lines: CartLine[]) => void;
}

const merge = (lines: CartLine[], l: CartLine): CartLine[] => {
  const i = lines.findIndex((x) => x.productId === l.productId && x.packagingId === l.packagingId);
  if (i < 0) return [...lines, { ...l, quantity: Math.max(1, Math.min(999, l.quantity)) }];
  const next = [...lines];
  next[i] = { ...next[i]!, quantity: Math.min(999, next[i]!.quantity + l.quantity), note: l.note ?? next[i]!.note };
  return next;
};

/** Bon de commande : persistant (localStorage), fusion des lignes identiques. */
export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      add: (l) => set((s) => ({ lines: merge(s.lines, l) })),
      addMany: (ls) => set((s) => ({ lines: ls.reduce(merge, s.lines) })),
      update: (i, patch) =>
        set((s) => {
          const next = [...s.lines];
          const cur = next[i];
          if (!cur) return s;
          const updated = { ...cur, ...patch };
          // si le conditionnement change et qu'une ligne identique existe, fusion
          const dup = next.findIndex((x, k) => k !== i && x.productId === updated.productId && x.packagingId === updated.packagingId);
          if (dup >= 0) {
            next[dup] = { ...next[dup]!, quantity: Math.min(999, next[dup]!.quantity + updated.quantity) };
            next.splice(i, 1);
          } else next[i] = updated;
          return { lines: next };
        }),
      remove: (i) => set((s) => ({ lines: s.lines.filter((_, k) => k !== i) })),
      clear: () => set({ lines: [] }),
      replace: (lines) => set({ lines }),
    }),
    {
      name: "mci:bon-de-commande",
      version: 1,
      storage: createJSONStorage(() => {
        try {
          return window.localStorage;
        } catch {
          return { getItem: () => null, setItem: () => undefined, removeItem: () => undefined };
        }
      }),
      skipHydration: true,
    },
  ),
);

export const cartCount = (lines: CartLine[]) => lines.reduce((n, l) => n + l.quantity, 0);
