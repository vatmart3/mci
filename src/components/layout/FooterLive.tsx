"use client";
import { useSession } from "@/lib/store/session";

/** Horaires et réseaux : affichés seulement s'ils sont renseignés dans l'admin. */
export function FooterLive() {
  const settings = useSession((s) => s.settings);
  return (
    <>
      <p className="mb-2 mt-6 text-xs font-semibold text-ink">Horaires</p>
      <p className="text-xs text-ink/70">{settings.hours || "Appelez-nous : on vous répond aux heures de bureau."}</p>
      {settings.socials.length ? (
        <ul className="mt-6 space-y-1 text-sm">
          {settings.socials.map((s) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-xs text-ink/70 hover:text-ink hover:underline">
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );
}
