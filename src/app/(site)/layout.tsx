import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Providers } from "@/components/layout/Providers";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <Header />
      <main id="contenu" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <Footer />
    </Providers>
  );
}
