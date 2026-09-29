import type { Sector, SectorGroup, SectorSlug } from "@/lib/types";

export const sectorGroups: Record<SectorGroup, string> = {
  administrations: "Administrations",
  industries: "Industries",
  loisirs: "Loisirs",
};

export const sectors: Sector[] = [
  {
    slug: "mairies",
    name: "Mairies",
    group: "administrations",
    position: 1,
    buyer: "Services techniques, voirie, espaces verts, bâtiments communaux.",
    problem:
      "Un tag sur la façade de l'école lundi matin, une flaque de gasoil au rond-point, des mousses sur le monument aux morts, du verglas sur le parvis : les services techniques interviennent vite, avec peu de produits, et doivent justifier chaque achat par un bon d'engagement.",
    seo: [
      "Pour les communes et métropoles, MCI regroupe les produits d'intervention de voirie et d'entretien du patrimoine : DETAG en bidon, en aérosol et en lingettes pour les graffitis, KERMEX contre les mousses et algues vertes, SUPER GRANUL (homologué SETRA) pour les hydrocarbures sur chaussée, DÉVERGLAÇANT pour les accès piétons, SPEED pour le désherbage en biocontrôle, OXYCHOC pour les nids de frelons asiatiques signalés par les habitants.",
      "Le bon de commande en ligne accepte votre numéro d'engagement et la facturation via Chorus Pro (code service). Un agent peut préparer la commande, un valideur la confirmer : l'option se règle par compte.",
      "MCI est installé au Parc Aquatechnique de Sète, à quelques minutes des services techniques du bassin de Thau ; zone et délai de livraison sont confirmés à chaque commande. Pour une commande récurrente, créez un compte pro et enregistrez vos listes : « Stock voirie », « Hiver », « Graffitis ».",
    ],
  },
  {
    slug: "ecoles-universites",
    name: "Écoles & universités",
    group: "administrations",
    position: 2,
    buyer: "Agents d'entretien, intendance, gestionnaires de lycées et de campus.",
    problem:
      "Sanitaires utilisés par des centaines d'élèves, tables de cantine désinfectées entre deux services, blattes dans une cuisine de lycée : il faut des produits efficaces, des fiches de sécurité à jour et zéro odeur agressive dans les salles.",
    seo: [
      "Écoles, collèges, lycées et universités ont les mêmes points chauds : sanitaires, restauration, surfaces de contact. SANIKEL RENFORCÉ détartre et désodorise au quotidien, STERSOL et ECODYL désinfectent les surfaces (ECODYL en prêt à l'emploi, formule végétale), DG90 dégraisse les hottes et fours des cuisines, FORCEGEL ULTRA traite les blattes en appât sans pulvérisation dans les locaux.",
      "Chaque fiche produit donne accès à la fiche technique ; demandez la fiche de données de sécurité depuis la fiche si elle n'est pas en ligne. Les intendances peuvent indiquer leur numéro de bon de commande et facturer via Chorus Pro.",
      "Pour la rentrée, enregistrez une liste favorite « Rentrée scolaire » dans votre espace pro et recommandez-la en un clic chaque année. MCI confirme disponibilité et délai de livraison pour chaque commande, depuis Sète.",
    ],
  },
  {
    slug: "equipements-sportifs",
    name: "Équipements sportifs",
    group: "administrations",
    position: 3,
    buyer: "Gestionnaires de gymnases, piscines, stades et complexes sportifs.",
    problem:
      "Un sol de gymnase qui glisse après lavage, des vestiaires qui sentent malgré le ménage, des mousses sur les gradins extérieurs : les équipements sportifs combinent sols techniques, humidité et forte fréquentation.",
    seo: [
      "DDA est un détergent agréé alimentaire formulé pour les sols de gymnase, utilisable en autolaveuse. Pour les vestiaires et douches : SANIKEL RENFORCÉ pour le tartre, STERSOL pour la désinfection, DÉSOBIO10 et GELODOR pour les odeurs. KERMEX traite les mousses et moisissures sur les gradins et abords, LESSIVE LINGE entretient chasubles et serviettes.",
      "Complexes sportifs municipaux, salles intercommunales, stades de Sète à Montpellier : le bon de commande accepte les numéros d'engagement et la facturation Chorus Pro. Conditionnements en 5 L et 20 L pour les autolaveuses, confirmés par MCI à la validation.",
    ],
  },
  {
    slug: "viticulture",
    name: "Viticulture",
    group: "industries",
    position: 4,
    buyer: "Chefs de cave, caves coopératives, domaines, entreprises de travaux viticoles.",
    problem:
      "Après les vendanges, les cuves sont rouges de tartre et de matière colorante, les pulvérisateurs gardent des résidus de traitement, et tout ce qui touche le vin doit être rincé et compatible contact alimentaire.",
    seo: [
      "Le dérougissage des cuves se fait en deux temps : REDOX, nettoyant dérougissant très puissant, puis PEROXYL, oxygène actif qui désinfecte sans chlore et sans odeur. REDOX NF, super dégraissant à contact alimentaire, s'occupe du matériel de cave et de récolte. DETARCIRC et DAS 30 (avec indicateur de saturation) détartrent les circuits et échangeurs.",
      "Pour le matériel de traitement, NPV désincruste les résidus phytosanitaires, la chlorophylle et les colles des cuves et rampes de pulvérisateurs. KERMEX nettoie les abords, murs et toitures des chais.",
      "Du Picpoul de Pinet aux caves de l'arrière-pays héraultais, la sélection part de Sète. Ajoutez la sélection au bon de commande, ajustez les conditionnements (5 L ou 20 L) et indiquez vos contraintes d'accès (quai, horaires de cave).",
    ],
  },
  {
    slug: "agriculture",
    name: "Agriculture",
    group: "industries",
    position: 5,
    buyer: "Exploitations, CUMA, négoces, ateliers de matériel agricole.",
    problem:
      "Pulvérisateurs à rincer entre deux produits, engins à graisser, fuites d'huile dans le hangar, rongeurs dans les réserves : l'exploitation a besoin de peu de références, mais des bonnes.",
    seo: [
      "NPV nettoie les pulvérisateurs agricoles et désincruste les résidus phytosanitaires. REDOX NF dégraisse le matériel à contact alimentaire. En atelier : CST dégrippe et protège de l'humidité, LUBRAXEL graisse roulements et articulations (existe en cartouche). SUPER GRANUL et SUPER GRANUL FEUILLE absorbent les fuites d'huile et d'hydrocarbures, RTS 45 traite rats et souris avec boîtes appâts fournies, SPEED désherbe les cours et abords en biocontrôle.",
      "Les CUMA et négoces de l'Hérault peuvent créer un compte pro multi-utilisateurs : chaque adhérent prépare sa commande, un responsable la valide. Les fiches techniques sont téléchargeables avant l'achat.",
    ],
  },
  {
    slug: "biotechnologie",
    name: "Biotechnologie",
    group: "industries",
    position: 6,
    buyer: "Laboratoires, salles propres, unités de production agroalimentaire et biotech.",
    problem:
      "Surfaces à désinfecter avec un spectre large (bactéries, levures, virus, spores), circuits à détartrer sans contaminer, inox à garder impeccable : chaque produit doit avoir une fiche technique et une FDS à jour pour le dossier qualité.",
    seo: [
      "STÉRI MCI est fongicide, virucide et sporicide, à contact alimentaire (existe en prêt à l'emploi). ECODYL désinfecte avec une formule 100 % végétale. BAM4 et DMOUSSE combinent détergence et désinfection, DMOUSSE en nettoyage mousse. DAS 30 nettoie les circuits avec un indicateur de saturation, PEROXYL désinfecte à l'oxygène actif sans chlore. APN33NF et ACINOL RENFORCÉ entretiennent l'inox et les métaux nobles.",
      "MCI est installé au Parc Aquatechnique de Sète, zone d'activités tournée vers la mer et les biotechnologies. Demandez les FDS depuis chaque fiche, commandez avec votre numéro de bon de commande interne.",
    ],
  },
  {
    slug: "automobile",
    name: "Automobile",
    group: "industries",
    position: 7,
    buyer: "Garages, carrosseries, flottes de véhicules, stations de lavage.",
    problem:
      "Freins à dégraisser sans laisser de film, fontaine de dégraissage à recharger, carrosseries à laver sans traces, mains noires en fin de journée : l'atelier consomme vite et commande souvent les mêmes références.",
    seo: [
      "GRAPHITEX dégraisse disques et plaquettes de frein sans solvant chloré, séchage ultra-rapide. DSF34 et DSF34 BIO alimentent les fontaines de dégraissage en phase aqueuse. NET CAR dégraisse sans solvant, SHAMCAR (déperlant) et STATCAR (film statique) lavent les carrosseries, y compris en portique. LUBRAXEL graisse, BIONET nettoie les mains.",
      "Garages de Sète, Frontignan, Balaruc et de la métropole de Montpellier : utilisez la commande rapide par référence (« GRAPHITEX;CARTON-12;2 ») et enregistrez votre liste « Stock atelier » pour recommander en un clic.",
    ],
  },
  {
    slug: "campings",
    name: "Campings",
    group: "loisirs",
    position: 8,
    buyer: "Gérants et équipes d'entretien d'hôtellerie de plein air, villages vacances.",
    problem:
      "En juillet, les blocs sanitaires tournent jour et nuit, les bornes de vidange des camping-cars débordent, un nid de frelons apparaît près de la piscine et la fosse septique sature : tout doit être en stock avant la saison.",
    seo: [
      "SANIKEL RENFORCÉ assure l'entretien quotidien des blocs sanitaires, SANITARTRE la remise en état avant ouverture. BIONAL traite les WC chimiques des camping-cars et les toilettes en circuit fermé, DÉSOBIO10 supprime les odeurs à la source, ACTIFOSSE relance les fosses septiques. OXYCHOC traite les nids de guêpes et frelons à distance, FORCEGEL ULTRA les blattes des cuisines de snack, LESSIVE LINGE le linge des locatifs.",
      "Sur la côte héraultaise, de Marseillan à Vias et de Frontignan à Palavas, le stock doit être en place avant l'ouverture. Préparez votre liste « Ouverture saison » dans l'espace pro, indiquez les créneaux et contraintes d'accès (portail, horaires d'accueil) : MCI confirme disponibilité et délai.",
    ],
  },
  {
    slug: "nautisme",
    name: "Nautisme",
    group: "loisirs",
    position: 9,
    buyer: "Chantiers navals, ports de plaisance, loueurs, ateliers de mécanique marine.",
    problem:
      "Le sel grippe les manilles, l'aluminium s'oxyde, l'inox rouille en surface, les WC marins sentent, une fuite de gasoil apparaît dans un bassin : le nautisme cumule mécanique, carrosserie et environnement sensible.",
    seo: [
      "CST dégrippe et protège de l'humidité et de la corrosion (existe en version bio à l'huile végétale), TARAUXYL sert au perçage et au taraudage. NETALU / NETINOX désoxyde et rénove aluminium et inox, MP50 dérouille l'inox, BRILLANTEUR INOX finit l'accastillage. SHAMCAR lave coques et superstructures avec une action déperlante. BIONAL traite les WC marins en circuit fermé, SUPER GRANUL FEUILLE capte les hydrocarbures sans absorber l'eau.",
      "Sète est un port de pêche, de commerce et de plaisance : les chantiers de la zone portuaire, du canal et de l'étang de Thau sont nos voisins. Commandez par référence, faites livrer au chantier ou au port, avec vos contraintes d'accès.",
    ],
  },
];

export const sectorBySlug = new Map<SectorSlug, Sector>(sectors.map((s) => [s.slug, s]));

export function getSector(slug: string): Sector | undefined {
  return sectorBySlug.get(slug as SectorSlug);
}
