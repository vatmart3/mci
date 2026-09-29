"use client";
import { useEffect, useState } from "react";
import type { PriceMode, Settings } from "@/lib/types";
import { useSession } from "@/lib/store/session";
import { getBackend } from "@/lib/backend";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Field";
import { ToConfirm, DemoBadge } from "@/components/ui/Badge";
import { priceModeLabels } from "@/lib/orders";
import { IS_DEMO } from "@/lib/env";
import { cx } from "@/lib/cx";

export default function AdminSettings() {
  const { settings, refresh, user } = useSession();
  const [s, setS] = useState<Settings>(settings);
  const [socialsText, setSocialsText] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => {
    setS(settings);
    setSocialsText(settings.socials.map((x) => `${x.label} | ${x.url}`).join("\n"));
  }, [settings]);

  const save = async () => {
    const socials = socialsText
      .split("\n")
      .map((l) => l.split("|").map((x) => x.trim()))
      .filter(([label, url]) => label && url && /^https:\/\//.test(url))
      .map(([label, url]) => ({ label: label!, url: url! }));
    await (await getBackend()).updateSettings({ ...s, socials });
    await refresh();
    setMsg("Réglages enregistrés.");
  };

  return (
    <div className="max-w-3xl space-y-5">
      <h1 className="t-h2">Réglages</h1>

      <fieldset className="min-w-0 rounded-[8px] border border-rule bg-white">
        <legend className="t-label float-left w-full border-b border-rule px-4 py-3 sm:px-6">Prix</legend>
        <div className="clear-both space-y-2 px-4 py-5 sm:px-6">
          {(Object.keys(priceModeLabels) as PriceMode[]).map((m) => (
            <label
              key={m}
              className={cx(
                "flex cursor-pointer items-start gap-3 rounded-[6px] border px-4 py-3 transition-colors duration-150",
                s.priceMode === m ? "border-mci bg-sky/40" : "border-rule bg-white hover:border-ink/30",
              )}
            >
              <input type="radio" name="pm" className="mt-1 size-4 shrink-0 accent-mci" checked={s.priceMode === m} onChange={() => setS({ ...s, priceMode: m })} />
              <span className="min-w-0">
                <span className="t-mono block text-xs text-ink/70">{m}</span>
                {priceModeLabels[m]}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="grid min-w-0 grid-cols-1 gap-5 rounded-[8px] border border-rule bg-white pb-5">
        <legend className="t-label float-left w-full border-b border-rule px-4 py-3 sm:px-6">Informations publiques</legend>
        <div className="clear-both px-4 sm:px-6">
          <Label htmlFor="st-hours">Horaires {s.hours ? null : <ToConfirm />}</Label>
          <Input id="st-hours" value={s.hours} onChange={(e) => setS({ ...s, hours: e.target.value })} placeholder="Du lundi au vendredi, 8 h – 12 h / 14 h – 17 h" />
          <p className="mt-1.5 text-xs text-ink/70">Vide = masqué côté public (« Appelez-nous »).</p>
        </div>
        <div className="px-4 sm:px-6">
          <Label htmlFor="st-banner">Bandeau d&apos;information</Label>
          <Input id="st-banner" value={s.banner} onChange={(e) => setS({ ...s, banner: e.target.value })} placeholder="Ex. Fermé du 1er au 15 août — commandes traitées au retour" />
        </div>
        <div className="px-4 sm:px-6">
          <Label htmlFor="st-lead">Délai de livraison par défaut {s.leadTimeDefault ? null : <ToConfirm />}</Label>
          <Input id="st-lead" value={s.leadTimeDefault} onChange={(e) => setS({ ...s, leadTimeDefault: e.target.value })} placeholder="Ex. 48 à 72 h ouvrées" />
        </div>
        <div className="px-4 sm:px-6">
          <Label htmlFor="st-socials">Réseaux sociaux (une ligne « Nom | https://… »)</Label>
          <Textarea id="st-socials" rows={3} className="t-mono text-sm" value={socialsText} onChange={(e) => setSocialsText(e.target.value)} placeholder="LinkedIn | https://www.linkedin.com/company/…" />
          <p className="mt-1.5 text-xs text-ink/70">Aucun lien n&apos;est affiché tant que ce champ est vide (les anciens liens pointaient vers les comptes Wix).</p>
        </div>
      </fieldset>

      <fieldset className="grid min-w-0 grid-cols-1 gap-5 rounded-[8px] border border-rule bg-white pb-5">
        <legend className="t-label float-left w-full border-b border-rule px-4 py-3 sm:px-6">Notifications</legend>
        <div className="clear-both px-4 sm:px-6">
          <Label htmlFor="st-notify">Emails qui reçoivent les commandes et demandes (virgules)</Label>
          <Input id="st-notify" value={s.notifyEmails.join(", ")} onChange={(e) => setS({ ...s, notifyEmails: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) })} />
          {!IS_DEMO ? <p className="mt-1.5 text-xs text-ink/70">La variable d&apos;environnement MCI_NOTIFY_EMAILS, si elle est définie, est prioritaire.</p> : null}
        </div>
      </fieldset>

      <div className="sticky bottom-4 z-10 flex flex-wrap items-center gap-4 rounded-[8px] border border-rule bg-white px-4 py-3 shadow-sheet">
        <Button onClick={save}>Enregistrer</Button>
        {msg ? <span role="status" className="text-sm font-medium text-ok">{msg}</span> : null}
      </div>

      {IS_DEMO ? (
        <fieldset className="min-w-0 rounded-[8px] border border-warn/40 bg-warn/10 px-4 py-4 sm:px-6">
          <legend className="t-label float-left mb-3 flex w-full flex-wrap items-center gap-2">
            Données de démonstration <DemoBadge />
          </legend>
          <p className="clear-both text-sm">5 comptes et 12 commandes fictifs, étiquetés DÉMO. Stockés dans ce navigateur uniquement.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                if (!confirm("Réinitialiser toute la démo (commandes, comptes, réglages, produits modifiés) ?")) return;
                await (await getBackend()).resetDemo?.();
                await refresh();
                setMsg("Démo réinitialisée.");
              }}
            >
              Réinitialiser la démo
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={async () => {
                if (!confirm("Supprimer les comptes et commandes DÉMO ? (Les comptes MCI restent.)")) return;
                await (await getBackend()).purgeDemo?.();
                await refresh();
                setMsg("Données DÉMO supprimées.");
              }}
            >
              Supprimer les données DÉMO
            </Button>
          </div>
          <p className="mt-4 break-all text-xs text-ink/70">Connecté en tant que {user?.email}.</p>
        </fieldset>
      ) : null}
    </div>
  );
}
