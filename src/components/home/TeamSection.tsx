"use client";
import Image from "next/image";
import { useState } from "react";
import { company } from "@/data/company";
import { Icon } from "@/components/ui/Icon";
import { SeteMap } from "./SeteMap";

/** MCI à Sète : l'équipe (photo du site actuel), l'adresse, le plan de situation, le téléphone. */
export function TeamSection({ photo }: { photo: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <section aria-labelledby="equipe-title" className="py-16 lg:py-24">
      <div className="wrap grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8 [&>*]:min-w-0">
        <div className="lg:col-span-7">
          <div className="relative aspect-[3/2] overflow-hidden rounded-[12px] bg-salt">
            {failed ? (
              <div className="absolute inset-0 grid place-items-center p-8 text-center text-sm text-ink/70">Photo de l&apos;équipe MCI, à {company.city}</div>
            ) : (
              <Image src={photo} alt="L'équipe MCI dans ses locaux du Parc Aquatechnique, à Sète" fill sizes="(max-width: 1024px) 100vw, 760px" className="object-cover" onError={() => setFailed(true)} />
            )}
          </div>
        </div>
        <div className="flex flex-col lg:col-span-5">
          <h2 id="equipe-title" className="t-h1">
            À Sète, depuis {company.founded}
          </h2>
          <p className="t-lead mt-4 text-ink/80">
            Au téléphone, vous avez un interlocuteur sur place, qui connaît le catalogue et vous oriente vers le produit adapté à votre surface. Pour un conseil, un échantillon ou un devis, appelez ou écrivez.
          </p>
          <address className="mt-6 flex gap-3 not-italic">
            <Icon name="pin" size={22} className="mt-0.5 shrink-0 text-mci" />
            <span>
              {company.street}
              <br />
              {company.postalCode} {company.city}
              <br />
              <a href={company.mapsUrl} target="_blank" rel="noopener noreferrer" className="link-u text-sm font-semibold">
                Itinéraire
              </a>
            </span>
          </address>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={`tel:${company.phoneE164}`} className="inline-flex h-12 items-center gap-2 rounded-[6px] bg-mci px-5 font-display text-lg font-bold text-white transition-colors duration-150 hover:bg-deep">
              <Icon name="phone" size={20} /> {company.phone}
            </a>
            <a href="/contact" className="inline-flex h-12 items-center rounded-[6px] border border-rule px-5 font-semibold transition-colors duration-150 hover:border-ink">
              Nous écrire
            </a>
          </div>
          <SeteMap className="mt-8 rounded-[12px] border border-rule bg-salt p-4" />
        </div>
      </div>
    </section>
  );
}
