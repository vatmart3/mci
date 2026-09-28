"use client";
import { create } from "zustand";
import type { Product } from "@/lib/types";
import { products as seed } from "@/data/catalog";
import { getBackend } from "@/lib/backend";

interface CatalogState {
  products: Product[];
  loaded: boolean;
  load: () => Promise<void>;
  byId: (id: string) => Product | undefined;
}

/** Catalogue côté client (bon de commande, commande rapide, admin) : seed immédiat puis source réelle. */
export const useCatalog = create<CatalogState>()((set, get) => ({
  products: seed,
  loaded: false,
  load: async () => {
    try {
      const b = await getBackend();
      const list = await b.listAllProducts();
      if (list.length) set({ products: list, loaded: true });
      else set({ loaded: true });
    } catch {
      set({ loaded: true });
    }
  },
  byId: (id) => get().products.find((p) => p.id === id),
}));
