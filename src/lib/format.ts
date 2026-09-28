const eur = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });
const dateFmt = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
const dateTimeFmt = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
const longDate = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" });

export const formatEur = (n: number) => eur.format(n);
export const formatDate = (iso: string) => dateFmt.format(new Date(iso));
export const formatDateTime = (iso: string) => dateTimeFmt.format(new Date(iso));
export const formatLongDate = (iso: string) => longDate.format(new Date(iso));

export function plural(n: number, one: string, many: string) {
  return `${n} ${n > 1 ? many : one}`;
}

/** Normalise pour comparaison : minuscules, sans accents, espaces simples */
export function norm(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[’']/g, " ")
    .replace(/[^a-z0-9/]+/g, " ")
    .trim();
}

export function uid(prefix = ""): string {
  const r = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36);
  return prefix + r;
}

/** SIRET : 14 chiffres (espaces tolérés). */
export function cleanSiret(s: string) {
  return s.replace(/\s+/g, "");
}
export function isValidSiret(s: string): boolean {
  return /^\d{14}$/.test(cleanSiret(s));
}
