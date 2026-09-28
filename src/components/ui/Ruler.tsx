import { cx } from "@/lib/cx";

/** Réglette technique mono : `MCI SÈTE · DEPUIS 2015 · 90 RÉFÉRENCES` */
export function Ruler({ items, className, inverted = false }: { items: string[]; className?: string; inverted?: boolean }) {
  return (
    <p className={cx("t-mono flex flex-wrap items-center gap-x-3 gap-y-1 text-xs", inverted ? "text-white/80" : "text-ink/70", className)}>
      {items.map((it, i) => (
        <span key={it} className="flex items-center gap-3">
          {i > 0 ? <span aria-hidden="true">·</span> : null}
          <span>{it}</span>
        </span>
      ))}
    </p>
  );
}
