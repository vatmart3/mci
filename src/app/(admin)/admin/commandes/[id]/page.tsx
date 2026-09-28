"use client";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import type { AccountDocument, Order, OrderStatus } from "@/lib/types";
import { useData } from "@/lib/hooks/useData";
import { useSession } from "@/lib/store/session";
import { getBackend } from "@/lib/backend";
import { StatusBadge, DemoBadge, Badge, ToConfirm } from "@/components/ui/Badge";
import { OrderTimeline } from "@/components/order/OrderTimeline";
import { PdfButton } from "@/components/pro/OrderActions";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, Textarea } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { nextStatuses, statusLabels, orderTotal } from "@/lib/orders";
import { formatDateTime, formatEur } from "@/lib/format";

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-box bg-white p-4 ring-1 ring-black/5 sm:p-6">
      <h2 className="t-label mb-4">{title}</h2>
      {children}
    </section>
  );
}

export default function AdminOrder({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: order, reload, loading } = useData((b) => b.getOrder(id), [id]);
  const priceMode = useSession((s) => s.settings.priceMode);
  const settingsLead = useSession((s) => s.settings.leadTimeDefault);
  const [prices, setPrices] = useState<string[]>([]);
  const [leadTime, setLeadTime] = useState("");
  const [mciNote, setMciNote] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [docKind, setDocKind] = useState<AccountDocument["kind"]>("bl");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (!order) return;
    setPrices(order.lines.map((l) => (l.unitPriceHt != null ? String(l.unitPriceHt) : "")));
    setLeadTime(order.leadTime ?? settingsLead ?? "");
    setMciNote(order.mciNote ?? "");
  }, [order, settingsLead]);

  if (loading && !order) return <p className="text-sm text-ink/70">Chargement…</p>;
  if (!order) return <p className="rounded-box bg-white p-6 ring-1 ring-black/5">Commande introuvable. <Link href="/admin/commandes" className="link-u">Retour</Link></p>;

  const parsed = prices.map((p) => (p.trim() === "" ? null : Number(p.replace(",", "."))));
  const invalid = parsed.some((p) => p !== null && (!Number.isFinite(p) || p < 0));
  const draftTotal = parsed.every((p) => p != null) ? parsed.reduce<number>((s, p, i) => s + (p ?? 0) * order.lines[i]!.quantity, 0) : null;

  const apply = async (status: OrderStatus) => {
    setBusy(true);
    setMsg(null);
    try {
      const b = await getBackend();
      const o: Order = await b.updateOrderStatus(order.id, { status, note: note || undefined, leadTime, mciNote, prices: parsed });
      setNote("");
      setMsg(o.status !== order.status ? `Statut : ${statusLabels[o.status]} — email envoyé au client.` : "Enregistré.");
      reload();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Erreur");
    } finally {
      setBusy(false);
    }
  };

  const next = nextStatuses(order.status);
  const needsPricing = order.status === "received" && priceMode === "on_request";

  return (
    <div className="space-y-6">
      <Link href="/admin/commandes" className="link-u inline-flex text-sm font-medium">
        ← Commandes
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="t-mono break-all text-[clamp(1.5rem,1.2rem+1.2vw,2.25rem)] font-semibold tracking-[-0.02em] text-ink">{order.number}</h1>
        <StatusBadge status={order.status} />
        {order.customerAcceptedAt ? <Badge tone="ok">PRO-FORMA VALIDÉE PAR LE CLIENT</Badge> : null}
        {order.isDemo ? <DemoBadge /> : null}
        {order.accountId ? <Badge tone="mci">COMPTE PRO</Badge> : <Badge>INVITÉ</Badge>}
      </div>
      <p className="-mt-3 text-sm text-ink/70">Reçue le {formatDateTime(order.createdAt)} · dernière mise à jour {formatDateTime(order.updatedAt)}</p>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Block title="Lignes, prix et délai">
            <div className="relative overflow-x-auto">
              <table className="w-full min-w-[620px] text-sm">
                <thead>
                  <tr className="text-left text-xs text-ink/70">
                    <th className="py-2 pr-2 font-medium">Réf.</th>
                    <th className="py-2 pr-2 font-medium">Désignation</th>
                    <th className="py-2 pr-2 font-medium">Condit.</th>
                    <th className="py-2 pr-2 text-right font-medium">Qté</th>
                    <th className="w-32 py-2 pr-2 text-right font-medium">PU HT (€)</th>
                    <th className="py-2 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.lines.map((l, i) => (
                    <tr key={i} className="border-t border-black/5 align-top transition-colors duration-200 hover:bg-salt/60">
                      <td className="t-code py-2 pr-2 text-mci">{l.code}</td>
                      <td className="py-2 pr-2">
                        {l.name}
                        {l.note ? <span className="block text-xs text-ink/70">Note : {l.note}</span> : null}
                      </td>
                      <td className="py-2 pr-2">{l.packagingLabel}</td>
                      <td className="t-mono py-2 pr-2 text-right">{l.quantity}</td>
                      <td className="py-1 pr-2">
                        <label htmlFor={`pu-${i}`} className="sr-only">
                          Prix unitaire HT {l.code}
                        </label>
                        <Input id={`pu-${i}`} fieldSize="sm" inputMode="decimal" className="t-mono text-right" value={prices[i] ?? ""} onChange={(e) => setPrices((p) => p.map((x, k) => (k === i ? e.target.value : x)))} placeholder="—" />
                      </td>
                      <td className="t-mono py-2 text-right">{parsed[i] != null && Number.isFinite(parsed[i]) ? formatEur(parsed[i]! * l.quantity) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-black/10">
                    <td colSpan={5} className="pr-2 pt-3 text-right text-sm font-medium text-ink/70">
                      Total HT
                    </td>
                    <td className="t-mono pt-3 text-right font-semibold">{draftTotal != null ? formatEur(draftTotal) : orderTotal(order) != null ? formatEur(orderTotal(order)!) : "—"}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            {invalid ? <p className="mt-2 text-sm text-danger">Prix invalide.</p> : null}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="lead">Délai de livraison</Label>
                <Input id="lead" fieldSize="sm" value={leadTime} onChange={(e) => setLeadTime(e.target.value)} placeholder="Ex. sous 72 h ouvrées" />
                {!leadTime ? <p className="mt-1 text-xs"><ToConfirm>[À CONFIRMER] délai par défaut dans Réglages</ToConfirm></p> : null}
              </div>
              <div>
                <Label htmlFor="mcinote">Message au client (visible)</Label>
                <Input id="mcinote" fieldSize="sm" value={mciNote} onChange={(e) => setMciNote(e.target.value)} />
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" className="h-auto! min-h-8 whitespace-normal! py-1.5 text-left" disabled={busy || invalid} onClick={() => apply(order.status)}>
                Enregistrer sans changer le statut
              </Button>
              <PdfButton order={{ ...order, lines: order.lines.map((l, i) => ({ ...l, unitPriceHt: parsed[i] ?? null })), leadTime }} kind="proforma" label="Pro-forma PDF" />
              <PdfButton order={order} kind="bon" label="Bon de commande PDF" />
            </div>
          </Block>

          <Block title="Changer le statut">
            {next.length ? (
              <>
                <Label htmlFor="st-note">Note jointe à l&apos;email (facultatif)</Label>
                <Textarea id="st-note" rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ex. Livraison prévue jeudi matin." />
                <div className="mt-3 flex flex-wrap gap-2">
                  {next.map((s) =>
                    s === "cancelled" ? (
                      <Button key={s} variant="danger" size="sm" disabled={busy} onClick={() => confirm("Annuler cette commande ?") && apply(s)}>
                        Annuler la commande
                      </Button>
                    ) : (
                      <Button key={s} variant="primary" size="sm" disabled={busy || invalid || (s === "confirmed" && needsPricing && parsed.some((p) => p == null))} onClick={() => apply(s)}>
                        <Icon name="arrow" size={16} /> {statusLabels[s]}
                      </Button>
                    ),
                  )}
                </div>
                {needsPricing && parsed.some((p) => p == null) ? <p className="mt-2 text-sm text-ink/70">Mode « sur demande » : renseignez tous les prix avant de confirmer.</p> : null}
              </>
            ) : (
              <p className="text-sm text-ink/70">Commande clôturée.</p>
            )}
            {msg ? (
              <p role="status" className="mt-4 rounded-tech bg-ok/10 px-4 py-3 text-sm text-ok">
                {msg}
              </p>
            ) : null}
          </Block>

          <Block title="Frise">
            <ol className="space-y-3 text-sm">
              {order.events.map((e, i) => (
                <li key={i} className="grid grid-cols-1 gap-0.5 sm:grid-cols-[160px_1fr] sm:gap-3">
                  <span className="t-mono pt-px text-xs text-ink/70">{formatDateTime(e.at)}</span>
                  <span>
                    <strong>{statusLabels[e.status]}</strong>
                    {e.note ? ` — ${e.note}` : ""}
                  </span>
                </li>
              ))}
            </ol>
            <div className="mt-6">
              <OrderTimeline order={order} />
            </div>
          </Block>
        </div>

        <div className="space-y-6">
          <Block title="Client">
            <p className="break-words font-semibold">{order.customer.company}</p>
            <p className="t-mono mt-0.5 text-xs text-ink/70">SIRET {order.customer.siret}</p>
            <p className="mt-2 text-sm">{order.customer.contactName}</p>
            <p className="break-words text-sm">
              <a className="link-u" href={`tel:${order.customer.phone}`}>{order.customer.phone}</a> ·{" "}
              <a className="link-u break-all" href={`mailto:${order.customer.email}`}>{order.customer.email}</a>
            </p>
            <p className="mt-2 text-sm text-ink/70">Type : {order.customer.kind}</p>
            {order.poNumber ? (
              <p className="mt-3 text-sm">
                <span className="text-xs font-medium text-ink/70">Engagement · </span>
                <span className="t-mono">{order.poNumber}</span>
              </p>
            ) : null}
            {order.chorus ? (
              <p className="mt-1 text-sm">
                Chorus Pro{order.chorusServiceCode ? <span className="t-mono"> · {order.chorusServiceCode}</span> : null}
              </p>
            ) : null}
          </Block>
          <Block title="Livraison">
            <p className="text-sm">
              {order.delivery.line1}
              {order.delivery.line2 ? <><br />{order.delivery.line2}</> : null}
              <br />
              {order.delivery.postalCode} {order.delivery.city}
            </p>
            {order.delivery.accessNotes ? <p className="mt-2 text-sm">Accès : {order.delivery.accessNotes}</p> : null}
            {order.deliverySlots ? <p className="mt-1 text-sm">Créneaux : {order.deliverySlots}</p> : null}
            {order.billing ? (
              <p className="mt-3 text-sm">
                <span className="text-xs font-medium text-ink/70">Facturation · </span>
                {order.billing.company}, {order.billing.line1}, {order.billing.postalCode} {order.billing.city}
              </p>
            ) : null}
            {order.comment ? <p className="mt-4 rounded-tech bg-salt px-4 py-3 text-sm">« {order.comment} »</p> : null}
          </Block>
          {order.accountId ? (
            <Block title="Déposer un document (espace pro du client)">
              <form
                className="space-y-3"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!file) return;
                  try {
                    await (await getBackend()).addDocument({ accountId: order.accountId!, orderId: order.id, kind: docKind, name: file.name, url: "", file });
                    setFile(null);
                    (e.target as HTMLFormElement).reset();
                    setMsg("Document déposé dans l'espace pro du client.");
                  } catch (err) {
                    setMsg(err instanceof Error ? err.message : "Dépôt impossible");
                  }
                }}
              >
                <Select fieldSize="sm" aria-label="Type de document" value={docKind} onChange={(e) => setDocKind(e.target.value as AccountDocument["kind"])}>
                  <option value="bl">Bon de livraison</option>
                  <option value="facture">Facture</option>
                  <option value="proforma">Pro-forma</option>
                  <option value="autre">Autre</option>
                </Select>
                <label className="flex cursor-pointer items-center gap-2 rounded-tech bg-salt px-4 py-3 text-sm ring-1 ring-black/5 transition-shadow duration-200 hover:ring-black/20 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-mci">
                  <input type="file" accept="application/pdf,image/*" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                  <Icon name="doc" size={16} />
                  <span className="truncate">{file ? file.name : "Choisir un fichier (PDF, image)"}</span>
                </label>
                <Button type="submit" size="sm" variant="outline" disabled={!file}>
                  <Icon name="download" size={16} className="rotate-180" /> Déposer
                </Button>
              </form>
            </Block>
          ) : null}
        </div>
      </div>
    </div>
  );
}
