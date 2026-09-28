import { Confirmation } from "@/components/order/Confirmation";

export const metadata = { title: "Commande confirmée", robots: { index: false, follow: false } };

export default async function ConfirmationPage({ params }: { params: Promise<{ numero: string }> }) {
  const { numero } = await params;
  return <Confirmation numero={decodeURIComponent(numero)} />;
}
