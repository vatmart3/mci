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

function InfoTile({ title, className, children, delay }: { title: string; className?: string; children: React.ReactNode; delay?: number }) {
  return (
    <section data-reveal className={cx("min-w-0 rounded-tile bg-salt p-7 sm:p-9", className)} style={delay ? ({ "--reveal-delay": `${delay}ms` } as React.CSSProperties) : undefined}>
      <h3 className="t-label">{title}</h3>
      <div className="mt-5">{children}</div>
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
          <div className="mt-8 grid grid-cols-1 gap-10 lg:mt-10 lg:grid-cols-12 lg:gap-x-10 xl:gap-x-16">
            <div className="min-w-0 lg:col-span-7">
              <div className="lg:sticky lg:top-20">
                <ProductViewer product={product} />
              </div>
            </div>

            <div className="min-w-0 lg:col-span-5 lg:pt-6">
              <p className="t-eyebrow">{product.families.map((f) => familyBySlug.get(f)?.name).join(" · ")}</p>
              <h1 className="mt-3">
                <span className="t-h1 block break-words">{product.code}</span>
                <span className="t-label mt-3 block text-ink/70 sm:text-lg">{product.short}</span>
              </h1>
              <p className="t-lead mt-6 text-ink/70">{product.description}</p>
              {product.variants ? <p className="mt-3 text-ink/70">{product.variants}</p> : null}
              <PropertyBadges properties={product.properties} full className="mt-6" />
              {biocide ? <BiocideNotice className="mt-6" /> : null}

              <div className="mt-8">
                <OrderPanel product={product} />
              </div>
              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 px-2 text-sm font-medium">
                <RequestButton subject="echantillon" product={product.code} />
                <RequestButton subject="conseil" product={product.code} />
              </div>
            </div>
          </div>
        </div>

        {/* Informations produit : tuiles façon bento */}
        <section className="wrap mt-20 lg:mt-28" aria-labelledby="infos">
          <div data-reveal>
            <p className="t-eyebrow">Fiche produit</p>
            <h2 id="infos" className="t-h1 mt-3 max-w-[18ch]">
              Tout savoir sur {product.code}.
            </h2>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {hasUsages ? (
              <InfoTile title="Usages" className="md:col-span-2 lg:col-span-2">
                <ul className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
                  {product.usages.map((u) => (
                    <li key={u} className="flex min-w-0 gap-3">
                      <span aria-hidden="true" className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-mci/10 text-mci">
                        <Icon name="check" size={13} />
                      </span>
                      <span className="min-w-0">{u}</span>
                    </li>
                  ))}
                </ul>
              </InfoTile>
            ) : null}

            <InfoTile title="Mode d'emploi" className={hasUsages || hasSectors ? undefined : "lg:col-span-2"} delay={80}>
              {product.instructions ? <p className="text-ink/80">{product.instructions}</p> : <p className="text-ink/70">Dosage, dilution et temps de contact : voir la fiche technique, ou demandez conseil à MCI.</p>}
              {product.dilution ? (
                <p className="mt-4 inline-flex max-w-full flex-wrap items-center gap-2 rounded-full bg-white px-4 py-2 text-sm">
                  <span className="font-semibold">Dilution</span>
                  <span className="text-ink/70">{product.dilution}</span>
                </p>
              ) : null}
            </InfoTile>

            <InfoTile title="Conditionnements et formats">
              <ul className="flex flex-wrap gap-2">
                {product.packagings.map((p) => (
                  <li key={p.id} className="rounded-full bg-white px-4 py-2 text-sm font-medium">
                    {p.label}
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-sm text-ink/70">
                <span className="font-semibold text-ink">Format</span> · {product.formats.map((f) => formatLabels[f]).join(" · ")}
              </p>
            </InfoTile>

            {hasSectors ? (
              <InfoTile title="Secteurs" className={cx("md:col-span-2", hasUsages ? "lg:col-span-2" : "lg:col-span-1")}>
                <ul className="flex flex-wrap gap-2">
                  {product.sectors.map((s) => (
                    <li key={s} className="min-w-0 max-w-full">
                      <Link
                        href={`/secteurs/${s}`}
                        className="inline-flex max-w-full items-center rounded-full bg-white px-4 py-2 text-sm font-medium text-mci transition-colors duration-300 ease-out hover:bg-mci hover:text-white"
                      >
                        <span className="truncate">{sectorBySlug.get(s)?.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </InfoTile>
            ) : null}

            <InfoTile title="Documents" className={cx("md:col-span-2", hasSectors || !hasUsages ? "lg:col-span-3" : "lg:col-span-2")} delay={80}>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex min-w-0 flex-col gap-4 rounded-box bg-white p-5">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-mci/10 text-mci">
                      <Icon name="doc" size={20} />
                    </span>
                    <p className="font-semibold">Fiche technique</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    {product.technicalSheetUrl ? (
                      <>
                        <SheetButton url={product.technicalSheetUrl} code={product.code} label="Lire la fiche technique" />
                        <a href={product.technicalSheetUrl} download className="link-u inline-flex items-center gap-1 text-sm">
                          <Icon name="download" size={16} /> Télécharger (PDF)
                        </a>
                      </>
                    ) : (
                      <>
                        <span className="text-sm text-ink/70">Fiche technique sur demande.</span>
                        <RequestButton subject="devis" product={`${product.code} (fiche technique)`} />
                      </>
                    )}
                  </div>
                </div>
                <div className="flex min-w-0 flex-col gap-4 rounded-box bg-white p-5">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-warn/12 text-warn">
                      <Icon name="warning" size={20} />
                    </span>
                    <p className="font-semibold">Fiche de données de sécurité</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    {product.sdsUrl ? (
                      <a href={product.sdsUrl} target="_blank" rel="noopener noreferrer" className="link-u inline-flex items-center gap-1 text-sm">
                        <Icon name="doc" size={16} /> Fiche de données de sécurité (PDF)
                      </a>
                    ) : (
                      <>
                        <span className="text-sm text-ink/70">FDS envoyée par MCI.</span>
                        <RequestButton subject="fds" product={product.code} />
                      </>
                    )}
                  </div>
                </div>
              </div>
            </InfoTile>

          </div>
        </section>
      </ProductStageProvider>

      {related.length ? (
        <section className="mt-20 lg:mt-28" aria-labelledby="avec">
          <div data-reveal className="wrap">
            <p className="t-eyebrow">Souvent commandé avec</p>
            <h2 id="avec" className="t-h1 mt-3 max-w-[18ch]">
              Ce qui va avec {product.code}.
            </h2>
          </div>
          <div className="wrap mt-10">
            <ul className="snap-row -mx-[var(--margin)] gap-4 px-[var(--margin)] pb-6 pt-2 scroll-px-[var(--margin)]">
              {related.map((r) => (
                <li
                  key={r.id}
                  data-product-row
                  className="group flex w-[240px] shrink-0 flex-col rounded-box bg-white p-2 ring-1 ring-black/5 transition-[transform,box-shadow] duration-500 ease-out hover:-translate-y-1 hover:shadow-tile sm:w-[260px]"
                >
                  <Link href={`/produit/${r.slug}`} className="grid aspect-[4/3] place-items-center overflow-hidden rounded-tech bg-salt" tabIndex={-1} aria-hidden="true">
                    <ProductVisual product={r} size={160} alt="" className="h-4/5 w-auto transition-transform duration-500 ease-out group-hover:scale-105" />
                  </Link>
                  <div className="flex flex-1 items-end justify-between gap-3 px-2 pb-2 pt-4">
                    <div className="min-w-0 flex-1">
                      <Link href={`/produit/${r.slug}`} className="t-code block truncate text-sm text-mci hover:underline hover:underline-offset-4">
                        {r.code}
                      </Link>
                      <p className="mt-0.5 line-clamp-2 text-sm leading-snug text-ink/70">{r.short}</p>
                    </div>
                    <AddToCartButton product={r} packagingId={r.packagings[0]!.id} size="sm" iconOnly />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <section className="wrap mt-16 lg:mt-20" aria-label="Contact">
        <div data-reveal className="flex flex-col gap-6 rounded-tile bg-salt p-8 sm:flex-row sm:items-center sm:justify-between sm:p-12">
          <p className="t-h2 max-w-[20ch]">Une question sur {product.code} avant de commander ?</p>
          <a
            href={`tel:${company.phoneE164}`}
            className="inline-flex w-fit shrink-0 items-center gap-3 rounded-full bg-white py-2 pl-2 pr-6 text-lg font-semibold tabular-nums text-mci shadow-sheet transition-shadow duration-300 ease-out hover:shadow-tile"
          >
            <span className="grid size-10 place-items-center rounded-full bg-mci text-white">
              <Icon name="phone" size={18} />
            </span>
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
