import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

/** Titre de section numéroté façon fiche : « 01 — Secteurs » */
export function SectionHead({
  index,
  kicker,
  title,
  children,
  id,
  className,
  inverted = false,
}: {
  index?: string;
  kicker: string;
  title: ReactNode;
  children?: ReactNode;
  id?: string;
  className?: string;
  inverted?: boolean;
}) {
  return (
    <div className={cx("grid-12 gap-y-4", className)}>
      <p className={cx("t-mono col-span-12 text-sm", inverted ? "text-white/80" : "text-ink/70")}>
        {index ? <span className={inverted ? "text-white" : "text-mci"}>{index}</span> : null}
        {index ? " — " : null}
        {kicker}
      </p>
      <h2 id={id} className={cx("t-h2 col-span-12 lg:col-span-8", inverted ? "text-white" : "text-ink")}>
        {title}
      </h2>
      {children ? <div className={cx("col-span-12 lg:col-span-6 t-lead", inverted ? "text-white/85" : "text-ink/80")}>{children}</div> : null}
    </div>
  );
}

export function Rule({ className }: { className?: string }) {
  return <hr className={cx("border-0 border-t border-rule", className)} />;
}
