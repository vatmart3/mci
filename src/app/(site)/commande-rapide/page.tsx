import { QuickOrder } from "@/components/order/QuickOrder";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Commande rapide par référence",
  description: "Saisissez vos références MCI comme dans un tableur, ou collez une liste « code;conditionnement;quantité ». Pour les acheteurs qui commandent toujours les mêmes produits.",
  path: "/commande-rapide",
});

export default function QuickOrderPage() {
  return (
    <div className="wrap pb-16 pt-8 lg:pt-12">
      <Breadcrumb items={[{ name: "Accueil", path: "/" }, { name: "Commande rapide", path: "/commande-rapide" }]} />
      <div className="grid-12 mt-8 gap-y-4 pb-10">
        <h1 className="t-h1 col-span-12 lg:col-span-8">Commande rapide, par référence.</h1>
        <p className="t-lead col-span-12 text-ink/80 lg:col-span-6">Tapez un code, choisissez le conditionnement, la quantité, Entrée : ligne suivante. Ou collez votre liste habituelle.</p>
      </div>
      <QuickOrder />
    </div>
  );
}
