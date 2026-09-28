/**
 * DemoBackend — tout le site fonctionne sans aucune clé d'API.
 * Catalogue : seed TypeScript (+ modifications admin stockées localement).
 * Commandes, comptes, réglages, documents, journal d'emails : localStorage (préfixe `mci-demo:`).
 */
import type { Account, AccountDocument, EmailLogEntry, FavoriteList, Order, OrderStatus, PriceGrid, Product, Settings, User } from "@/lib/types";
import { products as seedProducts } from "@/data/catalog";
import {
  buildDemoAccounts,
  buildDemoFavorites,
  buildDemoOrders,
  buildDemoUsers,
  DEMO_ORDER_SEQ_START,
  defaultSettings,
} from "@/data/demo";
import { formatOrderNumber } from "@/lib/orders";
import { cleanSiret, uid } from "@/lib/format";
import {
  emailsForAccountCreated,
  emailsForAccountValidated,
  emailsForApprovalNeeded,
  emailsForOrderPlaced,
  emailsForProformaAccepted,
  emailsForStatus,
  type OutgoingEmail,
} from "@/lib/emails";
import { readGuestOrders, rememberGuestOrder } from "./guest";
import { BackendError, type Backend, type PlaceOrderInput, type SignUpInput, type StatusUpdate } from "./types";

type StoredUser = User & { password: string };

interface DB {
  version: 1;
  accounts: Account[];
  users: StoredUser[];
  orders: Order[];
  favorites: FavoriteList[];
  documents: AccountDocument[];
  priceGrids: PriceGrid[];
  settings: Settings;
  emails: EmailLogEntry[];
  products: Product[] | null;
  seq: number;
}

const KEY = "mci-demo:db";
const SESSION = "mci-demo:session";

function seed(withDemo = true): DB {
  const accounts = withDemo ? buildDemoAccounts() : [];
  const allUsers = buildDemoUsers();
  const users = withDemo ? allUsers : allUsers.filter((u) => u.role === "admin" || u.role === "sales");
  return {
    version: 1,
    accounts,
    users,
    orders: withDemo ? buildDemoOrders(accounts, users) : [],
    favorites: withDemo ? buildDemoFavorites() : [],
    documents: [],
    priceGrids: [{ id: "grid-standard", name: "Grille standard", prices: {} }],
    settings: { ...defaultSettings },
    emails: [],
    products: null,
    seq: DEMO_ORDER_SEQ_START,
  };
}

let memory: DB | null = null;

function load(): DB {
  if (memory) return memory;
  try {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(KEY) : null;
    if (raw) {
      const parsed = JSON.parse(raw) as DB;
      if (parsed.version === 1) {
        memory = parsed;
        return parsed;
      }
    }
  } catch {
    /* stockage indisponible : mémoire seule */
  }
  memory = seed();
  save();
  return memory;
}

function save() {
  if (!memory) return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(memory));
  } catch {
    /* quota ou navigation privée : la démo continue en mémoire */
  }
}

function mutate<T>(fn: (db: DB) => T): T {
  const db = load();
  const r = fn(db);
  save();
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("mci-demo:change"));
  return r;
}

const clone = <T,>(v: T): T => (v === undefined ? v : (JSON.parse(JSON.stringify(v)) as T));
const siteUrl = () => (typeof window !== "undefined" ? window.location.origin : "");
const strip = ({ password: _p, ...u }: StoredUser): User => u;

function sessionUserId(): string | null {
  try {
    return window.localStorage.getItem(SESSION);
  } catch {
    return null;
  }
}

function currentUser(db: DB): StoredUser | null {
  const id = sessionUserId();
  return id ? (db.users.find((u) => u.id === id) ?? null) : null;
}

function isStaff(u: User | null) {
  return !!u && (u.role === "admin" || u.role === "sales");
}

function logEmails(db: DB, emails: OutgoingEmail[]) {
  const at = new Date().toISOString();
  for (const e of emails) {
    db.emails.unshift({ id: uid("em-"), at, to: e.to, subject: e.subject, text: e.text, kind: e.kind, delivered: "demo" });
  }
  db.emails = db.emails.slice(0, 200);
  // Copie vers la console serveur (fallback « emails loggés en local »)
  if (typeof window !== "undefined" && emails.length) {
    void fetch("/api/notify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ mode: "demo", emails }),
    }).catch(() => undefined);
  }
}

function productsOf(db: DB): Product[] {
  return db.products ?? seedProducts;
}

function findOrder(db: DB, idOrNumber: string) {
  return db.orders.find((o) => o.id === idOrNumber || o.number === idOrNumber);
}

function assertOrderAccess(db: DB, order: Order) {
  const u = currentUser(db);
  if (isStaff(u)) return;
  if (u && order.accountId && u.accountId === order.accountId) return;
  throw new BackendError("Accès refusé à cette commande.", "forbidden");
}

export class DemoBackend implements Backend {
  readonly mode = "demo" as const;

  async getSession() {
    const db = load();
    const u = currentUser(db);
    return u ? strip(u) : null;
  }

  async signIn(email: string, password: string) {
    const db = load();
    const u = db.users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase());
    if (!u || u.password !== password) throw new BackendError("Email ou mot de passe incorrect.", "auth");
    try {
      window.localStorage.setItem(SESSION, u.id);
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new CustomEvent("mci-demo:change"));
    return strip(u);
  }

  async signUp(input: SignUpInput) {
    return mutate((db) => {
      if (db.users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
        throw new BackendError("Un compte existe déjà avec cet email.", "invalid");
      }
      const account: Account = {
        id: uid("acc-"),
        company: input.company,
        siret: cleanSiret(input.siret),
        kind: input.kind,
        status: "pending",
        requiresApproval: false,
        chorus: input.kind === "collectivite",
        addresses: input.address ? [{ ...input.address, id: uid("adr-"), label: input.address.label ?? "Adresse principale", isDefault: true }] : [],
        billing: null,
        createdAt: new Date().toISOString(),
      };
      const user: StoredUser = {
        id: uid("u-"),
        email: input.email.trim(),
        fullName: input.fullName,
        phone: input.phone,
        role: "approver",
        accountId: account.id,
        password: input.password,
      };
      db.accounts.push(account);
      db.users.push(user);
      logEmails(db, emailsForAccountCreated(account, user, db.settings.notifyEmails, siteUrl()));
      try {
        window.localStorage.setItem(SESSION, user.id);
      } catch {
        /* ignore */
      }
      return strip(user);
    });
  }

  async signOut() {
    try {
      window.localStorage.removeItem(SESSION);
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new CustomEvent("mci-demo:change"));
  }

  async getAccount(id: string) {
    return clone(load().accounts.find((a) => a.id === id) ?? null);
  }

  async listAccounts() {
    return clone(load().accounts);
  }

  async updateAccount(id: string, patch: Partial<Account>) {
    return mutate((db) => {
      const a = db.accounts.find((x) => x.id === id);
      if (!a) throw new BackendError("Compte introuvable.", "not_found");
      const u = currentUser(db);
      if (!isStaff(u) && u?.accountId !== id) throw new BackendError("Accès refusé.", "forbidden");
      // Seul MCI peut changer statut / grille / validation obligatoire
      const safe = isStaff(u) ? patch : { ...patch, status: a.status, priceGridId: a.priceGridId, requiresApproval: a.requiresApproval };
      const wasPending = a.status === "pending";
      Object.assign(a, safe);
      if (wasPending && a.status === "active") {
        const to = db.users.filter((x) => x.accountId === a.id).map((x) => x.email);
        logEmails(db, emailsForAccountValidated(a, to, siteUrl()));
      }
      return clone(a);
    });
  }

  async listUsers(accountId?: string) {
    const db = load();
    return db.users.filter((u) => (accountId ? u.accountId === accountId : true)).map((u) => strip(clone(u)));
  }

  async addUser(accountId: string, input: { fullName: string; email: string; role: User["role"]; password: string }) {
    return mutate((db) => {
      if (db.users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) throw new BackendError("Email déjà utilisé.", "invalid");
      const me = currentUser(db);
      if (!isStaff(me) && !(me?.accountId === accountId && me.role === "approver")) throw new BackendError("Seul un valideur ou MCI peut ajouter un utilisateur.", "forbidden");
      if (!isStaff(me) && (input.role === "admin" || input.role === "sales")) throw new BackendError("Rôle non autorisé.", "forbidden");
      const u: StoredUser = { id: uid("u-"), accountId, ...input };
      db.users.push(u);
      return strip(clone(u));
    });
  }

  async placeOrder(input: PlaceOrderInput) {
    return mutate((db) => {
      const me = currentUser(db);
      const account = me?.accountId ? db.accounts.find((a) => a.id === me.accountId) : undefined;
      const catalog = productsOf(db);
      const lines = input.lines.map((l) => {
        const p = catalog.find((x) => x.id === l.productId);
        if (!p) throw new BackendError("Produit inconnu dans le bon de commande.", "invalid");
        const pack = p.packagings.find((k) => k.id === l.packagingId) ?? p.packagings[0]!;
        const grid = account?.status === "active" && account.priceGridId ? db.priceGrids.find((g) => g.id === account.priceGridId) : undefined;
        const gridPrice = grid?.prices[`${p.id}:${pack.id}`];
        const publicGrid = db.settings.priceMode === "public" ? db.priceGrids.find((g) => g.id === "grid-standard")?.prices[`${p.id}:${pack.id}`] : undefined;
        const price = db.settings.priceMode === "per_account" ? gridPrice : db.settings.priceMode === "public" ? publicGrid : undefined;
        return { productId: p.id, code: p.code, name: p.short, packagingId: pack.id, packagingLabel: pack.label, quantity: l.quantity, note: l.note, unitPriceHt: price ?? null };
      });
      const needsApproval = !!account?.requiresApproval && me?.role === "buyer";
      const status: OrderStatus = needsApproval ? "pending_approval" : "received";
      const at = new Date().toISOString();
      const order: Order = {
        id: uid("ord-"),
        number: formatOrderNumber(new Date().getFullYear(), db.seq++),
        accountId: account?.id ?? null,
        status,
        customer: { ...input.customer, siret: cleanSiret(input.customer.siret) },
        delivery: input.delivery,
        billing: input.billing,
        poNumber: input.poNumber || undefined,
        chorus: input.chorus,
        chorusServiceCode: input.chorusServiceCode || undefined,
        deliverySlots: input.deliverySlots || undefined,
        comment: input.comment || undefined,
        lines,
        createdAt: at,
        updatedAt: at,
        createdBy: me?.id,
        events: [{ status, at, note: needsApproval ? "En attente du valideur de la structure." : undefined }],
      };
      db.orders.unshift(order);
      if (!order.accountId) rememberGuestOrder(order.number);
      logEmails(db, emailsForOrderPlaced(order, db.settings.notifyEmails, siteUrl(), db.settings.priceMode));
      if (needsApproval) {
        const approvers = db.users.filter((u) => u.accountId === account!.id && u.role === "approver").map((u) => u.email);
        logEmails(db, emailsForApprovalNeeded(order, approvers, siteUrl()));
      }
      return clone(order);
    });
  }

  async listOrders(filter?: { accountId?: string; status?: OrderStatus }) {
    const db = load();
    const me = currentUser(db);
    let list = db.orders;
    if (!isStaff(me)) list = me?.accountId ? list.filter((o) => o.accountId === me.accountId) : [];
    if (filter?.accountId) list = list.filter((o) => o.accountId === filter.accountId);
    if (filter?.status) list = list.filter((o) => o.status === filter.status);
    return clone([...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  }

  async getOrder(idOrNumber: string) {
    const db = load();
    const o = findOrder(db, idOrNumber);
    if (!o) return null;
    // Invité : la page de confirmation mémorise les numéros passés depuis ce navigateur
    const guestOk = !o.accountId && readGuestOrders().includes(o.number);
    if (!guestOk) assertOrderAccess(db, o);
    return clone(o);
  }

  async approveOrder(id: string) {
    return mutate((db) => {
      const o = findOrder(db, id);
      if (!o) throw new BackendError("Commande introuvable.", "not_found");
      const me = currentUser(db);
      if (!(isStaff(me) || (me?.role === "approver" && me.accountId === o.accountId))) throw new BackendError("Seul un valideur peut valider.", "forbidden");
      if (o.status !== "pending_approval") return clone(o);
      const at = new Date().toISOString();
      o.status = "received";
      o.approvedBy = me!.id;
      o.updatedAt = at;
      o.events.push({ status: "received", at, note: `Validée par ${me!.fullName}`, by: me!.id });
      logEmails(db, emailsForOrderPlaced(o, db.settings.notifyEmails, siteUrl(), db.settings.priceMode).filter((e) => e.kind === "order_placed_mci"));
      logEmails(db, emailsForStatus(o, siteUrl()));
      return clone(o);
    });
  }

  async acceptProforma(id: string) {
    return mutate((db) => {
      const o = findOrder(db, id);
      if (!o) throw new BackendError("Commande introuvable.", "not_found");
      assertOrderAccess(db, o);
      o.customerAcceptedAt = new Date().toISOString();
      o.updatedAt = o.customerAcceptedAt;
      o.events.push({ status: o.status, at: o.customerAcceptedAt, note: "Pro-forma validée par le client." });
      logEmails(db, emailsForProformaAccepted(o, db.settings.notifyEmails, siteUrl()));
      return clone(o);
    });
  }

  async updateOrderStatus(id: string, update: StatusUpdate) {
    return mutate((db) => {
      const o = findOrder(db, id);
      if (!o) throw new BackendError("Commande introuvable.", "not_found");
      const me = currentUser(db);
      if (!isStaff(me)) throw new BackendError("Réservé à MCI.", "forbidden");
      if (update.prices) {
        o.lines = o.lines.map((l, i) => ({ ...l, unitPriceHt: update.prices![i] ?? l.unitPriceHt ?? null }));
      }
      if (update.leadTime !== undefined) o.leadTime = update.leadTime || undefined;
      if (update.mciNote !== undefined) o.mciNote = update.mciNote || undefined;
      const changed = o.status !== update.status;
      const at = new Date().toISOString();
      o.status = update.status;
      o.updatedAt = at;
      if (changed) {
        o.events.push({ status: update.status, at, note: update.note, by: me!.id });
        logEmails(db, emailsForStatus(o, siteUrl(), update.note));
      }
      return clone(o);
    });
  }

  async listFavorites(accountId: string) {
    return clone(load().favorites.filter((f) => f.accountId === accountId));
  }

  async saveFavorite(list: Omit<FavoriteList, "id"> & { id?: string }) {
    return mutate((db) => {
      const existing = list.id ? db.favorites.find((f) => f.id === list.id) : undefined;
      if (existing) {
        Object.assign(existing, list);
        return clone(existing);
      }
      const f: FavoriteList = { ...list, id: uid("fav-") };
      db.favorites.push(f);
      return clone(f);
    });
  }

  async deleteFavorite(id: string) {
    mutate((db) => {
      db.favorites = db.favorites.filter((f) => f.id !== id);
    });
  }

  async listDocuments(accountId: string) {
    return clone(load().documents.filter((d) => d.accountId === accountId));
  }

  async addDocument(doc: Omit<AccountDocument, "id" | "createdAt"> & { file?: File }) {
    const url = doc.file ? await this.uploadFile(doc.file, "documents") : doc.url;
    return mutate((db) => {
      const d: AccountDocument = { id: uid("doc-"), accountId: doc.accountId, orderId: doc.orderId, kind: doc.kind, name: doc.name, url, createdAt: new Date().toISOString() };
      db.documents.unshift(d);
      return clone(d);
    });
  }

  async deleteDocument(id: string) {
    mutate((db) => {
      db.documents = db.documents.filter((d) => d.id !== id);
    });
  }

  async getSettings() {
    return clone(load().settings);
  }

  async updateSettings(patch: Partial<Settings>) {
    return mutate((db) => {
      db.settings = { ...db.settings, ...patch };
      return clone(db.settings);
    });
  }

  async listPriceGrids() {
    return clone(load().priceGrids);
  }

  async savePriceGrid(grid: Omit<PriceGrid, "id"> & { id?: string }) {
    return mutate((db) => {
      const existing = grid.id ? db.priceGrids.find((g) => g.id === grid.id) : undefined;
      if (existing) {
        Object.assign(existing, grid);
        return clone(existing);
      }
      const g: PriceGrid = { ...grid, id: uid("grid-") };
      db.priceGrids.push(g);
      return clone(g);
    });
  }

  async listAllProducts() {
    return clone(productsOf(load()));
  }

  async saveProduct(p: Product) {
    return mutate((db) => {
      const list = [...productsOf(db)];
      const i = list.findIndex((x) => x.id === p.id);
      if (i >= 0) list[i] = p;
      else list.push({ ...p, id: p.id || `p-${p.slug}`, position: list.length });
      db.products = list;
      return clone(p);
    });
  }

  async deleteProduct(id: string) {
    mutate((db) => {
      db.products = productsOf(db).filter((p) => p.id !== id);
    });
  }

  async uploadFile(file: File, _folder: string) {
    if (file.size > 1_500_000) throw new BackendError("En mode démo, les fichiers sont limités à 1,5 Mo (stockage navigateur).", "invalid");
    return await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = () => reject(new BackendError("Lecture du fichier impossible.", "invalid"));
      r.readAsDataURL(file);
    });
  }

  /** journalise des emails envoyés hors backend (formulaire de contact) */
  recordEmails(emails: OutgoingEmail[]) {
    const db = load();
    const at = new Date().toISOString();
    for (const e of emails) db.emails.unshift({ id: uid("em-"), at, to: e.to, subject: e.subject, text: e.text, kind: e.kind, delivered: "demo" });
    save();
  }

  async listEmails() {
    return clone(load().emails);
  }

  async resetDemo() {
    memory = seed(true);
    save();
    window.dispatchEvent(new CustomEvent("mci-demo:change"));
  }

  async purgeDemo() {
    mutate((db) => {
      const demoAcc = new Set(db.accounts.filter((a) => a.isDemo).map((a) => a.id));
      db.accounts = db.accounts.filter((a) => !a.isDemo);
      db.users = db.users.filter((u) => !(u.isDemo && u.accountId && demoAcc.has(u.accountId)));
      db.orders = db.orders.filter((o) => !o.isDemo);
      db.favorites = db.favorites.filter((f) => !demoAcc.has(f.accountId));
      db.documents = db.documents.filter((d) => !demoAcc.has(d.accountId));
    });
  }
}

