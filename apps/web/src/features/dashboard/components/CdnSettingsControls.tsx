"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  cacheModeDescription,
  formatTtl,
} from "@/features/dashboard/lib/cdn-settings";
import type {
  CacheMode,
  EdgeSettingsData,
} from "@/features/dashboard/types/edge-settings.types";

const TTL_OPTIONS = [0, 60, 300, 3600, 86400, 604800, 31536000];

interface SettingsControlProps {
  settings: EdgeSettingsData;
  onChange(settings: EdgeSettingsData): void;
}

export function CacheSettingsCard({
  settings,
  onChange,
}: SettingsControlProps) {
  const setTtl = (key: "browserTtl" | "edgeTtl", value: string) =>
    onChange({ ...settings, [key]: Number(value) });
  return (
    <section className="rounded-2xl border border-[var(--hairline)] bg-background/70">
      <div className="border-b border-[var(--hairline)] px-5 py-4">
        <h2 className="text-sm font-semibold">Cache behavior</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Applied by the Multivrs serving Worker on the next request.
        </p>
      </div>
      <div className="grid gap-5 p-5 md:grid-cols-3">
        {(["smart", "aggressive", "bypass"] as CacheMode[]).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => onChange({ ...settings, cacheMode: mode })}
            className="rounded-xl border border-[var(--hairline)] p-4 text-left transition-colors hover:bg-white/[0.025] aria-pressed:border-blue-400/40 aria-pressed:bg-blue-400/[0.05]"
            aria-pressed={settings.cacheMode === mode}
          >
            <span className="text-sm font-medium capitalize">{mode}</span>
            <span className="mt-2 block text-xs leading-5 text-muted-foreground">
              {cacheModeDescription(mode)}
            </span>
          </button>
        ))}
      </div>
      <div className="grid gap-4 border-t border-[var(--hairline)] p-5 md:grid-cols-2">
        <TtlSelect
          label="Browser TTL"
          value={settings.browserTtl}
          onChange={(value) => setTtl("browserTtl", value)}
        />
        <TtlSelect
          label="Edge TTL"
          value={settings.edgeTtl}
          onChange={(value) => setTtl("edgeTtl", value)}
        />
      </div>
    </section>
  );
}

export function CdnTelemetryCard({ settings, onChange }: SettingsControlProps) {
  return (
    <section className="divide-y divide-[var(--hairline)] rounded-2xl border border-[var(--hairline)] bg-background/70">
      <ToggleRow
        label="Web Analytics"
        description="Write request telemetry to Cloudflare Analytics Engine."
        checked={settings.analyticsEnabled}
        onChange={(analyticsEnabled) =>
          onChange({ ...settings, analyticsEnabled })
        }
      />
      <ToggleRow
        label="Speed Insights"
        description="Collect latency and Web Vitals for this project."
        checked={settings.speedInsightsEnabled}
        onChange={(speedInsightsEnabled) =>
          onChange({ ...settings, speedInsightsEnabled })
        }
      />
    </section>
  );
}

function TtlSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange(value: string): void;
}) {
  return (
    <div className="space-y-2 text-xs text-muted-foreground">
      <span>{label}</span>
      <Select value={String(value)} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {TTL_OPTIONS.map((ttl) => (
            <SelectItem key={ttl} value={String(ttl)}>
              {formatTtl(ttl)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange(value: boolean): void;
}) {
  return (
    <div className="flex items-center justify-between gap-6 p-5">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
