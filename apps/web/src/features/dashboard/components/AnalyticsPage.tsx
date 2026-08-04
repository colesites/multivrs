"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { AnalyticsProjectPicker } from "@/features/dashboard/components/AnalyticsProjectPicker";
import type {
  AnalyticsRange,
  PlatformAnalytics,
} from "@/features/dashboard/types/analytics.types";
import type { DashboardProject } from "@/features/dashboard/types/project.types";
import { AnalyticsBreakdowns } from "./AnalyticsBreakdowns";
import { AnalyticsMetrics } from "./AnalyticsMetrics";

const AnalyticsChart = dynamic(() =>
  import("./AnalyticsChart").then((module) => module.AnalyticsChart),
);

interface AnalyticsPageProps {
  username?: string;
  projects?: DashboardProject[];
  project?: DashboardProject;
  analytics?: PlatformAnalytics;
  plusEnabled?: boolean;
}

export function AnalyticsPage({
  username,
  projects,
  project,
  analytics,
  plusEnabled = false,
}: AnalyticsPageProps) {
  if (username && projects && !project) {
    return <AnalyticsProjectPicker username={username} projects={projects} />;
  }

  return (
    <div className="relative z-10 mx-auto max-w-[1400px] space-y-8 px-5 py-7 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pt-4">
        <div>
          <p className="font-geist-mono text-[11px] uppercase tracking-[0.16em] text-blue-400">
            Audience intelligence
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-foreground tracking-tight">
            {project?.name ?? "Analytics"}
          </h2>
          <p className="text-[13px] text-muted-foreground mt-1.5 leading-relaxed">
            Deep insights into your platform&apos;s traffic and engagement.
          </p>
        </div>

        {/* Toggle Controls */}
        <div className="flex items-center gap-4 border-b border-[var(--hairline)]">
          {(
            ["24h", "7d", ...(plusEnabled ? ["30d" as const] : [])] as const
          ).map((range) => (
            <RangeLink
              active={analytics?.range === range}
              key={range}
              range={range}
            />
          ))}
        </div>
        {!plusEnabled ? (
          <p className="text-xs text-muted-foreground">
            Activate Web Analytics Plus in Billing for 30-day reporting and UTM
            attribution.
          </p>
        ) : null}
      </div>

      {analytics?.state !== "ready" && (
        <div className="border-y border-amber-400/20 bg-amber-400/[0.04] px-4 py-3 text-xs text-amber-200">
          {analytics?.state === "error"
            ? "Analytics could not be loaded from Cloudflare. Try again shortly."
            : "Add CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_ANALYTICS_API_TOKEN to load live edge analytics."}
        </div>
      )}
      {analytics && <AnalyticsMetrics data={analytics} />}
      {analytics && <AnalyticsChart points={analytics.series} />}
      {analytics && (
        <AnalyticsBreakdowns
          paths={analytics.paths}
          countries={analytics.countries}
          devices={analytics.devices}
          referrers={analytics.referrers}
          sources={analytics.sources}
        />
      )}
    </div>
  );
}

function RangeLink({
  active,
  range,
}: {
  active: boolean;
  range: AnalyticsRange;
}) {
  return (
    <Link
      className={`flex h-9 items-center rounded-none border-b-2 px-0 text-xs uppercase ${
        active
          ? "border-foreground text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
      href={`?range=${range}`}
      scroll={false}
    >
      {range}
    </Link>
  );
}
