"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";
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

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const count = cartCount(lines);
  return (
    <dialog
      ref={ref}
      onClose={close}
      onClick={(e) => e.target === ref.current && close()}
      aria-labelledby="drawer-title"
      className="fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-dvh w-full max-w-[480px] bg-white p-0 text-ink shadow-drawer backdrop:bg-black/30 backdrop:backdrop-blur-sm open:flex open:flex-col sm:inset-y-3 sm:right-3 sm:h-[calc(100dvh-24px)] sm:max-h-[calc(100dvh-24px)] sm:rounded-tile sm:overflow-hidden"
    >
      <div className="flex items-center justify-between border-b border-black/5 px-6 py-4">
        <div>
          <h2 id="drawer-title" className="t-label">
            Bon de commande
          </h2>
          <p className="t-mono text-xs text-ink/70">
            {count} ARTICLE{count > 1 ? "S" : ""} · {lines.length} RÉF.
          </p>
        </div>
        <button type="button" onClick={close} className="grid size-10 place-items-center rounded-full bg-salt hover:bg-rule" aria-label="Fermer le bon de commande">
          <Icon name="close" />
        </button>
      </div>

      {lines.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-8 py-12 text-center">
          <span className="grid size-20 place-items-center rounded-full bg-salt text-ink/70">
            <Icon name="order" size={36} />
          </span>
          <p className="t-h2 mt-8">Le bon est vide.</p>
          <p className="mt-3 max-w-[34ch] text-ink/70">Ajoutez des produits depuis le catalogue, ou saisissez vos références directement si vous les connaissez.</p>
          <div className="mt-8 flex w-full flex-col items-center gap-4">
            <ButtonLink href="/catalogue" variant="action" size="lg" className="w-full max-w-[320px]" onClick={close}>
              Ouvrir le catalogue
            </ButtonLink>
            <Link href="/commande-rapide" className="link-u text-sm" onClick={close}>
              Commande rapide par référence ›
            </Link>
          </div>
        </div>
      ) : (
        <>
          <ul className="flex-1 divide-y divide-black/5 overflow-y-auto overscroll-contain px-6">
            {lines.map((l, i) => (
              <CartLineEditor key={`${l.productId}-${l.packagingId}`} line={l} index={i} dense />
            ))}
          </ul>
          <div className="border-t border-black/5 bg-salt/80 px-6 pb-6 pt-5 backdrop-blur-xl">
            {priceMode === "on_request" ? (
              <p className="mb-4 flex items-start gap-2 text-sm text-ink/70">
                <Icon name="info" size={18} className="mt-px shrink-0 text-mci" />
                Prix et délai confirmés par MCI après envoi. Aucun paiement en ligne.
              </p>
            ) : null}
            <ButtonLink href="/commande" variant="action" size="lg" className="w-full !px-5 !whitespace-normal text-center leading-tight" onClick={close}>
              Valider le bon de commande
              <Icon name="arrow" />
            </ButtonLink>
            <div className="mt-4 flex items-center justify-between gap-4 text-sm">
              <button type="button" className="text-ink/70 transition-colors hover:text-danger" onClick={() => confirm("Vider le bon de commande ?") && clear()}>
                Vider
              </button>
              <a href={`tel:${company.phoneE164}`} className="inline-flex items-center gap-1.5 text-ink/70 transition-colors hover:text-mci">
                <Icon name="phone" size={14} />
                {company.phone}
              </a>
            </div>
          </div>
        </>
      )}
    </dialog>
  );
}
