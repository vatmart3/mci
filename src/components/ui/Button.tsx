import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cx } from "@/lib/cx";

/**
 * action  : orange MCI — UNIQUEMENT les gestes d'achat (commander, ajouter, valider)
 * primary : bleu MCI — actions structurantes non commerciales (se connecter, enregistrer)
 * outline : filet acier — actions secondaires
 * inverse : blanc sur bandeau bleu
 * ghost   : lien bleu — navigation
 */
export type ButtonVariant = "action" | "primary" | "outline" | "ghost" | "danger" | "inverse";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-body font-semibold rounded-[6px] select-none " +
  "transition-[background-color,border-color,color,box-shadow] duration-150 ease-out " +
  "disabled:opacity-50 whitespace-nowrap";

const variants: Record<ButtonVariant, string> = {
  action: "bg-action text-ink border border-action hover:bg-action-hover hover:border-action-hover shadow-[0_1px_0_rgb(22_35_45/0.12)]",
  primary: "bg-mci text-white border border-mci hover:bg-deep hover:border-deep",
  outline: "bg-white text-ink border border-rule hover:border-ink",
  inverse: "bg-white text-mci border border-white hover:bg-sky hover:border-sky",
  ghost: "text-mci hover:text-deep hover:underline underline-offset-4 px-0!",
  danger: "bg-white text-danger border border-danger/50 hover:bg-danger hover:text-white",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-base",
  lg: "h-13 px-6 text-md",
};

export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md", extra?: string) {
  return cx(base, variants[variant], sizes[size], extra);
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ...rest
}: ComponentProps<"button"> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return <button type={type} className={buttonClass(variant, size, className)} {...rest} />;
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: ComponentProps<typeof Link> & { variant?: ButtonVariant; size?: ButtonSize; children: ReactNode }) {
  return (
    <Link className={buttonClass(variant, size, className)} {...rest}>
      {children}
    </Link>
  );
}
