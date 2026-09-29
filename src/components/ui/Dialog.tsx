"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { Icon } from "./Icon";
import { cx } from "@/lib/cx";

/** Modale native <dialog> : focus piégé, Échap, retour du focus gérés par le navigateur. */
export function Dialog({
  open,
  onClose,
  title,
  children,
  className,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      aria-label={title}
      className={cx(
        "m-auto max-h-[92dvh] w-[calc(100vw-24px)] overflow-y-auto overscroll-contain rounded-[8px] border border-rule bg-white p-0 text-ink shadow-float",
        "backdrop:bg-night/40 open:animate-drop",
        wide ? "max-w-[1100px]" : "max-w-[560px]",
        className,
      )}
    >
      <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-rule bg-white px-5 py-3 sm:px-6">
        <h2 className="t-label min-w-0">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          className="-mr-2 grid size-10 shrink-0 place-items-center rounded-[6px] text-ink/70 transition-colors duration-150 hover:bg-salt hover:text-ink"
          aria-label="Fermer"
        >
          <Icon name="close" size={18} />
        </button>
      </div>
      <div className="px-5 py-5 sm:px-6 sm:py-6">{children}</div>
    </dialog>
  );
}
