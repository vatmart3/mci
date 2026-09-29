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
import { cx } from "@/lib/cx";

/** Check dans un cercle plein : vert si transmise à MCI, ambre si en attente de validation interne. */
function CheckMark({ tone }: { tone: "ok" | "warn" }) {
  return (
    <span aria-hidden="true" className={cx("grid size-14 shrink-0 animate-fade place-items-center rounded-full text-white", tone === "ok" ? "bg-ok" : "bg-warn")}>
      <Icon name="check" size={28} />
    </span>
  );
}

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
      <div className="wrap py-12 lg:py-20" aria-busy="true">
        <div className="mx-auto max-w-[640px] rounded-[8px] border border-rule bg-white p-6 sm:p-10">
          <span className="block h-1 w-32 overflow-hidden rounded-[2px] bg-steel" aria-hidden="true">
            <span className="block h-full w-1/3 bg-mci" />
          </span>
          <p className="mt-5 text-ink/70">
            Chargement de la commande <span className="t-mono text-ink">{numero}</span>…
          </p>
        </div>
      </div>
    );
  }
  if (order === null) {
    return (
      <div className="wrap py-12 lg:py-20">
        <div className="mx-auto max-w-[640px] rounded-[8px] border border-rule bg-white p-6 sm:p-10">
          <span className="grid size-14 place-items-center rounded-[8px] bg-salt text-mci">
            <Icon name="search" size={28} />
          </span>
          <h1 className="t-h1 mt-6">Commande introuvable.</h1>
          <p className="t-lead mt-3 max-w-[52ch] text-ink/70">
            Le numéro <span className="t-mono text-ink [overflow-wrap:anywhere]">{numero}</span> n&apos;est pas accessible depuis ce navigateur. Connectez-vous à votre espace pro ou appelez le{" "}
            <a href={`tel:${company.phoneE164}`} className="whitespace-nowrap font-semibold text-mci hover:underline">
              {company.phone}
            </a>
            .
          </p>
          <ButtonLink href="/espace-pro" size="lg" className="mt-8">
            Espace pro
          </ButtonLink>
        </div>
      </div>
    );
  }

  const pending = order.status === "pending_approval";
  const steps = [
    ...(pending ? ["Le valideur de votre structure reçoit la commande et la transmet à MCI."] : []),
    `MCI vérifie la disponibilité, puis vous envoie la confirmation ${order.lines.some((l) => l.unitPriceHt != null) ? "et le délai" : "avec les prix et le délai (pro-forma)"}.`,
    "Vous validez, MCI prépare et expédie.",
    "Bon de livraison et facture arrivent dans votre espace pro.",
  ];
  return (
    <div className="wrap pb-20 pt-6 lg:pb-24 lg:pt-10">
      <section className="rounded-[12px] border border-rule bg-white" aria-labelledby="merci">
        <div className="grid grid-cols-1 gap-8 p-5 sm:p-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-12 lg:p-10">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-4">
              <CheckMark tone={pending ? "warn" : "ok"} />
              <p className={cx("inline-flex items-center rounded-[4px] px-2.5 py-1 text-sm font-semibold", pending ? "bg-warn/15 text-[#7a4f0c]" : "bg-ok/12 text-ok")}>
                {pending ? "Enregistrée — en attente de validation interne" : "Commande envoyée à MCI"}
              </p>
            </div>
            <h1 id="merci" className="t-h2 mt-6 max-w-[24ch]">
              Merci. Votre commande est enregistrée.
            </h1>
            <p className="mt-6 text-sm font-semibold text-ink/70">Numéro de commande</p>
            <p className="t-h1 t-mono mt-1 max-w-full text-mci [overflow-wrap:anywhere]">{order.number}</p>
            <p className="mt-4 max-w-[64ch] text-ink/80">
              Passée le {formatDateTime(order.createdAt)} par {order.customer.contactName} ({order.customer.company}). Statut : {statusLabels[order.status]}.
            </p>
          </div>
          <div className="flex flex-col gap-3 border-t border-rule pt-6 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
            <Button
              variant="primary"
              size="lg"
              className="w-full !whitespace-normal text-center leading-tight"
              disabled={pdfBusy}
              onClick={async () => {
                setPdfBusy(true);
                const { downloadOrderPdf } = await import("@/lib/pdf/order-pdf");
                await downloadOrderPdf(order, "bon", { demo: IS_DEMO });
                setPdfBusy(false);
              }}
            >
              <Icon name="download" size={18} className="shrink-0" />
              {pdfBusy ? "Préparation du PDF…" : "Télécharger le bon de commande (PDF)"}
            </Button>
            <ButtonLink href="/catalogue" variant="outline" size="lg" className="w-full">
              Retour au catalogue
            </ButtonLink>
            {user ? (
              <Link href="/espace-pro/commandes" className="link-u mt-1 inline-flex items-center gap-1 self-start text-sm font-semibold">
                Suivre dans mon espace pro <Icon name="chevronRight" size={14} />
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="rounded-[8px] border border-rule bg-salt p-5 sm:p-6 lg:col-span-7" aria-labelledby="suite">
          <h2 id="suite" className="t-label">
            La suite
          </h2>
          <ol className="mt-5 space-y-4">
            {steps.map((t, i) => (
              <li key={t} className="flex items-start gap-3">
                <span aria-hidden="true" className="t-num grid size-7 shrink-0 place-items-center rounded-[4px] bg-mci text-sm text-white">
                  {i + 1}
                </span>
                <span className="pt-0.5 text-ink/80">
                  <span className="sr-only">{i + 1}. </span>
                  {t}
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-5 flex items-start gap-2 border-t border-rule pt-4 text-sm text-ink/80">
            <Icon name="mail" size={18} className="mt-px shrink-0 text-mci" />
            <span className="min-w-0 [overflow-wrap:anywhere]">
              Un récapitulatif part à {order.customer.email}
              {IS_DEMO ? " (mode démo : l'email est journalisé, pas envoyé)" : ""}.
            </span>
          </p>
        </section>

        <div className="flex flex-col gap-6 lg:col-span-5">
          <section className="rounded-[8px] border border-rule bg-white p-5 sm:p-6" aria-labelledby="avancement">
            <h2 id="avancement" className="t-label mb-5">
              Avancement
            </h2>
            <OrderTimeline order={order} />
          </section>
          {user ? null : (
            <section className="rounded-[8px] bg-night p-5 text-white sm:p-6" aria-labelledby="compte">
              <h2 id="compte" className="t-label">
                Gagnez du temps la prochaine fois
              </h2>
              <p className="mt-2 text-sm text-white/80">Créez votre compte pro : vos informations sont déjà remplies. Vous pourrez suivre cette commande et recommander en un clic.</p>
              <ButtonLink href="/espace-pro?creer=1" variant="inverse" className="mt-5">
                Créer mon compte pro
              </ButtonLink>
            </section>
          )}
        </div>
      </div>

      <section className="mt-6 rounded-[8px] border border-rule bg-white p-5 sm:p-6" aria-labelledby="lignes">
        <h2 id="lignes" className="t-label mb-3">
          Détail{" "}
          <span className="font-body text-base font-normal text-ink/70">
            — {order.lines.length} ligne{order.lines.length > 1 ? "s" : ""}
          </span>
        </h2>
        <OrderLinesTable order={order} />
      </section>
    </div>
  );
}
