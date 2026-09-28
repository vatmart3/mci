import type { ContainerKind } from "@/lib/types";

/**
 * Silhouettes 2D des 6 contenants (trait technique) : repli quand un packshot manque
 * ou quand WebGL est indisponible. Mêmes proportions que les modèles 3D.
 */
const shapes: Record<ContainerKind, React.ReactNode> = {
  aerosol: (
    <>
      <path d="M38 34h24v6H38z" />
      <path d="M44 22h12v12H44zM50 22v-6h8" />
      <path d="M34 40h32v84a4 4 0 0 1-4 4H38a4 4 0 0 1-4-4z" />
      <path d="M34 60h32M34 108h32" />
    </>
  ),
  spray: (
    <>
      <path d="M40 30h18l14 8v6H62l-4-6H40z" />
      <path d="M44 38v8h12v-8" />
      <path d="M40 46h20l6 14v62a6 6 0 0 1-6 6H40a6 6 0 0 1-6-6V60z" />
      <path d="M34 72h32M34 108h32" />
    </>
  ),
  can5: (
    <>
      <path d="M58 26h10v8H58z" />
      <path d="M26 40c0-4 3-6 6-6h40l6 8v80a6 6 0 0 1-6 6H32a6 6 0 0 1-6-6z" />
      <path d="M34 34v-6h16v6" />
      <path d="M26 66h52M26 110h52" />
    </>
  ),
  jerrican20: (
    <>
      <path d="M66 20h10v8H66z" />
      <path d="M18 34h62l6 8v82a4 4 0 0 1-4 4H22a4 4 0 0 1-4-4z" />
      <path d="M26 34V24h28v10M32 34v-6h16v6" />
      <path d="M18 64h68M18 112h68" />
    </>
  ),
  bucket: (
    <>
      <path d="M22 44h56l-6 80a4 4 0 0 1-4 4H32a4 4 0 0 1-4-4z" />
      <path d="M20 38h60v6H20z" />
      <path d="M24 44c0-24 52-24 52 0" />
      <path d="M25 70h50M27 104h46" />
    </>
  ),
  cartridge: (
    <>
      <path d="M40 20h20v8H40zM46 12h8v8h-8z" />
      <path d="M38 28h24v96H38z" />
      <path d="M38 50h24M38 104h24M44 124v6h12v-6" />
    </>
  ),
};

export function Silhouette({ kind, className, label }: { kind: ContainerKind; className?: string; label?: string }) {
  return (
    <svg viewBox="0 0 100 140" className={className} fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden={label ? undefined : true} role={label ? "img" : undefined}>
      {label ? <title>{label}</title> : null}
      {shapes[kind]}
    </svg>
  );
}
