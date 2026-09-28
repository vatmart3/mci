import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { families, getFamily } from "@/data/families";
import { getFamilyProducts } from "@/lib/catalog";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ProductList } from "@/components/catalog/ProductList";
import { BiocideNotice } from "@/components/catalog/BiocideNotice";
import { ContactForm } from "@/components/order/ContactForm";
import { Icon } from "@/components/ui/Icon";
import { JsonLd, pageMeta } from "@/lib/seo";
import { SITE_URL } from "@/lib/env";
import { company } from "@/data/company";

export const dynamicParams = false;
export function generateStaticParams() {
  return families.map((f) => ({ famille: f.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ famille: string }> }): Promise<Metadata> {
  const f = getFamily((await params).famille);
  if (!f) return {};
  return pageMeta({
    title: `${f.name} — produits professionnels`,
    description: `${f.intro} Gamme ${f.name.toLowerCase()} MCI Sète : fiches techniques, conditionnements, commande pro en ligne.`,
    path: `/catalogue/${f.slug}`,
  });
}

export default async function FamilyPage({ params }: { params: Promise<{ famille: string }> }) {
  const family = getFamily((await params).famille);
  if (!family) notFound();
  const list = await getFamilyProducts(family.slug);
  const withSheet = list.filter((p) => p.technicalSheetUrl).length;

  return (
    <>
      <div className="wrap pt-8 lg:pt-12">
        <Breadcrumb items={[{ name: "Accueil", path: "/" }, { name: "Catalogue", path: "/catalogue" }, { name: family.name, path: `/catalogue/${family.slug}` }]} />
        <header className="mt-10 grid grid-cols-1 gap-6 lg:mt-14 lg:grid-cols-12 lg:items-end lg:gap-x-6">
          <div data-reveal className="min-w-0 lg:col-span-7">
            <p className="t-eyebrow">
              Famille {String(family.position).padStart(2, "0")} <span className="t-code text-[0.8em] text-ink/70">· {family.code}</span>
            </p>
            <h1 className="t-h1 mt-3">{family.name}</h1>
          </div>
          <p data-reveal className="t-lead min-w-0 text-ink/70 lg:col-span-5" style={{ "--reveal-delay": "120ms" } as React.CSSProperties}>
            {family.intro}
          </p>
        </header>
        {list.length ? (
          <ul data-reveal className="mt-10 flex flex-wrap gap-2" style={{ "--reveal-delay": "180ms" } as React.CSSProperties}>
            <li className="rounded-full bg-salt px-4 py-2 text-sm">
              <span className="font-semibold tabular-nums">{list.length}</span> <span className="text-ink/70">références</span>
            </li>
            <li className="rounded-full bg-salt px-4 py-2 text-sm">
              <span className="font-semibold tabular-nums">{withSheet}</span> <span className="text-ink/70">fiches techniques</span>
            </li>
            <li className="rounded-full bg-salt px-4 py-2 text-sm text-ink/70">Commande pro en ligne</li>
          </ul>
        ) : null}
        {family.biocide ? <BiocideNotice className="mt-6 max-w-[720px]" /> : null}
      </div>

      <div className="wrap mt-10 lg:mt-12">
        {list.length ? (
          <ProductList products={list} />
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <div data-reveal className="flex min-w-0 flex-col justify-between rounded-tile bg-salt p-8 sm:p-10 lg:col-span-5 lg:p-12">
              <div>
                <h2 className="t-h2">Gamme sur demande — appelez-nous.</h2>
                <p className="t-lead mt-4 text-ink/70">Cette gamme n&apos;est pas encore détaillée en ligne. Décrivez votre besoin, MCI vous rappelle avec une proposition et sa fiche technique.</p>
              </div>
              <a
                href={`tel:${company.phoneE164}`}
                className="mt-10 inline-flex w-fit items-center gap-3 rounded-full bg-white py-2 pl-2 pr-6 text-lg font-semibold tabular-nums text-mci shadow-sheet transition-shadow duration-300 ease-out hover:shadow-tile"
              >
                <span className="grid size-10 place-items-center rounded-full bg-mci text-white">
                  <Icon name="phone" size={18} />
                </span>
                {company.phone}
              </a>
            </div>
            <div data-reveal className="min-w-0 rounded-tile bg-white p-6 ring-1 ring-black/5 sm:p-10 lg:col-span-7" style={{ "--reveal-delay": "120ms" } as React.CSSProperties}>
              <ContactForm subject="gamme" message={`Gamme ${family.name} : `} compact />
            </div>
          </div>
        )}
      </div>

      <section className="wrap mt-20 lg:mt-28" aria-labelledby="seo-famille">
        <div data-reveal className="grid grid-cols-1 gap-8 rounded-tile bg-salt p-8 sm:p-12 lg:grid-cols-12 lg:gap-x-6 lg:p-16">
          <h2 id="seo-famille" className="t-h2 min-w-0 lg:col-span-4">
            Bien choisir : {family.name.toLowerCase()}
          </h2>
          <div className="prose-mci min-w-0 max-w-[68ch] text-ink/70 lg:col-span-7 lg:col-start-6">
            {family.seo.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
            <p>
              <Link href="/contact">Une question sur un produit ? Écrivez-nous</Link> ou appelez le {company.phone}.
            </p>
          </div>
        </div>
      </section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: family.name,
          numberOfItems: list.length,
          itemListElement: list.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: `${SITE_URL}/produit/${p.slug}`, name: `${p.code} — ${p.short}` })),
        }}
      />
    </>
  );
}
