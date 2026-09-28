import { cx } from "@/lib/cx";

const KEEP_UPPER = new Set(["MCI", "FT", "FDS", "HT", "PDF", "TVA"]);
const PROPER: Record<string, string> = { "sète": "Sète" };

/** Les libellés arrivent parfois en capitales (ancien style) : on les remet en casse de phrase. */
function soften(s: string) {
  if (s !== s.toUpperCase()) return s;
  const out = s
    .split(/(\s+)/)
    .map((w) => (KEEP_UPPER.has(w) ? w : (PROPER[w.toLowerCase()] ?? w.toLowerCase())))
    .join("");
  return out.charAt(0).toUpperCase() + out.slice(1);
}

/** Ligne de repères discrète : `MCI Sète · Depuis 2015 · 90 références` */
export function Ruler({ items, className, inverted = false }: { items: string[]; className?: string; inverted?: boolean }) {
  return (
    <p className={cx("flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-medium", inverted ? "text-white/70" : "text-ink/70", className)}>
      {items.map((it, i) => (
        <span key={it} className="flex items-center gap-3">
          {i > 0 ? (
            <span aria-hidden="true" className={inverted ? "text-white/30" : "text-ink/25"}>
              ·
            </span>
          ) : null}
          <span>{soften(it)}</span>
        </span>
      ))}
    </p>
  );
}
