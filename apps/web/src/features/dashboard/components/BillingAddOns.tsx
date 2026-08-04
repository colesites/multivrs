"use client";

import {
  type BillingAddOnProduct,
  BillingAddOnRow,
} from "@/features/dashboard/components/BillingAddOnRow";
import type { BillingScopeSummary } from "@/features/dashboard/types/billing.types";

const PRODUCTS: BillingAddOnProduct[] = [
  {
    key: "developer_seat",
    label: "Additional developer seats",
    note: "$20 per seat / month",
  },
  {
    key: "speed_insights",
    label: "Speed Insights",
    note: "$10 per enabled project / month",
  },
  {
    key: "web_analytics_plus",
    label: "Web Analytics Plus",
    note: "$10 / month",
  },
  {
    key: "observability_plus",
    label: "Observability Plus",
    note: "$10 / month",
  },
  {
    key: "mail_volume",
    label: "Multivrs Mail Volume",
    note: "$10 per 5,000 email units / month",
  },
];

export function BillingAddOns({
  scope,
  onSaved,
}: {
  scope: BillingScopeSummary;
  onSaved: () => Promise<void>;
}) {
  if (!scope.subscriptionId) {
    return (
      <p className="border-b border-[var(--hairline)] py-5 text-sm text-muted-foreground">
        Upgrade to Pro to activate paid add-ons and metered overages.
      </p>
    );
  }
  return (
    <section aria-label="Billing add-ons">
      {PRODUCTS.filter(
        (product) =>
          scope.scopeId !== "personal" || product.key !== "developer_seat",
      ).map((product) => (
        <BillingAddOnRow
          key={product.key}
          product={product}
          scope={scope}
          onSaved={onSaved}
        />
      ))}
    </section>
  );
}
