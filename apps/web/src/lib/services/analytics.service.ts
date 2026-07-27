import "server-only";
import { z } from "zod";
import type {
  AnalyticsBreakdownItem,
  AnalyticsPoint,
  PlatformAnalytics,
  WebVitalMetric,
  WebVitalsData,
} from "@/features/dashboard/types/analytics.types";

const analyticsResponseSchema = z.object({
  data: z.array(z.record(z.string(), z.unknown())),
});
const PROJECT_ID = z.uuid();
const DATASET = "multivrs_requests";

const EMPTY: PlatformAnalytics = {
  averageLatency: 0,
  bandwidthBytes: 0,
  countries: [],
  errorRate: 0,
  paths: [],
  requests: 0,
  series: [],
  state: "unconfigured",
};

async function queryAnalytics(sql: string): Promise<Record<string, unknown>[]> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_ANALYTICS_API_TOKEN;
  if (!accountId || !token)
    throw new Error("Cloudflare Analytics is not configured");
  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/analytics_engine/sql`;
  const response = await fetch(endpoint, {
    body: sql,
    headers: { authorization: `Bearer ${token}` },
    method: "POST",
    next: { revalidate: 60 },
  });
  if (!response.ok)
    throw new Error(`Cloudflare Analytics returned ${response.status}`);
  return analyticsResponseSchema.parse(await response.json()).data;
}

function number(row: Record<string, unknown> | undefined, key: string): number {
  const value = row?.[key];
  return typeof value === "number" ? value : Number(value ?? 0);
}

function breakdown(
  rows: Record<string, unknown>[],
  key: string,
): AnalyticsBreakdownItem[] {
  return rows.map((row) => ({
    label: typeof row[key] === "string" && row[key] ? row[key] : "Unknown",
    requests: number(row, "requests"),
  }));
}

export async function getProjectAnalytics(
  projectId: string,
): Promise<PlatformAnalytics> {
  const id = PROJECT_ID.parse(projectId).replaceAll("'", "''");
  if (
    !process.env.CLOUDFLARE_ACCOUNT_ID ||
    !process.env.CLOUDFLARE_ANALYTICS_API_TOKEN
  ) {
    return EMPTY;
  }
  const filter = `index1 = '${id}' AND blob4 != 'web-vital' AND timestamp >= NOW() - INTERVAL '1' DAY`;
  try {
    const [summaryRows, seriesRows, pathRows, countryRows] = await Promise.all([
      queryAnalytics(
        `SELECT SUM(_sample_interval) requests, AVG(double2) latency, SUM(if(double1 >= 500, _sample_interval, 0)) errors, SUM(double3 * _sample_interval) bytes FROM ${DATASET} WHERE ${filter}`,
      ),
      queryAnalytics(
        `SELECT toStartOfHour(timestamp) bucket, SUM(_sample_interval) requests, AVG(double2) latency FROM ${DATASET} WHERE ${filter} GROUP BY bucket ORDER BY bucket`,
      ),
      queryAnalytics(
        `SELECT blob3 path, SUM(_sample_interval) requests FROM ${DATASET} WHERE ${filter} GROUP BY path ORDER BY requests DESC LIMIT 8`,
      ),
      queryAnalytics(
        `SELECT blob5 country, SUM(_sample_interval) requests FROM ${DATASET} WHERE ${filter} GROUP BY country ORDER BY requests DESC LIMIT 8`,
      ),
    ]);
    const summary = summaryRows[0];
    const requests = number(summary, "requests");
    const series: AnalyticsPoint[] = seriesRows.map((row) => ({
      label: String(row.bucket ?? "").slice(11, 16),
      latency: Math.round(number(row, "latency")),
      requests: number(row, "requests"),
    }));
    return {
      averageLatency: Math.round(number(summary, "latency")),
      bandwidthBytes: number(summary, "bytes"),
      countries: breakdown(countryRows, "country"),
      errorRate: requests ? (number(summary, "errors") / requests) * 100 : 0,
      paths: breakdown(pathRows, "path"),
      requests,
      series,
      state: "ready",
    };
  } catch {
    return { ...EMPTY, state: "error" };
  }
}

export async function getProjectWebVitals(
  projectId: string,
): Promise<WebVitalsData> {
  const id = PROJECT_ID.parse(projectId).replaceAll("'", "''");
  if (
    !process.env.CLOUDFLARE_ACCOUNT_ID ||
    !process.env.CLOUDFLARE_ANALYTICS_API_TOKEN
  ) {
    return { metrics: [], state: "unconfigured" };
  }
  try {
    const rows = await queryAnalytics(
      `SELECT blob5 name, AVG(double1) value, COUNT() samples, 100 * SUM(if(blob6 = 'good', 1, 0)) / COUNT() goodRate FROM ${DATASET} WHERE index1 = '${id}' AND blob4 = 'web-vital' AND timestamp >= NOW() - INTERVAL '1' DAY GROUP BY name`,
    );
    const names = ["CLS", "INP", "LCP", "TTFB"] as const;
    const metrics = rows.flatMap((row): WebVitalMetric[] => {
      const name = names.find((candidate) => candidate === row.name);
      return name
        ? [
            {
              goodRate: number(row, "goodRate"),
              name,
              samples: number(row, "samples"),
              value: number(row, "value"),
            },
          ]
        : [];
    });
    return { metrics, state: "ready" };
  } catch {
    return { metrics: [], state: "error" };
  }
}
