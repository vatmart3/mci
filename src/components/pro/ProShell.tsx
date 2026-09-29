"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { useSession } from "@/lib/store/session";
import { getBackend } from "@/lib/backend";
import { AuthPanel } from "./AuthPanel";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonClass } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";
import { cx } from "@/lib/cx";

const nav: { href: string; label: string; icon: IconName }[] = [
  { href: "/espace-pro", label: "Tableau de bord", icon: "grid" },
  { href: "/espace-pro/commandes", label: "Commandes", icon: "order" },
  { href: "/espace-pro/favoris", label: "Listes favorites", icon: "star" },
  { href: "/espace-pro/documents", label: "Documents", icon: "doc" },
  { href: "/espace-pro/adresses", label: "Structure & adresses", icon: "pin" },
];

export function ProShell({ children }: { children: React.ReactNode }) {
  const { ready, user, account } = useSession();
  const pathname = usePathname();
  if (!ready) {
    return (
      <div className="bg-salt">
        <div className="wrap min-h-[640px] py-12 lg:py-16" aria-busy="true">
          <div className="mx-auto max-w-[480px] text-center">
            <h1 className="t-h2">Espace pro</h1>
            <p className="mx-auto mt-3 max-w-[46ch] text-ink/70">Suivi des commandes, « Recommander » en un clic, listes favorites, fiches techniques, pro-formas, bons de livraison et factures.</p>
            <p className="mt-8 inline-flex items-center gap-2 rounded-[6px] border border-rule bg-white px-4 py-2 text-sm text-ink/70">
              <Icon name="clock" size={16} className="shrink-0 text-mci" />
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
        <div className="wrap min-h-[640px] py-10 lg:py-16">
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
      <header className="border-b border-rule bg-white">
        <div className="wrap flex flex-col gap-4 py-5 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-[6px] bg-mci font-display text-md font-bold text-white" aria-hidden="true">
                {initials || "M"}
              </span>
              <div className="min-w-0">
                <p className="break-words font-display text-lg font-bold leading-tight text-ink">{account?.company ?? (staff ? "Compte MCI" : "Compte sans structure")}</p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm text-ink/70">
                  <span>Espace pro</span>
                  <span aria-hidden="true">·</span>
                  <span className="min-w-0 break-words">{user.fullName}</span>
                  <span aria-hidden="true">·</span>
                  <span>{user.role === "buyer" ? "Acheteur" : user.role === "approver" ? "Valideur" : "MCI"}</span>
                </p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 empty:hidden">
              {account?.status === "pending" ? <Badge tone="warn">EN ATTENTE DE VALIDATION PAR MCI</Badge> : null}
              {account?.status === "active" ? <Badge tone="ok">COMPTE VALIDÉ</Badge> : null}
              {account?.status === "suspended" ? <Badge tone="danger">COMPTE SUSPENDU</Badge> : null}
              {account?.isDemo ? <Badge tone="warn">DÉMO</Badge> : null}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {staff ? (
              <Link href="/admin" className={buttonClass("outline", "sm")}>
                Back-office
                <Icon name="arrow" size={16} />
              </Link>
            ) : null}
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                const b = await getBackend();
                await b.signOut();
                await useSession.getState().refresh();
              }}
            >
              Se déconnecter
            </Button>
          </div>
        </div>
      </header>
      <div className="wrap pb-20 pt-6 lg:pt-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[224px_minmax(0,1fr)] lg:gap-8">
          <nav aria-label="Espace pro" className="min-w-0 lg:sticky lg:top-24 lg:self-start">
            <ul className="relative flex gap-1 overflow-x-auto border-b border-rule pb-2 [scrollbar-width:none] lg:flex-col lg:overflow-visible lg:border-b-0 lg:pb-0">
              {nav.map((n) => {
                const on = n.href === "/espace-pro" ? pathname === n.href : pathname.startsWith(n.href);
                return (
                  <li key={n.href} className="shrink-0">
                    <Link
                      href={n.href}
                      aria-current={on ? "page" : undefined}
                      className={cx(
                        "flex items-center gap-2.5 whitespace-nowrap rounded-[6px] px-3 py-2 text-sm transition-colors duration-150",
                        on ? "bg-sky/60 font-semibold text-mci" : "font-medium text-ink/80 hover:bg-steel/70 hover:text-ink",
                      )}
                    >
                      <Icon name={n.icon} size={18} className={cx("shrink-0", on ? "text-mci" : "text-ink/70")} />
                      {n.label}
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
