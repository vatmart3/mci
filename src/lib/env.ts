/** Détection du mode : sans clés Supabase (ou avec NEXT_PUBLIC_FORCE_DEMO), le site tourne en MODE DÉMO. */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const FORCE_DEMO = (process.env.NEXT_PUBLIC_FORCE_DEMO ?? "") === "1" || process.env.NEXT_PUBLIC_FORCE_DEMO === "true";

export const IS_DEMO = FORCE_DEMO || !SUPABASE_URL || !SUPABASE_ANON_KEY;

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.mci-sete.com").replace(/\/$/, "");
