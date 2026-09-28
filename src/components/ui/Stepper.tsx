"use client";
import { Icon } from "./Icon";
import { cx } from "@/lib/cx";

export function Stepper({
  value,
  onChange,
  min = 1,
  max = 999,
  label,
  size = "md",
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  label: string;
  size?: "sm" | "md";
}) {
  const h = size === "sm" ? "h-8" : "h-12";
  const w = size === "sm" ? "w-8" : "w-12";
  return (
    <div className={cx("inline-flex items-stretch border border-rule rounded-tech bg-white", h)} role="group" aria-label={label}>
      <button type="button" className={cx(w, "grid place-items-center hover:bg-salt disabled:opacity-40")} onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label="Diminuer la quantité">
        <Icon name="minus" size={16} />
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={value}
        aria-label={label}
        onChange={(e) => {
          const n = Math.round(Number(e.target.value));
          if (Number.isFinite(n)) onChange(Math.min(max, Math.max(min, n)));
        }}
        className="t-mono w-12 text-center border-x border-rule bg-white [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none focus:outline-mci"
      />
      <button type="button" className={cx(w, "grid place-items-center hover:bg-salt disabled:opacity-40")} onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label="Augmenter la quantité">
        <Icon name="plus" size={16} />
      </button>
    </div>
  );
}
