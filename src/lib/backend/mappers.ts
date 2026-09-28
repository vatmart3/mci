import type { Product } from "@/lib/types";

/** Ligne `products` telle que stockée dans Supabase (snake_case). */
export interface ProductRow {
  id: string;
  slug: string;
  code: string;
  short: string;
  description: string;
  families: Product["families"];
  sectors: Product["sectors"];
  properties: Product["properties"];
  formats: Product["formats"];
  container: Product["container"];
  packagings: Product["packagings"];
  usages: string[];
  variants: string | null;
  instructions: string | null;
  dilution: string | null;
  technical_sheet_url: string | null;
  sds_url: string | null;
  image_url: string | null;
  related: string[];
  to_confirm: string[];
  admin_note: string | null;
  active: boolean;
  featured: boolean;
  position: number;
}

const u = <T,>(v: T | null | undefined): T | undefined => (v === null ? undefined : v);

export function rowToProduct(r: ProductRow): Product {
  return {
    id: r.id,
    slug: r.slug,
    code: r.code,
    short: r.short,
    description: r.description,
    families: r.families ?? [],
    sectors: r.sectors ?? [],
    properties: r.properties ?? [],
    formats: r.formats ?? [],
    container: r.container,
    packagings: r.packagings ?? [],
    usages: r.usages ?? [],
    variants: u(r.variants),
    instructions: u(r.instructions),
    dilution: u(r.dilution),
    technicalSheetUrl: u(r.technical_sheet_url),
    sdsUrl: u(r.sds_url),
    imageUrl: u(r.image_url),
    related: r.related ?? [],
    toConfirm: r.to_confirm ?? [],
    adminNote: u(r.admin_note),
    active: r.active,
    featured: r.featured,
    position: r.position,
  };
}

export function productToRow(p: Product): ProductRow {
  return {
    id: p.id,
    slug: p.slug,
    code: p.code,
    short: p.short,
    description: p.description,
    families: p.families,
    sectors: p.sectors,
    properties: p.properties,
    formats: p.formats,
    container: p.container,
    packagings: p.packagings,
    usages: p.usages,
    variants: p.variants ?? null,
    instructions: p.instructions ?? null,
    dilution: p.dilution ?? null,
    technical_sheet_url: p.technicalSheetUrl ?? null,
    sds_url: p.sdsUrl ?? null,
    image_url: p.imageUrl ?? null,
    related: p.related,
    to_confirm: p.toConfirm,
    admin_note: p.adminNote ?? null,
    active: p.active,
    featured: p.featured,
    position: p.position,
  };
}
