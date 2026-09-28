"use client";
import { IS_DEMO } from "@/lib/env";
import type { Backend } from "./types";

let instance: Backend | null = null;

/** Backend actif : démo (localStorage) sans clés, Supabase sinon. Chargé à la demande. */
export async function getBackend(): Promise<Backend> {
  if (instance) return instance;
  if (IS_DEMO) {
    const { DemoBackend } = await import("./demo");
    instance = new DemoBackend();
  } else {
    const { SupabaseBackend } = await import("./supabase");
    instance = new SupabaseBackend();
  }
  return instance;
}

export { BackendError } from "./types";
export type { Backend } from "./types";
