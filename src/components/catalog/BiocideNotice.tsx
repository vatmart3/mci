import { BIOCIDE_NOTICE } from "@/data/families";
import { Icon } from "@/components/ui/Icon";
import { cx } from "@/lib/cx";

/** Mention réglementaire obligatoire pour les produits biocides. */
export function BiocideNotice({ className }: { className?: string }) {
  return (
    <p role="note" className={cx("flex items-start gap-3 rounded-[8px] border border-warn/30 bg-warn/10 px-4 py-3 text-sm leading-relaxed text-ink", className)}>
      <Icon name="warning" size={20} className="mt-px shrink-0 text-warn" />
      <span>{BIOCIDE_NOTICE}</span>
    </p>
  );
}
