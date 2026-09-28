/**
 * Catalogue MCI — seed initial (brief §16).
 * Orthographe corrigée, doublons fusionnés (un produit peut appartenir à plusieurs familles).
 * Tout ce qui n'est pas confirmé par MCI est listé dans `toConfirm` : visible dans l'admin,
 * jamais affiché comme un fait côté public.
 */
import type { ContainerKind, FamilySlug, Format, Packaging, Product, PropertySlug, SectorSlug } from "@/lib/types";

const H1 = "https://a8e9cf56-40bd-492b-b9b4-d4dcc7eca13a.usrfiles.com/ugd/";
const H2 = "https://5f3c9964-4996-4af2-ad29-816277a01ecf.usrfiles.com/ugd/";

/* ─────────── Conditionnements par défaut (§16 « Données à compléter ») ─────────── */
export const PACK = {
  carton12: { id: "carton-12", label: "Carton de 12 aérosols", short: "12 × AÉRO", container: "aerosol" },
  cartouche: { id: "cartouche", label: "Cartouche de graisse", short: "CARTOUCHE", container: "cartridge" },
  l1: { id: "1l", label: "Flacon 1 L", short: "1 L", container: "spray" },
  l5: { id: "5l", label: "Bidon 5 L", short: "5 L", container: "can5" },
  l20: { id: "20l", label: "Jerrican 20 L", short: "20 L", container: "jerrican20" },
  ml750: { id: "750ml", label: "Flacon 750 ml", short: "750 ML", container: "spray" },
  kg10: { id: "10kg", label: "Seau 10 kg", short: "10 KG", container: "bucket" },
  kg20: { id: "20kg", label: "Sac 20 kg", short: "20 KG", container: "bucket" },
  seau100: { id: "seau-100", label: "Seau de 100 lingettes", short: "100 LING.", container: "bucket" },
  seringue: { id: "seringue", label: "Seringue appât", short: "SERINGUE", container: "cartridge" },
  pot1: { id: "pot-1l", label: "Pot 1 L", short: "POT 1 L", container: "bucket" },
  rouleau: { id: "rouleau", label: "Rouleau / feuilles", short: "ROULEAU", container: "bucket" },
  boite: { id: "boite", label: "Boîte", short: "BOÎTE", container: "bucket" },
} satisfies Record<string, Packaging>;

const defaultPacks: Record<Format, Packaging[]> = {
  aerosol: [PACK.carton12],
  liquide: [PACK.l5, PACK.l20, PACK.l1],
  gel: [PACK.ml750, PACK.l5],
  poudre: [PACK.kg10, PACK.kg20],
  granules: [PACK.kg10, PACK.kg20],
  lingettes: [PACK.seau100],
  pate: [PACK.boite],
  textile: [PACK.rouleau],
};

interface Raw {
  code: string;
  short: string;
  description: string;
  families: FamilySlug[];
  format: Format;
  /** "H1:fichier.pdf" ou "H2:fichier.pdf" */
  ft?: string;
  props?: PropertySlug[];
  variants?: string;
  usages?: string[];
  packs?: Packaging[];
  container?: ContainerKind;
  extraFormats?: Format[];
  toConfirm?: string[];
  adminNote?: string;
  slug?: string;
  featured?: boolean;
}

const raw: Raw[] = [
  /* ─────────────────────────── Absorbants ─────────────────────────── */
  { code: "ALO", short: "Absorbant liquides organiques", description: "Absorbant solidifiant et désodorisant pour liquides organiques.", families: ["absorbants"], format: "poudre", ft: "H1:5f3c99_ecaa4a6f8ef8464a808c566986d7ae41.pdf", usages: ["Vomissures et liquides organiques", "Solidification avant ramassage", "Désodorisation"] },
  { code: "SUPER GRANUL", short: "Absorbant lourd antidérapant", description: "Absorbant lourd, antidérapant, inerte. Homologation SETRA.", families: ["absorbants"], format: "granules", ft: "H1:5f3c99_38aaafa2b906457d9966ef256dbc5ac9.pdf", usages: ["Huiles et hydrocarbures sur chaussée", "Ateliers et parkings", "Voirie"], featured: true },
  { code: "SUPER GRANUL FEUILLE", short: "Textile absorbant hydrocarbures", description: "Textile absorbant spécial hydrocarbures, dépolluant.", families: ["absorbants"], format: "textile", ft: "H1:5f3c99_4102853ee19f47c2b57dbbc726c60fed.pdf", usages: ["Fuites d'hydrocarbures", "Bacs de rétention", "Dépollution en zone portuaire"] },
  { code: "DÉVERGLAÇANT", short: "Déverglaçant, absorbant d'humidité", description: "Déneigement et absorbant d'humidité. Existe en liquide.", families: ["absorbants"], format: "granules", extraFormats: ["liquide"], variants: "Existe en version liquide.", ft: "H1:5f3c99_88dfe3dbbfd047d38f247d5f149c2468.pdf", usages: ["Verglas et neige sur accès", "Parvis, escaliers, rampes", "Absorption d'humidité"] },

  /* ─────────────────────────── Aérosols ─────────────────────────── */
  { code: "AFP", short: "Lubrifiant anti-adhérent silicone", description: "Lubrifiant, rénovateur, anti-adhérent protecteur à base de polysiloxanes. Existe sans silicone.", families: ["aerosols"], format: "aerosol", variants: "Existe en version sans silicone.", ft: "H2:5f3c99_8d687c199c81413c890864e4dd32032c.pdf", usages: ["Lubrification de glissières", "Rénovation des plastiques et caoutchoucs", "Anti-adhérent"] },
  { code: "BIOCLIM NF", short: "Mousse désinfectante climatisation", description: "Mousse désinfectante pour climatisations.", families: ["aerosols"], format: "aerosol", props: ["biocide"], ft: "H1:5f3c99_c7aad63df81849c4a6f368c4e29c68b0.pdf", usages: ["Évaporateurs de climatisation", "Splits muraux", "Climatisation des véhicules"] },
  { code: "BRILLANTEUR INOX", short: "Brillanteur inox contact alimentaire", description: "Huile de paraffine à contact alimentaire, fait briller l'inox.", families: ["aerosols"], format: "aerosol", props: ["contact-alimentaire"], ft: "H2:5f3c99_a0d08bc0f4984fe5a79b1bf49e665944.pdf", usages: ["Plans de travail et équipements inox", "Cuisines collectives", "Accastillage inox"] },
  { code: "CODEXAL", short: "Lubrifiant huile minérale Codex", description: "Lubrifiant polyvalent à base d'huile minérale Codex.", families: ["aerosols"], format: "aerosol", ft: "H2:5f3c99_998e99a990a6456a91ed92bb5cb969e4.pdf", usages: ["Lubrification de mécanismes", "Machines de conditionnement"], toConfirm: ["properties"] },
  { code: "CST", short: "Super dégrippant multifonction", description: "Super dégrippant multifonction, anti-humidité, anti-corrosion. Existe en version bio (huile végétale) et PTFE.", families: ["aerosols"], format: "aerosol", variants: "Existe en version bio (huile végétale) et en version PTFE.", ft: "H2:5f3c99_864a127159194030af088ee48026b0e3.pdf", usages: ["Dégrippage de boulonnerie", "Chasse l'humidité des contacts", "Protection anti-corrosion"], featured: true },
  { code: "DETAG AÉROSOL", short: "Décapant graffitis en aérosol", description: "Décapant graffitis pour surfaces sensibles.", families: ["aerosols"], format: "aerosol", ft: "H2:5f3c99_056b1ce607754f3984f4eee616965cc1.pdf", usages: ["Tags et graffitis", "Mobilier urbain", "Signalétique"] },
  { code: "DIELEC30", short: "Nettoyant diélectrique", description: "Nettoyant diélectrique sans solvant chloré, non gras.", families: ["aerosols"], format: "aerosol", props: ["sans-solvant-chlore"], ft: "H2:5f3c99_ae98076f1c9045b59439cdd9b87e6397.pdf", usages: ["Contacts et armoires électriques", "Moteurs électriques", "Cartes et connecteurs"] },
  { code: "DISSOLVÈNE", short: "Dissolvant colles et étiquettes", description: "Dissolvant qui décolle adhésifs et étiquettes, séchage sec.", families: ["aerosols"], format: "aerosol", ft: "H2:5f3c99_d4d6252fece6428c94cdae1790662b4e.pdf", usages: ["Étiquettes et résidus d'adhésif", "Traces de ruban adhésif"] },
  { code: "GB93", short: "Galvanisant brillant", description: "Galvanisant brillant.", families: ["aerosols"], format: "aerosol", ft: "H1:5f3c99_755fae1c0c224da7a223404d0438abaf.pdf", usages: ["Retouche de pièces galvanisées", "Protection des soudures"] },
  { code: "GHT", short: "Graisse aluminium hautes températures", description: "Graisse aluminium hautes températures, lubrifiant anti-grippant.", families: ["aerosols"], format: "aerosol", ft: "H2:5f3c99_2d0967b01b754b4a9aab3531c326a714.pdf", usages: ["Assemblages exposés à la chaleur", "Anti-grippage de filetages"] },
  { code: "GRAISSE SILICONE", short: "Graisse silicone", description: "Lubrifiant et agent anti-adhérent.", families: ["aerosols"], format: "aerosol", ft: "H2:5f3c99_e64f892dfa744ccdb586cee9d626a38a.pdf", usages: ["Joints et caoutchoucs", "Anti-adhérent"] },
  { code: "GRALIXONE", short: "Graisse blanche alimentaire", description: "Graisse blanche alimentaire épaisse. Existe en cartouches.", families: ["aerosols"], format: "aerosol", props: ["contact-alimentaire"], variants: "Existe en cartouches.", packs: [PACK.carton12, PACK.cartouche], ft: "H2:5f3c99_25f2ba4ecabf4866941e3c35a0d7b44e.pdf", usages: ["Machines agroalimentaires", "Chaînes et roulements en zone alimentaire"] },
  { code: "GRAPHITEX", short: "Dégraissant freins", description: "Dégraissant disques de frein, sans solvant chloré, séchage ultra-rapide.", families: ["aerosols"], format: "aerosol", props: ["sans-solvant-chlore"], ft: "H2:5f3c99_0c7771bdd388456992579b97137aa1cb.pdf", usages: ["Disques et plaquettes de frein", "Dégraissage de pièces mécaniques"] },
  { code: "INSECTIBAC", short: "Insecticide bactéricide one shot", description: "Insecticide bactéricide parfumé « one shot ».", families: ["aerosols", "desherbants-insecticides-biocides"], format: "aerosol", props: ["biocide"], ft: "H2:5f3c99_0c90902def9848f0a3873e531deeb81a.pdf", usages: ["Traitement de locaux en une fois", "Insectes volants et rampants"], toConfirm: ["technicalSheetUrl"], adminNote: "La fiche technique en ligne est le même fichier que celle d'INSECTILAC : à vérifier avec MCI." },
  { code: "LSP", short: "Lubrifiant sec PTFE", description: "Lubrifiant anti-adhérent sec au PTFE.", families: ["aerosols"], format: "aerosol", ft: "H2:5f3c99_83084d41deb048869c6de1f139d6fb09.pdf", usages: ["Glissières et rails", "Mécanismes exposés à la poussière"] },
  { code: "LUBRAXEL", short: "Graisse multifonction lithium", description: "Graisse multifonction au lithium. Existe en cartouche.", families: ["aerosols"], format: "aerosol", variants: "Existe en cartouche.", packs: [PACK.carton12, PACK.cartouche], ft: "H2:5f3c99_fd8863234fcd46fb9e5c08a40fcaaccd.pdf", usages: ["Roulements et articulations", "Engins agricoles et véhicules"] },
  { code: "LUBRAXONE", short: "Graisse noire très adhérente", description: "Graisse noire très adhérente (bitume, savon lithium, bisulfure de molybdène).", families: ["aerosols"], format: "aerosol", ft: "H2:5f3c99_a9155b2c877c40e3a8681196822f43e1.pdf", usages: ["Câbles, chaînes, engrenages ouverts", "Pièces exposées aux intempéries"] },
  { code: "LUBRIXAL", short: "Graisse vaseline Codex alimentaire", description: "Graisse à base d'huile de vaseline Codex gélifiée, agréée milieu alimentaire.", families: ["aerosols"], format: "aerosol", props: ["contact-alimentaire"], ft: "H2:5f3c99_747cd8771c32453d812088bbdd119835.pdf", usages: ["Équipements en milieu alimentaire", "Joints et vannes"] },
  { code: "MAXFLASH", short: "Mousse nettoyante bactéricide", description: "Mousse nettoyante dégraissante à pouvoir bactéricide.", families: ["aerosols", "surodorants-shampooings"], format: "aerosol", props: ["biocide"], ft: "H2:5f3c99_b88644225e894c15842da6f34a9e0556.pdf", usages: ["Surfaces verticales", "Sièges et plastiques", "Nettoyage sans rinçage abondant"] },
  { code: "MCI ANTI-RONGEUR", short: "Répulsif anti-rongeurs", description: "Répulsif qui protège les matériaux contre les rongeurs.", families: ["aerosols", "desherbants-insecticides-biocides"], format: "aerosol", props: ["biocide"], ft: "H2:5f3c99_1732b97e0447471ab1acb9dff821ff14.pdf", usages: ["Câblages et gaines", "Compartiments moteur", "Locaux techniques"] },
  { code: "MCI AXADRINE", short: "Insecticide puces, punaises, acariens", description: "Insecticide « one shot » : puces, punaises, acariens, dont le sarcopte de la gale.", families: ["aerosols", "desherbants-insecticides-biocides"], format: "aerosol", props: ["biocide"], ft: "H2:5f3c99_27a4f91e0c3844e2be2ee1ae1f6176e0.pdf", usages: ["Punaises de lit", "Puces et acariens", "Gale (sarcopte)"] },
  { code: "MCI NÉOPRÈNE", short: "Colle néoprène", description: "Colle définitive de type néoprène.", families: ["aerosols"], format: "aerosol", usages: ["Collage définitif", "Revêtements et mousses"] },
  { code: "OXYCHOC", short: "Insecticide guêpes et frelons", description: "Insecticide spécial guêpes et frelons asiatiques, grande portée.", families: ["aerosols", "desherbants-insecticides-biocides"], format: "aerosol", props: ["biocide"], ft: "H1:5f3c99_e27510fed6a8492f9cce57499a53eb8f.pdf", usages: ["Nids de guêpes", "Frelons asiatiques", "Traitement à distance"], featured: true },
  { code: "INSECTICIDE TERRE DE DIATOMÉE", slug: "insecticide-terre-de-diatomee", short: "Insecticide terre de diatomée", description: "Insecticide à base de terre de diatomée, 100 % naturel.", families: ["aerosols", "desherbants-insecticides-biocides"], format: "aerosol", props: ["biocide"], ft: "H2:5f3c99_17c056ca373d44c5b1d47d0a48e00782.pdf", usages: ["Insectes rampants", "Plinthes et recoins"] },
  { code: "INSECTICIDE BIO", short: "Insecticide huile essentielle", description: "Insecticide à base d'huile essentielle biocide, contre les insectes volants et rampants.", families: ["aerosols", "desherbants-insecticides-biocides", "produits-bio"], format: "aerosol", props: ["biocide", "bio-vegetal"], ft: "H2:5f3c99_bc09b4bc239044cfb02a873ec6f77817.pdf", usages: ["Insectes volants", "Insectes rampants"], toConfirm: ["technicalSheetUrl"], adminNote: "Deux fiches en ligne : 5f3c99_bc09b4bc…pdf et 5f3c99_016fa47e…pdf. Laquelle est à jour ?" },
  { code: "POL'ISH", slug: "polish", short: "Lustrant surfaces fragiles", description: "Lustrant pour surfaces fragiles, à base de cire, sans silicone.", families: ["aerosols"], format: "aerosol", ft: "H2:5f3c99_9f3baa1a25ff41449501d5ed67f93b5a.pdf", usages: ["Mobilier", "Surfaces vernies", "Bureaux"] },
  { code: "STÉRI MCI AÉROSOL", short: "Désinfectant longue portée", description: "Désinfectant longue portée : virucide, fongicide, désodorisant.", families: ["aerosols"], format: "aerosol", props: ["biocide"], ft: "H2:5f3c99_d524411e70504ae4be2fa0f5d6f029f3.pdf", usages: ["Désinfection de locaux", "Véhicules", "Vestiaires"] },
  { code: "STOP HEAT", short: "Barrière thermique", description: "Barrière thermique contre les flammes et la chaleur. Existe en pot de 1 L.", families: ["aerosols"], format: "aerosol", variants: "Existe en pot de 1 L.", packs: [PACK.carton12, PACK.pot1], ft: "H2:5f3c99_57226270379645b89dd1e12cde3fdd66.pdf", usages: ["Protection des pièces voisines lors du soudage ou du brasage"] },
  { code: "TARAUXYL", short: "Huile de coupe et taraudage", description: "Huile de coupe et de taraudage.", families: ["aerosols"], format: "aerosol", ft: "H2:5f3c99_7baf44c82a964cfba69c6513203a1e38.pdf", usages: ["Perçage", "Taraudage", "Découpe des métaux"] },
  { code: "VITREX", short: "Mousse nettoyante vitres", description: "Mousse nettoyante spéciale vitres.", families: ["aerosols"], format: "aerosol", ft: "H2:5f3c99_ff9f46c912444d0692f70875f225f301.pdf", usages: ["Vitres et miroirs", "Pare-brise", "Surfaces vitrées verticales"] },

  /* ─────────────────────── Décapants – Détartrants ─────────────────────── */
  { code: "ACINOL RENFORCÉ", short: "Nettoyant métaux nobles", description: "Nettoyant des métaux nobles, qualité alimentaire.", families: ["decapants-detartrants"], format: "liquide", props: ["contact-alimentaire"], ft: "H2:5f3c99_5946152c48f24e8e9be4e76deed117b0.pdf", usages: ["Inox, cuivre, laiton", "Équipements de production alimentaire"] },
  { code: "APN33NF", short: "Rénovateur inox", description: "Rénovateur nettoyant spécial inox, qualité alimentaire.", families: ["decapants-detartrants"], format: "liquide", props: ["contact-alimentaire"], ft: "H2:5f3c99_1e06083946b843d88f189435573e8e69.pdf", usages: ["Cuves et équipements inox", "Traces d'oxydation sur inox"] },
  { code: "DAS 30", short: "Nettoyant de circuits", description: "Nettoyant de circuits à contact alimentaire, avec indicateur de saturation.", families: ["decapants-detartrants"], format: "liquide", props: ["contact-alimentaire"], ft: "H2:5f3c99_51d37a912a6d421c99d704aef2d21fa3.pdf", usages: ["Circuits et canalisations de process", "Échangeurs", "Lignes de transfert"] },
  { code: "DCA", short: "Déboucheur canalisations acide", description: "Déboucheur de canalisations acide.", families: ["decapants-detartrants"], format: "liquide", ft: "H2:5f3c99_16f7ced66140465681b683ec56cb7aec.pdf", usages: ["Canalisations bouchées", "Siphons et évacuations"] },
  { code: "DÉCABÉTON", short: "Détartrant béton", description: "Détartrant spécial béton, avec nettoyant de rouille.", families: ["decapants-detartrants"], format: "liquide", ft: "H2:5f3c99_0988b0781d064432864621446ed33a92.pdf", usages: ["Laitance et voile de ciment", "Coulures de rouille", "Outils et bétonnières"] },
  { code: "DETAG", short: "Solvant décapant graffitis", description: "Solvant de décapage des graffitis sur surfaces sensibles.", families: ["decapants-detartrants"], format: "liquide", ft: "H2:5f3c99_bea41936a1104dbfbe8c0d7fb3a7f3ac.pdf", usages: ["Tags et graffitis", "Façades et mobilier urbain"], featured: true },
  { code: "DETAG LINGETTES", short: "Lingettes décapantes tags", description: "Lingettes décapantes pour tags et peintures sur surfaces lisses non poreuses.", families: ["decapants-detartrants"], format: "lingettes", ft: "H2:5f3c99_8fa9c6b552524cd08660072ba838000e.pdf", usages: ["Tags sur panneaux et signalétique", "Surfaces lisses non poreuses", "Intervention rapide en tournée"] },
  { code: "DETARCIRC", short: "Désincrustant de tartre pour circuits", description: "Désincrustant des tartres pour canalisations et circuits.", families: ["decapants-detartrants"], format: "liquide", ft: "H2:5f3c99_073d4dad8e2d409790388fb1e995d0b0.pdf", usages: ["Circuits d'eau entartrés", "Échangeurs et chaudières", "Canalisations"] },
  { code: "DG90", short: "Dégraissant graisses cuites", description: "Nettoyant dégraissant spécial graisses cuites.", families: ["decapants-detartrants"], format: "liquide", ft: "H2:5f3c99_f55f4a789e10433d950317261bdb2239.pdf", usages: ["Graisses cuites et carbonisées", "Hottes, fours, plaques", "Cuisines collectives"], featured: true },
  { code: "KERMEX", short: "Anti-mousses et algues", description: "Désincruste les algues vertes, mousses et moisissures.", families: ["decapants-detartrants"], format: "liquide", ft: "H2:5f3c99_eca02704fcd749a393f26a8844dbce39.pdf", usages: ["Toitures, murs, terrasses", "Algues vertes et mousses", "Moisissures"], featured: true },
  { code: "MP50", short: "Dérouillant phosphatant inox", description: "Dérouillant phosphatant spécial acier inoxydable.", families: ["decapants-detartrants"], format: "liquide", ft: "H2:5f3c99_bb3790c430f649fe9efcbe49217748d0.pdf", usages: ["Rouille sur inox", "Accastillage", "Pièces métalliques"] },
  { code: "NETALU / NETINOX", slug: "netalu-netinox", short: "Rénovateur aluminium et inox", description: "Nettoyant acide désoxydant, rénovateur de l'aluminium et de l'inox.", families: ["decapants-detartrants"], format: "liquide", ft: "H2:5f3c99_fa52c7aa41cf4f51b3658f1bc637c8be.pdf", usages: ["Coques et mâts aluminium", "Remorques et jantes", "Inox terni"] },
  { code: "NPV", short: "Nettoyant pulvérisateurs agricoles", description: "Nettoyant dégraissant polyvalent, désincrustant des phytosanitaires, de la chlorophylle et des colles. Nettoyage des pulvérisateurs agricoles et viticoles.", families: ["decapants-detartrants", "surodorants-shampooings"], format: "liquide", ft: "H2:5f3c99_929db569d65d4c658bae4650ef018b93.pdf", usages: ["Cuves et rampes de pulvérisateurs", "Résidus phytosanitaires", "Chlorophylle et colles"], featured: true },
  { code: "PEROXYL", short: "Oxygène actif", description: "Oxygène actif. Associé à REDOX ou VINIPLUS : dérougissant, désinfectant sans chlore, inodore.", families: ["decapants-detartrants"], format: "liquide", props: ["sans-chlore"], ft: "H2:5f3c99_c7f69c31bf22490396ef6dd2487999f5.pdf", usages: ["Dérougissage des cuves (avec REDOX)", "Désinfection sans chlore", "Chais et caves"] },
  { code: "REDOX", short: "Dérougissant très puissant", description: "Nettoyant dérougissant très puissant, à associer au PEROXYL.", families: ["decapants-detartrants"], format: "liquide", ft: "H2:5f3c99_9dba42511bfb42ec8e8fa43d9b310afe.pdf", usages: ["Tartre et dépôts de vin rouge", "Cuves inox et béton"] },
  { code: "REDOX NF", short: "Super dégraissant contact alimentaire", description: "Super dégraissant multifonction à contact alimentaire, pour le secteur agricole.", families: ["decapants-detartrants"], format: "liquide", props: ["contact-alimentaire"], ft: "H2:5f3c99_b134bc976f8a43499726113d4f30f73f.pdf", usages: ["Matériel de cave et de récolte", "Sols et équipements agricoles"] },
  { code: "SANIBIO18", short: "Entretien bio des sanitaires", description: "Entretien bio des sanitaires à base d'enzymes acides.", families: ["decapants-detartrants", "produits-bio"], format: "liquide", props: ["bio-vegetal"], ft: "H2:5f3c99_acffc1bed02846c49570f6c876666e4a.pdf", usages: ["Cuvettes, urinoirs, lavabos", "Entretien quotidien"] },
  { code: "SANIKEL RENFORCÉ", slug: "sanikel-renforce", short: "Détartrant désodorisant sanitaires", description: "Nettoyant détartrant désodorisant pour l'entretien quotidien des sanitaires.", families: ["decapants-detartrants"], format: "liquide", ft: "H2:5f3c99_e73f44ac03354179abaf6b08aa309eba.pdf", usages: ["Blocs sanitaires", "Douches et robinetterie", "Entretien quotidien"], featured: true },
  { code: "SANITARTRE", short: "Rénovateur sanitaires", description: "Rénovateur spécial sanitaires. Existe en gel parfumé.", families: ["decapants-detartrants"], format: "liquide", extraFormats: ["gel"], variants: "Existe en gel parfumé.", packs: [PACK.l5, PACK.l20, PACK.l1, PACK.ml750], ft: "H2:5f3c99_ec406e39ab8e41dbba4ea5e9929214ef.pdf", usages: ["Tartre incrusté", "Remise en état de sanitaires"] },

  /* ──────────────── Désherbants – Insecticides – Biocides ──────────────── */
  { code: "DOBOL", short: "Appât fourmis en seringue", description: "Appât fourmis en seringue, compatible pistolet applicateur.", families: ["desherbants-insecticides-biocides"], format: "gel", props: ["biocide"], container: "cartridge", packs: [PACK.seringue], ft: "H2:5f3c99_e5025ddd91a744bc9ca2056e9fff2db3.pdf", usages: ["Fourmis", "Application en points"] },
  { code: "FORCEGEL ULTRA", short: "Gel appât blattes", description: "Gel appât insecticide contre les blattes, compatible pistolet applicateur.", families: ["desherbants-insecticides-biocides"], format: "gel", props: ["biocide"], container: "cartridge", packs: [PACK.seringue], ft: "H2:5f3c99_7a40a3b773f443e78bb89f67027b9d6c.pdf", usages: ["Blattes et cafards", "Cuisines et locaux techniques"] },
  { code: "FOURMICYL", short: "Appât fourmis en poudre", description: "Appât semi-liquide en poudre contre les fourmis. Existe en boîtes appâts.", families: ["desherbants-insecticides-biocides"], format: "poudre", props: ["biocide"], variants: "Existe en boîtes appâts.", packs: [PACK.boite], ft: "H2:5f3c99_347da4d750ee4408b329034dfed4bd5b.pdf", usages: ["Fourmis", "Extérieurs et passages"] },
  { code: "HIBERNATUS", short: "Hibernatus", description: "Référence au catalogue : renseignements sur demande.", families: ["desherbants-insecticides-biocides"], format: "liquide", toConfirm: ["description", "formats", "packagings", "properties"], adminNote: "Aucune description sur le site actuel." },
  { code: "INSECTILAC", short: "Laque insecticide cafards", description: "Laque insecticide spéciale cafards, à action rémanente.", families: ["desherbants-insecticides-biocides"], format: "liquide", props: ["biocide"], ft: "H2:5f3c99_0c90902def9848f0a3873e531deeb81a.pdf", usages: ["Cafards et blattes", "Plinthes, arrière de meubles"] },
  { code: "RTS 45", short: "Raticide souricide", description: "Raticide, souricide. Boîtes appâts fournies.", families: ["desherbants-insecticides-biocides"], format: "granules", props: ["biocide"], packs: [PACK.boite], ft: "H2:5f3c99_07e85bace9e5433a9b5c9e81fc329f36.pdf", usages: ["Rats", "Souris", "Réserves et locaux techniques"] },
  { code: "RTS PÂTE", slug: "rts-pate", short: "Raticide souricide en pâte", description: "Raticide, souricide en pâte. Boîtes appâts fournies.", families: ["desherbants-insecticides-biocides"], format: "pate", props: ["biocide"], ft: "H2:5f3c99_13b04a2f95c847888c4c6bec3a98d8c4.pdf", usages: ["Rats", "Souris", "Milieux humides"] },
  { code: "SPEED", short: "Désherbant total biocontrôle", description: "Désherbant total foliaire, produit de biocontrôle, prêt à l'emploi.", families: ["desherbants-insecticides-biocides"], format: "liquide", props: ["biocontrole", "pae"], ft: "H2:5f3c99_afacf03973fc46b5abe829e01962bb48.pdf", usages: ["Trottoirs et allées", "Cimetières", "Cours d'école"], featured: true },
  { code: "SUPER DLT", short: "Insecticide toutes surfaces", description: "Insecticide prêt à l'emploi toutes surfaces, contre fourmis et araignées.", families: ["desherbants-insecticides-biocides"], format: "liquide", props: ["biocide", "pae"], usages: ["Fourmis", "Araignées"] },

  /* ─────────────────────── Détergents – Désinfectants ─────────────────────── */
  { code: "BAM4", short: "Détergent bactéricide alimentaire", description: "Détergent bactéricide qualité alimentaire, mousse contrôlée. Existe en gel.", families: ["detergents-desinfectants"], format: "liquide", extraFormats: ["gel"], props: ["biocide", "contact-alimentaire"], variants: "Existe en gel.", ft: "H2:7cd98c_47e2a1eb27a94bb3b219282523caf9cc.pdf", usages: ["Plans de travail", "Ateliers agroalimentaires", "Cuisines"] },
  { code: "BIONAL", short: "Désodorisant WC chimiques", description: "Désodorisant bactéricide pour WC chimiques et toilettes en circuit fermé.", families: ["detergents-desinfectants", "produits-bio"], format: "liquide", props: ["biocide", "bio-vegetal"], ft: "H2:5f3c99_67951f666b604b99b91aa951babc6705.pdf", usages: ["WC chimiques de camping-cars et bateaux", "Toilettes en circuit fermé", "Bornes de vidange"], featured: true },
  { code: "DDA", short: "Détergent sols de gymnase", description: "Détergent agréé alimentaire, pour les sols de gymnase.", families: ["detergents-desinfectants"], format: "liquide", props: ["contact-alimentaire"], ft: "H2:5f3c99_a420044d493949a2ba433a5951df67e4.pdf", usages: ["Sols sportifs", "Gymnases", "Autolaveuses"] },
  { code: "DMOUSSE", short: "Dégraissant désinfectant moussant", description: "Super dégraissant désinfectant moussant, pour l'industrie et l'agroalimentaire.", families: ["detergents-desinfectants"], format: "liquide", props: ["biocide"], ft: "H2:5f3c99_da4e4d256cc142f8af5e5782ad18bc60.pdf", usages: ["Nettoyage mousse en canon", "Ateliers de production", "Quais et sols"] },
  { code: "DSF34", short: "Dégraissant pour fontaine", description: "Dégraissant biodégradable pour fontaines de dégraissage, en phase aqueuse.", families: ["detergents-desinfectants"], format: "liquide", ft: "H2:5f3c99_e32b7eec2d6644eaa510f5fc00546d16.pdf", usages: ["Fontaines de dégraissage", "Pièces mécaniques"] },
  { code: "DSF34 BIO", short: "Dégraissant bio fontaine chauffante", description: "Dégraissant biologique pour fontaines chauffantes, phase aqueuse biodégradable.", families: ["detergents-desinfectants"], format: "liquide", props: ["bio-vegetal"], ft: "H2:5f3c99_86510448c95e44a882118e8cb05c256d.pdf", usages: ["Fontaines biologiques chauffantes", "Pièces mécaniques"] },
  { code: "ECODYL", short: "Désinfectant 100 % végétal", description: "Nettoyant désinfectant prêt à l'emploi, 100 % végétal : bactéricide, levuricide, virucide.", families: ["detergents-desinfectants"], format: "liquide", props: ["biocide", "bio-vegetal", "pae"], ft: "H2:5f3c99_3a69bee198a14244bde415986682dec0.pdf", usages: ["Surfaces de contact", "Poignées, tables, équipements", "Salles de classe"] },
  { code: "STÉRI MCI", short: "Désinfectant sporicide alimentaire", description: "Désinfectant fongicide, virucide, sporicide à contact alimentaire. Existe en prêt à l'emploi.", families: ["detergents-desinfectants"], format: "liquide", props: ["biocide", "contact-alimentaire"], variants: "Existe en version prête à l'emploi (PAE).", ft: "H2:5f3c99_130e7fbce2a3445393ee53aa32bccf99.pdf", usages: ["Laboratoires et salles propres", "Industrie agroalimentaire", "Surfaces et matériel"] },
  { code: "STÉRIBAC", short: "Détergent plonge bactéricide", description: "Détergent plonge bactéricide.", families: ["detergents-desinfectants"], format: "liquide", props: ["biocide"], ft: "H2:5f3c99_1995d58c07ea42478d1b7c8eaa38cfd3.pdf", usages: ["Plonge manuelle", "Ustensiles et bacs"] },
  { code: "STERSOL", short: "Détergent désinfectant parfumé", description: "Détergent désinfectant bactéricide désodorisant, qualité alimentaire, plusieurs parfums.", families: ["detergents-desinfectants"], format: "liquide", props: ["biocide", "contact-alimentaire"], variants: "Plusieurs parfums.", ft: "H2:5f3c99_e7f786ddb3f746bcb51d249a6666fa7c.pdf", usages: ["Sols et surfaces", "Vestiaires et sanitaires", "Cantines"] },
  { code: "TANIBAC", short: "Désinfectant non chloré", description: "Nettoyant dégraissant désinfectant non chloré, mousse contrôlée.", families: ["detergents-desinfectants", "surodorants-shampooings"], format: "liquide", props: ["biocide", "sans-chlore"], usages: ["Sols et surfaces", "Zones alimentaires"] },
  { code: "VITREX L", short: "Nettoyant vitres liquide", description: "Nettoyant vitres liquide.", families: ["detergents-desinfectants"], format: "liquide", ft: "H2:5f3c99_ff9f46c912444d0692f70875f225f301.pdf", usages: ["Vitres et miroirs", "Surfaces vitrées"], toConfirm: ["technicalSheetUrl"], adminNote: "Même fiche que VITREX (aérosol)." },
  { code: "MAXIS NF", short: "Désinfectant de contact sans rinçage", description: "Désinfectant de contact prêt à l'emploi, sans rinçage.", families: ["detergents-desinfectants"], format: "liquide", props: ["biocide", "pae"], usages: ["Surfaces de contact", "Désinfection sans rinçage"], toConfirm: ["families"], adminNote: "Rangé en Surodorants sur l'ancien site : reclassé en Détergents – Désinfectants, à confirmer." },

  /* ─────────────────────── Surodorants – Shampooings ─────────────────────── */
  { code: "FLORALÈNE", short: "Destructeur d'odeurs", description: "Destructeur d'odeurs.", families: ["surodorants-shampooings"], format: "liquide", usages: ["Locaux à odeurs persistantes", "Conteneurs et locaux poubelles"] },
  { code: "FLORALIES", short: "Surodorant détergent désinfectant", description: "Surodorant détergent désinfectant, qualité alimentaire, plusieurs parfums.", families: ["surodorants-shampooings"], format: "liquide", props: ["biocide", "contact-alimentaire"], variants: "Plusieurs parfums.", usages: ["Sols et sanitaires", "Parfumage des locaux"] },
  { code: "GELODOR", short: "Gel fixateur d'odeurs", description: "Gel prêt à l'emploi, fixateur et destructeur d'odeurs.", families: ["surodorants-shampooings"], format: "gel", props: ["pae"], usages: ["Sanitaires", "Locaux poubelles", "Vestiaires"] },
  { code: "LESSIVE LINGE", short: "Lessive liquide parfumée", description: "Lessive liquide parfumée, tous textiles, en machine.", families: ["surodorants-shampooings"], format: "liquide", usages: ["Linge de campings et gîtes", "Tenues de travail", "Textiles sportifs"] },
  { code: "MCI LAVE-VAISSELLE", slug: "mci-lave-vaisselle", short: "Liquide lave-vaisselle eau dure", description: "Liquide pour lave-vaisselle, adapté aux eaux extra-dures.", families: ["surodorants-shampooings"], format: "liquide", usages: ["Lave-vaisselle professionnels", "Eau très calcaire"] },
  { code: "MULTIPLUS", short: "Nettoyant polyvalent biodégradable", description: "Nettoyant polyvalent biodégradable, alimentaire.", families: ["surodorants-shampooings"], format: "liquide", props: ["contact-alimentaire"], usages: ["Toutes surfaces lavables", "Cuisines"] },
  { code: "MULTISPRAY", short: "Nettoyant tout usage sans traces", description: "Nettoyant tout usage à contact alimentaire, pour surfaces modernes, sans traces.", families: ["surodorants-shampooings"], format: "liquide", props: ["contact-alimentaire", "pae"], packs: [PACK.ml750, PACK.l5], usages: ["Bureaux et mobilier", "Surfaces modernes", "Plans de travail"] },
  { code: "NET CAR", short: "Nettoyant dégraissant non solvanté", description: "Nettoyant dégraissant non solvanté.", families: ["surodorants-shampooings"], format: "liquide", usages: ["Carrosseries et bâches", "Moteurs et jantes", "Véhicules de service"] },
  { code: "SHAMCAR", short: "Shampooing carrosserie déperlant", description: "Shampooing carrosserie à action déperlante.", families: ["surodorants-shampooings"], format: "liquide", usages: ["Carrosseries", "Coques et superstructures de bateaux"] },
  { code: "STATCAR", short: "Shampooing carrosserie film statique", description: "Shampooing carrosserie haute performance, à film statique.", families: ["surodorants-shampooings"], format: "liquide", usages: ["Carrosseries", "Portiques et stations de lavage"] },

  /* ─────────────────────────── Produits bio ─────────────────────────── */
  { code: "ACTIFOSSE", short: "Activateur de fosses septiques", description: "Activateur biologique pour fosses septiques.", families: ["produits-bio"], format: "poudre", props: ["bio-vegetal"], usages: ["Fosses septiques", "Microstations", "Assainissement non collectif"] },
  { code: "BIONET", short: "Poudre nettoyante pour les mains", description: "Poudre de nettoyage des mains, écologique.", families: ["produits-bio"], format: "poudre", props: ["bio-vegetal"], ft: "H2:5f3c99_d4b681d19dbf4bd1ac0af804e9eed089.pdf", usages: ["Mains très sales", "Ateliers mécaniques"] },
  { code: "BIOSOLV", short: "Dégraissant 100 % végétal", description: "Nettoyant dégraissant dégoudronnant 100 % végétal.", families: ["produits-bio"], format: "liquide", props: ["bio-vegetal"], ft: "H2:5f3c99_97ff2c242b054bfcbda773f2c0dc1162.pdf", usages: ["Goudron et bitume", "Outils et engins", "Graisses"] },
  { code: "DÉSOBIO10", short: "Désodorisant biologique", description: "Désodorisant biologique à base de bactéries, pour sanitaires, moquettes et voirie.", families: ["produits-bio"], format: "liquide", props: ["bio-vegetal"], ft: "H2:5f3c99_3c83a30b26704dc6a928d0f000831d67.pdf", usages: ["Sanitaires et urinoirs", "Moquettes", "Voirie et conteneurs"] },
  { code: "MCIBIO 02", short: "Entretien bio bacs à graisse", description: "Entretien biologique des bacs à graisse et des canalisations.", families: ["produits-bio"], format: "liquide", props: ["bio-vegetal"], ft: "H2:5f3c99_3348dac47524453cbe83865c6d95a680.pdf", usages: ["Bacs à graisse", "Canalisations de cuisine"] },
];

/* ─────────── Correspondance produits ↔ secteurs (proposition, modifiable dans l'admin) ─────────── */
export const sectorSelections: Record<SectorSlug, string[]> = {
  mairies: ["detag", "detag-lingettes", "detag-aerosol", "kermex", "speed", "super-granul", "deverglacant", "dda", "oxychoc"],
  "ecoles-universites": ["sanikel-renforce", "stersol", "ecodyl", "multispray", "vitrex-l", "desobio10", "forcegel-ultra", "dg90"],
  "equipements-sportifs": ["dda", "sanikel-renforce", "stersol", "desobio10", "gelodor", "lessive-linge", "kermex"],
  viticulture: ["npv", "redox-nf", "peroxyl", "redox", "detarcirc", "kermex", "das-30"],
  agriculture: ["npv", "redox-nf", "lubraxel", "cst", "super-granul", "super-granul-feuille", "rts-45", "speed"],
  biotechnologie: ["steri-mci", "ecodyl", "dmousse", "das-30", "peroxyl", "apn33nf", "acinol-renforce", "bam4"],
  automobile: ["graphitex", "net-car", "shamcar", "statcar", "dsf34", "dsf34-bio", "lubraxel", "bionet"],
  campings: ["sanikel-renforce", "bional", "desobio10", "oxychoc", "forcegel-ultra", "lessive-linge", "actifosse", "sanitartre"],
  nautisme: ["cst", "shamcar", "netalu-netinox", "mp50", "tarauxyl", "bional", "brillanteur-inox", "super-granul-feuille"],
};

/* ─────────── Liens métier « Souvent commandé avec » ─────────── */
const relations: Array<[string, string]> = [
  ["redox", "peroxyl"],
  ["dg90", "steribac"],
  ["detag", "detag-lingettes"],
  ["detag", "detag-aerosol"],
  ["sanikel-renforce", "sanitartre"],
  ["npv", "redox-nf"],
  ["cst", "afp"],
  ["graphitex", "net-car"],
  ["shamcar", "statcar"],
  ["dsf34", "dsf34-bio"],
  ["rts-45", "rts-pate"],
  ["dobol", "forcegel-ultra"],
  ["vitrex", "vitrex-l"],
  ["kermex", "decabeton"],
  ["bional", "desobio10"],
  ["mcibio-02", "actifosse"],
  ["super-granul", "super-granul-feuille"],
  ["super-granul", "alo"],
  ["lubraxel", "lubraxone"],
  ["gralixone", "lubrixal"],
  ["detarcirc", "das-30"],
  ["peroxyl", "redox-nf"],
  ["stersol", "floralies"],
  ["bam4", "steri-mci"],
  ["mp50", "netalu-netinox"],
  ["oxychoc", "insecticide-bio"],
];

export function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function ftUrl(ft?: string): string | undefined {
  if (!ft) return undefined;
  const [host, file] = ft.split(":");
  return (host === "H1" ? H1 : H2) + file;
}

function build(): Product[] {
  const list = raw.map((r, i): Product => {
    const slug = r.slug ?? slugify(r.code);
    const packagings = r.packs ?? defaultPacks[r.format];
    const toConfirm = new Set<string>(r.toConfirm ?? []);
    // Tout est pré-rempli d'après les descriptions : à valider par MCI.
    ["packagings", "properties", "sectors", "instructions", "dilution", "usages"].forEach((k) => toConfirm.add(k));
    if (!r.ft) toConfirm.add("technicalSheetUrl");
    toConfirm.add("sdsUrl");
    return {
      id: `p-${slug}`,
      slug,
      code: r.code,
      short: r.short,
      description: r.description,
      families: r.families,
      sectors: [],
      properties: r.props ?? [],
      formats: [r.format, ...(r.extraFormats ?? [])],
      container: r.container ?? packagings[0]?.container ?? "can5",
      packagings,
      usages: r.usages ?? [],
      variants: r.variants,
      technicalSheetUrl: ftUrl(r.ft),
      related: [],
      toConfirm: [...toConfirm],
      adminNote: r.adminNote,
      active: true,
      featured: r.featured ?? false,
      position: i,
    };
  });
  const bySlug = new Map(list.map((p) => [p.slug, p]));
  for (const [sector, slugs] of Object.entries(sectorSelections) as [SectorSlug, string[]][]) {
    for (const s of slugs) {
      const p = bySlug.get(s);
      if (!p) throw new Error(`Secteur ${sector} : produit inconnu ${s}`);
      if (!p.sectors.includes(sector)) p.sectors.push(sector);
    }
  }
  for (const [a, b] of relations) {
    const pa = bySlug.get(a);
    const pb = bySlug.get(b);
    if (!pa || !pb) throw new Error(`Relation inconnue ${a} ↔ ${b}`);
    if (!pa.related.includes(b)) pa.related.push(b);
    if (!pb.related.includes(a)) pb.related.push(a);
  }
  return list;
}

export const products: Product[] = build();
