"use client";
import { create } from "zustand";

interface Flight {
  id: number;
  from: DOMRect;
  image: string;
}

interface UIState {
  drawerOpen: boolean;
  menuOpen: boolean;
  flights: Flight[];
  bump: number;
  openDrawer: () => void;
  closeDrawer: () => void;
  setMenu: (v: boolean) => void;
  /** lance le vol du packshot vers le compteur de l'en-tête */
  fly: (from: DOMRect, image: string) => void;
  land: (id: number) => void;
}

let seq = 0;
export const useUI = create<UIState>()((set) => ({
  drawerOpen: false,
  menuOpen: false,
  flights: [],
  bump: 0,
  openDrawer: () => set({ drawerOpen: true }),
  closeDrawer: () => set({ drawerOpen: false }),
  setMenu: (v) => set({ menuOpen: v }),
  fly: (from, image) => set((s) => ({ flights: [...s.flights, { id: ++seq, from, image }] })),
  land: (id) => set((s) => ({ flights: s.flights.filter((f) => f.id !== id), bump: s.bump + 1 })),
}));
