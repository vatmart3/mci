import type { OrderStatus } from "@/lib/types";
import { statusShort, statusTone } from "@/lib/orders";
import { cx } from "@/lib/cx";

const tones = {
  ok: "border-ok/50 bg-ok/10 text-ok",
  warn: "border-warn/60 bg-warn/10 text-[#8a5d0f]",
  danger: "border-danger/50 bg-danger/10 text-danger",
  mci: "border-mci/40 bg-mci/10 text-mci",
  ink: "border-rule bg-white text-ink",
} as const;

export function Badge({ tone = "ink", children, className }: { tone?: keyof typeof tones; children: React.ReactNode; className?: string }) {
  return <span className={cx("t-mono inline-flex items-center rounded-tech border px-2 py-px text-[11px] leading-5 whitespace-nowrap", tones[tone], className)}>{children}</span>;
}

export function StatusBadge({ status }: { status: OrderStatus }) {
  return <Badge tone={statusTone(status)}>{statusShort[status]}</Badge>;
}

export function DemoBadge() {
  return <Badge tone="warn">DÉMO</Badge>;
}

export function ToConfirm({ children = "[À CONFIRMER]" }: { children?: React.ReactNode }) {
  return <span className="t-mono rounded-tech bg-warn/15 px-1 text-[11px] text-[#8a5d0f]">{children}</span>;
}
