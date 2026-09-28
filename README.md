# MCI Sète — site vitrine, catalogue et commande B2B

Refonte de mci-sete.com par MJAGENCY : catalogue de 90 références avec recherche et filtres, fiches produit en 3D, bon de commande B2B (invité ou compte pro), commande rapide par référence, espace pro, back-office.

- **Next.js 15** (App Router, TypeScript strict) · **Tailwind CSS v4** (thème remis à zéro, tokens MCI uniquement)
- **Three.js** via @react-three/fiber / drei (packaging procédural) · **GSAP + ScrollTrigger** · **Lenis**
- **Supabase** (Postgres, Auth, Storage, RLS) · **Resend** (emails) · **Zod** + **react-hook-form** · **pdf-lib**

Voir aussi : [DESIGN_NOTES.md](DESIGN_NOTES.md) (direction artistique), [PLAN.md](PLAN.md) (architecture), [LIVRAISON.md](LIVRAISON.md) (état, infos attendues de MCI, mise en ligne).

---

## Démarrer en local (mode démo, aucune clé)

```bash
npm install
npm run dev            # http://localhost:3000
```

Sans variable d'environnement, le site passe automatiquement en **mode démo** :

- catalogue issu du seed (`src/data/catalog.ts`) ;
- commandes, comptes, réglages, documents et journal d'emails stockés dans le navigateur (`localStorage`, préfixe `mci-demo:`) ;
- 5 comptes pros et 12 commandes fictifs, étiquetés **DÉMO**, supprimables depuis `/admin/reglages` ;
- les emails ne partent pas : ils sont affichés dans `/admin/emails` et écrits dans la console du serveur.

Identifiants de démonstration (affichés sur les écrans de connexion en mode démo, mot de passe `demo1234`) :

| Rôle | Email |
|---|---|
| Admin MCI | `admin@demo.mci` |
| Commercial MCI | `commercial@demo.mci` |
| Acheteur d'une commune (validation requise) | `acheteur.mairie@demo.mci` |
| Valideur de la commune | `valideur.mairie@demo.mci` |
| Camping | `camping@demo.mci` |

## Scripts

| Commande | Rôle |
|---|---|
| `npm run dev` / `build` / `start` | Next.js |
| `npm run typecheck` | TypeScript strict |
| `npm run lint:design` | Contrôle automatique des interdits de charte (dégradés, blur, Inter, Lucide, rayons, emojis, espacements hors échelle…) |
| `npm run check` | typecheck + lint:design + build |
| `npm run seed:sql` | Régénère `supabase/seed.sql` depuis le seed TypeScript |
| `npm run render:packshots` | Rend les packshots WebP de chaque produit depuis la 3D (Playwright + sharp). `-- dg90 cst` pour une sélection ; `PACKSHOT_BASE=http://localhost:3000` pour utiliser un serveur déjà lancé |
| `npm run fetch:brand` | Rapatrie logo d'origine, photos (équipe, bâtiment) et agrément depuis Wix vers `public/brand` |
| `npm run mirror:pdfs` | Copie toutes les fiches techniques Wix dans Supabase Storage et met à jour les liens (`-- --dry-run` pour vérifier) |

## Passer en production (Supabase + Resend + Vercel)

1. **Supabase** : créer un projet (région UE), puis dans l'éditeur SQL exécuter `supabase/migrations/0001_init.sql` puis `supabase/seed.sql` (ou `supabase db push` + `psql -f supabase/seed.sql`).
2. Créer le premier compte admin : s'inscrire sur `/espace-pro`, puis dans Supabase :
   `update profiles set role = 'admin', account_id = null where email = 'vous@mci-sete.com';`
3. **Resend** : vérifier le domaine d'envoi, créer une clé API.
4. **Vercel** : importer le dépôt, renseigner les variables de `.env.example` :
   - `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
   - `RESEND_API_KEY`, `EMAIL_FROM`, `MCI_NOTIFY_EMAILS`
5. Optionnel : `npm run mirror:pdfs` (fiches techniques hébergées chez vous) et `npm run fetch:brand` (photos locales), puis redéployer.

Pour une présentation sur l'environnement de production : `NEXT_PUBLIC_FORCE_DEMO=1` force le mode démo.

## Architecture en bref

```
src/app/(site)       pages publiques, espace pro, commande      src/lib/backend     DemoBackend / SupabaseBackend (même interface)
src/app/(admin)      back-office /admin                        src/lib/search.ts   recherche tolérante (accents, pluriels, fautes, usages)
src/app/(studio)     /packshot/[slug] (rendu des packshots)     src/lib/pdf         bon de commande / pro-forma (pdf-lib)
src/components/three contenants 3D procéduraux, étiquettes      supabase/           schéma, RLS, fonctions (place_order…), seed
```

Sécurité : toutes les tables sont en RLS ; la création de commande passe par la fonction `place_order` (invités acceptés, numérotation `MCI-AAAA-NNNNN`) ; un client ne peut ni valider son compte, ni changer sa grille tarifaire, ni rejoindre une autre structure (gardes SQL testées).

## Crédits

Polices Geist et Geist Mono (site), Archivo, Instrument Sans et IBM Plex Mono (PDF et images Open Graph) — SIL Open Font License. Site conçu par MJAGENCY.
