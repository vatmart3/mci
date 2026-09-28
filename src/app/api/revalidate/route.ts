import { revalidatePath, revalidateTag } from "next/cache";
import { callerProfile } from "@/lib/server/supabase-admin";

/** Après modification d'un produit dans l'admin : régénère le catalogue public. */
export async function POST(req: Request) {
  const caller = await callerProfile(req);
  if (!caller || !(caller.role === "admin" || caller.role === "sales")) return Response.json({ ok: false }, { status: 403 });
  revalidateTag("products");
  revalidatePath("/", "layout");
  return Response.json({ ok: true });
}
