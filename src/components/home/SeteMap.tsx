import { company } from "@/data/company";

/**
 * Carte stylisée au trait : Sète, l'étang de Thau, le lido, la mer.
 * Schéma d'orientation (pas une carte à l'échelle). Le point orange = MCI.
 */
export function SeteMap({ className }: { className?: string }) {
  return (
    <figure className={className}>
      <svg viewBox="0 0 520 360" className="h-auto w-full" role="img" aria-labelledby="map-title map-desc">
        <title id="map-title">Plan de situation de MCI Sète</title>
        <desc id="map-desc">Schéma : MCI est au Parc Aquatechnique, à Sète, entre l&apos;étang de Thau et la mer Méditerranée.</desc>
        {/* quadrillage léger */}
        <g stroke="#D5DDE3" strokeWidth="0.75">
          {[60, 120, 180, 240, 300].map((y) => (
            <path key={`h${y}`} d={`M0 ${y}H520`} />
          ))}
          {[80, 160, 240, 320, 400, 480].map((x) => (
            <path key={`v${x}`} d={`M${x} 0V360`} />
          ))}
        </g>
        {/* trait de côte */}
        <path d="M0 250 C60 262 120 276 170 282 C205 286 232 282 252 270 C268 258 282 246 300 238 C340 222 380 206 430 180 C465 162 495 142 520 124" fill="none" stroke="#16232D" strokeWidth="1.5" />
        {/* étang de Thau */}
        <path
          d="M40 186 C70 150 120 120 180 104 C220 94 262 96 286 112 C300 122 298 142 284 156 C266 174 236 184 214 196 C184 212 150 226 112 228 C76 230 46 214 40 186 Z"
          fill="#1F6A99"
          fillOpacity="0.08"
          stroke="#1F6A99"
          strokeWidth="1.25"
        />
        {/* Mont Saint-Clair */}
        <path d="M232 262 C240 252 250 248 258 252 C264 256 266 262 262 268" fill="none" stroke="#16232D" strokeWidth="1" strokeDasharray="2 3" />
        {/* canaux / port */}
        <path d="M268 250 L292 226 M276 256 L300 234" stroke="#16232D" strokeWidth="1" />
        <g fontFamily="var(--font-barlow)" fontSize="12" fontWeight="600" fill="#16232D">
          <text x="120" y="170" fill="#1F6A99" letterSpacing="1">ÉTANG DE THAU</text>
          <text x="330" y="300" letterSpacing="1" fillOpacity="0.6">MER MÉDITERRANÉE</text>
          <text x="210" y="300">SÈTE</text>
          <text x="340" y="176" fillOpacity="0.7">FRONTIGNAN</text>
          <text x="300" y="104" fillOpacity="0.7">BALARUC</text>
          <text x="96" y="94" fillOpacity="0.7">MÈZE</text>
          <text x="20" y="236" fillOpacity="0.7">MARSEILLAN</text>
          <text x="226" y="248" fontSize="8" fillOpacity="0.6">MT ST-CLAIR</text>
        </g>
        {/* MCI */}
        <circle cx="288" cy="214" r="14" fill="none" stroke="#F89746" strokeWidth="1" />
        <circle cx="288" cy="214" r="6" fill="#F89746" />
        <path d="M296 206 L330 150 H430" fill="none" stroke="#16232D" strokeWidth="0.75" />
        <text x="336" y="144" fontFamily="var(--font-barlow)" fontSize="12" fontWeight="700" fill="#16232D">
          MCI · PARC AQUATECHNIQUE
        </text>
      </svg>
      <figcaption className="mt-2 text-xs text-ink/70">
        Schéma de situation (non à l&apos;échelle) · {company.postalCode} {company.city}
      </figcaption>
    </figure>
  );
}
