"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

const KEY = "mci:cookies";

/**
 * Bandeau minimal : le site n'utilise aucun traceur tiers par défaut.
 * Refuser est aussi simple qu'accepter ; le choix est mémorisé 6 mois.
 */
export function CookieBanner() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      const v = raw ? (JSON.parse(raw) as { at: number }) : null;
      setShow(!v || Date.now() - v.at > 1000 * 60 * 60 * 24 * 182);
    } catch {
      setShow(false);
    }
  }, []);
  if (!show) return null;
  const choose = (value: "accepted" | "refused") => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify({ value, at: Date.now() }));
    } catch {
      /* ignore */
    }
    setShow(false);
  };
  return (
    <div role="region" aria-label="Cookies" data-no-print className="fixed inset-x-4 bottom-18 z-50 mx-auto max-w-[560px] rounded-box border border-rule bg-white p-4 shadow-sheet lg:bottom-4 lg:left-4 lg:right-auto">
      <p className="text-sm">
        Ce site n&apos;utilise que des cookies techniques (bon de commande, connexion). Aucun traceur publicitaire ni mesure d&apos;audience tierce.{" "}
        <Link href="/confidentialite" className="link-u">
          En savoir plus
        </Link>
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2">
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
