import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY, IS_DEMO } from "@/lib/env";

/** Client service (contourne la RLS) — uniquement côté serveur, pour les emails et scripts. */
export function adminClient(): SupabaseClient | null {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (IS_DEMO || !key) return null;
  return createClient(SUPABASE_URL, key, { auth: { persistSession: false } });
}

/** Utilisateur appelant (jeton Bearer) + son profil. */
export async function callerProfile(req: Request) {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (IS_DEMO || !token) return null;
  const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false } });
  const { data } = await sb.auth.getUser(token);
  if (!data.user) return null;
  const { data: profile } = await sb.from("profiles").select("*").eq("id", data.user.id).maybeSingle();
  return profile as { id: string; role: string; account_id: string | null; email: string; full_name: string } | null;
}
