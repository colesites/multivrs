"use client";

import type { CustomerOverview, Entitlements, PricingProduct } from "@vrs-pay/js";
import { useCallback, useEffect, useRef, useState } from "react";
import { useVrsPay } from "./context";

export interface Loaded<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
  reload: () => void;
}

/**
 * Runs `load` when it changes, keeping the latest result and error. A reload
 * keeps showing the old data until the new answer arrives; only the newest
 * run's answer is kept.
 */
function useLoad<T>(load: () => Promise<T>): Loaded<T> {
  const [state, setState] = useState<{ data: T | null; error: Error | null }>({
    data: null,
    error: null,
  });
  const latest = useRef(0);
  const run = useCallback(() => {
    const ticket = ++latest.current;
    load()
      .then((data) => ticket === latest.current && setState({ data, error: null }))
      .catch(
        (error: unknown) =>
          ticket === latest.current &&
          setState({
            data: null,
            error: error instanceof Error ? error : new Error(String(error)),
          }),
      );
  }, [load]);
  useEffect(() => {
    run();
    return () => {
      latest.current++;
    };
  }, [run]);
  return { ...state, loading: state.data === null && state.error === null, reload: run };
}

/** Active products and prices, for your own pricing page. */
export function usePricing(): Loaded<PricingProduct[]> {
  const vrs = useVrsPay();
  return useLoad(useCallback(() => vrs.pricing(), [vrs]));
}

/** The signed-in customer's subscriptions, invoices and entitlements. */
export function useCustomer(): Loaded<CustomerOverview> {
  const vrs = useVrsPay();
  return useLoad(useCallback(() => vrs.customer(), [vrs]));
}

export function useEntitlements(): Loaded<Entitlements> {
  const vrs = useVrsPay();
  return useLoad(useCallback(() => vrs.entitlements(), [vrs]));
}

/** Whether the customer has `feature`: true, or a limit above zero. */
export function useFeature(feature: string) {
  const { data, error, loading, reload } = useEntitlements();
  const value = data?.features[feature];
  const granted = value === true || (typeof value === "number" && value > 0);
  return { granted, limit: typeof value === "number" ? value : null, loading, error, reload };
}
