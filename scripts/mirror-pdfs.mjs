#!/usr/bin/env node
/**
 * Rapatrie toutes les fiches techniques (liens Wix d'origine) dans Supabase Storage
 * (bucket public « product-files », dossier fiches-techniques/) et met à jour
 * products.technical_sheet_url. L'URL d'origine est conservée dans products.admin_note.
 *
 *   NEXT_PUBLIC_SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… npm run mirror:pdfs
 *   npm run mirror:pdfs -- --dry-run        → vérifie seulement que chaque PDF répond
 */
import { createClient } from "@supabase/supabase-js";

const dry = process.argv.includes("--dry-run");
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis.");
  process.exit(1);
}
const sb = createClient(url, key, { auth: { persistSession: false } });
const { data: products, error } = await sb.from("products").select("id, code, technical_sheet_url, admin_note").not("technical_sheet_url", "is", null);
if (error) throw error;

let ok = 0;
let ko = 0;
for (const p of products) {
  const src = p.technical_sheet_url;
  if (!/usrfiles\.com|wix/.test(src)) continue; // déjà rapatrié
  try {
    const res = await fetch(src);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const type = res.headers.get("content-type") ?? "";
    const buf = Buffer.from(await res.arrayBuffer());
    if (!type.includes("pdf") && buf.subarray(0, 4).toString() !== "%PDF") throw new Error(`pas un PDF (${type})`);
    if (dry) {
      console.log(`✓ ${p.code} (${(buf.length / 1024).toFixed(0)} Ko)`);
      ok++;
      continue;
    }
    const name = `fiches-techniques/${p.id}-${src.split("/").pop()}`;
    const up = await sb.storage.from("product-files").upload(name, buf, { contentType: "application/pdf", upsert: true });
    if (up.error) throw up.error;
    const publicUrl = sb.storage.from("product-files").getPublicUrl(name).data.publicUrl;
    const note = [p.admin_note, `FT d'origine : ${src}`].filter(Boolean).join(" · ");
    const { error: e2 } = await sb.from("products").update({ technical_sheet_url: publicUrl, admin_note: note }).eq("id", p.id);
    if (e2) throw e2;
    console.log(`✓ ${p.code} → ${publicUrl}`);
    ok++;
  } catch (e) {
    console.error(`✗ ${p.code} : ${e.message} (${src})`);
    ko++;
  }
}
console.log(`\n${ok} fiche(s) ${dry ? "vérifiée(s)" : "rapatriée(s)"}, ${ko} en erreur.`);
process.exit(ko ? 1 : 0);
