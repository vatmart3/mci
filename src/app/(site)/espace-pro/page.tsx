"use client";
import Link from "next/link";
import { useSession } from "@/lib/store/session";
import { useData } from "@/lib/hooks/useData";
import { OrdersTable } from "@/components/pro/OrdersTable";
import { OrderDetail } from "@/components/pro/OrderDetail";
import { AddSelection } from "@/components/cart/AddSelection";
import { ButtonLink } from "@/components/ui/Button";

export default function ProDashboard() {
  const { user, account } = useSession();
  const accountId = user?.accountId ?? "";
  const { data: orders } = useData((b) => b.listOrders(accountId ? { accountId } : undefined), [accountId]);
  const { data: favorites } = useData((b) => (accountId ? b.listFavorites(accountId) : Promise.resolve([])), [accountId]);
  const toApprove = (orders ?? []).filter((o) => o.status === "pending_approval");
  const toAccept = (orders ?? []).filter((o) => o.status === "confirmed" && !o.customerAcceptedAt);

  return (
    <div className="space-y-12">
      {account?.status === "pending" ? (
        <p className="rounded-tech border border-warn/60 bg-warn/10 p-4 text-sm">
          Votre compte est en cours de validation par MCI. Vous pouvez déjà commander ; les tarifs et documents s&apos;afficheront après validation.
        </p>
      ) : null}

      {user?.role === "approver" && toApprove.length ? (
        <section aria-labelledby="a-valider">
          <h2 id="a-valider" className="t-label">
            À valider ({toApprove.length})
          </h2>
          <div className="mt-4 space-y-4">
            {toApprove.map((o) => (
              <OrderDetail key={o.id} order={o} />
            ))}
          </div>
        </section>
      ) : null}

      {toAccept.length ? (
        <section aria-labelledby="pro-formas">
          <h2 id="pro-formas" className="t-label">
            Pro-formas à valider ({toAccept.length})
          </h2>
          <div className="mt-4 space-y-4">
            {toAccept.map((o) => (
              <OrderDetail key={o.id} order={o} />
            ))}
          </div>
        </section>
      ) : null}

      <section aria-labelledby="dernieres">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="dernieres" className="t-label">
            Dernières commandes
          </h2>
          <Link href="/espace-pro/commandes" className="link-u text-sm">
            Toutes les commandes
          </Link>
        </div>
        <div className="mt-4">
          <OrdersTable orders={(orders ?? []).slice(0, 5)} onSelect={(o) => (window.location.href = `/espace-pro/commandes?n=${o.number}`)} />
        </div>
      </section>

      <section aria-labelledby="listes">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="listes" className="t-label">
            Listes favorites
          </h2>
          <Link href="/espace-pro/favoris" className="link-u text-sm">
            Gérer les listes
          </Link>
        </div>
        {favorites?.length ? (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {favorites.map((f) => (
              <li key={f.id} className="rounded-box border border-rule bg-white p-4">
                <p className="font-semibold">{f.name}</p>
                <p className="t-mono text-xs text-ink/70">{f.lines.length} RÉFÉRENCES</p>
                <AddSelection lines={f.lines} label="Ajouter au bon" className="mt-4 h-10 w-full px-3 text-sm" />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-ink/70">Créez une liste (« Stock atelier », « Rentrée scolaire »…) pour recommander vos références habituelles en un clic.</p>
        )}
      </section>

      <section className="flex flex-wrap gap-4 border-t border-ink pt-6">
        <ButtonLink href="/commande-rapide" variant="primary">
          Commande rapide par référence
        </ButtonLink>
        <ButtonLink href="/catalogue" variant="outline">
          Catalogue
        </ButtonLink>
      </section>
    </div>
  );
}
