"use client";
import { Icon } from "./Icon";
import { cx } from "@/lib/cx";

/** Sélecteur de quantité rectangulaire : boutons carrés séparés par des filets, valeur centrale éditable. */
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
    sm ? "w-8" : "w-10",
    "grid h-full shrink-0 place-items-center bg-salt text-ink transition-colors duration-150 ease-out hover:bg-steel disabled:text-ink/35 disabled:hover:bg-salt",
  );
  return (
    <div
      className={cx(
        "inline-flex shrink-0 items-stretch divide-x divide-rule overflow-hidden rounded-[6px] border border-rule bg-white transition-[border-color,box-shadow] duration-150 ease-out hover:border-ink/30 focus-within:border-mci focus-within:shadow-[0_0_0_3px_rgb(31_106_153/0.2)]",
        sm ? "h-9" : "h-11",
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
          "bg-white text-center font-semibold tabular-nums focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
          sm ? "w-10 text-sm" : "w-12 text-base",
        )}
      />
      <button type="button" className={btn} onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label="Augmenter la quantité">
        <Icon name="plus" size={sm ? 14 : 16} />
      </button>
    </div>
  );
}
