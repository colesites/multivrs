"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { DashboardFirewallRule } from "@/features/dashboard/types/firewall-rule.types";
import { requestOk } from "@/lib/api/request.client";

export function FirewallRuleRows({
  projectId,
  rules,
}: {
  projectId: string;
  rules: DashboardFirewallRule[];
}) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string>();
  const [error, setError] = useState<string>();
  const mutate = (rule: DashboardFirewallRule, method: "PATCH" | "DELETE") => {
    if (pendingId) return;
    setPendingId(rule.id);
    setError(undefined);
    void requestOk(
      `/api/projects/${projectId}/firewall/${rule.id}`,
      {
        body:
          method === "PATCH"
            ? JSON.stringify({ enabled: !rule.enabled })
            : undefined,
        headers:
          method === "PATCH"
            ? { "content-type": "application/json" }
            : undefined,
        method,
      },
      "Firewall update failed",
    )
      .then(() => router.refresh())
      .catch(() =>
        setError(
          `Could not ${method === "PATCH" ? "update" : "delete"} ${rule.name}.`,
        ),
      )
      .finally(() => setPendingId(undefined));
  };
  return (
    <div className="divide-y divide-[var(--hairline)] border-b border-[var(--hairline)]">
      {rules.map((rule) => (
        <div
          key={rule.id}
          className="grid items-center gap-4 px-4 py-4 md:grid-cols-[minmax(12rem,1fr)_8rem_minmax(14rem,1.5fr)_auto]"
        >
          <div>
            <p className="text-sm font-medium text-foreground">{rule.name}</p>
            <p className="mt-1 font-geist-mono text-[10px] text-muted-foreground">
              Priority {rule.priority + 1}
            </p>
          </div>
          <span className="w-fit rounded-md border border-[var(--hairline)] px-2 py-1 font-geist-mono text-[10px] uppercase text-blue-300">
            {rule.action.replace("_", " ")}
          </span>
          <p className="truncate font-geist-mono text-xs text-muted-foreground">
            {rule.conditions
              .map(
                (condition) =>
                  `${condition.type} ${condition.op} ${Array.isArray(condition.value) ? condition.value.join(", ") : condition.value}`,
              )
              .join(" · ")}
          </p>
          <div className="flex items-center justify-end gap-3">
            <Switch
              checked={rule.enabled}
              disabled={pendingId === rule.id}
              onCheckedChange={() => mutate(rule, "PATCH")}
              aria-label={`Toggle ${rule.name}`}
            />
            <Button
              variant="ghost"
              size="icon"
              disabled={pendingId === rule.id}
              onClick={() => mutate(rule, "DELETE")}
              aria-label={`Delete ${rule.name}`}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      ))}
      {!rules.length && (
        <p className="px-4 py-12 text-center text-sm text-muted-foreground">
          No custom rules. Traffic is allowed by default.
        </p>
      )}
      {error && <p className="px-4 py-3 text-xs text-rose-400">{error}</p>}
    </div>
  );
}
