/**
 * Logo MCI redessiné en SVG : soleil orange posé sur une vague bleue + mot-symbole.
 * Redessin d'après la description du logo existant (JPG basse définition) — voir DESIGN_NOTES §9.
 */
export function LogoMark({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden="true" focusable="false">
      <circle cx="27" cy="19" r="11" fill="#F89746" />
      <path
        d="M3 31.5c5.2-5.6 10.6-5.6 15.8 0s10.6 5.6 15.8 0c3.9-4.2 7.8-5.2 11.4-3"
        fill="none"
        stroke="#206996"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M9 40c4-3.6 8-3.6 12 0s8 3.6 12 0c2.8-2.5 5.4-3.2 8-2.2"
        fill="none"
        stroke="#206996"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Logo({ className, inverted = false }: { className?: string; inverted?: boolean }) {
  const ink = inverted ? "#FFFFFF" : "#206996";
  return (
    <span className={`inline-flex items-center gap-3 ${className ?? ""}`}>
      <LogoMark size={40} />
      <span className="flex flex-col leading-none">
        <span
          className="font-display font-extrabold"
          style={{ color: ink, fontSize: 27, letterSpacing: "-0.04em" }}
        >
          MCI
        </span>{" "}
        <span className="mt-1 text-[10px] font-semibold tracking-[0.34em]" style={{ color: inverted ? "#FFFFFF" : "#0E2533" }}>
          SÈTE
        </span>
      </span>
      <span className="sr-only"> — accueil</span>
    </span>
  );
}
