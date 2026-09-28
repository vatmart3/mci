import type { Family, FamilySlug } from "@/lib/types";

export const BIOCIDE_NOTICE =
  "Utilisez les biocides avec précaution. Avant toute utilisation, lisez l'étiquette et les informations concernant le produit.";

export const families: Family[] = [
  {
    slug: "absorbants",
    name: "Absorbants",
    code: "ABS",
    position: 1,
    intro: "Fuite d'huile, liquide renversé, verglas : ce qui se ramasse vite et ne glisse plus.",
    seo: [
      "Une flaque d'huile sur un quai, du gasoil sur la voirie après un accident, un liquide organique dans un couloir d'école : l'absorbant doit agir tout de suite et se ramasser proprement. La gamme MCI couvre les trois cas. SUPER GRANUL est un absorbant lourd et inerte, antidérapant, homologué SETRA pour la chaussée ; SUPER GRANUL FEUILLE est un textile qui capte les hydrocarbures sans absorber l'eau, pour les bacs de rétention et les zones portuaires ; ALO solidifie et désodorise les liquides organiques avant le ramassage.",
      "Le DÉVERGLAÇANT complète la famille pour les accès piétons en hiver : parvis de mairie, rampes, escaliers d'établissements scolaires. Il existe aussi en version liquide.",
      "Pour les services techniques de Sète, Frontignan, Balaruc ou de la métropole de Montpellier, une organisation simple : un seau dans chaque véhicule d'intervention, un sac au dépôt. Commandez en seau de 10 kg pour les véhicules, en sac de 20 kg pour le stock : MCI confirme les conditionnements disponibles à la validation.",
    ],
  },
  {
    slug: "aerosols",
    name: "Aérosols",
    code: "AÉRO",
    position: 2,
    intro: "Dégrippants, graisses, lubrifiants, nettoyants et insecticides en boîtier : l'atelier dans une caisse.",
    seo: [
      "L'aérosol, c'est le produit qu'on a sur soi : dans la caisse du mécanicien, sur l'établi de l'atelier municipal, dans le coffre du technicien de maintenance. La gamme MCI en compte une trentaine, classés par usage. Pour la mécanique : CST (super dégrippant, anti-humidité, existe en version bio et PTFE), GHT pour les assemblages chauds, LUBRAXEL et LUBRAXONE pour les graisses, TARAUXYL pour le perçage et le taraudage, GRAPHITEX pour les freins.",
      "Pour le milieu alimentaire, BRILLANTEUR INOX, GRALIXONE et LUBRIXAL sont identifiés contact alimentaire. Pour l'électricité, DIELEC30 nettoie sans solvant chloré. Pour les nuisibles, OXYCHOC traite les nids de guêpes et de frelons asiatiques à distance, MCI AXADRINE les punaises et la gale, INSECTICIDE BIO les volants et rampants à l'huile essentielle.",
      "Les aérosols se commandent par carton de 12. Dans le bassin de Thau, où l'air salin attaque tout ce qui est métallique, un dégrippant et une graisse adhérente font partie du stock de base des ateliers nautiques et des services techniques.",
    ],
  },
  {
    slug: "decapants-detartrants",
    name: "Décapants – Détartrants",
    code: "DÉC",
    position: 3,
    intro: "Tartre, rouille, graisses cuites, tags, mousses : ce qui ne part pas avec un nettoyant ordinaire.",
    seo: [
      "Cette famille regroupe les produits qui attaquent une salissure précise. Le tartre des circuits et échangeurs (DETARCIRC, DAS 30 avec indicateur de saturation), les dépôts de vin rouge dans les cuves (REDOX associé au PEROXYL), la rouille sur l'inox (MP50), l'oxydation de l'aluminium (NETALU / NETINOX), la laitance de ciment (DÉCABÉTON), les graisses cuites des cuisines collectives (DG90).",
      "Pour l'espace public, DETAG décape les graffitis sur surfaces sensibles, en bidon ou en lingettes pour les interventions rapides en tournée. KERMEX désincruste algues vertes, mousses et moisissures sur toitures, murs et terrasses. Pour les sanitaires, SANIKEL RENFORCÉ assure l'entretien quotidien, SANITARTRE la remise en état, SANIBIO18 l'entretien aux enzymes.",
      "Les caves coopératives et domaines de l'Hérault utilisent NPV pour les pulvérisateurs et REDOX NF, à contact alimentaire, pour le matériel de cave. Chaque produit a sa fiche technique : lisez-la avant la première utilisation, les dilutions varient selon la salissure.",
    ],
  },
  {
    slug: "detergents-desinfectants",
    name: "Détergents – Désinfectants",
    code: "DÉT",
    position: 4,
    intro: "Nettoyer et désinfecter les surfaces, la plonge, les sols sportifs et les zones alimentaires.",
    seo: [
      "Un détergent enlève la salissure, un désinfectant détruit les micro-organismes : beaucoup de produits de cette famille font les deux en une étape. STERSOL (plusieurs parfums) et BAM4 sont des détergents désinfectants de qualité alimentaire, adaptés aux cantines et cuisines collectives. STÉRI MCI est fongicide, virucide et sporicide à contact alimentaire, pour les laboratoires et l'agroalimentaire. ECODYL désinfecte en prêt à l'emploi avec une formule 100 % végétale.",
      "Pour les usages ciblés : DDA pour les sols de gymnase, STÉRIBAC pour la plonge, DMOUSSE pour le nettoyage mousse en atelier de production, DSF34 et DSF34 BIO pour les fontaines de dégraissage, BIONAL pour les WC chimiques des camping-cars et bateaux.",
      "Écoles, gymnases, EHPAD, cuisines centrales : entre Sète, Mèze et Montpellier, les collectivités ont besoin d'une fiche technique et d'une fiche de données de sécurité pour chaque référence. Les désinfectants sont des biocides : respectez les dosages de la fiche technique.",
    ],
  },
  {
    slug: "desherbants-insecticides-biocides",
    name: "Désherbants – Insecticides – Biocides",
    code: "BIO-C",
    position: 5,
    biocide: true,
    intro: "Fourmis, blattes, rongeurs, guêpes et frelons, adventices : traiter, appâter, protéger.",
    seo: [
      "Les nuisibles se traitent avec le bon mode d'application. Appâts en seringue pour les fourmis (DOBOL) et les blattes (FORCEGEL ULTRA), compatibles pistolet applicateur ; appât en poudre FOURMICYL pour l'extérieur ; laque rémanente INSECTILAC pour les cafards ; raticides et souricides RTS 45 et RTS PÂTE livrés avec boîtes appâts. En aérosol : OXYCHOC pour les nids de guêpes et de frelons asiatiques, MCI AXADRINE pour les puces, punaises et acariens, MCI ANTI-RONGEUR pour protéger câbles et gaines.",
      "Côté désherbage, SPEED est un désherbant total foliaire de biocontrôle, prêt à l'emploi : une réponse pour les communes qui entretiennent trottoirs, cimetières et cours d'école sans produits phytosanitaires de synthèse.",
      "Campings de la côte héraultaise, cuisines collectives, services techniques municipaux : chaque intervention doit être tracée. Téléchargez la fiche technique avant l'achat et demandez la fiche de données de sécurité à MCI si elle n'est pas en ligne.",
    ],
  },
  {
    slug: "surodorants-shampooings",
    name: "Surodorants – Shampooings",
    code: "SUR",
    position: 6,
    intro: "Odeurs, lavage des véhicules, linge, vaisselle : l'entretien courant, bien dosé.",
    seo: [
      "Cette famille couvre l'entretien courant qui se voit et se sent. Contre les odeurs : FLORALÈNE (destructeur d'odeurs), GELODOR (gel prêt à l'emploi pour sanitaires et locaux poubelles), FLORALIES (surodorant détergent désinfectant, plusieurs parfums). Pour les surfaces : MULTIPLUS et MULTISPRAY, à contact alimentaire, MAXFLASH en mousse.",
      "Pour les véhicules et les bateaux : NET CAR dégraisse sans solvant, SHAMCAR laisse une action déperlante, STATCAR convient aux portiques et stations de lavage. NPV, polyvalent, nettoie aussi les pulvérisateurs agricoles et viticoles.",
      "Pour le linge et la vaisselle : LESSIVE LINGE, tous textiles en machine, et MCI LAVE-VAISSELLE formulé pour les eaux extra-dures, un vrai sujet sur le littoral héraultais où l'eau est très calcaire.",
    ],
  },
  {
    slug: "produits-bio",
    name: "Produits bio",
    code: "BIO",
    position: 7,
    intro: "Enzymes, bactéries, bases végétales : entretenir sans chimie lourde là où c'est possible.",
    seo: [
      "Les produits de cette famille travaillent avec des enzymes, des bactéries ou des matières premières végétales. ACTIFOSSE relance l'activité biologique des fosses septiques et microstations, fréquentes dans l'arrière-pays héraultais et les campings. MCIBIO 02 entretient les bacs à graisse et les canalisations de cuisine. DÉSOBIO10 supprime les odeurs à la source dans les sanitaires, sur les moquettes et la voirie.",
      "BIOSOLV dégraisse et dégoudronne avec une formule 100 % végétale ; BIONET nettoie les mains très sales à l'atelier. SANIBIO18 entretient les sanitaires aux enzymes acides, BIONAL traite les WC chimiques et toilettes en circuit fermé, INSECTICIDE BIO agit à l'huile essentielle.",
      "Un produit biologique a besoin de temps de contact et de régularité pour être efficace : les fiches techniques précisent le dosage et la fréquence. Pour une démarche plus large (établissement labellisé, camping engagé), appelez MCI : on construit la sélection avec vous.",
    ],
  },
  {
    slug: "peintures-savons-solvants",
    name: "Peintures – Savons – Solvants",
    code: "PSS",
    position: 8,
    intro: "Gamme sur demande : dites-nous ce que vous cherchez.",
    seo: [
      "Peintures de marquage, savons d'atelier, solvants de nettoyage : MCI fournit ces produits sur demande, en fonction de l'usage et du volume. La gamme n'est pas encore détaillée en ligne.",
      "Décrivez votre besoin (surface, quantité, contrainte réglementaire) ou appelez le 04 48 08 45 89 : un interlocuteur à Sète vous répond et vous envoie la fiche technique du produit proposé.",
    ],
  },
  {
    slug: "produits-specifiques",
    name: "Produits spécifiques",
    code: "SPÉ",
    position: 9,
    intro: "Un besoin hors catalogue ? MCI cherche le produit avec vous.",
    seo: [
      "Traitement particulier, contrainte de site, produit utilisé ailleurs qu'on ne trouve plus : MCI étudie les demandes spécifiques des professionnels et des collectivités.",
      "Décrivez la surface, la salissure ou le nuisible, et les contraintes (contact alimentaire, milieu naturel, public sensible). On vous rappelle avec une proposition et sa fiche technique.",
    ],
  },
];

export const familyBySlug = new Map<FamilySlug, Family>(families.map((f) => [f.slug, f]));

export function getFamily(slug: string): Family | undefined {
  return familyBySlug.get(slug as FamilySlug);
}
