import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { sectors, getSector, sectorGroups } from "@/data/sectors";
import { getSectorProducts } from "@/lib/catalog";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ProductList } from "@/components/catalog/ProductList";
import { AddSelection } from "@/components/cart/AddSelection";
import { BiocideNotice } from "@/components/catalog/BiocideNotice";
import { Icon } from "@/components/ui/Icon";
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
        <header className="mt-10 grid grid-cols-1 gap-6 lg:mt-14 lg:grid-cols-12 lg:items-end lg:gap-x-6">
          <div data-reveal className="min-w-0 lg:col-span-8">
            <p className="t-eyebrow">
              Secteur {String(sector.position).padStart(2, "0")} <span className="text-ink/70">· {sectorGroups[sector.group]}</span>
            </p>
            <h1 className="t-h1 mt-3">{sector.name}</h1>
          </div>
          <p data-reveal className="t-lead min-w-0 text-ink/70 lg:col-span-4" style={{ "--reveal-delay": "120ms" } as React.CSSProperties}>
            {sector.buyer}
          </p>
        </header>

        {/* Le problème terrain */}
        <section data-reveal aria-labelledby="terrain" className="relative mt-12 overflow-hidden rounded-tile bg-deep p-8 text-white sm:p-12 lg:mt-16 lg:p-16">
          <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-mci/40 blur-3xl" />
          <div className="relative grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-x-6">
            <h2 id="terrain" className="t-label min-w-0 text-sky lg:col-span-3">
              Le problème, sur le terrain
            </h2>
            <p className="t-h2 min-w-0 text-white lg:col-span-9" style={{ fontWeight: 600 }}>
              {sector.problem}
            </p>
          </div>
        </section>
      </div>

      <section className="wrap mt-20 lg:mt-24" aria-labelledby="selection">
        <div data-reveal className="flex flex-col gap-6 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="t-eyebrow">
              La sélection <span className="text-ink/70">· {list.length} référence{list.length > 1 ? "s" : ""}</span>
            </p>
            <h2 id="selection" className="t-h1 mt-3 max-w-[18ch]">
              Ce que MCI propose pour {sector.name.toLowerCase()}.
            </h2>
          </div>
          <AddSelection lines={list.map((p) => ({ productId: p.id, packagingId: p.packagings[0]!.id, quantity: 1 }))} image={list[0] ? `/packshots/${list[0].slug}.webp` : undefined} className="self-start lg:self-auto" />
        </div>
        {hasBiocide ? <BiocideNotice className="mb-6 max-w-[720px]" /> : null}
        <ProductList products={list} />
        <p className="mt-4 px-2 text-sm text-ink/70">Sélection indicative : ajustez conditionnements et quantités dans le bon de commande. MCI confirme disponibilité et délai.</p>
      </section>

      <section className="wrap mt-20 lg:mt-28" aria-labelledby="seo-secteur">
        <div data-reveal className="grid grid-cols-1 gap-8 rounded-tile bg-salt p-8 sm:p-12 lg:grid-cols-12 lg:gap-x-6 lg:p-16">
          <h2 id="seo-secteur" className="t-h2 min-w-0 lg:col-span-4">
            {sector.name} : comment on travaille
          </h2>
          <div className="prose-mci min-w-0 max-w-[68ch] text-ink/70 lg:col-span-7 lg:col-start-6">
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

      <nav className="wrap mt-20 lg:mt-24" aria-label="Autres secteurs">
        <p className="t-label">Autres secteurs</p>
        <ul className="mt-5 flex flex-wrap gap-2">
          {others.map((s) => (
            <li key={s.slug} className="min-w-0 max-w-full">
              <Link
                href={`/secteurs/${s.slug}`}
                className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-salt py-2.5 pl-5 pr-4 font-medium text-ink transition-colors duration-300 ease-out hover:bg-ink hover:text-white"
              >
                <span className="truncate">{s.name}</span>
                <Icon name="chevronRight" size={16} className="shrink-0 opacity-50" />
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
