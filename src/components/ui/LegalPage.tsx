import { Breadcrumb } from "./Breadcrumb";

/** Page légale : colonne de lecture étroite, titre seul, intertitres sobres séparés par des filets. */
export function LegalPage({ title, path, updated, children }: { title: string; path: string; updated?: string; children: React.ReactNode }) {
  return (
    <div className="wrap-narrow pb-20 pt-6 lg:pb-24 lg:pt-10">
      <Breadcrumb items={[{ name: "Accueil", path: "/" }, { name: title, path }]} />
      <header className="mt-8 border-b border-rule pb-8 lg:mt-12">
        <h1 className="t-h1 max-w-[20ch]">{title}</h1>
        {updated ? (
          <p className="mt-5 max-w-full rounded-[6px] border border-rule bg-salt px-4 py-2.5 text-sm text-ink/80 sm:w-fit">{updated}</p>
        ) : null}
      </header>
      <div
        className={
          "prose-mci mt-2 max-w-[70ch] text-base leading-relaxed text-ink/80 [overflow-wrap:anywhere] " +
          "[&_h2]:mb-3 [&_h2]:mt-10 [&_h2]:border-t [&_h2]:border-rule [&_h2]:pt-8 [&_h2]:text-[clamp(1.25rem,1.1rem+0.6vw,1.5rem)] [&_h2]:text-ink " +
          "[&>h2:first-child]:mt-8 [&>h2:first-child]:border-t-0 [&>h2:first-child]:pt-0 [&>p:first-child]:mt-8 " +
          "[&_li]:mt-2 [&_li]:pl-1 [&_ul]:list-disc [&_li]:marker:text-ink/50"
        }
      >
        {children}
      </div>
    </div>
  );
}
