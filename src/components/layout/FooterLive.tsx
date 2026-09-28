"use client";
import { useSession } from "@/lib/store/session";

/** Horaires et réseaux : affichés seulement s'ils sont renseignés dans l'admin. */
export function FooterLive() {
  const settings = useSession((s) => s.settings);
  return (
    <>
      <p className="t-mono mb-2 mt-8 text-xs text-white/70">HORAIRES</p>
      <p className="text-sm text-white/90">{settings.hours || "Appelez-nous : on vous répond aux heures de bureau."}</p>
      {settings.socials.length ? (
        <ul className="mt-6 space-y-1 text-sm">
          {settings.socials.map((s) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noopener noreferrer" className="link-u text-white/90 hover:text-white">
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );
}
