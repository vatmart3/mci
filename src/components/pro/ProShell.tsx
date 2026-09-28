"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { useSession } from "@/lib/store/session";
import { getBackend } from "@/lib/backend";
import { AuthPanel } from "./AuthPanel";
import { Badge } from "@/components/ui/Badge";
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
      <div className="wrap min-h-[760px] py-12 lg:py-16" aria-busy="true">
        <div className="mx-auto max-w-[720px]">
          <h1 className="t-h1">Espace pro</h1>
          <p className="t-lead mt-4 text-ink/80">Suivi des commandes, « Recommander » en un clic, listes favorites, fiches techniques, pro-formas, bons de livraison et factures.</p>
          <p className="t-mono mt-8 text-sm text-ink/70">CHARGEMENT DE VOTRE SESSION…</p>
        </div>
      </div>
    );
  }
  if (!user) {
    return (
      <div className="wrap min-h-[760px] py-12 lg:py-16">
        <Suspense>
          <AuthPanel />
        </Suspense>
      </div>
    );
  }
  const staff = user.role === "admin" || user.role === "sales";
  return (
    <div className="wrap pb-16 pt-8 lg:pt-12">
      <div className="flex flex-col gap-4 border-b border-ink pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="t-mono text-sm text-ink/70">
            <span className="text-mci">ESPACE PRO</span> — {user.fullName.toUpperCase()} · {user.role === "buyer" ? "ACHETEUR" : user.role === "approver" ? "VALIDEUR" : "MCI"}
          </p>
          <p className="t-h2 mt-2">{account?.company ?? (staff ? "Compte MCI" : "Compte sans structure")}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {account?.status === "pending" ? <Badge tone="warn">EN ATTENTE DE VALIDATION PAR MCI</Badge> : null}
            {account?.status === "active" ? <Badge tone="ok">COMPTE VALIDÉ</Badge> : null}
            {account?.status === "suspended" ? <Badge tone="danger">COMPTE SUSPENDU</Badge> : null}
            {account?.isDemo ? <Badge tone="warn">DÉMO</Badge> : null}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {staff ? (
            <Link href="/admin" className="link-u font-semibold">
              Back-office →
            </Link>
          ) : null}
          <button
            type="button"
            className="link-u text-sm"
            onClick={async () => {
              const b = await getBackend();
              await b.signOut();
              await useSession.getState().refresh();
            }}
          >
            Se déconnecter
          </button>
        </div>
      </div>
      <div className="grid-12 mt-8 gap-y-8">
        <nav aria-label="Espace pro" className="col-span-12 lg:col-span-3">
          <ul className="flex gap-2 overflow-x-auto lg:flex-col lg:gap-1">
            {nav.map((n) => {
              const on = n.href === "/espace-pro" ? pathname === n.href : pathname.startsWith(n.href);
              return (
                <li key={n.href} className="shrink-0">
                  <Link href={n.href} aria-current={on ? "page" : undefined} className={cx("block rounded-tech px-3 py-2 text-sm font-medium", on ? "bg-ink text-white" : "hover:bg-white")}>
                    {n.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="col-span-12 min-w-0 lg:col-span-9">{children}</div>
      </div>
    </div>
  );
}
