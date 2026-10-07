"use client";

import type { PricingPrice, PricingProduct } from "@vrs-pay/js";
import { useState } from "react";
import { useVrsPay } from "./context";
import { usePricing } from "./hooks";
import { type PeriodKey, periodsOf } from "./price-choice";
import { PricingTableView } from "./pricing-table-view";

export interface PricingTableProps {
  /** Show prices in one of their currencies; each price's own by default. */
  currency?: string;
  successUrl?: string;
  cancelUrl?: string;
  /**
   * Called instead of checkout, e.g. to send signed-out visitors to sign up.
   * Without it, choosing a plan opens checkout for the signed-in customer.
   */
  onSelect?: (price: PricingPrice, product: PricingProduct) => void;
  className?: string;
}

/** Your products and prices, with a period switch; choosing one opens checkout. */
export function PricingTable(props: PricingTableProps) {
  const vrs = useVrsPay();
  const { data, error } = usePricing();
  const [chosen, setChosen] = useState<PeriodKey | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const products = data ?? [];
  const periods = periodsOf(products);
  const period = chosen ?? periods[0] ?? null;

  async function choose(price: PricingPrice, product: PricingProduct) {
    if (props.onSelect) return props.onSelect(price, product);
    setBusy(price.id);
    setFailure(null);
    try {
      await vrs.redirectToCheckout({
        price: price.id,
        currency: props.currency,
        successUrl: props.successUrl,
        cancelUrl: props.cancelUrl,
      });
    } catch (e) {
      setFailure(e instanceof Error ? e.message : "Checkout couldn't start.");
      setBusy(null);
    }
  }

  return (
    <PricingTableView
      products={products}
      periods={periods}
      period={period}
      onPeriodChange={setChosen}
      onChoose={(price, product) => void choose(price, product)}
      currency={props.currency}
      busyPrice={busy}
      error={failure ?? error?.message ?? null}
      className={props.className}
    />
  );
}
