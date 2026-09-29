---
name: MCI Sète
description: Fournisseur professionnel de nettoyants techniques, désinfectants et traitements de maintenance, depuis Sète.
colors:
  mci-blue: "#1f6a99"
  harbour-deep: "#154d72"
  night-navy: "#0c2b40"
  sky-wash: "#cfe3f1"
  order-orange: "#f89746"
  order-orange-hover: "#ec8431"
  ink: "#16232d"
  white: "#ffffff"
  salt: "#f3f6f8"
  steel: "#e6ecf0"
  rule: "#d5dde3"
  ok: "#1d7a46"
  warn: "#a86a0b"
  danger: "#c2362c"
typography:
  display:
    fontFamily: "Barlow Semi Condensed, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 1.6rem + 3.4vw, 4.5rem)"
    fontWeight: 700
    lineHeight: 1.02
    letterSpacing: "-0.012em"
  headline:
    fontFamily: "Barlow Semi Condensed, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2rem, 1.45rem + 2vw, 3.25rem)"
    fontWeight: 700
    lineHeight: 1.06
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Barlow Semi Condensed, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.5rem, 1.2rem + 1.1vw, 2.25rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.005em"
  label:
    fontFamily: "Barlow Semi Condensed, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.2
  code:
    fontFamily: "Barlow Semi Condensed, ui-sans-serif, system-ui, sans-serif"
    fontWeight: 700
    letterSpacing: "0.02em"
    fontFeature: "\"tnum\" 1"
  lead:
    fontFamily: "Barlow, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.125rem, 1.05rem + 0.3vw, 1.3125rem)"
    fontWeight: 400
    lineHeight: 1.5
  body:
    fontFamily: "Barlow, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.55
  small:
    fontFamily: "Barlow, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.45
rounded:
  tech: "4px"
  control: "6px"
  box: "8px"
  tile: "12px"
spacing:
  unit: "4px"
  gutter: "24px"
  gutter-mobile: "16px"
  margin: "clamp(16px, 4vw, 48px)"
  container: "1320px"
  header: "76px"
components:
  button-action:
    backgroundColor: "{colors.order-orange}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 20px"
    height: "44px"
  button-action-hover:
    backgroundColor: "{colors.order-orange-hover}"
  button-primary:
    backgroundColor: "{colors.mci-blue}"
    textColor: "{colors.white}"
    rounded: "{rounded.control}"
    padding: "0 20px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.harbour-deep}"
  button-outline:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 20px"
    height: "44px"
  button-inverse:
    backgroundColor: "{colors.white}"
    textColor: "{colors.mci-blue}"
    rounded: "{rounded.control}"
    padding: "0 24px"
    height: "48px"
  input:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 12px"
    height: "44px"
  search-hero:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.box}"
    height: "64px"
  badge:
    backgroundColor: "{colors.steel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.tech}"
    padding: "1px 8px"
    typography: "{typography.small}"
  tile:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.tile}"
  hero-band:
    backgroundColor: "{colors.mci-blue}"
    textColor: "{colors.white}"
---

# Design System: MCI Sète

## Overview

**Creative North Star: "Le comptoir du fournisseur"**

Le site est le comptoir d'un fournisseur professionnel : on y vient avec un problème de terrain (graisse cuite, tags, mousses, tartre), on repart avec la bonne référence, sa fiche technique et un bon de commande. Le système suit le standard du secteur (Kärcher, Würth, Diversey) à pleine fidélité : un bandeau bleu MCI porte la recherche, les produits sont posés sur des plateaux acier clairs, les tableaux sont denses et nets, et rien ne bouge sans qu'on le demande.

La densité est celle d'un catalogue professionnel, pas d'une vitrine. Les titres en Barlow Semi Condensed ont la franchise de la signalétique industrielle ; le texte en Barlow reste lisible à longueur de fiche. Le blanc et deux gris acier teintés de bleu forment le fond ; le bleu MCI occupe de grandes zones pleines ; l'orange n'apparaît qu'au moment d'acheter.

Rejets confirmés par le client : fonds de section animés, animations au défilement, mise en scène « vitrine », formes en pilule et arrondis marqués de la v2.

**Key Characteristics:**
- Recherche instantanée comme geste principal, dans un bandeau bleu pleine largeur.
- Orange réservé aux gestes d'achat (ajouter, commander, valider, rechercher dans le bandeau).
- Coins francs et modestes (4 à 12 px), filets acier plutôt que cartes flottantes.
- Packshots détourés sur plateau acier clair, pictogrammes au trait de 1,75 px.
- Mouvement limité aux menus, tiroirs et survols, entre 150 et 220 ms.

## Colors

Une palette industrielle froide : blanc, acier teinté de bleu, bleu de marque en aplats, et un seul orange chaud réservé à l'achat.

### Primary
- **Bleu MCI** (#1f6a99) : couleur de marque, en grandes zones pleines (bandeau d'accueil, section Collectivités), liens, codes produit, boutons structurants non commerciaux. Proche du bleu du logo (#206996).
- **Bleu port** (#154d72) : survol du bleu MCI, bande d'appel du pied de page.
- **Bleu nuit** (#0c2b40) : barre utilitaire de l'en-tête, pied de page, barre latérale du back-office.
- **Ciel** (#cfe3f1) : fonds de pictogrammes, coches et encarts d'information sur fond bleu ; survol des boutons inversés.

### Secondary
- **Orange commande** (#f89746), survol **#ec8431** : exclusivement les gestes d'achat. Texte encre dessus, jamais blanc.

### Neutral
- **Encre** (#16232d) : texte courant et titres ; les niveaux secondaires sont l'encre à 70–80 % d'opacité.
- **Blanc** (#ffffff) : fond de page, cartes, panneaux.
- **Sel** (#f3f6f8) : sections alternées, pieds de tableau, lignes survolées.
- **Acier** (#e6ecf0) : badges, plateaux produit, fonds neutres pleins.
- **Filet** (#d5dde3) : bordures de cartes, séparateurs de listes et de tableaux.
- **États** : vert OK (#1d7a46), ambre alerte (#a86a0b), rouge danger (#c2362c).

### Named Rules
**The Purchase-Only Orange Rule.** L'orange signale un geste d'achat et rien d'autre : ni coche, ni décor, ni anneau de focus. Si l'élément n'ajoute pas au bon ou ne le valide pas, il n'est pas orange.

**The Blue Field Rule.** Le bleu MCI s'emploie en aplats larges (bandeau, section entière), jamais en dégradé ni en texte dégradé.

## Typography

**Display Font:** Barlow Semi Condensed (repli ui-sans-serif, system-ui)
**Body Font:** Barlow (repli ui-sans-serif, system-ui)
**Label/Mono Font:** Geist Mono pour quelques données du back-office ; les codes produit et numéros de commande sont composés en Barlow Semi Condensed à chiffres tabulaires.

**Character:** une grotesque de signalétique routière, condensée et grasse pour les titres, pleine et calme pour le texte : l'aplomb d'une étiquette de bidon, la lisibilité d'une fiche technique.

### Hierarchy
- **Display** (700, clamp 2,5 → 4,5 rem, 1,02) : le seul titre du bandeau d'accueil.
- **Headline** (700, clamp 2 → 3,25 rem, 1,06) : titres de section et H1 des pages internes.
- **Title** (700, clamp 1,5 → 2,25 rem, 1,1) : sous-sections, états vides.
- **Label** (600, 1,25 rem, 1,2) : titres de panneaux et de tiroirs.
- **Code** (700, capitales, +0,02 em, chiffres tabulaires) : références produit, numéros de commande, SIRET.
- **Lead** (400, clamp 1,125 → 1,31 rem, 1,5) : chapeau sous un titre, 52 à 58 caractères de large.
- **Body** (400, 1,0625 rem, 1,55) : texte courant, 70 caractères au plus.
- **Small** (400, 0,9375 rem, 1,45) et **XS** (0,8125 rem) : métadonnées, notes, légendes.

### Named Rules
**The Code-Is-Data Rule.** Une référence produit est une donnée, pas un titre : capitales Barlow Semi Condensed grasses, chiffres tabulaires, en bleu MCI dans les listes.

**The French Spacing Rule.** Espace fine insécable (U+202F) avant « : ; ? ! » et à l'intérieur des guillemets « », dans toute la copie publique.

## Layout

Conteneur de 1320 px centré, marges fluides (clamp 16 → 48 px), gouttière de 24 px (16 px sous 640 px), grille de 12 colonnes pour les compositions en deux blocs (6 + 5 décalé, ou 7 + 5). Unité d'espacement de 4 px ; sections à 64 px de marge verticale, 96 px à partir de 1024 px. Points de rupture : 640, 768, 1024, 1280 et 1536 px.

En-tête à deux niveaux : barre utilitaire nuit, puis barre blanche collante de 76 px. Sur mobile, une barre fixe en bas (Appeler, Bon de commande) remplace la barre utilitaire. Les tableaux denses passent en lignes empilées ou en cartes sous 640 px, sans défilement horizontal de page. Les rangées de produits deviennent des carrousels aimantés sur mobile.

## Elevation & Depth

Système plat par défaut, profondeur par filets et tons. Les ombres sont réservées à ce qui flotte (recherche du bandeau, menus, tiroir, extraits posés sur le bleu) ou répondent au survol d'une carte.

### Shadow Vocabulary
- **Sheet** (`0 1px 2px rgb(22 35 45 / 0.06), 0 8px 24px -12px rgb(22 35 45 / 0.18)`) : panneaux de formulaire posés sur la page.
- **Tile** (`0 2px 4px rgb(22 35 45 / 0.04), 0 16px 32px -16px rgb(22 35 45 / 0.22)`) : survol des cartes, avec élévation de 2 px.
- **Float** (`0 24px 48px -20px rgb(12 43 64 / 0.35)`) : recherche du bandeau, menus déroulants, extraits sur fond bleu.
- **Drawer** (`-12px 0 40px -16px rgb(22 35 45 / 0.3)`) : tiroir du bon de commande.

### Named Rules
**The Flat-At-Rest Rule.** Au repos, une carte est un fond blanc et un filet de 1 px ; l'ombre n'arrive qu'au survol ou pour ce qui flotte au-dessus du contenu.

## Shapes

Des coins francs et modestes, jamais en pilule : 4 px pour les badges et puces, 6 px pour les boutons et les champs, 8 px pour les panneaux, la recherche et les encarts, 12 px pour les cartes et tuiles. Bordures en filet acier de 1 px. Les packshots reposent sur un plateau au dégradé radial acier (#e3eaef vers sel). Le seul motif graphique est la vague du logo MCI, tracée en filigrane blanc à 7 % au pied du bandeau d'accueil.

## Components

### Buttons
Francs et denses, typés par leur fonction plutôt que par leur importance.
- **Shape :** coins légèrement cassés (6 px) ; hauteurs 36, 44 et 52 px.
- **Action :** orange commande, texte encre, filet d'ombre de 1 px ; uniquement pour ajouter, commander, valider.
- **Primary :** bleu MCI, texte blanc, survol bleu port ; pour les actions structurantes (se connecter, enregistrer, décrire un besoin).
- **Outline :** blanc, filet acier, survol en filet encre ; actions secondaires.
- **Inverse :** blanc sur fond bleu, texte bleu MCI, survol ciel.
- **Ghost :** lien bleu souligné au survol. **Danger :** filet rouge, plein rouge au survol.
- **Hover / Focus :** transitions de couleur en 150 ms ; anneau de focus 2 px bleu MCI décalé de 2 px, blanc sur les fonds bleus et nuit, de nouveau bleu sur les panneaux clairs posés sur ces fonds.

### Chips
- **Style :** « Recherches fréquentes » du bandeau : blanc à 12 % sur bleu, 4 px, texte blanc ; survol blanc plein, texte bleu.
- **Badges :** acier, 4 px, texte XS gras ; tons d'état (OK, alerte, danger) pour les statuts de commande.

### Cards / Containers
- **Corner Style :** 12 px.
- **Background :** blanc sur fond blanc ou sel.
- **Shadow Strategy :** Flat-At-Rest (voir Elevation & Depth).
- **Border :** filet acier de 1 px, plus soutenu au survol.
- **Internal Padding :** 20 à 24 px ; zone visuelle sur plateau acier, séparée par un filet.

### Inputs / Fields
- **Style :** fond blanc, filet acier, 6 px, 44 px de haut ; libellé gras au-dessus, jamais en placeholder seul.
- **Focus :** bordure bleu MCI et halo bleu à 20 %.
- **Error / Disabled :** message en rouge danger sous le champ ; opacité 50 % au repos désactivé.

### Navigation
- **Barre utilitaire :** bleu nuit, texte XS blanc, téléphone et raccourcis Commande rapide et Demander un devis.
- **Barre principale :** blanche, collante, 76 px ; logo, Catalogue et Secteurs à méga-menus (entrée en 180 ms), La société, Contact ; Espace pro et le bouton orange du bon de commande avec son compteur.
- **Mobile :** menu plein écran sous l'en-tête et barre fixe en bas.

### Recherche instantanée (signature)
Combobox ARIA : résultats du moteur dès la deuxième lettre, avec vignette sur plateau, code en Barlow Semi Condensed bleu, désignation et famille. Chaque résultat porte un bouton « Ajouter » orange (conditionnement par défaut, quantité 1), atteignable au clavier (Tab, ou Maj+Entrée sur le résultat actif). Au pied : « Voir les N résultats dans le catalogue ». Version bandeau de 64 px avec bouton Rechercher orange ; version compacte de 40 px dans l'en-tête des pages internes.

### Tiroir du bon de commande
`<dialog>` natif à droite, 480 px au plus. Il glisse depuis la droite en 220 ms (ease-out expo) avec un voile nuit à 40 % en fondu, puis ressort de la même manière. « Vider » demande confirmation à l'intérieur du tiroir.

## Do's and Don'ts

### Do:
- **Do** réserver l'orange commande (#f89746) aux boutons ajouter, commander, valider et rechercher.
- **Do** composer les références produit et numéros de commande en Barlow Semi Condensed grasse à chiffres tabulaires.
- **Do** poser chaque packshot sur un plateau acier clair et le légender « Visuel d'illustration » sur la fiche produit tant que ce n'est pas une photo réelle.
- **Do** limiter le mouvement aux menus, tiroirs et survols (150 à 220 ms, ease-out), et le couper en mouvement réduit.
- **Do** passer les tableaux en lignes empilées ou en cartes sous 640 px.
- **Do** mettre l'espace fine insécable avant « : ; ? ! » et dans les guillemets.

### Don't:
- **Don't** placer un petit libellé au-dessus d'un titre (sur-titre) ni un petit libellé au-dessus d'un gros chiffre.
- **Don't** animer un fond de section ni déclencher d'animation au défilement.
- **Don't** utiliser de dégradé de texte, de verre dépoli ou de bordure latérale colorée de plus de 1 px.
- **Don't** arrondir en pilule ni dépasser 12 px de rayon.
- **Don't** afficher de prix, chiffre, avis, certification ou conditionnement inventés côté public ; ce qui reste à valider porte la mention « indicatif ».
