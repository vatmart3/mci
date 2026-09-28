import type { Metadata, Viewport } from "next";
import "./globals.css";
import { archivo, instrument, plex } from "./fonts";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Providers } from "@/components/layout/Providers";
import { SITE_URL } from "@/lib/env";
import { JsonLd, organizationJsonLd } from "@/lib/seo";

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
  themeColor: "#F3F1EC",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${archivo.variable} ${instrument.variable} ${plex.variable}`}>
      <body>
        <Providers>
          <Header />
          <main id="contenu" tabIndex={-1} className="outline-none">
            {children}
          </main>
          <Footer />
        </Providers>
        <JsonLd data={organizationJsonLd()} />
      </body>
    </html>
  );
}
