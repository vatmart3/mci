"use client";
import { useEffect, useRef, useState } from "react";
import { useCart, cartCount } from "@/lib/store/cart";
import { useUI } from "@/lib/store/ui";
import { useSession } from "@/lib/store/session";
import { Icon } from "@/components/ui/Icon";
import { ButtonLink } from "@/components/ui/Button";
import { CartLineEditor } from "./CartLineEditor";
import { company } from "@/data/company";

/** Tiroir latéral du bon de commande (dialog natif : focus piégé, Échap). */
export function CartDrawer() {
  const open = useUI((s) => s.drawerOpen);
  const close = useUI((s) => s.closeDrawer);
  const lines = useCart((s) => s.lines);
  const clear = useCart((s) => s.clear);
  const priceMode = useSession((s) => s.settings.priceMode);
  const ref = useRef<HTMLDialogElement>(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
    if (!open) setConfirming(false);
  }, [open]);

  const count = cartCount(lines);
  return (
    <dialog
      ref={ref}
      onClose={close}
      onClick={(e) => e.target === ref.current && close()}
      aria-labelledby="drawer-title"
      className="drawer fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-dvh w-full max-w-[480px] bg-white p-0 text-ink shadow-drawer open:flex open:flex-col"
    >
      <div className="flex items-center justify-between gap-4 border-b border-rule px-5 py-3 sm:px-6">
        <div className="min-w-0">
          <h2 id="drawer-title" className="t-label">
            Bon de commande
          </h2>
          <p className="text-sm tabular-nums text-ink/70">
            {count} article{count > 1 ? "s" : ""} · {lines.length} réf.
          </p>
        </div>
        <button type="button" onClick={close} className="-mr-2 grid size-10 shrink-0 place-items-center rounded-[6px] text-ink/70 transition-colors duration-150 hover:bg-salt hover:text-ink" aria-label="Fermer le bon de commande">
          <Icon name="close" />
        </button>
      </div>

      {lines.length === 0 ? (
        <div className="flex flex-1 flex-col justify-center px-5 py-10 sm:px-8">
          <span className="grid size-14 place-items-center rounded-[8px] bg-salt text-mci">
            <Icon name="order" size={28} />
          </span>
          <p className="t-h2 mt-6">Le bon est vide.</p>
          <p className="mt-2 max-w-[36ch] text-ink/70">Ajoutez des produits depuis le catalogue, ou saisissez vos références directement si vous les connaissez.</p>
          <div className="mt-8 flex w-full flex-col gap-3">
            <ButtonLink href="/catalogue" variant="primary" size="lg" className="w-full" onClick={close}>
              Ouvrir le catalogue
            </ButtonLink>
            <ButtonLink href="/commande-rapide" variant="outline" size="lg" className="w-full" onClick={close}>
              Commande rapide par référence
            </ButtonLink>
          </div>
        </div>
      ) : (
        <>
          <ul className="flex-1 divide-y divide-rule overflow-y-auto overscroll-contain px-5 sm:px-6">
            {lines.map((l, i) => (
              <CartLineEditor key={`${l.productId}-${l.packagingId}`} line={l} index={i} dense />
            ))}
          </ul>
          <div className="border-t border-rule bg-salt px-5 pb-5 pt-4 sm:px-6">
            {priceMode === "on_request" ? (
              <p className="mb-4 flex items-start gap-2 text-sm text-ink/80">
                <Icon name="info" size={18} className="mt-px shrink-0 text-mci" />
                Prix et délai confirmés par MCI après envoi. Aucun paiement en ligne.
              </p>
            ) : null}
            <ButtonLink href="/commande" variant="action" size="lg" className="w-full !px-5 !whitespace-normal text-center leading-tight" onClick={close}>
              Valider le bon de commande
              <Icon name="arrow" />
            </ButtonLink>
            {confirming ? (
              <div role="group" aria-label="Confirmer la suppression" className="mt-3 flex flex-wrap items-center gap-2 rounded-[6px] border border-danger/30 bg-white p-2 pl-3 text-sm">
                <span className="mr-auto font-medium">Retirer les {lines.length} références du bon ?</span>
                <button type="button" autoFocus onClick={() => setConfirming(false)} className="inline-flex h-9 items-center rounded-[6px] px-3 font-medium text-ink/80 transition-colors duration-150 hover:bg-salt">
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={() => {
                    clear();
                    setConfirming(false);
                  }}
                  className="inline-flex h-9 items-center rounded-[6px] bg-danger px-3 font-semibold text-white transition-colors duration-150 hover:bg-[#a42c23]"
                >
                  Vider le bon
                </button>
              </div>
            ) : null}
            <div className={confirming ? "hidden" : "mt-3 flex items-center justify-between gap-4 text-sm"}>
              <button type="button" className="inline-flex h-9 items-center gap-1.5 -ml-2 rounded-[6px] px-2 font-medium text-ink/70 transition-colors duration-150 hover:bg-danger/10 hover:text-danger" onClick={() => setConfirming(true)}>
                <Icon name="trash" size={16} />
                Vider
              </button>
              <a href={`tel:${company.phoneE164}`} className="inline-flex h-9 items-center gap-1.5 font-medium text-ink/70 transition-colors duration-150 hover:text-mci">
                <Icon name="phone" size={16} />
                {company.phone}
              </a>
            </div>
          </div>
        </>
      )}
    </dialog>
  );
}
