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
import { Icon, type IconName } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { IS_DEMO } from "@/lib/env";
import { cx } from "@/lib/cx";

const nav: { href: string; label: string; icon: IconName }[] = [
  { href: "/admin", label: "Tableau de bord", icon: "grid" },
  { href: "/admin/commandes", label: "Commandes", icon: "order" },
  { href: "/admin/produits", label: "Produits", icon: "list" },
  { href: "/admin/clients", label: "Clients", icon: "user" },
  { href: "/admin/emails", label: "Emails", icon: "mail" },
  { href: "/admin/reglages", label: "Réglages", icon: "edit" },
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
  const brand = (inverted: boolean) => (
    <Link href="/admin" className="flex min-w-0 items-center gap-3">
      <LogoMark size={28} className="shrink-0" />
      <span className={cx("truncate font-display text-md font-bold", inverted ? "text-white" : "text-ink")}>MCI · Back-office</span>
      {IS_DEMO ? <Badge tone="warn" className="shrink-0">MODE DÉMO</Badge> : null}
    </Link>
  );
  const main = (
    <main id="contenu" className="min-w-0">
      {!ready ? (
        <p className="inline-flex items-center gap-2 rounded-[6px] border border-rule bg-white px-4 py-2 text-sm text-ink/70">
          <Icon name="clock" size={16} className="shrink-0 text-mci" />
          Chargement…
        </p>
      ) : !user ? (
        <div className="py-6 lg:py-12">
          <Suspense>
            <AuthPanel staff title="Connexion MCI" />
          </Suspense>
        </div>
      ) : !staff ? (
        <div className="mx-auto max-w-xl rounded-[8px] border border-rule bg-white p-6 text-center shadow-sheet sm:p-10">
          <span className="mx-auto grid size-11 place-items-center rounded-[6px] bg-steel text-ink/70">
            <Icon name="lock" size={22} />
          </span>
          <h1 className="t-h2 mt-5">Accès réservé à MCI.</h1>
          <p className="mt-3 break-words text-ink/70">Ce compte ({user.email}) n&apos;a pas accès au back-office.</p>
          <Link href="/espace-pro" className="link-u mt-6 inline-block font-semibold">
            Aller à l&apos;espace pro
          </Link>
        </div>
      ) : (
        children
      )}
    </main>
  );

  if (!staff) {
    return (
      <div className="min-h-screen bg-salt text-ink">
        <header className="border-b border-rule bg-white">
          <div className="flex min-h-14 flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-2 lg:px-8">
            {brand(false)}
            <Link href="/" className="inline-flex h-8 items-center gap-1.5 rounded-[6px] px-2 text-sm font-semibold text-mci transition-colors duration-150 hover:bg-salt">
              Voir le site <Icon name="arrowUpRight" size={14} />
            </Link>
          </div>
        </header>
        <div className="mx-auto w-full max-w-[1440px] px-4 py-6 lg:px-8 lg:py-8">{main}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-salt text-ink lg:grid lg:grid-cols-[232px_minmax(0,1fr)]">
      <aside className="flex min-w-0 flex-col bg-night text-white lg:sticky lg:top-0 lg:h-screen">
        <div className="flex min-h-14 flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 lg:border-b lg:border-white/10 lg:py-4">{brand(true)}</div>
        <nav aria-label="Back-office" className="order-3 min-w-0 px-2 pb-2 lg:order-2 lg:flex-1 lg:overflow-y-auto lg:px-3 lg:py-4">
          <ul className="relative flex gap-1 overflow-x-auto [scrollbar-width:none] lg:flex-col lg:overflow-visible">
            {nav.map((n) => {
              const on = n.href === "/admin" ? pathname === n.href : pathname.startsWith(n.href);
              return (
                <li key={n.href} className="shrink-0">
                  <Link
                    href={n.href}
                    aria-current={on ? "page" : undefined}
                    className={cx(
                      "flex items-center gap-2.5 whitespace-nowrap rounded-[6px] px-3 py-2 text-sm transition-colors duration-150",
                      on ? "bg-sky font-semibold text-night" : "font-medium text-white/80 hover:bg-white/10 hover:text-white",
                    )}
                  >
                    <Icon name={n.icon} size={18} className="shrink-0" />
                    {n.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="order-2 flex min-w-0 flex-wrap items-center gap-2 px-4 pb-3 text-sm lg:order-3 lg:flex-col lg:items-stretch lg:border-t lg:border-white/10 lg:px-3 lg:py-4">
          <Link href="/" className="inline-flex h-8 items-center gap-1.5 rounded-[6px] px-3 font-medium text-white/80 transition-colors duration-150 hover:bg-white/10 hover:text-white">
            Voir le site <Icon name="arrowUpRight" size={14} />
          </Link>
          <button
            type="button"
            className="inline-flex h-8 min-w-0 max-w-full items-center rounded-[6px] border border-white/25 px-3 font-medium text-white transition-colors duration-150 hover:bg-white/10"
            onClick={async () => {
              await (await getBackend()).signOut();
              await refresh();
            }}
          >
            <span className="truncate">Déconnexion ({user.fullName})</span>
          </button>
        </div>
      </aside>
      <div className="min-w-0 px-4 py-6 lg:px-8 lg:py-8">
        <div className="mx-auto w-full max-w-[1440px]">{main}</div>
      </div>
    </div>
  );
}
