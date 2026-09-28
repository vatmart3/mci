import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cx } from "@/lib/cx";

/**
 * action  : orange MCI — UNIQUEMENT les gestes d'achat (commander, ajouter, valider)
 * primary : bleu MCI — actions structurantes non commerciales (se connecter, enregistrer)
 * outline : filet encre — actions secondaires
 * ghost   : texte souligné — navigation
 */
export type ButtonVariant = "action" | "primary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-body font-semibold rounded-tech select-none " +
  "transition-[background-color,border-color,color,transform] duration-200 ease-out active:translate-y-px " +
  "disabled:opacity-60 disabled:active:translate-y-0 whitespace-nowrap";

const variants: Record<ButtonVariant, string> = {
  action: "bg-action text-ink border border-action hover:bg-ink hover:border-ink hover:text-action",
  primary: "bg-mci text-white border border-mci hover:bg-deep hover:border-deep",
  outline: "bg-white/0 text-ink border border-ink hover:bg-ink hover:text-white",
  ghost: "text-ink underline underline-offset-4 decoration-1 hover:decoration-2 hover:text-mci px-0!",
  danger: "bg-white text-danger border border-danger hover:bg-danger hover:text-white",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-12 px-4 text-base",
  lg: "h-16 px-6 text-md",
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
