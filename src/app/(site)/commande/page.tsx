import { CheckoutForm } from "@/components/order/CheckoutForm";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Bon de commande",
  description: "Validez votre bon de commande MCI Sète : références, conditionnements, livraison, n° d'engagement, Chorus Pro.",
  path: "/commande",
  noindex: true,
});

export default function CommandePage() {
  return <CheckoutForm />;
}
