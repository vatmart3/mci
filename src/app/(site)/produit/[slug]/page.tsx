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
import { Icon, type IconName } from "@/components/ui/Icon";
import { buttonClass } from "@/components/ui/Button";
import { cx } from "@/lib/cx";
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

function InfoSection({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-titre`} className="grid scroll-mt-28 grid-cols-1 gap-4 border-t border-rule py-10 lg:grid-cols-12 lg:gap-x-6 lg:py-12 [&>*]:min-w-0">
      <h2 id={`${id}-titre`} className="t-h2 lg:col-span-3">
        {title}
      </h2>
      <div className="lg:col-span-9">{children}</div>
    </section>
  );
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const product = await getProduct((await params).slug);
  if (!product) notFound();
  const all = await getProducts();
  const related = product.related.map((s) => all.find((p) => p.slug === s)).filter((p): p is NonNullable<typeof p> => !!p);
  const family = familyBySlug.get(product.families[0]!);
  const hasUsages = product.usages.length > 0;
  const hasSectors = product.sectors.length > 0;
  const biocide = product.properties.includes("biocide") || product.families.some((f) => familyBySlug.get(f)?.biocide);
  const anchors = [
    ...(hasUsages ? [{ id: "usages", label: "Usages" }] : []),
    { id: "mode-emploi", label: "Mode d'emploi" },
    { id: "conditionnements", label: "Conditionnements" },
    { id: "documents", label: "Documents" },
    ...(hasSectors ? [{ id: "secteurs", label: "Secteurs" }] : []),
  ];

  return (
    <PdfViewerProvider>
      <ProductStageProvider product={product}>
        <div className="wrap pt-6 lg:pt-8">
          <Breadcrumb
            items={[
              { name: "Accueil", path: "/" },
              { name: "Catalogue", path: "/catalogue" },
              ...(family ? [{ name: family.name, path: `/catalogue/${family.slug}` }] : []),
              { name: product.code, path: `/produit/${product.slug}` },
            ]}
          />
          <div className="mt-6 grid grid-cols-1 gap-8 lg:mt-8 lg:grid-cols-12 lg:gap-x-10 xl:gap-x-14 [&>*]:min-w-0">
            <div className="lg:col-span-7">
              <div className="lg:sticky lg:top-24">
                <ProductViewer product={product} />
              </div>
            </div>

            <div className="lg:col-span-5">
              <p className="flex flex-wrap gap-x-3 gap-y-1 text-sm font-semibold">
                {product.families.map((f) => {
                  const fam = familyBySlug.get(f);
                  return fam ? (
                    <Link key={f} href={`/catalogue/${fam.slug}`} className="link-u">
                      {fam.name}
                    </Link>
                  ) : null;
                })}
              </p>
              <h1 className="mt-2">
                <span className="t-h1 t-code block break-words">{product.code}</span>
                <span className="t-label mt-2 block text-ink/80">{product.short}</span>
              </h1>
              <p className="mt-4 text-ink/80">{product.description}</p>
              {product.variants ? <p className="mt-2 text-sm text-ink/70">{product.variants}</p> : null}
              <PropertyBadges properties={product.properties} full className="mt-5" />
              {biocide ? <BiocideNotice className="mt-5" /> : null}

              <div className="mt-6">
                <OrderPanel product={product} />
              </div>
              <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium">
                <li>
                  <RequestButton subject="echantillon" product={product.code} />
                </li>
                <li>
                  <RequestButton subject="conseil" product={product.code} />
                </li>
                {product.technicalSheetUrl ? (
                  <li>
                    <a href={product.technicalSheetUrl} target="_blank" rel="noopener noreferrer" className="link-u inline-flex items-center gap-1.5">
                      <Icon name="doc" size={16} /> Fiche technique (PDF)
                    </a>
                  </li>
                ) : null}
              </ul>
            </div>
          </div>
        </div>

        {/* Informations produit : sections en ancres */}
        <div className="wrap mt-14 lg:mt-20">
          <nav aria-label={`Fiche produit ${product.code}`} className="relative overflow-x-auto border-b border-rule">
            <ul className="flex gap-1">
              {anchors.map((a) => (
                <li key={a.id} className="shrink-0">
                  <a
                    href={`#${a.id}`}
                    className="inline-flex h-12 items-center whitespace-nowrap border-b-2 border-transparent px-3 text-sm font-semibold text-ink/80 transition-colors duration-150 ease-out hover:border-mci hover:text-mci"
                  >
                    {a.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {hasUsages ? (
            <InfoSection id="usages" title="Usages">
              <ul className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
                {product.usages.map((u) => (
                  <li key={u} className="flex min-w-0 gap-3">
                    <Icon name="check" size={18} className="mt-0.5 shrink-0 text-mci" />
                    <span className="min-w-0">{u}</span>
                  </li>
                ))}
              </ul>
            </InfoSection>
          ) : null}

          <InfoSection id="mode-emploi" title="Mode d'emploi">
            <div className="max-w-[70ch]">
              {product.instructions ? <p className="text-ink/80">{product.instructions}</p> : <p className="text-ink/80">Dosage, dilution et temps de contact : voir la fiche technique, ou demandez conseil à MCI.</p>}
              {product.dilution ? (
                <dl className="mt-5 flex flex-wrap gap-x-3 gap-y-1 rounded-[8px] border border-rule bg-salt px-4 py-3 text-sm">
                  <dt className="font-semibold">Dilution</dt>
                  <dd className="text-ink/80">{product.dilution}</dd>
                </dl>
              ) : null}
            </div>
          </InfoSection>

          <InfoSection id="conditionnements" title="Conditionnements">
            <ul className="flex flex-wrap gap-2">
              {product.packagings.map((p) => (
                <li key={p.id} className="rounded-[6px] border border-rule bg-white px-3 py-2 text-sm font-medium">
                  {p.label}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-ink/80">
              <span className="font-semibold text-ink">Format :</span> {product.formats.map((f) => formatLabels[f]).join(" · ")}
            </p>
          </InfoSection>

          <InfoSection id="documents" title="Documents">
            <div className="overflow-hidden rounded-[8px] border border-rule">
              <ul className="divide-y divide-rule">
                <li className="flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-4">
                  <Icon name="doc" size={22} className="shrink-0 text-mci" />
                  <p className="min-w-0 flex-1 basis-48 font-semibold">
                    Fiche technique
                    {product.technicalSheetUrl ? null : <span className="block text-sm font-normal text-ink/70">Fiche technique sur demande.</span>}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    {product.technicalSheetUrl ? (
                      <>
                        <SheetButton url={product.technicalSheetUrl} code={product.code} label="Lire la fiche technique" />
                        <a href={product.technicalSheetUrl} download className="link-u inline-flex items-center gap-1 text-sm">
                          <Icon name="download" size={16} /> Télécharger (PDF)
                        </a>
                      </>
                    ) : (
                      <RequestButton subject="devis" product={`${product.code} (fiche technique)`} />
                    )}
                  </div>
                </li>
                <li className="flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-4">
                  <Icon name="warning" size={22} className="shrink-0 text-warn" />
                  <p className="min-w-0 flex-1 basis-48 font-semibold">
                    Fiche de données de sécurité
                    {product.sdsUrl ? null : <span className="block text-sm font-normal text-ink/70">FDS envoyée par MCI.</span>}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                    {product.sdsUrl ? (
                      <a href={product.sdsUrl} target="_blank" rel="noopener noreferrer" className="link-u inline-flex items-center gap-1 text-sm">
                        <Icon name="doc" size={16} /> Fiche de données de sécurité (PDF)
                      </a>
                    ) : (
                      <RequestButton subject="fds" product={product.code} />
                    )}
                  </div>
                </li>
              </ul>
            </div>
          </InfoSection>

          {hasSectors ? (
            <InfoSection id="secteurs" title="Secteurs">
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {product.sectors.map((s) => (
                  <li key={s} className="min-w-0">
                    <Link
                      href={`/secteurs/${s}`}
                      className="group flex min-w-0 items-center gap-3 rounded-[6px] border border-rule bg-white px-3 py-2.5 text-sm font-semibold transition-colors duration-150 ease-out hover:border-mci hover:text-mci"
                    >
                      <Icon name={`sec-${s}` as IconName} size={22} className="shrink-0 text-mci" />
                      <span className="min-w-0 flex-1 truncate">{sectorBySlug.get(s)?.name}</span>
                      <Icon name="chevronRight" size={16} className="shrink-0 text-ink/40 group-hover:text-mci" />
                    </Link>
                  </li>
                ))}
              </ul>
            </InfoSection>
          ) : null}
        </div>
      </ProductStageProvider>

      {related.length ? (
        <section className="mt-6 border-t border-rule bg-salt py-12 lg:py-16" aria-labelledby="avec">
          <div className="wrap">
            <h2 id="avec" className="t-h2">
              Souvent commandé avec {product.code}
            </h2>
            <ul className="mt-6 grid grid-cols-1 gap-4 min-[440px]:grid-cols-2 lg:grid-cols-4">
              {related.map((r) => (
                <li key={r.id} data-product-row className="tile tile-hover flex min-w-0 flex-col">
                  <Link href={`/produit/${r.slug}`} className="group flex flex-1 flex-col">
                    <span className="plate grid h-40 place-items-center border-b border-rule p-4">
                      <ProductVisual product={r} size={160} alt="" className="h-32 w-auto transition-transform duration-200 ease-out group-hover:scale-[1.03]" />
                    </span>
                    <span className="flex flex-1 flex-col p-4">
                      <span className="t-code text-xl leading-none text-ink group-hover:text-mci">{r.code}</span>
                      <span className="mt-1 line-clamp-2 text-sm text-ink/80">{r.short}</span>
                    </span>
                  </Link>
                  <div className="flex items-center justify-between gap-2 border-t border-rule p-3">
                    <span className="min-w-0 truncate text-sm text-ink/70">{r.packagings[0]!.label}</span>
                    <AddToCartButton product={r} packagingId={r.packagings[0]!.id} size="sm" />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <section className={cx("wrap", related.length ? "py-12 lg:py-16" : "mt-6 py-12 lg:py-16")} aria-label="Contact">
        <div className="flex flex-col gap-5 rounded-[8px] border border-rule bg-white p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <p className="t-label min-w-0">Une question sur {product.code} avant de commander ?</p>
          <a href={`tel:${company.phoneE164}`} className={buttonClass("primary", "md", "shrink-0 tabular-nums")}>
            <Icon name="phone" size={18} />
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
