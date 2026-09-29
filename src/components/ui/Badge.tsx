import type { OrderStatus } from "@/lib/types";
import { statusShort, statusTone } from "@/lib/orders";
import { cx } from "@/lib/cx";

const tones = {
  ok: "bg-ok/12 text-ok",
  warn: "bg-warn/15 text-[#7a4f0c]",
  danger: "bg-danger/10 text-danger",
  mci: "bg-mci/10 text-mci",
  ink: "bg-steel text-ink",
} as const;

export function Badge({ tone = "ink", children, className }: { tone?: keyof typeof tones; children: React.ReactNode; className?: string }) {
  return <span className={cx("inline-flex items-center rounded-[4px] px-2 py-px text-xs font-semibold leading-5 whitespace-nowrap", tones[tone], className)}>{children}</span>;
}

export function StatusBadge({ status }: { status: OrderStatus }) {
  return <Badge tone={statusTone(status)}>{statusShort[status]}</Badge>;
}

export function DemoBadge() {
  return <Badge tone="warn">DÉMO</Badge>;
}

export function ToConfirm({ children = "[À CONFIRMER]" }: { children?: React.ReactNode }) {
  return <span className="rounded-[4px] bg-warn/15 px-1.5 text-xs font-semibold text-[#6f4608]">{children}</span>;
}
