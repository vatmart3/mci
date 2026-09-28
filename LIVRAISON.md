# LIVRAISON — Refonte MCI Sète

Branche : `claude/funny-mccarthy-vvhy72` · Next.js 15 · déployable tel quel sur Vercel (mode démo sans aucune clé).

---

## 1. Ce qui est fait

**Site public**
- Accueil : hero « La vitre » (buée, raclette, essuyage au doigt, 3D derrière la vitre), 01 Secteurs (liste typographique + sélection 3D), 02 Le rayon (scroll horizontal épinglé), 03 Commander (bon papier qui se remplit, tampon), 04 Faits vérifiables, 05 Équipe + schéma de situation, pied de page (Mont Saint-Clair).
- Catalogue : 90 références (seed §16 corrigé, doublons fusionnés), recherche tolérante (accents, pluriels, fautes, vocabulaire terrain), filtres combinables synchronisés dans l'URL, liste dense / grille, état vide utile.
- 9 pages famille (dont 2 « gamme sur demande » avec formulaire), 9 pages secteur, 90 fiches produit (contenant 3D interactif, FT en visionneuse, FDS sur demande, échantillon / conseil, « souvent commandé avec », mention biocides).
- Société, Contact (devis / échantillon / FDS / conseil), mentions légales, CGV (provisoires), confidentialité, 404, page d'erreur.

**Commande B2B**
- Bon de commande persistant (tiroir + page), validation B2B complète (SIRET, collectivité → n° d'engagement obligatoire, Chorus Pro + code service, adresses, créneaux, facturation), commande invité ou connectée.
- Numérotation `MCI-AAAA-NNNNN`, emails client + MCI, PDF du bon de commande et de la pro-forma.
- Commande rapide façon tableur + import `CODE;CONDITIONNEMENT;QTÉ`.
- Prix : `on_request` (défaut), `per_account`, `public`, réglables dans l'admin. Aucun paiement en ligne (architecture prête pour un ajout ultérieur, rien d'activé).

**Espace pro** : tableau de bord, « Recommander » en un clic, validation interne acheteur → valideur, pro-forma à valider, listes favorites, documents (BL, factures, pro-formas, FT des produits achetés), adresses, utilisateurs de la structure.

**Back-office `/admin`** : tableau de bord, commandes (prix, délai, statuts avec emails, pro-forma, dépôt de documents, export CSV), produits (CRUD complet, uploads), clients (validation, grilles tarifaires, validation interne, utilisateurs), réglages (price_mode, horaires, bandeau, délai, réseaux, notifications, données DÉMO), journal des emails.

**Technique** : Supabase (schéma + RLS + fonctions SQL, testé sur Postgres 16), mode démo complet, 3D procédurale (6 contenants, étiquettes générées), 90 packshots WebP (724 Ko), Open Graph par produit, sitemap (116 URL), robots, redirections 301 Wix, JSON-LD (Organization, LocalBusiness, Product sans offers, BreadcrumbList, ItemList).

---

## 2. Checklist d'acceptation (§18) — état vérifié

| Critère | État | Comment c'est vérifié |
|---|---|---|
| Aucun élément de la liste §6 | ✅ | `npm run lint:design` (grep automatisé : gradient, backdrop-blur, Inter/Roboto/Poppins, lucide/heroicons, rounded-lg→3xl, bg-clip-text, grosses ombres, liserés, curseurs, dark mode, emojis, espacements hors échelle) : 0 écart sur 141 fichiers |
| Palette limitée aux tokens, orange = actions | ✅ | Thème Tailwind remis à zéro : seules les 10 couleurs MCI existent. Orange utilisé pour ajouter / commander / valider / recommander (+ soleil du logo, tampon « VALIDÉ » demandé par le brief) |
| Aucun débordement horizontal 320 → 1920 px | ✅ | Script Playwright : 16 pages × 8 largeurs (320, 375, 414, 768, 1024, 1280, 1440, 1920) |
| « graisse cuite » → DG90 5 L × 2 → commande invité < 2 min | ✅ | Parcours automatisé de bout en bout (dont refus sans n° d'engagement pour une collectivité, PDF téléchargé) |
| Compte pro : recommander en 1 clic | ✅ | Parcours automatisé : « Recommander » → bon prérempli → envoi |
| Back-office : Reçue → Livrée avec emails | ✅ | Parcours automatisé : saisie des prix, Confirmée → En préparation → Expédiée → Livrée, 6 emails journalisés |
| Validation interne acheteur → valideur | ✅ | Parcours automatisé (commune démo) |
| Toutes les fiches techniques existantes s'ouvrent | ⚠️ à vérifier | Les 74 liens d'origine (usrfiles.com) sont repris à l'identique du brief. L'environnement de développement n'avait pas accès à ces domaines : lancez `npm run mirror:pdfs -- --dry-run` (avec Supabase) ou ouvrez quelques fiches après déploiement |
| Mention biocides | ✅ | Fiches des produits biocides, page famille Biocides, pages secteur concernées, CGV, mentions légales |
| Lighthouse mobile ≥ 85 / ≥ 95 / 100 / ≥ 95 | ✅ | Voir tableau ci-dessous |
| `prefers-reduced-motion` ; repli sans WebGL | ✅ | Testé : pas de vitre, pas de Lenis, pas d'épinglage, bon déjà rempli, contenants immobiles ; sans WebGL : packshots statiques, aucune erreur |
| Fonctionne entièrement sans clé d'API | ✅ | Tous les tests ci-dessus ont été faits en mode démo |
| Aucun contenu inventé présenté comme un fait | ✅ | Pas de témoignage, logo client, certification ni prix public. Comptes et commandes démo étiquetés DÉMO (tarifs de démo marqués « fictifs »). Chiffres affichés calculés depuis la base |
| `npm run build` sans erreur ni warning TypeScript | ✅ | `npm run check` (typecheck + lint:design + build) |

**Lighthouse mobile** (build de production local, émulation mobile, 4G simulée) :

| Page | Perf. | Access. | Bonnes pratiques | SEO |
|---|---|---|---|---|
| `/` | 90 | 100 | 100 | 100 |
| `/catalogue` | 85 | 100 | 100 | 100 |
| `/catalogue/aerosols` | 89 | 100 | 100 | 100 |
| `/produit/dg90` | 89 | 100 | 100 | 100 |
| `/secteurs/viticulture` | 91 | 100 | 100 | 100 |
| `/commande-rapide` | 90 | 100 | 100 | 100 |
| `/societe` | 97 | 100 | 96* | 100 |
| `/contact` | 97 | 100 | 100 | 100 |

\* 96 uniquement parce que les photos Wix étaient bloquées par le réseau de l'environnement de test (erreur console). `/espace-pro` et `/admin` sont volontairement en `noindex` (SEO non applicable).
Mesures CPU-bound en émulation logicielle : les scores sur Vercel + vrai mobile seront du même ordre ou meilleurs. LCP simulé 2,4–3,3 s (objectif < 2,5 s sur 4G réelle atteint sur les pages les plus légères ; le catalogue reste la page la plus lourde). CLS ≤ 0,01 hors espace pro.

---

## 3. Ce qui attend des informations de MCI

Tout est affiché `[À CONFIRMER]` dans l'admin et **masqué côté public**.

1. **Conditionnements réels** par produit (valeurs par défaut du brief appliquées : aérosol → carton de 12 ; liquide → 5 L / 20 L / 1 L ; gel → 750 ml / 5 L ; poudre, granulés → 10 kg / 20 kg ; lingettes → seau de 100).
2. **Propriétés** (contact alimentaire, bio, biocide, PAE, sans chlore…) et **affectations produits ↔ secteurs** : pré-remplies d'après les descriptions, à valider fiche par fiche (`/admin/produits?a-confirmer=1`).
3. **Modes d'emploi et dilutions** (aujourd'hui : renvoi vers la fiche technique).
4. **FDS** : aucune en ligne ; formulaire de demande sur chaque fiche. À téléverser dans l'admin.
5. **Fiches techniques manquantes** (16 produits) et points signalés :
   - INSECTIBAC et INSECTILAC pointent vers le même PDF ;
   - INSECTICIDE BIO a deux versions de fiche ;
   - VITREX et VITREX L partagent une fiche ;
   - HIBERNATUS n'a aucune description ;
   - MAXIS NF reclassé en Détergents – Désinfectants (était en Surodorants).
6. **Horaires, délai de livraison par défaut, zone de livraison, minimum de commande** (réglages admin ; aucun n'est affirmé publiquement).
7. **Mentions légales** : forme juridique, SIRET, RCS, TVA, directeur de la publication. **CGV** : texte définitif (la version en ligne est provisoire et ne contient aucune condition inventée).
8. **Réseaux sociaux** : aucun lien affiché tant que les vrais comptes ne sont pas saisis.
9. **Logo** : redessiné en SVG d'après sa description (soleil orange + vague bleue) car l'original n'était pas téléchargeable depuis l'environnement de développement. `npm run fetch:brand` rapatrie l'original pour comparaison et les photos (équipe, bâtiment) ; ajuster `src/components/brand/Logo.tsx` si besoin.
10. **Gammes « Peintures – Savons – Solvants » et « Produits spécifiques »** : à remplir depuis l'admin.
11. **Grilles tarifaires** : vides (aucun prix inventé) ; à saisir dans `/admin/clients` → « Grilles tarifaires » si le mode `per_account` ou `public` est choisi.

---

## 4. Mettre en ligne sur Vercel

**Projet Vercel** : `mci`, relié au dépôt `vatmart3/mci` (déploiement automatique à chaque envoi de code). Pour un accès public sans connexion : Settings → Deployment Protection → désactiver « Vercel Authentication ».

**Présentation (mode démo, 5 minutes)**
1. Importer le dépôt dans Vercel (framework détecté : Next.js). Aucune variable nécessaire.
2. Optionnel : `NEXT_PUBLIC_SITE_URL=https://<domaine>` pour les URL canoniques et Open Graph.
3. Déployer. Identifiants démo : `admin@demo.mci` / `demo1234` (voir README).

**Production**
1. Supabase (région UE) : exécuter `supabase/migrations/0001_init.sql` puis `supabase/seed.sql`.
2. Resend : vérifier le domaine d'envoi.
3. Variables Vercel (voir `.env.example`) : `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `EMAIL_FROM`, `MCI_NOTIFY_EMAILS`.
4. Créer le compte admin (inscription puis `update profiles set role='admin', account_id=null where email=…`).
5. `npm run mirror:pdfs` pour héberger les fiches techniques chez MCI.
6. Domaine : pointer `www.mci-sete.com` vers Vercel ; les anciennes URL Wix redirigent en 301.

---

## 5. Points d'attention

- **Supabase non testé en conditions réelles** : le schéma, la RLS et les fonctions (`place_order`, `approve_order`, `accept_proforma`, `get_guest_order`, déclencheur d'inscription, gardes anti-élévation) ont été exécutés et testés sur un Postgres 16 local avec des stubs `auth` / `storage` ; le client `SupabaseBackend` n'a pas pu être exercé contre un vrai projet depuis cet environnement. Faire un parcours complet (inscription, commande, admin) après la mise en service.
- **Mode démo** : les données vivent dans le navigateur de chaque visiteur ; un produit modifié dans l'admin démo n'apparaît que dans ce navigateur (catalogue client, bon de commande), pas dans les pages statiques.
- **Anti-abus** : `/api/contact` a un pot de miel et une limitation simple par instance ; ajouter une protection (Turnstile, rate-limit Vercel) avant une forte exposition. `place_order` accepte les invités par conception.
- **3D** : sur mobile / appareil modeste, elle démarre à la première interaction ; les packshots statiques font le relais. Nouveaux produits : relancer `npm run render:packshots` (sinon, silhouette SVG de repli, ou photo si `image_url` est renseigné).
