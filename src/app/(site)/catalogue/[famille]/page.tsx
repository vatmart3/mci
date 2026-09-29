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
import { buttonClass } from "@/components/ui/Button";
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
    description: `${f.intro} Gamme ${f.name.toLowerCase()} MCI Sète : fiches techniques, conditionnements, commande pro en ligne.`,
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
      <div className="border-b border-rule bg-salt">
        <div className="wrap pb-8 pt-6 lg:pb-10 lg:pt-8">
          <Breadcrumb items={[{ name: "Accueil", path: "/" }, { name: "Catalogue", path: "/catalogue" }, { name: family.name, path: `/catalogue/${family.slug}` }]} />
          <header className="mt-6 grid grid-cols-1 gap-6 lg:mt-8 lg:grid-cols-12 lg:items-end lg:gap-x-6 [&>*]:min-w-0">
            <div className="lg:col-span-8">
              <h1 className="t-h1">{family.name}</h1>
              <p className="t-lead mt-3 max-w-[62ch] text-ink/70">{family.intro}</p>
            </div>
            {list.length ? (
              <ul className="flex flex-wrap gap-x-6 gap-y-2 lg:col-span-4 lg:justify-self-end">
                <li className="flex items-baseline gap-1.5">
                  <span className="t-num text-2xl">{list.length}</span>
                  <span className="text-sm text-ink/70">références</span>
                </li>
                <li className="flex items-baseline gap-1.5">
                  <span className="t-num text-2xl">{withSheet}</span>
                  <span className="text-sm text-ink/70">fiches techniques</span>
                </li>
                <li className="flex items-baseline text-sm text-ink/70">Commande pro en ligne</li>
              </ul>
            ) : null}
          </header>
          {family.biocide ? <BiocideNotice className="mt-6 max-w-[760px]" /> : null}
        </div>
      </div>

      <div className="wrap pt-8 lg:pt-10">
        {list.length ? (
          <ProductList products={list} />
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 [&>*]:min-w-0">
            <div className="flex flex-col justify-between rounded-[8px] border border-rule bg-salt p-6 sm:p-8 lg:col-span-5">
              <div>
                <h2 className="t-h2">Gamme sur demande — appelez-nous</h2>
                <p className="mt-3 text-ink/80">Cette gamme n&apos;est pas encore détaillée en ligne. Décrivez votre besoin, MCI vous rappelle avec une proposition et sa fiche technique.</p>
              </div>
              <a href={`tel:${company.phoneE164}`} className={buttonClass("primary", "lg", "mt-8 w-fit tabular-nums")}>
                <Icon name="phone" size={20} />
                {company.phone}
              </a>
            </div>
            <div className="rounded-[8px] border border-rule bg-white p-6 sm:p-8 lg:col-span-7">
              <ContactForm subject="gamme" message={`Gamme ${family.name} : `} compact />
            </div>
          </div>
        )}
      </div>

      <section className="wrap py-16 lg:py-20" aria-labelledby="seo-famille">
        <div className="max-w-[70ch]">
          <h2 id="seo-famille" className="t-h2">
            Bien choisir : {family.name.toLowerCase()}
          </h2>
          <div className="prose-mci mt-5 text-ink/80">
            {family.seo.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
            <p>
              <Link href="/contact">Une question sur un produit ? Écrivez-nous</Link> ou appelez le {company.phone}.
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
