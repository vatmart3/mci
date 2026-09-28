/* Commandes invité passées depuis ce navigateur (accès à la page de confirmation) */
const GUEST = "mci:guest-orders";
export function readGuestOrders(): string[] {
  try {
    return JSON.parse(window.localStorage.getItem(GUEST) ?? "[]") as string[];
  } catch {
    return [];
  }
}
export function rememberGuestOrder(n: string, email?: string) {
  try {
    if (email) window.sessionStorage.setItem(`mci:guest-email:${n}`, email);
    window.localStorage.setItem(GUEST, JSON.stringify([n, ...readGuestOrders()].slice(0, 20)));
  } catch {
    /* ignore */
  }
}
