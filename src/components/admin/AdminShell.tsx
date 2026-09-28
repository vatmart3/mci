"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect } from "react";
import { useSession } from "@/lib/store/session";
import { useCatalog } from "@/lib/store/catalog";
import { useCart } from "@/lib/store/cart";
import { getBackend } from "@/lib/backend";
import { AuthPanel } from "@/components/pro/AuthPanel";
import { LogoMark } from "@/components/brand/Logo";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { IS_DEMO } from "@/lib/env";
import { cx } from "@/lib/cx";

const nav = [
  { href: "/admin", label: "Tableau de bord" },
  { href: "/admin/commandes", label: "Commandes" },
  { href: "/admin/produits", label: "Produits" },
  { href: "/admin/clients", label: "Clients" },
  { href: "/admin/emails", label: "Emails" },
  { href: "/admin/reglages", label: "Réglages" },
];

/** Back-office : sobre, rapide, même charte, sans animation. */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const { ready, user, refresh } = useSession();
  const load = useCatalog((s) => s.load);
  const pathname = usePathname();
  useEffect(() => {
    void refresh();
    void load();
    void useCart.persist.rehydrate();
    const on = () => void refresh();
    window.addEventListener("mci-demo:change", on);
    return () => window.removeEventListener("mci-demo:change", on);
  }, [refresh, load]);

  const staff = user && (user.role === "admin" || user.role === "sales");
  return (
    <div className="min-h-screen bg-salt text-ink">
      <header className="glass sticky top-0 z-40 border-b border-black/5">
        <div className="flex min-h-14 flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-2 lg:px-8">
          <Link href="/admin" className="flex min-w-0 items-center gap-3">
            <LogoMark size={28} />
            <span className="truncate font-display text-md font-semibold tracking-[-0.02em]">MCI · Back-office</span>
            {IS_DEMO ? <Badge tone="warn" className="shrink-0">MODE DÉMO</Badge> : null}
          </Link>
          <div className="flex min-w-0 flex-wrap items-center gap-2 text-sm">
            <Link href="/" className="inline-flex h-8 items-center gap-1 rounded-full px-3 font-medium text-ink/70 transition-colors hover:bg-black/5 hover:text-ink">
              Voir le site
            </Link>
            {staff ? (
              <button
                type="button"
                className="inline-flex h-8 min-w-0 max-w-full items-center rounded-full bg-white px-3 font-medium text-ink/80 ring-1 ring-black/5 transition-[color,box-shadow] duration-300 hover:text-ink hover:shadow-sheet"
                onClick={async () => {
                  await (await getBackend()).signOut();
                  await refresh();
                }}
              >
                <span className="truncate">Déconnexion ({user.fullName})</span>
              </button>
            ) : null}
          </div>
        </div>
      </header>
      <div className="mx-auto w-full max-w-[1600px] px-4 py-6 lg:px-8 lg:py-10">
        <div className={cx(staff ? "grid grid-cols-1 gap-6 lg:grid-cols-[216px_minmax(0,1fr)] lg:gap-10" : undefined)}>
          {staff ? (
            <nav aria-label="Back-office" className="min-w-0 lg:sticky lg:top-24 lg:self-start">
              <ul className="relative flex gap-1 overflow-x-auto pb-1 [scrollbar-width:none] lg:flex-col lg:overflow-visible lg:pb-0">
                {nav.map((n) => {
                  const on = n.href === "/admin" ? pathname === n.href : pathname.startsWith(n.href);
                  return (
                    <li key={n.href} className="shrink-0">
                      <Link
                        href={n.href}
                        aria-current={on ? "page" : undefined}
                        className={cx(
                          "block whitespace-nowrap rounded-full px-4 py-2 text-sm transition-[background-color,color,box-shadow] duration-300 ease-out lg:rounded-tech lg:px-3 lg:py-2.5",
                          on ? "bg-white font-semibold text-ink shadow-sheet" : "font-medium text-ink/70 hover:bg-white/70 hover:text-ink",
                        )}
                      >
                        {n.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          ) : null}
          <main id="contenu" className="min-w-0">
            {!ready ? (
              <p className="inline-flex items-center gap-3 rounded-full bg-white px-4 py-2 text-sm text-ink/70 shadow-sheet ring-1 ring-black/5">
                <span className="size-2 animate-pulse rounded-full bg-mci" aria-hidden="true" />
                Chargement…
              </p>
            ) : !user ? (
              <div className="py-6 lg:py-12">
                <Suspense>
                  <AuthPanel staff title="Connexion MCI" />
                </Suspense>
              </div>
            ) : !staff ? (
              <div className="mx-auto max-w-xl rounded-tile bg-white p-6 text-center shadow-tile ring-1 ring-black/5 sm:p-10">
                <span className="mx-auto grid size-12 place-items-center rounded-full bg-salt text-ink/70">
                  <Icon name="lock" size={22} />
                </span>
                <h1 className="t-h2 mt-5">Accès réservé à MCI.</h1>
                <p className="mt-4 break-words text-ink/70">Ce compte ({user.email}) n&apos;a pas accès au back-office.</p>
                <Link href="/espace-pro" className="link-u mt-6 inline-block font-medium">
                  Aller à l&apos;espace pro
                </Link>
              </div>
            ) : (
              children
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
