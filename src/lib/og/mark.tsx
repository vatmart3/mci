import { og } from "@/lib/og/assets";

/** Pictogramme MCI en version monochrome pour fond bleu MCI (soleil ciel, vagues blanches) : pas d'orange hors geste d'achat. */
export function OgMark({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <circle cx="27" cy="19" r="11" fill={og.sky} />
      <path d="M3 31.5c5.2-5.6 10.6-5.6 15.8 0s10.6 5.6 15.8 0c3.9-4.2 7.8-5.2 11.4-3" fill="none" stroke={og.white} strokeWidth="5" strokeLinecap="round" />
      <path d="M9 40c4-3.6 8-3.6 12 0s8 3.6 12 0c2.8-2.5 5.4-3.2 8-2.2" fill="none" stroke={og.white} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
