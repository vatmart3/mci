import type { Metadata, Viewport } from "next";
import "./globals.css";
import { barlow, barlowSC, geistMono } from "./fonts";
import { SITE_URL } from "@/lib/env";
import { JsonLd, organizationJsonLd } from "@/lib/seo";
import { bootScript } from "@/lib/cookie-boot";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "MCI Sète — Nettoyants techniques et produits d'entretien professionnels",
    template: "%s — MCI Sète",
  },
  description:
    "Nettoyants techniques, désinfectants et traitements de maintenance pour collectivités, industries et loisirs. Catalogue, fiches techniques et commande pro en ligne, depuis Sète.",
  applicationName: "MCI Sète",
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning className={`${barlow.variable} ${barlowSC.variable} ${geistMono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body>
        {children}
        <JsonLd data={organizationJsonLd()} />
      </body>
    </html>
  );
}
