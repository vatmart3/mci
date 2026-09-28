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
    <div className="wrap pb-24 pt-8 lg:pt-12">
      <Breadcrumb items={[{ name: "Accueil", path: "/" }, { name: "Commande rapide", path: "/commande-rapide" }]} />
      <header className="mt-10 max-w-[820px] pb-12 lg:mt-14 lg:pb-16">
        <p className="t-eyebrow">Commande rapide</p>
        <h1 className="t-h1 mt-3">Commande rapide, par référence.</h1>
        <p className="t-lead mt-6 max-w-[52ch] text-ink/70">Tapez un code, choisissez le conditionnement, la quantité, Entrée : ligne suivante. Ou collez votre liste habituelle.</p>
      </header>
      <QuickOrder />
    </div>
  );
}
