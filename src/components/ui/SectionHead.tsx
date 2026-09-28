import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

/** Titre de section : sur-titre coloré, grand titre, chapeau. `index` est conservé pour compatibilité. */
export function SectionHead({
  index: _index,
  kicker,
  title,
  children,
  id,
  className,
  inverted = false,
  center = false,
}: {
  index?: string;
  kicker: string;
  title: ReactNode;
  children?: ReactNode;
  id?: string;
  className?: string;
  inverted?: boolean;
  center?: boolean;
}) {
  return (
    <div data-reveal className={cx("flex flex-col gap-4", center && "items-center text-center", className)}>
      <p className="t-eyebrow">{kicker}</p>
      <h2 id={id} className={cx("t-h1 max-w-[18ch]", inverted ? "text-white" : "text-ink")}>
        {title}
      </h2>
      {children ? <div className={cx("t-lead max-w-[46ch]", inverted ? "text-white/70" : "text-ink/70")}>{children}</div> : null}
    </div>
  );
}

export function Rule({ className }: { className?: string }) {
  return <hr className={cx("border-0 border-t border-rule", className)} />;
}
