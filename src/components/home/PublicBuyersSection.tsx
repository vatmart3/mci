import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

const points = [
  { t: "N° d'engagement exigé", d: "Le bon de commande le demande pour toute collectivité : pas de commande orpheline." },
  { t: "Facturation Chorus Pro", d: "Code service saisi une fois, repris sur chaque commande et facture." },
  { t: "Validation interne", d: "Un agent prépare, un valideur confirme et transmet à MCI. Réglable par structure." },
  { t: "Paiement administratif", d: "Facture à échéance ou mandat administratif. Aucun paiement en ligne." },
];

/** Extrait d'un bon de commande (exemple d'interface, données fictives signalées comme telles). */
function OrderFormExcerpt() {
  return (
    <div className="rounded-[12px] bg-white p-5 text-ink shadow-float sm:p-6" aria-label="Exemple : extrait du bon de commande pour une collectivité" role="img">
      <div className="flex items-center justify-between border-b border-rule pb-3">
        <p className="font-display text-lg font-bold">Facturation et références d&apos;achat</p>
        <span className="rounded-[4px] bg-steel px-2 py-0.5 text-xs font-semibold text-ink/70">Exemple</span>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {[
          ["Type de structure", "Collectivité"],
          ["SIRET", "213 400 000 00000"],
          ["N° d'engagement", "ENG-2026-0412"],
          ["Code service Chorus Pro", "SERV-TECH"],
        ].map(([k, v]) => (
          <div key={k}>
            <p className="text-xs font-semibold text-ink/70">{k}</p>
            <p className="mt-1 flex h-10 items-center rounded-[6px] border border-rule bg-salt px-3 text-sm font-medium">{v}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-3 rounded-[8px] bg-sky/50 p-3 text-sm">
        <Icon name="user" size={20} className="shrink-0 text-mci" />
        <span>
          Préparée par <strong>l&apos;agent</strong>, en attente du <strong>valideur</strong> de la structure.
        </span>
      </div>
    </div>
  );
}

export function PublicBuyersSection() {
  return (
    <section aria-labelledby="collectivites-title" className="bg-mci py-16 text-white lg:py-24">
      <div className="wrap grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8 [&>*]:min-w-0">
        <div className="lg:col-span-6">
          <h2 id="collectivites-title" className="t-h1 max-w-[20ch]">
            Collectivités : commandez dans les règles
          </h2>
          <p className="t-lead mt-3 max-w-[52ch] text-white/85">Mairies, écoles, établissements publics : le bon de commande reprend vos contraintes d&apos;achat.</p>
          <dl className="mt-8 grid gap-x-8 gap-y-6 sm:grid-cols-2">
            {points.map((p) => (
              <div key={p.t} className="border-t border-white/25 pt-4">
                <dt className="flex items-center gap-2 font-display text-lg font-bold">
                  <Icon name="check" size={20} className="shrink-0 text-action" />
                  {p.t}
                </dt>
                <dd className="mt-1 text-white/80">{p.d}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/espace-pro?creer=1" className="inline-flex h-12 items-center rounded-[6px] bg-white px-6 font-semibold text-mci transition-colors duration-150 hover:bg-sky">
              Créer un compte pro
            </Link>
            <Link href="/secteurs/mairies" className="inline-flex h-12 items-center gap-2 rounded-[6px] border border-white/50 px-6 font-semibold transition-colors duration-150 hover:border-white">
              La sélection mairies <Icon name="arrow" size={18} />
            </Link>
          </div>
        </div>
        <div className="lg:col-span-5 lg:col-start-8">
          <OrderFormExcerpt />
        </div>
      </div>
    </section>
  );
}
