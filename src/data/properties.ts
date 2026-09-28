import type { Format, PropertySlug } from "@/lib/types";

export const propertyLabels: Record<PropertySlug, { label: string; short: string; hint: string }> = {
  "contact-alimentaire": { label: "Contact alimentaire", short: "ALIM", hint: "Identifié qualité / contact alimentaire" },
  "bio-vegetal": { label: "Bio / végétal", short: "BIO", hint: "Base enzymatique, bactérienne ou végétale" },
  biocide: { label: "Biocide", short: "BIOC", hint: "Produit biocide : lire l'étiquette avant usage" },
  "sans-chlore": { label: "Sans chlore", short: "S/CL", hint: "Formule non chlorée" },
  "sans-solvant-chlore": { label: "Sans solvant chloré", short: "S/SC", hint: "Sans solvant chloré" },
  pae: { label: "Prêt à l'emploi", short: "PAE", hint: "Prêt à l'emploi, sans dilution" },
  biocontrole: { label: "Biocontrôle", short: "BCTL", hint: "Produit de biocontrôle" },
};

export const propertyOrder: PropertySlug[] = [
  "contact-alimentaire",
  "bio-vegetal",
  "biocide",
  "biocontrole",
  "sans-chlore",
  "sans-solvant-chlore",
  "pae",
];

export const formatLabels: Record<Format, string> = {
  aerosol: "Aérosol",
  liquide: "Liquide",
  gel: "Gel",
  poudre: "Poudre",
  granules: "Granulés",
  lingettes: "Lingettes",
  pate: "Pâte",
  textile: "Textile",
};

export const formatOrder: Format[] = ["aerosol", "liquide", "gel", "poudre", "granules", "lingettes", "pate", "textile"];
