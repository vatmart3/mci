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
        "m-auto p-0 bg-white text-ink rounded-box shadow-sheet backdrop:bg-ink/50 max-h-[92vh] w-[calc(100vw-32px)]",
        wide ? "max-w-[1100px]" : "max-w-[560px]",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-4 border-b border-rule px-6 py-4">
        <h2 className="t-label">{title}</h2>
        <button type="button" onClick={onClose} className="grid size-8 place-items-center hover:bg-salt rounded-tech" aria-label="Fermer">
          <Icon name="close" />
        </button>
      </div>
      <div className="p-6">{children}</div>
    </dialog>
  );
}
