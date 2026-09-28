/**
 * Données de DÉMONSTRATION — fictives et étiquetées comme telles partout.
 * 5 comptes pros, 12 commandes à différents statuts, 1 admin, 1 commercial.
 * Supprimables en un clic depuis /admin/reglages.
 */
import type { Account, FavoriteList, Order, OrderLine, OrderStatus, User } from "@/lib/types";
import { products, PACK } from "@/data/catalog";
import { formatOrderNumber } from "@/lib/orders";

export const DEMO_PASSWORD = "demo1234";

export const demoCredentials = {
  admin: { email: "admin@demo.mci", password: DEMO_PASSWORD, label: "Admin MCI (démo)" },
  sales: { email: "commercial@demo.mci", password: DEMO_PASSWORD, label: "Commercial MCI (démo)" },
  buyer: { email: "acheteur.mairie@demo.mci", password: DEMO_PASSWORD, label: "Acheteur — Commune (démo)" },
  approver: { email: "valideur.mairie@demo.mci", password: DEMO_PASSWORD, label: "Valideur — Commune (démo)" },
  camping: { email: "camping@demo.mci", password: DEMO_PASSWORD, label: "Camping (démo)" },
};

export { defaultSettings } from "@/data/demo-settings";

const now = () => new Date();
const daysAgo = (d: number, h = 9) => {
  const t = now();
  t.setDate(t.getDate() - d);
  t.setHours(h, 12, 0, 0);
  return t.toISOString();
};

export function buildDemoAccounts(): Account[] {
  return [
    {
      id: "acc-demo-commune",
      company: "DÉMO — Commune de Port-Fictif, services techniques",
      siret: "00000000000001",
      kind: "collectivite",
      status: "active",
      requiresApproval: true,
      chorus: true,
      chorusServiceCode: "ST-VOIRIE",
      addresses: [
        { id: "adr-c1", label: "Centre technique municipal", line1: "12 rue de l'Exemple", postalCode: "34200", city: "Sète", accessNotes: "Quai de déchargement, 7 h 30 – 11 h 30", isDefault: true },
        { id: "adr-c2", label: "Groupe scolaire", line1: "3 avenue Fictive", postalCode: "34200", city: "Sète", accessNotes: "Accès par le portail gardien" },
      ],
      billing: { company: "Commune de Port-Fictif", line1: "Hôtel de ville, place Fictive", postalCode: "34200", city: "Sète" },
      createdAt: daysAgo(120),
      isDemo: true,
    },
    {
      id: "acc-demo-camping",
      company: "DÉMO — Camping Les Salins fictifs",
      siret: "00000000000002",
      kind: "entreprise",
      status: "active",
      requiresApproval: false,
      chorus: false,
      addresses: [{ id: "adr-k1", label: "Accueil camping", line1: "Route de l'Exemple", postalCode: "34340", city: "Marseillan", accessNotes: "Livraison avant 10 h en saison", isDefault: true }],
      billing: null,
      createdAt: daysAgo(90),
      isDemo: true,
    },
    {
      id: "acc-demo-cave",
      company: "DÉMO — Cave coopérative fictive",
      siret: "00000000000003",
      kind: "entreprise",
      status: "active",
      requiresApproval: false,
      chorus: false,
      addresses: [{ id: "adr-v1", label: "Chai", line1: "Chemin des Vignes fictives", postalCode: "34850", city: "Pinet", isDefault: true }],
      billing: null,
      createdAt: daysAgo(75),
      isDemo: true,
    },
    {
      id: "acc-demo-lycee",
      company: "DÉMO — Lycée professionnel fictif",
      siret: "00000000000004",
      kind: "collectivite",
      status: "active",
      requiresApproval: false,
      chorus: true,
      chorusServiceCode: "INTENDANCE",
      addresses: [{ id: "adr-l1", label: "Intendance", line1: "1 boulevard de l'Exemple", postalCode: "34000", city: "Montpellier", isDefault: true }],
      billing: null,
      createdAt: daysAgo(40),
      isDemo: true,
    },
    {
      id: "acc-demo-garage",
      company: "DÉMO — Garage du Port fictif",
      siret: "00000000000005",
      kind: "entreprise",
      status: "pending",
      requiresApproval: false,
      chorus: false,
      addresses: [{ id: "adr-g1", label: "Atelier", line1: "Quai de l'Exemple", postalCode: "34110", city: "Frontignan", isDefault: true }],
      billing: null,
      createdAt: daysAgo(2),
      isDemo: true,
    },
  ];
}

export function buildDemoUsers(): (User & { password: string })[] {
  return [
    { id: "u-demo-admin", email: demoCredentials.admin.email, fullName: "Admin MCI (démo)", role: "admin", accountId: null, password: DEMO_PASSWORD, isDemo: true },
    { id: "u-demo-sales", email: demoCredentials.sales.email, fullName: "Commercial MCI (démo)", role: "sales", accountId: null, password: DEMO_PASSWORD, isDemo: true },
    { id: "u-demo-buyer", email: demoCredentials.buyer.email, fullName: "Agent technique (démo)", phone: "04 00 00 00 01", role: "buyer", accountId: "acc-demo-commune", password: DEMO_PASSWORD, isDemo: true },
    { id: "u-demo-approver", email: demoCredentials.approver.email, fullName: "Responsable achats (démo)", phone: "04 00 00 00 02", role: "approver", accountId: "acc-demo-commune", password: DEMO_PASSWORD, isDemo: true },
    { id: "u-demo-camping", email: demoCredentials.camping.email, fullName: "Gérance camping (démo)", phone: "04 00 00 00 03", role: "approver", accountId: "acc-demo-camping", password: DEMO_PASSWORD, isDemo: true },
    { id: "u-demo-cave", email: "cave@demo.mci", fullName: "Chef de cave (démo)", phone: "04 00 00 00 04", role: "approver", accountId: "acc-demo-cave", password: DEMO_PASSWORD, isDemo: true },
    { id: "u-demo-lycee", email: "lycee@demo.mci", fullName: "Intendance (démo)", phone: "04 00 00 00 05", role: "approver", accountId: "acc-demo-lycee", password: DEMO_PASSWORD, isDemo: true },
    { id: "u-demo-garage", email: "garage@demo.mci", fullName: "Chef d'atelier (démo)", phone: "04 00 00 00 06", role: "approver", accountId: "acc-demo-garage", password: DEMO_PASSWORD, isDemo: true },
  ];
}

function line(slug: string, packId: string, quantity: number, price?: number): OrderLine {
  const p = products.find((x) => x.slug === slug);
  if (!p) throw new Error(`démo : produit ${slug}`);
  const pack = p.packagings.find((k) => k.id === packId) ?? p.packagings[0]!;
  return { productId: p.id, code: p.code, name: p.short, packagingId: pack.id, packagingLabel: pack.label, quantity, unitPriceHt: price ?? null };
}

const flow: OrderStatus[] = ["received", "confirmed", "preparing", "shipped", "delivered"];

export function buildDemoOrders(accounts: Account[], users: User[]): Order[] {
  const acc = (id: string) => accounts.find((a) => a.id === id)!;
  const usr = (accId: string) => users.find((u) => u.accountId === accId)!;
  const specs: Array<{ acc: string; status: OrderStatus; days: number; lines: OrderLine[]; po?: string; priced?: boolean }> = [
    { acc: "acc-demo-commune", status: "delivered", days: 64, po: "ENG-2026-0412", lines: [line("detag", "5l", 2, 1), line("detag-lingettes", "seau-100", 3, 1), line("kermex", "20l", 1, 1)], priced: true },
    { acc: "acc-demo-camping", status: "delivered", days: 52, lines: [line("sanikel-renforce", "20l", 4, 1), line("bional", "5l", 6, 1), line("desobio10", "5l", 2, 1), line("lessive-linge", "20l", 2, 1)], priced: true },
    { acc: "acc-demo-cave", status: "shipped", days: 12, lines: [line("redox", "20l", 2, 1), line("peroxyl", "20l", 2, 1), line("npv", "5l", 3, 1)], priced: true },
    { acc: "acc-demo-lycee", status: "shipped", days: 9, po: "BC-LP-118", lines: [line("dg90", "5l", 2, 1), line("steribac", "5l", 2, 1), line("stersol", "5l", 4, 1)], priced: true },
    { acc: "acc-demo-commune", status: "preparing", days: 6, po: "ENG-2026-0537", lines: [line("super-granul", "20kg", 5, 1), line("deverglacant", "20kg", 10, 1)], priced: true },
    { acc: "acc-demo-camping", status: "preparing", days: 5, lines: [line("oxychoc", "carton-12", 1, 1), line("forcegel-ultra", "seringue", 6, 1)], priced: true },
    { acc: "acc-demo-cave", status: "confirmed", days: 3, lines: [line("redox-nf", "20l", 2, 1), line("detarcirc", "20l", 1, 1)], priced: true },
    { acc: "acc-demo-lycee", status: "confirmed", days: 3, po: "BC-LP-131", lines: [line("sanikel-renforce", "5l", 6, 1), line("ecodyl", "5l", 4, 1), line("multispray", "750ml", 12, 1)], priced: true },
    { acc: "acc-demo-camping", status: "received", days: 1, lines: [line("actifosse", "10kg", 1), line("sanitartre", "750ml", 12)] },
    { acc: "acc-demo-cave", status: "received", days: 0, lines: [line("kermex", "20l", 1), line("das-30", "20l", 1)] },
    { acc: "acc-demo-commune", status: "pending_approval", days: 0, po: "ENG-2026-0560", lines: [line("speed", "20l", 3), line("oxychoc", "carton-12", 2)] },
    { acc: "acc-demo-lycee", status: "cancelled", days: 20, po: "BC-LP-099", lines: [line("vitrex-l", "5l", 2)] },
  ];
  // Prix unitaires fictifs, uniquement pour la démo des commandes confirmées (étiquetés DÉMO dans l'admin).
  const demoPrice = (i: number) => [18.5, 24, 42, 9.9, 31, 56, 12.4][i % 7]!;
  return specs.map((s, i) => {
    const a = acc(s.acc);
    const u = usr(s.acc);
    const created = daysAgo(s.days, 8 + (i % 6));
    const idx = flow.indexOf(s.status);
    const events =
      s.status === "cancelled"
        ? [
            { status: "received" as const, at: created },
            { status: "cancelled" as const, at: daysAgo(s.days - 1), note: "Annulée à la demande du client (démo)." },
          ]
        : s.status === "pending_approval"
          ? [{ status: "pending_approval" as const, at: created, note: "En attente du valideur de la structure." }]
          : flow.slice(0, idx + 1).map((st, k) => ({ status: st, at: daysAgo(Math.max(0, s.days - k * 2), 10 + k) }));
    const lines = s.priced ? s.lines.map((l, k) => ({ ...l, unitPriceHt: demoPrice(i + k) })) : s.lines.map((l) => ({ ...l, unitPriceHt: null }));
    const addr = a.addresses[0]!;
    return {
      id: `ord-demo-${i + 1}`,
      number: formatOrderNumber(2026, 31 + i),
      accountId: a.id,
      status: s.status,
      customer: { company: a.company, siret: a.siret, kind: a.kind, contactName: u.fullName, phone: u.phone ?? "", email: u.email },
      delivery: { ...addr },
      billing: a.billing ?? null,
      poNumber: s.po,
      chorus: a.chorus,
      chorusServiceCode: a.chorusServiceCode,
      deliverySlots: addr.accessNotes,
      lines,
      leadTime: s.priced ? "Sous 72 h ouvrées (démo)" : undefined,
      mciNote: s.priced ? "DÉMO — tarifs fictifs" : undefined,
      createdAt: created,
      updatedAt: events[events.length - 1]!.at,
      createdBy: u.id,
      customerAcceptedAt: s.priced && idx >= 2 ? daysAgo(Math.max(0, s.days - 2)) : undefined,
      events,
      isDemo: true,
    } satisfies Order;
  });
}

export function buildDemoFavorites(): FavoriteList[] {
  const id = (slug: string) => products.find((p) => p.slug === slug)!.id;
  return [
    {
      id: "fav-demo-1",
      accountId: "acc-demo-commune",
      name: "Stock voirie",
      lines: [
        { productId: id("detag"), packagingId: "5l", quantity: 2 },
        { productId: id("detag-lingettes"), packagingId: "seau-100", quantity: 2 },
        { productId: id("super-granul"), packagingId: "20kg", quantity: 4 },
      ],
    },
    {
      id: "fav-demo-2",
      accountId: "acc-demo-commune",
      name: "Rentrée scolaire",
      lines: [
        { productId: id("sanikel-renforce"), packagingId: "5l", quantity: 6 },
        { productId: id("ecodyl"), packagingId: "5l", quantity: 4 },
        { productId: id("vitrex-l"), packagingId: "5l", quantity: 2 },
      ],
    },
    {
      id: "fav-demo-3",
      accountId: "acc-demo-camping",
      name: "Ouverture saison",
      lines: [
        { productId: id("sanikel-renforce"), packagingId: "20l", quantity: 4 },
        { productId: id("bional"), packagingId: "5l", quantity: 6 },
        { productId: id("oxychoc"), packagingId: PACK.carton12.id, quantity: 1 },
      ],
    },
  ];
}

export const DEMO_ORDER_SEQ_START = 43;
