/** Coordonnées vérifiées (brief §1). Les champs inconnus restent `null` → masqués côté public. */
export const company = {
  name: "MCI Sète",
  legalName: null as string | null, // [À CONFIRMER] forme juridique
  siret: null as string | null, // [À CONFIRMER]
  founded: 2015,
  street: "Parc Aquatechnique, 5 rond-point du Luxembourg",
  postalCode: "34200",
  city: "Sète",
  region: "Occitanie",
  department: "Hérault",
  phone: "04 48 08 45 89",
  phoneE164: "+33448084589",
  email: "contactmci@sfr.fr",
  mapsUrl:
    "https://www.google.com/maps/dir/?api=1&destination=" +
    encodeURIComponent("Parc Aquatechnique, 5 rond-point du Luxembourg, 34200 Sète"),
  agrementUrl: "https://www.mci-sete.com/_files/ugd/5f3c99_fb1aa12efa1344659d2fd015674a1e45.pdf",
  /** Photos du site actuel (servies depuis Wix tant que `npm run fetch:brand` n'a pas été lancé) */
  photos: {
    team: {
      local: "/brand/equipe.png",
      remote: "https://static.wixstatic.com/media/5f3c99_7c20170fe0b941ffb0ccd45c2b9c308b~mv2.png",
    },
    building: {
      local: "/brand/batiment.jpg",
      remote: "https://static.wixstatic.com/media/5f3c99_96e31d7738644fd78cdcb7170e016621~mv2.jpg",
    },
  },
  agency: "MJAGENCY",
} as const;

export const TO_CONFIRM = "[À CONFIRMER]";
