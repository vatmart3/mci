"use client";
import { company } from "@/data/company";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export default function SiteError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="wrap py-12 lg:py-20">
      <div className="mx-auto max-w-[640px] rounded-[8px] border border-rule bg-white p-6 sm:p-10">
        <span className="grid size-14 place-items-center rounded-[8px] bg-danger/10 text-danger">
          <Icon name="warning" size={28} />
        </span>
        <h1 className="t-h1 mt-6">Quelque chose s&apos;est mal passé.</h1>
        <p className="t-lead mt-3 max-w-[48ch] text-ink/70">
          Votre bon de commande est conservé. Réessayez, ou appelez-nous au{" "}
          <a href={`tel:${company.phoneE164}`} className="whitespace-nowrap font-semibold text-mci hover:underline">
            {company.phone}
          </a>
          .
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button size="lg" onClick={reset}>
            Réessayer
          </Button>
          <ButtonLink href="/" variant="outline" size="lg">
            Retour à l&apos;accueil
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
