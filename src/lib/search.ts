/**
 * Recherche catalogue — tolérante aux accents, aux pluriels et aux fautes de frappe,
 * et qui comprend le vocabulaire terrain (« tag », « cafard », « clim », « calcaire »…).
 * Aucun service externe : index construit en mémoire (~90 produits).
 */
import type { Product } from "@/lib/types";
import { familyBySlug } from "@/data/families";
import { sectorBySlug } from "@/data/sectors";
import { formatLabels, propertyLabels } from "@/data/properties";
import { norm } from "@/lib/format";

const STOP = new Set(["de", "des", "du", "d", "la", "le", "les", "l", "pour", "et", "a", "au", "aux", "en", "un", "une", "sur", "avec", "sans", "par", "contre", "dans", "the"]);

/** Vocabulaire terrain → termes présents dans les fiches */
const SYNONYMS: Record<string, string[]> = {
  tag: ["graffiti"],
  graff: ["graffiti"],
  graffiti: ["tag"],
  cafard: ["blatte", "cafard"],
  blatte: ["cafard"],
  rat: ["raticide", "rongeur"],
  souris: ["souricide", "rongeur"],
  rongeur: ["raticide", "souricide"],
  clim: ["climatisation"],
  climatiseur: ["climatisation"],
  calcaire: ["tartre", "detartrant"],
  tartre: ["detartrant", "desincrustant"],
  wc: ["sanitaire", "toilette"],
  toilette: ["sanitaire", "wc"],
  sanitaire: ["toilette"],
  frelon: ["guepe", "frelon"],
  guepe: ["frelon"],
  moustique: ["insecte", "volant"],
  mouche: ["insecte", "volant"],
  punaise: ["punaise", "acarien"],
  gale: ["sarcopte"],
  verglas: ["deverglacant", "neige"],
  neige: ["deverglacant"],
  gasoil: ["hydrocarbure"],
  gazole: ["hydrocarbure"],
  essence: ["hydrocarbure"],
  huile: ["hydrocarbure", "huile"],
  vin: ["cave", "derougissant", "viticulture"],
  cuve: ["cave", "cuve"],
  chai: ["cave"],
  vigne: ["viticulture", "pulverisateur"],
  bateau: ["nautisme", "coque", "marin"],
  voiture: ["carrosserie", "automobile"],
  auto: ["carrosserie", "automobile"],
  camion: ["carrosserie"],
  frein: ["frein"],
  rouille: ["derouillant", "rouille"],
  desinfectant: ["desinfectant", "bactericide", "virucide"],
  virus: ["virucide"],
  bacterie: ["bactericide"],
  odeur: ["desodorisant", "odeur"],
  mauvaise: ["odeur"],
  mousse: ["mousse", "algue"],
  algue: ["algue"],
  lichen: ["mousse", "algue"],
  herbe: ["desherbant"],
  adventice: ["desherbant"],
  inox: ["inox", "inoxydable"],
  alu: ["aluminium"],
  fosse: ["fosse", "septique"],
  graisse: ["graisse", "degraissant"],
  vitre: ["vitre"],
  vaisselle: ["vaisselle", "plonge"],
  linge: ["lessive"],
  main: ["main"],
  gymnase: ["gymnase", "sportif"],
  piscine: ["sportif"],
  cantine: ["alimentaire", "cuisine"],
  cuisine: ["alimentaire", "cuisine"],
  colle: ["colle", "adhesif"],
  etiquette: ["etiquette", "adhesif"],
  degrippant: ["degrippant"],
};

function stem(t: string): string {
  if (t.length > 4 && (t.endsWith("s") || t.endsWith("x"))) t = t.slice(0, -1);
  return t;
}

function tokens(s: string): string[] {
  return norm(s)
    .split(/[\s/]+/)
    .filter((t) => t && !STOP.has(t))
    .map(stem);
}

function lev(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const v = Math.min(prev[j]! + 1, cur[j - 1]! + 1, prev[j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1));
      cur.push(v);
      rowMin = Math.min(rowMin, v);
    }
    if (rowMin > max) return max + 1;
    prev = cur;
  }
  return prev[b.length]!;
}

interface Indexed {
  product: Product;
  fields: { tokens: string[]; weight: number }[];
  compactCode: string;
}

export function buildIndex(list: Product[]): Indexed[] {
  return list.map((p) => ({
    product: p,
    compactCode: norm(p.code).replace(/\s+/g, ""),
    fields: [
      { tokens: tokens(p.code), weight: 6 },
      { tokens: tokens(p.short), weight: 4 },
      { tokens: tokens(p.usages.join(" ")), weight: 3 },
      { tokens: tokens(p.description + " " + (p.variants ?? "")), weight: 2 },
      {
        tokens: tokens(
          [
            ...p.families.map((f) => familyBySlug.get(f)?.name ?? ""),
            ...p.sectors.map((s) => sectorBySlug.get(s)?.name ?? ""),
            ...p.properties.map((x) => propertyLabels[x].label),
            ...p.formats.map((f) => formatLabels[f]),
          ].join(" "),
        ),
        weight: 1,
      },
    ],
  }));
}

function matchToken(q: string, t: string, fuzzy: boolean): number {
  if (t === q) return 1;
  if (q.length >= 2 && t.startsWith(q)) return q.length >= 4 ? 0.85 : 0.6;
  if (q.length >= 4 && t.includes(q)) return 0.55;
  if (fuzzy && q.length >= 4) {
    const max = q.length >= 8 ? 2 : 1;
    // comparaison sur la même longueur (préfixe) pour tolérer un mot tronqué mal orthographié
    if (lev(q, t, max) <= max) return 0.6;
    if (t.length > q.length && lev(q, t.slice(0, q.length), max) <= max) return 0.45;
  }
  return 0;
}

function scoreTerm(idx: Indexed, variants: string[], fuzzy: Set<string>): number {
  let best = 0;
  for (const v of variants) {
    const isSyn = v !== variants[0];
    for (const f of idx.fields) {
      for (const t of f.tokens) {
        const m = matchToken(v, t, fuzzy.has(v));
        if (m) best = Math.max(best, m * f.weight * (isSyn ? 0.7 : 1));
      }
    }
  }
  return best;
}

export interface SearchHit {
  product: Product;
  score: number;
}

export function search(index: Indexed[], query: string): SearchHit[] | null {
  const q = tokens(query);
  if (!q.length) return null;
  const compact = norm(query).replace(/\s+/g, "");
  const terms = q.map((t) => [t, ...(SYNONYMS[t] ?? SYNONYMS[t + "s"] ?? []).map(stem)]);
  // La tolérance aux fautes ne s'active que pour un terme introuvable tel quel dans tout le catalogue
  const fuzzy = new Set<string>();
  for (const v of terms.flat()) {
    const found = index.some((idx) => idx.fields.some((f) => f.tokens.some((t) => matchToken(v, t, false) > 0)));
    if (!found) fuzzy.add(v);
  }

  const scoreAll = (mode: "and" | "or") =>
    index
      .map((idx) => {
        let total = 0;
        let matched = 0;
        for (const variants of terms) {
          const s = scoreTerm(idx, variants, fuzzy);
          if (s > 0) matched++;
          total += s;
        }
        if (compact.length >= 2 && idx.compactCode.startsWith(compact)) total += 20;
        else if (compact.length >= 3 && idx.compactCode.includes(compact)) total += 8;
        const ok = mode === "and" ? matched === terms.length : matched > 0;
        return ok || total >= 20 ? { product: idx.product, score: total + matched * 2 } : null;
      })
      .filter((h): h is SearchHit => h !== null)
      .sort((a, b) => b.score - a.score);

  const strict = scoreAll("and");
  return strict.length ? strict : scoreAll("or");
}
