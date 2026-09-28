"use client";
import { company } from "@/data/company";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export default function SiteError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="wrap flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <span className="grid size-20 place-items-center rounded-full bg-danger/10 text-danger">
        <Icon name="warning" size={36} />
      </span>
      <p className="mt-8 text-sm font-semibold text-danger">Erreur</p>
      <h1 className="t-h1 mt-3 max-w-[18ch]">Quelque chose s&apos;est mal passé.</h1>
      <p className="t-lead mt-6 max-w-[48ch] text-ink/70">
        Votre bon de commande est conservé. Réessayez, ou appelez-nous au{" "}
        <a href={`tel:${company.phoneE164}`} className="whitespace-nowrap font-semibold text-mci hover:underline">
          {company.phone}
        </a>
        .
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <Button size="lg" onClick={reset}>
          Réessayer
        </Button>
        <ButtonLink href="/" variant="outline" size="lg">
          Retour à l&apos;accueil
        </ButtonLink>
      </div>
    </div>
  );
}
