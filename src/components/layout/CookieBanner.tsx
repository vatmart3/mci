"use client";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

import { COOKIE_KEY } from "@/lib/cookie-boot";

/**
 * Bandeau minimal : le site n'utilise aucun traceur tiers par défaut.
 * Refuser est aussi simple qu'accepter ; le choix est mémorisé 6 mois.
 * Rendu côté serveur (visible dès le premier affichage) et masqué en CSS si le choix existe.
 */
export function CookieBanner() {
  const [closed, setClosed] = useState(false);
  if (closed) return null;
  const choose = (value: "accepted" | "refused") => {
    try {
      window.localStorage.setItem(COOKIE_KEY, JSON.stringify({ value, at: Date.now() }));
    } catch {
      /* ignore */
    }
    document.documentElement.dataset.cookies = "1";
    setClosed(true);
  };
  return (
    <div role="region" aria-label="Cookies" data-no-print data-cookie-banner className="fixed inset-x-3 bottom-24 z-50 mx-auto max-w-[480px] rounded-box bg-white p-4 shadow-float ring-1 ring-black/5 lg:bottom-6 lg:left-6 lg:right-auto">
      <p className="h-16 overflow-hidden text-xs leading-snug sm:h-8">
        Uniquement des cookies techniques (bon de commande, connexion). Aucun traceur publicitaire ni mesure d&apos;audience tierce.{" "}
        <Link href="/confidentialite" className="link-u">
          En savoir plus
        </Link>
      </p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <Button variant="outline" size="sm" onClick={() => choose("refused")}>
          Refuser
        </Button>
        <Button variant="outline" size="sm" onClick={() => choose("accepted")}>
          Accepter
        </Button>
      </div>
    </div>
  );
}
