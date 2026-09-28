import Link from "next/link";
import { JsonLd, breadcrumbJsonLd } from "@/lib/seo";

export function Breadcrumb({ items }: { items: { name: string; path: string }[] }) {
  return (
    <>
      <nav aria-label="Fil d'Ariane" className="t-mono text-xs text-ink/70">
        <ol className="flex flex-wrap items-center gap-2">
          {items.map((it, i) => (
            <li key={it.path} className="flex items-center gap-2">
              {i > 0 ? <span aria-hidden="true">/</span> : null}
              {i === items.length - 1 ? (
                <span aria-current="page" className="text-ink">
                  {it.name.toUpperCase()}
                </span>
              ) : (
                <Link href={it.path} className="hover:text-mci hover:underline">
                  {it.name.toUpperCase()}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd data={breadcrumbJsonLd(items)} />
    </>
  );
}
