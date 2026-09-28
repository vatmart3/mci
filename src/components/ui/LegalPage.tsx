import { Breadcrumb } from "./Breadcrumb";

export function LegalPage({ title, path, updated, children }: { title: string; path: string; updated?: string; children: React.ReactNode }) {
  return (
    <div className="wrap pb-8 pt-8 lg:pt-12">
      <Breadcrumb items={[{ name: "Accueil", path: "/" }, { name: title, path }]} />
      <h1 className="t-h1 mt-8 max-w-[18ch]">{title}</h1>
      {updated ? <p className="t-mono mt-4 text-xs text-ink/70">{updated}</p> : null}
      <div className="prose-mci mt-12 max-w-[70ch] text-ink/90">{children}</div>
    </div>
  );
}
