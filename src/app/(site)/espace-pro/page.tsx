"use client";
import Link from "next/link";
import { useSession } from "@/lib/store/session";
import { useData } from "@/lib/hooks/useData";
import { OrdersTable } from "@/components/pro/OrdersTable";
import { OrderDetail } from "@/components/pro/OrderDetail";
import { AddSelection } from "@/components/cart/AddSelection";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export default function ProDashboard() {
  const { user, account } = useSession();
  const accountId = user?.accountId ?? "";
  const { data: orders } = useData((b) => b.listOrders(accountId ? { accountId } : undefined), [accountId]);
  const { data: favorites } = useData((b) => (accountId ? b.listFavorites(accountId) : Promise.resolve([])), [accountId]);
  const toApprove = (orders ?? []).filter((o) => o.status === "pending_approval");
  const toAccept = (orders ?? []).filter((o) => o.status === "confirmed" && !o.customerAcceptedAt);

  return (
    <div className="space-y-8">
      <h1 className="t-h2">Tableau de bord</h1>

      {account?.status === "pending" ? (
        <p className="flex items-start gap-3 rounded-[8px] border border-warn/40 bg-warn/10 px-4 py-3 text-sm text-ink">
          <Icon name="clock" size={20} className="mt-px shrink-0 text-warn" />
          <span>Votre compte est en cours de validation par MCI. Vous pouvez déjà commander ; les tarifs et documents s&apos;afficheront après validation.</span>
        </p>
      ) : null}

      {user?.role === "approver" && toApprove.length ? (
        <section aria-labelledby="a-valider">
          <h2 id="a-valider" className="t-label">
            À valider ({toApprove.length})
          </h2>
          <div className="mt-3 space-y-4">
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
          <div className="mt-3 space-y-4">
            {toAccept.map((o) => (
              <OrderDetail key={o.id} order={o} />
            ))}
          </div>
        </section>
      ) : null}

      <section aria-labelledby="dernieres">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 id="dernieres" className="t-label">
            Dernières commandes
          </h2>
          <Link href="/espace-pro/commandes" className="link-u text-sm font-semibold">
            Toutes les commandes
          </Link>
        </div>
        <div className="mt-3">
          <OrdersTable orders={(orders ?? []).slice(0, 5)} onSelect={(o) => (window.location.href = `/espace-pro/commandes?n=${o.number}`)} />
        </div>
      </section>

      <section aria-labelledby="listes">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 id="listes" className="t-label">
            Listes favorites
          </h2>
          <Link href="/espace-pro/favoris" className="link-u text-sm font-semibold">
            Gérer les listes
          </Link>
        </div>
        {favorites?.length ? (
          <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {favorites.map((f) => (
              <li key={f.id} className="flex flex-col rounded-[8px] border border-rule bg-white p-4 transition-colors duration-150 hover:border-ink/30">
                <p className="flex items-start gap-2 font-semibold">
                  <Icon name="star" size={18} className="mt-0.5 shrink-0 text-mci" />
                  <span className="min-w-0 break-words">{f.name}</span>
                </p>
                <p className="mt-1 text-sm text-ink/70">{f.lines.length} références</p>
                <AddSelection lines={f.lines} label="Ajouter au bon" className="mt-4 h-10! w-full justify-center px-4! text-sm!" />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 rounded-[8px] border border-rule bg-white px-4 py-5 text-sm text-ink/70">Créez une liste (« Stock atelier », « Rentrée scolaire »…) pour recommander vos références habituelles en un clic.</p>
        )}
      </section>

      <section className="flex flex-col gap-3 rounded-[8px] border border-rule bg-white p-4 sm:flex-row sm:flex-wrap sm:items-center">
        <ButtonLink href="/commande-rapide" variant="primary" className="h-auto! min-h-11 whitespace-normal! py-2 text-center">
          <Icon name="order" size={18} className="shrink-0" />
          Commande rapide par référence
        </ButtonLink>
        <ButtonLink href="/catalogue" variant="outline">
          Catalogue
        </ButtonLink>
      </section>
    </div>
  );
}
