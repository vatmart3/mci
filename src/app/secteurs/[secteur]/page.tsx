import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { sectors, getSector, sectorGroups } from "@/data/sectors";
import { getSectorProducts } from "@/lib/catalog";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ProductList } from "@/components/catalog/ProductList";
import { AddSelection } from "@/components/cart/AddSelection";
import { BiocideNotice } from "@/components/catalog/BiocideNotice";
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
    title: `${s.name} : produits d'entretien et de maintenance`,
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
      <div className="wrap pt-8 lg:pt-12">
        <Breadcrumb items={[{ name: "Accueil", path: "/" }, { name: "Secteurs", path: "/#secteurs" }, { name: sector.name, path: `/secteurs/${sector.slug}` }]} />
        <div className="grid-12 mt-8 gap-y-6">
          <p className="t-mono col-span-12 text-sm text-ink/70">
            <span className="text-mci">SECTEUR {String(sector.position).padStart(2, "0")}</span> — {sectorGroups[sector.group].toUpperCase()}
          </p>
          <h1 className="t-display col-span-12 lg:col-span-9">{sector.name}</h1>
          <p className="col-span-12 text-ink/80 lg:col-span-5">{sector.buyer}</p>
        </div>

        {/* Le problème terrain, façon fiche d'intervention */}
        <section aria-labelledby="terrain" className="crop mt-12 grid-12 gap-y-4 border border-rule bg-white p-6 lg:p-12">
          <h2 id="terrain" className="t-mono col-span-12 text-xs text-ink/70 lg:col-span-3">
            LE PROBLÈME, SUR LE TERRAIN
          </h2>
          <p className="t-h2 col-span-12 font-semibold lg:col-span-9" style={{ fontWeight: 600 }}>
            {sector.problem}
          </p>
        </section>
      </div>

      <section className="wrap mt-16" aria-labelledby="selection">
        <div className="flex flex-col gap-6 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="t-mono text-sm text-ink/70">
              <span className="text-mci">{String(list.length).padStart(2, "0")}</span> — LA SÉLECTION
            </p>
            <h2 id="selection" className="t-h2 mt-3">
              Ce que MCI propose pour {sector.name.toLowerCase()}.
            </h2>
          </div>
          <AddSelection lines={list.map((p) => ({ productId: p.id, packagingId: p.packagings[0]!.id, quantity: 1 }))} image={list[0] ? `/packshots/${list[0].slug}.webp` : undefined} />
        </div>
        {hasBiocide ? <BiocideNotice className="mb-6 max-w-[720px]" /> : null}
        <ProductList products={list} />
        <p className="mt-4 text-sm text-ink/70">Sélection indicative : ajustez conditionnements et quantités dans le bon de commande. MCI confirme disponibilité et délai.</p>
      </section>

      <section className="wrap mt-24" aria-labelledby="seo-secteur">
        <div className="grid-12 gap-y-6">
          <h2 id="seo-secteur" className="t-h2 col-span-12 lg:col-span-4">
            {sector.name} : comment on travaille
          </h2>
          <div className="prose-mci col-span-12 max-w-[68ch] text-ink/85 lg:col-span-7 lg:col-start-6">
            {sector.seo.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
            <p>
              Un doute sur un produit ? <Link href={`/contact?objet=conseil&secteur=${encodeURIComponent(sector.name)}`}>Demandez conseil</Link> ou appelez le{" "}
              <a href={`tel:${company.phoneE164}`}>{company.phone}</a>.
            </p>
          </div>
        </div>
      </section>

      <nav className="wrap mt-24" aria-label="Autres secteurs">
        <p className="t-mono mb-4 text-xs text-ink/70">AUTRES SECTEURS</p>
        <ul className="flex flex-wrap gap-x-8 gap-y-3 border-t border-rule pt-6">
          {others.map((s) => (
            <li key={s.slug}>
              <Link href={`/secteurs/${s.slug}`} className="t-label hover:text-mci hover:underline">
                {s.name}
              </Link>
            </li>
          ))}
        </ul>
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
