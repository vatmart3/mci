import type { PropertySlug } from "@/lib/types";
import { propertyLabels, propertyOrder } from "@/data/properties";
import { Icon } from "@/components/ui/Icon";
import { cx } from "@/lib/cx";

/** Pictos propriétés façon étiquette : symbole + code court. */
export function PropertyBadges({ properties, full = false, className }: { properties: PropertySlug[]; full?: boolean; className?: string }) {
  const list = propertyOrder.filter((p) => properties.includes(p));
  if (!list.length) return null;
  return (
    <ul className={cx("flex flex-wrap gap-1", className)} aria-label="Propriétés">
      {list.map((p) => (
        <li
          key={p}
          title={propertyLabels[p].hint}
          className={cx(
            "inline-flex items-center gap-1 rounded-tech border px-1 py-px text-ink",
            p === "biocide" ? "border-warn/60 bg-warn/10" : "border-rule bg-white",
          )}
        >
          <Icon name={p} size={14} />
          <span className={full ? "text-xs" : "t-mono text-[11px]"}>{full ? propertyLabels[p].label : propertyLabels[p].short}</span>
          {full ? null : <span className="sr-only">{propertyLabels[p].label}</span>}
        </li>
      ))}
    </ul>
  );
}
