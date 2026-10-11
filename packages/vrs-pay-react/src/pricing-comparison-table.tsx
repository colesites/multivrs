"use client";

import { formatPrice } from "@vrs-pay/js";
import { useMemo, useState } from "react";
import { useVrsPay } from "./context";
import { usePricing } from "./hooks";
import type { VrsAppearance } from "./appearance";
import {
  type ComparisonPlan,
  type ComparisonSection,
  type PricingComparisonTableClassNames,
  PricingComparisonTableView,
} from "./pricing-comparison-table-view";

export interface PricingComparisonTableProps {
  /** Custom plans to compare, or inferred from loaded VRS Pay products if omitted. */
  plans?: ComparisonPlan[];
  /** Grouped sections and feature rows. */
  sections: ComparisonSection[];
  /** Currency to show prices in (defaults to product currency). */
  currency?: string;
  successUrl?: string;
  cancelUrl?: string;
  /** Custom plan selection callback, e.g. for custom signup/contact flows. */
  onSelect?: (plan: ComparisonPlan) => void;
  appearance?: VrsAppearance;
  classNames?: PricingComparisonTableClassNames;
  className?: string;
}

/**
 * Connected feature comparison matrix table.
 * Fetches products from VRS Pay or uses explicit plan definitions.
 */
export function PricingComparisonTable(props: PricingComparisonTableProps) {
  const vrs = useVrsPay();
  const { data: products } = usePricing();
  const [busyPlan, setBusyPlan] = useState<string | null>(null);

  // Fallback to VRS Pay products if explicit plans weren't passed
  const resolvedPlans = useMemo<ComparisonPlan[]>(() => {
    if (props.plans && props.plans.length > 0) return props.plans;
    if (!products || products.length === 0) return [];

    return products.map((product) => {
      const price = product.prices[0];
      return {
        id: product.id,
        name: product.name,
        price: price ? formatPrice(price, props.currency) : undefined,
        description: product.description ?? undefined,
        ctaText: price?.interval === "one_time" ? "Buy" : "Subscribe",
      };
    });
  }, [props.plans, products, props.currency]);

  async function handleChoose(plan: ComparisonPlan) {
    if (props.onSelect) {
      props.onSelect(plan);
      return;
    }

    const matchedProduct = products?.find((p) => p.id === plan.id);
    const priceId = matchedProduct?.prices[0]?.id;

    if (!priceId) {
      return;
    }

    setBusyPlan(plan.id);
    try {
      await vrs.redirectToCheckout({
        price: priceId,
        currency: props.currency,
        successUrl: props.successUrl,
        cancelUrl: props.cancelUrl,
      });
    } catch {
      setBusyPlan(null);
    }
  }

  return (
    <PricingComparisonTableView
      plans={resolvedPlans}
      sections={props.sections}
      onChoose={(plan) => void handleChoose(plan)}
      busyPlanId={busyPlan}
      appearance={props.appearance}
      classNames={props.classNames}
      className={props.className}
    />
  );
}
