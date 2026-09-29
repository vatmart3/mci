"use client";
import { useSession } from "@/lib/store/session";

/** Horaires et réseaux : affichés seulement s'ils sont renseignés dans l'admin. */
export function FooterLive() {
  const settings = useSession((s) => s.settings);
  return (
    <>
      <p className="mb-1 mt-6 text-sm font-semibold text-white">Horaires</p>
      <p className="text-sm text-white/75">{settings.hours || "Appelez-nous : on vous répond aux heures de bureau."}</p>
      {settings.socials.length ? (
        <ul className="mt-6 space-y-1 text-sm">
          {settings.socials.map((s) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-sm text-white/75 hover:text-white">
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );
}
