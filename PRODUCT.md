# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Le dirigeant de MCI Sète**, à qui MJAGENCY présente le site en démonstration pour le lui vendre (budget de plusieurs milliers d'euros). Il doit reconnaître son métier et sa marque, et avoir envie de signer.
- **Les acheteurs professionnels de MCI** : services techniques de mairies et métropoles, intendances d'écoles et universités, gestionnaires d'équipements sportifs, caves et domaines viticoles, exploitations agricoles, laboratoires et biotech, garages et ateliers automobiles, campings, ports et chantiers nautiques. Ils cherchent un produit pour une surface ou un problème précis (graisse cuite, tags, mousses, tartre, frelons…), vérifient la fiche technique, puis commandent — souvent avec un numéro d'engagement ou via Chorus Pro, parfois après validation interne.

Les deux publics comptent à égalité : l'accueil doit faire forte impression à la démo, le catalogue et la commande doivent être rapides et sans friction.

## Product Purpose

Site vitrine, catalogue et commande B2B de MCI Sète, distributeur-fabricant de nettoyants techniques, désinfectants, biocides et produits de maintenance. Il remplace un site Wix sans catalogue exploitable. Succès : MCI signe le projet ; ensuite, un acheteur trouve le bon produit par son problème et envoie un bon de commande complet en moins de deux minutes, avec ou sans compte.

## Positioning

Un fournisseur local (Sète, bassin de Thau) qui répond au téléphone et connaît ses produits, avec un catalogue de 90 références classé par problème de terrain et par métier, et une commande pensée pour les contraintes des acheteurs publics (n° d'engagement, Chorus Pro, validation acheteur → valideur). Pas de prix affichés par défaut : MCI confirme prix et délai.

## Operating Context

- Commande sans paiement en ligne : virement, facture à échéance, mandat administratif ; prix et délai confirmés par MCI avant préparation.
- Documents : fiches techniques (74 sur 90 en PDF), FDS sur demande, bons de livraison et factures dans l'espace pro.
- Back-office MCI : statuts de commande (reçue → confirmée → en préparation → expédiée → livrée) avec emails, grilles tarifaires par compte, réglages.
- Démonstration : mode démo complet sans clé (données dans le navigateur, comptes et commandes étiquetés DÉMO).

## Capabilities and Constraints

- Stack en place : Next.js 15 (App Router), TypeScript strict, Tailwind v4, React Three Fiber / drei, GSAP, Lenis, Supabase (RLS), Resend, pdf-lib ; déployé sur Vercel.
- Fonctionnalités existantes à préserver : recherche tolérante, filtres dans l'URL, fiches produit, bon de commande persistant, commande rapide par référence et import, PDF, espace pro (recommander, favoris, documents, adresses, utilisateurs), back-office complet.
- Données inconnues (conditionnements réels, horaires, mentions légales, CGV…) : affichées « [À CONFIRMER] » dans l'admin uniquement, jamais inventées côté public.
- Mention biocides obligatoire sur les produits et pages concernés.

## Brand Commitments

- Nom : MCI Sète. Logo : soleil orange posé sur une vague bleue (redessiné en SVG). Couleurs de marque : bleu MCI #206996, orange #F89746.
- Le client a demandé une refonte totale (« page blanche ») avec des sections jamais vues ; seul le logo et les couleurs de marque sont imposés.
- Coordonnées vérifiées : Parc Aquatechnique, 5 rond-point du Luxembourg, 34200 Sète · 04 48 08 45 89 · contactmci@sfr.fr · créée en 2015 · agrément préfectoral (PDF).

## Evidence on Hand

- Catalogue réel de 90 références (codes, désignations, familles, usages, propriétés, fiches techniques) dans `src/data/catalog.ts`.
- 9 familles et 9 secteurs avec textes rédigés (`src/data/families.ts`, `src/data/sectors.ts`).
- Photos du site Wix actuel (équipe, bâtiment), chargées depuis wixstatic ; non consultables depuis l'environnement de développement.
- Packshots 3D des 90 produits générés à partir d'un packaging procédural (`public/packshots`).
- Absences à ne jamais combler par de l'invention : témoignages, logos clients, certifications, chiffres d'affaires, délais, prix publics.

## Product Principles

1. Partir du problème de terrain, pas de la chimie : l'acheteur cherche « graisse cuite », pas « tensioactif ».
2. Commander doit être plus simple qu'un coup de téléphone, et le téléphone reste toujours à portée.
3. Tout ce qui est affiché est vérifiable ; ce qui ne l'est pas n'est pas affiché.
4. Local et humain : Sète, une équipe qui répond, pas une plateforme anonyme.

## Accessibility & Inclusion

WCAG 2.1 AA visé (contrastes, clavier, lecteurs d'écran), `prefers-reduced-motion` respecté, repli sans WebGL, aucun débordement de 320 à 1920 px.
