"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { DashboardEmailRoute } from "@/features/dashboard/types/email-route.types";
import { requestOk } from "@/lib/api/request.client";

export function EmailRouteRows({ routes }: { routes: DashboardEmailRoute[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string>();
  const [error, setError] = useState<string>();
  function mutate(route: DashboardEmailRoute, method: "DELETE" | "PATCH") {
    if (pendingId) return;
    setPendingId(route.id);
    setError(undefined);
    void requestOk(
      `/api/email-routes/${route.id}`,
      {
        body:
          method === "PATCH"
            ? JSON.stringify({ enabled: !route.enabled })
            : undefined,
        headers:
          method === "PATCH"
            ? { "content-type": "application/json" }
            : undefined,
        method,
      },
      "Route update failed",
    )
      .then(() => router.refresh())
      .catch(() => setError(`Could not update ${route.source}.`))
      .finally(() => setPendingId(undefined));
  }
  return (
    <div className="divide-y divide-[var(--hairline)]">
      {routes.map((route) => (
        <div
          key={route.id}
          className="grid items-center gap-4 px-5 py-4 md:grid-cols-[1fr_auto_1fr_auto]"
        >
          <span className="text-sm font-medium">{route.source}</span>
          <span className="font-geist-mono text-xs text-muted-foreground">
            forwards to
          </span>
          <span className="truncate text-sm text-muted-foreground">
            {route.destination}
          </span>
          <div className="flex items-center gap-3">
            <Switch
              checked={route.enabled}
              disabled={pendingId === route.id}
              onCheckedChange={() => mutate(route, "PATCH")}
              aria-label={`Toggle ${route.source}`}
            />
            <Button
              aria-label={`Delete ${route.source}`}
              disabled={pendingId === route.id}
              onClick={() => mutate(route, "DELETE")}
              size="icon"
              variant="ghost"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      ))}
      {!routes.length && (
        <p className="px-5 py-12 text-center text-sm text-muted-foreground">
          No forwarding routes yet.
        </p>
      )}
      {error && <p className="px-5 py-3 text-xs text-rose-400">{error}</p>}
    </div>
  );
}
