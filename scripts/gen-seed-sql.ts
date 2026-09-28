/**
 * Génère supabase/seed.sql depuis le seed TypeScript (source unique de vérité).
 * Usage : npm run seed:sql   puis   supabase db reset   (ou coller dans l'éditeur SQL)
 */
import { writeFileSync } from "node:fs";
import { products } from "../src/data/catalog";
import { families } from "../src/data/families";
import { sectors } from "../src/data/sectors";
import { productToRow } from "../src/lib/backend/mappers";

const q = (v: unknown): string => {
  if (v === null || v === undefined) return "null";
  if (typeof v === "boolean") return v ? "true" : "false";
  if (typeof v === "number") return String(v);
  if (Array.isArray(v) && v.every((x) => typeof x === "string")) return `array[${v.map(q).join(",")}]::text[]`;
  if (typeof v === "object") return `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`;
  return `'${String(v).replace(/'/g, "''")}'`;
};

const qj = (v: unknown) => `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`;

const out: string[] = ["-- Généré par scripts/gen-seed-sql.ts — ne pas éditer à la main.", "begin;"];

for (const f of families) {
  out.push(
    `insert into public.families (slug, name, code, position, intro, seo, biocide) values (${[f.slug, f.name, f.code, f.position, f.intro].map(q).join(", ")}, ${qj(f.seo)}, ${q(!!f.biocide)}) on conflict (slug) do update set name = excluded.name, code = excluded.code, position = excluded.position, intro = excluded.intro, seo = excluded.seo, biocide = excluded.biocide;`,
  );
}
for (const s of sectors) {
  out.push(
    `insert into public.sectors (slug, name, grp, buyer, problem, seo, position) values (${[s.slug, s.name, s.group, s.buyer, s.problem].map(q).join(", ")}, ${qj(s.seo)}, ${q(s.position)}) on conflict (slug) do update set name = excluded.name, grp = excluded.grp, buyer = excluded.buyer, problem = excluded.problem, seo = excluded.seo, position = excluded.position;`,
  );
}
for (const p of products) {
  const r = productToRow(p);
  const cols = Object.keys(r);
  const vals = cols.map((c) => {
    const v = (r as unknown as Record<string, unknown>)[c];
    if (c === "packagings") return qj(v);
    if (Array.isArray(v) && v.length === 0) return "'{}'::text[]";
    return q(v);
  });
  out.push(`insert into public.products (${cols.join(", ")}) values (${vals.join(", ")}) on conflict (id) do nothing;`);
}
out.push(`insert into public.price_grids (name, prices) select 'Grille standard', '{}'::jsonb where not exists (select 1 from public.price_grids);`);
out.push("commit;", "");

writeFileSync(new URL("../supabase/seed.sql", import.meta.url), out.join("\n"));
console.log(`seed.sql : ${families.length} familles, ${sectors.length} secteurs, ${products.length} produits`);
