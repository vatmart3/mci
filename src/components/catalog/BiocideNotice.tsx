import { BIOCIDE_NOTICE } from "@/data/families";
import { Icon } from "@/components/ui/Icon";
import { cx } from "@/lib/cx";

/** Mention réglementaire obligatoire pour les produits biocides. */
export function BiocideNotice({ className }: { className?: string }) {
  return (
    <p role="note" className={cx("flex items-start gap-3 rounded-box bg-warn/10 px-4 py-3.5 text-sm leading-relaxed text-ink", className)}>
      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-warn/15 text-warn">
        <Icon name="warning" size={16} />
      </span>
      <span className="pt-0.5">{BIOCIDE_NOTICE}</span>
    </p>
  );
}
