export type FamilySlug =
  | "absorbants"
  | "aerosols"
  | "decapants-detartrants"
  | "detergents-desinfectants"
  | "desherbants-insecticides-biocides"
  | "surodorants-shampooings"
  | "produits-bio"
  | "peintures-savons-solvants"
  | "produits-specifiques";

export type SectorSlug =
  | "mairies"
  | "ecoles-universites"
  | "equipements-sportifs"
  | "viticulture"
  | "agriculture"
  | "biotechnologie"
  | "automobile"
  | "campings"
  | "nautisme";

export type SectorGroup = "administrations" | "industries" | "loisirs";

export type PropertySlug =
  | "contact-alimentaire"
  | "bio-vegetal"
  | "biocide"
  | "sans-chlore"
  | "sans-solvant-chlore"
  | "pae"
  | "biocontrole";

export type Format = "aerosol" | "liquide" | "gel" | "poudre" | "granules" | "lingettes" | "pate" | "textile";

/** Les 6 contenants modélisés en 3D */
export type ContainerKind = "aerosol" | "spray" | "can5" | "jerrican20" | "bucket" | "cartridge";

export interface Packaging {
  /** identifiant stable, ex. "5l" */
  id: string;
  /** libellé complet, ex. "Bidon 5 L" */
  label: string;
  /** libellé court mono, ex. "5 L" */
  short: string;
  container: ContainerKind;
}

export interface Family {
  slug: FamilySlug;
  name: string;
  /** code court pour la réglette / l'étiquette */
  code: string;
  position: number;
  intro: string;
  seo: string[];
  biocide?: boolean;
}

export interface Sector {
  slug: SectorSlug;
  name: string;
  group: SectorGroup;
  /** qui achète, en une ligne */
  buyer: string;
  /** le problème terrain */
  problem: string;
  seo: string[];
  position: number;
}

export interface Product {
  id: string;
  slug: string;
  /** nom commercial tel qu'imprimé sur l'étiquette */
  code: string;
  /** nom générique court, ex. « Dégraissant graisses cuites » */
  short: string;
  description: string;
  families: FamilySlug[];
  sectors: SectorSlug[];
  properties: PropertySlug[];
  formats: Format[];
  container: ContainerKind;
  packagings: Packaging[];
  usages: string[];
  /** variantes existantes (« existe en gel », etc.) */
  variants?: string;
  instructions?: string;
  dilution?: string;
  technicalSheetUrl?: string;
  sdsUrl?: string;
  imageUrl?: string;
  related: string[];
  /** champs à faire valider par MCI — affichés [À CONFIRMER] dans l'admin uniquement */
  toConfirm: string[];
  adminNote?: string;
  active: boolean;
  featured: boolean;
  position: number;
}

export type PriceMode = "on_request" | "per_account" | "public";

export type OrderStatus =
  | "pending_approval"
  | "received"
  | "confirmed"
  | "preparing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type StructureKind = "entreprise" | "collectivite" | "association";

export interface CartLine {
  productId: string;
  packagingId: string;
  quantity: number;
  note?: string;
}

export interface PostalAddress {
  label?: string;
  company?: string;
  line1: string;
  line2?: string;
  postalCode: string;
  city: string;
  accessNotes?: string;
}

export interface OrderCustomer {
  company: string;
  siret: string;
  kind: StructureKind;
  contactName: string;
  phone: string;
  email: string;
}

export interface OrderLine {
  productId: string;
  code: string;
  name: string;
  packagingId: string;
  packagingLabel: string;
  quantity: number;
  note?: string;
  unitPriceHt?: number | null;
}

export interface OrderEvent {
  status: OrderStatus;
  at: string;
  note?: string;
  by?: string;
}

export interface Order {
  id: string;
  number: string;
  accountId: string | null;
  status: OrderStatus;
  customer: OrderCustomer;
  delivery: PostalAddress;
  billing: PostalAddress | null;
  poNumber?: string;
  chorus: boolean;
  chorusServiceCode?: string;
  deliverySlots?: string;
  comment?: string;
  lines: OrderLine[];
  leadTime?: string;
  mciNote?: string;
  totalHt?: number | null;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  approvedBy?: string;
  /** validation de la pro-forma par le client (mode on_request) */
  customerAcceptedAt?: string;
  events: OrderEvent[];
  isDemo?: boolean;
}

export type AccountStatus = "pending" | "active" | "suspended";
export type UserRole = "buyer" | "approver" | "admin" | "sales";

export interface Account {
  id: string;
  company: string;
  siret: string;
  kind: StructureKind;
  status: AccountStatus;
  priceGridId?: string | null;
  requiresApproval: boolean;
  chorus: boolean;
  chorusServiceCode?: string;
  addresses: (PostalAddress & { id: string; isDefault?: boolean })[];
  billing?: PostalAddress | null;
  createdAt: string;
  isDemo?: boolean;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  accountId: string | null;
  isDemo?: boolean;
}

export interface FavoriteList {
  id: string;
  accountId: string;
  name: string;
  lines: CartLine[];
}

export interface AccountDocument {
  id: string;
  accountId: string;
  orderId?: string;
  kind: "proforma" | "bl" | "facture" | "autre";
  name: string;
  /** URL (Storage) ou data: URL en mode démo */
  url: string;
  createdAt: string;
}

export interface PriceGrid {
  id: string;
  name: string;
  /** clé `${productId}:${packagingId}` → prix HT */
  prices: Record<string, number>;
}

export interface Settings {
  priceMode: PriceMode;
  notifyEmails: string[];
  hours: string;
  banner: string;
  socials: { label: string; url: string }[];
  leadTimeDefault: string;
}

export interface EmailLogEntry {
  id: string;
  at: string;
  to: string[];
  subject: string;
  text: string;
  kind: string;
  delivered: "resend" | "console" | "demo";
}
