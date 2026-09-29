# DESIGN NOTES — MCI Sète (archive)

> **Obsolète.** La charte en vigueur est la **v3 « Le comptoir du fournisseur »**, décrite dans [`DESIGN.md`](DESIGN.md) (jetons normatifs) et `.impeccable/design.json`. Les notes v2 et v1 ci-dessous ne sont conservées que pour l'historique.

> **Charte v2 (refonte « arrondie », septembre 2026)** — à la demande du client, la direction « fiche technique / papier » ci-dessous (§1 à §8) est remplacée par un langage inspiré d'Apple. La v1 est conservée plus bas pour mémoire ; en cas de contradiction, **la v2 fait foi**.

## v2 — Langage visuel

- **Formes** : tout est arrondi. Champs 12 px (`rounded-tech`), cartes 22 px (`rounded-box`), grandes tuiles 32 px (`rounded-tile`), boutons et filtres en pilules (`rounded-full`). Ombres longues et douces (`shadow-sheet`, `shadow-tile`, `shadow-float`), anneaux fins `ring-black/5` plutôt que des bordures.
- **Typographie** : Geist (grotesque contemporaine, SIL OFL) pour tout, Geist Mono uniquement pour les références produit, numéros de commande et SIRET. Grands titres serrés (`.t-display`, `.t-h1`, approche −0,035 à −0,045 em), sur-titres en orange brûlé `#b64400` (`.t-eyebrow`, contraste AA), chapeaux `.t-lead` en gris.
- **Couleurs** : blanc et gris Apple `#f5f5f7` (`salt`) en alternance de sections, encre `#1d1d1f`, bleu MCI pour les liens, **orange `#f89746` toujours réservé aux gestes d'achat**, bleu nuit (`night`, `deep`) pour les sections immersives.
- **Fonds animés** (`src/components/fx/ShaderBackground.tsx`) : un fragment shader WebGL léger (sans three.js), rendu à ½ résolution, mis en pause hors écran, démarré quand le navigateur est inactif, image fixe en mouvement réduit, dégradé CSS de repli. Variantes : `aurora` (hero), `night` (caustiques, histoire défilée), `sea` (bandeau d'appel). Tuiles : nappes CSS floues qui dérivent (`fx/Blobs.tsx`).
- **3D** : matières physiques (vernis, métal brossé net, étiquettes pelliculées), éclairage de studio par panneaux lumineux et contre-jours (`three/Stage.tsx`), mappage ACES.
  - Hero (`three/HeroScene.tsx`) : la gamme en arc sur un sol studio, pilotée par le défilement et la souris / le gyroscope.
  - « Un geste, le bon produit » (`home/StorySection.tsx` + `three/StoryScene.tsx`) : section épinglée, un contenant par chapitre qui entre en tournant au défilement.
  - Packshots des 90 produits re-rendus détourés (fond transparent) avec le nouvel éclairage.
- **Mouvement** : apparitions au défilement (`data-reveal`, IntersectionObserver global), compteurs qui s'incrémentent (uniquement des chiffres calculés depuis le catalogue), bon de commande qui se remplit (GSAP), photo d'équipe qui s'agrandit, carrousel secteurs aimanté. Tout est coupé en `prefers-reduced-motion`.
- **Accueil** : Hero → Histoire défilée (5 gestes : dégraisser, désinfecter, démousser, dégripper, absorber) → Secteurs (carrousel) → Pourquoi MCI (bento) → La gamme (familles) → Commander → L'équipe → Bandeau d'appel.
- **Inchangé** : aucun contenu inventé (pas d'avis, logo client, certification, prix ni chiffre non calculé), pas de mode sombre automatique, pas d'emoji, pictogrammes maison (traits arrondis), pas de bibliothèque d'icônes. `npm run lint:design` contrôle ces règles v2.

---

## v1 (archive)


> Concept : **« Fiche technique habitée »**. Le site parle la langue des objets que MCI vend : étiquettes de bidons, fiches techniques, bons de commande, plans d'atelier. On ne décore pas, on *étiquette*.

---

## 1. Concept

Un acheteur pro (agent de mairie, chef de cave, gérant de camping, responsable d'atelier) ne cherche pas une ambiance, il cherche **un produit, une fiche, un moyen de commander**. Le site doit donc avoir la rigueur d'un document technique… et la matière d'un objet qu'on tient en main.

Trois décisions structurent tout le reste :

1. **La page est une feuille.** Fond `Sel` (#F3F1EC), filets fins `#D5DCE0`, repères de coupe aux coins des blocs clés, cotes discrètes. Chaque section est numérotée comme une rubrique de fiche (`01 — Secteurs`). La grille technique n'est visible que là où elle aide à lire (catalogue, tableau des faits, bon de commande), jamais en papier peint.
2. **Le produit est un objet.** Aucune photo produit n'existe : au lieu de pictogrammes génériques, on fabrique un **système de packaging procédural** (6 contenants modélisés en code, étiquette générée). Tous les produits ont ainsi un visuel cohérent, et la 3D a un rôle : montrer *ce qu'on va recevoir* (un aérosol, un bidon de 5 L, un seau).
3. **L'action est orange, et seulement elle.** Le soleil du logo prête sa couleur aux seuls gestes d'achat : ouvrir le catalogue, ajouter, valider. Si on voit de l'orange, on peut cliquer dessus pour avancer vers une commande.

Le hero « La vitre » résume le métier en un geste : **nettoyer pour révéler**. La raclette passe, la buée disparaît, les produits apparaissent. Ce n'est pas un effet gratuit : c'est la promesse du produit, jouée une fois en 1,6 s, puis laissée à la main de l'utilisateur.

## 2. Grille

- **12 colonnes**, gouttière constante **24 px** (16 px sous 640 px), marges latérales `clamp(16px, 4vw, 64px)`, largeur max du contenu **1440 px**.
- Mobile : 4 colonnes logiques (12 colonnes CSS, les blocs couvrent 12/12).
- Composition **asymétrique** assumée : les titres de section vivent sur les colonnes 1–7, les contenus secondaires (repères, codes, 3D) débordent à droite.
- Échelle d'espacement stricte (px) : `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128`. Dans Tailwind, l'unité de base vaut 4 px et seules les valeurs `1 2 3 4 6 8 12 16 24 32` sont utilisées. Rythme vertical entre sections : 96 px (mobile 64 px).

## 3. Typographie

| Rôle | Police | Réglages |
|---|---|---|
| Titres | **Archivo** variable | `wdth` 112–125, graisses 700–900, interlignage 0,92–1,0, approche −1 % à −2 % |
| Texte | **Instrument Sans** | 400 / 500 / 600, 16–18 px, interlignage 1,5 |
| Références | **IBM Plex Mono** | 400 / 500, codes produits en capitales, `tabular-nums` |

- Échelle fluide (`clamp()`), **3 tailles de titres max par page** : `display` (hero / liste des secteurs), `h1` (titres de page), `h2` (titres de section). Le reste est du texte.
- Casse normale partout, **capitales uniquement pour les codes produits** (`DG90`, `REF · DG90 · 5 L`) et les réglettes techniques en mono.
- L'axe `wdth` est un outil d'interaction : dans la liste des secteurs, la ligne survolée passe de 100 à 125 ; c'est le seul endroit où la typo bouge.
- Pas d'Inter, pas de pile système : les trois familles sont auto-hébergées via `next/font` (aucune requête tierce au runtime).

## 4. Palette

| Token | Hex | Règle |
|---|---|---|
| `mci` (bleu MCI) | `#206996` | titres, liens, bandeaux d'étiquette, surfaces fortes |
| `action` (orange MCI) | `#F89746` | **uniquement** les actions (commander, ajouter, valider) + le soleil du logo |
| `ink` (encre) | `#0E2533` | texte courant, jamais de noir pur |
| `deep` (bleu profond) | `#123F5A` | footer, bandeau commande, en-tête d'admin |
| `white` | `#FFFFFF` | fiches, cartes, feuilles |
| `salt` (sel) | `#F3F1EC` | fond de page |
| `rule` (filet) | `#D5DCE0` | séparateurs, grilles techniques |
| `ok` / `warn` / `danger` | `#2E7D4F` / `#C98A1B` / `#B23A2E` | statuts, stock, sécurité |

Dérivés autorisés : opacités de l'encre pour le texte secondaire (`ink/70` sur `salt` = contraste ≈ 5,6:1, AA) — pas de nouvelles teintes.

**Contraste** : le texte sur orange est en **encre** (`#0E2533` sur `#F89746` = 7,2:1), jamais en blanc (2,3:1, refusé). Le bleu MCI sur `salt` = 5,3:1 (AA texte courant) ; blanc sur bleu MCI = 6:1. Le blanc sur `deep` = 11:1.

Couleurs **pleines**. Aucun dégradé (ni fond, ni bouton, ni texte). La Tailwind par défaut est désactivée : seuls ces tokens existent.

## 5. Formes et matières

- Rayons : **2 px** pour les éléments techniques (champs, pastilles de propriété, lignes de catalogue), **6 px** max pour les conteneurs (tiroir, feuille, modale). Rien au-delà.
- Ombres : une seule, courte et nette, pour ce qui est physiquement « posé » (la feuille du bon de commande, le tiroir) : `0 1px 0 rule, 0 12px 24px -16px rgba(14,37,51,.25)`. Pas d'ombres floues géantes.
- Bordures : 1 px `rule`, toujours neutres. **Jamais** de liseré coloré sur une carte.
- Pictogrammes : dessinés sur mesure en SVG, trait 1,5 px, style plan technique (propriétés produit, formats, familles). Utilisés comme des symboles d'étiquette, pas comme décoration de section.
- Repères : coins de coupe (4 petits angles) sur les blocs importants, cotes `←—— 5 L ——→` sur le bon de commande et la fiche produit.

## 6. Mouvement

Le mouvement **sert la compréhension** : révéler (la vitre), relier (secteur → sélection de produits), confirmer (ajout au bon).

- Courbe d'entrée UI : `cubic-bezier(0.22, 1, 0.36, 1)` (token `--ease-out`). Durées 200–600 ms.
- 3D : ressorts physiques (flottabilité = oscillateur amorti + petites répulsions entre contenants).
- **Seul effet systématique** : l'ajout au bon de commande — le packshot vole en arc jusqu'au compteur, qui rebondit (≈ 550 ms).
- Textes et boutons **visibles immédiatement**. Pas de fade-in d'entrée sur les blocs ; les animations de scroll portent sur des objets (bon de commande qui se remplit, contenants qui se posent sur le rayon, photo qui s'ouvre), jamais sur la lisibilité du texte.
- Une seule scène WebGL active à la fois (montée à l'entrée dans le viewport, démontée à la sortie), `frameloop="demand"` hors hero, DPR ≤ 1,5, pause quand l'onglet est caché.
- `prefers-reduced-motion` : pas de pin, pas de Lenis, vitre déjà propre, contenants immobiles, bon de commande déjà rempli.

### Performance du mouvement

- Sur mobile / appareil modeste, la 3D ne démarre qu'à la première interaction (toucher, défilement) : les packshots pré-rendus, placés aux mêmes emplacements, occupent la scène d'ici là, puis la 3D prend le relais en fondu. Sur poste fixe, elle démarre dès que le navigateur est inactif.
- La vitre travaille à mi-résolution (la buée est floue par nature) : nuages peints en ⅛ de résolution puis agrandis, sans filtre de flou.
- Les titres d'affichage utilisent une instance statique d'Archivo (800, wdth 118, 37 Ko, préchargée) ; la version variable (axe wdth animé dans la liste des secteurs, étiquettes 3D) se charge sans bloquer.

## 7. Voix

Technico-commerciale : concrète, courte, vérifiable. On nomme la surface, la salissure, le geste. « Graisses cuites sur hottes et fours » plutôt que « une solution performante ». Tout ce qui n'est pas connu s'écrit `[À CONFIRMER]` dans l'admin et disparaît côté public.

## 8. Ce qu'on s'interdit (rappel de §6 du brief)

Dégradés, texte en dégradé, Inter/Roboto/Poppins, cartes à liseré coloré, glassmorphism, dark mode, rangée « 3 icônes », pastille au-dessus du titre, Lucide/Heroicons, curseur custom, boutons qui s'estompent, hero centré classique, emojis, grosses ombres, rayons > 6 px, faux contenus, texte générique. Vérifié par `npm run lint:design` (grep automatisé).

## 9. Écarts et limites connus

- L'environnement de développement n'a pas pu joindre `mci-sete.com` ni `static.wixstatic.com` (proxy réseau). Les données viennent donc du brief (§16), et **le logo SVG a été redessiné d'après sa description** (soleil orange + vague bleue) : à comparer à l'original et ajuster avant mise en ligne. Les photos (équipe, bâtiment) sont servies depuis leur URL Wix d'origine via `next/image` et rapatriables en local par `npm run fetch:brand`.
