"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { AnalyticsProjectPicker } from "@/features/dashboard/components/AnalyticsProjectPicker";
import { DashboardPageHeader } from "@/features/dashboard/components/DashboardPageHeader";
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
    <div className="relative z-10 w-full space-y-6 px-5 py-6">
      <DashboardPageHeader
        title="Analytics"
        description={
          project ? (
            <>Traffic and engagement for {project.name}.</>
          ) : (
            "Traffic and engagement for your project."
          )
        }
        actions={
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
        }
      >
        {!plusEnabled ? (
          <p className="mt-3 text-xs text-muted-foreground">
            Activate Web Analytics Plus in Billing for 30-day reporting and UTM
            attribution.
          </p>
        ) : null}
      </DashboardPageHeader>

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
