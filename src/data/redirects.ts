/**
 * Redirections 301 depuis les anciennes URLs Wix (§14).
 * Les URLs Wix « copie-de-… » ne correspondent pas à leur contenu (duplications) :
 * la table suit ce que chaque page affichait réellement.
 * Les chemins accentués sont déclarés en forme brute ET encodée.
 */
const table: Array<[string, string]> = [
  ["/copie-de-catalogue", "/catalogue/absorbants"],
  ["/copie-de-absorbants", "/catalogue/aerosols"],
  ["/copie-de-aerosols", "/catalogue/decapants-detartrants"],
  ["/copie-de-désherbants", "/catalogue/detergents-desinfectants"],
  ["/copie-de-isecticides-biocides", "/catalogue/desherbants-insecticides-biocides"],
  ["/copie-de-détergents-désinfectants", "/catalogue/surodorants-shampooings"],
  ["/copie-de-surodorants-shampooings", "/catalogue/produits-bio"],
  ["/copie-de-produits-bio", "/catalogue/peintures-savons-solvants"],
  ["/copie-de-peintures-savons-solvants", "/catalogue/produits-specifiques"],
  ["/accueil", "/"],
  ["/home", "/"],
];

export const legacyRedirects = table.flatMap(([source, destination]) => {
  const encoded = encodeURI(source);
  return encoded === source
    ? [{ source, destination }]
    : [
        { source, destination },
        { source: encoded, destination },
      ];
});
