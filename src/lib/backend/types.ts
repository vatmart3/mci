import type {
  Account,
  AccountDocument,
  CartLine,
  EmailLogEntry,
  FavoriteList,
  Order,
  OrderCustomer,
  OrderStatus,
  PostalAddress,
  PriceGrid,
  Product,
  Settings,
  StructureKind,
  User,
  UserRole,
} from "@/lib/types";

export interface PlaceOrderInput {
  customer: OrderCustomer;
  delivery: PostalAddress;
  billing: PostalAddress | null;
  poNumber?: string;
  chorus: boolean;
  chorusServiceCode?: string;
  deliverySlots?: string;
  comment?: string;
  lines: CartLine[];
}

export interface SignUpInput {
  company: string;
  siret: string;
  kind: StructureKind;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  address?: PostalAddress;
}

export interface StatusUpdate {
  status: OrderStatus;
  note?: string;
  leadTime?: string;
  mciNote?: string;
  /** prix unitaires HT par index de ligne */
  prices?: (number | null)[];
}

export interface Backend {
  readonly mode: "demo" | "supabase";

  /* Session */
  getSession(): Promise<User | null>;
  signIn(email: string, password: string): Promise<User>;
  signUp(input: SignUpInput): Promise<User>;
  signOut(): Promise<void>;

  /* Comptes */
  getAccount(id: string): Promise<Account | null>;
  listAccounts(): Promise<Account[]>;
  updateAccount(id: string, patch: Partial<Account>): Promise<Account>;
  listUsers(accountId?: string): Promise<User[]>;
  addUser(accountId: string, input: { fullName: string; email: string; role: UserRole; password: string }): Promise<User>;

  /* Commandes */
  placeOrder(input: PlaceOrderInput): Promise<Order>;
  listOrders(filter?: { accountId?: string; status?: OrderStatus }): Promise<Order[]>;
  getOrder(idOrNumber: string): Promise<Order | null>;
  approveOrder(id: string): Promise<Order>;
  acceptProforma(id: string): Promise<Order>;
  updateOrderStatus(id: string, update: StatusUpdate): Promise<Order>;

  /* Favoris */
  listFavorites(accountId: string): Promise<FavoriteList[]>;
  saveFavorite(list: Omit<FavoriteList, "id"> & { id?: string }): Promise<FavoriteList>;
  deleteFavorite(id: string): Promise<void>;

  /* Documents */
  listDocuments(accountId: string): Promise<AccountDocument[]>;
  addDocument(doc: Omit<AccountDocument, "id" | "createdAt"> & { file?: File }): Promise<AccountDocument>;
  deleteDocument(id: string): Promise<void>;

  /* Réglages & tarifs */
  getSettings(): Promise<Settings>;
  updateSettings(patch: Partial<Settings>): Promise<Settings>;
  listPriceGrids(): Promise<PriceGrid[]>;
  savePriceGrid(grid: Omit<PriceGrid, "id"> & { id?: string }): Promise<PriceGrid>;

  /* Produits (admin) */
  listAllProducts(): Promise<Product[]>;
  saveProduct(p: Product): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
  uploadFile(file: File, folder: string): Promise<string>;

  /* Emails */
  listEmails(): Promise<EmailLogEntry[]>;

  /* Démo */
  resetDemo?(): Promise<void>;
  purgeDemo?(): Promise<void>;
}

export class BackendError extends Error {
  constructor(
    message: string,
    public code: "auth" | "not_found" | "forbidden" | "invalid" | "network" = "invalid",
  ) {
    super(message);
  }
}
