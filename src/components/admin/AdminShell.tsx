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
    <div className="min-h-screen bg-salt">
      <header className="bg-deep text-white">
        <div className="flex h-14 items-center justify-between gap-6 px-4 lg:px-8">
          <Link href="/admin" className="flex items-center gap-3">
            <LogoMark size={28} />
            <span className="font-display text-lg font-extrabold" style={{ fontVariationSettings: '"wdth" 120' }}>
              MCI · Back-office
            </span>
            {IS_DEMO ? <span className="t-mono rounded-tech bg-warn px-2 text-[11px] text-ink">MODE DÉMO</span> : null}
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/" className="hover:underline">
              Voir le site
            </Link>
            {staff ? (
              <button
                type="button"
                className="hover:underline"
                onClick={async () => {
                  await (await getBackend()).signOut();
                  await refresh();
                }}
              >
                Déconnexion ({user.fullName})
              </button>
            ) : null}
          </div>
        </div>
        {staff ? (
          <nav aria-label="Back-office" className="relative overflow-x-auto border-t border-white/15 px-2 lg:px-6">
            <ul className="flex">
              {nav.map((n) => {
                const on = n.href === "/admin" ? pathname === n.href : pathname.startsWith(n.href);
                return (
                  <li key={n.href}>
                    <Link href={n.href} aria-current={on ? "page" : undefined} className={cx("block whitespace-nowrap border-b-2 px-3 py-3 text-sm", on ? "border-action font-semibold" : "border-deep text-white/80 hover:text-white")}>
                      {n.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        ) : null}
      </header>
      <main id="contenu" className="px-4 py-8 lg:px-8">
        {!ready ? (
          <p className="t-mono text-sm text-ink/70">CHARGEMENT…</p>
        ) : !user ? (
          <Suspense>
            <AuthPanel staff title="Connexion MCI" />
          </Suspense>
        ) : !staff ? (
          <div className="max-w-xl">
            <h1 className="t-h2">Accès réservé à MCI.</h1>
            <p className="mt-4 text-ink/80">Ce compte ({user.email}) n&apos;a pas accès au back-office.</p>
            <Link href="/espace-pro" className="link-u mt-4 inline-block">
              Aller à l&apos;espace pro
            </Link>
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}
