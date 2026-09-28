"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getBackend, BackendError } from "@/lib/backend";
import { useSession } from "@/lib/store/session";
import { Input, Label, Select, FieldError, Checkbox } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { IS_DEMO } from "@/lib/env";
import { demoCredentials } from "@/data/demo";
import { isValidSiret } from "@/lib/format";
import { cx } from "@/lib/cx";

const loginSchema = z.object({ email: z.string().trim().email("Email invalide"), password: z.string().min(1, "Mot de passe requis") });
const signupSchema = z.object({
  company: z.string().trim().min(2, "Raison sociale requise"),
  siret: z.string().refine(isValidSiret, "SIRET : 14 chiffres"),
  kind: z.enum(["entreprise", "collectivite", "association"]),
  fullName: z.string().trim().min(2, "Nom requis"),
  email: z.string().trim().email("Email invalide"),
  phone: z.string().trim().regex(/^[+\d][\d\s.()-]{7,}$/, "Téléphone invalide"),
  password: z.string().min(8, "8 caractères minimum"),
  line1: z.string().trim().optional(),
  postalCode: z.string().trim().optional(),
  city: z.string().trim().optional(),
  consent: z.literal(true, { message: "Nécessaire à la création du compte" }),
});
type Login = z.infer<typeof loginSchema>;
type Signup = z.infer<typeof signupSchema>;

function LoginForm({ onDone, staff }: { onDone: () => void; staff?: boolean }) {
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<Login>({ resolver: zodResolver(loginSchema) });
  const submit = handleSubmit(async (d) => {
    setError(null);
    try {
      const b = await getBackend();
      await b.signIn(d.email, d.password);
      onDone();
    } catch (e) {
      setError(e instanceof BackendError ? e.message : "Connexion impossible.");
    }
  });
  const demoList = staff ? [demoCredentials.admin, demoCredentials.sales] : [demoCredentials.buyer, demoCredentials.approver, demoCredentials.camping];
  return (
    <form onSubmit={submit} noValidate className="mx-auto w-full max-w-[440px] space-y-5">
      <div>
        <Label htmlFor="li-email" required>
          Email
        </Label>
        <Input id="li-email" type="email" autoComplete="username" {...register("email")} aria-invalid={!!errors.email} />
        <FieldError>{errors.email?.message}</FieldError>
      </div>
      <div>
        <Label htmlFor="li-password" required>
          Mot de passe
        </Label>
        <Input id="li-password" type="password" autoComplete="current-password" {...register("password")} aria-invalid={!!errors.password} />
        <FieldError>{errors.password?.message}</FieldError>
      </div>
      {error ? <p role="alert" className="rounded-tech bg-danger/10 px-4 py-3 text-sm text-danger">{error}</p> : null}
      <Button type="submit" disabled={isSubmitting} className="mt-2 w-full">
        {isSubmitting ? "Connexion…" : "Se connecter"}
      </Button>
      {IS_DEMO ? (
        <div className="rounded-box bg-warn/10 p-4 text-sm">
          <p className="flex flex-wrap items-center gap-2 text-xs text-ink/70">
            <Badge tone="warn">DÉMO</Badge>
            <span>
              Mode démo — comptes fictifs · mot de passe <span className="t-mono text-ink">{demoList[0]!.password}</span>
            </span>
          </p>
          <ul className="mt-3 space-y-1">
            {demoList.map((c) => (
              <li key={c.email} className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 rounded-tech px-2 py-1.5 transition-colors hover:bg-white/70">
                <button
                  type="button"
                  className="link-u text-left font-medium"
                  onClick={() => {
                    setValue("email", c.email);
                    setValue("password", c.password);
                  }}
                >
                  {c.label}
                </button>{" "}
                <span className="t-mono min-w-0 break-all text-xs text-ink/70">{c.email}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </form>
  );
}

function SignupForm({ onDone }: { onDone: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Signup>({ resolver: zodResolver(signupSchema), defaultValues: { kind: "entreprise" } });
  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem("mci:prefill-account");
      if (raw) {
        const p = JSON.parse(raw) as Partial<Signup> & { address?: { line1?: string; postalCode?: string; city?: string } };
        reset({ kind: "entreprise", ...p, line1: p.address?.line1, postalCode: p.address?.postalCode, city: p.address?.city });
      }
    } catch {
      /* ignore */
    }
  }, [reset]);
  const submit = handleSubmit(async (d) => {
    setError(null);
    try {
      const b = await getBackend();
      await b.signUp({
        company: d.company,
        siret: d.siret,
        kind: d.kind,
        fullName: d.fullName,
        email: d.email,
        phone: d.phone,
        password: d.password,
        address: d.line1 && d.postalCode && d.city ? { line1: d.line1, postalCode: d.postalCode, city: d.city, label: "Adresse principale" } : undefined,
      });
      window.sessionStorage.removeItem("mci:prefill-account");
      onDone();
    } catch (e) {
      setError(e instanceof BackendError ? e.message : "Création impossible.");
    }
  });
  const f = (k: keyof Signup) => ({ id: `su-${k}`, "aria-invalid": !!errors[k] });
  return (
    <form onSubmit={submit} noValidate className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Label htmlFor="su-company" required>
          Raison sociale
        </Label>
        <Input autoComplete="organization" {...register("company")} {...f("company")} />
        <FieldError>{errors.company?.message}</FieldError>
      </div>
      <div>
        <Label htmlFor="su-siret" required>
          SIRET
        </Label>
        <Input inputMode="numeric" className="t-mono" {...register("siret")} {...f("siret")} />
        <FieldError>{errors.siret?.message}</FieldError>
      </div>
      <div>
        <Label htmlFor="su-kind" required>
          Type de structure
        </Label>
        <Select id="su-kind" {...register("kind")}>
          <option value="entreprise">Entreprise</option>
          <option value="collectivite">Collectivité / établissement public</option>
          <option value="association">Association</option>
        </Select>
      </div>
      <div>
        <Label htmlFor="su-fullName" required>
          Nom et prénom
        </Label>
        <Input autoComplete="name" {...register("fullName")} {...f("fullName")} />
        <FieldError>{errors.fullName?.message}</FieldError>
      </div>
      <div>
        <Label htmlFor="su-phone" required>
          Téléphone
        </Label>
        <Input type="tel" autoComplete="tel" {...register("phone")} {...f("phone")} />
        <FieldError>{errors.phone?.message}</FieldError>
      </div>
      <div>
        <Label htmlFor="su-email" required>
          Email
        </Label>
        <Input type="email" autoComplete="email" {...register("email")} {...f("email")} />
        <FieldError>{errors.email?.message}</FieldError>
      </div>
      <div>
        <Label htmlFor="su-password" required>
          Mot de passe
        </Label>
        <Input type="password" autoComplete="new-password" {...register("password")} {...f("password")} />
        <FieldError>{errors.password?.message}</FieldError>
      </div>
      <div className="sm:col-span-2 sm:mt-2">
        <p className="mb-4 text-xs font-medium text-ink/70">Livraison (facultatif)</p>
        <Label htmlFor="su-line1">Adresse de livraison principale</Label>
        <Input autoComplete="address-line1" {...register("line1")} id="su-line1" />
      </div>
      <div>
        <Label htmlFor="su-postalCode">Code postal</Label>
        <Input inputMode="numeric" className="t-mono" {...register("postalCode")} id="su-postalCode" />
      </div>
      <div>
        <Label htmlFor="su-city">Ville</Label>
        <Input {...register("city")} id="su-city" />
      </div>
      <div className="rounded-box bg-salt p-4 sm:col-span-2">
        <Checkbox
          id="su-consent"
          {...register("consent")}
          label={
            <span className="text-sm">
              J&apos;accepte que MCI traite ces données pour gérer mon compte et mes commandes (<Link href="/confidentialite" className="link-u">confidentialité</Link>).
            </span>
          }
        />
        <FieldError>{errors.consent?.message}</FieldError>
      </div>
      {error ? <p role="alert" className="rounded-tech bg-danger/10 px-4 py-3 text-sm text-danger sm:col-span-2">{error}</p> : null}
      <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:gap-6">
        <Button type="submit" variant="primary" disabled={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting ? "Création…" : "Créer mon compte pro"}
        </Button>
        <p className="text-sm text-ink/70">Vous pouvez commander tout de suite. MCI valide ensuite votre compte pour l&apos;accès aux tarifs et aux documents.</p>
      </div>
    </form>
  );
}

export function AuthPanel({ staff = false, title }: { staff?: boolean; title?: string }) {
  const params = useSearchParams();
  const router = useRouter();
  const refresh = useSession((s) => s.refresh);
  const [tab, setTab] = useState<"login" | "signup">(params.get("creer") ? "signup" : "login");
  const done = async () => {
    await refresh();
    const retour = params.get("retour");
    if (retour && retour.startsWith("/")) router.push(retour);
  };
  return (
    <div className="mx-auto w-full max-w-[820px]">
      <div className="text-center">
        {staff ? <p className="t-eyebrow mb-3 text-mci">Back-office</p> : null}
        <h1 className={staff ? "t-h2" : "t-h1"}>{title ?? (tab === "login" ? "Espace pro" : "Créer un compte pro")}</h1>
        {staff ? null : (
          <p className="t-lead mx-auto mt-5 max-w-[46ch] text-ink/70">Suivi des commandes, « Recommander » en un clic, listes favorites, fiches techniques, pro-formas, bons de livraison et factures.</p>
        )}
      </div>
      <div className={cx("mt-10 rounded-tile bg-white p-5 shadow-tile ring-1 ring-black/5 sm:p-10 lg:mt-12", staff ? "mx-auto max-w-[560px]" : null)}>
        {staff ? null : (
          <div className="mx-auto mb-8 flex w-full max-w-[440px] rounded-full bg-salt p-1" role="tablist">
            {(["login", "signup"] as const).map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={tab === t}
                type="button"
                onClick={() => setTab(t)}
                className={cx(
                  "h-10 min-w-0 flex-1 rounded-full px-3 text-sm font-medium transition-[background-color,color,box-shadow] duration-300 ease-out",
                  tab === t ? "bg-white text-ink shadow-sheet" : "text-ink/70 hover:text-ink",
                )}
              >
                {t === "login" ? "Se connecter" : "Créer un compte"}
              </button>
            ))}
          </div>
        )}
        {tab === "login" || staff ? <LoginForm onDone={done} staff={staff} /> : <SignupForm onDone={done} />}
      </div>
    </div>
  );
}
