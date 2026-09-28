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
        "m-auto max-h-[92dvh] w-[calc(100vw-24px)] overflow-y-auto overscroll-contain rounded-tile bg-white p-0 text-ink shadow-float ring-1 ring-black/5",
        "backdrop:bg-black/30 backdrop:backdrop-blur-sm open:animate-rise open:[animation-duration:500ms]",
        wide ? "max-w-[1100px]" : "max-w-[560px]",
        className,
      )}
    >
      <div className="sticky top-0 z-10 flex items-center justify-between gap-4 bg-white/85 px-6 pb-3 pt-5 backdrop-blur-xl sm:px-8 sm:pt-6">
        <h2 className="t-label min-w-0">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          className="grid size-9 shrink-0 place-items-center rounded-full bg-salt text-ink/70 transition-colors duration-200 hover:bg-rule hover:text-ink"
          aria-label="Fermer"
        >
          <Icon name="close" size={18} />
        </button>
      </div>
      <div className="px-6 pb-6 pt-3 sm:px-8 sm:pb-8">{children}</div>
    </dialog>
  );
}
