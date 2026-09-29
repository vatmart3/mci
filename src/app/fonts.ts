import { Barlow, Barlow_Semi_Condensed, Geist_Mono } from "next/font/google";

/** Barlow : grotesque de signalétique routière, lisible et industrielle (SIL OFL). Texte courant. */
export const barlow = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-barlow",
  display: "swap",
});

/** Barlow Semi Condensed : titres, codes produit, chiffres. */
export const barlowSC = Barlow_Semi_Condensed({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-barlow-sc",
  display: "swap",
});

/** Données uniquement : numéros de commande, SIRET. */
export const geistMono = Geist_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-geist-mono",
  display: "swap",
  preload: false,
});
