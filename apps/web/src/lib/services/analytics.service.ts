import "server-only";
import { cacheLife } from "next/cache";
import { z } from "zod";
import type {
  AnalyticsBreakdownItem,
  AnalyticsPoint,
  AnalyticsRange,
  PlatformAnalytics,
  WebVitalMetric,
  WebVitalRoute,
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
  bounceRate: 0,
  countries: [],
  devices: [],
  errorRate: 0,
  paths: [],
  pageviews: 0,
  range: "24h",
  referrers: [],
  requests: 0,
  sessions: 0,
  series: [],
  sources: [],
  state: "unconfigured",
  visitors: 0,
};

const RANGE_SQL: Record<AnalyticsRange, { bucket: string; interval: string }> =
  {
    "24h": { bucket: "toStartOfHour(timestamp)", interval: "1 DAY" },
    "7d": { bucket: "toStartOfDay(timestamp)", interval: "7 DAY" },
    "30d": { bucket: "toStartOfDay(timestamp)", interval: "30 DAY" },
  };

async function queryAnalytics(sql: string): Promise<Record<string, unknown>[]> {
  "use cache";
  cacheLife({ stale: 30, revalidate: 60, expire: 300 });

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_ANALYTICS_API_TOKEN;
  if (!accountId || !token)
    throw new Error("Cloudflare Analytics is not configured");
  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/analytics_engine/sql`;
  const response = await fetch(endpoint, {
    body: sql,
    headers: { authorization: `Bearer ${token}` },
    method: "POST",
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
  range: AnalyticsRange = "24h",
): Promise<PlatformAnalytics> {
  const id = PROJECT_ID.parse(projectId).replaceAll("'", "''");
  if (
    !process.env.CLOUDFLARE_ACCOUNT_ID ||
    !process.env.CLOUDFLARE_ANALYTICS_API_TOKEN
  ) {
    return EMPTY;
  }
  const selected = RANGE_SQL[range];
  const period = `timestamp >= NOW() - INTERVAL '${selected.interval}'`;
  const requestFilter = `index1 = '${id}' AND (blob4 = 'request' OR blob4 IN ('GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS')) AND ${period}`;
  const pageFilter = `index1 = '${id}' AND blob4 = 'pageview' AND ${period}`;
  try {
    const [
      summaryRows,
      seriesRows,
      pathRows,
      countryRows,
      audienceRows,
      pageSeriesRows,
      referrerRows,
      sourceRows,
      deviceRows,
      bounceRows,
    ] = await Promise.all([
      queryAnalytics(
        `SELECT SUM(_sample_interval) requests, AVG(double2) latency, SUM(if(double1 >= 500, _sample_interval, 0)) errors, SUM(double3 * _sample_interval) bytes FROM ${DATASET} WHERE ${requestFilter}`,
      ),
      queryAnalytics(
        `SELECT ${selected.bucket} bucket, SUM(_sample_interval) requests, AVG(double2) latency, SUM(if(double1 >= 500, _sample_interval, 0)) errors, SUM(double3 * _sample_interval) bytes FROM ${DATASET} WHERE ${requestFilter} GROUP BY bucket ORDER BY bucket`,
      ),
      queryAnalytics(
        `SELECT blob3 path, SUM(_sample_interval) requests FROM ${DATASET} WHERE ${requestFilter} GROUP BY path ORDER BY requests DESC LIMIT 8`,
      ),
      queryAnalytics(
        `SELECT blob5 country, SUM(_sample_interval) requests FROM ${DATASET} WHERE ${requestFilter} GROUP BY country ORDER BY requests DESC LIMIT 8`,
      ),
      queryAnalytics(
        `SELECT SUM(_sample_interval) pageviews, uniq(blob6) visitors, uniq(blob7) sessions FROM ${DATASET} WHERE ${pageFilter}`,
      ),
      queryAnalytics(
        `SELECT ${selected.bucket} bucket, SUM(_sample_interval) pageviews FROM ${DATASET} WHERE ${pageFilter} GROUP BY bucket ORDER BY bucket`,
      ),
      queryAnalytics(
        `SELECT blob5 label, SUM(_sample_interval) requests FROM ${DATASET} WHERE ${pageFilter} AND blob5 != '' GROUP BY label ORDER BY requests DESC LIMIT 8`,
      ),
      queryAnalytics(
        `SELECT blob10 label, SUM(_sample_interval) requests FROM ${DATASET} WHERE ${pageFilter} AND blob10 != '' GROUP BY label ORDER BY requests DESC LIMIT 8`,
      ),
      queryAnalytics(
        `SELECT blob8 label, SUM(_sample_interval) requests FROM ${DATASET} WHERE ${pageFilter} GROUP BY label ORDER BY requests DESC LIMIT 8`,
      ),
      queryAnalytics(
        `SELECT 100 * countIf(pageviews = 1) / greatest(count(), 1) bounceRate FROM (SELECT blob7, SUM(_sample_interval) pageviews FROM ${DATASET} WHERE ${pageFilter} GROUP BY blob7)`,
      ).catch(() => []),
    ]);
    const summary = summaryRows[0];
    const audience = audienceRows[0];
    const pageviewsByBucket = new Map(
      pageSeriesRows.map((row) => [
        String(row.bucket ?? ""),
        number(row, "pageviews"),
      ]),
    );
    const requests = number(summary, "requests");
    const series: AnalyticsPoint[] = seriesRows.map((row) => ({
      bandwidthBytes: number(row, "bytes"),
      errors: number(row, "errors"),
      label: formatBucket(row.bucket, range),
      latency: Math.round(number(row, "latency")),
      pageviews: pageviewsByBucket.get(String(row.bucket ?? "")) ?? 0,
      requests: number(row, "requests"),
    }));
    for (const row of pageSeriesRows) {
      const key = String(row.bucket ?? "");
      if (
        seriesRows.some((candidate) => String(candidate.bucket ?? "") === key)
      )
        continue;
      series.push({
        bandwidthBytes: 0,
        errors: 0,
        label: formatBucket(row.bucket, range),
        latency: 0,
        pageviews: number(row, "pageviews"),
        requests: 0,
      });
    }
    return {
      averageLatency: Math.round(number(summary, "latency")),
      bandwidthBytes: number(summary, "bytes"),
      bounceRate: number(bounceRows[0], "bounceRate"),
      countries: breakdown(countryRows, "country"),
      devices: breakdown(deviceRows, "label"),
      errorRate: requests ? (number(summary, "errors") / requests) * 100 : 0,
      pageviews: number(audience, "pageviews"),
      paths: breakdown(pathRows, "path"),
      range,
      referrers: breakdown(referrerRows, "label"),
      requests,
      sessions: number(audience, "sessions"),
      series,
      sources: breakdown(sourceRows, "label"),
      state: "ready",
      visitors: number(audience, "visitors"),
    };
  } catch {
    return { ...EMPTY, range, state: "error" };
  }
}

function formatBucket(value: unknown, range: AnalyticsRange): string {
  const text = String(value ?? "");
  return range === "24h" ? text.slice(11, 16) : text.slice(5, 10);
}

export async function getProjectWebVitals(
  projectId: string,
  range: AnalyticsRange = "24h",
): Promise<WebVitalsData> {
  const id = PROJECT_ID.parse(projectId).replaceAll("'", "''");
  if (
    !process.env.CLOUDFLARE_ACCOUNT_ID ||
    !process.env.CLOUDFLARE_ANALYTICS_API_TOKEN
  ) {
    return {
      devices: [],
      metrics: [],
      range,
      routes: [],
      state: "unconfigured",
    };
  }
  try {
    const period = RANGE_SQL[range].interval;
    const filter = `index1 = '${id}' AND blob4 = 'web-vital' AND timestamp >= NOW() - INTERVAL '${period}'`;
    const [rows, routeRows, deviceRows] = await Promise.all([
      queryAnalytics(
        `SELECT blob5 name, quantile(0.75)(double1) value, SUM(_sample_interval) samples, 100 * SUM(if(blob6 = 'good', _sample_interval, 0)) / SUM(_sample_interval) goodRate FROM ${DATASET} WHERE ${filter} GROUP BY name`,
      ),
      queryAnalytics(
        `SELECT blob3 path, blob5 name, quantile(0.75)(double1) value, SUM(_sample_interval) samples FROM ${DATASET} WHERE ${filter} GROUP BY path, name ORDER BY samples DESC LIMIT 80`,
      ),
      queryAnalytics(
        `SELECT blob9 label, SUM(_sample_interval) requests FROM ${DATASET} WHERE ${filter} GROUP BY label ORDER BY requests DESC`,
      ),
    ]);
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
    return {
      devices: breakdown(deviceRows, "label"),
      metrics,
      range,
      routes: vitalRoutes(routeRows, names),
      state: "ready",
    };
  } catch {
    return { devices: [], metrics: [], range, routes: [], state: "error" };
  }
}

function vitalRoutes(
  rows: Record<string, unknown>[],
  names: readonly WebVitalMetric["name"][],
): WebVitalRoute[] {
  const routes = new Map<string, WebVitalRoute>();
  const validNames = new Set<string>(names);
  for (const row of rows) {
    const path = typeof row.path === "string" ? row.path : "/";
    if (typeof row.name !== "string" || !validNames.has(row.name)) continue;
    const name = row.name as WebVitalMetric["name"];
    const route = routes.get(path) ?? { metrics: {}, path, samples: 0 };
    route.metrics[name] = number(row, "value");
    route.samples += number(row, "samples");
    routes.set(path, route);
  }
  return [...routes.values()]
    .sort((left, right) => right.samples - left.samples)
    .slice(0, 10);
}
