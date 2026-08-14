import { Activity, CircleGauge, MousePointerClick, Timer } from "lucide-react";
import Link from "next/link";
import type {
  WebVitalMetric,
  WebVitalsData,
} from "@/features/dashboard/types/analytics.types";

const META = {
  CLS: { description: "Visual stability", icon: Activity, unit: "" },
  INP: {
    description: "Interaction responsiveness",
    icon: MousePointerClick,
    unit: " ms",
  },
  LCP: {
    description: "Largest content render",
    icon: CircleGauge,
    unit: " ms",
  },
  TTFB: { description: "Initial server response", icon: Timer, unit: " ms" },
} as const;

export function SpeedInsightsPage({
  projectName,
  vitals,
}: {
  projectName: string;
  vitals: WebVitalsData;
}) {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-5 py-8">
      <header>
        <p className="font-geist-mono text-[10px] uppercase tracking-[0.16em] text-purple-400">
          Real-user monitoring
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Speed Insights
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Core Web Vitals collected from real visits to {projectName}.
        </p>
        <nav className="mt-5 flex w-fit gap-4 border-b border-[var(--hairline)]">
          {(["24h", "7d", "30d"] as const).map((range) => (
            <Link
              className={`border-b-2 pb-2 text-xs uppercase ${
                range === vitals.range
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground"
              }`}
              href={`?range=${range}`}
              key={range}
              scroll={false}
            >
              {range}
            </Link>
          ))}
        </nav>
      </header>
      {vitals.state !== "ready" && <InsightState state={vitals.state} />}
      <section className="grid border-y border-[var(--hairline)] md:grid-cols-2 xl:grid-cols-4">
        {(Object.keys(META) as WebVitalMetric["name"][]).map((name) => {
          const metric = vitals.metrics.find((item) => item.name === name);
          const meta = META[name];
          return (
            <article
              key={name}
              className="border-b border-[var(--hairline)] p-5 md:border-r xl:border-b-0"
            >
              <div className="flex items-center justify-between">
                <div className="flex size-8 items-center justify-center rounded-lg border border-[var(--hairline)]">
                  <meta.icon className="size-4 text-purple-400" />
                </div>
              </div>
              <p className="mt-6 text-3xl font-semibold tracking-tight">
                {metric ? `${formatValue(metric)}${meta.unit}` : "—"}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {meta.description}
              </p>
              <p className="mt-5 font-geist-mono text-[10px] uppercase tracking-wider text-emerald-400">
                {metric
                  ? `${metric.goodRate.toFixed(0)}% good · ${metric.samples} samples`
                  : "Waiting for visits"}
              </p>
            </article>
          );
        })}
      </section>
      <section className="grid border-y border-[var(--hairline)] lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="py-5 lg:border-r lg:border-[var(--hairline)] lg:pr-6">
          <h2 className="text-sm font-medium">Performance by route</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-xs">
              <thead className="text-muted-foreground">
                <tr className="border-b border-[var(--hairline)]">
                  <th className="pb-3 font-medium">Route</th>
                  <th className="pb-3 font-medium">LCP</th>
                  <th className="pb-3 font-medium">INP</th>
                  <th className="pb-3 font-medium">CLS</th>
                  <th className="pb-3 text-right font-medium">Samples</th>
                </tr>
              </thead>
              <tbody>
                {vitals.routes.map((route) => (
                  <tr
                    className="border-b border-[var(--hairline)]"
                    key={route.path}
                  >
                    <td className="max-w-64 truncate py-3 font-geist-mono">
                      {route.path}
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {milliseconds(route.metrics.LCP)}
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {milliseconds(route.metrics.INP)}
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {route.metrics.CLS?.toFixed(3) ?? "—"}
                    </td>
                    <td className="py-3 text-right text-muted-foreground">
                      {route.samples.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!vitals.routes.length ? (
              <p className="py-10 text-center text-xs text-muted-foreground">
                Route performance appears after real visits.
              </p>
            ) : null}
          </div>
        </div>
        <div className="py-5 lg:pl-6">
          <h2 className="text-sm font-medium">Devices</h2>
          <div className="mt-4 divide-y divide-[var(--hairline)]">
            {vitals.devices.map((device) => (
              <div
                className="flex justify-between py-3 text-xs"
                key={device.label}
              >
                <span className="capitalize text-muted-foreground">
                  {device.label}
                </span>
                <span className="font-geist-mono">
                  {device.requests.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
      <p className="text-xs leading-5 text-muted-foreground">
        Multivrs injects a small first-party measurement script into served
        HTML. No third-party analytics script or mock data is used.
      </p>
    </div>
  );
}

function milliseconds(value: number | undefined): string {
  return value === undefined ? "—" : `${Math.round(value).toLocaleString()} ms`;
}

function formatValue(metric: WebVitalMetric): string {
  return metric.name === "CLS"
    ? metric.value.toFixed(3)
    : Math.round(metric.value).toLocaleString();
}

function InsightState({ state }: { state: WebVitalsData["state"] }) {
  return (
    <div className="border-y border-amber-400/20 bg-amber-400/[0.04] px-4 py-3 text-xs text-amber-200">
      {state === "locked"
        ? "Activate Speed Insights for this project from Billing to collect and query Web Vitals."
        : state === "error"
          ? "Web Vitals could not be loaded from Cloudflare."
          : "Configure Cloudflare Analytics Engine to collect live Web Vitals."}
    </div>
  );
}
