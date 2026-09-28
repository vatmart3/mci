"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Order } from "@/lib/types";
import { getBackend } from "@/lib/backend";
import { useSession } from "@/lib/store/session";
import { statusLabels } from "@/lib/orders";
import { formatDateTime } from "@/lib/format";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { OrderTimeline } from "./OrderTimeline";
import { OrderLinesTable } from "./OrderLinesTable";
import { company } from "@/data/company";
import { IS_DEMO } from "@/lib/env";

export function Confirmation({ numero }: { numero: string }) {
  const [order, setOrder] = useState<Order | null | undefined>(undefined);
  const [pdfBusy, setPdfBusy] = useState(false);
  const user = useSession((s) => s.user);

  useEffect(() => {
    void getBackend()
      .then((b) => b.getOrder(numero))
      .then(setOrder)
      .catch(() => setOrder(null));
  }, [numero, user?.id]);

  if (order === undefined) {
    return (
      <div className="wrap py-24" aria-busy="true">
        <p className="t-mono text-sm text-ink/70">CHARGEMENT DE LA COMMANDE {numero}…</p>
      </div>
    );
  }
  if (order === null) {
    return (
      <div className="wrap py-24">
        <h1 className="t-h1">Commande introuvable.</h1>
        <p className="mt-4 max-w-[52ch] text-ink/80">
          Le numéro {numero} n&apos;est pas accessible depuis ce navigateur. Connectez-vous à votre espace pro ou appelez le {company.phone}.
        </p>
        <ButtonLink href="/espace-pro" className="mt-8">
          Espace pro
        </ButtonLink>
      </div>
    );
  }

  const pending = order.status === "pending_approval";
  return (
    <div className="wrap pb-16 pt-8 lg:pt-12">
      <div className="grid-12 gap-y-10">
        <div className="col-span-12 lg:col-span-7">
          <p className="t-mono flex items-center gap-2 text-sm text-ok">
            <Icon name="check" size={18} /> {pending ? "ENREGISTRÉE — EN ATTENTE DE VALIDATION INTERNE" : "COMMANDE ENVOYÉE À MCI"}
          </p>
          <h1 className="t-h1 mt-4">
            Merci. Votre commande est enregistrée.
          </h1>
          <p className="t-mono mt-6 text-2xl text-mci">{order.number}</p>
          <p className="mt-2 text-ink/80">
            Passée le {formatDateTime(order.createdAt)} par {order.customer.contactName} ({order.customer.company}). Statut : {statusLabels[order.status]}.
          </p>
          <div className="mt-8 rounded-box border border-rule bg-white p-6">
            <h2 className="t-label">La suite</h2>
            <ol className="mt-4 space-y-3 text-ink/85">
              {pending ? <li>1. Le valideur de votre structure reçoit la commande et la transmet à MCI.</li> : null}
              <li>{pending ? "2." : "1."} MCI vérifie la disponibilité, puis vous envoie la confirmation {order.lines.some((l) => l.unitPriceHt != null) ? "et le délai" : "avec les prix et le délai (pro-forma)"}.</li>
              <li>{pending ? "3." : "2."} Vous validez, MCI prépare et expédie.</li>
              <li>{pending ? "4." : "3."} Bon de livraison et facture arrivent dans votre espace pro.</li>
            </ol>
            <p className="mt-4 text-sm text-ink/70">
              Un récapitulatif part à {order.customer.email}
              {IS_DEMO ? " (mode démo : l'email est journalisé, pas envoyé)" : ""}.
            </p>
          </div>
          <div className="mt-8">
            <OrderTimeline order={order} />
          </div>
        </div>

        <aside className="col-span-12 lg:col-span-4 lg:col-start-9">
          <div className="flex flex-col gap-3">
            <Button
              variant="primary"
              disabled={pdfBusy}
              onClick={async () => {
                setPdfBusy(true);
                const { downloadOrderPdf } = await import("@/lib/pdf/order-pdf");
                await downloadOrderPdf(order, "bon", { demo: IS_DEMO });
                setPdfBusy(false);
              }}
            >
              <Icon name="download" size={18} />
              {pdfBusy ? "Préparation du PDF…" : "Télécharger le bon de commande (PDF)"}
            </Button>
            <ButtonLink href="/catalogue" variant="outline">
              Retour au catalogue
            </ButtonLink>
          </div>
          {user ? (
            <Link href="/espace-pro/commandes" className="link-u mt-6 inline-block">
              Suivre dans mon espace pro →
            </Link>
          ) : (
            <div className="mt-8 border-t border-ink pt-6">
              <p className="t-label">Gagnez du temps la prochaine fois</p>
              <p className="mt-2 text-sm text-ink/80">Créez votre compte pro : vos informations sont déjà remplies. Vous pourrez suivre cette commande et recommander en un clic.</p>
              <ButtonLink href="/espace-pro?creer=1" variant="primary" className="mt-4">
                Créer mon compte pro
              </ButtonLink>
            </div>
          )}
        </aside>
      </div>

      <section className="mt-16" aria-labelledby="lignes">
        <h2 id="lignes" className="t-mono mb-4 text-sm text-ink/70">
          DÉTAIL — {order.lines.length} LIGNE{order.lines.length > 1 ? "S" : ""}
        </h2>
        <OrderLinesTable order={order} />
      </section>
    </div>
  );
}
