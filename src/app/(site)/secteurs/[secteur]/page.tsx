import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { sectors, getSector, sectorGroups } from "@/data/sectors";
import { getSectorProducts } from "@/lib/catalog";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ProductList } from "@/components/catalog/ProductList";
import { AddSelection } from "@/components/cart/AddSelection";
import { BiocideNotice } from "@/components/catalog/BiocideNotice";
import { Icon, type IconName } from "@/components/ui/Icon";
import { JsonLd, pageMeta } from "@/lib/seo";
import { SITE_URL } from "@/lib/env";
import { company } from "@/data/company";

export const dynamicParams = false;
export function generateStaticParams() {
  return sectors.map((s) => ({ secteur: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ secteur: string }> }): Promise<Metadata> {
  const s = getSector((await params).secteur);
  if (!s) return {};
  return pageMeta({
    title: `${s.name} : produits d'entretien et de maintenance`,
    description: `${s.problem.slice(0, 120).replace(/\s+\S*$/, "")}… La sélection MCI Sète pour ${s.name.toLowerCase()}, fiches techniques et commande pro.`,
    path: `/secteurs/${s.slug}`,
  });
}

export default async function SectorPage({ params }: { params: Promise<{ secteur: string }> }) {
  const sector = getSector((await params).secteur);
  if (!sector) notFound();
  const list = await getSectorProducts(sector.slug);
  const hasBiocide = list.some((p) => p.properties.includes("biocide"));
  const others = sectors.filter((s) => s.slug !== sector.slug);

  return (
    <>
      <div className="wrap py-4 lg:py-5">
        <Breadcrumb items={[{ name: "Accueil", path: "/" }, { name: "Secteurs", path: "/#secteurs" }, { name: sector.name, path: `/secteurs/${sector.slug}` }]} />
      </div>

      <div className="bg-mci text-white">
        <header className="wrap grid grid-cols-1 gap-8 py-10 lg:grid-cols-12 lg:gap-x-6 lg:py-14 [&>*]:min-w-0">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:gap-5 lg:col-span-7">
            <span className="grid size-14 shrink-0 place-items-center rounded-[8px] bg-white text-mci sm:size-16">
              <Icon name={`sec-${sector.slug}` as IconName} size={32} />
            </span>
            <div className="min-w-0">
              <h1 className="t-h1 break-words">{sector.name}</h1>
              <p className="t-lead mt-3 max-w-[56ch] text-white/85">{sector.buyer}</p>
              <p className="mt-3 text-sm text-white/80">
                {sectorGroups[sector.group]} · {list.length} référence{list.length > 1 ? "s" : ""} sélectionnée{list.length > 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <section aria-labelledby="terrain" className="border-t border-white/25 pt-6 lg:col-span-5 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <h2 id="terrain" className="t-label">
              Le problème, sur le terrain
            </h2>
            <p className="mt-3 text-white/90">{sector.problem}</p>
          </section>
        </header>
      </div>

      <section className="wrap pt-10 lg:pt-14" aria-labelledby="selection">
        <div className="flex flex-col gap-5 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <h2 id="selection" className="t-h2 max-w-[28ch]">
              Ce que MCI propose pour {sector.name.toLowerCase()}
            </h2>
            <p className="mt-2 text-ink/70">
              {list.length} référence{list.length > 1 ? "s" : ""}, à ajouter une par une ou en une fois au bon de commande.
            </p>
          </div>
          <AddSelection lines={list.map((p) => ({ productId: p.id, packagingId: p.packagings[0]!.id, quantity: 1 }))} image={list[0] ? `/packshots/${list[0].slug}.webp` : undefined} className="self-start lg:self-auto" />
        </div>
        {hasBiocide ? <BiocideNotice className="mb-6 max-w-[760px]" /> : null}
        <ProductList products={list} />
        <p className="mt-3 text-sm text-ink/70">Sélection indicative : ajustez conditionnements et quantités dans le bon de commande. MCI confirme disponibilité et délai.</p>
      </section>

      <section className="wrap py-16 lg:py-20" aria-labelledby="seo-secteur">
        <div className="max-w-[70ch]">
          <h2 id="seo-secteur" className="t-h2">
            {sector.name} : comment on travaille
          </h2>
          <div className="prose-mci mt-5 text-ink/80">
            {sector.seo.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
            <p>
              Un doute sur un produit ? <Link href={`/contact?objet=conseil&secteur=${encodeURIComponent(sector.name)}`}>Demandez conseil</Link> ou appelez le{" "}
              <a href={`tel:${company.phoneE164}`}>{company.phone}</a>.
            </p>
          </div>
        </div>
      </section>

      <nav className="border-t border-rule bg-salt" aria-labelledby="autres-secteurs">
        <div className="wrap py-12 lg:py-16">
          <h2 id="autres-secteurs" className="t-h2">
            Autres secteurs
          </h2>
          <ul className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {others.map((s) => (
              <li key={s.slug} className="min-w-0">
                <Link
                  href={`/secteurs/${s.slug}`}
                  className="group flex min-w-0 items-center gap-3 rounded-[6px] border border-rule bg-white px-3 py-3 font-semibold transition-colors duration-150 ease-out hover:border-mci hover:text-mci"
                >
                  <Icon name={`sec-${s.slug}` as IconName} size={24} className="shrink-0 text-mci" />
                  <span className="min-w-0 flex-1 truncate">{s.name}</span>
                  <Icon name="chevronRight" size={16} className="shrink-0 text-ink/40 transition-transform duration-150 ease-out group-hover:translate-x-0.5 group-hover:text-mci" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: `Sélection ${sector.name}`,
          itemListElement: list.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: `${SITE_URL}/produit/${p.slug}`, name: `${p.code} — ${p.short}` })),
        }}
      />
    </>
  );
}
