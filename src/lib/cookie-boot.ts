export const COOKIE_KEY = "mci:cookies";
const SIX_MONTHS = 1000 * 60 * 60 * 24 * 182;

/**
 * Script inline (avant peinture) : marque le document « js » (animations d'apparition)
 * et masque le bandeau cookies si un choix récent existe — pas de saut à l'hydratation.
 */
export const bootScript = `document.documentElement.classList.add("js");try{var v=JSON.parse(localStorage.getItem("${COOKIE_KEY}")||"null");if(v&&Date.now()-v.at<${SIX_MONTHS})document.documentElement.dataset.cookies="1"}catch(e){}`;
