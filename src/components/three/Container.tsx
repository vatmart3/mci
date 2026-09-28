"use client";
import { useEffect, useMemo, useState } from "react";
import type { ContainerKind, Product } from "@/lib/types";
import { familyBySlug } from "@/data/families";
import { buildContainer, type LabelSpec } from "./containers";
import { ensureFonts } from "./label";

export function labelFor(product: Pick<Product, "code" | "short" | "families" | "packagings" | "properties">, packShort?: string): LabelSpec {
  return {
    code: product.code,
    short: product.short,
    family: familyBySlug.get(product.families[0]!)?.name ?? "",
    packShort: packShort ?? product.packagings[0]?.short ?? "",
    biocide: product.properties.includes("biocide"),
  };
}

export function useFontsReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let alive = true;
    void ensureFonts().then(() => alive && setReady(true));
    return () => {
      alive = false;
    };
  }, []);
  return ready;
}

/** Contenant 3D étiqueté. Centré : pied à y = -height/2. */
export function Container({
  kind,
  label,
  quality = "high",
  shadows = false,
  center = true,
}: {
  kind: ContainerKind;
  label: LabelSpec | null;
  quality?: "low" | "high";
  shadows?: boolean;
  center?: boolean;
}) {
  const key = JSON.stringify(label);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const built = useMemo(() => buildContainer(kind, label, { quality, shadows }), [kind, key, quality, shadows]);
  useEffect(() => () => built.dispose(), [built]);
  return <primitive object={built.group} position={[0, center ? -built.height / 2 : 0, 0]} />;
}

export function containerForProduct(p: Pick<Product, "container">, packContainer?: ContainerKind): ContainerKind {
  return packContainer ?? p.container;
}
