import type { PropertySlug } from "@/lib/types";
import { propertyLabels, propertyOrder } from "@/data/properties";
import { Icon } from "@/components/ui/Icon";
import { cx } from "@/lib/cx";

/** Propriétés en pastilles arrondies : symbole + libellé (complet ou court). */
export function PropertyBadges({ properties, full = false, className }: { properties: PropertySlug[]; full?: boolean; className?: string }) {
  const list = propertyOrder.filter((p) => properties.includes(p));
  if (!list.length) return null;
  return (
    <ul className={cx("flex flex-wrap", full ? "gap-2" : "gap-1", className)} aria-label="Propriétés">
      {list.map((p) => (
        <li
          key={p}
          title={propertyLabels[p].hint}
          className={cx(
            "inline-flex items-center rounded-[4px]",
            full ? "gap-1.5 px-3 py-1.5 text-sm font-medium" : "gap-1 px-1.5 py-0.5 text-xs font-semibold",
            p === "biocide" ? "bg-warn/12 text-[#7a4f0c]" : full ? "bg-steel text-ink" : "bg-steel text-ink/80",
          )}
        >
          <Icon name={p} size={full ? 16 : 13} className="shrink-0" />
          <span>{full ? propertyLabels[p].label : propertyLabels[p].short}</span>
          {full ? null : <span className="sr-only">{propertyLabels[p].label}</span>}
        </li>
      ))}
    </ul>
  );
}
