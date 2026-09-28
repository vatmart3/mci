import { cx } from "@/lib/cx";

/** Nappes de couleur floues qui dérivent lentement (CSS pur, aucune image) : fond de tuile vivant. */
export function Blobs({ colors, className }: { colors: string[]; className?: string }) {
  const spots = [
    { l: "-10%", t: "-20%", s: "70%" },
    { l: "45%", t: "30%", s: "65%" },
    { l: "10%", t: "55%", s: "55%" },
    { l: "60%", t: "-25%", s: "50%" },
  ];
  return (
    <div aria-hidden="true" className={cx("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}>
      {colors.map((c, i) => {
        const s = spots[i % spots.length]!;
        return (
          <span
            key={i}
            className="absolute aspect-square animate-drift rounded-full opacity-70 blur-3xl"
            style={{ left: s.l, top: s.t, width: s.s, background: c, animationDelay: `${i * -4.5}s`, animationDuration: `${16 + i * 5}s` }}
          />
        );
      })}
    </div>
  );
}
