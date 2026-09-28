import { z } from "zod";
import { adminClient, callerProfile } from "@/lib/server/supabase-admin";

const schema = z.object({
  accountId: z.string().uuid(),
  fullName: z.string().min(2).max(120),
  email: z.string().email(),
  role: z.enum(["buyer", "approver"]),
  password: z.string().min(8).max(72),
});

/** Ajout d'un utilisateur à une structure (valideur de la structure ou MCI). */
export async function POST(req: Request) {
  const sb = adminClient();
  if (!sb) return Response.json({ error: "Indisponible en mode démo." }, { status: 503 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Données invalides." }, { status: 400 });
  const caller = await callerProfile(req);
  const staff = caller && (caller.role === "admin" || caller.role === "sales");
  if (!caller || !(staff || (caller.role === "approver" && caller.account_id === parsed.data.accountId))) {
    return Response.json({ error: "Seul un valideur de la structure ou MCI peut ajouter un utilisateur." }, { status: 403 });
  }
  const { accountId, fullName, email, role, password } = parsed.data;
  const { data, error } = await sb.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
    app_metadata: { role, account_id: accountId },
  });
  if (error || !data.user) return Response.json({ error: error?.message ?? "Création impossible." }, { status: 400 });
  return Response.json({ user: { id: data.user.id, email, fullName, role, accountId } });
}
