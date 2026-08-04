"use client";

import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { billingRequest } from "@/features/dashboard/lib/billing-api";
import type { BillingScopeSummary } from "@/features/dashboard/types/billing.types";
import { billingUpdatedSchema } from "@/lib/schemas/billing.schemas";

export function BillingSpendControls({
  scope,
  onSaved,
}: {
  scope: BillingScopeSummary;
  onSaved: () => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true);
    void billingRequest(
      "/api/billing/spend",
      "PUT",
      {
        operationId: crypto.randomUUID(),
        overagesEnabled: form.get("overages") === "on",
        scopeId: scope.scopeId,
        spendAlertCents: cents(form.get("alert")),
        spendLimitCents: cents(form.get("limit")),
      },
      billingUpdatedSchema,
    )
      .then(async () => {
        await onSaved();
        toast.success("Usage spend policy updated.");
      })
      .then(
        () => setLoading(false),
        (error: unknown) => {
          toast.error(
            error instanceof Error
              ? error.message
              : "Spend policy update failed.",
          );
          setLoading(false);
        },
      );
  }
  if (!scope.subscriptionId) return null;
  return (
    <form className="border-b border-[var(--hairline)] py-5" onSubmit={save}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium">Paid usage overages</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Hard-stop at the monthly cap. Stripe meters only usage above
            included allowances.
          </p>
        </div>
        <input
          aria-label="Enable paid usage overages"
          defaultChecked={scope.overagesEnabled}
          disabled={!scope.canManage}
          name="overages"
          type="checkbox"
        />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <label
          className="text-xs text-muted-foreground"
          htmlFor="billing-spend-alert"
        >
          Alert at (USD)
          <Input
            className="mt-2"
            defaultValue={money(scope.spendAlertCents)}
            id="billing-spend-alert"
            min="1"
            name="alert"
            placeholder="10.00"
            step="0.01"
            type="number"
          />
        </label>
        <label
          className="text-xs text-muted-foreground"
          htmlFor="billing-spend-limit"
        >
          Hard limit (USD)
          <Input
            className="mt-2"
            defaultValue={money(scope.spendLimitCents)}
            id="billing-spend-limit"
            min="1"
            name="limit"
            placeholder="25.00"
            step="0.01"
            type="number"
          />
        </label>
        <Button
          disabled={loading || !scope.canManage}
          type="submit"
          variant="outline"
        >
          {loading ? "Saving…" : "Save limits"}
        </Button>
      </div>
    </form>
  );
}

function cents(value: FormDataEntryValue | null): number | null {
  if (typeof value !== "string" || !value.trim()) return null;
  return Math.round(Number(value) * 100);
}

function money(value: number | null): string {
  return value === null ? "" : (value / 100).toFixed(2);
}
