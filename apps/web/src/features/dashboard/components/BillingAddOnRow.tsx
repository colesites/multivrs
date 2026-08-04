"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { billingRequest } from "@/features/dashboard/lib/billing-api";
import type { BillingScopeSummary } from "@/features/dashboard/types/billing.types";
import type { AddOnKey } from "@/lib/payments/billing.types";
import { billingUpdatedSchema } from "@/lib/schemas/billing.schemas";

export type BillingAddOnProduct = {
  key: AddOnKey;
  label: string;
  note: string;
};

export function BillingAddOnRow({
  product,
  scope,
  onSaved,
}: {
  product: BillingAddOnProduct;
  scope: BillingScopeSummary;
  onSaved: () => Promise<void>;
}) {
  const current = scope.addOns.find((item) => item.key === product.key);
  const [quantity, setQuantity] = useState(current?.quantity ?? 0);
  const [projectIds, setProjectIds] = useState(current?.projectIds ?? []);
  const [loading, setLoading] = useState(false);
  const isSpeed = product.key === "speed_insights";
  function save() {
    setLoading(true);
    void billingRequest(
      "/api/billing/add-ons",
      "PUT",
      {
        addOn: product.key,
        operationId: crypto.randomUUID(),
        projectIds: isSpeed ? projectIds : [],
        quantity: isSpeed ? projectIds.length : quantity,
        scopeId: scope.scopeId,
      },
      billingUpdatedSchema,
    ).then(
      async () => {
        await onSaved();
        toast.success(`${product.label} updated.`);
        setLoading(false);
      },
      (error: unknown) => {
        toast.error(
          error instanceof Error ? error.message : "Add-on update failed.",
        );
        setLoading(false);
      },
    );
  }
  return (
    <div className="border-b border-[var(--hairline)] py-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium">{product.label}</p>
          <p className="mt-1 text-xs text-muted-foreground">{product.note}</p>
        </div>
        <div className="flex items-center gap-2">
          {!isSpeed ? (
            <Input
              className="w-20"
              min={0}
              onChange={(event) => setQuantity(Number(event.target.value))}
              type="number"
              value={quantity}
            />
          ) : null}
          <Button
            disabled={loading || !scope.canManage}
            onClick={save}
            size="sm"
            variant="outline"
          >
            {loading ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
      {isSpeed ? (
        <ProjectChecks
          onChange={setProjectIds}
          projects={scope.projects}
          selected={projectIds}
        />
      ) : null}
    </div>
  );
}

function ProjectChecks({
  onChange,
  projects,
  selected,
}: {
  onChange: (ids: string[]) => void;
  projects: BillingScopeSummary["projects"];
  selected: string[];
}) {
  const selectedIds = new Set(selected);
  return (
    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
      {projects.map((project) => (
        <label
          className="flex items-center gap-2 text-xs text-muted-foreground"
          key={project.id}
        >
          <input
            checked={selectedIds.has(project.id)}
            onChange={(event) =>
              onChange(
                event.target.checked
                  ? [...selected, project.id]
                  : selected.filter((id) => id !== project.id),
              )
            }
            type="checkbox"
          />
          {project.name}
        </label>
      ))}
    </div>
  );
}
