"use client";
import { create } from "zustand";
import type { Account, PriceGrid, Settings, User } from "@/lib/types";
import { defaultSettings } from "@/data/demo-settings";
import { getBackend } from "@/lib/backend";

interface SessionState {
  ready: boolean;
  user: User | null;
  account: Account | null;
  settings: Settings;
  grid: PriceGrid | null;
  refresh: () => Promise<void>;
}

export const useSession = create<SessionState>()((set) => ({
  ready: false,
  user: null,
  account: null,
  settings: defaultSettings,
  grid: null,
  refresh: async () => {
    const b = await getBackend();
    const [user, settings] = await Promise.all([b.getSession().catch(() => null), b.getSettings().catch(() => defaultSettings)]);
    const account = user?.accountId ? await b.getAccount(user.accountId).catch(() => null) : null;
    let grid: PriceGrid | null = null;
    const staff = user?.role === "admin" || user?.role === "sales";
    if (settings.priceMode === "public" || (settings.priceMode === "per_account" && account?.status === "active" && account.priceGridId) || staff) {
      const grids = await b.listPriceGrids().catch(() => [] as PriceGrid[]);
      grid =
        settings.priceMode === "per_account" && account?.priceGridId
          ? (grids.find((g) => g.id === account.priceGridId) ?? null)
          : settings.priceMode === "public"
            ? (grids[0] ?? null)
            : null;
    }
    set({ ready: true, user, account, settings, grid });
  },
}));

/** Prix HT unitaire affichable pour l'utilisateur courant, ou null (sur demande). */
export function usePrice(productId: string, packagingId: string): number | null {
  const { settings, grid } = useSession();
  if (settings.priceMode === "on_request" || !grid) return null;
  return grid.prices[`${productId}:${packagingId}`] ?? null;
}
