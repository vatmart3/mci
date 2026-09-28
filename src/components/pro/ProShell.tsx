"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { useSession } from "@/lib/store/session";
import { getBackend } from "@/lib/backend";
import { AuthPanel } from "./AuthPanel";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { cx } from "@/lib/cx";

const nav = [
  { href: "/espace-pro", label: "Tableau de bord" },
  { href: "/espace-pro/commandes", label: "Commandes" },
  { href: "/espace-pro/favoris", label: "Listes favorites" },
  { href: "/espace-pro/documents", label: "Documents" },
  { href: "/espace-pro/adresses", label: "Structure & adresses" },
];

export function ProShell({ children }: { children: React.ReactNode }) {
  const { ready, user, account } = useSession();
  const pathname = usePathname();
  if (!ready) {
    return (
      <div className="bg-salt">
        <div className="wrap min-h-[760px] py-16 lg:py-24" aria-busy="true">
          <div className="mx-auto max-w-[760px] text-center">
            <h1 className="t-h1">Espace pro</h1>
            <p className="t-lead mx-auto mt-6 max-w-[46ch] text-ink/70">Suivi des commandes, « Recommander » en un clic, listes favorites, fiches techniques, pro-formas, bons de livraison et factures.</p>
            <p className="mt-12 inline-flex items-center gap-3 rounded-full bg-white px-4 py-2 text-sm text-ink/70 shadow-sheet ring-1 ring-black/5">
              <span className="size-2 animate-pulse rounded-full bg-mci" aria-hidden="true" />
              Chargement de votre session…
            </p>
          </div>
        </div>
      </div>
    );
  }
  if (!user) {
    return (
      <div className="bg-salt">
        <div className="wrap min-h-[760px] py-12 lg:py-20">
          <Suspense>
            <AuthPanel />
          </Suspense>
        </div>
      </div>
    );
  }
  const staff = user.role === "admin" || user.role === "sales";
  const initials = user.fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
  return (
    <div className="bg-salt">
      <div className="wrap pb-24 pt-8 lg:pt-12">
        <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <span className="grid size-14 shrink-0 place-items-center rounded-full bg-white text-md font-semibold text-mci shadow-sheet ring-1 ring-black/5" aria-hidden="true">
              {initials || "M"}
            </span>
            <div className="min-w-0">
              <p className="text-sm text-ink/70">
                <span className="font-semibold text-mci">Espace pro</span> · {user.fullName} · {user.role === "buyer" ? "Acheteur" : user.role === "approver" ? "Valideur" : "MCI"}
              </p>
              <p className="t-h2 mt-1 break-words">{account?.company ?? (staff ? "Compte MCI" : "Compte sans structure")}</p>
              <div className="mt-3 flex flex-wrap gap-2 empty:hidden">
                {account?.status === "pending" ? <Badge tone="warn">EN ATTENTE DE VALIDATION PAR MCI</Badge> : null}
                {account?.status === "active" ? <Badge tone="ok">COMPTE VALIDÉ</Badge> : null}
                {account?.status === "suspended" ? <Badge tone="danger">COMPTE SUSPENDU</Badge> : null}
                {account?.isDemo ? <Badge tone="warn">DÉMO</Badge> : null}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {staff ? (
              <Link href="/admin" className="inline-flex h-9 items-center gap-1 rounded-full bg-ink px-4 text-sm font-medium text-white transition-colors duration-300 hover:bg-deep">
                Back-office →
              </Link>
            ) : null}
            <button
              type="button"
              className="inline-flex h-9 items-center rounded-full bg-white px-4 text-sm font-medium text-ink/80 ring-1 ring-black/5 transition-[color,box-shadow] duration-300 hover:text-ink hover:shadow-sheet"
              onClick={async () => {
                const b = await getBackend();
                await b.signOut();
                await useSession.getState().refresh();
              }}
            >
              Se déconnecter
            </button>
          </div>
        </header>
        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[232px_minmax(0,1fr)] lg:gap-12">
          <nav aria-label="Espace pro" className="min-w-0 lg:sticky lg:top-20 lg:self-start">
            <ul className="relative flex gap-1 overflow-x-auto pb-1 [scrollbar-width:none] lg:flex-col lg:overflow-visible lg:pb-0">
              {nav.map((n) => {
                const on = n.href === "/espace-pro" ? pathname === n.href : pathname.startsWith(n.href);
                return (
                  <li key={n.href} className="shrink-0">
                    <Link
                      href={n.href}
                      aria-current={on ? "page" : undefined}
                      className={cx(
                        "flex items-center justify-between gap-3 whitespace-nowrap rounded-full px-4 py-2 text-sm transition-[background-color,color,box-shadow] duration-300 ease-out lg:rounded-tech lg:px-3 lg:py-2.5",
                        on ? "bg-white font-semibold text-ink shadow-sheet" : "font-medium text-ink/70 hover:bg-white/70 hover:text-ink",
                      )}
                    >
                      {n.label}
                      <Icon name="chevronRight" size={16} className={cx("hidden lg:block", on ? "text-mci" : "text-ink/30")} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
