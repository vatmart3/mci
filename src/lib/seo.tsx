import type { Metadata } from "next";
import { SITE_URL } from "@/lib/env";
import { company } from "@/data/company";

export function pageMeta({ title, description, path, image, noindex }: { title: string; description: string; path: string; image?: string; noindex?: boolean }): Metadata {
  const url = `${SITE_URL}${path}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: company.name, locale: "fr_FR", type: "website", ...(image ? { images: [{ url: image, width: 1200, height: 630 }] } : {}) },
    twitter: { card: "summary_large_image", title, description },
    robots: noindex ? { index: false, follow: false } : undefined,
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: company.name,
        url: SITE_URL,
        logo: `${SITE_URL}/brand/logo-mci.svg`,
        email: company.email,
        telephone: company.phoneE164,
        foundingDate: String(company.founded),
      },
      {
        "@type": "LocalBusiness",
        "@id": `${SITE_URL}/#localbusiness`,
        name: company.name,
        description: "Nettoyants techniques, désinfectants et traitements de maintenance pour collectivités, industries et loisirs.",
        url: SITE_URL,
        telephone: company.phoneE164,
        email: company.email,
        image: `${SITE_URL}/brand/logo-mci.svg`,
        parentOrganization: { "@id": `${SITE_URL}/#organization` },
        address: {
          "@type": "PostalAddress",
          streetAddress: company.street,
          postalCode: company.postalCode,
          addressLocality: company.city,
          addressRegion: company.region,
          addressCountry: "FR",
        },
      },
    ],
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: `${SITE_URL}${it.path}` })),
  };
}

export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
