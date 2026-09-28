import { ButtonLink } from "@/components/ui/Button";
import { ShaderBackground } from "@/components/fx/ShaderBackground";
import { company } from "@/data/company";

/** Bandeau d'appel : fond « mer » animé, deux gestes (catalogue, devis) et le téléphone. */
export function CtaSection() {
  return (
    <section aria-labelledby="cta-title" className="px-3 pb-3 sm:px-6 sm:pb-6">
      <div className="relative isolate overflow-hidden rounded-tile px-6 py-24 text-center text-white sm:py-32">
        <ShaderBackground variant="sea" />
        <div data-reveal className="mx-auto flex max-w-[760px] flex-col items-center">
          <h2 id="cta-title" className="t-display text-white">
            Parlons de vos surfaces.
          </h2>
          <p className="t-lead mt-6 max-w-[40ch] text-white/80">Un devis, un échantillon, une fiche de sécurité ou simplement un conseil : MCI vous répond.</p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <ButtonLink href="/catalogue" variant="action" size="lg">
              Ouvrir le catalogue
            </ButtonLink>
            <ButtonLink href="/contact" variant="outline" size="lg" className="!border-white !text-white hover:!bg-white hover:!text-ink">
              Demander un devis
            </ButtonLink>
          </div>
          <a href={`tel:${company.phoneE164}`} className="mt-8 text-lg font-medium text-white/90 hover:text-white hover:underline">
            {company.phone}
          </a>
        </div>
      </div>
    </section>
  );
}
