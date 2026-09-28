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
      className="fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-dvh w-full max-w-[480px] bg-white p-0 text-ink shadow-drawer backdrop:bg-ink/40 open:flex open:flex-col"
    >
      <div className="flex items-center justify-between border-b border-rule px-6 py-4">
        <div>
          <h2 id="drawer-title" className="t-label">
            Bon de commande
          </h2>
          <p className="t-mono text-xs text-ink/70">
            {count} ARTICLE{count > 1 ? "S" : ""} · {lines.length} RÉF.
          </p>
        </div>
        <button type="button" onClick={close} className="grid size-10 place-items-center rounded-tech hover:bg-salt" aria-label="Fermer le bon de commande">
          <Icon name="close" />
        </button>
      </div>

      {lines.length === 0 ? (
        <div className="flex flex-1 flex-col justify-center px-6 py-12">
          <p className="t-h2">Le bon est vide.</p>
          <p className="mt-4 text-ink/80">Ajoutez des produits depuis le catalogue, ou saisissez vos références directement si vous les connaissez.</p>
          <div className="mt-8 flex flex-col gap-3">
            <ButtonLink href="/catalogue" variant="action" onClick={close}>
              Ouvrir le catalogue
            </ButtonLink>
            <Link href="/commande-rapide" className="link-u text-center" onClick={close}>
              Commande rapide par référence
            </Link>
          </div>
        </div>
      ) : (
        <>
          <ul className="flex-1 divide-y divide-rule overflow-y-auto px-6">
            {lines.map((l, i) => (
              <CartLineEditor key={`${l.productId}-${l.packagingId}`} line={l} index={i} dense />
            ))}
          </ul>
          <div className="border-t border-rule bg-salt px-6 py-4">
            {priceMode === "on_request" ? (
              <p className="mb-4 text-sm text-ink/80">Prix et délai confirmés par MCI après envoi. Aucun paiement en ligne.</p>
            ) : null}
            <ButtonLink href="/commande" variant="action" size="lg" className="w-full" onClick={close}>
              Valider le bon de commande
              <Icon name="arrow" />
            </ButtonLink>
            <div className="mt-3 flex items-center justify-between text-sm">
              <button type="button" className="link-u text-ink/70" onClick={() => confirm("Vider le bon de commande ?") && clear()}>
                Vider
              </button>
              <a href={`tel:${company.phoneE164}`} className="t-mono text-ink/80 hover:text-mci">
                {company.phone}
              </a>
            </div>
          </div>
        </>
      )}
    </dialog>
  );
}
