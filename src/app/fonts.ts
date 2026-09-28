import { Archivo, IBM_Plex_Mono, Instrument_Sans } from "next/font/google";
import localFont from "next/font/local";

/** Instance statique Archivo 800 / wdth 118 (37 Ko) : titres d'affichage, préchargée (LCP). */
export const archivoDisplay = localFont({
  src: "./fonts-files/archivo-display-800.woff2",
  weight: "800",
  variable: "--font-archivo-display",
  display: "swap",
  preload: true,
  fallback: ["Archivo", "sans-serif"],
});

export const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
  // la version variable (axe wdth animé) n'est pas critique pour le premier rendu
  preload: false,
});

export const instrument = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-instrument",
  display: "swap",
});

export const plex = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex",
  display: "swap",
});
