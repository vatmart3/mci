import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { families, getFamily } from "@/data/families";
import { getFamilyProducts } from "@/lib/catalog";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ProductList } from "@/components/catalog/ProductList";
import { BiocideNotice } from "@/components/catalog/BiocideNotice";
import { ContactForm } from "@/components/order/ContactForm";
import { Ruler } from "@/components/ui/Ruler";
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
        <div className="grid-12 mt-8 gap-y-6">
          <p className="t-mono col-span-12 text-sm text-ink/70">
            <span className="text-mci">FAMILLE {String(family.position).padStart(2, "0")}</span> — {family.code}
          </p>
          <h1 className="t-h1 col-span-12 lg:col-span-8">{family.name}</h1>
          <p className="t-lead col-span-12 text-ink/80 lg:col-span-6">{family.intro}</p>
        </div>
        {list.length ? <Ruler className="mt-8 border-y border-rule py-3" items={[`${list.length} RÉFÉRENCES`, `${withSheet} FICHES TECHNIQUES`, "COMMANDE PRO EN LIGNE"]} /> : null}
        {family.biocide ? <BiocideNotice className="mt-6 max-w-[720px]" /> : null}
      </div>

      <div className="wrap mt-8">
        {list.length ? (
          <ProductList products={list} />
        ) : (
          <div className="grid-12 gap-y-8 border-t border-ink pt-8">
            <div className="col-span-12 lg:col-span-5">
              <h2 className="t-h2">Gamme sur demande — appelez-nous.</h2>
              <p className="mt-4 text-ink/80">Cette gamme n&apos;est pas encore détaillée en ligne. Décrivez votre besoin, MCI vous rappelle avec une proposition et sa fiche technique.</p>
              <a href={`tel:${company.phoneE164}`} className="t-mono mt-6 inline-block text-2xl text-mci underline underline-offset-4">
                {company.phone}
              </a>
            </div>
            <div className="col-span-12 rounded-box border border-rule bg-white p-6 lg:col-span-6 lg:col-start-7">
              <ContactForm subject="gamme" message={`Gamme ${family.name} : `} compact />
            </div>
          </div>
        )}
      </div>

      <section className="wrap mt-24" aria-labelledby="seo-famille">
        <div className="grid-12 gap-y-6">
          <h2 id="seo-famille" className="t-h2 col-span-12 lg:col-span-4">
            Bien choisir : {family.name.toLowerCase()}
          </h2>
          <div className="prose-mci col-span-12 max-w-[68ch] text-ink/85 lg:col-span-7 lg:col-start-6">
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
