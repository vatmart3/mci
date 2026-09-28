import { Breadcrumb } from "./Breadcrumb";

/** Page légale : colonne de lecture confortable, titres sobres. */
export function LegalPage({ title, path, updated, children }: { title: string; path: string; updated?: string; children: React.ReactNode }) {
  return (
    <div className="wrap-narrow pb-24 pt-8 lg:pt-12">
      <Breadcrumb items={[{ name: "Accueil", path: "/" }, { name: title, path }]} />
      <header className="mt-12 border-b border-black/10 pb-10 lg:mt-16">
        <p className="t-eyebrow">Informations légales</p>
        <h1 className="t-h1 mt-3 max-w-[18ch]">{title}</h1>
        {updated ? <p className="mt-6 inline-flex max-w-full rounded-box bg-salt px-4 py-2 text-sm text-ink/70">{updated}</p> : null}
      </header>
      <div
        className={
          "prose-mci mt-4 max-w-[68ch] text-base leading-relaxed text-ink/80 " +
          "[&_h2]:mb-3 [&_h2]:mt-12 [&_h2]:text-[clamp(1.375rem,1.15rem+0.7vw,1.75rem)] [&_h2]:text-ink " +
          "[&_li]:mt-2 [&_li]:pl-1 [&_ul]:list-disc [&_li]:marker:text-ink/30"
        }
      >
        {children}
      </div>
    </div>
  );
}
