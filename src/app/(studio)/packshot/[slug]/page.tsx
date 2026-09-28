import { notFound } from "next/navigation";
import { products } from "@/data/catalog";
import { PackshotStudio } from "@/components/three/PackshotStudio";

/** Studio de rendu des packshots (utilisé par `npm run render:packshots`). Non indexé. */
export const metadata = { robots: { index: false, follow: false } };

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export default async function PackshotPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ pack?: string }> }) {
  const { slug } = await params;
  const { pack } = await searchParams;
  const product = products.find((p) => p.slug === slug);
  if (!product) notFound();
  return (
    <div style={{ width: "100vw", height: "100vh", background: "transparent" }}>
      <PackshotStudio product={product} packId={pack} />
    </div>
  );
}
