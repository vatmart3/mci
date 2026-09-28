"use client";
import { Icon } from "./Icon";
import { cx } from "@/lib/cx";

/** Sélecteur de quantité en pilule : boutons ronds, valeur centrale éditable. */
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
  const sm = size === "sm";
  const btn = cx(
    sm ? "size-7" : "size-10",
    "grid shrink-0 place-items-center rounded-full text-ink transition-[background-color,transform] duration-200 ease-out hover:bg-salt active:scale-90 disabled:opacity-30 disabled:hover:bg-transparent disabled:active:scale-100",
  );
  return (
    <div
      className={cx(
        "inline-flex items-center rounded-full bg-white ring-1 ring-black/10 transition-shadow duration-200 ease-out focus-within:ring-2 focus-within:ring-mci/60",
        sm ? "h-8 p-0.5" : "h-12 p-1",
      )}
      role="group"
      aria-label={label}
    >
      <button type="button" className={btn} onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label="Diminuer la quantité">
        <Icon name="minus" size={sm ? 14 : 16} />
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
        className={cx(
          "bg-transparent text-center font-semibold tabular-nums focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
          sm ? "w-9 text-sm" : "w-12 text-base",
        )}
      />
      <button type="button" className={btn} onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label="Augmenter la quantité">
        <Icon name="plus" size={sm ? 14 : 16} />
      </button>
    </div>
  );
}
