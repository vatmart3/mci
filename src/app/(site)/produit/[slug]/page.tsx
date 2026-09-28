import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProduct, getProducts } from "@/lib/catalog";
import { familyBySlug } from "@/data/families";
import { sectorBySlug } from "@/data/sectors";
import { formatLabels } from "@/data/properties";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ProductStageProvider, ProductViewer, OrderPanel } from "@/components/catalog/ProductStage";
import { PropertyBadges } from "@/components/catalog/PropertyBadges";
import { BiocideNotice } from "@/components/catalog/BiocideNotice";
import { PdfViewerProvider, SheetButton } from "@/components/catalog/PdfViewer";
import { RequestButton } from "@/components/catalog/RequestLinks";
import { ProductVisual } from "@/components/catalog/ProductVisual";
import { AddToCartButton } from "@/components/cart/AddToCart";
import { Icon } from "@/components/ui/Icon";
import { JsonLd, pageMeta } from "@/lib/seo";
import { SITE_URL } from "@/lib/env";
import { company } from "@/data/company";

export async function generateStaticParams() {
  return (await getProducts()).map((p) => ({ slug: p.slug }));
}
export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = await getProduct((await params).slug);
  if (!p) return {};
  return pageMeta({
    title: `${p.short} ${p.code}`,
    description: `${p.code} : ${p.description} Fiche technique, conditionnements et commande pro — MCI Sète, produits d'entretien professionnels.`,
    path: `/produit/${p.slug}`,
  });
}

function Spec({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-2 border-t border-rule py-4 sm:grid-cols-[160px_1fr] sm:gap-6">
      <dt className="t-mono pt-px text-xs text-ink/70">{label.toUpperCase()}</dt>
      <dd>{children}</dd>
    </div>
  );
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const product = await getProduct((await params).slug);
  if (!product) notFound();
  const all = await getProducts();
  const related = product.related.map((s) => all.find((p) => p.slug === s)).filter((p): p is NonNullable<typeof p> => !!p);
  const family = familyBySlug.get(product.families[0]!);
  const biocide = product.properties.includes("biocide") || product.families.some((f) => familyBySlug.get(f)?.biocide);

  return (
    <PdfViewerProvider>
      <ProductStageProvider product={product}>
        <div className="wrap pt-8 lg:pt-12">
          <Breadcrumb
            items={[
              { name: "Accueil", path: "/" },
              { name: "Catalogue", path: "/catalogue" },
              ...(family ? [{ name: family.name, path: `/catalogue/${family.slug}` }] : []),
              { name: product.code, path: `/produit/${product.slug}` },
            ]}
          />
          <div className="grid-12 mt-8 gap-y-10">
            <div className="col-span-12 lg:col-span-6">
              <div className="lg:sticky lg:top-20">
                <ProductViewer product={product} />
              </div>
            </div>

            <div className="col-span-12 lg:col-span-6 lg:col-start-7 xl:col-span-5 xl:col-start-8">
              <p className="t-mono text-sm text-ink/70">
                {product.families.map((f) => familyBySlug.get(f)?.name.toUpperCase()).join(" · ")}
              </p>
              <h1 className="mt-3">
                <span className="t-h1 t-code block text-mci" style={{ fontFamily: "var(--font-display)", textTransform: "none" }}>
                  {product.code}
                </span>
                <span className="t-h2 mt-2 block">{product.short}</span>
              </h1>
              <p className="t-lead mt-6 text-ink/85">{product.description}</p>
              {product.variants ? <p className="mt-3 text-ink/80">{product.variants}</p> : null}
              <PropertyBadges properties={product.properties} full className="mt-6" />
              {biocide ? <BiocideNotice className="mt-6" /> : null}

              <div className="mt-8 lg:sticky lg:top-20 lg:z-10">
                <OrderPanel product={product} />
              </div>
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
                <RequestButton subject="echantillon" product={product.code} />
                <RequestButton subject="conseil" product={product.code} />
              </div>

              <dl className="mt-12">
                {product.usages.length ? (
                  <Spec label="Usages">
                    <ul className="space-y-1">
                      {product.usages.map((u) => (
                        <li key={u} className="flex gap-2">
                          <span aria-hidden="true" className="t-mono text-mci">
                            —
                          </span>
                          {u}
                        </li>
                      ))}
                    </ul>
                  </Spec>
                ) : null}
                {product.sectors.length ? (
                  <Spec label="Secteurs">
                    <ul className="flex flex-wrap gap-x-4 gap-y-1">
                      {product.sectors.map((s) => (
                        <li key={s}>
                          <Link href={`/secteurs/${s}`} className="link-u">
                            {sectorBySlug.get(s)?.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </Spec>
                ) : null}
                <Spec label="Mode d'emploi">
                  {product.instructions ? <p>{product.instructions}</p> : <p className="text-ink/80">Dosage, dilution et temps de contact : voir la fiche technique, ou demandez conseil à MCI.</p>}
                  {product.dilution ? <p className="t-mono mt-2 text-sm">DILUTION · {product.dilution}</p> : null}
                </Spec>
                <Spec label="Conditionnements">
                  <ul className="t-mono space-y-1 text-sm">
                    {product.packagings.map((p) => (
                      <li key={p.id}>{p.label.toUpperCase()}</li>
                    ))}
                  </ul>
                </Spec>
                <Spec label="Format">
                  <p className="t-mono text-sm">{product.formats.map((f) => formatLabels[f].toUpperCase()).join(" · ")}</p>
                </Spec>
                <Spec label="Documents">
                  <ul className="space-y-3">
                    <li className="flex flex-wrap items-center gap-3">
                      {product.technicalSheetUrl ? (
                        <>
                          <SheetButton url={product.technicalSheetUrl} code={product.code} label="Lire la fiche technique" />
                          <a href={product.technicalSheetUrl} download className="link-u inline-flex items-center gap-1 text-sm">
                            <Icon name="download" size={16} /> Télécharger (PDF)
                          </a>
                        </>
                      ) : (
                        <>
                          <span className="text-sm text-ink/80">Fiche technique sur demande.</span>
                          <RequestButton subject="devis" product={`${product.code} (fiche technique)`} />
                        </>
                      )}
                    </li>
                    <li className="flex flex-wrap items-center gap-3">
                      {product.sdsUrl ? (
                        <a href={product.sdsUrl} target="_blank" rel="noopener noreferrer" className="link-u inline-flex items-center gap-1 text-sm">
                          <Icon name="doc" size={16} /> Fiche de données de sécurité (PDF)
                        </a>
                      ) : (
                        <>
                          <span className="text-sm text-ink/80">FDS envoyée par MCI.</span>
                          <RequestButton subject="fds" product={product.code} />
                        </>
                      )}
                    </li>
                  </ul>
                </Spec>
              </dl>
            </div>
          </div>
        </div>
      </ProductStageProvider>

      {related.length ? (
        <section className="wrap mt-24" aria-labelledby="avec">
          <p className="t-mono text-sm text-ink/70">
            <span className="text-mci">+</span> — SOUVENT COMMANDÉ AVEC
          </p>
          <h2 id="avec" className="t-h2 mt-3">
            Ce qui va avec {product.code}.
          </h2>
          <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((r) => (
              <li key={r.id} data-product-row className="flex items-center gap-4 rounded-box border border-rule bg-white p-4">
                <ProductVisual product={r} size={72} alt="" />
                <div className="min-w-0 flex-1">
                  <Link href={`/produit/${r.slug}`} className="t-code block text-sm text-mci hover:underline">
                    {r.code}
                  </Link>
                  <p className="text-sm leading-snug">{r.short}</p>
                </div>
                <AddToCartButton product={r} packagingId={r.packagings[0]!.id} size="sm" iconOnly />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="wrap mt-24" aria-label="Contact">
        <div className="flex flex-col gap-4 border-t border-ink pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="t-label">Une question sur {product.code} avant de commander ?</p>
          <a href={`tel:${company.phoneE164}`} className="t-mono text-2xl text-mci hover:underline">
            {company.phone}
          </a>
        </div>
      </section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: `${product.code} — ${product.short}`,
          sku: product.code,
          description: product.description,
          category: family?.name,
          image: `${SITE_URL}/packshots/${product.slug}.webp`,
          url: `${SITE_URL}/produit/${product.slug}`,
        }}
      />
    </PdfViewerProvider>
  );
}
