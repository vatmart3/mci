"use client";
import { company } from "@/data/company";
import { Button } from "@/components/ui/Button";

export default function SiteError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="wrap grid min-h-[50vh] content-center py-24">
      <p className="t-mono text-sm text-danger">ERREUR</p>
      <h1 className="t-h1 mt-4 max-w-[20ch]">Quelque chose s&apos;est mal passé.</h1>
      <p className="t-lead mt-6 max-w-[52ch] text-ink/80">
        Votre bon de commande est conservé. Réessayez, ou appelez-nous au{" "}
        <a href={`tel:${company.phoneE164}`} className="t-mono text-mci underline">
          {company.phone}
        </a>
        .
      </p>
      <Button className="mt-8 w-fit" onClick={reset}>
        Réessayer
      </Button>
    </div>
  );
}
