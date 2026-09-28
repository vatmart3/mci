import type { ComponentProps, ReactNode } from "react";
import { cx } from "@/lib/cx";

export const inputClass =
  "w-full h-12 px-3 bg-white border border-rule rounded-tech text-base text-ink placeholder:text-ink/60 " +
  "transition-[border-color] duration-200 ease-out hover:border-ink/40 focus:border-mci focus:outline-2 focus:outline-mci/30 focus:outline-offset-0 " +
  "aria-[invalid=true]:border-danger";

export function Label({ children, htmlFor, required, className }: { children: ReactNode; htmlFor?: string; required?: boolean; className?: string }) {
  return (
    <label htmlFor={htmlFor} className={cx("block mb-2 text-sm font-semibold text-ink", className)}>
      {children}
      {required ? <span className="text-danger" aria-hidden="true"> *</span> : null}
      {required ? <span className="sr-only"> (obligatoire)</span> : null}
    </label>
  );
}

export function Input({ className, ...rest }: ComponentProps<"input">) {
  return <input className={cx(inputClass, className)} {...rest} />;
}

export function Textarea({ className, ...rest }: ComponentProps<"textarea">) {
  return <textarea className={cx(inputClass, "h-auto min-h-24 py-3 leading-normal", className)} {...rest} />;
}

export function Select({ className, children, ...rest }: ComponentProps<"select">) {
  return (
    <span className="relative block">
      <select className={cx(inputClass, "appearance-none pr-8 cursor-pointer", className)} {...rest}>
        {children}
      </select>
      <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
        <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    </span>
  );
}

export function FieldError({ id, children }: { id?: string; children?: ReactNode }) {
  if (!children) return null;
  return (
    <p id={id} role="alert" className="mt-1 text-sm text-danger">
      {children}
    </p>
  );
}

export function Hint({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <p id={id} className="mt-1 text-sm text-ink/70">
      {children}
    </p>
  );
}

export function Checkbox({ label, className, id, ...rest }: ComponentProps<"input"> & { label: ReactNode }) {
  return (
    <label htmlFor={id} className={cx("flex items-start gap-3 cursor-pointer text-base", className)}>
      <input
        id={id}
        type="checkbox"
        className="mt-1 size-4 shrink-0 appearance-none border border-ink rounded-tech bg-white checked:bg-mci checked:border-mci cursor-pointer bg-center bg-no-repeat checked:bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2016%2016%22%3E%3Cpath%20d=%22M3.5%208.5l3%203%206-7%22%20fill=%22none%22%20stroke=%22white%22%20stroke-width=%222%22/%3E%3C/svg%3E')]"
        {...rest}
      />
      <span>{label}</span>
    </label>
  );
}
