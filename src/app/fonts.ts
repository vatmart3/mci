import { Geist, Geist_Mono } from "next/font/google";

/** Geist : grotesque contemporaine, dessin proche des interfaces Apple (SIL OFL). */
export const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

export const geistMono = Geist_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-geist-mono",
  display: "swap",
});
