"use client";
import { useCallback, useEffect, useState } from "react";
import { getBackend, type Backend } from "@/lib/backend";

/** Charge des données depuis le backend actif ; se rafraîchit à chaque modification (démo) ou sur demande. */
export function useData<T>(fn: (b: Backend) => Promise<T>, deps: unknown[]): { data: T | undefined; error: string | null; loading: boolean; reload: () => void } {
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  const reload = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    void getBackend()
      .then(fn)
      .then((d) => {
        if (!alive) return;
        setData(d);
        setError(null);
      })
      .catch((e: unknown) => alive && setError(e instanceof Error ? e.message : "Erreur de chargement"))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  useEffect(() => {
    const on = () => reload();
    window.addEventListener("mci-demo:change", on);
    return () => window.removeEventListener("mci-demo:change", on);
  }, [reload]);

  return { data, error, loading, reload };
}
