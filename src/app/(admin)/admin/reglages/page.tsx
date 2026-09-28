"use client";
import { useEffect, useState } from "react";
import type { PriceMode, Settings } from "@/lib/types";
import { useSession } from "@/lib/store/session";
import { getBackend } from "@/lib/backend";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Field";
import { ToConfirm } from "@/components/ui/Badge";
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
    <div className="max-w-3xl space-y-8">
      <h1 className="t-h2">Réglages</h1>

      <fieldset className="rounded-box border border-rule bg-white p-4 sm:p-6">
        <legend className="t-mono px-1 text-xs text-ink/70">PRIX</legend>
        <div className="space-y-2">
          {(Object.keys(priceModeLabels) as PriceMode[]).map((m) => (
            <label key={m} className={cx("flex cursor-pointer items-start gap-3 rounded-tech border p-3", s.priceMode === m ? "border-ink" : "border-rule")}>
              <input type="radio" name="pm" className="mt-1" checked={s.priceMode === m} onChange={() => setS({ ...s, priceMode: m })} />
              <span>
                <span className="t-mono block text-xs">{m.toUpperCase()}</span>
                {priceModeLabels[m]}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="grid gap-4 rounded-box border border-rule bg-white p-4 sm:p-6">
        <legend className="t-mono px-1 text-xs text-ink/70">INFORMATIONS PUBLIQUES</legend>
        <div>
          <Label htmlFor="st-hours">Horaires {s.hours ? null : <ToConfirm />}</Label>
          <Input id="st-hours" value={s.hours} onChange={(e) => setS({ ...s, hours: e.target.value })} placeholder="Du lundi au vendredi, 8 h – 12 h / 14 h – 17 h" />
          <p className="mt-1 text-xs text-ink/70">Vide = masqué côté public (« Appelez-nous »).</p>
        </div>
        <div>
          <Label htmlFor="st-banner">Bandeau d&apos;information</Label>
          <Input id="st-banner" value={s.banner} onChange={(e) => setS({ ...s, banner: e.target.value })} placeholder="Ex. Fermé du 1er au 15 août — commandes traitées au retour" />
        </div>
        <div>
          <Label htmlFor="st-lead">Délai de livraison par défaut {s.leadTimeDefault ? null : <ToConfirm />}</Label>
          <Input id="st-lead" value={s.leadTimeDefault} onChange={(e) => setS({ ...s, leadTimeDefault: e.target.value })} placeholder="Ex. 48 à 72 h ouvrées" />
        </div>
        <div>
          <Label htmlFor="st-socials">Réseaux sociaux (une ligne « Nom | https://… »)</Label>
          <Textarea id="st-socials" rows={3} className="t-mono text-sm" value={socialsText} onChange={(e) => setSocialsText(e.target.value)} placeholder="LinkedIn | https://www.linkedin.com/company/…" />
          <p className="mt-1 text-xs text-ink/70">Aucun lien n&apos;est affiché tant que ce champ est vide (les anciens liens pointaient vers les comptes Wix).</p>
        </div>
      </fieldset>

      <fieldset className="grid gap-4 rounded-box border border-rule bg-white p-4 sm:p-6">
        <legend className="t-mono px-1 text-xs text-ink/70">NOTIFICATIONS</legend>
        <div>
          <Label htmlFor="st-notify">Emails qui reçoivent les commandes et demandes (virgules)</Label>
          <Input id="st-notify" value={s.notifyEmails.join(", ")} onChange={(e) => setS({ ...s, notifyEmails: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) })} />
          {!IS_DEMO ? <p className="mt-1 text-xs text-ink/70">La variable d&apos;environnement MCI_NOTIFY_EMAILS, si elle est définie, est prioritaire.</p> : null}
        </div>
      </fieldset>

      <div className="flex items-center gap-4">
        <Button onClick={save}>Enregistrer</Button>
        {msg ? <span role="status" className="text-sm text-ok">{msg}</span> : null}
      </div>

      {IS_DEMO ? (
        <fieldset className="rounded-box border border-warn/60 bg-warn/10 p-4 sm:p-6">
          <legend className="t-mono px-1 text-xs">DONNÉES DE DÉMONSTRATION</legend>
          <p className="text-sm">5 comptes et 12 commandes fictifs, étiquetés DÉMO. Stockés dans ce navigateur uniquement.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                if (!confirm("Réinitialiser toute la démo (commandes, comptes, réglages, produits modifiés) ?")) return;
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
                if (!confirm("Supprimer les comptes et commandes DÉMO ? (Les comptes MCI restent.)")) return;
                await (await getBackend()).purgeDemo?.();
                await refresh();
                setMsg("Données DÉMO supprimées.");
              }}
            >
              Supprimer les données DÉMO
            </Button>
          </div>
          <p className="mt-3 text-xs">Connecté en tant que {user?.email}.</p>
        </fieldset>
      ) : null}
    </div>
  );
}
