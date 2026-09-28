import type { Metadata } from "next";
import { ProShell } from "@/components/pro/ProShell";

export const metadata: Metadata = {
  title: "Espace pro",
  description: "Espace pro MCI Sète : commandes, recommander en un clic, listes favorites, documents, adresses de livraison.",
  robots: { index: false, follow: true },
};

export default function ProLayout({ children }: { children: React.ReactNode }) {
  return <ProShell>{children}</ProShell>;
}
