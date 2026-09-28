/**
 * SupabaseBackend — production. Toutes les règles d'accès sont portées par la RLS
 * et les fonctions SQL (supabase/migrations/0001_init.sql) ; ce client ne fait qu'appeler.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Account, AccountDocument, EmailLogEntry, FavoriteList, Order, OrderStatus, PriceGrid, Product, Settings, User } from "@/lib/types";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/env";
import { productToRow, rowToProduct, type ProductRow } from "./mappers";
import { BackendError, type Backend, type PlaceOrderInput, type SignUpInput, type StatusUpdate } from "./types";
import { rememberGuestOrder } from "./guest";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Row = Record<string, any>;

let client: SupabaseClient | null = null;
export function supabase(): SupabaseClient {
  if (!client) client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: true, autoRefreshToken: true } });
  return client;
}

function fail(error: { message: string } | null, fallback = "Erreur serveur"): never {
  throw new BackendError(error?.message ?? fallback, "invalid");
}

const toUser = (r: Row): User => ({
  id: r.id,
  email: r.email,
  fullName: r.full_name,
  phone: r.phone ?? undefined,
  role: r.role,
  accountId: r.account_id,
  isDemo: r.is_demo,
});

const toAddress = (r: Row) => ({
  id: r.id as string,
  label: r.label ?? undefined,
  company: r.company ?? undefined,
  line1: r.line1,
  line2: r.line2 ?? undefined,
  postalCode: r.postal_code,
  city: r.city,
  accessNotes: r.access_notes ?? undefined,
  isDefault: r.is_default,
});

const toAccount = (r: Row): Account => ({
  id: r.id,
  company: r.company,
  siret: r.siret,
  kind: r.kind,
  status: r.status,
  priceGridId: r.price_grid_id,
  requiresApproval: r.requires_approval,
  chorus: r.chorus,
  chorusServiceCode: r.chorus_service_code ?? undefined,
  addresses: ((r.addresses as Row[]) ?? []).map(toAddress),
  billing: r.billing,
  createdAt: r.created_at,
  isDemo: r.is_demo,
});

const toOrder = (r: Row): Order => ({
  id: r.id,
  number: r.number,
  accountId: r.account_id,
  status: r.status,
  customer: r.customer,
  delivery: r.delivery,
  billing: r.billing,
  poNumber: r.po_number ?? undefined,
  chorus: r.chorus,
  chorusServiceCode: r.chorus_service_code ?? undefined,
  deliverySlots: r.delivery_slots ?? undefined,
  comment: r.comment ?? undefined,
  leadTime: r.lead_time ?? undefined,
  mciNote: r.mci_note ?? undefined,
  customerAcceptedAt: r.customer_accepted_at ?? undefined,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
  createdBy: r.created_by ?? undefined,
  approvedBy: r.approved_by ?? undefined,
  isDemo: r.is_demo,
  lines: ((r.order_lines as Row[]) ?? [])
    .sort((a, b) => a.position - b.position)
    .map((l) => ({
      productId: l.product_id,
      code: l.code,
      name: l.name,
      packagingId: l.packaging_id,
      packagingLabel: l.packaging_label,
      quantity: l.quantity,
      note: l.note ?? undefined,
      unitPriceHt: l.unit_price_ht == null ? null : Number(l.unit_price_ht),
    })),
  events: ((r.order_events as Row[]) ?? [])
    .sort((a, b) => String(a.at).localeCompare(String(b.at)))
    .map((e) => ({ status: e.status, at: e.at, note: e.note ?? undefined, by: e.by ?? undefined })),
});

const ORDER_SELECT = "*, order_lines(*), order_events(*)";

async function authHeader(): Promise<Record<string, string>> {
  const { data } = await supabase().auth.getSession();
  return data.session ? { Authorization: `Bearer ${data.session.access_token}` } : {};
}

async function notify(body: Record<string, unknown>) {
  try {
    await fetch("/api/notify", {
      method: "POST",
      headers: { "content-type": "application/json", ...(await authHeader()) },
      body: JSON.stringify(body),
    });
  } catch {
    /* l'email n'est pas bloquant */
  }
}

export class SupabaseBackend implements Backend {
  readonly mode = "supabase" as const;
  private sb = supabase();

  async getSession() {
    const { data } = await this.sb.auth.getUser();
    if (!data.user) return null;
    const { data: p } = await this.sb.from("profiles").select("*").eq("id", data.user.id).maybeSingle();
    return p ? toUser(p) : null;
  }

  async signIn(email: string, password: string) {
    const { error } = await this.sb.auth.signInWithPassword({ email, password });
    if (error) throw new BackendError("Email ou mot de passe incorrect.", "auth");
    const u = await this.getSession();
    if (!u) throw new BackendError("Profil introuvable.", "auth");
    return u;
  }

  async signUp(input: SignUpInput) {
    const { data, error } = await this.sb.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: { company: input.company, siret: input.siret, kind: input.kind, full_name: input.fullName, phone: input.phone, address: input.address },
        emailRedirectTo: `${window.location.origin}/espace-pro`,
      },
    });
    if (error) throw new BackendError(error.message, "invalid");
    await notify({ kind: "account_created", email: input.email });
    if (!data.session) throw new BackendError("Compte créé. Confirmez votre adresse email via le lien reçu, puis connectez-vous.", "auth");
    const u = await this.getSession();
    if (!u) throw new BackendError("Profil introuvable.", "auth");
    return u;
  }

  async signOut() {
    await this.sb.auth.signOut();
  }

  async getAccount(id: string) {
    const { data } = await this.sb.from("accounts").select("*, addresses(*)").eq("id", id).maybeSingle();
    return data ? toAccount(data) : null;
  }

  async listAccounts() {
    const { data, error } = await this.sb.from("accounts").select("*, addresses(*)").order("created_at", { ascending: false });
    if (error) fail(error);
    return (data ?? []).map(toAccount);
  }

  async updateAccount(id: string, patch: Partial<Account>) {
    const before = await this.getAccount(id);
    const row: Row = {};
    if (patch.company !== undefined) row.company = patch.company;
    if (patch.siret !== undefined) row.siret = patch.siret;
    if (patch.kind !== undefined) row.kind = patch.kind;
    if (patch.status !== undefined) row.status = patch.status;
    if (patch.priceGridId !== undefined) row.price_grid_id = patch.priceGridId;
    if (patch.requiresApproval !== undefined) row.requires_approval = patch.requiresApproval;
    if (patch.chorus !== undefined) row.chorus = patch.chorus;
    if (patch.chorusServiceCode !== undefined) row.chorus_service_code = patch.chorusServiceCode;
    if (patch.billing !== undefined) row.billing = patch.billing;
    if (Object.keys(row).length) {
      const { error } = await this.sb.from("accounts").update(row).eq("id", id);
      if (error) fail(error);
    }
    if (patch.addresses) {
      const keep = patch.addresses.filter((a) => !a.id.startsWith("new-")).map((a) => a.id);
      const del = this.sb.from("addresses").delete().eq("account_id", id);
      const { error: e1 } = keep.length ? await del.not("id", "in", `(${keep.join(",")})`) : await del;
      if (e1) fail(e1);
      for (const a of patch.addresses) {
        const r = { account_id: id, label: a.label ?? null, company: a.company ?? null, line1: a.line1, line2: a.line2 ?? null, postal_code: a.postalCode, city: a.city, access_notes: a.accessNotes ?? null, is_default: !!a.isDefault };
        const { error } = a.id.startsWith("new-") ? await this.sb.from("addresses").insert(r) : await this.sb.from("addresses").update(r).eq("id", a.id);
        if (error) fail(error);
      }
    }
    const after = await this.getAccount(id);
    if (!after) throw new BackendError("Compte introuvable.", "not_found");
    if (before?.status === "pending" && after.status === "active") await notify({ kind: "account_validated", accountId: id });
    return after;
  }

  async listUsers(accountId?: string) {
    let q = this.sb.from("profiles").select("*").order("created_at");
    if (accountId) q = q.eq("account_id", accountId);
    const { data, error } = await q;
    if (error) fail(error);
    return (data ?? []).map(toUser);
  }

  async addUser(accountId: string, input: { fullName: string; email: string; role: User["role"]; password: string }) {
    const res = await fetch("/api/account/users", {
      method: "POST",
      headers: { "content-type": "application/json", ...(await authHeader()) },
      body: JSON.stringify({ accountId, ...input }),
    });
    const json = (await res.json()) as { user?: User; error?: string };
    if (!res.ok || !json.user) throw new BackendError(json.error ?? "Création impossible", "invalid");
    return json.user;
  }

  async placeOrder(input: PlaceOrderInput) {
    const { data, error } = await this.sb.rpc("place_order", { payload: input });
    if (error) fail(error);
    const { id, number } = data as { id: string; number: string };
    await notify({ kind: "order_placed", orderId: id });
    const own = await this.getOrderById(id);
    if (own) return own;
    // Invité : relire via numéro + email
    rememberGuestOrder(number, input.customer.email);
    const guest = await this.getGuestOrder(number, input.customer.email);
    if (!guest) throw new BackendError("Commande enregistrée, lecture impossible.", "network");
    return guest;
  }

  private async getOrderById(id: string) {
    const { data } = await this.sb.from("orders").select(ORDER_SELECT).eq("id", id).maybeSingle();
    return data ? toOrder(data) : null;
  }

  async getGuestOrder(number: string, email: string) {
    const { data } = await this.sb.rpc("get_guest_order", { p_number: number, p_email: email });
    return data ? toOrder(data as Row) : null;
  }

  async listOrders(filter?: { accountId?: string; status?: OrderStatus }) {
    let q = this.sb.from("orders").select(ORDER_SELECT).order("created_at", { ascending: false }).limit(500);
    if (filter?.accountId) q = q.eq("account_id", filter.accountId);
    if (filter?.status) q = q.eq("status", filter.status);
    const { data, error } = await q;
    if (error) fail(error);
    return (data ?? []).map(toOrder);
  }

  async getOrder(idOrNumber: string) {
    const col = idOrNumber.startsWith("MCI-") ? "number" : "id";
    const { data } = await this.sb.from("orders").select(ORDER_SELECT).eq(col, idOrNumber).maybeSingle();
    if (data) return toOrder(data);
    if (col === "number") {
      const email = sessionStorage.getItem(`mci:guest-email:${idOrNumber}`);
      if (email) return this.getGuestOrder(idOrNumber, email);
    }
    return null;
  }

  async approveOrder(id: string) {
    const { error } = await this.sb.rpc("approve_order", { p_id: id });
    if (error) fail(error);
    await notify({ kind: "order_placed", orderId: id });
    return (await this.getOrderById(id))!;
  }

  async acceptProforma(id: string) {
    const { error } = await this.sb.rpc("accept_proforma", { p_id: id });
    if (error) fail(error);
    await notify({ kind: "proforma_accepted", orderId: id });
    return (await this.getOrderById(id))!;
  }

  async updateOrderStatus(id: string, update: StatusUpdate) {
    const current = await this.getOrderById(id);
    if (!current) throw new BackendError("Commande introuvable.", "not_found");
    if (update.prices) {
      const { data: rows } = await this.sb.from("order_lines").select("id, position").eq("order_id", id).order("position");
      for (const [i, r] of (rows ?? []).entries()) {
        const price = update.prices[i];
        if (price !== undefined) {
          const { error } = await this.sb.from("order_lines").update({ unit_price_ht: price }).eq("id", r.id);
          if (error) fail(error);
        }
      }
    }
    const patch: Row = { status: update.status, updated_at: new Date().toISOString() };
    if (update.leadTime !== undefined) patch.lead_time = update.leadTime || null;
    if (update.mciNote !== undefined) patch.mci_note = update.mciNote || null;
    const { error } = await this.sb.from("orders").update(patch).eq("id", id);
    if (error) fail(error);
    if (current.status !== update.status) {
      const { data: auth } = await this.sb.auth.getUser();
      await this.sb.from("order_events").insert({ order_id: id, status: update.status, note: update.note ?? null, by: auth.user?.id ?? null });
      await notify({ kind: "status", orderId: id, note: update.note });
    }
    return (await this.getOrderById(id))!;
  }

  async listFavorites(accountId: string) {
    const { data, error } = await this.sb.from("favorite_lists").select("*").eq("account_id", accountId).order("name");
    if (error) fail(error);
    return (data ?? []).map((r) => ({ id: r.id, accountId: r.account_id, name: r.name, lines: r.lines }) as FavoriteList);
  }

  async saveFavorite(list: Omit<FavoriteList, "id"> & { id?: string }) {
    const row = { account_id: list.accountId, name: list.name, lines: list.lines };
    const q = list.id ? this.sb.from("favorite_lists").update(row).eq("id", list.id) : this.sb.from("favorite_lists").insert(row);
    const { data, error } = await q.select().single();
    if (error) fail(error);
    return { id: data.id, accountId: data.account_id, name: data.name, lines: data.lines };
  }

  async deleteFavorite(id: string) {
    const { error } = await this.sb.from("favorite_lists").delete().eq("id", id);
    if (error) fail(error);
  }

  async listDocuments(accountId: string) {
    const { data, error } = await this.sb.from("documents").select("*").eq("account_id", accountId).order("created_at", { ascending: false });
    if (error) fail(error);
    const docs = await Promise.all(
      (data ?? []).map(async (r) => {
        let url = r.url as string;
        if (url.startsWith("documents/")) {
          const { data: signed } = await this.sb.storage.from("documents").createSignedUrl(url.slice("documents/".length), 3600);
          url = signed?.signedUrl ?? url;
        }
        return { id: r.id, accountId: r.account_id, orderId: r.order_id ?? undefined, kind: r.kind, name: r.name, url, createdAt: r.created_at } as AccountDocument;
      }),
    );
    return docs;
  }

  async addDocument(doc: Omit<AccountDocument, "id" | "createdAt"> & { file?: File }) {
    let url = doc.url;
    if (doc.file) {
      const path = `${doc.accountId}/${Date.now()}-${doc.file.name.replace(/[^\w.-]+/g, "_")}`;
      const { error } = await this.sb.storage.from("documents").upload(path, doc.file);
      if (error) fail(error);
      url = `documents/${path}`;
    }
    const { data, error } = await this.sb
      .from("documents")
      .insert({ account_id: doc.accountId, order_id: doc.orderId ?? null, kind: doc.kind, name: doc.name, url })
      .select()
      .single();
    if (error) fail(error);
    return { id: data.id, accountId: data.account_id, orderId: data.order_id ?? undefined, kind: data.kind, name: data.name, url: data.url, createdAt: data.created_at };
  }

  async deleteDocument(id: string) {
    const { error } = await this.sb.from("documents").delete().eq("id", id);
    if (error) fail(error);
  }

  async getSettings(): Promise<Settings> {
    const { data } = await this.sb.from("settings").select("*").eq("id", 1).maybeSingle();
    return {
      priceMode: data?.price_mode ?? "on_request",
      notifyEmails: data?.notify_emails ?? [],
      hours: data?.hours ?? "",
      banner: data?.banner ?? "",
      socials: data?.socials ?? [],
      leadTimeDefault: data?.lead_time_default ?? "",
    };
  }

  async updateSettings(patch: Partial<Settings>) {
    const row: Row = {};
    if (patch.priceMode) row.price_mode = patch.priceMode;
    if (patch.notifyEmails) row.notify_emails = patch.notifyEmails;
    if (patch.hours !== undefined) row.hours = patch.hours;
    if (patch.banner !== undefined) row.banner = patch.banner;
    if (patch.socials) row.socials = patch.socials;
    if (patch.leadTimeDefault !== undefined) row.lead_time_default = patch.leadTimeDefault;
    const { error } = await this.sb.from("settings").update(row).eq("id", 1);
    if (error) fail(error);
    return this.getSettings();
  }

  async listPriceGrids() {
    const { data, error } = await this.sb.from("price_grids").select("*").order("name");
    if (error) fail(error);
    return (data ?? []) as PriceGrid[];
  }

  async savePriceGrid(grid: Omit<PriceGrid, "id"> & { id?: string }) {
    const q = grid.id ? this.sb.from("price_grids").update({ name: grid.name, prices: grid.prices }).eq("id", grid.id) : this.sb.from("price_grids").insert({ name: grid.name, prices: grid.prices });
    const { data, error } = await q.select().single();
    if (error) fail(error);
    return data as PriceGrid;
  }

  async listAllProducts() {
    const { data, error } = await this.sb.from("products").select("*").order("position");
    if (error) fail(error);
    return (data as ProductRow[]).map(rowToProduct);
  }

  async saveProduct(p: Product) {
    const { data, error } = await this.sb.from("products").upsert({ ...productToRow(p), updated_at: new Date().toISOString() }).select().single();
    if (error) fail(error);
    await fetch("/api/revalidate", { method: "POST", headers: await authHeader() }).catch(() => undefined);
    return rowToProduct(data as ProductRow);
  }

  async deleteProduct(id: string) {
    const { error } = await this.sb.from("products").delete().eq("id", id);
    if (error) fail(error);
  }

  async uploadFile(file: File, folder: string) {
    const path = `${folder}/${Date.now()}-${file.name.replace(/[^\w.-]+/g, "_")}`;
    const { error } = await this.sb.storage.from("product-files").upload(path, file, { upsert: true });
    if (error) fail(error);
    return this.sb.storage.from("product-files").getPublicUrl(path).data.publicUrl;
  }

  async listEmails(): Promise<EmailLogEntry[]> {
    const { data, error } = await this.sb.from("email_log").select("*").order("at", { ascending: false }).limit(200);
    if (error) fail(error);
    return (data ?? []) as EmailLogEntry[];
  }
}
