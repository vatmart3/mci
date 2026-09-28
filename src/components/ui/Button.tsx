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
  "inline-flex items-center justify-center gap-2 font-body font-medium rounded-full select-none tracking-[-0.01em] " +
  "transition-[background-color,border-color,color,transform,box-shadow] duration-300 ease-out active:scale-[0.97] " +
  "disabled:opacity-50 disabled:active:scale-100 whitespace-nowrap";

const variants: Record<ButtonVariant, string> = {
  action: "bg-action text-ink border border-action hover:bg-[#ffa55c] hover:shadow-[0_8px_24px_-8px_rgb(248_151_70/0.7)]",
  primary: "bg-mci text-white border border-mci hover:bg-[#2479ae] hover:shadow-[0_8px_24px_-8px_rgb(31_106_153/0.6)]",
  outline: "bg-transparent text-mci border border-mci hover:bg-mci hover:text-white",
  ghost: "text-mci hover:underline underline-offset-4 px-0!",
  danger: "bg-white text-danger border border-danger/60 hover:bg-danger hover:text-white",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 px-4 text-sm",
  md: "h-11 px-6 text-base",
  lg: "h-14 px-8 text-md",
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
