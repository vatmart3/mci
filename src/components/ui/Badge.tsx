import type { OrderStatus } from "@/lib/types";
import { statusShort, statusTone } from "@/lib/orders";
import { cx } from "@/lib/cx";

const tones = {
  ok: "bg-ok/12 text-ok",
  warn: "bg-warn/15 text-[#7a4f0c]",
  danger: "bg-danger/10 text-danger",
  mci: "bg-mci/10 text-mci",
  ink: "bg-salt text-ink",
} as const;

export function Badge({ tone = "ink", children, className }: { tone?: keyof typeof tones; children: React.ReactNode; className?: string }) {
  return <span className={cx("inline-flex items-center rounded-full px-3 py-px text-[11px] font-semibold leading-5 tracking-[0.02em] whitespace-nowrap", tones[tone], className)}>{children}</span>;
}

export function StatusBadge({ status }: { status: OrderStatus }) {
  return <Badge tone={statusTone(status)}>{statusShort[status]}</Badge>;
}

export function DemoBadge() {
  return <Badge tone="warn">DÉMO</Badge>;
}

export function ToConfirm({ children = "[À CONFIRMER]" }: { children?: React.ReactNode }) {
  return <span className="t-mono rounded-full bg-warn/15 px-2 text-[11px] text-[#7a4f0c]">{children}</span>;
}
