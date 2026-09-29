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
    <div className="wrap pb-20 pt-6 lg:pb-24 lg:pt-10">
      <Breadcrumb items={[{ name: "Accueil", path: "/" }, { name: "Commande rapide", path: "/commande-rapide" }]} />
      <header className="mt-6 mb-8 max-w-[820px] lg:mt-8 lg:mb-10">
        <h1 className="t-h1">Commande rapide, par référence.</h1>
        <p className="t-lead mt-3 max-w-[56ch] text-ink/70">Tapez un code, choisissez le conditionnement, la quantité, Entrée : ligne suivante. Ou collez votre liste habituelle.</p>
      </header>
      <QuickOrder />
    </div>
  );
}
