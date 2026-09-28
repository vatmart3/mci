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

/** Grand check dessiné au trait (cercle puis coche), désactivé si mouvement réduit via globals.css. */
function CheckMark({ tone }: { tone: "ok" | "warn" }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    let r2 = 0;
    const r1 = requestAnimationFrame(() => {
      r2 = requestAnimationFrame(() => setOn(true));
    });
    return () => {
      cancelAnimationFrame(r1);
      cancelAnimationFrame(r2);
    };
  }, []);
  const ease = "var(--ease-out)";
  return (
    <svg viewBox="0 0 96 96" className={cx("size-20 sm:size-24", tone === "ok" ? "text-ok" : "text-warn")} aria-hidden="true">
      <circle
        cx="48"
        cy="48"
        r="46"
        fill="currentColor"
        style={{ opacity: on ? 0.1 : 0, transform: on ? "scale(1)" : "scale(0.6)", transformOrigin: "48px 48px", transition: `opacity 600ms ${ease}, transform 700ms var(--ease-spring)` }}
      />
      <circle
        cx="48"
        cy="48"
        r="42"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray="1"
        transform="rotate(-90 48 48)"
        style={{ strokeDashoffset: on ? 0 : 1, transition: `stroke-dashoffset 800ms ${ease}` }}
      />
      <path
        d="M30 49.5l12 12 24-26"
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray="1"
        style={{ strokeDashoffset: on ? 0 : 1, transition: `stroke-dashoffset 500ms ${ease} 550ms` }}
      />
    </svg>
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
      <div className="wrap grid min-h-[50vh] place-items-center py-24" aria-busy="true">
        <div className="flex flex-col items-center gap-5 text-center">
          <span className="h-1.5 w-40 animate-shimmer rounded-full [animation-duration:1.6s] bg-[linear-gradient(90deg,#d2d2d7_0%,#1f6a99_50%,#d2d2d7_100%)] bg-[length:200%_100%]" aria-hidden="true" />
          <p className="text-ink/70">
            Chargement de la commande <span className="t-mono text-ink">{numero}</span>…
          </p>
        </div>
      </div>
    );
  }
  if (order === null) {
    return (
      <div className="wrap flex min-h-[50vh] flex-col items-center justify-center py-24 text-center">
        <span className="grid size-20 place-items-center rounded-full bg-salt text-ink/70">
          <Icon name="search" size={36} />
        </span>
        <h1 className="t-h1 mt-10">Commande introuvable.</h1>
        <p className="t-lead mt-6 max-w-[48ch] text-ink/70">
          Le numéro <span className="t-mono text-ink">{numero}</span> n&apos;est pas accessible depuis ce navigateur. Connectez-vous à votre espace pro ou appelez le {company.phone}.
        </p>
        <ButtonLink href="/espace-pro" size="lg" className="mt-10">
          Espace pro
        </ButtonLink>
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
    <div className="pb-24">
      <section className="wrap flex flex-col items-center pb-16 pt-12 text-center lg:pb-20 lg:pt-20" aria-labelledby="merci">
        <CheckMark tone={pending ? "warn" : "ok"} />
        <p className={cx("mt-8 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold", pending ? "bg-warn/15 text-[#7a4f0c]" : "bg-ok/10 text-ok")}>
          <Icon name="check" size={16} /> {pending ? "Enregistrée — en attente de validation interne" : "Commande envoyée à MCI"}
        </p>
        <h1 id="merci" className="t-h1 mt-6 max-w-[18ch]">
          Merci. Votre commande est enregistrée.
        </h1>
        <p className="mt-8 text-sm font-medium text-ink/70">Numéro de commande</p>
        <p className="t-h1 t-mono mt-1 max-w-full break-all text-[clamp(1.75rem,1rem+3.4vw,4rem)] text-mci">{order.number}</p>
        <p className="mt-6 max-w-[60ch] text-ink/70">
          Passée le {formatDateTime(order.createdAt)} par {order.customer.contactName} ({order.customer.company}). Statut : {statusLabels[order.status]}.
        </p>
      </section>

      <div className="wrap">
        <div className="grid-12 gap-y-6">
          <div className="col-span-12 space-y-6 lg:col-span-7">
            <div data-reveal className="rounded-box bg-salt p-6 sm:p-8">
              <h2 className="t-label">La suite</h2>
              <ol className="mt-6 space-y-4">
                {steps.map((t, i) => (
                  <li key={t} className="flex items-start gap-4">
                    <span aria-hidden="true" className="grid size-7 shrink-0 place-items-center rounded-full bg-white text-sm font-semibold text-mci shadow-sheet">
                      {i + 1}
                    </span>
                    <span className="pt-0.5 text-ink/80">
                      <span className="sr-only">{i + 1}. </span>
                      {t}
                    </span>
                  </li>
                ))}
              </ol>
              <p className="mt-6 flex items-start gap-2 border-t border-black/5 pt-5 text-sm text-ink/70">
                <Icon name="mail" size={18} className="mt-px shrink-0 text-mci" />
                <span>
                  Un récapitulatif part à {order.customer.email}
                  {IS_DEMO ? " (mode démo : l'email est journalisé, pas envoyé)" : ""}.
                </span>
              </p>
            </div>
            <div data-reveal className="rounded-box bg-white p-6 ring-1 ring-black/5 sm:p-8">
              <h2 className="t-label mb-6">Avancement</h2>
              <OrderTimeline order={order} />
            </div>
          </div>

          <aside className="col-span-12 lg:col-span-5 lg:col-start-8">
            <div className="space-y-6 lg:sticky lg:top-20">
              <div className="rounded-box bg-white p-6 shadow-sheet ring-1 ring-black/5 sm:p-8">
                <div className="flex flex-col gap-3">
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
                </div>
                {user ? (
                  <Link href="/espace-pro/commandes" className="link-u mt-6 inline-block">
                    Suivre dans mon espace pro ›
                  </Link>
                ) : null}
              </div>
              {user ? null : (
                <div className="rounded-box bg-salt p-6 sm:p-8">
                  <p className="t-label">Gagnez du temps la prochaine fois</p>
                  <p className="mt-3 text-sm text-ink/70">Créez votre compte pro : vos informations sont déjà remplies. Vous pourrez suivre cette commande et recommander en un clic.</p>
                  <ButtonLink href="/espace-pro?creer=1" variant="primary" className="mt-6">
                    Créer mon compte pro
                  </ButtonLink>
                </div>
              )}
            </div>
          </aside>
        </div>

        <section data-reveal className="mt-6 rounded-box bg-white p-6 ring-1 ring-black/5 sm:p-8" aria-labelledby="lignes">
          <h2 id="lignes" className="t-label mb-4">
            Détail{" "}
            <span className="font-normal text-ink/70">
              — {order.lines.length} ligne{order.lines.length > 1 ? "s" : ""}
            </span>
          </h2>
          <OrderLinesTable order={order} />
        </section>
      </div>
    </div>
  );
}
