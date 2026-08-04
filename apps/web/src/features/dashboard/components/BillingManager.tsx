"use client";

import { CreditCard } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { BillingAddOns } from "@/features/dashboard/components/BillingAddOns";
import { BillingInvoices } from "@/features/dashboard/components/BillingInvoices";
import { BillingSpendControls } from "@/features/dashboard/components/BillingSpendControls";
import { billingRequest } from "@/features/dashboard/lib/billing-api";
import type { BillingOverview } from "@/features/dashboard/types/billing.types";
import {
  billingOverviewSchema,
  billingPortalResponseSchema,
} from "@/lib/schemas/billing.schemas";

export function BillingManager({ initial }: { initial: BillingOverview }) {
  const [overview, setOverview] = useState(initial);
  const [scopeId, setScopeId] = useState(
    initial.scopes[0]?.scopeId ?? "personal",
  );
  const [portalLoading, setPortalLoading] = useState(false);
  const scope =
    overview.scopes.find((item) => item.scopeId === scopeId) ??
    overview.scopes[0];

  async function refresh() {
    const response = await fetch("/api/billing/overview");
    if (!response.ok) throw new Error("Could not refresh billing details.");
    setOverview(billingOverviewSchema.parse(await response.json()));
  }

  function openPortal() {
    if (!scope || portalLoading) return;
    setPortalLoading(true);
    void billingRequest(
      "/api/billing/portal",
      "POST",
      { scopeId: scope.scopeId },
      billingPortalResponseSchema,
    ).then(
      (response) => {
        setPortalLoading(false);
        window.location.assign(response.url);
      },
      (error: unknown) => {
        toast.error(
          error instanceof Error ? error.message : "Could not open billing.",
        );
        setPortalLoading(false);
      },
    );
  }

  if (!scope) return null;
  return (
    <section
      className="overflow-hidden rounded-2xl border border-(--hairline) bg-background/70"
      aria-labelledby="billing-title"
    >
      <div className="flex flex-col gap-4 border-b border-(--hairline) px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold" id="billing-title">
            Billing and usage controls
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Manage paid products, metered overages, invoices, and hard spend
            limits.
          </p>
        </div>
        {scope.canManage && scope.subscriptionId ? (
          <Button
            disabled={portalLoading}
            onClick={openPortal}
            variant="outline"
          >
            {portalLoading ? "Opening…" : "Manage payment method"}
          </Button>
        ) : null}
      </div>
      <div className="p-5">
        <label
          className="text-xs text-muted-foreground"
          htmlFor="billing-scope"
        >
          Billing scope
        </label>
        <select
          className="mt-2 flex h-10 w-full max-w-sm rounded-md border border-input bg-transparent px-3 text-sm"
          id="billing-scope"
          onChange={(event) => setScopeId(event.target.value)}
          value={scope.scopeId}
        >
          {overview.scopes.map((item) => (
            <option key={item.scopeId} value={item.scopeId}>
              {item.name}
            </option>
          ))}
        </select>
        <div className="mt-6 flex items-end justify-between border-y border-(--hairline) py-5">
          <div>
            <p className="text-sm font-medium capitalize">{scope.plan} plan</p>
            <p className="mt-1 text-xs text-muted-foreground capitalize">
              {scope.status}
            </p>
          </div>
          <p className="font-geist-mono text-sm">
            Usage estimate ${(scope.estimatedUsageCents / 100).toFixed(2)}
          </p>
        </div>
        <BillingAddOns
          key={`addons-${scope.scopeId}`}
          scope={scope}
          onSaved={refresh}
        />
        <BillingSpendControls
          key={`spend-${scope.scopeId}`}
          scope={scope}
          onSaved={refresh}
        />
        <BillingInvoices invoices={scope.invoices} />
      </div>
    </section>
  );
}
