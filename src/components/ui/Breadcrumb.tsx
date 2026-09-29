import Link from "next/link";
import { JsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { Icon } from "./Icon";

export function Breadcrumb({ items }: { items: { name: string; path: string }[] }) {
  return (
    <>
      <nav aria-label="Fil d'Ariane" className="min-w-0 text-xs text-ink/70 sm:text-sm">
        <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
          {items.map((it, i) => (
            <li key={it.path} className="flex min-w-0 items-center gap-1.5">
              {i > 0 ? <Icon name="chevronRight" size={12} className="shrink-0 text-ink/40" /> : null}
              {i === items.length - 1 ? (
                <span aria-current="page" className="truncate font-medium text-ink">
                  {it.name}
                </span>
              ) : (
                <Link href={it.path} className="truncate transition-colors duration-150 ease-out hover:text-mci">
                  {it.name}
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
