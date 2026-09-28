# PLAN — Refonte MCI Sète

## Phases (un commit par phase)

1. **Fondations** — Next.js 15 (App Router, TS strict), Tailwind v4 avec thème remis à zéro (seuls les tokens MCI existent), polices `next/font` (Archivo variable `wdth`, Instrument Sans, IBM Plex Mono), grille 12 colonnes, composants de base (Button, Field, Select, Tag, Drawer, Dialog, SectionHead, Crop marks), pictogrammes SVG maison, logo SVG.
2. **Données** — schéma Supabase (`supabase/migrations/0001_init.sql`) avec RLS ; seed complet §16 (`src/data/catalog.ts` → `supabase/seed.sql` généré par script) ; couche d'accès double : `DemoBackend` (seed + localStorage) / `SupabaseBackend` (supabase-js + RLS + RPC), choisie automatiquement selon la présence des clés.
3. **Catalogue** — recherche tolérante (normalisation accents, pluriels, distance d'édition, synonymes d'usage), filtres combinables synchronisés dans l'URL, liste dense / grille, pages famille, secteur, produit, visionneuse PDF.
4. **3D** — 6 contenants procéduraux (lathe/extrude), étiquettes `CanvasTexture`, scène hero (flottabilité), scène secteurs, visionneuse produit, packshots statiques (`npm run render:packshots`, Playwright + sharp).
5. **Accueil** — en-tête compactant, hero « La vitre », 01 Secteurs, 02 Le rayon (pin GSAP), 03 Commander (bon qui se remplit), 04 Faits vérifiables, 05 Équipe, footer.
6. **Commande** — bon de commande (tiroir + page), validation B2B (Zod + react-hook-form), commande rapide type tableur + import texte, numérotation `MCI-AAAA-NNNNN`, emails (Resend ou console + journal), PDF (pdf-lib).
7. **Espace pro + back-office** — comptes, validation, multi-utilisateurs (acheteur / valideur), recommander, listes favorites, documents, adresses ; admin commandes / produits / clients / réglages / tableau de bord / données démo.
8. **Finitions** — SEO (metadata, JSON-LD, sitemap, robots, OG), redirections 301 Wix, accessibilité, performances, pages légales, bandeau cookies, états vides / erreurs / chargement, 404.
9. **Contrôle** — checklist §18, `npm run lint:design`, build, parcours testés au navigateur (Playwright), `LIVRAISON.md`.

## Arborescence

```
src/
  app/
    layout.tsx, page.tsx (accueil), not-found.tsx, sitemap.ts, robots.ts, opengraph-image.tsx
    catalogue/page.tsx, catalogue/[famille]/page.tsx
    produit/[slug]/page.tsx, produit/[slug]/opengraph-image.tsx
    secteurs/[secteur]/page.tsx
    commande/page.tsx, commande/confirmation/[numero]/page.tsx
    commande-rapide/page.tsx
    espace-pro/(page|commandes|documents|adresses|favoris)/page.tsx
    societe, contact, mentions-legales, cgv, confidentialite
    admin/(page|commandes|commandes/[id]|produits|produits/[id]|clients|reglages|emails)
    api/notify/route.ts        emails transactionnels (Resend ou console)
    api/contact/route.ts       formulaire contact / devis / échantillon / FDS
    packshot/[slug]/page.tsx   studio de rendu (noindex) pour le script de packshots
  components/  ui/ brand/ layout/ catalog/ cart/ home/ three/ order/ pro/ admin/
  data/        catalog.ts (seed §16), sectors.ts, families.ts, properties.ts, demo.ts
  lib/         search.ts, format.ts, order-number.ts, pdf/, backend/ (types, demo, supabase, index), store/ (cart, ui), seo.ts, env.ts
scripts/       render-packshots.mjs, mirror-pdfs.mjs, fetch-brand.mjs, lint-design.mjs, gen-seed-sql.mjs
supabase/      migrations/0001_init.sql, seed.sql
public/        brand/, packshots/, fonts/ (TTF pour les PDF)
```

## Modèle de données

| Table | Champs principaux |
|---|---|
| `families` | `slug` PK, `name`, `position`, `intro`, `seo_text`, `is_biocide` |
| `sectors` | `slug` PK, `name`, `group` (administrations / industries / loisirs), `problem`, `seo_text`, `position` |
| `products` | `id` uuid, `slug` unique, `code`, `name`, `description`, `families text[]`, `sectors text[]`, `properties text[]`, `formats text[]`, `container` (aerosol / spray / can5 / jerrican20 / bucket / cartridge), `packagings jsonb` `[{id,label,unit}]`, `usages text[]`, `instructions`, `dilution`, `technical_sheet_url`, `sds_url`, `image_url`, `related text[]`, `variants`, `notes_admin`, `to_confirm text[]`, `active`, `featured`, `position` |
| `accounts` | structure pro : `id`, `company`, `siret`, `kind` (entreprise / collectivite / association), `status` (pending / active / suspended), `price_grid_id`, `requires_approval`, `chorus`, `chorus_service_code`, `is_demo` |
| `profiles` | `id` = `auth.users.id`, `account_id`, `full_name`, `phone`, `role` (buyer / approver / admin / sales) |
| `addresses` | `account_id`, `label`, `line1`, `line2`, `postal_code`, `city`, `access_notes`, `is_default` |
| `price_grids` / `price_grid_items` | `grid_id`, `product_id`, `packaging_id`, `unit_price_ht` |
| `orders` | `id`, `number` unique (`MCI-2026-00042`), `account_id` null (invité), `status`, `customer jsonb` (société, SIRET, type, contact…), `delivery jsonb`, `billing jsonb`, `po_number`, `chorus`, `chorus_service_code`, `delivery_slots`, `comment`, `total_ht`, `lead_time`, `mci_note`, `created_by`, `approved_by`, `is_demo`, timestamps |
| `order_lines` | `order_id`, `product_id`, `code`, `name`, `packaging_id`, `packaging_label`, `quantity`, `note`, `unit_price_ht` |
| `order_events` | `order_id`, `status`, `note`, `at`, `by` — frise chronologique |
| `documents` | `account_id`, `order_id`, `kind` (proforma / bl / facture / autre), `name`, `path` (Storage) |
| `favorite_lists` / `favorite_items` | listes « Stock atelier », « Rentrée scolaire »… |
| `settings` | clé/valeur : `price_mode`, `notify_emails`, `hours`, `socials`, `banner`, `lead_time_default` |
| `email_log` | journal des emails envoyés (ou simulés) |

Statuts de commande : `pending_approval` (validation interne du client) → `received` → `confirmed` → `preparing` → `shipped` → `delivered` ; `cancelled`.

RLS : lecture publique des produits actifs / familles / secteurs / réglages publics ; un utilisateur ne voit que les données de sa structure ; `admin` / `sales` voient et modifient tout (fonction `is_staff()`); la création de commande passe par la RPC `place_order(payload)` (security definer) qui attribue le numéro, accepte les invités, et place la commande en `pending_approval` si la structure l'exige.

## Mode démo

Aucune clé → `DemoBackend` : le catalogue vient du seed TypeScript, commandes / comptes / réglages / journal d'emails vivent dans `localStorage` (préfixe `mci-demo:`), 5 comptes et 12 commandes démo étiquetés **DÉMO**, supprimables en un clic depuis l'admin. Les emails sont journalisés (console serveur + écran « Emails » de l'admin). Identifiants démo affichés sur les écrans de connexion en mode démo uniquement.
