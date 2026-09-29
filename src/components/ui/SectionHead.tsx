import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

/** Titre de section : le titre porte seul la hiérarchie, chapeau facultatif. `index` et `kicker` sont ignorés (compatibilité). */
export function SectionHead({
  title,
  children,
  id,
  className,
  inverted = false,
  center = false,
  action,
}: {
  index?: string;
  kicker?: string;
  title: ReactNode;
  children?: ReactNode;
  id?: string;
  className?: string;
  inverted?: boolean;
  center?: boolean;
  action?: ReactNode;
}) {
  return (
    <div className={cx("flex flex-col gap-4 md:flex-row md:items-end md:justify-between", center && "items-center text-center md:flex-col md:items-center", className)}>
      <div className="min-w-0">
        <h2 id={id} className={cx("t-h1 max-w-[22ch]", inverted ? "text-white" : "text-ink")}>
          {title}
        </h2>
        {children ? <div className={cx("t-lead mt-3 max-w-[60ch]", inverted ? "text-white/80" : "text-ink/70")}>{children}</div> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function Rule({ className }: { className?: string }) {
  return <hr className={cx("border-0 border-t border-rule", className)} />;
}
