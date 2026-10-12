"use client";

import { RefreshCw, Save } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  CacheSettingsCard,
  CdnTelemetryCard,
} from "@/features/dashboard/components/CdnSettingsControls";
import { ContentPlatformManager } from "@/features/dashboard/components/ContentPlatformManager";
import { DashboardPageHeader } from "@/features/dashboard/components/DashboardPageHeader";
import type { ContentPlatformData } from "@/features/dashboard/types/content-platform.types";
import type { EdgeSettingsData } from "@/features/dashboard/types/edge-settings.types";
import { requestOk } from "@/lib/api/request.client";

type ActionState = "idle" | "saving" | "purging" | "success" | "error";

export function CdnPage({
  projectId,
  projectName,
  initialSettings,
  initialContent,
}: {
  projectId: string;
  projectName: string;
  initialSettings: EdgeSettingsData;
  initialContent: ContentPlatformData;
}) {
  const [settings, setSettings] = useState(initialSettings);
  const [state, setState] = useState<ActionState>("idle");
  function request(path: string, method: "PATCH" | "POST") {
    if (state === "saving" || state === "purging") return;
    setState(method === "PATCH" ? "saving" : "purging");
    void requestOk(
      `/api/projects/${projectId}/edge${path}`,
      {
        body: method === "PATCH" ? JSON.stringify(settings) : undefined,
        headers:
          method === "PATCH"
            ? { "content-type": "application/json" }
            : undefined,
        method,
      },
      "Edge configuration failed",
    )
      .then(() => setState("success"))
      .catch(() => setState("error"));
  }
  return (
    <div className="w-full space-y-6 px-5 py-6">
      <DashboardPageHeader
        title="CDN"
        description={<>Cache policy and edge services for {projectName}.</>}
      />
      <CacheSettingsCard settings={settings} onChange={setSettings} />
      <CdnTelemetryCard settings={settings} onChange={setSettings} />
      <div className="flex flex-wrap items-center gap-3">
        <Button
          disabled={state === "saving"}
          onClick={() => request("", "PATCH")}
        >
          <Save className="size-4" />
          {state === "saving" ? "Saving…" : "Save changes"}
        </Button>
        <Button
          variant="outline"
          disabled={state === "purging"}
          onClick={() => request("/purge", "POST")}
        >
          <RefreshCw
            className={state === "purging" ? "size-4 animate-spin" : "size-4"}
          />
          {state === "purging" ? "Purging…" : "Purge cache"}
        </Button>
        {state === "success" && (
          <span className="text-xs text-emerald-400">
            Edge configuration updated.
          </span>
        )}
        {state === "error" && (
          <span className="text-xs text-rose-400">
            The edge request failed. Check Cloudflare configuration.
          </span>
        )}
      </div>
      <ContentPlatformManager
        initialData={initialContent}
        projectId={projectId}
      />
    </div>
  );
}
